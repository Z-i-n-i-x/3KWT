// ============================================================================
// STEALTH SUR-RON 72V 3000W — MAIN THREE.JS WEBGL STUDIO SCENE, EXPLODED VIEW
// KINEMATICS (GSAP power3.out + LineDashedMaterial), X-RAY 20S7P RAYCASTER,
// VOLUMETRIC SUR-RON HEADLIGHT CONES & INTERACTIVE HOTSPOTS
// ============================================================================
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import gsap from 'gsap';

import { createStealthMaterials, getSeriesXRayColor } from './materials.js';
import {
  buildFrameNode,
  buildForkNode,
  buildCockpitNode,
  buildFrontWheelNode,
  buildRearWheelNode,
  buildRearDropoutBrakeNode
} from './bike_chassis.js';
import {
  buildBatterySystemNode,
  buildUnderTubeModuleNode,
  buildMotoSaddleAndSubframeNode
} from './bike_powertrain.js';
import { ENGINEERING_MODALS, CAD_SHEETS_6 } from './engineering_modals.js';

// ----------------------------------------------------------------------------
// 1. INITIALIZE CLEAN STUDIO WEBGL SCENE (#050505 + ContactShadows @ y = -0.335)
// ----------------------------------------------------------------------------
const container = document.getElementById('webgl-container');
const scene = new THREE.Scene();

const initAspect = window.innerWidth / Math.max(window.innerHeight, 1);
const camera = new THREE.PerspectiveCamera(initAspect < 1.0 ? 44 : 28, initAspect, 0.02, 40);
// Studio telephoto 3/4 front-left angle matching Reference Photo #1 without wide-angle wheel distortion
const DEFAULT_CAM_POS = new THREE.Vector3(1.42, 0.48, 2.15);
const DEFAULT_CAM_TARGET = new THREE.Vector3(0.11, 0.21, 0.0);

function getViewportAdjustedPos(basePos, targetVec) {
  const aspect = window.innerWidth / Math.max(window.innerHeight, 1);
  camera.fov = aspect < 1.0 ? 44 : 28;
  camera.updateProjectionMatrix();
  if (aspect < 1.0 && basePos === DEFAULT_CAM_POS) {
    // On 20:9 portrait smartphones (e.g. iQOO Z10r 393x852), use a balanced 3/4 side-front vector filling the screen
    const portraitDir = new THREE.Vector3(0.48, 0.21, 2.25);
    const scale = Math.min(2.15, 0.86 / Math.max(aspect, 0.38));
    return targetVec.clone().add(portraitDir.multiplyScalar(scale));
  }
  const distScale = aspect < 1.25 ? Math.min(2.25, 0.96 / Math.max(aspect, 0.42)) : 1.0;
  return targetVec.clone().add(basePos.clone().sub(targetVec).multiplyScalar(distScale));
}

camera.position.copy(getViewportAdjustedPos(DEFAULT_CAM_POS, DEFAULT_CAM_TARGET));

const isMobileDevice = window.innerWidth <= 920 || ('ontouchstart' in window);
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
  powerPreference: 'high-performance'
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobileDevice ? 1.75 : 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

// Studio PMREM Environment for realistic metallic/anodized reflections on matte black
try {
  if (typeof RoomEnvironment !== 'undefined') {
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
  }
} catch (e) {
  console.warn('Studio PMREM skipped (direct studio lighting active):', e);
}

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.copy(DEFAULT_CAM_TARGET);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.maxDistance = 8.5;
controls.minDistance = 0.20;
controls.maxPolarAngle = Math.PI * 0.52; // Prevent going far below the studio floor

// ----------------------------------------------------------------------------
// 2. STUDIO LIGHTING & FLOOR CONTACT SHADOWS (y = -0.278m)
// ----------------------------------------------------------------------------
const ambientLight = new THREE.AmbientLight(0xdbe6f5, 0.75);
scene.add(ambientLight);

// Main overhead softbox key light
const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
keyLight.position.set(1.8, 3.2, 2.2);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.camera.near = 0.5;
keyLight.shadow.camera.far = 8.0;
const shadowDist = 1.35;
keyLight.shadow.camera.left = -shadowDist;
keyLight.shadow.camera.right = shadowDist;
keyLight.shadow.camera.top = shadowDist;
keyLight.shadow.camera.bottom = -shadowDist;
keyLight.shadow.bias = -0.0005;
scene.add(keyLight);

// Cool rim light from rear-right to sculpt the RAL 9005 matte black silhouette
const rimLight = new THREE.DirectionalLight(0x7aa8ff, 1.45);
rimLight.position.set(-2.2, 1.8, -1.8);
scene.add(rimLight);

// Warm fill light from front-left low angle
const fillLight = new THREE.DirectionalLight(0xffcfa8, 0.85);
fillLight.position.set(2.0, 0.4, 1.6);
scene.add(fillLight);

// Studio Contact Shadows on floor y = -0.256m (No fence, no pavement tiles — pure studio!)
function createStudioContactShadowFloor() {
  const floorGroup = new THREE.Group();
  floorGroup.position.y = -0.256;

  // Soft procedural dual-wheel + chassis contact shadow texture
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, 512, 256);

  // Rear wheel contact patch shadow
  const gradRear = ctx.createRadialGradient(145, 128, 4, 145, 128, 75);
  gradRear.addColorStop(0, 'rgba(0,0,0,0.92)');
  gradRear.addColorStop(0.45, 'rgba(0,0,0,0.55)');
  gradRear.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradRear;
  ctx.fillRect(0, 0, 512, 256);

  // Front wheel contact patch shadow
  const gradFront = ctx.createRadialGradient(382, 128, 4, 382, 128, 75);
  gradFront.addColorStop(0, 'rgba(0,0,0,0.92)');
  gradFront.addColorStop(0.45, 'rgba(0,0,0,0.55)');
  gradFront.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradFront;
  ctx.fillRect(0, 0, 512, 256);

  // Center bike body ambient occlusion shadow
  const gradBody = ctx.createRadialGradient(260, 128, 12, 260, 128, 185);
  gradBody.addColorStop(0, 'rgba(0,0,0,0.68)');
  gradBody.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradBody;
  ctx.fillRect(0, 0, 512, 256);

  const shadowTex = new THREE.CanvasTexture(canvas);
  const contactPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(2.3, 1.15),
    new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.95
    })
  );
  contactPlane.rotation.x = -Math.PI / 2;
  contactPlane.position.set(0.065, 0.001, 0);
  floorGroup.add(contactPlane);

  // Real-time shadow-receiving studio floor plane at y = -0.335
  const shadowReceiver = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.ShadowMaterial({ opacity: 0.42 })
  );
  shadowReceiver.rotation.x = -Math.PI / 2;
  shadowReceiver.receiveShadow = true;
  floorGroup.add(shadowReceiver);

  return floorGroup;
}
scene.add(createStudioContactShadowFloor());

// ----------------------------------------------------------------------------
// 3. ASSEMBLE ALL 7 HIGH-POLY CAD NODES OF STEALTH SUR-RON 72V 3000W
// ----------------------------------------------------------------------------
const mats = createStealthMaterials();
const bikeMasterGroup = new THREE.Group();
bikeMasterGroup.name = 'STEALTH_SURRON_72V_3000W_MASTER';
scene.add(bikeMasterGroup);

