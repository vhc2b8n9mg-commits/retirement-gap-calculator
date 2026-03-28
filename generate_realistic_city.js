const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, 'public', 'backgrounds');

// 创建写实城市晚景SVG
function createRealisticCitySVG(width, height, colors, filename, variant = 'evening') {
  // 窗户灯光
  let windows = '';
  for (let i = 0; i < 200; i++) {
    const x = Math.floor(Math.random() * 1800) + 60;
    const y = Math.floor(Math.random() * 600) + 200;
    const w = Math.random() > 0.8 ? 12 : 6;
    const h = Math.random() > 0.8 ? 16 : 8;
    const lit = Math.random() > 0.3;
    if (lit) {
      const warm = Math.random() > 0.5;
      const windowColor = warm ? '#fcd34d' : '#fef3c7';
      windows += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${windowColor}" opacity="${0.6 + Math.random() * 0.4}"/>`;
    }
  }

  // 建筑剪影
  const buildings = `
    <!-- 远处建筑群 -->
    <path d="M0,${height} L0,${height-350} L50,${height-350} L50,${height-400} L100,${height-400} L100,${height-320} L150,${height-320} L150,${height-450} L220,${height-450} L220,${height-380} L280,${height-380} L280,${height-480} L350,${height-480} L350,${height-360} L400,${height-360} L400,${height-420} L480,${height-420} L480,${height-350} L540,${height-350} L540,${height-500} L620,${height-500} L620,${height-400} L700,${height-400} L700,${height-460} L780,${height-460} L780,${height-340} L850,${height-340} L850,${height-520} L940,${height-520} L940,${height-420} L1020,${height-420} L1020,${height-380} L1100,${height-380} L1100,${height-480} L1180,${height-480} L1180,${height-360} L1250,${height-360} L1250,${height-440} L1340,${height-440} L1340,${height-400} L1420,${height-400} L1420,${height-480} L1500,${height-480} L1500,${height-350} L1560,${height-350} L1560,${height-420} L1640,${height-420} L1640,${height-380} L1720,${height-380} L1720,${height-450} L1800,${height-450} L1800,${height-400} L1860,${height-400} L1860,${height-350} L${width},${height-350} L${width},${height} Z" fill="${colors.buildings}" opacity="0.8"/>
    
    <!-- 中景建筑 -->
    <path d="M0,${height} L0,${height-280} L80,${height-280} L80,${height-350} L160,${height-350} L160,${height-300} L240,${height-300} L240,${height-400} L320,${height-400} L320,${height-320} L400,${height-320} L400,${height-280} L480,${height-280} L480,${height-380} L560,${height-380} L560,${height-300} L640,${height-300} L640,${height-350} L720,${height-350} L720,${height-280} L800,${height-280} L800,${height-400} L880,${height-400} L880,${height-320} L960,${height-320} L960,${height-380} L1040,${height-380} L1040,${height-300} L1120,${height-300} L1120,${height-420} L1200,${height-420} L1200,${height-340} L1280,${height-340} L1280,${height-280} L1360,${height-280} L1360,${height-380} L1440,${height-380} L1440,${height-320} L1520,${height-320} L1520,${height-400} L1600,${height-400} L1600,${height-300} L1680,${height-300} L1680,${height-350} L1760,${height-350} L1760,${height-280} L1840,${height-280} L1840,${height-320} L${width},${height-320} L${width},${height} Z" fill="${colors.buildings}" opacity="0.95"/>
    
    <!-- 地面/水面反射 -->
    <rect x="0" y="${height-100}" width="${width}" height="100" fill="${colors.ground}" opacity="0.3"/>
  `;

  // 夕阳/晚霞
  let skyEffect = '';
  if (variant === 'sunset') {
    skyEffect = `
      <circle cx="${width * 0.75}" cy="${height * 0.35}" r="120" fill="${colors.sun}" opacity="0.6"/>
      <circle cx="${width * 0.75}" cy="${height * 0.35}" r="80" fill="${colors.sun}" opacity="0.9"/>
      <!-- 晚霞光晕 -->
      <ellipse cx="${width * 0.75}" cy="${height * 0.35}" rx="300" ry="150" fill="${colors.sun}" opacity="0.15"/>
    `;
  } else if (variant === 'neon') {
    skyEffect = `
      <!-- 霓虹灯光 -->
      <rect x="200" y="100" width="80" height="5" fill="#ef4444" opacity="0.4"/>
      <rect x="400" y="150" width="60" height="5" fill="#22c55e" opacity="0.3"/>
      <rect x="800" y="80" width="100" height="5" fill="#3b82f6" opacity="0.4"/>
      <rect x="1200" y="120" width="70" height="5" fill="#f59e0b" opacity="0.3"/>
    `;
  } else if (variant === 'blue') {
    skyEffect = `
      <!-- 蓝色时刻 -->
      <circle cx="${width * 0.8}" cy="${height * 0.3}" r="60" fill="#fef3c7" opacity="0.5"/>
      <circle cx="${width * 0.8}" cy="${height * 0.3}" r="40" fill="#fef9c3" opacity="0.7"/>
    `;
  }

  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
        ${colors.sky.map(([offset, color]) => `<stop offset="${offset}%" stop-color="${color}"/>`).join('\n        ')}
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <rect width="100%" height="100%" fill="url(#sky)"/>
    ${skyEffect}
    ${buildings}
    ${windows}
  </svg>`;
  
  sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(outputDir, filename))
    .then(() => console.log(`Created: ${filename}`));
}

console.log('Generating realistic city evening backgrounds...');

// 1. 夕阳晚霞
createRealisticCitySVG(1920, 1080, {
  sky: [['0', '#1a0a2e'], ['30', '#4a1942'], ['60', '#7c2d4a'], ['100', '#f59e0b']],
  buildings: '#0a0a15',
  sun: '#fcd34d',
  ground: '#fcd34d'
}, 'step5-city-sunset.png', 'sunset');

// 2. 霓虹夜色
createRealisticCitySVG(1920, 1080, {
  sky: [['0', '#0c1445'], ['40', '#1e1b4b'], ['70', '#312e81'], ['100', '#1e3a5f']],
  buildings: '#050510',
  sun: '#6366f1',
  ground: '#6366f1'
}, 'step5-city-neon.png', 'neon');

// 3. 蓝色时刻
createRealisticCitySVG(1920, 1080, {
  sky: [['0', '#0f172a'], ['30', '#1e3a5f'], ['60', '#0c4a6e'], ['100', '#164e63']],
  buildings: '#0a1520',
  sun: '#fef3c7',
  ground: '#22d3ee'
}, 'step5-city-bluehour.png', 'blue');

// 4. 金色黄昏
createRealisticCitySVG(1920, 1080, {
  sky: [['0', '#1c1917'], ['40', '#422006'], ['70', '#92400e'], ['100', '#f59e0b']],
  buildings: '#0c0a08',
  sun: '#fcd34d',
  ground: '#fbbf24'
}, 'step5-city-golden.png', 'sunset');

console.log('\nBackgrounds generated!');
