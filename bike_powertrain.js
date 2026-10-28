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
 * arranged in a true 60-degree hexagonal honeycomb matrix along the Downtube & Seat Tube:
 * - Pitch between cell centers in a row: dU = 0.0227m (22.7mm)
 * - Row-to-row pitch: dV = 0.01966m (19.66mm)
 * - Each row r steps by +0.5 * dU along uAxis so the rear edge parallels the Seat Tube (34.8mm clearance)
 * - Rows 1..4 (bottom to mid): 21 cells per row (3 parallel groups 7P per row = 84 cells)
 * - Rows 5..8 (upper triangle): 14 cells per row (2 parallel groups 7P per row = 56 cells)
 * - TOTAL = 84 + 56 = 140 cells, grouped into 20 contiguous serpentine series sections (1S..20S of 7P)
 */
export function generate140CellsLayout() {
  const pDown0 = new THREE.Vector2(0.015, 0.015);
  const pDown1 = new THREE.Vector2(0.415, 0.465);
  const uAxis = pDown1.clone().sub(pDown0).normalize(); // along downtube (~48.37 deg)
  const vAxis = new THREE.Vector2(-uAxis.y, uAxis.x);   // inward normal (~138.37 deg)

  const dU = 0.0227;   // 22.7mm cell pitch
  const dV = 0.01966;  // 19.66mm hexagonal row pitch

  // Base origin inside the 15mm EVA foam cocoon above BB & along Seat Tube
  const origin = new THREE.Vector2(0.012, 0.068);

  const rowCounts = [21, 21, 21, 21, 14, 14, 14, 14]; // Total = 140 cells
  const cells = [];
  const groupMeta = []; // Metadata for each of the 20 series sections (1S..20S)
  let seriesCounter = 0;

  for (let r = 0; r < rowCounts.length; r++) {
    const countInRow = rowCounts[r];
    const groupsInRow = countInRow / 7; // 3 groups for rows 0..3, 2 groups for rows 4..7

    // True 60-deg hexagonal row step along Seat Tube
    const rowStartU = r * (0.5 * dU);

    // Serpentine row direction: even rows (r=0,2,4,6) go rear->front (g=0..G-1),
    // odd rows (r=1,3,5,7) go front->rear (g=G-1..0) so every s -> s+1 is physically adjacent!
    const groupOrder = [];
    if (r % 2 === 0) {
      for (let g = 0; g < groupsInRow; g++) groupOrder.push(g);
    } else {
      for (let g = groupsInRow - 1; g >= 0; g--) groupOrder.push(g);
    }

    for (let idxInOrder = 0; idxInOrder < groupOrder.length; idxInOrder++) {
      const g = groupOrder[idxInOrder];
      seriesCounter++;
      const currentSeriesId = seriesCounter; // 1..20
      // Alternating polarity on +Z (Left side):
      // Odd series (1S, 3S, ..., 19S) -> Negative (-1) on +Z (Left), Positive (+1) on -Z (Right)
      // Even series (2S, 4S, ..., 20S) -> Positive (+1) on +Z (Left), Negative (-1) on -Z (Right)
      const polarityOnLeft = currentSeriesId % 2 === 1 ? -1 : 1;

      const groupCells = [];
      for (let c = 0; c < 7; c++) {
        const colIdx = g * 7 + c;
        const uDist = rowStartU + colIdx * dU;
        const vDist = r * dV;

        const pos2D = origin.clone()
          .addScaledVector(uAxis, uDist)
          .addScaledVector(vAxis, vDist);

        const cellObj = {
          cellGlobalIndex: cells.length + 1,
          row: r + 1,
          blockCol: g,
          col: colIdx + 1,
          seriesId: currentSeriesId, // 1S..20S
          parallelIndex: c + 1,      // 1P..7P
          polarity: polarityOnLeft,  // +1 means Pos on +Z (Left), -1 means Neg on +Z (Left)
          x: pos2D.x,
          y: pos2D.y
        };
        cells.push(cellObj);
        groupCells.push(cellObj);
      }

      const cx = groupCells.reduce((acc, item) => acc + item.x, 0) / 7;
      const cy = groupCells.reduce((acc, item) => acc + item.y, 0) / 7;
      groupMeta.push({
        seriesId: currentSeriesId,
        row: r,
        blockCol: g,
        polarityOnLeft,
        cells: groupCells,
        center: new THREE.Vector2(cx, cy)
      });
    }
  }

  return { cells, groupMeta, uAxis, vAxis };
}

