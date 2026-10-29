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
  preserveDrawingBuffer: true,
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
const studioFloorGroup = createStudioContactShadowFloor();
scene.add(studioFloorGroup);

//increase camera far plane for 3D open-world locations (600m visibility)
camera.far = 450;
camera.updateProjectionMatrix();

// ----------------------------------------------------------------------------
// 3. ASSEMBLE ALL 7 HIGH-POLY CAD NODES + WORLD / WHEELIE / STEERING HIERARCHY
// ----------------------------------------------------------------------------
const mats = createStealthMaterials();

// World Root -> Cornering Lean Group -> Rear-Axle Wheelie Pivot -> Bike Master
const bikeWorldRoot = new THREE.Group();
bikeWorldRoot.name = 'BIKE_WORLD_ROOT';
scene.add(bikeWorldRoot);

const bikeLeanGroup = new THREE.Group();
bikeLeanGroup.name = 'BIKE_CORNER_LEAN_GROUP';
bikeWorldRoot.add(bikeLeanGroup);

const REAR_AXLE_LOCAL = new THREE.Vector3(-0.438, 0.015, 0);
const bikeWheeliePivot = new THREE.Group();
bikeWheeliePivot.name = 'BIKE_WHEELIE_REAR_AXLE_PIVOT';
bikeWheeliePivot.position.copy(REAR_AXLE_LOCAL);
bikeLeanGroup.add(bikeWheeliePivot);

const bikeMasterGroup = new THREE.Group();
bikeMasterGroup.name = 'STEALTH_SURRON_72V_3000W_MASTER';
bikeMasterGroup.position.copy(REAR_AXLE_LOCAL).negate();
bikeWheeliePivot.add(bikeMasterGroup);

// Keep studio contact shadow under the bike as it rides
bikeLeanGroup.add(studioFloorGroup);

const frameNode = buildFrameNode(mats);
bikeMasterGroup.add(frameNode);

const frontAssemblyGroup = new THREE.Group();
frontAssemblyGroup.name = 'EXPLODE_FRONT_ASSEMBLY';

// Headtube steering axis: pHeadBot (0.425, 0.450, 0) -> pHeadTop (0.390, 0.565, 0)
const HEAD_PIVOT_ORIGIN = new THREE.Vector3(0.425, 0.450, 0);
const HEAD_STEER_AXIS = new THREE.Vector3(-0.035, 0.115, 0).normalize();
const steeringPivotGroup = new THREE.Group();
steeringPivotGroup.name = 'STEERING_HEADTUBE_PIVOT';
steeringPivotGroup.position.copy(HEAD_PIVOT_ORIGIN);
frontAssemblyGroup.add(steeringPivotGroup);

const steeringChildOffset = new THREE.Group();
steeringChildOffset.position.copy(HEAD_PIVOT_ORIGIN).negate();
steeringPivotGroup.add(steeringChildOffset);

const forkNode = buildForkNode(mats);
const cockpitNode = buildCockpitNode(mats);
const frontWheelNode = buildFrontWheelNode(mats);
steeringChildOffset.add(forkNode, cockpitNode, frontWheelNode);
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

// Secondary PiP Camera aimed at the Rear Wheel (MTX39 3000W, Kenda tread, 6mm dropout, ZOOM caliper & chain)
const pipCamera = new THREE.PerspectiveCamera(34, 320 / 200, 0.03, 120);
pipCamera.position.set(-0.82, 0.15, 0.36);
pipCamera.lookAt(-0.42, 0.04, 0.0);
bikeMasterGroup.add(pipCamera);

// ----------------------------------------------------------------------------
// 4. VOLUMETRIC HEADLIGHT CONES & REAR LED BRAKE LIGHT TEST SYSTEM
// ----------------------------------------------------------------------------
const lightsTestGroup = new THREE.Group();
lightsTestGroup.name = 'VOLUMETRIC_HEADLIGHT_BEAMS';
lightsTestGroup.visible = false;
const headlightSpots = [];

