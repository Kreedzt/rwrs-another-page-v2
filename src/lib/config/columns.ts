import type { IColumn, IDisplayServerItem } from '$lib/models/data-table.model';
import { highlightMatch, renderPlayerListWithHighlight } from '$lib/utils/highlight';

export const columns: IColumn[] = [
	{
		key: 'name',
		label: 'Name',
		i18n: 'app.column.name',
		getValueWithHighlight: (server: IDisplayServerItem, query: string) =>
			highlightMatch(server.name, query)
	},
	{
		key: 'ipAddress',
		label: 'IP Address',
		i18n: 'app.column.ip',
		getValueWithHighlight: (server: IDisplayServerItem, query: string) =>
			highlightMatch(server.ipAddress, query)
	},
	{
		key: 'port',
		label: 'Port',
		i18n: 'app.column.port',
		alignment: 'center',
		getValueWithHighlight: (server: IDisplayServerItem, query: string) =>
			highlightMatch(server.port.toString(), query)
	},
	{
		key: 'bots',
		label: 'Bots',
		i18n: 'app.column.bots',
		alignment: 'center',
		getValueWithHighlight: (server: IDisplayServerItem, query: string) =>
			highlightMatch(server.bots.toString(), query)
	},
	{
		key: 'country',
		label: 'Country',
		i18n: 'app.column.country',
		getValueWithHighlight: (server: IDisplayServerItem, query: string) =>
			highlightMatch(server.country, query)
	},
	{
		key: 'mode',
		label: 'Mode',
		i18n: 'app.column.mode',
		getValueWithHighlight: (server: IDisplayServerItem, query: string) =>
			highlightMatch(server.mode, query)
	},
	{
		key: 'mapId',
		label: 'Map',
		i18n: 'app.column.map',
		getValueWithHighlight: (server: IDisplayServerItem, query: string) => {
			const mapId = server.mapId.split('/').pop() || '';

			return highlightMatch(mapId, query);
		},
		getValue: (server: IDisplayServerItem) => {
			return server.mapId.split('/').pop() || '';
		}
	},
	{
		key: 'playerCount',
		label: 'Players',
		i18n: 'app.column.capacity',
		alignment: 'center',
		getValue: (server: IDisplayServerItem) => `${server.currentPlayers}/${server.maxPlayers}`
	},
	{
		key: 'playerList',
		label: 'Player List',
		i18n: 'app.column.players',
		headerClass: 'min-w-96',
		cellClass: 'min-w-96',
		alignment: 'top',
		getValue: (server: IDisplayServerItem) => renderPlayerListWithHighlight(server.playerList),
		getValueWithHighlight: (server: IDisplayServerItem, query: string) =>
			renderPlayerListWithHighlight(server.playerList, query)
	},
	{ key: 'comment', label: 'Comment', i18n: 'app.column.comment' },
	{
		key: 'dedicated',
		label: 'Dedicated',
		i18n: 'app.column.dedicated',
		getValue: (server: IDisplayServerItem) => (server.dedicated ? 'Yes' : 'No')
	},
	{
		key: 'mod',
		label: 'Mod',
		i18n: 'app.column.mod',
		getValue: (server: IDisplayServerItem) => (server.mod ? 'Yes' : 'No')
	},
	{ key: 'url', label: 'URL', i18n: 'app.column.url' },
	{ key: 'version', label: 'Version', i18n: 'app.column.version' },
	{ key: 'action', label: 'Action', i18n: 'app.column.action' }
];
