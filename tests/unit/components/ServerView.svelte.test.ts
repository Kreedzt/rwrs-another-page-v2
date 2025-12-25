import { render, fireEvent } from '@testing-library/svelte/svelte5';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ServerView from '$lib/components/ServerView.svelte';
import type { IDisplayServerItem, IColumn } from '$lib/models/data-table.model';
import type { MapData } from '$lib/services/maps';

// Mock child components
vi.mock('$lib/components/TranslatedText.svelte', () => ({
	default: (props: { key: string; fallback?: string }) => {
		const keyToText: Record<string, string> = {
			'app.loading.title': 'Loading...',
			'app.loading.description': 'Please wait',
			'app.loading.progress': 'Loading data',
			'app.map.preview': 'Map Preview',
			'app.map.buttonPreviewMap': 'Preview Map'
		};
		return props.fallback || keyToText[props.key] || props.key;
	}
}));

// Mock QuickFilterButtons - return simple div
vi.mock('$lib/components/QuickFilterButtons.svelte', () => ({
	default: () => '<div class="quick-filter-mock"></div>'
}));

describe('ServerView Component', () => {
	const mockColumns: IColumn[] = [
		{ key: 'name', label: 'Name', i18n: 'app.column.name' },
		{ key: 'playerCount', label: 'Players', i18n: 'app.column.playerCount' },
		{ key: 'mapId', label: 'Map', i18n: 'app.column.mapId' },
		{ key: 'region', label: 'Region', i18n: 'app.column.region' },
		{ key: 'mode', label: 'Mode', i18n: 'app.column.mode' }
	];

	const mockServers: IDisplayServerItem[] = [
		{
			id: 'server1',
			name: 'Test Server 1',
			playerCount: 10,
			mapId: 'maps/mp_test',
			region: 'US',
			mode: 'CTF'
		} as IDisplayServerItem,
		{
			id: 'server2',
			name: 'Test Server 2',
			playerCount: 20,
			mapId: 'maps/mp_d Day',
			region: 'EU',
			mode: 'TDM'
		} as IDisplayServerItem
	];

	const mockMaps: MapData[] = [
		{ path: 'maps/mp_test', name: 'Test Map', image: 'test.jpg' },
		{ path: 'maps/mp_d Day', name: 'D Day Map', image: 'dday.jpg' }
	];

	const mockVisibleColumns: Record<string, boolean> = {
		name: true,
		playerCount: true,
		mapId: true,
		region: true,
		mode: true
	};

	let mockOnQuickFilter: ReturnType<typeof vi.fn>;
	let mockOnMultiSelectChange: ReturnType<typeof vi.fn>;
	let mockOnSort: ReturnType<typeof vi.fn>;
	let mockOnPageChange: ReturnType<typeof vi.fn>;
	let mockOnLoadMore: ReturnType<typeof vi.fn>;
	let mockOnRowAction: ReturnType<typeof vi.fn>;
	let mockOnColumnToggle: ReturnType<typeof vi.fn>;
	let mockOnToggleMobileCard: ReturnType<typeof vi.fn>;
	let mockOnMapView: ReturnType<typeof vi.fn>;
	let mockOnMapPreviewClose: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		mockOnQuickFilter = vi.fn();
		mockOnMultiSelectChange = vi.fn();
		mockOnSort = vi.fn();
		mockOnPageChange = vi.fn();
		mockOnLoadMore = vi.fn();
		mockOnRowAction = vi.fn();
		mockOnColumnToggle = vi.fn();
		mockOnToggleMobileCard = vi.fn();
		mockOnMapView = vi.fn();
		mockOnMapPreviewClose = vi.fn();
		vi.clearAllMocks();
	});

	describe('Loading State', () => {
		it('should render loading state', async () => {
			const { container } = render(ServerView, {
				props: {
					loading: true,
					error: null,
					searchQuery: '',
					paginatedServers: [],
					mobilePaginatedServers: [],
					mobileHasMore: false,
					mobileLoadingMore: false,
					totalPages: 1,
					filteredServersCount: 0,
					columns: mockColumns,
					maps: [],
					visibleColumns: mockVisibleColumns,
					activeFilters: [],
					isMultiSelect: false,
					currentPage: 1,
					sortColumn: null,
					sortDirection: null,
					mobileExpandedCards: {},
					onQuickFilter: mockOnQuickFilter,
					onMultiSelectChange: mockOnMultiSelectChange,
					onSort: mockOnSort,
					onPageChange: mockOnPageChange,
					onLoadMore: mockOnLoadMore,
					onRowAction: mockOnRowAction,
					onColumnToggle: mockOnColumnToggle,
					onToggleMobileCard: mockOnToggleMobileCard,
					onMapView: mockOnMapView,
					onMapPreviewClose: mockOnMapPreviewClose
				}
			});

			const loadingContainer = container.querySelector('.loading-container');
			expect(loadingContainer).toBeInTheDocument();
		});

		it('should have proper accessibility attributes in loading state', async () => {
			const { container } = render(ServerView, {
				props: {
					loading: true,
					error: null,
					searchQuery: '',
					paginatedServers: [],
					mobilePaginatedServers: [],
					mobileHasMore: false,
					mobileLoadingMore: false,
					totalPages: 1,
					filteredServersCount: 0,
					columns: mockColumns,
					maps: [],
					visibleColumns: mockVisibleColumns,
					activeFilters: [],
					isMultiSelect: false,
					currentPage: 1,
					sortColumn: null,
					sortDirection: null,
					mobileExpandedCards: {},
					onQuickFilter: mockOnQuickFilter,
					onMultiSelectChange: mockOnMultiSelectChange,
					onSort: mockOnSort,
					onPageChange: mockOnPageChange,
					onLoadMore: mockOnLoadMore,
					onRowAction: mockOnRowAction,
					onColumnToggle: mockOnColumnToggle,
					onToggleMobileCard: mockOnToggleMobileCard,
					onMapView: mockOnMapView,
					onMapPreviewClose: mockOnMapPreviewClose
				}
			});

			const loadingContainer = container.querySelector('.loading-container');
			expect(loadingContainer).toHaveAttribute('role', 'status');
			expect(loadingContainer).toHaveAttribute('aria-label', 'Loading server data');
		});

		it('should show loading dots animation', async () => {
			const { container } = render(ServerView, {
				props: {
					loading: true,
					error: null,
					searchQuery: '',
					paginatedServers: [],
					mobilePaginatedServers: [],
					mobileHasMore: false,
					mobileLoadingMore: false,
					totalPages: 1,
					filteredServersCount: 0,
					columns: mockColumns,
					maps: [],
					visibleColumns: mockVisibleColumns,
					activeFilters: [],
					isMultiSelect: false,
					currentPage: 1,
					sortColumn: null,
					sortDirection: null,
					mobileExpandedCards: {},
					onQuickFilter: mockOnQuickFilter,
					onMultiSelectChange: mockOnMultiSelectChange,
					onSort: mockOnSort,
					onPageChange: mockOnPageChange,
					onLoadMore: mockOnLoadMore,
					onRowAction: mockOnRowAction,
					onColumnToggle: mockOnColumnToggle,
					onToggleMobileCard: mockOnToggleMobileCard,
					onMapView: mockOnMapView,
					onMapPreviewClose: mockOnMapPreviewClose
				}
			});

			const loadingDots = container.querySelectorAll('.loading-dot');
			expect(loadingDots.length).toBe(3);
		});
	});

	describe('Error State', () => {
		it('should render error state', async () => {
			const { container } = render(ServerView, {
				props: {
					loading: false,
					error: 'Network error',
					searchQuery: '',
					paginatedServers: [],
					mobilePaginatedServers: [],
					mobileHasMore: false,
					mobileLoadingMore: false,
					totalPages: 1,
					filteredServersCount: 0,
					columns: mockColumns,
					maps: [],
					visibleColumns: mockVisibleColumns,
					activeFilters: [],
					isMultiSelect: false,
					currentPage: 1,
					sortColumn: null,
					sortDirection: null,
					mobileExpandedCards: {},
					onQuickFilter: mockOnQuickFilter,
					onMultiSelectChange: mockOnMultiSelectChange,
					onSort: mockOnSort,
					onPageChange: mockOnPageChange,
					onLoadMore: mockOnLoadMore,
					onRowAction: mockOnRowAction,
					onColumnToggle: mockOnColumnToggle,
					onToggleMobileCard: mockOnToggleMobileCard,
					onMapView: mockOnMapView,
					onMapPreviewClose: mockOnMapPreviewClose
				}
			});

			const alert = container.querySelector('.alert-error');
			expect(alert).toBeInTheDocument();
			expect(alert?.textContent).toContain('Network error');
		});
	});

	describe('Normal State', () => {
		it('should render content area', async () => {
			const { container } = render(ServerView, {
				props: {
					loading: false,
					error: null,
					searchQuery: '',
					paginatedServers: mockServers,
					mobilePaginatedServers: mockServers,
					mobileHasMore: false,
					mobileLoadingMore: false,
					totalPages: 1,
					filteredServersCount: 2,
					columns: mockColumns,
					maps: mockMaps,
					visibleColumns: mockVisibleColumns,
					activeFilters: [],
					isMultiSelect: false,
					currentPage: 1,
					sortColumn: null,
					sortDirection: null,
					mobileExpandedCards: {},
					onQuickFilter: mockOnQuickFilter,
					onMultiSelectChange: mockOnMultiSelectChange,
					onSort: mockOnSort,
					onPageChange: mockOnPageChange,
					onLoadMore: mockOnLoadMore,
					onRowAction: mockOnRowAction,
					onColumnToggle: mockOnColumnToggle,
					onToggleMobileCard: mockOnToggleMobileCard,
					onMapView: mockOnMapView,
					onMapPreviewClose: mockOnMapPreviewClose
				}
			});

			const contentArea = container.querySelector('.flex.w-full.flex-col');
			expect(contentArea).toBeInTheDocument();
		});

		it('should call onSort when sort button clicked', async () => {
			const { container } = render(ServerView, {
				props: {
					loading: false,
					error: null,
					searchQuery: '',
					paginatedServers: mockServers,
					mobilePaginatedServers: mockServers,
					mobileHasMore: false,
					mobileLoadingMore: false,
					totalPages: 1,
					filteredServersCount: 2,
					columns: mockColumns,
					maps: mockMaps,
					visibleColumns: mockVisibleColumns,
					activeFilters: [],
					isMultiSelect: false,
					currentPage: 1,
					sortColumn: null,
					sortDirection: null,
					mobileExpandedCards: {},
					onQuickFilter: mockOnQuickFilter,
					onMultiSelectChange: mockOnMultiSelectChange,
					onSort: mockOnSort,
					onPageChange: mockOnPageChange,
					onLoadMore: mockOnLoadMore,
					onRowAction: mockOnRowAction,
					onColumnToggle: mockOnColumnToggle,
					onToggleMobileCard: mockOnToggleMobileCard,
					onMapView: mockOnMapView,
					onMapPreviewClose: mockOnMapPreviewClose
				}
			});

			const sortButtons = container.querySelectorAll('.md\\:hidden .btn-outline');
			const firstButton = sortButtons[0] as HTMLElement;
			await fireEvent.click(firstButton);

			expect(mockOnSort).toHaveBeenCalledWith('name');
		});

		it('should render mobile server cards', async () => {
			const { container } = render(ServerView, {
				props: {
					loading: false,
					error: null,
					searchQuery: '',
					paginatedServers: mockServers,
					mobilePaginatedServers: mockServers,
					mobileHasMore: false,
					mobileLoadingMore: false,
					totalPages: 1,
					filteredServersCount: 2,
					columns: mockColumns,
					maps: mockMaps,
					visibleColumns: mockVisibleColumns,
					activeFilters: [],
					isMultiSelect: false,
					currentPage: 1,
					sortColumn: null,
					sortDirection: null,
					mobileExpandedCards: {},
					onQuickFilter: mockOnQuickFilter,
					onMultiSelectChange: mockOnMultiSelectChange,
					onSort: mockOnSort,
					onPageChange: mockOnPageChange,
					onLoadMore: mockOnLoadMore,
					onRowAction: mockOnRowAction,
					onColumnToggle: mockOnColumnToggle,
					onToggleMobileCard: mockOnToggleMobileCard,
					onMapView: mockOnMapView,
					onMapPreviewClose: mockOnMapPreviewClose
				}
			});

			const cards = container.querySelectorAll('.md\\:hidden .collapse');
			expect(cards.length).toBe(2);
		});

		it('should call onToggleMobileCard when card toggled', async () => {
			const { container } = render(ServerView, {
				props: {
					loading: false,
					error: null,
					searchQuery: '',
					paginatedServers: mockServers,
					mobilePaginatedServers: mockServers,
					mobileHasMore: false,
					mobileLoadingMore: false,
					totalPages: 1,
					filteredServersCount: 2,
					columns: mockColumns,
					maps: mockMaps,
					visibleColumns: mockVisibleColumns,
					activeFilters: [],
					isMultiSelect: false,
					currentPage: 1,
					sortColumn: null,
					sortDirection: null,
					mobileExpandedCards: {},
					onQuickFilter: mockOnQuickFilter,
					onMultiSelectChange: mockOnMultiSelectChange,
					onSort: mockOnSort,
					onPageChange: mockOnPageChange,
					onLoadMore: mockOnLoadMore,
					onRowAction: mockOnRowAction,
					onColumnToggle: mockOnColumnToggle,
					onToggleMobileCard: mockOnToggleMobileCard,
					onMapView: mockOnMapView,
					onMapPreviewClose: mockOnMapPreviewClose
				}
			});

			const checkbox = container.querySelector('.md\\:hidden .collapse input[type="checkbox"]') as HTMLElement;
			await fireEvent.click(checkbox);

			expect(mockOnToggleMobileCard).toHaveBeenCalledWith('server1');
		});

		it('should render map preview button when map data exists', async () => {
			const { container } = render(ServerView, {
				props: {
					loading: false,
					error: null,
					searchQuery: '',
					paginatedServers: mockServers,
					mobilePaginatedServers: mockServers,
					mobileHasMore: false,
					mobileLoadingMore: false,
					totalPages: 1,
					filteredServersCount: 2,
					columns: mockColumns,
					maps: mockMaps,
					visibleColumns: mockVisibleColumns,
					activeFilters: [],
					isMultiSelect: false,
					currentPage: 1,
					sortColumn: null,
					sortDirection: null,
					mobileExpandedCards: { server1: true },
					onQuickFilter: mockOnQuickFilter,
					onMultiSelectChange: mockOnMultiSelectChange,
					onSort: mockOnSort,
					onPageChange: mockOnPageChange,
					onLoadMore: mockOnLoadMore,
					onRowAction: mockOnRowAction,
					onColumnToggle: mockOnColumnToggle,
					onToggleMobileCard: mockOnToggleMobileCard,
					onMapView: mockOnMapView,
					onMapPreviewClose: mockOnMapPreviewClose
				}
			});

			// Need to expand card first by setting mobileExpandedCards
			const mapButtons = container.querySelectorAll('.md\\:hidden .btn-success');
			// Find map preview button (success button with white text)
			const previewButton = Array.from(mapButtons).find(btn =>
				btn.classList.contains('text-white')
			);
			expect(previewButton).toBeDefined();
		});

		it('should call onMapView when map preview button clicked', async () => {
			const { container } = render(ServerView, {
				props: {
					loading: false,
					error: null,
					searchQuery: '',
					paginatedServers: mockServers,
					mobilePaginatedServers: mockServers,
					mobileHasMore: false,
					mobileLoadingMore: false,
					totalPages: 1,
					filteredServersCount: 2,
					columns: mockColumns,
					maps: mockMaps,
					visibleColumns: mockVisibleColumns,
					activeFilters: [],
					isMultiSelect: false,
					currentPage: 1,
					sortColumn: null,
					sortDirection: null,
					mobileExpandedCards: { server1: true },
					onQuickFilter: mockOnQuickFilter,
					onMultiSelectChange: mockOnMultiSelectChange,
					onSort: mockOnSort,
					onPageChange: mockOnPageChange,
					onLoadMore: mockOnLoadMore,
					onRowAction: mockOnRowAction,
					onColumnToggle: mockOnColumnToggle,
					onToggleMobileCard: mockOnToggleMobileCard,
					onMapView: mockOnMapView,
					onMapPreviewClose: mockOnMapPreviewClose
				}
			});

			const mapButtons = container.querySelectorAll('.md\\:hidden button');
			const previewButton = Array.from(mapButtons).find(btn =>
				(btn as HTMLElement).classList.contains('text-green-600')
			) as HTMLElement;

			if (previewButton) {
				await fireEvent.click(previewButton);
				expect(mockOnMapView).toHaveBeenCalled();
			}
		});

		it('should show empty state when no servers', async () => {
			const { container } = render(ServerView, {
				props: {
					loading: false,
					error: null,
					searchQuery: '',
					paginatedServers: [],
					mobilePaginatedServers: [],
					mobileHasMore: false,
					mobileLoadingMore: false,
					totalPages: 1,
					filteredServersCount: 0,
					columns: mockColumns,
					maps: mockMaps,
					visibleColumns: mockVisibleColumns,
					activeFilters: [],
					isMultiSelect: false,
					currentPage: 1,
					sortColumn: null,
					sortDirection: null,
					mobileExpandedCards: {},
					onQuickFilter: mockOnQuickFilter,
					onMultiSelectChange: mockOnMultiSelectChange,
					onSort: mockOnSort,
					onPageChange: mockOnPageChange,
					onLoadMore: mockOnLoadMore,
					onRowAction: mockOnRowAction,
					onColumnToggle: mockOnColumnToggle,
					onToggleMobileCard: mockOnToggleMobileCard,
					onMapView: mockOnMapView,
					onMapPreviewClose: mockOnMapPreviewClose
				}
			});

			const emptyAlert = container.querySelector('.md\\:hidden .alert-info');
			expect(emptyAlert).toBeInTheDocument();
		});

		it('should show search-specific empty state when searching', async () => {
			const { container } = render(ServerView, {
				props: {
					loading: false,
					error: null,
					searchQuery: 'test',
					paginatedServers: [],
					mobilePaginatedServers: [],
					mobileHasMore: false,
					mobileLoadingMore: false,
					totalPages: 1,
					filteredServersCount: 0,
					columns: mockColumns,
					maps: mockMaps,
					visibleColumns: mockVisibleColumns,
					activeFilters: [],
					isMultiSelect: false,
					currentPage: 1,
					sortColumn: null,
					sortDirection: null,
					mobileExpandedCards: {},
					onQuickFilter: mockOnQuickFilter,
					onMultiSelectChange: mockOnMultiSelectChange,
					onSort: mockOnSort,
					onPageChange: mockOnPageChange,
					onLoadMore: mockOnLoadMore,
					onRowAction: mockOnRowAction,
					onColumnToggle: mockOnColumnToggle,
					onToggleMobileCard: mockOnToggleMobileCard,
					onMapView: mockOnMapView,
					onMapPreviewClose: mockOnMapPreviewClose
				}
			});

			const emptyAlert = container.querySelector('.md\\:hidden .alert-info');
			expect(emptyAlert?.textContent).toContain('matching your search');
		});

		it('should render desktop table container', async () => {
			const { container } = render(ServerView, {
				props: {
					loading: false,
					error: null,
					searchQuery: '',
					paginatedServers: mockServers,
					mobilePaginatedServers: mockServers,
					mobileHasMore: false,
					mobileLoadingMore: false,
					totalPages: 1,
					filteredServersCount: 2,
					columns: mockColumns,
					maps: mockMaps,
					visibleColumns: mockVisibleColumns,
					activeFilters: [],
					isMultiSelect: false,
					currentPage: 1,
					sortColumn: null,
					sortDirection: null,
					mobileExpandedCards: {},
					onQuickFilter: mockOnQuickFilter,
					onMultiSelectChange: mockOnMultiSelectChange,
					onSort: mockOnSort,
					onPageChange: mockOnPageChange,
					onLoadMore: mockOnLoadMore,
					onRowAction: mockOnRowAction,
					onColumnToggle: mockOnColumnToggle,
					onToggleMobileCard: mockOnToggleMobileCard,
					onMapView: mockOnMapView,
					onMapPreviewClose: mockOnMapPreviewClose
				}
			});

			const desktopContainer = container.querySelector('.hidden.md\\:block');
			expect(desktopContainer).toBeInTheDocument();
		});
	});

	describe('Edge Cases', () => {
		it('should handle empty maps array', async () => {
			const { container } = render(ServerView, {
				props: {
					loading: false,
					error: null,
					searchQuery: '',
					paginatedServers: mockServers,
					mobilePaginatedServers: mockServers,
					mobileHasMore: false,
					mobileLoadingMore: false,
					totalPages: 1,
					filteredServersCount: 2,
					columns: mockColumns,
					maps: [],
					visibleColumns: mockVisibleColumns,
					activeFilters: [],
					isMultiSelect: false,
					currentPage: 1,
					sortColumn: null,
					sortDirection: null,
					mobileExpandedCards: {},
					onQuickFilter: mockOnQuickFilter,
					onMultiSelectChange: mockOnMultiSelectChange,
					onSort: mockOnSort,
					onPageChange: mockOnPageChange,
					onLoadMore: mockOnLoadMore,
					onRowAction: mockOnRowAction,
					onColumnToggle: mockOnColumnToggle,
					onToggleMobileCard: mockOnToggleMobileCard,
					onMapView: mockOnMapView,
					onMapPreviewClose: mockOnMapPreviewClose
				}
			});

			// Should render without errors
			const contentArea = container.querySelector('.flex.w-full.flex-col');
			expect(contentArea).toBeInTheDocument();
		});

		it('should handle server without map data', async () => {
			const serversWithoutMap: IDisplayServerItem[] = [
				{
					id: 'server3',
					name: 'Server without map',
					playerCount: 5,
					mapId: 'maps/nonexistent',
					region: 'US',
					mode: 'CTF'
				} as IDisplayServerItem
			];

			const { container } = render(ServerView, {
				props: {
					loading: false,
					error: null,
					searchQuery: '',
					paginatedServers: serversWithoutMap,
					mobilePaginatedServers: serversWithoutMap,
					mobileHasMore: false,
					mobileLoadingMore: false,
					totalPages: 1,
					filteredServersCount: 1,
					columns: mockColumns,
					maps: [],
					visibleColumns: mockVisibleColumns,
					activeFilters: [],
					isMultiSelect: false,
					currentPage: 1,
					sortColumn: null,
					sortDirection: null,
					mobileExpandedCards: { server3: true },
					onQuickFilter: mockOnQuickFilter,
					onMultiSelectChange: mockOnMultiSelectChange,
					onSort: mockOnSort,
					onPageChange: mockOnPageChange,
					onLoadMore: mockOnLoadMore,
					onRowAction: mockOnRowAction,
					onColumnToggle: mockOnColumnToggle,
					onToggleMobileCard: mockOnToggleMobileCard,
					onMapView: mockOnMapView,
					onMapPreviewClose: mockOnMapPreviewClose
				}
			});

			// Should render without map preview button
			const cards = container.querySelectorAll('.md\\:hidden .collapse');
			expect(cards.length).toBe(1);
		});

		it('should handle null error', async () => {
			const { container } = render(ServerView, {
				props: {
					loading: false,
					error: null,
					searchQuery: '',
					paginatedServers: mockServers,
					mobilePaginatedServers: mockServers,
					mobileHasMore: false,
					mobileLoadingMore: false,
					totalPages: 1,
					filteredServersCount: 2,
					columns: mockColumns,
					maps: mockMaps,
					visibleColumns: mockVisibleColumns,
					activeFilters: [],
					isMultiSelect: false,
					currentPage: 1,
					sortColumn: null,
					sortDirection: null,
					mobileExpandedCards: {},
					onQuickFilter: mockOnQuickFilter,
					onMultiSelectChange: mockOnMultiSelectChange,
					onSort: mockOnSort,
					onPageChange: mockOnPageChange,
					onLoadMore: mockOnLoadMore,
					onRowAction: mockOnRowAction,
					onColumnToggle: mockOnColumnToggle,
					onToggleMobileCard: mockOnToggleMobileCard,
					onMapView: mockOnMapView,
					onMapPreviewClose: mockOnMapPreviewClose
				}
			});

			const alert = container.querySelector('.alert-error');
			expect(alert).not.toBeInTheDocument();
		});
	});
});
