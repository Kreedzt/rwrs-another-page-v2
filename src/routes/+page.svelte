<script lang="ts">
	import { onMount } from 'svelte';
	import { m } from '$lib/paraglide/messages.js';
	import { DataTableService } from '$lib/services/data-table';
	import type { IColumn, IDisplayServerItem } from '$lib/models/data-table.model';

	// Import components
	import SearchInput from '@/lib/components/SearchInput.svelte';
	import Pagination from '@/lib/components/Pagination.svelte';
	import DataTable from '@/lib/components/DataTable.svelte';
	import ColumnsToggle from '$lib/components/ColumnsToggle.svelte';

	// State variables
	let servers = $state<IDisplayServerItem[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let searchQuery = $state('');

	// Pagination state
	const itemsPerPage = 20;
	let currentPage = $state(1);

	// Column definitions
	const columns: IColumn[] = [
		{ key: 'name', label: 'Name', i18n: 'app.column.name' },
		{ key: 'ipAddress', label: 'IP Address', i18n: 'app.column.ip' },
		{ key: 'port', label: 'Port', i18n: 'app.column.port' },
		{ key: 'bots', label: 'Bots', i18n: 'app.column.bots' },
		{ key: 'country', label: 'Country', i18n: 'app.column.country' },
		{ key: 'mode', label: 'Mode', i18n: 'app.column.mode' },
		{
			key: 'mapId',
			label: 'Map',
			i18n: 'app.column.map',
			getValue: (server: IDisplayServerItem) => {
				return server.mapId.split('/').pop() || '';
			}
		},
		{
			key: 'playerCount',
			label: 'Players',
			i18n: 'app.column.capacity',
			getValue: (server: IDisplayServerItem) => `${server.currentPlayers}/${server.maxPlayers}`
		},
		{
			key: 'playerList',
			label: 'Player List',
			i18n: 'app.column.players',
			getValue: (server: IDisplayServerItem) => {
				if (server.playerList.length === 0) return '';
				return `<div class="flex flex-wrap gap-1 text-xs">${server.playerList
					.map((player) => `<span class="badge badge-neutral">${player}</span>`)
					.join(' ')}</div>`;
			}
		},
		{ key: 'comment', label: 'Comment', i18n: 'app.column.comment' },
		{
			key: 'dedicated',
			label: 'Dedicated',
			i18n: 'app.column.dedicated',
			getValue: (server: IDisplayServerItem) => (server.dedicated ? 'Yes' : 'No')
		},
		{
			key: 'mod',
			label: 'Mod',
			i18n: 'app.column.mod',
			getValue: (server: IDisplayServerItem) => (server.mod ? 'Yes' : 'No')
		},
		{ key: 'url', label: 'URL', i18n: 'app.column.url' },
		{ key: 'version', label: 'Version', i18n: 'app.column.version' },
		{ key: 'action', label: 'Action', i18n: 'app.column.action' }
	];
	let visibleColumns = $state<Record<string, boolean>>({
		name: true,
		ipAddress: true,
		port: true,
		bots: true,
		country: true,
		mode: true,
		mapId: true,
		playerCount: true,
		playerList: true,
		comment: true,
		dedicated: true,
		mod: true,
		url: true,
		version: true,
		action: true
	});

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

	function onRowAction(event: { item: IDisplayServerItem; action: string }) {
		console.log('Row action event received:', event);
		if (event.action === 'join') {
			handleJoin(event.item);
		}
	}

	function handleJoin(server: IDisplayServerItem) {
		console.log(`Join to ${server.name} at ${server.ipAddress}:${server.port}`);
		const url = `steam://rungameid/270150//server_address=${server.ipAddress} server_port=${server.port}`;
		window.open(url, '_blank');
	}

	function onColumnToggle(column: IColumn, visible: boolean) {
		visibleColumns[column.key] = visible;
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
	<div class="container mx-auto min-h-[600px] px-4 py-8">
		<!-- Search component -->
		<div class="mb-4 flex">
			<SearchInput
				placeholder={m['app.search.placeholder']()}
				value={searchQuery}
				search={handleSearch}
			/>

			<div class="flex">
				<ColumnsToggle {columns} {visibleColumns} {onColumnToggle} />
			</div>
		</div>

		<!-- Content area with consistent height -->
		<div class="content-area min-h-[500px]">
			{#if loading}
				<!-- Loading state with skeleton UI that matches table structure -->
				<div class="skeleton-container" role="status" aria-label="Loading server data">
					<div class="overflow-x-auto">
						<table class="table w-full">
							<thead>
								<tr>
									{#each columns as column (column.key)}
										{#if visibleColumns[column.key]}
											<th>{column.label}</th>
										{/if}
									{/each}
								</tr>
							</thead>
							<tbody>
								{#each Array(5).map((_, i) => i + 1) as _}
									<tr>
										{#each columns as column (column.key)}
											{#if visibleColumns[column.key]}
												<td>
													<div class="skeleton h-4 w-full"></div>
												</td>
											{/if}
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
				<DataTable data={paginatedServers} {columns} {searchQuery} {onRowAction} {visibleColumns} />

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
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}
</style>
