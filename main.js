// ============================================================================
// STEALTH SUR-RON 72V 3000W — MAIN THREE.JS WEBGL STUDIO SCENE, EXPLODED VIEW
// KINEMATICS (GSAP power3.out + LineDashedMaterial), X-RAY 20S7P RAYCASTER,
// VOLUMETRIC SUR-RON HEADLIGHT CONES & INTERACTIVE HOTSPOTS
// ============================================================================
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import gsap from 'gsap';

import { createStealthMaterials } from './materials.js';
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
import { ENGINEERING_MODALS } from './engineering_modals.js';

// ----------------------------------------------------------------------------
// 1. INITIALIZE CLEAN STUDIO WEBGL SCENE (#050505 + ContactShadows @ y = -0.335)
// ----------------------------------------------------------------------------
const container = document.getElementById('webgl-container');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(28, window.innerWidth / window.innerHeight, 0.02, 40);
// Studio telephoto 3/4 front-left angle matching Reference Photo #1 without wide-angle wheel distortion
const DEFAULT_CAM_POS = new THREE.Vector3(1.42, 0.48, 2.15);
const DEFAULT_CAM_TARGET = new THREE.Vector3(0.06, 0.21, 0.0);

function getViewportAdjustedPos(basePos, targetVec) {
  const aspect = window.innerWidth / Math.max(window.innerHeight, 1);
  // On portrait mobile screens (aspect < 1.25), pull the camera back proportionally so the horizontal bike fits 100%
  const distScale = aspect < 1.25 ? Math.min(2.72, 1.32 / Math.max(aspect, 0.40)) : 1.0;
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
    mats.MAT_CORDURA_1000D.depthWrite = false;
    gsap.to(mats.MAT_CORDURA_1000D, { opacity: 0.10, duration: 0.5 });
    batterySys.leftCoverGroup.visible = false;
    batterySys.rightCoverGroup.visible = false;
    batterySys.holderLeftGroup.visible = false;
    batterySys.holderRightGroup.visible = false;

    // Show all 20 sections (140 cells) at full opacity on entry; hovering/tapping any section highlights it!
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

    mats.MAT_CORDURA_1000D.depthWrite = true;
    gsap.to(mats.MAT_CORDURA_1000D, { opacity: 1.0, duration: 0.5 });
    batterySys.leftCoverGroup.visible = true;
    batterySys.rightCoverGroup.visible = true;
    batterySys.holderLeftGroup.visible = true;
    batterySys.holderRightGroup.visible = true;
    resetAllBatterySeriesMaterials();
  }
}

