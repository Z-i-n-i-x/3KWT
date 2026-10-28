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

  // Left & Right Crank Arms (170mm length) + Open-Cage CNC MTB Platform Pedals with steel traction pins
  // Left crank pointing forward horizontally (1:1 as on Reference Photo #1!), Right crank backward
  const crankConfigs = [
    { side: 1, z: 0.052, dir: new THREE.Vector3(0.168, -0.008, 0) },   // Left side (forward horizontal)
    { side: -1, z: -0.052, dir: new THREE.Vector3(-0.168, 0.008, 0) }  // Right side (rearward horizontal)
  ];

  crankConfigs.forEach((cfg) => {
    const pStart = new THREE.Vector3(0, 0, cfg.z);
    const pEnd = new THREE.Vector3(cfg.dir.x, cfg.dir.y, cfg.z + cfg.side * 0.008);
    const arm = createBiOvalTubeBetween(pStart, pEnd, 0.015, 0.007, mats.MAT_ANODIZED_BLACK, 20);
    crankGroup.add(arm);

    // Silver crank fixing bolt at BB & pedal thread boss
    const bbBolt = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.004, 16), mats.MAT_STEEL_ROTOR);
    bbBolt.rotation.x = Math.PI / 2;
    bbBolt.position.set(0, 0, cfg.z + cfg.side * 0.006);
    crankGroup.add(bbBolt);

    // Pedal spindle + Open-Cage CNC MTB Platform Body (no solid slab reflection!)
    const pPedalCenter = pEnd.clone().add(new THREE.Vector3(0, 0, cfg.side * 0.052));
    const spindle = createCylinderBetween(pEnd, pPedalCenter, 0.0055, 0.0055, mats.MAT_STEEL_ROTOR, 12);
    crankGroup.add(spindle);

    const pedalGroup = new THREE.Group();
    pedalGroup.position.copy(pPedalCenter);

    // Center spindle barrel + front/rear/outer/inner CNC cage bars
    const centerBarrel = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.014, 0.090), mats.MAT_FRAME_RAL9005);
    const frontBar = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.014, 0.092), mats.MAT_FRAME_RAL9005);
    frontBar.position.set(0.042, 0, 0);
    const rearBar = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.014, 0.092), mats.MAT_FRAME_RAL9005);
    rearBar.position.set(-0.042, 0, 0);
    const outerBar = new THREE.Mesh(new THREE.BoxGeometry(0.096, 0.014, 0.012), mats.MAT_FRAME_RAL9005);
    outerBar.position.set(0, 0, 0.040);
    const innerBar = new THREE.Mesh(new THREE.BoxGeometry(0.096, 0.014, 0.012), mats.MAT_FRAME_RAL9005);
    innerBar.position.set(0, 0, -0.040);
    pedalGroup.add(centerBarrel, frontBar, rearBar, outerBar, innerBar);

    // Steel traction pins on open-cage pedal perimeter
    const pinGeom = new THREE.CylinderGeometry(0.0014, 0.0014, 0.020, 6);
    [-0.042, 0, 0.042].forEach((px) => {
      [-0.038, 0.038].forEach((pz) => {
        const pin = new THREE.Mesh(pinGeom, mats.MAT_STEEL_ROTOR);
        pin.position.set(px, 0, pz);
        pedalGroup.add(pin);
      });
    });
    crankGroup.add(pedalGroup);
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
 * 2. NODE 1: FRONT AIR FORK FOXSID 32 26" (Single-Crown, 120mm Travel, Mudguard, 32/XSD/FOXSID Decals)
 *    1:1 with Reference Photo #4 & #1
 */
