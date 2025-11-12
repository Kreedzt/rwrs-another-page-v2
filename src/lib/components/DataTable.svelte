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

	// Variables to bind row elements for height synchronization
	let scrollableRows: Record<string, HTMLElement> = {};
	let fixedRows: Record<string, HTMLElement> = {};

	// Handle row action (like connect button click)
	function handleAction(item: IDisplayServerItem, action: string) {
		onRowAction({ item, action });
	}

	// Handle column sort
	function handleColumnSort(column: string) {
		onSort(column);
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

	// Sync row heights between scrollable and fixed tables
	function syncRowHeights() {
		if (typeof window === 'undefined') return;

		// Reset heights first
		Object.values(scrollableRows).forEach(row => {
			if (row) row.style.height = 'auto';
		});
		Object.values(fixedRows).forEach(row => {
			if (row) row.style.height = 'auto';
		});

		// Get natural heights and apply the maximum to both
		data.forEach(item => {
			const scrollableRow = scrollableRows[item.id];
			const fixedRow = fixedRows[item.id];

			if (scrollableRow && fixedRow) {
				const scrollableHeight = scrollableRow.offsetHeight;
				const fixedHeight = fixedRow.offsetHeight;
				const maxHeight = Math.max(scrollableHeight, fixedHeight);

				scrollableRow.style.height = `${maxHeight}px`;
				fixedRow.style.height = `${maxHeight}px`;
			}
		});
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
	<div class="w-full">
		<div class="flex w-full rounded-lg overflow-hidden">
			<!-- Scrollable table for all columns except action -->
			<div class="flex-1 overflow-x-auto min-w-0">
				<table class="table table-pin-rows mb-0 border-0">
					<thead>
						<tr>
							{#each columns as column (column.key)}
								{#if visibleColumns[column.key] && column.key !== 'action'}
									<th class="bg-base-200 h-12 px-4 py-2 align-middle sticky top-0 z-10 {column.headerClass || ''}">
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
									</th>
								{/if}
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each data as item (item.id)}
							<tr class="hover hover:bg-base-300 min-h-12" bind:this={scrollableRows[item.id]}>
								{#each columns as column (column.key)}
									{#if visibleColumns[column.key] && column.key !== 'action'}
										<td class="px-4 py-2 {getAlignmentClass(column)} {column.cellClass || ''}">
											{#if column.key === 'url' && item.url}
												<a href={item.url} target="_blank" class="link link-primary inline-flex items-center min-h-6">
													{@html getDisplayValue(item, column)}
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

			<!-- Fixed action column -->
			{#if visibleColumns['action']}
				<div class="flex-shrink-0 w-32 border-l border-base-300 hidden md:block">
					<table class="table table-pin-rows mb-0 border-0">
						<thead>
							<tr>
								<th class="bg-base-200 h-12 px-4 py-2 align-middle top-0 z-10 text-center">
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
								<tr class="hover hover:bg-base-300" bind:this={fixedRows[item.id]}>
									<td class="px-4 py-2 align-middle text-center">
										<button
											class="btn btn-sm btn-primary mobile-btn"
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
	/* Player badge styling for proper display */
	:global(.badge) {
		white-space: nowrap;
		line-height: 1.2;
		min-height: 1.5rem;
		display: inline-flex;
		align-items: center;
		max-width: none;
	}

	/* Responsive adjustments for mobile */
	@media (max-width: 768px) {
		/* Action column responsive width */
		.w-32 {
			width: 6rem;
		}

		/* Player list column responsive width */
		.w-96 {
			width: 20rem;
		}

		.min-w-96 {
			min-width: 20rem;
		}

		/* Mobile button styling */
		.mobile-btn {
			font-size: 0.75rem;
			padding: 0.25rem 0.5rem;
		}
	}
</style>
