<script lang="ts">
	import TranslatedText from '$lib/components/TranslatedText.svelte';
	import LoadingState from '$lib/components/LoadingState.svelte';
	import PaginationPrevNext from '$lib/components/PaginationPrevNext.svelte';
	import PlayerTable from '$lib/components/PlayerTable.svelte';
	import MobileInfiniteScroll from '$lib/components/MobileInfiniteScroll.svelte';
	import PageSizeSelector from '$lib/components/PageSizeSelector.svelte';
	import Toast from '$lib/components/Toast.svelte';
	import { m } from '$lib/paraglide/messages.js';
	import { ArrowDown, CircleX, Info } from '@lucide/svelte';
	import type { IPlayerItem, IPlayerColumn } from '$lib/models/player.model';

	interface Props {
		loading: boolean;
		error: string | null;
		searchQuery: string;
		highlightedUsername?: string;
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
		layoutMode: 'fullPage' | 'tableOnly';
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
		highlightedUsername,
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
		layoutMode,
		hasNext,
		hasPrevious,
		onSort,
		onPageChange,
		onPageSizeChange,
		onLoadMore,
		onToggleMobileCard
	}: Props = $props();

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

	// Toast state for load more success feedback
	let showLoadMoreToast = $state(false);
	let wasPreviouslyLoadingMore = $state(false);
	let hasLoadedPlayersOnce = $state(false);

	// Monitor loading state changes to show toast
	$effect(() => {
		// Check if loading just finished (transitioned from true to false)
		const loadingJustFinished = wasPreviouslyLoadingMore && !mobileLoadingMore;

		// Update tracking state
		wasPreviouslyLoadingMore = mobileLoadingMore;

		// Track if we've had data at least once
		if (mobilePaginatedPlayers.length > 0) {
			hasLoadedPlayersOnce = true;
		}

		// Show toast only after initial load, when load more completes
		if (loadingJustFinished && hasLoadedPlayersOnce) {
			showLoadMoreToast = true;
			setTimeout(() => {
				showLoadMoreToast = false;
			}, 2000);
		}
	});

	const tableOnlyContainerClasses = 'md:flex-1 md:min-h-0 md:overflow-hidden';
	const tableOnlyScrollClasses = 'md:flex-1 md:min-h-0 md:overflow-auto';
	const fullPageScrollClasses = 'md:overflow-x-auto';
</script>

{#if loading}
	<LoadingState type="players" />
{:else if error}
	<div class="alert alert-error">
		<CircleX class="h-6 w-6 shrink-0 stroke-current" />
		<span>{error}</span>
	</div>
{:else}
	<!-- Desktop scrollable table container -->
	<div class={`hidden md:flex md:flex-col ${layoutMode === 'tableOnly' ? tableOnlyContainerClasses : ''}`}>
		<!-- Desktop table with scroll -->
		<div class={`w-full ${layoutMode === 'tableOnly' ? tableOnlyScrollClasses : fullPageScrollClasses}`}>
			<PlayerTable
				data={paginatedPlayers}
				{playerColumns}
				{visibleColumns}
				{searchQuery}
				{highlightedUsername}
				{sortColumn}
				onSort={onSort}
			/>
		</div>

		<!-- Desktop pagination - fixed at bottom, hidden when no pagination needed -->
		<div class="flex items-center justify-between border-t border-mil bg-mil-secondary px-3 py-2" class:hidden={!hasNext && !hasPrevious}>
			<PaginationPrevNext
				{currentPage}
				{hasNext}
				{hasPrevious}
				onPageChange={onPageChange}
			/>
			<PageSizeSelector currentSize={pageSize} onSizeChange={onPageSizeChange} />
		</div>
	</div>

	<!-- Mobile content area - 保持原有行为 -->
	<div class="flex w-full flex-col md:hidden">
		<!-- Toast container for mobile only -->
		<div class="toast toast-top toast-end z-50">
			{#if showLoadMoreToast}
				<Toast message={m['app.toast.refreshSuccess.title']()} type="success" />
			{/if}
		</div>
		<!-- Mobile table cards -->
		<div class="md:hidden">
			<!-- Mobile sort controls -->
			<div class="mb-4 flex flex-wrap gap-2">
				{#each playerColumns.filter((col) => col.key !== 'rowNumber' && col.key !== 'rankName') as column (column.key)}
					<button
						class="btn btn-sm btn-outline flex items-center gap-2"
						onclick={() => onSort(column.key as string)}
						type="button"
					>
						{#if column.i18n}<TranslatedText key={column.i18n} />{:else}{column.label}{/if}
						{#if sortColumn !== column.key}
							<ArrowDown class="w-4 h-4 opacity-30" />
						{:else}
							<ArrowDown class="w-4 h-4 text-primary" />
						{/if}
					</button>
				{/each}
			</div>

			{#each mobilePaginatedPlayers as item (item.id)}
				<div class="collapse collapse-arrow bg-base-100 border-base-300 mb-3 border">
					<input
						type="checkbox"
						checked={mobileExpandedCards[item.id]}
						onchange={() => onToggleMobileCard(item.id)}
						aria-label="Toggle player details"
						aria-expanded={mobileExpandedCards[item.id] ? 'true' : 'false'}
					/>
					<div class="collapse-title font-semibold p-4">
						<div class="flex items-center justify-between gap-2 mr-6">
							<div class="text-base-content flex-1 truncate text-base font-medium">
								{@html getDisplayValue(
									item,
									playerColumns.find((col) => col.key === 'username')!,
									searchQuery
								)}
							</div>
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
					<Info class="h-6 w-6 shrink-0 stroke-current" />
					<span>
						<TranslatedText key="app.player.noPlayersFound" />
						{#if searchQuery}
							<TranslatedText key="app.player.matchingSearch" />
						{/if}.
					</span>
				</div>
			{/if}
		</div>

		<!-- Mobile infinite scroll -->
		<MobileInfiniteScroll
			hasMore={mobileHasMore}
			isLoading={mobileLoadingMore}
			onLoadMore={onLoadMore}
			loadingTextKey="app.player.loading.text"
		/>
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
