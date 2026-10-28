// ============================================================================
// STEALTH SUR-RON 72V 3000W — NODE 5 (CORDURA 1000D BAG + 20S7P 140x EVE 50E
// HEXAGONAL BATTERY + BISIDA 120A BMS), NODE 6 (60A SIN CONTROLLER + 3D PETG
// WIRING BOX WITH 105 dB HORN & DC-DC), NODE 7 (SUR-RON MOTO SADDLE + SUBFRAME)
// ============================================================================
import * as THREE from 'three';
import { createCylinderBetween, createBiOvalTubeBetween } from './bike_chassis.js';

/**
 * Compute exact 2D coordinates for all 140 21700 cells (EVE INR21700-50E)
 * arranged in a hexagonal honeycomb matrix along the Downtube:
 * - Pitch between cell centers in a row: dU = 0.0227m (22.7mm)
 * - Row-to-row pitch: dV = 0.01966m (19.66mm)
 * - Rows 1, 2, 3, 4 (bottom to mid): 21 cells per row (3 parallel groups 7P per row = 84 cells)
 * - Rows 5, 6, 7, 8 (upper triangle): 14 cells per row (2 parallel groups 7P per row = 56 cells)
 * - TOTAL = 84 + 56 = 140 cells, grouped strictly into 20 series sections (1S..20S of 7 cells each)
 */
export function generate140CellsLayout() {
  // Downtube inner edge vector: from (0.015, 0.015) to (0.415, 0.465)
  const pDown0 = new THREE.Vector2(0.015, 0.015);
  const pDown1 = new THREE.Vector2(0.415, 0.465);
  const uAxis = pDown1.clone().sub(pDown0).normalize(); // along downtube (~48.3 deg)
  const vAxis = new THREE.Vector2(-uAxis.y, uAxis.x);   // inward normal into frame triangle

  const dU = 0.0227;   // 22.7mm cell pitch
  const dV = 0.01966;  // 19.66mm hexagonal row pitch

  // Base origin shifted inside the 15mm EVA foam cocoon above BB & downtube
  const origin = pDown0.clone()
    .addScaledVector(uAxis, 0.048)
    .addScaledVector(vAxis, 0.036);

  const rowCounts = [21, 21, 21, 21, 14, 14, 14, 14]; // Total = 140 cells
  const cells = [];
  let seriesIndex = 0; // 0..19 -> 1S..20S

  for (let r = 0; r < rowCounts.length; r++) {
    const countInRow = rowCounts[r];
    const groupsInRow = countInRow / 7; // 3 groups for rows 0..3, 2 groups for rows 4..7
    const hexStagger = (r % 2) * (dU * 0.5);
    // Shift upper rows slightly forward along uAxis so they nest cleanly in the upper triangle
    const rowStartShift = r >= 4 ? (r - 3) * dU * 0.85 : (r * dU * 0.12);

    for (let g = 0; g < groupsInRow; g++) {
      const currentSeriesId = seriesIndex + 1; // 1..20
      const polarity = currentSeriesId % 2 === 1 ? 1 : -1; // Alternating series polarity

      for (let c = 0; c < 7; c++) {
        const colIdx = g * 7 + c;
        const uDist = rowStartShift + hexStagger + colIdx * dU;
        const vDist = r * dV;

        const pos2D = origin.clone()
          .addScaledVector(uAxis, uDist)
          .addScaledVector(vAxis, vDist);

        cells.push({
          cellGlobalIndex: cells.length + 1,
          row: r + 1,
          col: colIdx + 1,
          seriesId: currentSeriesId, // 1S..20S
          parallelIndex: c + 1,      // 1P..7P
          polarity,
          x: pos2D.x,
          y: pos2D.y
        });
      }
      seriesIndex++;
    }
  }

  return { cells, uAxis, vAxis };
}

/**
 * 1. NODE 5: TACTICAL BAG CORDURA 1000D + INTERNAL X-RAY 20S7P BATTERY (140x EVE 50E)
 */
