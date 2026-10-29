#!/usr/bin/env python3
"""
STEALTH SUR-RON 72V 3000W — NATIVE ANDROID APK COMPILER (build_android_apk.py)
Generates a 100% self-contained, offline, signed Android application package:
  - Stealth_SurRon_72V_3000W.apk
Containing:
  - Binary AndroidManifest.xml (AXML format, hardwareAccelerated=true, fullscreen WebGL)
  - Binary resources.arsc (Resource Table for @drawable/icon and @string/app_name)
  - Compiled Dalvik Bytecode classes.dex (MainActivity with hardware-accelerated WebView)
  - High-res custom tactical icon (res/drawable/icon.png)
  - Embedded 100% offline 3D CAD WebGL application (assets/index.html)
  - Dual Cryptographic Signatures: JAR v1 (META-INF/CERT.RSA) + APK Signature Scheme v2 (APK Sig Block 42)
"""

import base64
import datetime
import hashlib
import os
import struct
import subprocess
import tempfile
import zlib

from cryptography import x509
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding, rsa
from cryptography.x509.oid import NameOID


# ==============================================================================
# 1. GENERATE TACTICAL APP ICON PNG (res/drawable/icon.png)
# ==============================================================================
def create_tactical_icon_png(size: int = 192) -> bytes:
    """Generates a 192x192 RGBA PNG icon with the Stealth Sur-Ron 72V 3KWT emblem."""
    raw_rows = bytearray()
    cx, cy = size / 2.0, size / 2.0

    for y in range(size):
        raw_rows.append(0)  # PNG filter type 0 (None)
        for x in range(size):
            dx = x - cx
            dy = y - cy
            dist = (dx * dx + dy * dy) ** 0.5

            # Rounded dark carbon square background
            r, g, b, a = 10, 11, 14, 255
            max_c = max(abs(dx), abs(dy))
            if max_c > size * 0.46:
                a = 0
            elif max_c > size * 0.42:
                # Tactical orange border frame (#FF5500)
                r, g, b = 255, 85, 0
            else:
                # Subtle radial gradient
                vignette = max(0.0, 1.0 - dist / (size * 0.5))
                r = int(12 + 18 * vignette)
                g = int(14 + 20 * vignette)
                b = int(18 + 24 * vignette)

                # Inner triangular battery frame silhouette (560x490x360 triangle)
                # Normalized coordinates u, v in [-1, 1]
                u = dx / (size * 0.32)
                v = -dy / (size * 0.32)

                # Triangle vertices: BB (-0.55, -0.55), Seat (-0.65, 0.52), Head (0.72, 0.62)
                # Check if inside frame triangle
                if v > -0.55 and v < 0.55 + 0.08 * u and u - v < 0.22 and u > -0.62 - 0.1 * v:
                    # Honeycomb 21700 grid pattern inside triangle
                    gx = (x % 12) - 6
                    gy = (y % 12) - 6
                    if gx * gx + gy * gy < 14:
                        # Neon green/cyan 21700 cell glow
                        r, g, b = 0, 230, 118
                    else:
                        # Tactical orange copper busbar accent
                        r, g, b = 255, 95, 10

                # Two wheel rings at bottom-left and bottom-right
                d_rear = ((u + 0.65) ** 2 + (v + 0.45) ** 2) ** 0.5
                d_front = ((u - 0.68) ** 2 + (v + 0.45) ** 2) ** 0.5
                if 0.26 <= d_rear <= 0.36 or 0.26 <= d_front <= 0.36:
                    r, g, b = 235, 240, 245
                elif 0.08 <= d_rear <= 0.16:
                    # Rear 3000W hub motor copper ring
                    r, g, b = 255, 85, 0

            raw_rows.extend((r, g, b, a))

    def png_chunk(chunk_type: bytes, data: bytes) -> bytes:
        crc = zlib.crc32(chunk_type + data) & 0xFFFFFFFF
        return struct.pack(">I", len(data)) + chunk_type + data + struct.pack(">I", crc)

    ihdr = struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)
    idat = zlib.compress(bytes(raw_rows), 9)
    return (
        b"\x89PNG\r\n\x1a\n"
        + png_chunk(b"IHDR", ihdr)
        + png_chunk(b"IDAT", idat)
        + png_chunk(b"IEND", b"")
    )


