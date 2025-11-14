<script lang="ts">
	import github from '$lib/images/github.svg';
	import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';
	import TranslatedText from '$lib/components/TranslatedText.svelte';
</script>

<header class="border-base-300 bg-base-100 flex w-full justify-center border-b">
	<div class="container px-4 py-4">
		<div class="flex w-full items-center justify-between">
			<TranslatedText
				tag="h1"
				key="app.title"
				className="text-base-content text-xl md:text-2xl font-bold"
			></TranslatedText>

			<div class="flex items-center gap-4">
				<LanguageSwitcher />

				<a
					href="https://github.com/Kreedzt/rwrs-another-page-v2"
					class="hover:bg-base-200 inline-flex items-center rounded-lg p-2 transition-opacity hover:opacity-80"
					target="_blank"
					rel="noopener noreferrer"
					title="View on GitHub"
				>
					<img src={github} width="24" height="24" alt="GitHub" />
				</a>
			</div>
		</div>
	</div>
</header>
