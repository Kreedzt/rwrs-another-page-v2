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

	// Handle column sort
	function handleColumnSort(column: string) {
		onSort?.(column);
	}

	// Get sticky class for column
	function getStickyClass(key: string): string {
		if (key === 'rowNumber') return 'sticky-row-number';
		if (key === 'username') return 'sticky-username';
		return '';
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
		<table class="table-pin-rows mb-0 table table-zebra border-0 bg-mil-primary">
			<thead>
				<tr class="bg-mil-secondary">
					{#each playerColumns as column (column.key)}
						{#if visibleColumns[column.key]}
							<th
								class="sticky top-0 z-10 h-12 border-mil px-4 py-2 align-middle text-mil-primary {getStickyClass(column.key)}"
							>
								{#if column.key === 'rowNumber' || column.key === 'rankName'}
									<!-- No sort button for rowNumber and rankName -->
									<span class="px-2 py-1">
										{#if column.i18n}<TranslatedText
												key={column.i18n}
											/>{:else}{column.label}{/if}
									</span>
								{:else}
									<button
										class="hover:bg-base-300 flex w-full items-center gap-2 rounded px-2 py-1 text-left transition-colors duration-200"
										onclick={() => handleColumnSort(column.key as string)}
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
						{/if}
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each data as item (item.id)}
					<tr class="hover hover:bg-base-300 min-h-12 border-b border-mil">
						{#each playerColumns as column (column.key)}
							{#if visibleColumns[column.key]}
								<td
									class="border-mil px-4 py-2 text-mil-primary {getStickyClass(column.key)} {column.alignment === 'center'
										? 'align-middle text-center'
										: column.alignment === 'right'
											? 'align-middle text-right'
											: 'align-middle'}"
								>
									{@html getDisplayValue(item, column, searchQuery)}
								</td>
							{/if}
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}

<style>
	/* Row number - sticky first column on left */
	:global(.sticky-row-number) {
		position: sticky;
		left: 0;
		z-index: 15;
		min-width: 4rem;
		width: 4rem;
		background: var(--color-bg-secondary);
		border-right: 1px solid var(--color-border);
	}

	/* Username - sticky second column on left */
	:global(.sticky-username) {
		position: sticky;
		left: 4rem;
		z-index: 15;
		min-width: 10rem;
		background: var(--color-bg-secondary);
		border-right: 1px solid var(--color-border);
	}

	/* Mobile responsive styles */
	@media (max-width: 768px) {
		:global(.sticky-row-number),
		:global(.sticky-username) {
			min-width: 3rem;
		}

		:global(.sticky-username) {
			left: 3rem;
		}
	}
</style>
