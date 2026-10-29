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

  // 1.6 Rear Triangle (OLD = 135mm, z = ±0.0675, Rear Axle = (-0.438, 0.015, 0))
  [-1, 1].forEach((side) => {
    const zChainBB = side * 0.026;
    const zDrop = side * 0.0675;

    // S-bend Chainstay for 26x2.30" Kenda K-Rad tire clearance (70mm gap at BB)
    const chainCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.0, -0.004, zChainBB),
      new THREE.Vector3(-0.115, 0.000, side * 0.044),
      new THREE.Vector3(-0.270, 0.008, side * 0.062),
      new THREE.Vector3(-0.428, 0.014, zDrop)
    ]);
    const chainGeom = new THREE.TubeGeometry(chainCurve, 32, 0.0115, 16, false);
    const cPos = chainGeom.attributes.position;
    for (let i = 0; i < cPos.count; i++) {
      cPos.setY(i, cPos.getY(i) * 1.12);
    }
    chainGeom.computeVertexNormals();
    const chainMesh = new THREE.Mesh(chainGeom, mat);
    chainMesh.castShadow = true;
    frameGroup.add(chainMesh);

    // Seatstay: (-0.138, 0.395, ±0.020) -> (-0.438, 0.032, ±0.0675), diameter 19mm (R=0.0095)
    const seatStayCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.138, 0.395, side * 0.020),
      new THREE.Vector3(-0.278, 0.228, side * 0.050),
      new THREE.Vector3(-0.434, 0.034, zDrop)
    ]);
    const seatStayGeom = new THREE.TubeGeometry(seatStayCurve, 24, 0.0095, 16, false);
    const seatStayMesh = new THREE.Mesh(seatStayGeom, mat);
    seatStayMesh.castShadow = true;
    frameGroup.add(seatStayMesh);

    // Factory 5mm frame dropout plate
    const dropShape = new THREE.Shape();
    dropShape.moveTo(-0.415, 0.002);
    dropShape.lineTo(-0.458, 0.002);
    dropShape.lineTo(-0.458, 0.048);
    dropShape.lineTo(-0.418, 0.044);
    dropShape.closePath();
    const dropGeom = new THREE.ExtrudeGeometry(dropShape, { depth: 0.005, bevelEnabled: false });
    dropGeom.translate(0, 0, zDrop - 0.0025);
    const dropMesh = new THREE.Mesh(dropGeom, mat);
    frameGroup.add(dropMesh);
  });

  // Black nylon cable zip-ties along left chainstay securing the motor phase harness
  [-0.14, -0.24, -0.34].forEach((xTie) => {
    const tie = new THREE.Mesh(new THREE.TorusGeometry(0.013, 0.0018, 8, 20), mats.MAT_VELCRO_STRAP);
    tie.rotation.y = Math.PI / 2;
    tie.position.set(xTie, 0.006, 0.056);
    frameGroup.add(tie);
  });

  // Seatstay bridge above rear 26" tire
  const bridgeP1 = new THREE.Vector3(-0.228, 0.285, -0.042);
  const bridgeP2 = new THREE.Vector3(-0.228, 0.285, 0.042);
  frameGroup.add(createCylinderBetween(bridgeP1, bridgeP2, 0.008, 0.008, mat, 16));

  // Chainstay bridge near BB
  const csBridgeP1 = new THREE.Vector3(-0.075, -0.001, -0.036);
  const csBridgeP2 = new THREE.Vector3(-0.075, -0.001, 0.036);
  frameGroup.add(createCylinderBetween(csBridgeP1, csBridgeP2, 0.008, 0.008, mat, 16));

  // 1.7 Procedural TIG Weld Seams at all frame tube intersections
  frameGroup.add(
    createWeldSeam(new THREE.Vector3(0.015, 0.015, 0), pDownEnd.clone().sub(pDownStart), 0.020, 0.0032, mat),
    createWeldSeam(new THREE.Vector3(-0.008, 0.022, 0), pSeatTop.clone().sub(pBB), 0.0165, 0.003, mat),
    createWeldSeam(new THREE.Vector3(0.412, 0.468, 0), pDownEnd.clone().sub(pDownStart), 0.021, 0.0035, mat),
    createWeldSeam(new THREE.Vector3(0.392, 0.544, 0), pTopStart.clone().sub(pTopEnd), 0.0165, 0.0032, mat),
    createWeldSeam(new THREE.Vector3(-0.133, 0.414, 0), pTopStart.clone().sub(pTopEnd), 0.0165, 0.0032, mat)
  );

  // 1.8 Bottom Bracket Crankset, 38T Machined Narrow-Wide Chainring, 96-Link 3D Roller Chain & CNC Pedals
  const crankGroup = new THREE.Group();
  crankGroup.name = 'CRANKSET_NARROW_WIDE';

  // Narrow-Wide 38T front chainring on right side (z = -0.044) with 38 individual machined teeth
  const ringExtrudeShape = new THREE.Shape();
  ringExtrudeShape.absarc(0, 0, 0.072, 0, Math.PI * 2, false);
  const holePath = new THREE.Path();
  holePath.absarc(0, 0, 0.054, 0, Math.PI * 2, true);
  ringExtrudeShape.holes.push(holePath);
  const nwGeom = new THREE.ExtrudeGeometry(ringExtrudeShape, { depth: 0.0035, bevelEnabled: true, bevelSize: 0.0008, bevelThickness: 0.0008 });
  nwGeom.translate(0, 0, -0.046);
  const nwRing = new THREE.Mesh(nwGeom, mats.MAT_ANODIZED_BLACK);
  crankGroup.add(nwRing);

  // 38 Individual CNC Narrow-Wide Teeth around the chainring perimeter
  const toothGeom = new THREE.BoxGeometry(0.0038, 0.0055, 0.0032);
  for (let t = 0; t < 38; t++) {
    const ang = (t / 38) * Math.PI * 2;
    const tooth = new THREE.Mesh(toothGeom, mats.MAT_STEEL_ROTOR);
    tooth.position.set(Math.cos(ang) * 0.0745, Math.sin(ang) * 0.0745, -0.0442);
    tooth.rotation.z = ang;
    tooth.scale.z = t % 2 === 0 ? 1.15 : 0.78; // Alternating Wide / Narrow tooth profile
    crankGroup.add(tooth);
  }

  // 4-arm spider + 4 silver anodized chainring bolts (104 BCD)
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

    const crBolt = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.006, 12), mats.MAT_STEEL_ROTOR);
    crBolt.rotation.x = Math.PI / 2;
    crBolt.position.set(Math.cos(ang) * 0.052, Math.sin(ang) * 0.052, -0.0442);
    crankGroup.add(crBolt);
  }

  // Left & Right Crank Arms (170mm length) + Open-Cage CNC MTB Platform Pedals with steel traction pins
  const crankConfigs = [
    { side: 1, z: 0.052, dir: new THREE.Vector3(0.168, -0.008, 0) },   // Left side (forward horizontal)
    { side: -1, z: -0.052, dir: new THREE.Vector3(-0.168, 0.008, 0) }  // Right side (rearward horizontal)
  ];

  crankConfigs.forEach((cfg) => {
    const pStart = new THREE.Vector3(0, 0, cfg.z);
    const pEnd = new THREE.Vector3(cfg.dir.x, cfg.dir.y, cfg.z + cfg.side * 0.008);
    const arm = createBiOvalTubeBetween(pStart, pEnd, 0.015, 0.007, mats.MAT_ANODIZED_BLACK, 20);
    crankGroup.add(arm);

    const bbBolt = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.004, 16), mats.MAT_STEEL_ROTOR);
    bbBolt.rotation.x = Math.PI / 2;
    bbBolt.position.set(0, 0, cfg.z + cfg.side * 0.006);
    crankGroup.add(bbBolt);

    const pPedalCenter = pEnd.clone().add(new THREE.Vector3(0, 0, cfg.side * 0.052));
    const spindle = createCylinderBetween(pEnd, pPedalCenter, 0.0055, 0.0055, mats.MAT_STEEL_ROTOR, 12);
    crankGroup.add(spindle);

    const pedalGroup = new THREE.Group();
    pedalGroup.position.copy(pPedalCenter);

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

  // High-Definition Full-Loop Figure-8 3D Roller Chain (Outer Plates, Inner Plates, Hardened Rollers & Rivet Pins)
  // Wraps around the 38T Narrow-Wide Chainring (R = 0.0745 at (0,0,-0.044)) and 16T Rear Freewheel (R = 0.035 at (-0.438,0.015,-0.056))
  const chainPathPts = [];
  const topSteps = 34;
  for (let i = 0; i <= topSteps; i++) {
    const t = i / topSteps;
    const x = 0.0 - t * 0.438;
    const y = 0.0745 * (1 - t) + (0.015 + 0.035) * t - Math.sin(t * Math.PI) * 0.0025;
    const z = -0.0442 * (1 - t) + (-0.056) * t;
    chainPathPts.push(new THREE.Vector3(x, y, z));
  }
  // Wrap around rear 16T sprocket (from top pi/2 to bottom 3*pi/2)
  for (let i = 1; i <= 10; i++) {
    const ang = Math.PI * 0.5 + (i / 11) * Math.PI;
    chainPathPts.push(new THREE.Vector3(-0.438 + Math.cos(ang) * 0.0355, 0.015 + Math.sin(ang) * 0.0355, -0.056));
  }
  const botSteps = 34;
  for (let i = 0; i <= botSteps; i++) {
    const t = i / botSteps;
    const x = -0.438 + t * 0.438;
    const y = (0.015 - 0.035) * (1 - t) + (-0.0745) * t - Math.sin(t * Math.PI) * 0.0045;
    const z = -0.056 * (1 - t) + (-0.0442) * t;
    chainPathPts.push(new THREE.Vector3(x, y, z));
  }
  // Wrap around front 38T chainring (from bottom -pi/2 to top +pi/2)
  for (let i = 1; i <= 18; i++) {
    const ang = -Math.PI * 0.5 + (i / 19) * Math.PI;
    chainPathPts.push(new THREE.Vector3(Math.cos(ang) * 0.075, Math.sin(ang) * 0.075, -0.0442));
  }

  const chainLoopCurve = new THREE.CatmullRomCurve3(chainPathPts, true);
  const totalLinks = 104;

  // Create authentic Figure-8 chain link plate geometry + central cylindrical roller
  const plateGeom = new THREE.BoxGeometry(0.0112, 0.0068, 0.0012);
  const rollerGeom = new THREE.CylinderGeometry(0.0036, 0.0036, 0.0058, 12);
  rollerGeom.rotateX(Math.PI / 2);
  const pinRivGeom = new THREE.CylinderGeometry(0.0016, 0.0016, 0.0074, 8);
  pinRivGeom.rotateX(Math.PI / 2);

  const instPlatesL = new THREE.InstancedMesh(plateGeom, mats.MAT_STEEL_ROTOR, totalLinks);
  const instPlatesR = new THREE.InstancedMesh(plateGeom, mats.MAT_STEEL_ROTOR, totalLinks);
  const instRollers = new THREE.InstancedMesh(rollerGeom, mats.MAT_ANODIZED_BLACK, totalLinks);
  const instPins = new THREE.InstancedMesh(pinRivGeom, mats.MAT_GOLD_BRASS || mats.MAT_STEEL_ROTOR, totalLinks);

  const dummyC = new THREE.Object3D();
  function updateChainAtOffset(phaseOffset = 0) {
    for (let i = 0; i < totalLinks; i++) {
      const u = ((i / totalLinks) + phaseOffset) % 1.0;
      const uNorm = u < 0 ? u + 1.0 : u;
      const pt = chainLoopCurve.getPointAt(uNorm);
      const tang = chainLoopCurve.getTangentAt(uNorm);
      const angZ = Math.atan2(tang.y, tang.x);
      const zSpread = i % 2 === 0 ? 0.0028 : 0.0020;

      dummyC.position.set(pt.x, pt.y, pt.z + zSpread);
      dummyC.rotation.set(0, 0, angZ);
      dummyC.scale.set(1, i % 2 === 0 ? 1.06 : 0.92, 1);
      dummyC.updateMatrix();
      instPlatesL.setMatrixAt(i, dummyC.matrix);

      dummyC.position.set(pt.x, pt.y, pt.z - zSpread);
      dummyC.updateMatrix();
      instPlatesR.setMatrixAt(i, dummyC.matrix);

      dummyC.position.set(pt.x, pt.y, pt.z);
      dummyC.rotation.set(0, 0, 0);
      dummyC.scale.set(1, 1, 1);
      dummyC.updateMatrix();
      instRollers.setMatrixAt(i, dummyC.matrix);
      instPins.setMatrixAt(i, dummyC.matrix);
    }
    instPlatesL.instanceMatrix.needsUpdate = true;
    instPlatesR.instanceMatrix.needsUpdate = true;
    instRollers.instanceMatrix.needsUpdate = true;
    instPins.instanceMatrix.needsUpdate = true;
  }
  updateChainAtOffset(0);
  crankGroup.add(instPlatesL, instPlatesR, instRollers, instPins);
  frameGroup.userData.updateChainAtOffset = updateChainAtOffset;
  frameGroup.userData.crankGroup = crankGroup;

  // Add CNC Rear Chain Tensioner Roller on Right Dropout & BB External Cup Splines + M5 Water Bottle Bosses
  [-0.036, 0.036].forEach((zCup) => {
    for (let s = 0; s < 16; s++) {
      const sa = (s / 16) * Math.PI * 2;
      const notch = new THREE.Mesh(new THREE.BoxGeometry(0.0022, 0.0022, 0.0055), mats.MAT_STEEL_ROTOR);
      notch.position.set(Math.cos(sa) * 0.0216, Math.sin(sa) * 0.0216, zCup);
      notch.rotation.z = sa;
      frameGroup.add(notch);
    }
  });

  // Seat Tube & Downtube Welded M5 Rivnut Bosses with Anodized Allen Bolts
  [
    [-0.058, 0.175, 0, -0.32],
    [-0.080, 0.240, 0, -0.32]
  ].forEach(([bx, by, bz, rotZ]) => {
    const boss = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0045, 0.005, 12), mats.MAT_STEEL_ROTOR);
    boss.position.set(bx + 0.015, by + 0.005, bz);
    boss.rotation.z = rotZ + Math.PI / 2;
    frameGroup.add(boss);
  });

  // Seatpost Clamp M6 Quick-Release / Allen Bolt Barrel & Brass Trunnion
  const clampBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.0042, 0.0042, 0.026, 12), mats.MAT_STEEL_ROTOR);
  clampBarrel.rotation.x = Math.PI / 2;
  clampBarrel.position.set(-0.158, 0.428, 0);
  const brassTrunnion = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.010, 12), mats.MAT_GOLD_BRASS || mats.MAT_STEEL_ROTOR);
  brassTrunnion.position.set(-0.158, 0.428, 0.012);
  frameGroup.add(clampBarrel, brassTrunnion);

  frameGroup.add(crankGroup);

  return frameGroup;
}

