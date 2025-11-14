import { expect, test } from '@playwright/test';

test('home page has expected h1', async ({ page }) => {
	await page.goto('http://localhost:4173/');
	await expect(page.locator('h1')).toBeVisible();
});

test('server list API returns data', async ({ page, request }) => {
	// Test the API directly
	const response = await request.get(
		'http://localhost:5800/api/server_list?start=0&size=100&names=1'
	);
	expect(response.ok()).toBeTruthy();

	const text = await response.text();
	expect(text).toContain('<result>');
	expect(text).toContain('<server>');
	expect(text).toContain('<name>Test Server 1</name>');

	// Test the page loads server data
	await page.goto('http://localhost:4173/');

	// Wait for the server data to load
	await page.waitForSelector('table');

	// Check that server data is displayed in the desktop table view
	await expect(page.locator('table').getByText('Test Server 1')).toBeVisible();
});
