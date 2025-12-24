import { render, screen, fireEvent } from '@testing-library/svelte/svelte5';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import QuickFilterButtons from '$lib/components/QuickFilterButtons.svelte';

// Mock the TranslatedText component
vi.mock('$lib/components/TranslatedText.svelte', () => ({
	default: (props: { key: string; fallback?: string }) => {
		// Return the fallback if provided, otherwise return a default text based on the key
		if (props.fallback) return props.fallback;

		// Map keys to default values for testing
		const keyToText: Record<string, string> = {
			'app.filter.officialInvasion': 'Official Invasion',
			'app.filter.officialWW2Invasion': 'Official WW2 Invasion',
			'app.filter.officialDominance': 'Official Dominance',
			'app.filter.officialModCastling': 'Official Mod Castling',
			'app.filter.officialModHellDivers': 'Official Mod HellDivers',
			'app.switch.multipleSelect': 'Multiple Select'
		};

		return keyToText[props.key] || props.key;
	}
}));

describe('QuickFilterButtons', () => {
	let mockOnQuickFilter: ReturnType<typeof vi.fn>;
	let mockOnMultiSelectChange: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		mockOnQuickFilter = vi.fn();
		mockOnMultiSelectChange = vi.fn();
	});

	describe('Rendering', () => {
		it('should render quick filter buttons correctly', () => {
			render(QuickFilterButtons, {
				props: {
					isLoading: false,
					onQuickFilter: mockOnQuickFilter,
					activeFilters: [],
					isMultiSelect: false,
					onMultiSelectChange: mockOnMultiSelectChange
				}
			});

			// Should render all 5 filter buttons
			const filterButtons = screen.getAllByRole('button');
			expect(filterButtons.length).toBe(5);
		});

		it('should render multiple select checkbox', () => {
			render(QuickFilterButtons, {
				props: {
					isLoading: false,
					onQuickFilter: mockOnQuickFilter,
					activeFilters: [],
					isMultiSelect: false,
					onMultiSelectChange: mockOnMultiSelectChange
				}
			});

			// Should render the multiple select checkbox
			const checkbox = screen.getByRole('checkbox');
			expect(checkbox).toBeInTheDocument();
			expect(checkbox).not.toBeChecked();
		});

		it('should disable all buttons when loading', () => {
			render(QuickFilterButtons, {
				props: {
					isLoading: true,
					onQuickFilter: mockOnQuickFilter,
					activeFilters: [],
					isMultiSelect: false,
					onMultiSelectChange: mockOnMultiSelectChange
				}
			});

			// All buttons should be disabled
			const filterButtons = screen.getAllByRole('button');
			filterButtons.forEach((button) => {
				expect(button).toBeDisabled();
			});

			// Checkbox should also be disabled
			const checkbox = screen.getByRole('checkbox');
			expect(checkbox).toBeDisabled();
		});
	});

	describe('Button interactions', () => {
		it('should call onQuickFilter when filter button is clicked in single-select mode', async () => {
			render(QuickFilterButtons, {
				props: {
					isLoading: false,
					onQuickFilter: mockOnQuickFilter,
					activeFilters: [],
					isMultiSelect: false,
					onMultiSelectChange: mockOnMultiSelectChange
				}
			});

			const filterButtons = screen.getAllByRole('button');
			await fireEvent.click(filterButtons[0]); // Click first button

			expect(mockOnQuickFilter).toHaveBeenCalledWith('invasion');
		});

		it('should call onQuickFilter when filter button is clicked in multi-select mode', async () => {
			render(QuickFilterButtons, {
				props: {
					isLoading: false,
					onQuickFilter: mockOnQuickFilter,
					activeFilters: ['castling'],
					isMultiSelect: true,
					onMultiSelectChange: mockOnMultiSelectChange
				}
			});

			const filterButtons = screen.getAllByRole('button');
			await fireEvent.click(filterButtons[0]); // Click first button

			expect(mockOnQuickFilter).toHaveBeenCalledWith('invasion');
		});

		it('should highlight active filters', () => {
			render(QuickFilterButtons, {
				props: {
					isLoading: false,
					onQuickFilter: mockOnQuickFilter,
					activeFilters: ['invasion', 'castling'],
					isMultiSelect: true,
					onMultiSelectChange: mockOnMultiSelectChange
				}
			});

			const filterButtons = screen.getAllByRole('button');

			// First button (invasion) should be active
			expect(filterButtons[0]).toHaveClass('btn-primary');
			// Fourth button (castling) should be active
			expect(filterButtons[3]).toHaveClass('btn-primary');
			// Third button (dominance) should be inactive
			expect(filterButtons[2]).toHaveClass('btn-outline');
		});
	});

	describe('Multiple select checkbox', () => {
		it('should call onMultiSelectChange when checkbox is toggled', async () => {
			render(QuickFilterButtons, {
				props: {
					isLoading: false,
					onQuickFilter: mockOnQuickFilter,
					activeFilters: [],
					isMultiSelect: false,
					onMultiSelectChange: mockOnMultiSelectChange
				}
			});

			const checkbox = screen.getByRole('checkbox');
			await fireEvent.click(checkbox);

			expect(mockOnMultiSelectChange).toHaveBeenCalledWith(true);
		});

		it('should show checked state when isMultiSelect is true', () => {
			render(QuickFilterButtons, {
				props: {
					isLoading: false,
					onQuickFilter: mockOnQuickFilter,
					activeFilters: [],
					isMultiSelect: true,
					onMultiSelectChange: mockOnMultiSelectChange
				}
			});

			const checkbox = screen.getByRole('checkbox');
			expect(checkbox).toBeChecked();
		});
	});

	describe('Accessibility', () => {
		it('should have proper ARIA labels', () => {
			render(QuickFilterButtons, {
				props: {
					isLoading: false,
					onQuickFilter: mockOnQuickFilter,
					activeFilters: [],
					isMultiSelect: false,
					onMultiSelectChange: mockOnMultiSelectChange
				}
			});

			const checkbox = screen.getByRole('checkbox');
			expect(checkbox).toHaveAttribute('aria-label', 'Toggle multiple selection');
			expect(checkbox).toHaveAttribute('name', 'multiple-select');
		});

		it('should have proper button types', () => {
			render(QuickFilterButtons, {
				props: {
					isLoading: false,
					onQuickFilter: mockOnQuickFilter,
					activeFilters: [],
					isMultiSelect: false,
					onMultiSelectChange: mockOnMultiSelectChange
				}
			});

			const filterButtons = screen.getAllByRole('button');
			filterButtons.forEach((button) => {
				expect(button).toHaveAttribute('type', 'button');
			});
		});
	});

	describe('Component structure', () => {
		it('should have quick-filter-buttons container id', () => {
			render(QuickFilterButtons, {
				props: {
					isLoading: false,
					onQuickFilter: mockOnQuickFilter,
					activeFilters: [],
					isMultiSelect: false,
					onMultiSelectChange: mockOnMultiSelectChange
				}
			});

			const container = document.getElementById('quick-filter-buttons');
			expect(container).toBeInTheDocument();
		});

		it('should render buttons in flex layout', () => {
			render(QuickFilterButtons, {
				props: {
					isLoading: false,
					onQuickFilter: mockOnQuickFilter,
					activeFilters: [],
					isMultiSelect: false,
					onMultiSelectChange: mockOnMultiSelectChange
				}
			});

			const container = document.getElementById('quick-filter-buttons');
			expect(container).toHaveClass('flex', 'gap-2', 'flex-wrap');
		});
	});
});
