<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import github from '$lib/images/github.svg';
	import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';
</script>

<header class="w-full border-b border-base-300 bg-base-100">
	<div class="container mx-auto px-4 py-4">
		<div class="flex justify-between items-center">
			<h1 class="text-2xl font-bold text-base-content">RWRS Another Page</h1>

			<div class="flex items-center gap-4">
				<LanguageSwitcher />

				<a
					href="https://github.com/Kreedzt/rwrs-another-page-v2"
					class="inline-flex items-center hover:opacity-80 transition-opacity p-2 rounded-lg hover:bg-base-200"
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
