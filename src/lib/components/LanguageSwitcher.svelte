<script lang="ts">
	import { setLocale, getLocale, locales } from '$lib/paraglide/runtime';

	const languageNames: Record<string, { name: string; shortName: string }> = {
		'en-us': { name: 'English', shortName: 'EN' },
		'zh-cn': { name: '中文', shortName: 'CN' }
	};

	const currentLocale = $derived(getLocale());
</script>

<div class="dropdown dropdown-bottom dropdown-end">
	<div tabindex="-1" role="button" class="btn btn-sm btn-ghost">
		{languageNames[currentLocale]?.shortName || currentLocale.toUpperCase()}
	</div>
	<ul
		tabindex="-1"
		class="dropdown-content menu bg-base-100 rounded-box border-base-300 z-50 w-52 border p-2 shadow-lg"
	>
		{#each locales as locale}
			<li>
				<div
					tabindex={currentLocale === locale ? 0 : -1}
					role="button"
					class="flex items-center justify-between {currentLocale === locale
						? 'active bg-primary text-primary-content'
						: ''}"
					onclick={() => setLocale(locale)}
					onkeydown={(e) => e.key === 'Enter' && setLocale(locale)}
					aria-label={`Switch to ${languageNames[locale]?.name || locale}`}
					title={`Switch to ${languageNames[locale]?.name || locale}`}
				>
					<span>{languageNames[locale]?.name || locale}</span>
					{#if currentLocale === locale}
						<span class="text-xs">✓</span>
					{/if}
				</div>
			</li>
		{/each}
	</ul>
</div>

<style>
</style>