export function buildBatterySystemNode(mats) {
  const batteryRoot = new THREE.Group();
  batteryRoot.name = 'NODE_05_BATTERY_20S7P_SYSTEM';

  // Inner Triangle Contour (560 x 490 x 360 mm, 70mm head-tube bridge, width 82mm: z = -0.041..+0.041)
  const bagPts = [
    new THREE.Vector2(0.008, 0.032),  // Bottom near BB
    new THREE.Vector2(0.392, 0.458),  // Lower head tube corner
    new THREE.Vector2(0.374, 0.525),  // Upper head tube corner (70mm front bridge)
    new THREE.Vector2(-0.118, 0.400)  // Top seat tube corner
  ];

  const bagShape = new THREE.Shape();
  bagShape.moveTo(bagPts[0].x, bagPts[0].y);
  bagShape.lineTo(bagPts[1].x, bagPts[1].y);
  bagShape.lineTo(bagPts[2].x, bagPts[2].y);
  bagShape.lineTo(bagPts[3].x, bagPts[3].y);
  bagShape.closePath();

  // 1.1 Central Cordura Base + EVA 15mm Damper Cocoon + Velcro 45mm Straps
  const corduraCenterGroup = new THREE.Group();
  corduraCenterGroup.name = 'CORDURA_BAG_CENTER';

  // Perimeter Cordura rim band (width 74mm, z = -0.037..+0.037)
  const bagRimShape = bagShape.clone();
  const innerCutPath = new THREE.Path();
  innerCutPath.moveTo(0.020, 0.056);
  innerCutPath.lineTo(0.372, 0.456);
  innerCutPath.lineTo(0.356, 0.508);
  innerCutPath.lineTo(-0.102, 0.384);
  innerCutPath.closePath();
  bagRimShape.holes.push(innerCutPath);

  const rimExtrude = new THREE.ExtrudeGeometry(bagRimShape, {
    depth: 0.078,
    bevelEnabled: true,
    bevelSize: 0.003,
    bevelThickness: 0.003,
    bevelSegments: 2
  });
  rimExtrude.translate(0, 0, -0.039);
  const corduraRimMesh = new THREE.Mesh(rimExtrude, mats.MAT_CORDURA_1000D);
  corduraCenterGroup.add(corduraRimMesh);

  // Internal 15mm Black EVA Foam Damper Cocoon around perimeter
  const evaExtrude = new THREE.ExtrudeGeometry(bagRimShape, {
    depth: 0.072,
    bevelEnabled: false
  });
  evaExtrude.translate(0, 0, -0.036);
  const evaCocoonMesh = new THREE.Mesh(evaExtrude, mats.MAT_EVA_FOAM);
  evaCocoonMesh.scale.set(0.96, 0.96, 1.0);
  evaCocoonMesh.position.set(0.006, 0.012, 0);
  corduraCenterGroup.add(evaCocoonMesh);

  // 45mm Wide Matte Black Velcro Straps wrapping Toptube, Downtube, and Seat Tube (1:1 as on photo!)
  const strapWidth = 0.045;
  // Toptube straps (3 straps)
  [0.25, 0.52, 0.78].forEach((t) => {
    const p1 = new THREE.Vector3(-0.135, 0.415, 0).lerp(new THREE.Vector3(0.395, 0.545, 0), t);
    const p2 = p1.clone().add(new THREE.Vector3(0.011, 0.0027, 0).normalize().multiplyScalar(strapWidth));
    const strap = createBiOvalTubeBetween(p1, p2, 0.022, 0.043, mats.MAT_VELCRO_STRAP, 20);
    corduraCenterGroup.add(strap);
  });

  // Seat tube straps (2 straps)
  [0.35, 0.70].forEach((t) => {
    const p1 = new THREE.Vector3(0, 0, 0).lerp(new THREE.Vector3(-0.145, 0.435, 0), t);
    const p2 = p1.clone().add(new THREE.Vector3(-0.145, 0.435, 0).normalize().multiplyScalar(strapWidth));
    const strap = createBiOvalTubeBetween(p1, p2, 0.022, 0.042, mats.MAT_VELCRO_STRAP, 20);
    corduraCenterGroup.add(strap);
  });

  batteryRoot.add(corduraCenterGroup);

  // 1.2 Left & Right Removable Side Covers on Waterproof Zippers (z = +0.039 and z = -0.039)
  const leftCoverGroup = new THREE.Group();
  leftCoverGroup.name = 'EXPLODE_CORDURA_LEFT_COVER';
  const coverGeomL = new THREE.ExtrudeGeometry(bagShape, {
    depth: 0.004,
    bevelEnabled: true,
    bevelSize: 0.004,
    bevelThickness: 0.003,
    bevelSegments: 3
  });
  coverGeomL.translate(0, 0, 0.037);
  const leftCoverMesh = new THREE.Mesh(coverGeomL, mats.MAT_CORDURA_1000D);
  leftCoverMesh.castShadow = true;
  leftCoverGroup.add(leftCoverMesh);

  // Diagonal reinforced sewing seam & waterproof zipper ridge on Left Side Cover (matching photo!)
  const zipLineL = createCylinderBetween(
    new THREE.Vector3(-0.112, 0.365, 0.0435),
    new THREE.Vector3(0.372, 0.465, 0.0435),
    0.0035,
    0.0035,
    mats.MAT_VELCRO_STRAP,
    12
  );
  leftCoverGroup.add(zipLineL);
  batteryRoot.add(leftCoverGroup);

  const rightCoverGroup = new THREE.Group();
  rightCoverGroup.name = 'EXPLODE_CORDURA_RIGHT_COVER';
  const coverGeomR = new THREE.ExtrudeGeometry(bagShape, {
    depth: 0.004,
    bevelEnabled: true,
    bevelSize: 0.004,
    bevelThickness: 0.003,
    bevelSegments: 3
  });
  coverGeomR.translate(0, 0, -0.041);
  const rightCoverMesh = new THREE.Mesh(coverGeomR, mats.MAT_CORDURA_1000D);
  rightCoverMesh.castShadow = true;
  rightCoverGroup.add(rightCoverMesh);

  const zipLineR = createCylinderBetween(
    new THREE.Vector3(-0.112, 0.365, -0.0435),
    new THREE.Vector3(0.372, 0.465, -0.0435),
    0.0035,
    0.0035,
    mats.MAT_VELCRO_STRAP,
    12
  );
  rightCoverGroup.add(zipLineR);
  batteryRoot.add(rightCoverGroup);

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
  // Grouped strictly into 20 Series Groups (1S..20S of 7 parallel cells 7P each)
  const { cells, uAxis, vAxis } = generate140CellsLayout();
  const cellsMasterGroup = new THREE.Group();
  cellsMasterGroup.name = 'CELLS_20S7P_140_ARRAY';

  const seriesGroups = [];
  for (let s = 1; s <= 20; s++) {
    const sGroup = new THREE.Group();
    sGroup.name = `BATTERY_SECTION_${s}S`;
    sGroup.userData = {
      seriesId: s,
      code: `${s}S7P`,
      voltage: 4.20,
      capacityAh: 35.0,
      cellModel: 'EVE INR21700-50E',
      bmsChannel: `CH-${String(s).padStart(2, '0')}`,
      ntcTemp: (26.6 + (s % 5) * 0.2).toFixed(1)
    };
    seriesGroups.push(sGroup);
    cellsMasterGroup.add(sGroup);
  }

  // Shared geometries for the 140 cells
  const cellBodyGeom = new THREE.CylinderGeometry(0.0106, 0.0106, 0.0705, 20);
  cellBodyGeom.rotateX(Math.PI / 2); // Align along Z axis

  const insRingGeom = new THREE.RingGeometry(0.0045, 0.0102, 18);
  const posTermGeom = new THREE.CylinderGeometry(0.0045, 0.0045, 0.0012, 16);
  posTermGeom.rotateX(Math.PI / 2);

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
    // Clone material per series group so X-Ray hover can highlight 1 group and fade the other 19!
    if (!sGroup.userData.cellMat) {
      sGroup.userData.cellMat = mats.MAT_CELL_EVE50E.clone();
      sGroup.userData.busMat = mats.MAT_COPPER_BUSBAR.clone();
      sGroup.userData.niMat = mats.MAT_NICKEL_STRIP.clone();
    }

    const cellMesh = new THREE.Mesh(cellBodyGeom, sGroup.userData.cellMat);
    cellMesh.position.set(cell.x, cell.y, 0);
    cellMesh.userData = { seriesId: cell.seriesId, cellIndex: cell.cellGlobalIndex };
    sGroup.add(cellMesh);

    // White insulation ring + steel button on positive terminal end (z = ±0.0353)
    const posZ = cell.polarity === 1 ? 0.0354 : -0.0354;
    const insRing = new THREE.Mesh(insRingGeom, mats.MAT_WHITE_INSULATOR);
    insRing.position.set(cell.x, cell.y, posZ);
    if (cell.polarity === -1) insRing.rotation.y = Math.PI;
    sGroup.add(insRing);

    const termBtn = new THREE.Mesh(posTermGeom, mats.MAT_STEEL_ROTOR);
    termBtn.position.set(cell.x, cell.y, posZ);
    sGroup.add(termBtn);

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

  // Add outer PETG frame rails around the 140 hex sockets
  const holderPerimGeomL = new THREE.ExtrudeGeometry(bagRimShape, { depth: 0.010, bevelEnabled: false });
  holderPerimGeomL.scale(0.92, 0.92, 1);
  holderPerimGeomL.translate(0.010, 0.022, 0.024);
  holderLeftGroup.add(new THREE.Mesh(holderPerimGeomL, mats.MAT_PETG_HOLDER));

  const holderPerimGeomR = holderPerimGeomL.clone();
  holderPerimGeomR.translate(0, 0, -0.058);
  holderRightGroup.add(new THREE.Mesh(holderPerimGeomR, mats.MAT_PETG_HOLDER));

  batteryRoot.add(holderLeftGroup, holderRightGroup);

  // 1.5 Pure Nickel Strips (0.15 x 8 mm) with Spot-Weld Dimples + Soldered Tinned Copper Busbars (1.5-2.5 mm²)
  // on both ends of each 7P parallel section (z = ±0.036)
  for (let s = 1; s <= 20; s++) {
    const sGroup = seriesGroups[s - 1];
    const groupCells = cells.filter((c) => c.seriesId === s);
    const firstCell = groupCells[0];
    const lastCell = groupCells[groupCells.length - 1];

    [-0.036, 0.036].forEach((zEnd) => {
      const pStart = new THREE.Vector3(firstCell.x, firstCell.y, zEnd);
      const pEnd = new THREE.Vector3(lastCell.x, lastCell.y, zEnd);
      const stripLen = pStart.distanceTo(pEnd) + 0.016;
      const stripCenter = pStart.clone().add(pEnd).multiplyScalar(0.5);
      const angle = Math.atan2(lastCell.y - firstCell.y, lastCell.x - firstCell.x);

      // 0.15 x 8mm Pure Nickel Strip
      const niGeom = new THREE.BoxGeometry(stripLen, 0.008, 0.0006);
      const niStrip = new THREE.Mesh(niGeom, sGroup.userData.niMat);
      niStrip.position.copy(stripCenter);
      niStrip.rotation.z = angle;
      niStrip.userData = { seriesId: s };
      sGroup.add(niStrip);

      // Tinned Copper Busbar (2.5 mm²) soldered atop the nickel strip for 80A-120A continuous current
      const cuGeom = new THREE.BoxGeometry(stripLen * 0.94, 0.0032, 0.0014);
      const cuBus = new THREE.Mesh(cuGeom, sGroup.userData.busMat);
      cuBus.position.set(stripCenter.x, stripCenter.y, zEnd + Math.sign(zEnd) * 0.0008);
      cuBus.rotation.z = angle;
      cuBus.userData = { seriesId: s };
      sGroup.add(cuBus);
    });
  }

  batteryRoot.add(cellsMasterGroup);

  // 1.6 Bisida BMS 20S 120A Li-ion in Finned Aluminum Heatsink in upper 48mm gap under Toptube
  const bmsGroup = new THREE.Group();
  bmsGroup.name = 'EXPLODE_BISIDA_BMS_120A';

  // Upper triangle clearance under Toptube: center around (0.140, 0.435, 0), tilted along Toptube
  const toptubeAngle = Math.atan2(0.545 - 0.415, 0.395 - (-0.135));
  const bmsCore = new THREE.Group();
  bmsCore.position.set(0.145, 0.432, 0);
  bmsCore.rotation.z = toptubeAngle;

  // Finned Aluminum Heatsink Body (145 x 22 x 66 mm)
  const bmsPlate = new THREE.Mesh(new THREE.BoxGeometry(0.145, 0.018, 0.064), mats.MAT_ANODIZED_BLACK);
  bmsCore.add(bmsPlate);

  for (let f = -3; f <= 3; f++) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.142, 0.005, 0.003), mats.MAT_RED_ANODIZED);
    fin.position.set(0, 0.011, f * 0.0085);
    bmsCore.add(fin);
  }

  // Thick 6AWG Silicone B- (Blue) and C-/P- (Black) Power Leads + 21-wire Balance Harness + NTC Sensor
  for (let w = 0; w < 21; w++) {
    const t = w / 20;
    const wireStart = new THREE.Vector3(-0.055 + t * 0.11, -0.009, 0.030);
    const wireEnd = new THREE.Vector3(-0.065 + t * 0.13, -0.055 - (w % 3) * 0.018, 0.035);
    const bWire = createCylinderBetween(wireStart, wireEnd, 0.0009, 0.0009, mats.MAT_RED_ANODIZED, 6);
    bmsCore.add(bWire);
  }

  // Teardrop NTC Thermistor glued into center of honeycomb
  const ntcWire = createCylinderBetween(
    new THREE.Vector3(0.01, -0.009, 0),
    new THREE.Vector3(0.02, -0.110, 0),
    0.0014,
    0.0014,
    mats.MAT_ANODIZED_BLACK,
    8
  );
  const ntcBead = new THREE.Mesh(new THREE.SphereGeometry(0.0035, 12, 12), mats.MAT_ANODIZED_BLACK);
  ntcBead.position.set(0.02, -0.110, 0);
  bmsCore.add(ntcWire, ntcBead);

  // Rear pocket near Seat Tube: Amass XT90-S Anti-Spark Yellow Connector with black stripe + GX16 Charge Port
  const xt90Housing = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.022, 0.012), mats.MAT_XT90_YELLOW);
  xt90Housing.position.set(-0.115, -0.035, 0.012);
  const xt90AntiSparkBand = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.023, 0.013), mats.MAT_ANODIZED_BLACK);
  xt90AntiSparkBand.position.set(-0.106, -0.035, 0.012);
  bmsCore.add(xt90Housing, xt90AntiSparkBand);

  bmsGroup.add(bmsCore);
  batteryRoot.add(bmsGroup);

  return {
    batteryRoot,
    seriesGroups,
    leftCoverGroup,
    rightCoverGroup,
    holderLeftGroup,
    holderRightGroup,
    bmsGroup,
    pvcSleeveMesh,
    corduraCenterGroup
  };
}

