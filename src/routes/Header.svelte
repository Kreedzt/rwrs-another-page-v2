<script lang="ts">
	import { Github } from '@lucide/svelte';
	import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import TranslatedText from '$lib/components/TranslatedText.svelte';
</script>

<header class="header-stripe flex w-full justify-center border-b border-mil bg-mil-secondary">
	<div class="container px-4 py-4">
		<div class="flex w-full items-center justify-between">
			<div class="flex flex-col gap-1">
				<TranslatedText
					tag="h1"
					key="app.title"
					className="text-xl md:text-2xl font-bold uppercase tracking-wider font-display text-mil-primary"
				></TranslatedText>
				<TranslatedText
					tag="p"
					key="app.subtitle"
					className="text-xs md:text-sm font-mono text-mil-secondary"
					style="letter-spacing: 0.05em;"
				></TranslatedText>
			</div>

			<div class="flex items-center gap-3">
				<ThemeToggle />
				<LanguageSwitcher />

				<a
					href="https://github.com/Kreedzt/rwrs-another-page-v2"
					class="btn-tactical inline-flex items-center justify-center px-3 py-2 transition-all"
					target="_blank"
					rel="noopener noreferrer"
					title="View on GitHub"
				>
					<Github class="w-4 h-4" />
					<span class="hidden sm:inline ml-2">GITHUB</span>
				</a>
			</div>
		</div>
	</div>
</header>

<style>
	/* Override DaisyUI button styles in header */
	header :global(a) {
		text-decoration: none;
	}
</style>
