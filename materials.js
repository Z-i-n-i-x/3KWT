// ============================================================================
// STEALTH SUR-RON 72V 3000W — PBR MATERIALS & PROCEDURAL TEXTURE GENERATOR
// Full Matte Black Stealth RAL 9005 + Cordura 1000D + Anodized CNC + Decals
// ============================================================================
import * as THREE from 'three';

/**
 * Generates a tileable 2D value/Perlin micro-grain noise texture for powder coat
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
    // Multi-frequency deterministic pseudo-perlin micro-grain
    const n1 = Math.sin(px * 0.37 + py * 0.73) * 0.5 + 0.5;
    const n2 = Math.cos(px * 1.13 - py * 0.89) * 0.5 + 0.5;
    const rand = Math.random();
    const val = Math.floor((128 + ((n1 * 0.35 + n2 * 0.35 + rand * 0.3) - 0.5) * 255 * contrast));
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
 * Generates ballistic nylon Cordura 1000D PU weave + stitching texture
 */
function createCorduraWeaveTexture(size = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#141416';
  ctx.fillRect(0, 0, size, size);

  const step = 4;
  for (let y = 0; y < size; y += step) {
    for (let x = 0; x < size; x += step) {
      const isWarp = ((x / step) + (y / step)) % 2 === 0;
      const shade = isWarp ? 36 + Math.floor(Math.random() * 14) : 18 + Math.floor(Math.random() * 10);
      ctx.fillStyle = `rgb(${shade},${shade},${shade + 2})`;
      ctx.fillRect(x, y, step - 0.5, step - 0.5);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(24, 24);
  return tex;
}

/**
 * Generates radial brushed steel texture with brake pad friction tracks for 180mm rotors
 */
function createRotorBrushedTexture(size = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const cx = size / 2;
  const cy = size / 2;

  ctx.fillStyle = '#c8cdd2';
  ctx.fillRect(0, 0, size, size);

  // Concentric friction grooves from sintered pads
  for (let r = 40; r < size * 0.49; r += 1.2) {
    const shade = 185 + Math.floor(Math.sin(r * 0.9) * 28 + (Math.random() - 0.5) * 25);
    ctx.strokeStyle = `rgb(${shade},${shade + 2},${shade + 5})`;
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

/**
 * Generates anti-slip dimpled moto-vinyl bump texture for Sur-Ron / Pitbike seat
 */
function createMotoVinylBumpTexture(size = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#404040';
  ctx.fillRect(0, 0, size, size);

  const spacing = 8;
  for (let y = 0; y < size; y += spacing) {
    const offset = (Math.floor(y / spacing) % 2) * (spacing / 2);
    for (let x = 0; x < size; x += spacing) {
      ctx.fillStyle = '#d8d8d8';
      ctx.beginPath();
      ctx.arc(x + offset, y, 2.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(18, 8);
  return tex;
}

/**
 * Generates high-resolution vertical FOXSID decal texture for fork lowers
 */
export function createFoxsidDecalMaterial() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(128, 512);
  ctx.rotate(-Math.PI / 2);

  // Subtle grey & red technical accent stripes
  ctx.fillStyle = '#383d47';
  ctx.fillRect(-310, -76, 620, 8);
  ctx.fillStyle = '#d92b2b';
  ctx.fillRect(-310, 62, 165, 8);

  // Crisp white FOXSID vertical typography
  ctx.font = '900 112px "JetBrains Mono", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#f5f7fa';
  ctx.fillText('FOXSID', 0, -4);

  ctx.font = '700 24px "JetBrains Mono", monospace';
  ctx.fillStyle = '#c4cbd6';
  ctx.fillText('AIR EVOLUTION // X2 32MM', 55, 70);
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 8;

  return new THREE.MeshPhysicalMaterial({
    map: tex,
    transparent: true,
    alphaTest: 0.08,
    roughness: 0.42,
    metalness: 0.25,
    clearcoat: 0.2
  });
}

/**
 * Generates MTX39 circular polar rim arc decal texture matching RingGeometry planar UVs
 */
export function createMtx39DecalTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  const cx = 512;
  const cy = 512;

  // Deep matte black rim base
  ctx.fillStyle = '#0c0c0e';
  ctx.fillRect(0, 0, 1024, 1024);

  // Draw 3 authentic SunRingle MTX39 arc decals around the rim circumference
  const decalAngles = [0.25, 2.35, 4.45];
  decalAngles.forEach((baseAngle) => {
    // Red/magenta racing arc
    ctx.beginPath();
    ctx.arc(cx, cy, 496, baseAngle - 0.26, baseAngle - 0.08);
    ctx.strokeStyle = '#d91642';
    ctx.lineWidth = 22;
    ctx.stroke();

    // Yellow accent tick
    ctx.beginPath();
    ctx.arc(cx, cy, 496, baseAngle - 0.07, baseAngle - 0.03);
    ctx.strokeStyle = '#f5b800';
    ctx.lineWidth = 22;
    ctx.stroke();

    // White MTX39 lettering along arc
    const letters = ['M', 'T', 'X', '3', '9'];
    letters.forEach((ch, idx) => {
      const ang = baseAngle + 0.02 + idx * 0.048;
      ctx.save();
      ctx.translate(cx + Math.cos(ang) * 496, cy + Math.sin(ang) * 496);
      ctx.rotate(ang + Math.PI / 2);
      ctx.font = '900 26px "JetBrains Mono", Impact, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ch, 0, 0);
      ctx.restore();
    });

    // Red tail stripe
    ctx.beginPath();
    ctx.arc(cx, cy, 496, baseAngle + 0.27, baseAngle + 0.38);
    ctx.strokeStyle = '#d91642';
    ctx.lineWidth = 18;
    ctx.stroke();
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 8;
  return tex;
}

/**
 * Generates SW900 LCD Computer Screen texture
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
 * Master dictionary of all required PBR Materials
 */
export function createStealthMaterials() {
  const microGrainTex = createMicroGrainTexture(512, 0.28);
  const corduraTex = createCorduraWeaveTexture(512);
  const rotorTex = createRotorBrushedTexture(512);
  const motoVinylTex = createMotoVinylBumpTexture(512);
  const mtxDecalTex = createMtx39DecalTexture();
  const sw900Tex = createSw900ScreenTexture();

  // 1. MAT_FRAME_RAL9005 (Frame, subframe, 6mm dropout armor plates)
  const MAT_FRAME_RAL9005 = new THREE.MeshPhysicalMaterial({
    name: 'MAT_FRAME_RAL9005',
    color: 0x111111,
    roughness: 0.88,
    metalness: 0.25,
    clearcoat: 0.02,
    roughnessMap: microGrainTex,
    bumpMap: microGrainTex,
    bumpScale: 0.0012
  });

  // 2. MAT_CORDURA_1000D (Tactical battery bag in frame triangle)
  const MAT_CORDURA_1000D = new THREE.MeshPhysicalMaterial({
    name: 'MAT_CORDURA_1000D',
    color: 0x0d0d0e,
    roughness: 0.95,
    metalness: 0.02,
    bumpMap: corduraTex,
    bumpScale: 0.0022,
    roughnessMap: corduraTex,
    transparent: true,
    opacity: 1.0
  });

  // 3. MAT_ANODIZED_BLACK (Fork stanchions, bars, stem, ZOOM calipers, motor covers)
  const MAT_ANODIZED_BLACK = new THREE.MeshPhysicalMaterial({
    name: 'MAT_ANODIZED_BLACK',
    color: 0x0a0a0c,
    roughness: 0.32,
    metalness: 0.88,
    clearcoat: 0.12
  });

  // 4. MAT_RUBBER_KENDA (Kenda 26x2.35 tires, grips)
  const MAT_RUBBER_KENDA = new THREE.MeshPhysicalMaterial({
    name: 'MAT_RUBBER_KENDA',
    color: 0x151516,
    roughness: 0.92,
    metalness: 0.05,
    bumpMap: microGrainTex,
    bumpScale: 0.0015
  });

  // 5. MAT_STEEL_ROTOR (180mm brake rotors, spokes, bolts, M14 axle)
  const MAT_STEEL_ROTOR = new THREE.MeshPhysicalMaterial({
    name: 'MAT_STEEL_ROTOR',
    color: 0xcfd4d8,
    roughness: 0.22,
    metalness: 0.95,
    map: rotorTex,
    roughnessMap: rotorTex
  });

  // 6. MAT_MOTO_VINYL (Long Sur-Ron / Pitbike saddle)
  const MAT_MOTO_VINYL = new THREE.MeshPhysicalMaterial({
    name: 'MAT_MOTO_VINYL',
    color: 0x161618,
    roughness: 0.82,
    metalness: 0.04,
    bumpMap: motoVinylTex,
    bumpScale: 0.002
  });

  // Supporting specialty materials
  const MAT_VELCRO_STRAP = new THREE.MeshPhysicalMaterial({
    name: 'MAT_VELCRO_STRAP',
    color: 0x09090a,
    roughness: 0.96,
    metalness: 0.02
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
    roughness: 0.65,
    metalness: 0.45
  });

  const MAT_CELL_EVE50E = new THREE.MeshPhysicalMaterial({
    name: 'MAT_CELL_EVE50E',
    color: 0x4b87a8, // Factory grey-blue EVE INR21700-50E wrap
    roughness: 0.35,
    metalness: 0.15,
    clearcoat: 0.3,
    transparent: true,
    opacity: 1.0
  });

  const MAT_WHITE_INSULATOR = new THREE.MeshStandardMaterial({
    name: 'MAT_WHITE_INSULATOR',
    color: 0xf0f2f5,
    roughness: 0.7,
    metalness: 0.05
  });

  const MAT_NICKEL_STRIP = new THREE.MeshPhysicalMaterial({
    name: 'MAT_NICKEL_STRIP',
    color: 0xd8dee6,
    roughness: 0.18,
    metalness: 0.96
  });

  const MAT_COPPER_BUSBAR = new THREE.MeshPhysicalMaterial({
    name: 'MAT_COPPER_BUSBAR',
    color: 0xd97f45,
    roughness: 0.22,
    metalness: 0.95
  });

  const MAT_PETG_HOLDER = new THREE.MeshPhysicalMaterial({
    name: 'MAT_PETG_HOLDER',
    color: 0x101114,
    roughness: 0.55,
    metalness: 0.08,
    clearcoat: 0.15
  });

  const MAT_EVA_FOAM = new THREE.MeshStandardMaterial({
    name: 'MAT_EVA_FOAM',
    color: 0x17181b,
    roughness: 0.96,
    metalness: 0.01,
    transparent: true,
    opacity: 0.92
  });

  const MAT_PVC_SHRINK = new THREE.MeshPhysicalMaterial({
    name: 'MAT_PVC_SHRINK',
    color: 0x0b3c78,
    roughness: 0.2,
    metalness: 0.05,
    transmission: 0.55,
    transparent: true,
    opacity: 0.32
  });

  const MAT_XT90_YELLOW = new THREE.MeshStandardMaterial({
    name: 'MAT_XT90_YELLOW',
    color: 0xf2b705,
    roughness: 0.4,
    metalness: 0.05
  });

  const MAT_HEADLIGHT_SMOKE = new THREE.MeshPhysicalMaterial({
    name: 'MAT_HEADLIGHT_SMOKE',
    color: 0x22262b,
    roughness: 0.1,
    metalness: 0.1,
    transmission: 0.75,
    transparent: true,
    opacity: 0.65
  });

  const MAT_LED_HEADLIGHT = new THREE.MeshStandardMaterial({
    name: 'MAT_LED_HEADLIGHT',
    color: 0xffffff,
    emissive: 0xd8f0ff,
    emissiveIntensity: 0.4
  });

  const MAT_BRAKE_LED = new THREE.MeshStandardMaterial({
    name: 'MAT_BRAKE_LED',
    color: 0x550000,
    emissive: 0xff0000,
    emissiveIntensity: 0.35
  });

  const MAT_SW900_SCREEN = new THREE.MeshBasicMaterial({
    name: 'MAT_SW900_SCREEN',
    map: sw900Tex
  });

  const MAT_FOIL_SILVER = new THREE.MeshStandardMaterial({
    name: 'MAT_FOIL_SILVER',
    color: 0xe6ebf0,
    roughness: 0.15,
    metalness: 0.95
  });

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
    MAT_XT90_YELLOW,
    MAT_HEADLIGHT_SMOKE,
    MAT_LED_HEADLIGHT,
    MAT_BRAKE_LED,
    MAT_SW900_SCREEN,
    MAT_FOIL_SILVER,
    MAT_FOXSID_DECAL: createFoxsidDecalMaterial()
  };
}
