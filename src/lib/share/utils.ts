import type { IDisplayServerItem, OnlineStats, IRes } from '$lib/models/data-table.model';
import { XMLParser } from 'fast-xml-parser';

const fixPlayerList = (raw: string | undefined | string[]): string[] => {
	if (Array.isArray(raw)) {
		return raw.map((player) => player.toString());
	}

	if (typeof raw === 'string') {
		return [raw];
	}

	return [];
};

export const getMapKey = (s: IDisplayServerItem) => {
	return `${s.ipAddress}:${s.port}`;
};

export const parseServerListFromString = (resString: string): IDisplayServerItem[] => {
	const parser = new XMLParser();
	const res = parser.parse(resString) as IRes;

	// Handle both XML structures: direct <server> array or nested <server_list>
	const servers = res.result?.server_list?.server || res.result?.server || [];

	// Handle case where parser returns object instead of array for single server
	const serverArray = Array.isArray(servers) ? servers : servers ? [servers] : [];

	if (serverArray.length === 0) {
		return [];
	}

	const serverList: IDisplayServerItem[] = serverArray.map((server: any, index) => {
		const block: IDisplayServerItem = {
			id: index.toString(),
			name: server.name?.toString() || '',
			ipAddress: server.address || '',
			port: server.port || 0,
			mapId: server.map_id?.toString() || '',
			mapName: server.map_name?.toString() || '',
			bots: Number(server.bots) || 0,
			country: server.country?.toString() || '',
			currentPlayers: Number(server.current_players) || 0,
			timeStamp: Number(server.timestamp) || 0,
			version: server.version?.toString() || '',
			dedicated: server.dedicated === 1,
			mod: server.mod === 1,
			playerList: fixPlayerList(server.player),
			comment: server.comment?.toString() || '',
			url: server.url?.toString() || '',
			maxPlayers: Number(server.max_players) || 0,
			mode: server.mode?.toString() || '',
			realm: server.realm?.toString() || null
		};

		return block;
	});

	return serverList;
};

export const getCurrentTimeStr = () => {
	const date = new Date();

	const yearStr = date.getFullYear();
	const monthStr = (date.getMonth() + 1).toString().padStart(2, '0');
	const dateStr = date.getDate().toString().padStart(2, '0');
	const hourStr = date.getHours().toString().padStart(2, '0');
	const minuteStr = date.getMinutes().toString().padStart(2, '0');
	const secondStr = date.getSeconds().toString().padStart(2, '0');

	const fullStr =
		yearStr + '-' + monthStr + '-' + dateStr + ' ' + hourStr + ':' + minuteStr + ':' + secondStr;

	return fullStr;
};

export const generateEmptyOnlineStatItem = (): OnlineStats => {
	const temp: OnlineStats = {
		onlineServerCount: 0,
		allServerCount: 0,
		onlinePlayerCount: 0,
		playerCapacityCount: 0
	};

	return temp;
};

// export const isServerMatch = (env: ENV, server: IDisplayServerItem): boolean => {
//   if (!!env.SERVER_MATCH_REALM) {
//     return (
//       new RegExp(env.SERVER_MATCH_REGEX).test(server.name) &&
//       server.realm === env.SERVER_MATCH_REALM
//     );
//   }

//   return new RegExp(env.SERVER_MATCH_REGEX).test(server.name);
// };
