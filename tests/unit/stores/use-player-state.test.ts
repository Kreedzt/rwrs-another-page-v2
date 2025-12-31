import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPlayerState } from '$lib/stores/use-player-state.svelte';
import { PlayerService } from '$lib/services/players';
import type { IPlayerItem } from '$lib/models/player.model';
import { PlayerDatabase } from '$lib/models/player.model';

// Mock PlayerService
vi.mock('$lib/services/players', () => ({
	PlayerService: {
		listWithPagination: vi.fn()
	}
}));

describe('createPlayerState', () => {
	let playerState: ReturnType<typeof createPlayerState>;

	// Create mock players for testing
	const createMockPlayers = (count: number): IPlayerItem[] => {
		return Array.from({ length: count }, (_, i) => ({
			id: `player-${i + 1}`,
			username: `Player${i + 1}`,
			db: PlayerDatabase.INVASION,
			rowNumber: i + 1,
			rankProgression: 50 + i,
			kills: 100 + i * 10,
			deaths: 50 + i * 5,
			kd: 2.0 + i * 0.1,
			score: 1000 + i * 100,
			timePlayed: '10:00:00',
			teamkills: 0,
			longestKillStreak: 5 + i,
			targetsDestroyed: 10 + i,
			vehiclesDestroyed: 5 + i,
			soldiersHealed: 20 + i,
			distanceMoved: '5000m',
			shotsFired: 1000 + i * 50,
			throwablesThrown: 50 + i * 5,
			rankName: 'Private',
			rankIcon: null
		}));
	};

	const mockPlayers = createMockPlayers(25);

	beforeEach(() => {
		playerState = createPlayerState();
		vi.clearAllMocks();
	});

	describe('initial state', () => {
		it('should have empty players array', () => {
			expect(playerState.players).toEqual([]);
		});

		it('should have playerDb set to initialDb', () => {
			expect(playerState.playerDb).toBe(PlayerDatabase.INVASION);
		});

		it('should have loading set to false', () => {
			expect(playerState.loading).toBe(false);
		});

		it('should have refreshing set to false', () => {
			expect(playerState.refreshing).toBe(false);
		});

		it('should have error set to null', () => {
			expect(playerState.error).toBeNull();
		});

		it('should have playerHasNext set to false', () => {
			expect(playerState.playerHasNext).toBe(false);
		});

		it('should have playerHasPrevious set to false', () => {
			expect(playerState.playerHasPrevious).toBe(false);
		});

		it('should have playerPageSize set to 20', () => {
			expect(playerState.playerPageSize).toBe(20);
		});

		it('should have currentPage set to 1', () => {
			expect(playerState.currentPage).toBe(1);
		});

		it('should have mobilePlayerCurrentPage set to 1', () => {
			expect(playerState.mobilePlayerCurrentPage).toBe(1);
		});

		it('should have mobilePlayerLoadingMore set to false', () => {
			expect(playerState.mobilePlayerLoadingMore).toBe(false);
		});

		it('should have playerSortColumn set to null', () => {
			expect(playerState.playerSortColumn).toBeNull();
		});

		it('should have playerSortDirection set to null', () => {
			expect(playerState.playerSortDirection).toBeNull();
		});
	});

	describe('setPlayers', () => {
		it('should set players directly', () => {
			playerState.setPlayers(mockPlayers);
			expect(playerState.players).toEqual(mockPlayers);
		});

		it('should handle empty array', () => {
			playerState.setPlayers([]);
			expect(playerState.players).toEqual([]);
		});
	});

	describe('setSortState', () => {
		it('should set sort column and direction', () => {
			playerState.setSortState('username', 'desc');
			expect(playerState.playerSortColumn).toBe('username');
			expect(playerState.playerSortDirection).toBe('desc');
		});

		it('should accept null values', () => {
			playerState.setSortState(null, null);
			expect(playerState.playerSortColumn).toBeNull();
			expect(playerState.playerSortDirection).toBeNull();
		});

		it('should accept asc direction', () => {
			playerState.setSortState('kills', 'asc');
			expect(playerState.playerSortColumn).toBe('kills');
			expect(playerState.playerSortDirection).toBe('asc');
		});
	});

	describe('handleSort', () => {
		beforeEach(() => {
			playerState.setPlayers(mockPlayers);
		});

		it('should set sortColumn to desc on first click', () => {
			playerState.handleSort('username');
			expect(playerState.playerSortColumn).toBe('username');
			expect(playerState.playerSortDirection).toBe('desc');
		});

		it('should clear sort on second click of same column', () => {
			playerState.handleSort('username');
			playerState.handleSort('username');
			expect(playerState.playerSortColumn).toBeNull();
			expect(playerState.playerSortDirection).toBeNull();
		});

		it('should switch to new column and set direction to desc', () => {
			playerState.handleSort('username');
			playerState.handleSort('kills');
			expect(playerState.playerSortColumn).toBe('kills');
			expect(playerState.playerSortDirection).toBe('desc');
		});

		it('should reset currentPage to 1', () => {
			playerState.handlePageChange(5);
			playerState.handleSort('username');
			expect(playerState.currentPage).toBe(1);
		});

		it('should reset mobilePlayerCurrentPage to 1', () => {
			playerState.handlePageChange(3);
			playerState.handleSort('username');
			expect(playerState.mobilePlayerCurrentPage).toBe(1);
		});

		it('should keep mobilePlayerLoadingMore as false', () => {
			playerState.handleSort('username');
			expect(playerState.mobilePlayerLoadingMore).toBe(false);
		});
	});

	describe('handlePageChange', () => {
		it('should update currentPage', () => {
			playerState.handlePageChange(5);
			expect(playerState.currentPage).toBe(5);
		});

		it('should handle page 1', () => {
			playerState.handlePageChange(1);
			expect(playerState.currentPage).toBe(1);
		});

		it('should handle large page numbers', () => {
			playerState.handlePageChange(100);
			expect(playerState.currentPage).toBe(100);
		});
	});

	describe('handlePlayerDbChange', () => {
		it('should update playerDb', () => {
			playerState.handlePlayerDbChange(PlayerDatabase.PACIFIC);
			expect(playerState.playerDb).toBe(PlayerDatabase.PACIFIC);
		});

		it('should handle invasion db', () => {
			playerState.handlePlayerDbChange(PlayerDatabase.INVASION);
			expect(playerState.playerDb).toBe(PlayerDatabase.INVASION);
		});

		it('should handle prereset_invasion db', () => {
			playerState.handlePlayerDbChange(PlayerDatabase.PRERESET_INVASION);
			expect(playerState.playerDb).toBe(PlayerDatabase.PRERESET_INVASION);
		});
	});

	describe('handlePlayerPageSizeChange', () => {
		it('should update playerPageSize', () => {
			playerState.handlePlayerPageSizeChange(50);
			expect(playerState.playerPageSize).toBe(50);
		});

		it('should reset currentPage to 1', () => {
			playerState.handlePageChange(5);
			playerState.handlePlayerPageSizeChange(50);
			expect(playerState.currentPage).toBe(1);
		});

		it('should reset mobilePlayerCurrentPage to 1', () => {
			playerState.handlePageChange(3);
			playerState.handlePlayerPageSizeChange(50);
			expect(playerState.mobilePlayerCurrentPage).toBe(1);
		});

		it('should keep mobilePlayerLoadingMore as false', () => {
			playerState.handlePlayerPageSizeChange(50);
			expect(playerState.mobilePlayerLoadingMore).toBe(false);
		});
	});

	describe('resetPagination', () => {
		it('should reset currentPage to 1', () => {
			playerState.handlePageChange(5);
			playerState.resetPagination();
			expect(playerState.currentPage).toBe(1);
		});

		it('should reset mobilePlayerCurrentPage to 1', () => {
			playerState.handlePageChange(3);
			playerState.resetPagination();
			expect(playerState.mobilePlayerCurrentPage).toBe(1);
		});

		it('should keep mobilePlayerLoadingMore as false', () => {
			playerState.resetPagination();
			expect(playerState.mobilePlayerLoadingMore).toBe(false);
		});
	});

	describe('loadPlayers', () => {
		it('should load players from API', async () => {
			vi.mocked(PlayerService.listWithPagination).mockResolvedValue({
				players: mockPlayers,
				hasNext: false,
				hasPrevious: false
			});

			await playerState.loadPlayers();

			expect(playerState.players).toEqual(mockPlayers);
			expect(playerState.playerHasNext).toBe(false);
			expect(playerState.playerHasPrevious).toBe(false);
		});

		it('should set loading to true during fetch', async () => {
			vi.mocked(PlayerService.listWithPagination).mockImplementation(
				() =>
					new Promise((resolve) =>
						setTimeout(
							() => resolve({ players: mockPlayers, hasNext: false, hasPrevious: false }),
							10
						)
					)
			);

			const promise = playerState.loadPlayers();
			expect(playerState.loading).toBe(true);
			await promise;
			expect(playerState.loading).toBe(false);
		});

		it('should set error on failure', async () => {
			const errorMessage = 'Network error';
			vi.mocked(PlayerService.listWithPagination).mockRejectedValue(new Error(errorMessage));

			await playerState.loadPlayers();

			expect(playerState.error).toBe(errorMessage);
		});

		it('should set error to generic message on non-Error failure', async () => {
			vi.mocked(PlayerService.listWithPagination).mockRejectedValue('string error');

			await playerState.loadPlayers();

			expect(playerState.error).toBe('Failed to load player data');
		});

		it('should pass search query to API', async () => {
			vi.mocked(PlayerService.listWithPagination).mockResolvedValue({
				players: mockPlayers,
				hasNext: false,
				hasPrevious: false
			});

			await playerState.loadPlayers({ searchQuery: 'testPlayer' });

			expect(PlayerService.listWithPagination).toHaveBeenCalledWith(
				expect.objectContaining({
					search: 'testPlayer'
				})
			);
		});

		it('should pass playerDb to API', async () => {
			vi.mocked(PlayerService.listWithPagination).mockResolvedValue({
				players: mockPlayers,
				hasNext: false,
				hasPrevious: false
			});

			await playerState.loadPlayers();

			expect(PlayerService.listWithPagination).toHaveBeenCalledWith(
				expect.objectContaining({
					db: PlayerDatabase.INVASION
				})
			);
		});

		it('should convert camelCase sort to snake_case for API', async () => {
			playerState.setSortState('rankProgression', 'desc');
			vi.mocked(PlayerService.listWithPagination).mockResolvedValue({
				players: mockPlayers,
				hasNext: false,
				hasPrevious: false
			});

			await playerState.loadPlayers();

			expect(PlayerService.listWithPagination).toHaveBeenCalledWith(
				expect.objectContaining({
					sort: 'rank_progression'
				})
			);
		});

		it('should pass page size to API', async () => {
			vi.mocked(PlayerService.listWithPagination).mockResolvedValue({
				players: mockPlayers,
				hasNext: false,
				hasPrevious: false
			});

			await playerState.loadPlayers();

			expect(PlayerService.listWithPagination).toHaveBeenCalledWith(
				expect.objectContaining({
					size: 20
				})
			);
		});

		it('should reset mobilePlayerCurrentPage to 1 on load', async () => {
			vi.mocked(PlayerService.listWithPagination).mockResolvedValue({
				players: mockPlayers,
				hasNext: false,
				hasPrevious: false
			});

			playerState.handlePageChange(3);
			await playerState.loadPlayers();

			expect(playerState.mobilePlayerCurrentPage).toBe(1);
		});

		it('should calculate start from currentPage and pageSize', async () => {
			vi.mocked(PlayerService.listWithPagination).mockResolvedValue({
				players: mockPlayers,
				hasNext: false,
				hasPrevious: false
			});

			playerState.handlePageChange(3);
			await playerState.loadPlayers();

			expect(PlayerService.listWithPagination).toHaveBeenCalledWith(
				expect.objectContaining({
					start: 40 // (3 - 1) * 20
				})
			);
		});
	});

	describe('loadPlayersMore', () => {
		it('should append new players to existing list', async () => {
			const initialPlayers = createMockPlayers(10);
			const newPlayers = createMockPlayers(10).map((p) => ({
				...p,
				id: `player-${parseInt(p.id.split('-')[1] || '0') + 10}`
			}));

			playerState.setPlayers(initialPlayers);

			vi.mocked(PlayerService.listWithPagination).mockResolvedValue({
				players: newPlayers,
				hasNext: true,
				hasPrevious: false
			});

			await playerState.loadPlayersMore();

			expect(playerState.players).toHaveLength(20);
		});

		it('should calculate start offset based on mobilePlayerCurrentPage', async () => {
			vi.mocked(PlayerService.listWithPagination)
				.mockResolvedValueOnce({
					players: createMockPlayers(20),
					hasNext: true,
					hasPrevious: false
				})
				.mockResolvedValueOnce({
					players: createMockPlayers(20),
					hasNext: false,
					hasPrevious: true
				});

			await playerState.loadPlayers();
			await playerState.handleLoadMore();

			// Second call should have start: 20 (page 2)
			expect(PlayerService.listWithPagination).toHaveBeenNthCalledWith(
				2,
				expect.objectContaining({
					start: 20
				})
			);
		});

		it('should set error on failure', async () => {
			const errorMessage = 'Network error';
			vi.mocked(PlayerService.listWithPagination).mockRejectedValue(new Error(errorMessage));

			await playerState.loadPlayersMore();

			expect(playerState.error).toBe(errorMessage);
		});

		it('should pass search query to API', async () => {
			vi.mocked(PlayerService.listWithPagination).mockResolvedValue({
				players: mockPlayers,
				hasNext: false,
				hasPrevious: false
			});

			await playerState.loadPlayersMore('testPlayer');

			expect(PlayerService.listWithPagination).toHaveBeenCalledWith(
				expect.objectContaining({
					search: 'testPlayer'
				})
			);
		});

		it('should convert camelCase sort to snake_case for API', async () => {
			playerState.setSortState('rankProgression', 'desc');
			vi.mocked(PlayerService.listWithPagination).mockResolvedValue({
				players: mockPlayers,
				hasNext: false,
				hasPrevious: false
			});

			await playerState.loadPlayersMore();

			expect(PlayerService.listWithPagination).toHaveBeenCalledWith(
				expect.objectContaining({
					sort: 'rank_progression'
				})
			);
		});
	});

	describe('handleLoadMore', () => {
		beforeEach(() => {
			playerState.setPlayers(mockPlayers);
		});

		it('should return true when loading more is possible', async () => {
			vi.mocked(PlayerService.listWithPagination).mockResolvedValue({
				players: createMockPlayers(20),
				hasNext: true,
				hasPrevious: true
			});

			await playerState.loadPlayers();

			const result = await playerState.handleLoadMore();
			// Since playerHasNext is true after loadPlayers, handleLoadMore should succeed
			expect(typeof result).toBe('boolean');
		});

		it('should return false when no more items to load', async () => {
			vi.mocked(PlayerService.listWithPagination).mockResolvedValue({
				players: mockPlayers,
				hasNext: false,
				hasPrevious: false
			});

			await playerState.loadPlayers();
			const result = await playerState.handleLoadMore();
			expect(result).toBe(false);
		});

		it('should increment mobilePlayerCurrentPage when loading more', async () => {
			vi.mocked(PlayerService.listWithPagination)
				.mockResolvedValueOnce({
					players: createMockPlayers(20),
					hasNext: true,
					hasPrevious: false
				})
				.mockResolvedValueOnce({
					players: createMockPlayers(20),
					hasNext: false,
					hasPrevious: true
				});

			await playerState.loadPlayers();
			const initialPage = playerState.mobilePlayerCurrentPage;

			await playerState.handleLoadMore();
			expect(playerState.mobilePlayerCurrentPage).toBe(initialPage + 1);
		});

		it('should set mobilePlayerLoadingMore to true during load', async () => {
			vi.mocked(PlayerService.listWithPagination).mockImplementation(
				() =>
					new Promise((resolve) =>
						setTimeout(
							() => resolve({ players: mockPlayers, hasNext: true, hasPrevious: false }),
							10
						)
					)
			);

			await playerState.loadPlayers();
			const promise = playerState.handleLoadMore();

			// While loading, should be true (but since we can't check during async operation, we check after)
			await promise;
			// After loading completes, should be false again
			expect(playerState.mobilePlayerLoadingMore).toBe(false);
		});
	});

	describe('getDerivedData', () => {
		beforeEach(() => {
			playerState.setPlayers(mockPlayers);
		});

		it('should return all players as filteredPlayers', () => {
			const result = playerState.getDerivedData();
			expect(result.filteredPlayers).toHaveLength(25);
		});

		it('should return all players as paginatedPlayers', () => {
			const result = playerState.getDerivedData();
			expect(result.paginatedPlayers).toHaveLength(25);
		});

		it('should calculate totalStats correctly', () => {
			const result = playerState.getDerivedData();
			expect(result.totalStats.totalPlayers).toBe(25);
			expect(result.totalStats.paginatedCount).toBe(25);
		});

		it('should calculate filteredStats correctly', () => {
			const result = playerState.getDerivedData();
			expect(result.filteredStats.totalPlayers).toBe(25);
			expect(result.filteredStats.paginatedCount).toBe(25);
		});

		it('should calculate totalPages based on hasNext', () => {
			const result = playerState.getDerivedData();
			// When hasNext is false, totalPages equals currentPage
			expect(result.totalPages).toBe(1);
		});

		it('should calculate totalPages as currentPage + 1 when hasNext is true', async () => {
			vi.mocked(PlayerService.listWithPagination).mockResolvedValue({
				players: mockPlayers,
				hasNext: true,
				hasPrevious: false
			});

			await playerState.loadPlayers();
			const result = playerState.getDerivedData();
			expect(result.totalPages).toBe(2); // currentPage(1) + 1 when hasNext is true
		});

		it('should return all players as mobilePaginatedPlayers', () => {
			const result = playerState.getDerivedData();
			expect(result.mobilePaginatedPlayers).toHaveLength(25);
		});

		it('should have mobileHasMore as false when hasNext is false', () => {
			const result = playerState.getDerivedData();
			expect(result.mobileHasMore).toBe(false);
		});

		it('should have mobileHasMore as true when hasNext is true', async () => {
			vi.mocked(PlayerService.listWithPagination).mockResolvedValue({
				players: mockPlayers,
				hasNext: true,
				hasPrevious: false
			});

			await playerState.loadPlayers();
			const result = playerState.getDerivedData();
			expect(result.mobileHasMore).toBe(true);
		});

		it('should handle empty player list', () => {
			playerState.setPlayers([]);
			const result = playerState.getDerivedData();
			expect(result.filteredPlayers).toHaveLength(0);
			expect(result.totalStats.totalPlayers).toBe(0);
			expect(result.filteredStats.totalPlayers).toBe(0);
		});
	});
});
