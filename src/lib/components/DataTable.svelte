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
	}

	let {
		data = [],
		columns = [],
		searchQuery = '',
		onRowAction = () => {},
		visibleColumns = {}
	}: Props = $props();

	// Handle row action (like connect button click)
	function handleAction(item: IDisplayServerItem, action: string) {
		onRowAction({ item, action });
	}

	// Helper function to safely get a value from an object
	function getValue(item: IDisplayServerItem, column: any): string {
		if (column.key === 'action') {
			return '';
		}

		if (column.getValue) {
			return column.getValue(item);
		}

		return item[column.key] ?? '-';
	}

	// Helper function to check if a field should be highlighted
	function shouldHighlight(item: IDisplayServerItem, column: any): boolean {
		if (!searchQuery) return false;

		const query = searchQuery.toLowerCase();

		if (column.key === 'playerList') {
			return item.playerList.some((player: string) => player.toLowerCase().includes(query));
		}

		const value = item[column.key];
		if (!value) return false;

		if (typeof value === 'string') {
			return value.toLowerCase().includes(query);
		}

		return false;
	}

	// Helper function to render player list with badges
	function renderPlayerList(players: string[], query: string = ''): string {
		if (players.length === 0) return '-';

		if (query) {
			return `<div class="flex flex-wrap gap-1 items-center">${players
				.map((player) => {
					const highlighted = highlightMatch(player, query);
					return `<span class="badge badge-neutral gap-0">${highlighted}</span>`;
				})
				.join(' ')}</div>`;
		}

		return `<div class="flex flex-wrap gap-1 items-center text-xs">${players.map((player) => `<span class="badge badge-neutral gap-0">${player}</span>`).join(' ')}</div>`;
	}

	// Sync row heights between scrollable and fixed tables
	function syncRowHeights() {
		if (typeof window === 'undefined') return;

		const scrollableRows = document.querySelectorAll('.table-scrollable tbody tr');
		const fixedRows = document.querySelectorAll('.table-fixed-action tbody tr');

		if (scrollableRows.length !== fixedRows.length) return;

		// Reset heights first
		scrollableRows.forEach(row => (row as HTMLElement).style.height = 'auto');
		fixedRows.forEach(row => (row as HTMLElement).style.height = 'auto');

		// Get natural heights and apply the maximum to both
		for (let i = 0; i < scrollableRows.length; i++) {
			const scrollableRow = scrollableRows[i] as HTMLElement;
			const fixedRow = fixedRows[i] as HTMLElement;

			const scrollableHeight = scrollableRow.offsetHeight;
			const fixedHeight = fixedRow.offsetHeight;
			const maxHeight = Math.max(scrollableHeight, fixedHeight);

			scrollableRow.style.height = `${maxHeight}px`;
			fixedRow.style.height = `${maxHeight}px`;
		}
	}

	// Sync heights after data changes
	$effect(() => {
		if (data.length > 0) {
			// Use setTimeout to ensure DOM is updated
			setTimeout(syncRowHeights, 0);
		}
	});

	// Also sync on window resize
	$effect(() => {
		if (typeof window === 'undefined') return;

		const handleResize = () => {
			setTimeout(syncRowHeights, 100);
		};

		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
		};
	});
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
	<!-- Fixed table layout with scrollable content and fixed action column -->
	<div class="table-container">
		<div class="table-wrapper rounded-lg">
			<!-- Scrollable table for all columns except action -->
			<div class="table-scrollable">
				<table class="table table-pin-rows">
					<thead>
						<tr>
							{#each columns as column (column.key)}
								{#if visibleColumns[column.key] && column.key !== 'action'}
									<th class="bg-base-200">
										{#if column.i18n}<TranslatedText key={column.i18n} />{:else}{column.label}{/if}
									</th>
								{/if}
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each data as item (item.id)}
							<tr class="hover hover:bg-base-300">
								{#each columns as column (column.key)}
									{#if visibleColumns[column.key] && column.key !== 'action'}
										<td>
											{#if column.key === 'url' && item.url}
												<a href={item.url} target="_blank" class="link link-primary">
													{#if searchQuery && item.url
															.toLowerCase()
															.includes(searchQuery.toLowerCase())}
														{@html highlightMatch(item.url, searchQuery)}
													{:else}
														{item.url}
													{/if}
												</a>
											{:else if column.key === 'playerList'}
												{@html renderPlayerList(
													item.playerList,
													shouldHighlight(item, column) ? searchQuery : ''
												)}
											{:else if shouldHighlight(item, column)}
												{@html highlightMatch(getValue(item, column), searchQuery)}
											{:else}
												{getValue(item, column)}
											{/if}
										</td>
									{/if}
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<!-- Fixed action column -->
			{#if visibleColumns['action']}
				<div class="table-fixed-action">
					<table class="table table-pin-rows">
						<thead>
							<tr>
								<th class="bg-base-200">
									{#each columns as column (column.key)}
										{#if column.key === 'action'}
											{#if column.i18n}<TranslatedText key={column.i18n} />{:else}{column.label}{/if}
										{/if}
									{/each}
								</th>
							</tr>
						</thead>
						<tbody>
							{#each data as item (item.id)}
								<tr class="hover hover:bg-base-100">
									<td>
										<button
											class="btn btn-sm btn-primary"
											onclick={() => handleAction(item, 'join')}
										>
											Join
										</button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.table-container {
		width: 100%;
	}

	.table-wrapper {
		display: flex;
		width: 100%;
		overflow: hidden;
		border: 1px solid hsl(var(--bc) / 0.2);
		border-radius: 0.5rem;
	}

	.table-scrollable {
		flex: 1;
		overflow-x: auto;
		min-width: 0; /* Allow flex item to shrink */
	}

	.table-scrollable .table {
		margin-bottom: 0;
	}

	.table-fixed-action {
		flex-shrink: 0;
		width: 120px; /* Fixed width for action column */
		border-left: 1px solid hsl(var(--bc) / 0.2);
	}

	.table-fixed-action .table {
		margin-bottom: 0;
		width: 120px;
	}

	/* Ensure consistent row heights between tables */
	.table-scrollable tbody tr,
	.table-fixed-action tbody tr {
		min-height: 3rem; /* Minimum row height */
		height: auto; /* Allow rows to expand */
	}

	.table-scrollable thead th,
	.table-fixed-action thead th {
		height: 3rem; /* Consistent header height */
		position: sticky;
		top: 0;
		z-index: 10;
	}

	/* Remove table borders to avoid double borders */
	.table-scrollable .table,
	.table-fixed-action .table {
		border: 0;
	}

	/* Ensure proper cell padding and alignment */
	.table-scrollable td,
	.table-fixed-action td,
	.table-scrollable th,
	.table-fixed-action th {
		padding: 0.5rem 1rem;
		vertical-align: middle;
	}

	/* Center align action buttons */
	.table-fixed-action td {
		text-align: center;
		vertical-align: middle;
	}

	/* Special alignment for specific content types */
	.table-scrollable td {
		vertical-align: middle;
	}

	/* For player list badges, ensure they're centered within the cell */
	.table-scrollable td .flex {
		align-items: center;
		justify-content: flex-start;
		min-height: 1.5rem; /* Ensure minimum height for flex containers */
	}

	/* Ensure links are also vertically centered */
	.table-scrollable td .link {
		display: inline-flex;
		align-items: center;
		min-height: 1.5rem;
	}

	/* Center align numeric and short text content */
	.table-scrollable td:has(> :only-child:not(.flex):not(.link)) {
		text-align: left;
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.table-fixed-action {
			width: 100px;
		}

		.table-fixed-action .table {
			width: 100px;
		}

		.table-fixed-action .btn {
			font-size: 0.75rem;
			padding: 0.25rem 0.5rem;
		}
	}
</style>