[-0.026, 0.026].forEach((zEye) => {
  const spot = new THREE.SpotLight(0xd8f4ff, 14.0, 28.0, Math.PI * 0.20, 0.58, 1.2);
  spot.visible = false;
  spot.position.set(0.475, 0.585, zEye);
  const targetObj = new THREE.Object3D();
  targetObj.position.set(6.5, -0.35, zEye * 2.0);
  lightsTestGroup.add(targetObj);
  spot.target = targetObj;
  lightsTestGroup.add(spot);
  headlightSpots.push(spot);

  const coneGeom = new THREE.ConeGeometry(0.32, 1.65, 32, 1, true);
  coneGeom.translate(0, -0.825, 0);
  coneGeom.rotateZ(Math.PI / 2 - 0.18);
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

const rearBrakePointLight = new THREE.PointLight(0xff1111, 0, 2.4);
rearBrakePointLight.position.set(-0.60, 0.555, 0);
saddleSys.saddleAndFenderGroup.add(rearBrakePointLight);
steeringChildOffset.add(lightsTestGroup);

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

  const xrayCellCurrentEl = document.getElementById('xray-cell-current');
  const activePerCellAmps = sw900State && sw900State.currentAmps > 0.5
    ? (sw900State.currentAmps / 7).toFixed(2)
    : '8.57';

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
      xrayGroupTitle.textContent = `СЕКЦИЯ ${s}S (РЯД #${row}, БАНКИ #${(s - 1) * 7 + 1}..#${s * 7})`;
      xrayGroupCfg.textContent = `${s}S7P (${polSideStr})`;
      xrayGroupVolt.textContent = `4.20V (СУММА ${vMax}V)`;
      xrayGroupTemp.textContent = `NTC ${sGroup.userData.ntcTemp}°C / Cu 2.5мм²`;
      if (xrayCellCurrentEl) xrayCellCurrentEl.textContent = `EVE 50E • ${activePerCellAmps}A / БАНКУ`;

      if (mobXRayTitle) mobXRayTitle.textContent = `СЕКЦИЯ ${s}S (4.20V • Σ ${vMax}V)`;
      if (mobXRayVal) mobXRayVal.textContent = `35.0 Ah • ${activePerCellAmps}A/банку • ${sGroup.userData.ntcTemp}°C`;
    } else {
      cellMat.color.setHex(0x3b82a6);
      cellMat.emissive.setHex(0x000000);
      cellMat.emissiveIntensity = 0.0;
      cellMat.opacity = 0.12;

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
// 7. WEB AUDIO API SYNTHESIZER (3000W SINE-WAVE HUB MOTOR + TIRE NOISE + 105dB HORN)
// ----------------------------------------------------------------------------
const audioSys = {
  ctx: null,
  initialized: false,
  motorOsc1: null,
  motorOsc2: null,
  motorGain: null,
  tireFilter: null,
  tireGain: null,
  hornOsc1: null,
  hornOsc2: null,
  hornGain: null,
  isHornActive: false
};

function ensureAudioInitialized() {
  if (audioSys.initialized) {
    if (audioSys.ctx && audioSys.ctx.state === 'suspended') {
      audioSys.ctx.resume().catch(() => {});
    }
    return;
  }
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    audioSys.ctx = ctx;

    // 1. 3000W Direct-Drive Sine-Wave Motor Synthesizer
    const motorOsc1 = ctx.createOscillator();
    const motorOsc2 = ctx.createOscillator();
    const motorFilter = ctx.createBiquadFilter();
    const motorGain = ctx.createGain();

    motorOsc1.type = 'sine';
    motorOsc2.type = 'triangle';
    motorOsc1.frequency.value = 65;
    motorOsc2.frequency.value = 195;

    motorFilter.type = 'lowpass';
    motorFilter.frequency.value = 950;
    motorGain.gain.value = 0.0;

    const osc2SubGain = ctx.createGain();
    osc2SubGain.gain.value = 0.28;

    motorOsc1.connect(motorFilter);
    motorOsc2.connect(osc2SubGain);
    osc2SubGain.connect(motorFilter);
    motorFilter.connect(motorGain);
    motorGain.connect(ctx.destination);

    motorOsc1.start();
    motorOsc2.start();

    // 2. Kenda 26x2.35" Tire Rolling Noise Generator
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const tireFilter = ctx.createBiquadFilter();
    tireFilter.type = 'bandpass';
    tireFilter.frequency.value = 160;
    tireFilter.Q.value = 1.6;

    const tireGain = ctx.createGain();
    tireGain.gain.value = 0.0;

    whiteNoise.connect(tireFilter);
    tireFilter.connect(tireGain);
    tireGain.connect(ctx.destination);
    whiteNoise.start();

    // 3. 105 dB Automotive Dual-Tone Disc Horn (415 Hz + 510 Hz)
    const hornOsc1 = ctx.createOscillator();
    const hornOsc2 = ctx.createOscillator();
    const hornFilter = ctx.createBiquadFilter();
    const hornGain = ctx.createGain();

    hornOsc1.type = 'sawtooth';
    hornOsc2.type = 'sawtooth';
    hornOsc1.frequency.value = 415;
    hornOsc2.frequency.value = 512;

    hornFilter.type = 'bandpass';
    hornFilter.frequency.value = 920;
    hornFilter.Q.value = 1.15;
    hornGain.gain.value = 0.0;

    hornOsc1.connect(hornFilter);
    hornOsc2.connect(hornFilter);
    hornFilter.connect(hornGain);
    hornGain.connect(ctx.destination);

    hornOsc1.start();
    hornOsc2.start();

    audioSys.motorOsc1 = motorOsc1;
    audioSys.motorOsc2 = motorOsc2;
    audioSys.motorGain = motorGain;
    audioSys.tireFilter = tireFilter;
    audioSys.tireGain = tireGain;
    audioSys.hornOsc1 = hornOsc1;
    audioSys.hornOsc2 = hornOsc2;
    audioSys.hornGain = hornGain;
    audioSys.initialized = true;
  } catch (e) {
    // Web Audio not allowed or blocked
  }
}

function setHornActive(active) {
  audioSys.isHornActive = active;
  const btnHornPad = document.getElementById('btn-drive-horn');
  const btnHornBottom = document.getElementById('btn-horn-bottom');
  if (btnHornPad) btnHornPad.classList.toggle('active', active);
  if (btnHornBottom) btnHornBottom.classList.toggle('active-orange', active);

  if (active) ensureAudioInitialized();
  if (audioSys.initialized && audioSys.ctx && audioSys.hornGain) {
    const now = audioSys.ctx.currentTime;
    audioSys.hornGain.gain.setTargetAtTime(active ? 0.22 : 0.0, now, 0.015);
  }
}

function updateMotorAndTireAudio(speedKmh, throttlePct, regenBrakeOn) {
  if (!audioSys.initialized || !audioSys.ctx) return;
  const now = audioSys.ctx.currentTime;
  const speedNorm = Math.min(1.0, speedKmh / 82.4);
  const thrNorm = throttlePct / 100;

  // Sine-wave motor pitch scales with wheel RPM (23 pole pairs on 3000W DD hub motor)
  const baseFreq = 58 + speedNorm * 340 + thrNorm * 35;
  audioSys.motorOsc1.frequency.setTargetAtTime(baseFreq, now, 0.04);
  audioSys.motorOsc2.frequency.setTargetAtTime(
    regenBrakeOn ? baseFreq * 3.6 : baseFreq * 2.5,
    now,
    0.04
  );

  let targetMotorGain = 0.0;
  if (speedKmh > 0.4 || thrNorm > 0.02) {
    targetMotorGain = Math.min(0.14, 0.015 + speedNorm * 0.065 + thrNorm * 0.055);
    if (regenBrakeOn && speedKmh > 2.0) targetMotorGain = 0.11;
  }
  audioSys.motorGain.gain.setTargetAtTime(targetMotorGain, now, 0.05);

  // Tire tread rolling noise
  const targetTireGain = speedKmh > 1.0 ? Math.min(0.08, speedNorm * 0.075) : 0.0;
  audioSys.tireFilter.frequency.setTargetAtTime(140 + speedNorm * 420, now, 0.06);
  audioSys.tireGain.gain.setTargetAtTime(targetTireGain, now, 0.06);
}

// ----------------------------------------------------------------------------
// 8. 4 OPEN-WORLD 3D LOCATIONS + REAR-WHEEL DUST PARTICLE SYSTEM
// ----------------------------------------------------------------------------
const worldEnvRoot = new THREE.Group();
worldEnvRoot.name = 'OPEN_WORLD_ENVIRONMENT_ROOT';
scene.add(worldEnvRoot);

const GROUND_Y = -0.256;
let activeLocationKey = 'studio';

// Create procedural 3D environments for the 4 switchable locations
const envGroups = {
  highway: new THREE.Group(),
  forest: new THREE.Group(),
  field: new THREE.Group(),
  night: new THREE.Group()
};

// Shared road/terrain bumps list for suspension physics in Forest & Field
const forestTrailBumps = [];

// Dust particle system behind the rear Kenda 26x2.35" tire
const DUST_COUNT = 180;
const dustPositions = new Float32Array(DUST_COUNT * 3);
const dustVelocities = [];
for (let i = 0; i < DUST_COUNT; i++) {
  dustPositions[i * 3 + 0] = 0;
  dustPositions[i * 3 + 1] = -999;
  dustPositions[i * 3 + 2] = 0;
  dustVelocities.push({ vx: 0, vy: 0, vz: 0, life: 0, maxLife: 1 });
}
const dustGeom = new THREE.BufferGeometry();
dustGeom.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
const dustMat = new THREE.PointsMaterial({
  color: 0xc2b28f,
  size: 0.14,
  transparent: true,
  opacity: 0.55,
  depthWrite: false
});
const dustPoints = new THREE.Points(dustGeom, dustMat);
dustPoints.frustumCulled = false;
scene.add(dustPoints);

let dustSpawnCursor = 0;
function updateRearWheelDustParticles(dt, speedKmh, throttlePct) {
  const isDustySurface = activeLocationKey === 'field' || activeLocationKey === 'forest';
  dustPoints.visible = isDustySurface;
  if (!isDustySurface) return;

  const posAttr = dustGeom.attributes.position;
  const shouldEmit = speedKmh > 3.0 && (throttlePct > 5 || speedKmh > 12);

  if (shouldEmit) {
    const rearContactLocal = new THREE.Vector3(-0.46, GROUND_Y + 0.03, 0);
    bikeWorldRoot.localToWorld(rearContactLocal);
    const spawnCount = Math.min(5, Math.ceil((speedKmh / 25) + (throttlePct / 35)));

    for (let n = 0; n < spawnCount; n++) {
      const idx = dustSpawnCursor % DUST_COUNT;
      dustSpawnCursor++;
      posAttr.setXYZ(
        idx,
        rearContactLocal.x + (Math.random() - 0.5) * 0.16,
        rearContactLocal.y + Math.random() * 0.05,
        rearContactLocal.z + (Math.random() - 0.5) * 0.14
      );
      const backAngle = bikeDriveState.headingYaw + Math.PI + (Math.random() - 0.5) * 0.55;
      const spd = (0.8 + (speedKmh / 35) * 2.2) * (0.6 + Math.random() * 0.6);
      dustVelocities[idx].vx = Math.cos(backAngle) * spd;
      dustVelocities[idx].vy = 0.45 + Math.random() * 0.95;
      dustVelocities[idx].vz = -Math.sin(backAngle) * spd;
      dustVelocities[idx].life = 0.01;
      dustVelocities[idx].maxLife = 0.55 + Math.random() * 0.45;
    }
  }

  for (let i = 0; i < DUST_COUNT; i++) {
    const v = dustVelocities[i];
    if (v.life > 0) {
      v.life += dt;
      if (v.life >= v.maxLife) {
        v.life = 0;
        posAttr.setY(i, -999);
      } else {
        const x = posAttr.getX(i) + v.vx * dt;
        const y = posAttr.getY(i) + v.vy * dt;
        const z = posAttr.getZ(i) + v.vz * dt;
        v.vy = Math.max(0.05, v.vy - dt * 0.8);
        posAttr.setXYZ(i, x, y, z);
      }
    }
  }
  posAttr.needsUpdate = true;
}

function buildAllOpenWorldLocations() {
  // --------------------------------------------------------------------------
  // 1) HIGHWAY: [🏙️ УЛИЦА / ТРАССА МОСТОВАЯ — ЦИЛЬНА]
  // --------------------------------------------------------------------------
  const hw = envGroups.highway;
  const grassSubFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(500, 500),
    new THREE.MeshStandardMaterial({ color: 0x24331e, roughness: 0.95 })
  );
  grassSubFloor.rotation.x = -Math.PI / 2;
  grassSubFloor.position.y = GROUND_Y - 0.01;
  grassSubFloor.receiveShadow = true;
  hw.add(grassSubFloor);

  // 8m wide Asphalt Highway
  const roadMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(500, 8.4),
    new THREE.MeshStandardMaterial({ color: 0x1c1e22, roughness: 0.86, metalness: 0.05 })
  );
  roadMesh.rotation.x = -Math.PI / 2;
  roadMesh.position.y = GROUND_Y;
  roadMesh.receiveShadow = true;
  hw.add(roadMesh);

  // Solid edge lines & dashed centerline
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xf5f7fa });
  [-3.85, 3.85].forEach((zEdge) => {
    const edgeLine = new THREE.Mesh(new THREE.PlaneGeometry(500, 0.12), lineMat);
    edgeLine.rotation.x = -Math.PI / 2;
    edgeLine.position.set(0, GROUND_Y + 0.003, zEdge);
    hw.add(edgeLine);
  });

  for (let x = -220; x <= 220; x += 6) {
    const dash = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 0.12), lineMat);
    dash.rotation.x = -Math.PI / 2;
    dash.position.set(x, GROUND_Y + 0.003, 0);
    hw.add(dash);
  }

  // Concrete curbs & sidewalks on both sides
  const curbMat = new THREE.MeshStandardMaterial({ color: 0x6e737b, roughness: 0.85 });
  [-4.4, 4.4].forEach((zCurb) => {
    const curb = new THREE.Mesh(new THREE.BoxGeometry(500, 0.14, 0.4), curbMat);
    curb.position.set(0, GROUND_Y + 0.07, zCurb);
    curb.receiveShadow = true;
    hw.add(curb);
  });

  // Street lamps & roadside cottages/buildings along Mostovaya - Tsilna route
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x3a404a, metalness: 0.6, roughness: 0.4 });
  const lampBulbMat = new THREE.MeshBasicMaterial({ color: 0xfff0cc });
  const houseWallMat = new THREE.MeshStandardMaterial({ color: 0x3b424c, roughness: 0.85 });
  const houseRoofMat = new THREE.MeshStandardMaterial({ color: 0x4a251d, roughness: 0.75 });
  const winGlowMat = new THREE.MeshBasicMaterial({ color: 0xffd27d });

  for (let x = -180; x <= 180; x += 24) {
    [-4.9, 4.9].forEach((zSide, idx) => {
      if ((Math.abs(x) / 24 + idx) % 2 === 0) {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 4.8, 10), poleMat);
        pole.position.set(x, GROUND_Y + 2.4, zSide);
        hw.add(pole);

        const arm = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, 1.3), poleMat);
        arm.position.set(x, GROUND_Y + 4.75, zSide > 0 ? zSide - 0.55 : zSide + 0.55);
        hw.add(arm);

        const head = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.06, 0.22), lampBulbMat);
        head.position.set(x, GROUND_Y + 4.70, zSide > 0 ? zSide - 1.1 : zSide + 1.1);
        hw.add(head);
      }
    });

    // Roadside houses & garages
    if (Math.abs(x) % 48 === 0) {
      [-12.5, 12.5].forEach((zHouse) => {
        const hGroup = new THREE.Group();
        const body = new THREE.Mesh(new THREE.BoxGeometry(8.5, 3.8, 6.2), houseWallMat);
        body.position.y = GROUND_Y + 1.9;
        hGroup.add(body);

        const roof = new THREE.Mesh(new THREE.ConeGeometry(6.2, 2.2, 4), houseRoofMat);
        roof.rotation.y = Math.PI / 4;
        roof.position.y = GROUND_Y + 4.9;
        hGroup.add(roof);

        const win = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.1), winGlowMat);
        win.position.set(0, GROUND_Y + 2.0, zHouse > 0 ? -3.12 : 3.12);
        if (zHouse > 0) win.rotation.y = Math.PI;
        hGroup.add(win);

        hGroup.position.set(x + 8, 0, zHouse);
        hw.add(hGroup);
      });
    }
  }

  // --------------------------------------------------------------------------
  // 2) FOREST & BASE AT BLUE LAKE: [🌲 ЛЕС И БАЗА У ГОЛУБОГО ОЗЕРА]
  // --------------------------------------------------------------------------
  const fr = envGroups.forest;
  const forestFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(500, 500),
    new THREE.MeshStandardMaterial({ color: 0x1e2b18, roughness: 0.98 })
  );
  forestFloor.rotation.x = -Math.PI / 2;
  forestFloor.position.y = GROUND_Y - 0.008;
  forestFloor.receiveShadow = true;
  fr.add(forestFloor);

  // Dirt forest trail with 3D roots & bumps that trigger FOXSID suspension travel
  const trailMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(500, 3.2),
    new THREE.MeshStandardMaterial({ color: 0x3b2d1f, roughness: 0.96 })
  );
  trailMesh.rotation.x = -Math.PI / 2;
  trailMesh.position.y = GROUND_Y;
  trailMesh.receiveShadow = true;
  fr.add(trailMesh);

  const rootMat = new THREE.MeshStandardMaterial({ color: 0x4a3520, roughness: 0.92 });
  for (let x = -160; x <= 160; x += 4.5) {
    if (Math.abs(x) < 1.8) continue; // keep initial studio spot flat
    const bumpH = 0.028 + (Math.abs(Math.sin(x * 1.7)) * 0.036);
    const rootBump = new THREE.Mesh(
      new THREE.CylinderGeometry(bumpH * 0.85, bumpH * 1.1, 2.6, 10),
      rootMat
    );
    rootBump.rotation.x = Math.PI / 2;
    rootBump.rotation.z = (Math.sin(x) * 0.18);
    rootBump.position.set(x, GROUND_Y + bumpH * 0.35, 0);
    fr.add(rootBump);
    forestTrailBumps.push({ x, height: bumpH });
  }

  // Shimmering Blue Lake ("Голубое озеро") beside the trail
  const blueLake = new THREE.Mesh(
    new THREE.CircleGeometry(38, 48),
    new THREE.MeshStandardMaterial({
      color: 0x0c6b8a,
      emissive: 0x042633,
      roughness: 0.14,
      metalness: 0.25
    })
  );
  blueLake.rotation.x = -Math.PI / 2;
  blueLake.position.set(18, GROUND_Y + 0.005, -44);
  fr.add(blueLake);

  // Forest Base / Camouflaged Timber Shelter ("Лесная база-землянка у Голубого озера")
  const baseGroup = new THREE.Group();
  baseGroup.position.set(12, GROUND_Y, -6.2);
  const logMat = new THREE.MeshStandardMaterial({ color: 0x4c3622, roughness: 0.9 });
  const camoRoofMat = new THREE.MeshStandardMaterial({ color: 0x2b3d24, roughness: 0.95 });

  for (let ly = 0; ly < 7; ly++) {
    const logFront = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 4.4, 10), logMat);
    logFront.rotation.z = Math.PI / 2;
    logFront.position.set(0, 0.14 + ly * 0.25, -2.0);
    baseGroup.add(logFront);
  }
  const shelterRoof = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.18, 3.6), camoRoofMat);
  shelterRoof.position.set(0, 1.95, -0.8);
  shelterRoof.rotation.x = 0.15;
  baseGroup.add(shelterRoof);

  // Campfire in front of the forest base
  const fireGlow = new THREE.PointLight(0xff6600, 5.0, 9.0);
  fireGlow.position.set(0, 0.45, 1.8);
  baseGroup.add(fireGlow);
  const fireCore = new THREE.Mesh(
    new THREE.ConeGeometry(0.28, 0.55, 8),
    new THREE.MeshBasicMaterial({ color: 0xff7700 })
  );
  fireCore.position.set(0, 0.25, 1.8);
  baseGroup.add(fireCore);
  fr.add(baseGroup);

  // 200 Instanced 3D Pine / Spruce Trees
  const TREE_COUNT = 200;
  const trunkInst = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.14, 0.22, 2.6, 8),
    new THREE.MeshStandardMaterial({ color: 0x3d2817, roughness: 0.92 }),
    TREE_COUNT
  );
  const crownLowInst = new THREE.InstancedMesh(
    new THREE.ConeGeometry(1.45, 3.8, 9),
    new THREE.MeshStandardMaterial({ color: 0x163018, roughness: 0.88 }),
    TREE_COUNT
  );
  const crownHighInst = new THREE.InstancedMesh(
    new THREE.ConeGeometry(1.05, 3.0, 9),
    new THREE.MeshStandardMaterial({ color: 0x1e3f20, roughness: 0.85 }),
    TREE_COUNT
  );

  const dummy = new THREE.Object3D();
  for (let i = 0; i < TREE_COUNT; i++) {
    const side = i % 2 === 0 ? 1 : -1;
    const tx = ((i * 37) % 280) - 140;
    let tz = side * (3.2 + ((i * 19) % 42));
    if (tx > -22 && tx < 55 && tz < -8) tz = -88 - (i % 20); // keep Blue Lake & Base clear
    const scale = 0.75 + (i % 7) * 0.12;

    dummy.position.set(tx, GROUND_Y + 1.3 * scale, tz);
    dummy.scale.set(scale, scale, scale);
    dummy.updateMatrix();
    trunkInst.setMatrixAt(i, dummy.matrix);

    dummy.position.set(tx, GROUND_Y + 3.2 * scale, tz);
    dummy.updateMatrix();
    crownLowInst.setMatrixAt(i, dummy.matrix);

    dummy.position.set(tx, GROUND_Y + 5.0 * scale, tz);
    dummy.updateMatrix();
    crownHighInst.setMatrixAt(i, dummy.matrix);
  }
  fr.add(trunkInst, crownLowInst, crownHighInst);

  // --------------------------------------------------------------------------
  // 3) FIELD & SVIYAGA GRADER: [🌾 ПОЛЕ И ГРЕЙДЕР СВИЯГИ]
  // --------------------------------------------------------------------------
  const fd = envGroups.field;
  const fieldGround = new THREE.Mesh(
    new THREE.PlaneGeometry(500, 500),
    new THREE.MeshStandardMaterial({ color: 0x3b4720, roughness: 0.96 })
  );
  fieldGround.rotation.x = -Math.PI / 2;
  fieldGround.position.y = GROUND_Y - 0.008;
  fieldGround.receiveShadow = true;
  fd.add(fieldGround);

  // Gravel Grader Road
  const graderRoad = new THREE.Mesh(
    new THREE.PlaneGeometry(500, 5.2),
    new THREE.MeshStandardMaterial({ color: 0x6e5d47, roughness: 0.95 })
  );
  graderRoad.rotation.x = -Math.PI / 2;
  graderRoad.position.y = GROUND_Y;
  graderRoad.receiveShadow = true;
  fd.add(graderRoad);

  // Sviyaga River bend along the field horizon
  const sviyagaRiver = new THREE.Mesh(
    new THREE.PlaneGeometry(500, 22),
    new THREE.MeshStandardMaterial({ color: 0x164966, roughness: 0.22, metalness: 0.15 })
  );
  sviyagaRiver.rotation.x = -Math.PI / 2;
  sviyagaRiver.position.set(0, GROUND_Y + 0.004, -38);
  fd.add(sviyagaRiver);

  // Rolling Hills & High-Voltage Power Line Pylons (ЛЭП 110 кВ)
  const hillMat = new THREE.MeshStandardMaterial({ color: 0x33401b, roughness: 0.95 });
  for (let h = -4; h <= 4; h++) {
    const hill = new THREE.Mesh(new THREE.SphereGeometry(28, 24, 16), hillMat);
    hill.scale.set(1.8, 0.26, 1.1);
    hill.position.set(h * 55, GROUND_Y - 2.2, (h % 2 === 0 ? 1 : -1) * 68);
    fd.add(hill);
  }

  const pylonMat = new THREE.MeshStandardMaterial({ color: 0x7a828c, metalness: 0.65, roughness: 0.4 });
  for (let px = -150; px <= 150; px += 50) {
    const pylon = new THREE.Group();
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.65, 14, 4, 1, true), pylonMat);
    tower.position.y = GROUND_Y + 7.0;
    pylon.add(tower);
    const crossArm = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 4.6), pylonMat);
    crossArm.position.y = GROUND_Y + 12.2;
    pylon.add(crossArm);
    pylon.position.set(px, 0, 14);
    fd.add(pylon);
  }

  // 900 Instanced Tall Field Grass Tufts
  const GRASS_COUNT = 900;
  const grassInst = new THREE.InstancedMesh(
    new THREE.ConeGeometry(0.08, 0.65, 5),
    new THREE.MeshStandardMaterial({ color: 0x5c6e2a, roughness: 0.9 }),
    GRASS_COUNT
  );
  for (let i = 0; i < GRASS_COUNT; i++) {
    const side = i % 2 === 0 ? 1 : -1;
    const gx = ((i * 29) % 260) - 130;
    const gz = side * (3.0 + ((i * 13) % 30));
    dummy.position.set(gx, GROUND_Y + 0.30, gz);
    dummy.scale.set(1, 0.8 + (i % 5) * 0.15, 1);
    dummy.updateMatrix();
    grassInst.setMatrixAt(i, dummy.matrix);
  }
  fd.add(grassInst);

  // --------------------------------------------------------------------------
  // 4) NIGHT STEALTH MODE: [🌑 НОЧНОЙ СТЕЛС (ТЕМНОТА)]
  // --------------------------------------------------------------------------
  const nt = envGroups.night;
  const nightAsphalt = new THREE.Mesh(
    new THREE.PlaneGeometry(500, 10),
    new THREE.MeshStandardMaterial({ color: 0x101216, roughness: 0.82 })
  );
  nightAsphalt.rotation.x = -Math.PI / 2;
  nightAsphalt.position.y = GROUND_Y;
  nt.add(nightAsphalt);

  const nightSideGround = new THREE.Mesh(
    new THREE.PlaneGeometry(500, 500),
    new THREE.MeshStandardMaterial({ color: 0x06080c, roughness: 0.98 })
  );
  nightSideGround.rotation.x = -Math.PI / 2;
  nightSideGround.position.y = GROUND_Y - 0.01;
  nt.add(nightSideGround);

  // Reflective cat-eye road markers illuminated by the Sur-Ron 20W Headlight
  const reflectorMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0x223344,
    roughness: 0.2,
    metalness: 0.8
  });
  for (let x = -180; x <= 180; x += 5) {
    const centerStripe = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.12), reflectorMat);
    centerStripe.rotation.x = -Math.PI / 2;
    centerStripe.position.set(x, GROUND_Y + 0.003, 0);
    nt.add(centerStripe);
  }

  // Starfield Sky Dome in Night Mode
  const STAR_COUNT = 550;
  const starPos = new Float32Array(STAR_COUNT * 3);
  for (let i = 0; i < STAR_COUNT; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI * 0.44;
    const r = 180;
    starPos[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
    starPos[i * 3 + 1] = Math.abs(r * Math.cos(phi)) + 6;
    starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  const starGeom = new THREE.BufferGeometry();
  starGeom.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const stars = new THREE.Points(
    starGeom,
    new THREE.PointsMaterial({ color: 0xdceeff, size: 0.55 })
  );
  nt.add(stars);

  Object.values(envGroups).forEach((grp) => {
    grp.visible = false;
    worldEnvRoot.add(grp);
  });
}
buildAllOpenWorldLocations();

function setOpenWorldLocation(locKey) {
  activeLocationKey = locKey;
  Object.entries(envGroups).forEach(([k, grp]) => {
    grp.visible = k === locKey;
  });

  document.querySelectorAll('.ow-btn[data-loc]').forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-loc') === locKey);
  });

  if (locKey === 'studio') {
    scene.background = null;
    scene.fog = null;
    ambientLight.intensity = 0.75;
    keyLight.intensity = 2.4;
    rimLight.intensity = 1.45;
  } else if (locKey === 'highway') {
    scene.background = new THREE.Color(0x162234);
    scene.fog = new THREE.FogExp2(0x162234, 0.008);
    ambientLight.intensity = 0.95;
    keyLight.intensity = 2.6;
    rimLight.intensity = 1.2;
  } else if (locKey === 'forest') {
    scene.background = new THREE.Color(0x111f16);
    scene.fog = new THREE.FogExp2(0x111f16, 0.012);
    ambientLight.intensity = 0.78;
    keyLight.intensity = 2.1;
    rimLight.intensity = 1.0;
  } else if (locKey === 'field') {
    scene.background = new THREE.Color(0x1e2d3d);
    scene.fog = new THREE.FogExp2(0x1e2d3d, 0.007);
    ambientLight.intensity = 1.05;
    keyLight.intensity = 2.8;
    rimLight.intensity = 1.25;
  } else if (locKey === 'night') {
    scene.background = new THREE.Color(0x020408);
    scene.fog = new THREE.FogExp2(0x020408, 0.018);
    ambientLight.intensity = 0.14;
    keyLight.intensity = 0.22;
    rimLight.intensity = 0.35;
    // Automatically turn on the 20W Sur-Ron LED headlight in Night Stealth mode
    if (!isLightsAndBrakeOn) {
      setHeadlightsState(true);
    }
  }
}