/**
 * 2. NODE 1: FRONT AIR FORK FOXSID 32 26" (Single-Crown, 120mm Travel, Mudguard, 32/XSD/FOXSID Decals)
 *    1:1 with Reference Photo #4 & #1 (Proportional 26" Wheel Clearance + Micro-Engraved SAG Scale)
 */
export function buildForkNode(mats) {
  const forkGroup = new THREE.Group();
  forkGroup.name = 'NODE_01_FORK_FOXSID_X2';

  const forkLowersGroup = new THREE.Group();
  forkLowersGroup.name = 'FORK_LOWERS_SUSPENSION_GROUP';
  forkGroup.add(forkLowersGroup);

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
    24
  );
  forkGroup.add(crownNeck);

  [-1, 1].forEach((side) => {
    const armEnd = pCrownCenter.clone().addScaledVector(forkDownDir, 0.008);
    armEnd.z = side * 0.065;
    const armMesh = createBiOvalTubeBetween(pCrownCenter, armEnd, 0.021, 0.016, mats.MAT_FRAME_RAL9005, 24);
    forkGroup.add(armMesh);
  });

  // Front Axle Center: (0.610, 0.015, 0) — exact wheelbase & clearance to downtube controller (Photo #3)
  const pFrontAxle = new THREE.Vector3(0.610, 0.015, 0);
  let mainLegAxis = forkDownDir.clone();

  // Stanchion spacing: z = ±0.065 (130mm crown center-to-center)
  [-1, 1].forEach((side) => {
    const zLeg = side * 0.065; // side = +1 is Left, side = -1 is Right
    const pLegCrown = new THREE.Vector3(pCrownCenter.x, pCrownCenter.y, zLeg).addScaledVector(forkDownDir, 0.008);
    const pAxleDrop = new THREE.Vector3(pFrontAxle.x, pFrontAxle.y, side * 0.056);
    const legAxis = pAxleDrop.clone().sub(pLegCrown).normalize();
    mainLegAxis = new THREE.Vector3(legAxis.x, legAxis.y, 0).normalize();

    const crownSocket = createCylinderBetween(
      pLegCrown.clone().addScaledVector(legAxis, -0.016),
      pLegCrown.clone().addScaledVector(legAxis, 0.024),
      0.021,
      0.020,
      mats.MAT_FRAME_RAL9005,
      28
    );
    forkGroup.add(crownSocket);

    if (side === 1) {
      // Left Crown: CNC Blue Anodized 12-Flute Air Valve Cap ("AIR 55-65 PSI") + Inner Schrader Brass Core
      const airCap = createCylinderBetween(
        pLegCrown.clone().addScaledVector(legAxis, -0.016),
        pLegCrown.clone().addScaledVector(legAxis, -0.025),
        0.0150,
        0.0140,
        mats.MAT_BLUE_ANODIZED,
        24
      );
      forkGroup.add(airCap);
      for (let k = 0; k < 12; k++) {
        const ka = (k / 12) * Math.PI * 2;
        const knurl = new THREE.Mesh(new THREE.BoxGeometry(0.0022, 0.008, 0.0022), mats.MAT_ANODIZED_BLACK);
        const kp = pLegCrown.clone().addScaledVector(legAxis, -0.0205);
        knurl.position.set(kp.x + Math.cos(ka) * 0.0148, kp.y, kp.z + Math.sin(ka) * 0.0148);
        forkGroup.add(knurl);
      }
      const brassCore = createCylinderBetween(
        pLegCrown.clone().addScaledVector(legAxis, -0.025),
        pLegCrown.clone().addScaledVector(legAxis, -0.0275),
        0.004,
        0.004,
        mats.MAT_GOLD_BRASS || mats.MAT_STEEL_ROTOR,
        12
      );
      forkGroup.add(brassCore);
    } else {
      // Right Crown: Compression / Lockout Dial with Scalloped Teeth + Central M3 Allen Retention Screw
      const lockCap = createCylinderBetween(
        pLegCrown.clone().addScaledVector(legAxis, -0.016),
        pLegCrown.clone().addScaledVector(legAxis, -0.025),
        0.0155,
        0.0155,
        mats.MAT_BLUE_ANODIZED,
        24
      );
      const lockLever = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.0055, 0.011), mats.MAT_BLUE_ANODIZED);
      lockLever.position.copy(pLegCrown.clone().addScaledVector(legAxis, -0.026));
      const lockScrew = new THREE.Mesh(new THREE.CylinderGeometry(0.0032, 0.0032, 0.004, 12), mats.MAT_STEEL_ROTOR);
      lockScrew.position.copy(pLegCrown.clone().addScaledVector(legAxis, -0.028));
      forkGroup.add(lockCap, lockLever, lockScrew);
    }

    // 32mm Black Anodized Stanchions (120mm visible travel)
    const pStanchionEnd = pLegCrown.clone().addScaledVector(legAxis, 0.245);
    const stanchion = createCylinderBetween(
      pLegCrown,
      pStanchionEnd,
      0.016,
      0.016,
      mats.MAT_ANODIZED_BLACK,
      32
    );
    forkGroup.add(stanchion);

    // Laser-etched SAG Percentage Scale Rings (10%, 20%, 30%, 40%) on the Stanchion
    [0.042, 0.072, 0.102, 0.132].forEach((dSag) => {
      const tickPos = pLegCrown.clone().addScaledVector(legAxis, dSag);
      const tickRing = new THREE.Mesh(new THREE.TorusGeometry(0.01615, 0.00035, 6, 24), mats.MAT_STEEL_ROTOR);
      tickRing.position.copy(tickPos);
      tickRing.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), legAxis);
      forkGroup.add(tickRing);
    });

    // Red Anodized Sag O-ring on Stanchion (1:1 as on Reference Photo #4!)
    const sagPos = pLegCrown.clone().addScaledVector(legAxis, side === 1 ? 0.052 : 0.105);
    const sagRingGeom = new THREE.TorusGeometry(0.0166, 0.0020, 12, 24);
    const sagRing = new THREE.Mesh(sagRingGeom, mats.MAT_RED_ANODIZED);
    sagRing.position.copy(sagPos);
    sagRing.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), legAxis);
    forkGroup.add(sagRing);

    // Stepped SKF-style Rubber Dust Wiper Seal + Dual Stainless Garter Springs at top of Magnesium Lowers
    const pLowerTop = pLegCrown.clone().addScaledVector(legAxis, 0.168);
    const wiper = createCylinderBetween(
      pLowerTop.clone().addScaledVector(legAxis, -0.013),
      pLowerTop,
      0.0222,
      0.0182,
      mats.MAT_RUBBER_KENDA,
      28
    );
    const garterSpring = new THREE.Mesh(new THREE.TorusGeometry(0.0202, 0.0009, 8, 24), mats.MAT_STEEL_ROTOR);
    garterSpring.position.copy(pLowerTop.clone().addScaledVector(legAxis, -0.006));
    garterSpring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), legAxis);
    const topLipSpring = new THREE.Mesh(new THREE.TorusGeometry(0.0185, 0.0006, 8, 24), mats.MAT_STEEL_ROTOR);
    topLipSpring.position.copy(pLowerTop.clone().addScaledVector(legAxis, -0.0115));
    topLipSpring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), legAxis);
    forkLowersGroup.add(wiper, garterSpring, topLipSpring);

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
    forkLowersGroup.add(lowerLegSolid);

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
    forkLowersGroup.add(lowerLegDecal);

    // Sculpted Forward-Offset Axle Dropout Clevis + Pinch Bolts at the bottom of the lower leg
    const dropoutLug = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.032, 0.016), mats.MAT_FRAME_RAL9005);
    dropoutLug.position.set(pAxleDrop.x, pAxleDrop.y, side * 0.056);
    forkLowersGroup.add(dropoutLug);

    const pinchBolt = new THREE.Mesh(new THREE.CylinderGeometry(0.0028, 0.0028, 0.024, 10), mats.MAT_STEEL_ROTOR);
    pinchBolt.rotation.z = Math.PI / 2;
    pinchBolt.position.set(pAxleDrop.x + 0.008, pAxleDrop.y - 0.009, side * 0.056);
    forkLowersGroup.add(pinchBolt);

    // Bottom Rebound Adjuster Knob (Red Anodized on right leg bottom, 1:1 as on Photo #4!)
    const footBolt = createCylinderBetween(
      pLowerBot,
      pLowerBot.clone().addScaledVector(legAxis, 0.015),
      0.0082,
      0.0068,
      side === -1 ? mats.MAT_RED_ANODIZED : mats.MAT_ANODIZED_BLACK,
      18
    );
    forkLowersGroup.add(footBolt);
  });

  // 2.3 Fork Arch (Gorilla) connecting left and right lowers with sculpted structural pocket ribs
  const archCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.512, 0.242, 0.062),
    new THREE.Vector3(0.542, 0.286, 0.036),
    new THREE.Vector3(0.554, 0.296, 0.000),
    new THREE.Vector3(0.542, 0.286, -0.036),
    new THREE.Vector3(0.512, 0.242, -0.062)
  ]);
  const archGeom = new THREE.TubeGeometry(archCurve, 32, 0.0115, 18, false);
  const archMesh = new THREE.Mesh(archGeom, mats.MAT_FRAME_RAL9005);
  archMesh.castShadow = true;
  forkLowersGroup.add(archMesh);

  // Brake hose guide clamp + M4 stainless screw on left side of fork arch (visible in Reference Photo #4)
  const hoseGuideClamp = new THREE.Mesh(new THREE.BoxGeometry(0.010, 0.012, 0.010), mats.MAT_ANODIZED_BLACK);
  hoseGuideClamp.position.set(0.530, 0.274, 0.054);
  const hoseGuideBoss = new THREE.Mesh(new THREE.CylinderGeometry(0.0032, 0.0032, 0.012, 10), mats.MAT_STEEL_ROTOR);
  hoseGuideBoss.rotation.z = Math.PI / 2;
  hoseGuideBoss.position.set(0.532, 0.274, 0.054);
  forkLowersGroup.add(hoseGuideClamp, hoseGuideBoss);

  // 2.4 Compact Black Plastic Mudguard zipped directly under the Fork Arch + 4 Nylon Zip-Ties
  const mudguardCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.578, 0.282, 0),
    new THREE.Vector3(0.525, 0.275, 0),
    new THREE.Vector3(0.468, 0.236, 0)
  ]);
  const fenderShape = new THREE.Shape();
  fenderShape.absarc(0, 0, 0.039, Math.PI * 0.16, Math.PI * 0.84, false);
  fenderShape.absarc(0, 0, 0.036, Math.PI * 0.84, Math.PI * 0.16, true);
  const fenderExtrude = new THREE.ExtrudeGeometry(fenderShape, {
    steps: 20,
    bevelEnabled: false,
    extrudePath: mudguardCurve
  });
  const mudguardMesh = new THREE.Mesh(fenderExtrude, mats.MAT_PETG_HOLDER);
  mudguardMesh.castShadow = true;
  forkLowersGroup.add(mudguardMesh);

  // 4 Zip-ties fastening the mudguard to the fork arch and lower legs
  [-0.024, 0.024].forEach((zt) => {
    const archTie = new THREE.Mesh(new THREE.TorusGeometry(0.0125, 0.0014, 8, 16), mats.MAT_VELCRO_STRAP);
    archTie.position.set(0.546, 0.288, zt);
    archTie.rotation.y = Math.PI / 2;
    forkLowersGroup.add(archTie);
  });

  // 2.5 Left Lower Leg Post Mount (PM 160) bosses + CNC Black F/R-180 Adapter + Front ZOOM HB-890E Caliper
  const pFrontCaliper = new THREE.Vector3(0.548, 0.076, 0.050);
  const pmAdapterGeom = new THREE.BoxGeometry(0.018, 0.072, 0.012);
  const pmAdapter = new THREE.Mesh(pmAdapterGeom, mats.MAT_ANODIZED_BLACK);
  pmAdapter.position.set(0.540, 0.074, 0.054);
  pmAdapter.rotation.z = -0.36;
  forkLowersGroup.add(pmAdapter);

  // Cast Post-Mount (PM) Standoffs on Left Fork Lower Leg + 2 Stainless M6 Socket Cap Bolts with Spherical Washers
  [0.048, 0.102].forEach((yBoss) => {
    const standoff = createCylinderBetween(
      new THREE.Vector3(0.562, yBoss, 0.058),
      new THREE.Vector3(0.542, yBoss, 0.054),
      0.006,
      0.0055,
      mats.MAT_FRAME_RAL9005,
      12
    );
    const m6Head = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0045, 0.008, 12), mats.MAT_STEEL_ROTOR);
    m6Head.rotation.z = Math.PI / 2 - 0.36;
    m6Head.position.set(0.534, yBoss, 0.050);
    forkLowersGroup.add(standoff, m6Head);
  });

  const frontCaliper = buildZoomCaliperMesh(mats);
  frontCaliper.position.copy(pFrontCaliper);
  frontCaliper.rotation.z = -0.36;
  forkLowersGroup.add(frontCaliper);

  forkGroup.userData.forkLowersGroup = forkLowersGroup;
  forkGroup.userData.legAxis = mainLegAxis;

  return forkGroup;
}

