<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import github from '$lib/images/github.svg';
	import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';
</script>

<header>
	<h1>RWRS Another Page</h1>

	<div class="corner flex">
		<LanguageSwitcher />

		<a href="https://github.com/Kreedzt/rwrs-another-page-v2">
			<img src={github} width="24" height="24" alt="GitHub" />
		</a>
	</div>
</header>

<style>
	header {
		display: flex;
		justify-content: space-between;
	}
</style>
