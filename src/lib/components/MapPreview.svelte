<script lang="ts">
	import type { MapData } from '$lib/services/maps';
	import TranslatedText from '$lib/components/TranslatedText.svelte';

	interface Props {
		mapData?: MapData;
		show: boolean;
		position: { x: number; y: number };
		key?: string; // 添加key来强制重新渲染
		onClose?: () => void; // 回调函数
	}

	let {
		mapData,
		show,
		onClose
	}: Props = $props();

	let imageLoading = $state(true);
	let imageError = $state(false);
	let imageWidth = $state(0);
	let imageHeight = $state(0);
	let modalElement: HTMLElement;

	function handleBackgroundClick() {
		console.log('MapPreview background clicked, closing modal');
		closeModal();
	}

	function closeModal() {
		show = false;
		if (onClose) {
			onClose();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			closeModal();
		}
	}

	// Focus management
	$effect(() => {
		if (show && modalElement) {
			// Focus the modal when it opens
			modalElement.focus();
		}
	});

	function handleImageLoad(event: Event) {
		imageLoading = false;
		imageError = false;

		// Add successfully loaded image to cache
		if (mapData?.path) {
			imageCache.set(mapData.path, true);
		}
	}

	function handleImageError(event: Event) {
		imageLoading = false;
		imageError = true;

		// Mark as failed, but allow retry later
		if (mapData?.path) {
			imageCache.set(mapData.path, false);
		}
	}

	// Function to retry failed image (can be called by user action)
	function retryImageLoad() {
		if (mapData?.path) {
			imageCache.delete(mapData.path); // Remove from cache to force retry
			imageLoading = true;
			imageError = false;
		}
	}

	$effect(() => {
		// Update image dimensions
		imageWidth = Math.min(window.innerWidth * 0.8, 800);
		imageHeight = Math.min(window.innerHeight * 0.7, 600);
	});

	// Image cache system to avoid redundant requests
	const imageCache = $state(new Map<string, boolean>());
	let imageKey = $derived(() => {
		if (mapData && show) {
			return `map_${mapData.path}`;
		}
		return '';
	});

	$effect(() => {
		if (mapData && show) {
			const path = mapData.path;

			// Check if this image has been loaded before
			const cacheStatus = imageCache.get(path);

			if (cacheStatus === true) {
				// If previously loaded successfully, show immediately
				imageLoading = false;
				imageError = false;
			} else if (cacheStatus === false) {
				// If previously failed, show error immediately
				imageLoading = false;
				imageError = true;
			} else {
				// First time loading this image
				imageLoading = true;
				imageError = false;
			}
		} else {
			imageLoading = false;
			imageError = false;
		}
	});
</script>

{#if show && mapData}
	<!-- Full screen modal for both desktop and mobile -->
	<div
		bind:this={modalElement}
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
		onclick={handleBackgroundClick}
		onkeydown={handleKeydown}
		role="dialog"
		aria-label="Map preview"
		aria-modal="true"
		tabindex="-1"
	>
		<div
			class="bg-base-100 rounded-lg overflow-hidden"
			style="max-width: 90vw; max-height: 90vh; width: auto; height: auto;"
		>
			<div class="p-4 border-b border-base-200 bg-base-200/50 flex-shrink-0">
				<h3 class="font-semibold text-lg truncate">{mapData.name}</h3>
				<p class="text-sm text-base-content/60 truncate">{mapData.path}</p>
			</div>
			<div
				class="relative bg-base-200/30 flex items-center justify-center overflow-auto"
				style="min-height: 300px; max-height: 60vh;"
			>
				{#if imageLoading}
					<!-- Loading state for map image -->
					<div class="flex flex-col items-center justify-center p-8">
						<div class="loading mb-4">
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
						<p class="text-base-content/70 mt-2 text-center text-sm">
							<TranslatedText key="app.map.loading" />
						</p>
					</div>
				{:else if imageError}
					<!-- Error state for map image -->
					<div class="flex flex-col items-center justify-center p-8">
						<div class="text-center">
							<svg class="w-16 h-16 mx-auto mb-4 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
							</svg>
							<p class="text-base-content/70 mt-2 text-center text-sm mb-4">
								<TranslatedText key="app.map.loadError" />
							</p>
							<button
								class="btn btn-outline btn-sm"
								onclick={retryImageLoad}
								type="button"
							>
								<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
								</svg>
								<TranslatedText key="app.map.retry" />
							</button>
						</div>
					</div>
				{:else}
					{#key imageKey}
						<img
							src={mapData.image}
							alt="Map: {mapData.name}"
							class="max-w-full max-h-full object-contain"
							style="width: {imageWidth}px; height: {imageHeight}px;"
							onload={handleImageLoad}
							onerror={handleImageError}
						/>
					{/key}
				{/if}
			</div>
			<div class="p-4 border-t border-base-200 flex-shrink-0">
				<button
					class="btn btn-secondary w-full"
					onclick={closeModal}
					type="button"
				>
					<TranslatedText key="app.map.close" />
				</button>
			</div>
		</div>
	</div>
{/if}


<style>
	/* Ensure proper z-index layering */
	.fixed {
		z-index: 50;
	}

	.z-\[60\] {
		z-index: 60;
	}
</style>