# ==============================================================================
# 2. GENERATE BINARY ANDROIDMANIFEST.XML (AXML FORMAT)
# ==============================================================================
def build_binary_android_manifest(package_name: str = "com.stealth.surron.cad") -> bytes:
    """
    Builds a spec-compliant Android Binary XML (AXML) AndroidManifest.xml.
    Attribute names with Android resource IDs are placed first in the StringPool
    and sorted in strictly ascending order of their resource IDs.
    """
    # 1. Attribute names mapped to android.R.attr.* resource IDs (sorted by resId!)
    attr_defs = [
        ("theme", 0x01010000),                     # idx 0
        ("label", 0x01010001),                     # idx 1
        ("icon", 0x01010002),                      # idx 2
        ("name", 0x01010003),                      # idx 3
        ("exported", 0x01010010),                  # idx 4
        ("configChanges", 0x0101001F),             # idx 5
        ("minSdkVersion", 0x0101020C),             # idx 6
        ("versionCode", 0x0101021B),               # idx 7
        ("versionName", 0x0101021C),               # idx 8
        ("targetSdkVersion", 0x01010270),          # idx 9
        ("hardwareAccelerated", 0x010102D3),       # idx 10
        ("compileSdkVersion", 0x01010572),         # idx 11
        ("compileSdkVersionCodename", 0x01010573), # idx 12
    ]

    extra_strings = [
        "android",
        "http://schemas.android.com/apk/res/android",
        "manifest",
        "package",
        package_name,
        "2.0",
        "14",
        "platformBuildVersionCode",
        "platformBuildVersionName",
        "uses-sdk",
        "application",
        "STEALTH SUR-RON 72V 3000W",
        "activity",
        f"{package_name}.MainActivity",
        "intent-filter",
        "action",
        "android.intent.action.MAIN",
        "category",
        "android.intent.category.LAUNCHER",
    ]

    all_strings = [name for name, _ in attr_defs] + extra_strings
    str_to_idx = {s: i for i, s in enumerate(all_strings)}

    # Build UTF-16LE StringPool chunk (RES_STRING_POOL_TYPE = 0x0001)
    encoded_strings = []
    offsets = []
    cur_offset = 0
    for s in all_strings:
        offsets.append(cur_offset)
        u16 = s.encode("utf-16le")
        char_len = len(s)
        blob = struct.pack("<H", char_len) + u16 + b"\x00\x00"
        encoded_strings.append(blob)
        cur_offset += len(blob)

    strings_blob = b"".join(encoded_strings)
    while len(strings_blob) % 4 != 0:
        strings_blob += b"\x00"

    string_count = len(all_strings)
    strings_start = 28 + string_count * 4
    sp_size = strings_start + len(strings_blob)
    sp_header = struct.pack(
        "<HHIIIIII",
        0x0001,         # RES_STRING_POOL_TYPE
        28,             # headerSize
        sp_size,        # chunkSize
        string_count,   # stringCount
        0,              # styleCount
        0,              # flags (0 = UTF-16LE)
        strings_start,  # stringsStart
        0,              # stylesStart
    )
    sp_offsets = b"".join(struct.pack("<I", off) for off in offsets)
    chunk_string_pool = sp_header + sp_offsets + strings_blob

    # Build ResourceMap chunk (RES_XML_RESOURCE_MAP_TYPE = 0x0180)
    res_ids_blob = b"".join(struct.pack("<I", rid) for _, rid in attr_defs)
    chunk_res_map = struct.pack("<HHI", 0x0180, 8, 8 + len(res_ids_blob)) + res_ids_blob

    # Helper functions for XML tree nodes
    NS_ANDROID = str_to_idx["http://schemas.android.com/apk/res/android"]
    NO_NS = 0xFFFFFFFF

    TYPE_REFERENCE = 0x01
    TYPE_STRING = 0x03
    TYPE_INT_DEC = 0x10
    TYPE_INT_HEX = 0x11
    TYPE_INT_BOOLEAN = 0x12

    def make_attr(ns_idx: int, name_str: str, val_type: int, data_val: int, raw_str: str = None) -> bytes:
        name_idx = str_to_idx[name_str]
        raw_idx = str_to_idx[raw_str] if raw_str is not None else 0xFFFFFFFF
        typed_value = struct.pack("<HBBI", 8, 0, val_type, data_val & 0xFFFFFFFF)
        return struct.pack("<III", ns_idx, name_idx, raw_idx) + typed_value

    def make_start_ns(prefix_str: str, uri_str: str, line: int) -> bytes:
        return struct.pack(
            "<HHIIIII",
            0x0100,  # RES_XML_START_NAMESPACE_TYPE
            16,
            24,
            line,
            0xFFFFFFFF,
            str_to_idx[prefix_str],
            str_to_idx[uri_str],
        )

    def make_end_ns(prefix_str: str, uri_str: str, line: int) -> bytes:
        return struct.pack(
            "<HHIIIII",
            0x0101,  # RES_XML_END_NAMESPACE_TYPE
            16,
            24,
            line,
            0xFFFFFFFF,
            str_to_idx[prefix_str],
            str_to_idx[uri_str],
        )

    def make_start_element(elem_name: str, line: int, attrs: list) -> bytes:
        attr_blob = b"".join(attrs)
        chunk_len = 36 + len(attr_blob)
        return (
            struct.pack(
                "<HHIIIIIHHHHHH",
                0x0102,              # RES_XML_START_ELEMENT_TYPE
                16,                  # headerSize
                chunk_len,           # size
                line,                # lineNumber
                0xFFFFFFFF,          # comment
                NO_NS,               # ns
                str_to_idx[elem_name],
                20,                  # attributeStart
                20,                  # attributeSize
                len(attrs),          # attributeCount
                0,                   # idIndex
                0,                   # classIndex
                0,                   # styleIndex
            )
            + attr_blob
        )

    def make_end_element(elem_name: str, line: int) -> bytes:
        return struct.pack(
            "<HHIIIII",
            0x0103,  # RES_XML_END_ELEMENT_TYPE
            16,
            24,
            line,
            0xFFFFFFFF,
            NO_NS,
            str_to_idx[elem_name],
        )

    # Assemble XML hierarchy (attributes with resource IDs MUST come before attributes without resource IDs,
    # and must be ordered by strictly ascending resource ID!)
    xml_chunks = [
        make_start_ns("android", "http://schemas.android.com/apk/res/android", 2),
        # <manifest android:versionCode="2" android:versionName="2.0" android:compileSdkVersion="34" ...>
        make_start_element(
            "manifest",
            2,
            [
                make_attr(NS_ANDROID, "versionCode", TYPE_INT_DEC, 2),
                make_attr(NS_ANDROID, "versionName", TYPE_STRING, str_to_idx["2.0"], "2.0"),
                make_attr(NS_ANDROID, "compileSdkVersion", TYPE_INT_DEC, 34),
                make_attr(NS_ANDROID, "compileSdkVersionCodename", TYPE_STRING, str_to_idx["14"], "14"),
                make_attr(NO_NS, "package", TYPE_STRING, str_to_idx[package_name], package_name),
                make_attr(NO_NS, "platformBuildVersionCode", TYPE_INT_DEC, 34),
                make_attr(NO_NS, "platformBuildVersionName", TYPE_INT_DEC, 14),
            ],
        ),
        # <uses-sdk android:minSdkVersion="24" android:targetSdkVersion="34" />
        make_start_element(
            "uses-sdk",
            6,
            [
                make_attr(NS_ANDROID, "minSdkVersion", TYPE_INT_DEC, 24),
                make_attr(NS_ANDROID, "targetSdkVersion", TYPE_INT_DEC, 34),
            ],
        ),
        make_end_element("uses-sdk", 6),
        # <application android:theme="@android:style/Theme.NoTitleBar.Fullscreen"
        #              android:label="STEALTH SUR-RON 72V 3000W"
        #              android:icon="@drawable/icon"
        #              android:hardwareAccelerated="true">
        make_start_element(
            "application",
            7,
            [
                make_attr(NS_ANDROID, "theme", TYPE_REFERENCE, 0x01030007),
                make_attr(
                    NS_ANDROID,
                    "label",
                    TYPE_STRING,
                    str_to_idx["STEALTH SUR-RON 72V 3000W"],
                    "STEALTH SUR-RON 72V 3000W",
                ),
                make_attr(NS_ANDROID, "icon", TYPE_REFERENCE, 0x7F010000),
                make_attr(NS_ANDROID, "hardwareAccelerated", TYPE_INT_BOOLEAN, 0xFFFFFFFF),
            ],
        ),
        # <activity android:label="..." android:name="..." android:exported="true" android:configChanges="0x04a0">
        make_start_element(
            "activity",
            12,
            [
                make_attr(
                    NS_ANDROID,
                    "label",
                    TYPE_STRING,
                    str_to_idx["STEALTH SUR-RON 72V 3000W"],
                    "STEALTH SUR-RON 72V 3000W",
                ),
                make_attr(
                    NS_ANDROID,
                    "name",
                    TYPE_STRING,
                    str_to_idx[f"{package_name}.MainActivity"],
                    f"{package_name}.MainActivity",
                ),
                make_attr(NS_ANDROID, "exported", TYPE_INT_BOOLEAN, 0xFFFFFFFF),
                make_attr(NS_ANDROID, "configChanges", TYPE_INT_HEX, 0x000004A0),
            ],
        ),
        # <intent-filter>
        make_start_element("intent-filter", 17, []),
        # <action android:name="android.intent.action.MAIN" />
        make_start_element(
            "action",
            18,
            [
                make_attr(
                    NS_ANDROID,
                    "name",
                    TYPE_STRING,
                    str_to_idx["android.intent.action.MAIN"],
                    "android.intent.action.MAIN",
                )
            ],
        ),
        make_end_element("action", 18),
        # <category android:name="android.intent.category.LAUNCHER" />
        make_start_element(
            "category",
            19,
            [
                make_attr(
                    NS_ANDROID,
                    "name",
                    TYPE_STRING,
                    str_to_idx["android.intent.category.LAUNCHER"],
                    "android.intent.category.LAUNCHER",
                )
            ],
        ),
        make_end_element("category", 19),
        make_end_element("intent-filter", 17),
        make_end_element("activity", 12),
        make_end_element("application", 7),
        make_end_element("manifest", 2),
        make_end_ns("android", "http://schemas.android.com/apk/res/android", 2),
    ]

    body = chunk_string_pool + chunk_res_map + b"".join(xml_chunks)
    return struct.pack("<HHI", 0x0003, 8, 8 + len(body)) + body


