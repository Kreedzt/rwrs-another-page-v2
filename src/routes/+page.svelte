<script lang="ts">
	import { onMount } from 'svelte';
	import { m } from '$lib/paraglide/messages.js';
	import { DataTableService } from '$lib/services/data-table';
	import { userSettingsService, type UserSettings } from '$lib/services/user-settings';
	import type { IColumn, IDisplayServerItem } from '$lib/models/data-table.model';
	import { columns } from '$lib/config/columns';
	import { getMaps, type MapData } from '$lib/services/maps';
	import { PlayerService } from '$lib/services/players';
	import type { IPlayerItem, PlayerDatabase } from '$lib/models/player.model';
	import { playerColumns } from '$lib/config/player-columns';
	import { filters as quickFilters } from '$lib/utils/quick-filters';
	import {
		getUrlState,
		updateUrlState,
		createUrlStateSubscriber,
		type UrlState
	} from '$lib/utils/url-state';

	// Components
	import Header from './Header.svelte';
	import ControlBar from '$lib/components/ControlBar.svelte';
	import StatsBar from '$lib/components/StatsBar.svelte';
	import ServerView from '$lib/components/ServerView.svelte';
	import PlayerView from '$lib/components/PlayerView.svelte';
	import MapPreview from '$lib/components/MapPreview.svelte';
	import GlobalKeyboardSearch from '$lib/components/GlobalKeyboardSearch.svelte';

	// View mode state
	let currentView = $state<'servers' | 'players'>('servers');
	let playerDb = $state<PlayerDatabase>('invasion' as PlayerDatabase);
	let players = $state<IPlayerItem[]>([]);
	// Player pagination state from API (Next/Previous links)
	let playerHasNext = $state(false);
	let playerHasPrevious = $state(false);

	// State variables
	let servers = $state<IDisplayServerItem[]>([]);
	let maps = $state<MapData[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let searchQuery = $state('');
	let searchInputRef = $state<HTMLInputElement | null>(null);

	// Map preview state
	let mapPreviewData = $state<MapData | undefined>(undefined);
	let mapPreviewShow = $state(false);
	let mapPreviewPosition = $state({ x: 0, y: 0 });

	// User settings from localStorage
	const userSettings = $state<UserSettings>(userSettingsService.getSettings());

	// Auto refresh state (from user settings)
	let autoRefreshEnabled = $state(userSettings.autoRefresh.enabled);

	// Sort state
	let sortColumn = $state<string | null>(null);
	let sortDirection = $state<'asc' | 'desc' | null>(null);

	// Player sort state
	let playerSortColumn = $state<string | null>(null);
	let playerSortDirection = $state<'asc' | 'desc' | null>(null);

	// Pagination state
	const itemsPerPage = 20; // For servers
	let playerPageSize = $state(20); // For players (variable)
	let currentPage = $state(1);

	// Mobile infinite scroll state - servers
	let mobileServerCurrentPage = $state(1);
	let mobileServerLoadingMore = $state(false);

	// Mobile infinite scroll state - players
	let mobilePlayerCurrentPage = $state(1);
	let mobilePlayerLoadingMore = $state(false);

	// Player refreshing state (for sort/db changes when data already exists)
	let playerRefreshing = $state(false);

	// Visible columns (from user settings)
	let visibleColumns = $state<Record<string, boolean>>({ ...userSettings.visibleColumns });

	// Visible player columns - default to specified columns
	const defaultPlayerVisibleColumns = ['rowNumber', 'username', 'kills', 'deaths', 'kd', 'timePlayed', 'rankProgression', 'rankName'];
	let visiblePlayerColumns = $state<Record<string, boolean>>(
		playerColumns.reduce((acc, col) => {
			acc[col.key as string] = defaultPlayerVisibleColumns.includes(col.key as string);
			return acc;
		}, {} as Record<string, boolean>)
	);

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

	const calculatePlayerStats = (playerList: IPlayerItem[], paginatedList?: IPlayerItem[]) => {
		return {
			totalPlayers: playerList.length,
			paginatedCount: paginatedList?.length ?? playerList.length
		};
	};

	// Sort servers
	function sortServers(serverList: IDisplayServerItem[]): IDisplayServerItem[] {
		if (!sortColumn || !sortDirection) {
			return serverList;
		}

		const numericColumns = ['bots', 'playerCount', 'port', 'currentPlayers', 'maxPlayers'];
		const isNumeric = numericColumns.includes(sortColumn);

		return [...serverList].sort((a, b) => {
			let aValue: any;
			let bValue: any;

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
					aValue = (a as any)[sortColumn!] || '';
					bValue = (b as any)[sortColumn!] || '';
					break;
			}

			if (!isNumeric) {
				aValue = String(aValue).toLowerCase();
				bValue = String(bValue).toLowerCase();
			}

			if (sortDirection === 'desc') {
				return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
			} else {
				return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
			}
		});
	}

	// Sort players
	function sortPlayers(playerList: IPlayerItem[]): IPlayerItem[] {
		if (!playerSortColumn || !playerSortDirection) {
			return playerList;
		}

		return [...playerList].sort((a, b) => {
			const column = playerColumns.find((col) => col.key === playerSortColumn);
			let aValue: any;
			let bValue: any;

			if (column) {
				const key = column.key as keyof IPlayerItem;
				aValue = (a as any)[key];
				bValue = (b as any)[key];
			} else {
				aValue = '';
				bValue = '';
			}

			if (aValue == null) aValue = 0;
			if (bValue == null) bValue = 0;

			const isNumeric = typeof aValue === 'number' || typeof bValue === 'number';

			if (!isNumeric) {
				aValue = String(aValue).toLowerCase();
				bValue = String(bValue).toLowerCase();
			}

			if (playerSortDirection === 'desc') {
				return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
			} else {
				return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
			}
		});
	}

	// Derived values for servers
	const derivedServerData = $derived(() => {
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

		if (activeQuickFilters.length > 0) {
			filtered = filtered.filter((server) => {
				return activeQuickFilters.some((filterId) => {
					const filter = quickFilters.find((f) => f.id === filterId);
					return filter ? filter.filter(server) : false;
				});
			});
		}

		const sortedFiltered = sortServers(filtered);

		const totalStats = calculateStats(servers);
		const filteredStats = calculateStats(sortedFiltered);

		const totalPages = Math.ceil(sortedFiltered.length / itemsPerPage);
		const paginatedServers = sortedFiltered.slice(
			(currentPage - 1) * itemsPerPage,
			currentPage * itemsPerPage
		);

		const mobilePaginatedServers = sortedFiltered.slice(0, mobileServerCurrentPage * itemsPerPage);
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

	// Derived values for players
	const derivedPlayerData = $derived(() => {
		// Players are already filtered, sorted, and paginated by API
		const paginatedPlayers = players;

		const totalStats = calculatePlayerStats(players);
		const filteredStats = calculatePlayerStats(players, paginatedPlayers);

		// Use hasNext/hasPrevious from API response to determine total pages
		const totalPages = playerHasNext ? currentPage + 1 : currentPage;

		// For mobile, use current page data
		const mobilePaginatedPlayers = players;
		const mobileHasMore = playerHasNext;

		return {
			filteredPlayers: players,
			totalPages,
			paginatedPlayers,
			totalStats,
			filteredStats,
			mobilePaginatedPlayers,
			mobileHasMore
		};
	});

	// Handle search query changes
	$effect(() => {
		currentPage = 1;
		mobileServerCurrentPage = 1;
		mobilePlayerCurrentPage = 1;
		mobileServerLoadingMore = false;
		mobilePlayerLoadingMore = false;
	});

	function handleSearchInput(value: string) {
		searchQuery = value;
		currentPage = 1;
		mobileServerCurrentPage = 1;
		mobilePlayerCurrentPage = 1;
		mobileServerLoadingMore = false;
		mobilePlayerLoadingMore = false;
		updateUrlState({ search: value.trim() || undefined }, true);
		// Don't trigger loadPlayers() here for players view - only on Enter or Refresh
		if (currentView === 'servers') {
			// Servers view can still search in real-time
		}
	}

	function handleSearchEnter(value: string) {
		if (currentView === 'players') {
			searchQuery = value;
			currentPage = 1;
			mobilePlayerCurrentPage = 1;
			mobilePlayerLoadingMore = false;
			updateUrlState({ search: value.trim() || undefined }, true);
			loadPlayers();
		}
	}

	function handleGlobalSearch(query: string) {
		searchQuery = query;
		currentPage = 1;
		mobileServerCurrentPage = 1;
		mobilePlayerCurrentPage = 1;
		mobileServerLoadingMore = false;
		mobilePlayerLoadingMore = false;
		handleSearchInput(query);
	}

	function handlePageChange(page: number) {
		currentPage = page;
		// For players view, reload data from API with new page
		if (currentView === 'players') {
			loadPlayers();
		}
	}

	function handleLoadMore() {
		if (currentView === 'players') {
			if (!mobilePlayerLoadingMore && playerHasNext) {
				mobilePlayerLoadingMore = true;
				mobilePlayerCurrentPage++;
				loadPlayersMore().finally(() => {
					mobilePlayerLoadingMore = false;
				});
			}
		} else {
			if (!mobileServerLoadingMore && derivedServerData().mobileHasMore) {
				mobileServerLoadingMore = true;
				mobileServerCurrentPage++;
				setTimeout(() => {
					mobileServerLoadingMore = false;
				}, 500);
			}
		}
	}

	function handleJoin(server: IDisplayServerItem) {
		const url = `steam://rungameid/270150//server_address=${server.ipAddress} server_port=${server.port}`;
		window.open(url, '_blank');
	}

	function onRowAction(event: { item: IDisplayServerItem; action: string }) {
		if (event.action === 'join') {
			handleJoin(event.item);
		}
	}

	function onColumnToggle(column: IColumn, visible: boolean) {
		visibleColumns[column.key] = visible;
		userSettingsService.updateNested('visibleColumns', column.key, visible);
	}

	function onPlayerColumnToggle(column: IColumn, visible: boolean) {
		visiblePlayerColumns[column.key] = visible;
	}

	function handleAutoRefreshToggle(enabled: boolean) {
		autoRefreshEnabled = enabled;
		userSettingsService.updateNested('autoRefresh', 'enabled', enabled);
	}

	function handleQuickFilter(filterId: string) {
		if (isMultiSelectFilter) {
			if (activeQuickFilters.includes(filterId)) {
				activeQuickFilters = activeQuickFilters.filter((id) => id !== filterId);
			} else {
				activeQuickFilters = [...activeQuickFilters, filterId];
			}
		} else {
			activeQuickFilters = activeQuickFilters.includes(filterId) ? [] : [filterId];
		}
		currentPage = 1;
		mobileServerCurrentPage = 1;
		mobileServerLoadingMore = false;
		updateUrlState({ quickFilters: activeQuickFilters.length > 0 ? activeQuickFilters : [] }, true);
	}

	function handleMultiSelectChange(checked: boolean) {
		isMultiSelectFilter = checked;
		if (!checked && activeQuickFilters.length > 1) {
			activeQuickFilters = activeQuickFilters.slice(0, 1);
		}
	}

	function handleSort(column: string) {
		if (sortColumn === column) {
			if (sortDirection === 'desc') {
				sortDirection = 'asc';
			} else if (sortDirection === 'asc') {
				sortColumn = null;
				sortDirection = null;
			} else {
				sortDirection = 'desc';
			}
		} else {
			sortColumn = column;
			sortDirection = 'desc';
		}

		currentPage = 1;
		mobileServerCurrentPage = 1;
		mobileServerLoadingMore = false;

		updateUrlState(
			{ sortColumn: sortColumn || undefined, sortDirection: sortDirection || undefined },
			true
		);
	}

	function handlePlayerSort(column: string) {
		// Toggle sort: if clicking same column, clear it; otherwise set to desc
		if (playerSortColumn === column) {
			playerSortColumn = null;
			playerSortDirection = null;
		} else {
			playerSortColumn = column;
			playerSortDirection = 'desc';
		}

		currentPage = 1;
		mobilePlayerCurrentPage = 1;
		mobilePlayerLoadingMore = false;

		updateUrlState(
			{ sortColumn: playerSortColumn || undefined, sortDirection: playerSortDirection || undefined },
			true
		);

		loadPlayers();
	}

	function toggleMobileCard(id: string) {
		mobileExpandedCards[id] = !mobileExpandedCards[id];
	}

	function handleMapView(mapData: MapData) {
		mapPreviewData = mapData;
		mapPreviewShow = true;
		mapPreviewPosition = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
	}

	function handleMapPreviewClose() {
		mapPreviewShow = false;
	}

	async function refreshList() {
		try {
			loading = true;
			servers = await DataTableService.listAll();
			mobileServerCurrentPage = 1;
			mobileServerLoadingMore = false;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load data';
			console.error('Error loading servers:', err);
		} finally {
			loading = false;
		}
	}

	async function loadPlayers() {
		try {
			// Use refreshing state if we already have data (sort/db change)
			const isRefreshing = players.length > 0;
			if (isRefreshing) {
				playerRefreshing = true;
			} else {
				loading = true;
			}

			const start = (currentPage - 1) * playerPageSize;

			// Convert camelCase to snake_case for API
			const sortParam = playerSortColumn
				? playerSortColumn.replace(/([A-Z])/g, '_$1').toLowerCase()
				: undefined;

			const result = await PlayerService.listWithPagination({
				db: playerDb,
				search: searchQuery.trim() || undefined,
				sort: sortParam,
				size: playerPageSize,
				start
			});
			players = result.players;
			playerHasNext = result.hasNext;
			playerHasPrevious = result.hasPrevious;
			mobilePlayerCurrentPage = 1;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load player data';
			console.error('Error loading players:', err);
		} finally {
			loading = false;
			playerRefreshing = false;
		}
	}

	async function loadPlayersMore() {
		try {
			const start = (mobilePlayerCurrentPage - 1) * playerPageSize;

			// Convert camelCase to snake_case for API
			const sortParam = playerSortColumn
				? playerSortColumn.replace(/([A-Z])/g, '_$1').toLowerCase()
				: undefined;

			const result = await PlayerService.listWithPagination({
				db: playerDb,
				search: searchQuery.trim() || undefined,
				sort: sortParam,
				size: playerPageSize,
				start
			});
			players = [...players, ...result.players];
			playerHasNext = result.hasNext;
			playerHasPrevious = result.hasPrevious;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load player data';
			console.error('Error loading players:', err);
		}
	}

	async function loadMaps() {
		try {
			maps = await getMaps();
		} catch (err) {
			console.error('Error loading maps:', err);
		}
	}

	function handleViewChange(view: 'servers' | 'players') {
		currentView = view;
		searchQuery = '';
		updateUrlState({ view, search: undefined }, true);
		currentPage = 1;
		mobileServerCurrentPage = 1;
		mobilePlayerCurrentPage = 1;
		mobileServerLoadingMore = false;
		mobilePlayerLoadingMore = false;
		if (view === 'players') {
			loadPlayers();
		} else {
			refreshList();
		}
	}

	function handlePlayerDbChange(db: PlayerDatabase) {
		playerDb = db;
		updateUrlState({ playerDb: db }, true);
		loadPlayers();
	}

	function handlePlayerPageSizeChange(size: number) {
		playerPageSize = size;
		currentPage = 1;
		mobilePlayerCurrentPage = 1;
		mobilePlayerLoadingMore = false;
		loadPlayers();
	}

	function initializeFromUrl() {
		const urlState = getUrlState();

		if (urlState.search !== undefined) {
			searchQuery = urlState.search;
		}

		if (urlState.quickFilters && urlState.quickFilters.length > 0) {
			const validFilters = urlState.quickFilters.filter((filterId) =>
				quickFilters.some((filter) => filter.id === filterId)
			);
			activeQuickFilters = validFilters;
		}

		// Set sort state based on current view
		if (urlState.sortColumn && urlState.sortDirection) {
			// Always set both states so switching views preserves sort
			sortColumn = urlState.sortColumn;
			sortDirection = urlState.sortDirection;
			playerSortColumn = urlState.sortColumn;
			playerSortDirection = urlState.sortDirection;
		}

		if (urlState.view) {
			currentView = urlState.view;
		}

		if (urlState.playerDb) {
			playerDb = urlState.playerDb;
		}
	}

	onMount(() => {
		initializeFromUrl();

		const loadData = async () => {
			await loadMaps();
			if (currentView === 'players') {
				await loadPlayers();
			} else {
				await refreshList();
			}
		};
		loadData();

		const unsubscribe = createUrlStateSubscriber((urlState: UrlState) => {
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
				playerSortColumn = urlState.sortColumn;
				playerSortDirection = urlState.sortDirection || null;
			}

			if (urlState.view !== undefined && currentView !== urlState.view) {
				currentView = urlState.view;
				if (urlState.view === 'players') {
					loadPlayers();
				} else {
					refreshList();
				}
			}

			if (urlState.playerDb !== undefined && playerDb !== urlState.playerDb) {
				playerDb = urlState.playerDb;
				if (currentView === 'players') {
					loadPlayers();
				}
			}
		});

		return () => {
			unsubscribe?.();
		};
	});
</script>

<Header />

<section aria-label="Server List" class="flex flex-col items-center justify-center">
	<div class="container px-4 py-8">
		<!-- View Tabs -->
		<div role="tablist" class="tabs tabs-border mb-4">
			<button
				role="tab"
				class="tab"
				class:tab-active={currentView === 'servers'}
				onclick={() => handleViewChange('servers')}
			>
				{m['app.viewMode.servers']()}
			</button>
			<button
				role="tab"
				class="tab"
				class:tab-active={currentView === 'players'}
				onclick={() => handleViewChange('players')}
			>
				{m['app.viewMode.players']()}
			</button>
		</div>

		<!-- Control Bar -->
		<ControlBar
			{currentView}
			{playerDb}
			{searchQuery}
			searchPlaceholder={m['app.search.placeholder']()}
			{autoRefreshEnabled}
			{columns}
			{visibleColumns}
			onPlayerDbChange={handlePlayerDbChange}
			onRefresh={currentView === 'servers' ? refreshList : loadPlayers}
			onAutoRefreshToggle={handleAutoRefreshToggle}
			onSearchInput={handleSearchInput}
			onSearchEnter={handleSearchEnter}
			onColumnToggle={onColumnToggle}
			onSearchRef={(input) => (searchInputRef = input)}
		/>

		<!-- Statistics Bar -->
		<StatsBar
			{currentView}
			serverTotalStats={derivedServerData().totalStats}
			serverFilteredStats={derivedServerData().filteredStats}
			playerTotalStats={derivedPlayerData().totalStats}
			playerFilteredStats={derivedPlayerData().filteredStats}
			{searchQuery}
		/>

		<!-- Content Area -->
		{#if currentView === 'servers'}
			<ServerView
				loading={loading && servers.length === 0}
				{error}
				{searchQuery}
				paginatedServers={derivedServerData().paginatedServers}
				mobilePaginatedServers={derivedServerData().mobilePaginatedServers}
				mobileHasMore={derivedServerData().mobileHasMore}
				mobileLoadingMore={mobileServerLoadingMore}
				totalPages={derivedServerData().totalPages}
				filteredServersCount={derivedServerData().filteredServers.length}
				{columns}
				{maps}
				{visibleColumns}
				activeFilters={activeQuickFilters}
				isMultiSelect={isMultiSelectFilter}
				{currentPage}
				sortColumn={sortColumn}
				sortDirection={sortDirection}
				{mobileExpandedCards}
				onQuickFilter={handleQuickFilter}
				onMultiSelectChange={handleMultiSelectChange}
				onSort={handleSort}
				onPageChange={handlePageChange}
				onLoadMore={handleLoadMore}
				onRowAction={onRowAction}
				onColumnToggle={onColumnToggle}
				onToggleMobileCard={toggleMobileCard}
				onMapView={handleMapView}
				onMapPreviewClose={handleMapPreviewClose}
			/>
		{:else}
			<PlayerView
				loading={loading && players.length === 0}
				refreshing={playerRefreshing}
				{error}
				{searchQuery}
				paginatedPlayers={derivedPlayerData().paginatedPlayers}
				mobilePaginatedPlayers={derivedPlayerData().mobilePaginatedPlayers}
				mobileHasMore={derivedPlayerData().mobileHasMore}
				mobileLoadingMore={mobilePlayerLoadingMore}
				{playerColumns}
				visibleColumns={visiblePlayerColumns}
				{currentPage}
				pageSize={playerPageSize}
				sortColumn={playerSortColumn}
				{mobileExpandedCards}
				hasNext={playerHasNext}
				hasPrevious={playerHasPrevious}
				onSort={handlePlayerSort}
				onPageChange={handlePageChange}
				onPageSizeChange={handlePlayerPageSizeChange}
				onLoadMore={handleLoadMore}
				onToggleMobileCard={toggleMobileCard}
			/>
		{/if}
	</div>

	<!-- Global keyboard search -->
	<GlobalKeyboardSearch searchInput={searchInputRef} onSearch={handleGlobalSearch} />

	<!-- Map preview -->
	<MapPreview
		mapData={mapPreviewData}
		show={mapPreviewShow}
		position={mapPreviewPosition}
		key={mapPreviewData?.path}
		onClose={handleMapPreviewClose}
	/>
</section>
