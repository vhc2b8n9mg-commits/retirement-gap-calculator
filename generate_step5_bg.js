const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, 'public', 'backgrounds');

// 确保目录存在
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 创建带城市天际线的背景
function createCityscapeSVG(width, height, colors, filename, style = 'city') {
  let cityscape = '';
  
  if (style === 'sunset') {
    // 夕阳下的城市天际线
    cityscape = `
      <!-- 太阳 -->
      <circle cx="75%" cy="35%" r="80" fill="${colors.accent}" opacity="0.6"/>
      <circle cx="75%" cy="35%" r="60" fill="${colors.accent}" opacity="0.8"/>
      
      <!-- 远景建筑群 -->
      <path d="M0,${height} L0,${height-180} L40,${height-180} L40,${height-250} L80,${height-250} L80,${height-200} L120,${height-200} L120,${height-300} L180,${height-300} L180,${height-220} L220,${height-220} L220,${height-280} L280,${height-280} L280,${height-350} L340,${height-350} L340,${height-260} L400,${height-260} L400,${height-320} L460,${height-320} L460,${height-240} L520,${height-240} L520,${height-380} L600,${height-380} L600,${height-300} L680,${height-300} L680,${height-420} L760,${height-420} L760,${height-340} L840,${height-340} L840,${height-280} L900,${height-280} L900,${height-360} L960,${height-360} L960,${height-300} L1020,${height-300} L1020,${height-400} L1080,${height-400} L1080,${height-320} L1140,${height-320} L1140,${height-260} L1200,${height-260} L1200,${height-340} L1260,${height-340} L1260,${height-280} L1320,${height-280} L1320,${height-220} L1380,${height-220} L1380,${height-180} L1440,${height-180} L1440,${height} Z" fill="${colors.secondary}" opacity="0.5"/>
      
      <!-- 中景建筑群 -->
      <path d="M0,${height} L0,${height-120} L60,${height-120} L60,${height-200} L100,${height-200} L100,${height-160} L160,${height-160} L160,${height-280} L240,${height-280} L240,${height-180} L300,${height-180} L300,${height-260} L380,${height-260} L380,${height-140} L440,${height-140} L440,${height-220} L520,${height-220} L520,${height-320} L600,${height-320} L600,${height-200} L680,${height-200} L680,${height-300} L760,${height-300} L760,${height-240} L840,${height-240} L840,${height-180} L920,${height-180} L920,${height-280} L1000,${height-280} L1000,${height-200} L1080,${height-200} L1080,${height-260} L1160,${height-260} L1160,${height-160} L1240,${height-160} L1240,${height-240} L1320,${height-240} L1320,${height-180} L1400,${height-180} L1400,${height-140} L1480,${height-140} L1480,${height} Z" fill="${colors.secondary}" opacity="0.7"/>
      
      <!-- 近景建筑群 -->
      <path d="M0,${height} L0,${height-80} L80,${height-80} L80,${height-150} L140,${height-150} L140,${height-100} L200,${height-100} L200,${height-180} L280,${height-180} L280,${height-120} L360,${height-120} L360,${height-200} L440,${height-200} L440,${height-140} L520,${height-140} L520,${height-220} L600,${height-220} L600,${height-100} L680,${height-100} L680,${height-160} L760,${height-160} L760,${height-200} L840,${height-200} L840,${height-120} L920,${height-120} L920,${height-180} L1000,${height-180} L1000,${height-80} L1080,${height-80} L1080,${height-140} L1160,${height-140} L1160,${height-100} L1240,${height-100} L1240,${height-160} L1320,${height-160} L1320,${height-100} L1400,${height-100} L1400,${height-80} L1480,${height-80} L1480,${height} Z" fill="${colors.secondary}" opacity="0.9"/>
    `;
  } else if (style === 'village') {
    // 宁静乡村
    cityscape = `
      <!-- 远山 -->
      <path d="M0,${height} L0,${height-300} Q200,${height-450} 400,${height-280} Q600,${height-500} 800,${height-320} Q1000,${height-480} 1200,${height-300} Q1400,${height-420} ${width},${height-280} L${width},${height} Z" fill="${colors.secondary}" opacity="0.4"/>
      <path d="M0,${height} L0,${height-250} Q150,${height-380} 300,${height-240} Q500,${height-350} 700,${height-220} Q900,${height-340} 1100,${height-200} Q1300,${height-300} ${width},${height-200} L${width},${height} Z" fill="${colors.secondary}" opacity="0.6"/>
      
      <!-- 树木 -->
      <g opacity="0.5">
        <ellipse cx="100" cy="${height-180}" rx="40" ry="60" fill="${colors.secondary}"/>
        <rect x="95" y="${height-120}" width="10" height="30" fill="${colors.secondary}"/>
        <ellipse cx="300" cy="${height-200}" rx="50" ry="70" fill="${colors.secondary}"/>
        <rect x="293" y="${height-130}" width="14" height="40" fill="${colors.secondary}"/>
        <ellipse cx="600" cy="${height-170}" rx="35" ry="55" fill="${colors.secondary}"/>
        <rect x="595" y="${height-115}" width="10" height="25" fill="${colors.secondary}"/>
        <ellipse cx="1000" cy="${height-190}" rx="45" ry="65" fill="${colors.secondary}"/>
        <rect x="993" y="${height-125}" width="14" height="35" fill="${colors.secondary}"/>
      </g>
      
      <!-- 房屋 -->
      <g opacity="0.6">
        <rect x="150" y="${height-100}" width="60" height="50" fill="${colors.secondary}"/>
        <polygon points="130,${height-100} 180,${height-140} 230,${height-100}" fill="${colors.secondary}"/>
        <rect x="400" y="${height-120}" width="80" height="70" fill="${colors.secondary}"/>
        <polygon points="370,${height-120} 440,${height-180} 510,${height-120}" fill="${colors.secondary}"/>
        <rect x="800" y="${height-90}" width="50" height="40" fill="${colors.secondary}"/>
        <polygon points="785,${height-90} 825,${height-125} 865,${height-90}" fill="${colors.secondary}"/>
      </g>
    `;
  } else if (style === 'journey') {
    // 人生旅程主题 - 道路延伸
    cityscape = `
      <!-- 道路 -->
      <path d="M${width/2},${height} L${width/2-100},${height-200} L${width/2+100},${height-200} Z" fill="${colors.secondary}" opacity="0.3"/>
      <path d="M${width/2},${height-200} L${width/2-60},${height-400} L${width/2+60},${height-400} Z" fill="${colors.secondary}" opacity="0.4"/>
      <path d="M${width/2},${height-400} L${width/2-30},${height-550} L${width/2+30},${height-550} Z" fill="${colors.secondary}" opacity="0.5"/>
      
      <!-- 里程碑 -->
      <circle cx="${width/2}" cy="${height-100}" r="8" fill="${colors.accent}" opacity="0.7"/>
      <circle cx="${width/2}" cy="${height-250}" r="6" fill="${colors.accent}" opacity="0.6"/>
      <circle cx="${width/2}" cy="${height-450}" r="5" fill="${colors.accent}" opacity="0.5"/>
      <circle cx="${width/2}" cy="${height-600}" r="4" fill="${colors.accent}" opacity="0.4"/>
      
      <!-- 太阳/终点 -->
      <circle cx="${width/2}" cy="${height-750}" r="60" fill="${colors.accent}" opacity="0.6"/>
      <circle cx="${width/2}" cy="${height-750}" r="40" fill="${colors.accent}" opacity="0.8"/>
    `;
  }

  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        ${colors.stops.map(([offset, color]) => `<stop offset="${offset}%" stop-color="${color}"/>`).join('\n        ')}
      </linearGradient>
      <filter id="blur">
        <feGaussianBlur in="SourceGraphic" stdDeviation="60"/>
      </filter>
      <filter id="glow">
        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <rect width="100%" height="100%" fill="url(#grad)"/>
    ${cityscape}
  </svg>`;
  
  sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(outputDir, filename))
    .then(() => console.log(`Created: ${filename}`));
}

// 生成步骤5的背景图
console.log('Generating step 5 backgrounds...');

// 1. 夕阳城市
createCityscapeSVG(1920, 1080, {
  stops: [['0', '#1a0a2e'], ['50', '#4a1942'], ['100', '#f59e0b']],
  secondary: '#1a0a2e',
  accent: '#fcd34d'
}, 'step5-sunset-city.png', 'sunset');

// 2. 宁静乡村
createCityscapeSVG(1920, 1080, {
  stops: [['0', '#064e3b'], ['50', '#065f46'], ['100', '#10b981']],
  secondary: '#022c22',
  accent: '#34d399'
}, 'step5-peaceful-village.png', 'village');

// 3. 人生旅程
createCityscapeSVG(1920, 1080, {
  stops: [['0', '#1e1b4b'], ['50', '#312e81'], ['100', '#6366f1']],
  secondary: '#312e81',
  accent: '#a5b4fc'
}, 'step5-life-journey.png', 'journey');

// 复制您的参考图作为对比基准
console.log('\nBackgrounds generated successfully!');
console.log('Location:', outputDir);
