import tailwindcss from '@tailwindcss/vite';
import { svelteTesting } from '@testing-library/svelte/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	resolve: {
		alias: {
      		'@': path.resolve(__dirname, './src'),
		}
	},
	server: {
		proxy: {
			// use rwrs-server
			'/api': {
				target: 'http://localhost:5800',

				// target: 'https://rwrs.kreedzt.cn/',
				changeOrigin: true,
			},
		}
	},
	test: {
		watch: false,
		workspace: [
			{
				extends: './vite.config.ts',
				plugins: [svelteTesting()],
				test: {
					name: 'client',
					environment: 'jsdom',
					clearMocks: true,
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**'],
					setupFiles: ['./vitest-setup-client.ts']
				}
			},
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		],
		coverage: {
			include: ['src/'],
			provider: 'v8',
			reporter: ['text', 'json', 'cobertura', 'html', 'lcov'],
		},
		reporters: [
			'default',
			['vitest-sonar-reporter', { outputFile: 'sonar-report.xml' }],
		],
	}
});
