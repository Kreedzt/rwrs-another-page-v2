import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { analytics, Analytics } from '$lib/utils/analytics';
import type { AnalyticsEventParams } from '$lib/types/analytics';

// Mock $app/environment to make browser return true
vi.mock('$app/environment', () => ({
	browser: true
}));

// Mock window.gtag
const mockGtag = vi.fn();

// Storage for _hmt push calls
let mockHmtCalls: unknown[][] = [];

// Storage for umami track calls
let mockUmamiCalls: Array<{ eventName: string; data?: Record<string, string | number | boolean> }> =
	[];

// Create an actual array with custom push method for _hmt
const createMockHmt = (): unknown[] => {
	const arr = [] as unknown[];
	// Override push method to track calls
	const originalPush = arr.push;
	arr.push = function (...args: unknown[]): number {
		// For _hmt, we always push a single array argument like ['_trackEvent', ...]
		// Store that array directly in mockHmtCalls (not wrapped in another array)
		mockHmtCalls.push(args[0] as unknown[]);
		// Actually push the arguments individually to the array (normal push behavior)
		return originalPush.apply(arr, args);
	};
	return arr;
};

// Create mock umami object
const createMockUmami = () => ({
	track: (eventName: string, data?: Record<string, string | number | boolean>) => {
		mockUmamiCalls.push({ eventName, data });
	},
	trackView: vi.fn()
});

// No need to declare Window properties again as it causes conflicts with app.d.ts

