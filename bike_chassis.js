// ============================================================================
// STEALTH SUR-RON 72V 3000W — CAD FRAME, FOXSID-X2 FORK, COCKPIT, WHEELS,
// DRIVETRAIN & ZOOM HB-890E BRAKES + 6MM MONOLITHIC M14 DROPOUT ARMOR
// Scale: 1.0 unit = 1.0 meter. Origin (0,0,0) = Bottom Bracket Center.
// ============================================================================
import * as THREE from 'three';

/**
 * Helper: Creates a cylindrical tube between two 3D points
 */
export function createCylinderBetween(p1, p2, r1, r2, material, radialSegs = 24) {
  const dir = new THREE.Vector3().subVectors(p2, p1);
  const len = dir.length();
  const geom = new THREE.CylinderGeometry(r2, r1, len, radialSegs, 1, false);
  const mesh = new THREE.Mesh(geom, material);
  mesh.position.copy(p1).add(p2).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/**
 * Helper: Creates a bi-oval / teardrop hydroformed tube between two 3D points
 */
export function createBiOvalTubeBetween(p1, p2, rx, rz, material, radialSegs = 28) {
  const dir = new THREE.Vector3().subVectors(p2, p1);
  const len = dir.length();
  const geom = new THREE.CylinderGeometry(1, 1, len, radialSegs, 8, false);
  const pos = geom.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    pos.setX(i, x * rx);
    pos.setZ(i, z * rz);
  }
  geom.computeVertexNormals();
  const mesh = new THREE.Mesh(geom, material);
  mesh.position.copy(p1).add(p2).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/**
 * Helper: Creates a realistic TIG weld bead ring (scaly Torus bead) at tube joints
 */
export function createWeldSeam(center, axisVec, radius, tubeRadius, material) {
  const group = new THREE.Group();
  const torusGeom = new THREE.TorusGeometry(radius, tubeRadius, 12, 28);
  const mainTorus = new THREE.Mesh(torusGeom, material);
  group.add(mainTorus);

  // Add individual TIG weld ripples around the ring
  const rippleGeom = new THREE.SphereGeometry(tubeRadius * 1.18, 8, 8);
  const rippleCount = 20;
  for (let i = 0; i < rippleCount; i++) {
    const angle = (i / rippleCount) * Math.PI * 2;
    const ripple = new THREE.Mesh(rippleGeom, material);
    ripple.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
    ripple.scale.set(1.2, 0.85, 1.35);
    group.add(ripple);
  }

  group.position.copy(center);
  group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), axisVec.clone().normalize());
  return group;
}

/**
 * 1. BUILD STERN DYNAMIC 1.0 18" MOD FRAME (Exact CAD Coordinates)
 */
