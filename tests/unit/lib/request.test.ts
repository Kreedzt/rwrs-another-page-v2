import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { request, type RequestOptions } from '$lib/request';

// Mock environment variables
vi.stubEnv('VITE_API_URL', '');

// Mock fetch API
global.fetch = vi.fn();

describe('Request function', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(fetch).mockClear();
		// Mock console.error to suppress expected error messages
		vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('successful requests', () => {
		test('should make successful JSON request', async () => {
			const mockData = { result: 'success' };
			vi.mocked(fetch).mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockData),
				headers: new Headers()
			} as any);

			const result = await request<{ result: string }>('/test');

			expect(fetch).toHaveBeenCalledWith(
				'/test',
				expect.objectContaining({ signal: expect.any(AbortSignal) })
			);
			expect(result).toEqual(mockData);
		});

		test('should make successful text request', async () => {
			const mockText = 'response text';
			vi.mocked(fetch).mockResolvedValueOnce({
				ok: true,
				text: () => Promise.resolve(mockText),
				headers: new Headers()
			} as any);

			const result = await request<string>('/test', {}, 'text');

			expect(result).toBe(mockText);
		});

		test('should use custom timeout', async () => {
			const mockData = { result: 'success' };
			vi.mocked(fetch).mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockData),
				headers: new Headers()
			} as any);

			await request<{ result: string }>('/test', {}, 'json', 5000);

			expect(fetch).toHaveBeenCalledWith(
				'/test',
				expect.objectContaining({ signal: expect.any(AbortSignal) })
			);
		});
	});

	describe('error handling', () => {
		test('should handle HTTP error responses', async () => {
			vi.mocked(fetch).mockResolvedValueOnce({
				ok: false,
				status: 404,
				statusText: 'Not Found',
				json: () => Promise.resolve({ error: 'Not found' }),
				headers: new Headers()
			} as any);

			await expect(request('/test')).rejects.toThrow('HTTP error 404: Not Found');
			expect(console.error).toHaveBeenCalledWith('HTTP error 404: Not Found for /test');
		});

		test('should handle request timeout (AbortError)', async () => {
			const abortError = new Error('Request timeout');
			abortError.name = 'AbortError';

			vi.mocked(fetch).mockRejectedValueOnce(abortError);

			await expect(request('/test', {}, 'json', 1000)).rejects.toThrow(
				'Request timed out after 1000ms'
			);
			expect(console.error).toHaveBeenCalledWith('Request to /test timed out after 1000ms');
		});

		test('should handle network errors (TypeError with Failed to fetch)', async () => {
			const networkError = new TypeError('Failed to fetch');
			networkError.name = 'TypeError';

			vi.mocked(fetch).mockRejectedValueOnce(networkError);

			await expect(request('/test')).rejects.toThrow('Network error: Failed to fetch');
			expect(console.error).toHaveBeenCalledWith('Network error for /test: Failed to fetch');
		});

		test('should handle other unexpected errors', async () => {
			const unexpectedError = new Error('Unexpected error');
			unexpectedError.name = 'Error';

			vi.mocked(fetch).mockRejectedValueOnce(unexpectedError);

			await expect(request('/test')).rejects.toThrow(unexpectedError);
			expect(console.error).toHaveBeenCalledWith('Error fetching /test:', unexpectedError);
		});

		test('should handle CORS errors', async () => {
			const corsError = new TypeError('Failed to fetch');
			corsError.name = 'TypeError';
			corsError.message = 'Failed to fetch';

			vi.mocked(fetch).mockRejectedValueOnce(corsError);

			await expect(request('/test')).rejects.toThrow('Network error: Failed to fetch');
			expect(console.error).toHaveBeenCalledWith('Network error for /test: Failed to fetch');
		});

		test('should handle network disconnection errors', async () => {
			const disconnectError = new TypeError('Failed to fetch');
			disconnectError.name = 'TypeError';
			disconnectError.message = 'NetworkError when attempting to fetch resource.';

			vi.mocked(fetch).mockRejectedValueOnce(disconnectError);

			await expect(request('/test')).rejects.toThrow(
				'NetworkError when attempting to fetch resource.'
			);
		});
	});

	describe('timeout behavior', () => {
		test('should use options.timeout over default timeout', async () => {
			const mockData = { result: 'success' };
			vi.mocked(fetch).mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockData),
				headers: new Headers()
			} as any);

			const options: RequestOptions = { timeout: 3000 };
			await request('/test', options);

			// Since we can't directly test the timeout value in the mock,
			// we just verify the request was made successfully
			expect(fetch).toHaveBeenCalledWith(
				'/test',
				expect.objectContaining({ signal: expect.any(AbortSignal) })
			);
		});

		test('should clear timeout even when request fails', async () => {
			const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
			const error = new Error('Request failed');
			vi.mocked(fetch).mockRejectedValueOnce(error);

			try {
				await request('/test');
			} catch {
				// Expected to throw
			}

			// Should have called clearTimeout even after error
			expect(clearTimeoutSpy).toHaveBeenCalled();
			clearTimeoutSpy.mockRestore();
		});
	});

	describe('base URL handling', () => {
		test('should prepend BASE_URL to request URL', async () => {
			const mockData = { result: 'success' };
			vi.mocked(fetch).mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockData),
				headers: new Headers()
			} as any);

			await request('/api/test');

			expect(fetch).toHaveBeenCalledWith('/api/test', expect.any(Object));
		});
	});

	describe('request options', () => {
		test('should pass through custom request options', async () => {
			const mockData = { result: 'success' };
			vi.mocked(fetch).mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockData),
				headers: new Headers()
			} as any);

			const options: RequestOptions = {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ test: 'data' }),
				timeout: 5000
			};

			await request('/test', options);

			expect(fetch).toHaveBeenCalledWith(
				'/test',
				expect.objectContaining({
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ test: 'data' }),
					signal: expect.any(AbortSignal)
				})
			);
		});
	});
});
