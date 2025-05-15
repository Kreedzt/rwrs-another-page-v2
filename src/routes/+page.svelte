<script lang="ts">
	import { onMount } from 'svelte';
	import { DataTableService } from '$lib/services/data-table';
	import type { IDisplayServerItem } from '$lib/models/data-table.model';

	// Import components
	import SearchInput from '@/lib/components/SearchInput.svelte';
	import Pagination from '@/lib/components/Pagination.svelte';
	import DataTable from '@/lib/components/DataTable.svelte';
	import { highlightMatch } from '@/lib/utils/highlight';

	// State variables
	let servers = $state<IDisplayServerItem[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let searchQuery = $state('');

	// Pagination state
	const itemsPerPage = 20;
	let currentPage = $state(1);

	// Column definitions
	const columns = [
		{ key: 'name', label: 'Name' },
		{ key: 'ipAddress', label: 'IP Address' },
		{ key: 'port', label: 'Port' },
		{ key: 'bots', label: 'Bots' },
		{ key: 'country', label: 'Country' },
		{ key: 'mode', label: 'Mode' },
		{
			key: 'mapId',
			label: 'Map',
			getValue: (server: IDisplayServerItem) => {
				return server.mapId.split('/').pop() || '';
			}
		},
		{
			key: 'playerCount',
			label: 'Players',
			getValue: (server: IDisplayServerItem) => `${server.currentPlayers}/${server.maxPlayers}`
		},
		{
			key: 'playerList',
			label: 'Player List',
			getValue: (server: IDisplayServerItem) => {
				if (server.playerList.length === 0) return '';
				return `<div class="flex flex-wrap gap-1 text-xs">${server.playerList
					.map((player) => `<span class="badge badge-neutral">${player}</span>`)
					.join(' ')}</div>`;
			}
		},
		{ key: 'comment', label: 'Comment' },
		{
			key: 'dedicated',
			label: 'Dedicated',
			getValue: (server: IDisplayServerItem) => (server.dedicated ? 'Yes' : 'No')
		},
		{
			key: 'mod',
			label: 'Mod',
			getValue: (server: IDisplayServerItem) => (server.mod ? 'Yes' : 'No')
		},
		{ key: 'url', label: 'URL' },
		{ key: 'version', label: 'Version' },
		{ key: 'action', label: 'Action', getValue: () => '' }
	];

	// Derived values
	const filteredServers = $derived(
		searchQuery
			? servers.filter((server) => {
					const query = searchQuery.toLowerCase();
					console.log('Filtering servers for query:', query, server);
					return (
						server.name.toLowerCase().includes(query) ||
						server.ipAddress.toLowerCase().includes(query) ||
						server.port.toString().includes(query) ||
						server.country.toLowerCase().includes(query) ||
						server.mode.toLowerCase().includes(query) ||
						server.mapId.toLowerCase().includes(query) ||
						(server.comment && server.comment.toLowerCase().includes(query)) ||
						server.playerList.some((player: string) => player.toLowerCase().includes(query))
					);
				})
			: servers
	);

	const totalPages = $derived(Math.ceil(filteredServers.length / itemsPerPage));

	const paginatedServers = $derived(
		filteredServers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
	);

	// Reset to first page when search query changes
	$effect(() => {
		if (searchQuery) {
			currentPage = 1;
		}
	});

	// Event handlers
	function handleSearch(query: string) {
		searchQuery = query;
	}

	function handlePageChange(page: number) {
		console.log('Page change event received:', page, 'Current page before update:', currentPage);

		// Update the current page directly
		currentPage = page;
		console.log('Current page after update:', currentPage);
	}

	function handleRowAction(event: { item: IDisplayServerItem; action: string }) {
		if (event.action === 'join') {
			handleJoin(event.item);
		}
	}

	// No unused type definitions

	function handleJoin(server: IDisplayServerItem) {
		// This would be implemented to handle connection to the server
		alert(`Join to ${server.name} at ${server.ipAddress}:${server.port}`);
	}

	// Load data
	onMount(async () => {
		try {
			loading = true;
			servers = await DataTableService.listAll();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load data';
			console.error('Error loading servers:', err);
		} finally {
			loading = false;
		}
	});
</script>

<section aria-label="Server List">
	<!-- Use a fixed min-height container to prevent layout shifts -->
	<div class="container mx-auto px-4 py-8 min-h-[600px]">
		<!-- Search component -->
		<div class="mb-4">
			<SearchInput
				placeholder="Search servers, maps, players, mode, country, etc..."
				value={searchQuery}
				search={handleSearch}
				clear={() => handleSearch('')}
			/>
		</div>

		<!-- Content area with consistent height -->
		<div class="content-area min-h-[500px]">
			{#if loading}
				<!-- Loading state with skeleton UI that matches table structure -->
				<div class="skeleton-container">
					<div class="overflow-x-auto">
						<table class="table w-full">
							<thead>
								<tr>
									{#each columns as column}
										<th>{column.label}</th>
									{/each}
								</tr>
							</thead>
							<tbody>
								{#each Array(5) as _}
									<tr>
										{#each Array(columns.length) as _}
											<td>
												<div class="skeleton h-4 w-full"></div>
											</td>
										{/each}
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
					<!-- Skeleton pagination -->
					<div class="mt-4 flex items-center justify-center">
						<div class="skeleton h-10 w-64"></div>
					</div>
				</div>
			{:else if error}
				<div class="alert alert-error">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6 shrink-0 stroke-current"
						fill="none"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<span>{error}</span>
				</div>
			{:else}
				<!-- Data table component -->
				<DataTable data={paginatedServers} {columns} {searchQuery} rowAction={handleRowAction} />

				<!-- Pagination component -->
				<Pagination
					{currentPage}
					{totalPages}
					totalItems={filteredServers.length}
					pageChange={handlePageChange}
				/>
			{/if}
		</div>
	</div>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	/* Ensure consistent layout to prevent CLS */
	.content-area {
		display: flex;
		flex-direction: column;
		width: 100%;
	}

	/* Style for skeleton loading state */
	.skeleton-container {
		width: 100%;
	}

	/* Ensure the skeleton has consistent dimensions */
	.skeleton {
		background-color: hsl(var(--b3, var(--b2)) / var(--tw-bg-opacity, 1));
		border-radius: 0.25rem;
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}

	@keyframes pulse {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}
</style>