document.querySelectorAll('.ow-btn[data-loc]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const loc = btn.getAttribute('data-loc') || 'studio';
    setOpenWorldLocation(loc);
    if (loc !== 'studio' && cameraMode === 'orbit' && sw900State.speedKmh < 1) {
      // Position camera nicely to see the road & bike
      setCameraMode('chase');
    }
  });
});

// ----------------------------------------------------------------------------
// 9. LIVE SW900 ON-BOARD COMPUTER, W/A/S/D + WHEELIE + SUSPENSION PHYSICS
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

// Real-Time Driving & Kinematics State
const bikeDriveState = {
  keyW: false,
  keyS: false,
  keyA: false,
  keyD: false,
  keySpaceWheelie: false,
  steerAngle: 0.0,        // radians around inclined headtube axis (-0.48 .. +0.48)
  leanRoll: 0.0,          // cornering roll angle in radians (-0.38 .. +0.38)
  wheelieAngle: 0.0,      // rear-axle pitch angle in radians (0 .. 0.68 rad / 39 deg)
  forkCompressionM: 0.0,  // FOXSID-X2 suspension travel in meters (0 .. 0.070 m)
  chainPhase: 0.0,        // 3D roller chain phase
  headingYaw: 0.0         // world heading yaw angle (radians)
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
const topMetricSpeed = document.getElementById('top-metric-speed');
const topMetricOdo = document.getElementById('top-metric-odo');
const pipRpmReadout = document.getElementById('pip-rpm-readout');
const pipBrakeReadout = document.getElementById('pip-brake-readout');

// Record base positions for FOXSID-X2 fork lowers and front wheel for suspension travel
const forkLowersBasePos = forkNode.userData.forkLowersGroup
  ? forkNode.userData.forkLowersGroup.position.clone()
  : new THREE.Vector3();
const frontWheelBasePos = frontWheelNode.position.clone();
const forkStanchionAxis = forkNode.userData.legAxis
  ? forkNode.userData.legAxis.clone().normalize()
  : new THREE.Vector3(-0.2914, 0.9566, 0).normalize();

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
    ensureAudioInitialized();
    sw900State.throttlePct = parseFloat(e.target.value) || 0;
    if (sw900State.throttlePct > 0 && sw900State.regenBrakeOn) {
      setBrakeAndRegenState(false);
    }
    if (throttleLabel) throttleLabel.textContent = `ГАЗ (W): ${Math.round(sw900State.throttlePct)}%`;
  });
}

