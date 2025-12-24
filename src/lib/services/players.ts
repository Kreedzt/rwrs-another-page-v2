import { request } from '$lib/request';
import type { RequestOptions } from '$lib/request';
import type { IPlayerItem, IPlayerListParams, IPlayerService } from '$lib/models/player.model';
import { PlayerDatabase } from '$lib/models/player.model';
import { parsePlayerListFromString, parsePlayerListWithPagination } from '$lib/share/player-utils';

const PLAYER_API_URL = '/api';

const DEFAULT_PARAMS: Partial<IPlayerListParams> = {
	db: PlayerDatabase.INVASION,
	sort: 'rank_progression',
	size: 20
};

export const PlayerService: IPlayerService = {
	async list(params = {}) {
		const queryParams: IPlayerListParams = {
			search: params.search,
			db: params.db ?? DEFAULT_PARAMS.db,
			sort: params.sort ?? DEFAULT_PARAMS.sort,
			start: params.start ?? 0,
			size: params.size ?? DEFAULT_PARAMS.size
		};

		const urlParts = [`${PLAYER_API_URL}/player_list`];
		const searchParams = new URLSearchParams();

		if (queryParams.search) {
			searchParams.append('search', queryParams.search);
		}
		if (queryParams.db) {
			searchParams.append('db', queryParams.db);
		}
		if (queryParams.sort) {
			searchParams.append('sort', queryParams.sort);
		}
		if (queryParams.start !== undefined) {
			searchParams.append('start', queryParams.start.toString());
		}
		if (queryParams.size !== undefined) {
			searchParams.append('size', queryParams.size.toString());
		}

		if (searchParams.toString()) {
			urlParts.push(`?${searchParams.toString()}`);
		}

		const reqUrl = urlParts.join('');

		const requestOptions: RequestOptions = {};
		if (params.timeout) {
			requestOptions.timeout = params.timeout;
		}

		try {
			const timestampedUrl = `${reqUrl}${searchParams.toString() ? '&' : '?'}_t=${Date.now()}`;
			const htmlData = await request<string>(timestampedUrl, requestOptions, 'text');
			return parsePlayerListFromString(htmlData, queryParams.db!);
		} catch (error: any) {
			console.error(`Error fetching player list: ${error.message}`);
			throw error;
		}
	},

	async listWithPagination(params = {}) {
		const queryParams: IPlayerListParams = {
			search: params.search,
			db: params.db ?? DEFAULT_PARAMS.db,
			sort: params.sort ?? DEFAULT_PARAMS.sort,
			start: params.start ?? 0,
			size: params.size ?? DEFAULT_PARAMS.size
		};

		const urlParts = [`${PLAYER_API_URL}/player_list`];
		const searchParams = new URLSearchParams();

		if (queryParams.search) {
			searchParams.append('search', queryParams.search);
		}
		if (queryParams.db) {
			searchParams.append('db', queryParams.db);
		}
		if (queryParams.sort) {
			searchParams.append('sort', queryParams.sort);
		}
		if (queryParams.start !== undefined) {
			searchParams.append('start', queryParams.start.toString());
		}
		if (queryParams.size !== undefined) {
			searchParams.append('size', queryParams.size.toString());
		}

		if (searchParams.toString()) {
			urlParts.push(`?${searchParams.toString()}`);
		}

		const reqUrl = urlParts.join('');

		const requestOptions: RequestOptions = {};
		if (params.timeout) {
			requestOptions.timeout = params.timeout;
		}

		try {
			const timestampedUrl = `${reqUrl}${searchParams.toString() ? '&' : '?'}_t=${Date.now()}`;
			const htmlData = await request<string>(timestampedUrl, requestOptions, 'text');
			return parsePlayerListWithPagination(htmlData, queryParams.db!);
		} catch (error: any) {
			console.error(`Error fetching player list: ${error.message}`);
			throw error;
		}
	}
};
