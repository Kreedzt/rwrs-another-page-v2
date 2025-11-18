<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount, onDestroy } from 'svelte';

	interface Props {
		searchInput?: HTMLInputElement | null;
		onSearch?: (query: string) => void;
		disabled?: boolean;
	}

	let { searchInput = null, onSearch = () => {}, disabled = false }: Props = $props();

	let isEnabled = true;
	let typingBuffer = '';
	let typingTimeout: number;

	// Check if we should handle the key event
	function shouldHandleKeyEvent(event: KeyboardEvent): boolean {
		// Don't handle if disabled
		if (disabled || !isEnabled) return false;

		// Only handle on desktop (not mobile)
		if (window.innerWidth < 768) return false;

		// Ignore if user is typing in an input, textarea, or contenteditable
		const target = event.target as HTMLElement;
		if (
			target.tagName === 'INPUT' ||
			target.tagName === 'TEXTAREA' ||
			target.contentEditable === 'true' ||
			target.closest('[role="textbox"]')
		) {
			return false;
		}

		// Only handle letter keys (a-z, A-Z), numbers, and common search characters
		const key = event.key;
		const isPrintableChar =
			(key.length === 1 && /[a-zA-Z0-9\s\-_]/.test(key)) || key === 'Backspace' || key === 'Delete';

		// Ignore modifier keys and special keys
		if (
			event.ctrlKey ||
			event.altKey ||
			event.metaKey ||
			event.key === 'Escape' ||
			event.key === 'Tab' ||
			event.key === 'Enter' ||
			!isPrintableChar
		) {
			return false;
		}

		return true;
	}

	// Handle keyboard input
	function handleKeyboardInput(event: KeyboardEvent) {
		if (!shouldHandleKeyEvent(event)) return;

		// Prevent default behavior
		event.preventDefault();
		event.stopPropagation();

		// Focus the search input
		if (searchInput) {
			searchInput.focus();
		}

		// Build the typing buffer
		if (event.key === 'Backspace' || event.key === 'Delete') {
			// Handle backspace/delete
			typingBuffer = typingBuffer.slice(0, -1);
		} else {
			// Add the character to the buffer
			typingBuffer += event.key;
		}

		// Clear existing timeout
		if (typingTimeout) {
			clearTimeout(typingTimeout);
		}

		// Set new timeout to trigger search after user stops typing
		typingTimeout = setTimeout(() => {
			if (typingBuffer.trim()) {
				onSearch(typingBuffer.trim());
			}
			typingBuffer = '';
		}, 300);

		// Update the search input value immediately
		if (searchInput) {
			// Dispatch input event to update the search input
			const inputEvent = new Event('input', { bubbles: true });
			searchInput.value = typingBuffer;
			searchInput.dispatchEvent(inputEvent);
		}
	}

	// Handle escape key to clear search
	function handleEscapeKey(event: KeyboardEvent) {
		if (event.key === 'Escape' && searchInput && document.activeElement === searchInput) {
			searchInput.value = '';
			searchInput.blur();
			typingBuffer = '';
			onSearch('');

			// Dispatch input event to clear search
			const inputEvent = new Event('input', { bubbles: true });
			searchInput.dispatchEvent(inputEvent);
		}
	}

	// Handle Ctrl/Cmd + K to focus search
	function handleShortcutKey(event: KeyboardEvent) {
		if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
			event.preventDefault();
			if (searchInput) {
				searchInput.focus();
			}
		}
	}

	onMount(() => {
		if (!browser) return;

		// Add event listeners
		document.addEventListener('keydown', handleKeyboardInput, true);
		document.addEventListener('keydown', handleEscapeKey, true);
		document.addEventListener('keydown', handleShortcutKey, true);

		// Disable when search input loses focus for a while
		const handleFocusOut = () => {
			setTimeout(() => {
				if (
					document.activeElement !== searchInput &&
					!searchInput?.contains(document.activeElement)
				) {
					typingBuffer = '';
					if (typingTimeout) {
						clearTimeout(typingTimeout);
					}
				}
			}, 200);
		};

		if (searchInput) {
			searchInput.addEventListener('blur', handleFocusOut);
		}
	});

	onDestroy(() => {
		if (!browser) return;

		// Clean up event listeners
		document.removeEventListener('keydown', handleKeyboardInput, true);
		document.removeEventListener('keydown', handleEscapeKey, true);
		document.removeEventListener('keydown', handleShortcutKey, true);

		// Clear timeout
		if (typingTimeout) {
			clearTimeout(typingTimeout);
		}
	});

	// Expose methods to parent components
	export const disable = () => {
		isEnabled = false;
	};
	export const enable = () => {
		isEnabled = true;
	};
	export const focus = () => {
		if (searchInput) searchInput.focus();
	};
</script>
