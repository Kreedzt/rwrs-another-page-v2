import { render, fireEvent } from '@testing-library/svelte/svelte5';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ViewModeToggle from '$lib/components/ViewModeToggle.svelte';

// Mock TranslatedText component
vi.mock('$lib/components/TranslatedText.svelte', () => ({
	default: (props: { key: string; fallback?: string }) => {
		const keyToText: Record<string, string> = {
			'app.viewMode.players': 'Players',
			'app.viewMode.servers': 'Servers'
		};
		return props.fallback || keyToText[props.key] || props.key;
	}
}));

describe('ViewModeToggle Component', () => {
	let mockOnViewChange: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		mockOnViewChange = vi.fn();
		vi.clearAllMocks();
	});

	describe('Rendering', () => {
		it('should render button when in servers view', async () => {
			const { container } = render(ViewModeToggle, {
				props: {
					currentView: 'servers',
					onViewChange: mockOnViewChange as any
				}
			});

			const button = container.querySelector('button');
			expect(button).toBeInTheDocument();
			expect(button).toHaveClass('btn', 'btn-neutral', 'btn-outline');
		});

		it('should render button when in players view', async () => {
			const { container } = render(ViewModeToggle, {
				props: {
					currentView: 'players',
					onViewChange: mockOnViewChange as any
				}
			});

			const button = container.querySelector('button');
			expect(button).toBeInTheDocument();
			expect(button).toHaveClass('btn', 'btn-neutral', 'btn-outline');
		});

		it('should have correct CSS classes', async () => {
			const { container } = render(ViewModeToggle, {
				props: {
					currentView: 'servers',
					onViewChange: mockOnViewChange as any
				}
			});

			const button = container.querySelector('button');
			expect(button).toHaveClass('btn', 'btn-neutral', 'btn-outline');
		});

		it('should be type button', async () => {
			const { container } = render(ViewModeToggle, {
				props: {
					currentView: 'servers',
					onViewChange: mockOnViewChange as any
				}
			});

			const button = container.querySelector('button');
			expect(button?.getAttribute('type')).toBe('button');
		});
	});

	describe('User Interactions', () => {
		it('should call onViewChange with players when clicked in servers view', async () => {
			const { container } = render(ViewModeToggle, {
				props: {
					currentView: 'servers',
					onViewChange: mockOnViewChange as any
				}
			});

			const button = container.querySelector('button') as HTMLElement;
			await fireEvent.click(button);

			expect(mockOnViewChange).toHaveBeenCalledTimes(1);
			expect(mockOnViewChange).toHaveBeenCalledWith('players');
		});

		it('should call onViewChange with servers when clicked in players view', async () => {
			const { container } = render(ViewModeToggle, {
				props: {
					currentView: 'players',
					onViewChange: mockOnViewChange as any
				}
			});

			const button = container.querySelector('button') as HTMLElement;
			await fireEvent.click(button);

			expect(mockOnViewChange).toHaveBeenCalledTimes(1);
			expect(mockOnViewChange).toHaveBeenCalledWith('servers');
		});

		it('should toggle back and forth correctly', async () => {
			const { container: container1 } = render(ViewModeToggle, {
				props: {
					currentView: 'servers',
					onViewChange: mockOnViewChange as any
				}
			});

			const button1 = container1.querySelector('button') as HTMLElement;
			await fireEvent.click(button1);

			expect(mockOnViewChange).toHaveBeenCalledWith('players');

			// Create new instance with updated state
			const { container: container2 } = render(ViewModeToggle, {
				props: {
					currentView: 'players',
					onViewChange: mockOnViewChange as any
				}
			});

			const button2 = container2.querySelector('button') as HTMLElement;
			await fireEvent.click(button2);

			expect(mockOnViewChange).toHaveBeenCalledWith('servers');
		});

		it('should handle multiple rapid clicks', async () => {
			const { container } = render(ViewModeToggle, {
				props: {
					currentView: 'servers',
					onViewChange: mockOnViewChange as any
				}
			});

			const button = container.querySelector('button') as HTMLElement;
			await fireEvent.click(button);
			await fireEvent.click(button);
			await fireEvent.click(button);

			// Each click should trigger callback (state management is parent's responsibility)
			expect(mockOnViewChange).toHaveBeenCalledTimes(3);
			expect(mockOnViewChange).toHaveBeenNthCalledWith(1, 'players');
			expect(mockOnViewChange).toHaveBeenNthCalledWith(2, 'players');
			expect(mockOnViewChange).toHaveBeenNthCalledWith(3, 'players');
		});
	});

	describe('Conditional Content', () => {
		it('should render TranslatedText component in servers view', async () => {
			const { container } = render(ViewModeToggle, {
				props: {
					currentView: 'servers',
					onViewChange: mockOnViewChange as any
				}
			});

			// Button should be rendered (content depends on TranslatedText mock)
			const button = container.querySelector('button');
			expect(button).toBeInTheDocument();
		});

		it('should render TranslatedText component in players view', async () => {
			const { container } = render(ViewModeToggle, {
				props: {
					currentView: 'players',
					onViewChange: mockOnViewChange as any
				}
			});

			// Button should be rendered (content depends on TranslatedText mock)
			const button = container.querySelector('button');
			expect(button).toBeInTheDocument();
		});
	});

	describe('Edge Cases', () => {
		it('should render without errors when onViewChange is provided', async () => {
			const { container } = render(ViewModeToggle, {
				props: {
					currentView: 'servers',
					onViewChange: mockOnViewChange as any
				}
			});

			const button = container.querySelector('button');
			expect(button).toBeInTheDocument();
		});
	});

	describe('Accessibility', () => {
		it('should be clickable button element', async () => {
			const { container } = render(ViewModeToggle, {
				props: {
					currentView: 'servers',
					onViewChange: mockOnViewChange as any
				}
			});

			const button = container.querySelector('button');
			expect(button).toBeInTheDocument();
			expect(button?.tagName).toBe('BUTTON');
		});

		it('should have button styling classes', async () => {
			const { container } = render(ViewModeToggle, {
				props: {
					currentView: 'servers',
					onViewChange: mockOnViewChange as any
				}
			});

			const button = container.querySelector('button');
			expect(button).toHaveClass('btn', 'btn-neutral', 'btn-outline');
		});
	});
});
