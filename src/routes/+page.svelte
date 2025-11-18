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
	import MobileDataTable from '$lib/components/MobileDataTable.svelte';
	import ColumnsToggle from '$lib/components/ColumnsToggle.svelte';
	import AutoRefresh from '$lib/components/AutoRefresh.svelte';
	import QuickFilterButtons from '$lib/components/QuickFilterButtons.svelte';
	import GlobalKeyboardSearch from '$lib/components/GlobalKeyboardSearch.svelte';
	import MobileInfiniteScroll from '$lib/components/MobileInfiniteScroll.svelte';
	import { filters as quickFilters } from '$lib/utils/quick-filters';
	import TranslatedText from '$lib/components/TranslatedText.svelte';
	import {
		getUrlState,
		updateUrlState,
		createUrlStateSubscriber,
		type UrlState
	} from '$lib/utils/url-state';

	// State variables
	let servers = $state<IDisplayServerItem[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let searchQuery = $state('');
	let searchInputRef = $state<HTMLInputElement | null>(null);

	// User settings from localStorage
	const userSettings = $state<UserSettings>(userSettingsService.getSettings());

	// Auto refresh state (from user settings)
	let autoRefreshEnabled = $state(userSettings.autoRefresh.enabled);

	// Sort state
	let sortColumn = $state<string | null>(null);
	let sortDirection = $state<'asc' | 'desc' | null>(null); // null means no sort

	// Pagination state
	const itemsPerPage = 20;
	let currentPage = $state(1);

	// Mobile infinite scroll state
	let mobileCurrentPage = $state(1);
	let mobileLoadingMore = $state(false);

	// Visible columns (from user settings)
	let visibleColumns = $state<Record<string, boolean>>({ ...userSettings.visibleColumns });

	// Quick filter state
	let activeQuickFilters = $state<string[]>([]);
	let isMultiSelectFilter = $state(false);

	// Mobile expanded cards state
	let mobileExpandedCards = $state<Record<string, boolean>>({});

	// Calculate statistics
	const calculateStats = (serverList: IDisplayServerItem[]) => {
		const totalServers = serverList.length;
		const totalPlayers = serverList.reduce((sum, server) => sum + server.currentPlayers, 0);
		return { totalServers, totalPlayers };
	};

	// Derived values
	const derivedData = $derived(() => {
		let filtered = searchQuery
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

		// Apply quick filters if any are active
		if (activeQuickFilters.length > 0) {
			filtered = filtered.filter((server) => {
				return activeQuickFilters.some((filterId) => {
					const filter = quickFilters.find((f) => f.id === filterId);
					return filter ? filter.filter(server) : false;
				});
			});
		}

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

		// Mobile infinite scroll - accumulate all filtered servers
		const mobilePaginatedServers = sortedFiltered.slice(0, mobileCurrentPage * itemsPerPage);
		const mobileHasMore = mobilePaginatedServers.length < sortedFiltered.length;

		return {
			filteredServers: sortedFiltered,
			totalPages,
			paginatedServers,
			totalStats,
			filteredStats,
			mobilePaginatedServers,
			mobileHasMore
		};
	});

	// Handle search query changes for pagination reset only
	$effect(() => {
		// Reset pages when search changes
		currentPage = 1;
		mobileCurrentPage = 1;
	});

	function handleSearchInput(value: string) {
		// Update URL in real-time using History API (no focus loss)
		// Always update URL to ensure it reflects current input state
		updateUrlState(
			{
				search: value.trim() || undefined
			},
			true
		);
	}

	function handleGlobalSearch(query: string) {
		// Handle search from global keyboard input
		searchQuery = query;
		handleSearchInput(query);
	}

	function handlePageChange(page: number) {
		console.log('Page change event received:', page, 'Current page before update:', currentPage);

		// Update the current page directly
		currentPage = page;
		console.log('Current page after update:', currentPage);
	}

	// Mobile infinite scroll load more handler
	function handleLoadMore() {
		if (!mobileLoadingMore) {
			mobileLoadingMore = true;
			mobileCurrentPage++;
			// Simulate loading delay for better UX
			setTimeout(() => {
				mobileLoadingMore = false;
			}, 500);
		}
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

	// Quick filter functions
	function handleQuickFilter(filterId: string) {
		if (isMultiSelectFilter) {
			// Multi-select mode: toggle filter
			if (activeQuickFilters.includes(filterId)) {
				activeQuickFilters = activeQuickFilters.filter((id) => id !== filterId);
			} else {
				activeQuickFilters = [...activeQuickFilters, filterId];
			}
		} else {
			// Single-select mode: replace filter
			activeQuickFilters = activeQuickFilters.includes(filterId) ? [] : [filterId];
		}
		currentPage = 1; // Reset to first page when filter changes
		mobileCurrentPage = 1; // Reset mobile infinite scroll when filter changes

		// Update URL
		updateUrlState(
			{
				quickFilters: activeQuickFilters.length > 0 ? activeQuickFilters : []
			},
			true
		);
	}

	function handleMultiSelectChange(checked: boolean) {
		isMultiSelectFilter = checked;
		if (!checked && activeQuickFilters.length > 1) {
			// If switching to single-select mode, keep only the first active filter
			activeQuickFilters = activeQuickFilters.slice(0, 1);
		}
	}

	// Sort functions
	function handleSort(column: string) {
		// Define numeric columns
		const numericColumns = ['bots', 'playerCount', 'port', 'currentPlayers', 'maxPlayers'];

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
		mobileCurrentPage = 1; // Reset mobile infinite scroll when sorting changes

		// Update URL
		updateUrlState(
			{
				sortColumn: sortColumn || undefined,
				sortDirection: sortDirection || undefined
			},
			true
		);
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

	// Mobile card toggle function
	function toggleMobileCard(serverId: string) {
		mobileExpandedCards[serverId] = !mobileExpandedCards[serverId];
	}

	// Helper function to get the display value for a column
	function getDisplayValue(
		item: IDisplayServerItem,
		column: IColumn,
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

	// Get sort icon for column
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

	async function refreshList() {
		try {
			loading = true;
			servers = await DataTableService.listAll();
			// Reset mobile infinite scroll when data refreshes
			mobileCurrentPage = 1;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load data';
			console.error('Error loading servers:', err);
		} finally {
			loading = false;
		}
	}

	// Initialize state from URL on page load
	function initializeFromUrl() {
		const urlState = getUrlState();

		// Set search query from URL
		if (urlState.search !== undefined) {
			searchQuery = urlState.search;
		}

		// Set quick filters from URL
		if (urlState.quickFilters && urlState.quickFilters.length > 0) {
			// Validate that all filter IDs exist
			const validFilters = urlState.quickFilters.filter((filterId) =>
				quickFilters.some((filter) => filter.id === filterId)
			);
			activeQuickFilters = validFilters;
		}

		// Set sorting from URL
		if (urlState.sortColumn && urlState.sortDirection) {
			sortColumn = urlState.sortColumn;
			sortDirection = urlState.sortDirection;
		}
	}

	// Load data
	onMount(async () => {
		// Initialize state from URL before loading data
		initializeFromUrl();
		await refreshList();

		// Subscribe to URL changes
		const unsubscribe = createUrlStateSubscriber((urlState: UrlState) => {
			// Update local state when URL changes (e.g., browser back/forward)
			// Only update if different to avoid infinite loops
			if (urlState.search !== undefined && searchQuery !== (urlState.search || '')) {
				searchQuery = urlState.search || '';
			}

			if (urlState.quickFilters !== undefined) {
				const validFilters = urlState.quickFilters.filter((filterId) =>
					quickFilters.some((filter) => filter.id === filterId)
				);
				if (JSON.stringify(activeQuickFilters) !== JSON.stringify(validFilters)) {
					activeQuickFilters = validFilters;
				}
			}

			if (urlState.sortColumn !== undefined && sortColumn !== (urlState.sortColumn || '')) {
				sortColumn = urlState.sortColumn;
				sortDirection = urlState.sortDirection || null;
			}
		});

		// Cleanup function
		return () => {
			unsubscribe?.();
		};
	});
</script>

<section aria-label="Server List" class="flex flex-col items-center justify-center">
	<div class="container px-4 py-8">
		<!-- Search component -->
		<div class="mb-4 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
			<div class="min-w-64 flex-1">
				<SearchInput
					placeholder={m['app.search.placeholder']()}
					bind:value={searchQuery}
					oninput={handleSearchInput}
					onRef={(input) => (searchInputRef = input)}
				/>
			</div>

			<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
				<button class="btn btn-neutral w-full min-w-20 sm:w-auto" onclick={refreshList}>
					<TranslatedText key="app.button.refresh" />
				</button>

				<div class="hidden md:block">
					<ColumnsToggle {columns} {visibleColumns} {onColumnToggle} />
				</div>

				<AutoRefresh
					enabled={autoRefreshEnabled}
					onRefresh={refreshList}
					onToggleChange={handleAutoRefreshToggle}
				/>
			</div>
		</div>

		<!-- Quick filter buttons -->
		<QuickFilterButtons
			isLoading={loading}
			onQuickFilter={handleQuickFilter}
			activeFilters={activeQuickFilters}
			isMultiSelect={isMultiSelectFilter}
			onMultiSelectChange={handleMultiSelectChange}
		/>

		<!-- Statistics display -->
		<div class="stats-container mb-4 flex items-center justify-between text-sm">
			<div class="flex items-center gap-4">
				<span class="font-medium">
					<span class="stats-number">{derivedData().filteredStats.totalServers}</span> /
					<span class="stats-number">{derivedData().totalStats.totalServers}</span> servers
				</span>
				<span class="font-medium">
					<span class="stats-number">{derivedData().filteredStats.totalPlayers}</span> /
					<span class="stats-number">{derivedData().totalStats.totalPlayers}</span> players
				</span>
			</div>
			{#if searchQuery && derivedData().filteredStats.totalServers < derivedData().totalStats.totalServers}
				<span class="filter-indicator text-base-content/60 text-xs italic">
					{m['app.stats.filteredBy']({ query: searchQuery })}
				</span>
			{/if}
		</div>

		<!-- Content area with consistent height -->
		<div class="flex w-full flex-col">
			{#if loading}
				<!-- Enhanced Loading state for PC -->
				<div
					class="loading-container flex min-h-[400px] w-full flex-col items-center justify-center rounded-lg p-6"
					role="status"
					aria-label="Loading server data"
				>
					<!-- Loading animation -->
					<div class="loading-animation mb-6">
						<div class="flex space-x-2">
							<div
								class="loading-dot bg-primary h-3 w-3 animate-bounce rounded-full"
								style="animation-delay: 0ms"
							></div>
							<div
								class="loading-dot bg-primary h-3 w-3 animate-bounce rounded-full"
								style="animation-delay: 150ms"
							></div>
							<div
								class="loading-dot bg-primary h-3 w-3 animate-bounce rounded-full"
								style="animation-delay: 300ms"
							></div>
						</div>
					</div>

					<!-- Loading text -->
					<div class="mb-4 text-center">
						<h3 class="text-base-content mb-2 text-lg font-semibold">
							<TranslatedText key="app.loading.title" fallback="Loading Servers" />
						</h3>
						<p class="text-base-content/70 max-w-md text-sm">
							<TranslatedText
								key="app.loading.description"
								fallback="Fetching latest server data from the API..."
							/>
						</p>
					</div>

					<!-- Progress indicator -->
					<div class="mb-6 w-full max-w-sm">
						<div class="progress progress-primary h-2 w-full">
							<div class="progress-bar bg-primary h-2 w-[60%] animate-pulse"></div>
						</div>
						<p class="text-base-content/50 mt-2 text-center text-xs">
							<TranslatedText key="app.loading.progress" fallback="Connecting to server..." />
						</p>
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
				<!-- Mobile table cards with collapsible details -->
				<div class="md:hidden">
					<!-- Mobile-only sort controls -->
					<div class="mb-4 flex flex-wrap gap-2">
						{#each columns.filter( (col) => ['name', 'playerCount', 'mapId'].includes(col.key) ) as column (column.key)}
							<button
								class="btn btn-sm btn-outline flex items-center gap-2"
								onclick={() => handleSort(column.key)}
								type="button"
							>
								{#if column.i18n}<TranslatedText key={column.i18n} />{:else}{column.label}{/if}
								{@html getSortIcon(column.key)}
							</button>
						{/each}
					</div>

					{#each derivedData().mobilePaginatedServers as item (item.id)}
						<div class="card bg-base-100 border-base-300 mb-3 overflow-hidden border shadow-lg">
							<!-- Primary info section - clickable for expand/collapse -->
							<button
								class="card-body hover:bg-base-200 w-full p-4 text-left transition-colors duration-200"
								onclick={() => toggleMobileCard(item.id)}
								aria-expanded={mobileExpandedCards[item.id]}
								aria-label="Toggle server details"
							>
								<!-- Server name, players, and map on same line -->
								<div class="flex items-center justify-between gap-2">
									<!-- Server name -->
									<h3 class="text-base-content flex-1 truncate text-base font-semibold">
										{@html getDisplayValue(
											item,
											columns.find((col) => col.key === 'name')!,
											searchQuery
										)}
									</h3>

									<!-- Player count with forced wrapping -->
									<div class="min-w-0 flex-shrink-0">
										<div class="flex max-w-24 flex-wrap justify-end gap-1 sm:max-w-32">
											{@html getDisplayValue(
												item,
												columns.find((col) => col.key === 'playerCount')!,
												searchQuery
											)}
										</div>
									</div>

									<!-- Map -->
									<div class="flex-shrink-0">
										{@html getDisplayValue(
											item,
											columns.find((col) => col.key === 'mapId')!,
											searchQuery
										)}
									</div>

									<!-- Expand indicator -->
									<div class="flex-shrink-0">
										<svg
											class="text-base-content/60 h-4 w-4 transition-transform duration-200"
											class:rotate-180={mobileExpandedCards[item.id]}
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M19 9l-7 7-7-7"
											></path>
										</svg>
									</div>
								</div>
							</button>

							<!-- Collapsible details -->
							{#if mobileExpandedCards[item.id]}
								<div class="border-base-200 border-t px-4 pb-4">
									<div class="space-y-2 pt-3">
										{#each columns.filter((col) => !['name', 'playerCount', 'mapId', 'action'].includes(col.key)) as column (column.key)}
											<div class="flex items-center justify-between py-1">
												<span class="text-base-content/60 min-w-20 flex-shrink-0 text-sm">
													{#if column.i18n}<TranslatedText
															key={column.i18n}
														/>{:else}{column.label}{/if}:
												</span>
												<div class="text-base-content ml-3 flex-1 text-right text-sm">
													{#if column.key === 'url' && item.url}
														<a
															href={item.url}
															target="_blank"
															class="link link-primary"
															onclick={(e) => e.stopPropagation()}
															title={item.url}
														>
															{item.url.length > 30 ? item.url.substring(0, 27) + '...' : item.url}
														</a>
													{:else if column.key === 'comment' || column.key === 'playerList'}
														<!-- For potentially long text like comments and player lists -->
														<div class="text-left break-words whitespace-pre-wrap">
															{@html getDisplayValue(item, column)}
														</div>
													{:else}
														<!-- For other fields like mode, dedicated, mod, version, etc. -->
														<div class="flex items-center justify-end">
															{@html getDisplayValue(item, column)}
														</div>
													{/if}
												</div>
											</div>
										{/each}
									</div>
								</div>
							{/if}
						</div>
					{/each}

					{#if derivedData().mobilePaginatedServers.length === 0}
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
					{/if}
				</div>

				<!-- Desktop table (hidden on mobile) -->
				<div class="hidden overflow-x-auto md:block">
					<MobileDataTable
						data={derivedData().paginatedServers}
						{columns}
						{searchQuery}
						{onRowAction}
						{visibleColumns}
						onSort={handleSort}
						{sortColumn}
						{sortDirection}
					/>
				</div>

				<!-- Mobile infinite scroll component (hidden on desktop) -->
				<MobileInfiniteScroll
					hasMore={derivedData().mobileHasMore}
					isLoading={mobileLoadingMore}
					onLoadMore={handleLoadMore}
				/>

				<!-- Desktop pagination component (hidden on mobile) -->
				<div class="hidden md:block">
					<Pagination
						{currentPage}
						totalPages={derivedData().totalPages}
						totalItems={derivedData().filteredServers.length}
						pageChange={handlePageChange}
					/>
				</div>
			{/if}
		</div>
	</div>

	<!-- Global keyboard search functionality -->
	<GlobalKeyboardSearch searchInput={searchInputRef} onSearch={handleGlobalSearch} />
</section>

<style>
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

	/* Enhanced loading animations */
	.loading-container {
		background: linear-gradient(135deg, hsl(var(--b1)) 0%, hsl(var(--b2)) 100%);
		border: 1px solid hsl(var(--bc) / 0.1);
		box-shadow:
			0 4px 6px -1px rgba(0, 0, 0, 0.1),
			0 2px 4px -1px rgba(0, 0, 0, 0.06);
	}

	/* Custom bounce animation for loading dots */
	@keyframes bounce-custom {
		0%,
		80%,
		100% {
			transform: scale(0.8);
			opacity: 0.5;
		}
		40% {
			transform: scale(1);
			opacity: 1;
		}
	}

	.loading-dot {
		animation: bounce-custom 1.4s infinite ease-in-out both;
	}

	/* Progress bar animation */
	@keyframes progress-pulse {
		0% {
			width: 30%;
			opacity: 0.6;
		}
		50% {
			width: 70%;
			opacity: 1;
		}
		100% {
			width: 90%;
			opacity: 0.8;
		}
	}

	.progress-bar {
		animation: progress-pulse 2s ease-in-out infinite;
	}

	/* Skeleton preview fade-in animation */
	@keyframes fade-in-up {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 0.6;
			transform: translateY(0);
		}
	}
</style>
