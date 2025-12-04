import { render, screen, fireEvent, waitFor } from '@testing-library/svelte/svelte5';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { default as Page } from './+page.svelte';
import { getMaps } from '$lib/services/maps';
import type { MapData } from '$lib/services/maps';

// Mock the maps service
vi.mock('$lib/services/maps', () => ({
	getMaps: vi.fn(),
	MapData: {}
}));

// Mock the TranslatedText component
vi.mock('$lib/components/TranslatedText.svelte', () => ({
	default: (props: { key: string; fallback?: string }) => {
		if (props.fallback) return props.fallback;

		const keyToText: Record<string, string> = {
			'app.map.buttonPreviewMap': 'Preview Map',
			'app.map.noPreview': 'No Map Preview',
			'app.map.preview': 'Preview',
			'app.loading.title': 'Loading Servers',
			'app.loading.description': 'Fetching latest server data from the API...',
			'app.loading.progress': 'Connecting to server...',
			'app.filter.officialInvasion': 'Official Invasion',
			'app.filter.officialWW2Invasion': 'Official WW2 Invasion',
			'app.filter.officialDominance': 'Official Dominance',
			'app.filter.officialModCastling': 'Official Mod Castling',
			'app.filter.officialModHellDivers': 'Official Mod HellDivers',
			'app.switch.multipleSelect': 'Multiple Select',
			'app.switch.autoRefresh': 'Auto Refresh',
			'app.button.refresh': 'Refresh',
			'app.button.reset': 'Reset',
			'app.stats.servers': '{filtered} of {total} servers',
			'app.stats.players': '{filtered} of {total} players',
			'app.search.placeholder': 'Search servers, maps, players, mode, country, etc...',
			'app.column.name': 'Name',
			'app.column.ip': 'IP',
			'app.column.port': 'Port',
			'app.column.bots': 'Bots',
			'app.column.country': 'Country',
			'app.column.mode': 'Mode',
			'app.column.map': 'Map',
			'app.column.capacity': 'Capacity',
			'app.column.players': 'Players',
			'app.column.comment': 'Comment',
			'app.column.dedicated': 'Dedicated',
			'app.column.mod': 'Mod',
			'app.column.url': 'URL',
			'app.column.version': 'Version',
			'app.column.action': 'Action',
			'app.column.timestamp': 'Timestamp',
			'app.columns.button': 'Columns',
			'app.columns.toggle': 'Toggle visible columns',
			'app.mobile.loadMore': 'Load more ({remaining} remaining)',
			'app.mobile.noServers': 'No servers found',
			'app.mobile.endOfContent': 'End of content',
			'app.viewMode.table': 'Switch to Map Order View',
			'app.viewMode.map': 'Switch to Table View',
			'app.help.title': 'Show Help Guide',
			'app.map.close': 'Close',
			'app.map.loading': 'Loading map image...',
			'app.map.loadError': 'Failed to load map image',
			'app.map.retry': 'Retry',
			'app.mapView.title': 'Map Order: {filters}',
			'app.mapView.allMaps': 'All Maps',
			'app.mapView.selectFilters': 'Select Quick Filters to View Map Order',
			'app.mapView.chooseCategories': 'Choose your preferred map categories in Quick Filters to display the corresponding server list',
			'app.mapView.noMaps': 'No maps found for selected filters.',
			'app.mapView.servers': '{count} servers',
			'app.mapView.bots': '{count} Bots'
		};

		return keyToText[props.key] || props.key;
	}
}));


// Mock environment variables
vi.stubEnv('VITE_API_URL', '');

// Mock fetch for server data
global.fetch = vi.fn();

describe('Page Integration - Map Preview Functionality', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.spyOn(console, 'log').mockImplementation(() => {});
		vi.spyOn(console, 'error').mockImplementation(() => {});

		// Mock getMaps function
		vi.mocked(getMaps).mockResolvedValue([
			{
				id: 'map1_desert',
				name: 'Desert Map',
				path: 'media/packages/vanilla.desert/maps/map1',
				image: 'md5_1.png'
			}
		]);

		// Mock fetch for server data
		const mockXmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<result value="1">
<server>
<name>Test Server</name>
<address>192.168.1.1</address>
<port>27015</port>
<current_players>10</current_players>
<max_players>32</max_players>
<bots>0</bots>
<mode>COOP</mode>
<map>map1</map>
<country>US</country>
<dedicated>1</dedicated>
<mod>0</mod>
<version>1.98.1</version>
<url></url>
<comment>Test server</comment>
<timestamp>2024-01-01T00:00:00Z</timestamp>
<player>Player1</player>
<player>Player2</player>
</server>
</result>`;

		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			text: () => Promise.resolve(mockXmlResponse),
			headers: new Headers()
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('Maps service integration', () => {
		it('should load maps data on page mount', async () => {
			render(Page);

			// Wait for maps to be loaded
			await waitFor(() => {
				expect(getMaps).toHaveBeenCalledTimes(1);
			});
		});

		it('should handle maps service errors gracefully', async () => {
			vi.mocked(getMaps).mockRejectedValueOnce(new Error('Failed to load maps'));

			// Should not throw during rendering
			expect(() => render(Page)).not.toThrow();
		});
	});

	describe('Server data loading', () => {
		it('should render page without crashing', async () => {
			// Should render the page without crashing
			expect(() => render(Page)).not.toThrow();
		});

		it('should handle fetch errors gracefully', async () => {
			vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

			// Should still render without crashing
			expect(() => render(Page)).not.toThrow();
		});
	});

	describe('Performance considerations', () => {
		it('should call maps service only once on page load', async () => {
			render(Page);

			await waitFor(() => {
				expect(getMaps).toHaveBeenCalledTimes(1);
			});

			// Should still only be called once after initial load
			expect(getMaps).toHaveBeenCalledTimes(1);
		});
	});
});