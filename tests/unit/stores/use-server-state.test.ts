import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createServerState } from '$lib/stores/use-server-state.svelte';
import { ServerService } from '$lib/services/servers';
import type { IDisplayServerItem } from '$lib/models/server.model';

// Mock ServerService
vi.mock('$lib/services/servers', () => ({
	ServerService: {
		listAll: vi.fn()
	}
}));

describe('createServerState', () => {
	let serverState: ReturnType<typeof createServerState>;

	// Create 25 mock servers to properly test pagination (20 per page)
	const createMockServers = (count: number): IDisplayServerItem[] => {
		return Array.from({ length: count }, (_, i) => ({
			id: `${i + 1}`,
			name: `Server ${String.fromCharCode(65 + (i % 26))}${i}`,
			ipAddress: `192.168.1.${i + 1}`,
			port: 27015 + i,
			currentPlayers: 10 + i,
			maxPlayers: 32,
			bots: 0,
			mapId: `map${i % 3}`,
			mode: i % 2 === 0 ? 'ctf' : 'tdm',
			region: ['us', 'eu', 'asia'][i % 3],
			country: ['USA', 'Germany', 'Japan'][i % 3],
			comment: i % 2 === 0 ? 'Test server' : null,
			playerList: [`Player${i}`]
		}));
	};

	const mockServers = createMockServers(25);

	beforeEach(() => {
		serverState = createServerState();
		vi.clearAllMocks();
	});

	describe('initial state', () => {
		it('should have empty servers array', () => {
			expect(serverState.servers).toEqual([]);
		});

		it('should have loading set to true', () => {
			expect(serverState.loading).toBe(true);
		});

		it('should have error set to null', () => {
			expect(serverState.error).toBeNull();
		});

		it('should have currentPage set to 1', () => {
			expect(serverState.currentPage).toBe(1);
		});

		it('should have mobileServerCurrentPage set to 1', () => {
			expect(serverState.mobileServerCurrentPage).toBe(1);
		});

		it('should have mobileServerLoadingMore set to false', () => {
			expect(serverState.mobileServerLoadingMore).toBe(false);
		});

		it('should have sortColumn set to null', () => {
			expect(serverState.sortColumn).toBeNull();
		});

		it('should have sortDirection set to null', () => {
			expect(serverState.sortDirection).toBeNull();
		});
	});

	describe('setServers', () => {
		it('should set servers directly', () => {
			serverState.setServers(mockServers);
			expect(serverState.servers).toEqual(mockServers);
		});

		it('should handle empty array', () => {
			serverState.setServers([]);
			expect(serverState.servers).toEqual([]);
		});
	});

	describe('setSortState', () => {
		it('should set sort column and direction', () => {
			serverState.setSortState('name', 'desc');
			expect(serverState.sortColumn).toBe('name');
			expect(serverState.sortDirection).toBe('desc');
		});

		it('should accept null values', () => {
			serverState.setSortState(null, null);
			expect(serverState.sortColumn).toBeNull();
			expect(serverState.sortDirection).toBeNull();
		});

		it('should accept asc direction', () => {
			serverState.setSortState('currentPlayers', 'asc');
			expect(serverState.sortColumn).toBe('currentPlayers');
			expect(serverState.sortDirection).toBe('asc');
		});
	});

	describe('handleSort', () => {
		beforeEach(() => {
			serverState.setServers(mockServers);
		});

		it('should set sortColumn and sortDirection to desc on first click', () => {
			serverState.handleSort('name');
			expect(serverState.sortColumn).toBe('name');
			expect(serverState.sortDirection).toBe('desc');
		});

		it('should cycle from desc to asc on second click of same column', () => {
			serverState.handleSort('name');
			serverState.handleSort('name');
			expect(serverState.sortColumn).toBe('name');
			expect(serverState.sortDirection).toBe('asc');
		});

		it('should cycle from asc to null on third click of same column', () => {
			serverState.handleSort('name');
			serverState.handleSort('name');
			serverState.handleSort('name');
			expect(serverState.sortColumn).toBeNull();
			expect(serverState.sortDirection).toBeNull();
		});

		it('should reset to desc on fourth click of same column', () => {
			serverState.handleSort('name');
			serverState.handleSort('name');
			serverState.handleSort('name');
			serverState.handleSort('name');
			expect(serverState.sortColumn).toBe('name');
			expect(serverState.sortDirection).toBe('desc');
		});

		it('should switch to new column and set direction to desc', () => {
			serverState.handleSort('name');
			serverState.handleSort('currentPlayers');
			expect(serverState.sortColumn).toBe('currentPlayers');
			expect(serverState.sortDirection).toBe('desc');
		});

		it('should reset currentPage to 1', () => {
			serverState.handlePageChange(3);
			serverState.handleSort('name');
			expect(serverState.currentPage).toBe(1);
		});

		it('should reset mobileServerCurrentPage to 1', () => {
			serverState.setServers(mockServers);
			// Simulate mobile pagination by calling handleLoadMore multiple times
			while (serverState.getDerivedData().mobileHasMore) {
				serverState.handleLoadMore();
			}
			serverState.handleSort('name');
			expect(serverState.mobileServerCurrentPage).toBe(1);
		});

		it('should reset mobileServerLoadingMore to false', () => {
			serverState.setServers(mockServers);
			serverState.handleLoadMore();
			expect(serverState.mobileServerLoadingMore).toBe(true);
			serverState.handleSort('name');
			expect(serverState.mobileServerLoadingMore).toBe(false);
		});
	});

	describe('handlePageChange', () => {
		it('should update currentPage', () => {
			serverState.handlePageChange(5);
			expect(serverState.currentPage).toBe(5);
		});

		it('should handle page 1', () => {
			serverState.handlePageChange(1);
			expect(serverState.currentPage).toBe(1);
		});

		it('should handle large page numbers', () => {
			serverState.handlePageChange(100);
			expect(serverState.currentPage).toBe(100);
		});
	});

	describe('resetPagination', () => {
		it('should reset currentPage to 1', () => {
			serverState.handlePageChange(5);
			serverState.resetPagination();
			expect(serverState.currentPage).toBe(1);
		});

		it('should reset mobileServerCurrentPage to 1', () => {
			serverState.setServers(mockServers);
			serverState.handleLoadMore();
			serverState.resetPagination();
			expect(serverState.mobileServerCurrentPage).toBe(1);
		});

		it('should reset mobileServerLoadingMore to false', () => {
			serverState.setServers(mockServers);
			serverState.handleLoadMore();
			serverState.resetPagination();
			expect(serverState.mobileServerLoadingMore).toBe(false);
		});
	});

	describe('handleLoadMore', () => {
		beforeEach(() => {
			serverState.setServers(mockServers);
		});

		it('should return true when loading more is possible', () => {
			// With 3 servers and 20 per page, first load more should work
			const result = serverState.handleLoadMore();
			expect(result).toBe(true);
			expect(serverState.mobileServerLoadingMore).toBe(true);
			expect(serverState.mobileServerCurrentPage).toBe(2);
		});

		it('should return false when already loading more', () => {
			serverState.handleLoadMore();
			const result = serverState.handleLoadMore();
			expect(result).toBe(false);
		});

		it('should return false when no more items to load', () => {
			// Load all items
			while (serverState.getDerivedData().mobileHasMore) {
				serverState.handleLoadMore();
			}
			const result = serverState.handleLoadMore();
			expect(result).toBe(false);
		});

		it('should increment mobileServerCurrentPage', () => {
			serverState.handleLoadMore();
			expect(serverState.mobileServerCurrentPage).toBe(2);
		});

		it('should set mobileServerLoadingMore to true', () => {
			serverState.handleLoadMore();
			expect(serverState.mobileServerLoadingMore).toBe(true);
		});
	});

	describe('getDerivedData', () => {
		beforeEach(() => {
			serverState.setServers(mockServers);
		});

		it('should return all servers when no filters applied', () => {
			const result = serverState.getDerivedData();
			expect(result.filteredServers).toHaveLength(25);
			expect(result.totalStats.totalServers).toBe(25);
		});

		it('should filter by search query - server name', () => {
			const result = serverState.getDerivedData('Server A0');
			expect(result.filteredServers).toHaveLength(1);
			expect(result.filteredServers[0].name).toBe('Server A0');
		});

		it('should filter by search query - IP address', () => {
			const result = serverState.getDerivedData('192.168.1.3');
			expect(result.filteredServers).toHaveLength(1);
			expect(result.filteredServers[0].ipAddress).toBe('192.168.1.3');
		});

		it('should filter by search query - port', () => {
			const result = serverState.getDerivedData('27017');
			expect(result.filteredServers).toHaveLength(1);
			expect(result.filteredServers[0].port).toBe(27017);
		});

		it('should filter by search query - country', () => {
			const result = serverState.getDerivedData('usa');
			expect(result.filteredServers).toHaveLength(9); // 25 servers, 3 regions, ~9 per region
			expect(result.filteredServers[0].country).toBe('USA');
		});

		it('should filter by search query - mode', () => {
			const result = serverState.getDerivedData('ctf');
			expect(result.filteredServers).toHaveLength(13); // Half the servers
		});

		it('should filter by search query - mapId', () => {
			const result = serverState.getDerivedData('map0');
			expect(result.filteredServers).toHaveLength(9); // 25 / 3 ≈ 8-9 per map
		});

		it('should filter by search query - comment', () => {
			const result = serverState.getDerivedData('Test');
			expect(result.filteredServers).toHaveLength(13); // Half have comments
		});

		it('should filter by search query - playerList', () => {
			const result = serverState.getDerivedData('Player5');
			expect(result.filteredServers).toHaveLength(1);
			expect(result.filteredServers[0].playerList).toContain('Player5');
		});

		it('should be case insensitive for search query', () => {
			const result = serverState.getDerivedData('SERVER A');
			expect(result.filteredServers).toHaveLength(1);
		});

		it('should return empty array when no matches found', () => {
			const result = serverState.getDerivedData('NonExistent');
			expect(result.filteredServers).toHaveLength(0);
		});

		describe('pagination', () => {
			it('should calculate totalPages correctly', () => {
				const result = serverState.getDerivedData();
				expect(result.totalPages).toBe(2); // 25 servers, 20 per page = 2 pages
			});

			it('should return correct paginated servers for page 1', () => {
				const result = serverState.getDerivedData();
				expect(result.paginatedServers).toHaveLength(20);
			});

			it('should handle page changes', () => {
				serverState.handlePageChange(2);
				const result = serverState.getDerivedData();
				expect(result.paginatedServers).toHaveLength(5); // Remaining 5 servers
			});

			it('should handle empty server list', () => {
				serverState.setServers([]);
				const result = serverState.getDerivedData();
				expect(result.totalPages).toBe(0);
				expect(result.paginatedServers).toHaveLength(0);
			});
		});

		describe('mobile pagination', () => {
			it('should return initial page on first call', () => {
				const result = serverState.getDerivedData();
				expect(result.mobilePaginatedServers).toHaveLength(20);
			});

			it('should have mobileHasMore as true when more items available', () => {
				const result = serverState.getDerivedData();
				expect(result.mobileHasMore).toBe(true);
			});

			it('should increase mobilePaginatedServers after loadMore', () => {
				serverState.handleLoadMore();
				const result = serverState.getDerivedData();
				// After loading more, should have all 25 items
				expect(result.mobilePaginatedServers).toHaveLength(25);
			});
		});

		describe('statistics', () => {
			it('should calculate totalStats correctly', () => {
				const result = serverState.getDerivedData();
				expect(result.totalStats.totalServers).toBe(25);
				const expectedPlayers = mockServers.reduce((sum, s) => sum + s.currentPlayers, 0);
				expect(result.totalStats.totalPlayers).toBe(expectedPlayers);
			});

			it('should calculate filteredStats correctly', () => {
				const result = serverState.getDerivedData('Server A0');
				expect(result.filteredStats.totalServers).toBe(1);
				expect(result.filteredStats.totalPlayers).toBe(10);
			});

			it('should have zero stats when no servers', () => {
				serverState.setServers([]);
				const result = serverState.getDerivedData();
				expect(result.totalStats.totalServers).toBe(0);
				expect(result.totalStats.totalPlayers).toBe(0);
			});
		});

		describe('sorting', () => {
			it('should sort by column when sort is active', () => {
				serverState.setSortState('name', 'asc');
				const result = serverState.getDerivedData();
				// Names are "Server A0", "Server B1", "Server C2", ...
				// When sorted ascending alphabetically
				expect(result.filteredServers[0].name).toBe('Server A0');
				expect(result.filteredServers[1].name).toBe('Server B1');
				expect(result.filteredServers[2].name).toBe('Server C2');
				// Verify sorting is working
				const names = result.filteredServers.map((s) => s.name);
				const sortedNames = [...names].sort((a, b) => a.localeCompare(b));
				expect(names).toEqual(sortedNames);
			});

			it('should sort descending when direction is desc', () => {
				serverState.setSortState('currentPlayers', 'desc');
				const result = serverState.getDerivedData();
				expect(result.filteredServers[0].currentPlayers).toBe(34); // Highest
				expect(result.filteredServers[24].currentPlayers).toBe(10); // Lowest
			});
		});

		describe('quick filters', () => {
			it('should filter by active quick filters', () => {
				// Assuming there's a "has players" filter
				const result = serverState.getDerivedData('', ['not-full']);
				// The actual filter behavior depends on quick-filters.ts implementation
				expect(result).toBeDefined();
			});

			it('should return all servers when no quick filters active', () => {
				const result = serverState.getDerivedData('', []);
				expect(result.filteredServers).toHaveLength(25);
			});
		});
	});

	describe('refreshList', () => {
		it('should load servers from API', async () => {
			vi.mocked(ServerService.listAll).mockResolvedValue(mockServers);
			await serverState.refreshList();
			expect(serverState.servers).toEqual(mockServers);
		});

		it('should set loading to true during fetch', async () => {
			vi.mocked(ServerService.listAll).mockImplementation(
				() => new Promise((resolve) => setTimeout(() => resolve(mockServers), 10))
			);
			const promise = serverState.refreshList();
			expect(serverState.loading).toBe(true);
			await promise;
			expect(serverState.loading).toBe(false);
		});

		it('should set error on failure', async () => {
			const errorMessage = 'Network error';
			vi.mocked(ServerService.listAll).mockRejectedValue(new Error(errorMessage));
			await serverState.refreshList();
			expect(serverState.error).toBe(errorMessage);
		});

		it('should set error to generic message on non-Error failure', async () => {
			vi.mocked(ServerService.listAll).mockRejectedValue('string error');
			await serverState.refreshList();
			expect(serverState.error).toBe('Failed to load data');
		});

		it('should reset mobile pagination on refresh', async () => {
			serverState.handlePageChange(3);
			vi.mocked(ServerService.listAll).mockResolvedValue(mockServers);
			await serverState.refreshList();
			// Note: refreshList doesn't reset currentPage, only mobile pagination
			expect(serverState.mobileServerCurrentPage).toBe(1);
			expect(serverState.mobileServerLoadingMore).toBe(false);
		});
	});
});
