#!/usr/bin/env python3
"""
STEALTH SUR-RON 72V 3000W — STANDALONE BUNDLER & NATIVE WINDOWS x86_64 PE32+ (.EXE) COMPILER
Generates:
1. Stealth_SurRon_Standalone.html (Single-file zero-server 3D CAD WebGL application)
2. Stealth_SurRon_72V_3000W.exe   (Native 64-bit Windows PE32+ GUI executable with embedded CAD payload)
"""
import os
import re
import struct


def strip_es_module_syntax(js_code: str) -> str:
    lines = []
    skip_multiline_import = False
    for line in js_code.splitlines():
        stripped = line.strip()
        if skip_multiline_import:
            if "from " in stripped and stripped.endswith(";"):
                skip_multiline_import = False
            continue
        if stripped.startswith("import "):
            if "from " in stripped and stripped.endswith(";"):
                continue
            else:
                skip_multiline_import = True
                continue
        # Replace leading export keywords
        line = re.sub(r"^(\s*)export\s+(function|const|let|var|class)\s+", r"\1\2 ", line)
        lines.append(line)
    return "\n".join(lines)


def build_standalone_html() -> bytes:
    with open("index.html", "r", encoding="utf-8") as f:
        index_html = f.read()
    with open("materials.js", "r", encoding="utf-8") as f:
        materials_js = strip_es_module_syntax(f.read())
    with open("bike_chassis.js", "r", encoding="utf-8") as f:
        chassis_js = strip_es_module_syntax(f.read())
    with open("bike_powertrain.js", "r", encoding="utf-8") as f:
        powertrain_js = strip_es_module_syntax(f.read())
    with open("engineering_modals.js", "r", encoding="utf-8") as f:
        modals_js = strip_es_module_syntax(f.read())
    with open("main.js", "r", encoding="utf-8") as f:
        main_js = strip_es_module_syntax(f.read())

    combined_module = f"""<script type="module">
import * as THREE from 'three';
import {{ OrbitControls }} from 'three/addons/controls/OrbitControls.js';
import {{ RoomEnvironment }} from 'three/addons/environments/RoomEnvironment.js';
import gsap from 'gsap';

// --- [1/5] MATERIALS & PROCEDURAL PBR TEXTURES ---
{materials_js}

// --- [2/5] CHASSIS, FRAME, FORK, COCKPIT, WHEELS & BRAKES ---
{chassis_js}

// --- [3/5] POWERTRAIN, 20S7P 140x 21700 BATTERY, BMS, CONTROLLER & SADDLE ---
{powertrain_js}

// --- [4/5] ENGINEERING MODALS & 1:1 SVG TEMPLATES ---
{modals_js}

// --- [5/5] MAIN WEBGL SCENE, GSAP EXPLODED VIEW & X-RAY RAYCASTER ---
{main_js}
</script>"""

    standalone_html = re.sub(
        r'<script\s+type="module"\s+src="\./main\.js"\s*>\s*</script>',
        lambda _: combined_module,
        index_html,
    )

    with open("Stealth_SurRon_Standalone.html", "w", encoding="utf-8") as f:
        f.write(standalone_html)

    return standalone_html.encode("utf-8")


def align_up(val: int, alignment: int) -> int:
    return (val + alignment - 1) & ~(alignment - 1)