/**
 * 2. NODE 6: LOWER UNDER-TUBE MODULE (60A 18-MOSFET SINE CONTROLLER + 3D-PRINTED PETG WIRING BOX
 *    WITH ACOUSTIC GILLS, DC-DC 12V 10A CONVERTER & HIDDEN 105 dB HORN)
 *    Strictly mounted OUTSIDE UNDER the Downtube (1:1 as on reference photo!)
 */
export function buildUnderTubeModuleNode(mats) {
  const underTubeRoot = new THREE.Group();
  underTubeRoot.name = 'NODE_06_CONTROLLER_60A_AND_3DBOX';

  // Downtube centerline goes from (0.015, 0.015, 0) to (0.415, 0.465, 0)
  const pDown0 = new THREE.Vector3(0.015, 0.015, 0);
  const pDown1 = new THREE.Vector3(0.415, 0.465, 0);
  const downAxis = pDown1.clone().sub(pDown0).normalize();
  const downAngle = Math.atan2(downAxis.y, downAxis.x);
  // Outward/downward normal under the downtube: (+Y_x, -X_y)
  const downNormal = new THREE.Vector3(downAxis.y, -downAxis.x, 0).normalize();

  // Group A (Explodable): 72V 60A (18 MOSFET) Finned Aluminum Controller + 3D Box Outer Cover
  const controllerAndLidGroup = new THREE.Group();
  controllerAndLidGroup.name = 'EXPLODE_CONTROLLER_60A_AND_LID';

  // 2.1 Sine Controller 72V 60A (18 MOSFET) hanging on 3 heavy-duty black straps in upper/middle under-tube
  const ctrlPos = pDown0.clone().lerp(pDown1, 0.64).addScaledVector(downNormal, 0.048);
  const ctrlLocal = new THREE.Group();
  ctrlLocal.position.copy(ctrlPos);
  ctrlLocal.rotation.z = downAngle;

  // Main extruded matte black aluminum body (215mm long x 52mm tall x 86mm wide)
  const ctrlBody = new THREE.Mesh(new THREE.BoxGeometry(0.215, 0.046, 0.086), mats.MAT_FRAME_RAL9005);
  ctrlBody.castShadow = true;
  ctrlLocal.add(ctrlBody);

  // Longitudinal airflow cooling fins open to oncoming wind
  for (let f = -4; f <= 4; f++) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.212, 0.010, 0.0035), mats.MAT_ANODIZED_BLACK);
    fin.position.set(0, -0.026, f * 0.009);
    ctrlLocal.add(fin);
  }

  // 3 heavy-duty 35mm black Velcro mounting straps wrapping around controller AND downtube (1:1 as on photo!)
  [-0.075, 0.0, 0.075].forEach((xOff) => {
    const strapGeom = new THREE.BoxGeometry(0.032, 0.105, 0.092);
    const strap = new THREE.Mesh(strapGeom, mats.MAT_VELCRO_STRAP);
    strap.position.set(xOff, 0.024, 0);
    ctrlLocal.add(strap);
  });

  controllerAndLidGroup.add(ctrlLocal);

  // 2.2 Faceted Matte Black 3D-Printed PETG Sealed Wiring Box right below Controller near BB (1:1 as on photo!)
  const boxPos = pDown0.clone().lerp(pDown1, 0.23).addScaledVector(downNormal, 0.052);
  const boxLidLocal = new THREE.Group();
  boxLidLocal.position.copy(boxPos);
  boxLidLocal.rotation.z = downAngle;

  // Outer faceted aerodynamic PETG shell with backward-slanted acoustic gill slits ("scales")
  const lidMain = new THREE.Mesh(new THREE.BoxGeometry(0.175, 0.064, 0.084), mats.MAT_PETG_HOLDER);
  lidMain.castShadow = true;
  boxLidLocal.add(lidMain);

  // Chamfered lower nose near BB
  const noseBevel = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.048, 0.080), mats.MAT_PETG_HOLDER);
  noseBevel.position.set(-0.082, 0.006, 0);
  noseBevel.rotation.z = 0.38;
  boxLidLocal.add(noseBevel);

  // Slanted Acoustic Gill Louvers ("scales") on lower & side walls for the hidden 105 dB horn
  for (let g = 0; g < 6; g++) {
    const gill = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.028, 0.088), mats.MAT_ANODIZED_BLACK);
    gill.position.set(-0.035 + g * 0.014, -0.014, 0);
    gill.rotation.z = -0.45;
    boxLidLocal.add(gill);
  }

  controllerAndLidGroup.add(boxLidLocal);
  underTubeRoot.add(controllerAndLidGroup);

  // 2.3 Internal Fixed Tray of 3D Box (Revealed when Controller + Lid explode downward-forward!):
  //     - DC-DC Step-Down Converter (36-120V -> 12V 10A)
  //     - Heavy-duty 3-Phase Yellow Ceramic/Phenolic Terminal Block (U / V / W)
  //     - Round 105 dB (12V) Motorcycle Horn on spring bracket facing the acoustic gills!
  const boxInternals = new THREE.Group();
  boxInternals.name = '3DBOX_INTERNAL_COMPONENTS';
  boxInternals.position.copy(boxPos);
  boxInternals.rotation.z = downAngle;

  // Internal mounting baseplate attached to Downtube
  const baseTray = new THREE.Mesh(new THREE.BoxGeometry(0.165, 0.010, 0.074), mats.MAT_PETG_HOLDER);
  baseTray.position.set(0, 0.024, 0);
  boxInternals.add(baseTray);

  // DC-DC Converter 36-120V -> 12V 10A (ribbed silver/black module)
  const dcdcModule = new THREE.Mesh(new THREE.BoxGeometry(0.058, 0.022, 0.046), mats.MAT_STEEL_ROTOR);
  dcdcModule.position.set(0.042, 0.008, 0);
  boxInternals.add(dcdcModule);

  // 3-Phase High-Current Terminal Block (Yellow W20 block with 3 M5 brass studs: Blue/Green/Yellow)
  const phaseBlock = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.018, 0.052), mats.MAT_XT90_YELLOW);
  phaseBlock.position.set(-0.008, 0.010, 0);
  boxInternals.add(phaseBlock);

  // Hidden Round 105 dB (12V) Moto Horn mounted on spring steel bracket opposite acoustic gills
  const hornDisc = createCylinderBetween(
    new THREE.Vector3(-0.052, -0.004, -0.014),
    new THREE.Vector3(-0.052, -0.004, 0.014),
    0.031,
    0.031,
    mats.MAT_ANODIZED_BLACK,
    24
  );
  const hornCenter = createCylinderBetween(
    new THREE.Vector3(-0.052, -0.004, -0.016),
    new THREE.Vector3(-0.052, -0.004, 0.016),
    0.012,
    0.012,
    mats.MAT_RED_ANODIZED,
    18
  );
  boxInternals.add(hornDisc, hornCenter);

  underTubeRoot.add(boxInternals);

  return {
    underTubeRoot,
    controllerAndLidGroup,
    boxInternals
  };
}

