<script lang="ts">
	import TranslatedText from './TranslatedText.svelte';

	interface Props {
		type: 'servers' | 'players';
		refreshing?: boolean;
	}

	let { type, refreshing = false }: Props = $props();

	const messages = {
		servers: {
			title: 'app.loading.title',
			description: 'app.loading.description',
			progress: 'app.loading.progress'
		},
		players: {
			title: 'app.player.loading.title',
			description: 'app.player.loading.description',
			progress: 'app.player.loading.progress'
		}
	};
</script>

{#if refreshing}
	<!-- Refreshing state - lighter indicator -->
	<div
		class="loading-container flex min-h-[200px] w-full flex-col items-center justify-center rounded-lg p-6"
		role="status"
		aria-label="Refreshing data"
		aria-live="polite"
	>
		<div class="mb-4">
			<span class="loading-dots loading-sm text-primary"></span>
		</div>
		<p class="text-base-content/70 text-sm">Refreshing...</p>
	</div>
{:else}
	<!-- Initial loading state -->
	<div
		class="loading-container flex min-h-[400px] w-full flex-col items-center justify-center rounded-lg p-6"
		role="status"
		aria-label={type === 'servers' ? 'Loading server data' : 'Loading player data'}
		aria-live="polite"
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
				<TranslatedText key={messages[type].title} />
			</h3>
			<p class="text-base-content/70 max-w-md text-sm">
				<TranslatedText key={messages[type].description} />
			</p>
		</div>
		<div class="mb-6 w-full max-w-sm">
			<div class="progress progress-primary h-2 w-full">
				<div class="progress-bar bg-primary h-2 w-[60%] animate-pulse"></div>
			</div>
			<p class="text-base-content/50 mt-2 text-center text-xs">
				<TranslatedText key={messages[type].progress} />
			</p>
		</div>
	</div>
{/if}

<style>
	/* Enhanced loading animations */
	.loading-container {
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

	.loading-dot {
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

	.progress-bar {
		animation: progress-pulse 2s ease-in-out infinite;
	}
</style>
