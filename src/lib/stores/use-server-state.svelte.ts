import { ServerService } from '$lib/services/servers';
import { sortServers } from '$lib/utils/sorting';
import { filters as quickFilters } from '$lib/utils/quick-filters';
import type { IDisplayServerItem } from '$lib/models/server.model';

const ITEMS_PER_PAGE = 20;

interface ServerStats {
	totalServers: number;
	totalPlayers: number;
}

interface DerivedServerData {
	filteredServers: IDisplayServerItem[];
	totalPages: number;
	paginatedServers: IDisplayServerItem[];
	totalStats: ServerStats;
	filteredStats: ServerStats;
	mobilePaginatedServers: IDisplayServerItem[];
	mobileHasMore: boolean;
}

/**
 * Server state management composable
 * Extracted from +page.svelte for better separation of concerns
 */
export function createServerState() {
	// State
	let servers = $state<IDisplayServerItem[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	// Pagination state
	let currentPage = $state(1);
	let mobileServerCurrentPage = $state(1);
	let mobileServerLoadingMore = $state(false);

	// Sort state
	let sortColumn = $state<string | null>(null);
	let sortDirection = $state<'asc' | 'desc' | null>(null);

	// Calculate statistics
	const calculateStats = (serverList: IDisplayServerItem[]): ServerStats => {
		const totalServers = serverList.length;
		const totalPlayers = serverList.reduce((sum, server) => sum + server.currentPlayers, 0);
		return { totalServers, totalPlayers };
	};

	/**
	 * Refresh server list from API
	 */
	async function refreshList(): Promise<void> {
		try {
			loading = true;
			servers = await ServerService.listAll();
			mobileServerCurrentPage = 1;
			mobileServerLoadingMore = false;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load data';
			console.error('Error loading servers:', err);
		} finally {
			loading = false;
		}
	}

	/**
	 * Handle sort column change
	 */
	function handleSort(column: string): void {
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
	function handleLoadMore(): boolean {
		if (!mobileServerLoadingMore && getDerivedData().mobileHasMore) {
			mobileServerLoadingMore = true;
			mobileServerCurrentPage++;
			setTimeout(() => {
				mobileServerLoadingMore = false;
			}, 500);
			return true;
		}
		return false;
	}

	/**
	 * Reset pagination to page 1
	 */
	function resetPagination(): void {
		currentPage = 1;
		mobileServerCurrentPage = 1;
		mobileServerLoadingMore = false;
	}

	/**
	 * Get derived/computed server data
	 */
	function getDerivedData(
		searchQuery: string = '',
		activeQuickFilters: string[] = []
	): DerivedServerData {
		// Filter by search query
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

		// Filter by quick filters
		if (activeQuickFilters.length > 0) {
			filtered = filtered.filter((server) => {
				return activeQuickFilters.some((filterId) => {
					const filter = quickFilters.find((f) => f.id === filterId);
					return filter ? filter.filter(server) : false;
				});
			});
		}

		// Sort
		const sortedFiltered = sortServers(filtered, sortColumn, sortDirection);

		// Statistics
		const totalStats = calculateStats(servers);
		const filteredStats = calculateStats(sortedFiltered);

		// Desktop pagination
		const totalPages = Math.ceil(sortedFiltered.length / ITEMS_PER_PAGE);
		const paginatedServers = sortedFiltered.slice(
			(currentPage - 1) * ITEMS_PER_PAGE,
			currentPage * ITEMS_PER_PAGE
		);

		// Mobile pagination
		const mobilePaginatedServers = sortedFiltered.slice(
			0,
			mobileServerCurrentPage * ITEMS_PER_PAGE
		);
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
	}

	/**
	 * Set servers directly (useful for testing or external updates)
	 */
	function setServers(newServers: IDisplayServerItem[]): void {
		servers = newServers;
	}

	/**
	 * Set sort state directly (useful for URL state sync)
	 */
	function setSortState(column: string | null, direction: 'asc' | 'desc' | null): void {
		sortColumn = column;
		sortDirection = direction;
	}

	return {
		// State getters
		get servers() {
			return servers;
		},
		get loading() {
			return loading;
		},
		get error() {
			return error;
		},
		get currentPage() {
			return currentPage;
		},
		get mobileServerCurrentPage() {
			return mobileServerCurrentPage;
		},
		get mobileServerLoadingMore() {
			return mobileServerLoadingMore;
		},
		get sortColumn() {
			return sortColumn;
		},
		get sortDirection() {
			return sortDirection;
		},

		// Methods
		refreshList,
		handleSort,
		handlePageChange,
		handleLoadMore,
		resetPagination,
		getDerivedData,
		setServers,
		setSortState
	};
}

export type ServerState = ReturnType<typeof createServerState>;