export function buildFrameNode(mats) {
  const frameGroup = new THREE.Group();
  frameGroup.name = 'FRAME_STERN_18_MOD';
  const mat = mats.MAT_FRAME_RAL9005;

  // 1.1 Bottom Bracket Shell (BB): center (0,0,0), Z width 68mm (-0.034..+0.034), OD 40mm (R=0.020)
  const bbGeom = new THREE.CylinderGeometry(0.020, 0.020, 0.068, 32);
  bbGeom.rotateX(Math.PI / 2);
  const bbMesh = new THREE.Mesh(bbGeom, mat);
  bbMesh.castShadow = true;
  frameGroup.add(bbMesh);

  // BB threaded cups (anodized black)
  [-0.036, 0.036].forEach((zPos) => {
    const cupGeom = new THREE.CylinderGeometry(0.0215, 0.0215, 0.005, 24);
    cupGeom.rotateX(Math.PI / 2);
    const cup = new THREE.Mesh(cupGeom, mats.MAT_ANODIZED_BLACK);
    cup.position.set(0, 0, zPos);
    frameGroup.add(cup);
  });

  // 1.2 Seat Tube: (0,0,0) -> (-0.145, 0.435, 0), length 455mm (18"), OD 31.8mm (R=0.0159)
  const pBB = new THREE.Vector3(0, 0, 0);
  const pSeatTop = new THREE.Vector3(-0.145, 0.435, 0);
  const seatTube = createCylinderBetween(pBB, pSeatTop, 0.0159, 0.0159, mat, 28);
  frameGroup.add(seatTube);

  // Seatpost clamp at (-0.145, 0.435, 0)
  const clampDir = pSeatTop.clone().sub(pBB).normalize();
  const clampMesh = createCylinderBetween(
    pSeatTop.clone().addScaledVector(clampDir, -0.016),
    pSeatTop.clone().addScaledVector(clampDir, 0.004),
    0.0185,
    0.0185,
    mats.MAT_ANODIZED_BLACK,
    24
  );
  frameGroup.add(clampMesh);

  // 1.3 Head Tube 1 1/8" EC34: bottom (0.425, 0.450, 0) -> top (0.390, 0.565, 0), L=120mm, OD=38mm (R=0.019)
  const pHeadBot = new THREE.Vector3(0.425, 0.450, 0);
  const pHeadTop = new THREE.Vector3(0.390, 0.565, 0);
  const headAxis = pHeadTop.clone().sub(pHeadBot).normalize();
  const headTube = createCylinderBetween(pHeadBot, pHeadTop, 0.019, 0.019, mat, 32);
  frameGroup.add(headTube);

  // EC34 External Pressed Headset Cups (Top & Bottom with chamfers)
  const lowerCup = createCylinderBetween(
    pHeadBot.clone().addScaledVector(headAxis, -0.012),
    pHeadBot,
    0.022,
    0.0245,
    mats.MAT_ANODIZED_BLACK,
    32
  );
  const upperCup = createCylinderBetween(
    pHeadTop,
    pHeadTop.clone().addScaledVector(headAxis, 0.012),
    0.0245,
    0.022,
    mats.MAT_ANODIZED_BLACK,
    32
  );
  frameGroup.add(lowerCup, upperCup);

  // 1.4 Downtube (Bi-oval 42x34mm -> rx=0.021, rz=0.017): (0.015, 0.015, 0) -> (0.415, 0.465, 0)
  const pDownStart = new THREE.Vector3(0.015, 0.015, 0);
  const pDownEnd = new THREE.Vector3(0.415, 0.465, 0);
  const downTube = createBiOvalTubeBetween(pDownStart, pDownEnd, 0.021, 0.017, mat, 32);
  frameGroup.add(downTube);

  // Welded reinforcing gusset plate under Head Tube / Downtube junction
  const gussetShape = new THREE.Shape();
  gussetShape.moveTo(0.355, 0.400);
  gussetShape.lineTo(0.424, 0.452);
  gussetShape.lineTo(0.412, 0.478);
  gussetShape.lineTo(0.340, 0.415);
  gussetShape.closePath();
  const gussetGeom = new THREE.ExtrudeGeometry(gussetShape, {
    depth: 0.026,
    bevelEnabled: true,
    bevelThickness: 0.003,
    bevelSize: 0.003,
    bevelSegments: 3
  });
  gussetGeom.translate(0, 0, -0.013);
  const gussetMesh = new THREE.Mesh(gussetGeom, mat);
  frameGroup.add(gussetMesh);

  // 1.5 Toptube: (0.395, 0.545, 0) -> (-0.135, 0.415, 0), OD 31.8mm (R=0.0159)
  const pTopStart = new THREE.Vector3(0.395, 0.545, 0);
  const pTopEnd = new THREE.Vector3(-0.135, 0.415, 0);
  const topTube = createCylinderBetween(pTopStart, pTopEnd, 0.0159, 0.0159, mat, 28);
  frameGroup.add(topTube);

  // 1.6 Rear Triangle (OLD = 135mm, z = ±0.0675, Rear Axle = (-0.435, 0.030, 0))
  [-1, 1].forEach((side) => {
    const zChainBB = side * 0.026;
    const zDrop = side * 0.0675;

    // S-bend Chainstay for 26x2.35" Kenda tire clearance (70mm gap at BB)
    const chainCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.0, -0.004, zChainBB),
      new THREE.Vector3(-0.11, 0.002, side * 0.044),
      new THREE.Vector3(-0.26, 0.014, side * 0.062),
      new THREE.Vector3(-0.425, 0.028, zDrop)
    ]);
    const chainGeom = new THREE.TubeGeometry(chainCurve, 32, 0.012, 16, false);
    // Ovalize chainstay 28x16mm vertically
    const cPos = chainGeom.attributes.position;
    for (let i = 0; i < cPos.count; i++) {
      cPos.setY(i, cPos.getY(i) * 1.12);
    }
    chainGeom.computeVertexNormals();
    const chainMesh = new THREE.Mesh(chainGeom, mat);
    chainMesh.castShadow = true;
    frameGroup.add(chainMesh);

    // Seatstay: (-0.140, 0.390, ±0.020) -> (-0.435, 0.045, ±0.0675), diameter 19mm (R=0.0095)
    const seatStayCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.140, 0.390, side * 0.020),
      new THREE.Vector3(-0.275, 0.230, side * 0.052),
      new THREE.Vector3(-0.430, 0.048, zDrop)
    ]);
    const seatStayGeom = new THREE.TubeGeometry(seatStayCurve, 24, 0.0095, 16, false);
    const seatStayMesh = new THREE.Mesh(seatStayGeom, mat);
    seatStayMesh.castShadow = true;
    frameGroup.add(seatStayMesh);

    // Factory 5mm frame dropout plate
    const dropShape = new THREE.Shape();
    dropShape.moveTo(-0.410, 0.015);
    dropShape.lineTo(-0.455, 0.015);
    dropShape.lineTo(-0.455, 0.062);
    dropShape.lineTo(-0.415, 0.058);
    dropShape.closePath();
    const dropGeom = new THREE.ExtrudeGeometry(dropShape, { depth: 0.005, bevelEnabled: false });
    dropGeom.translate(0, 0, zDrop - 0.0025);
    const dropMesh = new THREE.Mesh(dropGeom, mat);
    frameGroup.add(dropMesh);
  });

  // Seatstay bridge above rear tire
  const bridgeP1 = new THREE.Vector3(-0.245, 0.265, -0.046);
  const bridgeP2 = new THREE.Vector3(-0.245, 0.265, 0.046);
  frameGroup.add(createCylinderBetween(bridgeP1, bridgeP2, 0.008, 0.008, mat, 16));

  // Chainstay bridge near BB
  const csBridgeP1 = new THREE.Vector3(-0.075, 0.001, -0.036);
  const csBridgeP2 = new THREE.Vector3(-0.075, 0.001, 0.036);
  frameGroup.add(createCylinderBetween(csBridgeP1, csBridgeP2, 0.008, 0.008, mat, 16));

  // 1.7 Procedural TIG Weld Seams at all frame tube intersections
  frameGroup.add(
    createWeldSeam(new THREE.Vector3(0.015, 0.015, 0), pDownEnd.clone().sub(pDownStart), 0.020, 0.0032, mat),
    createWeldSeam(new THREE.Vector3(-0.008, 0.022, 0), pSeatTop.clone().sub(pBB), 0.0165, 0.003, mat),
    createWeldSeam(new THREE.Vector3(0.412, 0.468, 0), pDownEnd.clone().sub(pDownStart), 0.021, 0.0035, mat),
    createWeldSeam(new THREE.Vector3(0.392, 0.544, 0), pTopStart.clone().sub(pTopEnd), 0.0165, 0.0032, mat),
    createWeldSeam(new THREE.Vector3(-0.133, 0.414, 0), pTopStart.clone().sub(pTopEnd), 0.0165, 0.0032, mat)
  );

  // 1.8 Bottom Bracket Crankset, Narrow-Wide Chainring & MTB Platform Pedals
  const crankGroup = new THREE.Group();
  crankGroup.name = 'CRANKSET_NARROW_WIDE';

  // Narrow-Wide 36T front chainring on right side (z = -0.044)
  const ringGeom = new THREE.RingGeometry(0.052, 0.074, 36);
  const ringExtrudeShape = new THREE.Shape();
  ringExtrudeShape.absarc(0, 0, 0.074, 0, Math.PI * 2, false);
  const holePath = new THREE.Path();
  holePath.absarc(0, 0, 0.054, 0, Math.PI * 2, true);
  ringExtrudeShape.holes.push(holePath);
  const nwGeom = new THREE.ExtrudeGeometry(ringExtrudeShape, { depth: 0.004, bevelEnabled: true, bevelSize: 0.001, bevelThickness: 0.001 });
  nwGeom.translate(0, 0, -0.046);
  const nwRing = new THREE.Mesh(nwGeom, mats.MAT_ANODIZED_BLACK);
  crankGroup.add(nwRing);

  // 4-arm spider
  for (let i = 0; i < 4; i++) {
    const ang = (i * Math.PI) / 2 + Math.PI / 4;
    const arm = createCylinderBetween(
      new THREE.Vector3(0, 0, -0.044),
      new THREE.Vector3(Math.cos(ang) * 0.062, Math.sin(ang) * 0.062, -0.044),
      0.007,
      0.005,
      mats.MAT_ANODIZED_BLACK,
      12
    );
    crankGroup.add(arm);
  }

  // Left & Right Crank Arms (170mm length) + MTB Platform Pedals with steel traction pins
  // Right crank forward-down, Left crank backward-up (matching reference photo stance!)
  const crankConfigs = [
    { side: -1, z: -0.052, dir: new THREE.Vector3(0.155, -0.070, 0) }, // Right side
    { side: 1, z: 0.052, dir: new THREE.Vector3(-0.155, 0.070, 0) }   // Left side
  ];

  crankConfigs.forEach((cfg) => {
    const pStart = new THREE.Vector3(0, 0, cfg.z);
    const pEnd = new THREE.Vector3(cfg.dir.x, cfg.dir.y, cfg.z + cfg.side * 0.008);
    const arm = createBiOvalTubeBetween(pStart, pEnd, 0.015, 0.007, mats.MAT_ANODIZED_BLACK, 20);
    crankGroup.add(arm);

    // Pedal spindle + MTB platform body
    const pPedalCenter = pEnd.clone().add(new THREE.Vector3(0, 0, cfg.side * 0.052));
    const spindle = createCylinderBetween(pEnd, pPedalCenter, 0.006, 0.006, mats.MAT_STEEL_ROTOR, 12);
    crankGroup.add(spindle);

    const pedalBodyGeom = new THREE.BoxGeometry(0.102, 0.016, 0.095);
    const pedalBody = new THREE.Mesh(pedalBodyGeom, mats.MAT_ANODIZED_BLACK);
    pedalBody.position.copy(pPedalCenter);
    pedalBody.castShadow = true;
    crankGroup.add(pedalBody);

    // Steel traction pins on pedal platform
    const pinGeom = new THREE.CylinderGeometry(0.0015, 0.0015, 0.022, 6);
    [-0.04, 0, 0.04].forEach((px) => {
      [-0.035, 0.035].forEach((pz) => {
        const pin = new THREE.Mesh(pinGeom, mats.MAT_STEEL_ROTOR);
        pin.position.set(pPedalCenter.x + px, pPedalCenter.y, pPedalCenter.z + pz);
        crankGroup.add(pin);
      });
    });
  });

  // Chain from Front Chainring (0,0,-0.044) to Rear 16T Freewheel (-0.435, 0.030, -0.056)
  const chainUpper = createCylinderBetween(
    new THREE.Vector3(0.0, 0.068, -0.044),
    new THREE.Vector3(-0.435, 0.064, -0.056),
    0.0042,
    0.0042,
    mats.MAT_ANODIZED_BLACK,
    12
  );
  const chainLower = createCylinderBetween(
    new THREE.Vector3(0.0, -0.068, -0.044),
    new THREE.Vector3(-0.435, -0.004, -0.056),
    0.0042,
    0.0042,
    mats.MAT_ANODIZED_BLACK,
    12
  );
  crankGroup.add(chainUpper, chainLower);
  frameGroup.add(crankGroup);

  return frameGroup;
}