describe('Analytics Utility (Multi-platform: gtag + Baidu + Umami)', () => {
	beforeEach(() => {
		// Reset mocks
		mockGtag.mockReset();
		mockGtag.mockImplementation(() => {});
		mockHmtCalls = [];
		mockUmamiCalls = [];

		global.window = {
			gtag: mockGtag,
			_hmt: createMockHmt(),
			umami: createMockUmami(),
			dataLayer: []
		} as any;

		// Reset analytics singleton state
		analytics.setEnabled(true);
		analytics.setDebug(false);
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	// Helper to reinitialize analytics for testing
	function createTestAnalytics() {
		return new Analytics({ enabled: true, debug: true });
	}

	describe('Platform availability detection', () => {
		test('should handle missing analytics gracefully', () => {
			delete (window as any).gtag;
			delete (window as any)._hmt;

			expect(() => analytics.trackViewSwitch('servers')).not.toThrow();
			expect(mockGtag).not.toHaveBeenCalled();
			expect(mockHmtCalls.length).toBe(0);

			// Restore mocks for other tests
			global.window = {
				gtag: mockGtag,
				_hmt: createMockHmt(),
				umami: createMockUmami(),
				dataLayer: []
			} as any;
		});

		test('should work with only gtag available', () => {
			delete (window as any)._hmt;

			analytics.trackViewSwitch('servers');

			expect(mockGtag).toHaveBeenCalledWith('event', 'view_switch', { view: 'servers' });
			expect(mockHmtCalls.length).toBe(0);

			// Restore _hmt for other tests
			global.window = {
				gtag: mockGtag,
				_hmt: createMockHmt(),
				dataLayer: []
			} as any;
		});

		test('should work with only _hmt available', () => {
			delete (window as any).gtag;

			analytics.trackViewSwitch('players');

			expect(mockGtag).not.toHaveBeenCalled();
			expect(mockHmtCalls.length).toBeGreaterThan(0);
			expect(mockHmtCalls[0][0]).toBe('_trackEvent');
			expect(mockHmtCalls[0][1]).toBe('navigation');
			expect(mockHmtCalls[0][2]).toBe('view_switch');
			expect(mockHmtCalls[0][3]).toBe('view:players');

			// Restore gtag for other tests
			global.window = {
				gtag: mockGtag,
				_hmt: createMockHmt(),
				dataLayer: []
			} as any;
		});

		test('should track to both platforms when available', () => {
			analytics.trackViewSwitch('servers');

			expect(mockGtag).toHaveBeenCalledWith('event', 'view_switch', { view: 'servers' });
			expect(mockHmtCalls.length).toBeGreaterThan(0);
			expect(mockHmtCalls[0][0]).toBe('_trackEvent');
			expect(mockHmtCalls[0][1]).toBe('navigation');
			expect(mockHmtCalls[0][2]).toBe('view_switch');
		});
	});

	describe('Navigation events (both platforms)', () => {
		test('should track view switch to both platforms', () => {
			analytics.trackViewSwitch('players');

			// gtag call
			expect(mockGtag).toHaveBeenCalledWith('event', 'view_switch', { view: 'players' });

			// Baidu _hmt call
			expect(mockHmtCalls.length).toBeGreaterThan(0);
			const hmtCall = mockHmtCalls[mockHmtCalls.length - 1];
			expect(hmtCall[0]).toBe('_trackEvent');
			expect(hmtCall[1]).toBe('navigation');
			expect(hmtCall[2]).toBe('view_switch');
			expect(hmtCall[3]).toBe('view:players');
		});

		test('should track theme change to both platforms', () => {
			analytics.trackThemeChange('dark');

			expect(mockGtag).toHaveBeenCalledWith('event', 'theme_change', { theme: 'dark' });
			const hmtCall = mockHmtCalls[mockHmtCalls.length - 1];
			expect(hmtCall[3]).toBe('theme:dark');
		});

		test('should track language change to both platforms', () => {
			analytics.trackLanguageChange('zh-cn');

			expect(mockGtag).toHaveBeenCalledWith('event', 'language_change', { language: 'zh-cn' });
			const hmtCall = mockHmtCalls[mockHmtCalls.length - 1];
			expect(hmtCall[3]).toBe('lang:zh-cn');
		});

		test('should track GitHub link click to both platforms', () => {
			analytics.trackGitHubClick();

			expect(mockGtag).toHaveBeenCalledWith('event', 'github_link_click', {
				action: 'external_link'
			});
			const hmtCall = mockHmtCalls[mockHmtCalls.length - 1];
			expect(hmtCall[0]).toBe('_trackEvent');
			expect(hmtCall[1]).toBe('navigation');
			expect(hmtCall[2]).toBe('github_link_click');
		});
	});

	describe('Search and filter events', () => {
		test('should track search triggered to both platforms', () => {
			analytics.trackSearch('keyboard');

			expect(mockGtag).toHaveBeenCalledWith('event', 'search_triggered', { method: 'keyboard' });
			const hmtCall = mockHmtCalls[mockHmtCalls.length - 1];
			expect(hmtCall[1]).toBe('search');
			expect(hmtCall[3]).toBe('method:keyboard');
		});

		test('should track quick filter applied to both platforms', () => {
			analytics.trackQuickFilter('official', 3);

			expect(mockGtag).toHaveBeenCalledWith('event', 'quick_filter_applied', {
				filter_id: 'official',
				filter_count: 3
			});
			const hmtCall = mockHmtCalls[mockHmtCalls.length - 1];
			expect(hmtCall[1]).toBe('search');
			expect(hmtCall[3]).toBe('filter:official');
			expect(hmtCall[4]).toBe(3);
		});

		test('should track multi-select toggle to both platforms', () => {
			analytics.trackMultiSelectToggle(true);

			expect(mockGtag).toHaveBeenCalledWith('event', 'multi_select_toggle', {
				is_multi_select: true
			});
			const hmtCall = mockHmtCalls[mockHmtCalls.length - 1];
			expect(hmtCall[1]).toBe('search');
			expect(hmtCall[2]).toBe('multi_select_toggle');
		});

		test('should track column visibility toggle to both platforms', () => {
			analytics.trackColumnVisibility('playerCount', false);

			expect(mockGtag).toHaveBeenCalledWith('event', 'column_visibility_toggle', {
				column_name: 'playerCount',
				visible: false
			});
			const hmtCall = mockHmtCalls[mockHmtCalls.length - 1];
			expect(hmtCall[3]).toBe('col:playerCount');
		});
	});

	describe('Data interaction events', () => {
		test('should track server join click to both platforms', () => {
			analytics.trackServerJoin();

			expect(mockGtag).toHaveBeenCalledWith('event', 'server_join_click', {
				action: 'join_server'
			});
			const hmtCall = mockHmtCalls[mockHmtCalls.length - 1];
			expect(hmtCall[1]).toBe('data');
		});

		test('should track map preview open to both platforms', () => {
			analytics.trackMapPreview();

			expect(mockGtag).toHaveBeenCalledWith('event', 'map_preview_open', {
				action: 'view_map'
			});
			const hmtCall = mockHmtCalls[mockHmtCalls.length - 1];
			expect(hmtCall[2]).toBe('map_preview_open');
		});

		test('should track column sort to both platforms', () => {
			analytics.trackColumnSort('playerCount', 'desc');

			expect(mockGtag).toHaveBeenCalledWith('event', 'column_sort', {
				column_name: 'playerCount',
				sort_direction: 'desc'
			});
			const hmtCall = mockHmtCalls[mockHmtCalls.length - 1];
			expect(hmtCall[3]).toBe('col:playerCount | dir:desc');
		});

		test('should track pagination change to both platforms', () => {
			analytics.trackPagination(3, 10);

			expect(mockGtag).toHaveBeenCalledWith('event', 'pagination_change', {
				page: 3,
				total_pages: 10
			});
			const hmtCall = mockHmtCalls[mockHmtCalls.length - 1];
			expect(hmtCall[4]).toBe(3);
		});

		test('should track load more click to both platforms', () => {
			analytics.trackLoadMore('scroll');

			expect(mockGtag).toHaveBeenCalledWith('event', 'load_more_click', { method: 'scroll' });
			const hmtCall = mockHmtCalls[mockHmtCalls.length - 1];
			expect(hmtCall[3]).toBe('method:scroll');
		});

		test('should track auto-refresh toggle to both platforms', () => {
			analytics.trackAutoRefreshToggle(false);

			expect(mockGtag).toHaveBeenCalledWith('event', 'auto_refresh_toggle', {
				enabled: false
			});
			const hmtCall = mockHmtCalls[mockHmtCalls.length - 1];
			expect(hmtCall[2]).toBe('auto_refresh_toggle');
		});

		test('should track player database change to both platforms', () => {
			analytics.trackPlayerDatabaseChange('pacific');

			expect(mockGtag).toHaveBeenCalledWith('event', 'player_database_change', {
				player_database: 'pacific'
			});
			const hmtCall = mockHmtCalls[mockHmtCalls.length - 1];
			expect(hmtCall[3]).toBe('db:pacific');
		});
	});

	describe('Engagement events', () => {
		test('should track refresh click to both platforms', () => {
			analytics.trackRefresh();

			expect(mockGtag).toHaveBeenCalledWith('event', 'refresh_click', {
				action: 'manual_refresh'
			});
			const hmtCall = mockHmtCalls[mockHmtCalls.length - 1];
			expect(hmtCall[1]).toBe('engagement');
		});

		test('should track custom event to both platforms', () => {
			analytics.trackEvent('page_load', { custom_param: 'test_value' });

			expect(mockGtag).toHaveBeenCalledWith('event', 'page_load', {
				custom_param: 'test_value'
			});
			expect(mockHmtCalls.length).toBeGreaterThan(0);
		});
	});

	describe('Privacy and sanitization', () => {
		test('should sanitize search query from params for both platforms', () => {
			analytics.trackEvent('search_triggered', {
				search_query: 'secret search term',
				query: 'another secret',
				q: 'yet another secret',
				search: 'also secret',
				method: 'click'
			} as AnalyticsEventParams);

			const gtagCall = mockGtag.mock.calls[0];
			expect(gtagCall[2]).not.toHaveProperty('search_query');
			expect(gtagCall[2]).not.toHaveProperty('query');
			expect(gtagCall[2]).not.toHaveProperty('q');
			expect(gtagCall[2]).not.toHaveProperty('search');
			expect(gtagCall[2]).toEqual({ method: 'click' });

			// Baidu should also not have sensitive data in label
			const hmtCall = mockHmtCalls[0];
			expect(hmtCall).toBeDefined();
			const label = hmtCall[3];
			if (typeof label === 'string') {
				expect(label).not.toContain('secret');
			}
		});

		test('should preserve safe parameters for both platforms', () => {
			analytics.trackEvent('view_switch', {
				view: 'players',
				page: 1,
				enabled: true
			});

			const gtagCall = mockGtag.mock.calls[0];
			expect(gtagCall[2]).toEqual({ view: 'players', page: 1, enabled: true });
		});
	});

	describe('Debug mode', () => {
		test('should log events in debug mode', () => {
			const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
			analytics.setDebug(true);

			analytics.trackViewSwitch('players');

			expect(consoleSpy).toHaveBeenCalledWith('[Analytics] Tracked: view_switch', {
				view: 'players'
			});

			consoleSpy.mockRestore();
		});

		test('should log available platforms on init', () => {
			const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
			createTestAnalytics();

			// The actual implementation logs as a single string with template literal
			expect(consoleSpy).toHaveBeenCalledWith(
				'[Analytics] Initialized successfully with: gtag, _hmt, umami'
			);

			consoleSpy.mockRestore();
		});
	});

	describe('Enable/Disable functionality', () => {
		test('should not track events when disabled', () => {
			analytics.setEnabled(false);
			analytics.trackViewSwitch('players');

			expect(mockGtag).not.toHaveBeenCalled();
			expect(mockHmtCalls.length).toBe(0);
		});

		test('should track events when re-enabled', () => {
			analytics.setEnabled(false);
			analytics.setEnabled(true);
			analytics.trackViewSwitch('servers');

			expect(mockGtag).toHaveBeenCalledWith('event', 'view_switch', { view: 'servers' });
			expect(mockHmtCalls.length).toBeGreaterThan(0);
		});
	});

	describe('Error handling', () => {
		test('should handle gtag errors gracefully but still track to _hmt', () => {
			mockGtag.mockImplementation(() => {
				throw new Error('gtag error');
			});

			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

			analytics.trackViewSwitch('players');

			// gtag failed but _hmt should still be called
			expect(consoleSpy).toHaveBeenCalled();
			expect(mockHmtCalls.length).toBeGreaterThan(0);

			// Reset mock for other tests
			mockGtag.mockImplementation(() => {});
			consoleSpy.mockRestore();
		});

		test('should handle _hmt errors gracefully but still track to gtag', () => {
			// Temporarily break _hmt
			(window._hmt as any).push = () => {
				throw new Error('_hmt error');
			};

			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

			analytics.trackViewSwitch('servers');

			// _hmt failed but gtag should still be called
			expect(consoleSpy).toHaveBeenCalled();
			expect(mockGtag).toHaveBeenCalled();

			// Restore _hmt for other tests
			(window._hmt as any).push = (...args: unknown[]) => {
				mockHmtCalls.push(args);
				return mockHmtCalls.length;
			};

			consoleSpy.mockRestore();
		});
	});

	describe('Page view tracking', () => {
		test('should track page view to both platforms', () => {
			analytics.trackPageView('/servers', 'Servers View');

			expect(mockGtag).toHaveBeenCalledWith('event', 'page_view', {
				page_path: '/servers',
				page_title: 'Servers View'
			});

			const hmtCall = mockHmtCalls[mockHmtCalls.length - 1];
			expect(hmtCall[0]).toBe('_trackPageview');
			expect(hmtCall[1]).toBe('/servers');
		});

		test('should use document.title when title not provided', () => {
			const mockDocument = {
				title: 'Test Title'
			};
			global.document = mockDocument as any;

			analytics.trackPageView('/test');

			expect(mockGtag).toHaveBeenCalledWith('event', 'page_view', {
				page_path: '/test',
				page_title: 'Test Title'
			});

			const hmtCall = mockHmtCalls[mockHmtCalls.length - 1];
			expect(hmtCall[1]).toBe('/test');

			delete (global as any).document;
		});
	});

	describe('Session duration', () => {
		test('should return session duration', () => {
			const duration = analytics.getSessionDuration();
			expect(duration === null || typeof duration === 'number').toBe(true);
		});
	});

	describe('Baidu Analytics label building', () => {
		test('should build correct label with multiple params', () => {
			analytics.trackColumnSort('kills', 'asc');

			const hmtCall = mockHmtCalls[mockHmtCalls.length - 1];
			expect(hmtCall[3]).toBe('col:kills | dir:asc');
		});

		test('should handle pagination with page value', () => {
			analytics.trackPagination(5, 20);

			const hmtCall = mockHmtCalls[mockHmtCalls.length - 1];
			expect(hmtCall[4]).toBe(5);
		});

		test('should handle filter with count value', () => {
			analytics.trackQuickFilter('ww2', 5);

			const hmtCall = mockHmtCalls[mockHmtCalls.length - 1];
			expect(hmtCall[3]).toBe('filter:ww2');
			expect(hmtCall[4]).toBe(5);
		});
	});
});
