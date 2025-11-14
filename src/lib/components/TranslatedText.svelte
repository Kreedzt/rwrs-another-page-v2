<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';

	let {
		key,
		params = {},
		tag = 'span',
		className = ''
	} = $props<{
		key: string;
		params?: Record<string, any>;
		tag?: keyof HTMLElementTagNameMap;
		className?: string;
	}>();

	const hasKey = $derived(key in m);
</script>

{#if hasKey}
	<svelte:element this={tag} class={className}>
		{@html m[key](params)}
	</svelte:element>
{:else}
	<svelte:element this={tag} class={`${className} text-red-500`} title="Missing translation key">
		{key}
	</svelte:element>
{/if}