// Base Frame Node (Stationary Reference at (0,0,0))
const frameNode = buildFrameNode(mats);
bikeMasterGroup.add(frameNode);

// Front Assembly Parent Group (Fork + Cockpit + Front Wheel move together by (+0.22, -0.05, 0),
// while Front Wheel additionally moves +0.18m forward from fork dropouts!)
const frontAssemblyGroup = new THREE.Group();
frontAssemblyGroup.name = 'EXPLODE_FRONT_ASSEMBLY';
const forkNode = buildForkNode(mats);
const cockpitNode = buildCockpitNode(mats);
const frontWheelNode = buildFrontWheelNode(mats);
frontAssemblyGroup.add(forkNode, cockpitNode, frontWheelNode);
bikeMasterGroup.add(frontAssemblyGroup);

// Rear 3000W Motor Wheel Node (Explodes backward by (-0.28, 0, 0))
const rearWheelNode = buildRearWheelNode(mats);
bikeMasterGroup.add(rearWheelNode);

// Rear Left 6mm Monolithic M14 Dropout Armor + 4-Piston ZOOM HB-890E Caliper (Explodes left by (0, 0, +0.16))
const rearDropoutNode = buildRearDropoutBrakeNode(mats);
bikeMasterGroup.add(rearDropoutNode);

// Battery System 20S7P (140x EVE 50E + Cordura 1000D Bag + PETG Holders + Bisida BMS 120A)
const batterySys = buildBatterySystemNode(mats);
bikeMasterGroup.add(batterySys.batteryRoot);

// Lower Under-Tube Module (60A 18-MOSFET Controller + 3D PETG Box with 105 dB Horn & DC-DC 12V)
const underTubeSys = buildUnderTubeModuleNode(mats);
bikeMasterGroup.add(underTubeSys.underTubeRoot);

// Long 530mm Sur-Ron Moto Saddle + Welded Steel Subframe + Rear LED Brake Light
const saddleSys = buildMotoSaddleAndSubframeNode(mats);
bikeMasterGroup.add(saddleSys.saddleSystemRoot);

// ----------------------------------------------------------------------------
// 4. VOLUMETRIC HEADLIGHT CONES & REAR LED BRAKE LIGHT TEST SYSTEM
// ----------------------------------------------------------------------------
const lightsTestGroup = new THREE.Group();
lightsTestGroup.name = 'VOLUMETRIC_HEADLIGHT_BEAMS';
lightsTestGroup.visible = false;

// Dual SpotLight beams + Volumetric Light Cones from Sur-Ron Headlight eyes
[-0.026, 0.026].forEach((zEye) => {
  const spot = new THREE.SpotLight(0xd8f4ff, 6.5, 4.5, Math.PI * 0.16, 0.65, 1.5);
  spot.position.set(0.475, 0.585, zEye);
  const targetObj = new THREE.Object3D();
  targetObj.position.set(2.4, 0.05, zEye * 1.5);
  lightsTestGroup.add(targetObj);
  spot.target = targetObj;
  lightsTestGroup.add(spot);

  // Volumetric translucent light beam cone
  const coneGeom = new THREE.ConeGeometry(0.28, 1.35, 32, 1, true);
  coneGeom.translate(0, -0.675, 0);
  coneGeom.rotateZ(Math.PI / 2 - 0.22);
  const coneMat = new THREE.MeshBasicMaterial({
    color: 0xbbe8ff,
    transparent: true,
    opacity: 0.16,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  const coneMesh = new THREE.Mesh(coneGeom, coneMat);
  coneMesh.position.set(0.475, 0.585, zEye);
  lightsTestGroup.add(coneMesh);
});

// Rear Red Brake Light PointLight glow
const rearBrakePointLight = new THREE.PointLight(0xff0000, 0, 0.85);
rearBrakePointLight.position.set(-0.60, 0.555, 0);
saddleSys.saddleAndFenderGroup.add(rearBrakePointLight);
frontAssemblyGroup.add(lightsTestGroup);

// ----------------------------------------------------------------------------
// 5. EXPLODED VIEW KINEMATICS (GSAP power3.out + Slider + Dashed Leader Lines)
// ----------------------------------------------------------------------------
const explodeTargets = [
  {
    name: 'Левая крышка сумки Cordura 1000D',
    group: batterySys.leftCoverGroup,
    basePos: batterySys.leftCoverGroup.position.clone(),
    delta: new THREE.Vector3(0, 0, 0.28),
    anchorLocal: new THREE.Vector3(0.14, 0.30, 0.04)
  },
  {
    name: 'Правая крышка сумки Cordura 1000D',
    group: batterySys.rightCoverGroup,
    basePos: batterySys.rightCoverGroup.position.clone(),
    delta: new THREE.Vector3(0, 0, -0.28),
    anchorLocal: new THREE.Vector3(0.14, 0.30, -0.04)
  },
  {
    name: 'Левая матрица 3D-сот PETG',
    group: batterySys.holderLeftGroup,
    basePos: batterySys.holderLeftGroup.position.clone(),
    delta: new THREE.Vector3(0, 0, 0.14),
    anchorLocal: new THREE.Vector3(0.14, 0.26, 0.03)
  },
  {
    name: 'Правая матрица 3D-сот PETG',
    group: batterySys.holderRightGroup,
    basePos: batterySys.holderRightGroup.position.clone(),
    delta: new THREE.Vector3(0, 0, -0.14),
    anchorLocal: new THREE.Vector3(0.14, 0.26, -0.03)
  },
  {
    name: 'Плата Bisida BMS 20S 120A',
    group: batterySys.bmsGroup,
    basePos: batterySys.bmsGroup.position.clone(),
    delta: new THREE.Vector3(0, 0.16, 0),
    anchorLocal: new THREE.Vector3(0.145, 0.432, 0)
  },
  {
    name: 'Мото-седло Sur-Ron 530 мм + стоп-сигнал',
    group: saddleSys.saddleAndFenderGroup,
    basePos: saddleSys.saddleAndFenderGroup.position.clone(),
    delta: new THREE.Vector3(-0.10, 0.24, 0),
    anchorLocal: new THREE.Vector3(-0.32, 0.50, 0)
  },
  {
    name: 'Сварной стальной подрамник седла',
    group: saddleSys.subframeGroup,
    basePos: saddleSys.subframeGroup.position.clone(),
    delta: new THREE.Vector3(-0.05, 0.12, 0),
    anchorLocal: new THREE.Vector3(-0.28, 0.46, 0)
  },
  {
    name: 'Контроллер 60А + крышка 3D-короба PETG',
    group: underTubeSys.controllerAndLidGroup,
    basePos: underTubeSys.controllerAndLidGroup.position.clone(),
    delta: new THREE.Vector3(0.14, -0.18, 0),
    anchorLocal: new THREE.Vector3(0.22, 0.20, 0)
  },
  {
    name: 'Вилка FOXSID-X2 + Руль + Фара Sur-Ron',
    group: frontAssemblyGroup,
    basePos: frontAssemblyGroup.position.clone(),
    delta: new THREE.Vector3(0.22, -0.05, 0),
    anchorLocal: new THREE.Vector3(0.41, 0.50, 0)
  },
  {
    name: 'Переднее колесо 26" MTX39 + ротор 180 мм',
    group: frontWheelNode,
    basePos: frontWheelNode.position.clone(),
    delta: new THREE.Vector3(0.18, 0, 0),
    anchorLocal: new THREE.Vector3(0, 0, 0)
  },
  {
    name: 'Заднее мотор-колесо 72V 3000W MTX39',
    group: rearWheelNode,
    basePos: rearWheelNode.position.clone(),
    delta: new THREE.Vector3(-0.28, 0, 0),
    anchorLocal: new THREE.Vector3(0, 0, 0)
  },
  {
    name: 'Монолитная 6-мм бронепластина М14 + суппорт ZOOM',
    group: rearDropoutNode,
    basePos: rearDropoutNode.position.clone(),
    delta: new THREE.Vector3(0, 0, 0.16),
    anchorLocal: new THREE.Vector3(-0.435, 0.05, 0.07)
  }
];

// Create Orange Dashed Leader Lines (THREE.LineDashedMaterial) from each part to its mounting seat
const dashedLinesGroup = new THREE.Group();
dashedLinesGroup.name = 'EXPLODE_DASHED_LEADER_LINES';
scene.add(dashedLinesGroup);

const dashedLineMat = new THREE.LineDashedMaterial({
  color: 0xff5500,
  dashSize: 0.016,
  gapSize: 0.010,
  transparent: true,
  opacity: 0.85
});

explodeTargets.forEach((item) => {
  const geom = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(),
    new THREE.Vector3()
  ]);
  const line = new THREE.Line(geom, dashedLineMat);
  line.visible = false;
  dashedLinesGroup.add(line);
  item.leaderLine = line;
});

