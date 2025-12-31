<script lang="ts">
	import TranslatedText from '$lib/components/TranslatedText.svelte';
	import { ArrowDown, Info } from '@lucide/svelte';
	import type { IPlayerItem, IPlayerColumn } from '$lib/models/player.model';

	interface Props {
		data: IPlayerItem[];
		playerColumns: IPlayerColumn[];
		visibleColumns: Record<string, boolean>;
		searchQuery: string;
		highlightedUsername?: string;
		sortColumn: string | null;
		onSort?: (column: string) => void;
	}

	let {
		data = [],
		playerColumns = [],
		visibleColumns = {},
		searchQuery = '',
		highlightedUsername,
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
		<Info class="h-6 w-6 shrink-0 stroke-current" />
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
								class="sticky top-0 z-10 h-12 border-mil px-1 py-1 align-middle text-mil-primary {getStickyClass(column.key)}"
								class:sticky-row-number-header={column.key === 'rowNumber'}
								class:sticky-username-header={column.key === 'username'}
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
										class="hover:bg-base-300 flex w-full items-center gap-2 rounded px-2 py-2 text-left transition-colors duration-200"
										onclick={() => handleColumnSort(column.key as string)}
										type="button"
										title="Click to sort"
									>
										<span class="flex-1">
											{#if column.i18n}<TranslatedText
													key={column.i18n}
												/>{:else}{column.label}{/if}
										</span>
										{#if sortColumn !== column.key}
											<ArrowDown class="w-4 h-4 opacity-30" />
										{:else}
											<ArrowDown class="w-4 h-4 text-primary" />
										{/if}
									</button>
								{/if}
							</th>
						{/if}
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each data as item (item.id)}
					{@const isHighlighted = highlightedUsername && item.username.toLowerCase() === highlightedUsername.toLowerCase()}
					<tr class="min-h-12 border-b border-mil {isHighlighted ? 'bg-accent text-accent-content font-semibold' : 'hover hover:bg-base-300'}">
						{#each playerColumns as column (column.key)}
							{#if visibleColumns[column.key]}
								<td
									class="border-mil px-4 py-2 {getStickyClass(column.key)} {isHighlighted ? 'text-accent-content' : 'text-mil-primary'} {column.alignment === 'center'
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
	/* Ensure table-pin-rows header has higher z-index than sticky column cells */
	:global(.table-pin-rows thead tr) {
		z-index: 25 !important;
	}

	/* Row number - sticky first column on left */
	:global(.sticky-row-number) {
		position: sticky;
		left: 0;
		z-index: 20;
		min-width: 4rem;
		width: 4rem;
		background: var(--color-bg-secondary);
		border-right: 1px solid var(--color-border);
	}

	:global(.sticky-row-number-header) {
		position: sticky;
		left: 0;
		z-index: 30 !important;
		min-width: 4rem;
		width: 4rem;
		background: var(--color-bg-secondary) !important;
		border-right: 1px solid var(--color-border);
	}

	/* Username - sticky second column on left */
	:global(.sticky-username) {
		position: sticky;
		left: 4rem;
		z-index: 20;
		min-width: 10rem;
		background: var(--color-bg-secondary);
		border-right: 1px solid var(--color-border);
	}

	:global(.sticky-username-header) {
		position: sticky;
		left: 4rem;
		z-index: 30 !important;
		min-width: 10rem;
		background: var(--color-bg-secondary) !important;
		border-right: 1px solid var(--color-border);
	}

	/* Highlighted row - override sticky column backgrounds */
	:global(tr.bg-accent .sticky-row-number),
	:global(tr.bg-accent .sticky-username) {
		background: hsl(var(--ac));
	}

	/* Mobile responsive styles */
	@media (max-width: 768px) {
		:global(.sticky-row-number),
		:global(.sticky-username),
		:global(.sticky-row-number-header),
		:global(.sticky-username-header) {
			min-width: 3rem;
		}

		:global(.sticky-username),
		:global(.sticky-username-header) {
			left: 3rem;
		}
	}
</style>
