// ============================================================================
// STEALTH SUR-RON 72V 3000W — NODE 5 (CORDURA 1000D BAG + 20S7P 140x EVE 50E
// 5-TIER 6+5+4+3+2 HEXAGONAL TRIANGLE BATTERY + BISIDA 120A BMS),
// NODE 6 (60A FINNED CONTROLLER + STEPPED 3D PETG WIRING BOX WITH 105 dB HORN),
// NODE 7 (LOW-PROFILE SUR-RON MOTO SADDLE + COMPACT 2-BOLT SUBFRAME + TAIL FENDER)
// ============================================================================
import * as THREE from 'three';
import { createCylinderBetween, createBiOvalTubeBetween } from './bike_chassis.js';
import { createBatterySeriesLabelMaterial, getSeriesXRayColor } from './materials.js';

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
 * Compute exact 2D coordinates for all 140 21700 cells (EVE INR21700-50E, Ø21.2mm × 70.5mm)
 * arranged in a PERFECT 9-ROW HEXAGONAL TRIANGLE inside the Stern frame triangle (560 × 490 × 360 mm):
 *
 * - Row 1 (longest, along Downtube): 22 cells
 * - Row 2 (honeycomb half-step shift): 21 cells
 * - Row 3: 19 cells
 * - Row 4: 18 cells
 * - Row 5: 16 cells
 * - Row 6: 15 cells
 * - Row 7: 13 cells
 * - Row 8:  9 cells
 * - Row 9 (top triangular ridge under Bisida BMS): 7 cells
 *   SUM CHECK: 22 + 21 + 19 + 18 + 16 + 15 + 13 + 9 + 7 = EXACTLY 140 CELLS (20S7P)!
 *
 * Partitioned into 20 connected serpentine 7P groups (Group_1S .. Group_20S):
 * - Odd sections (1S, 3S ... 19S): PLUS (+Z Left side), MINUS (-Z Right side)
 * - Even sections (2S, 4S ... 20S): PLUS (-Z Right side), MINUS (+Z Left side)
 */
