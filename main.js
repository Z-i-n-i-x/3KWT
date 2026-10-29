// ============================================================================
// STEALTH SUR-RON 72V 3000W — MAIN THREE.JS WEBGL STUDIO SCENE, EXPLODED VIEW
// KINEMATICS (GSAP power3.out + LineDashedMaterial), X-RAY 20S7P RAYCASTER,
// LIVE SW900 60FPS COMPUTER + ODOMETER, POV RIDER MODE & 6-SHEET CAD TABLET
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
controls.minDistance = 0.14;
controls.maxPolarAngle = Math.PI * 0.52;

// ----------------------------------------------------------------------------
// 2. STUDIO LIGHTING & FLOOR CONTACT SHADOWS (y = -0.278m)
// ----------------------------------------------------------------------------
const ambientLight = new THREE.AmbientLight(0xdbe6f5, 0.75);
scene.add(ambientLight);

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

const rimLight = new THREE.DirectionalLight(0x7aa8ff, 1.45);
rimLight.position.set(-2.2, 1.8, -1.8);
scene.add(rimLight);

const fillLight = new THREE.DirectionalLight(0xffcfa8, 0.85);
fillLight.position.set(2.0, 0.4, 1.6);
scene.add(fillLight);

function createStudioContactShadowFloor() {
  const floorGroup = new THREE.Group();
  floorGroup.position.y = -0.256;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, 512, 256);

  const gradRear = ctx.createRadialGradient(145, 128, 4, 145, 128, 75);
  gradRear.addColorStop(0, 'rgba(0,0,0,0.92)');
  gradRear.addColorStop(0.45, 'rgba(0,0,0,0.55)');
  gradRear.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradRear;
  ctx.fillRect(0, 0, 512, 256);

  const gradFront = ctx.createRadialGradient(382, 128, 4, 382, 128, 75);
  gradFront.addColorStop(0, 'rgba(0,0,0,0.92)');
  gradFront.addColorStop(0.45, 'rgba(0,0,0,0.55)');
  gradFront.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradFront;
  ctx.fillRect(0, 0, 512, 256);

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

const frameNode = buildFrameNode(mats);
bikeMasterGroup.add(frameNode);

const frontAssemblyGroup = new THREE.Group();
frontAssemblyGroup.name = 'EXPLODE_FRONT_ASSEMBLY';
const forkNode = buildForkNode(mats);
const cockpitNode = buildCockpitNode(mats);
const frontWheelNode = buildFrontWheelNode(mats);
frontAssemblyGroup.add(forkNode, cockpitNode, frontWheelNode);
bikeMasterGroup.add(frontAssemblyGroup);

const rearWheelNode = buildRearWheelNode(mats);
bikeMasterGroup.add(rearWheelNode);

const rearDropoutNode = buildRearDropoutBrakeNode(mats);
bikeMasterGroup.add(rearDropoutNode);

const batterySys = buildBatterySystemNode(mats);
bikeMasterGroup.add(batterySys.batteryRoot);

const underTubeSys = buildUnderTubeModuleNode(mats);
bikeMasterGroup.add(underTubeSys.underTubeRoot);

const saddleSys = buildMotoSaddleAndSubframeNode(mats);
bikeMasterGroup.add(saddleSys.saddleSystemRoot);

// ----------------------------------------------------------------------------
// 4. VOLUMETRIC HEADLIGHT CONES & REAR LED BRAKE LIGHT TEST SYSTEM
// ----------------------------------------------------------------------------
const lightsTestGroup = new THREE.Group();
lightsTestGroup.name = 'VOLUMETRIC_HEADLIGHT_BEAMS';
lightsTestGroup.visible = false;

