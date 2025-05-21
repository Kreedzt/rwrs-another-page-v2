<script lang="ts">
	import TranslatedText from '$lib/components/TranslatedText.svelte';
	import { Check } from '@lucide/svelte';
	import type { IColumn } from '$lib/models/data-table.model';

	let {
		columns = [],
		onColumnToggle = () => {},
		visibleColumns = {}
	}: {
		columns: IColumn[];
		visibleColumns: Record<string, boolean>;
		onColumnToggle: (column: IColumn, visible: boolean) => void;
	} = $props();
</script>

<div class="dropdown dropdown-bottom dropdown-end">
	<div tabindex="-1" role="button" class="btn m-1">
		<TranslatedText key="app.columns.button" />
	</div>
	<ul tabindex="-1" class="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
		{#each columns as column (column.key)}
			<li
				onclick={() => {
					onColumnToggle(column, !visibleColumns[column.key]);
				}}
			>
				<a href="#">
					{#if visibleColumns[column.key]}
						<Check />
					{/if}
					{#if column.i18n}<TranslatedText key={column.i18n} />{:else}{column.label}{/if}
				</a>
			</li>
		{/each}
	</ul>
</div>

<style>
</style>
