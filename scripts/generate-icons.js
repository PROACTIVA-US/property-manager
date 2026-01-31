#!/usr/bin/env node

/**
 * PWA Icon Generator Script
 *
 * This script generates PNG icons from the source SVG for PWA compatibility.
 *
 * Prerequisites:
 *   npm install -g sharp-cli
 *   OR
 *   npm install sharp
 *
 * Usage:
 *   node scripts/generate-icons.js
 *
 * Alternative (if sharp not available):
 *   Use an online tool like https://realfavicongenerator.net/
 *   Upload public/icons/icon.svg and download the generated icons
 */

const fs = require('fs');
const path = require('path');

const ICON_SIZES = [72, 96, 128, 144, 152, 167, 180, 192, 384, 512];
const SOURCE_SVG = path.join(__dirname, '../public/icons/icon.svg');
const OUTPUT_DIR = path.join(__dirname, '../public/icons');

async function generateIcons() {
  try {
    // Try to use sharp if available
    const sharp = require('sharp');

    console.log('Generating PWA icons...');

    for (const size of ICON_SIZES) {
      const outputPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);

      await sharp(SOURCE_SVG)
        .resize(size, size)
        .png()
        .toFile(outputPath);

      console.log(`  Created: icon-${size}x${size}.png`);
    }

    // Generate apple-touch-icon (180x180 is standard)
    await sharp(SOURCE_SVG)
      .resize(180, 180)
      .png()
      .toFile(path.join(OUTPUT_DIR, 'apple-touch-icon.png'));

    console.log('  Created: apple-touch-icon.png');
    console.log('Done! All icons generated successfully.');

  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.log(`
Sharp module not found. To generate PNG icons:

Option 1: Install sharp and run again
  npm install sharp
  node scripts/generate-icons.js

Option 2: Use an online tool
  1. Go to https://realfavicongenerator.net/
  2. Upload public/icons/icon.svg
  3. Download and extract icons to public/icons/

Option 3: Use ImageMagick (if installed)
  convert public/icons/icon.svg -resize 192x192 public/icons/icon-192x192.png
  convert public/icons/icon.svg -resize 512x512 public/icons/icon-512x512.png

For now, the SVG icon will work as a fallback in most modern browsers.
`);
    } else {
      console.error('Error generating icons:', error);
    }
  }
}

generateIcons();