const explodeState = { factor: 0 }; // 0.0 -> 1.0
const sliderExplode = document.getElementById('slider-explode');
const explodeValLabel = document.getElementById('explode-val');
const btnExplode = document.getElementById('btn-explode');

function applyExplodeFactor(f) {
  explodeState.factor = f;
  const pct = Math.round(f * 100);
  sliderExplode.value = String(pct);
  explodeValLabel.textContent = `${pct}%`;

  if (f > 0.01) {
    btnExplode.classList.add('active-orange');
  } else {
    btnExplode.classList.remove('active-orange');
  }

  // Fade PVC shrink sleeve slightly during explode so the 140 21700 cells shine clearly
  batterySys.pvcSleeveMesh.material.opacity = 0.32 * (1.0 - f * 0.65);

  explodeTargets.forEach((item) => {
    item.group.position.copy(item.basePos).addScaledVector(item.delta, f);

    if (f > 0.02) {
      item.leaderLine.visible = true;
      // Compute world start (seat position when f=0) and world current position
      const parentObj = item.group.parent;
      const seatLocal = item.basePos.clone().add(item.anchorLocal);
      const movedLocal = item.group.position.clone().add(item.anchorLocal);

      const worldSeat = parentObj.localToWorld(seatLocal.clone());
      const worldMoved = parentObj.localToWorld(movedLocal.clone());

      const posAttr = item.leaderLine.geometry.attributes.position;
      posAttr.setXYZ(0, worldSeat.x, worldSeat.y, worldSeat.z);
      posAttr.setXYZ(1, worldMoved.x, worldMoved.y, worldMoved.z);
      posAttr.needsUpdate = true;
      item.leaderLine.computeLineDistances();
    } else {
      item.leaderLine.visible = false;
    }
  });
}

btnExplode.addEventListener('click', () => {
  const targetF = explodeState.factor < 0.5 ? 1.0 : 0.0;
  gsap.to(explodeState, {
    factor: targetF,
    duration: 1.35,
    ease: 'power3.out',
    onUpdate: () => applyExplodeFactor(explodeState.factor)
  });
});

sliderExplode.addEventListener('input', (e) => {
  const val = parseFloat(e.target.value) / 100;
  gsap.killTweensOf(explodeState);
  applyExplodeFactor(val);
});

// ----------------------------------------------------------------------------
// 6. X-RAY 20S7P BATTERY MODE & INTERACTIVE RAYCASTER (1S..20S HIGHLIGHT)
// ----------------------------------------------------------------------------
let isXRayMode = false;
let hoveredSeriesId = null;

const btnXRay = document.getElementById('btn-xray');
const xrayPassport = document.getElementById('xray-passport');
const xrayGroupTitle = document.getElementById('xray-group-title');
const xrayGroupCfg = document.getElementById('xray-group-cfg');
const xrayGroupVolt = document.getElementById('xray-group-volt');
const xrayGroupTemp = document.getElementById('xray-group-temp');
const mobileXRayBanner = document.getElementById('mobile-xray-banner');
const mobXRayTitle = document.getElementById('mob-xray-title');
const mobXRayVal = document.getElementById('mob-xray-val');

function setXRayMode(enable) {
  isXRayMode = enable;
  if (enable) {
    btnXRay.classList.add('active-green');
    xrayPassport.classList.add('visible');
    if (mobileXRayBanner) mobileXRayBanner.classList.add('visible');

    // Hide outer Cordura side covers & PETG honeycomb shells so all 140 cells,
    // 1S..20S badges, serpentine copper/nickel busbars, and 21 balance wires are 100% clear!
    mats.MAT_CORDURA_1000D.transparent = true;
    mats.MAT_CORDURA_1000D.depthWrite = false;
    mats.MAT_CORDURA_1000D.needsUpdate = true;
    gsap.to(mats.MAT_CORDURA_1000D, { opacity: 0.10, duration: 0.5 });
    batterySys.leftCoverGroup.visible = false;
    batterySys.rightCoverGroup.visible = false;
    batterySys.holderLeftGroup.visible = false;
    batterySys.holderRightGroup.visible = false;

    // Show all 20 sections (140 cells) with their unique 1S..20S color gradient on entry
    hoveredSeriesId = -1;
    resetAllBatterySeriesMaterials();
    xrayGroupTitle.textContent = '20S7P (140× 21700): НАЖМИТЕ НА СЕКЦИЮ 1S..20S';
    if (mobXRayTitle) mobXRayTitle.textContent = 'X-RAY 20S7P: ТАПНИТЕ СЕКЦИЮ 1S..20S';
    if (mobXRayVal) mobXRayVal.textContent = '84.0V • 35Ah';

    // Fly camera smoothly to frame triangle
    flyCameraTo(new THREE.Vector3(0.14, 0.28, 0.68), new THREE.Vector3(0.14, 0.27, 0.0));
  } else {
    btnXRay.classList.remove('active-green');
    xrayPassport.classList.remove('visible');
    if (mobileXRayBanner) mobileXRayBanner.classList.remove('visible');

    mats.MAT_CORDURA_1000D.transparent = false;
    mats.MAT_CORDURA_1000D.depthWrite = true;
    mats.MAT_CORDURA_1000D.opacity = 1.0;
    mats.MAT_CORDURA_1000D.needsUpdate = true;
    batterySys.leftCoverGroup.visible = true;
    batterySys.rightCoverGroup.visible = true;
    batterySys.holderLeftGroup.visible = true;
    batterySys.holderRightGroup.visible = true;
    hoveredSeriesId = -1;
    resetAllBatterySeriesMaterials();
  }
}