/**
 * 2. NODE 1: FRONT AIR FORK FOXSID-X2 26" (Single-Crown, 120mm Travel, Mudguard, FOXSID Decals)
 */
export function buildForkNode(mats) {
  const forkGroup = new THREE.Group();
  forkGroup.name = 'NODE_01_FORK_FOXSID_X2';

  // Head Tube axis reference: Top (0.390, 0.565, 0) -> Bottom (0.425, 0.450, 0)
  const pHeadTop = new THREE.Vector3(0.390, 0.565, 0);
  const pHeadBot = new THREE.Vector3(0.425, 0.450, 0);
  // Downward fork direction along head angle (~73 deg)
  const forkDownDir = pHeadBot.clone().sub(pHeadTop).normalize();
  // Forward offset perpendicular to steering axis
  const forkFwdDir = new THREE.Vector3(forkDownDir.y, -forkDownDir.x, 0).normalize();

  // 2.1 Straight 1 1/8" (28.6mm) Steerer Tube inside Head Tube + extending to stem
  const pSteererTop = pHeadTop.clone().addScaledVector(forkDownDir, -0.065);
  const pSteererBot = pHeadBot.clone().addScaledVector(forkDownDir, 0.015);
  const steerer = createCylinderBetween(pSteererTop, pSteererBot, 0.0143, 0.0143, mats.MAT_ANODIZED_BLACK, 24);
  forkGroup.add(steerer);

  // 2.2 Cast Matte Black Single Crown with forward offset bosses
  const pCrownCenter = pHeadBot.clone().addScaledVector(forkDownDir, 0.018).addScaledVector(forkFwdDir, 0.022);
  const crownBridge = createBiOvalTubeBetween(
    new THREE.Vector3(pCrownCenter.x, pCrownCenter.y, -0.068),
    new THREE.Vector3(pCrownCenter.x, pCrownCenter.y, 0.068),
    0.024,
    0.018,
    mats.MAT_FRAME_RAL9005,
    24
  );
  forkGroup.add(crownBridge);

  // Crown steerer clamp boss
  const crownNeck = createBiOvalTubeBetween(
    pHeadBot.clone().addScaledVector(forkDownDir, 0.016),
    pCrownCenter,
    0.022,
    0.022,
    mats.MAT_FRAME_RAL9005,
    20
  );
  forkGroup.add(crownNeck);

  // Front Axle Center: (0.565, 0.030, 0) -> Wheel radius 0.335 => tire touches floor y = -0.305..-0.335
  const pFrontAxle = new THREE.Vector3(0.565, 0.030, 0);

  // Stanchion spacing: z = ±0.065 (130mm crown center-to-center)
  [-1, 1].forEach((side) => {
    const zLeg = side * 0.065; // side = +1 is Left, side = -1 is Right
    const pLegCrown = new THREE.Vector3(pCrownCenter.x, pCrownCenter.y, zLeg);
    const pAxleDrop = new THREE.Vector3(pFrontAxle.x, pFrontAxle.y, side * 0.055);
    const legAxis = pAxleDrop.clone().sub(pLegCrown).normalize();

    // Crown leg socket boss
    const crownSocket = createCylinderBetween(
      pLegCrown.clone().addScaledVector(legAxis, -0.016),
      pLegCrown.clone().addScaledVector(legAxis, 0.022),
      0.021,
      0.020,
      mats.MAT_FRAME_RAL9005,
      24
    );
    forkGroup.add(crownSocket);

    if (side === 1) {
      // Left leg top: Blue/Black CNC Air Valve Cap (AIR 55-65 PSI)
      const airCap = createCylinderBetween(
        pLegCrown.clone().addScaledVector(legAxis, -0.016),
        pLegCrown.clone().addScaledVector(legAxis, -0.026),
        0.014,
        0.012,
        mats.MAT_BLUE_ANODIZED,
        18
      );
      forkGroup.add(airCap);
    } else {
      // Right leg top: Red/Black CNC Lockout Dial (LOCKOUT)
      const lockCap = createCylinderBetween(
        pLegCrown.clone().addScaledVector(legAxis, -0.016),
        pLegCrown.clone().addScaledVector(legAxis, -0.025),
        0.015,
        0.015,
        mats.MAT_RED_ANODIZED,
        18
      );
      forkGroup.add(lockCap);
    }

    // 32mm Black Anodized Stanchions (120mm visible travel + internal overlap)
    const pStanchionEnd = pLegCrown.clone().addScaledVector(legAxis, 0.165);
    const stanchion = createCylinderBetween(
      pLegCrown,
      pStanchionEnd,
      0.016,
      0.016,
      mats.MAT_ANODIZED_BLACK,
      28
    );
    forkGroup.add(stanchion);

    // Red Anodized Sag O-ring on Left Stanchion (1:1 as on reference photo!)
    if (side === 1) {
      const sagPos = pLegCrown.clone().addScaledVector(legAxis, 0.032);
      const sagRingGeom = new THREE.TorusGeometry(0.0168, 0.0022, 12, 24);
      const sagRing = new THREE.Mesh(sagRingGeom, mats.MAT_RED_ANODIZED);
      sagRing.position.copy(sagPos);
      sagRing.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), legAxis);
      forkGroup.add(sagRing);
    }

    // Dust Wiper Seal at top of Magnesium Lowers
    const pLowerTop = pLegCrown.clone().addScaledVector(legAxis, 0.142);
    const wiper = createCylinderBetween(
      pLowerTop.clone().addScaledVector(legAxis, -0.012),
      pLowerTop,
      0.022,
      0.019,
      mats.MAT_RUBBER_KENDA,
      24
    );
    forkGroup.add(wiper);

    // Red Anodized Trim Ring right under dust wiper (visible in photo!)
    const trimRing = createCylinderBetween(
      pLowerTop,
      pLowerTop.clone().addScaledVector(legAxis, 0.005),
      0.0218,
      0.0218,
      mats.MAT_RED_ANODIZED,
      24
    );
    forkGroup.add(trimRing);

    // 42mm Matte Black Magnesium Lower Leg with vertical white FOXSID Decal
    const lowerLeg = createCylinderBetween(
      pLowerTop,
      pAxleDrop.clone().addScaledVector(legAxis, 0.012),
      0.021,
      0.0185,
      mats.MAT_FOXSID_DECAL,
      32
    );
    // Orient FOXSID decal to face outward on both legs
    lowerLeg.rotateY(side === 1 ? 0 : Math.PI);
    forkGroup.add(lowerLeg);

    // Bottom rebound adjuster / bolt at fork foot
    const footBolt = createCylinderBetween(
      pAxleDrop.clone().addScaledVector(legAxis, 0.012),
      pAxleDrop.clone().addScaledVector(legAxis, 0.022),
      0.008,
      0.008,
      side === -1 ? mats.MAT_RED_ANODIZED : mats.MAT_ANODIZED_BLACK,
      16
    );
    forkGroup.add(footBolt);
  });

  // 2.3 Fork Arch (Gorilla) connecting left and right lowers in front of tire
  const archLeft = new THREE.Vector3(0.492, 0.278, 0.062);
  const archMid = new THREE.Vector3(0.542, 0.312, 0.0);
  const archRight = new THREE.Vector3(0.492, 0.278, -0.062);
  const archCurve = new THREE.CatmullRomCurve3([archLeft, archMid, archRight]);
  const archGeom = new THREE.TubeGeometry(archCurve, 24, 0.012, 16, false);
  const archMesh = new THREE.Mesh(archGeom, mats.MAT_FRAME_RAL9005);
  archMesh.castShadow = true;
  forkGroup.add(archMesh);

  // 2.4 Short Black Plastic Mudguard zipped directly under the Fork Arch (1:1 as on photo!)
  const mudguardCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.565, 0.318, 0),
    new THREE.Vector3(0.505, 0.305, 0),
    new THREE.Vector3(0.435, 0.255, 0)
  ]);
  const mudguardGeom = new THREE.TubeGeometry(mudguardCurve, 20, 0.044, 16, false);
  // Flatten tube into curved fender shell
  const mgPos = mudguardGeom.attributes.position;
  for (let i = 0; i < mgPos.count; i++) {
    const y = mgPos.getY(i);
    mgPos.setY(i, y * 0.99);
  }
  const fenderShape = new THREE.Shape();
  fenderShape.absarc(0, 0, 0.044, Math.PI * 0.15, Math.PI * 0.85, false);
  fenderShape.absarc(0, 0, 0.041, Math.PI * 0.85, Math.PI * 0.15, true);
  const fenderExtrude = new THREE.ExtrudeGeometry(fenderShape, {
    steps: 18,
    bevelEnabled: false,
    extrudePath: mudguardCurve
  });
  const mudguardMesh = new THREE.Mesh(fenderExtrude, mats.MAT_PETG_HOLDER);
  mudguardMesh.castShadow = true;
  forkGroup.add(mudguardMesh);

  // 2.5 Left Lower Leg Post Mount (PM 160) bosses + CNC Black PM-PM 180mm Adapter + Front ZOOM HB-890E Caliper
  const pFrontCaliper = new THREE.Vector3(0.508, 0.088, 0.052);
  const pmAdapterGeom = new THREE.BoxGeometry(0.022, 0.068, 0.014);
  const pmAdapter = new THREE.Mesh(pmAdapterGeom, mats.MAT_ANODIZED_BLACK);
  pmAdapter.position.set(0.502, 0.086, 0.056);
  pmAdapter.rotation.z = -0.32;
  forkGroup.add(pmAdapter);

  const frontCaliper = buildZoomCaliperMesh(mats);
  frontCaliper.position.copy(pFrontCaliper);
  frontCaliper.rotation.z = -0.32;
  forkGroup.add(frontCaliper);

  return forkGroup;
}

