import { userSettingsService } from '$lib/services/user-settings';

// Global layout mode state
let layoutMode = $state<'fullPage' | 'tableOnly'>(
	userSettingsService.getSettings().layoutMode || 'fullPage'
);

// Return the state value - establishes reactive dependency
export function getLayoutMode() {
	return layoutMode;
}

// Set the layout mode value
export function setLayoutMode(value: 'fullPage' | 'tableOnly') {
	layoutMode = value;
	userSettingsService.set('layoutMode', value);
}

// Sync from localStorage (for cross-tab sync)
export function syncLayoutMode() {
	const settings = userSettingsService.getSettings();
	if (settings.layoutMode && settings.layoutMode !== layoutMode) {
		layoutMode = settings.layoutMode;
	}
}