function resetAllBatterySeriesMaterials() {
  if (hoveredSeriesId === null) return;
  hoveredSeriesId = null;
  batterySys.seriesGroups.forEach((sGroup) => {
    const s = sGroup.userData.seriesId;
    const { cellMat, busMat, niMat } = sGroup.userData;
    if (isXRayMode) {
      // Unique color tint per 7P group (1S -> 20S) in X-Ray mode to show current flow
      const cTint = getSeriesXRayColor(s);
      cellMat.color.copy(cTint);
      cellMat.emissive.copy(cTint);
      cellMat.emissiveIntensity = 0.28;
      cellMat.opacity = 1.0;
    } else {
      cellMat.color.setHex(0xffffff);
      cellMat.emissive.setHex(0x000000);
      cellMat.emissiveIntensity = 0;
      cellMat.opacity = 1.0;
    }

    busMat.emissive.setHex(0x000000);
    busMat.emissiveIntensity = 0;
    niMat.emissive.setHex(0x000000);
    niMat.emissiveIntensity = 0;
  });
}

function highlightBatterySeriesGroup(seriesId) {
  if (hoveredSeriesId === seriesId) return;
  hoveredSeriesId = seriesId;

  batterySys.seriesGroups.forEach((sGroup) => {
    const s = sGroup.userData.seriesId;
    const { cellMat, busMat, niMat, row, polarityOnLeft } = sGroup.userData;

    if (s === seriesId) {
      // Selected 7P group and its copper-nickel busbar flash neon!
      const cTint = getSeriesXRayColor(s);
      cellMat.color.copy(cTint);
      cellMat.emissive.copy(cTint);
      cellMat.emissiveIntensity = 0.95;
      cellMat.opacity = 1.0;

      busMat.emissive.setHex(0xff5500);
      busMat.emissiveIntensity = 1.6;
      niMat.emissive.setHex(0x00ff66);
      niMat.emissiveIntensity = 1.1;

      const polSideStr = polarityOnLeft > 0 ? '+Z ПЛЮС / -Z МИНУС' : '+Z МИНУС / -Z ПЛЮС';
      xrayGroupTitle.textContent = `СЕКЦИЯ ${s}S (РЯД #${row}, ЯЧЕЙКИ #${(s - 1) * 7 + 1}..#${s * 7})`;
      xrayGroupCfg.textContent = `${s}S7P (${polSideStr})`;
      xrayGroupVolt.textContent = `${(s * 3.6).toFixed(1)}..${(s * 4.2).toFixed(1)}V`;
      xrayGroupTemp.textContent = `NTC ${sGroup.userData.ntcTemp}°C / Cu 2.5мм²`;

      if (mobXRayTitle) mobXRayTitle.textContent = `СЕКЦИЯ ${s}S (РЯД #${row} • #${(s - 1) * 7 + 1}..#${s * 7})`;
      if (mobXRayVal) mobXRayVal.textContent = `${(s * 3.6).toFixed(1)}..${(s * 4.2).toFixed(1)}V • ${sGroup.userData.ntcTemp}°C`;
    } else {
      // Other 133 cells fade into semi-transparent tinted glass (opacity: 0.22)
      const cTint = getSeriesXRayColor(s);
      cellMat.color.copy(cTint);
      cellMat.emissive.setHex(0x000000);
      cellMat.emissiveIntensity = 0.0;
      cellMat.opacity = 0.22;

      busMat.emissive.setHex(0x000000);
      busMat.emissiveIntensity = 0.0;
      niMat.emissive.setHex(0x000000);
      niMat.emissiveIntensity = 0.0;
    }
  });
}

btnXRay.addEventListener('click', () => {
  setXRayMode(!isXRayMode);
  if (isXRayMode) {
    flyCameraTo(new THREE.Vector3(0.14, 0.28, 1.05), new THREE.Vector3(0.12, 0.27, 0.0));
  }
});

