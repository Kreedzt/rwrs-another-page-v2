import type { IResServerItem, IDisplayServerItem } from '$lib/models/data-table.model';

// Mock server data generator based on real API response
export class MockDataGenerator {
	private static usedIds = new Set<string>();

	// Sample data from real API response
	private static sampleServerNames = [
		'InvasionASIA6',
		'[Castling][Temp LV4]',
		'[Castling][GFL-5 LV4]',
		'InvasionEU1',
		'InvasionASIA5',
		'InvasionUSWest1',
		'WW2InvasionCN2',
		'InvasionJP2',
		'[GFLNP][CN14][Extreme][Loot]',
		'[地狱潜兵] 挂机/抽卡/赛车服',
		'RATBUG',
		'WEKILLEVERYBODY',
		'DominanceASIA2',
		'RWTD - Outbreak Gaming'
	];

	private static samplePlayerNames = [
		'HP',
		'REPAIR COMING!!',
		'CHEN WAN',
		'PONKOTSUTENSHI',
		'MR.BIGPY',
		'CLOWNPIECE',
		'S_X',
		'MR. FOKING',
		'SUBWAY',
		'MR.MSRX97',
		'CONSTANT',
		'BLACKANDREW',
		'DAMOCLÉS',
		'RIHO',
		'MR. GREEN92',
		'LUOXUANZAO',
		'MIYING',
		'WCSSSSS',
		'BEETCHER',
		'MR. 1374',
		'RAY SPHERELLI',
		'BIKABAKA',
		'PANZER3',
		'2006YT',
		'WARP NSA'
	];

	private static sampleCountries = [
		'Asia',
		'China',
		'Germany',
		'USA, LA',
		'Japan',
		'Australia',
		'Canada',
		'United States',
		'Not set',
		'Nederland',
		'United Kingdom'
	];

	private static sampleMapIds = [
		'media/packages/vanilla.desert/maps/map6',
		'media/packages/GFL_Castling/maps/map105_2',
		'media/packages/vanilla/maps/map8',
		'media/packages/vanilla.desert/maps/map5',
		'media/packages/vanilla/maps/map18',
		'media/packages/pacific/maps/island1',
		'media/packages/vanilla.desert/maps/map9',
		'media/packages/vanilla/maps/map14',
		'media/packages/vanilla/maps/map21',
		'media/packages/vanilla/maps/map11',
		'media/packages/vanilla.desert/maps/map10',
		'media/packages/vanilla/maps/map2',
		'media/packages/hell_diver/maps/race1',
		'media/packages/hell_diver/maps/def_lab_koth',
		'media/packages/vanilla/maps/map1',
		'media/packages/Running_with_the_Dead/maps/rwd_map1'
	];

	private static sampleModes = [
		'COOP',
		'Castling',
		'GFL [INF]',
		'DOM',
		'PvE',
		'HD Race',
		'HD L15',
		'HD L9',
		'HD Vanilla',
		''
	];

	private static sampleComments = [
		'Coop campaign',
		'Read server rules in our discord: discord.gg/wwUM3kYmRC',
		'GFL mod QQ qun: 586155883',
		'地狱潜兵模组 QQ：498520233',
		'Dominance PvP',
		'WW2 Coop campaign',
		'Running with the Dead',
		'新手服 Servers for starters. 75% enemies, 80% XP.',
		'人类 VS 人类模式，接近原版玩法。',
		''
	];

	private static generateUniqueServerName(): string {
		const baseName =
			this.sampleServerNames[Math.floor(Math.random() * this.sampleServerNames.length)];
		const suffix = Math.floor(Math.random() * 1000);
		return `${baseName}_${suffix}`;
	}

	private static generateIpAddress(): string {
		return Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join('.');
	}

	private static generatePort(): number {
		return Math.floor(Math.random() * (65535 - 1024) + 1024);
	}

	private static generatePlayerList(currentPlayers: number): string[] {
		const players: string[] = [];
		for (let i = 0; i < currentPlayers; i++) {
			players.push(
				this.samplePlayerNames[Math.floor(Math.random() * this.samplePlayerNames.length)]
			);
		}
		return players;
	}

