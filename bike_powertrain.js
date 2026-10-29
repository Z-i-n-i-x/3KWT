// ============================================================================
// STEALTH SUR-RON 72V 3000W — NODE 5 (CORDURA 1000D BAG + 20S7P 140x EVE 50E
// 5-TIER 6+5+4+3+2 HEXAGONAL TRIANGLE BATTERY + BISIDA 120A BMS),
// NODE 6 (60A FINNED CONTROLLER + STEPPED 3D PETG WIRING BOX WITH 105 dB HORN),
// NODE 7 (LOW-PROFILE SUR-RON MOTO SADDLE + COMPACT 2-BOLT SUBFRAME + TAIL FENDER)
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
 * arranged in a PERFECT 10-ROW, 5-TIER HEXAGONAL TRIANGLE (6 + 5 + 4 + 3 + 2 = 20S):
 *
 * - Tier 1 (Rows 1 & 2, along Downtube): 22 + 20 = 42 cells -> 6 blocks of 7P (1S -> 6S, Rear to Front)
 * - Tier 2 (Rows 3 & 4):                 18 + 17 = 35 cells -> 5 blocks of 7P (7S -> 11S, Front to Rear)
 * - Tier 3 (Rows 5 & 6):                 15 + 13 = 28 cells -> 4 blocks of 7P (12S -> 15S, Rear to Front)
 * - Tier 4 (Rows 7 & 8):                 11 + 10 = 21 cells -> 3 blocks of 7P (16S -> 18S, Front to Rear)
 * - Tier 5 (Rows 9 & 10, top apex):       8 +  6 = 14 cells -> 2 blocks of 7P (19S -> 20S, Rear to Front)
 *   TOTAL = 42 + 35 + 28 + 21 + 14 = 140 CELLS (20S7P)!
 *
 * Every single 7P block (1S..20S) is a uniform 2-row honeycomb trapezoid (4 cells on one row +
 * 3 cells nested in the honeycomb valleys of the paired row = 7 contiguous cells), separated
 * horizontally by 4 yellow FR4 fiberglass dielectric barrier strips!
 */
