<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';

	// Props
	export let key: string;
	export let params: Record<string, any> = {};
	export let tag: keyof HTMLElementTagNameMap = 'span';
	export let className = '';
	
	// Determine if the key exists in the messages
	$: hasKey = key in m;
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
