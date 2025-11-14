<script lang="ts">
	import TranslatedText from '$lib/components/TranslatedText.svelte';
	import { highlightMatch } from '@/lib/utils/highlight';
	import type { IDisplayServerItem } from '$lib/models/data-table.model';
	import type { IColumn } from '$lib/models/data-table.model';

	interface Props {
		data: IDisplayServerItem[];
		columns: IColumn[];
		visibleColumns: Record<string, boolean>;
		searchQuery: string;
		onRowAction: (event: { item: IDisplayServerItem; action: string }) => void;
		onSort?: (column: string) => void;
		sortColumn?: string | null;
		sortDirection?: 'asc' | 'desc' | null;
	}

	let {
		data = [],
		columns = [],
		searchQuery = '',
		onRowAction = () => {},
		visibleColumns = {},
		onSort = () => {},
		sortColumn = null,
		sortDirection = null
	}: Props = $props();

	// Track expanded cards for collapsible details
	let expandedCards = $state<Record<string, boolean>>({});

	// Helper function to get the display value for a column
	function getDisplayValue(item: IDisplayServerItem, column: IColumn): string {
		// If there's a search query and the column supports highlighting, use that
		if (searchQuery && column.getValueWithHighlight) {
			return column.getValueWithHighlight(item, searchQuery);
		}

		// Otherwise use the regular getValue or fallback to the raw value
		if (column.getValue) {
			return column.getValue(item);
		}

		return (item as any)[column.key] ?? '-';
	}

	// Handle card expansion
	function toggleCard(serverId: string) {
		expandedCards[serverId] = !expandedCards[serverId];
	}

	// Handle row action
	function handleAction(item: IDisplayServerItem, action: string) {
		onRowAction({ item, action });
	}

	// Helper function to get alignment class based on column configuration
	function getAlignmentClass(column: IColumn): string {
		switch (column.alignment) {
			case 'top':
				return 'align-top';
			case 'center':
				return 'align-middle text-center';
			case 'right':
				return 'align-middle text-right';
			case 'left':
			default:
				return 'align-middle';
		}
	}

	// Get primary info columns for mobile view
	// On mobile, show ALL primary columns regardless of user settings
	function getPrimaryColumns() {
		return columns.filter((col) => ['name', 'playerCount', 'mapId'].includes(col.key));
	}

	// Get secondary info columns for collapsible section
	// On mobile, show ALL secondary columns regardless of user settings
	function getSecondaryColumns() {
		return columns.filter((col) => !['name', 'playerCount', 'mapId', 'action'].includes(col.key));
	}

	// Get sort icon for column
	function getSortIcon(column: string) {
		if (sortColumn !== column) {
			return `<svg class="w-4 h-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path></svg>`;
		}

		if (sortDirection === 'desc') {
			return `<svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>`;
		} else if (sortDirection === 'asc') {
			return `<svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>`;
		}

		return '';
	}

	// Handle column sort
	function handleColumnSort(column: string) {
		onSort(column);
	}
</script>