/**
 * Helper: Builds a 4-piston forged ZOOM HB-890E Hydraulic Brake Caliper (1:1 as on Reference Photo #5)
 * Includes Finned Cooling Pad Ears, Stainless Pad Retention Pin, R-Clip Cotter, Bleed Nipple & Banjo Assembly
 */
export function buildZoomCaliperMesh(mats) {
  const calGroup = new THREE.Group();

  // Main sculpted forged 4-piston body with bridge window
  const bodyGeom = new THREE.BoxGeometry(0.034, 0.074, 0.032);
  const body = new THREE.Mesh(bodyGeom, mats.MAT_ANODIZED_BLACK);
  body.castShadow = true;
  calGroup.add(body);

  // Top & Bottom Caliper Mounting Ears with M6 Bolts & Concave/Convex CPS Aligning Washers
  [-0.042, 0.042].forEach((yEar) => {
    const ear = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.012, 0.014), mats.MAT_ANODIZED_BLACK);
    ear.position.set(-0.008, yEar, 0);
    const m6Bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.0042, 0.0042, 0.010, 12), mats.MAT_STEEL_ROTOR);
    m6Bolt.rotation.z = Math.PI / 2;
    m6Bolt.position.set(0.006, yEar, 0);
    calGroup.add(ear, m6Bolt);
  });

  // Dual machined circular piston bores (2 per side = 4 pistons, matching Photo #5!)
  [-0.016, 0.016].forEach((yOff) => {
    const boreRing = new THREE.Mesh(new THREE.CylinderGeometry(0.0118, 0.0118, 0.0345, 24), mats.MAT_FRAME_RAL9005);
    boreRing.rotation.x = Math.PI / 2;
    boreRing.position.set(0.002, yOff, 0);
    calGroup.add(boreRing);

    const boreCap = new THREE.Mesh(new THREE.CylinderGeometry(0.0082, 0.0082, 0.036, 20), mats.MAT_RED_ANODIZED);
    boreCap.rotation.x = Math.PI / 2;
    boreCap.position.set(0.002, yOff, 0);
    calGroup.add(boreCap);

    const boreCenter = new THREE.Mesh(new THREE.CylinderGeometry(0.0052, 0.0052, 0.037, 16), mats.MAT_ANODIZED_BLACK);
    boreCenter.rotation.x = Math.PI / 2;
    boreCenter.position.set(0.002, yOff, 0);
    calGroup.add(boreCenter);
  });

  // Finned Sintered Brake Pad Top Cooling Fins + Stainless Cross-Spring + Pad Retaining Pin & R-Clip
  for (let f = -2; f <= 2; f++) {
    const padFin = new THREE.Mesh(new THREE.BoxGeometry(0.010, 0.016, 0.0018), mats.MAT_ANODIZED_BLACK);
    padFin.position.set(0.014, 0, f * 0.0038);
    calGroup.add(padFin);
  }
  const padPin = new THREE.Mesh(new THREE.CylinderGeometry(0.0018, 0.0018, 0.038, 10), mats.MAT_STEEL_ROTOR);
  padPin.rotation.x = Math.PI / 2;
  padPin.position.set(0.011, 0, 0);
  const rClip = new THREE.Mesh(new THREE.TorusGeometry(0.0032, 0.0006, 6, 14), mats.MAT_STEEL_ROTOR);
  rClip.position.set(0.011, 0, -0.019);
  calGroup.add(padPin, rClip);

  // Yellow brake pad backing/spacer tab & stainless pad retaining bolt (visible in Photo #5)
  const yellowPadTab = new THREE.Mesh(new THREE.TorusGeometry(0.010, 0.0022, 8, 16), mats.MAT_XT90_YELLOW);
  yellowPadTab.position.set(-0.016, -0.012, 0);
  yellowPadTab.rotation.y = Math.PI / 2;
  calGroup.add(yellowPadTab);

  // Silver stainless banjo fitting + rubber dust cap on bleed nipple at top of caliper (1:1 as on Photo #5)
  const banjoEye = new THREE.Mesh(new THREE.TorusGeometry(0.0055, 0.0024, 10, 18), mats.MAT_STEEL_ROTOR);
  banjoEye.position.set(-0.008, 0.032, 0.012);
  const banjoCrimp = new THREE.Mesh(new THREE.CylinderGeometry(0.0046, 0.0046, 0.018, 12), mats.MAT_STEEL_ROTOR);
  banjoCrimp.position.set(-0.008, 0.044, 0.010);
  const banjoBolt = new THREE.Mesh(new THREE.CylinderGeometry(0.0052, 0.0052, 0.012, 6), mats.MAT_STEEL_ROTOR);
  banjoBolt.rotation.x = Math.PI / 2;
  banjoBolt.position.set(-0.008, 0.032, 0.015);
  const bleedNipple = new THREE.Mesh(new THREE.CylinderGeometry(0.0035, 0.0035, 0.012, 10), mats.MAT_RUBBER_KENDA);
  bleedNipple.position.set(0.008, 0.038, -0.008);
  calGroup.add(banjoEye, banjoCrimp, banjoBolt, bleedNipple);

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

  // Individual 3x 10mm Headset Carbon/Anodized Spacers with visible bevel seams
  for (let sp = 0; sp < 3; sp++) {
    const t0 = sp / 3;
    const t1 = (sp + 0.92) / 3;
    const pS0 = new THREE.Vector3(0.390, 0.565, 0).lerp(pStemSteerer, t0);
    const pS1 = new THREE.Vector3(0.390, 0.565, 0).lerp(pStemSteerer, t1);
    cockpitGroup.add(createCylinderBetween(pS0, pS1, 0.0176, 0.0176, mats.MAT_ANODIZED_BLACK, 24));
  }

  // Short 45mm CNC Pocketed MTB Stem with 2 Steerer Pinch Bolts + 4x M5 Faceplate Bolts
  const stemBody = createBiOvalTubeBetween(pStemSteerer, pBarCenter, 0.021, 0.022, mats.MAT_ANODIZED_BLACK, 24);
  cockpitGroup.add(stemBody);

  // 2 Steerer clamp M6 Allen bolts on rear of stem
  [-0.006, 0.006].forEach((dy) => {
    const stBolt = new THREE.Mesh(new THREE.CylinderGeometry(0.0032, 0.0032, 0.036, 10), mats.MAT_STEEL_ROTOR);
    stBolt.rotation.x = Math.PI / 2;
    stBolt.position.set(pStemSteerer.x - 0.012, pStemSteerer.y + dy, 0);
    cockpitGroup.add(stBolt);
  });

  // Top cap with countersunk M6 stainless preload bolt
  const topCap = createCylinderBetween(
    pStemSteerer.clone().add(new THREE.Vector3(-0.005, 0.016, 0)),
    pStemSteerer.clone().add(new THREE.Vector3(-0.007, 0.020, 0)),
    0.0178,
    0.015,
    mats.MAT_ANODIZED_BLACK,
    24
  );
  const preloadBolt = createCylinderBetween(
    pStemSteerer.clone().add(new THREE.Vector3(-0.006, 0.019, 0)),
    pStemSteerer.clone().add(new THREE.Vector3(-0.0075, 0.021, 0)),
    0.0045,
    0.0045,
    mats.MAT_STEEL_ROTOR,
    12
  );
  cockpitGroup.add(topCap, preloadBolt);

  // 4x M5 stainless bolts on stem faceplate + CNC split faceplate clamps
  [-0.012, 0.012].forEach((dy) => {
    [-0.014, 0.014].forEach((dz) => {
      const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.0032, 0.0032, 0.009, 12), mats.MAT_STEEL_ROTOR);
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
  const barGeom = new THREE.TubeGeometry(barCurve, 72, 0.0125, 24, false);
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
  const headlightGroup = new THREE.Group();
  headlightGroup.name = 'SURRON_DUAL_LED_HEADLIGHT';
  headlightGroup.position.set(0.448, 0.592, 0);
  headlightGroup.rotation.z = -0.14;

  const hlHousing = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.046, 0.114), mats.MAT_ANODIZED_BLACK);
  hlHousing.castShadow = true;
  headlightGroup.add(hlHousing);

  // Sculpted front chamfered bezel frame
  const hlBezel = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.048, 0.116), mats.MAT_FRAME_RAL9005);
  hlBezel.position.set(0.020, 0, 0);
  headlightGroup.add(hlBezel);

  // 4 Silver Socket-Head Allen Bolts in the 4 corners of the front bezel (1:1 as on Reference Photo #6!)
  [-0.017, 0.017].forEach((by) => {
    [-0.049, 0.049].forEach((bz) => {
      const cornerBolt = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0035, 0.0035, 0.005, 12),
        mats.MAT_STEEL_ROTOR
      );
      cornerBolt.rotation.z = Math.PI / 2;
      cornerBolt.position.set(0.0225, by, bz);
      headlightGroup.add(cornerBolt);
    });
  });

  // Rear cooling fins
  for (let i = -4; i <= 4; i++) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.0026, 0.108), mats.MAT_ANODIZED_BLACK);
    fin.position.set(-0.024, i * 0.0046, 0);
    headlightGroup.add(fin);
  }

  // Dual Figure-8 / Peanut Reflector Eyes (Left = Fluted Flood Lens, Right = Deep Parabolic Spot Cone)
  [-0.024, 0.024].forEach((zEye, eyeIdx) => {
    const reflector = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0175, 0.007, 0.018, 28, 1, true),
      mats.MAT_STEEL_ROTOR
    );
    reflector.rotation.z = -Math.PI / 2;
    reflector.position.set(0.013, 0, zEye);
    headlightGroup.add(reflector);

    const eyeRing = new THREE.Mesh(new THREE.TorusGeometry(0.0175, 0.0018, 12, 28), mats.MAT_STEEL_ROTOR);
    eyeRing.rotation.y = Math.PI / 2;
    eyeRing.position.set(0.0218, 0, zEye);
    headlightGroup.add(eyeRing);

    const creeDie = new THREE.Mesh(new THREE.BoxGeometry(0.003, 0.005, 0.005), mats.MAT_XT90_YELLOW);
    creeDie.position.set(0.006, 0, zEye);
    headlightGroup.add(creeDie);

    const emitter = new THREE.Mesh(new THREE.SphereGeometry(0.009, 16, 16), mats.MAT_HEADLIGHT_LED);
    emitter.position.set(0.012, 0, zEye);
    headlightGroup.add(emitter);

    if (eyeIdx === 0) {
      for (let f = -3; f <= 3; f++) {
        const flute = new THREE.Mesh(new THREE.CylinderGeometry(0.0011, 0.0011, 0.030, 8), mats.MAT_SMOKE_LENS);
        flute.position.set(0.0208, 0, zEye + f * 0.0042);
        headlightGroup.add(flute);
      }
    }
  });

  const smokeLens = new THREE.Mesh(new THREE.BoxGeometry(0.003, 0.036, 0.088), mats.MAT_SMOKE_LENS);
  smokeLens.position.set(0.023, 0, 0);
  headlightGroup.add(smokeLens);

  const hlBracket = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.028, 0.044), mats.MAT_ANODIZED_BLACK);
  hlBracket.position.set(-0.012, 0.024, 0);
  headlightGroup.add(hlBracket);

  cockpitGroup.add(headlightGroup);

  // SW900 LCD Computer (90 x 54 x 18 mm) mounted on handlebar LEFT of stem on two clamps, facing rider's eyes in POV mode
  const sw900Group = new THREE.Group();
  sw900Group.name = 'SW900_COMPUTER_UNIT';
  sw900Group.position.set(0.412, 0.654, 0.064);
  sw900Group.lookAt(new THREE.Vector3(-0.12, 0.88, 0.064));

  // Black ABS Rectangular Housing (90 x 54 x 18 mm)
  const swCase = new THREE.Mesh(new THREE.BoxGeometry(0.090, 0.054, 0.018), mats.MAT_ANODIZED_BLACK);
  swCase.castShadow = true;

  // Silver-White Outer Frame Bezel around LCD Screen
  const swSilverBezel = new THREE.Mesh(new THREE.BoxGeometry(0.088, 0.052, 0.0025), mats.MAT_STEEL_ROTOR);
  swSilverBezel.position.set(0, 0, 0.0085);

  // Live 512x320 60FPS LCD Screen Plane
  const swScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.084, 0.048), mats.MAT_SW900_SCREEN);
  swScreen.name = 'SW900_LCD_SCREEN_MESH';
  swScreen.position.set(0, 0, 0.0099);
  swScreen.userData = { isSw900Screen: true };

  sw900Group.add(swCase, swSilverBezel, swScreen);

  // Two Handlebar Mounting Clamps & Brackets (left and right of SW900 backplate)
  [-0.028, 0.028].forEach((xClamp) => {
    const bracketArm = new THREE.Mesh(new THREE.BoxGeometry(0.009, 0.032, 0.012), mats.MAT_ANODIZED_BLACK);
    bracketArm.position.set(xClamp, -0.022, -0.010);
    const barRing = new THREE.Mesh(new THREE.TorusGeometry(0.0135, 0.0032, 10, 20), mats.MAT_ANODIZED_BLACK);
    barRing.rotation.y = Math.PI / 2;
    barRing.position.set(xClamp, -0.032, -0.014);
    sw900Group.add(bracketArm, barRing);
  });
  cockpitGroup.add(sw900Group);

  // SW900 3-Button Rubber Remote Control Pad ([▲ UP], [M MODE], [▼ DOWN]) near Left Grip (clickable by mouse!)
  const swRemote = new THREE.Group();
  swRemote.name = 'SW900_REMOTE_3BTN';
  swRemote.position.set(0.382, 0.655, 0.214);
  swRemote.lookAt(new THREE.Vector3(-0.12, 0.88, 0.214));

  const remBody = new THREE.Mesh(new THREE.BoxGeometry(0.020, 0.034, 0.018), mats.MAT_ANODIZED_BLACK);
  const remClamp = new THREE.Mesh(new THREE.TorusGeometry(0.0135, 0.003, 10, 20), mats.MAT_ANODIZED_BLACK);
  remClamp.rotation.y = Math.PI / 2;
  remClamp.position.set(0, -0.006, -0.010);
  swRemote.add(remBody, remClamp);

  const btnConfigs = [
    { y: 0.010, action: 'UP', label: '▲', mat: mats.MAT_RUBBER_KENDA },
    { y: 0.000, action: 'MODE', label: 'M', mat: mats.MAT_BLUE_ANODIZED },
    { y: -0.010, action: 'DOWN', label: '▼', mat: mats.MAT_RUBBER_KENDA }
  ];
  btnConfigs.forEach((bCfg) => {
    const btnMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.014, 0.0075, 0.005),
      bCfg.mat
    );
    btnMesh.position.set(0, bCfg.y, 0.010);
    btnMesh.name = `SW900_BTN_${bCfg.action}`;
    btnMesh.userData = { sw900Button: bCfg.action, label: bCfg.label };
    swRemote.add(btnMesh);
  });
  cockpitGroup.add(swRemote);

  // Tactical Smartphone Mount clamped cleanly on front of Toptube behind Head Tube (1:1 as on Reference Photo #1!)
  const toptubeAngle = Math.atan2(0.545 - 0.415, 0.395 - (-0.135));
  const phoneMount = new THREE.Group();
  phoneMount.position.set(0.325, 0.532, 0.0);
  phoneMount.rotation.z = toptubeAngle;
  const mountClamp = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.036, 0.040), mats.MAT_VELCRO_STRAP);
  mountClamp.position.set(0, -0.004, 0);
  const phoneCradle = new THREE.Mesh(new THREE.BoxGeometry(0.115, 0.010, 0.062), mats.MAT_ANODIZED_BLACK);
  phoneCradle.position.set(0, 0.022, 0);
  // 4 CNC Corner Claws + Red Anodized Side Adjustment Knob on Phone Cradle
  [-0.052, 0.052].forEach((cx) => {
    [-0.028, 0.028].forEach((cz) => {
      const claw = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.014, 0.008), mats.MAT_ANODIZED_BLACK);
      claw.position.set(cx, 0.028, cz);
      phoneMount.add(claw);
    });
  });
  const cradleKnob = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.012, 12), mats.MAT_RED_ANODIZED);
  cradleKnob.rotation.x = Math.PI / 2;
  cradleKnob.position.set(0, 0.022, 0.035);
  phoneMount.add(mountClamp, phoneCradle, cradleKnob);
  cockpitGroup.add(phoneMount);

  // Left & Right Ribbed Lock-On Rubber Grips with 3D Tactile Waffle Ribs & Anodized Lock-On Collars
  const leftGrip = createCylinderBetween(
    new THREE.Vector3(0.376, 0.656, 0.250),
    new THREE.Vector3(0.365, 0.658, 0.370),
    0.016,
    0.016,
    mats.MAT_RUBBER_KENDA,
    28
  );
  cockpitGroup.add(leftGrip);

  // Right Side Half-Twist Throttle 20X Assembly (rotates around grip axis when accelerating!)
  const throttleTwistGroup = new THREE.Group();
  throttleTwistGroup.name = 'THROTTLE_20X_TWIST_GROUP';
  const throttlePivot = new THREE.Vector3(0.372, 0.656, -0.295);
  throttleTwistGroup.position.copy(throttlePivot);

  const rightGrip = createCylinderBetween(
    new THREE.Vector3(0.374, 0.656, -0.275).sub(throttlePivot),
    new THREE.Vector3(0.365, 0.658, -0.370).sub(throttlePivot),
    0.016,
    0.016,
    mats.MAT_RUBBER_KENDA,
    28
  );
  throttleTwistGroup.add(rightGrip);

  // 18 Tactile 3D Ribbed Grip Rings per grip + CNC Lock-On Collar Rings + Bar-End Plugs
  for (let r = 0; r < 16; r++) {
    const tL = (r + 1) / 17;
    const pGL = new THREE.Vector3(0.376, 0.656, 0.250).lerp(new THREE.Vector3(0.365, 0.658, 0.370), tL);
    const ribL = new THREE.Mesh(new THREE.TorusGeometry(0.0162, 0.0009, 8, 20), mats.MAT_RUBBER_KENDA);
    ribL.position.copy(pGL);
    cockpitGroup.add(ribL);

    const pGR = new THREE.Vector3(0.374, 0.656, -0.275).lerp(new THREE.Vector3(0.365, 0.658, -0.370), tL).sub(throttlePivot);
    const ribR = new THREE.Mesh(new THREE.TorusGeometry(0.0162, 0.0009, 8, 20), mats.MAT_RUBBER_KENDA);
    ribR.position.copy(pGR);
    throttleTwistGroup.add(ribR);
  }
  [-0.371, 0.371].forEach((zPlug) => {
    const plug = new THREE.Mesh(new THREE.CylinderGeometry(0.0168, 0.0168, 0.005, 20), mats.MAT_ANODIZED_BLACK);
    plug.rotation.x = Math.PI / 2;
    plug.position.set(0.365, 0.658, zPlug);
    cockpitGroup.add(plug);
  });

  // Right Side Half-Twist Throttle 20X with Knurled Grip ridges & Curved Cable Barrel Adjuster
  const throttleBody = createCylinderBetween(
    new THREE.Vector3(0.382, 0.654, -0.220).sub(throttlePivot),
    new THREE.Vector3(0.374, 0.656, -0.275).sub(throttlePivot),
    0.021,
    0.019,
    mats.MAT_ANODIZED_BLACK,
    28
  );
  const throttleRing = createCylinderBetween(
    new THREE.Vector3(0.380, 0.655, -0.232).sub(throttlePivot),
    new THREE.Vector3(0.378, 0.655, -0.242).sub(throttlePivot),
    0.0225,
    0.0225,
    mats.MAT_STEEL_ROTOR,
    24
  );
  // Visual red index dot on 20X twist collar so rotation is clearly visible in POV
  const throttleIndexDot = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.004, 0.036), mats.MAT_RED_ANODIZED);
  throttleIndexDot.position.set(-0.012, 0.018, 0.035);
  throttleTwistGroup.add(throttleBody, throttleRing, throttleIndexDot);
  cockpitGroup.add(throttleTwistGroup);
  cockpitGroup.userData.throttleTwistGroup = throttleTwistGroup;

  // Left Side 2-in-1 Switch Block (Headlight toggle + Red 105 dB Moto Horn Button)
  const switchBlock = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.038, 0.024), mats.MAT_ANODIZED_BLACK);
  switchBlock.position.set(0.380, 0.655, 0.234);
  const yellowLightBtn = new THREE.Mesh(new THREE.BoxGeometry(0.010, 0.009, 0.012), mats.MAT_XT90_YELLOW);
  yellowLightBtn.position.set(0.365, 0.662, 0.234);
  yellowLightBtn.userData = { sw900Button: 'LIGHT' };
  const redHornBtn = new THREE.Mesh(new THREE.BoxGeometry(0.010, 0.010, 0.012), mats.MAT_RED_ANODIZED);
  redHornBtn.position.set(0.365, 0.648, 0.234);
  redHornBtn.userData = { sw900Button: 'HORN' };
  cockpitGroup.add(switchBlock, yellowLightBtn, redHornBtn);

  // ZOOM HB-890E Hydraulic Brake Levers with mineral oil reservoirs & Red Julet E-Brake Cutoff Plugs (Photo #5)
  const brakeBladeGroups = [];
  [-1, 1].forEach((side) => {
    const zBase = side * 0.195;
    const leverGroup = new THREE.Group();
    leverGroup.position.set(0.386, 0.652, zBase);

    // Split handlebar clamp + 2 pinch bolts + horizontal mineral oil master cylinder reservoir
    const barClamp = new THREE.Mesh(new THREE.CylinderGeometry(0.0165, 0.0165, 0.018, 20), mats.MAT_ANODIZED_BLACK);
    barClamp.rotation.x = Math.PI / 2;
    leverGroup.add(barClamp);

    const reservoir = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.024, 0.048), mats.MAT_ANODIZED_BLACK);
    reservoir.position.set(0.018, 0.005, -side * 0.018);
    leverGroup.add(reservoir);

    // 2 silver Torx reservoir cap screws + bleed port screw (1:1 as on Reference Photo #5)
    [-0.014, 0.014].forEach((dz) => {
      const capScrew = new THREE.Mesh(new THREE.CylinderGeometry(0.0022, 0.0022, 0.003, 10), mats.MAT_STEEL_ROTOR);
      capScrew.position.set(0.018, 0.018, -side * 0.018 + dz);
      leverGroup.add(capScrew);
    });
    const bleedScrew = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.003, 10), mats.MAT_STEEL_ROTOR);
    bleedScrew.position.set(0.018, 0.018, -side * 0.018);
    leverGroup.add(bleedScrew);

    // Lever Pivot Barrel Bolt + Reach Adjuster Screw
    const pivotBolt = new THREE.Mesh(new THREE.CylinderGeometry(0.0042, 0.0042, 0.028, 12), mats.MAT_STEEL_ROTOR);
    pivotBolt.position.set(0.026, 0.002, -side * 0.025);
    leverGroup.add(pivotBolt);

    // Red waterproof Julet 2-pin e-brake power cutoff connector lead (1:1 as on Photo #5!)
    const juletBody = createCylinderBetween(
      new THREE.Vector3(0.020, -0.004, -side * 0.042),
      new THREE.Vector3(0.022, -0.008, -side * 0.068),
      0.0042,
      0.0042,
      mats.MAT_ANODIZED_BLACK,
      12
    );
    const juletRedTip = createCylinderBetween(
      new THREE.Vector3(0.022, -0.008, -side * 0.068),
      new THREE.Vector3(0.023, -0.010, -side * 0.075),
      0.0045,
      0.0045,
      mats.MAT_RED_ANODIZED,
      12
    );
    leverGroup.add(juletBody, juletRedTip);

    // Ergonomic 2-finger CNC brake blade with ball tip (pivots when braking!)
    const bladePivotGroup = new THREE.Group();
    const pBladePivot = new THREE.Vector3(0.024, -0.005, -side * 0.025);
    bladePivotGroup.position.copy(pBladePivot);
    bladePivotGroup.userData = { side };

    const bladeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.024, -0.013, side * 0.060),
      new THREE.Vector3(0.018, -0.019, side * 0.120)
    ]);
    const bladeGeom = new THREE.TubeGeometry(bladeCurve, 20, 0.0052, 12, false);
    const blade = new THREE.Mesh(bladeGeom, mats.MAT_ANODIZED_BLACK);
    const ballEnd = new THREE.Mesh(new THREE.SphereGeometry(0.0072, 12, 12), mats.MAT_ANODIZED_BLACK);
    ballEnd.position.set(0.018, -0.019, side * 0.120);
    bladePivotGroup.add(blade, ballEnd);
    leverGroup.add(bladePivotGroup);
    brakeBladeGroups.push(bladePivotGroup);

    cockpitGroup.add(leverGroup);
  });
  cockpitGroup.userData.brakeBladeGroups = brakeBladeGroups;

  // Braided Hydraulic Brake Hoses + Spiral Cable Wrap Loom descending down fork & frame
  const frontHoseCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.405, 0.645, 0.165),
    new THREE.Vector3(0.478, 0.545, 0.085),
    new THREE.Vector3(0.495, 0.365, 0.064),
    new THREE.Vector3(0.502, 0.220, 0.062),
    new THREE.Vector3(0.505, 0.115, 0.056)
  ]);
  cockpitGroup.add(new THREE.Mesh(new THREE.TubeGeometry(frontHoseCurve, 36, 0.0028, 10, false), mats.MAT_RUBBER_KENDA));

  const rearHoseCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.405, 0.645, -0.165),
    new THREE.Vector3(0.468, 0.540, -0.055),
    new THREE.Vector3(0.395, 0.455, 0.022),
    new THREE.Vector3(0.015, 0.015, 0.025),
    new THREE.Vector3(-0.425, 0.055, 0.070)
  ]);
  cockpitGroup.add(new THREE.Mesh(new THREE.TubeGeometry(rearHoseCurve, 40, 0.0028, 10, false), mats.MAT_RUBBER_KENDA));

  // Bundled Spiral-Wrapped Cockpit Signal Harness (SW900 + 20X Throttle + Julet E-Brake + Sur-Ron Light)
  const mainLoomCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.415, 0.635, 0.012),
    new THREE.Vector3(0.462, 0.565, 0.008),
    new THREE.Vector3(0.428, 0.478, 0.004),
    new THREE.Vector3(0.365, 0.410, 0.000)
  ]);
  cockpitGroup.add(new THREE.Mesh(new THREE.TubeGeometry(mainLoomCurve, 28, 0.0048, 10, false), mats.MAT_VELCRO_STRAP));

  return cockpitGroup;
}