function setBrakeAndRegenState(active) {
  sw900State.regenBrakeOn = active;
  if (btnRegenBrake) btnRegenBrake.classList.toggle('active', active);
  if (active) {
    mats.MAT_BRAKE_LED.emissive.setHex(0xff0000);
    mats.MAT_BRAKE_LED.emissiveIntensity = 4.5;
    rearBrakePointLight.intensity = 4.2;
  } else if (!isLightsAndBrakeOn) {
    mats.MAT_BRAKE_LED.emissiveIntensity = 0.35;
    rearBrakePointLight.intensity = 0.0;
  }
}

if (btnRegenBrake) {
  btnRegenBrake.addEventListener('click', () => {
    ensureAudioInitialized();
    const next = !sw900State.regenBrakeOn;
    if (next && sw900State.throttlePct === 0 && sw900State.speedKmh < 5) {
      sw900State.speedKmh = 52.0;
    }
    if (next && sliderThrottle) {
      sw900State.throttlePct = 0;
      sliderThrottle.value = '0';
      if (throttleLabel) throttleLabel.textContent = 'ГАЗ (W): 0%';
    }
    setBrakeAndRegenState(next);
  });
}

// Interactive UI Drive Pad buttons (Left A, Right D, Wheelie SPACE, Horn B)
function bindHoldButton(btnId, onDown, onUp) {
  const el = document.getElementById(btnId);
  if (!el) return;
  el.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    ensureAudioInitialized();
    el.classList.add('active');
    onDown();
  });
  const release = () => {
    el.classList.remove('active');
    onUp();
  };
  el.addEventListener('pointerup', release);
  el.addEventListener('pointerleave', release);
  el.addEventListener('pointercancel', release);
}

