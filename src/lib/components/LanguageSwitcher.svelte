<script lang="ts">
	import { setLocale, getLocale, locales } from '$lib/paraglide/runtime';

	// Props
	let {
		buttonClass = 'px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600',
		activeClass = 'bg-blue-700',
		containerClass = 'flex gap-2',
		showLabel = true,
		compact = false
	} = $props<{
		buttonClass?: string;
		activeClass?: string;
		containerClass?: string;
		showLabel?: boolean;
		compact?: boolean;
	}>();

	// Language display names
	const languageNames: Record<string, { name: string; shortName: string }> = {
		'en-us': { name: 'English', shortName: 'EN' },
		'zh-cn': { name: '中文', shortName: 'CN' }
	};

	// Get current locale
	const currentLocale = $derived(getLocale());
</script>

<div class={containerClass}>
	{#each locales as locale}
		<button
			class={buttonClass}
			class:active={currentLocale === locale}
			class:compact
			class:{activeClass}={currentLocale === locale}
			onclick={() => setLocale(locale)}
			aria-label={`Switch to ${languageNames[locale]?.name || locale}`}
			title={`Switch to ${languageNames[locale]?.name || locale}`}
		>
			{#if showLabel}
				{compact
					? languageNames[locale]?.shortName || locale
					: languageNames[locale]?.name || locale}
			{:else}
				{locale}
			{/if}
		</button>
	{/each}
</div>

<style>
	button.compact {
		padding: 0.25rem 0.5rem;
		font-size: 0.875rem;
	}
</style>
