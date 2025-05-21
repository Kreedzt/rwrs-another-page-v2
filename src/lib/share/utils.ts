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

	const serverList: IDisplayServerItem[] = res.result.server.map((server: any, index) => {
		const block: IDisplayServerItem = {
			id: index.toString(),
			name: server.name.toString(),
			ipAddress: server.address,
			port: server.port,
			mapId: server.map_id.toString(),
			mapName: server.map_name.toString(),
			bots: server.bots,
			country: server.country,
			currentPlayers: server.current_players,
			timeStamp: server.timeStamp,
			version: server.version,
			dedicated: server.dedicated === 1,
			mod: server.mod === 1,
			playerList: fixPlayerList(server.player),
			comment: server.comment,
			url: server.url,
			maxPlayers: server.max_players,
			mode: server.mode.toString(),
			realm: server.realm
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
