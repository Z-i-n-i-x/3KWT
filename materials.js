// ============================================================================
// STEALTH SUR-RON 72V 3000W — PBR MATERIALS & PROCEDURAL TEXTURE GENERATOR
// Full Matte Black Stealth RAL 9005 + Cordura 1000D Basketweave + FOXSID 32 +
// KENDA K-RAD Sidewall + ZOOM HB-890E + 20S7P Copper/Nickel Busbar Textures
// ============================================================================
import * as THREE from 'three';

/**
 * 1. Tileable 2D micro-grain noise texture for matte powder coat (RAL 9005)
 */
function createMicroGrainTexture(size = 512, contrast = 0.25) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const px = (i / 4) % size;
    const py = Math.floor((i / 4) / size);
    const n1 = Math.sin(px * 0.37 + py * 0.73) * 0.5 + 0.5;
    const n2 = Math.cos(px * 1.13 - py * 0.89) * 0.5 + 0.5;
    const rand = Math.random();
    const val = Math.floor(128 + ((n1 * 0.35 + n2 * 0.35 + rand * 0.3) - 0.5) * 255 * contrast);
    const clamped = Math.max(0, Math.min(255, val));
    data[i] = clamped;
    data[i + 1] = clamped;
    data[i + 2] = clamped;
    data[i + 3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(16, 16);
  return tex;
}

/**
 * 2. High-Definition Ballistic Nylon CORDURA 1000D 2x2 Basketweave Texture
 * Scaled for meter-space ExtrudeGeometry UVs (repeat = 26x26 per meter -> ~1.9mm yarn pitch)
 */
function createCorduraWeaveTextures(size = 512) {
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const cCtx = colorCanvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d');

  // Tactical dark charcoal nylon base in sRGB
  cCtx.fillStyle = '#101216';
  cCtx.fillRect(0, 0, size, size);

  bCtx.fillStyle = '#141414';
  bCtx.fillRect(0, 0, size, size);

  // 32x32 distinct 2x2 basketweave filament bundles per 512x512 tile
  const cell = 16;
  for (let y = 0; y < size; y += cell) {
    for (let x = 0; x < size; x += cell) {
      const isWarp = ((x / cell) + (y / cell)) % 2 === 0;
      const jitter = Math.floor(Math.sin(x * 0.17 + y * 0.31) * 6);

      if (isWarp) {
        // Vertical 1000D ballistic nylon dual-filament bundle
        const gradC = cCtx.createLinearGradient(x, y, x + cell, y);
        gradC.addColorStop(0.0, '#0d0f13');
        gradC.addColorStop(0.20, '#242933');
        gradC.addColorStop(0.46, '#384050');
        gradC.addColorStop(0.50, '#14171d'); // split groove between twin 1000D filaments
        gradC.addColorStop(0.54, '#384050');
        gradC.addColorStop(0.80, '#242933');
        gradC.addColorStop(1.0, '#0d0f13');
        cCtx.fillStyle = gradC;
        cCtx.fillRect(x + 1, y + 1, cell - 2, cell - 2);

        // Bump height profile
        const peak = Math.max(180, Math.min(252, 230 + jitter)).toString(16);
        const gradB = bCtx.createLinearGradient(x, y, x + cell, y);
        gradB.addColorStop(0.0, '#181818');
        gradB.addColorStop(0.40, `#${peak}${peak}${peak}`);
        gradB.addColorStop(0.50, '#555555');
        gradB.addColorStop(0.60, `#${peak}${peak}${peak}`);
        gradB.addColorStop(1.0, '#181818');
        bCtx.fillStyle = gradB;
        bCtx.fillRect(x + 1, y + 1, cell - 2, cell - 2);
      } else {
        // Horizontal 1000D ballistic nylon dual-filament bundle
        const gradC = cCtx.createLinearGradient(x, y, x, y + cell);
        gradC.addColorStop(0.0, '#0b0d11');
        gradC.addColorStop(0.20, '#1e222b');
        gradC.addColorStop(0.46, '#2f3643');
        gradC.addColorStop(0.50, '#111318');
        gradC.addColorStop(0.54, '#2f3643');
        gradC.addColorStop(0.80, '#1e222b');
        gradC.addColorStop(1.0, '#0b0d11');
        cCtx.fillStyle = gradC;
        cCtx.fillRect(x + 1, y + 1, cell - 2, cell - 2);

        const peak = Math.max(170, Math.min(242, 210 + jitter)).toString(16);
        const gradB = bCtx.createLinearGradient(x, y, x, y + cell);
        gradB.addColorStop(0.0, '#181818');
        gradB.addColorStop(0.40, `#${peak}${peak}${peak}`);
        gradB.addColorStop(0.50, '#505050');
        gradB.addColorStop(0.60, `#${peak}${peak}${peak}`);
        gradB.addColorStop(1.0, '#181818');
        bCtx.fillStyle = gradB;
        bCtx.fillRect(x + 1, y + 1, cell - 2, cell - 2);
      }
    }
  }

  const colorTex = new THREE.CanvasTexture(colorCanvas);
  colorTex.colorSpace = THREE.SRGBColorSpace;
  colorTex.wrapS = THREE.RepeatWrapping;
  colorTex.wrapT = THREE.RepeatWrapping;
  colorTex.repeat.set(38, 38);
  colorTex.anisotropy = 8;

  const bumpTex = new THREE.CanvasTexture(bumpCanvas);
  bumpTex.wrapS = THREE.RepeatWrapping;
  bumpTex.wrapT = THREE.RepeatWrapping;
  bumpTex.repeat.set(38, 38);
  bumpTex.anisotropy = 8;

  return { colorTex, bumpTex };
}

