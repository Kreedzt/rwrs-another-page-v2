<script lang="ts">
	import { onMount } from 'svelte';
	import { m } from '$lib/paraglide/messages.js';
	import { DataTableService } from '$lib/services/data-table';
	import type { IColumn, IDisplayServerItem } from '$lib/models/data-table.model';
	import { columns } from '$lib/config/columns';
	import { highlightMatch, renderPlayerListWithHighlight } from '$lib/utils/highlight';

	// Import components
	import SearchInput from '$lib/components/SearchInput.svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import DataTable from '$lib/components/DataTable.svelte';
	import ColumnsToggle from '$lib/components/ColumnsToggle.svelte';

	// State variables
	let servers = $state<IDisplayServerItem[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let searchQuery = $state('');

	// Pagination state
	const itemsPerPage = 20;
	let currentPage = $state(1);

	let visibleColumns = $state<Record<string, boolean>>({
		name: true,
		ipAddress: false,
		port: false,
		bots: false,
		country: false,
		mode: false,
		mapId: true,
		playerCount: true,
		playerList: true,
		comment: false,
		dedicated: false,
		mod: false,
		url: false,
		version: false,
		action: true
	});

	// Derived values
	const derivedData = $derived(() => {
		const filtered = searchQuery
			? servers.filter((server) => {
					const query = searchQuery.toLowerCase();
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
			: servers;

		const totalPages = Math.ceil(filtered.length / itemsPerPage);
		const paginatedServers = filtered.slice(
			(currentPage - 1) * itemsPerPage,
			currentPage * itemsPerPage
		);

		return {
			filteredServers: filtered,
			totalPages,
			paginatedServers
		};
	});

	// Event handlers
	function handleSearch(query: string) {
		searchQuery = query;
		currentPage = 1;
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

<section aria-label="Server List" class="flex flex-col items-center justify-center">
	<div class="container px-4 py-8">
		<!-- Search component -->
		<div class="mb-4 flex items-center gap-4">
			<SearchInput
				placeholder={m['app.search.placeholder']()}
				value={searchQuery}
				search={handleSearch}
			/>

			<ColumnsToggle {columns} {visibleColumns} {onColumnToggle} />
		</div>

		<!-- Content area with consistent height -->
		<div class="flex w-full flex-col overflow-x-auto">
			{#if loading}
				<!-- Loading state with skeleton UI that matches table structure -->
				<div
					class="skeleton-container w-full rounded-sm"
					role="status"
					aria-label="Loading server data"
				>
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
				<DataTable
					data={derivedData().paginatedServers}
					{columns}
					{searchQuery}
					{onRowAction}
					{visibleColumns}
				/>

				<!-- Pagination component -->
				<Pagination
					{currentPage}
					totalPages={derivedData().totalPages}
					totalItems={derivedData().filteredServers.length}
					pageChange={handlePageChange}
				/>
			{/if}
		</div>
	</div>
</section>

<style>
	/* Ensure the skeleton has consistent dimensions */
	.skeleton {
		background-color: hsl(var(--b3, var(--b2)) / var(--tw-bg-opacity, 1));
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
