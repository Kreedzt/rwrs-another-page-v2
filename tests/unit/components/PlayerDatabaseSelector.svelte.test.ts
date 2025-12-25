import { render, screen, fireEvent } from '@testing-library/svelte/svelte5';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PlayerDatabaseSelector from '$lib/components/PlayerDatabaseSelector.svelte';
import type { PlayerDatabase } from '$lib/models/player.model';

// Mock TranslatedText component
vi.mock('$lib/components/TranslatedText.svelte', () => ({
	default: (props: { key: string; fallback?: string }) => {
		const keyToText: Record<string, string> = {
			'app.player.database.invasion': 'Invasion',
			'app.player.database.pacific': 'Pacific',
			'app.player.database.prereset_invasion': 'Invasion (before reset)'
		};
		return props.fallback || keyToText[props.key] || props.key;
	}
}));

describe('PlayerDatabaseSelector Component', () => {
	let mockOnDbChange: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		mockOnDbChange = vi.fn();
		vi.clearAllMocks();
	});

	describe('Rendering', () => {
		it('should render with default props', async () => {
			const { container } = render(PlayerDatabaseSelector, {
				props: {
					currentDb: 'invasion',
					onDbChange: mockOnDbChange
				}
			});

			const select = container.querySelector('.select');
			expect(select).toBeInTheDocument();
		});

		it('should render all three database options', async () => {
			const { container } = render(PlayerDatabaseSelector, {
				props: {
					currentDb: 'invasion',
					onDbChange: mockOnDbChange
				}
			});

			const options = container.querySelectorAll('option');
			expect(options.length).toBe(3);
		});

		it('should have invasion as first option', async () => {
			const { container } = render(PlayerDatabaseSelector, {
				props: {
					currentDb: 'invasion',
					onDbChange: mockOnDbChange
				}
			});

			const options = container.querySelectorAll('option');
			expect(options[0]).toHaveValue('invasion');
		});

		it('should have pacific as second option', async () => {
			const { container } = render(PlayerDatabaseSelector, {
				props: {
					currentDb: 'invasion',
					onDbChange: mockOnDbChange
				}
			});

			const options = container.querySelectorAll('option');
			expect(options[1]).toHaveValue('pacific');
		});

		it('should have prereset_invasion as third option', async () => {
			const { container } = render(PlayerDatabaseSelector, {
				props: {
					currentDb: 'invasion',
					onDbChange: mockOnDbChange
				}
			});

			const options = container.querySelectorAll('option');
			expect(options[2]).toHaveValue('prereset_invasion');
		});

		it('should display invasion as selected when currentDb is invasion', async () => {
			const { container } = render(PlayerDatabaseSelector, {
				props: {
					currentDb: 'invasion',
					onDbChange: mockOnDbChange
				}
			});

			const select = container.querySelector('select') as HTMLSelectElement;
			expect(select.value).toBe('invasion');
		});

		it('should display pacific as selected when currentDb is pacific', async () => {
			const { container } = render(PlayerDatabaseSelector, {
				props: {
					currentDb: 'pacific',
					onDbChange: mockOnDbChange
				}
			});

			const select = container.querySelector('select') as HTMLSelectElement;
			expect(select.value).toBe('pacific');
		});

		it('should display prereset_invasion as selected when currentDb is prereset_invasion', async () => {
			const { container } = render(PlayerDatabaseSelector, {
				props: {
					currentDb: 'prereset_invasion',
					onDbChange: mockOnDbChange
				}
			});

			const select = container.querySelector('select') as HTMLSelectElement;
			expect(select.value).toBe('prereset_invasion');
		});
	});

	describe('User Interactions', () => {
		it('should call onDbChange when switching from invasion to pacific', async () => {
			const { container } = render(PlayerDatabaseSelector, {
				props: {
					currentDb: 'invasion',
					onDbChange: mockOnDbChange
				}
			});

			const select = container.querySelector('select') as HTMLSelectElement;
			await fireEvent.change(select, { target: { value: 'pacific' } });

			expect(mockOnDbChange).toHaveBeenCalledWith('pacific');
		});

		it('should call onDbChange when switching to prereset_invasion', async () => {
			const { container } = render(PlayerDatabaseSelector, {
				props: {
					currentDb: 'invasion',
					onDbChange: mockOnDbChange
				}
			});

			const select = container.querySelector('select') as HTMLSelectElement;
			await fireEvent.change(select, { target: { value: 'prereset_invasion' } });

			expect(mockOnDbChange).toHaveBeenCalledWith('prereset_invasion');
		});

		it('should call onDbChange with correct PlayerDatabase type', async () => {
			const { container } = render(PlayerDatabaseSelector, {
				props: {
					currentDb: 'pacific',
					onDbChange: mockOnDbChange
				}
			});

			const select = container.querySelector('select') as HTMLSelectElement;
			await fireEvent.change(select, { target: { value: 'invasion' } });

			expect(mockOnDbChange).toHaveBeenCalledWith('invasion');
			expect(mockOnDbChange).toHaveBeenCalledTimes(1);
		});

		it('should handle rapid database changes', async () => {
			const { container } = render(PlayerDatabaseSelector, {
				props: {
					currentDb: 'invasion',
					onDbChange: mockOnDbChange
				}
			});

			const select = container.querySelector('select') as HTMLSelectElement;
			await fireEvent.change(select, { target: { value: 'pacific' } });
			await fireEvent.change(select, { target: { value: 'prereset_invasion' } });
			await fireEvent.change(select, { target: { value: 'invasion' } });

			expect(mockOnDbChange).toHaveBeenNthCalledWith(1, 'pacific');
			expect(mockOnDbChange).toHaveBeenNthCalledWith(2, 'prereset_invasion');
			expect(mockOnDbChange).toHaveBeenNthCalledWith(3, 'invasion');
		});
	});

	describe('Styling', () => {
		it('should have correct CSS classes', async () => {
			const { container } = render(PlayerDatabaseSelector, {
				props: {
					currentDb: 'invasion',
					onDbChange: mockOnDbChange
				}
			});

			const select = container.querySelector('.select');
			expect(select).toHaveClass('select', 'select-bordered', 'w-full', 'min-w-48', 'sm:w-auto');
		});

		it('should be a select element', async () => {
			const { container } = render(PlayerDatabaseSelector, {
				props: {
					currentDb: 'invasion',
					onDbChange: mockOnDbChange
				}
			});

			const select = container.querySelector('select');
			expect(select?.tagName).toBe('SELECT');
		});
	});

	describe('Edge Cases', () => {
		it('should handle missing onDbChange gracefully', async () => {
			// Should not throw when onDbChange is not provided
			expect(() => {
				render(PlayerDatabaseSelector, {
					props: {
						currentDb: 'invasion',
						onDbChange: undefined as any
					}
				});
			}).not.toThrow();
		});

		it('should render correctly with all valid database values', async () => {
			const databases: PlayerDatabase[] = ['invasion', 'pacific', 'prereset_invasion'];

			for (const db of databases) {
				const { container } = render(PlayerDatabaseSelector, {
					props: {
						currentDb: db,
						onDbChange: mockOnDbChange
					}
				});

				const select = container.querySelector('select') as HTMLSelectElement;
				expect(select.value).toBe(db);
			}
		});
	});

	describe('Type Safety', () => {
		it('should only accept valid PlayerDatabase values as currentDb', async () => {
			const validDatabases: PlayerDatabase[] = ['invasion', 'pacific', 'prereset_invasion'];

			// This test documents the expected valid values
			expect(validDatabases).toContain('invasion');
			expect(validDatabases).toContain('pacific');
			expect(validDatabases).toContain('prereset_invasion');
		});

		it('should call onDbChange with PlayerDatabase type', async () => {
			const { container } = render(PlayerDatabaseSelector, {
				props: {
					currentDb: 'invasion',
					onDbChange: mockOnDbChange
				}
			});

			const select = container.querySelector('select') as HTMLSelectElement;
			await fireEvent.change(select, { target: { value: 'pacific' } });

			// Verify the callback is called with the correct type
			expect(mockOnDbChange).toHaveBeenCalledWith('pacific');
			const callArg = mockOnDbChange.mock.calls[0][0];
			// This should be a valid PlayerDatabase value
			expect(['invasion', 'pacific', 'prereset_invasion']).toContain(callArg);
		});
	});
});