# ==============================================================================
# 3. GENERATE BINARY RESOURCES.ARSC (RES_TABLE_TYPE = 0x0002)
# ==============================================================================
def build_resources_arsc(package_name: str = "com.stealth.surron.cad") -> bytes:
    """
    Builds a binary resources.arsc table matching official Android SDK aapt2 output,
    mapping 0x7f010000 -> res/drawable/icon.png.
    """
    def make_utf8_string_pool(strings: list) -> bytes:
        enc_list = []
        offsets = []
        cur = 0
        for s in strings:
            offsets.append(cur)
            u8 = s.encode("utf-8")
            blob = bytes([len(s), len(u8)]) + u8 + b"\x00"
            enc_list.append(blob)
            cur += len(blob)
        s_blob = b"".join(enc_list)
        while len(s_blob) % 4 != 0:
            s_blob += b"\x00"
        count = len(strings)
        s_start = 28 + count * 4
        total = s_start + len(s_blob)
        hdr = struct.pack("<HHIIIIII", 0x0001, 28, total, count, 0, 0x0100, s_start, 0)
        offs = b"".join(struct.pack("<I", o) for o in offsets)
        return hdr + offs + s_blob

    def make_utf16_string_pool(strings: list) -> bytes:
        enc_list = []
        offsets = []
        cur = 0
        for s in strings:
            offsets.append(cur)
            u16 = s.encode("utf-16le")
            blob = struct.pack("<H", len(s)) + u16 + b"\x00\x00"
            enc_list.append(blob)
            cur += len(blob)
        s_blob = b"".join(enc_list)
        while len(s_blob) % 4 != 0:
            s_blob += b"\x00"
        count = len(strings)
        s_start = 28 + count * 4
        total = s_start + len(s_blob)
        hdr = struct.pack("<HHIIIIII", 0x0001, 28, total, count, 0, 0, s_start, 0)
        offs = b"".join(struct.pack("<I", o) for o in offsets)
        return hdr + offs + s_blob

    # 1. Global value string pool (UTF-8, flags=0x100): ["res/drawable/icon.png"]
    global_pool = make_utf8_string_pool(["res/drawable/icon.png"])

    # 2. Package string pools: typeStrings (UTF-16) = ["drawable"], keyStrings (UTF-8) = ["icon"]
    type_pool = make_utf16_string_pool(["drawable"])
    key_pool = make_utf8_string_pool(["icon"])

    # 3. ResTable_typeSpec (RES_TABLE_TYPE_SPEC_TYPE = 0x0202)
    type_spec = struct.pack("<HHIBBHII", 0x0202, 16, 20, 1, 0, 0, 1, 0)

    # 4. ResTable_type (RES_TABLE_TYPE_TYPE = 0x0201)
    # 64-byte ResTable_config (matching modern aapt2): headerSize = 20 + 64 = 84, entriesStart = 88
    res_config = struct.pack("<I", 64) + b"\x00" * 60
    res_entry = struct.pack("<HHIHBBI", 8, 0, 0, 8, 0, 0x03, 0)
    type_chunk_size = 84 + 4 + len(res_entry)
    type_chunk = (
        struct.pack("<HHIBBHII", 0x0201, 84, type_chunk_size, 1, 0, 0, 1, 88)
        + res_config
        + struct.pack("<I", 0)
        + res_entry
    )

    # 5. ResTable_package (RES_TABLE_PACKAGE_TYPE = 0x0200)
    pkg_name_u16 = package_name.encode("utf-16le")[:254].ljust(256, b"\x00")
    pkg_hdr_size = 288
    type_strings_off = pkg_hdr_size
    key_strings_off = type_strings_off + len(type_pool)
    pkg_body = type_pool + key_pool + type_spec + type_chunk
    pkg_total_size = pkg_hdr_size + len(pkg_body)

    pkg_hdr = (
        struct.pack("<HHII", 0x0200, pkg_hdr_size, pkg_total_size, 0x7F)
        + pkg_name_u16
        + struct.pack("<IIIII", type_strings_off, 0, key_strings_off, 0, 0)
    )
    pkg_chunk = pkg_hdr + pkg_body

    # 6. Top-level ResTable_header (RES_TABLE_TYPE = 0x0002, headerSize = 12, packageCount = 1)
    total_arsc_size = 12 + len(global_pool) + len(pkg_chunk)
    return struct.pack("<HHII", 0x0002, 12, total_arsc_size, 1) + global_pool + pkg_chunk