/**
 * 3. NODE 7: LONG SUR-RON / PITBIKE MOTO SADDLE (530MM) + WELDED STEEL SUBFRAME
 *    + SHORT REAR FENDER WITH INTEGRATED RED LED BRAKE LIGHT
 */
export function buildMotoSaddleAndSubframeNode(mats) {
  const saddleSystemRoot = new THREE.Group();
  saddleSystemRoot.name = 'NODE_07_MOTO_SADDLE_AND_SUBFRAME';

  // 3.1 Welded Steel Subframe (16-20mm Matte Black Tubes, 2mm wall)
  // Explodes by (-0.05, +0.12, 0)
  const subframeGroup = new THREE.Group();
  subframeGroup.name = 'EXPLODE_STEEL_SUBFRAME';

  // Front support post inserting into Seat Tube top (-0.145, 0.435, 0)
  const frontPost = createCylinderBetween(
    new THREE.Vector3(-0.145, 0.415, 0),
    new THREE.Vector3(-0.155, 0.468, 0),
    0.0135,
    0.0135,
    mats.MAT_FRAME_RAL9005,
    20
  );
  subframeGroup.add(frontPost);

  // Upper twin longitudinal subframe rails under saddle pan + Two inclined rear struts
  // descending from saddle tail to bolt onto frame seatstays with M6 bolts (1:1 as on photo!)
  [-1, 1].forEach((side) => {
    const zRail = side * 0.042;
    const zStayBolt = side * 0.038;

    // Upper support rail under seat pan
    const upperRail = createCylinderBetween(
      new THREE.Vector3(-0.145, 0.462, side * 0.022),
      new THREE.Vector3(-0.525, 0.565, zRail),
      0.009,
      0.009,
      mats.MAT_FRAME_RAL9005,
      16
    );
    subframeGroup.add(upperRail);

    // Inclined rear strut descending from tail (-0.485, 0.548) to seatstay mount (-0.255, 0.250)
    const rearStrut = createCylinderBetween(
      new THREE.Vector3(-0.485, 0.548, zRail),
      new THREE.Vector3(-0.255, 0.250, zStayBolt),
      0.009,
      0.009,
      mats.MAT_FRAME_RAL9005,
      16
    );
    subframeGroup.add(rearStrut);

    // M6 Stainless Bolt at seatstay bracket
    const m6Bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.016, 10), mats.MAT_STEEL_ROTOR);
    m6Bolt.rotation.x = Math.PI / 2;
    m6Bolt.position.set(-0.255, 0.250, zStayBolt + side * 0.006);
    subframeGroup.add(m6Bolt);
  });

  // Cross-braces between left and right subframe rails
  [-0.26, -0.45].forEach((xBrace) => {
    const yBrace = xBrace === -0.26 ? 0.492 : 0.542;
    const brace = createCylinderBetween(
      new THREE.Vector3(xBrace, yBrace, -0.036),
      new THREE.Vector3(xBrace, yBrace, 0.036),
      0.008,
      0.008,
      mats.MAT_FRAME_RAL9005,
      12
    );
    subframeGroup.add(brace);
  });

  saddleSystemRoot.add(subframeGroup);

  // 3.2 Long Two-Seater Sur-Ron / Pitbike Moto Saddle (Length 530mm) + Rear Fender with LED Brake Light
  // Explodes upward-backward by (-0.10, +0.24, 0)
  const saddleAndFenderGroup = new THREE.Group();
  saddleAndFenderGroup.name = 'EXPLODE_MOTO_SADDLE_530MM';

  // Side silhouette profile of the 530mm Sur-Ron saddle (from x = -0.055 nose to x = -0.585 tail):
  // - Smooth 45mm nose flush with Cordura bag over top of seat tube
  // - U-shaped bottom channel (40x70mm) seating deeply onto seat tube top (-0.145, 0.435)
  // - Deep 75-80mm anatomical rider pocket in center
  // - Sleek narrow 55mm upward-swept tail at rear
  const saddleSideShape = new THREE.Shape();
  saddleSideShape.moveTo(-0.055, 0.448); // Front nose tip flush with Cordura bag
  saddleSideShape.quadraticCurveTo(-0.095, 0.495, -0.165, 0.505); // Front rise (45mm)
  saddleSideShape.bezierCurveTo(-0.255, 0.515, -0.340, 0.545, -0.445, 0.585); // Deep anatomical dish (75-80mm)
  saddleSideShape.quadraticCurveTo(-0.525, 0.612, -0.585, 0.625); // Upward swept narrow tail
  saddleSideShape.lineTo(-0.570, 0.572); // Bottom rear tail edge (55mm thickness)
  saddleSideShape.quadraticCurveTo(-0.430, 0.525, -0.260, 0.468); // Bottom base pan
  // U-shaped 40x70mm bottom slot saddle channel over Seat Tube top (-0.145, 0.435)
  saddleSideShape.lineTo(-0.180, 0.465);
  saddleSideShape.lineTo(-0.175, 0.432);
  saddleSideShape.lineTo(-0.115, 0.432);
  saddleSideShape.lineTo(-0.108, 0.452);
  saddleSideShape.lineTo(-0.055, 0.448);
  saddleSideShape.closePath();

  const saddleGeom = new THREE.ExtrudeGeometry(saddleSideShape, {
    steps: 2,
    depth: 0.148,
    bevelEnabled: true,
    bevelThickness: 0.018,
    bevelSize: 0.014,
    bevelSegments: 8
  });
  saddleGeom.translate(0, 0, -0.074);

  // Sculpt anatomical 3D width taper (narrow nose 86mm -> wide rider mid 165mm -> sharp tail 68mm)
  const sPos = saddleGeom.attributes.position;
  for (let i = 0; i < sPos.count; i++) {
    const x = sPos.getX(i);
    const y = sPos.getY(i);
    const z = sPos.getZ(i);

    // Normalized longitudinal parameter t from nose (-0.055, t=0) to tail (-0.585, t=1)
    const t = Math.max(0, Math.min(1, (-0.055 - x) / 0.530));
    // Width profile curve: narrow at nose, wide at mid-rear (t~0.48), narrow pointed tail (t=1.0)
    const widthScale = 0.55 + Math.sin(t * Math.PI) * 0.58 * (1.0 - t * 0.32);
    // Round the top crown of the foam cushion
    const crownDrop = (z * z) * 1.45;
    sPos.setZ(i, z * widthScale);
    sPos.setY(i, y - crownDrop);
  }
  saddleGeom.computeVertexNormals();

  const saddleMesh = new THREE.Mesh(saddleGeom, mats.MAT_MOTO_VINYL);
  saddleMesh.castShadow = true;
  saddleMesh.receiveShadow = true;
  saddleAndFenderGroup.add(saddleMesh);

  // Short Black Pitbike Tail Fender + Integrated Red LED Brake Light right under saddle tail tip
  const rearFenderCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.480, 0.545, 0),
    new THREE.Vector3(-0.565, 0.565, 0),
    new THREE.Vector3(-0.635, 0.555, 0)
  ]);
  const rearFenderGeom = new THREE.TubeGeometry(rearFenderCurve, 16, 0.032, 12, false);
  const rfPos = rearFenderGeom.attributes.position;
  for (let i = 0; i < rfPos.count; i++) {
    rfPos.setY(i, rfPos.getY(i) * 0.985);
  }
  rearFenderGeom.computeVertexNormals();
  const rearFender = new THREE.Mesh(rearFenderGeom, mats.MAT_PETG_HOLDER);
  rearFender.scale.set(1, 0.25, 1.3);
  rearFender.position.set(0, 0.422, 0);
  saddleAndFenderGroup.add(rearFender);

  // Integrated Red LED Stop-Light bar under rear tail tip (-0.575, 0.558, 0)
  const brakeLightHousing = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.018, 0.068), mats.MAT_ANODIZED_BLACK);
  brakeLightHousing.position.set(-0.572, 0.558, 0);
  brakeLightHousing.rotation.z = 0.22;

  const brakeLightLens = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.013, 0.060), mats.MAT_BRAKE_LED);
  brakeLightLens.position.set(-0.583, 0.556, 0);
  brakeLightLens.rotation.z = 0.22;
  brakeLightLens.name = 'REAR_LED_BRAKE_LIGHT';

  saddleAndFenderGroup.add(brakeLightHousing, brakeLightLens);
  saddleSystemRoot.add(saddleAndFenderGroup);

  return {
    saddleSystemRoot,
    subframeGroup,
    saddleAndFenderGroup,
    brakeLightLens
  };
}
