// ============================================================================
// STEALTH SUR-RON 72V 3000W — NODE 5 (CORDURA 1000D BAG + 20S7P 140x EVE 50E
// SERPENTINE BUSBAR BATTERY + BISIDA 120A BMS), NODE 6 (60A FINNED CONTROLLER +
// STEPPED 3D PETG WIRING BOX WITH 105 dB HORN & DC-DC), NODE 7 (SUR-RON MOTO
// SADDLE + 2-BOLT STEEL SUBFRAME + REAR TAIL FENDER WITH LED BRAKE LIGHT)
// ============================================================================
import * as THREE from 'three';
import { createCylinderBetween, createBiOvalTubeBetween } from './bike_chassis.js';
import { createBatterySeriesLabelMaterial } from './materials.js';

/**
 * Helper: Creates a rounded polygon THREE.Shape from an array of 2D vertices
 */
function createRoundedPolygonShape(pts, radius = 0.018) {
  const shape = new THREE.Shape();
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const prev = pts[(i - 1 + n) % n];
    const curr = pts[i];
    const next = pts[(i + 1) % n];

    const v1 = prev.clone().sub(curr).normalize();
    const v2 = next.clone().sub(curr).normalize();

    const pStart = curr.clone().addScaledVector(v1, radius);
    const pEnd = curr.clone().addScaledVector(v2, radius);

    if (i === 0) {
      shape.moveTo(pStart.x, pStart.y);
    } else {
      shape.lineTo(pStart.x, pStart.y);
    }
    shape.quadraticCurveTo(curr.x, curr.y, pEnd.x, pEnd.y);
  }
  shape.closePath();
  return shape;
}

/**
 * Compute exact 2D coordinates for all 140 21700 cells (EVE INR21700-50E)
 * forming a TRUE GEOMETRIC TRIANGLE inside the frame triangle (T_A, T_B, T_C):
 * - 12 triangular rows parallel to the Downtube:
 *   rowCounts = [20, 19, 17, 16, 14, 12, 11, 10, 9, 6, 4, 2] -> TOTAL = 140 cells!
 * - Partitioned into 4 horizontal/diagonal zones with exact multiples of 7 cells:
 *   * Zone 1 (Rows 0, 1, 2): 20 + 19 + 17 = 56 cells -> 8 compact 7P clusters (1S..8S, left -> right)
 *   * Zone 2 (Rows 3, 4, 5): 16 + 14 + 12 = 42 cells -> 6 compact 7P clusters (9S..14S, right -> left)
 *   * Zone 3 (Rows 6, 7):    11 + 10      = 21 cells -> 3 compact 7P clusters (15S..17S, left -> right)
 *   * Zone 4 (Rows 8..11):   9 + 6 + 4 + 2 = 21 cells -> 3 compact 7P clusters (18S..20S, right -> apex)
 * - All 3 sides of the 140-cell array strictly parallel the Downtube, Seat Tube, and Toptube!
 */
export function generate140CellsLayout() {
  // Three vertices of the 140-cell triangle (inset inside the EVA cocoon and below the upper Toptube BMS channel)
  const T_A = new THREE.Vector2(0.015, 0.056);  // Bottom vertex near BB
  const T_B = new THREE.Vector2(0.365, 0.454);  // Front-right vertex near Head Tube
  const T_C = new THREE.Vector2(-0.095, 0.354); // Top-rear apex near Seat Tube / Toptube junction

  const uAxis = T_B.clone().sub(T_A).normalize();
  const vAxis = new THREE.Vector2(-uAxis.y, uAxis.x);

  const rowCounts = [20, 19, 17, 16, 14, 12, 11, 10, 9, 6, 4, 2]; // Sum = 140 cells
  const sVals = [0.000, 0.082, 0.164, 0.246, 0.328, 0.410, 0.492, 0.572, 0.648, 0.745, 0.840, 0.935];

  const zones = [
    [0, 1, 2],      // Zone 0: 56 cells -> 8 sections (1S..8S)
    [3, 4, 5],      // Zone 1: 42 cells -> 6 sections (9S..14S)
    [6, 7],         // Zone 2: 21 cells -> 3 sections (15S..17S)
    [8, 9, 10, 11]  // Zone 3: 21 cells -> 3 sections (18S..20S)
  ];

  // 1. Generate raw cell positions in the 12 triangular rows
  const rows = [];
  for (let r = 0; r < rowCounts.length; r++) {
    const cnt = rowCounts[r];
    const s = sVals[r];
    const lx = T_A.x + s * (T_C.x - T_A.x);
    const ly = T_A.y + s * (T_C.y - T_A.y);
    const rx = T_B.x + s * (T_C.x - T_B.x);
    const ry = T_B.y + s * (T_C.y - T_B.y);

    const rowCells = [];
    for (let c = 0; c < cnt; c++) {
      const t = cnt > 1 ? c / (cnt - 1) : 0.5;
      const tNorm = (c + 0.5) / cnt;
      rowCells.push({
        row: r + 1,
        col: c + 1,
        t,
        tNorm,
        x: lx + t * (rx - lx),
        y: ly + t * (ry - ly)
      });
    }
    rows.push(rowCells);
  }

  // 2. Partition each zone into compact, non-overlapping 7P honeycomb clusters (1S..20S)
  const cells = [];
  const groupMeta = [];
  let seriesCounter = 0;

  for (let zIdx = 0; zIdx < zones.length; zIdx++) {
    const zRows = zones[zIdx];
    const zoneCells = [];
    zRows.forEach((rIdx) => zoneCells.push(...rows[rIdx]));

    // Serpentine zone direction: even zones go left->right (rear->front), odd zones go right->left (front->rear)
    const reverseDir = zIdx % 2 === 1;
    zoneCells.sort((a, b) => {
      const dt = Math.round((a.tNorm - b.tNorm) * 10000);
      if (dt !== 0) return reverseDir ? -dt : dt;
      return reverseDir ? b.row - a.row : a.row - b.row;
    });

    for (let k = 0; k < zoneCells.length; k += 7) {
      seriesCounter++;
      const currentSeriesId = seriesCounter; // 1..20
      const polarityOnLeft = currentSeriesId % 2 === 1 ? -1 : 1;
      const rawCluster = zoneCells.slice(k, k + 7);

      const groupCells = rawCluster.map((rc, pIdx) => {
        const cellObj = {
          cellGlobalIndex: cells.length + 1,
          row: rc.row,
          col: rc.col,
          zone: zIdx + 1,
          seriesId: currentSeriesId,
          parallelIndex: pIdx + 1,
          polarity: polarityOnLeft,
          x: rc.x,
          y: rc.y
        };
        cells.push(cellObj);
        return cellObj;
      });

      const cx = groupCells.reduce((acc, item) => acc + item.x, 0) / 7;
      const cy = groupCells.reduce((acc, item) => acc + item.y, 0) / 7;
      groupMeta.push({
        seriesId: currentSeriesId,
        zone: zIdx + 1,
        row: groupCells[0].row - 1,
        polarityOnLeft,
        cells: groupCells,
        center: new THREE.Vector2(cx, cy)
      });
    }
  }

  // Compute FR4 dielectric separator line segments between the 4 zones
  const zoneBarriers = [0.205, 0.451, 0.610].map((sBar) => ({
    pLeft: new THREE.Vector2(T_A.x + sBar * (T_C.x - T_A.x), T_A.y + sBar * (T_C.y - T_A.y)),
    pRight: new THREE.Vector2(T_B.x + sBar * (T_C.x - T_B.x), T_B.y + sBar * (T_C.y - T_B.y))
  }));

  return { cells, groupMeta, uAxis, vAxis, zoneBarriers, triangleVertices: { T_A, T_B, T_C } };
}