export function buildForkNode(mats) {
  const forkGroup = new THREE.Group();
  forkGroup.name = 'NODE_01_FORK_FOXSID_X2';

  // Head Tube axis reference: Top (0.390, 0.565, 0) -> Bottom (0.425, 0.450, 0)
  const pHeadTop = new THREE.Vector3(0.390, 0.565, 0);
  const pHeadBot = new THREE.Vector3(0.425, 0.450, 0);
  const forkDownDir = pHeadBot.clone().sub(pHeadTop).normalize();
  const forkFwdDir = new THREE.Vector3(forkDownDir.y, -forkDownDir.x, 0).normalize();

  // 2.1 Straight 1 1/8" (28.6mm) Steerer Tube inside Head Tube + extending to stem
  const pSteererTop = pHeadTop.clone().addScaledVector(forkDownDir, -0.065);
  const pSteererBot = pHeadBot.clone().addScaledVector(forkDownDir, 0.015);
  const steerer = createCylinderBetween(pSteererTop, pSteererBot, 0.0143, 0.0143, mats.MAT_ANODIZED_BLACK, 24);
  forkGroup.add(steerer);

  // 2.2 Cast Matte Black Single Crown with sculpted downward shoulder arms (matching Photo #4)
  const pCrownCenter = pHeadBot.clone().addScaledVector(forkDownDir, 0.018).addScaledVector(forkFwdDir, 0.020);
  const crownNeck = createBiOvalTubeBetween(
    pHeadBot.clone().addScaledVector(forkDownDir, 0.012),
    pCrownCenter,
    0.022,
    0.022,
    mats.MAT_FRAME_RAL9005,
    20
  );
  forkGroup.add(crownNeck);

  // Sculpted left & right crown arms sloping slightly down to the stanchion sockets
  [-1, 1].forEach((side) => {
    const armEnd = pCrownCenter.clone().addScaledVector(forkDownDir, 0.008);
    armEnd.z = side * 0.065;
    const armMesh = createBiOvalTubeBetween(pCrownCenter, armEnd, 0.021, 0.016, mats.MAT_FRAME_RAL9005, 20);
    forkGroup.add(armMesh);
  });

  // Front Axle Center: (0.565, 0.030, 0)
  const pFrontAxle = new THREE.Vector3(0.565, 0.030, 0);

  // Stanchion spacing: z = ±0.065 (130mm crown center-to-center)
  [-1, 1].forEach((side) => {
    const zLeg = side * 0.065; // side = +1 is Left, side = -1 is Right
    const pLegCrown = new THREE.Vector3(pCrownCenter.x, pCrownCenter.y, zLeg).addScaledVector(forkDownDir, 0.008);
    const pAxleDrop = new THREE.Vector3(pFrontAxle.x, pFrontAxle.y, side * 0.056);
    const legAxis = pAxleDrop.clone().sub(pLegCrown).normalize();

    // Crown leg socket boss
    const crownSocket = createCylinderBetween(
      pLegCrown.clone().addScaledVector(legAxis, -0.016),
      pLegCrown.clone().addScaledVector(legAxis, 0.024),
      0.021,
      0.020,
      mats.MAT_FRAME_RAL9005,
      24
    );
    forkGroup.add(crownSocket);

    if (side === 1) {
      // Left leg top: Black CNC Air Valve Cap (AIR 55-65 PSI) + Blue accent ring (as on Photo #1 & #4)
      const airCap = createCylinderBetween(
        pLegCrown.clone().addScaledVector(legAxis, -0.016),
        pLegCrown.clone().addScaledVector(legAxis, -0.025),
        0.0145,
        0.0135,
        mats.MAT_BLUE_ANODIZED,
        20
      );
      forkGroup.add(airCap);
    } else {
      // Right leg top: Blue Anodized CNC Compression / Lockout Dial (1:1 as on Reference Photo #4!)
      const lockCap = createCylinderBetween(
        pLegCrown.clone().addScaledVector(legAxis, -0.016),
        pLegCrown.clone().addScaledVector(legAxis, -0.025),
        0.0155,
        0.0155,
        mats.MAT_BLUE_ANODIZED,
        20
      );
      forkGroup.add(lockCap);
    }

    // 32mm Black Anodized Stanchions (120mm visible travel)
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

    // Red Anodized Sag O-ring on Stanchion (1:1 as on Reference Photo #4!)
    const sagPos = pLegCrown.clone().addScaledVector(legAxis, side === 1 ? 0.045 : 0.095);
    const sagRingGeom = new THREE.TorusGeometry(0.0166, 0.0020, 12, 24);
    const sagRing = new THREE.Mesh(sagRingGeom, mats.MAT_RED_ANODIZED);
    sagRing.position.copy(sagPos);
    sagRing.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), legAxis);
    forkGroup.add(sagRing);

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

    // Solid 42mm Matte Black Magnesium Lower Leg (base mesh)
    const pLowerBot = pAxleDrop.clone().addScaledVector(legAxis, 0.012);
    const lowerLegSolid = createCylinderBetween(
      pLowerTop,
      pLowerBot,
      0.021,
      0.0185,
      mats.MAT_FRAME_RAL9005,
      32
    );
    forkGroup.add(lowerLegSolid);

    // Outer Decal Shell with "32" + "XSD" + "FOXSID AIR FORK" facing outward (1:1 as on Photo #4)
    const lowerLegDecal = createCylinderBetween(
      pLowerTop.clone().addScaledVector(legAxis, 0.012),
      pLowerBot.clone().addScaledVector(legAxis, -0.015),
      0.0213,
      0.0188,
      mats.MAT_FOXSID_DECAL,
      32
    );
    lowerLegDecal.rotateY(side === 1 ? 0 : Math.PI);
    forkGroup.add(lowerLegDecal);

    // Forward-offset axle dropout lug at the bottom of the lower leg
    const dropoutLug = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.028, 0.014), mats.MAT_FRAME_RAL9005);
    dropoutLug.position.set(pAxleDrop.x, pAxleDrop.y, side * 0.056);
    forkGroup.add(dropoutLug);

    // Bottom Rebound Adjuster Knob (Red Anodized on right leg bottom, 1:1 as on Photo #4!)
    const footBolt = createCylinderBetween(
      pLowerBot,
      pLowerBot.clone().addScaledVector(legAxis, 0.014),
      0.0075,
      0.0075,
      side === -1 ? mats.MAT_RED_ANODIZED : mats.MAT_ANODIZED_BLACK,
      16
    );
    forkGroup.add(footBolt);
  });

  // 2.3 Fork Arch (Gorilla) connecting left and right lowers in front of tire (matching Photo #4)
  const archCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.488, 0.275, 0.062),
    new THREE.Vector3(0.520, 0.328, 0.036),
    new THREE.Vector3(0.532, 0.340, 0.000),
    new THREE.Vector3(0.520, 0.328, -0.036),
    new THREE.Vector3(0.488, 0.275, -0.062)
  ]);
  const archGeom = new THREE.TubeGeometry(archCurve, 28, 0.0115, 16, false);
  const archMesh = new THREE.Mesh(archGeom, mats.MAT_FRAME_RAL9005);
  archMesh.castShadow = true;
  forkGroup.add(archMesh);

  // Brake hose guide boss on left side of fork arch (visible in Reference Photo #4)
  const hoseGuideBoss = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.008, 10), mats.MAT_STEEL_ROTOR);
  hoseGuideBoss.rotation.z = Math.PI / 2;
  hoseGuideBoss.position.set(0.510, 0.305, 0.054);
  forkGroup.add(hoseGuideBoss);

  // 2.4 Compact Black Plastic Mudguard zipped directly under the Fork Arch
  const mudguardCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.558, 0.322, 0),
    new THREE.Vector3(0.502, 0.312, 0),
    new THREE.Vector3(0.440, 0.268, 0)
  ]);
  const fenderShape = new THREE.Shape();
  fenderShape.absarc(0, 0, 0.043, Math.PI * 0.16, Math.PI * 0.84, false);
  fenderShape.absarc(0, 0, 0.040, Math.PI * 0.84, Math.PI * 0.16, true);
  const fenderExtrude = new THREE.ExtrudeGeometry(fenderShape, {
    steps: 18,
    bevelEnabled: false,
    extrudePath: mudguardCurve
  });
  const mudguardMesh = new THREE.Mesh(fenderExtrude, mats.MAT_PETG_HOLDER);
  mudguardMesh.castShadow = true;
  forkGroup.add(mudguardMesh);

  // 2.5 Left Lower Leg Post Mount (PM 160) bosses + CNC Black F/R-180 Adapter + Front ZOOM HB-890E Caliper
  const pFrontCaliper = new THREE.Vector3(0.508, 0.088, 0.050);
  const pmAdapterGeom = new THREE.BoxGeometry(0.018, 0.072, 0.012);
  const pmAdapter = new THREE.Mesh(pmAdapterGeom, mats.MAT_ANODIZED_BLACK);
  pmAdapter.position.set(0.500, 0.086, 0.054);
  pmAdapter.rotation.z = -0.32;
  forkGroup.add(pmAdapter);

  const frontCaliper = buildZoomCaliperMesh(mats);
  frontCaliper.position.copy(pFrontCaliper);
  frontCaliper.rotation.z = -0.32;
  forkGroup.add(frontCaliper);

  return forkGroup;
}

