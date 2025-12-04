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

	<footer class="flex flex-col items-center justify-center py-4 border-t border-base-200/50">
		<div class="text-center space-y-1">
			<p class="m-0 text-sm text-base-content/70">
				Developed by
				<a class="font-medium hover:text-primary transition-colors" href="https://www.kreedzt.com" target="_blank" rel="noopener noreferrer">
					Kreedzt
				</a>
			</p>
			<p class="m-0 text-xs text-base-content/50">
				Data source from official
				<a class="font-medium hover:text-primary transition-colors" href="http://rwr.runningwithrifles.com/rwr_server_list/get_server_list.php" target="_blank" rel="noopener noreferrer">
					RWR API
				</a>
			</p>
			<p class="m-0 text-xs text-base-content/40">
				<a class="font-medium hover:text-primary transition-colors" href="http://rwr.runningwithrifles.com/rwr_server_list/view_servers.php" target="_blank" rel="noopener noreferrer">
					Official Server List
				</a>
			</p>
		</div>
	</footer>
</div>

<style>
</style>