/**
 * Helper: Builds a 4-piston forged ZOOM HB-890E Hydraulic Brake Caliper with cooling fins
 */
export function buildZoomCaliperMesh(mats) {
  const calGroup = new THREE.Group();

  // Main forged 4-piston body
  const bodyGeom = new THREE.BoxGeometry(0.036, 0.076, 0.034);
  const body = new THREE.Mesh(bodyGeom, mats.MAT_ANODIZED_BLACK);
  body.castShadow = true;
  calGroup.add(body);

  // Dual machined piston caps (2 per side = 4 pistons)
  [-0.018, 0.018].forEach((yOff) => {
    const capGeom = new THREE.CylinderGeometry(0.011, 0.011, 0.037, 18);
    capGeom.rotateX(Math.PI / 2);
    const cap = new THREE.Mesh(capGeom, mats.MAT_RED_ANODIZED);
    cap.position.set(0.002, yOff, 0);
    calGroup.add(cap);
  });

  // Top cooling fins on brake pads
  for (let i = -2; i <= 2; i++) {
    const finGeom = new THREE.BoxGeometry(0.016, 0.008, 0.002);
    const fin = new THREE.Mesh(finGeom, mats.MAT_STEEL_ROTOR);
    fin.position.set(0.016, 0, i * 0.004);
    calGroup.add(fin);
  }

  // Banjo bolt & bleed nipple
  const banjo = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.014, 12), mats.MAT_STEEL_ROTOR);
  banjo.position.set(-0.014, 0.038, 0.008);
  calGroup.add(banjo);

  return calGroup;
}

/**
 * 3. NODE 2: COCKPIT, 740MM RISER BAR, SUR-RON DUAL LED HEADLIGHT, SW900, 20X THROTTLE & ZOOM LEVERS
 */
