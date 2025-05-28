<script lang="ts">
	import TranslatedText from '$lib/components/TranslatedText.svelte';
	import { highlightMatch } from '@/lib/utils/highlight';
	import type { IDisplayServerItem } from '$lib/models/data-table.model';
	import type { IColumn } from '$lib/models/data-table.model';

	interface Props {
		data: IDisplayServerItem[];
		columns: IColumn[];
		visibleColumns: Record<string, boolean>;
		searchQuery: string;
		onRowAction: (event: { item: IDisplayServerItem; action: string }) => void;
	}

	let {
		data = [],
		columns = [],
		searchQuery = '',
		onRowAction = () => {},
		visibleColumns = {}
	}: Props = $props();

	// Variables to bind row elements for height synchronization
	let scrollableRows: Record<string, HTMLElement> = {};
	let fixedRows: Record<string, HTMLElement> = {};

	// Handle row action (like connect button click)
	function handleAction(item: IDisplayServerItem, action: string) {
		onRowAction({ item, action });
	}

	// Helper function to safely get a value from an object
	function getValue(item: IDisplayServerItem, column: any): string {
		if (column.key === 'action') {
			return '';
		}

		if (column.getValue) {
			return column.getValue(item);
		}

		return item[column.key] ?? '-';
	}

	// Helper function to check if a field should be highlighted
	function shouldHighlight(item: IDisplayServerItem, column: any): boolean {
		if (!searchQuery) return false;

		const query = searchQuery.toLowerCase();

		if (column.key === 'playerList') {
			return item.playerList.some((player: string) => player.toLowerCase().includes(query));
		}

		const value = item[column.key];
		if (!value) return false;

		if (typeof value === 'string') {
			return value.toLowerCase().includes(query);
		}

		return false;
	}

	// Helper function to render player list with badges
	function renderPlayerList(players: string[], query: string = ''): string {
		if (players.length === 0) return '-';

		if (query) {
			return `<div class="flex flex-wrap gap-1 items-start w-full">${players
				.map((player) => {
					const highlighted = highlightMatch(player, query);
					return `<span class="badge badge-neutral text-xs whitespace-nowrap flex-shrink-0">${highlighted}</span>`;
				})
				.join(' ')}</div>`;
		}

		return `<div class="flex flex-wrap gap-1 items-start w-full">${players.map((player) => `<span class="badge badge-neutral text-xs whitespace-nowrap flex-shrink-0">${player}</span>`).join(' ')}</div>`;
	}

	// Sync row heights between scrollable and fixed tables
	function syncRowHeights() {
		if (typeof window === 'undefined') return;

		// Reset heights first
		Object.values(scrollableRows).forEach(row => {
			if (row) row.style.height = 'auto';
		});
		Object.values(fixedRows).forEach(row => {
			if (row) row.style.height = 'auto';
		});

		// Get natural heights and apply the maximum to both
		data.forEach(item => {
			const scrollableRow = scrollableRows[item.id];
			const fixedRow = fixedRows[item.id];

			if (scrollableRow && fixedRow) {
				const scrollableHeight = scrollableRow.offsetHeight;
				const fixedHeight = fixedRow.offsetHeight;
				const maxHeight = Math.max(scrollableHeight, fixedHeight);

				scrollableRow.style.height = `${maxHeight}px`;
				fixedRow.style.height = `${maxHeight}px`;
			}
		});
	}

	// Sync heights after data changes
	$effect(() => {
		if (data.length > 0) {
			// Use setTimeout to ensure DOM is updated
			setTimeout(syncRowHeights, 0);
		}
	});

	// Also sync on window resize
	$effect(() => {
		if (typeof window === 'undefined') return;

		const handleResize = () => {
			setTimeout(syncRowHeights, 100);
		};

		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
		};
	});
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
		<span>No data found{searchQuery ? ' matching your search' : ''}.</span>
	</div>
{:else}
	<!-- Fixed table layout with scrollable content and fixed action column -->
	<div class="w-full">
		<div class="flex w-full border border-base-300 rounded-lg overflow-hidden">
			<!-- Scrollable table for all columns except action -->
			<div class="flex-1 overflow-x-auto min-w-0">
				<table class="table table-pin-rows mb-0 border-0">
					<thead>
						<tr>
							{#each columns as column (column.key)}
								{#if visibleColumns[column.key] && column.key !== 'action'}
									<th class="bg-base-200 h-12 px-4 py-2 align-middle sticky top-0 z-10 {column.key === 'playerList' ? 'w-96 min-w-96' : ''}">
										{#if column.i18n}<TranslatedText key={column.i18n} />{:else}{column.label}{/if}
									</th>
								{/if}
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each data as item (item.id)}
							<tr class="hover hover:bg-base-300 min-h-12" bind:this={scrollableRows[item.id]}>
								{#each columns as column (column.key)}
									{#if visibleColumns[column.key] && column.key !== 'action'}
										<td class="px-4 py-2 {column.key === 'playerList' ? 'align-top w-96 min-w-96' : 'align-middle'}">
											{#if column.key === 'url' && item.url}
												<a href={item.url} target="_blank" class="link link-primary inline-flex items-center min-h-6">
													{#if searchQuery && item.url
															.toLowerCase()
															.includes(searchQuery.toLowerCase())}
														{@html highlightMatch(item.url, searchQuery)}
													{:else}
														{item.url}
													{/if}
												</a>
											{:else if column.key === 'playerList'}
												<div class="w-full overflow-hidden">
													{@html renderPlayerList(
														item.playerList,
														shouldHighlight(item, column) ? searchQuery : ''
													)}
												</div>
											{:else if shouldHighlight(item, column)}
												{@html highlightMatch(getValue(item, column), searchQuery)}
											{:else}
												{getValue(item, column)}
											{/if}
										</td>
									{/if}
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<!-- Fixed action column -->
			{#if visibleColumns['action']}
				<div class="flex-shrink-0 w-32 border-l border-base-300">
					<table class="table table-pin-rows mb-0 border-0 w-32">
						<thead>
							<tr>
								<th class="bg-base-200 h-12 px-4 py-2 align-middle sticky top-0 z-10 text-center">
									{#each columns as column (column.key)}
										{#if column.key === 'action'}
											{#if column.i18n}<TranslatedText key={column.i18n} />{:else}{column.label}{/if}
										{/if}
									{/each}
								</th>
							</tr>
						</thead>
						<tbody>
							{#each data as item (item.id)}
								<tr class="hover hover:bg-base-300 min-h-12" bind:this={fixedRows[item.id]}>
									<td class="px-4 py-2 align-middle text-center">
										<button
											class="btn btn-sm btn-primary mobile-btn"
											onclick={() => handleAction(item, 'join')}
										>
											Join
										</button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	/* Player badge styling for proper display */
	:global(.badge) {
		white-space: nowrap;
		line-height: 1.2;
		min-height: 1.5rem;
		display: inline-flex;
		align-items: center;
		max-width: none;
	}

	/* Responsive adjustments for mobile */
	@media (max-width: 768px) {
		.w-32 {
			width: 6rem; /* Smaller width on mobile */
		}

		.w-96 {
			width: 20rem; /* Smaller player list width on mobile */
		}

		.min-w-96 {
			min-width: 20rem;
		}

		.mobile-btn {
			font-size: 0.75rem;
			padding: 0.25rem 0.5rem;
		}
	}
</style>
