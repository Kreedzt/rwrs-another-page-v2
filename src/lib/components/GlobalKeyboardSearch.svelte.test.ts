import { render, screen, fireEvent } from '@testing-library/svelte/svelte5';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import GlobalKeyboardSearch from './GlobalKeyboardSearch.svelte';

// Mock the browser environment
Object.defineProperty(window, 'innerWidth', {
	writable: true,
	configurable: true,
	value: 1024
});

describe('GlobalKeyboardSearch', () => {
	let mockSearchInput: HTMLInputElement;
	let mockOnSearch: ReturnType<typeof vi.fn>;
	let component: any;

	beforeEach(() => {
		// Create a mock search input element
		mockSearchInput = document.createElement('input');
		mockSearchInput.type = 'search';
		mockSearchInput.value = '';
		mockOnSearch = vi.fn();

		// Mock window.innerWidth to be desktop size
		Object.defineProperty(window, 'innerWidth', {
			writable: true,
			configurable: true,
			value: 1024
		});

		// Clear document body
		document.body.innerHTML = '';
		document.body.appendChild(mockSearchInput);
	});

	afterEach(() => {
		// Clean up event listeners and DOM
		document.body.innerHTML = '';
		vi.clearAllMocks();
	});

	describe('Component rendering and basic functionality', () => {
		it('should render without crashing', () => {
			render(GlobalKeyboardSearch, {
				props: {
					searchInput: mockSearchInput,
					onSearch: mockOnSearch
				}
			});

			// Component should render without any visible elements (it's just event listeners)
			expect(document.body).toBeInTheDocument();
		});

		it('should expose methods correctly', () => {
			const { component } = render(GlobalKeyboardSearch, {
				props: {
					searchInput: mockSearchInput,
					onSearch: mockOnSearch
				}
			});

			expect(typeof component.disable).toBe('function');
			expect(typeof component.enable).toBe('function');
			expect(typeof component.focus).toBe('function');
		});
	});

	describe('Keyboard input handling', () => {
		it('should focus search input when typing letter keys', async () => {
			render(GlobalKeyboardSearch, {
				props: {
					searchInput: mockSearchInput,
					onSearch: mockOnSearch
				}
			});

			// Simulate typing a letter
			await fireEvent.keyDown(document.body, { key: 'a' });

			expect(document.activeElement).toBe(mockSearchInput);
		});

		it('should handle multiple letter keys and build search query', async () => {
			render(GlobalKeyboardSearch, {
				props: {
					searchInput: mockSearchInput,
					onSearch: mockOnSearch
				}
			});

			// Simulate typing "test"
			await fireEvent.keyDown(document.body, { key: 't' });
			await fireEvent.keyDown(document.body, { key: 'e' });
			await fireEvent.keyDown(document.body, { key: 's' });
			await fireEvent.keyDown(document.body, { key: 't' });

			// Wait for debounced search (300ms + small buffer)
			await new Promise((resolve) => setTimeout(resolve, 350));

			expect(mockOnSearch).toHaveBeenCalledWith('test');
		});

		it('should handle number keys', async () => {
			render(GlobalKeyboardSearch, {
				props: {
					searchInput: mockSearchInput,
					onSearch: mockOnSearch
				}
			});

			await fireEvent.keyDown(document.body, { key: '1' });
			await fireEvent.keyDown(document.body, { key: '2' });

			// Wait for debounced search
			await new Promise((resolve) => setTimeout(resolve, 350));

			expect(mockOnSearch).toHaveBeenCalledWith('12');
		});

		it('should handle backspace key to delete characters', async () => {
			render(GlobalKeyboardSearch, {
				props: {
					searchInput: mockSearchInput,
					onSearch: mockOnSearch
				}
			});

			// Type "test"
			await fireEvent.keyDown(document.body, { key: 't' });
			await fireEvent.keyDown(document.body, { key: 'e' });
			await fireEvent.keyDown(document.body, { key: 's' });
			await fireEvent.keyDown(document.body, { key: 't' });

			// Press backspace
			await fireEvent.keyDown(document.body, { key: 'Backspace' });

			// Wait for debounced search
			await new Promise((resolve) => setTimeout(resolve, 350));

			expect(mockOnSearch).toHaveBeenCalledWith('tes');
		});

		it('should handle delete key to delete characters', async () => {
			render(GlobalKeyboardSearch, {
				props: {
					searchInput: mockSearchInput,
					onSearch: mockOnSearch
				}
			});

			// Type "test"
			await fireEvent.keyDown(document.body, { key: 't' });
			await fireEvent.keyDown(document.body, { key: 'e' });
			await fireEvent.keyDown(document.body, { key: 's' });
			await fireEvent.keyDown(document.body, { key: 't' });

			// Press delete
			await fireEvent.keyDown(document.body, { key: 'Delete' });

			// Wait for debounced search
			await new Promise((resolve) => setTimeout(resolve, 350));

			expect(mockOnSearch).toHaveBeenCalledWith('tes');
		});
	});

	describe('Keyboard shortcuts', () => {
		it('should focus search input on Ctrl+K', async () => {
			render(GlobalKeyboardSearch, {
				props: {
					searchInput: mockSearchInput,
					onSearch: mockOnSearch
				}
			});

			await fireEvent.keyDown(document.body, { key: 'k', ctrlKey: true });

			expect(document.activeElement).toBe(mockSearchInput);
		});

		it('should focus search input on Cmd+K (Mac)', async () => {
			render(GlobalKeyboardSearch, {
				props: {
					searchInput: mockSearchInput,
					onSearch: mockOnSearch
				}
			});

			await fireEvent.keyDown(document.body, { key: 'k', metaKey: true });

			expect(document.activeElement).toBe(mockSearchInput);
		});

		it('should clear search on Escape when search input is focused', async () => {
			render(GlobalKeyboardSearch, {
				props: {
					searchInput: mockSearchInput,
					onSearch: mockOnSearch
				}
			});

			// First focus the search input and set a value
			mockSearchInput.focus();
			mockSearchInput.value = 'test';
			mockSearchInput.dispatchEvent(new Event('input', { bubbles: true }));

			// Press Escape
			await fireEvent.keyDown(mockSearchInput, { key: 'Escape' });

			expect(mockSearchInput.value).toBe('');
			expect(document.activeElement).not.toBe(mockSearchInput);
		});
	});

	describe('Edge cases and restrictions', () => {
		it('should not handle events when disabled', async () => {
			render(GlobalKeyboardSearch, {
				props: {
					searchInput: mockSearchInput,
					onSearch: mockOnSearch,
					disabled: true
				}
			});

			await fireEvent.keyDown(document.body, { key: 'a' });

			expect(document.activeElement).not.toBe(mockSearchInput);
			expect(mockOnSearch).not.toHaveBeenCalled();
		});

		it('should not handle events on mobile screens', async () => {
			// Mock mobile screen width
			Object.defineProperty(window, 'innerWidth', {
				writable: true,
				configurable: true,
				value: 500
			});

			render(GlobalKeyboardSearch, {
				props: {
					searchInput: mockSearchInput,
					onSearch: mockOnSearch
				}
			});

			await fireEvent.keyDown(document.body, { key: 'a' });

			expect(document.activeElement).not.toBe(mockSearchInput);
		});

		it('should not handle events when typing in input elements', async () => {
			const otherInput = document.createElement('input');
			document.body.appendChild(otherInput);
			otherInput.focus();

			render(GlobalKeyboardSearch, {
				props: {
					searchInput: mockSearchInput,
					onSearch: mockOnSearch
				}
			});

			await fireEvent.keyDown(otherInput, { key: 'a' });

			expect(document.activeElement).toBe(otherInput);
			expect(mockOnSearch).not.toHaveBeenCalled();

			// Clean up
			otherInput.remove();
		});

		it('should not handle events when typing in textarea', async () => {
			const textarea = document.createElement('textarea');
			document.body.appendChild(textarea);
			textarea.focus();

			render(GlobalKeyboardSearch, {
				props: {
					searchInput: mockSearchInput,
					onSearch: mockOnSearch
				}
			});

			await fireEvent.keyDown(textarea, { key: 'a' });

			expect(document.activeElement).toBe(textarea);
			expect(mockOnSearch).not.toHaveBeenCalled();

			// Clean up
			textarea.remove();
		});

		it('should not handle modifier keys', async () => {
			render(GlobalKeyboardSearch, {
				props: {
					searchInput: mockSearchInput,
					onSearch: mockOnSearch
				}
			});

			// Test various modifier keys
			await fireEvent.keyDown(document.body, { key: 'Control', ctrlKey: true });
			await fireEvent.keyDown(document.body, { key: 'Alt', altKey: true });
			await fireEvent.keyDown(document.body, { key: 'Meta', metaKey: true });
			await fireEvent.keyDown(document.body, { key: 'Shift', shiftKey: true });

			expect(document.activeElement).not.toBe(mockSearchInput);
		});

		it('should not handle special keys', async () => {
			render(GlobalKeyboardSearch, {
				props: {
					searchInput: mockSearchInput,
					onSearch: mockOnSearch
				}
			});

			const specialKeys = ['Tab', 'Enter', 'ArrowUp', 'ArrowDown', 'F1', 'Escape'];

			for (const key of specialKeys) {
				await fireEvent.keyDown(document.body, { key });
			}

			expect(document.activeElement).not.toBe(mockSearchInput);
		});

		it('should not trigger search immediately (debounce)', async () => {
			render(GlobalKeyboardSearch, {
				props: {
					searchInput: mockSearchInput,
					onSearch: mockOnSearch
				}
			});

			await fireEvent.keyDown(document.body, { key: 't' });

			// Should not trigger immediately
			expect(mockOnSearch).not.toHaveBeenCalled();

			// Should trigger after debounce timeout
			await new Promise((resolve) => setTimeout(resolve, 350));
			expect(mockOnSearch).toHaveBeenCalledWith('t');
		});
	});

	describe('Component methods', () => {
		it('should disable and enable functionality', () => {
			const { component } = render(GlobalKeyboardSearch, {
				props: {
					searchInput: mockSearchInput,
					onSearch: mockOnSearch
				}
			});

			// Test disable
			component.disable();
			// Note: We can't easily test the internal state, but we can verify no events are handled
			fireEvent.keyDown(document.body, { key: 'a' });
			expect(document.activeElement).not.toBe(mockSearchInput);

			// Test enable
			component.enable();
			fireEvent.keyDown(document.body, { key: 'b' });
			expect(document.activeElement).toBe(mockSearchInput);
		});

		it('should focus search input when focus method is called', () => {
			const { component } = render(GlobalKeyboardSearch, {
				props: {
					searchInput: mockSearchInput,
					onSearch: mockOnSearch
				}
			});

			component.focus();
			expect(document.activeElement).toBe(mockSearchInput);
		});
	});

	describe('Input value synchronization', () => {
		it('should update search input value in real-time', async () => {
			render(GlobalKeyboardSearch, {
				props: {
					searchInput: mockSearchInput,
					onSearch: mockOnSearch
				}
			});

			await fireEvent.keyDown(document.body, { key: 'h' });
			expect(mockSearchInput.value).toBe('h');

			await fireEvent.keyDown(document.body, { key: 'e' });
			expect(mockSearchInput.value).toBe('he');

			await fireEvent.keyDown(document.body, { key: 'l' });
			expect(mockSearchInput.value).toBe('hel');

			await fireEvent.keyDown(document.body, { key: 'l' });
			expect(mockSearchInput.value).toBe('hell');

			await fireEvent.keyDown(document.body, { key: 'o' });
			expect(mockSearchInput.value).toBe('hello');
		});
	});

	describe('Error handling', () => {
		it('should handle missing search input gracefully', async () => {
			// Should not throw error when searchInput is null
			expect(() => {
				render(GlobalKeyboardSearch, {
					props: {
						searchInput: null,
						onSearch: mockOnSearch
					}
				});
			}).not.toThrow();

			// Should not trigger search when typing
			await fireEvent.keyDown(document.body, { key: 'a' });
			expect(mockOnSearch).not.toHaveBeenCalled();
		});

		it('should handle missing onSearch callback gracefully', async () => {
			expect(() => {
				render(GlobalKeyboardSearch, {
					props: {
						searchInput: mockSearchInput,
						onSearch: undefined
					}
				});
			}).not.toThrow();

			await fireEvent.keyDown(document.body, { key: 'a' });
			// Should not throw error, just focus the input
			expect(document.activeElement).toBe(mockSearchInput);
		});
	});
});