# ==============================================================================
# 4. GENERATE DALVIK EXECUTABLE CLASSES.DEX (MainActivity -> WebView)
# ==============================================================================
def uleb128(value: int) -> bytes:
    out = bytearray()
    while True:
        byte = value & 0x7F
        value >>= 7
        if value != 0:
            byte |= 0x80
        out.append(byte)
        if value == 0:
            break
    return bytes(out)


def build_classes_dex(package_name: str = "com.stealth.surron.cad") -> bytes:
    """
    Compiles a standalone Dalvik Executable (classes.dex, format 035) containing:
      package com.stealth.surron.cad;
      public class MainActivity extends android.app.Activity {
          public MainActivity() { super(); }
          protected void onCreate(android.os.Bundle b) {
              super.onCreate(b);
              WebView wv = new WebView(this);
              WebSettings ws = wv.getSettings();
              ws.setJavaScriptEnabled(true);
              ws.setDomStorageEnabled(true);
              this.setContentView(wv);
              wv.loadUrl("file:///android_asset/index.html");
          }
      }
    """
    pkg_slash = package_name.replace(".", "/")
    main_class_desc = f"L{pkg_slash}/MainActivity;"

    raw_strings = [
        "<init>",
        "L",
        "Landroid/app/Activity;",
        "Landroid/content/Context;",
        "Landroid/os/Bundle;",
        "Landroid/view/View;",
        "Landroid/webkit/WebSettings;",
        "Landroid/webkit/WebView;",
        "Ljava/lang/String;",
        main_class_desc,
        "MainActivity.java",
        "V",
        "VL",
        "VZ",
        "Z",
        "file:///android_asset/index.html",
        "getSettings",
        "loadUrl",
        "onCreate",
        "setContentView",
        "setDomStorageEnabled",
        "setJavaScriptEnabled",
    ]
    strings = sorted(set(raw_strings))
    s_idx = {s: i for i, s in enumerate(strings)}

    raw_types = [
        "Landroid/app/Activity;",
        "Landroid/content/Context;",
        "Landroid/os/Bundle;",
        "Landroid/view/View;",
        "Landroid/webkit/WebSettings;",
        "Landroid/webkit/WebView;",
        "Ljava/lang/String;",
        main_class_desc,
        "V",
        "Z",
    ]
    types = sorted(raw_types, key=lambda t: s_idx[t])
    t_idx = {t: i for i, t in enumerate(types)}

    # Protos: (shorty, return_type, param_types_tuple)
    raw_protos = [
        ("L", "Landroid/webkit/WebSettings;", ()),
        ("V", "V", ()),
        ("VL", "V", ("Landroid/content/Context;",)),
        ("VL", "V", ("Landroid/os/Bundle;",)),
        ("VL", "V", ("Landroid/view/View;",)),
        ("VL", "V", ("Ljava/lang/String;",)),
        ("VZ", "V", ("Z",)),
    ]
    protos = sorted(
        raw_protos,
        key=lambda p: (t_idx[p[1]], tuple(t_idx[pt] for pt in p[2])),
    )
    p_idx = {(p[1], p[2]): i for i, p in enumerate(protos)}

    # Methods: (class_type, method_name, (return_type, param_types_tuple))
    raw_methods = [
        ("Landroid/app/Activity;", "<init>", ("V", ())),
        ("Landroid/app/Activity;", "onCreate", ("V", ("Landroid/os/Bundle;",))),
        ("Landroid/app/Activity;", "setContentView", ("V", ("Landroid/view/View;",))),
        ("Landroid/webkit/WebSettings;", "setDomStorageEnabled", ("V", ("Z",))),
        ("Landroid/webkit/WebSettings;", "setJavaScriptEnabled", ("V", ("Z",))),
        ("Landroid/webkit/WebView;", "<init>", ("V", ("Landroid/content/Context;",))),
        ("Landroid/webkit/WebView;", "getSettings", ("Landroid/webkit/WebSettings;", ())),
        ("Landroid/webkit/WebView;", "loadUrl", ("V", ("Ljava/lang/String;",))),
        (main_class_desc, "<init>", ("V", ())),
        (main_class_desc, "onCreate", ("V", ("Landroid/os/Bundle;",))),
    ]
    methods = sorted(
        raw_methods,
        key=lambda m: (t_idx[m[0]], s_idx[m[1]], p_idx[m[2]]),
    )
    m_idx = {(m[0], m[1], m[2]): i for i, m in enumerate(methods)}

    # Assemble Dalvik bytecode for MainActivity.<init>()V
    # invoke-direct {v0}, Landroid/app/Activity;-><init>()V ; return-void
    m_act_init = m_idx[("Landroid/app/Activity;", "<init>", ("V", ()))]
    insns_init = struct.pack("<HHHH", 0x1070, m_act_init, 0x0000, 0x000E)
    code_item_init = struct.pack("<HHHHII", 1, 1, 1, 0, 0, 4) + insns_init

    # Assemble Dalvik bytecode for MainActivity.onCreate(Landroid/os/Bundle;)V
    # Registers: v0 = WebView, v1 = WebSettings / URL String, v2 = this, v3 = Bundle / boolean 1
    m_act_oncreate = m_idx[("Landroid/app/Activity;", "onCreate", ("V", ("Landroid/os/Bundle;",)))]
    t_webview = t_idx["Landroid/webkit/WebView;"]
    m_wv_init = m_idx[("Landroid/webkit/WebView;", "<init>", ("V", ("Landroid/content/Context;",)))]
    m_wv_settings = m_idx[("Landroid/webkit/WebView;", "getSettings", ("Landroid/webkit/WebSettings;", ()))]
    m_set_js = m_idx[("Landroid/webkit/WebSettings;", "setJavaScriptEnabled", ("V", ("Z",)))]
    m_set_dom = m_idx[("Landroid/webkit/WebSettings;", "setDomStorageEnabled", ("V", ("Z",)))]
    m_set_content = m_idx[("Landroid/app/Activity;", "setContentView", ("V", ("Landroid/view/View;",)))]
    s_asset_url = s_idx["file:///android_asset/index.html"]
    m_load_url = m_idx[("Landroid/webkit/WebView;", "loadUrl", ("V", ("Ljava/lang/String;",)))]

    insns_oncreate_words = [
        # invoke-super {v2, v3}, Landroid/app/Activity;->onCreate(Landroid/os/Bundle;)V
        0x206F, m_act_oncreate, 0x0032,
        # new-instance v0, Landroid/webkit/WebView;
        0x0022, t_webview,
        # invoke-direct {v0, v2}, Landroid/webkit/WebView;-><init>(Landroid/content/Context;)V
        0x2070, m_wv_init, 0x0020,
        # invoke-virtual {v0}, Landroid/webkit/WebView;->getSettings()Landroid/webkit/WebSettings;
        0x106E, m_wv_settings, 0x0000,
        # move-result-object v1
        0x010C,
        # const/4 v3, #int 1
        0x1312,
        # invoke-virtual {v1, v3}, Landroid/webkit/WebSettings;->setJavaScriptEnabled(Z)V
        0x206E, m_set_js, 0x0031,
        # invoke-virtual {v1, v3}, Landroid/webkit/WebSettings;->setDomStorageEnabled(Z)V
        0x206E, m_set_dom, 0x0031,
        # invoke-virtual {v2, v0}, Landroid/app/Activity;->setContentView(Landroid/view/View;)V
        0x206E, m_set_content, 0x0002,
        # const-string v1, "file:///android_asset/index.html"
        0x011A, s_asset_url,
        # invoke-virtual {v0, v1}, Landroid/webkit/WebView;->loadUrl(Ljava/lang/String;)V
        0x206E, m_load_url, 0x0010,
        # return-void
        0x000E,
    ]
    insns_oncreate = b"".join(struct.pack("<H", w) for w in insns_oncreate_words)
    code_item_oncreate = (
        struct.pack("<HHHHII", 4, 2, 2, 0, 0, len(insns_oncreate_words)) + insns_oncreate
    )
    if len(code_item_oncreate) % 4 != 0:
        code_item_oncreate += b"\x00\x00"

    # Layout fixed header & index tables:
    # Header: 0x70 (112) bytes
    off_string_ids = 0x70
    off_type_ids = off_string_ids + len(strings) * 4
    off_proto_ids = off_type_ids + len(types) * 4
    off_method_ids = off_proto_ids + len(protos) * 12
    off_class_defs = off_method_ids + len(methods) * 8
    off_data_start = off_class_defs + 32  # 1 class_def (32 bytes)

    data_buf = bytearray()

    def align_data(alignment: int = 4):
        while (off_data_start + len(data_buf)) % alignment != 0:
            data_buf.append(0)

    # 1. code_item for <init> and onCreate (placed first in data section, matching d8/dx)
    align_data(4)
    off_code_init = off_data_start + len(data_buf)
    data_buf.extend(code_item_init)

    align_data(4)
    off_code_oncreate = off_data_start + len(data_buf)
    data_buf.extend(code_item_oncreate)

    # 2. type_list items for protos with parameters
    proto_param_offsets = []
    for shorty, ret_t, params in protos:
        if not params:
            proto_param_offsets.append(0)
        else:
            align_data(4)
            p_off = off_data_start + len(data_buf)
            proto_param_offsets.append(p_off)
            data_buf.extend(struct.pack("<I", len(params)))
            for pt in params:
                data_buf.extend(struct.pack("<H", t_idx[pt]))

    # 3. string_data_item entries
    string_data_offsets = []
    for s in strings:
        s_off = off_data_start + len(data_buf)
        string_data_offsets.append(s_off)
        utf8_bytes = s.encode("utf-8")
        data_buf.extend(uleb128(len(s)) + utf8_bytes + b"\x00")

    # 4. class_data_item for MainActivity
    # static_fields=0, instance_fields=0, direct_methods=1 (<init>), virtual_methods=1 (onCreate)
    m_main_init = m_idx[(main_class_desc, "<init>", ("V", ()))]
    m_main_oncreate = m_idx[(main_class_desc, "onCreate", ("V", ("Landroid/os/Bundle;",)))]

    off_class_data = off_data_start + len(data_buf)
    class_data_blob = (
        uleb128(0)  # static_fields_size
        + uleb128(0)  # instance_fields_size
        + uleb128(1)  # direct_methods_size
        + uleb128(1)  # virtual_methods_size
        # direct_method[0]: <init>, ACC_PUBLIC | ACC_CONSTRUCTOR (0x10001)
        + uleb128(m_main_init)
        + uleb128(0x10001)
        + uleb128(off_code_init)
        # virtual_method[0]: onCreate, ACC_PROTECTED (0x0004)
        + uleb128(m_main_oncreate)
        + uleb128(0x0004)
        + uleb128(off_code_oncreate)
    )
    data_buf.extend(class_data_blob)

    # 5. map_list (required at the end of the data section, sorted by ascending offset)
    align_data(4)
    off_map_list = off_data_start + len(data_buf)
    non_zero_param_offs = [p for p in proto_param_offsets if p > 0]
    map_items = [
        (0x0000, 1, 0x0000),                  # TYPE_HEADER_ITEM
        (0x0001, len(strings), off_string_ids),
        (0x0002, len(types), off_type_ids),
        (0x0003, len(protos), off_proto_ids),
        (0x0005, len(methods), off_method_ids),
        (0x0006, 1, off_class_defs),
        (0x2001, 2, off_code_init),
        (0x1001, len(non_zero_param_offs), non_zero_param_offs[0]),
        (0x2002, len(strings), string_data_offsets[0]),
        (0x2000, 1, off_class_data),
        (0x1000, 1, off_map_list),
    ]
    data_buf.extend(struct.pack("<I", len(map_items)))
    for m_type, m_size, m_off in map_items:
        data_buf.extend(struct.pack("<HHII", m_type, 0, m_size, m_off))

    align_data(4)
    total_file_size = off_data_start + len(data_buf)
    data_size = len(data_buf)

    # Build index tables
    string_ids_blob = b"".join(struct.pack("<I", off) for off in string_data_offsets)
    type_ids_blob = b"".join(struct.pack("<I", s_idx[t]) for t in types)
    proto_ids_blob = b"".join(
        struct.pack("<III", s_idx[p[0]], t_idx[p[1]], proto_param_offsets[i])
        for i, p in enumerate(protos)
    )
    method_ids_blob = b"".join(
        struct.pack("<HHI", t_idx[m[0]], p_idx[m[2]], s_idx[m[1]])
        for m in methods
    )
    class_defs_blob = struct.pack(
        "<IIIIIIII",
        t_idx[main_class_desc],            # class_idx
        0x0001,                            # access_flags (ACC_PUBLIC)
        t_idx["Landroid/app/Activity;"],   # superclass_idx
        0,                                 # interfaces_off
        s_idx["MainActivity.java"],        # source_file_idx
        0,                                 # annotations_off
        off_class_data,                    # class_data_off
        0,                                 # static_values_off
    )

    # Build 112-byte DEX header (with placeholder checksum and signature)
    dex_header = struct.pack(
        "<8sI20sIIIIIIIIIIIIIIIIIIII",
        b"dex\n035\x00",
        0,                  # checksum placeholder
        b"\x00" * 20,       # SHA-1 signature placeholder
        total_file_size,
        0x70,               # header_size
        0x12345678,         # endian_tag (ENDIAN_CONSTANT)
        0,                  # link_size
        0,                  # link_off
        off_map_list,
        len(strings),
        off_string_ids,
        len(types),
        off_type_ids,
        len(protos),
        off_proto_ids,
        0,                  # field_ids_size
        0,                  # field_ids_off
        len(methods),
        off_method_ids,
        1,                  # class_defs_size
        off_class_defs,
        data_size,
        off_data_start,
    )

    dex = bytearray(
        dex_header
        + string_ids_blob
        + type_ids_blob
        + proto_ids_blob
        + method_ids_blob
        + class_defs_blob
        + data_buf
    )

    # Compute SHA-1 signature over bytes [32..end] and store at [12..32]
    dex[12:32] = hashlib.sha1(dex[32:]).digest()
    # Compute Adler32 checksum over bytes [12..end] and store at [8..12]
    adler = zlib.adler32(dex[12:]) & 0xFFFFFFFF
    dex[8:12] = struct.pack("<I", adler)
    return bytes(dex)