/**
 * Helper: Builds a perforated ventilated 180mm stainless steel brake rotor (R = 0.090m)
 * Supports red anodized Floating Rotor Carrier with 6 Stainless Float Rivets (as on Front Wheel in Reference Photo #1)
 */
export function buildBrakeRotor180mm(mats, useRedSpider = false) {
  const rotorGroup = new THREE.Group();
  const outerR = 0.090;
  const innerTrackR = 0.072;

  // Outer friction ring with 36 wave-style ventilation slots + diagonal heat-dissipation slots
  const ringShape = new THREE.Shape();
  ringShape.absarc(0, 0, outerR, 0, Math.PI * 2, false);
  const innerHole = new THREE.Path();
  innerHole.absarc(0, 0, innerTrackR, 0, Math.PI * 2, true);
  ringShape.holes.push(innerHole);

  for (let i = 0; i < 36; i++) {
    const ang = (i / 36) * Math.PI * 2;
    const rMid = (outerR + innerTrackR) * 0.5 + ((i % 3) - 1) * 0.0026;
    const vent = new THREE.Path();
    vent.absarc(Math.cos(ang) * rMid, Math.sin(ang) * rMid, 0.0025, 0, Math.PI * 2, true);
    ringShape.holes.push(vent);
  }

  const rotorGeom = new THREE.ExtrudeGeometry(ringShape, { depth: 0.0022, bevelEnabled: false });
  rotorGeom.translate(0, 0, -0.0011);
  const frictionRing = new THREE.Mesh(rotorGeom, mats.MAT_STEEL_ROTOR);
  rotorGroup.add(frictionRing);

  const spiderMat = useRedSpider ? mats.MAT_RED_ANODIZED : mats.MAT_STEEL_ROTOR;

  // 6 Tangential Spider Arms + 6-bolt ISO T25 Torx Hub Bolts (BCD 44mm) + 6 Floating Rotor Carrier Rivets
  for (let i = 0; i < 6; i++) {
    const a1 = (i / 6) * Math.PI * 2;
    const a2 = a1 + 0.34;
    const arm = createCylinderBetween(
      new THREE.Vector3(Math.cos(a1) * 0.024, Math.sin(a1) * 0.024, 0),
      new THREE.Vector3(Math.cos(a2) * innerTrackR, Math.sin(a2) * innerTrackR, 0),
      0.0048,
      0.0040,
      spiderMat,
      10
    );
    arm.scale.z = 0.38;
    rotorGroup.add(arm);

    // ISO 6-Bolt T25 Torx Hub Mounting Bolt (R = 22mm)
    const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.0034, 0.0034, 0.006, 12), mats.MAT_STEEL_ROTOR);
    bolt.rotation.x = Math.PI / 2;
    bolt.position.set(Math.cos(a1) * 0.022, Math.sin(a1) * 0.022, 0.002);
    rotorGroup.add(bolt);

    // Floating carrier stainless rivet button at the junction of spider arm & outer brake track (R = 71.5mm)
    if (useRedSpider) {
      const floatRivet = new THREE.Mesh(new THREE.CylinderGeometry(0.0042, 0.0042, 0.0038, 14), mats.MAT_STEEL_ROTOR);
      floatRivet.rotation.x = Math.PI / 2;
      floatRivet.position.set(Math.cos(a2) * 0.0715, Math.sin(a2) * 0.0715, 0);
      rotorGroup.add(floatRivet);
    }
  }

  const hubRing = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.0026, 28), spiderMat);
  hubRing.rotation.x = Math.PI / 2;
  rotorGroup.add(hubRing);

  return rotorGroup;
}

