import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { execSync } from 'child_process';

const resolveBuildVersion = () => {
	if (process.env.BUILD_VERSION) return process.env.BUILD_VERSION;
	if (process.env.TAG_NAME) return process.env.TAG_NAME;
	if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA.substring(0, 7);
	try {
		return execSync('git rev-parse --short HEAD').toString().trim();
	} catch {
		// last resort: package version or dev
		return process.env.npm_package_version || 'dev';
	}
};

const buildVersion = resolveBuildVersion();

const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		alias: {
			'@/*': './src/*'
		},
		version: {
			// fixed version name
			name: buildVersion
		}
	}
};

export default config;
