import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { getMaps, type MapData } from '$lib/services/maps';

// Mock environment variables
vi.stubEnv('VITE_API_URL', '');

// Mock fetch API
global.fetch = vi.fn();

describe('Maps Service', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Mock console.error to suppress expected error messages
		vi.spyOn(console, 'error').mockImplementation(() => {});
		// Reset fetch mock
		vi.mocked(fetch).mockClear();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('getMaps function', () => {
		test('should fetch and return map data successfully', async () => {
			// Mock successful API response
			const mockMapsData: MapData[] = [
				{
					id: 'map1_desert',
					name: 'Desert Map',
					path: 'media/packages/vanilla.desert/maps/map1',
					image: 'md5_1.png'
				},
				{
					id: 'map2_jungle',
					name: 'Jungle Map',
					path: 'media/packages/vanilla.jungle/maps/map2',
					image: 'md5_2.png'
				}
			];

			vi.mocked(fetch).mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockMapsData),
				headers: new Headers()
			});

			const result = await getMaps();

			// Verify fetch was called correctly
			expect(fetch).toHaveBeenCalledWith('/api/maps', expect.any(Object));

			// Verify results
			expect(result).toHaveLength(2);
			expect(result[0]).toEqual({
				id: 'map1_desert',
				name: 'Desert Map',
				path: 'media/packages/vanilla.desert/maps/map1',
				image: 'md5_1.png'
			});
			expect(result[1]).toEqual({
				id: 'map2_jungle',
				name: 'Jungle Map',
				path: 'media/packages/vanilla.jungle/maps/map2',
				image: 'md5_2.png'
			});
		});

		test('should handle empty maps array', async () => {
			const emptyMapsData: MapData[] = [];

			vi.mocked(fetch).mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(emptyMapsData),
				headers: new Headers()
			});

			const result = await getMaps();

			expect(result).toHaveLength(0);
			expect(fetch).toHaveBeenCalledWith('/api/maps', expect.any(Object));
		});

		test('should handle network errors gracefully', async () => {
			vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

			const result = await getMaps();

			expect(result).toEqual([]); // Should return empty array on error
			expect(console.error).toHaveBeenCalledWith('Failed to fetch maps:', expect.any(Error));
		});

		test('should handle HTTP error responses', async () => {
			vi.mocked(fetch).mockResolvedValueOnce({
				ok: false,
				status: 500,
				statusText: 'Internal Server Error',
				json: () => Promise.resolve({ error: 'Server error' }),
				headers: new Headers()
			});

			const result = await getMaps();

			expect(result).toEqual([]); // Should return empty array on error
			expect(console.error).toHaveBeenCalledWith('Failed to fetch maps:', expect.any(Error));
		});

		test('should handle malformed JSON gracefully', async () => {
			vi.mocked(fetch).mockResolvedValueOnce({
				ok: true,
				json: () => Promise.reject(new Error('Invalid JSON')),
				headers: new Headers()
			});

			const result = await getMaps();

			expect(result).toEqual([]); // Should return empty array on error
			expect(console.error).toHaveBeenCalledWith('Failed to fetch maps:', expect.any(Error));
		});

		test('should validate MapData interface structure', async () => {
			// Mock response with missing required fields
			const invalidMapsData = [
				{
					id: 'map1',
					name: 'Test Map'
					// Missing 'path' and 'image' fields
				}
			];

			vi.mocked(fetch).mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(invalidMapsData),
				headers: new Headers()
			});

			const result = await getMaps();

			// Should still return the data as-is, validation happens at runtime
			expect(result).toHaveLength(1);
			expect(result[0]).toEqual({
				id: 'map1',
				name: 'Test Map'
			});
		});

		test('should handle maps with special characters in names', async () => {
			const mockMapsData: MapData[] = [
				{
					id: 'map_special',
					name: 'Special Map [Beta] v2.0',
					path: 'media/packages/vanilla/maps/special_map',
					image: 'special_map.png'
				}
			];

			vi.mocked(fetch).mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockMapsData),
				headers: new Headers()
			});

			const result = await getMaps();

			expect(result).toHaveLength(1);
			expect(result[0].name).toBe('Special Map [Beta] v2.0');
		});

		test('should handle maps with different package paths', async () => {
			const mockMapsData: MapData[] = [
				{
					id: 'map_ww2',
					name: 'WW2 Map',
					path: 'media/packages/ww2/maps/operation_overlord',
					image: 'operation_overlord.png'
				},
				{
					id: 'map_castling',
					name: 'Castling Map',
					path: 'media/packages/castling/maps/castle_defense',
					image: 'castle_defense.png'
				}
			];

			vi.mocked(fetch).mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockMapsData),
				headers: new Headers()
			});

			const result = await getMaps();

			expect(result).toHaveLength(2);
			expect(result[0].path).toContain('ww2');
			expect(result[1].path).toContain('castling');
		});
	});

	describe('Real-world scenarios', () => {
		test('should handle large number of maps', async () => {
			// Create mock data with 50 maps
			const largeMapsData: MapData[] = Array.from({ length: 50 }, (_, i) => ({
				id: `map${i}_test`,
				name: `Test Map ${i}`,
				path: `media/packages/vanilla.maps/maps/map${i}`,
				image: `map${i}_image.png`
			}));

			vi.mocked(fetch).mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(largeMapsData),
				headers: new Headers()
			});

			const result = await getMaps();

			expect(result).toHaveLength(50);
			// Test first and last items
			expect(result[0].id).toBe('map0_test');
			expect(result[49].id).toBe('map49_test');
		});

		test('should handle different image formats', async () => {
			const mockMapsData: MapData[] = [
				{
					id: 'map_png',
					name: 'PNG Map',
					path: 'media/packages/vanilla/maps/map1',
					image: 'map1.png'
				},
				{
					id: 'map_jpg',
					name: 'JPG Map',
					path: 'media/packages/vanilla/maps/map2',
					image: 'map2.jpg'
				},
				{
					id: 'map_webp',
					name: 'WebP Map',
					path: 'media/packages/vanilla/maps/map3',
					image: 'map3.webp'
				}
			];

			vi.mocked(fetch).mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockMapsData),
				headers: new Headers()
			});

			const result = await getMaps();

			expect(result).toHaveLength(3);
			expect(result[0].image).toMatch(/\.png$/);
			expect(result[1].image).toMatch(/\.jpg$/);
			expect(result[2].image).toMatch(/\.webp$/);
		});
	});
});
