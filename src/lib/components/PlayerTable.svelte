<script lang="ts">
	import TranslatedText from '$lib/components/TranslatedText.svelte';
	import type { IPlayerItem, IPlayerColumn } from '$lib/models/player.model';

	interface Props {
		data: IPlayerItem[];
		playerColumns: IPlayerColumn[];
		visibleColumns: Record<string, boolean>;
		searchQuery: string;
		sortColumn: string | null;
		onSort?: (column: string) => void;
	}

	let {
		data = [],
		playerColumns = [],
		visibleColumns = {},
		searchQuery = '',
		sortColumn = null,
		onSort = () => {}
	}: Props = $props();

	// Filter columns based on visibility
	const visiblePlayerColumns = $derived(
		playerColumns.filter((col) => visibleColumns[col.key as string] !== false)
	);

	// Helper function to get the display value for a column
	function getDisplayValue(
		item: IPlayerItem,
		column: IPlayerColumn,
		searchQuery?: string
	): string {
		// If there's a search query and the column supports highlighting, use that
		if (searchQuery && column.getValueWithHighlight) {
			return column.getValueWithHighlight(item, searchQuery);
		}

		// Otherwise use the regular getValue or fallback to the raw value
		if (column.getValue) {
			return column.getValue(item);
		}

		return (item as any)[column.key] ?? '-';
	}

	// Get sort icon for column (players only has descending sort)
	function getSortIcon(column: string): string {
		if (sortColumn !== column) {
			return `<svg class="w-4 h-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>`;
		}

		// Always show descending icon for sorted column
		return `<svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>`;
	}
</script>

{#if data.length === 0}
	<div class="alert alert-info">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			class="h-6 w-6 shrink-0 stroke-current"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
			></path>
		</svg>
		<span>
			<TranslatedText key="app.player.noPlayersFound" />
			{#if searchQuery}
				<TranslatedText key="app.player.matchingSearch" />
			{/if}.
		</span>
	</div>
{:else}
	<div class="w-full">
		<table class="table-pin-rows mb-0 table table-zebra border-0">
			<thead>
				<tr>
					{#each visiblePlayerColumns as column (column.key)}
						<th
							class="bg-base-200 sticky top-0 z-10 h-12 px-4 py-2 align-middle"
						>
							{#if column.key === 'rowNumber'}
								<!-- No sort button for rowNumber -->
								<span class="px-2 py-1">
									{#if column.i18n}<TranslatedText
											key={column.i18n}
										/>{:else}{column.label}{/if}
								</span>
							{:else}
								<button
									class="hover:bg-base-300 flex w-full items-center gap-2 rounded px-2 py-1 text-left transition-colors duration-200"
									onclick={() => onSort(column.key as string)}
									type="button"
									title="Click to sort"
								>
									<span class="flex-1">
										{#if column.i18n}<TranslatedText
												key={column.i18n}
											/>{:else}{column.label}{/if}
									</span>
									{@html getSortIcon(column.key as string)}
								</button>
							{/if}
						</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each data as item (item.id)}
					<tr class="hover hover:bg-base-300 min-h-12">
						{#each visiblePlayerColumns as column (column.key)}
							<td
								class="px-4 py-2 {column.alignment === 'center'
									? 'align-middle text-center'
									: column.alignment === 'right'
										? 'align-middle text-right'
										: 'align-middle'}"
							>
								{@html getDisplayValue(item, column, searchQuery)}
							</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}