export function buildCockpitNode(mats) {
  const cockpitGroup = new THREE.Group();
  cockpitGroup.name = 'NODE_02_COCKPIT_SURRON_LIGHT';

  // Stem base above Head Tube top (0.390, 0.565, 0)
  const pStemSteerer = new THREE.Vector3(0.376, 0.608, 0);
  const pBarCenter = new THREE.Vector3(0.418, 0.620, 0);

  // Headset spacers (10mm x 3)
  const spacers = createCylinderBetween(
    new THREE.Vector3(0.390, 0.565, 0),
    pStemSteerer,
    0.0175,
    0.0175,
    mats.MAT_ANODIZED_BLACK,
    24
  );
  cockpitGroup.add(spacers);

  // Short 45mm CNC MTB Stem with 4x M5 faceplate bolts
  const stemBody = createBiOvalTubeBetween(pStemSteerer, pBarCenter, 0.021, 0.022, mats.MAT_ANODIZED_BLACK, 20);
  cockpitGroup.add(stemBody);

  // Top cap with M6 preload bolt
  const topCap = createCylinderBetween(
    pStemSteerer.clone().add(new THREE.Vector3(-0.005, 0.016, 0)),
    pStemSteerer.clone().add(new THREE.Vector3(-0.007, 0.020, 0)),
    0.0175,
    0.015,
    mats.MAT_ANODIZED_BLACK,
    20
  );
  cockpitGroup.add(topCap);

  // 4x M5 stainless bolts on stem faceplate
  [-0.012, 0.012].forEach((dy) => {
    [-0.014, 0.014].forEach((dz) => {
      const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.008, 10), mats.MAT_STEEL_ROTOR);
      bolt.rotation.z = Math.PI / 2;
      bolt.position.set(pBarCenter.x + 0.018, pBarCenter.y + dy, dz);
      cockpitGroup.add(bolt);
    });
  });

  // 740mm Wide Riser Handlebar (31.8mm center clamping -> 22.2mm grip ends, z: -0.370..+0.370)
  const barCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.365, 0.658, -0.370),
    new THREE.Vector3(0.392, 0.652, -0.200),
    new THREE.Vector3(0.415, 0.625, -0.075),
    new THREE.Vector3(0.418, 0.620, 0.000),
    new THREE.Vector3(0.415, 0.625, 0.075),
    new THREE.Vector3(0.392, 0.652, 0.200),
    new THREE.Vector3(0.365, 0.658, 0.370)
  ]);
  const barGeom = new THREE.TubeGeometry(barCurve, 64, 0.0125, 20, false);
  // Thicken center 31.8mm clamp zone
  const bPos = barGeom.attributes.position;
  for (let i = 0; i < bPos.count; i++) {
    const zVal = Math.abs(bPos.getZ(i));
    if (zVal < 0.065) {
      const factor = 1.0 + (1.0 - zVal / 0.065) * 0.26;
      const dx = bPos.getX(i) - 0.418;
      const dy = bPos.getY(i) - 0.620;
      bPos.setX(i, 0.418 + dx * factor);
      bPos.setY(i, 0.620 + dy * factor);
    }
  }
  barGeom.computeVertexNormals();
  const barMesh = new THREE.Mesh(barGeom, mats.MAT_ANODIZED_BLACK);
  barMesh.castShadow = true;
  cockpitGroup.add(barMesh);

  // SUR-RON LIGHT BEE X (20W) Dual Rectangular LED Headlight right under stem/bar center (1:1 as on photo!)
  const headlightGroup = new THREE.Group();
  headlightGroup.name = 'SURRON_DUAL_LED_HEADLIGHT';
  headlightGroup.position.set(0.452, 0.585, 0);
  headlightGroup.rotation.z = -0.18;

  // Finned CNC Aluminum Housing
  const hlHousing = new THREE.Mesh(new THREE.BoxGeometry(0.044, 0.042, 0.112), mats.MAT_ANODIZED_BLACK);
  hlHousing.castShadow = true;
  headlightGroup.add(hlHousing);

  // Rear cooling fins
  for (let i = -3; i <= 3; i++) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.003, 0.108), mats.MAT_ANODIZED_BLACK);
    fin.position.set(-0.025, i * 0.0055, 0);
    headlightGroup.add(fin);
  }

  // Two deep reflector LED eyes in a row (Left & Right)
  const ledEyes = [];
  [-0.026, 0.026].forEach((zEye) => {
    const reflector = new THREE.Mesh(
      new THREE.CylinderGeometry(0.016, 0.008, 0.018, 24, 1, true),
      mats.MAT_STEEL_ROTOR
    );
    reflector.rotation.z = -Math.PI / 2;
    reflector.position.set(0.015, 0, zEye);
    headlightGroup.add(reflector);

    const emitter = new THREE.Mesh(new THREE.SphereGeometry(0.009, 16, 16), mats.MAT_LED_HEADLIGHT);
    emitter.position.set(0.012, 0, zEye);
    headlightGroup.add(emitter);
    ledEyes.push(emitter);
  });

  // Light Smoke tinted front polycarbonate lens
  const smokeLens = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.036, 0.104), mats.MAT_HEADLIGHT_SMOKE);
  smokeLens.position.set(0.023, 0, 0);
  headlightGroup.add(smokeLens);

  // Headlight bracket to stem
  const hlBracket = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.035, 0.048), mats.MAT_ANODIZED_BLACK);
  hlBracket.position.set(-0.018, 0.022, 0);
  headlightGroup.add(hlBracket);

  cockpitGroup.add(headlightGroup);

  // SW900 LCD Computer above Stem + 3-button remote on Left
  const sw900Group = new THREE.Group();
  sw900Group.position.set(0.415, 0.658, 0.0);
  sw900Group.rotation.z = 0.45;
  const swCase = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.056, 0.086), mats.MAT_ANODIZED_BLACK);
  const swScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.048, 0.076), mats.MAT_SW900_SCREEN);
  swScreen.rotation.y = Math.PI / 2;
  swScreen.rotation.x = Math.PI / 2;
  swScreen.position.set(0.0095, 0, 0);
  sw900Group.add(swCase, swScreen);
  cockpitGroup.add(sw900Group);

  // Tactical Smartphone Mount with silicone vibration damper on left inner bar (visible in photo!)
  const phoneMount = new THREE.Group();
  phoneMount.position.set(0.355, 0.565, 0.045);
  const mountClamp = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.045, 0.042), mats.MAT_ANODIZED_BLACK);
  const clawTop = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.025, 0.072), mats.MAT_ANODIZED_BLACK);
  clawTop.position.set(-0.015, 0.035, 0);
  phoneMount.add(mountClamp, clawTop);
  cockpitGroup.add(phoneMount);

  // Left & Right Ribbed Rubber Grips
  const leftGrip = createCylinderBetween(
    new THREE.Vector3(0.376, 0.656, 0.250),
    new THREE.Vector3(0.365, 0.658, 0.370),
    0.016,
    0.016,
    mats.MAT_RUBBER_KENDA,
    24
  );
  const rightGrip = createCylinderBetween(
    new THREE.Vector3(0.374, 0.656, -0.275),
    new THREE.Vector3(0.365, 0.658, -0.370),
    0.016,
    0.016,
    mats.MAT_RUBBER_KENDA,
    24
  );
  cockpitGroup.add(leftGrip, rightGrip);

  // Right Side Half-Twist Throttle 20X with white/blue indicator ring (1:1 as on photo!)
  const throttleBody = createCylinderBetween(
    new THREE.Vector3(0.382, 0.654, -0.220),
    new THREE.Vector3(0.374, 0.656, -0.275),
    0.022,
    0.020,
    mats.MAT_ANODIZED_BLACK,
    24
  );
  const throttleRing = createCylinderBetween(
    new THREE.Vector3(0.380, 0.655, -0.232),
    new THREE.Vector3(0.378, 0.655, -0.246),
    0.0235,
    0.0235,
    mats.MAT_WHITE_INSULATOR,
    24
  );
  const throttleAccent = createCylinderBetween(
    new THREE.Vector3(0.382, 0.654, -0.225),
    new THREE.Vector3(0.380, 0.655, -0.232),
    0.0232,
    0.0232,
    mats.MAT_BLUE_ANODIZED,
    24
  );
  cockpitGroup.add(throttleBody, throttleRing, throttleAccent);

  // Left Side 2-in-1 Switch Block (Headlight toggle + Red 105 dB Moto Horn Button)
  const switchBlock = new THREE.Mesh(new THREE.BoxGeometry(0.034, 0.042, 0.026), mats.MAT_ANODIZED_BLACK);
  switchBlock.position.set(0.380, 0.655, 0.232);
  const redHornBtn = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.012, 0.014), mats.MAT_RED_ANODIZED);
  redHornBtn.position.set(0.364, 0.648, 0.232);
  cockpitGroup.add(switchBlock, redHornBtn);

  // ZOOM HB-890E Hydraulic Brake Levers with mineral oil reservoirs & braided hoses
  [-1, 1].forEach((side) => {
    const zBase = side * 0.205;
    const leverGroup = new THREE.Group();
    leverGroup.position.set(0.386, 0.652, zBase);

    // Mineral oil reservoir master cylinder
    const reservoir = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.026, 0.045), mats.MAT_ANODIZED_BLACK);
    reservoir.position.set(0.018, 0.006, -side * 0.018);
    leverGroup.add(reservoir);

    // Ergonomic 2-finger CNC brake blade
    const bladeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.024, -0.005, -side * 0.025),
      new THREE.Vector3(0.048, -0.018, side * 0.035),
      new THREE.Vector3(0.042, -0.024, side * 0.095)
    ]);
    const bladeGeom = new THREE.TubeGeometry(bladeCurve, 16, 0.0055, 10, false);
    const blade = new THREE.Mesh(bladeGeom, mats.MAT_ANODIZED_BLACK);
    leverGroup.add(blade);

    cockpitGroup.add(leverGroup);
  });

  // Braided Hydraulic Brake Hoses descending down fork & frame
  const frontHoseCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.405, 0.645, 0.185),
    new THREE.Vector3(0.465, 0.540, 0.095),
    new THREE.Vector3(0.470, 0.390, 0.072),
    new THREE.Vector3(0.495, 0.220, 0.068),
    new THREE.Vector3(0.505, 0.105, 0.056)
  ]);
  cockpitGroup.add(new THREE.Mesh(new THREE.TubeGeometry(frontHoseCurve, 32, 0.0032, 8, false), mats.MAT_RUBBER_KENDA));

  const rearHoseCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.405, 0.645, -0.185),
    new THREE.Vector3(0.455, 0.535, -0.065),
    new THREE.Vector3(0.395, 0.455, 0.022),
    new THREE.Vector3(0.015, 0.015, 0.025),
    new THREE.Vector3(-0.425, 0.055, 0.070)
  ]);
  cockpitGroup.add(new THREE.Mesh(new THREE.TubeGeometry(rearHoseCurve, 36, 0.0032, 8, false), mats.MAT_RUBBER_KENDA));

  return cockpitGroup;
}