	static generateMockServer(overrides: Partial<IResServerItem> = {}): IResServerItem {
		const currentPlayers = Math.floor(Math.random() * 30); // 0-29 players
		const maxPlayers = Math.max(2, Math.floor(Math.random() * 65)); // 2-64 players
		const dedicated = Math.random() > 0.2; // 80% chance dedicated
		const hasMod = Math.random() > 0.5; // 50% chance has mod

		const server: IResServerItem = {
			name: this.generateUniqueServerName(),
			address: this.generateIpAddress(),
			port: this.generatePort(),
			map_id: this.sampleMapIds[Math.floor(Math.random() * this.sampleMapIds.length)],
			map_name: '',
			bots: Math.floor(Math.random() * 300), // 0-299 bots
			country: this.sampleCountries[Math.floor(Math.random() * this.sampleCountries.length)],
			current_players: Math.min(currentPlayers, maxPlayers),
			timeStamp: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 3600), // Last hour
			version: '1.98.1',
			dedicated: dedicated ? 1 : 0,
			mod: hasMod ? 1 : 0,
			player: this.generatePlayerList(Math.min(currentPlayers, maxPlayers)),
			comment: this.sampleComments[Math.floor(Math.random() * this.sampleComments.length)],
			url: hasMod && Math.random() > 0.5 ? 'https://example.com' : '',
			max_players: maxPlayers,
			mode: this.sampleModes[Math.floor(Math.random() * this.sampleModes.length)],
			realm: Math.random() > 0.5 ? 'official_invasion' : ''
		};