/**
 * Helper: Builds a 26" Wheel on Stealth Black MTX39 Rim + KENDA K-RAD K905 (26x2.30/2.35") Tire
 * with 7-Row Checkerboard & Side-Wrap Tread (672 3D blocks per wheel!), 36 Stainless Rim Eyelets,
 * Yellow KENDA Sidewall Logo & Red Anodized Schrader Valve Cap
 */
function buildWheelBase26(mats) {
  const wheelGroup = new THREE.Group();

  const R_carcass = 0.244;
  const r_balloon = 0.0225;

  // 1. High-Tessellation Tire Carcass (Kenda K-Rad K905 26x2.30")
  const carcassGeom = new THREE.TorusGeometry(R_carcass, r_balloon, 36, 112);
  const carcassMesh = new THREE.Mesh(carcassGeom, mats.MAT_RUBBER_KENDA);
  carcassMesh.castShadow = true;
  carcassMesh.receiveShadow = true;
  wheelGroup.add(carcassMesh);

  // 2. KENDA K-RAD K905 7-Row Checkerboard + Sidewall Wrap 3D Tread Pattern
  // 96 circumferential steps x 7 staggered rows (5 crown rows + 2 sidewall wrap ribs) = 672 3D blocks per tire!
  const steps = 96;
  const rowsPhi = [-0.94, -0.64, -0.32, 0.0, 0.32, 0.64, 0.94];
  const knobGeom = new THREE.BoxGeometry(0.0096, 0.0038, 0.0088);
  const instancedKnobs = new THREE.InstancedMesh(knobGeom, mats.MAT_RUBBER_KENDA, steps * rowsPhi.length);
  instancedKnobs.castShadow = true;

  const dummy = new THREE.Object3D();
  let idx = 0;

  for (let i = 0; i < steps; i++) {
    const baseTheta = (i / steps) * Math.PI * 2;

    for (let rIdx = 0; rIdx < rowsPhi.length; rIdx++) {
      const phi = rowsPhi[rIdx];
      const theta = baseTheta + ((rIdx % 2) * (Math.PI / steps));
      const rPos = R_carcass + (r_balloon + 0.0012) * Math.cos(phi);
      const zPos = (r_balloon + 0.0012) * Math.sin(phi);

      dummy.position.set(Math.cos(theta) * rPos, Math.sin(theta) * rPos, zPos);
      dummy.rotation.set(0, 0, theta - Math.PI / 2);
      dummy.rotateX(phi);
      if (rIdx === 0 || rIdx === 6) {
        // K-Rad characteristic ribbed wrap-around sidewall protection bars
        dummy.scale.set(0.72, 0.95, 1.35);
      } else if (rIdx === 1 || rIdx === 5) {
        dummy.scale.set(1.06, 1.28, 1.15);
      } else {
        dummy.scale.set(1.12, 1.04, 1.04);
      }
      dummy.updateMatrix();
      instancedKnobs.setMatrixAt(idx++, dummy.matrix);
    }
  }
  instancedKnobs.instanceMatrix.needsUpdate = true;
  wheelGroup.add(instancedKnobs);

  // 3. Yellow & White "KENDA" Sidewall Hot-Patch Logo Ring at 6 o'clock on both sides (1:1 as on Photo #3!)
  const sidewallRingGeom = new THREE.RingGeometry(0.228, 0.244, 72);
  [-0.0226, 0.0226].forEach((zSide) => {
    const logoRing = new THREE.Mesh(sidewallRingGeom, mats.MAT_KENDA_SIDEWALL);
    logoRing.position.z = zSide;
    if (zSide < 0) logoRing.rotation.y = Math.PI;
    wheelGroup.add(logoRing);
  });

  // 4. SunRingle / PowerCircle MTX39 Double-Wall Eyeleted Moto Rim (39mm wide, sleek V-profile)
  const rimProfile = [
    new THREE.Vector2(0.213, -0.010),
    new THREE.Vector2(0.219, -0.0185),
    new THREE.Vector2(0.228, -0.0185),
    new THREE.Vector2(0.228, 0.0185),
    new THREE.Vector2(0.219, 0.0185),
    new THREE.Vector2(0.213, 0.010),
    new THREE.Vector2(0.213, -0.010)
  ];
  const rimLatheGeom = new THREE.LatheGeometry(rimProfile, 72);
  rimLatheGeom.rotateX(Math.PI / 2);
  const rimMesh = new THREE.Mesh(rimLatheGeom, mats.MAT_ANODIZED_BLACK);
  rimMesh.castShadow = true;
  wheelGroup.add(rimMesh);

  // 36 Stainless Steel Rim Spoke Eyelets (Пистоны обода MTX39) around inner rim bed
  const eyeletGeom = new THREE.CylinderGeometry(0.0028, 0.0028, 0.0022, 10);
  const instEyelets = new THREE.InstancedMesh(eyeletGeom, mats.MAT_STEEL_ROTOR, 36);
  for (let e = 0; e < 36; e++) {
    const eAng = (e / 36) * Math.PI * 2;
    const eSide = e % 2 === 0 ? 1 : -1;
    dummy.position.set(Math.cos(eAng) * 0.2132, Math.sin(eAng) * 0.2132, eSide * 0.003);
    dummy.rotation.set(0, 0, eAng - Math.PI / 2);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    instEyelets.setMatrixAt(e, dummy.matrix);
  }
  instEyelets.instanceMatrix.needsUpdate = true;
  wheelGroup.add(instEyelets);

  // Subtle MTX39 Rim Spec Decals on left & right rim sidewalls
  const decalGeom = new THREE.RingGeometry(0.215, 0.227, 72);
  [-0.0188, 0.0188].forEach((zSide) => {
    const decalMesh = new THREE.Mesh(decalGeom, mats.MAT_RIM_MTX39);
    decalMesh.position.z = zSide;
    if (zSide < 0) decalMesh.rotation.y = Math.PI;
    wheelGroup.add(decalMesh);
  });

  // 5. Brass Schrader Valve Stem + Knurled Lockring + Red Anodized Aluminum Valve Cap at 6 o'clock
  const valveLockNut = createCylinderBetween(
    new THREE.Vector3(0, -0.213, 0),
    new THREE.Vector3(0, -0.209, 0),
    0.0036,
    0.0036,
    mats.MAT_STEEL_ROTOR,
    8
  );
  const valveStem = createCylinderBetween(
    new THREE.Vector3(0, -0.209, 0),
    new THREE.Vector3(0, -0.196, 0),
    0.0025,
    0.0025,
    mats.MAT_GOLD_BRASS || mats.MAT_ANODIZED_BLACK,
    12
  );
  const redValveCap = createCylinderBetween(
    new THREE.Vector3(0, -0.196, 0),
    new THREE.Vector3(0, -0.186, 0),
    0.0032,
    0.0028,
    mats.MAT_RED_ANODIZED,
    12
  );
  wheelGroup.add(valveLockNut, valveStem, redValveCap);

  return wheelGroup;
}

