<script lang="ts">
	import { onMount } from 'svelte';
	import { m } from '$lib/paraglide/messages.js';
	import { DataTableService } from '$lib/services/data-table';
	import { userSettingsService, type UserSettings } from '$lib/services/user-settings';
	import type { IColumn, IDisplayServerItem } from '$lib/models/data-table.model';
	import { columns } from '$lib/config/columns';
	// Import components
	import SearchInput from '$lib/components/SearchInput.svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import DataTable from '$lib/components/DataTable.svelte';
	import ColumnsToggle from '$lib/components/ColumnsToggle.svelte';
	import AutoRefresh from '$lib/components/AutoRefresh.svelte';
	import TranslatedText from '$lib/components/TranslatedText.svelte';

	// State variables
	let servers = $state<IDisplayServerItem[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let searchQuery = $state('');

	// User settings from localStorage
	const userSettings = $state<UserSettings>(userSettingsService.getSettings());

	// Auto refresh state (from user settings)
	let autoRefreshEnabled = $state(userSettings.autoRefresh.enabled);
	let refreshInterval = $state(userSettings.autoRefresh.interval);

	// Sort state
	let sortColumn = $state<string | null>(null);
	let sortDirection = $state<'asc' | 'desc' | null>(null); // null means no sort

	// Pagination state
	const itemsPerPage = 20;
	let currentPage = $state(1);

	// Visible columns (from user settings)
	let visibleColumns = $state<Record<string, boolean>>({ ...userSettings.visibleColumns });

	// Calculate statistics
	const calculateStats = (serverList: IDisplayServerItem[]) => {
		const totalServers = serverList.length;
		const totalPlayers = serverList.reduce((sum, server) => sum + server.currentPlayers, 0);
		return { totalServers, totalPlayers };
	};

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

		// Apply sorting to filtered servers
		const sortedFiltered = sortServers(filtered);

		// Calculate statistics
		const totalStats = calculateStats(servers);
		const filteredStats = calculateStats(sortedFiltered);

		const totalPages = Math.ceil(sortedFiltered.length / itemsPerPage);
		const paginatedServers = sortedFiltered.slice(
			(currentPage - 1) * itemsPerPage,
			currentPage * itemsPerPage
		);

		return {
			filteredServers: sortedFiltered,
			totalPages,
			paginatedServers,
			totalStats,
			filteredStats
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
		// Save to user settings
		userSettingsService.updateNested('visibleColumns', column.key, visible);
	}

	function handleAutoRefreshToggle(enabled: boolean) {
		autoRefreshEnabled = enabled;
		// Save to user settings
		userSettingsService.updateNested('autoRefresh', 'enabled', enabled);
	}

	function handleIntervalChange(interval: number) {
		refreshInterval = interval;
		// Save to user settings
		userSettingsService.updateNested('autoRefresh', 'interval', interval);
	}

	// Sort functions
	function handleSort(column: string) {
		// Define numeric columns
		const numericColumns = ['bots', 'playerCount', 'port', 'currentPlayers', 'maxPlayers'];
		const isNumeric = numericColumns.includes(column);

		if (sortColumn === column) {
			// Same column - cycle through sort directions
			if (sortDirection === 'desc') {
				sortDirection = 'asc'; // Second click - ascending
			} else if (sortDirection === 'asc') {
				sortColumn = null; // Third click - reset sort
				sortDirection = null;
			} else {
				sortDirection = 'desc'; // First click - descending
			}
		} else {
			// New column - start with descending
			sortColumn = column;
			sortDirection = 'desc';
		}

		// Reset to first page when sorting changes
		currentPage = 1;
	}

	function getSortIcon(column: string) {
		if (sortColumn !== column) {
			return `<svg class="w-4 h-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path></svg>`;
		}

		if (sortDirection === 'desc') {
			return `<svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>`;
		} else if (sortDirection === 'asc') {
			return `<svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>`;
		}

		return '';
	}

	// Sort the filtered servers
	function sortServers(serverList: IDisplayServerItem[]): IDisplayServerItem[] {
		if (!sortColumn || !sortDirection) {
			return serverList;
		}

		const numericColumns = ['bots', 'playerCount', 'port', 'currentPlayers', 'maxPlayers'];
		const isNumeric = numericColumns.includes(sortColumn);

		return [...serverList].sort((a, b) => {
			let aValue: any;
			let bValue: any;

			// Get values based on column
			switch (sortColumn) {
				case 'bots':
					aValue = a.bots;
					bValue = b.bots;
					break;
				case 'playerCount':
				case 'currentPlayers':
					aValue = a.currentPlayers;
					bValue = b.currentPlayers;
					break;
				case 'maxPlayers':
					aValue = a.maxPlayers;
					bValue = b.maxPlayers;
					break;
				case 'port':
					aValue = a.port;
					bValue = b.port;
					break;
				default:
					// String comparison for other columns
					aValue = (a as any)[sortColumn!] || '';
					bValue = (b as any)[sortColumn!] || '';
					break;
			}

			// Handle string comparison (case-insensitive)
			if (!isNumeric) {
				aValue = String(aValue).toLowerCase();
				bValue = String(bValue).toLowerCase();
			}

			// Sort based on direction
			if (sortDirection === 'desc') {
				return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
			} else {
				return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
			}
		});
	}

	async function refreshList() {
		try {
			loading = true;
			servers = await DataTableService.listAll();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load data';
			console.error('Error loading servers:', err);
		} finally {
			loading = false;
		}
	}

	// Load data
	onMount(async () => {
		await refreshList();
	});
</script>

<section aria-label="Server List" class="flex flex-col items-center justify-center">
	<div class="container px-4 py-8">
		<!-- Search component -->
		<div class="mb-4 flex items-center gap-4 flex-wrap">
			<div class="flex-1 min-w-64">
				<SearchInput
					placeholder={m['app.search.placeholder']()}
					value={searchQuery}
					search={handleSearch}
				/>
			</div>

			<div class="flex items-center gap-2">
				<button class="btn btn-neutral" onclick={refreshList}>
					<TranslatedText key="app.button.refresh" />
				</button>
				<ColumnsToggle {columns} {visibleColumns} {onColumnToggle} />
				<AutoRefresh
					enabled={autoRefreshEnabled}
					onRefresh={refreshList}
					onToggleChange={handleAutoRefreshToggle}
				/>
			</div>
		</div>

		<!-- Statistics display -->
		<div class="stats-container mb-4 flex items-center justify-between text-sm">
			<div class="flex items-center gap-4">
				<span class="font-medium">
					<span class="stats-number">{derivedData().filteredStats.totalServers}</span> / <span class="stats-number">{derivedData().totalStats.totalServers}</span> servers
				</span>
				<span class="font-medium">
					<span class="stats-number">{derivedData().filteredStats.totalPlayers}</span> / <span class="stats-number">{derivedData().totalStats.totalPlayers}</span> players
				</span>
			</div>
			{#if searchQuery && derivedData().filteredStats.totalServers < derivedData().totalStats.totalServers}
				<span class="filter-indicator text-xs text-base-content/60 italic">
					{m['app.stats.filteredBy']({ query: searchQuery })}
				</span>
			{/if}
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
					onSort={handleSort}
					sortColumn={sortColumn}
					sortDirection={sortDirection}
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

	/* Enhanced badge styles for mode and map columns */
	:global(.badge.text-blue-600) {
		background-color: white !important;
		border: 1px solid rgb(147 197 253) !important; /* border-blue-300 */
		color: rgb(37 99 235) !important; /* text-blue-600 */
	}

	:global(.badge.text-green-600) {
		background-color: white !important;
		border: 1px solid rgb(134 239 172) !important; /* border-green-300 */
		color: rgb(22 163 74) !important; /* text-green-600 */
	}

	/* Highlight text within badges */
	:global(.badge mark) {
		background-color: hsl(var(--wa) / 0.3) !important;
		color: inherit !important;
		padding: 0 2px !important;
		border-radius: 2px !important;
	}

	/* Statistics display styling */
	.stats-container {
		background: linear-gradient(135deg, hsl(var(--b1) / 0.5) 0%, hsl(var(--b2) / 0.3) 100%);
		border: 1px solid hsl(var(--bc) / 0.1);
		border-radius: 0.5rem;
		padding: 0.75rem 1rem;
		box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
		backdrop-filter: blur(8px);
	}

	/* Stats number highlighting */
	.stats-number {
		font-weight: 600;
		color: hsl(var(--bc));
	}

	/* Filter indicator styling */
	.filter-indicator {
		background: hsl(var(--wa) / 0.1);
		border: 1px solid hsl(var(--wa) / 0.2);
		border-radius: 0.25rem;
		padding: 0.25rem 0.5rem;
	}
</style>
