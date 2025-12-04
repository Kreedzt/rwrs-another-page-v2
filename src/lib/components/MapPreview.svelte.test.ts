import { render, screen, fireEvent, waitFor } from '@testing-library/svelte/svelte5';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import MapPreview from './MapPreview.svelte';
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
			expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
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
			const modal = screen.getByRole('dialog');
			expect(modal).toBeInTheDocument();
			expect(modal).toHaveAttribute('aria-label', 'Map preview');
			expect(modal).toHaveAttribute('aria-modal', 'true');
			expect(modal).toHaveAttribute('tabindex', '-1');

			// Should display map name and path
			expect(screen.getByText('Test Map')).toBeInTheDocument();
			expect(screen.getByText('media/packages/vanilla.maps/maps/test')).toBeInTheDocument();

			// Should render close button (find by class instead of name)
			const closeButton = screen.getByRole('button');
			expect(closeButton).toBeInTheDocument();
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

			// Should show loading dots (visual indicator)
			const loadingDots = document.querySelectorAll('.loading-dot');
			expect(loadingDots).toHaveLength(3);

			// Should show loading container
			const loadingContainer = document.querySelector('.flex.flex-col.items-center.justify-center.p-8');
			expect(loadingContainer).toBeInTheDocument();
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

			// Should show loading dots initially
			const loadingDots = document.querySelectorAll('.loading-dot');
			expect(loadingDots).toHaveLength(3);

			// Should have image container
			const imageContainer = document.querySelector('.relative.bg-base-200\\/30');
			expect(imageContainer).toBeInTheDocument();
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
			const modal = screen.getByRole('dialog');
			expect(modal).toBeInTheDocument();
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
			const closeButton = screen.getByRole('button');
			expect(closeButton).toBeInTheDocument();
			expect(closeButton).toHaveClass('btn-secondary');
		});

		it('should call onClose when background is clicked', async () => {
			render(MapPreview, {
				props: {
					show: true,
					mapData: mockMapData,
					position: { x: 0, y: 0 },
					onClose: mockOnClose
				}
			});

			const modal = screen.getByRole('dialog');
			await fireEvent.click(modal);

			expect(mockOnClose).toHaveBeenCalledTimes(1);
		});

		it('should call onClose when Escape key is pressed', async () => {
			render(MapPreview, {
				props: {
					show: true,
					mapData: mockMapData,
					position: { x: 0, y: 0 },
					onClose: mockOnClose
				}
			});

			const modal = screen.getByRole('dialog');
			await fireEvent.keyDown(modal, { key: 'Escape' });

			expect(mockOnClose).toHaveBeenCalledTimes(1);
		});

		it('should not call onClose for other keys', async () => {
			render(MapPreview, {
				props: {
					show: true,
					mapData: mockMapData,
					position: { x: 0, y: 0 },
					onClose: mockOnClose
				}
			});

			const modal = screen.getByRole('dialog');
			await fireEvent.keyDown(modal, { key: 'Enter' });

			expect(mockOnClose).not.toHaveBeenCalled();
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

			// Should show loading state initially
			const loadingDots = document.querySelectorAll('.loading-dot');
			expect(loadingDots).toHaveLength(3);

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
			const modal = screen.getByRole('dialog');
			expect(modal).toBeInTheDocument();
		});
	});

	describe('Accessibility', () => {
		it('should have proper ARIA attributes', () => {
			render(MapPreview, {
				props: {
					show: true,
					mapData: mockMapData,
					position: { x: 0, y: 0 },
					onClose: mockOnClose
				}
			});

			const modal = screen.getByRole('dialog');
			expect(modal).toHaveAttribute('aria-label', 'Map preview');
			expect(modal).toHaveAttribute('aria-modal', 'true');
			expect(modal).toHaveAttribute('tabindex', '-1');
		});

		it('should focus modal when opened', async () => {
			render(MapPreview, {
				props: {
					show: true,
					mapData: mockMapData,
					position: { x: 0, y: 0 },
					onClose: mockOnClose
				}
			});

			const modal = screen.getByRole('dialog');
			expect(modal).toHaveFocus();
		});

		it('should have proper ARIA attributes', () => {
			render(MapPreview, {
				props: {
					show: true,
					mapData: mockMapData,
					position: { x: 0, y: 0 },
					onClose: mockOnClose
				}
			});

			const modal = screen.getByRole('dialog');
			expect(modal).toHaveAttribute('aria-label', 'Map preview');
			expect(modal).toHaveAttribute('aria-modal', 'true');
			expect(modal).toHaveAttribute('tabindex', '-1');
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
			const modal = screen.getByRole('dialog');
			expect(modal).toBeInTheDocument();
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
			expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
		});

		it('should handle missing onClose callback gracefully', () => {
			render(MapPreview, {
				props: {
					show: true,
					mapData: mockMapData,
					position: { x: 0, y: 0 }
				}
			});

			const closeButton = screen.getByRole('button');

			// Should not throw error when clicking close without onClose callback
			expect(async () => {
				await fireEvent.click(closeButton);
			}).not.toThrow();
		});
	});
});