/**
 * Helper: Builds a 4-piston forged ZOOM HB-890E Hydraulic Brake Caliper (1:1 as on Reference Photo #5)
 */
export function buildZoomCaliperMesh(mats) {
  const calGroup = new THREE.Group();

  // Main sculpted forged 4-piston body
  const bodyGeom = new THREE.BoxGeometry(0.034, 0.074, 0.032);
  const body = new THREE.Mesh(bodyGeom, mats.MAT_ANODIZED_BLACK);
  body.castShadow = true;
  calGroup.add(body);

  // Dual machined circular piston bores (2 per side = 4 pistons, matching Photo #5!)
  [-0.016, 0.016].forEach((yOff) => {
    const boreRing = new THREE.Mesh(new THREE.CylinderGeometry(0.0115, 0.0115, 0.034, 20), mats.MAT_FRAME_RAL9005);
    boreRing.rotation.x = Math.PI / 2;
    boreRing.position.set(0.002, yOff, 0);
    calGroup.add(boreRing);

    const boreCenter = new THREE.Mesh(new THREE.CylinderGeometry(0.0065, 0.0065, 0.0355, 16), mats.MAT_ANODIZED_BLACK);
    boreCenter.rotation.x = Math.PI / 2;
    boreCenter.position.set(0.002, yOff, 0);
    calGroup.add(boreCenter);
  });

  // Yellow brake pad backing/spacer tab & stainless pad retaining bolt (visible in Photo #5)
  const yellowPadTab = new THREE.Mesh(new THREE.TorusGeometry(0.010, 0.0022, 8, 16), mats.MAT_XT90_YELLOW);
  yellowPadTab.position.set(-0.016, -0.012, 0);
  yellowPadTab.rotation.y = Math.PI / 2;
  calGroup.add(yellowPadTab);

  // Silver stainless banjo fitting + black bleed port cap at top of caliper (1:1 as on Photo #5)
  const banjoCrimp = new THREE.Mesh(new THREE.CylinderGeometry(0.0048, 0.0048, 0.016, 12), mats.MAT_STEEL_ROTOR);
  banjoCrimp.position.set(-0.008, 0.042, 0.006);
  const banjoBolt = new THREE.Mesh(new THREE.CylinderGeometry(0.0055, 0.0055, 0.010, 12), mats.MAT_STEEL_ROTOR);
  banjoBolt.rotation.x = Math.PI / 2;
  banjoBolt.position.set(-0.008, 0.032, 0.014);
  calGroup.add(banjoCrimp, banjoBolt);

  return calGroup;
}

