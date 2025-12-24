<script lang="ts">
	import TranslatedText from '$lib/components/TranslatedText.svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import ServerTable from '$lib/components/ServerTable.svelte';
	import MapPreview from '$lib/components/MapPreview.svelte';
	import MobileInfiniteScroll from '$lib/components/MobileInfiniteScroll.svelte';
	import QuickFilterButtons from '$lib/components/QuickFilterButtons.svelte';
	import type { IDisplayServerItem, IColumn } from '$lib/models/server.model';
	import type { MapData } from '$lib/services/maps';

	interface Props {
		loading: boolean;
		error: string | null;
		searchQuery: string;
		paginatedServers: IDisplayServerItem[];
		mobilePaginatedServers: IDisplayServerItem[];
		mobileHasMore: boolean;
		mobileLoadingMore: boolean;
		totalPages: number;
		filteredServersCount: number;
		columns: IColumn[];
		maps: MapData[];
		visibleColumns: Record<string, boolean>;
		activeFilters: string[];
		isMultiSelect: boolean;
		currentPage: number;
		sortColumn: string | null;
		sortDirection: 'asc' | 'desc' | null;
		mobileExpandedCards: Record<string, boolean>;
		onQuickFilter: (filterId: string) => void;
		onMultiSelectChange: (checked: boolean) => void;
		onSort: (column: string) => void;
		onPageChange: (page: number) => void;
		onLoadMore: () => void;
		onRowAction: (event: { item: IDisplayServerItem; action: string }) => void;
		onColumnToggle: (column: IColumn, visible: boolean) => void;
		onToggleMobileCard: (serverId: string) => void;
		onMapView: (mapData: MapData) => void;
		onMapPreviewClose: () => void;
	}

	let {
		loading,
		error,
		searchQuery,
		paginatedServers,
		mobilePaginatedServers,
		mobileHasMore,
		mobileLoadingMore,
		totalPages,
		filteredServersCount,
		columns,
		maps,
		visibleColumns,
		activeFilters,
		isMultiSelect,
		currentPage,
		sortColumn,
		sortDirection,
		mobileExpandedCards,
		onQuickFilter,
		onMultiSelectChange,
		onSort,
		onPageChange,
		onLoadMore,
		onRowAction,
		onColumnToggle,
		onToggleMobileCard,
		onMapView,
		onMapPreviewClose
	}: Props = $props();

	// Helper function to get the display value for a column
	function getDisplayValue(
		item: IDisplayServerItem,
		column: IColumn,
		searchQuery?: string
	): string {
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

	// Get sort icon for column
	function getSortIcon(column: string): string {
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
</script>

{#if loading}
	<!-- Loading state -->
	<div
		class="loading-container flex min-h-[400px] w-full flex-col items-center justify-center rounded-lg p-6"
		role="status"
		aria-label="Loading server data"
	>
		<div class="loading-animation mb-6">
			<div class="flex space-x-2">
				<div
					class="loading-dot bg-primary h-3 w-3 animate-bounce rounded-full"
					style="animation-delay: 0ms"
				></div>
				<div
					class="loading-dot bg-primary h-3 w-3 animate-bounce rounded-full"
					style="animation-delay: 150ms"
				></div>
				<div
					class="loading-dot bg-primary h-3 w-3 animate-bounce rounded-full"
					style="animation-delay: 300ms"
				></div>
			</div>
		</div>
		<div class="mb-4 text-center">
			<h3 class="text-base-content mb-2 text-lg font-semibold">
				<TranslatedText key="app.loading.title" />
			</h3>
			<p class="text-base-content/70 max-w-md text-sm">
				<TranslatedText key="app.loading.description" />
			</p>
		</div>
		<div class="mb-6 w-full max-w-sm">
			<div class="progress progress-primary h-2 w-full">
				<div class="progress-bar bg-primary h-2 w-[60%] animate-pulse"></div>
			</div>
			<p class="text-base-content/50 mt-2 text-center text-xs">
				<TranslatedText key="app.loading.progress" />
			</p>
		</div>
	</div>
{:else if error}
	<div class="alert alert-error">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="h-6 w-6 shrink-0 stroke-current"
			fill="none"
			viewBox="0 0 24 24"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
			/>
		</svg>
		<span>{error}</span>
	</div>
{:else}
	<!-- Quick filter buttons -->
	<QuickFilterButtons
		isLoading={loading}
		onQuickFilter={onQuickFilter}
		activeFilters={activeFilters}
		isMultiSelect={isMultiSelect}
		onMultiSelectChange={onMultiSelectChange}
	/>

	<!-- Content area -->
	<div class="flex w-full flex-col">
		<!-- Mobile table cards -->
		<div class="md:hidden">
			<!-- Mobile sort controls -->
			<div class="mb-4 flex flex-wrap gap-2">
				{#each columns.filter( (col) => ['name', 'playerCount', 'mapId'].includes(col.key) ) as column (column.key)}
					<button
						class="btn btn-sm btn-outline flex items-center gap-2"
						onclick={() => onSort(column.key)}
						type="button"
					>
						{#if column.i18n}<TranslatedText key={column.i18n} />{:else}{column.label}{/if}
						{@html getSortIcon(column.key)}
					</button>
				{/each}
			</div>

			{#each mobilePaginatedServers as item (item.id)}
				<div class="collapse collapse-arrow bg-base-100 border-base-300 mb-3 border">
					<input
						type="checkbox"
						checked={mobileExpandedCards[item.id]}
						onchange={() => onToggleMobileCard(item.id)}
						aria-label="Toggle server details"
						aria-expanded={mobileExpandedCards[item.id] ? 'true' : 'false'}
					/>
					<div class="collapse-title font-semibold p-4">
						<div class="flex items-center justify-between gap-2 mr-6">
							<div class="text-base-content flex-1 truncate text-base font-medium">
								{@html getDisplayValue(
									item,
									columns.find((col) => col.key === 'name')!,
									searchQuery
								)}
							</div>
							<div class="min-w-0 flex-shrink-0">
								<div class="flex max-w-24 flex-wrap justify-end gap-1 sm:max-w-32">
									{@html getDisplayValue(
										item,
										columns.find((col) => col.key === 'playerCount')!,
										searchQuery
									)}
								</div>
							</div>
							<div class="flex-shrink-0">
								<span class="badge bg-success/70 text-white font-medium text-xs px-2 py-1">
									{item.mapId.split('/').pop() || ''}
								</span>
							</div>
						</div>
					</div>
					<div class="collapse-content">
						<div class="border-base-200 border-t">
							<div class="space-y-2 pt-3">
								{#each columns.filter((col) => !['name', 'playerCount', 'mapId', 'action'].includes(col.key)) as column (column.key)}
									<div class="flex items-center justify-between py-1">
										<span class="text-base-content/60 min-w-20 flex-shrink-0 text-sm">
											{#if column.i18n}<TranslatedText
													key={column.i18n}
												/>{:else}{column.label}{/if}:
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
												<div class="text-left break-words whitespace-pre-wrap">
													{@html getDisplayValue(item, column)}
												</div>
											{:else}
												<div class="flex items-center justify-end">
													{@html getDisplayValue(item, column)}
												</div>
											{/if}
										</div>
									</div>
								{/each}
								{#if maps.find(m => m.path === item.mapId)}
									{@const mapData = maps.find(m => m.path === item.mapId)}
									<div class="border-base-200 mt-4 pt-3 border-t">
										<div class="flex items-center justify-between">
											<span class="text-base-content/70 min-w-20 flex-shrink-0 text-sm">
												<TranslatedText key="app.map.preview" />:
											</span>
											<button
												class="btn btn-success btn-sm text-white"
												onclick={(e) => {
													e.stopPropagation();
													onMapView(mapData);
												}}
												type="button"
											>
												<svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
												</svg>
												<TranslatedText key="app.map.buttonPreviewMap" />
											</button>
										</div>
									</div>
								{/if}
							</div>
						</div>
					</div>
				</div>
			{/each}

			{#if mobilePaginatedServers.length === 0}
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
			{/if}
		</div>

		<!-- Desktop table -->
		<div class="hidden overflow-x-auto md:block">
			<ServerTable
				data={paginatedServers}
				{columns}
				{searchQuery}
				{maps}
				onRowAction={onRowAction}
				{visibleColumns}
				onSort={onSort}
				{sortColumn}
				{sortDirection}
				{onMapView}
			/>
		</div>

		<!-- Mobile infinite scroll -->
		<MobileInfiniteScroll
			hasMore={mobileHasMore}
			isLoading={mobileLoadingMore}
			onLoadMore={onLoadMore}
		/>

		<!-- Desktop pagination -->
		<div class="hidden md:block">
			<Pagination
				{currentPage}
				{totalPages}
				totalItems={filteredServersCount}
				pageChange={onPageChange}
			/>
		</div>
	</div>
{/if}

<style>
	/* Enhanced loading animations */
	:global(.loading-container) {
		background: linear-gradient(135deg, hsl(var(--b1)) 0%, hsl(var(--b2)) 100%);
		border: 1px solid hsl(var(--bc) / 0.1);
		box-shadow:
			0 4px 6px -1px rgba(0, 0, 0, 0.1),
			0 2px 4px -1px rgba(0, 0, 0, 0.06);
	}

	/* Custom bounce animation for loading dots */
	@keyframes bounce-custom {
		0%,
		80%,
		100% {
			transform: scale(0.8);
			opacity: 0.5;
		}
		40% {
			transform: scale(1);
			opacity: 1;
		}
	}

	:global(.loading-dot) {
		animation: bounce-custom 1.4s infinite ease-in-out both;
	}

	/* Progress bar animation */
	@keyframes progress-pulse {
		0% {
			width: 30%;
			opacity: 0.6;
		}
		50% {
			width: 70%;
			opacity: 1;
		}
		100% {
			width: 90%;
			opacity: 0.8;
		}
	}

	:global(.progress-bar) {
		animation: progress-pulse 2s ease-in-out infinite;
	}
</style>