def build_pe32plus_exe(html_payload: bytes, out_exe_path: str):
    """
    Constructs a native Windows 64-bit (x86_64 / AMD64) PE32+ GUI executable.
    When executed on Windows 10/11:
      1. Extracts the embedded Stealth_SurRon_Standalone.html to %TEMP%\\Stealth_SurRon_72V_3000W_CAD.html
      2. Launches it as a native-style desktop window via Microsoft Edge App Mode (--app=...)
      3. Automatically falls back to the system default browser if Edge is unavailable.
    """
    FILE_ALIGN = 0x0200
    SECT_ALIGN = 0x1000

    TEXT_RVA = 0x1000
    RDATA_RVA = 0x2000

    # -------------------------------------------------------------------------
    # 1. BUILD .rdata SECTION (Imports + Constant Strings + HTML Payload)
    # -------------------------------------------------------------------------
    rdata = bytearray(0x200)

    # Hint/Name entries starting at offset 0x00C0 (RVA 0x20C0)
    hn_cursor = 0x00C0

    def add_hint_name(name: str) -> int:
        nonlocal hn_cursor
        rva = RDATA_RVA + hn_cursor
        encoded = name.encode("ascii") + b"\x00"
        if len(encoded) % 2 != 0:
            encoded += b"\x00"
        entry = struct.pack("<H", 0) + encoded
        rdata[hn_cursor : hn_cursor + len(entry)] = entry
        hn_cursor += len(entry)
        return rva

    def add_ascii_str(s: str) -> int:
        nonlocal hn_cursor
        rva = RDATA_RVA + hn_cursor
        encoded = s.encode("ascii") + b"\x00"
        if len(encoded) % 2 != 0:
            encoded += b"\x00"
        rdata[hn_cursor : hn_cursor + len(encoded)] = encoded
        hn_cursor += len(encoded)
        return rva

    rva_hn_GetTempPathA = add_hint_name("GetTempPathA")
    rva_hn_CreateFileA = add_hint_name("CreateFileA")
    rva_hn_WriteFile = add_hint_name("WriteFile")
    rva_hn_CloseHandle = add_hint_name("CloseHandle")
    rva_hn_ExitProcess = add_hint_name("ExitProcess")
    rva_hn_ShellExecuteA = add_hint_name("ShellExecuteA")

    rva_dll_kernel32 = add_ascii_str("KERNEL32.dll")
    rva_dll_shell32 = add_ascii_str("SHELL32.dll")

    # IAT (FirstThunk) at offset 0x0000 (RVA 0x2000) and ILT (OriginalFirstThunk) at 0x0040 (RVA 0x2040)
    iat_entries = [
        rva_hn_GetTempPathA,  # [0] 0x2000
        rva_hn_CreateFileA,   # [1] 0x2008
        rva_hn_WriteFile,     # [2] 0x2010
        rva_hn_CloseHandle,   # [3] 0x2018
        rva_hn_ExitProcess,   # [4] 0x2020
        0,                    # [5] 0x2028 (KERNEL32 null terminator)
        rva_hn_ShellExecuteA, # [6] 0x2030
        0,                    # [7] 0x2038 (SHELL32 null terminator)
    ]
    iat_bytes = struct.pack("<8Q", *iat_entries)
    rdata[0x0000:0x0040] = iat_bytes
    rdata[0x0040:0x0080] = iat_bytes  # ILT copy

    RVA_IAT_GetTempPathA = RDATA_RVA + 0x0000
    RVA_IAT_CreateFileA = RDATA_RVA + 0x0008
    RVA_IAT_WriteFile = RDATA_RVA + 0x0010
    RVA_IAT_CloseHandle = RDATA_RVA + 0x0018
    RVA_IAT_ExitProcess = RDATA_RVA + 0x0020
    RVA_IAT_ShellExecuteA = RDATA_RVA + 0x0030

    # Import Directory Table at offset 0x0080 (RVA 0x2080)
    imp_kernel32 = struct.pack(
        "<5I",
        RDATA_RVA + 0x0040,  # OriginalFirstThunk
        0,                   # TimeDateStamp
        0,                   # ForwarderChain
        rva_dll_kernel32,    # Name
        RDATA_RVA + 0x0000,  # FirstThunk
    )
    imp_shell32 = struct.pack(
        "<5I",
        RDATA_RVA + 0x0070,  # OriginalFirstThunk
        0,
        0,
        rva_dll_shell32,
        RDATA_RVA + 0x0030,  # FirstThunk
    )
    imp_null = struct.pack("<5I", 0, 0, 0, 0, 0)
    rdata[0x0080 : 0x0080 + 60] = imp_kernel32 + imp_shell32 + imp_null

    # Constant strings starting at offset 0x0160
    str_cursor = 0x0160

    def put_const_str(s: str) -> int:
        nonlocal str_cursor
        rva = RDATA_RVA + str_cursor
        b = s.encode("ascii") + b"\x00"
        rdata[str_cursor : str_cursor + len(b)] = b
        str_cursor = align_up(str_cursor + len(b), 8)
        return rva

    RVA_STR_FILENAME = put_const_str("Stealth_SurRon_72V_3000W_CAD.html")
    RVA_STR_OPEN = put_const_str("open")
    RVA_STR_MSEDGE = put_const_str("msedge.exe")
    RVA_STR_EDGE_PREFIX = put_const_str('--app="')
    RVA_STR_EDGE_SUFFIX = put_const_str('" --window-size=1620,940')

    assert str_cursor <= 0x0200, f"String table overflowed 0x200: {hex(str_cursor)}"

    # HTML Payload starts at offset 0x0200 (RVA 0x2200)
    RVA_HTML_PAYLOAD = RDATA_RVA + 0x0200
    HTML_PAYLOAD_LEN = len(html_payload)
    rdata.extend(html_payload)

    rdata_virtual_size = len(rdata)
    rdata_raw_size = align_up(rdata_virtual_size, FILE_ALIGN)
    rdata.extend(b"\x00" * (rdata_raw_size - rdata_virtual_size))

    # -------------------------------------------------------------------------
    # 2. BUILD .text SECTION (x86_64 Machine Code at RVA 0x1000)
    # -------------------------------------------------------------------------
    code = bytearray()

    def current_rva() -> int:
        return TEXT_RVA + len(code)

    def emit(b: bytes):
        code.extend(b)

    def emit_rip_call(target_iat_rva: int):
        # FF 15 <disp32>
        disp = target_iat_rva - (current_rva() + 6)
        emit(b"\xFF\x15" + struct.pack("<i", disp))

    def emit_rip_lea_rdx(target_rva: int):
        # 48 8D 15 <disp32>
        disp = target_rva - (current_rva() + 7)
        emit(b"\x48\x8D\x15" + struct.pack("<i", disp))

    def emit_rip_lea_rsi(target_rva: int):
        # 48 8D 35 <disp32>
        disp = target_rva - (current_rva() + 7)
        emit(b"\x48\x8D\x35" + struct.pack("<i", disp))

    def emit_rip_lea_r8(target_rva: int):
        # 4C 8D 05 <disp32>
        disp = target_rva - (current_rva() + 7)
        emit(b"\x4C\x8D\x05" + struct.pack("<i", disp))

    # Prologue: sub rsp, 0x488 (aligns RSP to 16-byte boundary)
    emit(b"\x48\x81\xEC\x88\x04\x00\x00")

    # 1) GetTempPathA(260, &rsp[0x50])
    emit(b"\xB9\x04\x01\x00\x00")          # mov ecx, 260
    emit(b"\x48\x8D\x54\x24\x50")          # lea rdx, [rsp + 0x50]
    emit_rip_call(RVA_IAT_GetTempPathA)

    # 2) Append "Stealth_SurRon_72V_3000W_CAD.html\0" to tempPathBuf
    emit(b"\x48\x8D\x7C\x24\x50")          # lea rdi, [rsp + 0x50]
    emit(b"\x48\x01\xC7")                  # add rdi, rax
    emit_rip_lea_rsi(RVA_STR_FILENAME)     # lea rsi, [rip + str_filename]
    emit(b"\xFC")                          # cld
    # loop_fn:
    emit(b"\xAC\xAA\x84\xC0\x75\xFA")      # lodsb; stosb; test al, al; jnz -6

    # 3) CreateFileA(&rsp[0x50], GENERIC_WRITE, FILE_SHARE_READ, NULL, CREATE_ALWAYS, FILE_ATTRIBUTE_NORMAL, NULL)
    emit(b"\x48\x8D\x4C\x24\x50")                  # lea rcx, [rsp + 0x50]
    emit(b"\xBA\x00\x00\x00\x40")                  # mov edx, 0x40000000 (GENERIC_WRITE)
    emit(b"\x41\xB8\x01\x00\x00\x00")              # mov r8d, 1 (FILE_SHARE_READ)
    emit(b"\x45\x31\xC9")                          # xor r9d, r9d
    emit(b"\xC7\x44\x24\x20\x02\x00\x00\x00")      # mov dword ptr [rsp + 0x20], 2 (CREATE_ALWAYS)
    emit(b"\xC7\x44\x24\x28\x80\x00\x00\x00")      # mov dword ptr [rsp + 0x28], 0x80 (FILE_ATTRIBUTE_NORMAL)
    emit(b"\x48\xC7\x44\x24\x30\x00\x00\x00\x00")  # mov qword ptr [rsp + 0x30], 0
    emit_rip_call(RVA_IAT_CreateFileA)
    emit(b"\x48\x89\xC3")                          # mov rbx, rax
    emit(b"\x48\x83\xF8\xFF")                      # cmp rax, -1
    je_invalid_handle_pos = len(code)
    emit(b"\x0F\x84\x00\x00\x00\x00")              # je exit_proc (patched below)

    # 4) WriteFile(rbx, html_payload, HTML_PAYLOAD_LEN, &rsp[0x40], NULL)
    emit(b"\x48\x89\xD9")                          # mov rcx, rbx
    emit_rip_lea_rdx(RVA_HTML_PAYLOAD)             # lea rdx, [rip + html_payload]
    emit(b"\x41\xB8" + struct.pack("<I", HTML_PAYLOAD_LEN))  # mov r8d, HTML_PAYLOAD_LEN
    emit(b"\x4C\x8D\x4C\x24\x40")                  # lea r9, [rsp + 0x40]
    emit(b"\x48\xC7\x44\x24\x20\x00\x00\x00\x00")  # mov qword ptr [rsp + 0x20], 0
    emit_rip_call(RVA_IAT_WriteFile)

    # 5) CloseHandle(rbx)
    emit(b"\x48\x89\xD9")                          # mov rcx, rbx
    emit_rip_call(RVA_IAT_CloseHandle)

    # 6) Build edgeArgsBuf at [rsp + 0x250]: '--app="' + tempPathBuf + '" --window-size=1620,940'
    emit(b"\x48\x8D\xBC\x24\x50\x02\x00\x00")      # lea rdi, [rsp + 0x250]
    emit_rip_lea_rsi(RVA_STR_EDGE_PREFIX)
    # copy_p1 (without null): lodsb; test al, al; jz +3; stosb; jmp -8
    emit(b"\xAC\x84\xC0\x74\x03\xAA\xEB\xF8")
    # copy_p2 (tempPathBuf without null):
    emit(b"\x48\x8D\x74\x24\x50")                  # lea rsi, [rsp + 0x50]
    emit(b"\xAC\x84\xC0\x74\x03\xAA\xEB\xF8")
    # copy_p3 (str_edge_suffix with null):
    emit_rip_lea_rsi(RVA_STR_EDGE_SUFFIX)
    emit(b"\xAC\xAA\x84\xC0\x75\xFA")

    # 7) ShellExecuteA(NULL, "open", "msedge.exe", &rsp[0x250], NULL, SW_SHOWNORMAL=1)
    emit(b"\x31\xC9")                              # xor ecx, ecx
    emit_rip_lea_rdx(RVA_STR_OPEN)                 # lea rdx, [rip + str_open]
    emit_rip_lea_r8(RVA_STR_MSEDGE)                # lea r8, [rip + str_msedge]
    emit(b"\x4C\x8D\x8C\x24\x50\x02\x00\x00")      # lea r9, [rsp + 0x250]
    emit(b"\x48\xC7\x44\x24\x20\x00\x00\x00\x00")  # mov qword ptr [rsp + 0x20], 0
    emit(b"\xC7\x44\x24\x28\x01\x00\x00\x00")      # mov dword ptr [rsp + 0x28], 1
    emit_rip_call(RVA_IAT_ShellExecuteA)
    emit(b"\x48\x83\xF8\x20")                      # cmp rax, 32
    jg_success_pos = len(code)
    emit(b"\x7F\x00")                              # jg exit_proc (patched below)

    # 8) Fallback: ShellExecuteA(NULL, "open", &rsp[0x50], NULL, NULL, SW_SHOWNORMAL=1)
    emit(b"\x31\xC9")                              # xor ecx, ecx
    emit_rip_lea_rdx(RVA_STR_OPEN)                 # lea rdx, [rip + str_open]
    emit(b"\x4C\x8D\x44\x24\x50")                  # lea r8, [rsp + 0x50]
    emit(b"\x45\x31\xC9")                          # xor r9d, r9d
    emit(b"\x48\xC7\x44\x24\x20\x00\x00\x00\x00")  # mov qword ptr [rsp + 0x20], 0
    emit(b"\xC7\x44\x24\x28\x01\x00\x00\x00")      # mov dword ptr [rsp + 0x28], 1
    emit_rip_call(RVA_IAT_ShellExecuteA)

    # 9) exit_proc: ExitProcess(0)
    exit_proc_pos = len(code)
    # Patch je_invalid_handle_pos (disp32) and jg_success_pos (rel8)
    je_disp = exit_proc_pos - (je_invalid_handle_pos + 6)
    code[je_invalid_handle_pos + 2 : je_invalid_handle_pos + 6] = struct.pack("<i", je_disp)
    jg_disp = exit_proc_pos - (jg_success_pos + 2)
    code[jg_success_pos + 1] = jg_disp & 0xFF

    emit(b"\x31\xC9")                              # xor ecx, ecx
    emit_rip_call(RVA_IAT_ExitProcess)
    emit(b"\xCC")                                  # int3

    text_virtual_size = len(code)
    text_raw_size = align_up(text_virtual_size, FILE_ALIGN)
    code.extend(b"\x00" * (text_raw_size - text_virtual_size))

    # -------------------------------------------------------------------------
    # 3. BUILD PE32+ HEADERS (DOS Header + COFF + Optional Header + Section Table)
    # -------------------------------------------------------------------------
    headers = bytearray(0x200)

    # DOS Header
    headers[0:2] = b"MZ"
    struct.pack_into("<I", headers, 0x3C, 0x80)  # e_lfanew = 0x80

    #PE Signature
    headers[0x80:0x84] = b"PE\x00\x00"

    # COFF File Header (20 bytes at 0x84..0x97)
    struct.pack_into(
        "<HHIIIHH",
        headers,
        0x84,
        0x8664,  # Machine = IMAGE_FILE_MACHINE_AMD64
        2,       # NumberOfSections = 2 (.text, .rdata)
        0x67200000,
        0,
        0,
        240,     # SizeOfOptionalHeader = 240 (0xF0)
        0x0022,  # Characteristics = EXECUTABLE_IMAGE | LARGE_ADDRESS_AWARE
    )

    # Optional Header PE32+ (240 bytes at 0x98..0x187)
    size_of_image = RDATA_RVA + align_up(rdata_virtual_size, SECT_ALIGN)
    opt_fixed = struct.pack(
        "<HBBIIIIIQIIHHHHHHIIIIHHQQQQII",
        0x020B,             # Magic = PE32+
        14,                 # MajorLinkerVersion
        0,                  # MinorLinkerVersion
        text_raw_size,      # SizeOfCode
        rdata_raw_size,     # SizeOfInitializedData
        0,                  # SizeOfUninitializedData
        TEXT_RVA,           # AddressOfEntryPoint
        TEXT_RVA,           # BaseOfCode
        0x0000000140000000, # ImageBase
        SECT_ALIGN,         # SectionAlignment
        FILE_ALIGN,         # FileAlignment
        6,                  # MajorOperatingSystemVersion
        0,                  # MinorOperatingSystemVersion
        0,                  # MajorImageVersion
        0,                  # MinorImageVersion
        6,                  # MajorSubsystemVersion
        0,                  # MinorSubsystemVersion
        0,                  # Win32VersionValue
        size_of_image,      # SizeOfImage
        0x0200,             # SizeOfHeaders
        0,                  # CheckSum
        2,                  # Subsystem = IMAGE_SUBSYSTEM_WINDOWS_GUI (2)
        0x8100,             # DllCharacteristics = NX_COMPAT | TERMINAL_SERVER_AWARE
        0x100000,           # SizeOfStackReserve
        0x10000,            # SizeOfStackCommit
        0x100000,           # SizeOfHeapReserve
        0x1000,             # SizeOfHeapCommit
        0,                  # LoaderFlags
        16,                 # NumberOfRvaAndSizes
    )
    assert len(opt_fixed) == 112
    headers[0x98 : 0x98 + 112] = opt_fixed

    # Data Directories (16 * 8 = 128 bytes at 0x108..0x187)
    dd_offset = 0x98 + 112
    # [1] Import Directory: RVA 0x2080, Size 60
    struct.pack_into("<II", headers, dd_offset + 1 * 8, RDATA_RVA + 0x0080, 60)
    # [12] IAT Directory: RVA 0x2000, Size 64
    struct.pack_into("<II", headers, dd_offset + 12 * 8, RDATA_RVA + 0x0000, 64)

    # Section Headers (2 * 40 = 80 bytes at 0x188..0x1D7)
    sec_offset = 0x188
    # Section 0: .text
    struct.pack_into(
        "<8sIIIIIIHHI",
        headers,
        sec_offset,
        b".text\x00\x00\x00",
        text_virtual_size,
        TEXT_RVA,
        text_raw_size,
        0x0200,  # PointerToRawData
        0,
        0,
        0,
        0,
        0x60000020,  # CNT_CODE | MEM_EXECUTE | MEM_READ
    )
    # Section 1: .rdata
    struct.pack_into(
        "<8sIIIIIIHHI",
        headers,
        sec_offset + 40,
        b".rdata\x00\x00",
        rdata_virtual_size,
        RDATA_RVA,
        rdata_raw_size,
        0x0200 + text_raw_size,  # PointerToRawData
        0,
        0,
        0,
        0,
        0xC0000040,  # CNT_INITIALIZED_DATA | MEM_READ | MEM_WRITE
    )

    with open(out_exe_path, "wb") as f:
        f.write(headers)
        f.write(code)
        f.write(rdata)

    print(f"[OK] Built {out_exe_path} ({os.path.getsize(out_exe_path):,} bytes)")


if __name__ == "__main__":
    html_bytes = build_standalone_html()
    print(f"[OK] Built Stealth_SurRon_Standalone.html ({len(html_bytes):,} bytes)")
    build_pe32plus_exe(html_bytes, "Stealth_SurRon_72V_3000W.exe")
