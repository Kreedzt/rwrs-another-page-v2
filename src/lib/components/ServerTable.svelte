<script lang="ts">
	import TranslatedText from '$lib/components/TranslatedText.svelte';
	import type { IDisplayServerItem } from '$lib/models/server.model';
	import type { IColumn } from '$lib/models/server.model';
	import type { MapData } from '$lib/services/maps';

	interface Props {
		data: IDisplayServerItem[];
		columns: IColumn[];
		visibleColumns: Record<string, boolean>;
		searchQuery: string;
		maps?: MapData[];
		onRowAction: (event: { item: IDisplayServerItem; action: string }) => void;
		onSort?: (column: string) => void;
		sortColumn?: string | null;
		sortDirection?: 'asc' | 'desc' | null;
		onMapView?: (mapData: MapData) => void;
	}

	let {
		data = [],
		columns = [],
		searchQuery = '',
		maps = [],
		onRowAction = () => {},
		visibleColumns = {},
		onSort = () => {},
		sortColumn = null,
		sortDirection = null,
		onMapView
	}: Props = $props();

	// Helper function to get the display value for a column
	function getDisplayValue(item: IDisplayServerItem, column: IColumn): string {
		// If there's a search query and the column supports highlighting, use that
		if (searchQuery && column.getValueWithHighlight) {
			return column.getValueWithHighlight(item, searchQuery, maps);
		}

		// Otherwise use the regular getValue or fallback to the raw value
		if (column.getValue) {
			return column.getValue(item, maps);
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

	// Get sticky class for column
	function getStickyClass(key: string): string {
		if (key === 'name') return 'sticky-name';
		return '';
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
		<table class="table-pin-rows mb-0 table table-zebra border-0 bg-mil-primary">
			<thead>
				<tr class="bg-mil-secondary">
					{#each columns as column (column.key)}
						{#if visibleColumns[column.key]}
							<th
								class="sticky top-0 z-10 h-10 border-mil px-1 py-1 align-middle text-mil-primary {getStickyClass(column.key)} {column.headerClass ||
									''}"
								class:action-header={column.key === 'action'}
								class:sticky-name-header={column.key === 'name'}
							>
								{#if column.key === 'action'}
									<div class="text-center">
										{#if column.i18n}<TranslatedText key={column.i18n} />{:else}{column.label}{/if}
									</div>
								{:else}
									<button
										class="hover:bg-base-300 flex w-full items-center gap-2 rounded px-2 py-2 text-left transition-colors duration-200"
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
					<tr class="hover hover:bg-base-300 min-h-12 border-b border-mil">
						{#each columns as column (column.key)}
							{#if visibleColumns[column.key]}
								<td
									class="border-mil px-4 py-1 text-mil-primary {getStickyClass(column.key)} {getAlignmentClass(column)} {column.cellClass ||
										''} {column.key === 'playerList' ? 'align-top' : ''}"
									class:action-cell={column.key === 'action'}
								>
									{#if column.key === 'action'}
										<div class="flex items-center justify-center text-center">
											<button
												type="button"
												class="btn btn-sm btn-primary mobile-btn"
												onclick={() => handleAction(item, 'join')}
											>
												Join
											</button>
										</div>
									{:else if column.key === 'mapId'}
										<div class="flex items-center gap-2">
											<span class="truncate">{item.mapId.split('/').pop() || ''}</span>
											{#if maps && maps.find(m => m.path === item.mapId)}
												{@const mapData = maps.find(m => m.path === item.mapId)}
												<button
													type="button"
													class="btn btn-success btn-xs text-white"
													onclick={(e) => {
														e.stopPropagation();
														if (onMapView) onMapView(mapData);
													}}
													title="Preview map"
												>
													<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542 7z"></path>
													</svg>
												</button>
											{/if}
										</div>
									{:else if column.key === 'url' && item.url}
										<a
											href={item.url}
											target="_blank"
											class="link inline-flex min-h-6 items-center underline-offset-4 hover:underline"
											style="color: var(--color-accent);"
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
	/* Ensure table-pin-rows header has higher z-index than sticky column cells */
	:global(.table-pin-rows thead tr) {
		z-index: 25 !important;
	}

	/* Name column - sticky first column on left with military styling */
	:global(.sticky-name) {
		position: sticky;
		left: 0;
		z-index: 20;
		min-width: 14rem;
		background: var(--color-bg-secondary);
		border-right: 1px solid var(--color-border);
	}

	:global(.sticky-name-header) {
		position: sticky;
		left: 0;
		z-index: 30 !important;
		min-width: 14rem;
		background: var(--color-bg-secondary) !important;
		border-right: 1px solid var(--color-border);
	}

	/* Action column styling - sticky right with military theme */
	:global(.action-cell) {
		position: sticky;
		right: 0;
		z-index: 20;
		min-width: 9rem;
		width: 9rem;
		background: var(--color-bg-secondary);
		border-left: 1px solid var(--color-border);
	}

	:global(.action-header) {
		position: sticky;
		right: 0;
		z-index: 30 !important;
		min-width: 9rem;
		width: 9rem;
		background: var(--color-bg-secondary) !important;
		border-left: 1px solid var(--color-border);
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