export function generate140CellsLayout() {
  // Three vertices of the 140-cell triangle filling the inner frame triangle (560 x 490 x 360 mm)
  const T_A = new THREE.Vector2(0.016, 0.048);  // Bottom vertex near BB
  const T_B = new THREE.Vector2(0.376, 0.466);  // Front-top vertex near Head Tube
  const T_C = new THREE.Vector2(-0.104, 0.380); // Rear-top apex near Seat Tube / Toptube

  const uAxis = T_B.clone().sub(T_A).normalize();
  const vAxis = new THREE.Vector2(-uAxis.y, uAxis.x);

  // Exact 9 triangular honeycomb rows specified in Patch #2 (Sum = 140 cells)
  const rowCounts = [22, 21, 19, 18, 16, 15, 13, 9, 7];
  const kVals = [0, 1, 2, 3, 4, 5, 6, 9, 10]; // Half-step hexagonal honeycomb offsets
  const du = 0.0227;   // 22.7 mm center-to-center pitch
  const dv = 0.01966;  // 19.66 mm row pitch (22.7 * sqrt(3)/2)
  const v0 = 0.009;

  // 1. Generate cell coordinates along each of the 9 triangular honeycomb rows
  const rows = [];
  for (let r = 0; r < rowCounts.length; r++) {
    const cnt = rowCounts[r];
    const v = v0 + r * dv;
    const uStart = 0.014 + kVals[r] * (du * 0.5);
    const rowCells = [];
    for (let c = 0; c < cnt; c++) {
      const u = uStart + c * du;
      const x = T_A.x + u * uAxis.x + v * vAxis.x;
      const y = T_A.y + u * uAxis.y + v * vAxis.y;
      rowCells.push({
        row: r + 1,
        col: c + 1,
        u,
        v,
        t: cnt > 1 ? c / (cnt - 1) : 0.5,
        x,
        y
      });
    }
    rows.push(rowCells);
  }

  // 2. Partition into 20 compact, 100% connected 7-cell honeycomb clusters (Group_1S .. Group_20S)
  const b1 = [...rows[0], ...rows[1]].sort((a, b) => (a.u - b.u) || (a.row - b.row));
  const idxR2Last = b1.findIndex((c) => c.row === 2 && c.col === 21);
  const cellR2Last = b1.splice(idxR2Last, 1)[0];
  b1.push(cellR2Last);

  const b2 = [...rows[2], ...rows[3]].sort((a, b) => (b.u - a.u) || (a.row - b.row));
  const b3 = [...rows[4], ...rows[5]].sort((a, b) => (a.u - b.u) || (a.row - b.row));
  const b4 = [...rows[6], ...rows[7]].sort((a, b) => (b.u - a.u) || (a.row - b.row));
  const b5 = [...rows[8]].sort((a, b) => a.u - b.u);

  const snakeCells = [...b1, ...b2, ...b3, ...b4, ...b5];

  const cells = [];
  const groupMeta = [];

  for (let s = 1; s <= 20; s++) {
    // Spec 1.2: Odd sections (1S, 3S..19S) have PLUS on LEFT side (+Z -> polarityOnLeft = +1)
    //           Even sections (2S, 4S..20S) have PLUS on RIGHT side (-Z -> polarityOnLeft = -1)
    const polarityOnLeft = s % 2 === 1 ? 1 : -1;
    const rawCluster = snakeCells.slice((s - 1) * 7, s * 7);
    rawCluster.sort((a, b) => (a.row - b.row) || (a.col - b.col));

    const firstRowNum = rawCluster[0].row;
    const groupCells = rawCluster.map((rc, pIdx) => {
      const cellObj = {
        cellGlobalIndex: cells.length + 1,
        row: rc.row,
        col: rc.col,
        u: rc.u,
        v: rc.v,
        zone: Math.ceil(rc.row / 2),
        seriesId: s,
        parallelIndex: pIdx + 1,
        polarity: polarityOnLeft,
        subRow: rc.row === firstRowNum ? 0 : 1,
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
      seriesId: s,
      zone: Math.ceil(firstRowNum / 2),
      row: firstRowNum,
      polarityOnLeft,
      cells: groupCells,
      cellsRowA,
      cellsRowB,
      center: new THREE.Vector2(cx, cy),
      xrayColor: getSeriesXRayColor(s)
    });
  }

  // Dielectric FR4 fiberglass barrier strips separating the triangular row tiers
  const zoneBarriers = [0.155, 0.345, 0.535, 0.755].map((sBar) => ({
    pLeft: new THREE.Vector2(T_A.x + sBar * (T_C.x - T_A.x), T_A.y + sBar * (T_C.y - T_A.y)),
    pRight: new THREE.Vector2(T_B.x + sBar * (T_C.x - T_B.x), T_B.y + sBar * (T_C.y - T_B.y))
  }));

  return { cells, groupMeta, rows, rowCounts, uAxis, vAxis, zoneBarriers, triangleVertices: { T_A, T_B, T_C } };
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

  // 7 Wide 45mm Matte Black Velcro Straps around Toptube (3), Seat Tube (2) & Downtube (2) + Reinforced D-Ring Buckles (Spec 1.3 & Photo #3!)
  const strapWidth = 0.045;
  [0.24, 0.48, 0.72].forEach((t) => {
    const p1 = new THREE.Vector3(-0.135, 0.415, 0).lerp(new THREE.Vector3(0.395, 0.545, 0), t);
    const dir = new THREE.Vector3(0.530, 0.130, 0).normalize();
    const p2 = p1.clone().addScaledVector(dir, strapWidth);
    const strap = createBiOvalTubeBetween(p1, p2, 0.022, 0.043, mats.MAT_VELCRO_STRAP, 28);
    corduraCenterGroup.add(strap);

    // Anodized Metal Cinch Buckle on Left side of each strap
    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.008, 0.004), mats.MAT_ANODIZED_BLACK);
    buckle.position.copy(p1.clone().lerp(p2, 0.5)).add(new THREE.Vector3(0, -0.018, 0.042));
    buckle.rotation.z = Math.atan2(dir.y, dir.x);
    corduraCenterGroup.add(buckle);
  });

  [0.24, 0.68].forEach((t) => {
    const p1 = new THREE.Vector3(0, 0, 0).lerp(new THREE.Vector3(-0.145, 0.435, 0), t);
    const dir = new THREE.Vector3(-0.145, 0.435, 0).normalize();
    const p2 = p1.clone().addScaledVector(dir, strapWidth);
    const strap = createBiOvalTubeBetween(p1, p2, 0.021, 0.042, mats.MAT_VELCRO_STRAP, 28);
    corduraCenterGroup.add(strap);

    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.008, 0.004), mats.MAT_ANODIZED_BLACK);
    buckle.position.copy(p1.clone().lerp(p2, 0.5)).add(new THREE.Vector3(0.016, 0, 0.041));
    buckle.rotation.z = Math.atan2(dir.y, dir.x);
    corduraCenterGroup.add(buckle);
  });

  // 2 Additional 45mm Velcro Straps wrapping the Cordura bag around the Downtube (Total = 3 + 2 + 2 = 7 Velcro straps on the bag!)
  [0.38, 0.74].forEach((t) => {
    const p1 = new THREE.Vector3(0.015, 0.015, 0).lerp(new THREE.Vector3(0.415, 0.465, 0), t);
    const dir = new THREE.Vector3(0.400, 0.450, 0).normalize();
    const p2 = p1.clone().addScaledVector(dir, strapWidth);
    const strap = createBiOvalTubeBetween(p1, p2, 0.026, 0.043, mats.MAT_VELCRO_STRAP, 28);
    corduraCenterGroup.add(strap);

    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.008, 0.004), mats.MAT_ANODIZED_BLACK);
    buckle.position.copy(p1.clone().lerp(p2, 0.5)).add(new THREE.Vector3(-0.012, 0.012, 0.042));
    buckle.rotation.z = Math.atan2(dir.y, dir.x);
    corduraCenterGroup.add(buckle);
  });

  batteryRoot.add(corduraCenterGroup);

  // Helper to build detailed Cordura Side Cover with 3D fabric tension folds, rounded perimeter piping (кедер),
  // wide top sewn zipper storm flap (клапан над молнией как на фото!) & waterproof zipper with puller tabs
  function buildDetailedCorduraSideCover(sideSign, name) {
    const group = new THREE.Group();
    group.name = name;

    const coverGeom = new THREE.ExtrudeGeometry(bagShape, {
      depth: 0.006,
      bevelEnabled: true,
      bevelSize: 0.0025,
      bevelThickness: 0.0025,
      bevelSegments: 6
    });
    coverGeom.translate(0, 0, sideSign > 0 ? 0.0385 : -0.0445);

    // Realistic 3D textile pillowing + natural diagonal fabric tension folds radiating from Velcro straps & bottom corner (1:1 as on Photo!)
    const cPos = coverGeom.attributes.position;
    for (let i = 0; i < cPos.count; i++) {
      const vx = cPos.getX(i);
      const vy = cPos.getY(i);
      const vz = cPos.getZ(i);
      if (Math.sign(vz) === sideSign && Math.abs(vz) > 0.0405) {
        // Gentle outward cushion bulge in the center of the triangle + diagonal fabric folds
        const distCenter = Math.hypot(vx - 0.14, vy - 0.32);
        const cushion = Math.max(0, 0.0032 * (1.0 - Math.pow(distCenter / 0.28, 1.6)));
        const fold1 = Math.sin((vx * 18.0 - vy * 14.0) + 0.6) * 0.0014;
        const fold2 = Math.cos((vx * 29.0 + vy * 21.0) - 0.3) * 0.0009;
        const fold3 = Math.sin((vx * 9.0 - vy * 24.0)) * 0.0011;
        cPos.setZ(i, vz + sideSign * (cushion + fold1 + fold2 + fold3));
      }
    }
    coverGeom.computeVertexNormals();

    const coverMesh = new THREE.Mesh(coverGeom, mats.MAT_CORDURA_1000D);
    coverMesh.castShadow = true;
    coverMesh.receiveShadow = true;
    group.add(coverMesh);

    // Continuous Rounded Perimeter Nylon Piping (тканевый кедер + окантовочная стропа по контуру сумки, без угловатых шариков!)
    const zPiping = sideSign * 0.0442;
    const contourPts2D = bagShape.getPoints(64);
    const pipingPts3D = contourPts2D.map((pt) => new THREE.Vector3(pt.x, pt.y, zPiping));
    const pipingCurve = new THREE.CatmullRomCurve3(pipingPts3D, true);
    const pipingTube = new THREE.Mesh(
      new THREE.TubeGeometry(pipingCurve, 96, 0.0038, 12, true),
      mats.MAT_VELCRO_STRAP
    );
    pipingTube.castShadow = true;
    pipingTube.receiveShadow = true;
    group.add(pipingTube);

    // Inner parallel stitch welt seam 5mm inside the outer piping
    const innerWeltPts3D = contourPts2D.map((pt) => {
      const cx = 0.14;
      const cy = 0.34;
      return new THREE.Vector3(
        cx + (pt.x - cx) * 0.965,
        cy + (pt.y - cy) * 0.965,
        zPiping + sideSign * 0.0008
      );
    });
    const innerWeltCurve = new THREE.CatmullRomCurve3(innerWeltPts3D, true);
    const innerWeltTube = new THREE.Mesh(
      new THREE.TubeGeometry(innerWeltCurve, 80, 0.0014, 8, true),
      mats.MAT_CORDURA_1000D
    );
    group.add(innerWeltTube);

    // WIDE SEWN CORDURA STORM FLAP (широкий тканевый клапан-козырек вдоль верхней части сумки над молнией — 1:1 как на фото!)
    const flapPts = [
      new THREE.Vector2(-0.116, 0.362), // Rear lower edge of storm flap
      new THREE.Vector2(0.364, 0.464),  // Front lower edge of storm flap
      new THREE.Vector2(0.370, 0.522),  // Front upper edge along toptube
      new THREE.Vector2(-0.118, 0.400)  // Rear upper edge under saddle nose
    ];
    const flapShape = createRoundedPolygonShape(flapPts, 0.008);
    const flapGeom = new THREE.ExtrudeGeometry(flapShape, {
      depth: 0.0032,
      bevelEnabled: true,
      bevelSize: 0.0012,
      bevelThickness: 0.0012,
      bevelSegments: 3
    });
    flapGeom.translate(0, 0, sideSign > 0 ? 0.0442 : -0.0474);
    // Add slight natural fabric wave to the storm flap
    const fPos = flapGeom.attributes.position;
    for (let i = 0; i < fPos.count; i++) {
      const fx = fPos.getX(i);
      const fy = fPos.getY(i);
      const fz = fPos.getZ(i);
      const wave = Math.sin(fx * 24.0) * 0.0007 + (0.39 - fy) * 0.004;
      fPos.setZ(i, fz + sideSign * wave);
    }
    flapGeom.computeVertexNormals();
    const stormFlapMesh = new THREE.Mesh(flapGeom, mats.MAT_CORDURA_1000D);
    stormFlapMesh.castShadow = true;
    stormFlapMesh.receiveShadow = true;
    group.add(stormFlapMesh);

    // Sewn nylon webbing trim along the bottom lip of the storm flap (создает четкую теневую ступеньку вдоль всей сумки как на фото!)
    const flapLipCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.114, 0.363, sideSign * 0.0468),
      new THREE.Vector3(0.040, 0.396, sideSign * 0.0476),
      new THREE.Vector3(0.205, 0.431, sideSign * 0.0476),
      new THREE.Vector3(0.360, 0.465, sideSign * 0.0468)
    ]);
    const flapLipTrim = new THREE.Mesh(
      new THREE.TubeGeometry(flapLipCurve, 44, 0.0022, 10, false),
      mats.MAT_VELCRO_STRAP
    );
    flapLipTrim.castShadow = true;
    group.add(flapLipTrim);

    // Recessed Waterproof Coil Zipper Track tucked just under the storm flap lip
    const zZip = sideSign * 0.0454;
    const zipRear = new THREE.Vector3(-0.106, 0.356, zZip);
    const zipMid = new THREE.Vector3(0.130, 0.408, zZip);
    const zipFront = new THREE.Vector3(0.354, 0.458, zZip);

    [-0.0022, 0.0022].forEach((dy) => {
      const lip1 = createCylinderBetween(
        new THREE.Vector3(zipRear.x, zipRear.y + dy, zZip),
        new THREE.Vector3(zipMid.x, zipMid.y + dy, zZip),
        0.0018,
        0.0018,
        mats.MAT_VELCRO_STRAP,
        12
      );
      const lip2 = createCylinderBetween(
        new THREE.Vector3(zipMid.x, zipMid.y + dy, zZip),
        new THREE.Vector3(zipFront.x, zipFront.y + dy, zZip),
        0.0018,
        0.0018,
        mats.MAT_VELCRO_STRAP,
        12
      );
      group.add(lip1, lip2);
    });

    // 48 Instanced Micro-Teeth along the Waterproof Coil Zipper Track
    const toothZipGeom = new THREE.BoxGeometry(0.0016, 0.0028, 0.0014);
    const instZipTeeth = new THREE.InstancedMesh(toothZipGeom, mats.MAT_VELCRO_STRAP, 48);
    const dummyZ = new THREE.Object3D();
    for (let zt = 0; zt < 48; zt++) {
      const u = zt / 47;
      const zx = zipRear.x + u * (zipFront.x - zipRear.x);
      const zy = zipRear.y + u * (zipFront.y - zipRear.y);
      dummyZ.position.set(zx, zy, zZip + sideSign * 0.0008);
      dummyZ.rotation.set(0, 0, 0.21);
      dummyZ.updateMatrix();
      instZipTeeth.setMatrixAt(zt, dummyZ.matrix);
    }
    instZipTeeth.instanceMatrix.needsUpdate = true;
    group.add(instZipTeeth);

    // Dual matte black zipper sliders & cord puller tabs peeking out from under the storm flap
    [
      { x: 0.332, y: 0.453, dx: -0.014, dy: -0.024 },
      { x: -0.082, y: 0.361, dx: 0.010, dy: -0.024 }
    ].forEach((zp) => {
      const sliderBody = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.0085, 0.0055), mats.MAT_FRAME_RAL9005);
      sliderBody.position.set(zp.x, zp.y, zZip + sideSign * 0.002);
      sliderBody.rotation.z = 0.21;
      group.add(sliderBody);

      const pullerTab = createCylinderBetween(
        new THREE.Vector3(zp.x, zp.y, zZip + sideSign * 0.003),
        new THREE.Vector3(zp.x + zp.dx, zp.y + zp.dy, zZip + sideSign * 0.0045),
        0.0018,
        0.0034,
        mats.MAT_VELCRO_STRAP,
        12
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

  // 1.4 140 Cylindrical Cells Li-ion 21700 EVE INR21700-50E in a 9-ROW (22+21+19+18+16+15+13+9+7 = 140) HEXAGONAL TRIANGLE
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

  // Dielectric FR4 Fiberglass Barrier Strips separating row tiers
  zoneBarriers.forEach((bar) => {
    const p1 = new THREE.Vector3(bar.pLeft.x, bar.pLeft.y, 0);
    const p2 = new THREE.Vector3(bar.pRight.x, bar.pRight.y, 0);
    const barLen = p1.distanceTo(p2) + 0.014;
    const barMid = p1.clone().add(p2).multiplyScalar(0.5);
    const barAng = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    const fr4Strip = new THREE.Mesh(new THREE.BoxGeometry(barLen, 0.0016, 0.0732), matFR4Barrier);
    fr4Strip.position.copy(barMid);
    fr4Strip.rotation.z = barAng;
    cellsMasterGroup.add(fr4Strip);
  });

  const seriesGroups = [];
  for (let s = 1; s <= 20; s++) {
    const meta = groupMeta[s - 1];
    const sGroup = new THREE.Group();
    sGroup.name = `Group_${s}S`;
    sGroup.userData = {
      seriesId: s,
      groupName: `Group_${s}S`,
      code: `${s}S7P`,
      row: meta.row,
      zone: meta.zone,
      polarityOnLeft: meta.polarityOnLeft,
      xrayColor: meta.xrayColor,
      voltage: 4.20,
      vMin: (s * 3.60).toFixed(1),
      vMax: (s * 4.20).toFixed(1),
      cumVoltage: (s * 4.20).toFixed(1),
      capacityAh: 35.0,
      cellModel: 'EVE INR21700-50E',
      bmsChannel: `B${s}`,
      ntcTemp: (26.6 + (s % 5) * 0.2).toFixed(1)
    };
    seriesGroups.push(sGroup);
    cellsMasterGroup.add(sGroup);
  }

  // High-detail geometries for the 140 21700 cells (Ø21.2mm × 70.5mm along Z axis)
  const cellRadius = 0.0098;
  const cellBodyGeom = new THREE.CylinderGeometry(cellRadius, cellRadius, 0.0705, 28);
  cellBodyGeom.rotateX(Math.PI / 2);

  // White cardboard/fishpaper insulation ring + 3-spoke vent valve on PLUS pole
  const whiteInsulatorRingGeom = new THREE.RingGeometry(0.0046, cellRadius * 0.96, 28);
  const posTermGeom = new THREE.CylinderGeometry(0.0042, 0.0044, 0.0015, 20);
  posTermGeom.rotateX(Math.PI / 2);
  const negTermGeom = new THREE.CylinderGeometry(0.0078, 0.0078, 0.0006, 20);
  negTermGeom.rotateX(Math.PI / 2);

  // Stamped Circular Nickel Contact Pad per cell pole + 4 black spot-weld dots
  const niPadGeom = new THREE.CylinderGeometry(0.0068, 0.0068, 0.0005, 20);
  niPadGeom.rotateX(Math.PI / 2);
  const weldDotGeom = new THREE.CylinderGeometry(0.00075, 0.00075, 0.0009, 8);
  weldDotGeom.rotateX(Math.PI / 2);
  const solderLayerGeom = new THREE.SphereGeometry(0.0017, 10, 10);

  // Left & Right 3D-Printed PETG Honeycomb Holders (Explodable along ±Z by ±0.14m)
  const holderLeftGroup = new THREE.Group();
  holderLeftGroup.name = 'EXPLODE_PETG_HOLDER_LEFT';
  const holderRightGroup = new THREE.Group();
  holderRightGroup.name = 'EXPLODE_PETG_HOLDER_RIGHT';

  const hexSocketGeom = new THREE.CylinderGeometry(0.0106, 0.0106, 0.012, 6, 1, true);
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

    // Spec 1.2: Odd sections (1S, 3S..19S) -> PLUS on Left (+Z), MINUS on Right (-Z)
    //           Even sections (2S, 4S..20S) -> PLUS on Right (-Z), MINUS on Left (+Z)
    const posZ = cell.polarity === 1 ? 0.0353 : -0.0353;
    const negZ = -posZ;

    // White electrical cardboard insulation ring + 3-spoke safety vent valve on PLUS side
    const whiteRing = new THREE.Mesh(whiteInsulatorRingGeom, mats.MAT_WHITE_INSULATOR);
    whiteRing.position.set(cell.x, cell.y, posZ + Math.sign(posZ) * 0.0001);
    if (posZ < 0) whiteRing.rotation.y = Math.PI;
    whiteRing.userData = { seriesId: cell.seriesId };
    sGroup.add(whiteRing);

    const posBtn = new THREE.Mesh(posTermGeom, mats.MAT_STEEL_ROTOR);
    posBtn.position.set(cell.x, cell.y, posZ);
    posBtn.userData = { seriesId: cell.seriesId };
    sGroup.add(posBtn);

    // 3-spoke vent valve lines on positive terminal
    for (let v = 0; v < 3; v++) {
      const vAng = (v * Math.PI * 2) / 3;
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.0038, 0.0006, 0.0004), mats.MAT_ANODIZED_BLACK);
      spoke.position.set(
        cell.x + Math.cos(vAng) * 0.0022,
        cell.y + Math.sin(vAng) * 0.0022,
        posZ + Math.sign(posZ) * 0.0008
      );
      spoke.rotation.z = vAng;
      spoke.userData = { seriesId: cell.seriesId };
      sGroup.add(spoke);
    }

    // Flat metallic MINUS terminal on opposite side
    const negFlat = new THREE.Mesh(negTermGeom, mats.MAT_STEEL_ROTOR);
    negFlat.position.set(cell.x, cell.y, negZ);
    negFlat.userData = { seriesId: cell.seriesId };
    sGroup.add(negFlat);

    // Stamped Nickel Circular Pad + 4 black spot-weld dots on every cell pole (+Z and -Z)
    [-0.0359, 0.0359].forEach((zSide) => {
      const padMesh = new THREE.Mesh(niPadGeom, sGroup.userData.niMat);
      padMesh.position.set(cell.x, cell.y, zSide);
      padMesh.userData = { seriesId: cell.seriesId };
      sGroup.add(padMesh);

      for (let w = 0; w < 4; w++) {
        const wAng = (w / 4) * Math.PI * 2 + Math.PI / 4;
        const dot = new THREE.Mesh(weldDotGeom, mats.MAT_ANODIZED_BLACK);
        dot.position.set(
          cell.x + Math.cos(wAng) * 0.0032,
          cell.y + Math.sin(wAng) * 0.0032,
          zSide + Math.sign(zSide) * 0.00035
        );
        dot.userData = { seriesId: cell.seriesId };
        sGroup.add(dot);
      }
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

  // Add M3 Brass Heat-Set Threaded Inserts around the 3D-Printed PETG Holder Perimeter
  [
    [0.025, 0.068],
    [0.195, 0.258],
    [0.352, 0.448],
    [0.245, 0.478],
    [0.085, 0.436],
    [-0.088, 0.388],
    [-0.042, 0.215]
  ].forEach(([hx, hy]) => {
    const brassInsertL = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0028, 0.0028, 0.011, 10),
      mats.MAT_GOLD_BRASS || mats.MAT_STEEL_ROTOR
    );
    brassInsertL.rotation.x = Math.PI / 2;
    brassInsertL.position.set(hx, hy, 0.029);
    holderLeftGroup.add(brassInsertL);

    const brassInsertR = brassInsertL.clone();
    brassInsertR.position.set(hx, hy, -0.029);
    holderRightGroup.add(brassInsertR);
  });

  batteryRoot.add(holderLeftGroup, holderRightGroup);

  // 1.5 PARALLEL NICKEL STRIPS (0.15 × 8 mm) + SOLDERED COPPER BUSBAR SANDWICH (1.5-2.5 mm² Cu + Sn)
  //     + SERPENTINE SERIES BRIDGES:
  //       Left side (+Z):  1S(+) -> 2S(-), 3S(+) -> 4S(-) ... 19S(+) -> 20S(-)
  //       Right side (-Z): 2S(+) -> 3S(-), 4S(+) -> 5S(-) ... 18S(+) -> 19S(-)
  const labelPlaneGeom = new THREE.PlaneGeometry(0.028, 0.0092);

  for (let s = 1; s <= 20; s++) {
    const sGroup = seriesGroups[s - 1];
    const meta = groupMeta[s - 1];
    const grpCells = meta.cells;

    // Connect all 7 cells in parallel within Group_sS using shiny 0.15 x 8mm pure nickel strip segments
    for (let i = 0; i < grpCells.length; i++) {
      for (let j = i + 1; j < grpCells.length; j++) {
        const cA = grpCells[i];
        const cB = grpCells[j];
        const len = Math.hypot(cB.x - cA.x, cB.y - cA.y);
        if (len > 0.0265) continue;
        const ang = Math.atan2(cB.y - cA.y, cB.x - cA.x);
        const midX = (cA.x + cB.x) * 0.5;
        const midY = (cA.y + cB.y) * 0.5;

        [-0.0359, 0.0359].forEach((zNi) => {
          const niStrip = new THREE.Mesh(
            new THREE.BoxGeometry(len + 0.010, 0.0080, 0.0005),
            sGroup.userData.niMat
          );
          niStrip.position.set(midX, midY, zNi);
          niStrip.rotation.z = ang;
          niStrip.userData = { seriesId: s };
          sGroup.add(niStrip);
        });
      }
    }

    // 3D Voltage & Polarity Label Badges on both sides (+Z and -Z): "1S (3.6..4.2V)" -> "20S (72.0..84.0V)"
    const badgeAngle = Math.atan2(uAxis.y, uAxis.x);
    [-0.0384, 0.0384].forEach((zBadge) => {
      const sidePolarity = zBadge > 0 ? meta.polarityOnLeft : -meta.polarityOnLeft;
      const badgeMat = createBatterySeriesLabelMaterial(s, sidePolarity);
      const badgeMesh = new THREE.Mesh(labelPlaneGeom, badgeMat);
      badgeMesh.position.set(meta.center.x, meta.center.y, zBadge);
      badgeMesh.rotation.z = badgeAngle;
      if (zBadge < 0) badgeMesh.rotation.y = Math.PI;
      badgeMesh.userData = { seriesId: s };
      sGroup.add(badgeMesh);
    });

    // Series Bridges ("Copper Sandwich" 60A-120A):
    // Odd s (1S->2S, 3S->4S ... 19S->20S) connects on LEFT side (+Z)!
    // Even s (2S->3S, 4S->5S ... 18S->19S) connects on RIGHT side (-Z)!
    if (s < 20) {
      const nextMeta = groupMeta[s];
      const zBridge = s % 2 === 1 ? 0.0365 : -0.0365;

      // Find the 2 closest adjacent cell pairs between Group_sS and Group_(s+1)S for low-inductance parallel bridges
      const candidatePairs = [];
      meta.cells.forEach((cA) => {
        nextMeta.cells.forEach((cB) => {
          const d = Math.hypot(cB.x - cA.x, cB.y - cA.y);
          candidatePairs.push({ cA, cB, d });
        });
      });
      candidatePairs.sort((a, b) => a.d - b.d);

      const bridgePairs = [candidatePairs[0]];
      for (let k = 1; k < candidatePairs.length; k++) {
        const cand = candidatePairs[k];
        if (cand.cA !== bridgePairs[0].cA && cand.cB !== bridgePairs[0].cB && cand.d < 0.068) {
          bridgePairs.push(cand);
          break;
        }
      }

      bridgePairs.forEach(({ cA, cB, d }) => {
        const midX = (cA.x + cB.x) * 0.5;
        const midY = (cA.y + cB.y) * 0.5;
        const brAngle = Math.atan2(cB.y - cA.y, cB.x - cA.x);

        // Base Nickel Bridge (0.15 x 8 mm)
        const niBridge = new THREE.Mesh(
          new THREE.BoxGeometry(d + 0.011, 0.0082, 0.0006),
          sGroup.userData.niMat
        );
        niBridge.position.set(midX, midY, zBridge);
        niBridge.rotation.z = brAngle;
        niBridge.userData = { seriesId: s };
        sGroup.add(niBridge);

        // Soldered Heavy Copper Busbar Core (2.5 mm² golden-copper wire/bar) on top of nickel bridge
        const cuBridge = new THREE.Mesh(
          new THREE.BoxGeometry(d + 0.007, 0.0032, 0.0016),
          sGroup.userData.busMat
        );
        cuBridge.position.set(midX, midY, zBridge + Math.sign(zBridge) * 0.0010);
        cuBridge.rotation.z = brAngle;
        cuBridge.userData = { seriesId: s };
        sGroup.add(cuBridge);

        // Silver Tin Solder Fillet Layer over the Copper Busbar
        const tinSolder = new THREE.Mesh(
          new THREE.BoxGeometry(d + 0.008, 0.0044, 0.0006),
          mats.MAT_STEEL_ROTOR
        );
        tinSolder.position.set(midX, midY, zBridge + Math.sign(zBridge) * 0.0018);
        tinSolder.rotation.z = brAngle;
        tinSolder.userData = { seriesId: s };
        sGroup.add(tinSolder);
      });
    }
  }

  // Main B- (0V at 1S MINUS on Right side -Z) and Main B+ (84V at 20S PLUS on Right side -Z) Heavy Copper Collector Bars
  const group1S = seriesGroups[0];
  const cell1S_0 = groupMeta[0].cells[0];
  const bMinusCollector = new THREE.Mesh(
    new THREE.BoxGeometry(0.024, 0.012, 0.0032),
    mats.MAT_COPPER_BUSBAR
  );
  bMinusCollector.position.set(cell1S_0.x - 0.005, cell1S_0.y + 0.004, -0.0375);
  bMinusCollector.rotation.z = 0.84;
  group1S.add(bMinusCollector);

  const group20S = seriesGroups[19];
  const cell20S_last = groupMeta[19].cells[groupMeta[19].cells.length - 1];
  const bPlusCollector = new THREE.Mesh(
    new THREE.BoxGeometry(0.024, 0.012, 0.0032),
    mats.MAT_COPPER_BUSBAR
  );
  bPlusCollector.position.set(cell20S_last.x, cell20S_last.y + 0.006, -0.0375);
  bPlusCollector.rotation.z = 0.25;
  group20S.add(bPlusCollector);

  batteryRoot.add(cellsMasterGroup);

  // 1.6 Bisida BMS 20S 120A Li-ion in Finned Aluminum Heatsink in upper channel under Toptube
  // + 8 AWG Power Leads (1S(-) -> B-, C- -> XT90-S(-), 20S(+) -> XT90-S(+)) + 21 Balance Wires (B0..B20) + NTC Sensor
  const bmsGroup = new THREE.Group();
  bmsGroup.name = 'EXPLODE_BISIDA_BMS_120A';

  const toptubeAngle = Math.atan2(0.545 - 0.415, 0.395 - (-0.135));
  const bmsPos = new THREE.Vector3(0.155, 0.452, 0);
  const bmsCore = new THREE.Group();
  bmsCore.position.copy(bmsPos);
  bmsCore.rotation.z = toptubeAngle;

  // Finned Silver/Anodized Aluminum Heatsink Body (140 x 16 x 62 mm)
  const bmsPlate = new THREE.Mesh(new THREE.BoxGeometry(0.140, 0.014, 0.062), mats.MAT_STEEL_ROTOR);
  bmsCore.add(bmsPlate);

  // Green FR4 Multi-Layer BMS Printed Circuit Board (PCB) sandwiched under the heatsink
  const bmsPcb = new THREE.Mesh(new THREE.BoxGeometry(0.138, 0.0024, 0.060), matFishpaper);
  bmsPcb.position.set(0, -0.0082, 0);
  bmsCore.add(bmsPcb);

  // 16x TO-263 High-Current Power MOSFETs on BMS PCB
  for (let m = 0; m < 8; m++) {
    const mx = -0.048 + m * 0.0135;
    [-0.018, 0.018].forEach((mz) => {
      const mosfet = new THREE.Mesh(new THREE.BoxGeometry(0.009, 0.004, 0.010), mats.MAT_ANODIZED_BLACK);
      mosfet.position.set(mx, -0.006, mz);
      const tab = new THREE.Mesh(new THREE.BoxGeometry(0.009, 0.001, 0.012), mats.MAT_STEEL_ROTOR);
      tab.position.set(mx, -0.004, mz);
      bmsCore.add(mosfet, tab);
    });
  }

  // White 21-pin JST-XH Balance Connector Header (B0..B20) on BMS board edge
  const jstHeader = new THREE.Mesh(new THREE.BoxGeometry(0.088, 0.0068, 0.0090), mats.MAT_WHITE_INSULATOR);
  jstHeader.position.set(0.008, -0.007, 0.032);
  bmsCore.add(jstHeader);

  for (let p = 0; p <= 20; p++) {
    const px = -0.032 + (p / 20) * 0.080;
    const pin = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0005, 0.0005, 0.006, 6),
      mats.MAT_GOLD_BRASS || mats.MAT_STEEL_ROTOR
    );
    pin.rotation.x = Math.PI / 2;
    pin.position.set(px, -0.007, 0.035);
    bmsCore.add(pin);
  }

  // Heavy Tinned Copper Solder Pads B- and C- on BMS left end
  const padBMinus = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.004, 0.020), mats.MAT_COPPER_BUSBAR);
  padBMinus.position.set(-0.062, -0.007, -0.015);
  const padCMinus = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.004, 0.020), mats.MAT_COPPER_BUSBAR);
  padCMinus.position.set(-0.062, -0.007, 0.015);
  bmsCore.add(padBMinus, padCMinus);

  bmsGroup.add(bmsCore);

  // Upper-Rear pocket near Seat Tube / Toptube corner: Amass XT90-S Anti-Spark Yellow Connector
  const xt90Pos = new THREE.Vector3(-0.048, 0.398, 0.015);
  const xt90Housing = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.022, 0.014), mats.MAT_XT90_YELLOW);
  xt90Housing.position.copy(xt90Pos);
  const xt90AntiSparkBand = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.023, 0.015), mats.MAT_ANODIZED_BLACK);
  xt90AntiSparkBand.position.set(xt90Pos.x + 0.009, xt90Pos.y, xt90Pos.z);
  const xt90GoldPinPos = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0028, 0.0028, 0.010, 12),
    mats.MAT_GOLD_BRASS || mats.MAT_STEEL_ROTOR
  );
  xt90GoldPinPos.rotation.z = Math.PI / 2;
  xt90GoldPinPos.position.set(xt90Pos.x + 0.014, xt90Pos.y + 0.005, xt90Pos.z);
  const xt90GoldPinNeg = xt90GoldPinPos.clone();
  xt90GoldPinNeg.position.set(xt90Pos.x + 0.014, xt90Pos.y - 0.005, xt90Pos.z);
  bmsGroup.add(xt90Housing, xt90AntiSparkBand, xt90GoldPinPos, xt90GoldPinNeg);

  // Spec 1.3: Heavy 8 AWG Silicone Power Cables:
  // 1) From 1S(-) on -Z -> thick black 8 AWG silicone cable to B- pad of Bisida BMS 20S 120A
  const pBMinusStart = new THREE.Vector3(cell1S_0.x - 0.006, cell1S_0.y + 0.004, -0.037);
  const pBMinusMid = new THREE.Vector3(-0.104, 0.372, -0.034);
  const pBMinusEnd = new THREE.Vector3(0.092, 0.434, -0.016);
  bmsGroup.add(
    createCylinderBetween(pBMinusStart, pBMinusMid, 0.0038, 0.0038, mats.MAT_ANODIZED_BLACK, 14),
    createCylinderBetween(pBMinusMid, pBMinusEnd, 0.0038, 0.0038, mats.MAT_ANODIZED_BLACK, 14)
  );

  // 2) From C- pad of BMS -> thick black 8 AWG power cable to negative terminal of Amass XT90-S
  const pCMinusStart = new THREE.Vector3(0.092, 0.434, 0.015);
  const pCMinusEnd = new THREE.Vector3(xt90Pos.x + 0.010, xt90Pos.y - 0.005, xt90Pos.z);
  bmsGroup.add(
    createCylinderBetween(pCMinusStart, pCMinusEnd, 0.0038, 0.0038, mats.MAT_ANODIZED_BLACK, 14)
  );

  // 3) From 20S(+) on -Z -> thick red 8 AWG silicone cable directly to positive terminal of Amass XT90-S
  const pBPlusStart = new THREE.Vector3(cell20S_last.x, cell20S_last.y + 0.006, -0.037);
  const pBPlusEnd = new THREE.Vector3(xt90Pos.x - 0.010, xt90Pos.y + 0.005, xt90Pos.z);
  bmsGroup.add(
    createCylinderBetween(pBPlusStart, pBPlusEnd, 0.0042, 0.0042, mats.MAT_RED_ANODIZED, 14)
  );

  // 4) 21 Balance Wires (B0 black + B1..B20 red) from each of the 20 groups into white JST-XH comb connector on BMS
  for (let s = 1; s <= 20; s++) {
    const meta = groupMeta[s - 1];
    const t = s / 20;
    const jstPinPos = new THREE.Vector3(
      bmsPos.x - 0.034 + t * 0.080,
      bmsPos.y - 0.010 + t * 0.019,
      0.035
    );
    // Tap the POSITIVE side of section s (+Z for odd s, -Z for even s)
    const tapZ = s % 2 === 1 ? 0.0372 : -0.0372;
    const tapCell = meta.cells[Math.floor(meta.cells.length / 2)];
    const tapPos = new THREE.Vector3(tapCell.x, tapCell.y + 0.006, tapZ);
    const elbowPos = new THREE.Vector3(tapCell.x, Math.max(tapCell.y + 0.028, bmsPos.y - 0.022), tapZ);

    bmsGroup.add(
      createCylinderBetween(jstPinPos, elbowPos, 0.00068, 0.00068, mats.MAT_RED_ANODIZED, 8),
      createCylinderBetween(elbowPos, tapPos, 0.00068, 0.00068, mats.MAT_RED_ANODIZED, 8)
    );

    const tapLug = new THREE.Mesh(
      new THREE.TorusGeometry(0.0018, 0.0006, 6, 12),
      mats.MAT_GOLD_BRASS || mats.MAT_STEEL_ROTOR
    );
    tapLug.position.copy(tapPos);
    bmsGroup.add(tapLug);
  }

  // B0 (Black balance ground wire #1 of 21) from 1S(-) to Pin 0 of white JST-XH BMS comb connector
  bmsGroup.add(
    createCylinderBetween(
      new THREE.Vector3(bmsPos.x - 0.036, bmsPos.y - 0.012, 0.035),
      pBMinusMid,
      0.00075,
      0.00075,
      mats.MAT_ANODIZED_BLACK,
      8
    )
  );

  // NTC Temperature Sensor Probe wire from BMS into the exact center of the 140-cell triangle
  [
    new THREE.Vector3(0.145, 0.285, 0),
    new THREE.Vector3(0.205, 0.345, 0)
  ].forEach((ntcEnd, nIdx) => {
    const ntcStart = new THREE.Vector3(bmsPos.x + 0.01 + nIdx * 0.012, bmsPos.y - 0.01, 0);
    const ntcWire = createCylinderBetween(ntcStart, ntcEnd, 0.0010, 0.0010, mats.MAT_ANODIZED_BLACK, 8);
    const ntcBead = new THREE.Mesh(new THREE.SphereGeometry(0.0032, 12, 12), mats.MAT_ANODIZED_BLACK);
    ntcBead.position.copy(ntcEnd);
    bmsGroup.add(ntcWire, ntcBead);
  });

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

  const ctrlCore = new THREE.Mesh(new THREE.BoxGeometry(0.235, 0.040, 0.082), mats.MAT_ANODIZED_BLACK);
  ctrlCore.castShadow = true;
  ctrlGroup.add(ctrlCore);

  // Deep longitudinal wind-tunnel cooling ribs on sides and bottom (1:1 as on Reference Photo #3)
  for (let r = -4; r <= 4; r++) {
    const bottomRib = new THREE.Mesh(new THREE.BoxGeometry(0.232, 0.0072, 0.0036), mats.MAT_ANODIZED_BLACK);
    bottomRib.position.set(0, -0.0225, r * 0.0088);
    ctrlGroup.add(bottomRib);
  }
  [-0.042, 0.042].forEach((sideZ) => {
    for (let s = -4; s <= 4; s++) {
      const sideRib = new THREE.Mesh(new THREE.BoxGeometry(0.232, 0.0030, 0.0048), mats.MAT_ANODIZED_BLACK);
      sideRib.position.set(0, s * 0.0042, sideZ);
      ctrlGroup.add(sideRib);
    }
  });

  // Top & bottom cast end-caps with 8x stainless M3 Allen bolts + Waterproof IP67 Cable Glands
  [-0.119, 0.119].forEach((endX) => {
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.044, 0.086), mats.MAT_FRAME_RAL9005);
    cap.position.set(endX, 0, 0);
    ctrlGroup.add(cap);

    [-0.012, 0.012].forEach((ey) => {
      [-0.032, 0.032].forEach((ez) => {
        const capBolt = new THREE.Mesh(new THREE.CylinderGeometry(0.0018, 0.0018, 0.004, 10), mats.MAT_STEEL_ROTOR);
        capBolt.rotation.z = Math.PI / 2;
        capBolt.position.set(endX + Math.sign(endX) * 0.003, ey, ez);
        ctrlGroup.add(capBolt);
      });
    });
  });

  // 3 Waterproof Cable Glands exiting the bottom end-cap of the 60A Controller into the 3D PETG Box
  [-0.022, 0, 0.022].forEach((gz) => {
    const gland = new THREE.Mesh(new THREE.CylinderGeometry(0.0065, 0.0055, 0.014, 12), mats.MAT_ANODIZED_BLACK);
    gland.rotation.z = Math.PI / 2;
    gland.position.set(-0.125, -0.004, gz);
    ctrlGroup.add(gland);
  });

  // 6 MOSFET Clamp Bar Screws along left & right heatsink rails
  [-0.075, 0.0, 0.075].forEach((bx) => {
    [-0.0435, 0.0435].forEach((bz) => {
      const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.0022, 0.0022, 0.0035, 10), mats.MAT_STEEL_ROTOR);
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
    const strap = createBiOvalTubeBetween(pWrapCenter, pWrapEnd, 0.045, 0.045, mats.MAT_VELCRO_STRAP, 28);
    underTubeRoot.add(strap);
  });

  // 2.2 Lower Stepped 3D-Printed PETG Wiring Enclosure (1:1 as on Reference Photo #3 & #4)
  const boxCenter = pBB.clone()
    .addScaledVector(downDir, 0.165)
    .addScaledVector(downNormalOut, 0.045);

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
      createBiOvalTubeBetween(pBoxStrapCenter, pBoxStrapEnd, 0.047, 0.046, mats.MAT_VELCRO_STRAP, 28)
    );
  });

  // INTERNAL COMPONENTS INSIDE 3D PETG BOX:
  // 1) Finned Aluminum DC-DC Buck Converter (36V-120V -> 12V 10A) + Inline Blade Fuse Holder
  const dcdcBody = new THREE.Mesh(new THREE.BoxGeometry(0.068, 0.022, 0.056), mats.MAT_ANODIZED_BLACK);
  dcdcBody.position.set(0.058, 0.001, 0);
  boxBaseGroup.add(dcdcBody);
  for (let df = -3; df <= 3; df++) {
    const dFin = new THREE.Mesh(new THREE.BoxGeometry(0.066, 0.003, 0.0025), mats.MAT_STEEL_ROTOR);
    dFin.position.set(0.058, -0.011, df * 0.007);
    boxBaseGroup.add(dFin);
  }
  const dcdcSticker = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.002, 0.032), mats.MAT_BLUE_ANODIZED);
  dcdcSticker.position.set(0.058, -0.012, 0);
  boxBaseGroup.add(dcdcSticker);

  // 2) High-Current 3-Phase Ceramic Terminal Block (U/V/W Yellow/Green/Blue phase studs, nuts & crimp lugs)
  const phaseBlock = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.020, 0.052), mats.MAT_XT90_YELLOW);
  phaseBlock.position.set(-0.012, 0.002, 0);
  boxBaseGroup.add(phaseBlock);
  [-0.015, 0, 0.015].forEach((pz, idx) => {
    const studMat = idx === 0 ? mats.MAT_XT90_YELLOW : idx === 1 ? mats.MAT_BLUE_ANODIZED : mats.MAT_RED_ANODIZED;
    const nut = new THREE.Mesh(new THREE.CylinderGeometry(0.0048, 0.0048, 0.009, 6), studMat);
    nut.position.set(-0.012, -0.010, pz);
    const phaseWire = createCylinderBetween(
      new THREE.Vector3(0.105, 0.004, pz * 0.9),
      new THREE.Vector3(-0.012, -0.006, pz),
      0.0026,
      0.0026,
      studMat,
      10
    );
    boxBaseGroup.add(nut, phaseWire);
  });

  // 3) Waterproof 6-Pin DJ7061 Hall Sensor Connector Plug (White Nylon Housing)
  const hallPlug = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.012, 0.018), mats.MAT_WHITE_INSULATOR);
  hallPlug.position.set(0.022, 0.005, 0.026);
  boxBaseGroup.add(hallPlug);

  // 4) Hidden 105 dB (12V) Motorcycle Disc Horn on spring steel bracket opposite acoustic gills
  const hornDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.033, 0.033, 0.022, 28), mats.MAT_ANODIZED_BLACK);
  hornDisc.position.set(-0.078, -0.002, 0);
  boxBaseGroup.add(hornDisc);
  const hornCenterRing = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.024, 20), mats.MAT_RED_ANODIZED);
  hornCenterRing.position.set(-0.078, -0.002, 0);
  const hornCenterNut = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.026, 6), mats.MAT_GOLD_BRASS || mats.MAT_STEEL_ROTOR);
  hornCenterNut.position.set(-0.078, -0.002, 0);
  boxBaseGroup.add(hornCenterRing, hornCenterNut);

  underTubeRoot.add(boxBaseGroup);

  // Outer Faceted & Ribbed 3D-Printed PETG Box Cover with Acoustic Gills + 6x M3 Lid Screws (explodes with controller)
  const boxLidGroup = new THREE.Group();
  boxLidGroup.position.copy(boxCenter);
  boxLidGroup.rotation.z = downAngle;

  const lidShell = new THREE.Mesh(new THREE.BoxGeometry(0.242, 0.042, 0.088), mats.MAT_PETG_HOLDER);
  lidShell.position.set(0, -0.008, 0);
  lidShell.castShadow = true;
  boxLidGroup.add(lidShell);

  // Longitudinal stiffening ribs + 6x M3 Stainless Socket Cap Screws along the 3D-printed box sides
  [-0.045, 0.045].forEach((sz) => {
    for (let r = -3; r <= 3; r++) {
      const rib = new THREE.Mesh(new THREE.BoxGeometry(0.232, 0.0028, 0.0032), mats.MAT_FRAME_RAL9005);
      rib.position.set(0, -0.008 + r * 0.0052, sz);
      boxLidGroup.add(rib);
    }
    [-0.095, 0.0, 0.095].forEach((lx) => {
      const lidScrew = new THREE.Mesh(new THREE.CylinderGeometry(0.0022, 0.0022, 0.004, 10), mats.MAT_STEEL_ROTOR);
      lidScrew.rotation.x = Math.PI / 2;
      lidScrew.position.set(lx, 0.006, sz);
      boxLidGroup.add(lidScrew);
    });
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
 * 3. NODE 7: LOW-PROFILE MOTO SADDLE (SUR-RON / PITBIKE 530 MM) + EXACT STEEL SUBFRAME STRUTS
 *    Strictly per Spec 1.2:
 *      1) Front short steel post from top of seat tube (-0.145, 0.39, 0) forward-up to saddle base (-0.19, 0.45, 0)
 *      2) Two rear thin Ø16mm steel diagonal struts from rear saddle pan (-0.42, 0.47, ±0.045) angled forward-down
 *         STRICTLY INTO THE MIDDLE OF UPPER SEATSTAYS at (-0.27, 0.25, ±0.045)!
 */
