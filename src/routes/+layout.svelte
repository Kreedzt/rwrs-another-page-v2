<script lang="ts">
	import '../app.css';
	import TranslatedText from '$lib/components/TranslatedText.svelte';
	import ChristmasSnowfall from '$lib/components/ChristmasSnowfall.svelte';

	let { children } = $props();
</script>

<!-- 圣诞雪花背景 -->
<ChristmasSnowfall />

<div class="flex min-h-screen flex-col">
	<main class="flex w-full flex-1 flex-col">
		{@render children()}
	</main>

	<footer class="footer sm:footer-horizontal footer-center border-t border-mil bg-mil-secondary p-6">
		<aside class="flex flex-col items-center gap-2">
			<p class="text-sm text-mil-primary">
				<TranslatedText key="app.footer.developedBy" />
				<a href="https://www.kreedzt.com" target="_blank" rel="noopener noreferrer" class="link link-hover font-bold hover:underline text-mil-primary">
					Kreedzt
				</a>
			</p>
			<p class="text-xs text-mil-secondary">
				<TranslatedText key="app.footer.dataSourced" />
				<a href="http://rwr.runningwithrifles.com/rwr_stats/view_players.php" target="_blank" rel="noopener noreferrer" class="link link-hover underline-offset-4 text-mil-secondary">
					<TranslatedText key="app.footer.rwrStatsApi" />
				</a>
				&bull;
				<a href="http://rwr.runningwithrifles.com/rwr_server_list/view_servers.php" target="_blank" rel="noopener noreferrer" class="link link-hover underline-offset-4 text-mil-secondary">
					<TranslatedText key="app.footer.serverList" />
				</a>
			</p>
			<p class="text-xs text-mil-secondary">
				<TranslatedText key="app.footer.robinWeb" />
				&bull;
				<TranslatedText key="app.footer.copyright" params={{ year: 2025 }} />
			</p>
		</aside>
	</footer>
</div>

<style>
</style>
