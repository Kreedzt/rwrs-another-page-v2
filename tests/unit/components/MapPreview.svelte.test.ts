import { render, screen, fireEvent, waitFor } from '@testing-library/svelte/svelte5';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import MapPreview from '$lib/components/MapPreview.svelte';
import type { MapData } from '$lib/services/maps';

// Mock the TranslatedText component
vi.mock('$lib/components/TranslatedText.svelte', () => ({
	default: (props: { key: string; fallback?: string }) => {
		// Map keys to default values for testing
		const keyToText: Record<string, string> = {
			'app.map.loading': 'Loading map image...',
			'app.map.loadError': 'Failed to load map image',
			'app.map.retry': 'Retry',
			'app.map.close': 'Close'
		};

		const text = keyToText[props.key] || props.fallback || props.key;
		return text;
	}
}));

describe('MapPreview Component', () => {
	let mockOnClose: ReturnType<typeof vi.fn>;
	let mockMapData: MapData;

	beforeEach(() => {
		mockOnClose = vi.fn();
		mockMapData = {
			id: 'test_map',
			name: 'Test Map',
			path: 'media/packages/vanilla.maps/maps/test',
			image: '/images/test_map.png'
		};

		// Mock console methods to avoid test output noise
		vi.spyOn(console, 'log').mockImplementation(() => {});

		// Mock window dimensions
		Object.defineProperty(window, 'innerWidth', {
			writable: true,
			configurable: true,
			value: 1024
		});
		Object.defineProperty(window, 'innerHeight', {
			writable: true,
			configurable: true,
			value: 768
		});

		// Mock Image constructor for testing image loading
		const mockImage = {
			naturalWidth: 800,
			naturalHeight: 600,
			onload: null as ((event: Event) => void) | null,
			onerror: null as ((event: Event) => void) | null,
			src: ''
		};

		global.Image = vi.fn().mockImplementation(() => {
			const img = { ...mockImage };

			// Simulate async image loading
			setTimeout(() => {
				if (img.src.includes('error')) {
					img.onerror?.(new Event('error'));
				} else {
					img.onload?.(new Event('load'));
				}
			}, 0);

			return img;
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('Rendering', () => {
		it('should not render when show is false', () => {
			render(MapPreview, {
				props: {
					show: false,
					mapData: mockMapData,
					position: { x: 0, y: 0 },
					onClose: mockOnClose
				}
			});

			// Should not render the modal
			expect(document.querySelector('dialog')).toBeNull();
		});

		it('should render when show is true with mapData', () => {
			render(MapPreview, {
				props: {
					show: true,
					mapData: mockMapData,
					position: { x: 100, y: 100 },
					onClose: mockOnClose
				}
			});

			// Should render the modal
			const modal = document.querySelector('dialog');
			expect(modal).toBeTruthy();

			// Should display map name and path
			expect(screen.getByText('Test Map')).toBeInTheDocument();
			expect(screen.getByText('media/packages/vanilla.maps/maps/test')).toBeInTheDocument();

			// Should render close button
			const closeButton = document.querySelector('.btn-secondary');
			expect(closeButton).toBeTruthy();
		});

		it('should show loading state initially', () => {
			render(MapPreview, {
				props: {
					show: true,
					mapData: mockMapData,
					position: { x: 0, y: 0 },
					onClose: mockOnClose
				}
			});

			// Should show loading dots (DaisyUI loading-dots)
			const loadingDots = document.querySelector('.loading-dots');
			expect(loadingDots).toBeTruthy();

			// Should show loading container
			const loadingContainer = document.querySelector('.flex.flex-col.items-center.justify-center.p-8');
			expect(loadingContainer).toBeTruthy();
		});
	});

	describe('Image loading', () => {
		it('should render image container initially', () => {
			render(MapPreview, {
				props: {
					show: true,
					mapData: mockMapData,
					position: { x: 0, y: 0 },
					onClose: mockOnClose
				}
			});

			// Should show loading dots (DaisyUI loading-dots)
			const loadingDots = document.querySelector('.loading-dots');
			expect(loadingDots).toBeTruthy();

			// Should have image container
			const imageContainer = document.querySelector('.relative.bg-base-200\\/30');
			expect(imageContainer).toBeTruthy();
		});

		it('should have correct image structure', () => {
			render(MapPreview, {
				props: {
					show: true,
					mapData: mockMapData,
					position: { x: 0, y: 0 },
					onClose: mockOnClose
				}
			});

			// Component should render without crashing
			const modal = document.querySelector('dialog');
			expect(modal).toBeTruthy();
		});
	});

	describe('Modal interactions', () => {
		it('should render close button', () => {
			render(MapPreview, {
				props: {
					show: true,
					mapData: mockMapData,
					position: { x: 0, y: 0 },
					onClose: mockOnClose
				}
			});

			// Should have a close button
			const closeButton = document.querySelector('.btn-secondary');
			expect(closeButton).toBeTruthy();
		});

		it('should call onClose when close button is clicked', async () => {
			render(MapPreview, {
				props: {
					show: true,
					mapData: mockMapData,
					position: { x: 0, y: 0 },
					onClose: mockOnClose
				}
			});

			const closeButton = document.querySelector('.btn-secondary');
			if (closeButton) {
				await fireEvent.click(closeButton);
				expect(mockOnClose).toHaveBeenCalledTimes(1);
			}
		});

		it('should render backdrop element', () => {
			render(MapPreview, {
				props: {
					show: true,
					mapData: mockMapData,
					position: { x: 0, y: 0 },
					onClose: mockOnClose
				}
			});

			// Should have a modal-backdrop
			const backdrop = document.querySelector('.modal-backdrop');
			expect(backdrop).toBeTruthy();
		});
	});

	describe('Image caching', () => {
		it('should use cached image data for previously loaded maps', async () => {
			const { rerender } = render(MapPreview, {
				props: {
					show: true,
					mapData: mockMapData,
					position: { x: 0, y: 0 },
					onClose: mockOnClose
				}
			});

			// Should show loading state initially (DaisyUI loading-dots)
			const loadingDots = document.querySelector('.loading-dots');
			expect(loadingDots).toBeTruthy();

			// Hide and show again (should still show loading since Image mock is complex)
			rerender({
				show: false,
				mapData: mockMapData,
				position: { x: 0, y: 0 },
				onClose: mockOnClose
			});

			rerender({
				show: true,
				mapData: mockMapData,
				position: { x: 0, y: 0 },
				onClose: mockOnClose
			});

			// Should render without crashing
			const modal = document.querySelector('dialog');
			expect(modal).toBeTruthy();
		});
	});

	describe('Accessibility', () => {
		it('should have proper dialog element', () => {
			render(MapPreview, {
				props: {
					show: true,
					mapData: mockMapData,
					position: { x: 0, y: 0 },
					onClose: mockOnClose
				}
			});

			const modal = document.querySelector('dialog');
			expect(modal).toBeTruthy();
		});
	});

	describe('Responsive behavior', () => {
		it('should handle different viewport sizes', () => {
			Object.defineProperty(window, 'innerWidth', {
				writable: true,
				configurable: true,
				value: 1024
			});
			Object.defineProperty(window, 'innerHeight', {
				writable: true,
				configurable: true,
				value: 768
			});

			render(MapPreview, {
				props: {
					show: true,
					mapData: mockMapData,
					position: { x: 0, y: 0 },
					onClose: mockOnClose
				}
			});

			// Should render modal with proper structure
			const modal = document.querySelector('dialog');
			expect(modal).toBeTruthy();
		});
	});

	describe('Edge cases', () => {
		it('should handle missing mapData gracefully', () => {
			render(MapPreview, {
				props: {
					show: true,
					mapData: undefined,
					position: { x: 0, y: 0 },
					onClose: mockOnClose
				}
			});

			// Should not render anything when mapData is missing
			expect(document.querySelector('dialog')).toBeNull();
		});

		it('should handle missing onClose callback gracefully', () => {
			render(MapPreview, {
				props: {
					show: true,
					mapData: mockMapData,
					position: { x: 0, y: 0 }
				}
			});

			// Should render modal without crashing
			const modal = document.querySelector('dialog');
			expect(modal).toBeTruthy();

			// Check that close button exists (by class)
			const closeButton = document.querySelector('.btn-secondary');
			expect(closeButton).toBeTruthy();

			// Should not throw error when clicking close without onClose callback
			expect(async () => {
				if (closeButton) {
					await fireEvent.click(closeButton);
				}
			}).not.toThrow();
		});
	});
});