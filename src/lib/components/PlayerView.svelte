<script lang="ts">
	import TranslatedText from '$lib/components/TranslatedText.svelte';
	import PaginationPrevNext from '$lib/components/PaginationPrevNext.svelte';
	import MobileInfiniteScroll from '$lib/components/MobileInfiniteScroll.svelte';
	import PageSizeSelector from '$lib/components/PageSizeSelector.svelte';
	import type { IPlayerItem, IPlayerColumn } from '$lib/models/player.model';

	interface Props {
		loading: boolean;
		error: string | null;
		searchQuery: string;
		paginatedPlayers: IPlayerItem[];
		mobilePaginatedPlayers: IPlayerItem[];
		mobileHasMore: boolean;
		mobileLoadingMore: boolean;
		playerColumns: IPlayerColumn[];
		visibleColumns: Record<string, boolean>;
		currentPage: number;
		pageSize: number;
		sortColumn: string | null;
		mobileExpandedCards: Record<string, boolean>;
		hasNext: boolean;
		hasPrevious: boolean;
		onSort: (column: string) => void;
		onPageChange: (page: number) => void;
		onPageSizeChange: (size: number) => void;
		onLoadMore: () => void;
		onToggleMobileCard: (playerId: string) => void;
	}

	let {
		loading,
		error,
		searchQuery,
		paginatedPlayers,
		mobilePaginatedPlayers,
		mobileHasMore,
		mobileLoadingMore,
		playerColumns,
		visibleColumns,
		currentPage,
		pageSize,
		sortColumn,
		mobileExpandedCards,
		hasNext,
		hasPrevious,
		onSort,
		onPageChange,
		onPageSizeChange,
		onLoadMore,
		onToggleMobileCard
	}: Props = $props();

	// Filter columns based on visibility
	const visiblePlayerColumns = $derived(
		playerColumns.filter((col) => visibleColumns[col.key as string] !== false)
	);

	// Helper function to get the display value for a column
	function getDisplayValue(
		item: IPlayerItem,
		column: IPlayerColumn,
		searchQuery?: string
	): string {
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

	// Get sort icon for column (players only has descending sort)
	function getSortIcon(column: string): string {
		if (sortColumn !== column) {
			return `<svg class="w-4 h-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>`;
		}

		// Always show descending icon for sorted column
		return `<svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>`;
	}
</script>

{#if loading}
	<!-- Loading state -->
	<div
		class="loading-container flex min-h-[400px] w-full flex-col items-center justify-center rounded-lg p-6"
		role="status"
		aria-label="Loading player data"
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
	<!-- Content area -->
	<div class="flex w-full flex-col">
		<!-- Mobile table cards -->
		<div class="md:hidden">
			<!-- Mobile sort controls -->
			<div class="mb-4 flex flex-wrap gap-2">
				{#each playerColumns.filter((col) => ['username', 'kills', 'deaths', 'kd', 'score', 'longestKillStreak', 'targetsDestroyed', 'vehiclesDestroyed', 'rankProgression'].includes(col.key as string)) as column (column.key)}
					<button
						class="btn btn-sm btn-outline flex items-center gap-2"
						onclick={() => onSort(column.key as string)}
						type="button"
					>
						{#if column.i18n}<TranslatedText key={column.i18n} />{:else}{column.label}{/if}
						{@html getSortIcon(column.key as string)}
					</button>
				{/each}
			</div>

			{#each mobilePaginatedPlayers as item (item.id)}
				<div class="collapse collapse-arrow bg-base-100 border-base-300 mb-3 border">
					<input type="checkbox" checked={mobileExpandedCards[item.id]} onchange={() => onToggleMobileCard(item.id)} />
					<div class="collapse-title font-semibold p-4">
						<div class="flex items-center justify-between gap-2 mr-6">
							<h3 class="text-base-content flex-1 truncate text-base">
								{@html getDisplayValue(
									item,
									playerColumns.find((col) => col.key === 'username')!,
									searchQuery
								)}
							</h3>
							<span class="text-base-content/60 text-sm">
							#{@html getDisplayValue(
								item,
								playerColumns.find((col) => col.key === 'rowNumber')!
							)}
							</span>
						</div>
					</div>
					<div class="collapse-content">
						<div class="border-base-200 border-t">
							<div class="space-y-2 pt-3">
								{#each playerColumns.filter((col) => !['username', 'rowNumber'].includes(col.key as string)) as column (column.key)}
									<div class="flex items-center justify-between py-1">
										<span class="text-base-content/60 min-w-20 flex-shrink-0 text-sm">
											{#if column.i18n}<TranslatedText
													key={column.i18n}
												/>{:else}{column.label}{/if}:
										</span>
										<div class="text-base-content ml-3 flex-1 text-right text-sm">
											{@html getDisplayValue(item, column, searchQuery)}
										</div>
									</div>
								{/each}
							</div>
						</div>
					</div>
				</div>
			{/each}

			{#if mobilePaginatedPlayers.length === 0}
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
					<span>
						<TranslatedText key="app.player.noPlayersFound" />
						{#if searchQuery}
							<TranslatedText key="app.player.matchingSearch" />
						{/if}.
					</span>
				</div>
			{/if}
		</div>

		<!-- Desktop table -->
		<div class="hidden overflow-x-auto md:block">
			{#if paginatedPlayers.length === 0}
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
					<span>
						<TranslatedText key="app.player.noPlayersFound" />
						{#if searchQuery}
							<TranslatedText key="app.player.matchingSearch" />
						{/if}.
					</span>
				</div>
			{:else}
				<div class="w-full">
					<table class="table-pin-rows mb-0 table table-zebra border-0">
						<thead>
							<tr>
								{#each visiblePlayerColumns as column (column.key)}
									<th
										class="bg-base-200 sticky top-0 z-10 h-12 px-4 py-2 align-middle"
									>
										<button
											class="hover:bg-base-300 flex w-full items-center gap-2 rounded px-2 py-1 text-left transition-colors duration-200"
											onclick={() => onSort(column.key as string)}
											type="button"
											title="Click to sort"
										>
											<span class="flex-1">
												{#if column.i18n}<TranslatedText
														key={column.i18n}
													/>{:else}{column.label}{/if}
											</span>
											{@html getSortIcon(column.key as string)}
										</button>
									</th>
								{/each}
							</tr>
						</thead>
						<tbody>
							{#each paginatedPlayers as item (item.id)}
								<tr class="hover hover:bg-base-300 min-h-12">
									{#each visiblePlayerColumns as column (column.key)}
										<td
											class="px-4 py-2 {column.alignment === 'center'
												? 'align-middle text-center'
												: column.alignment === 'right'
													? 'align-middle text-right'
													: 'align-middle'}"
										>
											{@html getDisplayValue(item, column, searchQuery)}
										</td>
									{/each}
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>

		<!-- Mobile infinite scroll -->
		<MobileInfiniteScroll
			hasMore={mobileHasMore}
			isLoading={mobileLoadingMore}
			onLoadMore={onLoadMore}
		/>

		<!-- Desktop pagination -->
		<div class="mt-6 hidden md:flex md:items-center md:justify-between">
			<PaginationPrevNext
				{currentPage}
				{hasNext}
				{hasPrevious}
				onPageChange={onPageChange}
			/>
			<PageSizeSelector currentSize={pageSize} onSizeChange={onPageSizeChange} />
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
