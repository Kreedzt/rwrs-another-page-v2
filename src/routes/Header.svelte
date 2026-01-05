<script lang="ts">
	import { Github } from '@lucide/svelte';
	import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import TranslatedText from '$lib/components/TranslatedText.svelte';
	import ChristmasDecoration from '$lib/components/ChristmasDecoration.svelte';
	import ChristmasConfetti from '$lib/components/ChristmasConfetti.svelte';
	import analytics from '$lib/utils/analytics';

	let confettiComponent: ChristmasConfetti;

	function handleTitleClick() {
		confettiComponent?.trigger();
	}

	function handleGitHubClick() {
		analytics.trackGitHubClick();
	}
</script>

<header class="header-stripe flex w-full justify-center border-b border-mil bg-mil-secondary">
	<div class="container px-4 py-2 md:py-3">
		<div class="flex w-full items-center justify-between">
			<div class="flex flex-col gap-0.5">
				<div class="flex items-center gap-2">
					<ChristmasDecoration />
					<button
						onclick={handleTitleClick}
						class="cursor-pointer transition-transform hover:scale-105 active:scale-95"
						aria-label="Merry Christmas! Click to trigger snowflake confetti"
					>
						<TranslatedText
							tag="h1"
							key="app.title"
							className="text-lg md:text-xl font-bold uppercase tracking-wider font-display text-mil-primary"
						></TranslatedText>
					</button>
					<ChristmasDecoration />
				</div>
				<TranslatedText
					tag="p"
					key="app.subtitle"
					className="text-xs font-mono text-mil-secondary"
					style="letter-spacing: 0.05em;"
				></TranslatedText>
			</div>

			<div class="flex items-center gap-2 md:gap-3">
				<ThemeToggle />
				<LanguageSwitcher />

				<a
					href="https://github.com/Kreedzt/rwrs-another-page-v2"
					class="header-link btn-tactical inline-flex items-center justify-center px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm transition-all"
					target="_blank"
					rel="noopener noreferrer"
					title="View on GitHub"
					onclick={handleGitHubClick}
				>
					<Github class="w-3.5 h-3.5 md:w-4 md:h-4" />
					<span class="hidden sm:inline ml-1 md:ml-2">GITHUB</span>
				</a>
			</div>
		</div>
	</div>
</header>

<!-- Christmas confetti effect -->
<ChristmasConfetti bind:this={confettiComponent} />

<style>
	/* Header link styling - override DaisyUI defaults */
	.header-link {
		text-decoration: none;
	}

	/* Title button style reset */
	header button {
		background: none;
		border: none;
		padding: 0;
		font: inherit;
		color: inherit;
		outline: inherit;
	}
</style>