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
	<div tabindex="-1" role="button" class="btn btn-outline flex-shrink-0">
		<TranslatedText key="app.columns.button" />
	</div>
	<ul
		tabindex="-1"
		class="dropdown-content menu bg-base-100 rounded-box border-base-300 z-50 w-52 border p-2 shadow-lg"
	>
		{#each columns as column (column.key)}
			<li>
				<button
					type="button"
					class="hover:bg-base-200 flex w-full items-center justify-between rounded p-2 text-left"
					onclick={() => {
						onColumnToggle(column, !visibleColumns[column.key]);
					}}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							onColumnToggle(column, !visibleColumns[column.key]);
						}
					}}
				>
					<span>
						{#if column.i18n}<TranslatedText key={column.i18n} />{:else}{column.label}{/if}
					</span>
					{#if visibleColumns[column.key]}
						<Check class="h-4 w-4" />
					{/if}
				</button>
			</li>
		{/each}
	</ul>
</div>

<style>
</style>