/**
 * 4. NODE 3A: FRONT WHEEL 26" MTX39 (36x 14G 3-Cross Spokes, Sealed Bearing Hub, 180mm Floating Rotor)
 */
export function buildFrontWheelNode(mats) {
  const frontWheel = buildWheelBase26(mats);
  frontWheel.name = 'NODE_03A_FRONT_WHEEL_MTX39';
  frontWheel.position.set(0.610, 0.015, 0);

  // Front Disc Hub + Sealed Cartridge Bearing Endcaps + Solid Axle with Flange Nuts
  const hubBody = createCylinderBetween(
    new THREE.Vector3(0, 0, -0.052),
    new THREE.Vector3(0, 0, 0.052),
    0.018,
    0.018,
    mats.MAT_ANODIZED_BLACK,
    28
  );
  frontWheel.add(hubBody);

  [-0.032, 0.032].forEach((zFlange) => {
    const flange = createCylinderBetween(
      new THREE.Vector3(0, 0, zFlange - 0.0022),
      new THREE.Vector3(0, 0, zFlange + 0.0022),
      0.0315,
      0.0315,
      mats.MAT_ANODIZED_BLACK,
      32
    );
    frontWheel.add(flange);
  });

  const axle = createCylinderBetween(
    new THREE.Vector3(0, 0, -0.072),
    new THREE.Vector3(0, 0, 0.072),
    0.006,
    0.006,
    mats.MAT_STEEL_ROTOR,
    16
  );
  frontWheel.add(axle);

  [-0.066, 0.066].forEach((zNut) => {
    const nut = new THREE.Mesh(new THREE.CylinderGeometry(0.0095, 0.0095, 0.008, 6), mats.MAT_ANODIZED_BLACK);
    nut.rotation.x = Math.PI / 2;
    nut.position.set(0, 0, zNut);
    frontWheel.add(nut);
  });

  // 36 Black 14G Spokes in 3-Cross pattern with J-Bend Hub Heads & Brass/Silver Nipples
  const R_rim = 0.214;
  const R_hub = 0.0285;
  for (let i = 0; i < 36; i++) {
    const side = i % 2 === 0 ? 1 : -1;
    const crossDir = i % 4 < 2 ? 1 : -1;
    const rimAngle = (i / 36) * Math.PI * 2;
    const hubAngle = rimAngle + crossDir * 0.95;

    const pHub = new THREE.Vector3(Math.cos(hubAngle) * R_hub, Math.sin(hubAngle) * R_hub, side * 0.032);
    const pRim = new THREE.Vector3(Math.cos(rimAngle) * R_rim, Math.sin(rimAngle) * R_rim, side * 0.003);

    const spoke = createCylinderBetween(pHub, pRim, 0.0010, 0.0010, mats.MAT_ANODIZED_BLACK, 8);
    frontWheel.add(spoke);

    const jHead = new THREE.Mesh(new THREE.SphereGeometry(0.0019, 8, 8), mats.MAT_STEEL_ROTOR);
    jHead.position.copy(pHub);
    frontWheel.add(jHead);

    const pNippleStart = pRim.clone().lerp(pHub, 0.045);
    const nipple = createCylinderBetween(pNippleStart, pRim, 0.0017, 0.0017, mats.MAT_STEEL_ROTOR, 8);
    frontWheel.add(nipple);
  }

  // Front 180mm Perforated Brake Rotor on Left Side (z = +0.044) with Red Anodized Spider (as on Photo #3!)
  const frontRotor = buildBrakeRotor180mm(mats, true);
  frontRotor.position.set(0, 0, 0.044);
  frontWheel.add(frontRotor);

  return frontWheel;
}

