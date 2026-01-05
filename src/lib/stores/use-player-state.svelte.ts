import { PlayerService } from '$lib/services/players';
import type { IPlayerItem, PlayerDatabase, PlayerSortField } from '$lib/models/player.model';

interface PlayerStats {
	totalPlayers: number;
	paginatedCount: number;
}

interface DerivedPlayerData {
	filteredPlayers: IPlayerItem[];
	totalPages: number;
	paginatedPlayers: IPlayerItem[];
	totalStats: PlayerStats;
	filteredStats: PlayerStats;
	mobilePaginatedPlayers: IPlayerItem[];
	mobileHasMore: boolean;
}

interface LoadPlayersOptions {
	searchQuery?: string;
	start?: number;
}

/**
 * Player state management composable
 * Extracted from +page.svelte for better separation of concerns
 */
export function createPlayerState(initialDb: PlayerDatabase = 'invasion' as PlayerDatabase) {
	// State
	let players = $state<IPlayerItem[]>([]);
	let playerDb = $state<PlayerDatabase>(initialDb);
	let loading = $state(false);
	const refreshing = $state(false);
	let error = $state<string | null>(null);
	let lastQueryTimestamp = $state<number | undefined>(undefined);

	// Pagination state from API
	let playerHasNext = $state(false);
	let playerHasPrevious = $state(false);

	// Local pagination state
	let playerPageSize = $state(20);
	let currentPage = $state(1);
	let mobilePlayerCurrentPage = $state(1);
	let mobilePlayerLoadingMore = $state(false);

	// Sort state
	let playerSortColumn = $state<string | null>(null);
	let playerSortDirection = $state<'asc' | 'desc' | null>(null);

	// Calculate statistics
	const calculatePlayerStats = (
		playerList: IPlayerItem[],
		paginatedList?: IPlayerItem[]
	): PlayerStats => {
		return {
			totalPlayers: playerList.length,
			paginatedCount: paginatedList?.length ?? playerList.length
		};
	};

	/**
	 * Load players from API
	 */
	async function loadPlayers(options: LoadPlayersOptions = {}): Promise<void> {
		const searchQuery = options.searchQuery ?? '';
		const start = options.start ?? (currentPage - 1) * playerPageSize;

		try {
			// Always use loading state for consistent UI
			loading = true;

			// Convert camelCase to snake_case for API
			const sortParam: PlayerSortField | undefined = playerSortColumn
				? (playerSortColumn.replace(/([A-Z])/g, '_$1').toLowerCase() as PlayerSortField)
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
			lastQueryTimestamp = Date.now();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load player data';
			console.error('Error loading players:', err);
		} finally {
			loading = false;
		}
	}

	/**
	 * Load more players for mobile infinite scroll
	 */
	async function loadPlayersMore(searchQuery: string = ''): Promise<void> {
		try {
			const start = (mobilePlayerCurrentPage - 1) * playerPageSize;

			// Convert camelCase to snake_case for API
			const sortParam: PlayerSortField | undefined = playerSortColumn
				? (playerSortColumn.replace(/([A-Z])/g, '_$1').toLowerCase() as PlayerSortField)
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

	/**
	 * Handle sort column change
	 */
	function handleSort(column: string): void {
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
	}

	/**
	 * Handle page change
	 */
	function handlePageChange(page: number): void {
		currentPage = page;
	}

	/**
	 * Handle mobile "load more"
	 */
	async function handleLoadMore(searchQuery: string = ''): Promise<boolean> {
		if (!mobilePlayerLoadingMore && playerHasNext) {
			mobilePlayerLoadingMore = true;
			mobilePlayerCurrentPage++;
			await loadPlayersMore(searchQuery);
			mobilePlayerLoadingMore = false;
			return true;
		}
		return false;
	}

	/**
	 * Handle player database change
	 */
	function handlePlayerDbChange(db: PlayerDatabase): void {
		playerDb = db;
	}

	/**
	 * Handle player page size change
	 */
	function handlePlayerPageSizeChange(size: number): void {
		playerPageSize = size;
		currentPage = 1;
		mobilePlayerCurrentPage = 1;
		mobilePlayerLoadingMore = false;
	}

	/**
	 * Reset pagination to page 1
	 */
	function resetPagination(): void {
		currentPage = 1;
		mobilePlayerCurrentPage = 1;
		mobilePlayerLoadingMore = false;
	}

	/**
	 * Get derived/computed player data
	 */
	function getDerivedData(): DerivedPlayerData {
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
	}

	/**
	 * Set players directly (useful for testing)
	 */
	function setPlayers(newPlayers: IPlayerItem[]): void {
		players = newPlayers;
	}

	/**
	 * Set sort state directly (useful for URL state sync)
	 */
	function setSortState(column: string | null, direction: 'asc' | 'desc' | null): void {
		playerSortColumn = column;
		playerSortDirection = direction;
	}

	return {
		// State getters
		get players() {
			return players;
		},
		get playerDb() {
			return playerDb;
		},
		get loading() {
			return loading;
		},
		get refreshing() {
			return refreshing;
		},
		get error() {
			return error;
		},
		get playerHasNext() {
			return playerHasNext;
		},
		get playerHasPrevious() {
			return playerHasPrevious;
		},
		get playerPageSize() {
			return playerPageSize;
		},
		get currentPage() {
			return currentPage;
		},
		get mobilePlayerCurrentPage() {
			return mobilePlayerCurrentPage;
		},
		get mobilePlayerLoadingMore() {
			return mobilePlayerLoadingMore;
		},
		get playerSortColumn() {
			return playerSortColumn;
		},
		get playerSortDirection() {
			return playerSortDirection;
		},
		get lastQueryTimestamp() {
			return lastQueryTimestamp;
		},

		// Methods
		loadPlayers,
		loadPlayersMore,
		handleSort,
		handlePageChange,
		handleLoadMore,
		handlePlayerDbChange,
		handlePlayerPageSizeChange,
		resetPagination,
		getDerivedData,
		setPlayers,
		setSortState
	};
}

export type PlayerState = ReturnType<typeof createPlayerState>;