# ==============================================================================
# 5. SIGN APK WITH JAR V1 (META-INF) + APK SIGNATURE SCHEME V2/V3 (APK Sig Block 42)
# ==============================================================================
def generate_signing_key_and_cert():
    private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    subject = issuer = x509.Name(
        [
            x509.NameAttribute(NameOID.COMMON_NAME, "Stealth Sur-Ron 72V 3000W"),
        ]
    )
    # Use UTCTime dates (< 2050) and 64-bit positive serial number matching Android keytool/apksigner
    cert = (
        x509.CertificateBuilder()
        .subject_name(subject)
        .issuer_name(issuer)
        .public_key(private_key.public_key())
        .serial_number(0x535552524F4E3732)
        .not_valid_before(datetime.datetime(2024, 1, 1, 0, 0, 0, tzinfo=datetime.timezone.utc))
        .not_valid_after(datetime.datetime(2048, 1, 1, 0, 0, 0, tzinfo=datetime.timezone.utc))
        .sign(private_key, hashes.SHA256())
    )
    cert_der = cert.public_bytes(serialization.Encoding.DER)
    return private_key, cert, cert_der


def build_jar_v1_signature_files(entries_dict: dict, private_key, cert) -> tuple:
    """Builds META-INF/MANIFEST.MF, META-INF/CERT.SF, and META-INF/CERT.RSA."""
    manifest_header = (
        "Manifest-Version: 1.0\r\n"
        "Created-By: 1.0 (Android)\r\n\r\n"
    )
    manifest_sections = []
    sf_sections = []

    for name, raw_bytes in entries_dict.items():
        b64_sha256 = base64.b64encode(hashlib.sha256(raw_bytes).digest()).decode("ascii")
        section = f"Name: {name}\r\nSHA-256-Digest: {b64_sha256}\r\n\r\n"
        manifest_sections.append(section)

        sec_digest = base64.b64encode(hashlib.sha256(section.encode("utf-8")).digest()).decode("ascii")
        sf_sections.append(f"Name: {name}\r\nSHA-256-Digest: {sec_digest}\r\n\r\n")

    manifest_bytes = (manifest_header + "".join(manifest_sections)).encode("utf-8")
    manifest_digest = base64.b64encode(hashlib.sha256(manifest_bytes).digest()).decode("ascii")

    sf_header = (
        "Signature-Version: 1.0\r\n"
        "Created-By: 1.0 (Android)\r\n"
        f"SHA-256-Digest-Manifest: {manifest_digest}\r\n"
        "X-Android-APK-Signed: 2, 3\r\n\r\n"
    )
    sf_bytes = sf_header.encode("utf-8") + "".join(sf_sections).encode("utf-8")

    # Create PKCS#7 / CMS DER detached signature over CERT.SF using openssl
    with tempfile.TemporaryDirectory() as tmpdir:
        sf_path = os.path.join(tmpdir, "CERT.SF")
        key_path = os.path.join(tmpdir, "key.pem")
        cert_path = os.path.join(tmpdir, "cert.pem")
        rsa_path = os.path.join(tmpdir, "CERT.RSA")

        with open(sf_path, "wb") as f:
            f.write(sf_bytes)
        with open(key_path, "wb") as f:
            f.write(
                private_key.private_bytes(
                    serialization.Encoding.PEM,
                    serialization.PrivateFormat.TraditionalOpenSSL,
                    serialization.NoEncryption(),
                )
            )
        with open(cert_path, "wb") as f:
            f.write(cert.public_bytes(serialization.Encoding.PEM))

        subprocess.run(
            [
                "openssl",
                "cms",
                "-sign",
                "-binary",
                "-noattr",
                "-in",
                sf_path,
                "-signer",
                cert_path,
                "-inkey",
                key_path,
                "-outform",
                "DER",
                "-out",
                rsa_path,
                "-md",
                "sha256",
            ],
            check=True,
        )
        with open(rsa_path, "rb") as f:
            cert_rsa_bytes = f.read()

    return manifest_bytes, sf_bytes, cert_rsa_bytes


