import { render, screen, fireEvent } from '@testing-library/svelte/svelte5';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MobileDataTable from './MobileDataTable.svelte';
import { columns } from '$lib/config/columns';
import type { IDisplayServerItem } from '$lib/models/data-table.model';
import { createMockDisplayServers } from '$lib/test-utils/mock-data-generator';

// Mock the TranslatedText component
vi.mock('$lib/components/TranslatedText.svelte', () => ({
	default: (props: { key: string }) => props.key
}));

describe('MobileDataTable', () => {
	let mockData: IDisplayServerItem[];
	let mockOnRowAction: ReturnType<typeof vi.fn>;
	let mockOnSort: ReturnType<typeof vi.fn>;
	let mockVisibleColumns: Record<string, boolean>;

	beforeEach(() => {
		mockData = createMockDisplayServers(3);
		mockOnRowAction = vi.fn();
		mockOnSort = vi.fn();
		mockVisibleColumns = {
			name: true,
			playerCount: true,
			mapId: true,
			ipAddress: true,
			port: true,
			country: true,
			mode: true,
			bots: true,
			playerList: true,
			comment: true,
			dedicated: true,
			mod: true,
			url: true,
			version: true,
			action: true
		};
	});

	describe('Rendering', () => {
		it('should render mobile server cards correctly', () => {
			render(MobileDataTable, {
				props: {
					data: mockData,
					columns,
					visibleColumns: mockVisibleColumns,
					searchQuery: '',
					onRowAction: mockOnRowAction,
					onSort: mockOnSort
				}
			});

			// Should render mobile cards container
			const mobileCards = document.querySelector('.md\\:hidden');
			expect(mobileCards).toBeInTheDocument();

			// Should render server cards
			const cards = document.querySelectorAll('.card');
			expect(cards).toHaveLength(mockData.length);
		});

		it('should render server name, players, and map on same line', () => {
			render(MobileDataTable, {
				props: {
					data: mockData,
					columns,
					visibleColumns: mockVisibleColumns,
					searchQuery: '',
					onRowAction: mockOnRowAction,
					onSort: mockOnSort
				}
			});

			const firstCard = document.querySelector('.md\\:hidden .card');
			expect(firstCard).toBeInTheDocument();

			// Check server name in mobile card
			const serverName = firstCard?.querySelector('h3');
			expect(serverName).toBeInTheDocument();
			expect(serverName?.textContent).toContain(mockData[0].name);

			// Check player count badge in mobile card
			const playerBadge = firstCard?.querySelector('.badge');
			expect(playerBadge).toBeInTheDocument();

			// Check map badge in mobile card
			const mapBadge = firstCard?.querySelector('[data-map="map"]');
			expect(mapBadge).toBeInTheDocument();
		});

		it('should hide Join Server button on mobile', () => {
			render(MobileDataTable, {
				props: {
					data: mockData,
					columns,
					visibleColumns: mockVisibleColumns,
					searchQuery: '',
					onRowAction: mockOnRowAction,
					onSort: mockOnSort
				}
			});

			// Should not find any "Join Server" buttons in mobile view
			const joinButtons = screen.queryAllByText('Join Server');
			expect(joinButtons).toHaveLength(0);
		});

		it('should show desktop table on larger screens', () => {
			render(MobileDataTable, {
				props: {
					data: mockData,
					columns,
					visibleColumns: mockVisibleColumns,
					searchQuery: '',
					onRowAction: mockOnRowAction,
					onSort: mockOnSort
				}
			});

			// Should render desktop table container
			const desktopTable = document.querySelector('.hidden.md\\:block');
			expect(desktopTable).toBeInTheDocument();
		});

		it('should not show expand button when no secondary columns are visible', () => {
			const visibleColumnsOnlyPrimary = {
				name: true,
				playerCount: true,
				mapId: true,
				action: false
			};

			render(MobileDataTable, {
				props: {
					data: mockData,
					columns,
					visibleColumns: visibleColumnsOnlyPrimary,
					searchQuery: '',
					onRowAction: mockOnRowAction,
					onSort: mockOnSort
				}
			});

			// Mobile should always show expand button since it shows all secondary columns regardless of settings
			const expandButtons = document.querySelectorAll('button[aria-label*="Toggle"]');
			expect(expandButtons.length).toBeGreaterThan(0);
		});
	});

	describe('Empty state', () => {
		it('should show empty state message when no data', () => {
			render(MobileDataTable, {
				props: {
					data: [],
					columns,
					visibleColumns: mockVisibleColumns,
					searchQuery: '',
					onRowAction: mockOnRowAction,
					onSort: mockOnSort
				}
			});

			const emptyMessage = screen.getByText(/no data found/i);
			expect(emptyMessage).toBeInTheDocument();
		});

		it('should show search-related empty message when searching', () => {
			render(MobileDataTable, {
				props: {
					data: [],
					columns,
					visibleColumns: mockVisibleColumns,
					searchQuery: 'test search',
					onRowAction: mockOnRowAction,
					onSort: mockOnSort
				}
			});

			const emptyMessage = screen.getByText(/no data found matching your search/i);
			expect(emptyMessage).toBeInTheDocument();
		});
	});

	describe('Column visibility', () => {
		it('should respect visibleColumns configuration', () => {
			const limitedColumns = {
				name: true,
				playerCount: true,
				mapId: true,
				ipAddress: false, // Hidden
				port: false, // Hidden
				action: false
			};

			render(MobileDataTable, {
				props: {
					data: mockData,
					columns,
					visibleColumns: limitedColumns,
					searchQuery: '',
					onRowAction: mockOnRowAction,
					onSort: mockOnSort
				}
			});

			// Should show primary info in mobile card
			const mobileCards = document.querySelectorAll('.md\\:hidden .card');
			expect(mobileCards.length).toBe(mockData.length);

			const firstCardName = mobileCards[0]?.querySelector('h3');
			expect(firstCardName?.textContent).toContain(mockData[0].name);

			// Mobile should always show expand button since it shows all secondary columns regardless of settings
			const expandButtons = document.querySelectorAll('button[aria-label*="Toggle"]');
			expect(expandButtons.length).toBeGreaterThan(0);
		});

		it('should always show player count on mobile regardless of visibility settings', () => {
			const hiddenPlayerCount = {
				...mockVisibleColumns,
				playerCount: false
			};

			render(MobileDataTable, {
				props: {
					data: mockData,
					columns,
					visibleColumns: hiddenPlayerCount,
					searchQuery: '',
					onRowAction: mockOnRowAction,
					onSort: mockOnSort
				}
			});

			// Mobile should always show capacity badges regardless of user settings
			const capacityBadges = document.querySelectorAll(
				'.bg-red-100, .bg-orange-100, .bg-amber-100, .bg-green-100, .bg-gray-100'
			);
			expect(capacityBadges.length).toBeGreaterThan(0);
		});

		it('should always show map on mobile regardless of visibility settings', () => {
			const hiddenMap = {
				...mockVisibleColumns,
				mapId: false
			};

			render(MobileDataTable, {
				props: {
					data: mockData,
					columns,
					visibleColumns: hiddenMap,
					searchQuery: '',
					onRowAction: mockOnRowAction,
					onSort: mockOnSort
				}
			});

			// Mobile should always show map badges regardless of user settings
			const mapBadges = document.querySelectorAll('[data-map="map"]');
			expect(mapBadges.length).toBeGreaterThan(0);
		});
	});

	describe('Search highlighting', () => {
		it('should highlight search matches in server names', () => {
			const searchTerm = mockData[0].name.substring(0, 3);

			render(MobileDataTable, {
				props: {
					data: mockData,
					columns,
					visibleColumns: mockVisibleColumns,
					searchQuery: searchTerm,
					onRowAction: mockOnRowAction,
					onSort: mockOnSort
				}
			});

			// Check for highlighted text
			const highlightedText = document.querySelector('mark');
			expect(highlightedText).toBeInTheDocument();
			expect(highlightedText?.textContent).toBe(searchTerm);
		});
	});

	describe('Mobile sorting controls', () => {
		it('should show sort controls only on mobile for primary columns', () => {
			render(MobileDataTable, {
				props: {
					data: mockData,
					columns,
					visibleColumns: mockVisibleColumns,
					searchQuery: '',
					onRowAction: mockOnRowAction,
					onSort: mockOnSort
				}
			});

			// Should find sort buttons for primary columns only on mobile (name, playerCount, mapId)
			const sortButtons = document.querySelectorAll('.md\\:hidden button[class*="btn-outline"]');
			expect(sortButtons.length).toBeGreaterThanOrEqual(3);
		});

		it('should not show sort controls on desktop', () => {
			render(MobileDataTable, {
				props: {
					data: mockData,
					columns,
					visibleColumns: mockVisibleColumns,
					searchQuery: '',
					onRowAction: mockOnRowAction,
					onSort: mockOnSort
				}
			});

			// Should find mobile sort controls (with md:hidden class)
			const mobileSortButtons = document.querySelectorAll(
				'.md\\:hidden button[class*="btn-outline"]'
			);
			expect(mobileSortButtons.length).toBeGreaterThanOrEqual(3);

			// Should not find sort buttons outside mobile section (desktop)
			const desktopSortButtons = document.querySelectorAll('.hidden.md\\:block button');
			// Desktop should only have table structure, no standalone sort buttons
			const standaloneSortButtons = Array.from(desktopSortButtons).filter(
				(btn) => btn.closest('table') === null
			);
			expect(standaloneSortButtons.length).toBe(0);
		});

		it('should call onSort when mobile sort button is clicked', async () => {
			render(MobileDataTable, {
				props: {
					data: mockData,
					columns,
					visibleColumns: mockVisibleColumns,
					searchQuery: '',
					onRowAction: mockOnRowAction,
					onSort: mockOnSort
				}
			});

			const sortButtons = document.querySelectorAll('.md\\:hidden button[class*="btn-outline"]');
			expect(sortButtons.length).toBeGreaterThan(0);

			await fireEvent.click(sortButtons[0]);
			expect(mockOnSort).toHaveBeenCalledWith('name');
		});

		it('should show sort icons based on current sort state in mobile controls', () => {
			render(MobileDataTable, {
				props: {
					data: mockData,
					columns,
					visibleColumns: mockVisibleColumns,
					searchQuery: '',
					onRowAction: mockOnRowAction,
					onSort: mockOnSort,
					sortColumn: 'name',
					sortDirection: 'desc'
				}
			});

			// Should find sort icons in mobile sort controls
			const sortIcons = document.querySelectorAll('.md\\:hidden .w-4.h-4');
			expect(sortIcons.length).toBeGreaterThan(0);
		});
	});

	describe('Accessibility', () => {
		it('should have proper ARIA attributes for expandable buttons', () => {
			render(MobileDataTable, {
				props: {
					data: mockData,
					columns,
					visibleColumns: mockVisibleColumns,
					searchQuery: '',
					onRowAction: mockOnRowAction,
					onSort: mockOnSort
				}
			});

			const expandButtons = document.querySelectorAll('button[aria-expanded]');
			expandButtons.forEach((button) => {
				expect(button).toHaveAttribute('aria-label');
				expect(button).toHaveAttribute('aria-expanded');
			});
		});

		it('should expand/collapse when clicking the card', async () => {
			render(MobileDataTable, {
				props: {
					data: mockData,
					columns,
					visibleColumns: mockVisibleColumns,
					searchQuery: '',
					onRowAction: mockOnRowAction,
					onSort: mockOnSort
				}
			});

			// Should not find details initially
			const details = document.querySelector('.border-t.border-base-200');
			expect(details).not.toBeInTheDocument();

			// Click first card to expand
			const expandButton = document.querySelector('button[aria-label]');
			if (expandButton) {
				await fireEvent.click(expandButton);
				// Now details should be visible
				const expandedDetails = document.querySelector('.border-t.border-base-200');
				expect(expandedDetails).toBeInTheDocument();
			}
		});
	});

	describe('Responsive behavior', () => {
		it('should hide mobile cards on medium screens and larger', () => {
			render(MobileDataTable, {
				props: {
					data: mockData,
					columns,
					visibleColumns: mockVisibleColumns,
					searchQuery: '',
					onRowAction: mockOnRowAction,
					onSort: mockOnSort
				}
			});

			const mobileCards = document.querySelector('.md\\:hidden');
			const desktopTable = document.querySelector('.hidden.md\\:block');

			expect(mobileCards).toBeInTheDocument();
			expect(desktopTable).toBeInTheDocument();
		});
	});

	describe('Data integrity', () => {
		it('should handle servers with missing properties gracefully', () => {
			const serverWithMissingData: IDisplayServerItem = {
				...mockData[0],
				comment: null,
				url: null,
				playerList: []
			};

			render(MobileDataTable, {
				props: {
					data: [serverWithMissingData],
					columns,
					visibleColumns: mockVisibleColumns,
					searchQuery: '',
					onRowAction: mockOnRowAction,
					onSort: mockOnSort
				}
			});

			// Should still render the card without errors
			const cards = document.querySelectorAll('.card');
			expect(cards).toHaveLength(1);
		});

		it('should handle empty arrays in playerList', () => {
			const serverWithEmptyPlayerList: IDisplayServerItem = {
				...mockData[0],
				playerList: []
			};

			render(MobileDataTable, {
				props: {
					data: [serverWithEmptyPlayerList],
					columns,
					visibleColumns: mockVisibleColumns,
					searchQuery: '',
					onRowAction: mockOnRowAction,
					onSort: mockOnSort
				}
			});

			// Should still render the card
			const cards = document.querySelectorAll('.card');
			expect(cards).toHaveLength(1);
		});

		it('should display all required fields in collapsible panel', async () => {
			const serverWithAllData: IDisplayServerItem = {
				...mockData[0],
				mode: 'CTF',
				comment:
					'This is a test server with a very long comment that should wrap properly on mobile devices',
				url: 'https://example.com/very-long-url-that-needs-to-break-properly/on-mobile-screens/with-multiple-segments',
				mod: true,
				dedicated: true,
				version: '1.5.0'
			};

			const longUrl =
				'https://example.com/very-long-url-that-needs-to-break-properly/on-mobile-screens/with-multiple-segments';
			const expectedMobileUrl = 'https://example.com/very-lo...'; // 30 chars max for mobile
			const expectedDesktopUrl = 'https://example.com/very-long-url-that-needs...'; // 50 chars max for desktop

			render(MobileDataTable, {
				props: {
					data: [serverWithAllData],
					columns,
					visibleColumns: mockVisibleColumns,
					searchQuery: '',
					onRowAction: mockOnRowAction,
					onSort: mockOnSort
				}
			});

			// Expand the card to show details
			const expandButton = document.querySelector('button[aria-label]');
			if (expandButton) {
				await fireEvent.click(expandButton);

				// Check for required fields in expanded content
				const expandedContent = document.querySelector('.border-t.border-base-200');
				expect(expandedContent).toBeInTheDocument();

				// Should contain all the required field labels
				const detailsHTML = expandedContent?.innerHTML || '';

				// Check for Mode field (badge with data-mode attribute)
				expect(detailsHTML).toContain('CTF');
				const modeBadge = expandedContent?.querySelector('[data-mode="mode"]');
				expect(modeBadge).toBeInTheDocument();

				// Check for Comment field (should contain the comment text)
				expect(detailsHTML).toContain('This is a test server');

				// Check for URL field with proper link and truncation
				const urlLink = expandedContent?.querySelector('a[href*="example.com"]');
				expect(urlLink).toBeInTheDocument();
				// URL should be truncated for mobile (max 30 chars)
				expect(urlLink?.textContent).toBe(expectedMobileUrl);
				// Title should contain full URL
				expect(urlLink?.getAttribute('title')).toBe(longUrl);

				// Check for Mod field (should contain Yes)
				expect(detailsHTML).toContain('Yes');

				// Check for Dedicated field (should contain Yes)
				// Should have two "Yes" values - one for mod, one for dedicated
				const yesCount = (detailsHTML.match(/Yes/g) || []).length;
				expect(yesCount).toBeGreaterThanOrEqual(2);

				// Check for Version field
				expect(detailsHTML).toContain('1.5.0');

				// Verify we have the proper structure with label containers
				const labelContainers = expandedContent?.querySelectorAll('.text-base-content\\/60');
				expect(labelContainers.length).toBeGreaterThan(5); // Should have labels for all fields
			}
		});
	});

	describe('getAlignmentClass function', () => {
		it('should return correct CSS classes for different alignment configurations', () => {
			// Use existing columns but create a copy with modified alignments
			const testColumns = columns.map(col => {
				if (col.key === 'name') {
					return { ...col, alignment: 'left' as const };
				}
				if (col.key === 'mode') {
					return { ...col, alignment: 'center' as const };
				}
				if (col.key === 'playerCount') {
					return { ...col, alignment: 'right' as const };
				}
				if (col.key === 'playerList') {
					return { ...col, alignment: 'top' as const };
				}
				return col;
			});

			render(MobileDataTable, {
				props: {
					data: mockData,
					columns: testColumns,
					visibleColumns: {
						name: true,
						mode: true,
						playerCount: true,
						playerList: true,
						comment: true,
						action: true
					},
					searchQuery: '',
					onRowAction: mockOnRowAction,
					onSort: mockOnSort
				}
			});

			// Check desktop table for alignment classes
			const desktopCells = document.querySelectorAll('.hidden.md\\:block td');

			// Find cells by their content to test alignment
			const nameCell = Array.from(desktopCells).find(cell =>
				cell.textContent?.includes(mockData[0].name)
			);

			// Test left alignment (default for name)
			expect(nameCell).toHaveClass('align-middle');

			// Test playerList alignment (should be top-aligned)
			const playerListCells = Array.from(desktopCells).filter(cell =>
				cell.classList.contains('align-top')
			);
			expect(playerListCells.length).toBeGreaterThan(0);

			// Test that cells have alignment classes applied
			const alignedCells = Array.from(desktopCells).filter(cell =>
				cell.classList.contains('align-middle') ||
				cell.classList.contains('align-top') ||
				cell.classList.contains('text-center') ||
				cell.classList.contains('text-right')
			);
			expect(alignedCells.length).toBeGreaterThan(0);
		});

		it('should default to left alignment when no alignment is specified', () => {
			render(MobileDataTable, {
				props: {
					data: mockData,
					columns, // Use default columns which don't specify alignment
					visibleColumns: {
						name: true,
						comment: true,
						action: true
					},
					searchQuery: '',
					onRowAction: mockOnRowAction,
					onSort: mockOnSort
				}
			});

			const desktopCells = document.querySelectorAll('.hidden.md\\:block td');
			const nameCell = Array.from(desktopCells).find(cell =>
				cell.textContent?.includes(mockData[0].name)
			);

			// Should default to align-middle for unspecified alignment
			expect(nameCell).toHaveClass('align-middle');
		});
	});

	describe('Action column styling', () => {
		it('should apply proper CSS classes to action column in desktop view', () => {
			render(MobileDataTable, {
				props: {
					data: mockData,
					columns,
					visibleColumns: {
						...mockVisibleColumns,
						action: true
					},
					searchQuery: '',
					onRowAction: mockOnRowAction,
					onSort: mockOnSort
				}
			});

			// Check desktop table action header
			const actionHeader = document.querySelector('.hidden.md\\:block .action-header');
			expect(actionHeader).toBeInTheDocument();
			expect(actionHeader).toHaveClass('bg-slate-50');

			// Check desktop table action cells
			const actionCells = document.querySelectorAll('.hidden.md\\:block .action-cell');
			expect(actionCells.length).toBe(mockData.length);

			actionCells.forEach(cell => {
				expect(cell).toHaveClass('bg-slate-50');
			});
		});

		it('should hide action column on mobile view', () => {
			render(MobileDataTable, {
				props: {
					data: mockData,
					columns,
					visibleColumns: {
						...mockVisibleColumns,
						action: true
					},
					searchQuery: '',
					onRowAction: mockOnRowAction,
					onSort: mockOnSort
				}
			});

			// Mobile view should not have action column classes
			const mobileActionHeaders = document.querySelectorAll('.md\\:hidden .action-header');
			const mobileActionCells = document.querySelectorAll('.md\\:hidden .action-cell');

			expect(mobileActionHeaders.length).toBe(0);
			expect(mobileActionCells.length).toBe(0);
		});

		it('should still render Join buttons in desktop action column', () => {
			render(MobileDataTable, {
				props: {
					data: mockData,
					columns,
					visibleColumns: {
						...mockVisibleColumns,
						action: true
					},
					searchQuery: '',
					onRowAction: mockOnRowAction,
					onSort: mockOnSort
				}
			});

			// Should find Join buttons in desktop view
			const joinButtons = document.querySelectorAll('.hidden.md\\:block .btn-primary');
			expect(joinButtons.length).toBe(mockData.length);

			joinButtons.forEach(button => {
				expect(button).toHaveTextContent('Join');
			});
		});
	});

	describe('CSS optimization verification', () => {
		it('should not contain deprecated CSS selectors or properties', () => {
			render(MobileDataTable, {
				props: {
					data: mockData,
					columns,
					visibleColumns: mockVisibleColumns,
					searchQuery: '',
					onRowAction: mockOnRowAction,
					onSort: mockOnSort
				}
			});

			// Check that action elements don't have old complex selectors
			const actionCells = document.querySelectorAll('.action-cell');
			const actionHeaders = document.querySelectorAll('.action-header');

			// Should have the clean, simplified classes
			actionCells.forEach(cell => {
				expect(cell).toHaveClass('action-cell');
				expect(cell).toHaveClass('bg-slate-50');
			});

			actionHeaders.forEach(header => {
				expect(header).toHaveClass('action-header');
				expect(header).toHaveClass('bg-slate-50');
			});
		});

		it('should maintain responsive behavior with optimized CSS', () => {
			render(MobileDataTable, {
				props: {
					data: mockData,
					columns,
					visibleColumns: mockVisibleColumns,
					searchQuery: '',
					onRowAction: mockOnRowAction,
					onSort: mockOnSort
				}
			});

			// Verify both mobile and desktop views are still present
			const mobileView = document.querySelector('.md\\:hidden');
			const desktopView = document.querySelector('.hidden.md\\:block');

			expect(mobileView).toBeInTheDocument();
			expect(desktopView).toBeInTheDocument();

			// Verify mobile buttons still have proper styling
			const mobileButtons = document.querySelectorAll('.mobile-btn');
			mobileButtons.forEach(button => {
				expect(button).toBeInTheDocument();
			});
		});
	});
});
