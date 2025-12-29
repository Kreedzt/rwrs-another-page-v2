import { execSync } from 'child_process';
import {
	readFileSync,
	writeFileSync,
	readdirSync,
	statSync,
	unlinkSync,
	existsSync,
	mkdirSync
} from 'fs';
import { join, basename, extname } from 'path';
import { createHash } from 'crypto';

interface AssetInfo {
	originalPath: string;
	originalName: string;
	cdnUrl: string;
	md5Hash: string;
	cdnFileName: string;
	size: number;
}

interface CDNManifest {
	assets: Record<string, AssetInfo>;
	buildTime: string;
	version: string;
	cdnBaseUrl: string;
	htmlFile: string;
}

function buildCDNForSvelteKit() {
	console.log('🚀 Starting SvelteKit CDN build process...\n');

	const cdnBaseUrl = process.env.CDN_URL || 'https://assets.kreedzt.cn/rwrs-v2-web-assets';
	const cdnImageUrl = process.env.CDN_IMAGE_URL || cdnBaseUrl;
	const buildDir = 'build';

	try {
		// Step 1: 标准构建
		console.log('🏗️  Step 1: Building with standard SvelteKit process...');
		// 传递 CDN_BUILD 环境变量，如果有 CDN_URL 也传递下去
		const env = { ...process.env, CDN_BUILD: 'true' };
		if (process.env.CDN_URL) {
			env.CDN_URL = process.env.CDN_URL;
		}

		execSync('vite build', { stdio: 'inherit', env });
		console.log('✅ Standard build completed\n');

		// Step 2: 处理资源文件
		console.log('📦 Step 2: Processing assets for CDN...');
		const manifest = processAssetsForCDN(buildDir, cdnBaseUrl, cdnImageUrl);
		console.log('✅ Asset processing completed\n');

		// Step 3: 处理HTML文件
		console.log('📄 Step 3: Processing HTML files for CDN references...');
		const htmlFiles = processHTMLFiles(buildDir, manifest);
		console.log('✅ HTML processing completed\n');

		// Step 4: 创建CDN部署结构
		// console.log('📁 Step 4: Creating CDN deployment structure...');
		// createCDNDeploymentStructure(buildDir);
		// console.log('✅ CDN structure created\n');

		// Step 5: 生成部署指南
		// console.log('📋 Step 5: Generating deployment guide...');
		// const deploymentGuide = generateSvelteKitDeploymentGuide(buildDir, manifest, htmlFiles);
		// const guidePath = join(buildDir, 'CDN-DEPLOYMENT.md');
		// writeFileSync(guidePath, deploymentGuide);
		// console.log(`📋 Deployment guide: ${guidePath}\n`);

		// 清理临时文件
		console.log('🧹 Cleaning up temporary files...');
		const manifestPath = join(buildDir, 'cdn-manifest.json');
		if (existsSync(manifestPath)) {
			unlinkSync(manifestPath);
		}
		console.log('✅ Cleanup completed\n');

		// 生成摘要
		const totalAssets = Object.keys(manifest.assets).length;
		const totalSize = Object.values(manifest.assets).reduce((sum, asset) => sum + asset.size, 0);
		const sizeInMB = (totalSize / 1024 / 1024).toFixed(2);

		console.log('🎉 SvelteKit CDN build completed successfully!');
		console.log('\n📊 Build Summary:');
		console.log(`   - CDN assets: ${totalAssets} files`);
		console.log(`   - Total size: ${sizeInMB} MB`);
		console.log(`   - CDN base URL: ${cdnBaseUrl}`);
		console.log(`   - HTML files: ${htmlFiles.length}`);
		console.log(`   - Build directory: ${buildDir}/`);

		console.log('\n🚀 Next Steps:');
		console.log('   1. Upload all files from build/ directory to your OSS');
		console.log('   2. Update your web server to serve the HTML files');
		console.log('   3. Configure CDN domain to point to your OSS bucket');
	} catch (error) {
		console.error('❌ CDN build failed:', error);
		process.exit(1);
	}
}

