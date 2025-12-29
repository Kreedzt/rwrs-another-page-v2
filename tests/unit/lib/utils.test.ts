import { describe, test, expect, vi } from 'vitest';
import {
	parseServerListFromString,
	getMapKey,
	getCurrentTimeStr,
	generateEmptyOnlineStatItem
} from '$lib/share/utils';
import type { IDisplayServerItem } from '$lib/models/data-table.model';

describe('XML Player List Parsing', () => {
	describe('fixPlayerList function (via parseServerListFromString)', () => {
		test('should filter out empty string players', () => {
			// Create XML with empty player entries
			const xmlWithEmptyPlayers = `<?xml version="1.0" encoding="UTF-8"?>
<result value="1">
	<server_list>
		<server>
			<name>Test Server</name>
			<address>192.168.1.1</address>
			<port>27015</port>
			<current_players>3</current_players>
			<max_players>32</max_players>
			<player>Player1</player>
			<player></player>
			<player>Player3</player>
			<player/>
			<player>Player5</player>
		</server>
	</server_list>
</result>`;

			const result = parseServerListFromString(xmlWithEmptyPlayers);

			// Should only include non-empty players
			expect(result).toHaveLength(1);
			expect(result[0].playerList).toEqual(['Player1', 'Player3', 'Player5']);
			expect(result[0].playerList).not.toContain('');
		});

		test('should filter out whitespace-only players', () => {
			// Create XML with whitespace-only player entries
			const xmlWithWhitespacePlayers = `<?xml version="1.0" encoding="UTF-8"?>
<result value="1">
	<server_list>
		<server>
			<name>Test Server</name>
			<address>192.168.1.1</address>
			<port>27015</port>
			<current_players>2</current_players>
			<max_players>32</max_players>
			<player>Player1</player>
			<player>   </player>
			<player>	Player2	</player>
			<player>
			</player>
		</server>
	</server_list>
</result>`;

			const result = parseServerListFromString(xmlWithWhitespacePlayers);

			// Should only include players with actual content, trim whitespace
			expect(result).toHaveLength(1);
			expect(result[0].playerList).toEqual(['Player1', 'Player2']);
			expect(result[0].playerList).not.toContain('   ');
			expect(result[0].playerList).not.toContain('		');
		});

		test('should handle normal player entries correctly', () => {
			// Create XML with normal player entries
			const xmlWithNormalPlayers = `<?xml version="1.0" encoding="UTF-8"?>
<result value="1">
	<server_list>
		<server>
			<name>Test Server</name>
			<address>192.168.1.1</address>
			<port>27015</port>
			<current_players>3</current_players>
			<max_players>32</max_players>
			<player>Player1</player>
			<player>Player2</player>
			<player>Player3</player>
		</server>
	</server_list>
</result>`;

			const result = parseServerListFromString(xmlWithNormalPlayers);

			// Should include all normal players
			expect(result).toHaveLength(1);
			expect(result[0].playerList).toEqual(['Player1', 'Player2', 'Player3']);
		});

		test('should handle missing player field', () => {
			// Create XML without any player entries
			const xmlWithoutPlayers = `<?xml version="1.0" encoding="UTF-8"?>
<result value="1">
	<server_list>
		<server>
			<name>Test Server</name>
			<address>192.168.1.1</address>
			<port>27015</port>
			<current_players>0</current_players>
			<max_players>32</max_players>
		</server>
	</server_list>
</result>`;

			const result = parseServerListFromString(xmlWithoutPlayers);

			// Should return empty player list
			expect(result).toHaveLength(1);
			expect(result[0].playerList).toEqual([]);
		});

		test('should handle null and undefined player values', () => {
			// Create XML with mixed player data (simulating parser output)
			const xmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<result value="1">
	<server_list>
		<server>
			<name>Test Server</name>
			<address>192.168.1.1</address>
			<port>27015</port>
			<current_players>2</current_players>
			<max_players>32</max_players>
			<player>ValidPlayer</player>
			<player></player>
			<player>AnotherValidPlayer</player>
		</server>
	</server_list>
</result>`;

			const result = parseServerListFromString(xmlResponse);

			// Should only include valid players
			expect(result).toHaveLength(1);
			expect(result[0].playerList).toEqual(['ValidPlayer', 'AnotherValidPlayer']);
		});

		test('should handle array of players from XML parser', () => {
			// Some XML parsers might return arrays for multiple entries
			const xmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<result value="1">
	<server_list>
		<server>
			<name>Test Server</name>
			<address>192.168.1.1</address>
			<port>27015</port>
			<current_players>4</current_players>
			<max_players>32</max_players>
			<player>Player1</player>
			<player>Player2</player>
			<player></player>
			<player>Player4</player>
		</server>
	</server_list>
</result>`;

			const result = parseServerListFromString(xmlResponse);

			// Should filter out empty players and keep valid ones
			expect(result).toHaveLength(1);
			expect(result[0].playerList).toEqual(['Player1', 'Player2', 'Player4']);
		});

		test('should handle players with special characters and spaces', () => {
			// Create XML with players containing special characters and edge cases
			const xmlWithSpecialChars = `<?xml version="1.0" encoding="UTF-8"?>
<result value="1">
	<server_list>
		<server>
			<name>Test Server</name>
			<address>192.168.1.1</address>
			<port>27015</port>
			<current_players>4</current_players>
			<max_players>32</max_players>
			<player>[Admin] PlayerName</player>
			<player>Player with spaces</player>
			<player>   </player>
			<player>Player-Name_123</player>
		</server>
	</server_list>
</result>`;

			const result = parseServerListFromString(xmlWithSpecialChars);

			// Should preserve valid players with special characters
			expect(result).toHaveLength(1);
			expect(result[0].playerList).toEqual([
				'[Admin] PlayerName',
				'Player with spaces',
				'Player-Name_123'
			]);
		});
	});
});