// Raycaster for hovering/tapping 20 battery groups (1S..20S) AND 3D SW900 handlebar buttons
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function inspectBatteryAtClientXY(clientX, clientY) {
  if (!isXRayMode && explodeState.factor < 0.25) return false;

  pointer.x = (clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(batterySys.seriesGroups, true);

  if (intersects.length > 0) {
    const hitObj = intersects[0].object;
    const sId = hitObj.userData.seriesId || (hitObj.parent && hitObj.parent.userData.seriesId);
    if (sId) {
      if (!isXRayMode) {
        xrayPassport.classList.add('visible');
        if (mobileXRayBanner) mobileXRayBanner.classList.add('visible');
      }
      highlightBatterySeriesGroup(sId);
      document.body.style.cursor = 'pointer';
      return true;
    }
  }
  resetAllBatterySeriesMaterials();
  document.body.style.cursor = 'default';
  return false;
}

function check3DSw900ButtonClick(clientX, clientY) {
  pointer.x = (clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(cockpitNode.children, true);
  for (let i = 0; i < hits.length; i++) {
    const btnType = hits[i].object.userData && hits[i].object.userData.sw900Button;
    if (btnType) {
      handleSw900ButtonAction(btnType);
      return true;
    }
  }
  return false;
}

window.addEventListener('pointermove', (e) => {
  if (e.pointerType === 'touch') return;
  inspectBatteryAtClientXY(e.clientX, e.clientY);
});

renderer.domElement.addEventListener('pointerdown', (e) => {
  if (check3DSw900ButtonClick(e.clientX, e.clientY)) return;
  if (e.pointerType === 'touch' || window.innerWidth <= 920) {
    inspectBatteryAtClientXY(e.clientX, e.clientY);
  }
});

// ----------------------------------------------------------------------------
// 7. TEST BRAKE & SUR-RON HEADLIGHT SWITCH + LIVE SW900 TELEMETRY STATE
// ----------------------------------------------------------------------------
let isLightsAndBrakeOn = false;
let isRegenBraking = false;
const btnLights = document.getElementById('btn-lights');
const btnRegenBrake = document.getElementById('btn-regen-brake');

function updateBrakeAndHeadlightVisuals() {
  lightsTestGroup.visible = isLightsAndBrakeOn;
  mats.MAT_HEADLIGHT_LED.emissiveIntensity = isLightsAndBrakeOn ? 4.5 : 0.5;

  const brakeActive = isLightsAndBrakeOn || isRegenBraking;
  if (brakeActive) {
    mats.MAT_BRAKE_LED.emissive.setHex(0xff0000);
    mats.MAT_BRAKE_LED.emissiveIntensity = 4.2;
    rearBrakePointLight.intensity = 3.8;
  } else {
    mats.MAT_BRAKE_LED.emissiveIntensity = 0.35;
    rearBrakePointLight.intensity = 0.0;
  }
}

btnLights.addEventListener('click', () => {
  isLightsAndBrakeOn = !isLightsAndBrakeOn;
  btnLights.classList.toggle('active-orange', isLightsAndBrakeOn);
  updateBrakeAndHeadlightVisuals();
});

// ----------------------------------------------------------------------------
// 8. LIVE SW900 ON-BOARD COMPUTER (60 FPS 7-SEGMENT LCD + ODO + WATTMETER + POV)
// ----------------------------------------------------------------------------
const PAS_LIMITS = {
  1: { maxSpeedKmh: 24.9, maxPowerW: 240, maxCurrentA: 3.0 },
  2: { maxSpeedKmh: 36.0, maxPowerW: 950, maxCurrentA: 12.0 },
  3: { maxSpeedKmh: 45.0, maxPowerW: 1680, maxCurrentA: 21.0 },
  4: { maxSpeedKmh: 64.0, maxPowerW: 2880, maxCurrentA: 36.0 },
  5: { maxSpeedKmh: 82.4, maxPowerW: 4320, maxCurrentA: 60.0 }
};
const BOTTOM_MODES = ['ODO', 'TRIP', 'MAX', 'AVG', 'TIME'];
const ODO_STORAGE_KEY = 'stealth_surron_72v_odo_km';

let savedOdo = 128.45;
try {
  const rawOdo = localStorage.getItem(ODO_STORAGE_KEY);
  if (rawOdo !== null && !isNaN(parseFloat(rawOdo))) {
    savedOdo = parseFloat(rawOdo);
  }
} catch (e) {
  // ignore localStorage restrictions
}

const sw900State = {
  pas: 5,
  throttlePct: 0,
  speedKmh: 0.0,
  openCircuitVolts: 84.0,
  internalResistanceOhm: 0.07, // 20S7P EVE 50E pack internal resistance (~70 mOhm)
  voltage: 84.0,
  currentA: 0.0,
  watts: 0,
  odoKm: savedOdo,
  tripKm: 0.0,
  maxSpeedKmh: 0.0,
  rideTimeSec: 0,
  bottomModeIdx: 0
};

const sw900HudWidget = document.getElementById('sw900-hud-widget');
const sw900HudCanvas = document.getElementById('sw900-hud-canvas');
const sw900HudCtx = sw900HudCanvas ? sw900HudCanvas.getContext('2d') : null;
const sw900PovBadge = document.getElementById('sw900-pov-badge');
const sliderThrottle = document.getElementById('slider-throttle');
const throttleLabel = document.getElementById('throttle-label');
const topMetricVolt = document.getElementById('top-metric-volt');
const topMetricOdo = document.getElementById('top-metric-odo');
const btnPovRider = document.getElementById('btn-pov-rider');

function handleSw900ButtonAction(action) {
  if (action === 'UP') {
    sw900State.pas = Math.min(5, sw900State.pas + 1);
  } else if (action === 'DOWN') {
    sw900State.pas = Math.max(1, sw900State.pas - 1);
  } else if (action === 'MODE') {
    sw900State.bottomModeIdx = (sw900State.bottomModeIdx + 1) % BOTTOM_MODES.length;
  }
}

document.getElementById('sw900-btn-up')?.addEventListener('click', () => handleSw900ButtonAction('UP'));
document.getElementById('sw900-btn-down')?.addEventListener('click', () => handleSw900ButtonAction('DOWN'));
document.getElementById('sw900-btn-mode')?.addEventListener('click', () => handleSw900ButtonAction('MODE'));

if (sliderThrottle) {
  sliderThrottle.addEventListener('input', (e) => {
    sw900State.throttlePct = parseFloat(e.target.value) || 0;
    if (throttleLabel) throttleLabel.textContent = `ГАЗ: ${Math.round(sw900State.throttlePct)}%`;
  });
}

if (btnRegenBrake) {
  btnRegenBrake.addEventListener('click', () => {
    isRegenBraking = !isRegenBraking;
    btnRegenBrake.classList.toggle('active', isRegenBraking);
    updateBrakeAndHeadlightVisuals();
  });
}

window.addEventListener('keydown', (e) => {
  if (e.target && e.target.tagName === 'INPUT') return;
  if (e.key >= '1' && e.key <= '5') {
    sw900State.pas = parseInt(e.key, 10);
  } else if (e.key === 'ArrowUp') {
    handleSw900ButtonAction('UP');
  } else if (e.key === 'ArrowDown') {
    handleSw900ButtonAction('DOWN');
  } else if (e.key === 'm' || e.key === 'M' || e.key === 'ь' || e.key === 'Ь') {
    handleSw900ButtonAction('MODE');
  }
});

let lastSimTime = performance.now();
let lastOdoSaveTime = performance.now();

function updateSw900PhysicsAndScreen(now) {
  const dt = Math.min(0.1, Math.max(0.001, (now - lastSimTime) / 1000));
  lastSimTime = now;

  const pasCfg = PAS_LIMITS[sw900State.pas] || PAS_LIMITS[5];
  const thr = sw900State.throttlePct / 100;

  // Target speed & current depending on throttle, PAS level, and E-ABS regenerative braking
  let targetSpeed = pasCfg.maxSpeedKmh * thr;
  if (isRegenBraking) {
    targetSpeed = 0;
    // Regenerative braking decelerates quickly
    sw900State.speedKmh = Math.max(0, sw900State.speedKmh - 38.0 * dt);
  } else {
    const accelRate = targetSpeed > sw900State.speedKmh ? 26.0 : 14.0;
    const diff = targetSpeed - sw900State.speedKmh;
    if (Math.abs(diff) < accelRate * dt) {
      sw900State.speedKmh = targetSpeed;
    } else {
      sw900State.speedKmh += Math.sign(diff) * accelRate * dt;
    }
  }

  // Compute instantaneous current I (Amps) and Ohm's law voltage U = U_oc - I * R_internal
  if (isRegenBraking && sw900State.speedKmh > 1.5) {
    // E-ABS regenerative braking charges battery (-20.5A, up to -1650W)
    const regenRatio = Math.min(1.0, sw900State.speedKmh / 45.0);
    sw900State.currentA = -20.5 * regenRatio;
  } else if (!isRegenBraking && thr > 0.005) {
    const loadFactor = Math.min(1.0, thr * (0.45 + 0.55 * (sw900State.speedKmh / Math.max(1, pasCfg.maxSpeedKmh))));
    sw900State.currentA = pasCfg.maxCurrentA * loadFactor;
  } else {
    sw900State.currentA = 0.0;
  }

  // Gradual open-circuit discharge as trip distance increases (2.94 kWh capacity ~ 110 km range)
  sw900State.openCircuitVolts = Math.max(62.0, 84.0 - sw900State.tripKm * 0.18);
  sw900State.voltage = Math.min(84.4, Math.max(60.0, sw900State.openCircuitVolts - sw900State.currentA * sw900State.internalResistanceOhm));
  sw900State.watts = Math.round(sw900State.voltage * sw900State.currentA);

  // Clamp wattmeter in PAS 1..4 to their configured ceilings
  if (sw900State.watts > pasCfg.maxPowerW) {
    sw900State.watts = pasCfg.maxPowerW;
  }

  // Integrate distance dS = v * dt (km)
  if (sw900State.speedKmh > 0.05) {
    const dKm = (sw900State.speedKmh / 3600) * dt;
    sw900State.odoKm += dKm;
    sw900State.tripKm += dKm;
    sw900State.rideTimeSec += dt;
    if (sw900State.speedKmh > sw900State.maxSpeedKmh) {
      sw900State.maxSpeedKmh = sw900State.speedKmh;
    }

    // Rotate 3D front and rear wheels in real time (R_wheel = 0.345m)
    const vMs = sw900State.speedKmh / 3.6;
    const dAngle = (vMs / 0.345) * dt;
    frontWheelNode.rotation.z -= dAngle;
    rearWheelNode.rotation.z -= dAngle;
  }

  // Persist ODO to localStorage every 2 seconds while moving
  if (now - lastOdoSaveTime > 2000) {
    lastOdoSaveTime = now;
    try {
      localStorage.setItem(ODO_STORAGE_KEY, sw900State.odoKm.toFixed(2));
    } catch (e) {
      // ignore
    }
  }

  // Update top telemetry strip
  if (topMetricVolt) {
    topMetricVolt.textContent = `${sw900State.voltage.toFixed(1)}V / ${ Math.abs(sw900State.watts) }W`;
  }
  if (topMetricOdo) {
    topMetricOdo.textContent = `${sw900State.odoKm.toFixed(2)} KM`;
  }

  // Compute 1..5 battery bars from open-circuit voltage (60V..84V)
  const soc = Math.max(0, Math.min(1, (sw900State.voltage - 62.0) / (84.0 - 62.0)));
  const batteryBars = Math.max(1, Math.min(5, Math.ceil(soc * 5)));
  const avgSpeedKmh = sw900State.rideTimeSec > 1 ? (sw900State.tripKm / (sw900State.rideTimeSec / 3600)) : 0.0;

  if (mats.sw900Controller && mats.sw900Controller.updateSw900) {
    mats.sw900Controller.updateSw900({
      speedKmh: sw900State.speedKmh,
      voltage: sw900State.voltage,
      watts: sw900State.watts,
      pas: sw900State.pas,
      odoKm: sw900State.odoKm,
      tripKm: sw900State.tripKm,
      maxSpeedKmh: sw900State.maxSpeedKmh,
      avgSpeedKmh,
      rideTimeSec: sw900State.rideTimeSec,
      bottomMode: BOTTOM_MODES[sw900State.bottomModeIdx],
      headlightOn: isLightsAndBrakeOn,
      brakeOn: isRegenBraking || isLightsAndBrakeOn,
      batteryBars
    });

    // Copy 3D SW900 CanvasTexture onto the 1:1 HUD duplicate canvas
    if (sw900HudCtx && mats.sw900Controller.canvas) {
      sw900HudCtx.drawImage(mats.sw900Controller.canvas, 0, 0);
    }
  }
}

// ----------------------------------------------------------------------------
// 9. CAMERA PRESETS (INCLUDING RIDER POV-08), MOBILE DRAWERS & 3D HOTSPOTS
// ----------------------------------------------------------------------------
function flyCameraTo(posVec, targetVec, isPov = false) {
  const adjustedPos = isPov ? posVec.clone() : getViewportAdjustedPos(posVec, targetVec);
  camera.fov = isPov ? 38 : (window.innerWidth / Math.max(window.innerHeight, 1) < 1.0 ? 44 : 28);
  camera.updateProjectionMatrix();

  gsap.to(camera.position, {
    x: adjustedPos.x,
    y: adjustedPos.y,
    z: adjustedPos.z,
    duration: 1.15,
    ease: 'power3.out'
  });
  gsap.to(controls.target, {
    x: targetVec.x,
    y: targetVec.y,
    z: targetVec.z,
    duration: 1.15,
    ease: 'power3.out'
  });
}

const CAMERA_PRESETS = {
  default: { pos: DEFAULT_CAM_POS, target: DEFAULT_CAM_TARGET, code: 'ALL' },
  pov: { pos: new THREE.Vector3(-0.08, 0.86, 0.064), target: new THREE.Vector3(0.412, 0.654, 0.064), code: 'POV-08', isPov: true },
  fork: { pos: new THREE.Vector3(1.12, 0.30, 0.88), target: new THREE.Vector3(0.50, 0.25, 0.0), code: 'FRK-01' },
  cockpit: { pos: new THREE.Vector3(0.92, 0.74, 0.62), target: new THREE.Vector3(0.42, 0.61, 0.0), code: 'CKP-02' },
  wheels: { pos: new THREE.Vector3(-0.42, 0.10, 1.15), target: new THREE.Vector3(-0.445, 0.015, 0.0), code: 'WHL-03' },
  dropout: { pos: new THREE.Vector3(-0.38, 0.12, 0.54), target: new THREE.Vector3(-0.445, 0.04, 0.065), code: 'BRK-04' },
  battery: { pos: new THREE.Vector3(0.14, 0.28, 1.05), target: new THREE.Vector3(0.12, 0.27, 0.0), code: 'BAT-05' },
  controller: { pos: new THREE.Vector3(0.48, -0.02, 0.74), target: new THREE.Vector3(0.18, 0.18, 0.0), code: 'ESC-06' },
  saddle: { pos: new THREE.Vector3(-0.28, 0.65, 0.88), target: new THREE.Vector3(-0.34, 0.50, 0.0), code: 'SDL-07' }
};

function setPovModeUI(active) {
  if (sw900HudWidget) sw900HudWidget.classList.toggle('pov-enlarged', active);
  if (btnPovRider) btnPovRider.classList.toggle('active', active);
  if (sw900PovBadge) sw900PovBadge.textContent = active ? 'POV РАЙДЕРА 1:1' : 'РУЛЬ + HUD';
}

if (btnPovRider) {
  btnPovRider.addEventListener('click', () => {
    const isNowPov = currentCameraPresetKey !== 'pov';
    const key = isNowPov ? 'pov' : 'default';
    const preset = CAMERA_PRESETS[key];
    currentCameraPresetKey = key;
    activeNodeIndicator.textContent = preset.code;
    nodeButtons.forEach((b) => b.classList.toggle('active', b.getAttribute('data-cam') === key));
    setPovModeUI(isNowPov);
    flyCameraTo(preset.pos, preset.target, Boolean(preset.isPov));
  });
}

// Mobile Drawers & Pin Toggles
const leftSidePanel = document.getElementById('left-side-panel');
const rightHotspotDock = document.getElementById('right-hotspot-dock');
const btnMobNodes = document.getElementById('btn-mob-nodes');
const btnMobDocs = document.getElementById('btn-mob-docs');
const btnMobPins = document.getElementById('btn-mob-pins');
const closeLeftDrawerBtn = document.getElementById('close-left-drawer');
const closeRightDrawerBtn = document.getElementById('close-right-drawer');
let arePinsVisible = true;

function closeMobileDrawers() {
  if (leftSidePanel) leftSidePanel.classList.remove('mobile-open');
  if (rightHotspotDock) rightHotspotDock.classList.remove('mobile-open');
  if (btnMobNodes) btnMobNodes.classList.remove('active');
  if (btnMobDocs) btnMobDocs.classList.remove('active');
}

if (btnMobNodes) {
  btnMobNodes.addEventListener('click', () => {
    const isOpen = leftSidePanel.classList.contains('mobile-open');
    closeMobileDrawers();
    if (!isOpen) {
      leftSidePanel.classList.add('mobile-open');
      btnMobNodes.classList.add('active');
    }
  });
}

if (btnMobDocs) {
  btnMobDocs.addEventListener('click', () => {
    const isOpen = rightHotspotDock.classList.contains('mobile-open');
    closeMobileDrawers();
    if (!isOpen) {
      rightHotspotDock.classList.add('mobile-open');
      btnMobDocs.classList.add('active');
    }
  });
}

if (closeLeftDrawerBtn) closeLeftDrawerBtn.addEventListener('click', closeMobileDrawers);
if (closeRightDrawerBtn) closeRightDrawerBtn.addEventListener('click', closeMobileDrawers);

const nodeButtons = document.querySelectorAll('.node-btn');
const activeNodeIndicator = document.getElementById('active-node-indicator');
let currentCameraPresetKey = 'default';

nodeButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    nodeButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    const key = btn.getAttribute('data-cam');
    const preset = CAMERA_PRESETS[key];
    if (preset) {
      currentCameraPresetKey = key;
      activeNodeIndicator.textContent = preset.code;
      setPovModeUI(key === 'pov');
      flyCameraTo(preset.pos, preset.target, Boolean(preset.isPov));
      closeMobileDrawers();
    }
  });
});

