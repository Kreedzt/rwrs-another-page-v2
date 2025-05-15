import { describe, test, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/svelte';
import Page from './+page.svelte';
import { DataTableService } from '@/services/data-table';

// Mock the DataTableService
vi.mock('@/services/data-table', () => ({
	DataTableService: {
		listAll: vi.fn()
	}
}));

describe('/servers/+page.svelte', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	test('should show loading state initially', () => {
		// Mock the listAll method to return a promise that never resolves
		vi.mocked(DataTableService.listAll).mockImplementation(() => new Promise(() => {}));
		
		render(Page);
		expect(screen.getByText('Server List')).toBeInTheDocument();
		expect(screen.getByRole('status')).toBeInTheDocument(); // Loading spinner
	});

	test('should render server table when data is loaded', async () => {
		// Mock server data
		const mockServers = [
			{
				name: 'Test Server',
				ipAddress: '127.0.0.1',
				port: 8080,
				mapId: 'map1',
				mapName: 'Test Map',
				bots: 0,
				country: 'US',
				currentPlayers: 5,
				timeStamp: 1234567890,
				version: 1,
				dedicated: true,
				mod: null,
				playerList: ['Player1', 'Player2'],
				comment: 'Test comment',
				url: 'http://example.com',
				maxPlayers: 10,
				mode: 'Test Mode',
				realm: null
			}
		];
		
		vi.mocked(DataTableService.listAll).mockResolvedValue(mockServers);
		
		render(Page);
		
		// Wait for the table to be rendered
		expect(await screen.findByRole('table')).toBeInTheDocument();
		expect(screen.getByText('Test Server')).toBeInTheDocument();
		expect(screen.getByText('127.0.0.1')).toBeInTheDocument();
		expect(screen.getByText('8080')).toBeInTheDocument();
	});

	test('should show error message when data loading fails', async () => {
		// Mock an error
		vi.mocked(DataTableService.listAll).mockRejectedValue(new Error('Failed to load data'));
		
		render(Page);
		
		// Wait for the error message to be displayed
		expect(await screen.findByText(/Failed to load servers/)).toBeInTheDocument();
	});
});
