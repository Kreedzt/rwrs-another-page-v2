<script lang="ts">
	import '../app.css';
	import TranslatedText from '$lib/components/TranslatedText.svelte';

	let { children } = $props();
</script>

<div class="flex min-h-screen flex-col">
	<main class="flex w-full flex-1 flex-col">
		{@render children()}
	</main>

	<footer class="footer sm:footer-horizontal footer-center bg-base-200 text-base-content p-6">
		<aside class="flex flex-col items-center gap-2">
			<p class="text-sm">
				<TranslatedText key="app.footer.developedBy" />
				<a href="https://www.kreedzt.com" target="_blank" rel="noopener noreferrer" class="link link-hover font-semibold text-primary">
					Kreedzt
				</a>
			</p>
			<p class="text-xs text-base-content/70">
				<TranslatedText key="app.footer.dataSourced" />
				<a href="http://rwr.runningwithrifles.com/rwr_stats/view_players.php" target="_blank" rel="noopener noreferrer" class="link link-hover underline-offset-4">
					<TranslatedText key="app.footer.rwrStatsApi" />
				</a>
				&bull;
				<a href="http://rwr.runningwithrifles.com/rwr_server_list/view_servers.php" target="_blank" rel="noopener noreferrer" class="link link-hover underline-offset-4">
					<TranslatedText key="app.footer.serverList" />
				</a>
			</p>
			<p class="text-xs text-base-content/70">
				<TranslatedText key="app.footer.copyright" params={{ year: 2025 }} />
			</p>
		</aside>
	</footer>
</div>

<style>
</style>
