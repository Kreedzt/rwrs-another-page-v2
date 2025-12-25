import { request } from '$lib/request';
import type { RequestOptions } from '$lib/request';
import type { IPlayerListParams, IPlayerService } from '$lib/models/player.model';
import { PlayerDatabase } from '$lib/models/player.model';
import { parsePlayerListFromString, parsePlayerListWithPagination } from '$lib/share/player-utils';

const PLAYER_API_URL = '/api';

const DEFAULT_PARAMS: Required<Pick<IPlayerListParams, 'db' | 'sort' | 'size'>> = {
	db: PlayerDatabase.INVASION,
	sort: 'rank_progression',
	size: 20
};

/**
 * Build URL for player list API with query parameters
 */
function buildPlayerListUrl(params: IPlayerListParams): string {
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

	return urlParts.join('');
}

/**
 * Generic fetch function with parser strategy pattern
 * @template T - The return type based on the parser function used
 */
async function fetchPlayerList<T>(
	params: IPlayerListParams,
	parser: (html: string, db: PlayerDatabase) => T
): Promise<T> {
	const reqUrl = buildPlayerListUrl(params);
	const requestOptions: RequestOptions = {};

	if (params.timeout) {
		requestOptions.timeout = params.timeout;
	}

	try {
		const hasQueryParams = reqUrl.includes('?');
		const timestampedUrl = `${reqUrl}${hasQueryParams ? '&' : '?'}_t=${Date.now()}`;
		const htmlData = await request<string>(timestampedUrl, requestOptions, 'text');
		return parser(htmlData, params.db ?? DEFAULT_PARAMS.db!);
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : 'Unknown error';
		console.error(`Error fetching player list: ${message}`);
		throw error;
	}
}

export const PlayerService: IPlayerService = {
	async list(params = {}) {
		return fetchPlayerList(params, parsePlayerListFromString);
	},

	async listWithPagination(params = {}) {
		return fetchPlayerList(params, parsePlayerListWithPagination);
	}
};
