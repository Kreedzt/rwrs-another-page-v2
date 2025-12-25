<script lang="ts">
	import { Github } from '@lucide/svelte';
	import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import TranslatedText from '$lib/components/TranslatedText.svelte';
</script>

<header class="border-base-300 bg-base-100 flex w-full justify-center border-b">
	<div class="container px-4 py-4">
		<div class="flex w-full items-center justify-between">
			<div class="flex flex-col">
				<TranslatedText
					tag="h1"
					key="app.title"
					className="text-base-content text-xl md:text-2xl font-bold"
				></TranslatedText>
				<TranslatedText
					tag="p"
					key="app.subtitle"
					className="text-base-content/60 text-xs md:text-sm"
				></TranslatedText>
			</div>

			<div class="flex items-center gap-4">
				<ThemeToggle />
				<LanguageSwitcher />

				<a
					href="https://github.com/Kreedzt/rwrs-another-page-v2"
					class="hover:bg-base-200 inline-flex items-center rounded-lg p-2 transition-opacity hover:opacity-80"
					target="_blank"
					rel="noopener noreferrer"
					title="View on GitHub"
				>
					<Github />
				</a>
			</div>
		</div>
	</div>
</header>
