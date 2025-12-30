import * as pwaAssetGenerator from 'pwa-asset-generator';
import { readFile } from 'fs/promises';

const sourceIcon = 'static/favicon.png';
const outputDir = 'static';
const manifestPath = 'static/manifest.webmanifest';

// Military theme color for icon background
const backgroundColor = '#1a1d1f';
const accentColor = '#ff6b35';

async function generateIcons() {
	console.log('🎨 Generating PWA icons from', sourceIcon);

	try {
		// Check if source icon exists
		await readFile(sourceIcon);

		// Generate icons
		const result = await pwaAssetGenerator.generateImages(sourceIcon, outputDir, {
			background: backgroundColor,
			padding: '10%',
			manifest: manifestPath,
			// Standard PWA icon sizes
			indices: [72, 96, 128, 144, 152, 192, 384, 512],
			// Generate maskable icons with safe zone
			maskable: {
				sizes: [192, 512],
				background: accentColor
			},
			// Don't generate XWalk icons (deprecated)
			xwalk: false
		});

		console.log('✅ Icons generated successfully!');
		console.log('📁 Generated files:', result);

		// Print the generated icon files
		if (result.images) {
			console.log('\n🖼️  Icon files:');
			result.images.forEach((img: { name: string; width: number; height: number }) => {
				console.log(`   - ${img.name} (${img.width}x${img.height})`);
			});
		}

		if (result.manifest) {
			console.log('\n📋 Manifest updated:', result.manifest);
		}
	} catch (error) {
		console.error('❌ Error generating icons:', error);
		throw error;
	}
}

generateIcons();