export function buildMotoSaddleAndSubframeNode(mats) {
  const saddleRoot = new THREE.Group();
  saddleRoot.name = 'NODE_07_MOTO_SADDLE_AND_SUBFRAME';

  const subframeGroup = new THREE.Group();
  subframeGroup.name = 'EXPLODE_STEEL_SUBFRAME';

  // 1) Front short steel post from top of seat tube (-0.145, 0.39, 0) forward-up into center of saddle pan (-0.19, 0.45, 0)
  const frontShortPost = createBiOvalTubeBetween(
    new THREE.Vector3(-0.145, 0.39, 0),
    new THREE.Vector3(-0.19, 0.45, 0),
    0.012,
    0.014,
    mats.MAT_FRAME_RAL9005,
    20
  );
  subframeGroup.add(frontShortPost);

  // 2) Two rear Ø16mm (R=0.008m) steel diagonal struts from (-0.42, 0.47, ±0.045) strictly to MIDDLE OF UPPER SEATSTAYS (-0.27, 0.25, ±0.045)
  [-1, 1].forEach((side) => {
    const zFront = side * 0.024;
    const zRear = side * 0.045;

    // Longitudinal 20x20mm steel subframe rail under the saddle pan
    const upperRail = createBiOvalTubeBetween(
      new THREE.Vector3(-0.145, 0.412, zFront),
      new THREE.Vector3(-0.445, 0.486, zRear),
      0.010,
      0.010,
      mats.MAT_FRAME_RAL9005,
      20
    );
    subframeGroup.add(upperRail);

    // Exact Ø16mm (R=0.008m) rear diagonal strut from (-0.42, 0.47, ±0.045) to middle of upper seatstays (-0.27, 0.25, ±0.045)
    const rearStrut16mm = createCylinderBetween(
      new THREE.Vector3(-0.42, 0.47, zRear),
      new THREE.Vector3(-0.27, 0.25, zRear),
      0.008,
      0.008,
      mats.MAT_FRAME_RAL9005,
      24
    );
    subframeGroup.add(rearStrut16mm);

    // Steel mounting clamp ears & M6 Stainless Allen Bolts at middle of upper seatstays (-0.27, 0.25, ±0.045) and saddle tail (-0.42, 0.47, ±0.045)
    [
      [-0.27, 0.25, zRear + side * 0.006],
      [-0.42, 0.47, zRear + side * 0.006]
    ].forEach(([bx, by, bz]) => {
      const clampEar = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.022, 0.008), mats.MAT_FRAME_RAL9005);
      clampEar.position.set(bx, by, bz - side * 0.004);
      const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0045, 0.007, 12), mats.MAT_STEEL_ROTOR);
      bolt.position.set(bx, by, bz);
      bolt.rotation.x = Math.PI / 2;
      const washer = new THREE.Mesh(new THREE.CylinderGeometry(0.0068, 0.0068, 0.0015, 16), mats.MAT_STEEL_ROTOR);
      washer.position.set(bx, by, bz - side * 0.002);
      washer.rotation.x = Math.PI / 2;
      subframeGroup.add(clampEar, bolt, washer);
    });
  });

  // Cross-bridges between left and right subframe rails
  [-0.19, -0.32, -0.42].forEach((cx, idx) => {
    const cy = idx === 0 ? 0.435 : idx === 1 ? 0.456 : 0.472;
    const hw = idx === 0 ? 0.026 : idx === 1 ? 0.036 : 0.045;
    const bridge = createCylinderBetween(
      new THREE.Vector3(cx, cy, -hw),
      new THREE.Vector3(cx, cy, hw),
      0.007,
      0.007,
      mats.MAT_FRAME_RAL9005,
      14
    );
    subframeGroup.add(bridge);
  });

  saddleRoot.add(subframeGroup);

  // 3.2 Explodable Moto-Saddle (530mm length) with front U-channel (40x70mm) + Sleek Rear Pitbike Tail Fender + LED Brake Light
  const saddleAndFenderGroup = new THREE.Group();
  saddleAndFenderGroup.name = 'EXPLODE_MOTO_SADDLE_AND_FENDER';

  const saddleSideShape = new THREE.Shape();
  saddleSideShape.moveTo(0.035, 0.454);
  saddleSideShape.quadraticCurveTo(-0.045, 0.462, -0.145, 0.450);
  saddleSideShape.bezierCurveTo(-0.255, 0.445, -0.365, 0.492, -0.482, 0.528);
  saddleSideShape.quadraticCurveTo(-0.498, 0.528, -0.494, 0.502);
  saddleSideShape.quadraticCurveTo(-0.365, 0.462, -0.205, 0.402);
  saddleSideShape.lineTo(-0.155, 0.398);
  saddleSideShape.lineTo(-0.095, 0.406);
  saddleSideShape.quadraticCurveTo(-0.025, 0.425, 0.035, 0.442);
  saddleSideShape.closePath();

  const saddleGeom = new THREE.ExtrudeGeometry(saddleSideShape, {
    depth: 0.130,
    bevelEnabled: true,
    bevelSize: 0.015,
    bevelThickness: 0.016,
    bevelSegments: 8
  });
  saddleGeom.translate(0, 0, -0.065);

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

  // 6 Transverse Anti-Slip Moto Gripper Ribs across the rear rider section of the Sur-Ron saddle
  for (let gr = 0; gr < 6; gr++) {
    const gx = -0.220 - gr * 0.038;
    const gy = 0.456 + gr * 0.011;
    const gw = 0.096 - gr * 0.006;
    const gripRib = createCylinderBetween(
      new THREE.Vector3(gx, gy, -gw * 0.5),
      new THREE.Vector3(gx, gy, gw * 0.5),
      0.0022,
      0.0022,
      mats.MAT_VELCRO_STRAP,
      10
    );
    saddleAndFenderGroup.add(gripRib);
  }

  // Separate Rear Pitbike / Sur-Ron Plastic Tail Fender extending smoothly from under the saddle tail
  const fenderShape = new THREE.Shape();
  fenderShape.moveTo(-0.445, 0.498);
  fenderShape.quadraticCurveTo(-0.555, 0.530, -0.660, 0.552);
  fenderShape.lineTo(-0.665, 0.542);
  fenderShape.quadraticCurveTo(-0.565, 0.506, -0.455, 0.478);
  fenderShape.closePath();

  const tailFenderGeom = new THREE.ExtrudeGeometry(fenderShape, {
    depth: 0.078,
    bevelEnabled: true,
    bevelSize: 0.004,
    bevelThickness: 0.004,
    bevelSegments: 4
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

  // Integrated Red LED Brake Light with 8 Discrete Internal SMD LED Diodes under the Ruby Lens
  const brakeLightHousing = new THREE.Mesh(
    new THREE.BoxGeometry(0.022, 0.015, 0.060),
    mats.MAT_ANODIZED_BLACK
  );
  brakeLightHousing.position.set(-0.498, 0.490, 0);
  brakeLightHousing.rotation.z = -0.22;
  saddleAndFenderGroup.add(brakeLightHousing);

  for (let d = 0; d < 8; d++) {
    const dz = -0.021 + (d / 7) * 0.042;
    const smd = new THREE.Mesh(new THREE.SphereGeometry(0.0018, 8, 8), mats.MAT_BRAKE_LED);
    smd.position.set(-0.505, 0.488, dz);
    saddleAndFenderGroup.add(smd);
  }

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

