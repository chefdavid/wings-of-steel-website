import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateIcons() {
  const logoPath = path.join(__dirname, '../public/assets/wings-logo.webp');
  const outputDir = path.join(__dirname, '../public/icons');
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Icon sizes for PWA
  const sizes = [192, 512];
  
  for (const size of sizes) {
    await sharp(logoPath)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 26, g: 31, b: 46, alpha: 1 } // #1a1f2e background
      })
      .toFile(path.join(outputDir, `icon-${size}x${size}.webp`));
    
    console.log(`Generated ${size}x${size} icon`);
  }
  
  console.log('All icons generated successfully!');
}

generateIcons().catch(console.error);