/**
 * 3. NODE 2: COCKPIT, 740MM RISER BAR, SUR-RON DUAL LED HEADLIGHT (WITH 4 ALLEN BOLTS & FIGURE-8 BEZEL),
 *    SW900, TOPTUBE PHONE MOUNT, 20X THROTTLE & ZOOM HB-890E LEVERS (1:1 AS ON PHOTOS #1, #5, #6)
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

  // SUR-RON LIGHT BEE X (20W) Dual LED Headlight (1:1 with Reference Photo #6 & #1!)
  // Features die-cast black bezel with 4 silver Allen corner bolts + figure-8 dual reflector cavity
  const headlightGroup = new THREE.Group();
  headlightGroup.name = 'SURRON_DUAL_LED_HEADLIGHT';
  headlightGroup.position.set(0.448, 0.592, 0);
  headlightGroup.rotation.z = -0.14;

  // Die-Cast Aluminum Housing (42mm deep x 46mm tall x 114mm wide)
  const hlHousing = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.046, 0.114), mats.MAT_ANODIZED_BLACK);
  hlHousing.castShadow = true;
  headlightGroup.add(hlHousing);

  // 4 Silver Socket-Head Allen Bolts in the 4 corners of the front bezel (1:1 as on Reference Photo #6!)
  [-0.016, 0.016].forEach((by) => {
    [-0.048, 0.048].forEach((bz) => {
      const cornerBolt = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0034, 0.0034, 0.005, 12),
        mats.MAT_STEEL_ROTOR
      );
      cornerBolt.rotation.z = Math.PI / 2;
      cornerBolt.position.set(0.021, by, bz);
      headlightGroup.add(cornerBolt);
    });
  });

  // Rear cooling fins
  for (let i = -3; i <= 3; i++) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.003, 0.108), mats.MAT_ANODIZED_BLACK);
    fin.position.set(-0.024, i * 0.0055, 0);
    headlightGroup.add(fin);
  }

  // Dual Figure-8 / Peanut Reflector Eyes (Left = Fluted Flood Lens, Right = Deep Parabolic Spot Cone)
  [-0.024, 0.024].forEach((zEye, eyeIdx) => {
    const reflector = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0175, 0.007, 0.018, 24, 1, true),
      mats.MAT_STEEL_ROTOR
    );
    reflector.rotation.z = -Math.PI / 2;
    reflector.position.set(0.013, 0, zEye);
    headlightGroup.add(reflector);

    // Chrome bezel ring around each reflector eye
    const eyeRing = new THREE.Mesh(new THREE.TorusGeometry(0.0175, 0.0018, 10, 24), mats.MAT_STEEL_ROTOR);
    eyeRing.rotation.y = Math.PI / 2;
    eyeRing.position.set(0.0215, 0, zEye);
    headlightGroup.add(eyeRing);

    // Yellow Cree LED die inside reflector
    const creeDie = new THREE.Mesh(new THREE.BoxGeometry(0.003, 0.005, 0.005), mats.MAT_XT90_YELLOW);
    creeDie.position.set(0.006, 0, zEye);
    headlightGroup.add(creeDie);

    // Emissive glow core (lights up when user clicks [ТЕСТ ТОРМОЗА И СВЕТА])
    const emitter = new THREE.Mesh(new THREE.SphereGeometry(0.009, 16, 16), mats.MAT_HEADLIGHT_LED);
    emitter.position.set(0.012, 0, zEye);
    headlightGroup.add(emitter);

    // Vertical fluted flood lens ribs on the left eye (1:1 as on Reference Photo #6!)
    if (eyeIdx === 0) {
      for (let f = -2; f <= 2; f++) {
        const flute = new THREE.Mesh(new THREE.CylinderGeometry(0.0012, 0.0012, 0.028, 8), mats.MAT_SMOKE_LENS);
        flute.position.set(0.0205, 0, zEye + f * 0.005);
        headlightGroup.add(flute);
      }
    }
  });

  // Clear/Light-Smoke front polycarbonate lens cover
  const smokeLens = new THREE.Mesh(new THREE.BoxGeometry(0.003, 0.036, 0.086), mats.MAT_SMOKE_LENS);
  smokeLens.position.set(0.022, 0, 0);
  headlightGroup.add(smokeLens);

  // Top U-Bracket attaching headlight under the stem (matching Reference Photo #6)
  const hlBracket = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.028, 0.044), mats.MAT_ANODIZED_BLACK);
  hlBracket.position.set(-0.012, 0.024, 0);
  headlightGroup.add(hlBracket);

  cockpitGroup.add(headlightGroup);

  // SW900 LCD Computer above Stem
  const sw900Group = new THREE.Group();
  sw900Group.position.set(0.415, 0.656, 0.0);
  sw900Group.rotation.z = 0.45;
  const swCase = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.054, 0.082), mats.MAT_ANODIZED_BLACK);
  const swScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.046, 0.074), mats.MAT_SW900_SCREEN);
  swScreen.rotation.y = Math.PI / 2;
  swScreen.rotation.x = Math.PI / 2;
  swScreen.position.set(0.0085, 0, 0);
  sw900Group.add(swCase, swScreen);
  cockpitGroup.add(sw900Group);

  // Tactical Smartphone Mount clamped cleanly on front of Toptube behind Head Tube (1:1 as on Reference Photo #1!)
  const toptubeAngle = Math.atan2(0.545 - 0.415, 0.395 - (-0.135));
  const phoneMount = new THREE.Group();
  phoneMount.position.set(0.325, 0.532, 0.0);
  phoneMount.rotation.z = toptubeAngle;
  const mountClamp = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.036, 0.040), mats.MAT_VELCRO_STRAP);
  mountClamp.position.set(0, -0.004, 0);
  const phoneCradle = new THREE.Mesh(new THREE.BoxGeometry(0.115, 0.010, 0.062), mats.MAT_ANODIZED_BLACK);
  phoneCradle.position.set(0, 0.022, 0);
  phoneMount.add(mountClamp, phoneCradle);
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

  // Right Side Half-Twist Throttle 20X
  const throttleBody = createCylinderBetween(
    new THREE.Vector3(0.382, 0.654, -0.220),
    new THREE.Vector3(0.374, 0.656, -0.275),
    0.021,
    0.019,
    mats.MAT_ANODIZED_BLACK,
    24
  );
  const throttleRing = createCylinderBetween(
    new THREE.Vector3(0.380, 0.655, -0.232),
    new THREE.Vector3(0.378, 0.655, -0.242),
    0.022,
    0.022,
    mats.MAT_STEEL_ROTOR,
    24
  );
  cockpitGroup.add(throttleBody, throttleRing);

  // Left Side 2-in-1 Switch Block (Headlight toggle + Red 105 dB Moto Horn Button)
  const switchBlock = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.038, 0.024), mats.MAT_ANODIZED_BLACK);
  switchBlock.position.set(0.380, 0.655, 0.232);
  const redHornBtn = new THREE.Mesh(new THREE.BoxGeometry(0.010, 0.010, 0.012), mats.MAT_RED_ANODIZED);
  redHornBtn.position.set(0.365, 0.648, 0.232);
  cockpitGroup.add(switchBlock, redHornBtn);

  // ZOOM HB-890E Hydraulic Brake Levers with mineral oil reservoirs & Red Julet E-Brake Cutoff Plugs (Photo #5)
  [-1, 1].forEach((side) => {
    const zBase = side * 0.205;
    const leverGroup = new THREE.Group();
    leverGroup.position.set(0.386, 0.652, zBase);

    // Split handlebar clamp + horizontal mineral oil master cylinder reservoir
    const reservoir = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.024, 0.048), mats.MAT_ANODIZED_BLACK);
    reservoir.position.set(0.018, 0.005, -side * 0.018);
    leverGroup.add(reservoir);

    // 2 silver Torx reservoir cap screws (1:1 as on Reference Photo #5)
    [-0.012, 0.012].forEach((dz) => {
      const capScrew = new THREE.Mesh(new THREE.CylinderGeometry(0.002, 0.002, 0.003, 8), mats.MAT_STEEL_ROTOR);
      capScrew.position.set(0.018, 0.018, -side * 0.018 + dz);
      leverGroup.add(capScrew);
    });

    // Red waterproof Julet 2-pin e-brake power cutoff connector lead (1:1 as on Photo #5!)
    const juletBody = createCylinderBetween(
      new THREE.Vector3(0.020, -0.004, -side * 0.042),
      new THREE.Vector3(0.022, -0.008, -side * 0.068),
      0.0042,
      0.0042,
      mats.MAT_ANODIZED_BLACK,
      10
    );
    const juletRedTip = createCylinderBetween(
      new THREE.Vector3(0.022, -0.008, -side * 0.068),
      new THREE.Vector3(0.023, -0.010, -side * 0.075),
      0.0044,
      0.0044,
      mats.MAT_RED_ANODIZED,
      10
    );
    leverGroup.add(juletBody, juletRedTip);

    // Ergonomic 2-finger CNC brake blade with ball tip
    const bladeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.024, -0.005, -side * 0.025),
      new THREE.Vector3(0.048, -0.018, side * 0.035),
      new THREE.Vector3(0.042, -0.024, side * 0.095)
    ]);
    const bladeGeom = new THREE.TubeGeometry(bladeCurve, 16, 0.0052, 10, false);
    const blade = new THREE.Mesh(bladeGeom, mats.MAT_ANODIZED_BLACK);
    const ballEnd = new THREE.Mesh(new THREE.SphereGeometry(0.007, 10, 10), mats.MAT_ANODIZED_BLACK);
    ballEnd.position.set(0.042, -0.024, side * 0.095);
    leverGroup.add(blade, ballEnd);

    cockpitGroup.add(leverGroup);
  });

  // Braided Hydraulic Brake Hoses descending down fork & frame (matching graceful front arcs in Photo #1)
  const frontHoseCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.405, 0.645, 0.165),
    new THREE.Vector3(0.478, 0.545, 0.085),
    new THREE.Vector3(0.495, 0.365, 0.064),
    new THREE.Vector3(0.502, 0.220, 0.062),
    new THREE.Vector3(0.505, 0.115, 0.056)
  ]);
  cockpitGroup.add(new THREE.Mesh(new THREE.TubeGeometry(frontHoseCurve, 32, 0.0028, 8, false), mats.MAT_RUBBER_KENDA));

  const rearHoseCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.405, 0.645, -0.165),
    new THREE.Vector3(0.468, 0.540, -0.055),
    new THREE.Vector3(0.395, 0.455, 0.022),
    new THREE.Vector3(0.015, 0.015, 0.025),
    new THREE.Vector3(-0.425, 0.055, 0.070)
  ]);
  cockpitGroup.add(new THREE.Mesh(new THREE.TubeGeometry(rearHoseCurve, 36, 0.0028, 8, false), mats.MAT_RUBBER_KENDA));

  return cockpitGroup;
}

/**
 * Helper: Builds a perforated ventilated 180mm stainless steel brake rotor (R = 0.090m)
 * Supports red anodized inner spider (as on Front Wheel in Reference Photo #1) or black/steel spider
 */