function processAssetsForCDN(
	buildDir: string,
	cdnBaseUrl: string,
	cdnImageUrl: string
): CDNManifest {
	const manifest: CDNManifest = {
		assets: {},
		buildTime: new Date().toISOString(),
		version: process.env.npm_package_version || '1.0.0',
		cdnBaseUrl,
		htmlFile: ''
	};

	const assetExtensions = [
		'.js',
		'.css',
		'.png',
		'.jpg',
		'.jpeg',
		'.gif',
		'.svg',
		'.webp',
		'.ico',
		'.woff',
		'.woff2',
		'.ttf',
		'.eot'
	];
	const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico'];

	function processDirectory(dir: string, relativePath: string = '') {
		const items = readdirSync(dir);

		for (const item of items) {
			const fullPath = join(dir, item);
			const itemRelativePath = relativePath ? join(relativePath, item) : item;
			const stat = statSync(fullPath);

			if (stat.isDirectory() && item !== '.git' && item !== 'node_modules') {
				// 跳过 SvelteKit 生成的 _app 目录，因为它们已经包含了哈希并且由 SvelteKit 管理引用
				// 但如果 _app 内部有 images 目录 (由 vite.config.ts 生成)，我们也不需要处理它，因为它是 Vite 管理的
				if (item === '_app' || item === 'images') {
					console.log(`  ⏭️  Skipping managed directory: ${itemRelativePath}`);
					continue;
				}
				processDirectory(fullPath, itemRelativePath);
			} else if (stat.isFile()) {
				const ext = extname(item).toLowerCase();

				// 跳过 HTML 文件和系统文件
				if (
					ext === '.html' ||
					ext === '.json' ||
					ext === '.map' ||
					item.startsWith('.') ||
					item.includes('.DS_Store')
				) {
					continue;
				}

				// 处理资源文件
				if (assetExtensions.includes(ext)) {
					try {
						const content = readFileSync(fullPath);
						const md5Hash = createHash('md5').update(content).digest('hex');

						const isImage = imageExtensions.includes(ext);

						let cdnFileName: string;
						let cdnUrl: string;
						let targetPath: string;

						if (isImage) {
							// 图片移动到 images 目录
							const imagesDir = join(buildDir, 'images');
							if (!existsSync(imagesDir)) {
								mkdirSync(imagesDir, { recursive: true });
							}

							cdnFileName = `${md5Hash}${ext}`; // 使用完整 MD5 哈希文件名
							targetPath = join(imagesDir, cdnFileName);
							cdnUrl = `${cdnImageUrl}/images/${cdnFileName}`;
						} else {
							// 其他文件（如果在 static 下）原地重命名
							const shortHash = md5Hash.substring(0, 8); // 其他文件保持短哈希以保留可读性
							const nameWithoutExt = basename(item, ext);
							cdnFileName = `${nameWithoutExt}-${shortHash}${ext}`;
							targetPath = join(dir, cdnFileName);
							// 注意：这里假设非图片资源仍然在原目录结构中
							cdnUrl = `${cdnBaseUrl}/${itemRelativePath.replace(item, cdnFileName)}`;
						}

						// 写入新文件
						writeFileSync(targetPath, content);

						// 更新清单
						manifest.assets[itemRelativePath] = {
							originalPath: itemRelativePath,
							originalName: item,
							cdnUrl,
							md5Hash,
							cdnFileName,
							size: content.length
						};

						// 删除原文件 (如果目标路径不同，或者文件名不同)
						if (fullPath !== targetPath) {
							unlinkSync(fullPath);
						}

						console.log(`  📦 ${itemRelativePath} -> ${cdnUrl}`);
					} catch (error) {
						console.error(`❌ Error processing ${itemRelativePath}:`, error);
					}
				}
			}
		}
	}

	processDirectory(buildDir);

	// 保存清单
	const manifestPath = join(buildDir, 'cdn-manifest.json');
	writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

	console.log(`✅ Processed ${Object.keys(manifest.assets).length} assets for CDN`);
	return manifest;
}

