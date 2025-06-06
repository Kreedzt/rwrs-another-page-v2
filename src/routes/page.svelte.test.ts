import { describe, test, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/svelte';
import { DataTableService } from '$lib/services/data-table';
import Page from './+page.svelte';

describe('/+page.svelte', () => {
	test('should render the server list section', () => {
		render(Page);
		expect(screen.getByLabelText('Server List')).toBeInTheDocument();
	});
});

// Mock the DataTableService
vi.mock('$lib/services/data-table', () => ({
	DataTableService: {
		listAll: vi.fn(() => Promise.resolve([]))
	}
}));

describe('Server data loading', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	test('should show loading state initially', () => {
		// Mock the listAll method to return a promise that never resolves
		vi.mocked(DataTableService.listAll).mockImplementation(() => new Promise(() => {}));

		render(Page);
		// Check for loading spinner
		expect(screen.getByRole('status')).toBeInTheDocument();
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
				mod: false,
				playerList: ['Player1', 'Player2'],
				comment: 'Test comment',
				url: 'http://example.com',
				maxPlayers: 10,
				mode: 'Test Mode',
				realm: null
			}
		];

		// Mock the listAll method to return the mock data immediately
		vi.mocked(DataTableService.listAll).mockResolvedValue(mockServers);

		// Render the component
		render(Page);

		// Wait for the loading state to be replaced with the data table
		// This will wait for the loading state to disappear and the actual data to appear
		await vi.waitFor(async () => {
			// This should eventually pass when the data is loaded
			const tableElement = await screen.findByRole('table');
			expect(tableElement).toBeInTheDocument();
		});

		// Now check for specific data in the table
		// Use queryByText to avoid test failures if the element isn't found
		const serverNameElement = screen.queryByText('Test Server');
		expect(serverNameElement).toBeInTheDocument();

		const playerCountElement = screen.queryByText('5/10');
		expect(playerCountElement).toBeInTheDocument();

		const playerList1Element = screen.queryByText('Player1');
		expect(playerList1Element).toBeInTheDocument();

		const playerList2Element = screen.queryByText('Player2');
		expect(playerList2Element).toBeInTheDocument();
	});

	test('should show error message when data loading fails', async () => {
		// Mock an error
		vi.mocked(DataTableService.listAll).mockRejectedValue(new Error('Failed to load data'));

		render(Page);

		// Wait for the error message to be displayed
		expect(await screen.findByText('Failed to load data')).toBeInTheDocument();
	});
});
