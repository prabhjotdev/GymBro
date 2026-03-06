import sharp from 'sharp';
import { readFileSync } from 'fs';

const svg = readFileSync('./public/icon.svg');

const icons = [
  { output: './public/icon-192.png', size: 192 },
  { output: './public/icon-512.png', size: 512 },
  { output: './public/apple-touch-icon.png', size: 180 },
  { output: './public/favicon-32.png', size: 32 },
];

for (const { output, size } of icons) {
  await sharp(svg)
    .resize(size, size)
    .png()
    .toFile(output);
  console.log(`Generated ${output} (${size}x${size})`);
}

// Generate favicon.ico (32x32 PNG as .ico)
await sharp(svg)
  .resize(32, 32)
  .png()
  .toFile('./public/favicon.ico');
console.log('Generated public/favicon.ico (32x32)');