function processHTMLFiles(buildDir: string, manifest: CDNManifest): string[] {
	const htmlFiles: string[] = [];

	function findAndProcessHTMLFiles(dir: string, relativePath: string = '') {
		const items = readdirSync(dir);

		for (const item of items) {
			const fullPath = join(dir, item);
			const itemRelativePath = relativePath ? join(relativePath, item) : item;
			const stat = statSync(fullPath);

			if (stat.isDirectory() && item !== '.git' && item !== 'node_modules') {
				findAndProcessHTMLFiles(fullPath, itemRelativePath);
			} else if (stat.isFile() && item.endsWith('.html')) {
				const processedContent = processHTMLContent(fullPath, manifest);
				const outputPath = fullPath.replace('.html', '-cdn.html');
				writeFileSync(outputPath, processedContent);

				htmlFiles.push(outputPath);
				console.log(`  📄 ${itemRelativePath} -> ${basename(outputPath)}`);
			}
		}
	}

	findAndProcessHTMLFiles(buildDir);
	return htmlFiles;
}

function processHTMLContent(htmlPath: string, manifest: CDNManifest): string {
	let content = readFileSync(htmlPath, 'utf-8');

	// 替换 favicon 引用
	content = content.replace(/<link[^>]+href=["']\.\/favicon\.png["'][^>]*>/g, (match) => {
		const assetInfo = Object.values(manifest.assets).find(
			(asset) => asset.originalName === 'favicon.png'
		);
		if (assetInfo) {
			return match.replace('./favicon.png', assetInfo.cdnUrl);
		}
		return match;
	});

	// 强制替换 SvelteKit 生成的 _app 引用 (修复 SvelteKit 配置在某些情况下不生效的问题)
	const baseUrl = manifest.cdnBaseUrl.endsWith('/')
		? manifest.cdnBaseUrl.slice(0, -1)
		: manifest.cdnBaseUrl;

	// 1. 替换 import("./_app/...") 或 import("/_app/...")
	// 2. 替换 href="./_app/..." 或 href="/_app/..."
	// 3. 替换 src="./_app/..." 或 src="/_app/..."
	// 使用正则匹配所有以 ./-app/ 或 /_app/ 开头的路径引用
	content = content.replace(/["'](\.?\/_app\/)([^"']+)["']/g, (match, prefix, path) => {
		const quote = match[0];
		return `${quote}${baseUrl}/_app/${path}${quote}`;
	});

	// 替换所有资源引用（包括相对路径和绝对路径）
	for (const [relativePath, assetInfo] of Object.entries(manifest.assets)) {
		// 替换 ./ 开头的相对路径
		const relativePattern = new RegExp(`(["'])\\.${relativePath.replace(/^\//, '\\/')}\\1`, 'g');
		content = content.replace(relativePattern, `"${assetInfo.cdnUrl}"`);

		// 替换直接路径引用（不带 ./ 前缀）
		const directPattern = new RegExp(`(["'])${relativePath.replace(/^\//, '\\/')}\\1`, 'g');
		content = content.replace(directPattern, `"${assetInfo.cdnUrl}"`);

		// 替换 modulepreload 和其他预加载引用
		const preloadPattern = new RegExp(`href=["']\\.${relativePath.replace(/^\//, '\\/')}["']`, 'g');
		content = content.replace(preloadPattern, `href="${assetInfo.cdnUrl}"`);
	}

	// 添加 CDN 基础 URL meta 标签
	const metaTag = `\n  <meta name="cdn-base-url" content="${manifest.cdnBaseUrl}">`;
	if (content.includes('<head>')) {
		content = content.replace('<head>', `<head>${metaTag}`);
	}

	return content;
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
	buildCDNForSvelteKit();
}

export { buildCDNForSvelteKit };
