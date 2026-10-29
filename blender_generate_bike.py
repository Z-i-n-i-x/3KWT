#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
================================================================================
STEALTH SUR-RON 72V 3000W — PROCEDURAL HIGH-POLY CAD GENERATOR FOR BLENDER (bpy)
================================================================================
Generates the complete 1:1 scale 3D model of the "Stealth Sur-Ron 72V 3000W"
electric bike (Stern Dynamic 1.0 18" Mod) separated into engineering collections
for direct .glb WebGL export and 1:1 3D printing of custom PETG/Steel parts.

COORDINATE SYSTEM CONVERSION:
- Specification CAD axes:
    X_cad = Forward (towards front wheel)
    Y_cad = Vertical Up
    Z_cad = Lateral Right/Left (+Z_cad = Left side of bike, -Z_cad = Right side)
- Mapped to Blender Right-Handed Z-Up World Space:
    X_blender = X_cad (Forward)
    Y_blender = -Z_cad (Left is -Y_blender, Right is +Y_blender)
    Z_blender = Y_cad (Vertical Up)
- Helper `cad_to_bl(x, y, z)` handles all coordinate transforms automatically.

USAGE IN BLENDER (3.6 / 4.x+):
  blender --background --python blender_generate_bike.py
  or run directly inside Blender's Scripting workspace.
================================================================================
"""

import bpy
import bmesh
import math
from mathutils import Vector, Matrix


# ==============================================================================
# 0. COORDINATE TRANSFORM & SCENE INITIALIZATION
# ==============================================================================
def cad_to_bl(x: float, y: float, z: float) -> Vector:
    """Converts CAD (X-forward, Y-up, Z-left) to Blender (X-forward, Y-right, Z-up)."""
    return Vector((float(x), float(-z), float(y)))


def reset_scene():
    """Clears default objects, meshes, materials, and collections for a clean studio CAD build."""
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.unit_settings.system = 'METRIC'
    scene.unit_settings.scale_length = 1.0

    # Set clean dark studio world background #050505
    world = bpy.data.worlds.new("Stealth_Studio_World")
    scene.world = world
    world.use_nodes = True
    bg_node = world.node_tree.nodes.get("Background")
    if bg_node:
        bg_node.inputs[0].default_value = (0.004, 0.004, 0.004, 1.0)
        bg_node.inputs[1].default_value = 0.8


def get_or_create_collection(name: str, parent_col=None):
    """Creates a named Blender Collection for modular GLB export and 3D printing."""
    if name in bpy.data.collections:
        return bpy.data.collections[name]
    col = bpy.data.collections.new(name)
    if parent_col is None:
        bpy.context.scene.collection.children.link(col)
    else:
        parent_col.children.link(col)
    return col


def link_to_collection(obj, col):
    """Links an object exclusively to the target collection."""
    for c in list(obj.users_collection):
        c.objects.unlink(obj)
    col.objects.link(obj)


# ==============================================================================
# 1. PBR MATERIALS (FULL MATTE BLACK STEALTH RAL 9005)
# ==============================================================================
def create_pbr_material(name: str, base_color, roughness: float, metallic: float,
                        clearcoat: float = 0.0, emission=None, emission_strength: float = 0.0,
                        alpha: float = 1.0):
    """Creates a Principled BSDF material compatible with Blender 3.x and 4.x."""
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (*base_color, 1.0)
        bsdf.inputs["Roughness"].default_value = roughness
        bsdf.inputs["Metallic"].default_value = metallic
        if "Coat Weight" in bsdf.inputs:
            bsdf.inputs["Coat Weight"].default_value = clearcoat
        elif "Clearcoat" in bsdf.inputs:
            bsdf.inputs["Clearcoat"].default_value = clearcoat

        if emission is not None:
            if "Emission Color" in bsdf.inputs:
                bsdf.inputs["Emission Color"].default_value = (*emission, 1.0)
                bsdf.inputs["Emission Strength"].default_value = emission_strength
            elif "Emission" in bsdf.inputs:
                bsdf.inputs["Emission"].default_value = (*emission, 1.0)

        if alpha < 1.0 and "Alpha" in bsdf.inputs:
            bsdf.inputs["Alpha"].default_value = alpha
            mat.blend_method = 'BLEND'
    return mat


def build_materials_library():
    """Creates all required PBR materials for the Stealth Sur-Ron 72V 3000W."""
    return {
        "MAT_FRAME_RAL9005": create_pbr_material("MAT_FRAME_RAL9005", (0.015, 0.015, 0.015), 0.88, 0.25, 0.02),
        "MAT_CORDURA_1000D": create_pbr_material("MAT_CORDURA_1000D", (0.010, 0.010, 0.012), 0.95, 0.02),
        "MAT_ANODIZED_BLACK": create_pbr_material("MAT_ANODIZED_BLACK", (0.008, 0.008, 0.010), 0.32, 0.88, 0.12),
        "MAT_RUBBER_KENDA": create_pbr_material("MAT_RUBBER_KENDA", (0.018, 0.018, 0.020), 0.92, 0.05),
        "MAT_STEEL_ROTOR": create_pbr_material("MAT_STEEL_ROTOR", (0.78, 0.81, 0.84), 0.22, 0.95),
        "MAT_MOTO_VINYL": create_pbr_material("MAT_MOTO_VINYL", (0.020, 0.020, 0.022), 0.82, 0.04),
        "MAT_RED_ANODIZED": create_pbr_material("MAT_RED_ANODIZED", (0.82, 0.05, 0.08), 0.25, 0.88),
        "MAT_BLUE_ANODIZED": create_pbr_material("MAT_BLUE_ANODIZED", (0.06, 0.35, 0.85), 0.28, 0.85),
        "MAT_CELL_EVE50E": create_pbr_material("MAT_CELL_EVE50E", (0.22, 0.50, 0.68), 0.35, 0.15),
        "MAT_NICKEL_STRIP": create_pbr_material("MAT_NICKEL_STRIP", (0.85, 0.88, 0.92), 0.18, 0.96),
        "MAT_COPPER_BUSBAR": create_pbr_material("MAT_COPPER_BUSBAR", (0.85, 0.45, 0.20), 0.22, 0.95),
        "MAT_PETG_HOLDER": create_pbr_material("MAT_PETG_HOLDER", (0.012, 0.013, 0.015), 0.55, 0.08),
        "MAT_XT90_YELLOW": create_pbr_material("MAT_XT90_YELLOW", (0.95, 0.70, 0.02), 0.40, 0.05),
        "MAT_LED_HEADLIGHT": create_pbr_material(
            "MAT_LED_HEADLIGHT", (1.0, 1.0, 1.0), 0.1, 0.0, emission=(0.85, 0.95, 1.0), emission_strength=3.5
        ),
        "MAT_BRAKE_LED": create_pbr_material(
            "MAT_BRAKE_LED", (0.4, 0.0, 0.0), 0.2, 0.0, emission=(1.0, 0.0, 0.0), emission_strength=4.0
        ),
    }


# ==============================================================================
# 2. GEOMETRIC PRIMITIVE BUILDERS IN CAD COORDINATES
# ==============================================================================
def add_cylinder_between_cad(name: str, p1_cad, p2_cad, r1: float, r2: float,
                             mat, col, vertices: int = 24, scale_xy=(1.0, 1.0)):
    """Creates a cylinder or bi-oval tube between two CAD points (x, y, z)."""
    v1 = cad_to_bl(*p1_cad)
    v2 = cad_to_bl(*p2_cad)
    direction = v2 - v1
    length = direction.length
    mid = (v1 + v2) * 0.5

    bpy.ops.mesh.primitive_cone_add(
        vertices=vertices,
        radius1=r1,
        radius2=r2,
        depth=length,
        location=mid
    )
    obj = bpy.context.active_object
    obj.name = name

    # Align Z axis of primitive with direction vector
    z_axis = Vector((0.0, 0.0, 1.0))
    rot_quat = z_axis.rotation_difference(direction.normalized())
    obj.rotation_mode = 'QUATERNION'
    obj.rotation_quaternion = rot_quat
    obj.scale = (scale_xy[0], scale_xy[1], 1.0)

    if mat:
        obj.data.materials.append(mat)
    link_to_collection(obj, col)
    return obj


def add_box_cad(name: str, center_cad, size_cad, mat, col, rot_z_cad: float = 0.0):
    """Creates a box given CAD center (x,y,z) and CAD dimensions (dx, dy, dz)."""
    loc = cad_to_bl(*center_cad)
    sx, sy, sz = size_cad
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=loc)
    obj = bpy.context.active_object
    obj.name = name
    # In Blender coords: X=dx, Y=dz, Z=dy
    obj.scale = (sx, sz, sy)
    if abs(rot_z_cad) > 1e-5:
        # Rotation around CAD Z-axis corresponds to negative rotation around Blender Y-axis
        obj.rotation_euler = (0.0, -rot_z_cad, 0.0)
    if mat:
        obj.data.materials.append(mat)
    link_to_collection(obj, col)
    return obj


def add_weld_torus_cad(name: str, center_cad, axis_cad, major_r: float, minor_r: float, mat, col):
    """Generates a 3D TIG weld bead ring at a frame tube intersection."""
    loc = cad_to_bl(*center_cad)
    axis_bl = cad_to_bl(*axis_cad).normalized()
    bpy.ops.mesh.primitive_torus_add(
        major_radius=major_r,
        minor_radius=minor_r,
        major_segments=28,
        minor_segments=12,
        location=loc
    )
    obj = bpy.context.active_object
    obj.name = name
    z_axis = Vector((0.0, 0.0, 1.0))
    obj.rotation_mode = 'QUATERNION'
    obj.rotation_quaternion = z_axis.rotation_difference(axis_bl)
    if mat:
        obj.data.materials.append(mat)
    link_to_collection(obj, col)
    return obj


# ==============================================================================
# 3. BUILD COLLECTIONS FOR ALL 7 ENGINEERING NODES
# ==============================================================================
def build_frame_collection(mats, root_col):
    """1. STERN DYNAMIC 1.0 18" MOD FRAME (Exact CAD Coordinates)."""
    col = get_or_create_collection("00_Frame_Stern_18_Mod", root_col)
    m_frame = mats["MAT_FRAME_RAL9005"]
    m_ano = mats["MAT_ANODIZED_BLACK"]

    # 1.1 Bottom Bracket Shell (BB): (0,0,0), width 68mm along Z_cad, OD 40mm (R=0.020)
    add_cylinder_between_cad("BB_Shell_68mm", (0, 0, -0.034), (0, 0, 0.034), 0.020, 0.020, m_frame, col, 32)

    # 1.2 Seat Tube: (0,0,0) -> (-0.145, 0.435, 0), L=455mm, OD=31.8mm (R=0.0159)
    add_cylinder_between_cad("Seat_Tube_455mm", (0, 0, 0), (-0.145, 0.435, 0), 0.0159, 0.0159, m_frame, col, 28)

    # 1.3 Head Tube 1 1/8" EC34: (0.425, 0.450, 0) -> (0.390, 0.565, 0), L=120mm, OD=38mm (R=0.019)
    add_cylinder_between_cad("Head_Tube_EC34", (0.425, 0.450, 0), (0.390, 0.565, 0), 0.019, 0.019, m_frame, col, 32)
    add_cylinder_between_cad("Headset_Cup_Lower_EC34", (0.428, 0.440, 0), (0.425, 0.450, 0), 0.022, 0.024, m_ano, col, 32)
    add_cylinder_between_cad("Headset_Cup_Upper_EC34", (0.390, 0.565, 0), (0.387, 0.575, 0), 0.024, 0.022, m_ano, col, 32)

    # 1.4 Downtube (Bi-oval 42x34mm, clean inner span 560mm): (0.015, 0.015, 0) -> (0.415, 0.465, 0)
    add_cylinder_between_cad(
        "Downtube_BiOval_560mm", (0.015, 0.015, 0), (0.415, 0.465, 0),
        0.021, 0.021, m_frame, col, 32, scale_xy=(1.0, 0.81)
    )

    # 1.5 Toptube (clean span 490mm, OD 31.8mm): (0.395, 0.545, 0) -> (-0.135, 0.415, 0)
    add_cylinder_between_cad("Toptube_490mm", (0.395, 0.545, 0), (-0.135, 0.415, 0), 0.0159, 0.0159, m_frame, col, 28)

    # 1.6 Rear Triangle (OLD = 135mm, z_cad = ±0.0675, Rear Axle = (-0.435, 0.030, 0))
    for side, tag in [(1.0, "Left"), (-1.0, "Right")]:
        add_cylinder_between_cad(
            f"Chainstay_{tag}", (0.0, 0.0, side * 0.025), (-0.435, 0.030, side * 0.0675),
            0.014, 0.011, m_frame, col, 20, scale_xy=(1.0, 0.65)
        )
        add_cylinder_between_cad(
            f"Seatstay_{tag}", (-0.140, 0.390, side * 0.020), (-0.435, 0.045, side * 0.0675),
            0.0095, 0.0095, m_frame, col, 20
        )

    # TIG Weld seams
    add_weld_torus_cad("Weld_Down_Head", (0.412, 0.465, 0), (0.400, 0.450, 0), 0.021, 0.0032, m_frame, col)
    add_weld_torus_cad("Weld_Top_Head", (0.392, 0.545, 0), (0.530, 0.130, 0), 0.0165, 0.0030, m_frame, col)
    add_weld_torus_cad("Weld_Top_Seat", (-0.135, 0.415, 0), (0.530, 0.130, 0), 0.0165, 0.0030, m_frame, col)


def build_fork_collection(mats, root_col):
    """2. NODE 1: FRONT AIR FORK FOXSID-X2 26" (Single-Crown, 120mm Travel, Mudguard)."""
    col = get_or_create_collection("01_Fork_FOXSID_X2_26", root_col)
    m_frame = mats["MAT_FRAME_RAL9005"]
    m_ano = mats["MAT_ANODIZED_BLACK"]
    m_red = mats["MAT_RED_ANODIZED"]
    m_blue = mats["MAT_BLUE_ANODIZED"]

    # Steerer 1 1/8" + Single Crown
    add_cylinder_between_cad("Fork_Steerer_1_1_8", (0.430, 0.435, 0), (0.375, 0.615, 0), 0.0143, 0.0143, m_ano, col, 24)
    add_cylinder_between_cad("Fork_Crown_Single", (0.448, 0.438, -0.068), (0.448, 0.438, 0.068), 0.022, 0.022, m_frame, col, 24)

    for side, tag in [(1.0, "Left"), (-1.0, "Right")]:
        z_leg = side * 0.065
        z_drop = side * 0.055
        # 32mm Black Anodized Stanchions (120mm travel)
        add_cylinder_between_cad(
            f"FOXSID_Stanchion_32mm_{tag}", (0.448, 0.438, z_leg), (0.495, 0.285, z_leg * 0.92),
            0.016, 0.016, m_ano, col, 28
        )
        # 42mm Matte Black Magnesium Lowers
        add_cylinder_between_cad(
            f"FOXSID_Lower_42mm_{tag}", (0.495, 0.295, z_leg * 0.92), (0.565, 0.025, z_drop),
            0.021, 0.0185, m_frame, col, 32
        )

    # Top Air Valve Cap (Left) & Lockout Dial (Right) + Red Sag O-Ring on Left Stanchion
    add_cylinder_between_cad("FOXSID_Air_Cap_Left", (0.445, 0.448, 0.065), (0.442, 0.456, 0.065), 0.014, 0.013, m_blue, col, 18)
    add_cylinder_between_cad("FOXSID_Lockout_Right", (0.445, 0.448, -0.065), (0.442, 0.456, -0.065), 0.015, 0.015, m_red, col, 18)
    add_weld_torus_cad("FOXSID_Red_Sag_Ring_Left", (0.458, 0.405, 0.064), (0.117, -0.413, 0), 0.0168, 0.0022, m_red, col)

    # Fork Arch (Gorilla) + Mudguard under Arch
    add_cylinder_between_cad("FOXSID_Gorilla_Arch", (0.495, 0.285, -0.060), (0.495, 0.285, 0.060), 0.012, 0.012, m_frame, col, 20)
    add_box_cad("FOXSID_Front_Mudguard", (0.505, 0.295, 0.0), (0.135, 0.012, 0.082), mats["MAT_PETG_HOLDER"], col, -0.35)


def build_cockpit_collection(mats, root_col):
    """3. NODE 2: COCKPIT, 740MM RISER BAR, SUR-RON DUAL LED HEADLIGHT, SW900, 20X THROTTLE & ZOOM LEVERS."""
    col = get_or_create_collection("02_Cockpit_SurRon_Headlight_ZOOM", root_col)
    m_ano = mats["MAT_ANODIZED_BLACK"]

    # 45mm Stem + 740mm Riser Handlebar
    add_cylinder_between_cad("Stem_45mm_CNC", (0.376, 0.608, 0), (0.418, 0.620, 0), 0.021, 0.021, m_ano, col, 20)
    add_cylinder_between_cad("Riser_Bar_740mm", (0.385, 0.652, -0.370), (0.385, 0.652, 0.370), 0.0125, 0.0125, m_ano, col, 28)

    # Sur-Ron Light Bee X (20W) Dual Rectangular LED Headlight under center of handlebar
    add_box_cad("SurRon_Headlight_20W_Housing", (0.452, 0.585, 0.0), (0.044, 0.042, 0.112), m_ano, col, -0.18)
    add_cylinder_between_cad("SurRon_LED_Eye_Left", (0.468, 0.585, 0.026), (0.474, 0.585, 0.026), 0.014, 0.014, mats["MAT_LED_HEADLIGHT"], col, 20)
    add_cylinder_between_cad("SurRon_LED_Eye_Right", (0.468, 0.585, -0.026), (0.474, 0.585, -0.026), 0.014, 0.014, mats["MAT_LED_HEADLIGHT"], col, 20)

    # SW900 Display + 2-in-1 Switch + 20X Half-Twist Throttle + ZOOM HB-890E Levers
    add_box_cad("SW900_LCD_Computer", (0.415, 0.658, 0.0), (0.018, 0.056, 0.086), m_ano, col, 0.45)
    add_box_cad("Switch_2in1_Horn_Light", (0.380, 0.655, 0.232), (0.034, 0.042, 0.026), m_ano, col)
    add_cylinder_between_cad("Throttle_20X_HalfTwist", (0.382, 0.654, -0.220), (0.374, 0.656, -0.275), 0.022, 0.020, m_ano, col, 24)


def build_wheels_and_motor_collection(mats, root_col):
    """4. NODE 3: 26" WHEELS ON MTX39 RIMS, KENDA 26x2.35" TIRES WITH 72 KNOB STEPS & 3000W DD MOTOR."""
    col = get_or_create_collection("03_Wheels_26_MTX39_Motor_3000W", root_col)
    m_rubber = mats["MAT_RUBBER_KENDA"]
    m_frame = mats["MAT_FRAME_RAL9005"]
    m_ano = mats["MAT_ANODIZED_BLACK"]
    m_steel = mats["MAT_STEEL_ROTOR"]

    for wheel_name, wx, wy in [("Front_Wheel_26", 0.565, 0.030), ("Rear_Wheel_26_3000W", -0.435, 0.030)]:
        # Tire Carcass (R_outer = 0.335m, tube_r = 0.0295m -> major_r = 0.3055m)
        add_weld_torus_cad(f"{wheel_name}_Kenda_Carcass", (wx, wy, 0.0), (0, 0, 1), 0.3055, 0.0295, m_rubber, col)
        # MTX39 Rim (width 39mm, height 24mm)
        add_weld_torus_cad(f"{wheel_name}_MTX39_Rim", (wx, wy, 0.0), (0, 0, 1), 0.268, 0.0195, m_ano, col)

        # 72-step 3D Tread Knobs around circumference
        for i in range(72):
            theta = (i / 72.0) * math.pi * 2.0
            for side in (-1.0, 1.0):
                kx = wx + math.cos(theta) * 0.332
                ky = wy + math.sin(theta) * 0.332
                kz = side * 0.014
                add_box_cad(f"{wheel_name}_Knob_{i}_{int(side)}", (kx, ky, kz), (0.012, 0.007, 0.012), m_rubber, col, theta)

        # 180mm Perforated Stainless Steel Brake Rotor on Left Side (z_cad = +0.048)
        add_cylinder_between_cad(f"{wheel_name}_Rotor_180mm", (wx, wy, 0.047), (wx, wy, 0.0492), 0.090, 0.090, m_steel, col, 36)

    # Rear 72V 3000W Direct Drive Hub Motor (OD 245mm -> R=0.1225m) + M14 Axle
    add_cylinder_between_cad("Motor_72V_3000W_Stator_245mm", (-0.435, 0.030, -0.034), (-0.435, 0.030, 0.034), 0.1225, 0.1225, m_frame, col, 48)
    add_box_cad("Motor_Axle_M14_10mm_Flats", (-0.435, 0.030, 0.0), (0.014, 0.010, 0.185), m_steel, col)


def build_dropout_and_brakes_collection(mats, root_col):
    """5. NODE 4: CUSTOM 6MM MONOLITHIC DROPOUT ARMOR PLATE (M14 10x14MM + IS 51MM) & ZOOM HB-890E CALIPERS."""
    col = get_or_create_collection("04_Dropout_6mm_M14_PrintTemplate_ZOOM", root_col)
    m_frame = mats["MAT_FRAME_RAL9005"]
    m_ano = mats["MAT_ANODIZED_BLACK"]

    # Monolithic 6mm Left Steel Armor Plate ("2-in-1": M14 10x14mm slot + IS 51mm brake mounting ears)
    add_box_cad("Left_6mm_Monolithic_Dropout_Plate_M14_IS51", (-0.435, 0.052, 0.073), (0.064, 0.095, 0.006), m_frame, col)
    add_box_cad("Right_6mm_Torque_Dropout_Plate_M14", (-0.435, 0.035, -0.073), (0.056, 0.055, 0.006), m_frame, col)

    # Rear & Front 4-Piston Forged ZOOM HB-890E Hydraulic Brake Calipers
    add_box_cad("ZOOM_HB890E_4Piston_Caliper_Rear", (-0.421, 0.112, 0.052), (0.036, 0.076, 0.034), m_ano, col, -1.12)
    add_box_cad("ZOOM_HB890E_4Piston_Caliper_Front", (0.508, 0.088, 0.052), (0.036, 0.076, 0.034), m_ano, col, -0.32)


def build_battery_20s7p_collection(mats, root_col):
    """6. NODE 5: TACTICAL BAG CORDURA 1000D & EXACT 140x 21700 EVE 50E CELLS (20S7P) + BISIDA 120A BMS."""
    col = get_or_create_collection("05_Battery_20S7P_140Cells_EVE50E", root_col)
    m_cell = mats["MAT_CELL_EVE50E"]
    m_ni = mats["MAT_NICKEL_STRIP"]
    m_cu = mats["MAT_COPPER_BUSBAR"]
    m_cordura = mats["MAT_CORDURA_1000D"]
    m_petg = mats["MAT_PETG_HOLDER"]

    # Outer Cordura 1000D Left & Right Removable Covers
    add_box_cad("Cordura_1000D_Bag_Left_Cover", (0.145, 0.305, 0.039), (0.460, 0.320, 0.004), m_cordura, col, 0.42)
    add_box_cad("Cordura_1000D_Bag_Right_Cover", (0.145, 0.305, -0.039), (0.460, 0.320, 0.004), m_cordura, col, 0.42)

    # Generate all 140 cylindrical cells Li-ion 21700 EVE INR21700-50E (OD 21.2mm -> R=0.0106m, L=70.5mm):
    # Arranged in a TRUE 12-ROW TRIANGLE matching the bicycle frame triangle (T_A, T_B, T_C):
    T_A = (0.015, 0.056)
    T_B = (0.365, 0.454)
    T_C = (-0.095, 0.354)

    row_counts = [20, 19, 17, 16, 14, 12, 11, 10, 9, 6, 4, 2] # Sum = 140 cells
    s_vals = [0.000, 0.082, 0.164, 0.246, 0.328, 0.410, 0.492, 0.572, 0.648, 0.745, 0.840, 0.935]

    zones = [
        [0, 1, 2],      # Zone 0: 56 cells -> 8 sections (1S..8S)
        [3, 4, 5],      # Zone 1: 42 cells -> 6 sections (9S..14S)
        [6, 7],         # Zone 2: 21 cells -> 3 sections (15S..17S)
        [8, 9, 10, 11]  # Zone 3: 21 cells -> 3 sections (18S..20S)
    ]

    # Generate cells row by row
    rows = []
    for r, cnt in enumerate(row_counts):
        s = s_vals[r]
        lx = T_A[0] + s * (T_C[0] - T_A[0])
        ly = T_A[1] + s * (T_C[1] - T_A[1])
        rx = T_B[0] + s * (T_C[0] - T_B[0])
        ry = T_B[1] + s * (T_C[1] - T_B[1])

        row_cells = []
        for c in range(cnt):
            t = c / (cnt - 1) if cnt > 1 else 0.5
            t_norm = (c + 0.5) / cnt
            cx = lx + t * (rx - lx)
            cy = ly + t * (ry - ly)
            row_cells.append({'row': r, 'col': c, 't_norm': t_norm, 'cx': cx, 'cy': cy})
        rows.append(row_cells)

    series_counter = 0
    for z_idx, z_rows in enumerate(zones):
        zone_cells = []
        for r_idx in z_rows:
            zone_cells.extend(rows[r_idx])

        reverse_dir = (z_idx % 2 == 1)
        zone_cells.sort(key=lambda item: (-item['t_norm'] if reverse_dir else item['t_norm'], -item['row'] if reverse_dir else item['row']))

        for k in range(0, len(zone_cells), 7):
            series_counter += 1
            s_id = series_counter
            s_col = get_or_create_collection(f"Battery_Section_{s_id:02d}S_7P", col)
            cluster = zone_cells[k:k + 7]

            for p_idx, cell in enumerate(cluster):
                cx, cy = cell['cx'], cell['cy']
                add_cylinder_between_cad(
                    f"Cell_EVE50E_{s_id:02d}S_{p_idx + 1}P",
                    (cx, cy, -0.03525), (cx, cy, 0.03525),
                    0.0106, 0.0106, m_cell, s_col, 16
                )

            # Stamped Nickel Strip (0.15x8mm) + Soldered Tinned Copper Busbar (2.5mm²)
            first_c = cluster[0]
            last_c = cluster[-1]
            mx = sum(c['cx'] for c in cluster) / 7.0
            my = sum(c['cy'] for c in cluster) / 7.0
            ang = math.atan2(last_c['cy'] - first_c['cy'], last_c['cx'] - first_c['cx'])
            for z_end, side_tag in [(0.036, "L"), (-0.036, "R")]:
                add_box_cad(f"Nickel_Strip_{s_id:02d}S_{side_tag}", (mx, my, z_end), (0.125, 0.008, 0.0006), m_ni, s_col, ang)
                add_box_cad(f"Copper_Busbar_{s_id:02d}S_{side_tag}", (mx, my, z_end * 1.02), (0.120, 0.0032, 0.0014), m_cu, s_col, ang)

    # Bisida BMS 20S 120A Li-ion in upper gap under Toptube + Amass XT90-S Anti-Spark
    add_box_cad("Bisida_BMS_20S_120A_Heatsink", (0.145, 0.432, 0.0), (0.145, 0.022, 0.064), mats["MAT_ANODIZED_BLACK"], col, 0.24)
    add_box_cad("Amass_XT90S_AntiSpark", (-0.105, 0.385, 0.012), (0.026, 0.022, 0.012), mats["MAT_XT90_YELLOW"], col)
    add_box_cad("PETG_Honeycomb_Holder_Left", (0.145, 0.275, 0.029), (0.420, 0.220, 0.012), m_petg, col, 0.72)
    add_box_cad("PETG_Honeycomb_Holder_Right", (0.145, 0.275, -0.029), (0.420, 0.220, 0.012), m_petg, col, 0.72)


def build_undertube_controller_collection(mats, root_col):
    """7. NODE 6: UNDER-TUBE SINE CONTROLLER 72V 60A + 3D-PRINTED PETG WIRING BOX WITH 105 dB HORN & DC-DC."""
    col = get_or_create_collection("06_UnderTube_Controller60A_3DBox_PETG", root_col)
    m_frame = mats["MAT_FRAME_RAL9005"]
    m_petg = mats["MAT_PETG_HOLDER"]
    m_steel = mats["MAT_STEEL_ROTOR"]
    m_ano = mats["MAT_ANODIZED_BLACK"]

    down_angle = math.atan2(0.465 - 0.015, 0.415 - 0.015)

    # 1. Sine Controller 72V 60A (18 MOSFET) hanging under upper/mid Downtube
    add_box_cad("Sine_Controller_72V_60A_18MOSFET", (0.305, 0.270, 0.0), (0.215, 0.052, 0.086), m_frame, col, down_angle)

    # 2. Faceted 3D-Printed PETG Sealed Wiring Box with slanted acoustic gill louvers below controller
    add_box_cad("PETG_3D_Wiring_Box_Acoustic_Gills", (0.142, 0.086, 0.0), (0.175, 0.064, 0.084), m_petg, col, down_angle)

    # 3. Internal DC-DC 36-120V -> 12V 10A Converter + Phase Terminal Block + Hidden 105 dB Moto Horn
    add_box_cad("DCDC_Converter_12V_10A", (0.168, 0.115, 0.0), (0.058, 0.022, 0.046), m_steel, col, down_angle)
    add_cylinder_between_cad(
        "Hidden_Moto_Horn_105dB_12V", (0.110, 0.055, -0.014), (0.110, 0.055, 0.014),
        0.031, 0.031, m_ano, col, 24
    )


def build_moto_saddle_collection(mats, root_col):
    """8. NODE 7: LONG SUR-RON / PITBIKE MOTO SADDLE (530MM) + WELDED STEEL SUBFRAME + LED BRAKE LIGHT."""
    col = get_or_create_collection("07_Moto_Saddle_SurRon_530mm_Subframe", root_col)
    m_vinyl = mats["MAT_MOTO_VINYL"]
    m_frame = mats["MAT_FRAME_RAL9005"]

    # Long 530mm Sur-Ron Moto Saddle with 40x70mm U-channel over seat tube top (-0.145, 0.435, 0)
    add_box_cad("SurRon_Moto_Saddle_530mm", (-0.320, 0.525, 0.0), (0.530, 0.078, 0.155), m_vinyl, col, -0.22)

    # Welded Steel Subframe (16-20mm tubes, 2mm wall) + rear struts bolted with M6 to seatstays
    for side, tag in [(1.0, "Left"), (-1.0, "Right")]:
        add_cylinder_between_cad(
            f"Subframe_Upper_Rail_{tag}", (-0.145, 0.462, side * 0.022), (-0.525, 0.565, side * 0.042),
            0.009, 0.009, m_frame, col, 16
        )
        add_cylinder_between_cad(
            f"Subframe_Rear_Strut_M6_{tag}", (-0.485, 0.548, side * 0.042), (-0.255, 0.250, side * 0.038),
            0.009, 0.009, m_frame, col, 16
        )

    # Short Rear Pitbike Tail Fender + Integrated Red LED Stop-Light
    add_box_cad("Rear_Pitbike_Tail_Fender", (-0.565, 0.555, 0.0), (0.140, 0.010, 0.082), mats["MAT_PETG_HOLDER"], col, 0.15)
    add_box_cad("Rear_LED_Brake_Light", (-0.580, 0.556, 0.0), (0.012, 0.016, 0.062), mats["MAT_BRAKE_LED"], col, 0.22)


def main():
    reset_scene()
    mats = build_materials_library()
    root_col = get_or_create_collection("STEALTH_SURRON_72V_3000W_CAD")

    build_frame_collection(mats, root_col)
    build_fork_collection(mats, root_col)
    build_cockpit_collection(mats, root_col)
    build_wheels_and_motor_collection(mats, root_col)
    build_dropout_and_brakes_collection(mats, root_col)
    build_battery_20s7p_collection(mats, root_col)
    build_undertube_controller_collection(mats, root_col)
    build_moto_saddle_collection(mats, root_col)

    print("[STEALTH SUR-RON 72V 3000W] High-Poly Procedural CAD Model (140x 21700 EVE 50E) generated successfully!")


if __name__ == "__main__":
    main()
