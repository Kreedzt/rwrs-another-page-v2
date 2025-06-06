<script lang="ts">
	import Header from './Header.svelte';
	import '../app.css';

	let { children } = $props();
</script>

<div class="flex min-h-screen flex-col">
	<Header />

	<main class="flex w-full flex-1 flex-col">
		{@render children()}
	</main>

	<footer class="flex flex-col items-center justify-center py-4">
		<p class="m-0">
			Visit the old version: <a class="font-bold" href="https://rwrs.kreedzt.cn"
				>RWRS Another Page(V1)</a
			>
		</p>
	</footer>
</div>

<style>
</style>