[-0.026, 0.026].forEach((zEye) => {
  const spot = new THREE.SpotLight(0xd8f4ff, 6.5, 4.5, Math.PI * 0.16, 0.65, 1.5);
  spot.position.set(0.475, 0.585, zEye);
  const targetObj = new THREE.Object3D();
  targetObj.position.set(2.4, 0.05, zEye * 1.5);
  lightsTestGroup.add(targetObj);
  spot.target = targetObj;
  lightsTestGroup.add(spot);

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

const explodeState = { factor: 0 };
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

  batterySys.pvcSleeveMesh.material.opacity = 0.32 * (1.0 - f * 0.65);

  explodeTargets.forEach((item) => {
    item.group.position.copy(item.basePos).addScaledVector(item.delta, f);

    if (f > 0.02) {
      item.leaderLine.visible = true;
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
// 6. X-RAY 20S7P BATTERY MODE & INTERACTIVE RAYCASTER (1S..20S UNIQUE COLORS)
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

    mats.MAT_CORDURA_1000D.transparent = true;
    mats.MAT_CORDURA_1000D.depthWrite = false;
    mats.MAT_CORDURA_1000D.needsUpdate = true;
    gsap.to(mats.MAT_CORDURA_1000D, { opacity: 0.10, duration: 0.5 });
    batterySys.leftCoverGroup.visible = false;
    batterySys.rightCoverGroup.visible = false;
    batterySys.holderLeftGroup.visible = false;
    batterySys.holderRightGroup.visible = false;

    hoveredSeriesId = -1;
    resetAllBatterySeriesMaterials();
    xrayGroupTitle.textContent = '20S7P (140× 21700): 1S (3.6..4.2V) -> 20S (72..84.0V)';
    if (mobXRayTitle) mobXRayTitle.textContent = 'X-RAY 20S7P: ТАПНИТЕ СЕКЦИЮ 1S..20S';
    if (mobXRayVal) mobXRayVal.textContent = '84.0V • 35Ah';

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
    const { cellMat, busMat, niMat, xrayColor } = sGroup.userData;
    if (isXRayMode && xrayColor) {
      cellMat.color.copy(xrayColor);
      cellMat.emissive.copy(xrayColor);
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
    const { cellMat, busMat, niMat, row, polarityOnLeft, vMin, vMax } = sGroup.userData;

    if (s === seriesId) {
      cellMat.color.setHex(0x00ff66);
      cellMat.emissive.setHex(0x00ff66);
      cellMat.emissiveIntensity = 0.85;
      cellMat.opacity = 1.0;

      busMat.emissive.setHex(0xff5500);
      busMat.emissiveIntensity = 1.6;
      niMat.emissive.setHex(0x00ff66);
      niMat.emissiveIntensity = 1.1;

      const polSideStr = polarityOnLeft > 0 ? '+Z ПЛЮС / -Z МИНУС' : '+Z МИНУС / -Z ПЛЮС';
      xrayGroupTitle.textContent = `Group_${s}S (РЯД #${row}, ЯЧЕЙКИ #${(s - 1) * 7 + 1}..#${s * 7})`;
      xrayGroupCfg.textContent = `${s}S7P (${polSideStr})`;
      xrayGroupVolt.textContent = `${vMin}V .. ${vMax}V`;
      xrayGroupTemp.textContent = `NTC ${sGroup.userData.ntcTemp}°C / Cu 2.5мм²`;

      if (mobXRayTitle) mobXRayTitle.textContent = `Group_${s}S (${vMin}..${vMax}V)`;
      if (mobXRayVal) mobXRayVal.textContent = `${polSideStr} • ${sGroup.userData.ntcTemp}°C`;
    } else {
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

// ----------------------------------------------------------------------------
// 7. LIVE SW900 ON-BOARD COMPUTER, PAS 1..5, WATTMETER & ODOMETER (LOCALSTORAGE)
// ----------------------------------------------------------------------------
const ODO_STORAGE_KEY = 'stealth_surron_sw900_odo_km';
let savedOdo = 128.45;
try {
  const raw = localStorage.getItem(ODO_STORAGE_KEY);
  if (raw !== null && !Number.isNaN(parseFloat(raw))) {
    savedOdo = Math.max(0, parseFloat(raw));
  }
} catch (e) {
  // Ignore storage restrictions
}

const sw900State = {
  pas: 5,
  throttlePct: 0,
  regenBrakeOn: false,
  lightsOn: false,
  speedKmh: 0.0,
  voltageOpen: 84.0,
  voltageLive: 84.0,
  currentAmps: 0.0,
  watts: 0,
  odoKm: savedOdo,
  tripKm: 0.00,
  maxSpeedKmh: 0.0,
  tripTimeSec: 0.0,
  modeIndex: 0
};

const PAS_PROFILES = {
  1: { maxSpeed: 24.9, maxAmps: 3.1 },
  2: { maxSpeed: 35.0, maxAmps: 14.0 },
  3: { maxSpeed: 45.0, maxAmps: 26.0 },
  4: { maxSpeed: 64.0, maxAmps: 42.0 },
  5: { maxSpeed: 82.4, maxAmps: 60.0 }
};

const sw900HudCanvas = document.getElementById('sw900-hud-canvas');
const sw900HudCtx = sw900HudCanvas ? sw900HudCanvas.getContext('2d') : null;
const sliderThrottle = document.getElementById('slider-throttle');
const throttleLabel = document.getElementById('throttle-label');
const btnRegenBrake = document.getElementById('btn-regen-brake');
const btnPovRider = document.getElementById('btn-pov-rider');
const sw900Widget = document.getElementById('sw900-hud-widget');
const sw900PovBadge = document.getElementById('sw900-pov-badge');
const topMetricVolt = document.getElementById('top-metric-volt');
const topMetricOdo = document.getElementById('top-metric-odo');

function changeSw900Pas(delta) {
  sw900State.pas = Math.max(1, Math.min(5, sw900State.pas + delta));
}

function cycleSw900Mode() {
  sw900State.modeIndex = (sw900State.modeIndex + 1) % 5;
}

document.getElementById('sw900-btn-up')?.addEventListener('click', () => changeSw900Pas(1));
document.getElementById('sw900-btn-down')?.addEventListener('click', () => changeSw900Pas(-1));
document.getElementById('sw900-btn-mode')?.addEventListener('click', () => cycleSw900Mode());

if (sliderThrottle) {
  sliderThrottle.addEventListener('input', (e) => {
    sw900State.throttlePct = parseFloat(e.target.value) || 0;
    if (sw900State.throttlePct > 0 && sw900State.regenBrakeOn) {
      setBrakeAndRegenState(false);
    }
    if (throttleLabel) throttleLabel.textContent = `ГАЗ: ${Math.round(sw900State.throttlePct)}%`;
  });
}

function setBrakeAndRegenState(active) {
  sw900State.regenBrakeOn = active;
  if (btnRegenBrake) btnRegenBrake.classList.toggle('active', active);
  if (active) {
    mats.MAT_BRAKE_LED.emissive.setHex(0xff0000);
    mats.MAT_BRAKE_LED.emissiveIntensity = 4.2;
    rearBrakePointLight.intensity = 3.8;
  } else if (!isLightsAndBrakeOn) {
    mats.MAT_BRAKE_LED.emissiveIntensity = 0.35;
    rearBrakePointLight.intensity = 0.0;
  }
}

if (btnRegenBrake) {
  btnRegenBrake.addEventListener('click', () => {
    const next = !sw900State.regenBrakeOn;
    if (next && sw900State.throttlePct === 0 && sw900State.speedKmh < 5) {
      sw900State.speedKmh = 52.0;
    }
    if (next && sliderThrottle) {
      sw900State.throttlePct = 0;
      sliderThrottle.value = '0';
      if (throttleLabel) throttleLabel.textContent = 'ГАЗ: 0%';
    }
    setBrakeAndRegenState(next);
  });
}

window.addEventListener('keydown', (e) => {
  if (['1', '2', '3', '4', '5'].includes(e.key)) {
    sw900State.pas = parseInt(e.key, 10);
  } else if (e.key === 'm' || e.key === 'M' || e.key === 'ь' || e.key === 'Ь') {
    cycleSw900Mode();
  }
});

let lastOdoSaveTime = 0;
function updateSw900PhysicsAndScreen(dt) {
  const profile = PAS_PROFILES[sw900State.pas] || PAS_PROFILES[5];
  const thr = sw900State.throttlePct / 100;

  if (sw900State.regenBrakeOn) {
    sw900State.speedKmh = Math.max(0, sw900State.speedKmh - dt * 24.0);
    if (sw900State.speedKmh > 2.0) {
      const regenFactor = Math.min(1.0, sw900State.speedKmh / 45.0);
      sw900State.currentAmps = -20.5 * regenFactor;
    } else {
      sw900State.currentAmps = 0;
    }
  } else {
    const targetSpeed = profile.maxSpeed * thr;
    const accelRate = targetSpeed > sw900State.speedKmh ? 22.0 : 9.5;
    sw900State.speedKmh += (targetSpeed - sw900State.speedKmh) * Math.min(1.0, dt * (accelRate / 10));
    if (sw900State.speedKmh < 0.08 && thr === 0) sw900State.speedKmh = 0;

    if (thr > 0.01) {
      sw900State.currentAmps = profile.maxAmps * Math.pow(thr, 1.15);
    } else {
      sw900State.currentAmps = 0;
    }
  }

  const rInternal = 0.07;
  sw900State.voltageLive = Math.max(60.0, Math.min(84.6, sw900State.voltageOpen - sw900State.currentAmps * rInternal));

  if (sw900State.regenBrakeOn && sw900State.speedKmh > 2.0) {
    sw900State.watts = Math.round(-1650 * Math.min(1.0, sw900State.speedKmh / 42.0));
  } else if (sw900State.pas === 1 && thr > 0.01) {
    sw900State.watts = Math.round(240 * thr);
  } else if (sw900State.pas === 5 && thr > 0.01) {
    sw900State.watts = Math.round(4320 * Math.pow(thr, 1.1));
  } else {
    sw900State.watts = Math.round(sw900State.voltageLive * sw900State.currentAmps);
  }

  if (sw900State.speedKmh > 0.1) {
    const dKm = (sw900State.speedKmh / 3600) * dt;
    sw900State.odoKm += dKm;
    sw900State.tripKm += dKm;
    sw900State.tripTimeSec += dt;
    if (sw900State.speedKmh > sw900State.maxSpeedKmh) {
      sw900State.maxSpeedKmh = sw900State.speedKmh;
    }
    sw900State.voltageOpen = Math.max(64.0, sw900State.voltageOpen - dKm * 0.18);

    const wheelRadiusM = 0.345;
    const speedMs = sw900State.speedKmh / 3.6;
    const dAngle = (speedMs * dt) / wheelRadiusM;
    frontWheelNode.rotation.z -= dAngle;
    rearWheelNode.rotation.z -= dAngle;

    const now = performance.now();
    if (now - lastOdoSaveTime > 1500) {
      lastOdoSaveTime = now;
      try {
        localStorage.setItem(ODO_STORAGE_KEY, sw900State.odoKm.toFixed(3));
      } catch (e) {
        // ignore
      }
    }
  }

  const avgSpeedKmh = sw900State.tripTimeSec > 1.0
    ? (sw900State.tripKm / (sw900State.tripTimeSec / 3600))
    : 0.0;

  const socRatio = Math.max(0, Math.min(1, (sw900State.voltageLive - 62.0) / (84.0 - 62.0)));
  const socBars = Math.max(1, Math.min(5, Math.ceil(socRatio * 5)));

  if (mats.sw900Controller) {
    mats.sw900Controller.updateSw900({
      voltage: sw900State.voltageLive,
      socBars,
      speedKmh: sw900State.speedKmh,
      pas: sw900State.pas,
      watts: sw900State.watts,
      odoKm: sw900State.odoKm,
      tripKm: sw900State.tripKm,
      maxSpeedKmh: sw900State.maxSpeedKmh,
      avgSpeedKmh,
      tripTimeSec: sw900State.tripTimeSec,
      modeIndex: sw900State.modeIndex,
      lightsOn: isLightsAndBrakeOn,
      brakeOn: sw900State.regenBrakeOn || isLightsAndBrakeOn
    });

    if (sw900HudCtx) {
      sw900HudCtx.drawImage(mats.sw900Controller.canvas, 0, 0);
    }
  }

  if (topMetricVolt) {
    topMetricVolt.textContent = `${sw900State.voltageLive.toFixed(1)}V / ${sw900State.watts}W`;
  }
  if (topMetricOdo) {
    topMetricOdo.textContent = `${sw900State.odoKm.toFixed(2)} KM`;
  }
}

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function check3DSw900ButtonClick(clientX, clientY) {
  pointer.x = (clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(cockpitNode.children, true);
  for (let i = 0; i < hits.length; i++) {
    const act = hits[i].object.userData?.sw900Button;
    if (act === 'UP') {
      changeSw900Pas(1);
      return true;
    }
    if (act === 'DOWN') {
      changeSw900Pas(-1);
      return true;
    }
    if (act === 'MODE') {
      cycleSw900Mode();
      return true;
    }
  }
  return false;
}

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
  if (check3DSw900ButtonClick(e.clientX, e.clientY)) return;
  if (e.pointerType === 'touch' || window.innerWidth <= 920) {
    inspectBatteryAtClientXY(e.clientX, e.clientY);
  }
});

// ----------------------------------------------------------------------------
// 8. TEST BRAKE & SUR-RON HEADLIGHT SWITCH
// ----------------------------------------------------------------------------
let isLightsAndBrakeOn = false;
const btnLights = document.getElementById('btn-lights');

btnLights.addEventListener('click', () => {
  isLightsAndBrakeOn = !isLightsAndBrakeOn;
  lightsTestGroup.visible = isLightsAndBrakeOn;

  if (isLightsAndBrakeOn) {
    btnLights.classList.add('active-orange');
    mats.MAT_HEADLIGHT_LED.emissiveIntensity = 4.5;
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
// 9. CAMERA PRESETS (INCLUDING RIDER POV FIRST-PERSON VIEW), DRAWERS & HOTSPOTS
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
  pov: { pos: new THREE.Vector3(-0.08, 0.86, 0.04), target: new THREE.Vector3(0.412, 0.648, 0.055), code: 'POV-08' },
  fork: { pos: new THREE.Vector3(1.12, 0.30, 0.88), target: new THREE.Vector3(0.50, 0.25, 0.0), code: 'FRK-01' },
  cockpit: { pos: new THREE.Vector3(0.92, 0.74, 0.62), target: new THREE.Vector3(0.42, 0.61, 0.0), code: 'CKP-02' },
  wheels: { pos: new THREE.Vector3(-0.42, 0.10, 1.15), target: new THREE.Vector3(-0.445, 0.015, 0.0), code: 'WHL-03' },
  dropout: { pos: new THREE.Vector3(-0.38, 0.12, 0.54), target: new THREE.Vector3(-0.445, 0.04, 0.065), code: 'BRK-04' },
  battery: { pos: new THREE.Vector3(0.14, 0.28, 1.05), target: new THREE.Vector3(0.12, 0.27, 0.0), code: 'BAT-05' },
  controller: { pos: new THREE.Vector3(0.48, -0.02, 0.74), target: new THREE.Vector3(0.18, 0.18, 0.0), code: 'ESC-06' },
  saddle: { pos: new THREE.Vector3(-0.28, 0.65, 0.88), target: new THREE.Vector3(-0.34, 0.50, 0.0), code: 'SDL-07' }
};

function setPovMode(enable) {
  if (sw900Widget) sw900Widget.classList.toggle('pov-enlarged', enable);
  if (btnPovRider) btnPovRider.classList.toggle('active', enable);
  if (sw900PovBadge) sw900PovBadge.textContent = enable ? 'РЕЖИМ POV 1:1' : 'РУЛЬ + HUD';
  if (enable) {
    currentCameraPresetKey = 'pov';
    activeNodeIndicator.textContent = 'POV-08';
    gsap.to(camera.position, {
      x: CAMERA_PRESETS.pov.pos.x,
      y: CAMERA_PRESETS.pov.pos.y,
      z: CAMERA_PRESETS.pov.pos.z,
      duration: 1.1,
      ease: 'power3.out'
    });
    gsap.to(controls.target, {
      x: CAMERA_PRESETS.pov.target.x,
      y: CAMERA_PRESETS.pov.target.y,
      z: CAMERA_PRESETS.pov.target.z,
      duration: 1.1,
      ease: 'power3.out'
    });
  }
}

if (btnPovRider) {
  btnPovRider.addEventListener('click', () => {
    const nextPov = currentCameraPresetKey !== 'pov';
    if (nextPov) {
      setPovMode(true);
    } else {
      setPovMode(false);
      currentCameraPresetKey = 'default';
      flyCameraTo(DEFAULT_CAM_POS, DEFAULT_CAM_TARGET);
    }
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
    closeMobileDrawers();
    openCadTablet(0);
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
      if (key === 'pov') {
        setPovMode(true);
      } else {
        setPovMode(false);
        flyCameraTo(preset.pos, preset.target);
      }
      closeMobileDrawers();
    }
  });
});

document.getElementById('btn-reset-cam').addEventListener('click', () => {
  if (isXRayMode) setXRayMode(false);
  setPovMode(false);
  currentCameraPresetKey = 'default';
  closeMobileDrawers();
  flyCameraTo(DEFAULT_CAM_POS, DEFAULT_CAM_TARGET);
});

// ----------------------------------------------------------------------------
// 10. FULLSCREEN 6-SHEET ENGINEERING CAD TABLET (ZOOM / PAN / PNG & SVG DOWNLOAD)
// ----------------------------------------------------------------------------
const cadTabletBackdrop = document.getElementById('cad-tablet-backdrop');
const cadSheetStage = document.getElementById('cad-sheet-stage');
const cadViewportWrap = document.getElementById('cad-viewport-wrap');
const cadTabletTitle = document.getElementById('cad-tablet-title');
const cadSheetSummary = document.getElementById('cad-sheet-summary');
const cadZoomIndicator = document.getElementById('cad-zoom-indicator');
const cadTabBtns = document.querySelectorAll('.cad-tab-btn');

let activeCadSheetIdx = 0;
let cadZoom = 1.0;
let cadPanX = 0;
let cadPanY = 0;
let isCadWhiteTheme = false;

function applyCadTransform() {
  if (!cadSheetStage) return;
  cadSheetStage.style.transform = `translate(${cadPanX}px, ${cadPanY}px) scale(${cadZoom})`;
  if (cadZoomIndicator) cadZoomIndicator.textContent = `МАСШТАБ: ${Math.round(cadZoom * 100)}%`;
}

function renderCadSheet(idx) {
  activeCadSheetIdx = Math.max(0, Math.min(CAD_SHEETS_6.length - 1, idx));
  const sheet = CAD_SHEETS_6[activeCadSheetIdx];
  if (!sheet || !cadSheetStage) return;

  cadSheetStage.innerHTML = sheet.svg;
  if (cadTabletTitle) cadTabletTitle.textContent = `📐 ${sheet.title}`;
  if (cadSheetSummary) cadSheetSummary.textContent = sheet.specSummary;

  cadTabBtns.forEach((b, i) => b.classList.toggle('active', i === activeCadSheetIdx));
  cadZoom = Math.min(1.0, (window.innerWidth - 40) / 1120);
  cadPanX = 0;
  cadPanY = 0;
  applyCadTransform();
}

function openCadTablet(sheetIdx = 0) {
  closeMobileDrawers();
  if (!cadTabletBackdrop) return;
  cadTabletBackdrop.classList.add('open');
  renderCadSheet(sheetIdx);
}

function closeCadTablet() {
  if (cadTabletBackdrop) cadTabletBackdrop.classList.remove('open');
}

document.getElementById('btn-open-cad-tablet')?.addEventListener('click', () => openCadTablet(activeCadSheetIdx));
document.getElementById('btn-open-cad-tablet-side')?.addEventListener('click', () => openCadTablet(activeCadSheetIdx));
document.getElementById('btn-cad-close')?.addEventListener('click', closeCadTablet);

cadTabBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const idx = parseInt(btn.getAttribute('data-tab'), 10) || 0;
    renderCadSheet(idx);
  });
});

document.querySelectorAll('.blueprint-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const sIdx = btn.getAttribute('data-sheet');
    if (sIdx !== null) {
      openCadTablet(parseInt(sIdx, 10) || 0);
    }
  });
});

