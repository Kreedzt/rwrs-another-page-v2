<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import TranslatedText from '$lib/components/TranslatedText.svelte';

	let {
		columns = [],
		columnChange = () => {}
	}: {
		columns: Array<{
			key: string;
			label: string;
			visible: boolean;
		}>;
		columnChange: (columns: any[]) => void;
	} = $props();
</script>

<div class="dropdown dropdown-bottom dropdown-end">
	<div tabindex="-1" role="button" class="btn m-1">
		<TranslatedText key="app.columns.button" />
	</div>
	<ul tabindex="-1" class="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
		<li>TODO</li>
	</ul>
</div>

<style>
</style>
