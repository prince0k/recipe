const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../app/icon.svg');
const png96Path = path.join(__dirname, '../app/icon.png'); // Standard multiple of 48px (96x96)
const png192Path = path.join(__dirname, '../app/icon-192.png'); // Another common size

async function generateIcons() {
  try {
    if (!fs.existsSync(svgPath)) {
      console.error('Error: app/icon.svg not found');
      return;
    }

    console.log('Rendering app/icon.png (96x96) from SVG...');
    await sharp(svgPath)
      .resize(96, 96)
      .png()
      .toFile(png96Path);
    console.log('Successfully generated app/icon.png');

    console.log('Rendering app/icon-192.png (192x192) from SVG...');
    await sharp(svgPath)
      .resize(192, 192)
      .png()
      .toFile(png192Path);
    console.log('Successfully generated app/icon-192.png');

    // Also let's generate a 96x96 favicon for public/
    const publicPng96Path = path.join(__dirname, '../public/favicon-96x96.png');
    await sharp(svgPath)
      .resize(96, 96)
      .png()
      .toFile(publicPng96Path);
    console.log('Successfully generated public/favicon-96x96.png');

  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();
