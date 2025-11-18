import { browser } from '$app/environment';
import { writable } from 'svelte/store';

type Theme = 'light' | 'dark' | 'system';

// Get stored theme or default to system
function getInitialTheme(): Theme {
	if (!browser) return 'system';

	const stored = localStorage.getItem('theme') as Theme | null;
	if (stored && ['light', 'dark', 'system'].includes(stored)) {
		return stored;
	}

	return 'system';
}

// Create theme store
export const theme = writable<Theme>(getInitialTheme());

// Get system preference
function getSystemTheme(): 'light' | 'dark' {
	if (!browser) return 'light';

	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Apply theme to document using DaisyUI's data-theme attribute
function applyTheme(themeValue: Theme): void {
	if (!browser) return;

	const root = document.documentElement;

	// Determine actual theme to apply
	let actualTheme: 'light' | 'dark';
	if (themeValue === 'system') {
		actualTheme = getSystemTheme();
	} else {
		actualTheme = themeValue;
	}

	// Apply DaisyUI theme
	root.setAttribute('data-theme', actualTheme);

	// Store preference
	if (themeValue !== 'system') {
		localStorage.setItem('theme', themeValue);
	} else {
		localStorage.removeItem('theme');
	}

	// Also set our custom theme attribute for CSS custom properties
	if (actualTheme === 'dark') {
		root.setAttribute('data-custom-theme', 'dark');
	} else {
		root.removeAttribute('data-custom-theme');
	}
}

// Subscribe to theme changes and apply them
if (browser) {
	// Apply initial theme
	applyTheme(getInitialTheme());

	// Listen for system theme changes
	const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
	mediaQuery.addEventListener('change', () => {
		theme.subscribe((currentTheme) => {
			if (currentTheme === 'system') {
				applyTheme('system');
			}
		})();
	});

	// Subscribe to theme store changes
	theme.subscribe(applyTheme);
}

// Helper function to get current theme (resolved)
export function getCurrentTheme(): 'light' | 'dark' {
	if (!browser) return 'light';

	let current: Theme;
	const unsubscribe = theme.subscribe((value) => (current = value));
	unsubscribe();

	if (current === 'system') {
		return getSystemTheme();
	}
	return current;
}