def compute_apk_v2_chunk_digest(sections: list) -> bytes:
    """
    Computes the APK Signature Scheme v2/v3 SHA-256 digest over the 3 ZIP sections
    split into 1 MB (1048576-byte) chunks.
    """
    CHUNK_SIZE = 1024 * 1024
    chunk_digests = []
    for sec in sections:
        pos = 0
        n = len(sec)
        while pos < n:
            chunk = sec[pos : pos + CHUNK_SIZE]
            h = hashlib.sha256()
            h.update(b"\xa5" + struct.pack("<I", len(chunk)))
            h.update(chunk)
            chunk_digests.append(h.digest())
            pos += CHUNK_SIZE

    top = hashlib.sha256()
    top.update(b"\x5a" + struct.pack("<I", len(chunk_digests)))
    for d in chunk_digests:
        top.update(d)
    return top.digest()


def lp_prefixed(data: bytes) -> bytes:
    return struct.pack("<I", len(data)) + data


def build_apk_v2_signing_block(
    before_cd: bytes, central_dir: bytes, eocd: bytes, private_key, cert_der: bytes
) -> bytes:
    """
    Constructs the APK Signing Block ('APK Sig Block 42') containing BOTH:
      - APK Signature Scheme v2 (ID 0x7109871a, with ATTR_APK_SIGNATURE_SCHEME_V3_STRIPPING_PROTECTION = 3)
      - APK Signature Scheme v3 (ID 0xf05368c0)
      - Verity padding block (ID 0x42726577) aligning Central Directory to 4096 bytes.
    """
    SIG_ALGO_RSA_PKCS1_V1_5_SHA256 = 0x0103
    ATTR_V3_STRIPPING_PROTECTION = 0xBEEFF00D

    top_digest = compute_apk_v2_chunk_digest([before_cd, central_dir, eocd])

    # Digests sequence: sequence of (algorithm_id, length-prefixed digest)
    digest_entry = lp_prefixed(struct.pack("<I", SIG_ALGO_RSA_PKCS1_V1_5_SHA256) + lp_prefixed(top_digest))
    digests_seq = lp_prefixed(digest_entry)

    # Certificates sequence: sequence of length-prefixed X.509 DER certificates
    certs_seq = lp_prefixed(lp_prefixed(cert_der))

    # PublicKey (SubjectPublicKeyInfo DER)
    spki_der = private_key.public_key().public_bytes(
        serialization.Encoding.DER, serialization.PublicFormat.SubjectPublicKeyInfo
    )

    # --- 1. APK Signature Scheme v2 Block (ID 0x7109871a) ---
    # Mandatory V3 stripping protection attribute (0xbeeff00d -> 3) required when V3 block is present!
    v2_stripping_attr = lp_prefixed(struct.pack("<II", ATTR_V3_STRIPPING_PROTECTION, 3))
    v2_additional_attrs = lp_prefixed(v2_stripping_attr)
    v2_signed_data = digests_seq + certs_seq + v2_additional_attrs + struct.pack("<I", 0)
    v2_sig_bytes = private_key.sign(v2_signed_data, padding.PKCS1v15(), hashes.SHA256())
    v2_sig_entry = lp_prefixed(struct.pack("<I", SIG_ALGO_RSA_PKCS1_V1_5_SHA256) + lp_prefixed(v2_sig_bytes))
    v2_sigs_seq = lp_prefixed(v2_sig_entry)
    v2_signer_body = lp_prefixed(v2_signed_data) + v2_sigs_seq + lp_prefixed(spki_der)
    v2_block_value = lp_prefixed(lp_prefixed(v2_signer_body))
    pair_v2 = struct.pack("<QI", 4 + len(v2_block_value), 0x7109871A) + v2_block_value

    # --- 2. APK Signature Scheme v3 Block (ID 0xf05368c0) ---
    min_sdk = 24
    max_sdk = 0x7FFFFFFF
    sdk_range = struct.pack("<II", min_sdk, max_sdk)
    v3_additional_attrs = lp_prefixed(b"")
    v3_signed_data = digests_seq + certs_seq + sdk_range + v3_additional_attrs
    v3_sig_bytes = private_key.sign(v3_signed_data, padding.PKCS1v15(), hashes.SHA256())
    v3_sig_entry = lp_prefixed(struct.pack("<I", SIG_ALGO_RSA_PKCS1_V1_5_SHA256) + lp_prefixed(v3_sig_bytes))
    v3_sigs_seq = lp_prefixed(v3_sig_entry)
    v3_signer_body = lp_prefixed(v3_signed_data) + sdk_range + v3_sigs_seq + lp_prefixed(spki_der)
    v3_block_value = lp_prefixed(lp_prefixed(v3_signer_body))
    pair_v3 = struct.pack("<QI", 4 + len(v3_block_value), 0xF05368C0) + v3_block_value

    pairs_core = pair_v2 + pair_v3

    # Pad block so total APK Signing Block size (8 + len(pairs_blob) + 24) is an exact multiple of 4096 bytes
    # (Mandatory requirement of Android's ApkSigningBlockUtils when VERITY_PADDING_BLOCK_ID 0x42726577 is present!)
    rem = (8 + len(pairs_core) + 24) % 4096
    if rem != 0:
        pad_needed = 4096 - rem
        if pad_needed < 12:
            pad_needed += 4096
        pad_val_len = pad_needed - 12
        padding_pair = struct.pack("<QI", 4 + pad_val_len, 0x42726577) + (b"\x00" * pad_val_len)
        pairs_blob = pairs_core + padding_pair
    else:
        pairs_blob = pairs_core

    size_of_block = len(pairs_blob) + 24  # includes tail uint64 size + 16-byte magic
    return (
        struct.pack("<Q", size_of_block)
        + pairs_blob
        + struct.pack("<Q", size_of_block)
        + b"APK Sig Block 42"
    )


