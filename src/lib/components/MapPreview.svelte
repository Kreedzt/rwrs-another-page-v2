<script lang="ts">
	import type { MapData } from '$lib/services/maps';
	import TranslatedText from '$lib/components/TranslatedText.svelte';
	import { browser } from '$app/environment';
	import { CircleAlert, RefreshCw } from '@lucide/svelte';

	interface Props {
		mapData?: MapData;
		show: boolean;
		position: { x: number; y: number };
		key?: string;
		onClose?: () => void;
	}

	let {
		mapData,
		show,
		onClose
	}: Props = $props();

	let imageLoading = $state(true);
	let imageError = $state(false);

	function closeModal() {
		if (onClose) {
			onClose();
		}
	}

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

	function retryImageLoad() {
		if (mapData?.path) {
			imageCache.delete(mapData.path);
			imageLoading = true;
			imageError = false;
		}
	}

	// Image cache system
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
			const cacheStatus = imageCache.get(path);

			if (cacheStatus === true) {
				imageLoading = false;
				imageError = false;
			} else if (cacheStatus === false) {
				imageLoading = false;
				imageError = true;
			} else {
				imageLoading = true;
				imageError = false;
			}
		} else {
			imageLoading = false;
			imageError = false;
		}
	});
</script>

{#if mapData}
	<!-- Use conditional rendering for modal visibility -->
	{#if show}
		<dialog
			class="modal modal-open"
			onclose={closeModal}
		>
			<div
				class="modal-box p-0 max-w-6xl flex flex-col"
				role="dialog"
				aria-modal="true"
				tabindex="-1"
				onclick={(e) => e.stopPropagation()}
				onkeydown={(e) => {
					if (e.key === 'Escape') closeModal();
				}}
			>
				<!-- Header - always visible, fixed height -->
				<div class="flex-shrink-0 p-4 border-b border-base-300">
					<h3 class="font-semibold text-lg truncate">{mapData.name}</h3>
					<p class="text-sm text-base-content/60 truncate">{mapData.path}</p>
				</div>

				<!-- Content - flexible, takes available space with max height -->
				<div class="flex items-center justify-center p-4 bg-base-200/30" style="max-height: 70vh; width: 100%;">
					{#if imageLoading}
						<!-- Loading state using DaisyUI loading-dots -->
						<div class="flex flex-col items-center justify-center p-8">
							<span class="loading loading-dots loading-lg mb-4"></span>
							<p class="text-base-content/70 text-center text-sm">
								<TranslatedText key="app.map.loading" />
							</p>
						</div>
					{:else if imageError}
						<!-- Error state -->
						<div class="flex flex-col items-center justify-center p-8">
							<div class="text-center">
								<CircleAlert class="w-16 h-16 mx-auto mb-4 text-error" />
								<p class="text-base-content/70 text-center text-sm mb-4">
									<TranslatedText key="app.map.loadError" />
								</p>
								<button
									class="btn btn-outline btn-sm"
									onclick={retryImageLoad}
									type="button"
								>
									<RefreshCw class="w-4 h-4 mr-1" />
									<TranslatedText key="app.map.retry" />
								</button>
							</div>
						</div>
					{:else}
						{#key imageKey}
							<img
								src={mapData.image}
								alt="Map: {mapData.name}"
								class="max-w-full max-h-full object-contain rounded-lg"
								style="max-height: 66vh;"
								onload={handleImageLoad}
								onerror={handleImageError}
							/>
						{/key}
					{/if}
				</div>

				<!-- Footer - always visible, fixed height -->
				<div class="flex-shrink-0 p-4 border-t border-base-300">
					<button
						class="btn btn-secondary w-full"
						onclick={closeModal}
						type="button"
					>
						<TranslatedText key="app.map.close" />
					</button>
				</div>
			</div>

			<!-- Backdrop click handler -->
			<form method="dialog" class="modal-backdrop">
				<button>close</button>
			</form>
		</dialog>
	{/if}
{/if}