function resetAllBatterySeriesMaterials() {
  if (hoveredSeriesId === null) return;
  hoveredSeriesId = null;
  batterySys.seriesGroups.forEach((sGroup) => {
    const { cellMat, busMat, niMat } = sGroup.userData;
    cellMat.color.setHex(0x3b82a6);
    cellMat.emissive.setHex(0x000000);
    cellMat.emissiveIntensity = 0;
    cellMat.opacity = 1.0;

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
      cellMat.color.setHex(0x00ff66);
      cellMat.emissive.setHex(0x00ff66);
      cellMat.emissiveIntensity = 0.85;
      cellMat.opacity = 1.0;

      busMat.emissive.setHex(0xff5500);
      busMat.emissiveIntensity = 1.6;
      niMat.emissive.setHex(0x00ff66);
      niMat.emissiveIntensity = 1.1;

      const polSideStr = polarityOnLeft > 0 ? '+Z ПЛЮС / -Z МИНУС' : '+Z МИНУС / -Z ПЛЮС';
      xrayGroupTitle.textContent = `СЕКЦИЯ ${s}S (РЯД #${row}, ЯЧЕЙКИ #${(s - 1) * 7 + 1}..#${s * 7})`;
      xrayGroupCfg.textContent = `${s}S7P (${polSideStr})`;
      xrayGroupVolt.textContent = `4.20 V (∑ ${(s * 4.2).toFixed(1)}V)`;
      xrayGroupTemp.textContent = `NTC ${sGroup.userData.ntcTemp}°C / Cu 2.5мм²`;

      if (mobXRayTitle) mobXRayTitle.textContent = `СЕКЦИЯ ${s}S (ЯРУС #${row} • #${(s - 1) * 7 + 1}..#${s * 7})`;
      if (mobXRayVal) mobXRayVal.textContent = `4.2V (∑${(s * 4.2).toFixed(1)}V) • ${sGroup.userData.ntcTemp}°C`;
    } else {
      // Other 133 cells fade into semi-transparent glass (opacity: 0.16)
      cellMat.color.setHex(0x3b82a6);
      cellMat.emissive.setHex(0x000000);
      cellMat.emissiveIntensity = 0.0;
      cellMat.opacity = 0.16;

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

// Raycaster for hovering (desktop) or tapping (mobile) any of the 20 groups (1S..20S) in X-Ray or Exploded mode
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

window.addEventListener('pointermove', (e) => {
  if (e.pointerType === 'touch') return;
  inspectBatteryAtClientXY(e.clientX, e.clientY);
});

renderer.domElement.addEventListener('pointerdown', (e) => {
  if (e.pointerType === 'touch' || window.innerWidth <= 920) {
    inspectBatteryAtClientXY(e.clientX, e.clientY);
  }
});

// ----------------------------------------------------------------------------
// 7. TEST BRAKE & SUR-RON HEADLIGHT SWITCH
// ----------------------------------------------------------------------------
let isLightsAndBrakeOn = false;
const btnLights = document.getElementById('btn-lights');

btnLights.addEventListener('click', () => {
  isLightsAndBrakeOn = !isLightsAndBrakeOn;
  lightsTestGroup.visible = isLightsAndBrakeOn;

  if (isLightsAndBrakeOn) {
    btnLights.classList.add('active-orange');
    // Sur-Ron Dual LED eyes ignite bright white/cyan
    mats.MAT_HEADLIGHT_LED.emissiveIntensity = 4.5;
    // Rear LED Brake Light flashes bright red (emissive: 0xff0000, emissiveIntensity: 4.0)
    mats.MAT_BRAKE_LED.emissive.setHex(0xff0000);
    mats.MAT_BRAKE_LED.emissiveIntensity = 4.0;
    rearBrakePointLight.intensity = 3.5;
  } else {
    btnLights.classList.remove('active-orange');
    mats.MAT_HEADLIGHT_LED.emissiveIntensity = 0.5;
    mats.MAT_BRAKE_LED.emissiveIntensity = 0.35;
    rearBrakePointLight.intensity = 0.0;
  }
});

// ----------------------------------------------------------------------------
// 8. CAMERA PRESETS, MOBILE DRAWERS & 3D SCREEN-SPACE INTERACTIVE HOTSPOTS
// ----------------------------------------------------------------------------
function flyCameraTo(posVec, targetVec) {
  const adjustedPos = getViewportAdjustedPos(posVec, targetVec);
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
  fork: { pos: new THREE.Vector3(1.12, 0.30, 0.88), target: new THREE.Vector3(0.50, 0.25, 0.0), code: 'FRK-01' },
  cockpit: { pos: new THREE.Vector3(0.92, 0.74, 0.62), target: new THREE.Vector3(0.42, 0.61, 0.0), code: 'CKP-02' },
  wheels: { pos: new THREE.Vector3(-0.42, 0.10, 1.15), target: new THREE.Vector3(-0.445, 0.015, 0.0), code: 'WHL-03' },
  dropout: { pos: new THREE.Vector3(-0.38, 0.12, 0.54), target: new THREE.Vector3(-0.445, 0.04, 0.065), code: 'BRK-04' },
  battery: { pos: new THREE.Vector3(0.14, 0.28, 1.05), target: new THREE.Vector3(0.12, 0.27, 0.0), code: 'BAT-05' },
  controller: { pos: new THREE.Vector3(0.48, -0.02, 0.74), target: new THREE.Vector3(0.18, 0.18, 0.0), code: 'ESC-06' },
  saddle: { pos: new THREE.Vector3(-0.28, 0.65, 0.88), target: new THREE.Vector3(-0.34, 0.50, 0.0), code: 'SDL-07' }
};

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
      flyCameraTo(preset.pos, preset.target);
      closeMobileDrawers();
    }
  });
});