# ==============================================================================
# 6. ASSEMBLE ZIPALIGNED + TRIPLE-SIGNED (V1 + V2 + V3) ANDROID .APK
# ==============================================================================
def build_signed_apk(standalone_html_path: str, out_apk_path: str):
    with open(standalone_html_path, "rb") as f:
        html_bytes = f.read()

    manifest_xml = build_binary_android_manifest("com.stealth.surron.cad")
    resources_arsc = build_resources_arsc("com.stealth.surron.cad")
    classes_dex = build_classes_dex("com.stealth.surron.cad")
    icon_png = create_tactical_icon_png(192)

    payload_files = {
        "AndroidManifest.xml": (manifest_xml, True),
        "resources.arsc": (resources_arsc, False),  # Must be uncompressed & 4-byte aligned!
        "classes.dex": (classes_dex, False),        # Uncompressed & 4-byte aligned for direct ART mmap!
        "res/drawable/icon.png": (icon_png, False),  # Uncompressed & 4-byte aligned!
        "assets/index.html": (html_bytes, True),
    }

    private_key, cert, cert_der = generate_signing_key_and_cert()
    manifest_mf, cert_sf, cert_rsa = build_jar_v1_signature_files(
        {k: v[0] for k, v in payload_files.items()}, private_key, cert
    )

    all_entries = [
        ("AndroidManifest.xml", manifest_xml, True),
        ("resources.arsc", resources_arsc, False),
        ("classes.dex", classes_dex, False),
        ("res/drawable/icon.png", icon_png, False),
        ("assets/index.html", html_bytes, True),
        ("META-INF/MANIFEST.MF", manifest_mf, True),
        ("META-INF/CERT.SF", cert_sf, True),
        ("META-INF/CERT.RSA", cert_rsa, True),
    ]

    local_chunks = bytearray()
    central_dir_chunks = bytearray()

    for name, raw_data, compress in all_entries:
        name_bytes = name.encode("utf-8")
        crc = zlib.crc32(raw_data) & 0xFFFFFFFF
        uncomp_size = len(raw_data)

        if compress:
            comp_obj = zlib.compressobj(9, zlib.DEFLATED, -zlib.MAX_WBITS)
            comp_data = comp_obj.compress(raw_data) + comp_obj.flush()
            method = 8  # DEFLATED
        else:
            comp_data = raw_data
            method = 0  # STORED

        comp_size = len(comp_data)
        local_header_offset = len(local_chunks)

        # 4-byte zipalign for STORED (uncompressed) files so data starts at a multiple of 4
        extra_field = b""
        if method == 0:
            data_start = local_header_offset + 30 + len(name_bytes)
            pad = (4 - (data_start % 4)) % 4
            if pad > 0:
                extra_field = b"\x00" * pad

        local_header = (
            struct.pack(
                "<IHHHHHIIIHH",
                0x04034B50,  # Local file header signature
                20,          # Version needed to extract (2.0)
                0,           # General purpose bit flag
                method,      # Compression method
                0x0000,      # Last mod file time
                0x5421,      # Last mod file date
                crc,
                comp_size,
                uncomp_size,
                len(name_bytes),
                len(extra_field),
            )
            + name_bytes
            + extra_field
        )
        local_chunks.extend(local_header)
        local_chunks.extend(comp_data)

        cd_header = (
            struct.pack(
                "<IHHHHHHIIIHHHHHII",
                0x02014B50,  # Central directory file header signature
                20,          # Version made by
                20,          # Version needed to extract
                0,           # Flags
                method,
                0x0000,
                0x5421,
                crc,
                comp_size,
                uncomp_size,
                len(name_bytes),
                0,           # Extra field length in CD
                0,           # File comment length
                0,           # Disk number start
                0,           # Internal file attributes
                0,           # External file attributes
                local_header_offset,
            )
            + name_bytes
        )
        central_dir_chunks.extend(cd_header)

    # Pad before_cd so APK Signing Block starts at a 4096-byte page boundary (if needed by extra field on last entry? No, APK Signing Block size is padded so cd_offset_final % 4096 == 0)
    before_cd = bytes(local_chunks)
    central_dir = bytes(central_dir_chunks)
    cd_offset_initial = len(before_cd)
    cd_size = len(central_dir)

    eocd_initial = struct.pack(
        "<IHHHHIIH",
        0x06054B50,
        0,
        0,
        len(all_entries),
        len(all_entries),
        cd_size,
        cd_offset_initial,
        0,
    )

    # Build APK Signature Scheme v2 + v3 Block and insert before Central Directory
    v2_sig_block = build_apk_v2_signing_block(
        before_cd, central_dir, eocd_initial, private_key, cert_der
    )

    cd_offset_final = len(before_cd) + len(v2_sig_block)
    eocd_final = struct.pack(
        "<IHHHHIIH",
        0x06054B50,
        0,
        0,
        len(all_entries),
        len(all_entries),
        cd_size,
        cd_offset_final,
        0,
    )

    final_apk = before_cd + v2_sig_block + central_dir + eocd_final
    with open(out_apk_path, "wb") as f:
        f.write(final_apk)

    print(f"[OK] Built {out_apk_path} ({len(final_apk):,} bytes, zipaligned + v1/v2/v3 triple-signed Android APK)")


if __name__ == "__main__":
    build_signed_apk("Stealth_SurRon_Standalone.html", "Stealth_SurRon_72V_3000W.apk")
