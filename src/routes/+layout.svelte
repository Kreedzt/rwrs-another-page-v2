<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<div class="flex min-h-screen flex-col">
	<main class="flex w-full flex-1 flex-col">
		{@render children()}
	</main>

	<footer class="footer sm:footer-horizontal footer-center bg-base-200 text-base-content p-6">
		<aside class="flex flex-col items-center gap-2">
			<p class="text-sm">
				Developed by
				<a href="https://www.kreedzt.com" target="_blank" rel="noopener noreferrer" class="link link-primary font-semibold">
					Kreedzt
				</a>
			</p>
			<p class="text-xs text-base-content/70">
				Data sourced from official
				<a href="http://rwr.runningwithrifles.com/rwr_stats/view_players.php" target="_blank" rel="noopener noreferrer" class="link link-primary">
					RWR Stats API
				</a>
				&bull;
				<a href="http://rwr.runningwithrifles.com/rwr_server_list/view_servers.php" target="_blank" rel="noopener noreferrer" class="link link-primary">
					Server List
				</a>
			</p>
			<p class="text-xs text-base-content/50">
				Copyright © {new Date().getFullYear()} - All data provided by Running with Rifles official servers
			</p>
		</aside>
	</footer>
</div>

<style>
</style>