export function buildBrakeRotor180mm(mats, useRedSpider = false) {
  const rotorGroup = new THREE.Group();
  const outerR = 0.090;
  const innerTrackR = 0.072;

  // Outer friction ring with wave-style ventilation slots (matching Reference Photo #5)
  const ringShape = new THREE.Shape();
  ringShape.absarc(0, 0, outerR, 0, Math.PI * 2, false);
  const innerHole = new THREE.Path();
  innerHole.absarc(0, 0, innerTrackR, 0, Math.PI * 2, true);
  ringShape.holes.push(innerHole);

  for (let i = 0; i < 24; i++) {
    const ang = (i / 24) * Math.PI * 2;
    const rMid = (outerR + innerTrackR) * 0.5 + (i % 2 === 0 ? 0.002 : -0.002);
    const vent = new THREE.Path();
    vent.absarc(Math.cos(ang) * rMid, Math.sin(ang) * rMid, 0.0032, 0, Math.PI * 2, true);
    ringShape.holes.push(vent);
  }

  const rotorGeom = new THREE.ExtrudeGeometry(ringShape, { depth: 0.0022, bevelEnabled: false });
  rotorGeom.translate(0, 0, -0.0011);
  const frictionRing = new THREE.Mesh(rotorGeom, mats.MAT_STEEL_ROTOR);
  rotorGroup.add(frictionRing);

  const spiderMat = useRedSpider ? mats.MAT_RED_ANODIZED : mats.MAT_STEEL_ROTOR;

  // 6 Tangential Spider Arms + 6-bolt ISO hub mount (BCD 44mm)
  for (let i = 0; i < 6; i++) {
    const a1 = (i / 6) * Math.PI * 2;
    const a2 = a1 + 0.34;
    const arm = createCylinderBetween(
      new THREE.Vector3(Math.cos(a1) * 0.024, Math.sin(a1) * 0.024, 0),
      new THREE.Vector3(Math.cos(a2) * innerTrackR, Math.sin(a2) * innerTrackR, 0),
      0.0045,
      0.0038,
      spiderMat,
      8
    );
    arm.scale.z = 0.35;
    rotorGroup.add(arm);

    const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.0032, 0.0032, 0.006, 10), mats.MAT_STEEL_ROTOR);
    bolt.rotation.x = Math.PI / 2;
    bolt.position.set(Math.cos(a1) * 0.022, Math.sin(a1) * 0.022, 0.002);
    rotorGroup.add(bolt);
  }

  const hubRing = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.0024, 24), spiderMat);
  hubRing.rotation.x = Math.PI / 2;
  rotorGroup.add(hubRing);

  return rotorGroup;
}