/**
 * 1. NODE 5: TACTICAL BAG CORDURA 1000D + INTERNAL X-RAY 20S7P TRIANGLE BATTERY (140x EVE 50E)
 */
export function buildBatterySystemNode(mats) {
  const batteryRoot = new THREE.Group();
  batteryRoot.name = 'NODE_05_BATTERY_20S7P_SYSTEM';

  // Exact Inner Triangle Contour matching Reference Photo #1 & #2
  const bagPts = [
    new THREE.Vector2(0.008, 0.030),  // Bottom vertex at BB
    new THREE.Vector2(0.390, 0.456),  // Lower head tube corner
    new THREE.Vector2(0.370, 0.528),  // Upper head tube corner (70mm front bridge)
    new THREE.Vector2(-0.120, 0.402)  // Seat tube upper corner under saddle nose
  ];

  const bagShape = createRoundedPolygonShape(bagPts, 0.018);

  // 1.1 Central Cordura Base + EVA 15mm Damper Cocoon + Authentic Velcro Straps
  const corduraCenterGroup = new THREE.Group();
  corduraCenterGroup.name = 'CORDURA_BAG_CENTER';

  const innerCutPts = [
    new THREE.Vector2(0.014, 0.048),
    new THREE.Vector2(0.376, 0.458),
    new THREE.Vector2(0.356, 0.510),
    new THREE.Vector2(-0.106, 0.386)
  ];
  const innerCutPath = createRoundedPolygonShape(innerCutPts, 0.012);

  const bagRimShape = createRoundedPolygonShape(bagPts, 0.018);
  bagRimShape.holes.push(innerCutPath);

  const rimExtrude = new THREE.ExtrudeGeometry(bagRimShape, {
    depth: 0.078,
    bevelEnabled: true,
    bevelSize: 0.003,
    bevelThickness: 0.003,
    bevelSegments: 3
  });
  rimExtrude.translate(0, 0, -0.039);
  const corduraRimMesh = new THREE.Mesh(rimExtrude, mats.MAT_CORDURA_1000D);
  corduraRimMesh.castShadow = true;
  corduraRimMesh.receiveShadow = true;
  corduraCenterGroup.add(corduraRimMesh);

  // Internal 15mm Black EVA Foam Damper Cocoon around perimeter
  const evaExtrude = new THREE.ExtrudeGeometry(bagRimShape, {
    depth: 0.072,
    bevelEnabled: false
  });
  evaExtrude.translate(0, 0, -0.036);
  const evaCocoonMesh = new THREE.Mesh(evaExtrude, mats.MAT_EVA_FOAM);
  evaCocoonMesh.scale.set(0.96, 0.96, 1.0);
  evaCocoonMesh.position.set(0.005, 0.010, 0);
  corduraCenterGroup.add(evaCocoonMesh);

  // 45mm Wide Matte Black Velcro Straps in exact Reference Photo #1 positions:
  const strapWidth = 0.042;
  [0.44, 0.66].forEach((t) => {
    const p1 = new THREE.Vector3(-0.135, 0.415, 0).lerp(new THREE.Vector3(0.395, 0.545, 0), t);
    const dir = new THREE.Vector3(0.530, 0.130, 0).normalize();
    const p2 = p1.clone().addScaledVector(dir, strapWidth);
    const strap = createBiOvalTubeBetween(p1, p2, 0.022, 0.043, mats.MAT_VELCRO_STRAP, 24);
    corduraCenterGroup.add(strap);
  });

  [0.24, 0.68].forEach((t) => {
    const p1 = new THREE.Vector3(0, 0, 0).lerp(new THREE.Vector3(-0.145, 0.435, 0), t);
    const dir = new THREE.Vector3(-0.145, 0.435, 0).normalize();
    const p2 = p1.clone().addScaledVector(dir, strapWidth);
    const strap = createBiOvalTubeBetween(p1, p2, 0.021, 0.042, mats.MAT_VELCRO_STRAP, 24);
    corduraCenterGroup.add(strap);
  });

  batteryRoot.add(corduraCenterGroup);

  // Helper to build detailed Cordura Side Cover with 3D perimeter piping (кедер) + waterproof zipper + puller tab
  function buildDetailedCorduraSideCover(sideSign, name) {
    const group = new THREE.Group();
    group.name = name;

    const coverGeom = new THREE.ExtrudeGeometry(bagShape, {
      depth: 0.004,
      bevelEnabled: true,
      bevelSize: 0.004,
      bevelThickness: 0.003,
      bevelSegments: 4
    });
    coverGeom.translate(0, 0, sideSign > 0 ? 0.037 : -0.041);
    const coverMesh = new THREE.Mesh(coverGeom, mats.MAT_CORDURA_1000D);
    coverMesh.castShadow = true;
    coverMesh.receiveShadow = true;
    group.add(coverMesh);

    const zPiping = sideSign * 0.0415;
    for (let i = 0; i < bagPts.length; i++) {
      const pA = bagPts[i];
      const pB = bagPts[(i + 1) % bagPts.length];
      const pipeSeg = createCylinderBetween(
        new THREE.Vector3(pA.x, pA.y, zPiping),
        new THREE.Vector3(pB.x, pB.y, zPiping),
        0.0032,
        0.0032,
        mats.MAT_VELCRO_STRAP,
        12
      );
      group.add(pipeSeg);

      const cornerSphere = new THREE.Mesh(new THREE.SphereGeometry(0.0034, 12, 12), mats.MAT_VELCRO_STRAP);
      cornerSphere.position.set(pA.x, pA.y, zPiping);
      group.add(cornerSphere);
    }

    const zZip = sideSign * 0.0432;
    const zipRear = new THREE.Vector3(-0.102, 0.376, zZip);
    const zipMid = new THREE.Vector3(0.145, 0.440, zZip);
    const zipFront = new THREE.Vector3(0.352, 0.490, zZip);

    [-0.0022, 0.0022].forEach((dy) => {
      const lip1 = createCylinderBetween(
        new THREE.Vector3(zipRear.x, zipRear.y + dy, zZip),
        new THREE.Vector3(zipMid.x, zipMid.y + dy, zZip),
        0.0016,
        0.0016,
        mats.MAT_VELCRO_STRAP,
        10
      );
      const lip2 = createCylinderBetween(
        new THREE.Vector3(zipMid.x, zipMid.y + dy, zZip),
        new THREE.Vector3(zipFront.x, zipFront.y + dy, zZip),
        0.0016,
        0.0016,
        mats.MAT_VELCRO_STRAP,
        10
      );
      group.add(lip1, lip2);
    });

    const sliderBody = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.008, 0.005), mats.MAT_ANODIZED_BLACK);
    sliderBody.position.set(0.335, 0.485, zZip + sideSign * 0.002);
    sliderBody.rotation.z = 0.25;
    group.add(sliderBody);

    const pullerTab = createCylinderBetween(
      new THREE.Vector3(0.335, 0.485, zZip + sideSign * 0.003),
      new THREE.Vector3(0.318, 0.456, zZip + sideSign * 0.005),
      0.0018,
      0.0032,
      mats.MAT_ANODIZED_BLACK,
      10
    );
    group.add(pullerTab);

    return group;
  }

  const leftCoverGroup = buildDetailedCorduraSideCover(1, 'EXPLODE_CORDURA_LEFT_COVER');
  const rightCoverGroup = buildDetailedCorduraSideCover(-1, 'EXPLODE_CORDURA_RIGHT_COVER');
  batteryRoot.add(leftCoverGroup, rightCoverGroup);

  // 1.3 Semi-Transparent 3-Layer Blue Reinforced PVC Heat-Shrink Sleeve over Honeycomb Core
  const pvcExtrude = new THREE.ExtrudeGeometry(innerCutPath, {
    depth: 0.073,
    bevelEnabled: true,
    bevelSize: 0.002,
    bevelThickness: 0.002
  });
  pvcExtrude.translate(0, 0, -0.0365);
  const pvcSleeveMesh = new THREE.Mesh(pvcExtrude, mats.MAT_PVC_SHRINK);
  pvcSleeveMesh.name = 'PVC_HEATSHRINK_SLEEVE';
  corduraCenterGroup.add(pvcSleeveMesh);

  // 1.4 140 Cylindrical Cells Li-ion 21700 EVE INR21700-50E arranged in a TRUE 12-ROW TRIANGLE
  const { cells, groupMeta, uAxis, zoneBarriers } = generate140CellsLayout();
  const cellsMasterGroup = new THREE.Group();
  cellsMasterGroup.name = 'CELLS_20S7P_140_ARRAY';

  // Green Fishpaper (barley paper) dielectric insulator material + Yellow FR4 fiberglass material
  const matFishpaper = new THREE.MeshPhysicalMaterial({
    color: 0x165b3a,
    roughness: 0.85,
    metalness: 0.02,
    side: THREE.DoubleSide
  });
  const matFR4Barrier = new THREE.MeshPhysicalMaterial({
    color: 0xd99b26,
    roughness: 0.55,
    metalness: 0.05,
    transparent: true,
    opacity: 0.85
  });

  // Add 3D Yellow FR4 Fiberglass Dielectric Barrier Strips between the 4 horizontal zones of the triangle
  zoneBarriers.forEach((bar) => {
    const p1 = new THREE.Vector3(bar.pLeft.x, bar.pLeft.y, 0);
    const p2 = new THREE.Vector3(bar.pRight.x, bar.pRight.y, 0);
    const barLen = p1.distanceTo(p2) + 0.012;
    const barMid = p1.clone().add(p2).multiplyScalar(0.5);
    const barAng = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    const fr4Strip = new THREE.Mesh(new THREE.BoxGeometry(barLen, 0.0016, 0.0725), matFR4Barrier);
    fr4Strip.position.copy(barMid);
    fr4Strip.rotation.z = barAng;
    cellsMasterGroup.add(fr4Strip);
  });

  const seriesGroups = [];
  for (let s = 1; s <= 20; s++) {
    const meta = groupMeta[s - 1];
    const sGroup = new THREE.Group();
    sGroup.name = `BATTERY_SECTION_${s}S`;
    sGroup.userData = {
      seriesId: s,
      code: `${s}S7P`,
      row: meta.row + 1,
      zone: meta.zone,
      polarityOnLeft: meta.polarityOnLeft,
      voltage: 4.20,
      cumVoltage: (s * 4.20).toFixed(1),
      capacityAh: 35.0,
      cellModel: 'EVE INR21700-50E',
      bmsChannel: `CH-${String(s).padStart(2, '0')}`,
      ntcTemp: (26.6 + (s % 5) * 0.2).toFixed(1)
    };
    seriesGroups.push(sGroup);
    cellsMasterGroup.add(sGroup);
  }

  // High-detail geometries for the 140 21700 cells
  const cellRadius = 0.0096;
  const cellBodyGeom = new THREE.CylinderGeometry(cellRadius, cellRadius, 0.0702, 24);
  cellBodyGeom.rotateX(Math.PI / 2);

  // Green Fishpaper positive insulator ring + white nylon gasket + raised 3-lobed CID positive button + negative flat
  const fishpaperRingGeom = new THREE.RingGeometry(0.0052, cellRadius * 0.98, 24);
  const whiteGasketGeom = new THREE.RingGeometry(0.0038, 0.0053, 20);
  const posTermGeom = new THREE.CylinderGeometry(0.0040, 0.0042, 0.0014, 18);
  posTermGeom.rotateX(Math.PI / 2);
  const negTermGeom = new THREE.CylinderGeometry(0.0076, 0.0076, 0.0006, 18);
  negTermGeom.rotateX(Math.PI / 2);

  // Stamped Circular Nickel Contact Pad per cell pole (R = 7.4mm) + 6 Spot-Weld Dimples per pole
  const niPadGeom = new THREE.CylinderGeometry(0.0074, 0.0074, 0.0005, 18);
  niPadGeom.rotateX(Math.PI / 2);
  const weldDotGeom = new THREE.CylinderGeometry(0.00075, 0.00075, 0.0008, 8);
  weldDotGeom.rotateX(Math.PI / 2);
  const solderDomeGeom = new THREE.SphereGeometry(0.0019, 10, 10);

  // Left & Right 3D-Printed PETG Honeycomb Holders (Explodable along ±Z by ±0.14m)
  const holderLeftGroup = new THREE.Group();
  holderLeftGroup.name = 'EXPLODE_PETG_HOLDER_LEFT';
  const holderRightGroup = new THREE.Group();
  holderRightGroup.name = 'EXPLODE_PETG_HOLDER_RIGHT';

  const hexSocketGeom = new THREE.CylinderGeometry(0.0105, 0.0105, 0.012, 6, 1, true);
  hexSocketGeom.rotateX(Math.PI / 2);
  const instancedHolderL = new THREE.InstancedMesh(hexSocketGeom, mats.MAT_PETG_HOLDER, 140);
  const instancedHolderR = new THREE.InstancedMesh(hexSocketGeom, mats.MAT_PETG_HOLDER, 140);
  const dummy = new THREE.Object3D();

  cells.forEach((cell, idx) => {
    const sGroup = seriesGroups[cell.seriesId - 1];
    if (!sGroup.userData.cellMat) {
      sGroup.userData.cellMat = mats.MAT_CELL_EVE50E.clone();
      sGroup.userData.busMat = mats.MAT_COPPER_BUSBAR.clone();
      sGroup.userData.niMat = mats.MAT_NICKEL_STRIP.clone();
    }

    const cellMesh = new THREE.Mesh(cellBodyGeom, sGroup.userData.cellMat);
    cellMesh.position.set(cell.x, cell.y, 0);
    cellMesh.userData = { seriesId: cell.seriesId, cellIndex: cell.cellGlobalIndex };
    sGroup.add(cellMesh);

    const posZ = cell.polarity === 1 ? 0.0352 : -0.0352;
    const negZ = -posZ;

    // Green Fishpaper insulator ring + White nylon crimp gasket + Raised positive button cap
    const fpRing = new THREE.Mesh(fishpaperRingGeom, matFishpaper);
    fpRing.position.set(cell.x, cell.y, posZ);
    fpRing.userData = { seriesId: cell.seriesId };
    sGroup.add(fpRing);

    const wGasket = new THREE.Mesh(whiteGasketGeom, mats.MAT_WHITE_INSULATOR);
    wGasket.position.set(cell.x, cell.y, posZ + Math.sign(posZ) * 0.0001);
    wGasket.userData = { seriesId: cell.seriesId };
    sGroup.add(wGasket);

    const posBtn = new THREE.Mesh(posTermGeom, mats.MAT_STEEL_ROTOR);
    posBtn.position.set(cell.x, cell.y, posZ);
    posBtn.userData = { seriesId: cell.seriesId };
    sGroup.add(posBtn);

    const negFlat = new THREE.Mesh(negTermGeom, mats.MAT_STEEL_ROTOR);
    negFlat.position.set(cell.x, cell.y, negZ);
    negFlat.userData = { seriesId: cell.seriesId };
    sGroup.add(negFlat);

    // Stamped Nickel Circular Pad + 6 Spot-Weld Dimples + Tin-Lead Solder Dome on both +Z and -Z
    [-0.0359, 0.0359].forEach((zSide) => {
      const padMesh = new THREE.Mesh(niPadGeom, sGroup.userData.niMat);
      padMesh.position.set(cell.x, cell.y, zSide);
      padMesh.userData = { seriesId: cell.seriesId };
      sGroup.add(padMesh);

      for (let w = 0; w < 6; w++) {
        const wAng = (w / 6) * Math.PI * 2;
        const dot = new THREE.Mesh(weldDotGeom, sGroup.userData.busMat);
        dot.position.set(
          cell.x + Math.cos(wAng) * 0.0034,
          cell.y + Math.sin(wAng) * 0.0034,
          zSide + Math.sign(zSide) * 0.0003
        );
        dot.userData = { seriesId: cell.seriesId };
        sGroup.add(dot);
      }

      const solderDome = new THREE.Mesh(solderDomeGeom, mats.MAT_STEEL_ROTOR);
      solderDome.scale.set(1.0, 1.0, 0.55);
      solderDome.position.set(cell.x, cell.y, zSide + Math.sign(zSide) * 0.0012);
      solderDome.userData = { seriesId: cell.seriesId };
      sGroup.add(solderDome);
    });

    // Populate Left & Right PETG Honeycomb Hex Sockets
    dummy.position.set(cell.x, cell.y, 0.0292);
    dummy.rotation.set(0, 0, Math.atan2(uAxis.y, uAxis.x));
    dummy.updateMatrix();
    instancedHolderL.setMatrixAt(idx, dummy.matrix);

    dummy.position.set(cell.x, cell.y, -0.0292);
    dummy.updateMatrix();
    instancedHolderR.setMatrixAt(idx, dummy.matrix);
  });

  instancedHolderL.instanceMatrix.needsUpdate = true;
  instancedHolderR.instanceMatrix.needsUpdate = true;
  holderLeftGroup.add(instancedHolderL);
  holderRightGroup.add(instancedHolderR);

  const holderPerimGeomL = new THREE.ExtrudeGeometry(bagRimShape, { depth: 0.010, bevelEnabled: false });
  holderPerimGeomL.scale(0.92, 0.92, 1);
  holderPerimGeomL.translate(0.010, 0.022, 0.024);
  holderLeftGroup.add(new THREE.Mesh(holderPerimGeomL, mats.MAT_PETG_HOLDER));

  const holderPerimGeomR = holderPerimGeomL.clone();
  holderPerimGeomR.translate(0, 0, -0.058);
  holderRightGroup.add(new THREE.Mesh(holderPerimGeomR, mats.MAT_PETG_HOLDER));

  batteryRoot.add(holderLeftGroup, holderRightGroup);

  // 1.5 STAMPED 7P HONEYCOMB NICKEL PLATES + SOLDERED COPPER BUSBAR SPINES + DUAL SERIES BRIDGES (1S -> 20S)
  const labelPlaneGeom = new THREE.PlaneGeometry(0.028, 0.0076);

  for (let s = 1; s <= 20; s++) {
    const sGroup = seriesGroups[s - 1];
    const meta = groupMeta[s - 1];
    const groupCells = meta.cells;

    // 1) Within each 7-cell cluster s, connect all neighbor cell pairs (dist < 34mm) with stamped 8.5mm pure nickel webs
    //    so all 7 cells visually fuse into a solid, unmistakable 7P honeycomb island!
    for (let i = 0; i < groupCells.length; i++) {
      for (let j = i + 1; j < groupCells.length; j++) {
        const cA = groupCells[i];
        const cB = groupCells[j];
        const dist = Math.hypot(cB.x - cA.x, cB.y - cA.y);
        if (dist < 0.0355) {
          const webAngle = Math.atan2(cB.y - cA.y, cB.x - cA.x);
          const midX = (cA.x + cB.x) * 0.5;
          const midY = (cA.y + cB.y) * 0.5;

          [-0.0359, 0.0359].forEach((zSide) => {
            const niWeb = new THREE.Mesh(
              new THREE.BoxGeometry(dist, 0.0086, 0.0005),
              sGroup.userData.niMat
            );
            niWeb.position.set(midX, midY, zSide);
            niWeb.rotation.z = webAngle;
            niWeb.userData = { seriesId: s };
            sGroup.add(niWeb);
          });
        }
      }
    }

    // 2) Soldered Heavy Copper Busbar Spine (Cu 3.0 x 1.5mm) snaking through all 7 cells of cluster s
    for (let i = 0; i < groupCells.length - 1; i++) {
      const cA = groupCells[i];
      const cB = groupCells[i + 1];
      const segLen = Math.hypot(cB.x - cA.x, cB.y - cA.y);
      const segAng = Math.atan2(cB.y - cA.y, cB.x - cA.x);
      const midX = (cA.x + cB.x) * 0.5;
      const midY = (cA.y + cB.y) * 0.5;

      [-0.0368, 0.0368].forEach((zCu) => {
        const cuSeg = new THREE.Mesh(
          new THREE.BoxGeometry(segLen + 0.003, 0.0032, 0.0014),
          sGroup.userData.busMat
        );
        cuSeg.position.set(midX, midY, zCu);
        cuSeg.rotation.z = segAng;
        cuSeg.userData = { seriesId: s };
        sGroup.add(cuSeg);
      });
    }

    // 3) Crisp 3D Section Badge ("1S [B- 0V]", "2S (+)", ..., "20S [B+ 84V]") at the centroid of each 7P cluster
    const badgeAngle = Math.atan2(uAxis.y, uAxis.x);
    [-0.0382, 0.0382].forEach((zBadge) => {
      const sidePolarity = zBadge > 0 ? meta.polarityOnLeft : -meta.polarityOnLeft;
      const badgeMat = createBatterySeriesLabelMaterial(s, sidePolarity);
      const badgeMesh = new THREE.Mesh(labelPlaneGeom, badgeMat);
      badgeMesh.position.set(meta.center.x, meta.center.y, zBadge);
      badgeMesh.rotation.z = badgeAngle;
      if (zBadge < 0) badgeMesh.rotation.y = Math.PI;
      badgeMesh.userData = { seriesId: s };
      sGroup.add(badgeMesh);
    });

    // 4) SERPENTINE SERIES INTERCONNECT BRIDGES: Connect Cluster s -> Cluster (s + 1)
    //    Odd s (1S->2S, 3S->4S, ..., 19S->20S) connects on -Z (Right side)
    //    Even s (2S->3S, 4S->5S, ..., 18S->19S) connects on +Z (Left side)
    if (s < 20) {
      const nextMeta = groupMeta[s];
      const zBridge = s % 2 === 1 ? -0.0365 : 0.0365;

      // Find all cell pairs between cluster s and cluster s+1, sort by distance, and pick the 2 closest disjoint pairs!
      const candidatePairs = [];
      groupCells.forEach((cA, iA) => {
        nextMeta.cells.forEach((cB, iB) => {
          candidatePairs.push({
            cA,
            cB,
            iA,
            iB,
            d: Math.hypot(cB.x - cA.x, cB.y - cA.y)
          });
        });
      });
      candidatePairs.sort((a, b) => a.d - b.d);

      const chosenPairs = [candidatePairs[0]];
      for (let p = 1; p < candidatePairs.length; p++) {
        if (candidatePairs[p].iA !== chosenPairs[0].iA && candidatePairs[p].iB !== chosenPairs[0].iB) {
          chosenPairs.push(candidatePairs[p]);
          break;
        }
      }

      chosenPairs.forEach((pair) => {
        const { cA, cB, d } = pair;
        const midX = (cA.x + cB.x) * 0.5;
        const midY = (cA.y + cB.y) * 0.5;
        const brAngle = Math.atan2(cB.y - cA.y, cB.x - cA.x);

        // Wide Stamped Series Nickel Bridge (10mm wide)
        const niBridge = new THREE.Mesh(
          new THREE.BoxGeometry(d + 0.012, 0.010, 0.0008),
          sGroup.userData.niMat
        );
        niBridge.position.set(midX, midY, zBridge);
        niBridge.rotation.z = brAngle;
        niBridge.userData = { seriesId: s };
        sGroup.add(niBridge);

        // Soldered Heavy Copper Series Busbar Bridge (4.2mm wide) on top of the nickel bridge
        const cuBridge = new THREE.Mesh(
          new THREE.BoxGeometry(d + 0.008, 0.0042, 0.0018),
          sGroup.userData.busMat
        );
        cuBridge.position.set(midX, midY, zBridge + Math.sign(zBridge) * 0.0010);
        cuBridge.rotation.z = brAngle;
        cuBridge.userData = { seriesId: s };
        sGroup.add(cuBridge);
      });
    }
  }

  // Main B- (0V at 1S on +Z) and Main B+ (84V at 20S on +Z) Heavy Copper Terminal Collector Bars
  const group1S = seriesGroups[0];
  const cell1S_0 = groupMeta[0].cells[0];
  const bMinusCollector = new THREE.Mesh(
    new THREE.BoxGeometry(0.022, 0.012, 0.003),
    mats.MAT_COPPER_BUSBAR
  );
  bMinusCollector.position.set(cell1S_0.x - 0.006, cell1S_0.y + 0.005, 0.0375);
  bMinusCollector.rotation.z = 0.84;
  group1S.add(bMinusCollector);

  const group20S = seriesGroups[19];
  const cell20S_0 = groupMeta[19].cells[groupMeta[19].cells.length - 1];
  const bPlusCollector = new THREE.Mesh(
    new THREE.BoxGeometry(0.022, 0.012, 0.003),
    mats.MAT_COPPER_BUSBAR
  );
  bPlusCollector.position.set(cell20S_0.x, cell20S_0.y + 0.008, 0.0375);
  bPlusCollector.rotation.z = 0.25;
  group20S.add(bPlusCollector);

  batteryRoot.add(cellsMasterGroup);

  // 1.6 Bisida BMS 20S 120A Li-ion in Finned Aluminum Heatsink in upper channel under Toptube
  // + Full Power Cable Harness (B-, C-, B+ 84V) + 21 Balance Sense Leads (B0..B20) + XT90-S Anti-Spark
  const bmsGroup = new THREE.Group();
  bmsGroup.name = 'EXPLODE_BISIDA_BMS_120A';

  const toptubeAngle = Math.atan2(0.545 - 0.415, 0.395 - (-0.135));
  const bmsPos = new THREE.Vector3(0.155, 0.448, 0);
  const bmsCore = new THREE.Group();
  bmsCore.position.copy(bmsPos);
  bmsCore.rotation.z = toptubeAngle;

  // Finned Aluminum Heatsink Body (140 x 18 x 62 mm)
  const bmsPlate = new THREE.Mesh(new THREE.BoxGeometry(0.140, 0.016, 0.062), mats.MAT_ANODIZED_BLACK);
  bmsCore.add(bmsPlate);

  for (let f = -3; f <= 3; f++) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.136, 0.0045, 0.003), mats.MAT_RED_ANODIZED);
    fin.position.set(0, 0.010, f * 0.0082);
    bmsCore.add(fin);
  }

  // White 21-pin JST-XH Balance Connector Header on BMS front edge
  const jstHeader = new THREE.Mesh(new THREE.BoxGeometry(0.086, 0.0065, 0.0085), mats.MAT_WHITE_INSULATOR);
  jstHeader.position.set(0.008, -0.007, 0.032);
  bmsCore.add(jstHeader);

  // Solder pads B- and C- on BMS left end
  const padBMinus = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.004, 0.020), mats.MAT_COPPER_BUSBAR);
  padBMinus.position.set(-0.062, -0.007, 0.015);
  const padCMinus = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.004, 0.020), mats.MAT_COPPER_BUSBAR);
  padCMinus.position.set(-0.062, -0.007, -0.015);
  bmsCore.add(padBMinus, padCMinus);

  bmsGroup.add(bmsCore);

  // Upper-Rear pocket near Seat Tube / Toptube corner: Amass XT90-S Anti-Spark Yellow Connector
  const xt90Pos = new THREE.Vector3(-0.048, 0.394, 0.015);
  const xt90Housing = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.022, 0.014), mats.MAT_XT90_YELLOW);
  xt90Housing.position.copy(xt90Pos);
  const xt90AntiSparkBand = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.023, 0.015), mats.MAT_ANODIZED_BLACK);
  xt90AntiSparkBand.position.set(xt90Pos.x + 0.009, xt90Pos.y, xt90Pos.z);
  bmsGroup.add(xt90Housing, xt90AntiSparkBand);

  // Heavy 6AWG Power Cables showing exact electrical connections:
  // 1) B- (Blue 6AWG): from 1S (-) Collector at bottom-rear up along Seat Tube channel to BMS B- pad
  const pBMinusStart = new THREE.Vector3(cell1S_0.x - 0.008, cell1S_0.y + 0.005, 0.037);
  const pBMinusMid = new THREE.Vector3(-0.098, 0.365, 0.034);
  const pBMinusEnd = new THREE.Vector3(0.092, 0.430, 0.016);
  bmsGroup.add(
    createCylinderBetween(pBMinusStart, pBMinusMid, 0.0036, 0.0036, mats.MAT_BLUE_ANODIZED, 12),
    createCylinderBetween(pBMinusMid, pBMinusEnd, 0.0036, 0.0036, mats.MAT_BLUE_ANODIZED, 12)
  );

  // 2) C- (Black 6AWG): from BMS C- pad to Amass XT90-S Negative pin
  const pCMinusStart = new THREE.Vector3(0.092, 0.430, -0.015);
  const pCMinusEnd = new THREE.Vector3(xt90Pos.x + 0.010, xt90Pos.y - 0.005, xt90Pos.z);
  bmsGroup.add(
    createCylinderBetween(pCMinusStart, pCMinusEnd, 0.0036, 0.0036, mats.MAT_ANODIZED_BLACK, 12)
  );

  // 3) B+ 84V (Red 6AWG): from 20S (+) Collector at top apex directly to Amass XT90-S Positive pin
  const pBPlusStart = new THREE.Vector3(cell20S_0.x, cell20S_0.y + 0.008, 0.037);
  const pBPlusEnd = new THREE.Vector3(xt90Pos.x - 0.010, xt90Pos.y + 0.005, xt90Pos.z);
  bmsGroup.add(
    createCylinderBetween(pBPlusStart, pBPlusEnd, 0.0038, 0.0038, mats.MAT_RED_ANODIZED, 12)
  );

  // 4) 21 Balance Sense Wires (B0..B20) routed from every single series section 1S..20S to BMS JST header!
  for (let s = 1; s <= 20; s++) {
    const meta = groupMeta[s - 1];
    const t = s / 20;
    const jstPinPos = new THREE.Vector3(
      bmsPos.x - 0.034 + t * 0.080,
      bmsPos.y - 0.010 + t * 0.019,
      s % 2 === 1 ? -0.034 : 0.034
    );
    const tapZ = s % 2 === 1 ? -0.0368 : 0.0368;
    const tapPos = new THREE.Vector3(meta.center.x, meta.center.y, tapZ);

    const wireMat = s === 20 ? mats.MAT_XT90_YELLOW : mats.MAT_RED_ANODIZED;
    const senseWire = createCylinderBetween(jstPinPos, tapPos, 0.00075, 0.00075, wireMat, 6);
    bmsGroup.add(senseWire);

    const tapDot = new THREE.Mesh(new THREE.SphereGeometry(0.0016, 8, 8), mats.MAT_STEEL_ROTOR);
    tapDot.position.copy(tapPos);
    bmsGroup.add(tapDot);
  }

  // B0 (Black balance ground lead) to 1S (-)
  bmsGroup.add(
    createCylinderBetween(
      new THREE.Vector3(bmsPos.x - 0.038, bmsPos.y - 0.012, 0.034),
      pBMinusStart,
      0.00085,
      0.00085,
      mats.MAT_ANODIZED_BLACK,
      6
    )
  );

  // Teardrop NTC Thermistor glued into center of honeycomb
  const ntcStart = new THREE.Vector3(bmsPos.x + 0.01, bmsPos.y - 0.01, 0);
  const ntcEnd = new THREE.Vector3(0.115, 0.285, 0);
  const ntcWire = createCylinderBetween(ntcStart, ntcEnd, 0.0011, 0.0011, mats.MAT_ANODIZED_BLACK, 8);
  const ntcBead = new THREE.Mesh(new THREE.SphereGeometry(0.0032, 12, 12), mats.MAT_ANODIZED_BLACK);
  ntcBead.position.copy(ntcEnd);
  bmsGroup.add(ntcWire, ntcBead);

  batteryRoot.add(bmsGroup);

  return {
    batteryRoot,
    leftCoverGroup,
    rightCoverGroup,
    holderLeftGroup,
    holderRightGroup,
    bmsGroup,
    seriesGroups,
    corduraCenterGroup,
    pvcSleeveMesh
  };
}