document.getElementById('btn-reset-cam').addEventListener('click', () => {
  if (isXRayMode) setXRayMode(false);
  currentCameraPresetKey = 'default';
  setPovModeUI(false);
  closeMobileDrawers();
  flyCameraTo(DEFAULT_CAM_POS, DEFAULT_CAM_TARGET, false);
});

// ----------------------------------------------------------------------------
// 10. FULLSCREEN 6-SHEET ENGINEERING CAD TABLET (ZOOM, PAN, THEME, PNG/SVG 1:1)
// ----------------------------------------------------------------------------
const cadTabletBackdrop = document.getElementById('cad-tablet-backdrop');
const cadSheetStage = document.getElementById('cad-sheet-stage');
const cadViewportWrap = document.getElementById('cad-viewport-wrap');
const cadSheetSummary = document.getElementById('cad-sheet-summary');
const cadZoomIndicator = document.getElementById('cad-zoom-indicator');
const cadTabButtons = document.querySelectorAll('.cad-tab-btn');

let activeCadSheetIdx = 0;
let cadZoom = 1.0;
let cadPanX = 0;
let cadPanY = 0;
let isCadPanning = false;
let cadPanStartX = 0;
let cadPanStartY = 0;
let isCadWhiteTheme = false;

function updateCadStageTransform() {
  if (!cadSheetStage) return;
  cadSheetStage.style.transform = `translate(${cadPanX}px, ${cadPanY}px) scale(${cadZoom})`;
  if (cadZoomIndicator) {
    cadZoomIndicator.textContent = `МАСШТАБ: ${Math.round(cadZoom * 100)}%`;
  }
}