/**
 * Helper: Builds a perforated ventilated 180mm stainless steel brake rotor (R = 0.090m)
 */
export function buildBrakeRotor180mm(mats) {
  const rotorGroup = new THREE.Group();
  const outerR = 0.090;
  const innerTrackR = 0.073;

  // Outer friction ring with ventilation holes
  const ringShape = new THREE.Shape();
  ringShape.absarc(0, 0, outerR, 0, Math.PI * 2, false);
  const innerHole = new THREE.Path();
  innerHole.absarc(0, 0, innerTrackR, 0, Math.PI * 2, true);
  ringShape.holes.push(innerHole);

  // Add 24 ventilation perforations in the friction track
  for (let i = 0; i < 24; i++) {
    const ang = (i / 24) * Math.PI * 2;
    const rMid = (outerR + innerTrackR) * 0.5;
    const vent = new THREE.Path();
    vent.absarc(Math.cos(ang) * rMid, Math.sin(ang) * rMid, 0.0032, 0, Math.PI * 2, true);
    ringShape.holes.push(vent);
  }

  const rotorGeom = new THREE.ExtrudeGeometry(ringShape, { depth: 0.0022, bevelEnabled: false });
  rotorGeom.translate(0, 0, -0.0011);
  const frictionRing = new THREE.Mesh(rotorGeom, mats.MAT_STEEL_ROTOR);
  rotorGroup.add(frictionRing);

  // 6 Spider Arms + 6-bolt ISO hub mount (BCD 44mm)
  for (let i = 0; i < 6; i++) {
    const a1 = (i / 6) * Math.PI * 2;
    const a2 = a1 + 0.28;
    const arm = createCylinderBetween(
      new THREE.Vector3(Math.cos(a1) * 0.024, Math.sin(a1) * 0.024, 0),
      new THREE.Vector3(Math.cos(a2) * innerTrackR, Math.sin(a2) * innerTrackR, 0),
      0.004,
      0.0035,
      mats.MAT_STEEL_ROTOR,
      8
    );
    arm.scale.z = 0.35;
    rotorGroup.add(arm);

    // Torx T25 rotor bolt
    const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.0035, 0.0035, 0.006, 10), mats.MAT_STEEL_ROTOR);
    bolt.rotation.x = Math.PI / 2;
    bolt.position.set(Math.cos(a1) * 0.022, Math.sin(a1) * 0.022, 0.002);
    rotorGroup.add(bolt);
  }

  const hubRing = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.0024, 24), mats.MAT_STEEL_ROTOR);
  hubRing.rotation.x = Math.PI / 2;
  rotorGroup.add(hubRing);

  return rotorGroup;
}

/**
 * Helper: Builds a 26" Wheel on SunRingle MTX39 Rim + Kenda 26x2.35" Tire with 72-step 3D Instanced Knobs
 */
