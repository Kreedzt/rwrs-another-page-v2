<script lang="ts">
	import TranslatedText from '$lib/components/TranslatedText.svelte';
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
	<!-- Desktop table view (hidden on mobile) -->
	<div class="w-full">
		<table class="table-pin-rows mb-0 table border-0">
			<thead>
				<tr>
					{#each columns as column (column.key)}
						{#if visibleColumns[column.key]}
							<th
								class="bg-base-200 sticky top-0 z-10 h-12 px-4 py-2 align-middle {column.headerClass ||
									''}"
								class:action-header={column.key === 'action'}
								class:bg-base-100={column.key === 'action'}
							>
								{#if column.key === 'action'}
									<div class="text-center">
										{#if column.i18n}<TranslatedText key={column.i18n} />{:else}{column.label}{/if}
									</div>
								{:else}
									<button
										class="hover:bg-base-300 flex w-full items-center gap-2 rounded px-2 py-1 text-left transition-colors duration-200"
										onclick={() => handleColumnSort(column.key)}
										type="button"
										title="Click to sort"
									>
										<span class="flex-1">
											{#if column.i18n}<TranslatedText
													key={column.i18n}
												/>{:else}{column.label}{/if}
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
								<td
									class="px-4 py-2 {getAlignmentClass(column)} {column.cellClass ||
										''} {column.key === 'playerList' ? 'align-top' : ''}"
									class:action-cell={column.key === 'action'}
									class:bg-base-100={column.key === 'action'}
								>
									{#if column.key === 'action'}
										<div class="flex min-h-[3rem] items-center justify-center text-center">
											<button
												type="button"
												class="btn btn-sm btn-primary mobile-btn"
												onclick={() => handleAction(item, 'join')}
											>
												Join
											</button>
										</div>
									{:else if column.key === 'url' && item.url}
										<a
											href={item.url}
											target="_blank"
											class="link link-primary inline-flex min-h-6 items-center"
											title={item.url}
										>
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
{/if}

<style>
	/* Action column styling */
	:global(.action-cell) {
		position: sticky;
		right: 0;
		z-index: 999;
		min-width: 8rem;
		width: 8rem;
		border-left: 2px solid hsl(var(--bc) / 0.15);
		box-shadow: -6px 0 16px rgba(0, 0, 0, 0.25);
	}

	:global(.action-header) {
		position: sticky;
		right: 0;
		z-index: 1000;
		min-width: 8rem;
		width: 8rem;
		border-left: 2px solid hsl(var(--bc) / 0.25);
		box-shadow: -6px 0 16px rgba(0, 0, 0, 0.3);
	}

	/* Mobile responsive styles */
	@media (max-width: 768px) {
		:global(.action-cell),
		:global(.action-header) {
			display: none;
		}

		:global(.min-w-96) {
			min-width: 20rem;
		}

		:global(.mobile-btn) {
			font-size: 0.75rem;
			padding: 0.25rem 0.5rem;
		}
	}
</style>
