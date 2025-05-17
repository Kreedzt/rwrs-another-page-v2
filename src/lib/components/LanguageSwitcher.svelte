<script lang="ts">
	import { setLocale, getLocale, locales } from '$lib/paraglide/runtime';

	const languageNames: Record<string, { name: string; shortName: string }> = {
		'en-us': { name: 'English', shortName: 'EN' },
		'zh-cn': { name: '中文', shortName: 'CN' }
	};

	const currentLocale = $derived(getLocale());
</script>

<div class="dropdown dropdown-bottom dropdown-end">
	<div tabindex="-1" role="button" class="btn m-1">Locale</div>
	<ul tabindex="-1" class="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
		{#each locales as locale}
			<li>
				<div
					tabindex={currentLocale === locale ? 0 : -1}
					role="button"
					onclick={() => setLocale(locale)}
					onkeydown={(e) => e.key === 'Enter' && setLocale(locale)}
					aria-label={`Switch to ${languageNames[locale]?.name || locale}`}
					title={`Switch to ${languageNames[locale]?.name || locale}`}
				>
					{languageNames[locale]?.name || locale}
				</div>
			</li>
		{/each}
	</ul>
</div>

<style>
</style>