/**
 * 3. Radial brushed stainless steel texture for 180mm brake rotors
 */
function createRotorBrushedTexture(size = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#d0d5dd';
  ctx.fillRect(0, 0, size, size);

  const cx = size / 2;
  const cy = size / 2;
  for (let r = 40; r < size * 0.48; r += 1.5) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    const shade = 185 + Math.floor(Math.sin(r * 0.9) * 25 + (Math.random() - 0.5) * 20);
    ctx.strokeStyle = `rgb(${shade}, ${shade + 2}, ${shade + 5})`;
    ctx.lineWidth = 1.1;
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  return tex;
}

/**
 * 4. Anti-slip dimpled motorcycle vinyl texture for the 530mm Sur-Ron saddle
 */
function createMotoVinylBumpTexture(size = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#505050';
  ctx.fillRect(0, 0, size, size);

  const step = 10;
  for (let y = 0; y < size; y += step) {
    for (let x = 0; x < size; x += step) {
      const offsetX = (y / step) % 2 === 0 ? 0 : step / 2;
      ctx.beginPath();
      ctx.arc(x + offsetX, y, 2.8, 0, Math.PI * 2);
      ctx.fillStyle = '#d8d8d8';
      ctx.fill();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(22, 10);
  return tex;
}

/**
 * 5. Authentic FOXSID 32 / XSD / AIR FORK decal material matching Reference Photo #4
 */
export function createFoxsidDecalMaterial() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 1) Upper "32" stylized hollow-block holographic/silver decal (top of lower leg)
  ctx.save();
  ctx.translate(128, 210);
  ctx.font = '900 110px "JetBrains Mono", Impact, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeStyle = '#d8e4f0';
  ctx.lineWidth = 6;
  ctx.strokeText('32', 0, 0);
  ctx.fillStyle = 'rgba(130, 210, 230, 0.25)';
  ctx.fillText('32', 0, 0);
  ctx.restore();

  // 2) Middle "XSD" shield emblem (from FOXSID 32 reference photo)
  ctx.save();
  ctx.translate(128, 370);
  ctx.fillStyle = '#181a1f';
  ctx.strokeStyle = '#d8e0ea';
  ctx.lineWidth = 4;
  ctx.fillRect(-52, -26, 104, 52);
  ctx.strokeRect(-52, -26, 104, 52);
  ctx.fillStyle = '#f5b800';
  ctx.font = '900 32px "JetBrains Mono", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('XSD', 0, 2);
  ctx.restore();

  // 3) Lower vertical "FOXSID" + "AIR FORK" typography
  ctx.save();
  ctx.translate(128, 690);
  ctx.rotate(-Math.PI / 2);

  // Top dashed tech bar
  ctx.fillStyle = '#cfd8e3';
  ctx.fillRect(-230, -72, 460, 8);
  ctx.fillStyle = '#d92b2b';
  ctx.fillRect(-230, 62, 130, 8);

  ctx.font = '900 98px "JetBrains Mono", Impact, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#f4f7fb';
  ctx.fillText('FOXSID', 0, -6);

  ctx.font = '800 26px "JetBrains Mono", monospace';
  ctx.fillStyle = '#bfc8d6';
  ctx.fillText('AIR FORK // 32MM', 42, 66);
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 8;

  return new THREE.MeshPhysicalMaterial({
    map: tex,
    transparent: true,
    alphaTest: 0.06,
    roughness: 0.35,
    metalness: 0.3,
    clearcoat: 0.25
  });
}