bindHoldButton('btn-drive-left', () => { bikeDriveState.keyA = true; }, () => { bikeDriveState.keyA = false; });
bindHoldButton('btn-drive-right', () => { bikeDriveState.keyD = true; }, () => { bikeDriveState.keyD = false; });
bindHoldButton('btn-drive-wheelie', () => {
  bikeDriveState.keySpaceWheelie = true;
  if (sw900State.throttlePct < 65) {
    sw900State.throttlePct = 85;
    if (sliderThrottle) sliderThrottle.value = '85';
    if (throttleLabel) throttleLabel.textContent = 'ГАЗ (W): 85%';
  }
}, () => { bikeDriveState.keySpaceWheelie = false; });
bindHoldButton('btn-drive-horn', () => setHornActive(true), () => setHornActive(false));
bindHoldButton('btn-horn-bottom', () => setHornActive(true), () => setHornActive(false));

// Keyboard W/A/S/D + Arrow Keys + SPACE (Wheelie) + L (Lights) + B (Horn) + H (Hide Labels)
window.addEventListener('keydown', (e) => {
  if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
  ensureAudioInitialized();
  const code = e.code;
  const k = e.key;

  if (['1', '2', '3', '4', '5'].includes(k)) {
    sw900State.pas = parseInt(k, 10);
  } else if (code === 'KeyM') {
    cycleSw900Mode();
  } else if (code === 'KeyW' || code === 'ArrowUp') {
    bikeDriveState.keyW = true;
    setBrakeAndRegenState(false);
  } else if (code === 'KeyS' || code === 'ArrowDown') {
    bikeDriveState.keyS = true;
    setBrakeAndRegenState(true);
  } else if (code === 'KeyA' || code === 'ArrowLeft') {
    bikeDriveState.keyA = true;
  } else if (code === 'KeyD' || code === 'ArrowRight') {
    bikeDriveState.keyD = true;
  } else if (code === 'Space') {
    e.preventDefault();
    bikeDriveState.keySpaceWheelie = true;
  } else if (code === 'KeyL') {
    setHeadlightsState(!isLightsAndBrakeOn);
  } else if (code === 'KeyB') {
    if (!audioSys.isHornActive) setHornActive(true);
  } else if (code === 'KeyH') {
    toggleHotspotPinsVisibility();
  }
});

window.addEventListener('keyup', (e) => {
  const code = e.code;
  if (code === 'KeyW' || code === 'ArrowUp') {
    bikeDriveState.keyW = false;
  } else if (code === 'KeyS' || code === 'ArrowDown') {
    bikeDriveState.keyS = false;
    setBrakeAndRegenState(false);
  } else if (code === 'KeyA' || code === 'ArrowLeft') {
    bikeDriveState.keyA = false;
  } else if (code === 'KeyD' || code === 'ArrowRight') {
    bikeDriveState.keyD = false;
  } else if (code === 'Space') {
    bikeDriveState.keySpaceWheelie = false;
  } else if (code === 'KeyB') {
    setHornActive(false);
  }
});

