import type { Nullable } from '$lib/share/types';

export enum PlayerDatabase {
	INVASION = 'invasion',
	PACIFIC = 'pacific',
	PRERESET_INVASION = 'prereset_invasion'
}

export type PlayerSortField =
	| 'rank_progression'
	| 'username'
	| 'kills'
	| 'deaths'
	| 'kd'
	| 'score'
	| 'time_played'
	| 'teamkills'
	| 'longest_kill_streak'
	| 'targets_destroyed'
	| 'vehicles_destroyed'
	| 'soldiers_healed'
	| 'distance_moved'
	| 'shots_fired'
	| 'throwables_thrown';

export interface IPlayerListParams {
	search?: string;
	db?: PlayerDatabase;
	sort?: PlayerSortField;
	start?: number;
	size?: number;
	timeout?: number;
}

export interface IPlayerItem {
	id: string;
	username: string;
	db: PlayerDatabase;
	rowNumber: number;
	rankProgression: Nullable<number>;
	kills: Nullable<number>;
	deaths: Nullable<number>;
	kd: Nullable<number>;
	score: Nullable<number>;
	timePlayed: Nullable<string>;
	teamkills: Nullable<number>;
	longestKillStreak: Nullable<number>;
	targetsDestroyed: Nullable<number>;
	vehiclesDestroyed: Nullable<number>;
	soldiersHealed: Nullable<number>;
	distanceMoved: Nullable<string>;
	shotsFired: Nullable<number>;
	throwablesThrown: Nullable<number>;
	rankName: Nullable<string>;
	rankIcon: Nullable<string>;
}

export interface IPlayerColumn {
	key: keyof IPlayerItem | string;
	label: string;
	i18n?: string;
	getValue?: (player: IPlayerItem) => string;
	getValueWithHighlight?: (player: IPlayerItem, query: string) => string;
	headerClass?: string;
	cellClass?: string;
	alignment?: 'left' | 'center' | 'right';
}

export interface IPlayerService {
	list(params?: IPlayerListParams): Promise<IPlayerItem[]>;
	listWithPagination(
		params?: IPlayerListParams
	): Promise<{ players: IPlayerItem[]; hasNext: boolean; hasPrevious: boolean }>;
}
