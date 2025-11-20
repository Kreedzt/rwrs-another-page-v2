import { execSync } from 'child_process';
import { readFileSync, writeFileSync, readdirSync, statSync, unlinkSync, existsSync } from 'fs';
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

	const cdnBaseUrl = process.env.CDN_URL || 'https://assets.kreedzt.cn/rwrs-web-assets';
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
		const manifest = processAssetsForCDN(buildDir, cdnBaseUrl);
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

function processAssetsForCDN(buildDir: string, cdnBaseUrl: string): CDNManifest {
	const manifest: CDNManifest = {
		assets: {},
		buildTime: new Date().toISOString(),
		version: process.env.npm_package_version || '1.0.0',
		cdnBaseUrl,
		htmlFile: ''
	};

	const assetExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico', '.woff', '.woff2', '.ttf', '.eot'];

	function processDirectory(dir: string, relativePath: string = '') {
		const items = readdirSync(dir);

		for (const item of items) {
			const fullPath = join(dir, item);
			const itemRelativePath = relativePath ? join(relativePath, item) : item;
			const stat = statSync(fullPath);

			if (stat.isDirectory() && item !== '.git' && item !== 'node_modules') {
				// 跳过 SvelteKit 生成的 _app 目录，因为它们已经包含了哈希并且由 SvelteKit 管理引用
				if (item === '_app') {
					console.log(`  ⏭️  Skipping SvelteKit app directory: ${itemRelativePath}`);
					continue;
				}
				processDirectory(fullPath, itemRelativePath);
			} else if (stat.isFile()) {
				const ext = extname(item).toLowerCase();

				// 跳过 HTML 文件和系统文件
				if (ext === '.html' || ext === '.json' || ext === '.map' || item.startsWith('.') || item.includes('.DS_Store')) {
					continue;
				}

				// 处理资源文件
				if (assetExtensions.includes(ext)) {
					try {
						const content = readFileSync(fullPath);
						const md5Hash = createHash('md5').update(content).digest('hex');
						const shortHash = md5Hash.substring(0, 8);

						const nameWithoutExt = basename(item, ext);
						const cdnFileName = `${nameWithoutExt}-${shortHash}${ext}`;
						const cdnUrl = `${cdnBaseUrl}/${itemRelativePath.replace(item, cdnFileName)}`;

						// 创建 CDN 版本文件
						const cdnPath = join(dir, cdnFileName);
						writeFileSync(cdnPath, content);

						// 更新清单
						manifest.assets[itemRelativePath] = {
							originalPath: itemRelativePath,
							originalName: item,
							cdnUrl,
							md5Hash,
							cdnFileName,
							size: content.length
						};

						// 如果文件名不同，删除原文件
						if (item !== cdnFileName) {
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
	content = content.replace(
		/<link[^>]+href=["']\.\/favicon\.png["'][^>]*>/g,
		(match) => {
			const assetInfo = Object.values(manifest.assets).find(asset => asset.originalName === 'favicon.png');
			if (assetInfo) {
				return match.replace('./favicon.png', assetInfo.cdnUrl);
			}
			return match;
		}
	);

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

function createCDNDeploymentStructure(buildDir: string): void {
	// 创建目录结构说明
	const structureInfo = `
CDN Deployment Structure
========================

Upload Instructions:
- Upload ALL files in the build/ directory to your OSS bucket
- The -cdn.html files are the main files to serve as index.html
- Original files have been renamed with MD5 hashes
- All asset references in HTML files point to CDN URLs

Directory: ${buildDir}
- HTML files: *.html and *-cdn.html (use -cdn.html for deployment)
- Asset files: renamed with MD5 hashes
- Manifest: cdn-manifest.json
`;

	const structurePath = join(buildDir, 'cdn-structure-info.txt');
	writeFileSync(structurePath, structureInfo);
}

function generateSvelteKitDeploymentGuide(buildDir: string, manifest: CDNManifest, htmlFiles: string[]): string {
	const totalAssets = Object.keys(manifest.assets).length;
	const totalSize = Object.values(manifest.assets).reduce((sum, asset) => sum + asset.size, 0);
	const sizeInMB = (totalSize / 1024 / 1024).toFixed(2);

	return `
# SvelteKit CDN Deployment Guide

## 📊 Build Summary
- **CDN Base URL**: ${manifest.cdnBaseUrl}
- **Total Assets**: ${totalAssets} files
- **Total Size**: ${sizeInMB} MB
- **HTML Files**: ${htmlFiles.length}
- **Build Time**: ${manifest.buildTime}

## 📁 Deployment Files

### HTML Files (Deploy to Web Server)
${htmlFiles.map(file => `- \`${file}\` → Rename to \`index.html\``).join('\n')}

### Asset Files (Upload to CDN/OSS)
${Object.values(manifest.assets).slice(0, 10).map(asset =>
	`- \`${asset.cdnFileName}\` (${asset.cdnUrl})`
).join('\n')}
${Object.values(manifest.assets).length > 10 ? `\n... and ${Object.values(manifest.assets).length - 10} more files` : ''}

## 🚀 Deployment Steps

### 1. Upload Assets to CDN/OSS
\`\`\`bash
# Upload entire build directory to your OSS
# All files are ready for CDN deployment
# Example for Alibaba Cloud OSS:
ossutil cp -r ${buildDir}/ oss://your-bucket/
\`\`\`

### 2. Deploy HTML Files
\`\`\`bash
# Deploy the CDN-processed HTML as your main index.html
cp ${buildDir}/*-cdn.html /var/www/html/index.html
\`\`\`

### 3. Configure CDN Domain
Make sure your domain \`${manifest.cdnBaseUrl}\` points to your OSS bucket.

## ✅ Verification
1. Visit your website
2. Check browser DevTools Network tab
3. Verify all resources load from \`${manifest.cdnBaseUrl}\`
4. Ensure no 404 errors for asset files

## 🔄 Updates
When updating:
1. Run \`pnpm build:cdn\` again
2. Upload all files from build/ directory
3. Deploy the new *-cdn.html file
4. Old assets are automatically handled by MD5 naming

Generated: ${new Date().toISOString()}
`;
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
	buildCDNForSvelteKit();
}

export { buildCDNForSvelteKit };