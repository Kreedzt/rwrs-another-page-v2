<script lang="ts">
	import { highlightMatch } from '@/lib/utils/highlight';
	import type { IDisplayServerItem } from '@/models/data-table.model';

	interface Props {
		data: IDisplayServerItem[];
		columns: any[];
		searchQuery: string;
		rowAction: (event: { item: IDisplayServerItem; action: string }) => void;
	}

	let { data = [], columns = [], searchQuery = '', rowAction = () => {} }: Props = $props();

	// Handle row action (like connect button click)
	function handleAction(item: IDisplayServerItem, action: string) {
		rowAction({ item, action });
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
			return `<div class="flex flex-wrap gap-1">${players
				.map((player) => {
					const highlighted = highlightMatch(player, query);
					return `<span class="badge badge-neutral gap-0">${highlighted}</span>`;
				})
				.join(' ')}</div>`;
		}

		return `<div class="flex flex-wrap gap-1 text-xs">${players.map((player) => `<span class="badge badge-neutral gap-0">${player}</span>`).join(' ')}</div>`;
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
		<span>No data found{searchQuery ? ' matching your search' : ''}.</span>
	</div>
{:else}
	<div class="overflow-x-auto">
		<table class="table">
			<thead>
				<tr>
					{#each columns as column}
						<th>{column.label}</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each data as item}
					<tr class="hover hover:bg-base-300">
						{#each columns as column}
							<td>
								{#if column.key === 'action'}
									<button class="btn btn-sm btn-primary" onclick={() => handleAction(item, 'join')}>
										Join
									</button>
								{:else if column.key === 'url' && item.url}
									<a href={item.url} target="_blank" class="link link-primary">
										{#if searchQuery && item.url.toLowerCase().includes(searchQuery.toLowerCase())}
											{@html highlightMatch(item.url, searchQuery)}
										{:else}
											{item.url}
										{/if}
									</a>
								{:else if column.key === 'playerList'}
									{@html renderPlayerList(
										item.playerList,
										shouldHighlight(item, column) ? searchQuery : ''
									)}
								{:else if shouldHighlight(item, column)}
									{@html highlightMatch(getValue(item, column), searchQuery)}
								{:else}
									{getValue(item, column)}
								{/if}
							</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}