let lastOdoSaveTime = 0;
let prevWheelieAngle = 0;

function updateSw900PhysicsAndScreen(dt) {
  const profile = PAS_PROFILES[sw900State.pas] || PAS_PROFILES[5];

  // Keyboard W / S smooth throttle ramp
  if (bikeDriveState.keyW) {
    sw900State.throttlePct = Math.min(100, sw900State.throttlePct + dt * 115);
    if (sliderThrottle) sliderThrottle.value = String(Math.round(sw900State.throttlePct));
    if (throttleLabel) throttleLabel.textContent = `ГАЗ (W): ${Math.round(sw900State.throttlePct)}%`;
  } else if (bikeDriveState.keyS) {
    sw900State.throttlePct = Math.max(0, sw900State.throttlePct - dt * 220);
    if (sliderThrottle) sliderThrottle.value = String(Math.round(sw900State.throttlePct));
    if (throttleLabel) throttleLabel.textContent = `ГАЗ (W): ${Math.round(sw900State.throttlePct)}%`;
  } else if ( bikeDriveState.keySpaceWheelie && sw900State.throttlePct < 65 ) {
    // Auto-blip throttle when holding SPACE for Wheelie stunt
    sw900State.throttlePct = Math.min(85, sw900State.throttlePct + dt * 140);
    if (sliderThrottle) sliderThrottle.value = String(Math.round(sw900State.throttlePct));
    if (throttleLabel) throttleLabel.textContent = `ГАЗ (W): ${Math.round(sw900State.throttlePct)}%`;
  }

  const thr = sw900State.throttlePct / 100;

  if (sw900State.regenBrakeOn) {
    sw900State.speedKmh = Math.max(0, sw900State.speedKmh - dt * 28.0);
    if (sw900State.speedKmh > 2.0) {
      const regenFactor = Math.min(1.0, sw900State.speedKmh / 45.0);
      sw900State.currentAmps = -20.5 * regenFactor;
    } else {
      sw900State.currentAmps = 0;
    }
  } else {
    const targetSpeed = profile.maxSpeed * thr;
    const accelRate = targetSpeed > sw900State.speedKmh ? 24.0 : 8.5;
    sw900State.speedKmh += (targetSpeed - sw900State.speedKmh) * Math.min(1.0, dt * (accelRate / 10));
    if (sw900State.speedKmh < 0.08 && thr === 0) sw900State.speedKmh = 0;

    if (thr > 0.01) {
      sw900State.currentAmps = profile.maxAmps * Math.pow(thr, 1.15);
    } else {
      sw900State.currentAmps = 0;
    }
  }

  // Exact battery internal resistance sag formula: U = U_oc - I * 0.065 Ohm
  const rInternal = 0.065;
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

  // --------------------------------------------------------------------------
  // 3D CONTROLS KINEMATICS: THROTTLE GRIP, BRAKE LEVERS, STEERING, LEAN, WHEELIE
  // --------------------------------------------------------------------------
  // 1) Twist right 20X throttle grip
  if (cockpitNode.userData.throttleTwistGroup) {
    cockpitNode.userData.throttleTwistGroup.rotation.x = -thr * 0.58;
  }

  // 2) Squeeze left & right ZOOM HB-890E brake lever blades on S / Brake
  if (cockpitNode.userData.brakeBladeGroups) {
    const targetSqueeze = sw900State.regenBrakeOn ? 0.34 : 0.0;
    cockpitNode.userData.brakeBladeGroups.forEach((b) => {
      const sideSign = b.userData?.side || 1;
      const targetRotY = -sideSign * targetSqueeze;
      b.rotation.y += (targetRotY - b.rotation.y) * Math.min(1.0, dt * 16);
    });
  }

  // 3) Steering (A / D) around inclined headtube axis + Cornering Lean Roll
  const steerInput = (bikeDriveState.keyA ? 1 : 0) - (bikeDriveState.keyD ? 1 : 0);
  const maxSteerRad = 0.46; // ~26.5 deg
  const targetSteer = steerInput * maxSteerRad;
  bikeDriveState.steerAngle += (targetSteer - bikeDriveState.steerAngle) * Math.min(1.0, dt * 10.0);
  steeringPivotGroup.setRotationFromAxisAngle(HEAD_STEER_AXIS, bikeDriveState.steerAngle);

  const speedFactor = Math.min(1.0, sw900State.speedKmh / 32.0);
  const targetLeanRoll = -bikeDriveState.steerAngle * (0.35 + speedFactor * 0.45);
  bikeDriveState.leanRoll += (targetLeanRoll - bikeDriveState.leanRoll) * Math.min(1.0, dt * 8.5);
  bikeLeanGroup.rotation.x = bikeDriveState.leanRoll;

  // 4) Stunt WHEELIE mode on SPACE (lifts front wheel 38-41 deg around rear axle)
  const canWheelie = bikeDriveState.keySpaceWheelie && !sw900State.regenBrakeOn;
  const balanceOsc = canWheelie ? Math.sin(performance.now() * 0.008) * 0.035 : 0;
  const targetWheelieRad = canWheelie ? (0.66 + balanceOsc) : 0.0; // ~38-40 deg
  prevWheelieAngle = bikeDriveState.wheelieAngle;
  bikeDriveState.wheelieAngle += (targetWheelieRad - bikeDriveState.wheelieAngle) * Math.min(1.0, dt * (canWheelie ? 6.5 : 8.0));
  bikeWheeliePivot.rotation.z = bikeDriveState.wheelieAngle;

  // 5) Front FOXSID-X2 Fork Suspension Travel (0..70 mm) on Braking + Forest Bumps + Wheelie Landing
  let targetForkCompM = 0.0;
  if (sw900State.regenBrakeOn && bikeDriveState.wheelieAngle < 0.05) {
    targetForkCompM = Math.min(0.065, 0.025 + (sw900State.speedKmh / 65.0) * 0.042);
  }
  if (activeLocationKey === 'forest' && sw900State.speedKmh > 1.0 && bikeDriveState.wheelieAngle < 0.08) {
    const bx = bikeWorldRoot.position.x;
    for (let i = 0; i < forestTrailBumps.length; i++) {
      const dist = Math.abs((bx + 0.56) - forestTrailBumps[i].x);
      if (dist < 0.35) {
        targetForkCompM = Math.max(targetForkCompM, forestTrailBumps[i].height * 1.35);
        break;
      }
    }
  } else if (activeLocationKey === 'field' && sw900State.speedKmh > 2.0 && bikeDriveState.wheelieAngle < 0.08) {
    targetForkCompM = Math.max(targetForkCompM, Math.abs(Math.sin(bikeWorldRoot.position.x * 3.5)) * 0.022);
  }
  // Wheelie touchdown compression pulse
  if (prevWheelieAngle > 0.08 && bikeDriveState.wheelieAngle <= 0.08) {
    bikeDriveState.forkCompressionM = 0.068;
  }

  bikeDriveState.forkCompressionM += (targetForkCompM - bikeDriveState.forkCompressionM) * Math.min(1.0, dt * 14.0);
  if (explodeState.factor < 0.01) {
    if (forkNode.userData.forkLowersGroup) {
      forkNode.userData.forkLowersGroup.position
        .copy(forkLowersBasePos)
        .addScaledVector(forkStanchionAxis, bikeDriveState.forkCompressionM);
    }
    frontWheelNode.position
      .copy(frontWheelBasePos)
      .addScaledVector(forkStanchionAxis, bikeDriveState.forkCompressionM);
  }

  // 6) Horn vibration visual effect when 105 dB Horn (B) is active
  if (audioSys.isHornActive) {
    underTubeSys.underTubeRoot.position.y = Math.sin(performance.now() * 0.18) * 0.0018;
  } else {
    underTubeSys.underTubeRoot.position.y = 0;
  }

  // --------------------------------------------------------------------------
  // WHEEL ROTATION, 3D ROLLER CHAIN ANIMATION & OPEN-WORLD TRANSLATION
  // --------------------------------------------------------------------------
  let wheelRpm = 0;
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
    frontWheelNode.rotation.z -= dAngle * (bikeDriveState.wheelieAngle > 0.15 ? 0.35 : 1.0);
    rearWheelNode.rotation.z -= dAngle;
    wheelRpm = Math.round((speedMs / (2 * Math.PI * wheelRadiusM)) * 60);

    // Animate 104-link 3D roller chain & 38T crankset
    bikeDriveState.chainPhase += speedMs * dt * 0.45;
    if (frameNode.userData.updateChainAtOffset) {
      frameNode.userData.updateChainAtOffset(bikeDriveState.chainPhase);
    }
    if (frameNode.userData.crankGroup) {
      frameNode.userData.crankGroup.rotation.z -= dAngle * 0.42;
    }

    // Move the bike through the 3D world when in an Open-World location (or if steering/driving)
    if (activeLocationKey !== 'studio' && explodeState.factor < 0.02) {
      const turnRate = bikeDriveState.steerAngle * (speedMs / 1.08) * 0.55;
      bikeDriveState.headingYaw += turnRate * dt;
      bikeWorldRoot.rotation.y = bikeDriveState.headingYaw;

      const dx = Math.cos(bikeDriveState.headingYaw) * speedMs * dt;
      const dz = -Math.sin(bikeDriveState.headingYaw) * speedMs * dt;
      bikeWorldRoot.position.x += dx;
      bikeWorldRoot.position.z = Math.max(-35, Math.min(35, bikeWorldRoot.position.z + dz));

      // KeepOrbitControls target moving with the bike
      controls.target.x += dx;
      controls.target.z += dz;
      if (cameraMode === 'orbit') {
        camera.position.x += dx;
        camera.position.z += dz;
      }

      // Seamlessly recycle/shift environment every 48m so the road/forest never ends!
      const snapX = Math.round(bikeWorldRoot.position.x / 48) * 48;
      worldEnvRoot.position.x = snapX;
    }

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

  // Update Web Audio API Motor + Tire synthesizer & Rear-Wheel Dust Particles
  updateMotorAndTireAudio(sw900State.speedKmh, sw900State.throttlePct, sw900State.regenBrakeOn);
  updateRearWheelDustParticles(dt, sw900State.speedKmh, sw900State.throttlePct);

  // Update PiP Rear-Wheel Telemetry Footer
  if (pipRpmReadout) {
    const forkMm = Math.round(bikeDriveState.forkCompressionM * 1000);
    pipRpmReadout.textContent = `RPM: ${wheelRpm} • ХОД ВИЛКИ: ${forkMm}ММ`;
  }
  if (pipBrakeReadout) {
    const isBraking = sw900State.regenBrakeOn || isLightsAndBrakeOn;
    pipBrakeReadout.textContent = isBraking ? 'ТОРМОЗ ZOOM: СТОП + E-ABS' : 'РОТОР 180ММ • СТОП: ВЫКЛ';
    pipBrakeReadout.style.color = isBraking ? '#ff4444' : '#00ff66';
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
  if (topMetricSpeed) {
    const wheelieTag = bikeDriveState.wheelieAngle > 0.15 ? ' 🔥ВИЛЛИ' : '';
    topMetricSpeed.textContent = `${sw900State.speedKmh.toFixed(1)} КМ/Ч (PAS ${sw900State.pas})${wheelieTag}`;
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
    if (act === 'LIGHT') {
      setHeadlightsState(!isLightsAndBrakeOn);
      return true;
    }
    if (act === 'HORN') {
      setHornActive(true);
      setTimeout(() => setHornActive(false), 420);
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
  ensureAudioInitialized();
  if (check3DSw900ButtonClick(e.clientX, e.clientY)) return;
  if (e.pointerType === 'touch' || window.innerWidth <= 920) {
    inspectBatteryAtClientXY(e.clientX, e.clientY);
  }
});

// ----------------------------------------------------------------------------
// 10. TEST BRAKE & SUR-RON 20W HEADLIGHT SWITCH (BUTTON + 'L' HOTKEY)
// ----------------------------------------------------------------------------
let isLightsAndBrakeOn = false;
const btnLights = document.getElementById('btn-lights');

function setHeadlightsState(enable) {
  isLightsAndBrakeOn = enable;
  lightsTestGroup.visible = isLightsAndBrakeOn;
  headlightSpots.forEach((s) => { s.visible = isLightsAndBrakeOn; });

  if (isLightsAndBrakeOn) {
    btnLights?.classList.add('active-orange');
    mats.MAT_HEADLIGHT_LED.emissiveIntensity = 5.5;
    mats.MAT_BRAKE_LED.emissive.setHex(0xff0000);
    mats.MAT_BRAKE_LED.emissiveIntensity = 4.0;
    rearBrakePointLight.intensity = 3.8;
  } else {
    btnLights?.classList.remove('active-orange');
    mats.MAT_HEADLIGHT_LED.emissiveIntensity = 0.5;
    if (!sw900State.regenBrakeOn) {
      mats.MAT_BRAKE_LED.emissiveIntensity = 0.35;
      rearBrakePointLight.intensity = 0.0;
    }
  }
}

btnLights?.addEventListener('click', () => {
  setHeadlightsState(!isLightsAndBrakeOn);
});

// ----------------------------------------------------------------------------
// 11. 3 CAMERA MODES (POV COCKPIT, GTA CHASE CAM, STUDIO 360 ORBIT) & PIP TOGGLE
// ----------------------------------------------------------------------------
let cameraMode = 'orbit'; // 'orbit' | 'chase' | 'pov'
let isPipEnabled = true;
const pipBoxEl = document.getElementById('pip-rear-wheel-box');
const btnTogglePip = document.getElementById('btn-toggle-pip');
const btnHideLabels = document.getElementById('btn-hide-labels');

if (btnTogglePip) {
  btnTogglePip.addEventListener('click', () => {
    isPipEnabled = !isPipEnabled;
    btnTogglePip.classList.toggle('active', isPipEnabled);
    if (pipBoxEl) pipBoxEl.classList.toggle('hidden', !isPipEnabled);
  });
}

function flyCameraTo(posVec, targetVec) {
  const adjustedPos = getViewportAdjustedPos(posVec, targetVec);
  const worldPos = bikeWorldRoot.localToWorld(adjustedPos.clone());
  const worldTarget = bikeWorldRoot.localToWorld(targetVec.clone());
  gsap.to(camera.position, {
    x: worldPos.x,
    y: worldPos.y,
    z: worldPos.z,
    duration: 1.05,
    ease: 'power3.out'
  });
  gsap.to(controls.target, {
    x: worldTarget.x,
    y: worldTarget.y,
    z: worldTarget.z,
    duration: 1.05,
    ease: 'power3.out'
  });
}

const CAMERA_PRESETS = {
  default: { pos: DEFAULT_CAM_POS, target: DEFAULT_CAM_TARGET, code: 'ALL' },
  pov: { pos: new THREE.Vector3(-0.08, 0.92, 0.0), target: new THREE.Vector3(0.45, 0.62, 0.0), code: 'POV-08' },
  fork: { pos: new THREE.Vector3(1.12, 0.30, 0.88), target: new THREE.Vector3(0.50, 0.25, 0.0), code: 'FRK-01' },
  cockpit: { pos: new THREE.Vector3(0.92, 0.74, 0.62), target: new THREE.Vector3(0.42, 0.61, 0.0), code: 'CKP-02' },
  wheels: { pos: new THREE.Vector3(-0.42, 0.10, 1.15), target: new THREE.Vector3(-0.445, 0.015, 0.0), code: 'WHL-03' },
  dropout: { pos: new THREE.Vector3(-0.38, 0.12, 0.54), target: new THREE.Vector3(-0.445, 0.04, 0.065), code: 'BRK-04' },
  battery: { pos: new THREE.Vector3(0.14, 0.28, 1.05), target: new THREE.Vector3(0.12, 0.27, 0.0), code: 'BAT-05' },
  controller: { pos: new THREE.Vector3(0.48, -0.02, 0.74), target: new THREE.Vector3(0.18, 0.18, 0.0), code: 'ESC-06' },
  saddle: { pos: new THREE.Vector3(-0.28, 0.65, 0.88), target: new THREE.Vector3(-0.34, 0.50, 0.0), code: 'SDL-07' }
};

function setCameraMode(mode) {
  cameraMode = mode;
  document.querySelectorAll('.ow-btn[data-cammode]').forEach((b) => {
    b.classList.toggle('cam-active', b.getAttribute('data-cammode') === mode);
  });

  const isPov = mode === 'pov';
  if (sw900Widget) sw900Widget.classList.toggle('pov-enlarged', isPov);
  if (btnPovRider) btnPovRider.classList.toggle('active', isPov);
  if (sw900PovBadge) {
    sw900PovBadge.textContent = isPov ? 'РЕЖИМ POV 1:1' : (mode === 'chase' ? 'GTA CHASE CAM' : 'W/A/S/D + SPACE');
  }

  if (mode === 'pov') {
    controls.enabled = false;
    camera.fov = 52;
    camera.updateProjectionMatrix();
    currentCameraPresetKey = 'pov';
    if (activeNodeIndicator) activeNodeIndicator.textContent = 'POV-08';
  } else if (mode === 'chase') {
    controls.enabled = false;
    camera.fov = 42;
    camera.updateProjectionMatrix();
    currentCameraPresetKey = 'chase';
    if (activeNodeIndicator) activeNodeIndicator.textContent = 'CHASE';
    const initChasePos = new THREE.Vector3(-2.45, 0.88, 0.0);
    const initChaseTarget = new THREE.Vector3(0.65, 0.35, 0.0);
    bikeWorldRoot.localToWorld(initChasePos);
    bikeWorldRoot.localToWorld(initChaseTarget);
    camera.position.copy(initChasePos);
    controls.target.copy(initChaseTarget);
    camera.lookAt(controls.target);
  } else {
    controls.enabled = true;
    const aspect = window.innerWidth / Math.max(window.innerHeight, 1);
    camera.fov = aspect < 1.0 ? 44 : 28;
    camera.updateProjectionMatrix();
    flyCameraTo(DEFAULT_CAM_POS, DEFAULT_CAM_TARGET);
  }
}

function setPovMode(enable) {
  setCameraMode(enable ? 'pov' : 'orbit');
}

document.querySelectorAll('.ow-btn[data-cammode]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const mode = btn.getAttribute('data-cammode') || 'orbit';
    setCameraMode(mode);
  });
});

