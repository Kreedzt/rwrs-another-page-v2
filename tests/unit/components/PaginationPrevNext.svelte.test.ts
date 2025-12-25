import { render, screen, fireEvent, waitFor } from '@testing-library/svelte/svelte5';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PaginationPrevNext from '$lib/components/PaginationPrevNext.svelte';

// Mock TranslatedText component - return a simple text rendering component
vi.mock('$lib/components/TranslatedText.svelte', () => ({
	default: (props: { key: string; fallback?: string }) => {
		return (props.key || '');
	}
}));

describe('PaginationPrevNext Component', () => {
	let mockOnPageChange: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		mockOnPageChange = vi.fn();
		vi.clearAllMocks();
	});

	describe('Rendering', () => {
		it('should render with default props', async () => {
			const { container } = render(PaginationPrevNext, {
				props: {
					currentPage: 1,
					hasNext: true,
					hasPrevious: false,
					onPageChange: mockOnPageChange
				}
			});

			const wrapper = container.querySelector('.join');
			expect(wrapper).toBeInTheDocument();
		});

		it('should render previous button', async () => {
			render(PaginationPrevNext, {
				props: {
					currentPage: 2,
					hasNext: true,
					hasPrevious: true,
					onPageChange: mockOnPageChange
				}
			});

			const prevButton = screen.getByTitle('Previous page');
			expect(prevButton).toBeInTheDocument();
			// Button contains the ‹ character
			expect(prevButton.textContent).toBe('‹');
		});

		it('should render next button', async () => {
			render(PaginationPrevNext, {
				props: {
					currentPage: 1,
					hasNext: true,
					hasPrevious: false,
					onPageChange: mockOnPageChange
				}
			});

			const nextButton = screen.getByTitle('Next page');
			expect(nextButton).toBeInTheDocument();
			// Button contains the › character
			expect(nextButton.textContent).toBe('›');
		});

		it('should render current page indicator', async () => {
			const { container } = render(PaginationPrevNext, {
				props: {
					currentPage: 5,
					hasNext: true,
					hasPrevious: true,
					onPageChange: mockOnPageChange
				}
			});

			const activeButton = container.querySelector('.btn-active');
			expect(activeButton).toBeInTheDocument();
			expect(activeButton).toHaveTextContent('5');
		});

		it('should display correct page number', async () => {
			render(PaginationPrevNext, {
				props: {
					currentPage: 10,
					hasNext: false,
					hasPrevious: true,
					onPageChange: mockOnPageChange
				}
			});

			expect(screen.getByText('10')).toBeInTheDocument();
		});
	});

	describe('Button States', () => {
		it('should disable previous button when hasPrevious is false', async () => {
			render(PaginationPrevNext, {
				props: {
					currentPage: 1,
					hasNext: true,
					hasPrevious: false,
					onPageChange: mockOnPageChange
				}
			});

			const prevButton = screen.getByTitle('Previous page');
			expect(prevButton).toBeDisabled();
		});

		it('should enable previous button when hasPrevious is true', async () => {
			render(PaginationPrevNext, {
				props: {
					currentPage: 2,
					hasNext: true,
					hasPrevious: true,
					onPageChange: mockOnPageChange
				}
			});

			const prevButton = screen.getByTitle('Previous page');
			expect(prevButton).not.toBeDisabled();
		});

		it('should disable next button when hasNext is false', async () => {
			render(PaginationPrevNext, {
				props: {
					currentPage: 10,
					hasNext: false,
					hasPrevious: true,
					onPageChange: mockOnPageChange
				}
			});

			const nextButton = screen.getByTitle('Next page');
			expect(nextButton).toBeDisabled();
		});

		it('should enable next button when hasNext is true', async () => {
			render(PaginationPrevNext, {
				props: {
					currentPage: 1,
					hasNext: true,
					hasPrevious: false,
					onPageChange: mockOnPageChange
				}
			});

			const nextButton = screen.getByTitle('Next page');
			expect(nextButton).not.toBeDisabled();
		});

		it('should handle both buttons disabled on single page', async () => {
			render(PaginationPrevNext, {
				props: {
					currentPage: 1,
					hasNext: false,
					hasPrevious: false,
					onPageChange: mockOnPageChange
				}
			});

			const prevButton = screen.getByTitle('Previous page');
			const nextButton = screen.getByTitle('Next page');

			expect(prevButton).toBeDisabled();
			expect(nextButton).toBeDisabled();
		});
	});

	describe('User Interactions', () => {
		it('should call onPageChange with previous page when previous button clicked', async () => {
			render(PaginationPrevNext, {
				props: {
					currentPage: 5,
					hasNext: true,
					hasPrevious: true,
					onPageChange: mockOnPageChange
				}
			});

			const prevButton = screen.getByTitle('Previous page');
			await fireEvent.click(prevButton);

			expect(mockOnPageChange).toHaveBeenCalledWith(4);
			expect(mockOnPageChange).toHaveBeenCalledTimes(1);
		});

		it('should call onPageChange with next page when next button clicked', async () => {
			render(PaginationPrevNext, {
				props: {
					currentPage: 3,
					hasNext: true,
					hasPrevious: true,
					onPageChange: mockOnPageChange
				}
			});

			const nextButton = screen.getByTitle('Next page');
			await fireEvent.click(nextButton);

			expect(mockOnPageChange).toHaveBeenCalledWith(4);
			expect(mockOnPageChange).toHaveBeenCalledTimes(1);
		});

		it('should handle rapid page changes', async () => {
		render(PaginationPrevNext, {
			props: {
				currentPage: 2,
				hasNext: true,
				hasPrevious: true,
				onPageChange: mockOnPageChange
			}
		});

		const prevButton = screen.getByTitle('Previous page');
		const nextButton = screen.getByTitle('Next page');

		await fireEvent.click(nextButton);
		await fireEvent.click(nextButton);
		await fireEvent.click(prevButton);

		// Since currentPage prop doesn't update without parent intervention,
		// all clicks will use the initial currentPage value (2)
		expect(mockOnPageChange).toHaveBeenNthCalledWith(1, 3);
		expect(mockOnPageChange).toHaveBeenNthCalledWith(2, 3);
		expect(mockOnPageChange).toHaveBeenNthCalledWith(3, 1);
	});
	});

	describe('Reactive Updates', () => {
		it('should update page number when currentPage prop changes', async () => {
			const { rerender } = render(PaginationPrevNext, {
				props: {
					currentPage: 1,
					hasNext: true,
					hasPrevious: false,
					onPageChange: mockOnPageChange
				}
			});

			expect(screen.getByText('1')).toBeInTheDocument();

			await rerender({
				currentPage: 5,
				hasNext: true,
				hasPrevious: true,
				onPageChange: mockOnPageChange
			});

			expect(screen.getByText('5')).toBeInTheDocument();
		});

		it('should update button states when navigation props change', async () => {
			const { rerender } = render(PaginationPrevNext, {
				props: {
					currentPage: 1,
					hasNext: false,
					hasPrevious: false,
					onPageChange: mockOnPageChange
				}
			});

			const prevButton = screen.getByTitle('Previous page');
			const nextButton = screen.getByTitle('Next page');

			expect(prevButton).toBeDisabled();
			expect(nextButton).toBeDisabled();

			await rerender({
				currentPage: 2,
				hasNext: true,
				hasPrevious: true,
				onPageChange: mockOnPageChange
			});

			expect(prevButton).not.toBeDisabled();
			expect(nextButton).not.toBeDisabled();
		});
	});

	describe('Accessibility', () => {
		it('should have proper title attributes for buttons', async () => {
			render(PaginationPrevNext, {
				props: {
					currentPage: 2,
					hasNext: true,
					hasPrevious: true,
					onPageChange: mockOnPageChange
				}
			});

			const prevButton = screen.getByTitle('Previous page');
			const nextButton = screen.getByTitle('Next page');

			expect(prevButton).toBeInTheDocument();
			expect(nextButton).toBeInTheDocument();
		});

		it('should have proper button disabled state for accessibility', async () => {
			render(PaginationPrevNext, {
				props: {
					currentPage: 1,
					hasNext: true,
					hasPrevious: false,
					onPageChange: mockOnPageChange
				}
			});

			const prevButton = screen.getByTitle('Previous page');
			expect(prevButton).toHaveAttribute('disabled');
		});

		it('should have active state on current page indicator', async () => {
			const { container } = render(PaginationPrevNext, {
				props: {
					currentPage: 3,
					hasNext: true,
					hasPrevious: true,
					onPageChange: mockOnPageChange
				}
			});

			const activeButton = container.querySelector('.btn-active');
			expect(activeButton).toBeInTheDocument();
		});
	});

	describe('Edge Cases', () => {
		it('should handle page 1 with no pages', async () => {
			render(PaginationPrevNext, {
				props: {
					currentPage: 1,
					hasNext: false,
					hasPrevious: false,
					onPageChange: mockOnPageChange
				}
			});

			expect(screen.getByText('1')).toBeInTheDocument();
		});

		it('should handle large page numbers', async () => {
			render(PaginationPrevNext, {
				props: {
					currentPage: 9999,
					hasNext: false,
					hasPrevious: true,
					onPageChange: mockOnPageChange
				}
			});

			expect(screen.getByText('9999')).toBeInTheDocument();
		});

		it('should handle missing onPageChange gracefully', async () => {
			// Should not throw when onPageChange is not provided
			expect(() => {
				render(PaginationPrevNext, {
					props: {
						currentPage: 1,
						hasNext: true,
						hasPrevious: false
					}
				});
			}).not.toThrow();
		});

		it('should handle page 0 edge case', async () => {
			render(PaginationPrevNext, {
				props: {
					currentPage: 0,
					hasNext: true,
					hasPrevious: false,
					onPageChange: mockOnPageChange
				}
			});

			expect(screen.getByText('0')).toBeInTheDocument();
		});
	});
});