/**
 * 6. Authentic KENDA Sidewall Tire Logo + Subtle Rim Decal Texture (Reference Photo #1 & #3)
 */
export function createKendaTireSidewallMaterial() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  const cx = 512;
  const cy = 512;

  ctx.clearRect(0, 0, 1024, 1024);

  // At 6 o'clock (angle = Math.PI / 2 in canvas coordinates): yellow "KENDA" + "K-RAD 26x2.35"
  const baseAngle = Math.PI / 2;
  const letters = ['K', 'E', 'N', 'D', 'A'];
  letters.forEach((ch, idx) => {
    const ang = baseAngle + (idx - 2) * 0.052;
    ctx.save();
    ctx.translate(cx + Math.cos(ang) * 474, cy + Math.sin(ang) * 474);
    ctx.rotate(ang - Math.PI / 2);
    ctx.font = 'italic 900 34px "JetBrains Mono", Impact, Arial, sans-serif';
    ctx.fillStyle = idx === 0 ? '#e62222' : '#f5c400';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ch, 0, 0);
    ctx.restore();
  });

  // Opposite side (12 o'clock): subtle molded "K-RAD K905 26x2.35" marking
  const topLetters = 'K-RAD 26x2.35'.split('');
  topLetters.forEach((ch, idx) => {
    const ang = -Math.PI / 2 + (idx - 6) * 0.032;
    ctx.save();
    ctx.translate(cx + Math.cos(ang) * 474, cy + Math.sin(ang) * 474);
    ctx.rotate(ang + Math.PI / 2);
    ctx.font = '700 20px "JetBrains Mono", sans-serif';
    ctx.fillStyle = 'rgba(210, 215, 220, 0.35)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ch, 0, 0);
    ctx.restore();
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 8;
  return new THREE.MeshPhysicalMaterial({
    map: tex,
    transparent: true,
    alphaTest: 0.05,
    roughness: 0.85,
    metalness: 0.05,
    side: THREE.DoubleSide
  });
}

/**
 * 7. Stealth Black MTX39 Rim Texture with subtle authentic valve/joint technical markings
 */
export function createMtx39DecalTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  const cx = 512;
  const cy = 512;

  // Deep stealth anodized matte black rim base (matching Reference Photo #1)
  ctx.fillStyle = '#0c0d0f';
  ctx.fillRect(0, 0, 1024, 1024);

  // Subtle dark-grey & red technical rim spec badges at 2 opposite points
  [0.2, Math.PI + 0.2].forEach((baseAngle) => {
    ctx.beginPath();
    ctx.arc(cx, cy, 496, baseAngle - 0.10, baseAngle - 0.03);
    ctx.strokeStyle = '#b81d33';
    ctx.lineWidth = 10;
    ctx.stroke();

    const letters = 'MTX39'.split('');
    letters.forEach((ch, idx) => {
      const ang = baseAngle + idx * 0.032;
      ctx.save();
      ctx.translate(cx + Math.cos(ang) * 496, cy + Math.sin(ang) * 496);
      ctx.rotate(ang + Math.PI / 2);
      ctx.font = '800 18px "JetBrains Mono", sans-serif';
      ctx.fillStyle = '#8b929e';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ch, 0, 0);
      ctx.restore();
    });
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 8;
  return tex;
}

/**
 * 8. Generates SW900 LCD Computer Screen texture
 */
export function createSw900ScreenTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 320;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#071018';
  ctx.fillRect(0, 0, 512, 320);

  ctx.strokeStyle = '#00d2ff';
  ctx.lineWidth = 4;
  ctx.strokeRect(12, 12, 488, 296);

  ctx.fillStyle = '#00ff66';
  ctx.font = '700 26px "JetBrains Mono", monospace';
  ctx.fillText('72V  |||||| 100%', 28, 52);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 110px "JetBrains Mono", monospace';
  ctx.fillText('00.0', 45, 185);
  ctx.font = '700 28px "JetBrains Mono", monospace';
  ctx.fillStyle = '#00d2ff';
  ctx.fillText('KM/H', 360, 175);

  ctx.fillStyle = '#ff5500';
  ctx.font = '800 34px "JetBrains Mono", monospace';
  ctx.fillText('PAS: 5   3000W PEAK', 28, 265);

  return new THREE.CanvasTexture(canvas);
}

