import type { IColumn, IDisplayServerItem } from '$lib/models/server.model';
import type { MapData } from '$lib/services/maps';
import { highlightMatch, renderPlayerListWithHighlight } from '$lib/utils/highlight';

// Function to get map preview HTML for desktop
function getMapPreviewHtml(server: IDisplayServerItem, query?: string, maps?: MapData[]): string {
	const mapId = server.mapId;
	const mapData = maps?.find(map => map.path === mapId);
	const mapName = mapId.split('/').pop() || '';

	if (!mapData) {
		// No matching map - just show the map name
		const displayText = query ? highlightMatch(mapName, query) : mapName;
		return `<span class="badge badge-outline bg-white text-green-600 border-green-300 font-medium text-xs px-2 py-1 rounded-md shadow-sm">${displayText}</span>`;
	}

	// Map with preview available - always show preview button
	const displayText = query ? highlightMatch(mapName, query) : mapName;
	return `
		<div class="flex items-center gap-2">
			<span class="badge badge-outline bg-white text-green-600 border-green-300 font-medium text-xs px-2 py-1 rounded-md shadow-sm">${displayText}</span>
			<button
				class="btn btn-outline btn-xs text-green-600 border-green-300 hover:bg-green-50"
				data-map-action="preview"
				data-map-path="${mapData.path}"
				data-map-image="${mapData.image}"
				data-map-name="${mapData.name}"
				title="Preview map: ${mapData.name}"
				type="button"
			>
				<svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542 7z"></path>
				</svg>
				Preview
			</button>
		</div>
	`;
}

// Function to get map preview HTML for mobile
function getMobileMapPreviewHtml(server: IDisplayServerItem, maps?: MapData[]): string {
	const mapId = server.mapId;
	const mapData = maps?.find(map => map.path === mapId);
	const mapName = mapId.split('/').pop() || '';

	if (!mapData) {
		// No matching map - just show map name
		return `<span class="badge badge-outline bg-white text-green-600 border-green-300 font-medium text-xs px-2 py-1 rounded-md shadow-sm">${mapName}</span>`;
	}

	// Map with preview available - show preview button
	return `
		<div class="flex items-center gap-2">
			<span class="badge badge-outline bg-white text-green-600 border-green-300 font-medium text-xs px-2 py-1 rounded-md shadow-sm">${mapName}</span>
			<button
				class="btn btn-outline btn-xs text-green-600 border-green-300 hover:bg-green-50"
				data-map-action="preview"
				data-map-path="${mapData.path}"
				data-map-image="${mapData.image}"
				data-map-name="${mapData.name}"
				title="Preview map: ${mapData.name}"
				type="button"
			>
				<svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542 7z"></path>
				</svg>
				Preview
			</button>
		</div>
	`;
}

// Function to get capacity status and styling
function getCapacityStyling(server: IDisplayServerItem, query?: string): string {
	const { currentPlayers, maxPlayers } = server;
	const occupancy = maxPlayers > 0 ? currentPlayers / maxPlayers : 0;
	const playerText = query
		? highlightMatch(`${currentPlayers}/${maxPlayers}`, query)
		: `${currentPlayers}/${maxPlayers}`;

	// Check for empty servers first
	if (currentPlayers === 0) {
		// Empty server - gray with dimmed effect
		return `<span class="badge bg-gray-100 text-gray-500 border-gray-200 font-medium text-xs px-2 py-1 rounded-md shadow-sm opacity-60" title="Empty server">${playerText}</span>`;
	}

	// Determine color based on occupancy
	if (occupancy >= 1.0 || currentPlayers >= maxPlayers) {
		// Full server - red
		return `<span class="badge bg-red-100 text-red-700 border-red-200 font-medium text-xs px-2 py-1 rounded-md shadow-sm" title="Full server">${playerText}</span>`;
	} else if (occupancy >= 0.8) {
		// 80% or more - orange
		return `<span class="badge bg-orange-100 text-orange-700 border-orange-200 font-medium text-xs px-2 py-1 rounded-md shadow-sm" title="${Math.round(occupancy * 100)}% full">${playerText}</span>`;
	} else if (occupancy >= 0.6) {
		// 60-79% - yellow (warning)
		return `<span class="badge bg-amber-100 text-amber-700 border-amber-200 font-medium text-xs px-2 py-1 rounded-md shadow-sm" title="${Math.round(occupancy * 100)}% full">${playerText}</span>`;
	} else {
		// Less than 60% - green (available)
		return `<span class="badge bg-green-100 text-green-700 border-green-200 font-medium text-xs px-2 py-1 rounded-md shadow-sm" title="${Math.round(occupancy * 100)}% full">${playerText}</span>`;
	}
}

export const columns: IColumn[] = [
	{
		key: 'name',
		label: 'Name',
		i18n: 'app.column.name',
		getValue: (server: IDisplayServerItem) => server.name,
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
		getValue: (server: IDisplayServerItem) => {
			const modeText = server.mode || 'Unknown';
			return `<span class="badge badge-outline bg-white text-blue-600 border-blue-300 font-medium text-xs px-2 py-1 rounded-md shadow-sm" data-mode="mode">${modeText}</span>`;
		},
		getValueWithHighlight: (server: IDisplayServerItem, query: string) => {
			const modeText = server.mode || 'Unknown';
			const highlightedText = highlightMatch(modeText, query);
			return `<span class="badge badge-outline bg-white text-blue-600 border-blue-300 font-medium text-xs px-2 py-1 rounded-md shadow-sm" data-mode="mode">${highlightedText}</span>`;
		}
	},
	{
		key: 'mapId',
		label: 'Map',
		i18n: 'app.column.map',
		getValue: (server: IDisplayServerItem, maps?: MapData[]) =>
			getMapPreviewHtml(server, undefined, maps),
		getValueWithHighlight: (server: IDisplayServerItem, query: string, maps?: MapData[]) =>
			getMapPreviewHtml(server, query, maps)
	},
	{
		key: 'playerCount',
		label: 'Players',
		i18n: 'app.column.capacity',
		alignment: 'center',
		getValue: (server: IDisplayServerItem) => getCapacityStyling(server),
		getValueWithHighlight: (server: IDisplayServerItem, query: string) => getCapacityStyling(server, query)
	},
	{
		key: 'playerList',
		label: 'Player List',
		i18n: 'app.column.players',
		headerClass: 'min-w-96',
		cellClass: 'min-w-96',
		alignment: 'top',
		getValue: (server: IDisplayServerItem) => renderPlayerListWithHighlight(server.playerList),
		getValueWithHighlight: (server: IDisplayServerItem, query: string) => renderPlayerListWithHighlight(server.playerList, query)
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