function selectCadSheet(idx) {
  activeCadSheetIdx = Math.max(0, Math.min(CAD_SHEETS_6.length - 1, idx));
  const sheet = CAD_SHEETS_6[activeCadSheetIdx];
  if (!sheet || !cadSheetStage) return;

  cadSheetStage.innerHTML = sheet.svg;
  if (cadSheetSummary) {
    cadSheetSummary.textContent = `${sheet.title} — ${sheet.specSummary}`;
  }
  cadTabButtons.forEach((btn, bIdx) => {
    btn.classList.toggle('active', bIdx === activeCadSheetIdx);
  });

  // Fit sheet nicely on smaller viewports automatically
  const vw = window.innerWidth;
  const vh = window.innerHeight - 130;
  cadZoom = Math.min(1.0, Math.max(0.45, Math.min((vw - 40) / 1100, (vh - 30) / 660)));
  cadPanX = 0;
  cadPanY = 0;
  updateCadStageTransform();
}

function openCadTablet(sheetIdx = 0) {
  closeMobileDrawers();
  selectCadSheet(sheetIdx);
  if (cadTabletBackdrop) cadTabletBackdrop.classList.add('open');
}

function closeCadTablet() {
  if (cadTabletBackdrop) cadTabletBackdrop.classList.remove('open');
}

document.getElementById('btn-open-cad-tablet')?.addEventListener('click', () => openCadTablet(activeCadSheetIdx));
document.getElementById('btn-open-cad-tablet-side')?.addEventListener('click', () => openCadTablet(activeCadSheetIdx));
document.getElementById('btn-cad-close')?.addEventListener('click', closeCadTablet);

cadTabButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const idx = parseInt(btn.getAttribute('data-tab') || '0', 10);
    selectCadSheet(idx);
  });
});

document.querySelectorAll('.blueprint-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const sheetAttr = btn.getAttribute('data-sheet');
    if (sheetAttr !== null) {
      openCadTablet(parseInt(sheetAttr, 10));
    } else {
      openEngineeringModal(btn.getAttribute('data-modal'));
    }
  });
});

document.getElementById('btn-cad-zoom-in')?.addEventListener('click', () => {
  cadZoom = Math.min(3.0, cadZoom + 0.2);
  updateCadStageTransform();
});
document.getElementById('btn-cad-zoom-out')?.addEventListener('click', () => {
  cadZoom = Math.max(0.4, cadZoom - 0.2);
  updateCadStageTransform();
});
document.getElementById('btn-cad-zoom-reset')?.addEventListener('click', () => {
  cadZoom = 1.0;
  cadPanX = 0;
  cadPanY = 0;
  updateCadStageTransform();
});
document.getElementById('btn-cad-theme')?.addEventListener('click', () => {
  isCadWhiteTheme = !isCadWhiteTheme;
  if (cadSheetStage) cadSheetStage.classList.toggle('white-theme', isCadWhiteTheme);
});

if (cadViewportWrap) {
  cadViewportWrap.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.14 : -0.14;
    cadZoom = Math.min(3.2, Math.max(0.4, cadZoom + delta));
    updateCadStageTransform();
  }, { passive: false });

  cadViewportWrap.addEventListener('pointerdown', (e) => {
    isCadPanning = true;
    cadPanStartX = e.clientX - cadPanX;
    cadPanStartY = e.clientY - cadPanY;
    cadViewportWrap.setPointerCapture(e.pointerId);
  });
  cadViewportWrap.addEventListener('pointermove', (e) => {
    if (!isCadPanning) return;
    cadPanX = e.clientX - cadPanStartX;
    cadPanY = e.clientY - cadPanStartY;
    updateCadStageTransform();
  });
  cadViewportWrap.addEventListener('pointerup', () => {
    isCadPanning = false;
  });
}

// Download SVG 1:1 & PNG 1:1
document.getElementById('btn-cad-download-svg')?.addEventListener('click', () => {
  const sheet = CAD_SHEETS_6[activeCadSheetIdx];
  if (!sheet) return;
  const blob = new Blob([sheet.svg.trim()], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `STEALTH_SURRON_CAD_SHEET_0${activeCadSheetIdx + 1}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

document.getElementById('btn-cad-download-png')?.addEventListener('click', () => {
  const sheet = CAD_SHEETS_6[activeCadSheetIdx];
  if (!sheet) return;
  const svgStr = sheet.svg.trim();
  const img = new Image();
  const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  img.onload = () => {
    const c = document.createElement('canvas');
    c.width = 2200;
    c.height = 1320;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0, 2200, 1320);
    URL.revokeObjectURL(url);
    c.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = c.toDataURL('image/png');
    a.download = `STEALTH_SURRON_CAD_SHEET_0${activeCadSheetIdx + 1}_1to1.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  img.src = url;
});

// Modal Blueprint System (also wired to 3D Hotspots)
const modalBackdrop = document.getElementById('modal-backdrop');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const modalClose = document.getElementById('modal-close');

function openEngineeringModal(modalKey) {
  const keyToSheetIdx = { dropout: 0, battery: 1, saddle: 2, motor: 3, cordura: 4, wiring: 5 };
  if (modalKey in keyToSheetIdx) {
    openCadTablet(keyToSheetIdx[modalKey]);
    return;
  }
  const data = ENGINEERING_MODALS[modalKey];
  if (!data) return;
  closeMobileDrawers();
  modalTitle.textContent = data.title;
  modalBody.innerHTML = data.html;
  modalBackdrop.classList.add('open');
}

function closeEngineeringModal() {
  modalBackdrop.classList.remove('open');
}

modalClose.addEventListener('click', closeEngineeringModal);
modalBackdrop.addEventListener('click', (e) => {
  if (e.target === modalBackdrop) closeEngineeringModal();
});
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeEngineeringModal();
    closeCadTablet();
  }
});