if (btnPovRider) {
  btnPovRider.addEventListener('click', () => {
    setCameraMode(cameraMode === 'pov' ? 'orbit' : 'pov');
  });
}

function updateActiveCameraTracking(dt) {
  if (cameraMode === 'pov') {
    // First-person Rider POV attached to bikeMasterGroup (-0.08, 0.92, 0.0)
    const eyeLocal = new THREE.Vector3(-0.10, 0.92, 0.0);
    const lookLocal = new THREE.Vector3(0.52, 0.58, -bikeDriveState.steerAngle * 0.25);
    bikeMasterGroup.localToWorld(eyeLocal);
    bikeMasterGroup.localToWorld(lookLocal);
    camera.position.copy(eyeLocal);
    camera.lookAt(lookLocal);
  } else if (cameraMode === 'chase') {
    // GTA-style 3rd-person Chase Camera behind the bike
    const desiredLocalPos = new THREE.Vector3(-2.45, 0.88, bikeDriveState.steerAngle * 0.35);
    const desiredLocalTarget = new THREE.Vector3(0.65, 0.35 + bikeDriveState.wheelieAngle * 0.35, 0.0);
    bikeWorldRoot.localToWorld(desiredLocalPos);
    bikeWorldRoot.localToWorld(desiredLocalTarget);
    camera.position.lerp(desiredLocalPos, Math.min(1.0, dt * 7.5));
    controls.target.lerp(desiredLocalTarget, Math.min(1.0, dt * 10.0));
    camera.lookAt(controls.target);
  } else {
    controls.update();
  }
}