		return { ...server, ...overrides };
	}

	static generateMockServers(
		count: number,
		overrides: Partial<IResServerItem> = {}
	): IResServerItem[] {
		const servers: IResServerItem[] = [];
		for (let i = 0; i < count; i++) {
			servers.push(this.generateMockServer(overrides));
		}
		return servers;
	}

	// Generate servers with specific scenarios for testing
	static generateTestScenarios(): {
		emptyServers: IResServerItem[];
		fullServers: IResServerItem[];
		mixedCapacity: IResServerItem[];
		serversWithBots: IResServerItem[];
		noBotsServers: IResServerItem[];
		dedicatedServers: IResServerItem[];
		nonDedicatedServers: IResServerItem[];
		modServers: IResServerItem[];
		vanillaServers: IResServerItem[];
	} {
		return {
			emptyServers: this.generateMockServers(5, { current_players: 0 }),
			fullServers: this.generateMockServers(3, {
				current_players: 20,
				max_players: 20
			}),
			mixedCapacity: [
				this.generateMockServer({ current_players: 2, max_players: 32 }), // 6%
				this.generateMockServer({ current_players: 15, max_players: 32 }), // 47%
				this.generateMockServer({ current_players: 28, max_players: 32 }), // 87%
				this.generateMockServer({ current_players: 32, max_players: 32 }) // 100%
			],
			serversWithBots: this.generateMockServers(5, { bots: 100 }),
			noBotsServers: this.generateMockServers(5, { bots: 0 }),
			dedicatedServers: this.generateMockServers(5, { dedicated: 1 }),
			nonDedicatedServers: this.generateMockServers(5, { dedicated: 0 }),
			modServers: this.generateMockServers(5, { mod: 1 }),
			vanillaServers: this.generateMockServers(5, { mod: 0 })
		};
	}

	// Generate display server items (after processing)
	static generateDisplayServers(
		count: number,
		overrides: Partial<IDisplayServerItem> = {}
	): IDisplayServerItem[] {
		const mockServers = this.generateMockServers(count);
		return mockServers.map((server, index) => ({
			id: `server_${index}_${Date.now()}`,
			name: server.name,
			ipAddress: server.address,
			port: server.port,
			mapId: server.map_id,
			mapName: server.map_name || null,
			bots: server.bots,
			country: server.country,
			currentPlayers: server.current_players,
			timeStamp: server.timeStamp,
			version: server.version,
			dedicated: Boolean(server.dedicated),
			mod: Boolean(server.mod),
			playerList: Array.isArray(server.player) ? server.player : [server.player],
			comment: server.comment || null,
			url: server.url || null,
			maxPlayers: server.max_players,
			mode: server.mode,
			realm: server.realm || null,
			...overrides
		}));
	}

	// Generate realistic server distribution for testing
	static generateRealisticServerList(totalServers = 40): IDisplayServerItem[] {
		const servers: IDisplayServerItem[] = [];
		const scenarios = this.generateTestScenarios();

		// 30% empty servers
		servers.push(
			...this.generateDisplayServers(Math.floor(totalServers * 0.3), {
				currentPlayers: 0,
				bots: Math.floor(Math.random() * 200)
			})
		);

		// 20% low population (1-5 players)
		servers.push(
			...this.generateDisplayServers(Math.floor(totalServers * 0.2), {
				currentPlayers: Math.floor(Math.random() * 5) + 1,
				maxPlayers: Math.floor(Math.random() * 30) + 10,
				bots: Math.floor(Math.random() * 150) + 50
			})
		);

		// 30% medium population (6-15 players)
		servers.push(
			...this.generateDisplayServers(Math.floor(totalServers * 0.3), {
				currentPlayers: Math.floor(Math.random() * 10) + 6,
				maxPlayers: Math.floor(Math.random() * 40) + 20,
				bots: Math.floor(Math.random() * 100) + 100
			})
		);

		// 15% high population (16-30 players)
		servers.push(
			...this.generateDisplayServers(Math.floor(totalServers * 0.15), {
				currentPlayers: Math.floor(Math.random() * 15) + 16,
				maxPlayers: Math.floor(Math.random() * 20) + 32,
				bots: Math.floor(Math.random() * 50) + 200
			})
		);

		// 5% nearly full servers
		servers.push(
			...this.generateDisplayServers(Math.floor(totalServers * 0.05), {
				currentPlayers: (server) => Math.floor(server.maxPlayers * 0.9),
				maxPlayers: Math.floor(Math.random() * 20) + 32,
				bots: Math.floor(Math.random() * 50) + 250
			})
		);

		return servers;
	}

	// Generate XML string that matches the API response format
	static generateMockXmlResponse(serverCount = 20): string {
		const servers = this.generateMockServers(serverCount);
		const serverXml = servers
			.map((server) => {
				const playerXml = Array.isArray(server.player)
					? server.player.map((player) => `<player>${player}</player>`).join('\n\t\t\t\t')
					: `<player>${server.player}</player>`;

				return `<server>
<name>${server.name}</name>
<address>${server.address}</address>
<port>${server.port}</port>
<map_id>${server.map_id}</map_id>
<map_name>${server.map_name}</map_name>
<bots>${server.bots}</bots>
<country>${server.country}</country>
<current_players>${server.current_players}</current_players>
<timestamp>${server.timeStamp}</timestamp>
<version>${server.version}</version>
<dedicated>${server.dedicated}</dedicated>
<mod>${server.mod}</mod>
${playerXml}
<comment>${server.comment}</comment>
<url>${server.url}</url>
<max_players>${server.max_players}</max_players>
<mode>${server.mode}</mode>
<realm>${server.realm}</realm>
</server>`;
			})
			.join('\n');

		return `<?xml version="1.0" encoding="UTF-8"?>
<result value="1">
${serverXml}
</result>`;
	}
}

// Export convenience functions
export const createMockServer = (overrides?: Partial<IResServerItem>) =>
	MockDataGenerator.generateMockServer(overrides);

export const createMockServers = (count: number, overrides?: Partial<IResServerItem>) =>
	MockDataGenerator.generateMockServers(count, overrides);

export const createMockDisplayServers = (count: number, overrides?: Partial<IDisplayServerItem>) =>
	MockDataGenerator.generateDisplayServers(count, overrides);

export const createRealisticServerList = (totalServers = 40) =>
	MockDataGenerator.generateRealisticServerList(totalServers);

export const createTestScenarios = () => MockDataGenerator.generateTestScenarios();

export const createMockXmlResponse = (serverCount = 20) =>
	MockDataGenerator.generateMockXmlResponse(serverCount);