describe('Utility Functions', () => {
	describe('getMapKey function', () => {
		test('should generate correct map key from server item', () => {
			const server: IDisplayServerItem = {
				id: '1',
				name: 'Test Server',
				ipAddress: '192.168.1.1',
				port: 27015,
				mapId: 'test_map',
				mapName: 'Test Map',
				bots: 0,
				country: 'US',
				currentPlayers: 10,
				timeStamp: 1234567890,
				version: '1.0',
				dedicated: true,
				mod: false,
				playerList: [],
				comment: '',
				url: '',
				maxPlayers: 32,
				mode: 'COOP',
				realm: 'official_invasion'
			};

			const result = getMapKey(server);
			expect(result).toBe('192.168.1.1:27015');
		});

		test('should handle different IP and port combinations', () => {
			const server1: IDisplayServerItem = {
				id: '1',
				name: 'Server 1',
				ipAddress: '127.0.0.1',
				port: 8080,
				mapId: '',
				mapName: '',
				bots: 0,
				country: '',
				currentPlayers: 0,
				timeStamp: 0,
				version: '',
				dedicated: false,
				mod: false,
				playerList: [],
				comment: '',
				url: '',
				maxPlayers: 0,
				mode: '',
				realm: null
			};

			const server2: IDisplayServerItem = {
				...server1,
				ipAddress: '10.0.0.1',
				port: 7777
			};

			expect(getMapKey(server1)).toBe('127.0.0.1:8080');
			expect(getMapKey(server2)).toBe('10.0.0.1:7777');
		});

		test('should handle edge cases like localhost and special ports', () => {
			const localhostServer: IDisplayServerItem = {
				id: '1',
				name: 'Local Server',
				ipAddress: 'localhost',
				port: 27015,
				mapId: '',
				mapName: '',
				bots: 0,
				country: '',
				currentPlayers: 0,
				timeStamp: 0,
				version: '',
				dedicated: false,
				mod: false,
				playerList: [],
				comment: '',
				url: '',
				maxPlayers: 0,
				mode: '',
				realm: null
			};

			const result = getMapKey(localhostServer);
			expect(result).toBe('localhost:27015');
		});
	});

	describe('getCurrentTimeStr function', () => {
		test('should return current time in correct format', () => {
			const result = getCurrentTimeStr();

			// Should match format: YYYY-MM-DD HH:MM:SS
			expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
		});

		test('should pad single digits with zeros', () => {
			// Mock Date to ensure consistent testing
			const mockDate = new Date('2024-01-05T03:07:09');
			vi.useFakeTimers();
			vi.setSystemTime(mockDate);

			const result = getCurrentTimeStr();
			expect(result).toBe('2024-01-05 03:07:09');

			vi.useRealTimers();
		});

		test('should handle leap year and end of month correctly', () => {
			const mockDate = new Date('2024-02-29T23:59:59');
			vi.useFakeTimers();
			vi.setSystemTime(mockDate);

			const result = getCurrentTimeStr();
			expect(result).toBe('2024-02-29 23:59:59');

			vi.useRealTimers();
		});
	});

	describe('generateEmptyOnlineStatItem function', () => {
		test('should return OnlineStats with all zeros', () => {
			const result = generateEmptyOnlineStatItem();

			expect(result).toEqual({
				onlineServerCount: 0,
				allServerCount: 0,
				onlinePlayerCount: 0,
				playerCapacityCount: 0
			});
		});

		test('should return a new object each time', () => {
			const result1 = generateEmptyOnlineStatItem();
			const result2 = generateEmptyOnlineStatItem();

			// Should not be the same reference
			expect(result1).not.toBe(result2);

			// But should have the same values
			expect(result1).toEqual(result2);
		});

		test('should return object with correct structure', () => {
			const result = generateEmptyOnlineStatItem();

			// Check that all required properties exist
			expect(result).toHaveProperty('onlineServerCount');
			expect(result).toHaveProperty('allServerCount');
			expect(result).toHaveProperty('onlinePlayerCount');
			expect(result).toHaveProperty('playerCapacityCount');

			// Check that all values are numbers
			expect(typeof result.onlineServerCount).toBe('number');
			expect(typeof result.allServerCount).toBe('number');
			expect(typeof result.onlinePlayerCount).toBe('number');
			expect(typeof result.playerCapacityCount).toBe('number');
		});
	});
});
