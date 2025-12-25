import { describe, it, expect } from 'vitest';
import { sortServers, sortPlayers, type SortConfig } from '$lib/utils/sorting';
import type { IDisplayServerItem } from '$lib/models/server.model';
import type { IPlayerItem } from '$lib/models/player.model';

describe('sorting utilities', () => {
	describe('sortServers', () => {
		const mockServers: IDisplayServerItem[] = [
			{
				id: '1',
				name: 'Server C',
				ipAddress: '192.168.1.1',
				port: 27015,
				currentPlayers: 10,
				maxPlayers: 32,
				bots: 2,
				mapId: 'map1',
				mode: 'ctf',
				region: 'us',
				playerList: []
			},
			{
				id: '2',
				name: 'Server A',
				ipAddress: '192.168.1.2',
				port: 27016,
				currentPlayers: 20,
				maxPlayers: 64,
				bots: 0,
				mapId: 'map2',
				mode: 'tdm',
				region: 'eu',
				playerList: []
			},
			{
				id: '3',
				name: 'Server B',
				ipAddress: '192.168.1.3',
				port: 27017,
				currentPlayers: 5,
				maxPlayers: 24,
				bots: 1,
				mapId: 'map3',
				mode: 'ctf',
				region: 'asia',
				playerList: []
			}
		];

		describe('edge cases', () => {
			it('should return original array when column is null', () => {
				const result = sortServers(mockServers, null, 'asc');
				expect(result).toEqual(mockServers);
			});

			it('should return original array when column is undefined', () => {
				const result = sortServers(mockServers, undefined, 'asc');
				expect(result).toEqual(mockServers);
			});

			it('should return original array when direction is null', () => {
				const result = sortServers(mockServers, 'name', null);
				expect(result).toEqual(mockServers);
			});

			it('should return empty array when input is empty', () => {
				const result = sortServers([], 'name', 'asc');
				expect(result).toEqual([]);
			});

			it('should not mutate original array', () => {
				const original = [...mockServers];
				sortServers(mockServers, 'name', 'asc');
				expect(mockServers).toEqual(original);
			});

			it('should handle single element array', () => {
				const singleServer = [mockServers[0]];
				const result = sortServers(singleServer, 'name', 'asc');
				expect(result).toEqual(singleServer);
			});
		});

		describe('numeric column sorting', () => {
			it('should sort by bots ascending', () => {
				const result = sortServers(mockServers, 'bots', 'asc');
				expect(result[0].bots).toBe(0);
				expect(result[1].bots).toBe(1);
				expect(result[2].bots).toBe(2);
			});

			it('should sort by bots descending', () => {
				const result = sortServers(mockServers, 'bots', 'desc');
				expect(result[0].bots).toBe(2);
				expect(result[1].bots).toBe(1);
				expect(result[2].bots).toBe(0);
			});

			it('should sort by playerCount ascending', () => {
				const result = sortServers(mockServers, 'playerCount', 'asc');
				expect(result[0].currentPlayers).toBe(5);
				expect(result[1].currentPlayers).toBe(10);
				expect(result[2].currentPlayers).toBe(20);
			});

			it('should sort by currentPlayers ascending (alias for playerCount)', () => {
				const result = sortServers(mockServers, 'currentPlayers', 'asc');
				expect(result[0].currentPlayers).toBe(5);
				expect(result[1].currentPlayers).toBe(10);
				expect(result[2].currentPlayers).toBe(20);
			});

			it('should sort by maxPlayers ascending', () => {
				const result = sortServers(mockServers, 'maxPlayers', 'asc');
				expect(result[0].maxPlayers).toBe(24);
				expect(result[1].maxPlayers).toBe(32);
				expect(result[2].maxPlayers).toBe(64);
			});

			it('should sort by port ascending', () => {
				const result = sortServers(mockServers, 'port', 'asc');
				expect(result[0].port).toBe(27015);
				expect(result[1].port).toBe(27016);
				expect(result[2].port).toBe(27017);
			});
		});

		describe('string column sorting', () => {
			it('should sort by name ascending (case-insensitive)', () => {
				const result = sortServers(mockServers, 'name', 'asc');
				expect(result[0].name).toBe('Server A');
				expect(result[1].name).toBe('Server B');
				expect(result[2].name).toBe('Server C');
			});

			it('should sort by name descending', () => {
				const result = sortServers(mockServers, 'name', 'desc');
				expect(result[0].name).toBe('Server C');
				expect(result[1].name).toBe('Server B');
				expect(result[2].name).toBe('Server A');
			});

			it('should sort by region ascending', () => {
				const result = sortServers(mockServers, 'region', 'asc');
				expect(result[0].region).toBe('asia');
				expect(result[1].region).toBe('eu');
				expect(result[2].region).toBe('us');
			});

			it('should sort by mode ascending', () => {
				const result = sortServers(mockServers, 'mode', 'asc');
				expect(result[0].mode).toBe('ctf');
				expect(result[1].mode).toBe('ctf');
				expect(result[2].mode).toBe('tdm');
			});
		});

		describe('unknown column handling', () => {
			it('should handle unknown column gracefully with empty string fallback', () => {
				const result = sortServers(mockServers, 'unknownColumn', 'asc');
				// All values are empty string, so order should be stable
				expect(result).toHaveLength(3);
			});
		});
	});

	describe('sortPlayers', () => {
		const mockPlayers: IPlayerItem[] = [
			{
				id: '1',
				rowNumber: 3,
				username: 'Charlie',
				kills: 50,
				deaths: 20,
				score: 1000,
				kd: 2.5,
				timePlayed: 5000,
				rankProgression: 75,
				rankName: 'General'
			},
			{
				id: '2',
				rowNumber: 1,
				username: 'Alice',
				kills: 100,
				deaths: 50,
				score: 2000,
				kd: 2.0,
				timePlayed: 10000,
				rankProgression: 90,
				rankName: 'Colonel'
			},
			{
				id: '3',
				rowNumber: 2,
				username: 'Bob',
				kills: 30,
				deaths: 10,
				score: 500,
				kd: 3.0,
				timePlayed: 3000,
				rankProgression: 50,
				rankName: 'Major'
			}
		];

		describe('edge cases', () => {
			it('should return original array when column is null', () => {
				const result = sortPlayers(mockPlayers, null, 'desc');
				expect(result).toEqual(mockPlayers);
			});

			it('should return original array when direction is null', () => {
				const result = sortPlayers(mockPlayers, 'username', null);
				expect(result).toEqual(mockPlayers);
			});

			it('should return empty array when input is empty', () => {
				const result = sortPlayers([], 'username', 'desc');
				expect(result).toEqual([]);
			});

			it('should not mutate original array', () => {
				const original = [...mockPlayers];
				sortPlayers(mockPlayers, 'username', 'desc');
				expect(mockPlayers).toEqual(original);
			});

			it('should handle single element array', () => {
				const singlePlayer = [mockPlayers[0]];
				const result = sortPlayers(singlePlayer, 'username', 'desc');
				expect(result).toEqual(singlePlayer);
			});
		});

		describe('numeric column sorting', () => {
			it('should sort by kills descending', () => {
				const result = sortPlayers(mockPlayers, 'kills', 'desc');
				expect(result[0].kills).toBe(100);
				expect(result[1].kills).toBe(50);
				expect(result[2].kills).toBe(30);
			});

			it('should sort by deaths descending', () => {
				const result = sortPlayers(mockPlayers, 'deaths', 'desc');
				expect(result[0].deaths).toBe(50);
				expect(result[1].deaths).toBe(20);
				expect(result[2].deaths).toBe(10);
			});

			it('should sort by score descending', () => {
				const result = sortPlayers(mockPlayers, 'score', 'desc');
				expect(result[0].score).toBe(2000);
				expect(result[1].score).toBe(1000);
				expect(result[2].score).toBe(500);
			});

			it('should sort by kd descending', () => {
				const result = sortPlayers(mockPlayers, 'kd', 'desc');
				expect(result[0].kd).toBe(3.0);
				expect(result[1].kd).toBe(2.5);
				expect(result[2].kd).toBe(2.0);
			});

			it('should sort by timePlayed descending', () => {
				const result = sortPlayers(mockPlayers, 'timePlayed', 'desc');
				expect(result[0].timePlayed).toBe(10000);
				expect(result[1].timePlayed).toBe(5000);
				expect(result[2].timePlayed).toBe(3000);
			});

			it('should sort by rankProgression descending', () => {
				const result = sortPlayers(mockPlayers, 'rankProgression', 'desc');
				expect(result[0].rankProgression).toBe(90);
				expect(result[1].rankProgression).toBe(75);
				expect(result[2].rankProgression).toBe(50);
			});

			it('should sort by rowNumber descending', () => {
				const result = sortPlayers(mockPlayers, 'rowNumber', 'desc');
				expect(result[0].rowNumber).toBe(3);
				expect(result[1].rowNumber).toBe(2);
				expect(result[2].rowNumber).toBe(1);
			});
		});

		describe('string column sorting', () => {
			it('should sort by username descending (case-insensitive)', () => {
				const result = sortPlayers(mockPlayers, 'username', 'desc');
				expect(result[0].username).toBe('Charlie');
				expect(result[1].username).toBe('Bob');
				expect(result[2].username).toBe('Alice');
			});

			it('should sort by rankName descending', () => {
				const result = sortPlayers(mockPlayers, 'rankName', 'desc');
				expect(result[0].rankName).toBe('Major');
				expect(result[1].rankName).toBe('General');
				expect(result[2].rankName).toBe('Colonel');
			});
		});

		describe('null handling', () => {
			it('should handle null values as 0 for numeric sorting', () => {
				const playersWithNulls: IPlayerItem[] = [
					{ ...mockPlayers[0], kills: null as unknown as number },
					{ ...mockPlayers[1], kills: 100 },
					{ ...mockPlayers[2], kills: 30 }
				];
				const result = sortPlayers(playersWithNulls, 'kills', 'desc');
				// null is treated as 0 in comparison, so order is: 100, 30, null
				expect(result[0].kills).toBe(100);
				expect(result[1].kills).toBe(30);
				expect(result[2].kills).toBeNull(); // original value unchanged
			});
		});

		describe('unknown column handling', () => {
			it('should handle unknown column with empty string fallback', () => {
				const result = sortPlayers(mockPlayers, 'unknownColumn', 'desc');
				// All values fallback to empty string
				expect(result).toHaveLength(3);
			});
		});
	});

	describe('SortConfig interface', () => {
		it('should accept valid sort config', () => {
			const config: SortConfig = {
				key: 'name',
				direction: 'asc'
			};
			expect(config.key).toBe('name');
			expect(config.direction).toBe('asc');
		});

		it('should accept null direction', () => {
			const config: SortConfig = {
				key: 'name',
				direction: null
			};
			expect(config.direction).toBeNull();
		});
	});
});
