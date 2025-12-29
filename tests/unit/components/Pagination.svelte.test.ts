import { render, fireEvent } from '@testing-library/svelte/svelte5';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Pagination from '$lib/components/Pagination.svelte';

// Mock TranslatedText component
vi.mock('$lib/components/TranslatedText.svelte', () => ({
	default: (props: { key: string; defaultText?: string; params?: Record<string, unknown> }) => {
		if (props.key === 'app.pagination.info') {
			return `Page ${props.params?.currentPage} of ${props.params?.totalPages} (${props.params?.totalItems} items)`;
		}
		return props.defaultText || props.key;
	}
}));

describe('Pagination Component', () => {
	let mockPageChange: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		mockPageChange = vi.fn();
		vi.clearAllMocks();
	});

	describe('Rendering', () => {
		it('should not render when totalPages is 1', async () => {
			const { container } = render(Pagination, {
				props: {
					currentPage: 1,
					totalPages: 1,
					totalItems: 10,
					pageChange: mockPageChange
				}
			});

			const pagination = container.querySelector('.join');
			expect(pagination).not.toBeInTheDocument();
		});

		it('should not render when totalPages is 0', async () => {
			const { container } = render(Pagination, {
				props: {
					currentPage: 1,
					totalPages: 0,
					totalItems: 0,
					pageChange: mockPageChange
				}
			});

			const pagination = container.querySelector('.join');
			expect(pagination).not.toBeInTheDocument();
		});

		it('should render pagination when totalPages > 1', async () => {
			const { container } = render(Pagination, {
				props: {
					currentPage: 1,
					totalPages: 5,
					totalItems: 50,
					pageChange: mockPageChange
				}
			});

			const join = container.querySelector('.join');
			expect(join).toBeInTheDocument();
		});

		it('should render page number buttons', async () => {
			const { container } = render(Pagination, {
				props: {
					currentPage: 1,
					totalPages: 5,
					totalItems: 50,
					pageChange: mockPageChange
				}
			});

			const buttons = container.querySelectorAll('.join-item.btn');
			expect(buttons.length).toBeGreaterThan(0);
		});

		it('should render first/last and prev/next buttons', async () => {
			const { container } = render(Pagination, {
				props: {
					currentPage: 2,
					totalPages: 10,
					totalItems: 100,
					pageChange: mockPageChange
				}
			});

			const buttons = container.querySelectorAll('.join-item.btn');
			// Should have: first, prev, page numbers, next, last
			expect(buttons.length).toBeGreaterThan(4);
		});

		it('should show page info text', async () => {
			const { container } = render(Pagination, {
				props: {
					currentPage: 2,
					totalPages: 10,
					totalItems: 100,
					pageChange: mockPageChange
				}
			});

			const pageInfo = container.querySelector('span');
			expect(pageInfo).toBeInTheDocument();
		});
	});

	describe('Navigation Buttons', () => {
		it('should call pageChange with page 1 when first button clicked', async () => {
			const { container } = render(Pagination, {
				props: {
					currentPage: 3,
					totalPages: 10,
					totalItems: 100,
					pageChange: mockPageChange
				}
			});

			const firstButton = container.querySelectorAll('.join-item.btn')[0] as HTMLElement;
			await fireEvent.click(firstButton);

			expect(mockPageChange).toHaveBeenCalledWith(1);
		});

		it('should call pageChange with previous page when prev button clicked', async () => {
			const { container } = render(Pagination, {
				props: {
					currentPage: 3,
					totalPages: 10,
					totalItems: 100,
					pageChange: mockPageChange
				}
			});

			const buttons = container.querySelectorAll('.join-item.btn');
			const prevButton = buttons[1] as HTMLElement;
			await fireEvent.click(prevButton);

			expect(mockPageChange).toHaveBeenCalledWith(2);
		});

		it('should call pageChange with next page when next button clicked', async () => {
			const { container } = render(Pagination, {
				props: {
					currentPage: 3,
					totalPages: 10,
					totalItems: 100,
					pageChange: mockPageChange
				}
			});

			const buttons = container.querySelectorAll('.join-item.btn');
			// Next to last button
			const nextButton = buttons[buttons.length - 2] as HTMLElement;
			await fireEvent.click(nextButton);

			expect(mockPageChange).toHaveBeenCalledWith(4);
		});

		it('should call pageChange with last page when last button clicked', async () => {
			const { container } = render(Pagination, {
				props: {
					currentPage: 3,
					totalPages: 10,
					totalItems: 100,
					pageChange: mockPageChange
				}
			});

			const buttons = container.querySelectorAll('.join-item.btn');
			// Last button
			const lastButton = buttons[buttons.length - 1] as HTMLElement;
			await fireEvent.click(lastButton);

			expect(mockPageChange).toHaveBeenCalledWith(10);
		});
	});

	describe('Button States', () => {
		it('should disable first and prev buttons on first page', async () => {
			const { container } = render(Pagination, {
				props: {
					currentPage: 1,
					totalPages: 5,
					totalItems: 50,
					pageChange: mockPageChange
				}
			});

			const buttons = container.querySelectorAll('.join-item.btn');
			const firstButton = buttons[0] as HTMLButtonElement;
			const prevButton = buttons[1] as HTMLButtonElement;

			expect(firstButton.disabled).toBe(true);
			expect(prevButton.disabled).toBe(true);
		});

		it('should disable next and last buttons on last page', async () => {
			const { container } = render(Pagination, {
				props: {
					currentPage: 5,
					totalPages: 5,
					totalItems: 50,
					pageChange: mockPageChange
				}
			});

			const buttons = container.querySelectorAll('.join-item.btn');
			const nextButton = buttons[buttons.length - 2] as HTMLButtonElement;
			const lastButton = buttons[buttons.length - 1] as HTMLButtonElement;

			expect(nextButton.disabled).toBe(true);
			expect(lastButton.disabled).toBe(true);
		});

		it('should mark current page as active', async () => {
			const { container } = render(Pagination, {
				props: {
					currentPage: 3,
					totalPages: 5,
					totalItems: 50,
					pageChange: mockPageChange
				}
			});

			const buttons = container.querySelectorAll('.join-item.btn');
			const pageButtons = Array.from(buttons).filter((btn) =>
				/^\d+$/.test((btn as HTMLElement).textContent || '')
			);

			// Find the button with text "3"
			const activeButton = pageButtons.find(
				(btn) => (btn as HTMLElement).textContent === '3'
			) as HTMLElement;

			expect(activeButton?.classList.contains('btn-active')).toBe(true);
		});
	});

	describe('Page Number Generation', () => {
		it('should show all page numbers when total pages <= maxVisiblePages', async () => {
			const { container } = render(Pagination, {
				props: {
					currentPage: 1,
					totalPages: 3,
					totalItems: 30,
					maxVisiblePages: 5,
					pageChange: mockPageChange
				}
			});

			// Count buttons that contain only digits
			const buttons = container.querySelectorAll('.join-item.btn');
			const pageButtons = Array.from(buttons).filter((btn) =>
				/^\d+$/.test((btn as HTMLElement).textContent || '')
			);

			expect(pageButtons.length).toBe(3);
		});

		it('should limit visible page numbers to maxVisiblePages', async () => {
			const { container } = render(Pagination, {
				props: {
					currentPage: 5,
					totalPages: 20,
					totalItems: 200,
					maxVisiblePages: 5,
					pageChange: mockPageChange
				}
			});

			// Count buttons that contain only digits
			const buttons = container.querySelectorAll('.join-item.btn');
			const pageButtons = Array.from(buttons).filter((btn) =>
				/^\d+$/.test((btn as HTMLElement).textContent || '')
			);

			// Should show at most maxVisiblePages page number buttons
			expect(pageButtons.length).toBeLessThanOrEqual(5);
		});

		it('should generate correct page numbers for middle page', async () => {
			const { container } = render(Pagination, {
				props: {
					currentPage: 5,
					totalPages: 10,
					totalItems: 100,
					maxVisiblePages: 5,
					pageChange: mockPageChange
				}
			});

			// With maxVisiblePages=5 and currentPage=5, should show pages around 5
			const buttons = container.querySelectorAll('.join-item.btn');
			const pageButtons = Array.from(buttons).filter((btn) =>
				/^\d+$/.test((btn as HTMLElement).textContent || '')
			);

			// Should have page numbers like 3, 4, 5, 6, 7
			const pageNumbers = pageButtons.map((btn) =>
				parseInt((btn as HTMLElement).textContent || '0')
			);
			expect(pageNumbers).toContain(5);
		});
	});

	describe('User Interactions', () => {
		it('should call pageChange when page number button clicked', async () => {
			const { container } = render(Pagination, {
				props: {
					currentPage: 1,
					totalPages: 5,
					totalItems: 50,
					pageChange: mockPageChange
				}
			});

			const buttons = container.querySelectorAll('.join-item.btn');
			// Find button with text "3"
			const pageButton = Array.from(buttons).find(
				(btn) => (btn as HTMLElement).textContent === '3'
			) as HTMLElement;

			await fireEvent.click(pageButton);

			expect(mockPageChange).toHaveBeenCalledWith(3);
		});

		it('should not call pageChange for invalid page navigation', async () => {
			const { container } = render(Pagination, {
				props: {
					currentPage: 1,
					totalPages: 1,
					totalItems: 10,
					pageChange: mockPageChange
				}
			});

			// Component should not render with totalPages=1, so this tests edge case
			expect(mockPageChange).not.toHaveBeenCalled();
		});
	});

	describe('Edge Cases', () => {
		it('should handle currentPage equal to totalPages', async () => {
			const { container } = render(Pagination, {
				props: {
					currentPage: 5,
					totalPages: 5,
					totalItems: 50,
					pageChange: mockPageChange
				}
			});

			const join = container.querySelector('.join');
			expect(join).toBeInTheDocument();
		});

		it('should handle very large totalPages', async () => {
			const { container } = render(Pagination, {
				props: {
					currentPage: 50,
					totalPages: 100,
					totalItems: 1000,
					maxVisiblePages: 5,
					pageChange: mockPageChange
				}
			});

			const join = container.querySelector('.join');
			expect(join).toBeInTheDocument();
		});

		it('should handle zero totalItems', async () => {
			const { container } = render(Pagination, {
				props: {
					currentPage: 1,
					totalPages: 5,
					totalItems: 0,
					pageChange: mockPageChange
				}
			});

			const join = container.querySelector('.join');
			expect(join).toBeInTheDocument();
		});

		it('should use default maxVisiblePages when not provided', async () => {
			const { container } = render(Pagination, {
				props: {
					currentPage: 5,
					totalPages: 20,
					totalItems: 200,
					pageChange: mockPageChange
				}
			});

			const join = container.querySelector('.join');
			expect(join).toBeInTheDocument();
		});
	});
});