document.getElementById('btn-cad-zoom-in')?.addEventListener('click', () => {
  cadZoom = Math.min(3.0, cadZoom + 0.2);
  applyCadTransform();
});
document.getElementById('btn-cad-zoom-out')?.addEventListener('click', () => {
  cadZoom = Math.max(0.45, cadZoom - 0.2);
  applyCadTransform();
});
document.getElementById('btn-cad-zoom-reset')?.addEventListener('click', () => {
  cadZoom = 1.0;
  cadPanX = 0;
  cadPanY = 0;
  applyCadTransform();
});
document.getElementById('btn-cad-theme')?.addEventListener('click', () => {
  isCadWhiteTheme = !isCadWhiteTheme;
  if (cadSheetStage) cadSheetStage.classList.toggle('white-theme', isCadWhiteTheme);
});

if (cadViewportWrap) {
  cadViewportWrap.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.12 : -0.12;
    cadZoom = Math.max(0.45, Math.min(3.2, cadZoom + delta));
    applyCadTransform();
  }, { passive: false });

  let isDraggingCad = false;
  let dragStartX = 0;
  let dragStartY = 0;
  cadViewportWrap.addEventListener('pointerdown', (e) => {
    isDraggingCad = true;
    dragStartX = e.clientX - cadPanX;
    dragStartY = e.clientY - cadPanY;
  });
  window.addEventListener('pointermove', (e) => {
    if (!isDraggingCad) return;
    cadPanX = e.clientX - dragStartX;
    cadPanY = e.clientY - dragStartY;
    applyCadTransform();
  });
  window.addEventListener('pointerup', () => {
    isDraggingCad = false;
  });
}

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
  a.remove();
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
    c.toBlob((pngBlob) => {
      if (!pngBlob) return;
      const pngUrl = URL.createObjectURL(pngBlob);
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = `STEALTH_SURRON_CAD_SHEET_0${activeCadSheetIdx + 1}_1to1.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(pngUrl);
    }, 'image/png');
  };
  img.src = url;
});

const modalBackdrop = document.getElementById('modal-backdrop');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const modalClose = document.getElementById('modal-close');

function openEngineeringModal(modalKey) {
  const sheetMap = { dropout: 0, battery: 1, saddle: 2, motor: 3, cordura: 4, wiring: 5 };
  if (modalKey in sheetMap) {
    openCadTablet(sheetMap[modalKey]);
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

// 3D Hotspots anchored to the key engineering nodes in 3D space
const HOTSPOT_DEFS = [
  {
    id: 'battery',
    label: '[ АКБ 20S7P (140× 21700) + ЧЕРТЕЖ №2 ]',
    mobileLabel: '[ АКБ 20S7P • ЛИСТ №2 ]',
    parent: batterySys.corduraCenterGroup,
    localPos: new THREE.Vector3(0.14, 0.28, 0.045)
  },
  {
    id: 'saddle',
    label: '[ МОТО-СЕДЛО + ПОДРАМНИК (ЛИСТ №3) ]',
    mobileLabel: '[ СЕДЛО • ЛИСТ №3 ]',
    parent: saddleSys.saddleAndFenderGroup,
    localPos: new THREE.Vector3(-0.28, 0.49, 0.0)
  },
  {
    id: 'dropout',
    label: '[ ДРОПАУТ 6 ММ М14 + IS 51ММ (ЛИСТ №1) ]',
    mobileLabel: '[ ДРОПАУТ 6ММ • ЛИСТ №1 ]',
    parent: rearDropoutNode,
    localPos: new THREE.Vector3(-0.438, 0.08, 0.08)
  },
  {
    id: 'motor',
    label: '[ ЭЛЕКТРОСХЕМА 72V/12V + EBS (ЛИСТ №4) ]',
    mobileLabel: '[ СХЕМА 72V/12V • ЛИСТ №4 ]',
    parent: rearWheelNode,
    localPos: new THREE.Vector3(0.0, -0.08, 0.06)
  },
  {
    id: 'wiring',
    label: '[ 3D-КОРОБ PETG + ГУДОК 105ДБ (ЛИСТ №6) ]',
    mobileLabel: '[ 3D-КОРОБ • ЛИСТ №6 ]',
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
// 11. RESIZE HANDLER & MAIN 60FPS RENDER LOOP
// ----------------------------------------------------------------------------
window.addEventListener('resize', () => {
  const aspect = window.innerWidth / Math.max(window.innerHeight, 1);
  camera.aspect = aspect;
  camera.fov = aspect < 1.0 ? 44 : 28;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

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
} else if (modeParam === 'pov') {
  setPovMode(true);
} else if (modeParam === 'cad') {
  openCadTablet(parseInt(urlParams.get('sheet') || '0', 10));
} else if (modeParam === 'side') {
  camera.position.copy(getViewportAdjustedPos(new THREE.Vector3(0.08, 0.24, 1.98), new THREE.Vector3(0.08, 0.24, 0.0)));
  controls.target.set(0.08, 0.24, 0.0);
  controls.update();
}

let prevFrameTime = performance.now();
function animate() {
  requestAnimationFrame(animate);
  const now = performance.now();
  const dt = Math.min(0.1, Math.max(0.001, (now - prevFrameTime) / 1000));
  prevFrameTime = now;

  updateSw900PhysicsAndScreen(dt);
  controls.update();
  updateHotspotScreenPositions();
  renderer.render(scene, camera);
}
animate();