export function generate140CellsLayout() {
  // Three vertices of the 140-cell triangle filling the inner frame triangle
  const T_A = new THREE.Vector2(0.016, 0.050);  // Bottom vertex near BB
  const T_B = new THREE.Vector2(0.374, 0.466);  // Front-top vertex near Head Tube
  const T_C = new THREE.Vector2(-0.104, 0.376); // Rear-top apex near Seat Tube / Toptube

  const uAxis = T_B.clone().sub(T_A).normalize();
  const vAxis = new THREE.Vector2(-uAxis.y, uAxis.x);

  // 10 triangular honeycomb rows (5 double-row tiers)
  const rowCounts = [22, 20, 18, 17, 15, 13, 11, 10, 8, 6]; // Sum = 140 cells
  const sVals = [0.000, 0.082, 0.184, 0.264, 0.366, 0.446, 0.548, 0.626, 0.728, 0.806];

  // Exact 4+3 / 3+4 contiguous slice definitions for each of the 5 double-row tiers
  const tierDefs = [
    {
      tier: 1,
      rowA: 0,
      rowB: 1,
      reverse: false, // Left -> Right (Rear -> Front: 1S..6S)
      slicesA: [4, 3, 4, 4, 3, 4], // sum = 22
      slicesB: [3, 4, 3, 3, 4, 3]  // sum = 20
    },
    {
      tier: 2,
      rowA: 2,
      rowB: 3,
      reverse: true,  // Right -> Left (Front -> Rear: 7S..11S)
      slicesA: [4, 3, 4, 3, 4],    // sum = 18
      slicesB: [3, 4, 3, 4, 3]     // sum = 17
    },
    {
      tier: 3,
      rowA: 4,
      rowB: 5,
      reverse: false, // Left -> Right (Rear -> Front: 12S..15S)
      slicesA: [4, 4, 3, 4],       // sum = 15
      slicesB: [3, 3, 4, 3]        // sum = 13
    },
    {
      tier: 4,
      rowA: 6,
      rowB: 7,
      reverse: true,  // Right -> Left (Front -> Rear: 16S..18S)
      slicesA: [4, 3, 4],          // sum = 11
      slicesB: [3, 4, 3]           // sum = 10
    },
    {
      tier: 5,
      rowA: 8,
      rowB: 9,
      reverse: false, // Left -> Right (Rear -> Front: 19S..20S)
      slicesA: [4, 4],             // sum = 8
      slicesB: [3, 3]              // sum = 6
    }
  ];

  // 1. Generate cell coordinates along each of the 10 triangular rows
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
      rowCells.push({
        row: r + 1,
        col: c + 1,
        t,
        x: lx + t * (rx - lx),
        y: ly + t * (ry - ly)
      });
    }
    rows.push(rowCells);
  }

  // 2. Build the 20 contiguous 7P honeycomb blocks (1S..20S) across the 5 tiers
  const cells = [];
  const groupMeta = [];
  let seriesCounter = 0;

  tierDefs.forEach((tDef) => {
    const arrA = tDef.reverse ? [...rows[tDef.rowA]].reverse() : [...rows[tDef.rowA]];
    const arrB = tDef.reverse ? [...rows[tDef.rowB]].reverse() : [...rows[tDef.rowB]];

    let cursorA = 0;
    let cursorB = 0;

    for (let bIdx = 0; bIdx < tDef.slicesA.length; bIdx++) {
      seriesCounter++;
      const currentSeriesId = seriesCounter; // 1..20
      const polarityOnLeft = currentSeriesId % 2 === 1 ? -1 : 1;

      const countA = tDef.slicesA[bIdx];
      const countB = tDef.slicesB[bIdx];
      const subRowA = arrA.slice(cursorA, cursorA + countA);
      const subRowB = arrB.slice(cursorB, cursorB + countB);
      cursorA += countA;
      cursorB += countB;

      // Sort each sub-row consistently from Rear-Left to Front-Right for clean busbar geometry
      subRowA.sort((a, b) => a.col - b.col);
      subRowB.sort((a, b) => a.col - b.col);

      const rawCluster = [...subRowA, ...subRowB];
      const groupCells = rawCluster.map((rc, pIdx) => {
        const cellObj = {
          cellGlobalIndex: cells.length + 1,
          row: rc.row,
          col: rc.col,
          zone: tDef.tier,
          seriesId: currentSeriesId,
          parallelIndex: pIdx + 1,
          polarity: polarityOnLeft,
          subRow: pIdx < subRowA.length ? 0 : 1,
          x: rc.x,
          y: rc.y
        };
        cells.push(cellObj);
        return cellObj;
      });

      const cellsRowA = groupCells.filter((c) => c.subRow === 0);
      const cellsRowB = groupCells.filter((c) => c.subRow === 1);

      const cx = groupCells.reduce((acc, item) => acc + item.x, 0) / 7;
      const cy = groupCells.reduce((acc, item) => acc + item.y, 0) / 7;

      groupMeta.push({
        seriesId: currentSeriesId,
        zone: tDef.tier,
        reverse: tDef.reverse,
        row: tDef.rowA,
        polarityOnLeft,
        cells: groupCells,
        cellsRowA,
        cellsRowB,
        center: new THREE.Vector2(cx, cy)
      });
    }
  });

  // 4 Yellow FR4 Fiberglass Dielectric Barrier Strips between the 5 double-row tiers
  const zoneBarriers = [0.133, 0.315, 0.497, 0.677].map((sBar) => ({
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

  // Exact Inner Triangle Contour matching Reference Photo #3 & #1
  const bagPts = [
    new THREE.Vector2(0.008, 0.028),  // Bottom vertex at BB
    new THREE.Vector2(0.392, 0.456),  // Lower head tube corner
    new THREE.Vector2(0.372, 0.528),  // Upper head tube corner (70mm front bridge)
    new THREE.Vector2(-0.122, 0.402)  // Seat tube upper corner under saddle nose
  ];

  const bagShape = createRoundedPolygonShape(bagPts, 0.018);

  // 1.1 Central Cordura Base + EVA 15mm Damper Cocoon + Authentic Velcro Straps
  const corduraCenterGroup = new THREE.Group();
  corduraCenterGroup.name = 'CORDURA_BAG_CENTER';

  const innerCutPts = [
    new THREE.Vector2(0.013, 0.044),
    new THREE.Vector2(0.378, 0.458),
    new THREE.Vector2(0.358, 0.512),
    new THREE.Vector2(-0.108, 0.388)
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

  // 45mm Wide Matte Black Velcro Straps around Toptube & Seat Tube (1:1 as on Reference Photo #3!)
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

  // Helper to build detailed Cordura Side Cover with 3D quilted tension relief, perimeter piping (кедер) & waterproof zipper
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

    // Subtle organic 3D pillowing + diagonal fabric tension creases toward the Velcro straps (as on Photo #3!)
    const cPos = coverGeom.attributes.position;
    for (let i = 0; i < cPos.count; i++) {
      const vx = cPos.getX(i);
      const vy = cPos.getY(i);
      const vz = cPos.getZ(i);
      if (Math.sign(vz) === sideSign && Math.abs(vz) > 0.038) {
        const wrinkle = Math.sin(vx * 28.0 - vy * 22.0) * 0.0008 + Math.cos(vx * 14.0 + vy * 19.0) * 0.0006;
        cPos.setZ(i, vz + sideSign * wrinkle);
      }
    }
    coverGeom.computeVertexNormals();

    const coverMesh = new THREE.Mesh(coverGeom, mats.MAT_CORDURA_1000D);
    coverMesh.castShadow = true;
    coverMesh.receiveShadow = true;
    group.add(coverMesh);

    // Perimeter heavy nylon piping (кедер) + reinforced stitch seam
    const zPiping = sideSign * 0.0418;
    for (let i = 0; i < bagPts.length; i++) {
      const pA = bagPts[i];
      const pB = bagPts[(i + 1) % bagPts.length];
      const pipeSeg = createCylinderBetween(
        new THREE.Vector3(pA.x, pA.y, zPiping),
        new THREE.Vector3(pB.x, pB.y, zPiping),
        0.0035,
        0.0035,
        mats.MAT_VELCRO_STRAP,
        14
      );
      group.add(pipeSeg);

      const cornerSphere = new THREE.Mesh(new THREE.SphereGeometry(0.0036, 12, 12), mats.MAT_VELCRO_STRAP);
      cornerSphere.position.set(pA.x, pA.y, zPiping);
      group.add(cornerSphere);
    }

    // Recessed Waterproof Coil Zipper Track parallel to Toptube (1:1 as on Reference Photo #3!)
    const zZip = sideSign * 0.0432;
    const zipRear = new THREE.Vector3(-0.104, 0.372, zZip);
    const zipMid = new THREE.Vector3(0.135, 0.432, zZip);
    const zipFront = new THREE.Vector3(0.354, 0.486, zZip);

    [-0.0024, 0.0024].forEach((dy) => {
      const lip1 = createCylinderBetween(
        new THREE.Vector3(zipRear.x, zipRear.y + dy, zZip),
        new THREE.Vector3(zipMid.x, zipMid.y + dy, zZip),
        0.0018,
        0.0018,
        mats.MAT_VELCRO_STRAP,
        10
      );
      const lip2 = createCylinderBetween(
        new THREE.Vector3(zipMid.x, zipMid.y + dy, zZip),
        new THREE.Vector3(zipFront.x, zipFront.y + dy, zZip),
        0.0018,
        0.0018,
        mats.MAT_VELCRO_STRAP,
        10
      );
      group.add(lip1, lip2);
    });

    // Dual matte black zipper sliders & cord puller tabs (front and rear)
    [
      { x: 0.335, y: 0.481, dx: -0.016, dy: -0.026 },
      { x: -0.078, y: 0.378, dx: 0.012, dy: -0.026 }
    ].forEach((zp) => {
      const sliderBody = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.008, 0.005), mats.MAT_ANODIZED_BLACK);
      sliderBody.position.set(zp.x, zp.y, zZip + sideSign * 0.002);
      sliderBody.rotation.z = 0.24;
      group.add(sliderBody);

      const pullerTab = createCylinderBetween(
        new THREE.Vector3(zp.x, zp.y, zZip + sideSign * 0.003),
        new THREE.Vector3(zp.x + zp.dx, zp.y + zp.dy, zZip + sideSign * 0.005),
        0.0018,
        0.0032,
        mats.MAT_ANODIZED_BLACK,
        10
      );
      group.add(pullerTab);
    });

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

  // 1.4 140 Cylindrical Cells Li-ion 21700 EVE INR21700-50E in a 5-TIER (6+5+4+3+2 = 20S) HEXAGONAL TRIANGLE
  const { cells, groupMeta, uAxis, zoneBarriers } = generate140CellsLayout();
  const cellsMasterGroup = new THREE.Group();
  cellsMasterGroup.name = 'CELLS_20S7P_140_ARRAY';

  const matFishpaper = new THREE.MeshPhysicalMaterial({
    color: 0x165b3a,
    roughness: 0.85,
    metalness: 0.02,
    side: THREE.DoubleSide
  });
  const matFR4Barrier = new THREE.MeshPhysicalMaterial({
    color: 0xe09f24,
    roughness: 0.48,
    metalness: 0.06,
    transparent: true,
    opacity: 0.90
  });

  // 4 Yellow FR4 Fiberglass Dielectric Barrier Strips separating the 5 double-row tiers (Tier 1..5)
  zoneBarriers.forEach((bar) => {
    const p1 = new THREE.Vector3(bar.pLeft.x, bar.pLeft.y, 0);
    const p2 = new THREE.Vector3(bar.pRight.x, bar.pRight.y, 0);
    const barLen = p1.distanceTo(p2) + 0.014;
    const barMid = p1.clone().add(p2).multiplyScalar(0.5);
    const barAng = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    const fr4Strip = new THREE.Mesh(new THREE.BoxGeometry(barLen, 0.0018, 0.0732), matFR4Barrier);
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

  // High-detail geometries for the 140 21700 cells (21.2mm diameter -> R=0.0096m with 1.8mm holder wall)
  const cellRadius = 0.0096;
  const cellBodyGeom = new THREE.CylinderGeometry(cellRadius, cellRadius, 0.0702, 24);
  cellBodyGeom.rotateX(Math.PI / 2);

  const fishpaperRingGeom = new THREE.RingGeometry(0.0052, cellRadius * 0.98, 24);
  const whiteGasketGeom = new THREE.RingGeometry(0.0038, 0.0053, 20);
  const posTermGeom = new THREE.CylinderGeometry(0.0040, 0.0042, 0.0014, 18);
  posTermGeom.rotateX(Math.PI / 2);
  const negTermGeom = new THREE.CylinderGeometry(0.0076, 0.0076, 0.0006, 18);
  negTermGeom.rotateX(Math.PI / 2);

  // Stamped Circular Nickel Contact Pad per cell pole (R = 7.2mm) + 4 Spot-Weld Dimples + Solder Fillet
  const niPadGeom = new THREE.CylinderGeometry(0.0072, 0.0072, 0.0005, 18);
  niPadGeom.rotateX(Math.PI / 2);
  const weldDotGeom = new THREE.CylinderGeometry(0.0007, 0.0007, 0.0008, 8);
  weldDotGeom.rotateX(Math.PI / 2);
  const solderDomeGeom = new THREE.SphereGeometry(0.0018, 10, 10);

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

    // Stamped Nickel Circular Pad + 4 Spot-Weld Dimples + Tin-Lead Solder Dome on both +Z and -Z
    [-0.0359, 0.0359].forEach((zSide) => {
      const padMesh = new THREE.Mesh(niPadGeom, sGroup.userData.niMat);
      padMesh.position.set(cell.x, cell.y, zSide);
      padMesh.userData = { seriesId: cell.seriesId };
      sGroup.add(padMesh);

      for (let w = 0; w < 4; w++) {
        const wAng = (w / 4) * Math.PI * 2 + Math.PI / 4;
        const dot = new THREE.Mesh(weldDotGeom, sGroup.userData.busMat);
        dot.position.set(
          cell.x + Math.cos(wAng) * 0.0033,
          cell.y + Math.sin(wAng) * 0.0033,
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

  // 1.5 ULTRA-CLEAN 2-ROW (4+3 = 7P) STAMPED NICKEL PLATES + SOLDERED COPPER BUSBAR RAILS
  //     + ALTERNATING (+Z / -Z) SERPENTINE SERIES BRIDGES (1S -> 2S -> ... -> 20S)
  const labelPlaneGeom = new THREE.PlaneGeometry(0.025, 0.0072);

  // Helper to add a clean parallel Nickel + Copper rail along a straight sub-row of cells (e.g., 4 cells or 3 cells)
  function addSubRowRail(sGroup, subRowCells, sId) {
    if (subRowCells.length < 2) return;
    const cFirst = subRowCells[0];
    const cLast = subRowCells[subRowCells.length - 1];
    const len = Math.hypot(cLast.x - cFirst.x, cLast.y - cFirst.y);
    const ang = Math.atan2(cLast.y - cFirst.y, cLast.x - cFirst.x);
    const midX = (cFirst.x + cLast.x) * 0.5;
    const midY = (cFirst.y + cLast.y) * 0.5;

    [-0.0359, 0.0359].forEach((zNi) => {
      // Pure Nickel 0.15x8.5mm longitudinal rail
      const niRail = new THREE.Mesh(
        new THREE.BoxGeometry(len + 0.011, 0.0085, 0.0005),
        sGroup.userData.niMat
      );
      niRail.position.set(midX, midY, zNi);
      niRail.rotation.z = ang;
      niRail.userData = { seriesId: sId };
      sGroup.add(niRail);

      // Soldered Heavy Copper 2.5mm² Spine (3.0 x 1.2mm) along the center of the nickel rail
      const zCu = zNi + Math.sign(zNi) * 0.0007;
      const cuRail = new THREE.Mesh(
        new THREE.BoxGeometry(len + 0.004, 0.0030, 0.0012),
        sGroup.userData.busMat
      );
      cuRail.position.set(midX, midY, zCu);
      cuRail.rotation.z = ang;
      cuRail.userData = { seriesId: sId };
      sGroup.add(cuRail);
    });
  }

  for (let s = 1; s <= 20; s++) {
    const sGroup = seriesGroups[s - 1];
    const meta = groupMeta[s - 1];
    const { cellsRowA, cellsRowB } = meta;

    // 1) Parallel rails along Lower Sub-Row (rA) and Upper Sub-Row (rB) of this 7P block
    addSubRowRail(sGroup, cellsRowA, s);
    addSubRowRail(sGroup, cellsRowB, s);

    // 2) Clean honeycomb cross-links joining Lower Sub-Row (rA) and Upper Sub-Row (rB) within this 7P block
    const crossCount = Math.min(cellsRowA.length, cellsRowB.length);
    for (let k = 0; k < crossCount; k++) {
      const cA = cellsRowA[k];
      const cB = cellsRowB[k];
      const dist = Math.hypot(cB.x - cA.x, cB.y - cA.y);
      const ang = Math.atan2(cB.y - cA.y, cB.x - cA.x);
      const midX = (cA.x + cB.x) * 0.5;
      const midY = (cA.y + cB.y) * 0.5;

      [-0.0359, 0.0359].forEach((zNi) => {
        const niCross = new THREE.Mesh(
          new THREE.BoxGeometry(dist, 0.0072, 0.0005),
          sGroup.userData.niMat
        );
        niCross.position.set(midX, midY, zNi);
        niCross.rotation.z = ang;
        niCross.userData = { seriesId: s };
        sGroup.add(niCross);

        // Central copper cross-spine on the middle link of each 7P block
        if (k === Math.floor(crossCount / 2)) {
          const zCu = zNi + Math.sign(zNi) * 0.0007;
          const cuCross = new THREE.Mesh(
            new THREE.BoxGeometry(dist, 0.0028, 0.0012),
            sGroup.userData.busMat
          );
          cuCross.position.set(midX, midY, zCu);
          cuCross.rotation.z = ang;
          cuCross.userData = { seriesId: s };
          sGroup.add(cuCross);
        }
      });
    }

    // 3) Crisp 3D Section Badge ("1S [B− 0V]", "2S (+)", ..., "20S [B+ 84V]") at the center of each 7P block
    const badgeAngle = Math.atan2(uAxis.y, uAxis.x);
    [-0.0380, 0.0380].forEach((zBadge) => {
      const sidePolarity = zBadge > 0 ? meta.polarityOnLeft : -meta.polarityOnLeft;
      const badgeMat = createBatterySeriesLabelMaterial(s, sidePolarity);
      const badgeMesh = new THREE.Mesh(labelPlaneGeom, badgeMat);
      badgeMesh.position.set(meta.center.x, meta.center.y, zBadge);
      badgeMesh.rotation.z = badgeAngle;
      if (zBadge < 0) badgeMesh.rotation.y = Math.PI;
      badgeMesh.userData = { seriesId: s };
      sGroup.add(badgeMesh);
    });

    // 4) SERPENTINE SERIES INTERCONNECT BRIDGES: Connect Block s -> Block (s + 1)
    //    Odd s (1S->2S, 3S->4S, ..., 19S->20S) connects on -Z (Right side)
    //    Even s (2S->3S, 4S->5S, ..., 18S->19S) connects on +Z (Left side)
    if (s < 20) {
      const nextMeta = groupMeta[s];
      const zBridge = s % 2 === 1 ? -0.0365 : 0.0365;
      const bridgePairs = [];

      if (meta.zone === nextMeta.zone) {
        // Same double-row tier: connect adjacent ends of Sub-Row A and Sub-Row B in parallel!
        if (!meta.reverse) {
          // Moving Left -> Right: rightmost cells of s connect to leftmost cells of s+1
          bridgePairs.push([cellsRowA[cellsRowA.length - 1], nextMeta.cellsRowA[0]]);
          bridgePairs.push([cellsRowB[cellsRowB.length - 1], nextMeta.cellsRowB[0]]);
        } else {
          // Moving Right -> Left: leftmost cells of s connect to rightmost cells of s+1
          bridgePairs.push([cellsRowA[0], nextMeta.cellsRowA[nextMeta.cellsRowA.length - 1]]);
          bridgePairs.push([cellsRowB[0], nextMeta.cellsRowB[nextMeta.cellsRowB.length - 1]]);
        }
      } else {
        // Stepping up across an FR4 barrier to the next tier (6S->7S, 11S->12S, 15S->16S, 18S->19S):
        // Connect each cell of Upper Sub-Row B of block s to its nearest neighbor in Lower Sub-Row A of block s+1!
        cellsRowB.forEach((cA) => {
          let bestCell = nextMeta.cellsRowA[0];
          let bestDist = Infinity;
          nextMeta.cellsRowA.forEach((cB) => {
            const d = Math.hypot(cB.x - cA.x, cB.y - cA.y);
            if (d < bestDist) {
              bestDist = d;
              bestCell = cB;
            }
          });
          bridgePairs.push([cA, bestCell]);
        });
      }

      bridgePairs.forEach(([cA, cB]) => {
        const d = Math.hypot(cB.x - cA.x, cB.y - cA.y);
        const midX = (cA.x + cB.x) * 0.5;
        const midY = (cA.y + cB.y) * 0.5;
        const brAngle = Math.atan2(cB.y - cA.y, cB.x - cA.x);

        // Wide Stamped Series Nickel Bridge (9.5mm wide)
        const niBridge = new THREE.Mesh(
          new THREE.BoxGeometry(d + 0.011, 0.0095, 0.0008),
          sGroup.userData.niMat
        );
        niBridge.position.set(midX, midY, zBridge);
        niBridge.rotation.z = brAngle;
        niBridge.userData = { seriesId: s };
        sGroup.add(niBridge);

        // Soldered Heavy Copper Series Busbar Bridge (4.2mm wide) on top of the nickel bridge
        const cuBridge = new THREE.Mesh(
          new THREE.BoxGeometry(d + 0.007, 0.0042, 0.0018),
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
  const cell1S_0 = groupMeta[0].cellsRowA[0];
  const bMinusCollector = new THREE.Mesh(
    new THREE.BoxGeometry(0.022, 0.012, 0.003),
    mats.MAT_COPPER_BUSBAR
  );
  bMinusCollector.position.set(cell1S_0.x - 0.006, cell1S_0.y + 0.005, 0.0375);
  bMinusCollector.rotation.z = 0.84;
  group1S.add(bMinusCollector);

  const group20S = seriesGroups[19];
  const cell20S_0 = groupMeta[19].cellsRowB[groupMeta[19].cellsRowB.length - 1];
  const bPlusCollector = new THREE.Mesh(
    new THREE.BoxGeometry(0.022, 0.012, 0.003),
    mats.MAT_COPPER_BUSBAR
  );
  bPlusCollector.position.set(cell20S_0.x, cell20S_0.y + 0.006, 0.0375);
  bPlusCollector.rotation.z = 0.25;
  group20S.add(bPlusCollector);

  batteryRoot.add(cellsMasterGroup);

  // 1.6 Bisida BMS 20S 120A Li-ion in Finned Aluminum Heatsink in upper channel under Toptube
  // + Clean Bundled Balance Sense Loom along FR4 channels + Heavy 6AWG Power Cables + XT90-S Anti-Spark
  const bmsGroup = new THREE.Group();
  bmsGroup.name = 'EXPLODE_BISIDA_BMS_120A';

  const toptubeAngle = Math.atan2(0.545 - 0.415, 0.395 - (-0.135));
  const bmsPos = new THREE.Vector3(0.155, 0.452, 0);
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
  const xt90Pos = new THREE.Vector3(-0.048, 0.398, 0.015);
  const xt90Housing = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.022, 0.014), mats.MAT_XT90_YELLOW);
  xt90Housing.position.copy(xt90Pos);
  const xt90AntiSparkBand = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.023, 0.015), mats.MAT_ANODIZED_BLACK);
  xt90AntiSparkBand.position.set(xt90Pos.x + 0.009, xt90Pos.y, xt90Pos.z);
  bmsGroup.add(xt90Housing, xt90AntiSparkBand);

  // Heavy 6AWG Power Cables showing exact electrical connections:
  // 1) B- (Blue 6AWG): from 1S (-) Collector at bottom-rear up along Seat Tube channel to BMS B- pad
  const pBMinusStart = new THREE.Vector3(cell1S_0.x - 0.008, cell1S_0.y + 0.005, 0.037);
  const pBMinusMid = new THREE.Vector3(-0.104, 0.372, 0.034);
  const pBMinusEnd = new THREE.Vector3(0.092, 0.434, 0.016);
  bmsGroup.add(
    createCylinderBetween(pBMinusStart, pBMinusMid, 0.0036, 0.0036, mats.MAT_BLUE_ANODIZED, 12),
    createCylinderBetween(pBMinusMid, pBMinusEnd, 0.0036, 0.0036, mats.MAT_BLUE_ANODIZED, 12)
  );

  // 2) C- (Black 6AWG): from BMS C- pad to Amass XT90-S Negative pin
  const pCMinusStart = new THREE.Vector3(0.092, 0.434, -0.015);
  const pCMinusEnd = new THREE.Vector3(xt90Pos.x + 0.010, xt90Pos.y - 0.005, xt90Pos.z);
  bmsGroup.add(
    createCylinderBetween(pCMinusStart, pCMinusEnd, 0.0036, 0.0036, mats.MAT_ANODIZED_BLACK, 12)
  );

  // 3) B+ 84V (Red 6AWG): from 20S (+) Collector at top apex directly to Amass XT90-S Positive pin
  const pBPlusStart = new THREE.Vector3(cell20S_0.x, cell20S_0.y + 0.006, 0.037);
  const pBPlusEnd = new THREE.Vector3(xt90Pos.x - 0.010, xt90Pos.y + 0.005, xt90Pos.z);
  bmsGroup.add(
    createCylinderBetween(pBPlusStart, pBPlusEnd, 0.0038, 0.0038, mats.MAT_RED_ANODIZED, 12)
  );

  // 4) Clean Routed 21-Wire BMS Balance Harness:
  //    Instead of messy diagonal wires across cell faces, route a bundled trunk along the Toptube edge
  //    and drop short orthogonal sense taps onto each group's series busbar!
  for (let s = 1; s <= 20; s++) {
    const meta = groupMeta[s - 1];
    const t = s / 20;
    const jstPinPos = new THREE.Vector3(
      bmsPos.x - 0.034 + t * 0.080,
      bmsPos.y - 0.010 + t * 0.019,
      s % 2 === 1 ? -0.035 : 0.035
    );
    const tapZ = s % 2 === 1 ? -0.0372 : 0.0372;
    const tapCell = meta.cellsRowB[Math.floor(meta.cellsRowB.length / 2)];
    const tapPos = new THREE.Vector3(tapCell.x, tapCell.y + 0.006, tapZ);
    // Intermediate elbow along the upper/perimeter routing channel so wires follow the pack contour neatly
    const elbowPos = new THREE.Vector3(tapCell.x, Math.max(tapCell.y + 0.028, bmsPos.y - 0.022), tapZ);

    const wireMat = s === 20 ? mats.MAT_XT90_YELLOW : mats.MAT_RED_ANODIZED;
    bmsGroup.add(
      createCylinderBetween(jstPinPos, elbowPos, 0.00065, 0.00065, wireMat, 6),
      createCylinderBetween(elbowPos, tapPos, 0.00065, 0.00065, wireMat, 6)
    );

    const tapDot = new THREE.Mesh(new THREE.SphereGeometry(0.0015, 8, 8), mats.MAT_STEEL_ROTOR);
    tapDot.position.copy(tapPos);
    bmsGroup.add(tapDot);
  }

  // B0 (Black balance ground lead) to 1S (-)
  bmsGroup.add(
    createCylinderBetween(
      new THREE.Vector3(bmsPos.x - 0.038, bmsPos.y - 0.012, 0.035),
      pBMinusMid,
      0.0008,
      0.0008,
      mats.MAT_ANODIZED_BLACK,
      6
    )
  );

  // Teardrop NTC Thermistor glued into center of honeycomb
  const ntcStart = new THREE.Vector3(bmsPos.x + 0.01, bmsPos.y - 0.01, 0);
  const ntcEnd = new THREE.Vector3(0.115, 0.285, 0);
  const ntcWire = createCylinderBetween(ntcStart, ntcEnd, 0.0010, 0.0010, mats.MAT_ANODIZED_BLACK, 8);
  const ntcBead = new THREE.Mesh(new THREE.SphereGeometry(0.0030, 12, 12), mats.MAT_ANODIZED_BLACK);
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
 * Strictly outside & underneath the Downtube (1:1 as on Reference Photo #3, #1 & #4)
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

  // Upper half under Downtube: Long Black Anodized Finned Controller (length 235mm, width 84mm, height 46mm)
  const ctrlCenter = pBB.clone()
    .addScaledVector(downDir, 0.412)
    .addScaledVector(downNormalOut, 0.042);

  const ctrlGroup = new THREE.Group();
  ctrlGroup.position.copy(ctrlCenter);
  ctrlGroup.rotation.z = downAngle;

  // Main extruded aluminum core
  const ctrlCore = new THREE.Mesh(new THREE.BoxGeometry(0.235, 0.040, 0.082), mats.MAT_ANODIZED_BLACK);
  ctrlCore.castShadow = true;
  ctrlGroup.add(ctrlCore);

  // Deep longitudinal wind-tunnel cooling ribs on sides and bottom (1:1 as on Reference Photo #3)
  for (let r = -3; r <= 3; r++) {
    const bottomRib = new THREE.Mesh(new THREE.BoxGeometry(0.230, 0.0065, 0.004), mats.MAT_ANODIZED_BLACK);
    bottomRib.position.set(0, -0.022, r * 0.011);
    ctrlGroup.add(bottomRib);
  }
  [-0.042, 0.042].forEach((sideZ) => {
    for (let s = -3; s <= 3; s++) {
      const sideRib = new THREE.Mesh(new THREE.BoxGeometry(0.230, 0.0032, 0.0045), mats.MAT_ANODIZED_BLACK);
      sideRib.position.set(0, s * 0.0052, sideZ);
      ctrlGroup.add(sideRib);
    }
  });

  // Top & bottom cast end-caps with stainless M3 Allen bolts (visible in Reference Photo #4!)
  [-0.119, 0.119].forEach((endX) => {
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.044, 0.086), mats.MAT_FRAME_RAL9005);
    cap.position.set(endX, 0, 0);
    ctrlGroup.add(cap);
  });
  [-0.075, 0.0, 0.075].forEach((bx) => {
    [-0.0435, 0.0435].forEach((bz) => {
      const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.0020, 0.0020, 0.003, 10), mats.MAT_STEEL_ROTOR);
      screw.position.set(bx, 0.010, bz);
      screw.rotation.x = Math.PI / 2;
      ctrlGroup.add(screw);
    });
  });

  controllerAndCoverGroup.add(ctrlGroup);

  // 3 Wide 40mm Black Straps holding the 60A Controller & Bag to the Downtube (1:1 as on Photo #3!)
  [0.52, 0.68, 0.84].forEach((t) => {
    const pTube = pBB.clone().lerp(pHT, t);
    const pWrapCenter = pTube.clone().addScaledVector(downNormalOut, 0.020);
    const pWrapEnd = pWrapCenter.clone().addScaledVector(downDir, 0.034);
    const strap = createBiOvalTubeBetween(pWrapCenter, pWrapEnd, 0.045, 0.045, mats.MAT_VELCRO_STRAP, 24);
    underTubeRoot.add(strap);
  });

  // 2.2 Lower Stepped 3D-Printed PETG Wiring Enclosure (1:1 as on Reference Photo #3 & #4)
  // Abuts the bottom endcap of the controller with a stepped flange collar and extends to the BB
  const boxCenter = pBB.clone()
    .addScaledVector(downDir, 0.165)
    .addScaledVector(downNormalOut, 0.045);

  // Fixed inner base of the 3D PETG box (stays on frame during Exploded View to reveal internals!)
  const boxBaseGroup = new THREE.Group();
  boxBaseGroup.name = 'PETG_WIRING_BOX_INTERNAL_BASE';
  boxBaseGroup.position.copy(boxCenter);
  boxBaseGroup.rotation.z = downAngle;

  const baseTray = new THREE.Mesh(new THREE.BoxGeometry(0.242, 0.018, 0.084), mats.MAT_PETG_HOLDER);
  baseTray.position.set(0, 0.018, 0);
  boxBaseGroup.add(baseTray);

  // Stepped upper collar overlapping the lower end of the 60A controller (1:1 as on Photo #3 & #4!)
  const steppedCollar = new THREE.Mesh(new THREE.BoxGeometry(0.034, 0.060, 0.092), mats.MAT_PETG_HOLDER);
  steppedCollar.position.set(0.116, -0.002, 0);
  boxBaseGroup.add(steppedCollar);

  // 2 Wide Straps around lower 3D PETG box & Downtube (1:1 as on Photo #3!)
  [0.14, 0.31].forEach((t) => {
    const pBoxStrapTube = pBB.clone().lerp(pHT, t);
    const pBoxStrapCenter = pBoxStrapTube.clone().addScaledVector(downNormalOut, 0.022);
    const pBoxStrapEnd = pBoxStrapCenter.clone().addScaledVector(downDir, 0.034);
    underTubeRoot.add(
      createBiOvalTubeBetween(pBoxStrapCenter, pBoxStrapEnd, 0.047, 0.046, mats.MAT_VELCRO_STRAP, 24)
    );
  });

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

  const lidShell = new THREE.Mesh(new THREE.BoxGeometry(0.242, 0.042, 0.088), mats.MAT_PETG_HOLDER);
  lidShell.position.set(0, -0.008, 0);
  lidShell.castShadow = true;
  boxLidGroup.add(lidShell);

  // Longitudinal stiffening ribs on the sides of the 3D-printed box (1:1 as on Photo #3)
  [-0.045, 0.045].forEach((sz) => {
    for (let r = -3; r <= 3; r++) {
      const rib = new THREE.Mesh(new THREE.BoxGeometry(0.232, 0.0028, 0.0032), mats.MAT_FRAME_RAL9005);
      rib.position.set(0, -0.008 + r * 0.0052, sz);
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
 * 3. NODE 7: LOW-PROFILE MOTO SADDLE (SUR-RON / PITBIKE 530 MM) + COMPACT 2-BOLT STEEL SUBFRAME
 *    + SLEEK REAR TAIL FENDER WITH LED BRAKE LIGHT (1:1 AS ON REFERENCE PHOTO #3 & #1!)
 */
export function buildMotoSaddleAndSubframeNode(mats) {
  const saddleRoot = new THREE.Group();
  saddleRoot.name = 'NODE_07_MOTO_SADDLE_AND_SUBFRAME';

  // 3.1 Welded Steel Subframe (compact, tucked right under the saddle pan + 2-bolt Seatstay strut as on Photo #3!)
  const subframeGroup = new THREE.Group();
  subframeGroup.name = 'EXPLODE_STEEL_SUBFRAME';

  // Left & Right upper subframe rails tucked under the saddle pan + short stout 2-bolt strut to upper Seatstay
  [-1, 1].forEach((side) => {
    const zFront = side * 0.020;
    const zRear = side * 0.032;
    const zStay = side * 0.030;

    // Sleek upper rail tucked directly under the molded saddle pan
    const upperRail = createCylinderBetween(
      new THREE.Vector3(-0.125, 0.408, zFront),
      new THREE.Vector3(-0.445, 0.492, zRear),
      0.0085,
      0.0075,
      mats.MAT_FRAME_RAL9005,
      16
    );
    subframeGroup.add(upperRail);

    // Main compact diagonal strut from upper Seatstay (-0.198, 0.315, zStay) up to Saddle Subframe (-0.162, 0.402, zFront)
    // (1:1 as on Reference Photo #3, with two bright stainless M6 Allen bolts!)
    const mainStrut = createBiOvalTubeBetween(
      new THREE.Vector3(-0.198, 0.315, zStay),
      new THREE.Vector3(-0.162, 0.402, zFront),
      0.011,
      0.007,
      mats.MAT_FRAME_RAL9005,
      16
    );
    subframeGroup.add(mainStrut);

    // Two bright M6 Stainless Allen Bolts on the main Seatstay subframe strut (1:1 as on Photo #3!)
    [
      [-0.196, 0.320, zStay + side * 0.005],
      [-0.166, 0.392, zFront + side * 0.005]
    ].forEach(([bx, by, bz]) => {
      const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.0042, 0.0042, 0.005, 12), mats.MAT_STEEL_ROTOR);
      bolt.position.set(bx, by, bz);
      bolt.rotation.x = Math.PI / 2;
      subframeGroup.add(bolt);
    });
  });

  // Cross-bridges between left and right subframe rails
  [-0.18, -0.34].forEach((cx, idx) => {
    const cy = idx === 0 ? 0.418 : 0.462;
    const bridge = createCylinderBetween(
      new THREE.Vector3(cx, cy, -0.026),
      new THREE.Vector3(cx, cy, 0.026),
      0.0065,
      0.0065,
      mats.MAT_FRAME_RAL9005,
      12
    );
    subframeGroup.add(bridge);
  });

  saddleRoot.add(subframeGroup);

  // 3.2 Explodable Moto-Saddle (530mm length) + Sleek Rear Pitbike Tail Fender + LED Brake Light
  const saddleAndFenderGroup = new THREE.Group();
  saddleAndFenderGroup.name = 'EXPLODE_MOTO_SADDLE_AND_FENDER';

  // Exact Low-Slung Side Profile of the 530mm Sur-Ron / Pitbike Saddle matching Reference Photo #3:
  // Front nose sits LOW right on top of the Toptube & Cordura bag rear corner (x = +0.035, y = 0.455),
  // dips into an anatomical rider dish (x = -0.145, y = 0.448), and sweeps sleekly to the tail (x = -0.485, y = 0.528)!
  const saddleSideShape = new THREE.Shape();
  saddleSideShape.moveTo(0.035, 0.454); // Front nose tip hugging Toptube behind front straps
  saddleSideShape.quadraticCurveTo(-0.045, 0.462, -0.145, 0.450); // Low anatomical rider dish
  saddleSideShape.bezierCurveTo(-0.255, 0.445, -0.365, 0.492, -0.482, 0.528); // Sleek upward moto tail
  saddleSideShape.quadraticCurveTo(-0.498, 0.528, -0.494, 0.502); // Rounded rear tail tip
  saddleSideShape.quadraticCurveTo(-0.365, 0.462, -0.205, 0.402); // Lower molded plastic base pan
  // U-channel slot (40 x 70 mm) seating deeply over Seat Tube top (-0.140, 0.415) flush with Cordura bag
  saddleSideShape.lineTo(-0.155, 0.398);
  saddleSideShape.lineTo(-0.095, 0.406);
  saddleSideShape.quadraticCurveTo(-0.025, 0.425, 0.035, 0.442);
  saddleSideShape.closePath();

  const saddleGeom = new THREE.ExtrudeGeometry(saddleSideShape, {
    depth: 0.130,
    bevelEnabled: true,
    bevelSize: 0.015,
    bevelThickness: 0.016,
    bevelSegments: 6
  });
  saddleGeom.translate(0, 0, -0.065);

  // Taper width along X (narrower 74mm nose at front, wide 142mm anatomical middle, sleek 78mm tail)
  const sPos = saddleGeom.attributes.position;
  for (let i = 0; i < sPos.count; i++) {
    const vx = sPos.getX(i);
    const vy = sPos.getY(i);
    const vz = sPos.getZ(i);
    const t = Math.max(0, Math.min(1, (0.035 - vx) / 0.530));
    const widthProfile = 0.52 + 0.52 * Math.sin(Math.pow(t, 0.75) * Math.PI * 0.88);
    const archDrop = (vz * vz) * 1.55;
    sPos.setZ(i, vz * widthProfile);
    sPos.setY(i, vy - archDrop);
  }
  saddleGeom.computeVertexNormals();

  const saddleMesh = new THREE.Mesh(saddleGeom, mats.MAT_MOTO_VINYL);
  saddleMesh.castShadow = true;
  saddleMesh.receiveShadow = true;
  saddleAndFenderGroup.add(saddleMesh);

  // Separate Rear Pitbike / Sur-Ron Plastic Tail Fender extending smoothly from under the saddle tail
  // (x = -0.450 to -0.665, y = 0.495 to 0.552 — 1:1 as on Reference Photo #3!)
  const fenderShape = new THREE.Shape();
  fenderShape.moveTo(-0.445, 0.498);
  fenderShape.quadraticCurveTo(-0.555, 0.530, -0.660, 0.552); // Upper sleek line
  fenderShape.lineTo(-0.665, 0.542);                          // Sharp rear tip
  fenderShape.quadraticCurveTo(-0.565, 0.506, -0.455, 0.478); // Tapered lower edge
  fenderShape.closePath();

  const tailFenderGeom = new THREE.ExtrudeGeometry(fenderShape, {
    depth: 0.078,
    bevelEnabled: true,
    bevelSize: 0.004,
    bevelThickness: 0.004,
    bevelSegments: 3
  });
  tailFenderGeom.translate(0, 0, -0.039);

  const fPos = tailFenderGeom.attributes.position;
  for (let i = 0; i < fPos.count; i++) {
    const fx = fPos.getX(i);
    const fz = fPos.getZ(i);
    const ft = Math.max(0, Math.min(1, (-0.445 - fx) / 0.220));
    fPos.setZ(i, fz * (1.0 - ft * 0.44));
  }
  tailFenderGeom.computeVertexNormals();

  const rearFenderMesh = new THREE.Mesh(tailFenderGeom, mats.MAT_ANODIZED_BLACK);
  rearFenderMesh.castShadow = true;
  saddleAndFenderGroup.add(rearFenderMesh);

  // Integrated Red LED Brake Light tucked under the junction of the saddle tail & rear fender
  const brakeLightHousing = new THREE.Mesh(
    new THREE.BoxGeometry(0.022, 0.015, 0.060),
    mats.MAT_ANODIZED_BLACK
  );
  brakeLightHousing.position.set(-0.498, 0.490, 0);
  brakeLightHousing.rotation.z = -0.22;
  saddleAndFenderGroup.add(brakeLightHousing);

  const brakeLightLens = new THREE.Mesh(
    new THREE.BoxGeometry(0.008, 0.011, 0.052),
    mats.MAT_BRAKE_LED
  );
  brakeLightLens.name = 'REAR_LED_BRAKE_LIGHT';
  brakeLightLens.position.set(-0.508, 0.488, 0);
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
