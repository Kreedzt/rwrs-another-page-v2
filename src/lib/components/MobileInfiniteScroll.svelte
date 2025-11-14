<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import TranslatedText from '$lib/components/TranslatedText.svelte';

	interface Props {
		hasMore: boolean;
		isLoading: boolean;
		onLoadMore: () => void;
		threshold?: number; // Distance from bottom to trigger load (in pixels)
	}

	let {
		hasMore = false,
		isLoading = false,
		onLoadMore = () => {},
		threshold = 200
	}: Props = $props();

	let containerElement: HTMLElement;
	let observer: IntersectionObserver | null = null;
	let loadMoreTrigger = $state<HTMLElement | undefined>();

	// Set up intersection observer for infinite scroll
	onMount(() => {
		if (!hasMore) return;

		observer = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				if (entry.isIntersecting && hasMore && !isLoading) {
					onLoadMore();
				}
			},
			{
				root: null, // Use viewport as root
				rootMargin: `${threshold}px`, // Start loading before reaching the element
				threshold: 0.1 // Trigger when 10% of element is visible
			}
		);

		if (loadMoreTrigger) {
			observer.observe(loadMoreTrigger);
		}
	});

	// Clean up observer
	onDestroy(() => {
		if (observer) {
			observer.disconnect();
		}
	});

	// Re-observe when hasMore changes
	$effect(() => {
		if (observer) {
			if (hasMore && loadMoreTrigger) {
				observer.observe(loadMoreTrigger);
			} else {
				observer.unobserve(loadMoreTrigger);
			}
		}
	});
</script>

<!-- Mobile infinite scroll - hidden on desktop -->
<div class="block md:hidden">
	{#if hasMore}
		<!-- Load more trigger element -->
		<div
			bind:this={loadMoreTrigger}
			class="flex w-full items-center justify-center py-4"
			role="status"
			aria-live="polite"
		>
			{#if isLoading}
				<!-- Loading indicator -->
				<div class="flex items-center gap-3">
					<div class="loading loading-spinner loading-sm"></div>
					<span class="text-base-content/70 text-sm">
						<TranslatedText key="app.loading" />
					</span>
				</div>
			{:else}
				<!-- Load more button (fallback) -->
				<button class="btn btn-outline btn-sm" onclick={onLoadMore} disabled={isLoading}>
					<TranslatedText key="app.button.loadMore" fallback="Load More" />
				</button>
			{/if}
		</div>
	{:else if isLoading}
		<!-- Final loading state -->
		<div class="flex w-full items-center justify-center py-4" role="status">
			<div class="flex items-center gap-3">
				<div class="loading loading-spinner loading-sm"></div>
				<span class="text-base-content/70 text-sm">
					<TranslatedText key="app.loading" />
				</span>
			</div>
		</div>
	{:else}
		<!-- End of content indicator -->
		<div class="w-full py-6 text-center" role="status">
			<div class="text-base-content/50 text-sm">
				<TranslatedText key="app.mobile.endOfContent" />
			</div>
		</div>
	{/if}
</div>