/**
 * 1. NODE 5: TACTICAL BAG CORDURA 1000D + INTERNAL X-RAY 20S7P BATTERY (140x EVE 50E)
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
    new THREE.Vector2(0.018, 0.056),
    new THREE.Vector2(0.372, 0.456),
    new THREE.Vector2(0.354, 0.508),
    new THREE.Vector2(-0.104, 0.384)
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
  // Toptube straps (2 straps between front phone mount and moto-saddle nose, 1:1 as on photo #1)
  [0.44, 0.66].forEach((t) => {
    const p1 = new THREE.Vector3(-0.135, 0.415, 0).lerp(new THREE.Vector3(0.395, 0.545, 0), t);
    const dir = new THREE.Vector3(0.530, 0.130, 0).normalize();
    const p2 = p1.clone().addScaledVector(dir, strapWidth);
    const strap = createBiOvalTubeBetween(p1, p2, 0.022, 0.043, mats.MAT_VELCRO_STRAP, 24);
    corduraCenterGroup.add(strap);
  });

  // Seat tube straps (2 straps: upper-mid and lower-mid on Seat Tube, 1:1 as on photo #1)
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

    // 3D Perimeter Cordura Piping / Welt Seam (окантовочный кедер Ø5.5 мм around the entire triangle border)
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

      // Rounded piping corner joint
      const cornerSphere = new THREE.Mesh(new THREE.SphereGeometry(0.0034, 12, 12), mats.MAT_VELCRO_STRAP);
      cornerSphere.position.set(pA.x, pA.y, zPiping);
      group.add(cornerSphere);
    }

    // Waterproof Reverse-Coil Zipper Track parallel to Toptube (28mm below upper edge, 1:1 as on Photo #1 & #2)
    const zZip = sideSign * 0.0432;
    const zipRear = new THREE.Vector3(-0.102, 0.376, zZip);
    const zipMid = new THREE.Vector3(0.145, 0.440, zZip);
    const zipFront = new THREE.Vector3(0.352, 0.490, zZip);

    // Upper & lower waterproof zipper tape lips
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

    // Metal Zipper Slider + Tactical Cord Puller at front-top corner (1:1 as on Reference Photo #1)
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

  // 1.4 140 Cylindrical Cells Li-ion 21700 EVE INR21700-50E (OD 21.2mm -> R=0.0106m, Length 70.5mm along Z)
  // Grouped into 20 Contiguous Serpentine Series Groups (1S..20S of 7 parallel cells 7P each)
  const { cells, groupMeta, uAxis } = generate140CellsLayout();
  const cellsMasterGroup = new THREE.Group();
  cellsMasterGroup.name = 'CELLS_20S7P_140_ARRAY';

  const seriesGroups = [];
  for (let s = 1; s <= 20; s++) {
    const meta = groupMeta[s - 1];
    const sGroup = new THREE.Group();
    sGroup.name = `BATTERY_SECTION_${s}S`;
    sGroup.userData = {
      seriesId: s,
      code: `${s}S7P`,
      row: meta.row + 1,
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

  // Shared geometries for the 140 cells
  const cellBodyGeom = new THREE.CylinderGeometry(0.0106, 0.0106, 0.0705, 24);
  cellBodyGeom.rotateX(Math.PI / 2); // Align along Z axis

  const insRingGeom = new THREE.RingGeometry(0.0042, 0.0103, 20);
  const posTermGeom = new THREE.CylinderGeometry(0.0044, 0.0044, 0.0014, 16);
  posTermGeom.rotateX(Math.PI / 2);
  const negTermGeom = new THREE.CylinderGeometry(0.0082, 0.0082, 0.0006, 16);
  negTermGeom.rotateX(Math.PI / 2);

  // Spot weld dimple geometry
  const weldDotGeom = new THREE.CylinderGeometry(0.0009, 0.0009, 0.0008, 8);
  weldDotGeom.rotateX(Math.PI / 2);

  // Left & Right 3D-Printed PETG Honeycomb Holders (Explodable along ±Z by ±0.14m)
  const holderLeftGroup = new THREE.Group();
  holderLeftGroup.name = 'EXPLODE_PETG_HOLDER_LEFT';
  const holderRightGroup = new THREE.Group();
  holderRightGroup.name = 'EXPLODE_PETG_HOLDER_RIGHT';

  const hexSocketGeom = new THREE.CylinderGeometry(0.0114, 0.0114, 0.012, 6, 1, true);
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

    // Positive end: White barley-paper insulator ring + raised steel button cap
    // Negative end: Flat nickel-plated steel circular bottom
    const posZ = cell.polarity === 1 ? 0.0354 : -0.0354;
    const negZ = -posZ;

    const insRing = new THREE.Mesh(insRingGeom, mats.MAT_WHITE_INSULATOR);
    insRing.position.set(cell.x, cell.y, posZ);
    insRing.userData = { seriesId: cell.seriesId };
    sGroup.add(insRing);

    const posBtn = new THREE.Mesh(posTermGeom, mats.MAT_STEEL_ROTOR);
    posBtn.position.set(cell.x, cell.y, posZ);
    posBtn.userData = { seriesId: cell.seriesId };
    sGroup.add(posBtn);

    const negFlat = new THREE.Mesh(negTermGeom, mats.MAT_STEEL_ROTOR);
    negFlat.position.set(cell.x, cell.y, negZ);
    negFlat.userData = { seriesId: cell.seriesId };
    sGroup.add(negFlat);

    // 4 Spot-Weld Dimples on both +Z and -Z terminals of every cell
    [-0.0365, 0.0365].forEach((wz) => {
      [
        [-0.0022, -0.0018],
        [0.0022, -0.0018],
        [-0.0022, 0.0018],
        [0.0022, 0.0018]
      ].forEach(([dx, dy]) => {
        const dot = new THREE.Mesh(weldDotGeom, sGroup.userData.busMat);
        dot.position.set(cell.x + dx, cell.y + dy, wz);
        dot.userData = { seriesId: cell.seriesId };
        sGroup.add(dot);
      });
    });

    // Populate Left & Right PETG Honeycomb Hex Sockets
    dummy.position.set(cell.x, cell.y, 0.0295);
    dummy.rotation.set(0, 0, Math.atan2(uAxis.y, uAxis.x));
    dummy.updateMatrix();
    instancedHolderL.setMatrixAt(idx, dummy.matrix);

    dummy.position.set(cell.x, cell.y, -0.0295);
    dummy.updateMatrix();
    instancedHolderR.setMatrixAt(idx, dummy.matrix);
  });

  instancedHolderL.instanceMatrix.needsUpdate = true;
  instancedHolderR.instanceMatrix.needsUpdate = true;
  holderLeftGroup.add(instancedHolderL);
  holderRightGroup.add(instancedHolderR);

  // Outer PETG frame rails around the 140 hex sockets
  const holderPerimGeomL = new THREE.ExtrudeGeometry(bagRimShape, { depth: 0.010, bevelEnabled: false });
  holderPerimGeomL.scale(0.92, 0.92, 1);
  holderPerimGeomL.translate(0.010, 0.022, 0.024);
  holderLeftGroup.add(new THREE.Mesh(holderPerimGeomL, mats.MAT_PETG_HOLDER));

  const holderPerimGeomR = holderPerimGeomL.clone();
  holderPerimGeomR.translate(0, 0, -0.058);
  holderRightGroup.add(new THREE.Mesh(holderPerimGeomR, mats.MAT_PETG_HOLDER));

  batteryRoot.add(holderLeftGroup, holderRightGroup);

  // 1.5 PARALLEL 7P NICKEL STRIPS + SOLDERED COPPER BUSBARS + SERPENTINE SERIES BRIDGES (1S -> 2S -> ... -> 20S)
  const labelPlaneGeom = new THREE.PlaneGeometry(0.032, 0.0085);

  for (let s = 1; s <= 20; s++) {
    const sGroup = seriesGroups[s - 1];
    const meta = groupMeta[s - 1];
    const groupCells = meta.cells;
    const firstCell = groupCells[0];
    const lastCell = groupCells[groupCells.length - 1];
    const angle = Math.atan2(lastCell.y - firstCell.y, lastCell.x - firstCell.x);

    // Parallel 7P Nickel Strip (0.15 x 9mm) + Tinned Copper Busbar (2.5 mm²) on both +Z and -Z
    [-0.036, 0.036].forEach((zEnd) => {
      const pStart = new THREE.Vector3(firstCell.x, firstCell.y, zEnd);
      const pEnd = new THREE.Vector3(lastCell.x, lastCell.y, zEnd);
      const stripLen = pStart.distanceTo(pEnd) + 0.017;
      const stripCenter = pStart.clone().add(pEnd).multiplyScalar(0.5);

      // Pure Nickel Strip (0.15 x 9mm)
      const niGeom = new THREE.BoxGeometry(stripLen, 0.009, 0.0006);
      const niStrip = new THREE.Mesh(niGeom, sGroup.userData.niMat);
      niStrip.position.copy(stripCenter);
      niStrip.rotation.z = angle;
      niStrip.userData = { seriesId: s };
      sGroup.add(niStrip);

      // Soldered Tinned Copper Spine (2.5 mm²) along the 7P group
      const cuGeom = new THREE.BoxGeometry(stripLen * 0.92, 0.0036, 0.0014);
      const cuBus = new THREE.Mesh(cuGeom, sGroup.userData.busMat);
      cuBus.position.set(stripCenter.x, stripCenter.y, zEnd + Math.sign(zEnd) * 0.0007);
      cuBus.rotation.z = angle;
      cuBus.userData = { seriesId: s };
      sGroup.add(cuBus);

      // Crisp 3D Section Badge ("1S [B-]", "2S (+)", ..., "20S [B+]") on each group
      const sidePolarity = zEnd > 0 ? meta.polarityOnLeft : -meta.polarityOnLeft;
      const badgeMat = createBatterySeriesLabelMaterial(s, sidePolarity);
      const badgeMesh = new THREE.Mesh(labelPlaneGeom, badgeMat);
      badgeMesh.position.set(stripCenter.x, stripCenter.y, zEnd + Math.sign(zEnd) * 0.0018);
      badgeMesh.rotation.z = angle;
      if (zEnd < 0) badgeMesh.rotation.y = Math.PI;
      badgeMesh.userData = { seriesId: s };
      sGroup.add(badgeMesh);
    });

    // SERPENTINE SERIES CONNECTIONS: Connect Section s -> Section (s + 1)
    // Odd s (1S->2S, 3S->4S, ..., 19S->20S) connects on -Z (Right side)
    // Even s (2S->3S, 4S->5S, ..., 18S->19S) connects on +Z (Left side)
    if (s < 20) {
      const nextMeta = groupMeta[s];
      const zBridge = s % 2 === 1 ? -0.0363 : 0.0363;

      if (meta.row === nextMeta.row) {
        // Horizontal in-row series transition (e.g. 1S->2S, 2S->3S, 4S->5S, etc.):
        // Connect the adjacent ends of group s and group s+1 with a wide Nickel + Copper bridge!
        let cellA = groupCells[groupCells.length - 1];
        let cellB = nextMeta.cells[0];
        if (cellA.x > cellB.x) {
          cellA = groupCells[0];
          cellB = nextMeta.cells[nextMeta.cells.length - 1];
        }
        const pA = new THREE.Vector3(cellA.x, cellA.y, zBridge);
        const pB = new THREE.Vector3(cellB.x, cellB.y, zBridge);
        const bridgeCenter = pA.clone().add(pB).multiplyScalar(0.5);
        const bridgeLen = pA.distanceTo(pB) + 0.016;

        const niBridge = new THREE.Mesh(
          new THREE.BoxGeometry(bridgeLen, 0.012, 0.0008),
          sGroup.userData.niMat
        );
        niBridge.position.copy(bridgeCenter);
        niBridge.rotation.z = angle;
        niBridge.userData = { seriesId: s };
        sGroup.add(niBridge);

        const cuBridge = new THREE.Mesh(
          new THREE.BoxGeometry(bridgeLen * 0.9, 0.0055, 0.0018),
          sGroup.userData.busMat
        );
        cuBridge.position.set(bridgeCenter.x, bridgeCenter.y, zBridge + Math.sign(zBridge) * 0.0009);
        cuBridge.rotation.z = angle;
        cuBridge.userData = { seriesId: s };
        sGroup.add(cuBridge);
      } else {
        // Vertical row-to-row turnaround transition (e.g. 3S->4S, 6S->7S, 9S->10S, 12S->13S, 14S->15S, 16S->17S, 18S->19S):
        // Connect all 7 cells of group s directly across to the 7 adjacent cells of group s+1!
        for (let c = 0; c < 7; c++) {
          const cA = groupCells[c];
          const cB = nextMeta.cells[c];
          const pA = new THREE.Vector3(cA.x, cA.y, zBridge);
          const pB = new THREE.Vector3(cB.x, cB.y, zBridge);
          const mid = pA.clone().add(pB).multiplyScalar(0.5);
          const len = pA.distanceTo(pB) + 0.012;
          const crossAngle = Math.atan2(cB.y - cA.y, cB.x - cA.x);

          const niCross = new THREE.Mesh(
            new THREE.BoxGeometry(len, 0.0075, 0.0007),
            sGroup.userData.niMat
          );
          niCross.position.copy(mid);
          niCross.rotation.z = crossAngle;
          niCross.userData = { seriesId: s };
          sGroup.add(niCross);

          // Heavy copper cross-link on every odd parallel pair (c = 0, 2, 4, 6) for 120A current sharing
          if (c % 2 === 0) {
            const cuCross = new THREE.Mesh(
              new THREE.BoxGeometry(len * 0.88, 0.0034, 0.0016),
              sGroup.userData.busMat
            );
            cuCross.position.set(mid.x, mid.y, zBridge + Math.sign(zBridge) * 0.0009);
            cuCross.rotation.z = crossAngle;
            cuCross.userData = { seriesId: s };
            sGroup.add(cuCross);
          }
        }
      }
    }
  }

  // Main B- (0V at 1S on +Z) and Main B+ (84V at 20S on +Z) Heavy Copper Terminal Collector Bars
  const group1S = seriesGroups[0];
  const cell1S_0 = groupMeta[0].cells[0];
  const bMinusCollector = new THREE.Mesh(
    new THREE.BoxGeometry(0.024, 0.014, 0.003),
    mats.MAT_COPPER_BUSBAR
  );
  bMinusCollector.position.set(cell1S_0.x - 0.008, cell1S_0.y + 0.006, 0.0375);
  bMinusCollector.rotation.z = 0.84;
  group1S.add(bMinusCollector);

  const group20S = seriesGroups[19];
  const cell20S_0 = groupMeta[19].cells[0];
  const bPlusCollector = new THREE.Mesh(
    new THREE.BoxGeometry(0.024, 0.014, 0.003),
    mats.MAT_COPPER_BUSBAR
  );
  bPlusCollector.position.set(cell20S_0.x - 0.008, cell20S_0.y + 0.006, 0.0375);
  bPlusCollector.rotation.z = 0.84;
  group20S.add(bPlusCollector);

  batteryRoot.add(cellsMasterGroup);

  // 1.6 Bisida BMS 20S 120A Li-ion in Finned Aluminum Heatsink in upper 48mm gap under Toptube
  // + Full Power Cable Harness (B-, C-, B+ 84V) + 21 Balance Sense Leads (B0..B20) + XT90-S Anti-Spark
  const bmsGroup = new THREE.Group();
  bmsGroup.name = 'EXPLODE_BISIDA_BMS_120A';

  const toptubeAngle = Math.atan2(0.545 - 0.415, 0.395 - (-0.135));
  const bmsPos = new THREE.Vector3(0.095, 0.435, 0);
  const bmsCore = new THREE.Group();
  bmsCore.position.copy(bmsPos);
  bmsCore.rotation.z = toptubeAngle;

  // Finned Aluminum Heatsink Body (145 x 20 x 64 mm)
  const bmsPlate = new THREE.Mesh(new THREE.BoxGeometry(0.145, 0.018, 0.064), mats.MAT_ANODIZED_BLACK);
  bmsCore.add(bmsPlate);

  for (let f = -3; f <= 3; f++) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.142, 0.005, 0.003), mats.MAT_RED_ANODIZED);
    fin.position.set(0, 0.011, f * 0.0085);
    bmsCore.add(fin);
  }

  // White 21-pin JST-XH Balance Connector Header on BMS front edge
  const jstHeader = new THREE.Mesh(new THREE.BoxGeometry(0.088, 0.007, 0.009), mats.MAT_WHITE_INSULATOR);
  jstHeader.position.set(0.010, -0.008, 0.033);
  bmsCore.add(jstHeader);

  // Solder pads B- and C- on BMS left end
  const padBMinus = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.004, 0.022), mats.MAT_COPPER_BUSBAR);
  padBMinus.position.set(-0.064, -0.008, 0.016);
  const padCMinus = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.004, 0.022), mats.MAT_COPPER_BUSBAR);
  padCMinus.position.set(-0.064, -0.008, -0.016);
  bmsCore.add(padBMinus, padCMinus);

  bmsGroup.add(bmsCore);

  // Rear pocket near Seat Tube: Amass XT90-S Anti-Spark Yellow Connector + GX16-3 Charge Port
  const xt90Pos = new THREE.Vector3(-0.085, 0.365, 0.015);
  const xt90Housing = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.022, 0.014), mats.MAT_XT90_YELLOW);
  xt90Housing.position.copy(xt90Pos);
  const xt90AntiSparkBand = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.023, 0.015), mats.MAT_ANODIZED_BLACK);
  xt90AntiSparkBand.position.set(xt90Pos.x + 0.009, xt90Pos.y, xt90Pos.z);
  bmsGroup.add(xt90Housing, xt90AntiSparkBand);

  // Heavy 6AWG Power Cables showing exact electrical connections:
  // 1) B- (Blue 6AWG): from 1S (-) Collector at bottom-rear up along Seat Tube channel to BMS B- pad
  const pBMinusStart = new THREE.Vector3(cell1S_0.x - 0.010, cell1S_0.y + 0.006, 0.037);
  const pBMinusMid = new THREE.Vector3(-0.055, 0.255, 0.035);
  const pBMinusEnd = new THREE.Vector3(0.032, 0.415, 0.018);
  bmsGroup.add(
    createCylinderBetween(pBMinusStart, pBMinusMid, 0.0036, 0.0036, mats.MAT_BLUE_ANODIZED, 12),
    createCylinderBetween(pBMinusMid, pBMinusEnd, 0.0036, 0.0036, mats.MAT_BLUE_ANODIZED, 12)
  );

  // 2) C- (Black 6AWG): from BMS C- pad to Amass XT90-S Negative pin
  const pCMinusStart = new THREE.Vector3(0.032, 0.415, -0.016);
  const pCMinusEnd = new THREE.Vector3(xt90Pos.x + 0.010, xt90Pos.y - 0.005, xt90Pos.z);
  bmsGroup.add(
    createCylinderBetween(pCMinusStart, pCMinusEnd, 0.0036, 0.0036, mats.MAT_ANODIZED_BLACK, 12)
  );

  // 3) B+ 84V (Red 6AWG): from 20S (+) Collector directly to Amass XT90-S Positive pin
  const pBPlusStart = new THREE.Vector3(cell20S_0.x - 0.008, cell20S_0.y + 0.006, 0.037);
  const pBPlusEnd = new THREE.Vector3(xt90Pos.x + 0.010, xt90Pos.y + 0.006, xt90Pos.z);
  bmsGroup.add(
    createCylinderBetween(pBPlusStart, pBPlusEnd, 0.0038, 0.0038, mats.MAT_RED_ANODIZED, 12)
  );

  // 4) 21 Balance Sense Wires (B0..B20) routed from every single series section 1S..20S to BMS JST header!
  for (let s = 1; s <= 20; s++) {
    const meta = groupMeta[s - 1];
    const t = s / 20;
    const jstPinPos = new THREE.Vector3(
      bmsPos.x - 0.032 + t * 0.082,
      bmsPos.y - 0.010 + t * 0.020,
      s % 2 === 1 ? -0.034 : 0.034
    );
    const tapZ = s % 2 === 1 ? -0.0365 : 0.0365;
    const tapCell = meta.cells[Math.min(3, meta.cells.length - 1)];
    const tapPos = new THREE.Vector3(tapCell.x, tapCell.y, tapZ);

    const wireMat = s === 20 ? mats.MAT_XT90_YELLOW : mats.MAT_RED_ANODIZED;
    const senseWire = createCylinderBetween(jstPinPos, tapPos, 0.0008, 0.0008, wireMat, 6);
    bmsGroup.add(senseWire);

    // Solder dot on the busbar balance tap
    const tapDot = new THREE.Mesh(new THREE.SphereGeometry(0.0018, 8, 8), mats.MAT_STEEL_ROTOR);
    tapDot.position.copy(tapPos);
    bmsGroup.add(tapDot);
  }

  // B0 (Black balance ground lead) to 1S (-)
  bmsGroup.add(
    createCylinderBetween(
      new THREE.Vector3(bmsPos.x - 0.036, bmsPos.y - 0.012, 0.034),
      pBMinusStart,
      0.0009,
      0.0009,
      mats.MAT_ANODIZED_BLACK,
      6
    )
  );

  // Teardrop NTC Thermistor glued into center of honeycomb (Row 4 center)
  const ntcStart = new THREE.Vector3(bmsPos.x + 0.02, bmsPos.y - 0.01, 0);
  const ntcEnd = new THREE.Vector3(0.145, 0.275, 0);
  const ntcWire = createCylinderBetween(ntcStart, ntcEnd, 0.0012, 0.0012, mats.MAT_ANODIZED_BLACK, 8);
  const ntcBead = new THREE.Mesh(new THREE.SphereGeometry(0.0035, 12, 12), mats.MAT_ANODIZED_BLACK);
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