// Mobile Drawers & Pin Toggles ('H' hotkey + '[👁️ СКРЫТЬ НАДПИСИ (H)]' button)
const leftSidePanel = document.getElementById('left-side-panel');
const rightHotspotDock = document.getElementById('right-hotspot-dock');
const btnMobNodes = document.getElementById('btn-mob-nodes');
const btnMobDocs = document.getElementById('btn-mob-docs');
const btnMobPins = document.getElementById('btn-mob-pins');
const closeLeftDrawerBtn = document.getElementById('close-left-drawer');
const closeRightDrawerBtn = document.getElementById('close-right-drawer');
let arePinsVisible = true;

function toggleHotspotPinsVisibility() {
  arePinsVisible = !arePinsVisible;
  if (btnMobPins) btnMobPins.classList.toggle('active', arePinsVisible);
  if (btnHideLabels) {
    btnHideLabels.classList.toggle('active', !arePinsVisible);
    btnHideLabels.textContent = arePinsVisible
      ? '[👁️ СКРЫТЬ НАДПИСИ (H)]'
      : '[👁️ ПОКАЗАТЬ НАДПИСИ (H)]';
  }
  if (hotspotContainer) {
    hotspotContainer.style.display = arePinsVisible ? 'block' : 'none';
  }
}

if (btnHideLabels) {
  btnHideLabels.addEventListener('click', toggleHotspotPinsVisibility);
}

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
        setCameraMode('pov');
      } else {
        setCameraMode('orbit');
        flyCameraTo(preset.pos, preset.target);
      }
      closeMobileDrawers();
    }
  });
});

document.getElementById('btn-reset-cam').addEventListener('click', () => {
  if (isXRayMode) setXRayMode(false);
  bikeWorldRoot.position.set(0, 0, 0);
  bikeWorldRoot.rotation.set(0, 0, 0);
  bikeDriveState.headingYaw = 0;
  bikeDriveState.wheelieAngle = 0;
  bikeDriveState.leanRoll = 0;
  bikeDriveState.steerAngle = 0;
  worldEnvRoot.position.set(0, 0, 0);
  setCameraMode('orbit');
  currentCameraPresetKey = 'default';
  closeMobileDrawers();
  flyCameraTo(DEFAULT_CAM_POS, DEFAULT_CAM_TARGET);
});

// ----------------------------------------------------------------------------
// 12. FULLSCREEN 6-SHEET ENGINEERING CAD TABLET (ZOOM / PAN / PNG & SVG DOWNLOAD)
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
  btnMobPins.addEventListener('click', toggleHotspotPinsVisibility);
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
// 13. RESIZE HANDLER & MAIN 60FPS RENDER LOOP (+ REAR-WHEEL PIP SCISSOR PORT)
// ----------------------------------------------------------------------------
window.addEventListener('resize', () => {
  const aspect = window.innerWidth / Math.max(window.innerHeight, 1);
  camera.aspect = aspect;
  if (cameraMode === 'orbit') {
    camera.fov = aspect < 1.0 ? 44 : 28;
  }
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const urlParams = new URLSearchParams(window.location.search);
const modeParam = urlParams.get('mode');
const locParam = urlParams.get('loc');
if (locParam && ['studio', 'highway', 'forest', 'field', 'night'].includes(locParam)) {
  setOpenWorldLocation(locParam);
}
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
  setCameraMode('pov');
} else if (modeParam === 'chase') {
  setCameraMode('chase');
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
  updateActiveCameraTracking(dt);
  updateHotspotScreenPositions();

  const fullW = window.innerWidth;
  const fullH = window.innerHeight;

  // 1. Main Fullscreen Viewport Render
  renderer.setViewport(0, 0, fullW, fullH);
  renderer.setScissorTest(false);
  renderer.render(scene, camera);

  // 2. Top-Right Rear-Wheel PiP Camera Viewport Render (320 x 200 px via setViewport / setScissor)
  if (isPipEnabled && pipBoxEl && !pipBoxEl.classList.contains('hidden')) {
    const rect = pipBoxEl.getBoundingClientRect();
    if (rect.width > 20 && rect.height > 20) {
      const pipLeft = Math.round(rect.left);
      const pipBottom = Math.round(fullH - rect.bottom);
      const pipW = Math.round(rect.width);
      const pipH = Math.round(rect.height);

      pipCamera.aspect = pipW / Math.max(1, pipH);
      pipCamera.updateProjectionMatrix();

      renderer.setScissorTest(true);
      renderer.setViewport(pipLeft, pipBottom, pipW, pipH);
      renderer.setScissor(pipLeft, pipBottom, pipW, pipH);
      renderer.clearDepth();
      renderer.render(scene, pipCamera);
      renderer.setScissorTest(false);
    }
  }
}
animate();