/**
 * Helper: Builds a 26" Wheel on Stealth Black MTX39 Rim + KENDA K-RAD K905 (26x2.30/2.35") Tire
 * with 5-Row Checkerboard Tread (440 3D blocks per wheel!), Yellow KENDA Sidewall Logo & Red Valve Cap
 * (1:1 with Reference Photos #1 & #3!)
 */
function buildWheelBase26(mats) {
  const wheelGroup = new THREE.Group();

  const R_carcass = 0.303;
  const r_balloon = 0.0295;

  // 1. Tire Carcass (Kenda K-Rad K905 26x2.35")
  const carcassGeom = new THREE.TorusGeometry(R_carcass, r_balloon, 32, 96);
  const carcassMesh = new THREE.Mesh(carcassGeom, mats.MAT_RUBBER_KENDA);
  carcassMesh.castShadow = true;
  carcassMesh.receiveShadow = true;
  wheelGroup.add(carcassMesh);

  // 2. KENDA K-RAD K905 5-Row Checkerboard 3D Tread Pattern (Reference Photo #3!)
  // 88 circumferential steps x 5 staggered rows across the tire profile = 440 checkered K-Rad lugs per tire!
  const steps = 88;
  const rowsPhi = [-0.64, -0.32, 0.0, 0.32, 0.64]; // 5 rows from right shoulder across crown to left shoulder
  const knobGeom = new THREE.BoxGeometry(0.0125, 0.0048, 0.0115);
  const instancedKnobs = new THREE.InstancedMesh(knobGeom, mats.MAT_RUBBER_KENDA, steps * rowsPhi.length);
  instancedKnobs.castShadow = true;

  const dummy = new THREE.Object3D();
  let idx = 0;

  for (let i = 0; i < steps; i++) {
    const baseTheta = (i / steps) * Math.PI * 2;

    for (let rIdx = 0; rIdx < rowsPhi.length; rIdx++) {
      const phi = rowsPhi[rIdx];
      // Checkerboard stagger: odd rows shift by half a block pitch around the circumference
      const theta = baseTheta + ((rIdx % 2) * (Math.PI / steps));
      const rPos = R_carcass + (r_balloon + 0.0016) * Math.cos(phi);
      const zPos = (r_balloon + 0.0016) * Math.sin(phi);

      dummy.position.set(Math.cos(theta) * rPos, Math.sin(theta) * rPos, zPos);
      dummy.rotation.set(0, 0, theta - Math.PI / 2);
      dummy.rotateX(phi);
      // Outer shoulder blocks wrap slightly down the sidewall (K-Rad U-blocks)
      if (Math.abs(rIdx - 2) === 2) {
        dummy.scale.set(1.05, 1.25, 1.15);
      } else {
        dummy.scale.set(1.12, 1.0, 1.02);
      }
      dummy.updateMatrix();
      instancedKnobs.setMatrixAt(idx++, dummy.matrix);
    }
  }
  instancedKnobs.instanceMatrix.needsUpdate = true;
  wheelGroup.add(instancedKnobs);

  // 3. Yellow & White "KENDA" Sidewall Hot-Patch Logo Ring at 6 o'clock on both sides (1:1 as on Photo #1!)
  const sidewallRingGeom = new THREE.RingGeometry(0.280, 0.304, 64);
  [-0.0292, 0.0292].forEach((zSide) => {
    const logoRing = new THREE.Mesh(sidewallRingGeom, mats.MAT_KENDA_SIDEWALL);
    logoRing.position.z = zSide;
    if (zSide < 0) logoRing.rotation.y = Math.PI;
    wheelGroup.add(logoRing);
  });

  // 4. SunRingle / PowerCircle MTX39 Double-Wall Eyeleted Moto Rim (39mm wide, 24mm profile height)
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
  const rimMesh = new THREE.Mesh(rimLatheGeom, mats.MAT_ANODIZED_BLACK);
  rimMesh.castShadow = true;
  wheelGroup.add(rimMesh);

  // Subtle MTX39 Rim Spec Decals on left & right rim sidewalls
  const decalGeom = new THREE.RingGeometry(0.257, 0.276, 64);
  [-0.0198, 0.0198].forEach((zSide) => {
    const decalMesh = new THREE.Mesh(decalGeom, mats.MAT_RIM_MTX39);
    decalMesh.position.z = zSide;
    if (zSide < 0) decalMesh.rotation.y = Math.PI;
    wheelGroup.add(decalMesh);
  });

  // 5. Red Anodized Schrader Valve Stem & Cap at 6 o'clock (pointing radially inward, 1:1 as on Photo #1!)
  const valveStem = createCylinderBetween(
    new THREE.Vector3(0, -0.255, 0),
    new THREE.Vector3(0, -0.236, 0),
    0.0026,
    0.0026,
    mats.MAT_ANODIZED_BLACK,
    10
  );
  const redValveCap = createCylinderBetween(
    new THREE.Vector3(0, -0.236, 0),
    new THREE.Vector3(0, -0.226, 0),
    0.0032,
    0.0030,
    mats.MAT_RED_ANODIZED,
    10
  );
  wheelGroup.add(valveStem, redValveCap);

  return wheelGroup;
}