{#if data.length === 0}
	<div class="alert alert-info">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			class="h-6 w-6 shrink-0 stroke-current"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
			></path>
		</svg>
		<span>No data found{searchQuery ? ' matching your search' : ''}.</span>
	</div>
{:else}
	<!-- Mobile-only sort controls -->
	<div class="mb-4 flex flex-wrap gap-2 md:hidden">
		{#each getPrimaryColumns() as column (column.key)}
			<button
				class="btn btn-sm btn-outline flex items-center gap-2"
				onclick={() => handleColumnSort(column.key)}
				type="button"
			>
				{#if column.i18n}<TranslatedText key={column.i18n} />{:else}{column.label}{/if}
				{@html getSortIcon(column.key)}
			</button>
		{/each}
	</div>

	<!-- Mobile server cards -->
	<div class="space-y-3 md:hidden">
		{#each data as item (item.id)}
			<div class="card bg-base-100 border-base-300 overflow-hidden border shadow-lg">
				<!-- Primary info section - clickable for expand/collapse -->
				{#if getSecondaryColumns().length > 0}
					<button
						class="card-body hover:bg-base-200 w-full p-4 text-left transition-colors duration-200"
						onclick={() => toggleCard(item.id)}
						aria-expanded={expandedCards[item.id]}
						aria-label="Toggle server details"
					>
						<!-- Server name, players, and map on same line -->
						<div class="flex items-center justify-between gap-2">
							<!-- Server name -->
							<h3 class="text-base-content flex-1 truncate text-base font-semibold">
								{@html getDisplayValue(item, columns.find((col) => col.key === 'name')!)}
							</h3>

							<!-- Player count with forced wrapping -->
							<div class="flex-shrink-0 min-w-0">
								<div class="flex flex-wrap gap-1 justify-end max-w-24 sm:max-w-32">
									{@html getDisplayValue(item, columns.find(col => col.key === 'playerCount')!)}
								</div>
							</div>

							<!-- Map -->
							<div class="flex-shrink-0">
								{@html getDisplayValue(item, columns.find((col) => col.key === 'mapId')!)}
							</div>

							<!-- Expand indicator -->
							<div class="flex-shrink-0">
								<svg
									class="text-base-content/60 h-4 w-4 transition-transform duration-200"
									class:rotate-180={expandedCards[item.id]}
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M19 9l-7 7-7-7"
									></path>
								</svg>
							</div>
						</div>
					</button>
				{:else}
					<!-- No secondary columns, just display without button -->
					<div class="card-body p-4">
						<!-- Server name, players, and map on same line -->
						<div class="flex items-center justify-between gap-2">
							<!-- Server name -->
							<h3 class="text-base-content flex-1 truncate text-base font-semibold">
								{@html getDisplayValue(item, columns.find((col) => col.key === 'name')!)}
							</h3>


							<!-- Player count with forced wrapping -->
							<div class="flex-shrink-0 min-w-0">
								<div class="flex flex-wrap gap-1 justify-end max-w-24 sm:max-w-32">
									{@html getDisplayValue(item, columns.find(col => col.key === 'playerCount')!)}
								</div>
							</div>

							<!-- Map -->
							<div class="flex-shrink-0">
								{@html getDisplayValue(item, columns.find((col) => col.key === 'mapId')!)}
							</div>
						</div>
					</div>
				{/if}

				<!-- Collapsible details -->
				{#if getSecondaryColumns().length > 0 && expandedCards[item.id]}
					<div class="border-base-200 border-t px-4 pb-4">
						<div class="space-y-2 pt-3">
							{#each getSecondaryColumns() as column (column.key)}
								<div class="flex items-center justify-between py-1">
									<span class="text-base-content/60 min-w-20 flex-shrink-0 text-sm">
										{#if column.i18n}<TranslatedText key={column.i18n} />{:else}{column.label}{/if}:
									</span>
									<div class="text-base-content ml-3 flex-1 text-right text-sm">
										{#if column.key === 'url' && item.url}
											<a
												href={item.url}
												target="_blank"
												class="link link-primary"
												onclick={(e) => e.stopPropagation()}
												title={item.url}
											>
												{item.url.length > 30 ? item.url.substring(0, 27) + '...' : item.url}
											</a>
										{:else if column.key === 'comment' || column.key === 'playerList'}
											<!-- For potentially long text like comments and player lists -->
											<div class="text-left break-words whitespace-pre-wrap">
												{@html getDisplayValue(item, column)}
											</div>
										{:else}
											<!-- For other fields like mode, dedicated, mod, version, etc. -->
											<div class="flex items-center justify-end">
												{@html getDisplayValue(item, column)}
											</div>
										{/if}
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		{/each}
	</div>

	<!-- Desktop table view (hidden on mobile) -->
	<div class="hidden md:block">
		<div class="w-full">
			<table class="table table-pin-rows mb-0 border-0">
				<thead>
					<tr>
						{#each columns as column (column.key)}
							{#if visibleColumns[column.key]}
								<th
									class="bg-base-200 h-12 px-4 py-2 align-middle sticky top-0 z-10 {column.headerClass || ''}"
									class:action-header={column.key === 'action'}
								>
									{#if column.key === 'action'}
										<div class="text-center">
											{#if column.i18n}<TranslatedText key={column.i18n} />{:else}{column.label}{/if}
										</div>
									{:else}
										<button
											class="flex items-center gap-2 w-full text-left hover:bg-base-300 px-2 py-1 rounded transition-colors duration-200"
											onclick={() => handleColumnSort(column.key)}
											type="button"
											title="Click to sort"
										>
											<span class="flex-1">
												{#if column.i18n}<TranslatedText key={column.i18n} />{:else}{column.label}{/if}
											</span>
											{@html getSortIcon(column.key)}
										</button>
									{/if}
								</th>
							{/if}
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each data as item (item.id)}
						<tr class="hover hover:bg-base-300 min-h-12">
							{#each columns as column (column.key)}
								{#if visibleColumns[column.key]}
									<td class="px-4 py-2 {getAlignmentClass(column)} {column.cellClass || ''} {column.key === 'playerList' ? 'align-top' : ''}"
									class:action-cell={column.key === 'action'}>
										{#if column.key === 'action'}
											<div class="text-center min-h-[3rem] flex items-center justify-center">
												<button
													class="btn btn-sm btn-primary mobile-btn"
													onclick={() => handleAction(item, 'join')}
												>
													Join
												</button>
											</div>
										{:else if column.key === 'url' && item.url}
											<a href={item.url} target="_blank" class="link link-primary inline-flex items-center min-h-6" title={item.url}>
												{item.url.length > 50 ? item.url.substring(0, 47) + '...' : item.url}
											</a>
										{:else}
											{@html getDisplayValue(item, column)}
										{/if}
									</td>
								{/if}
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
{/if}

<style>
	/* Card transition animations */
	.card {
		transition: all 0.2s ease-in-out;
	}

	.card:hover {
		transform: translateY(-1px);
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
	}

	/* Clickable area for expand/collapse */
	button.card-body {
		transition: all 0.2s ease-in-out;
	}

	button.card-body:hover {
		background-color: hsl(var(--b2));
	}

	button.card-body:active {
		background-color: hsl(var(--b3));
		transform: scale(0.995);
	}

	/* Smooth expand/collapse animation */
	.rotate-180 {
		transform: rotate(180deg);
	}

	/* Remove button default styling */
	button.card-body {
		border: none;
		background: none;
		cursor: pointer;
		outline: none;
	}

	button.card-body:focus-visible {
		background-color: hsl(var(--b2));
		box-shadow: inset 0 0 0 2px hsl(var(--p));
	}

	/* Ensure proper spacing in grid */
	.grid-cols-2 {
		gap: 0.75rem;
	}

	/* Badge styling consistency */
	:global(.badge) {
		white-space: nowrap;
		line-height: 1.2;
		min-height: 1.5rem;
		display: inline-flex;
		align-items: center;
		max-width: none;
	}

	/* Enhanced badge styles for mode and map columns */
	:global(.badge.text-blue-600) {
		background-color: white !important;
		border: 1px solid rgb(147 197 253) !important;
		color: rgb(37 99 235) !important;
	}

	:global(.badge.text-green-600) {
		background-color: white !important;
		border: 1px solid rgb(134 239 172) !important;
		color: rgb(22 163 74) !important;
	}

	/* Highlight text within badges */
	:global(.badge mark) {
		background-color: hsl(var(--wa) / 0.3) !important;
		color: inherit !important;
		padding: 0 2px !important;
		border-radius: 2px !important;
	}

	/* Action column specific styling for single table - use highest specificity */
	:global(div table tbody tr td.action-cell) {
		position: sticky !important;
		right: 0 !important;
		background: hsl(var(--b1)) !important;
		background-color: hsl(var(--b1)) !important;
		z-index: 999 !important;
		min-width: 8rem !important;
		width: 8rem !important;
		border-left: 2px solid hsl(var(--bc) / 0.3) !important;
		/* Add stronger shadow for better separation */
		box-shadow: -6px 0 16px rgba(0, 0, 0, 0.25) !important;
		/* Add gradient overlay for better text visibility */
		background-image: linear-gradient(
			to right,
			hsla(var(--b1), 0.7) 0%,
			hsla(var(--b1), 0.85) 20%,
			hsla(var(--b1), 0.95) 50%,
			hsl(var(--b1)) 100%
		) !important;
		/* Ensure proper stacking context */
		transform: translateZ(0) !important;
		/* Double background ensure coverage */
		background-blend-mode: normal !important;
		mix-blend-mode: normal !important;
	}

	:global(div table thead tr th.action-header) {
		position: sticky !important;
		right: 0 !important;
		background: hsl(var(--b2)) !important;
		background-color: hsl(var(--b2)) !important;
		z-index: 1000 !important;
		min-width: 8rem !important;
		width: 8rem !important;
		border-left: 2px solid hsl(var(--bc) / 0.4) !important;
		/* Add stronger shadow for better separation */
		box-shadow: -6px 0 16px rgba(0, 0, 0, 0.3) !important;
		/* Add gradient overlay for better text visibility */
		background-image: linear-gradient(
			to right,
			hsla(var(--b2), 0.8) 0%,
			hsla(var(--b2), 0.9) 20%,
			hsla(var(--b2), 0.98) 50%,
			hsl(var(--b2)) 100%
		) !important;
		/* Ensure proper stacking context */
		transform: translateZ(0) !important;
		/* Double background ensure coverage */
		background-blend-mode: normal !important;
		mix-blend-mode: normal !important;
	}

	/* Fallback with maximum specificity */
	:global(body > div > table tbody tr td.action-cell),
	:global(body table tbody tr td.action-cell) {
		position: sticky !important;
		right: 0 !important;
		background: hsl(var(--b1)) !important;
		background-color: hsl(var(--b1)) !important;
		z-index: 999 !important;
		min-width: 8rem !important;
		width: 8rem !important;
		border-left: 2px solid hsl(var(--bc) / 0.3) !important;
		box-shadow: -6px 0 16px rgba(0, 0, 0, 0.25) !important;
		background-image: linear-gradient(
			to right,
			hsla(var(--b1), 0.7) 0%,
			hsla(var(--b1), 0.85) 20%,
			hsla(var(--b1), 0.95) 50%,
			hsl(var(--b1)) 100%
		) !important;
	}

	:global(body > div > table thead tr th.action-header),
	:global(body table thead tr th.action-header) {
		position: sticky !important;
		right: 0 !important;
		background: hsl(var(--b2)) !important;
		background-color: hsl(var(--b2)) !important;
		z-index: 1000 !important;
		min-width: 8rem !important;
		width: 8rem !important;
		border-left: 2px solid hsl(var(--bc) / 0.4) !important;
		box-shadow: -6px 0 16px rgba(0, 0, 0, 0.3) !important;
		background-image: linear-gradient(
			to right,
			hsla(var(--b2), 0.8) 0%,
			hsla(var(--b2), 0.9) 20%,
			hsla(var(--b2), 0.98) 50%,
			hsl(var(--b2)) 100%
		) !important;
	}

	/* Hide action column on mobile */
	@media (max-width: 768px) {
		:global(.action-cell),
		:global(.action-header) {
			display: none;
		}
	}

	/* Player list column responsive width */
	@media (max-width: 768px) {
		:global(.min-w-96) {
			min-width: 20rem;
		}

		/* Mobile button styling */
		:global(.mobile-btn) {
			font-size: 0.75rem;
			padding: 0.25rem 0.5rem;
		}
	}
</style>
