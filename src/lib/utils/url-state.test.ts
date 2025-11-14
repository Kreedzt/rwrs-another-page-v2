import { describe, test, expect, beforeEach, vi } from 'vitest';
import { getUrlState, updateUrlState, URL_PARAMS } from './url-state';

// Mock browser environment
const mockWindow = {
	location: {
		search: ''
	}
};

vi.mock('$app/navigation', () => ({
	goto: vi.fn()
}));

vi.mock('$app/environment', () => ({
	browser: true
}));

describe('URL State Management', () => {
	beforeEach(() => {
		// Reset mocks
		vi.clearAllMocks();
		mockWindow.location.search = '';

		// Mock global window
		vi.stubGlobal('window', mockWindow);
	});

	describe('getUrlState', () => {
		test('should return empty state when no URL parameters', () => {
			mockWindow.location.search = '';
			const state = getUrlState();
			expect(state).toEqual({});
		});

		test('should parse search parameter', () => {
			mockWindow.location.search = '?search=test';
			const state = getUrlState();
			expect(state).toEqual({
				search: 'test'
			});
		});

		test('should parse quickFilters parameter', () => {
			mockWindow.location.search = '?quickFilters=invasion%2Cdominance';
			const state = getUrlState();
			expect(state).toEqual({
				quickFilters: ['invasion', 'dominance']
			});
		});

		test('should parse sort parameters', () => {
			mockWindow.location.search = '?sort=players&dir=asc';
			const state = getUrlState();
			expect(state).toEqual({
				sortColumn: 'players',
				sortDirection: 'asc'
			});
		});

		test('should parse multiple parameters', () => {
			mockWindow.location.search =
				'?search=test&quickFilters=invasion%2Cdominance&sort=players&dir=desc';
			const state = getUrlState();
			expect(state).toEqual({
				search: 'test',
				quickFilters: ['invasion', 'dominance'],
				sortColumn: 'players',
				sortDirection: 'desc'
			});
		});

		test('should handle empty quickFilters parameter', () => {
			mockWindow.location.search = '?quickFilters=';
			const state = getUrlState();
			expect(state).toEqual({
				quickFilters: []
			});
		});
	});

	describe('URL_PARAMS constants', () => {
		test('should have correct parameter names', () => {
			expect(URL_PARAMS.SEARCH).toBe('search');
			expect(URL_PARAMS.QUICK_FILTERS).toBe('quickFilters');
			expect(URL_PARAMS.PAGE).toBe('page');
			expect(URL_PARAMS.SORT_COLUMN).toBe('sort');
			expect(URL_PARAMS.SORT_DIRECTION).toBe('dir');
		});
	});
});
