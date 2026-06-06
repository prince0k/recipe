const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Define paths
const rootDir = path.resolve(__dirname, '..');
const svgPath = path.join(rootDir, 'public', 'logo.svg');
const publicDir = path.join(rootDir, 'public');
const assetsDir = path.join(publicDir, 'assets');
const appDir = path.join(rootDir, 'app');

// Ensure directories exist
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Custom ICO writer: packages a PNG buffer into a standard ICO file
function createIcoFromPng(pngBuffer) {
  const header = Buffer.alloc(22);
  
  // Header
  header.writeUInt16LE(0, 0);     // Reserved
  header.writeUInt16LE(1, 2);     // Type (1 = ICO)
  header.writeUInt16LE(1, 4);     // Count (1 image)
  
  // Directory Entry
  header.writeUInt8(32, 6);       // Width (32)
  header.writeUInt8(32, 7);       // Height (32)
  header.writeUInt8(0, 8);        // Color count (0)
  header.writeUInt8(0, 9);        // Reserved
  header.writeUInt16LE(1, 10);    // Color planes (1)
  header.writeUInt16LE(32, 12);   // Bits per pixel (32)
  header.writeUInt32LE(pngBuffer.length, 14); // Image size
  header.writeUInt32LE(22, 18);   // Image offset (22 bytes header)
  
  return Buffer.concat([header, pngBuffer]);
}

async function main() {
  console.log('Generating images from logo.svg...');

  try {
    // 1. Generate public/assets/logo.png (512x512)
    const logoPngBuffer = await sharp(svgPath)
      .resize(512, 512)
      .png()
      .toBuffer();
    fs.writeFileSync(path.join(assetsDir, 'logo.png'), logoPngBuffer);
    console.log('✔ Created public/assets/logo.png (512x512)');

    // 2. Generate app/apple-icon.png (180x180) for Apple Devices
    const appleIconBuffer = await sharp(svgPath)
      .resize(180, 180)
      .png()
      .toBuffer();
    fs.writeFileSync(path.join(appDir, 'apple-icon.png'), appleIconBuffer);
    console.log('✔ Created app/apple-icon.png (180x180)');

    // 3. Generate favicon-32x32.png
    const fav32Buffer = await sharp(svgPath)
      .resize(32, 32)
      .png()
      .toBuffer();
    fs.writeFileSync(path.join(publicDir, 'favicon-32x32.png'), fav32Buffer);
    console.log('✔ Created public/favicon-32x32.png');

    // 4. Generate favicon-16x16.png
    const fav16Buffer = await sharp(svgPath)
      .resize(16, 16)
      .png()
      .toBuffer();
    fs.writeFileSync(path.join(publicDir, 'favicon-16x16.png'), fav16Buffer);
    console.log('✔ Created public/favicon-16x16.png');

    // 5. Generate legacy favicon.ico (in app/ and public/)
    const icoBuffer = createIcoFromPng(fav32Buffer);
    fs.writeFileSync(path.join(appDir, 'favicon.ico'), icoBuffer);
    fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
    console.log('✔ Created favicon.ico in both app/ and public/');

    console.log('🎉 Logo assets generated successfully!');
  } catch (error) {
    console.error('❌ Error generating assets:', error);
    process.exit(1);
  }
}

main();
