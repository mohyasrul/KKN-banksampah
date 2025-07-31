import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a simple green icon with "BS" text for Bank Sampah
const createIcon = async (size, outputPath) => {
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#22c55e;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#16a34a;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.2}"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.35}" 
            font-weight="bold" text-anchor="middle" dy="0.35em" fill="white">BS</text>
    </svg>
  `;
  
  await sharp(Buffer.from(svg))
    .png()
    .toFile(outputPath);
};

const generateIcons = async () => {
  const publicDir = path.join(__dirname, '../public');
  
  // Ensure public directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  try {
    // Generate icons
    await createIcon(192, path.join(publicDir, 'pwa-192x192.png'));
    await createIcon(512, path.join(publicDir, 'pwa-512x512.png'));
    await createIcon(180, path.join(publicDir, 'apple-touch-icon.png'));
    
    console.log('✅ PWA icons generated successfully!');
  } catch (error) {
    console.error('❌ Error generating icons:', error);
  }
};

generateIcons();
