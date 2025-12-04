import { describe, test, expect } from 'vitest';
import { parseServerListFromString } from './utils';

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
			expect(result[0].playerList).toEqual(['[Admin] PlayerName', 'Player with spaces', 'Player-Name_123']);
		});
	});
});