// 3D Hotspots anchored to the 5 key engineering nodes in 3D space
const HOTSPOT_DEFS = [
  {
    id: 'battery',
    label: '[ АКБ 20S7P (140× 21700) + СХЕМА ]',
    mobileLabel: '[ АКБ 20S7P • СХЕМА ]',
    parent: batterySys.corduraCenterGroup,
    localPos: new THREE.Vector3(0.14, 0.28, 0.045)
  },
  {
    id: 'saddle',
    label: '[ МОТО-СЕДЛО + ПОДРАМНИК ]',
    mobileLabel: '[ СЕДЛО + ПОДРАМНИК ]',
    parent: saddleSys.saddleAndFenderGroup,
    localPos: new THREE.Vector3(-0.28, 0.49, 0.0)
  },
  {
    id: 'dropout',
    label: '[ ДРОПАУТ 6 ММ М14 + ZOOM ]',
    mobileLabel: '[ ДРОПАУТ 6ММ + ZOOM ]',
    parent: rearDropoutNode,
    localPos: new THREE.Vector3(-0.438, 0.08, 0.08)
  },
  {
    id: 'motor',
    label: '[ МОТОР 3000W + ЭЛЕКТРОСХЕМА ]',
    mobileLabel: '[ МОТОР 3000W • СХЕМА ]',
    parent: rearWheelNode,
    localPos: new THREE.Vector3(0.0, -0.08, 0.06)
  },
  {
    id: 'wiring',
    label: '[ 3D-КОРОБ + DC-DC + ГУДОК 105ДБ ]',
    mobileLabel: '[ 3D-КОРОБ 12V + ГУДОК ]',
    parent: underTubeSys.controllerAndLidGroup,
    localPos: new THREE.Vector3(0.11, 0.08, 0.04)
  }
];

const hotspotContainer = document.getElementById('hotspot-markers');
HOTSPOT_DEFS.forEach((h) => {
  const el = document.createElement('div');
  el.className = 'hotspot-pin';
  const textSpan = document.createElement('span');
  textSpan.textContent = window.innerWidth <= 640 ? h.mobileLabel : h.label;
  el.innerHTML = `<span class="dot"></span>`;
  el.appendChild(textSpan);
  el.addEventListener('click', () => openEngineeringModal(h.id));
  hotspotContainer.appendChild(el);
  h.element = el;
  h.textSpan = textSpan;
});

if (btnMobPins) {
  btnMobPins.addEventListener('click', () => {
    arePinsVisible = !arePinsVisible;
    btnMobPins.classList.toggle('active', arePinsVisible);
    hotspotContainer.style.display = arePinsVisible ? 'block' : 'none';
  });
}

function updateHotspotScreenPositions() {
  if (!arePinsVisible) return;
  const tempV = new THREE.Vector3();
  const isCompact = window.innerWidth <= 920;
  const isPhone = window.innerWidth <= 640;
  const marginX = isPhone ? 68 : (isCompact ? 88 : 24);
  const minY = isCompact ? 142 : 80;
  const maxY = window.innerHeight - (isCompact ? 152 : 80);

  const placed = [];
  HOTSPOT_DEFS.forEach((h) => {
    if (h.textSpan) {
      const targetText = isPhone ? h.mobileLabel : h.label;
      if (h.textSpan.textContent !== targetText) h.textSpan.textContent = targetText;
    }
    tempV.copy(h.localPos);
    h.parent.localToWorld(tempV);
    tempV.project(camera);

    if (tempV.z > 1.0) {
      h.element.style.display = 'none';
      return;
    }
    const rawX = (tempV.x * 0.5 + 0.5) * window.innerWidth;
    const rawY = (-(tempV.y * 0.5) + 0.5) * window.innerHeight;
    const x = Math.max(marginX, Math.min(window.innerWidth - marginX, rawX));
    let y = Math.max(minY, Math.min(maxY, rawY));

    // Prevent vertical pin overlap on compact mobile screens
    if (isCompact) {
      for (let i = 0; i < placed.length; i++) {
        if (Math.abs(x - placed[i].x) < 135 && Math.abs(y - placed[i].y) < 24) {
          y = Math.min(maxY, placed[i].y + 25);
        }
      }
      placed.push({ x, y });
    }

    h.element.style.display = 'flex';
    h.element.style.left = `${x}px`;
    h.element.style.top = `${y}px`;
  });
}

// ----------------------------------------------------------------------------
// 11. RESIZE HANDLER & MAIN RENDER LOOP (60 FPS)
// ----------------------------------------------------------------------------
window.addEventListener('resize', () => {
  const aspect = window.innerWidth / Math.max(window.innerHeight, 1);
  camera.aspect = aspect;
  if (currentCameraPresetKey !== 'pov') {
    camera.fov = aspect < 1.0 ? 44 : 28;
  }
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Support optional URL query params (?mode=xray, ?mode=explode, ?mode=side, ?mode=xray_explode, ?mode=pov, ?mode=cad)
const urlParams = new URLSearchParams(window.location.search);
const modeParam = urlParams.get('mode');
if (modeParam === 'xray') {
  setXRayMode(true);
  camera.position.copy(getViewportAdjustedPos(new THREE.Vector3(0.13, 0.27, 0.88), new THREE.Vector3(0.12, 0.26, 0.0)));
  controls.target.set(0.12, 0.26, 0.0);
  controls.update();
} else if (modeParam === 'explode') {
  applyExplodeFactor(1.0);
} else if (modeParam === 'xray_explode') {
  setXRayMode(true);
  applyExplodeFactor(0.55);
  camera.position.copy(getViewportAdjustedPos(new THREE.Vector3(0.14, 0.27, 0.92), new THREE.Vector3(0.12, 0.26, 0.0)));
  controls.target.set(0.12, 0.26, 0.0);
  controls.update();
} else if (modeParam === 'side') {
  camera.position.copy(getViewportAdjustedPos(new THREE.Vector3(0.08, 0.24, 1.98), new THREE.Vector3(0.08, 0.24, 0.0)));
  controls.target.set(0.08, 0.24, 0.0);
  controls.update();
} else if (modeParam === 'pov') {
  currentCameraPresetKey = 'pov';
  setPovModeUI(true);
  camera.fov = 38;
  camera.updateProjectionMatrix();
  camera.position.copy(CAMERA_PRESETS.pov.pos);
  controls.target.copy(CAMERA_PRESETS.pov.target);
  controls.update();
} else if (modeParam === 'cad') {
  openCadTablet(0);
}

function animate(now = performance.now()) {
  requestAnimationFrame(animate);
  updateSw900PhysicsAndScreen(now);
  controls.update();
  updateHotspotScreenPositions();
  renderer.render(scene, camera);
}
animate();