/**
 * 9. Generates crisp 3D badge material for each of the 20 battery series sections (1S..20S)
 */
export function createBatterySeriesLabelMaterial(seriesId, polarityOnLeft) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  const isMainNeg = seriesId === 1;
  const isMainPos = seriesId === 20;

  ctx.fillStyle = isMainPos ? '#4a1208' : isMainNeg ? '#08223a' : '#10141c';
  ctx.fillRect(0, 0, 256, 64);

  ctx.strokeStyle = isMainPos ? '#ff3b1f' : isMainNeg ? '#00d2ff' : '#00ff66';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, 252, 60);

  const polStr = polarityOnLeft > 0 ? '(+)' : '(-)';
  const tag = isMainNeg ? '1S [B- 0V]' : isMainPos ? '20S [B+ 84V]' : `${seriesId}S ${polStr}`;

  ctx.font = '900 30px "JetBrains Mono", monospace';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(tag, 128, 33);

  const tex = new THREE.CanvasTexture(canvas);
  return new THREE.MeshBasicMaterial({
    map: tex,
    side: THREE.DoubleSide
  });
}

/**
 * Master dictionary of all required PBR Materials
 */
export function createStealthMaterials() {
  const microGrainTex = createMicroGrainTexture(512, 0.28);
  const { colorTex: corduraColorTex, bumpTex: corduraBumpTex } = createCorduraWeaveTextures(512);
  const rotorTex = createRotorBrushedTexture(512);
  const motoVinylTex = createMotoVinylBumpTexture(512);
  const mtxDecalTex = createMtx39DecalTexture();
  const sw900Tex = createSw900ScreenTexture();

  // 1. MAT_FRAME_RAL9005 (Frame, subframe, 6mm dropout armor plates)
  const MAT_FRAME_RAL9005 = new THREE.MeshPhysicalMaterial({
    name: 'MAT_FRAME_RAL9005',
    color: 0x121316,
    roughness: 0.84,
    metalness: 0.25,
    clearcoat: 0.04,
    bumpMap: microGrainTex,
    bumpScale: 0.0015,
    roughnessMap: microGrainTex
  });

  // 2. MAT_CORDURA_1000D (Tactical battery bag in frame triangle — true 1000D basketweave)
  const MAT_CORDURA_1000D = new THREE.MeshPhysicalMaterial({
    name: 'MAT_CORDURA_1000D',
    color: 0xffffff,
    map: corduraColorTex,
    roughness: 0.88,
    metalness: 0.03,
    bumpMap: corduraBumpTex,
    bumpScale: 0.0018,
    roughnessMap: corduraBumpTex,
    envMapIntensity: 0.45,
    sheen: 0.38,
    sheenRoughness: 0.75,
    sheenColor: new THREE.Color(0x323846),
    transparent: true,
    opacity: 1.0
  });

  // 3. MAT_ANODIZED_BLACK (Fork FOXSID-X2 stanchions, handlebar, stem, ZOOM calipers, motor covers)
  const MAT_ANODIZED_BLACK = new THREE.MeshPhysicalMaterial({
    name: 'MAT_ANODIZED_BLACK',
    color: 0x0b0c0e,
    roughness: 0.30,
    metalness: 0.88,
    clearcoat: 0.18,
    clearcoatRoughness: 0.28
  });

  // 4. MAT_RUBBER_KENDA (Tires Kenda K-Rad 26x2.35, handlebar grips)
  const MAT_RUBBER_KENDA = new THREE.MeshPhysicalMaterial({
    name: 'MAT_RUBBER_KENDA',
    color: 0x161719,
    roughness: 0.90,
    metalness: 0.04,
    bumpMap: microGrainTex,
    bumpScale: 0.0012
  });

  // 5. MAT_STEEL_ROTOR (180mm brake rotors, spokes, M4/M5/M6 fasteners)
  const MAT_STEEL_ROTOR = new THREE.MeshPhysicalMaterial({
    name: 'MAT_STEEL_ROTOR',
    color: 0xd2d7dc,
    roughness: 0.22,
    metalness: 0.95,
    map: rotorTex,
    bumpMap: rotorTex,
    bumpScale: 0.0008
  });

  // 6. MAT_MOTO_VINYL (Long Sur-Ron / Pitbike 530mm moto saddle)
  const MAT_MOTO_VINYL = new THREE.MeshPhysicalMaterial({
    name: 'MAT_MOTO_VINYL',
    color: 0x17181b,
    roughness: 0.78,
    metalness: 0.05,
    bumpMap: motoVinylTex,
    bumpScale: 0.0025
  });

  const MAT_VELCRO_STRAP = new THREE.MeshPhysicalMaterial({
    name: 'MAT_VELCRO_STRAP',
    color: 0x090a0c,
    roughness: 0.95,
    metalness: 0.02,
    bumpMap: corduraBumpTex,
    bumpScale: 0.003
  });

  const MAT_RED_ANODIZED = new THREE.MeshPhysicalMaterial({
    name: 'MAT_RED_ANODIZED',
    color: 0xd91929,
    roughness: 0.25,
    metalness: 0.88,
    clearcoat: 0.2
  });

  const MAT_BLUE_ANODIZED = new THREE.MeshPhysicalMaterial({
    name: 'MAT_BLUE_ANODIZED',
    color: 0x1868d9,
    roughness: 0.28,
    metalness: 0.85
  });

  const MAT_BRASS_NIPPLE = new THREE.MeshStandardMaterial({
    name: 'MAT_BRASS_NIPPLE',
    color: 0xb59449,
    roughness: 0.35,
    metalness: 0.9
  });

  const MAT_RIM_MTX39 = new THREE.MeshPhysicalMaterial({
    name: 'MAT_RIM_MTX39',
    color: 0xffffff,
    map: mtxDecalTex,
    roughness: 0.55,
    metalness: 0.45
  });

  const MAT_CELL_EVE50E = new THREE.MeshPhysicalMaterial({
    name: 'MAT_CELL_EVE50E',
    color: 0x3b82a6, // Authentic EVE INR21700-50E cyan-blue PVC wrap
    roughness: 0.28,
    metalness: 0.15,
    clearcoat: 0.35,
    transparent: true,
    opacity: 1.0
  });

  const MAT_WHITE_INSULATOR = new THREE.MeshStandardMaterial({
    name: 'MAT_WHITE_INSULATOR',
    color: 0xf4f6f8,
    roughness: 0.65,
    metalness: 0.05,
    side: THREE.DoubleSide
  });

  const MAT_NICKEL_STRIP = new THREE.MeshPhysicalMaterial({
    name: 'MAT_NICKEL_STRIP',
    color: 0xdbe2ea,
    roughness: 0.20,
    metalness: 0.96
  });

  const MAT_COPPER_BUSBAR = new THREE.MeshPhysicalMaterial({
    name: 'MAT_COPPER_BUSBAR',
    color: 0xe07a3c,
    roughness: 0.22,
    metalness: 0.95,
    clearcoat: 0.15
  });

  const MAT_PETG_HOLDER = new THREE.MeshPhysicalMaterial({
    name: 'MAT_PETG_HOLDER',
    color: 0x121316,
    roughness: 0.48,
    metalness: 0.08,
    bumpMap: microGrainTex,
    bumpScale: 0.001
  });

  const MAT_EVA_FOAM = new THREE.MeshStandardMaterial({
    name: 'MAT_EVA_FOAM',
    color: 0x151618,
    roughness: 0.95,
    metalness: 0.01
  });

  const MAT_PVC_SHRINK = new THREE.MeshPhysicalMaterial({
    name: 'MAT_PVC_SHRINK',
    color: 0x0d52b8,
    roughness: 0.22,
    metalness: 0.05,
    transmission: 0.55,
    transparent: true,
    opacity: 0.22,
    depthWrite: false
  });

  const MAT_SMOKE_LENS = new THREE.MeshPhysicalMaterial({
    name: 'MAT_SMOKE_LENS',
    color: 0x22262c,
    roughness: 0.08,
    metalness: 0.1,
    transmission: 0.78,
    transparent: true,
    opacity: 0.55
  });

  const MAT_HEADLIGHT_LED = new THREE.MeshStandardMaterial({
    name: 'MAT_HEADLIGHT_LED',
    color: 0xffffff,
    emissive: new THREE.Color(0xdbeeff),
    emissiveIntensity: 0.5,
    roughness: 0.15
  });

  const MAT_BRAKE_LED = new THREE.MeshStandardMaterial({
    name: 'MAT_BRAKE_LED',
    color: 0x880000,
    emissive: new THREE.Color(0xff0000),
    emissiveIntensity: 0.35,
    roughness: 0.2
  });

  const MAT_XT90_YELLOW = new THREE.MeshStandardMaterial({
    name: 'MAT_XT90_YELLOW',
    color: 0xf5b800,
    roughness: 0.35,
    metalness: 0.05
  });

  const MAT_SW900_SCREEN = new THREE.MeshBasicMaterial({
    name: 'MAT_SW900_SCREEN',
    map: sw900Tex
  });

  const MAT_FOXSID_DECAL = createFoxsidDecalMaterial();
  const MAT_KENDA_SIDEWALL = createKendaTireSidewallMaterial();

  return {
    MAT_FRAME_RAL9005,
    MAT_CORDURA_1000D,
    MAT_ANODIZED_BLACK,
    MAT_RUBBER_KENDA,
    MAT_STEEL_ROTOR,
    MAT_MOTO_VINYL,
    MAT_VELCRO_STRAP,
    MAT_RED_ANODIZED,
    MAT_BLUE_ANODIZED,
    MAT_BRASS_NIPPLE,
    MAT_RIM_MTX39,
    MAT_CELL_EVE50E,
    MAT_WHITE_INSULATOR,
    MAT_NICKEL_STRIP,
    MAT_COPPER_BUSBAR,
    MAT_PETG_HOLDER,
    MAT_EVA_FOAM,
    MAT_PVC_SHRINK,
    MAT_SMOKE_LENS,
    MAT_HEADLIGHT_LED,
    MAT_BRAKE_LED,
    MAT_XT90_YELLOW,
    MAT_SW900_SCREEN,
    MAT_FOXSID_DECAL,
    MAT_KENDA_SIDEWALL
  };
}