/**
 * 5. NODE 3B: REAR WHEEL 26" MTX39 + 72V 3000W DIRECT DRIVE MOTOR
 *    Strictly per Spec 1.1: Smooth, flat-sided matte black cylinder Ø245mm (R=0.1225m),
 *    width 80mm between dropouts (NO cooling fins or radiators!), with a ring of 18x M4 hex bolts around the cover edge!
 */
export function buildRearWheelNode(mats) {
  const rearWheel = buildWheelBase26(mats);
  rearWheel.name = 'NODE_03B_REAR_WHEEL_3000W';
  rearWheel.position.set(-0.438, 0.015, 0);

  // Smooth flat-sided 72V 3000W Direct Drive Hub Motor: OD 245mm (R = 0.1225m), width 78mm (-0.039..+0.039)
  const R_motor = 0.1225;
  const motorCylinder = createCylinderBetween(
    new THREE.Vector3(0, 0, -0.036),
    new THREE.Vector3(0, 0, 0.036),
    R_motor,
    R_motor,
    mats.MAT_FRAME_RAL9005,
    72
  );
  rearWheel.add(motorCylinder);

  // Smooth flat matte-black side covers + Ring of 18x M4 stainless socket-head hex bolts per side (NO fins/ribs!)
  [-1, 1].forEach((side) => {
    const zCover = side * 0.036;
    const flatCover = createCylinderBetween(
      new THREE.Vector3(0, 0, zCover),
      new THREE.Vector3(0, 0, zCover + side * 0.0035),
      R_motor * 0.96,
      R_motor * 0.92,
      mats.MAT_FRAME_RAL9005,
      64
    );
    rearWheel.add(flatCover);

    // Compact center bearing boss & rubber lip oil seal
    const bearingBoss = createCylinderBetween(
      new THREE.Vector3(0, 0, zCover + side * 0.0035),
      new THREE.Vector3(0, 0, zCover + side * 0.0085),
      0.026,
      0.022,
      mats.MAT_ANODIZED_BLACK,
      32
    );
    rearWheel.add(bearingBoss);

    // 18x M4 stainless steel hex bolts around perimeter of the black motor cover
    const boltRadius = R_motor * 0.86;
    for (let b = 0; b < 18; b++) {
      const ang = (b / 18) * Math.PI * 2;
      const bolt = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0026, 0.0026, 0.0042, 6),
        mats.MAT_STEEL_ROTOR
      );
      bolt.rotation.x = Math.PI / 2;
      bolt.position.set(
        Math.cos(ang) * boltRadius,
        Math.sin(ang) * boltRadius,
        zCover + side * 0.0040
      );
      rearWheel.add(bolt);
    }
  });

  // 36 Thick Short Black 12G (2.6mm -> R=0.0013m) Spokes in 1-Cross pattern from Ø245mm motor flange to MTX39 rim
  const R_rim = 0.214;
  const R_flange = 0.118;
  for (let i = 0; i < 36; i++) {
    const side = i % 2 === 0 ? 1 : -1;
    const crossDir = i % 4 < 2 ? 1 : -1;
    const rimAngle = (i / 36) * Math.PI * 2;
    const hubAngle = rimAngle + crossDir * 0.22;

    const pHub = new THREE.Vector3(Math.cos(hubAngle) * R_flange, Math.sin(hubAngle) * R_flange, side * 0.034);
    const pRim = new THREE.Vector3(Math.cos(rimAngle) * R_rim, Math.sin(rimAngle) * R_rim, side * 0.003);

    const spoke = createCylinderBetween(pHub, pRim, 0.00135, 0.00135, mats.MAT_ANODIZED_BLACK, 8);
    rearWheel.add(spoke);

    const jHead = new THREE.Mesh(new THREE.SphereGeometry(0.0024, 8, 8), mats.MAT_STEEL_ROTOR);
    jHead.position.copy(pHub);
    rearWheel.add(jHead);

    const pNippleStart = pRim.clone().lerp(pHub, 0.085);
    const nipple = createCylinderBetween(pNippleStart, pRim, 0.0020, 0.0020, mats.MAT_STEEL_ROTOR, 8);
    rearWheel.add(nipple);
  }

  // M14 Axle with 10mm flat sides + Coiled Stainless Anti-Kink Spring Guard + Phase/Hall Harness
  const m14Axle = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.010, 0.185), mats.MAT_STEEL_ROTOR);
  rearWheel.add(m14Axle);

  [-0.082, 0.082].forEach((zNut) => {
    const washer = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.003, 24), mats.MAT_STEEL_ROTOR);
    washer.rotation.x = Math.PI / 2;
    washer.position.set(0, 0, zNut * 0.92);
    const nut = new THREE.Mesh(new THREE.CylinderGeometry(0.0125, 0.0125, 0.011, 6), mats.MAT_STEEL_ROTOR);
    nut.rotation.x = Math.PI / 2;
    nut.position.set(0, 0, zNut);
    rearWheel.add(washer, nut);
  });

  // Coiled Stainless Anti-Kink Spring Guard exiting the hollow M14 Left Axle
  for (let sp = 0; sp < 10; sp++) {
    const coil = new THREE.Mesh(new THREE.TorusGeometry(0.0062, 0.0009, 8, 16), mats.MAT_STEEL_ROTOR);
    coil.position.set(sp * 0.002, -sp * 0.0008, 0.088 + sp * 0.0006);
    rearWheel.add(coil);
  }

  // Heavy Motor Phase (3x 6mm²) + Dual Hall Sensor Cable exiting left M14 axle
  const phaseCableCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0.090),
    new THREE.Vector3(0.018, -0.008, 0.092),
    new THREE.Vector3(0.065, -0.005, 0.068),
    new THREE.Vector3(0.180, -0.006, 0.056)
  ]);
  rearWheel.add(new THREE.Mesh(new THREE.TubeGeometry(phaseCableCurve, 24, 0.0052, 12, false), mats.MAT_RUBBER_KENDA));

  // Single-speed 16T Freewheel Sprocket on Right Side (z = -0.056) with Lockring Notches & 16 Machined Teeth
  const freewheel = createCylinderBetween(
    new THREE.Vector3(0, 0, -0.042),
    new THREE.Vector3(0, 0, -0.060),
    0.033,
    0.033,
    mats.MAT_STEEL_ROTOR,
    28
  );
  const fwBodyInner = createCylinderBetween(
    new THREE.Vector3(0, 0, -0.040),
    new THREE.Vector3(0, 0, -0.062),
    0.025,
    0.025,
    mats.MAT_GOLD_BRASS || mats.MAT_ANODIZED_BLACK,
    24
  );
  rearWheel.add(freewheel, fwBodyInner);
  const fwToothGeom = new THREE.BoxGeometry(0.0036, 0.0052, 0.0030);
  for (let t = 0; t < 16; t++) {
    const ang = (t / 16) * Math.PI * 2;
    const fwTooth = new THREE.Mesh(fwToothGeom, mats.MAT_STEEL_ROTOR);
    fwTooth.position.set(Math.cos(ang) * 0.0352, Math.sin(ang) * 0.0352, -0.056);
    fwTooth.rotation.z = ang;
    rearWheel.add(fwTooth);
  }

  // Rear 180mm Perforated Brake Rotor on Left Side (z = +0.052)
  const rearRotor = buildBrakeRotor180mm(mats, false);
  rearRotor.position.set(0, 0, 0.052);
  rearWheel.add(rearRotor);

  return rearWheel;
}