function buildWheelBase26(mats) {
  const wheelGroup = new THREE.Group();

  // Outer tire radius = 0.335m (670mm diameter), balloon width = 59mm (tube radius = 0.0295m)
  // Torus major radius R_carcass = 0.335 - 0.0295 = 0.3055m
  const R_carcass = 0.302;
  const r_balloon = 0.0295;

  // 1. Tire Carcass (Kenda 26x2.35")
  const carcassGeom = new THREE.TorusGeometry(R_carcass, r_balloon, 28, 96);
  const carcassMesh = new THREE.Mesh(carcassGeom, mats.MAT_RUBBER_KENDA);
  carcassMesh.castShadow = true;
  carcassMesh.receiveShadow = true;
  wheelGroup.add(carcassMesh);

  // 2. Real 3D Instanced Tread Knobs (72 steps around circumference: dual center + aggressive side lugs!)
  const steps = 72;
  const knobGeom = new THREE.BoxGeometry(0.011, 0.0065, 0.012);
  // 4 knobs per step (2 center blocks + 2 angled shoulder blocks) = 288 3D lugs per wheel
  const instancedKnobs = new THREE.InstancedMesh(knobGeom, mats.MAT_RUBBER_KENDA, steps * 4);
  instancedKnobs.castShadow = true;

  const dummy = new THREE.Object3D();
  let idx = 0;

  for (let i = 0; i < steps; i++) {
    const theta = (i / steps) * Math.PI * 2;
    const stagger = (i % 2) * 0.003;

    // Dual Center Knobs (left & right of centerline)
    [-1, 1].forEach((side) => {
      const phi = side * 0.24; // angular offset on tire cross-section
      const rPos = R_carcass + (r_balloon + 0.0022) * Math.cos(phi);
      const zPos = (r_balloon + 0.0022) * Math.sin(phi);

      dummy.position.set(Math.cos(theta) * rPos, Math.sin(theta) * rPos, zPos);
      dummy.rotation.set(0, 0, theta - Math.PI / 2);
      dummy.rotateX(phi);
      dummy.scale.set(1.15, 1.0, 0.95);
      dummy.updateMatrix();
      instancedKnobs.setMatrixAt(idx++, dummy.matrix);
    });

    // Aggressive Cornering Side Lugs
    [-1, 1].forEach((side) => {
      const phi = side * 0.68;
      const rPos = R_carcass + (r_balloon + 0.0025) * Math.cos(phi);
      const zPos = (r_balloon + 0.0025) * Math.sin(phi) + side * stagger;

      dummy.position.set(Math.cos(theta) * rPos, Math.sin(theta) * rPos, zPos);
      dummy.rotation.set(0, 0, theta - Math.PI / 2);
      dummy.rotateX(phi);
      dummy.rotateY(side * 0.28);
      dummy.scale.set(1.3, 1.25, 1.1);
      dummy.updateMatrix();
      instancedKnobs.setMatrixAt(idx++, dummy.matrix);
    });
  }
  instancedKnobs.instanceMatrix.needsUpdate = true;
  wheelGroup.add(instancedKnobs);

  // 3. SunRingle / PowerCircle MTX39 Double-Wall Eyeleted Moto Rim (39mm wide, 24mm profile height)
  // Rim outer radius ~ 0.279m, inner spoke bed radius ~ 0.255m
  const rimProfile = [
    new THREE.Vector2(0.255, -0.011),
    new THREE.Vector2(0.264, -0.0195),
    new THREE.Vector2(0.279, -0.0195),
    new THREE.Vector2(0.279, 0.0195),
    new THREE.Vector2(0.264, 0.0195),
    new THREE.Vector2(0.255, 0.011),
    new THREE.Vector2(0.255, -0.011)
  ];
  const rimLatheGeom = new THREE.LatheGeometry(rimProfile, 64);
  rimLatheGeom.rotateX(Math.PI / 2);
  const rimMesh = new THREE.Mesh(rimLatheGeom, mats.MAT_RIM_MTX39);
  rimMesh.castShadow = true;
  wheelGroup.add(rimMesh);

  return wheelGroup;
}

/**
 * 4. NODE 3A: FRONT WHEEL 26" MTX39 (36x 14G 3-Cross Spokes, Disc Hub, 180mm Rotor)
 */
export function buildFrontWheelNode(mats) {
  const frontWheel = buildWheelBase26(mats);
  frontWheel.name = 'NODE_03A_FRONT_WHEEL_MTX39';
  frontWheel.position.set(0.565, 0.030, 0);

  // Front Disc Hub + Solid Axle with Black Nuts
  const hubBody = createCylinderBetween(
    new THREE.Vector3(0, 0, -0.052),
    new THREE.Vector3(0, 0, 0.052),
    0.018,
    0.018,
    mats.MAT_ANODIZED_BLACK,
    24
  );
  frontWheel.add(hubBody);

  // Hub Flanges
  [-0.032, 0.032].forEach((zFlange) => {
    const flange = createCylinderBetween(
      new THREE.Vector3(0, 0, zFlange - 0.002),
      new THREE.Vector3(0, 0, zFlange + 0.002),
      0.032,
      0.032,
      mats.MAT_ANODIZED_BLACK,
      28
    );
    frontWheel.add(flange);
  });

  // Solid axle + black axle nuts
  const axle = createCylinderBetween(
    new THREE.Vector3(0, 0, -0.072),
    new THREE.Vector3(0, 0, 0.072),
    0.006,
    0.006,
    mats.MAT_ANODIZED_BLACK,
    16
  );
  frontWheel.add(axle);

  // 36 Black 14G Spokes in 3-Cross pattern with Brass Nipples
  const R_rim = 0.255;
  const R_hub = 0.029;
  for (let i = 0; i < 36; i++) {
    const side = i % 2 === 0 ? 1 : -1;
    const crossDir = i % 4 < 2 ? 1 : -1;
    const rimAngle = (i / 36) * Math.PI * 2;
    const hubAngle = rimAngle + crossDir * 0.95; // 3-cross tangential angle

    const pHub = new THREE.Vector3(Math.cos(hubAngle) * R_hub, Math.sin(hubAngle) * R_hub, side * 0.032);
    const pRim = new THREE.Vector3(Math.cos(rimAngle) * R_rim, Math.sin(rimAngle) * R_rim, side * 0.003);

    const spoke = createCylinderBetween(pHub, pRim, 0.0011, 0.0011, mats.MAT_ANODIZED_BLACK, 6);
    frontWheel.add(spoke);

    // Brass spoke nipple at rim bed
    const pNippleStart = pRim.clone().lerp(pHub, 0.055);
    const nipple = createCylinderBetween(pNippleStart, pRim, 0.0022, 0.0022, mats.MAT_BRASS_NIPPLE, 6);
    frontWheel.add(nipple);
  }

  // Front 180mm Perforated Brake Rotor on Left Side (z = +0.044)
  const frontRotor = buildBrakeRotor180mm(mats);
  frontRotor.position.set(0, 0, 0.044);
  frontWheel.add(frontRotor);

  return frontWheel;
}

/**
 * 5. NODE 3B: REAR WHEEL 26" MTX39 + 72V 3000W DIRECT DRIVE MOTOR (245mm OD, 18x M4 Bolts, 12G Spokes)
 */