/**
 * 2. NODE 6: UNDER-DOWNTUBE MODULE (60A FINNED CONTROLLER + STEPPED 3D-PRINTED PETG BOX WITH 105 dB HORN)
 * Strictly outside & underneath the Downtube (1:1 as on Reference Photo #1 & #2)
 */
export function buildUnderTubeModuleNode(mats) {
  const underTubeRoot = new THREE.Group();
  underTubeRoot.name = 'NODE_06_UNDER_DOWNTUBE_ESC_AND_BOX';

  const pBB = new THREE.Vector3(0.015, 0.015, 0);
  const pHT = new THREE.Vector3(0.415, 0.465, 0);
  const downDir = pHT.clone().sub(pBB).normalize();
  const downAngle = Math.atan2(downDir.y, downDir.x); // ~48.37 deg
  const downNormalOut = new THREE.Vector3(downDir.y, -downDir.x, 0); // outward normal below downtube

  // 2.1 Explodable Group: Sine-Wave Controller 72V 60A (18 MOSFET) + 3D Box Outer Lid
  const controllerAndCoverGroup = new THREE.Group();
  controllerAndCoverGroup.name = 'EXPLODE_CONTROLLER_60A_AND_COVER';

  // Upper half under Downtube: Long Black Anodized Finned Controller (length 235mm, width 84mm, height 48mm)
  const ctrlCenter = pBB.clone()
    .addScaledVector(downDir, 0.415)
    .addScaledVector(downNormalOut, 0.044);

  const ctrlGroup = new THREE.Group();
  ctrlGroup.position.copy(ctrlCenter);
  ctrlGroup.rotation.z = downAngle;

  // Main extruded aluminum core
  const ctrlCore = new THREE.Mesh(new THREE.BoxGeometry(0.235, 0.042, 0.082), mats.MAT_ANODIZED_BLACK);
  ctrlCore.castShadow = true;
  ctrlGroup.add(ctrlCore);

  // Longitudinal wind-tunnel cooling ribs on sides and bottom (1:1 as on Reference Photo #1)
  for (let r = -3; r <= 3; r++) {
    const bottomRib = new THREE.Mesh(new THREE.BoxGeometry(0.228, 0.007, 0.004), mats.MAT_ANODIZED_BLACK);
    bottomRib.position.set(0, -0.023, r * 0.011);
    ctrlGroup.add(bottomRib);
  }
  [-0.042, 0.042].forEach((sideZ) => {
    for (let s = -2; s <= 2; s++) {
      const sideRib = new THREE.Mesh(new THREE.BoxGeometry(0.228, 0.0035, 0.004), mats.MAT_ANODIZED_BLACK);
      sideRib.position.set(0, s * 0.007, sideZ);
      ctrlGroup.add(sideRib);
    }
  });

  // Top & bottom cast end-caps with 4 stainless M3 Allen bolts (visible in Reference Photo #2!)
  [-0.119, 0.119].forEach((endX) => {
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.046, 0.086), mats.MAT_FRAME_RAL9005);
    cap.position.set(endX, 0, 0);
    ctrlGroup.add(cap);
  });
  [-0.08, 0.0, 0.08].forEach((bx) => {
    [-0.0435, 0.0435].forEach((bz) => {
      const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.0022, 0.0022, 0.003, 10), mats.MAT_STEEL_ROTOR);
      screw.position.set(bx, 0.012, bz);
      screw.rotation.x = Math.PI / 2;
      ctrlGroup.add(screw);
    });
  });

  controllerAndCoverGroup.add(ctrlGroup);

  // 2 Wide 45mm Black Straps holding the 60A Controller to the Downtube (1:1 as on Photo #1)
  [0.33, 0.50].forEach((t) => {
    const pTube = pBB.clone().lerp(pHT, t);
    const pWrapCenter = pTube.clone().addScaledVector(downNormalOut, 0.020);
    const pWrapEnd = pWrapCenter.clone().addScaledVector(downDir, 0.036);
    const strap = createBiOvalTubeBetween(pWrapCenter, pWrapEnd, 0.046, 0.046, mats.MAT_VELCRO_STRAP, 24);
    underTubeRoot.add(strap);
  });

  // 2.2 Lower Stepped 3D-Printed PETG Wiring Enclosure (1:1 as on Reference Photo #1 & #2)
  // Abuts the bottom endcap of the controller with a stepped flange collar and extends to the BB
  const boxCenter = pBB.clone()
    .addScaledVector(downDir, 0.165)
    .addScaledVector(downNormalOut, 0.048);

  // Fixed inner base of the 3D PETG box (stays on frame during Exploded View to reveal internals!)
  const boxBaseGroup = new THREE.Group();
  boxBaseGroup.name = 'PETG_WIRING_BOX_INTERNAL_BASE';
  boxBaseGroup.position.copy(boxCenter);
  boxBaseGroup.rotation.z = downAngle;

  const baseTray = new THREE.Mesh(new THREE.BoxGeometry(0.245, 0.018, 0.084), mats.MAT_PETG_HOLDER);
  baseTray.position.set(0, 0.018, 0);
  boxBaseGroup.add(baseTray);

  // Stepped upper collar overlapping the lower end of the 60A controller (1:1 as on Photo #1 & #2!)
  const steppedCollar = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.062, 0.092), mats.MAT_PETG_HOLDER);
  steppedCollar.position.set(0.118, -0.002, 0);
  boxBaseGroup.add(steppedCollar);

  // Strap around lower 3D PETG box & Downtube
  const pBoxStrapTube = pBB.clone().lerp(pHT, 0.16);
  const pBoxStrapCenter = pBoxStrapTube.clone().addScaledVector(downNormalOut, 0.022);
  const pBoxStrapEnd = pBoxStrapCenter.clone().addScaledVector(downDir, 0.036);
  underTubeRoot.add(
    createBiOvalTubeBetween(pBoxStrapCenter, pBoxStrapEnd, 0.048, 0.047, mats.MAT_VELCRO_STRAP, 24)
  );

  // INTERNAL COMPONENTS INSIDE 3D PETG BOX:
  // 1) DC-DC Buck Converter (36V-120V -> 12V 10A)
  const dcdcBody = new THREE.Mesh(new THREE.BoxGeometry(0.068, 0.022, 0.056), mats.MAT_ANODIZED_BLACK);
  dcdcBody.position.set(0.058, 0.001, 0);
  boxBaseGroup.add(dcdcBody);
  const dcdcSticker = new THREE.Mesh(new THREE.BoxGeometry(0.046, 0.002, 0.036), mats.MAT_BLUE_ANODIZED);
  dcdcSticker.position.set(0.058, -0.011, 0);
  boxBaseGroup.add(dcdcSticker);

  // 2) High-Current 3-Phase Ceramic Terminal Block (Yellow/Green/Blue phase nuts)
  const phaseBlock = new THREE.Mesh(new THREE.BoxGeometry(0.046, 0.020, 0.048), mats.MAT_XT90_YELLOW);
  phaseBlock.position.set(-0.012, 0.002, 0);
  boxBaseGroup.add(phaseBlock);
  [-0.014, 0, 0.014].forEach((pz, idx) => {
    const studMat = idx === 0 ? mats.MAT_XT90_YELLOW : idx === 1 ? mats.MAT_BLUE_ANODIZED : mats.MAT_COPPER_BUSBAR;
    const nut = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0045, 0.008, 6), studMat);
    nut.position.set(-0.012, -0.010, pz);
    boxBaseGroup.add(nut);
  });

  // 3) Hidden 105 dB (12V) Motorcycle Disc Horn on spring bracket opposite acoustic gills
  const hornDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.033, 0.033, 0.022, 24), mats.MAT_ANODIZED_BLACK);
  hornDisc.position.set(-0.078, -0.002, 0);
  boxBaseGroup.add(hornDisc);
  const hornCenterRing = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.024, 16), mats.MAT_RED_ANODIZED);
  hornCenterRing.position.set(-0.078, -0.002, 0);
  boxBaseGroup.add(hornCenterRing);

  underTubeRoot.add(boxBaseGroup);

  // Outer Faceted & Ribbed 3D-Printed PETG Box Cover with Acoustic Gills (explodes with controller)
  const boxLidGroup = new THREE.Group();
  boxLidGroup.position.copy(boxCenter);
  boxLidGroup.rotation.z = downAngle;

  const lidShell = new THREE.Mesh(new THREE.BoxGeometry(0.245, 0.044, 0.088), mats.MAT_PETG_HOLDER);
  lidShell.position.set(0, -0.008, 0);
  lidShell.castShadow = true;
  boxLidGroup.add(lidShell);

  // Longitudinal stiffening ribs on the sides of the 3D-printed box (1:1 as on Photo #1)
  [-0.045, 0.045].forEach((sz) => {
    for (let r = -2; r <= 2; r++) {
      const rib = new THREE.Mesh(new THREE.BoxGeometry(0.232, 0.003, 0.003), mats.MAT_FRAME_RAL9005);
      rib.position.set(0, -0.008 + r * 0.007, sz);
      boxLidGroup.add(rib);
    }
  });

  // Rearward-slanted acoustic gill louvers ("чешуя/жабры") opposite the 105 dB horn
  for (let g = 0; g < 6; g++) {
    const gill = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.018, 0.091), mats.MAT_ANODIZED_BLACK);
    gill.position.set(-0.098 + g * 0.010, -0.018, 0);
    gill.rotation.z = -0.45;
    boxLidGroup.add(gill);
  }

  controllerAndCoverGroup.add(boxLidGroup);
  underTubeRoot.add(controllerAndCoverGroup);

  return {
    underTubeRoot,
    controllerAndCoverGroup,
    controllerAndLidGroup: controllerAndCoverGroup,
    boxBaseGroup
  };
}

