<script lang="ts">
	import { fade } from 'svelte/transition';
	import { Check, Info, TriangleAlert, CircleX } from '@lucide/svelte';

	interface Props {
		message: string;
		type?: 'success' | 'info' | 'warning' | 'error';
		duration?: number;
	}

	let { message, type = 'success', duration = 2000 }: Props = $props();

	let visible = $state(true);

	// Auto-dismiss
	if (duration > 0) {
		setTimeout(() => {
			visible = false;
		}, duration);
	}

	// Icon component mapping
	const iconComponents = {
		success: Check,
		info: Info,
		warning: TriangleAlert,
		error: CircleX
	};

	const IconComponent = iconComponents[type];
</script>

{#if visible}
	<div transition:fade={{ duration: 300 }}>
		<div class="alert alert-{type} shadow-lg">
			<svelte:component this={IconComponent} class="h-5 w-5 shrink-0" />
			<span>{message}</span>
		</div>
	</div>
{/if}