export function buildRearWheelNode(mats) {
  const rearWheel = buildWheelBase26(mats);
  rearWheel.name = 'NODE_03B_REAR_WHEEL_3000W';
  rearWheel.position.set(-0.435, 0.030, 0);

  // Massive 72V 3000W Direct Drive Hub Motor: OD 245mm (R = 0.1225m), Stator width 64mm
  const R_motor = 0.1225;
  const motorStator = createCylinderBetween(
    new THREE.Vector3(0, 0, -0.032),
    new THREE.Vector3(0, 0, 0.032),
    R_motor,
    R_motor,
    mats.MAT_FRAME_RAL9005,
    48
  );
  rearWheel.add(motorStator);

  // Left & Right Anodized Side Covers + Ring of 18 Shiny M4 Hex Bolts per side
  [-1, 1].forEach((side) => {
    const zCover = side * 0.032;
    const cover = createCylinderBetween(
      new THREE.Vector3(0, 0, zCover),
      new THREE.Vector3(0, 0, zCover + side * 0.006),
      R_motor * 0.96,
      R_motor * 0.78,
      mats.MAT_ANODIZED_BLACK,
      48
    );
    rearWheel.add(cover);

    // 18 shiny stainless M4 hex socket bolts around motor cover perimeter
    const boltRadius = R_motor * 0.87;
    for (let b = 0; b < 18; b++) {
      const ang = (b / 18) * Math.PI * 2;
      const bolt = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0028, 0.0028, 0.005, 8),
        mats.MAT_STEEL_ROTOR
      );
      bolt.rotation.x = Math.PI / 2;
      bolt.position.set(
        Math.cos(ang) * boltRadius,
        Math.sin(ang) * boltRadius,
        zCover + side * 0.0065
      );
      rearWheel.add(bolt);
    }
  });

  // 36 Thick Short Black 12G (2.6mm -> R=0.00145m) Spokes with heavy-duty nipples
  const R_rim = 0.255;
  const R_flange = 0.116;
  for (let i = 0; i < 36; i++) {
    const side = i % 2 === 0 ? 1 : -1;
    const crossDir = i % 4 < 2 ? 1 : -1;
    const rimAngle = (i / 36) * Math.PI * 2;
    const hubAngle = rimAngle + crossDir * 0.26; // 1-cross / radial-tangential lace for large 245mm DD motor

    const pHub = new THREE.Vector3(Math.cos(hubAngle) * R_flange, Math.sin(hubAngle) * R_flange, side * 0.031);
    const pRim = new THREE.Vector3(Math.cos(rimAngle) * R_rim, Math.sin(rimAngle) * R_rim, side * 0.003);

    const spoke = createCylinderBetween(pHub, pRim, 0.00145, 0.00145, mats.MAT_ANODIZED_BLACK, 8);
    rearWheel.add(spoke);

    const pNippleStart = pRim.clone().lerp(pHub, 0.12);
    const nipple = createCylinderBetween(pNippleStart, pRim, 0.0028, 0.0028, mats.MAT_BRASS_NIPPLE, 8);
    rearWheel.add(nipple);
  }

  // M14 Axle with 10mm flat sides + Black Braided Phase/Hall Cable exiting axle
  const m14Axle = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.010, 0.185), mats.MAT_STEEL_ROTOR);
  rearWheel.add(m14Axle);

  // Heavy-duty M14 flange nuts with lock washers
  [-0.082, 0.082].forEach((zNut) => {
    const nut = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.012, 6), mats.MAT_STEEL_ROTOR);
    nut.rotation.x = Math.PI / 2;
    nut.position.set(0, 0, zNut);
    rearWheel.add(nut);
  });

  // Single-speed 16T Freewheel Sprocket on Right Side (z = -0.056)
  const freewheel = createCylinderBetween(
    new THREE.Vector3(0, 0, -0.042),
    new THREE.Vector3(0, 0, -0.060),
    0.035,
    0.035,
    mats.MAT_STEEL_ROTOR,
    18
  );
  rearWheel.add(freewheel);

  // Rear 180mm Perforated Brake Rotor on Left Side (z = +0.052)
  const rearRotor = buildBrakeRotor180mm(mats);
  rearRotor.position.set(0, 0, 0.052);
  rearWheel.add(rearRotor);

  return rearWheel;
}

/**
 * 6. NODE 4: CUSTOM 6MM STEEL MONOLITHIC DROPOUT ARMOR PLATE ("2-IN-1": M14 10x14MM SLOT + IS 51MM EARS)
 *    + IS-PM 180 ADAPTER + REAR 4-PISTON ZOOM HB-890E CALIPER
 */
export function buildRearDropoutBrakeNode(mats) {
  const dropoutGroup = new THREE.Group();
  dropoutGroup.name = 'NODE_04_REAR_DROPOUT_6MM_ZOOM';

  // Rear Axle is at (-0.435, 0.030, 0). Left frame dropout is at z = +0.0675.
  // Outer 6mm monolithic steel plate sits at z = +0.070..+0.076.
  const axX = -0.435;
  const axY = 0.030;

  // Monolithic 6mm Steel Plate ("2-in-1"): bottom 10x14mm anti-rotation slot for M14 axle + top IS 51mm brake ears
  const plateShape = new THREE.Shape();
  plateShape.moveTo(axX + 0.032, axY - 0.022);
  plateShape.lineTo(axX + 0.005, axY - 0.022);
  // Open 10mm wide x 14mm deep M14 axle slot at bottom
  plateShape.lineTo(axX + 0.005, axY + 0.007);
  plateShape.lineTo(axX - 0.005, axY + 0.007);
  plateShape.lineTo(axX - 0.005, axY - 0.022);
  plateShape.lineTo(axX - 0.028, axY - 0.022);
  plateShape.lineTo(axX - 0.034, axY + 0.035);
  // Rear IS Ear #1
  plateShape.lineTo(axX - 0.022, axY + 0.082);
  plateShape.lineTo(axX - 0.006, axY + 0.084);
  plateShape.lineTo(axX + 0.002, axY + 0.056);
  // Front IS Ear #2 (51mm spacing from Ear #1)
  plateShape.lineTo(axX + 0.024, axY + 0.066);
  plateShape.lineTo(axX + 0.038, axY + 0.062);
  plateShape.lineTo(axX + 0.032, axY + 0.020);
  plateShape.closePath();

  // 6mm mounting bolt holes in IS ears
  const earHole1 = new THREE.Path();
  earHole1.absarc(axX - 0.014, axY + 0.074, 0.0032, 0, Math.PI * 2, true);
  plateShape.holes.push(earHole1);

  const earHole2 = new THREE.Path();
  earHole2.absarc(axX + 0.030, axY + 0.052, 0.0032, 0, Math.PI * 2, true);
  plateShape.holes.push(earHole2);

  const plateGeom = new THREE.ExtrudeGeometry(plateShape, {
    depth: 0.006,
    bevelEnabled: true,
    bevelThickness: 0.0008,
    bevelSize: 0.0008,
    bevelSegments: 2
  });
  plateGeom.translate(0, 0, 0.070);
  const leftArmorPlate = new THREE.Mesh(plateGeom, mats.MAT_FRAME_RAL9005);
  leftArmorPlate.castShadow = true;
  dropoutGroup.add(leftArmorPlate);

  // Right-side 6mm steel torque plate (at z = -0.076)
  const rightPlateGeom = plateGeom.clone();
  rightPlateGeom.translate(0, 0, -0.146);
  const rightArmorPlate = new THREE.Mesh(rightPlateGeom, mats.MAT_FRAME_RAL9005);
  dropoutGroup.add(rightArmorPlate);

  // IS-to-PM Rear 180mm CNC Black Adapter bolted to the 51mm IS ears
  const isPmAdapter = new THREE.Mesh(new THREE.BoxGeometry(0.068, 0.020, 0.014), mats.MAT_ANODIZED_BLACK);
  isPmAdapter.position.set(axX + 0.008, axY + 0.066, 0.062);
  isPmAdapter.rotation.z = -0.46;
  dropoutGroup.add(isPmAdapter);

  // Rear 4-Piston Forged ZOOM HB-890E Caliper on 180mm rotor radius
  const rearCaliper = buildZoomCaliperMesh(mats);
  rearCaliper.position.set(axX + 0.014, axY + 0.082, 0.052);
  rearCaliper.rotation.z = -1.12;
  dropoutGroup.add(rearCaliper);

  return dropoutGroup;
}