/**
 * 6. NODE 4: CUSTOM 6MM STEEL MONOLITHIC DROPOUT ARMOR PLATE ("2-IN-1": M14 10x14MM SLOT + IS 51MM EARS)
 *    + PINCH CLAMP BOLT + IS-PM 180 ADAPTER + REAR 4-PISTON ZOOM HB-890E CALIPER
 */
export function buildRearDropoutBrakeNode(mats) {
  const dropoutGroup = new THREE.Group();
  dropoutGroup.name = 'NODE_04_REAR_DROPOUT_6MM_ZOOM';

  const axX = -0.438;
  const axY = 0.015;

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
    bevelSegments: 3
  });
  plateGeom.translate(0, 0, 0.070);
  const leftArmorPlate = new THREE.Mesh(plateGeom, mats.MAT_FRAME_RAL9005);
  leftArmorPlate.castShadow = true;
  dropoutGroup.add(leftArmorPlate);

  const rightPlateGeom = plateGeom.clone();
  rightPlateGeom.translate(0, 0, -0.146);
  const rightArmorPlate = new THREE.Mesh(rightPlateGeom, mats.MAT_FRAME_RAL9005);
  dropoutGroup.add(rightArmorPlate);

  // Horizontal M6 Anti-Spread Pinch Bolt & Nyloc Nut clamping the bottom of the 10x14mm M14 slot
  [-0.073, 0.073].forEach((zSide) => {
    const pinchBolt = new THREE.Mesh(new THREE.CylinderGeometry(0.0035, 0.0035, 0.044, 10), mats.MAT_STEEL_ROTOR);
    pinchBolt.rotation.z = Math.PI / 2;
    pinchBolt.position.set(axX, axY - 0.015, zSide);
    dropoutGroup.add(pinchBolt);
  });

  // Stainless M6 Allen Bolts + Washers + Locknuts fastening the 6mm plate to frame & IS-PM adapter
  [
    [axX - 0.014, axY + 0.074, 0.076],
    [axX + 0.030, axY + 0.052, 0.076],
    [axX + 0.020, axY + 0.010, 0.076],
    [axX - 0.020, axY + 0.018, 0.076]
  ].forEach(([bx, by, bz]) => {
    const m6Bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.0044, 0.0044, 0.009, 12), mats.MAT_STEEL_ROTOR);
    m6Bolt.rotation.x = Math.PI / 2;
    m6Bolt.position.set(bx, by, bz);
    const washer = new THREE.Mesh(new THREE.CylinderGeometry(0.0065, 0.0065, 0.0018, 16), mats.MAT_STEEL_ROTOR);
    washer.rotation.x = Math.PI / 2;
    washer.position.set(bx, by, bz - 0.003);
    dropoutGroup.add(m6Bolt, washer);
  });

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


