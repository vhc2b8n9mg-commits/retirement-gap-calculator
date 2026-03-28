const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, 'public', 'backgrounds');

// 确保目录存在
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 创建渐变SVG
function createGradientSVG(width, height, stops, filename) {
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        ${stops.map(([offset, color]) => `<stop offset="${offset}%" stop-color="${color}"/>`).join('\n        ')}
      </linearGradient>
      <filter id="blur">
        <feGaussianBlur in="SourceGraphic" stdDeviation="80"/>
      </filter>
    </defs>
    <rect width="100%" height="100%" fill="url(#grad)"/>
    <circle cx="80%" cy="20%" r="300" fill="rgba(139, 92, 246, 0.3)" filter="url(#blur)"/>
    <circle cx="10%" cy="80%" r="250" fill="rgba(99, 102, 241, 0.25)" filter="url(#blur)"/>
  </svg>`;
  
  sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(outputDir, filename))
    .then(() => console.log(`Created: ${filename}`));
}

// 背景1: 神秘紫蓝渐变
createGradientSVG(1920, 1080, [
  ['0', '#0f0f1a'],
  ['50', '#1a1a2e'],
  ['100', '#16213e']
], 'bg-purple-mystery.png');

// 背景2: 宁静自然
createGradientSVG(1920, 1080, [
  ['0', '#0d1117'],
  ['40', '#161b22'],
  ['100', '#238636']
], 'bg-nature-calm.png');

// 背景3: 金色夕阳
createGradientSVG(1920, 1080, [
  ['0', '#1a0a20'],
  ['50', '#4a1942'],
  ['100', '#f59e0b']
], 'bg-sunset-golden.png');

// 背景4: 宁静海洋
createGradientSVG(1920, 1080, [
  ['0', '#0c1929'],
  ['50', '#1e3a5f'],
  ['100', '#0ea5e9']
], 'bg-ocean-serene.png');

// 背景5: 平和森林
createGradientSVG(1920, 1080, [
  ['0', '#022c22'],
  ['50', '#064e3b'],
  ['100', '#10b981']
], 'bg-forest-peace.png');

// 背景6: 山脉宁静
createGradientSVG(1920, 1080, [
  ['0', '#0f172a'],
  ['50', '#1e293b'],
  ['100', '#475569']
], 'bg-mountain-tranquil.png');

console.log('Generating backgrounds...');
