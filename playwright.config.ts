import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: [
		{
			command: 'node tests/e2e/mock-server.cjs',
			port: 5800,
			reuseExistingServer: false
		},
		{
			command: 'E2E_TEST=true npm run dev',
			port: 5173,
			reuseExistingServer: false
		}
	],
	testDir: 'tests/e2e',
	use: {
		// Retry tests on failure
		retry: 1,
		// Timeout for each test
		timeout: 30000
	}
});
