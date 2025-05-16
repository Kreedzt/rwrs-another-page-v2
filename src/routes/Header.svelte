<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import github from '$lib/images/github.svg';
	import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';
</script>

<header>
	<h1>RWRS Another Page</h1>

	<div class="corner">
		<h2 class="mb-2 text-xl font-semibold">Language Switcher</h2>
		<LanguageSwitcher buttonClass="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" />

		<a href="https://github.com/Kreedzt/rwrs-another-page-v2">
			<img src={github} alt="GitHub" />
		</a>
	</div>
</header>

<style>
	header {
		display: flex;
		justify-content: space-between;
	}

	.corner {
		width: 3em;
		height: 3em;
	}

	.corner a {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}

	.corner img {
		width: 2em;
		height: 2em;
		object-fit: contain;
	}

	a:hover {
		color: var(--color-theme-1);
	}
</style>