/**
 * 3. NODE 7: LONG MOTO SADDLE (SUR-RON / PITBIKE 530 MM) + WELDED STEEL SUBFRAME
 * WITH 2-BOLT FRONT BRACKET + SEPARATE REAR TAIL FENDER WITH LED BRAKE LIGHT (1:1 AS ON PHOTO #1)
 */
export function buildMotoSaddleAndSubframeNode(mats) {
  const saddleRoot = new THREE.Group();
  saddleRoot.name = 'NODE_07_MOTO_SADDLE_AND_SUBFRAME';

  // 3.1 Welded Steel Subframe (18mm black matte steel tubes + 2-bolt front gusset bracket, 1:1 as on Photo #1)
  const subframeGroup = new THREE.Group();
  subframeGroup.name = 'EXPLODE_STEEL_SUBFRAME';

  // Front 2-bolt mounting bracket at Seat Tube top (-0.145, 0.435, 0) visible in Reference Photo #1
  const bracketGeom = new THREE.BoxGeometry(0.048, 0.042, 0.044);
  const frontBracket = new THREE.Mesh(bracketGeom, mats.MAT_FRAME_RAL9005);
  frontBracket.position.set(-0.152, 0.432, 0);
  frontBracket.rotation.z = -0.28;
  subframeGroup.add(frontBracket);

  // Two silver Allen bolts M6 on the side of the front subframe bracket (1:1 as on Photo #1!)
  [
    [-0.146, 0.440],
    [-0.160, 0.422]
  ].forEach(([bx, by]) => {
    [-0.023, 0.023].forEach((bz) => {
      const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.0042, 0.0042, 0.004, 12), mats.MAT_STEEL_ROTOR);
      bolt.position.set(bx, by, bz);
      bolt.rotation.x = Math.PI / 2;
      subframeGroup.add(bolt);
    });
  });

  // Left & Right upper subframe rails under the saddle pan + diagonal struts to Seatstays
  [-1, 1].forEach((side) => {
    const zFront = side * 0.020;
    const zRear = side * 0.036;
    const zStay = side * 0.042;

    // Upper rail under saddle base
    const upperRail = createCylinderBetween(
      new THREE.Vector3(-0.145, 0.445, zFront),
      new THREE.Vector3(-0.485, 0.565, zRear),
      0.009,
      0.008,
      mats.MAT_FRAME_RAL9005,
      16
    );
    subframeGroup.add(upperRail);

    // Main diagonal support strut from Seatstay (-0.275, 0.250, zStay) up to Rear Subframe (-0.435, 0.540, zRear)
    // and front-diagonal brace from Seat Tube bracket (-0.155, 0.422, zFront) to Seatstay (-0.245, 0.285, zStay)
    const rearStrut = createCylinderBetween(
      new THREE.Vector3(-0.430, 0.538, zRear),
      new THREE.Vector3(-0.275, 0.252, zStay),
      0.0085,
      0.0085,
      mats.MAT_FRAME_RAL9005,
      16
    );
    const frontBrace = createCylinderBetween(
      new THREE.Vector3(-0.155, 0.422, zFront),
      new THREE.Vector3(-0.235, 0.295, zStay),
      0.008,
      0.008,
      mats.MAT_FRAME_RAL9005,
      16
    );
    subframeGroup.add(rearStrut, frontBrace);

    // M6 Stainless Bolt at Seatstay junction
    const stayBolt = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0045, 0.006, 12), mats.MAT_STEEL_ROTOR);
    stayBolt.position.set(-0.275, 0.252, zStay + side * 0.005);
    stayBolt.rotation.x = Math.PI / 2;
    subframeGroup.add(stayBolt);
  });

  // Cross-bridges between left and right subframe rails
  [-0.26, -0.42].forEach((cx, idx) => {
    const cy = idx === 0 ? 0.482 : 0.538;
    const bridge = createCylinderBetween(
      new THREE.Vector3(cx, cy, -0.032),
      new THREE.Vector3(cx, cy, 0.032),
      0.007,
      0.007,
      mats.MAT_FRAME_RAL9005,
      12
    );
    subframeGroup.add(bridge);
  });

  saddleRoot.add(subframeGroup);

  // 3.2 Explodable Moto-Saddle (530mm length) + Separate Rear Pitbike Tail Fender + LED Brake Light
  const saddleAndFenderGroup = new THREE.Group();
  saddleAndFenderGroup.name = 'EXPLODE_MOTO_SADDLE_AND_FENDER';

  // Exact Side Profile of the 530mm Sur-Ron / Pitbike Saddle matching Reference Photo #1:
  // Front nose starts over Toptube at x = +0.015 (flush behind Toptube straps),
  // dips into an ergonomic rider dish at x = -0.18, and sweeps up to the rear tail at x = -0.515!
  const saddleSideShape = new THREE.Shape();
  saddleSideShape.moveTo(0.015, 0.482); // Front nose tip over toptube
  saddleSideShape.quadraticCurveTo(-0.060, 0.506, -0.155, 0.504); // Concave rider dish (75-80mm cushion)
  saddleSideShape.bezierCurveTo(-0.265, 0.502, -0.385, 0.555, -0.505, 0.598); // Upward swept moto tail
  saddleSideShape.quadraticCurveTo(-0.522, 0.598, -0.518, 0.568); // Rounded rear tail tip
  saddleSideShape.quadraticCurveTo(-0.385, 0.522, -0.220, 0.448); // Lower molded plastic base pan
  // U-channel slot (40 x 70 mm) seating over Seat Tube top (-0.145, 0.435)
  saddleSideShape.lineTo(-0.175, 0.442);
  saddleSideShape.lineTo(-0.115, 0.442);
  saddleSideShape.quadraticCurveTo(-0.045, 0.456, 0.015, 0.472);
  saddleSideShape.closePath();

  const saddleGeom = new THREE.ExtrudeGeometry(saddleSideShape, {
    depth: 0.132,
    bevelEnabled: true,
    bevelSize: 0.016,
    bevelThickness: 0.018,
    bevelSegments: 6
  });
  saddleGeom.translate(0, 0, -0.066);

  // Taper width along X (narrower 76mm nose at front, wide 146mm anatomical middle, sleek 82mm tail)
  const sPos = saddleGeom.attributes.position;
  for (let i = 0; i < sPos.count; i++) {
    const vx = sPos.getX(i);
    const vy = sPos.getY(i);
    const vz = sPos.getZ(i);
    // Normalized longitudinal coordinate t: 0 at nose (+0.015) -> 1 at tail (-0.520)
    const t = Math.max(0, Math.min(1, (0.015 - vx) / 0.535));
    const widthProfile = 0.54 + 0.52 * Math.sin(Math.pow(t, 0.75) * Math.PI * 0.88);
    // Round the top crown of the cushion across Z
    const archDrop = (vz * vz) * 1.6;
    sPos.setZ(i, vz * widthProfile);
    sPos.setY(i, vy - archDrop);
  }
  saddleGeom.computeVertexNormals();

  const saddleMesh = new THREE.Mesh(saddleGeom, mats.MAT_MOTO_VINYL);
  saddleMesh.castShadow = true;
  saddleMesh.receiveShadow = true;
  saddleAndFenderGroup.add(saddleMesh);

  // Separate Rear Pitbike / Sur-Ron Plastic Tail Fender extending from under the saddle tail
  // (x = -0.475 to -0.715, y = 0.560 to 0.618 — 1:1 as on Reference Photo #1!)
  const fenderShape = new THREE.Shape();
  fenderShape.moveTo(-0.465, 0.562);
  fenderShape.quadraticCurveTo(-0.585, 0.596, -0.710, 0.618); // Upper sleek line
  fenderShape.lineTo(-0.715, 0.608);                          // Sharp rear tip
  fenderShape.quadraticCurveTo(-0.595, 0.570, -0.475, 0.542); // Tapered lower edge
  fenderShape.closePath();

  const tailFenderGeom = new THREE.ExtrudeGeometry(fenderShape, {
    depth: 0.082,
    bevelEnabled: true,
    bevelSize: 0.004,
    bevelThickness: 0.004,
    bevelSegments: 3
  });
  tailFenderGeom.translate(0, 0, -0.041);

  // Taper rear fender toward the pointed tail tip
  const fPos = tailFenderGeom.attributes.position;
  for (let i = 0; i < fPos.count; i++) {
    const fx = fPos.getX(i);
    const fz = fPos.getZ(i);
    const ft = Math.max(0, Math.min(1, (-0.465 - fx) / 0.250));
    fPos.setZ(i, fz * (1.0 - ft * 0.42));
  }
  tailFenderGeom.computeVertexNormals();

  const rearFenderMesh = new THREE.Mesh(tailFenderGeom, mats.MAT_ANODIZED_BLACK);
  rearFenderMesh.castShadow = true;
  saddleAndFenderGroup.add(rearFenderMesh);

  // Integrated Red LED Brake Light tucked under the junction of the saddle tail & rear fender
  const brakeLightHousing = new THREE.Mesh(
    new THREE.BoxGeometry(0.022, 0.016, 0.064),
    mats.MAT_ANODIZED_BLACK
  );
  brakeLightHousing.position.set(-0.525, 0.556, 0);
  brakeLightHousing.rotation.z = -0.22;
  saddleAndFenderGroup.add(brakeLightHousing);

  const brakeLightLens = new THREE.Mesh(
    new THREE.BoxGeometry(0.008, 0.012, 0.056),
    mats.MAT_BRAKE_LED
  );
  brakeLightLens.name = 'REAR_LED_BRAKE_LIGHT';
  brakeLightLens.position.set(-0.535, 0.554, 0);
  brakeLightLens.rotation.z = -0.22;
  saddleAndFenderGroup.add(brakeLightLens);

  saddleRoot.add(saddleAndFenderGroup);

  return {
    saddleSystemRoot: saddleRoot,
    saddleRoot,
    subframeGroup,
    saddleAndFenderGroup,
    brakeLightLens
  };
}