document.getElementById('btn-reset-cam').addEventListener('click', () => {
  if (isXRayMode) setXRayMode(false);
  currentCameraPresetKey = 'default';
  closeMobileDrawers();
  flyCameraTo(DEFAULT_CAM_POS, DEFAULT_CAM_TARGET);
});

// Modal Blueprint System
const modalBackdrop = document.getElementById('modal-backdrop');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const modalClose = document.getElementById('modal-close');

function openEngineeringModal(modalKey) {
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
  if (e.key === 'Escape') closeEngineeringModal();
});

document.querySelectorAll('.blueprint-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    openEngineeringModal(btn.getAttribute('data-modal'));
  });
});

// 3D Hotspots anchored to the 5 key engineering nodes in 3D space
const HOTSPOT_DEFS = [
  {
    id: 'battery',
    label: '[ АКБ 20S7P (140× 21700) + СХЕМА ]',
    parent: batterySys.corduraCenterGroup,
    localPos: new THREE.Vector3(0.14, 0.28, 0.045)
  },
  {
    id: 'saddle',
    label: '[ МОТО-СЕДЛО + ПОДРАМНИК ]',
    parent: saddleSys.saddleAndFenderGroup,
    localPos: new THREE.Vector3(-0.28, 0.49, 0.0)
  },
  {
    id: 'dropout',
    label: '[ ДРОПАУТ 6 ММ М14 + ZOOM ]',
    parent: rearDropoutNode,
    localPos: new THREE.Vector3(-0.438, 0.08, 0.08)
  },
  {
    id: 'motor',
    label: '[ МОТОР 3000W + ПМС-100 ]',
    parent: rearWheelNode,
    localPos: new THREE.Vector3(0.0, -0.08, 0.06)
  },
  {
    id: 'wiring',
    label: '[ 3D-КОРОБ + DC-DC + ГУДОК 105ДБ ]',
    parent: underTubeSys.controllerAndLidGroup,
    localPos: new THREE.Vector3(0.11, 0.08, 0.04)
  }
];

const hotspotContainer = document.getElementById('hotspot-markers');
HOTSPOT_DEFS.forEach((h) => {
  const el = document.createElement('div');
  el.className = 'hotspot-pin';
  el.innerHTML = `<span class="dot"></span><span>${h.label}</span>`;
  el.addEventListener('click', () => openEngineeringModal(h.id));
  hotspotContainer.appendChild(el);
  h.element = el;
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
  const marginX = isCompact ? 88 : 24;
  const minY = isCompact ? 136 : 80;
  const maxY = window.innerHeight - (isCompact ? 148 : 80);

  HOTSPOT_DEFS.forEach((h) => {
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
    const y = Math.max(minY, Math.min(maxY, rawY));
    h.element.style.display = 'flex';
    h.element.style.left = `${x}px`;
    h.element.style.top = `${y}px`;
  });
}

// ----------------------------------------------------------------------------
// 9. RESIZE HANDLER & MAIN RENDER LOOP
// ----------------------------------------------------------------------------
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Support optional URL query params (?mode=xray, ?mode=explode, ?mode=side, ?mode=xray_explode)
const urlParams = new URLSearchParams(window.location.search);
const modeParam = urlParams.get('mode');
if (modeParam === 'xray') {
  setXRayMode(true);
  camera.position.copy(getViewportAdjustedPos(new THREE.Vector3(0.13, 0.27, 0.88), new THREE.Vector3(0.12, 0.26, 0.0)));
  controls.target.set(0.12, 0.26, 0.0);
  controls.update();
} else if (modeParam === 'explode') {
  applyExplodeFactor(1.0, false);
} else if (modeParam === 'xray_explode') {
  setXRayMode(true);
  applyExplodeFactor(0.55, false);
  camera.position.copy(getViewportAdjustedPos(new THREE.Vector3(0.14, 0.27, 0.92), new THREE.Vector3(0.12, 0.26, 0.0)));
  controls.target.set(0.12, 0.26, 0.0);
  controls.update();
} else if (modeParam === 'side') {
  camera.position.copy(getViewportAdjustedPos(new THREE.Vector3(0.08, 0.24, 1.98), new THREE.Vector3(0.08, 0.24, 0.0)));
  controls.target.set(0.08, 0.24, 0.0);
  controls.update();
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  updateHotspotScreenPositions();
  renderer.render(scene, camera);
}
animate();