/**
 * 4. NODE 3A: FRONT WHEEL 26" MTX39 (36x 14G 3-Cross Spokes, Disc Hub, 180mm Rotor with Red Spider)
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

  const axle = createCylinderBetween(
    new THREE.Vector3(0, 0, -0.072),
    new THREE.Vector3(0, 0, 0.072),
    0.006,
    0.006,
    mats.MAT_ANODIZED_BLACK,
    16
  );
  frontWheel.add(axle);

  // 36 Black 14G Spokes in 3-Cross pattern with Silver/Brass Nipples
  const R_rim = 0.255;
  const R_hub = 0.029;
  for (let i = 0; i < 36; i++) {
    const side = i % 2 === 0 ? 1 : -1;
    const crossDir = i % 4 < 2 ? 1 : -1;
    const rimAngle = (i / 36) * Math.PI * 2;
    const hubAngle = rimAngle + crossDir * 0.95;

    const pHub = new THREE.Vector3(Math.cos(hubAngle) * R_hub, Math.sin(hubAngle) * R_hub, side * 0.032);
    const pRim = new THREE.Vector3(Math.cos(rimAngle) * R_rim, Math.sin(rimAngle) * R_rim, side * 0.003);

    const spoke = createCylinderBetween(pHub, pRim, 0.0011, 0.0011, mats.MAT_ANODIZED_BLACK, 6);
    frontWheel.add(spoke);

    const pNippleStart = pRim.clone().lerp(pHub, 0.055);
    const nipple = createCylinderBetween(pNippleStart, pRim, 0.0022, 0.0022, mats.MAT_STEEL_ROTOR, 6);
    frontWheel.add(nipple);
  }

  // Front 180mm Perforated Brake Rotor on Left Side (z = +0.044) with Red Anodized Spider (as on Photo #1!)
  const frontRotor = buildBrakeRotor180mm(mats, true);
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
    const hubAngle = rimAngle + crossDir * 0.26;

    const pHub = new THREE.Vector3(Math.cos(hubAngle) * R_flange, Math.sin(hubAngle) * R_flange, side * 0.031);
    const pRim = new THREE.Vector3(Math.cos(rimAngle) * R_rim, Math.sin(rimAngle) * R_rim, side * 0.003);

    const spoke = createCylinderBetween(pHub, pRim, 0.00145, 0.00145, mats.MAT_ANODIZED_BLACK, 8);
    rearWheel.add(spoke);

    const pNippleStart = pRim.clone().lerp(pHub, 0.12);
    const nipple = createCylinderBetween(pNippleStart, pRim, 0.0028, 0.0028, mats.MAT_STEEL_ROTOR, 8);
    rearWheel.add(nipple);
  }

  // M14 Axle with 10mm flat sides + Black Braided Phase/Hall Cable exiting axle
  const m14Axle = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.010, 0.185), mats.MAT_STEEL_ROTOR);
  rearWheel.add(m14Axle);

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
  const rearRotor = buildBrakeRotor180mm(mats, false);
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

  const axX = -0.435;
  const axY = 0.030;

  // Monolithic 6mm Steel Plate ("2-in-1"): bottom 10x14mm anti-rotation slot for M14 axle + top IS 51mm brake ears
  const plateShape = new THREE.Shape();
  plateShape.moveTo(axX + 0.032, axY - 0.022);
  plateShape.lineTo(axX + 0.005, axY - 0.022);
  plateShape.lineTo(axX + 0.005, axY + 0.007);
  plateShape.lineTo(axX - 0.005, axY + 0.007);
  plateShape.lineTo(axX - 0.005, axY - 0.022);
  plateShape.lineTo(axX - 0.028, axY - 0.022);
  plateShape.lineTo(axX - 0.034, axY + 0.035);
  plateShape.lineTo(axX - 0.022, axY + 0.082);
  plateShape.lineTo(axX - 0.006, axY + 0.084);
  plateShape.lineTo(axX + 0.002, axY + 0.056);
  plateShape.lineTo(axX + 0.024, axY + 0.066);
  plateShape.lineTo(axX + 0.038, axY + 0.062);
  plateShape.lineTo(axX + 0.032, axY + 0.020);
  plateShape.closePath();

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

