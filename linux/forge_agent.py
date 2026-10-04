#!/usr/bin/env python3
"""ENHANCE local agent. Scans Steam and installs the DLSS 5 pack for Proton.

Stdlib only. Binds to 127.0.0.1. A browser page cannot choose the destination
path: install looks the game up again from the Steam libraries.
"""

from __future__ import annotations

import json
import os
import shutil
import tarfile
import tempfile
import threading
import time
import urllib.request
import zipfile
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

VERSION = "1.0.0"
PORT = int(os.environ.get("ENHANCE_PORT") or os.environ.get("FORGE_PORT") or "4775")
MARKER_NAME = ".enhance-dlss5.json"
LEGACY_MARKER = ".forge-dlss5.json"
BACKUP_DIRNAME = ".enhance-dlss5-backup"

RESHAPE_URL = "https://reshade.me/downloads/ReShade_Setup_6.8.0_Addon.exe"
ADDON_URL = (
    "https://github.com/RankFTW/rhi-repo/releases/download/"
    "renodx-dlss5-7.0.0-rc8/renodx-dlss5_7.0.0-rc8.zip"
)
NR_URL = (
    "https://github.com/RankFTW/rhi-repo/releases/download/"
    "dlssnr-310.8.Lecram/nvngx_dlssnr_310.8.Lecram.zip"
)
SL_URL = "https://github.com/yumlevi/renodx-dlss-installer/releases/download/latest/streamline.zip"
SEVEN_URL = "https://github.com/ip7z/7zip/releases/download/26.03/7z2603-linux-x64.tar.xz"

ADDON_NAME = "renodx-dlss5.addon64"
ADDON_LABEL = "DLSS 5 add-on v7.0.0-rc8 (renodx-dlss5.addon64)"
NR_LABEL = "Lecram nvngx_dlssnr 310.8.Lecram"
SL_NAMES = [
    "nvngx_dlss.dll",
    "nvngx_dlssg.dll",
    "sl.interposer.dll",
    "sl.common.dll",
    "sl.dlss.dll",
    "sl.dlss_g.dll",
    "sl.dlss_nr.dll",
    "sl.nis.dll",
    "sl.pcl.dll",
    "sl.reflex.dll",
]
SL_LICENSES = [
    "nvngx_dlss.license.txt",
    "nis.license.txt",
    "reflex.license.txt",
]

SKIP_APPIDS = {
    "228980",
    "1070560",
    "1391110",
    "1493710",
    "1628350",
    "858280",
    "1054830",
    "1113280",
    "1245040",
    "1420170",
    "1580130",
    "1826330",
    "1887720",
    "2348590",
    "2805730",
}
SKIP_EXE = {
    "unitycrashhandler64.exe",
    "unitycrashhandler32.exe",
    "crashpad_handler.exe",
    "crashreportclient.exe",
    "unins000.exe",
    "uninstall.exe",
    "vc_redist.x64.exe",
    "vc_redist.x86.exe",
}
SKIP_PARTS = ("webhelper", "redist", "crashreport", "unins", "easyanticheat_setup")

JOB = {"running": False, "lines": [], "done": False, "error": None, "result": None}
JOB_LOCK = threading.Lock()


def home_dir() -> str:
    return os.environ.get("ENHANCE_HOME") or os.environ.get("FORGE_HOME") or os.path.join(
        os.path.expanduser("~"), ".local", "share", "enhance-dlss5"
    )


def cache_dir() -> str:
    path = os.path.join(home_dir(), "cache")
    os.makedirs(path, exist_ok=True)
    return path


def payload_dir() -> str:
    return os.path.join(home_dir(), "payload")


def log_line(text: str) -> None:
    with JOB_LOCK:
        JOB["lines"].append(text)


def launch_options(hook: str) -> str:
    return f'WINEDLLOVERRIDES="{hook}=n,b" PROTON_ENABLE_NVAPI=1 %command%'


def parse_vdf(text: str) -> dict:
    i = 0
    n = len(text)

    def skip() -> None:
        nonlocal i
        while True:
            while i < n and text[i] in " \t\r\n":
                i += 1
            if text.startswith("//", i):
                while i < n and text[i] != "\n":
                    i += 1
                continue
            return

    def parse_string():
        nonlocal i
        skip()
        if i >= n:
            return None
        if text[i] == '"':
            i += 1
            out = []
            while i < n and text[i] != '"':
                if text[i] == "\\" and i + 1 < n:
                    out.append(text[i + 1])
                    i += 2
                else:
                    out.append(text[i])
                    i += 1
            if i < n and text[i] == '"':
                i += 1
            return "".join(out)
        start = i
        while i < n and text[i] not in " \t\r\n{}\"":
            i += 1
        if start == i:
            return None
        return text[start:i]

    def parse_obj() -> dict:
        nonlocal i
        obj: dict = {}
        while True:
            skip()
            if i >= n or text[i] == "}":
                if i < n and text[i] == "}":
                    i += 1
                break
            key = parse_string()
            if key is None:
                break
            skip()
            if i < n and text[i] == "{":
                i += 1
                obj[key] = parse_obj()
            else:
                obj[key] = parse_string()
        return obj

    skip()
    if i >= n:
        return {}
    if text[i] == "{":
        i += 1
        return parse_obj()
    key = parse_string()
    skip()
    if key is None:
        return {}
    if i < n and text[i] == "{":
        i += 1
        return {key: parse_obj()}
    return {key: parse_string()}


def _u16(data: bytes, off: int) -> int:
    return int.from_bytes(data[off : off + 2], "little")


def _u32(data: bytes, off: int) -> int:
    return int.from_bytes(data[off : off + 4], "little")


def pe_info(path: str) -> dict | None:
    try:
        size = os.path.getsize(path)
    except OSError:
        return None
    if size < 0x80 or size > 250_000_000:
        return None
    try:
        with open(path, "rb") as handle:
            data = handle.read()
    except OSError:
        return None
    if data[:2] != b"MZ":
        return None
    e = _u32(data, 0x3C)
    if e + 24 > len(data) or data[e : e + 4] != b"PE\0\0":
        return None
    machine = _u16(data, e + 4)
    nsec = _u16(data, e + 6)
    size_opt = _u16(data, e + 20)
    opt = e + 24
    if opt + 2 > len(data):
        return None
    magic = _u16(data, opt)
    if magic == 0x20B:
        dd = opt + 112
        bits = 64
    elif magic == 0x10B:
        dd = opt + 96
        bits = 32
    else:
        return None
    if machine == 0x8664:
        bits = 64
    elif machine == 0x14C:
        bits = 32
    sec_off = opt + size_opt
    sections = []
    for idx in range(nsec):
        o = sec_off + idx * 40
        if o + 24 > len(data):
            break
        sections.append((_u32(data, o + 12), _u32(data, o + 8), _u32(data, o + 20), _u32(data, o + 16)))

    def rva_to_off(rva: int):
        for va, vsz, raw, rsz in sections:
            span = max(vsz, rsz, 1)
            if va <= rva < va + span:
                return raw + (rva - va)
        return None

    def cstr(off: int) -> str:
        end = data.find(b"\0", off, off + 260)
        if end < 0:
            return ""
        return data[off:end].decode("ascii", "ignore")

    names: set[str] = set()

    def walk_import(rva: int) -> None:
        if not rva:
            return
        off = rva_to_off(rva)
        if off is None:
            return
        for n in range(512):
            d = off + n * 20
            if d + 20 > len(data):
                break
            orig = _u32(data, d)
            name_rva = _u32(data, d + 12)
            if orig == 0 and name_rva == 0:
                break
            no = rva_to_off(name_rva)
            if no is None:
                continue
            nm = cstr(no).lower()
            if nm:
                names.add(nm)

    if dd + 14 * 8 <= len(data):
        walk_import(_u32(data, dd + 8))
        delay = _u32(data, dd + 13 * 8)
        if delay:
            off = rva_to_off(delay)
            if off is not None:
                for n in range(256):
                    d = off + n * 32
                    if d + 8 > len(data):
                        break
                    attrs = _u32(data, d)
                    dll_rva = _u32(data, d + 4)
                    if attrs == 0 and dll_rva == 0:
                        break
                    no = rva_to_off(dll_rva)
                    if no is not None:
                        nm = cstr(no).lower()
                        if nm:
                            names.add(nm)
    return {"bits": bits, "imports": names}


def classify_api(imports: set[str]) -> str:
    if "d3d12.dll" in imports:
        return "dx12"
    if "d3d11.dll" in imports:
        return "dx11"
    if "d3d9.dll" in imports or "d3d8.dll" in imports:
        return "dx9"
    if "vulkan-1.dll" in imports:
        return "vulkan"
    if "opengl32.dll" in imports:
        return "opengl"
    return "unknown"


def steam_kind(path: str) -> str:
    norm = path.replace("\\", "/")
    if ".var/app/com.valvesoftware.Steam" in norm:
        return "flatpak"
    if "/snap/steam/" in norm or norm.rstrip("/").endswith("/snap/steam"):
        return "snap"
    return "native"


def steam_roots() -> list[str]:
    home = os.path.expanduser("~")
    candidates = [
        os.path.join(home, ".local", "share", "Steam"),
        os.path.join(home, ".steam", "steam"),
        os.path.join(home, ".steam", "root"),
        os.path.join(home, ".steam", "debian-installation"),
        os.path.join(home, ".var", "app", "com.valvesoftware.Steam", ".local", "share", "Steam"),
        os.path.join(home, ".var", "app", "com.valvesoftware.Steam", "data", "Steam"),
        os.path.join(home, "snap", "steam", "common", ".local", "share", "Steam"),
        os.path.join(home, "snap", "steam", "common", ".steam", "steam"),
    ]
    extra = os.environ.get("FORGE_STEAM_ROOT")
    if extra:
        candidates.insert(0, extra)
    found: list[str] = []
    seen: set[str] = set()
    for cand in candidates:
        real = os.path.realpath(cand)
        if os.path.isdir(os.path.join(real, "steamapps")) and real not in seen:
            seen.add(real)
            found.append(real)
    return found


def libraries_for(root: str) -> list[str]:
    libs = [root]
    vdf_path = os.path.join(root, "steamapps", "libraryfolders.vdf")
    if not os.path.isfile(vdf_path):
        vdf_path = os.path.join(root, "steamapps", "libraryfolders.vdf")
    try:
        text = open(vdf_path, encoding="utf-8", errors="replace").read()
    except OSError:
        return libs
    data = parse_vdf(text)
    block = data.get("libraryfolders") or data.get("LibraryFolders") or {}
    if not isinstance(block, dict):
        return libs
    for key, value in block.items():
        path = None
        if isinstance(value, dict):
            path = value.get("path")
        elif isinstance(value, str) and key not in {"TimeNextStatsReport", "ContentStatsID"}:
            path = value
        if not path:
            continue
        path = os.path.realpath(os.path.expanduser(path))
        if os.path.isdir(os.path.join(path, "steamapps")) and path not in libs:
            libs.append(path)
    return libs


def _walk_limited(root: str, max_depth: int):
    root = os.path.abspath(root)
    for dirpath, dirnames, filenames in os.walk(root):
        rel = os.path.relpath(dirpath, root)
        depth = 0 if rel == "." else rel.count(os.sep) + 1
        if depth > max_depth:
            dirnames[:] = []
            continue
        yield dirpath, dirnames, filenames, depth


def detect_anticheat(root: str) -> str | None:
    try:
        for dirpath, dirnames, filenames, depth in _walk_limited(root, 3):
            low_dirs = [d.lower() for d in dirnames]
            if "easyanticheat" in low_dirs:
                return "easyanticheat"
            if "battleye" in low_dirs:
                return "battleye"
            for fn in filenames:
                low = fn.lower()
                if low in {"start_protected_game.exe", "easyanticheat_eos_setup.exe"}:
                    return "easyanticheat"
            if depth >= 2:
                dirnames[:] = [
                    d
                    for d in dirnames
                    if d.lower() in {"engine", "binaries", "easyanticheat", "battleye", "redist", "bin"}
                ]
    except OSError:
        return None
    return None


def find_file(root: str, names: set[str], max_depth: int = 6) -> str | None:
    names = {n.lower() for n in names}
    try:
        for dirpath, dirnames, filenames, _depth in _walk_limited(root, max_depth):
            dirnames[:] = [d for d in dirnames if d.lower() not in {"movies", "video"}]
            for fn in filenames:
                if fn.lower() in names:
                    return os.path.join(dirpath, fn)
    except OSError:
        return None
    return None


def choose_exe(game_root: str, installdir: str) -> tuple[str | None, dict | None]:
    candidates: list[tuple[int, str, dict]] = []
    try:
        for dirpath, dirnames, filenames, _depth in _walk_limited(game_root, 6):
            dirnames[:] = [d for d in dirnames if d.lower() not in {"movies", "video", "logs"}]
            for fn in filenames:
                if not fn.lower().endswith(".exe"):
                    continue
                low = fn.lower()
                if low in SKIP_EXE or any(part in low for part in SKIP_PARTS):
                    continue
                path = os.path.join(dirpath, fn)
                info = pe_info(path)
                if not info:
                    continue
                score = 10
                if info["bits"] == 64:
                    score += 50
                else:
                    score -= 15
                lowpath = path.lower().replace("\\", "/")
                if "binaries/win64" in lowpath:
                    score += 40
                elif "/win64" in lowpath or "/x64/" in lowpath or lowpath.endswith("/bin/x64"):
                    score += 22
                folder = "".join(ch for ch in installdir.lower() if ch.isalnum())
                stem = "".join(ch for ch in os.path.splitext(low)[0] if ch.isalnum())
                if stem and folder and (stem in folder or folder in stem):
                    score += 30
                if "launcher" in low and "game" not in low:
                    score -= 30
                try:
                    score += min(os.path.getsize(path) // (1024 * 1024), 30)
                except OSError:
                    pass
                api = classify_api(info["imports"])
                if api in {"dx12", "dx11"}:
                    score += 8
                candidates.append((score, path, info))
    except OSError:
        return None, None
    if not candidates:
        return None, None
    candidates.sort(key=lambda item: item[0], reverse=True)
    best_score, best_path, best_info = candidates[0]
    api = classify_api(best_info["imports"])
    if api == "unknown":
        for _score, path, info in candidates[1:8]:
            other = classify_api(info["imports"])
            if other in {"dx12", "dx11", "dx9", "vulkan"} and os.path.dirname(path) == os.path.dirname(best_path):
                best_info = {**best_info, "imports": info["imports"]}
                break
    return best_path, best_info


def load_marker(folder: str) -> tuple[str | None, dict | None]:
    for name in (MARKER_NAME, LEGACY_MARKER):
        path = os.path.join(folder, name)
        if not os.path.isfile(path):
            continue
        try:
            data = json.load(open(path, encoding="utf-8"))
            return path, data if isinstance(data, dict) else {"installed": True}
        except (OSError, json.JSONDecodeError):
            return path, {"installed": True}
    return None, None


def skip_reason(api: str, bits: int | None, exe: str | None, anticheat: str | None) -> str | None:
    parts: list[str] = []
    if bits == 32:
        parts.append("32-bit executable. Only 64-bit games are packed.")
    elif api == "dx9":
        parts.append("DirectX 9. Only DX11 and DX12 are hooked.")
    elif api == "vulkan":
        parts.append("Vulkan. Only DX11 and DX12 are hooked.")
    elif api == "opengl":
        parts.append("OpenGL. Only DX11 and DX12 are hooked.")
    elif not exe:
        parts.append("No Windows executable in the install folder.")
    elif api == "unknown":
        parts.append("The executable does not import d3d11 or d3d12. You can still force a DX11 or DX12 hook.")
    if anticheat:
        label = {"easyanticheat": "Easy Anti-Cheat", "battleye": "BattlEye", "vac": "VAC"}.get(anticheat, anticheat)
        parts.append(f"{label} is in this folder. The hook can make the game refuse to start or ban the account.")
    if not parts:
        return None
    if api == "unknown" and not anticheat:
        return parts[0]
    return "Skipped: " + " ".join(parts)


def game_record(appid: str, name: str, library: str, installdir: str, kind: str) -> dict | None:
    root = os.path.join(library, "steamapps", "common", installdir)
    if not os.path.isdir(root):
        return None
    exe, info = choose_exe(root, installdir)
    api = "unknown"
    bits = None
    if info:
        api = classify_api(info["imports"])
        bits = info["bits"]
    dlss = find_file(root, {"nvngx_dlss.dll"})
    marker = None
    if exe:
        _path, marker = load_marker(os.path.dirname(exe))
    ac = detect_anticheat(root)
    reason = skip_reason(api, bits, exe, ac)
    return {
        "appid": appid,
        "name": name,
        "library": library,
        "installDir": root,
        "exe": exe,
        "exeRelative": os.path.relpath(exe, root) if exe else None,
        "api": api,
        "bits": bits,
        "hasDlss": bool(dlss),
        "dlssPath": dlss,
        "anticheat": ac,
        "installedByForge": bool(marker),
        "hook": (marker or {}).get("hook"),
        "steamKind": kind,
        "unsupportedReason": reason,
        "skipReason": reason,
    }


def scan_games() -> dict:
    roots = steam_roots()
    warnings: list[str] = []
    games: list[dict] = []
    seen: set[str] = set()
    if not roots:
        warnings.append(
            "No Steam library found. Checked the native, Flatpak, and Snap locations."
        )
        return {"games": [], "roots": [], "warnings": warnings}
    for root in roots:
        kind = steam_kind(root)
        for library in libraries_for(root):
            steamapps = os.path.join(library, "steamapps")
            if not os.path.isdir(steamapps):
                continue
            try:
                names = os.listdir(steamapps)
            except OSError:
                continue
            for fn in names:
                if not (fn.startswith("appmanifest_") and fn.endswith(".acf")):
                    continue
                appid = fn[len("appmanifest_") : -len(".acf")]
                if appid in SKIP_APPIDS or appid in seen:
                    continue
                try:
                    text = open(os.path.join(steamapps, fn), encoding="utf-8", errors="replace").read()
                except OSError:
                    continue
                data = parse_vdf(text)
                state = data.get("AppState") or data.get("appstate") or {}
                if not isinstance(state, dict):
                    continue
                name = state.get("name") or state.get("Name") or appid
                if not isinstance(name, str):
                    continue
                low = name.lower()
                if low.startswith("proton ") or "steam linux runtime" in low or "steamworks common" in low:
                    continue
                flags = 0
                try:
                    flags = int(state.get("StateFlags") or state.get("stateflags") or "0")
                except ValueError:
                    flags = 0
                if flags and (flags & 4) == 0:
                    continue
                installdir = state.get("installdir") or state.get("InstallDir")
                if not isinstance(installdir, str) or not installdir:
                    continue
                seen.add(appid)
                record = game_record(appid, name, library, installdir, steam_kind(library) if library != root else kind)
                if record:
                    games.append(record)
    games.sort(key=lambda g: g["name"].lower())
    return {"games": games, "roots": roots, "warnings": warnings}


def _urlretrieve(url: str, dest: str) -> None:
    req = urllib.request.Request(url, headers={"User-Agent": "ENHANCE/1.0"})
    with urllib.request.urlopen(req, timeout=120) as response, open(dest, "wb") as out:
        while True:
            chunk = response.read(1024 * 256)
            if not chunk:
                break
            out.write(chunk)


def cached_download(url: str, filename: str, label: str) -> str:
    dest = os.path.join(cache_dir(), filename)
    if os.path.isfile(dest) and os.path.getsize(dest) > 0:
        log_line(f"Cache hit: {label}")
        return dest
    log_line(f"Downloading {label}")
    partial = dest + ".partial"
    _urlretrieve(url, partial)
    os.replace(partial, dest)
    return dest


def ensure_7z() -> str:
    env_bundled = os.environ.get("FORGE_BUNDLED_7Z") or ""
    here = os.path.dirname(os.path.abspath(__file__))
    candidates = [
        env_bundled,
        os.path.join(here, "7zz"),
        os.path.join(here, "..", "bin", "7zz"),
    ]
    for candidate in candidates:
        if candidate and os.path.isfile(candidate) and os.access(candidate, os.X_OK):
            return candidate
    for name in ("7z", "7zz", "7za"):
        found = shutil.which(name)
        if found:
            return found
    bundled = os.path.join(cache_dir(), "7zz")
    if os.path.isfile(bundled) and os.access(bundled, os.X_OK):
        return bundled
    log_line("No 7z on PATH. Fetching the official 7-Zip Linux build (no root).")
    archive = cached_download(SEVEN_URL, "7z2603-linux-x64.tar.xz", "7-Zip 26.03")
    with tarfile.open(archive, "r:xz") as tar:
        member = next((m for m in tar.getmembers() if os.path.basename(m.name) == "7zz"), None)
        if member is None:
            raise RuntimeError("7-Zip archive did not contain 7zz.")
        member.name = "7zz"
        if hasattr(tarfile, "data_filter"):
            tar.extract(member, cache_dir(), filter="data")
        else:
            tar.extract(member, cache_dir())
    os.chmod(bundled, 0o755)
    return bundled


def extract_reshade(setup_path: str) -> str:
    out = os.path.join(cache_dir(), "reshade-6.8.0")
    dll = os.path.join(out, "ReShade64.dll")
    if os.path.isfile(dll) and os.path.getsize(dll) > 100_000:
        return dll
    os.makedirs(out, exist_ok=True)
    seven = ensure_7z()
    import subprocess

    log_line("Unpacking ReShade64.dll from the official 6.8.0 add-on setup")
    proc = subprocess.run(
        [seven, "e", "-y", f"-o{out}", setup_path, "ReShade64.dll"],
        capture_output=True,
        text=True,
        check=False,
    )
    if proc.returncode != 0 or not os.path.isfile(dll):
        raise RuntimeError(proc.stderr.strip() or "Could not unpack ReShade64.dll")
    return dll


def extract_named(zip_path: str, wanted: str, dest_name: str) -> str:
    dest = os.path.join(cache_dir(), dest_name)
    if os.path.isfile(dest) and os.path.getsize(dest) > 0:
        return dest
    with zipfile.ZipFile(zip_path) as archive:
        match = next((n for n in archive.namelist() if os.path.basename(n).lower() == wanted.lower()), None)
        if match is None:
            raise RuntimeError(f"{os.path.basename(zip_path)} has no {wanted}")
        with archive.open(match) as src, open(dest, "wb") as out:
            shutil.copyfileobj(src, out)
    return dest


def extract_streamline(zip_path: str) -> dict[str, str]:
    out_dir = os.path.join(cache_dir(), "streamline")
    os.makedirs(out_dir, exist_ok=True)
    found: dict[str, str] = {}
    with zipfile.ZipFile(zip_path) as archive:
        for name in SL_NAMES + SL_LICENSES:
            match = next((n for n in archive.namelist() if os.path.basename(n).lower() == name.lower()), None)
            if not match:
                continue
            dest = os.path.join(out_dir, name)
            if not os.path.isfile(dest):
                with archive.open(match) as src, open(dest, "wb") as out:
                    shutil.copyfileobj(src, out)
            found[name] = dest
    if "nvngx_dlss.dll" not in found or "sl.interposer.dll" not in found:
        raise RuntimeError("Streamline package is missing nvngx_dlss.dll or sl.interposer.dll")
    return found


def _backup(folder: str, filename: str) -> None:
    src = os.path.join(folder, filename)
    if not os.path.isfile(src):
        return
    stamp = time.strftime("%Y%m%d-%H%M%S")
    dest_dir = os.path.join(folder, BACKUP_DIRNAME, stamp)
    os.makedirs(dest_dir, exist_ok=True)
    shutil.copy2(src, os.path.join(dest_dir, filename))


def _place(src: str, folder: str, filename: str, placed: list[str]) -> None:
    dest = os.path.join(folder, filename)
    _backup(folder, filename)
    shutil.copy2(src, dest)
    placed.append(filename)
    log_line(f"Placed {filename}")


def write_ini(folder: str) -> None:
    path = os.path.join(folder, "ReShade.ini")
    addon_line = "LoadFromDllMain=renodx-dlss5.addon64"
    if not os.path.isfile(path):
        text = (
            "[GENERAL]\n"
            "EffectSearchPaths=.\\reshade-shaders\\Shaders\n"
            "TextureSearchPaths=.\\reshade-shaders\\Textures\n"
            "\n"
            "[ADDON]\n"
            f"{addon_line}\n"
            "\n"
            "[INPUT]\n"
            "KeyOverlay=36,0,0,0\n"
            "InputProcessing=2\n"
        )
        with open(path, "w", encoding="utf-8", newline="\n") as handle:
            handle.write(text)
        log_line("Wrote ReShade.ini")
        return
    _backup(folder, "ReShade.ini")
    raw = open(path, encoding="utf-8", errors="replace").read().replace("\r\n", "\n")
    lines = raw.split("\n")
    out: list[str] = []
    in_addon = False
    wrote = False
    saw_addon = False
    for line in lines:
        stripped = line.strip()
        if stripped.startswith("[") and stripped.endswith("]"):
            if in_addon and not wrote:
                out.append(addon_line)
                wrote = True
            in_addon = stripped.lower() == "[addon]"
            if in_addon:
                saw_addon = True
            out.append(line)
            continue
        if in_addon and stripped.lower().startswith("loadfromdllmain="):
            out.append(addon_line)
            wrote = True
            continue
        out.append(line)
    if in_addon and not wrote:
        out.append(addon_line)
        wrote = True
    if not saw_addon:
        if out and out[-1] != "":
            out.append("")
        out.append("[ADDON]")
        out.append(addon_line)
    with open(path, "w", encoding="utf-8", newline="\n") as handle:
        handle.write("\n".join(out).rstrip() + "\n")
    log_line("Updated ReShade.ini (LoadFromDllMain=renodx-dlss5.addon64)")


def find_game(appid: str) -> dict:
    if not appid.isdigit():
        raise RuntimeError("Unknown game.")
    scanned = scan_games()
    for game in scanned["games"]:
        if game["appid"] == appid:
            return game
    raise RuntimeError("That game is not in a local Steam library.")


def install_game(appid: str, hook: str, overwrite: bool, api_override: str | None, confirm_ac: bool) -> dict:
    if hook not in {"dxgi", "d3d11", "d3d12"}:
        raise RuntimeError("Hook must be dxgi, d3d11, or d3d12.")
    game = find_game(appid)
    api = game["api"]
    if api_override in {"dx11", "dx12"} and api == "unknown":
        api = api_override
        log_line(f"API override: {api_override}")
    if api not in {"dx11", "dx12"}:
        raise RuntimeError(game["unsupportedReason"] or "Only DX11 and DX12 games can be installed.")
    if game["bits"] not in {64, None}:
        raise RuntimeError("Only 64-bit games are supported.")
    if not game["exe"]:
        raise RuntimeError("No executable to install next to.")
    if game["anticheat"] and not confirm_ac:
        raise RuntimeError(
            "This folder looks like it ships anti-cheat. Confirm in the app before installing."
        )
    folder = os.path.dirname(game["exe"])
    log_line(f"{game['name']} · {api.upper()} · 64-bit")
    log_line(f"Executable folder: {folder}")

    local_addon = os.path.join(payload_dir(), ADDON_NAME)
    local_nr = os.path.join(payload_dir(), "nvngx_dlssnr.dll")
    if os.path.isfile(local_addon):
        addon = local_addon
        log_line("Using your local DLSS 5 add-on from the payload folder")
    else:
        zpath = cached_download(ADDON_URL, "renodx-dlss5_7.0.0-rc8.zip", ADDON_LABEL)
        addon = extract_named(zpath, ADDON_NAME, ADDON_NAME)
    if os.path.isfile(local_nr):
        neural = local_nr
        log_line("Using your local nvngx_dlssnr.dll from the payload folder")
    else:
        zpath = cached_download(NR_URL, "nvngx_dlssnr_310.8.Lecram.zip", NR_LABEL)
        neural = extract_named(zpath, "nvngx_dlssnr.dll", "nvngx_dlssnr.dll")

    setup = cached_download(RESHAPE_URL, "ReShade_Setup_6.8.0_Addon.exe", "ReShade 6.8.0 add-on setup")
    reshade_dll = extract_reshade(setup)

    placed: list[str] = []
    _place(reshade_dll, folder, f"{hook}.dll", placed)
    _place(addon, folder, ADDON_NAME, placed)
    _place(neural, folder, "nvngx_dlssnr.dll", placed)
    if game["dlssPath"] and os.path.dirname(game["dlssPath"]) != folder:
        _place(neural, os.path.dirname(game["dlssPath"]), "nvngx_dlssnr.dll", placed)
        log_line("Also placed nvngx_dlssnr.dll beside the game's existing DLSS files")

    need_runtime = overwrite or not game["hasDlss"]
    if need_runtime:
        sl_zip = cached_download(SL_URL, "streamline.zip", "NVIDIA Streamline / DLSS runtime")
        files = extract_streamline(sl_zip)
        for name, src in files.items():
            if name == "nvngx_dlssnr.dll":
                continue
            _place(src, folder, name, placed)
        if game["hasDlss"] and overwrite:
            log_line(f"Overwrote the game's DLSS / Streamline files. The previous copies are in {BACKUP_DIRNAME}.")
    else:
        log_line("Left the game's own DLSS / Streamline files in place. Overwrite was off.")

    write_ini(folder)
    placed.append("ReShade.ini")
    marker = {
        "installed": True,
        "hook": hook,
        "api": api,
        "files": placed,
        "versions": {
            "reshade": "6.8.0-addon",
            "addon": "renodx-dlss5-7.0.0-rc8",
            "neural": "310.8.Lecram",
        },
        "time": time.strftime("%Y-%m-%dT%H:%M:%S"),
    }
    with open(os.path.join(folder, MARKER_NAME), "w", encoding="utf-8") as handle:
        json.dump(marker, handle, indent=2)
        handle.write("\n")
    options = launch_options(hook)
    log_line("Install finished.")
    log_line(f"Steam launch option: {options}")
    return {
        "ok": True,
        "launchOptions": options,
        "hook": hook,
        "api": api,
        "folder": folder,
        "files": placed,
    }


def remove_game(appid: str) -> dict:
    game = find_game(appid)
    if not game["exe"]:
        raise RuntimeError("No executable on record.")
    folder = os.path.dirname(game["exe"])
    marker_path, marker = load_marker(folder)
    if not marker_path or marker is None:
        raise RuntimeError("ENHANCE has no install marker in that folder. Nothing was removed.")
    removed = []
    for filename in marker.get("files") or []:
        if filename == "ReShade.ini":
            continue
        path = os.path.join(folder, filename)
        if os.path.isfile(path):
            os.remove(path)
            removed.append(filename)
    os.remove(marker_path)
    return {"ok": True, "removed": removed, "note": f"Backups in {BACKUP_DIRNAME} were kept. ReShade.ini was left so other presets survive."}


def run_job(target, args: dict) -> None:
    with JOB_LOCK:
        JOB["running"] = True
        JOB["done"] = False
        JOB["error"] = None
        JOB["result"] = None
        JOB["lines"] = []
    try:
        result = target(**args)
        with JOB_LOCK:
            JOB["result"] = result
            JOB["done"] = True
    except Exception as exc:  # noqa: BLE001 — surface installer failures to the GUI
        log_line(f"Stopped: {exc}")
        with JOB_LOCK:
            JOB["error"] = str(exc)
            JOB["done"] = True
    finally:
        with JOB_LOCK:
            JOB["running"] = False


class Handler(BaseHTTPRequestHandler):
    server_version = "ENHANCE"

    def log_message(self, fmt: str, *args) -> None:
        return

    def _cors(self) -> None:
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Private-Network", "true")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "content-type")
        self.send_header("Cache-Control", "no-store")

    def _json(self, code: int, payload: dict) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(code)
        self._cors()
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _read_json(self) -> dict:
        length = int(self.headers.get("Content-Length") or "0")
        if length > 100_000:
            return {}
        raw = self.rfile.read(length) if length else b"{}"
        try:
            data = json.loads(raw.decode("utf-8") or "{}")
        except json.JSONDecodeError:
            return {}
        return data if isinstance(data, dict) else {}

    def do_OPTIONS(self) -> None:  # noqa: N802
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_GET(self) -> None:  # noqa: N802
        path = self.path.split("?", 1)[0]
        if path in {"/", "/index.html"}:
            body = UI_HTML.encode("utf-8")
            self.send_response(200)
            self._cors()
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        if path == "/api/health":
            self._json(200, {"ok": True, "name": "enhance", "version": VERSION, "port": PORT})
            return
        if path == "/api/games":
            self._json(200, scan_games())
            return
        if path == "/api/job":
            with JOB_LOCK:
                snap = dict(JOB)
            self._json(200, snap)
            return
        self._json(404, {"error": "Not found"})

    def do_POST(self) -> None:  # noqa: N802
        path = self.path.split("?", 1)[0]
        data = self._read_json()
        if path == "/api/install":
            with JOB_LOCK:
                busy = JOB["running"]
            if busy:
                self._json(409, {"error": "An install is already running."})
                return
            appid = str(data.get("appid") or "")
            hook = str(data.get("hook") or "dxgi")
            overwrite = bool(data.get("overwriteDlss"))
            override = data.get("apiOverride")
            override = override if override in {"dx11", "dx12"} else None
            confirm = bool(data.get("confirmAnticheat"))
            thread = threading.Thread(
                target=run_job,
                args=(install_game, {
                    "appid": appid,
                    "hook": hook,
                    "overwrite": overwrite,
                    "api_override": override,
                    "confirm_ac": confirm,
                }),
                daemon=True,
            )
            thread.start()
            self._json(202, {"started": True})
            return
        if path == "/api/remove":
            try:
                self._json(200, remove_game(str(data.get("appid") or "")))
            except Exception as exc:  # noqa: BLE001
                self._json(400, {"error": str(exc)})
            return
        self._json(404, {"error": "Not found"})


UI_HTML = r"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>ENHANCE — DLSS 5 for Proton</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Schibsted+Grotesk:wght@500;600&display=swap"/>
<style>
  :root { color-scheme: dark; --bg:#0c0d10; --surface:#14161b; --surface2:#1c1f26; --fg:#eceef2; --muted:#9aa3b2; --subtle:#6e7786; --line:#2c313b; --accent:#e7ebf2; --accent-fg:#14161a; --ok:#9dccb4; --warn:#d2b48a; --bad:#e0a29d; }
  * { box-sizing: border-box; }
  html, body { margin:0; background:var(--bg); color:var(--fg); font-family:"Schibsted Grotesk", sans-serif; }
  button, input { font: inherit; color: inherit; }
  button { cursor: pointer; }
  button:disabled { cursor: not-allowed; opacity: 0.45; }
  :focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  header { display:flex; justify-content:space-between; gap:16px; align-items:flex-end; padding:28px 28px 8px; }
  h1 { font-size: 40px; line-height: 1; font-weight: 600; letter-spacing: -0.03em; margin: 0; }
  .kicker { color: var(--subtle); letter-spacing: 0.14em; font-size: 12px; margin: 0 0 8px; }
  .sub { color: var(--muted); margin: 8px 0 0; max-width: 46rem; }
  main { display:grid; grid-template-columns: minmax(0,1fr) minmax(0,1.05fr); gap: 16px; padding: 16px 28px 32px; }
  @media (max-width: 900px) { main { grid-template-columns: 1fr; padding: 12px; } header { padding: 20px 12px 4px; flex-direction: column; align-items: flex-start; } }
  .panel { background: var(--surface); border: 1px solid var(--line); border-radius: 20px; padding: 12px; min-width: 0; }
  .row { display:flex; gap:8px; align-items:center; }
  input[type=search] { flex:1; background: var(--surface2); border: 1px solid var(--line); border-radius: 999px; padding: 10px 14px; }
  .chips { display:flex; gap:6px; flex-wrap:wrap; margin: 10px 0; }
  .chip, .hook { background: transparent; border: 1px solid var(--line); border-radius: 999px; padding: 8px 12px; color: var(--muted); }
  .chip[aria-pressed=true], .hook[aria-pressed=true] { background: var(--accent); color: var(--accent-fg); border-color: transparent; }
  .game { width:100%; text-align:left; background: transparent; border: 0; border-radius: 12px; padding: 12px; display:flex; flex-direction:column; gap:4px; }
  .game[aria-selected=true] { background: var(--surface2); }
  .game:hover { background: var(--surface2); }
  .name { font-weight: 600; }
  .meta { color: var(--subtle); font-family: "IBM Plex Mono", monospace; font-size: 12px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .pills { display:flex; gap:6px; flex-wrap:wrap; }
  .pill { font-size: 12px; border: 1px solid var(--line); border-radius: 999px; padding: 2px 8px; color: var(--muted); }
  .pill.ok { color: var(--ok); } .pill.warn { color: var(--warn); } .pill.bad { color: var(--bad); }
  .list { max-height: calc(100vh - 220px); overflow:auto; }
  .shelf { display: grid; grid-template-columns: repeat(auto-fill, minmax(132px, 1fr)); gap: 12px; }
  .card { position: relative; aspect-ratio: 2 / 3; overflow: hidden; border-radius: 12px; border: 1px solid var(--line); background: var(--surface2); padding: 0; text-align: left; }
  .card img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .card .shade { position: absolute; left: 0; right: 0; bottom: 0; padding: 8px 10px; background: color-mix(in srgb, var(--bg) 90%, transparent); }
  .card .reason { display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; color: var(--warn); font-size: 12px; line-height: 1.35; margin-top: 4px; }
  .card.dim img { opacity: 0.4; }
  .card[aria-selected=true] { outline: 2px solid var(--accent); outline-offset: 2px; }
  .badge { position: absolute; top: 8px; left: 8px; background: color-mix(in srgb, var(--bg) 80%, transparent); border-radius: 999px; padding: 2px 8px; font-size: 12px; }
  .badge.right { left: auto; right: 8px; color: var(--ok); }
  h2 { margin: 0; font-size: 28px; letter-spacing: -0.03em; font-weight: 600; }
  .mono { font-family: "IBM Plex Mono", monospace; font-size: 12px; color: var(--muted); word-break: break-all; }
  .block { margin-top: 16px; }
  .label { color: var(--subtle); font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 8px; }
  ul.notes { margin: 0; padding-left: 18px; color: var(--muted); } ul.notes li { margin: 6px 0; }
  .launch { display:flex; gap:8px; align-items:flex-start; background: var(--bg); border-radius: 12px; padding: 12px; }
  .launch code { font-family: "IBM Plex Mono", monospace; font-size: 13px; }
  .primary { background: var(--accent); color: var(--accent-fg); border: 0; border-radius: 999px; padding: 12px 16px; font-weight: 600; }
  .ghost { background: transparent; border: 1px solid var(--line); border-radius: 999px; padding: 12px 16px; }
  .log { font-family: "IBM Plex Mono", monospace; font-size: 12px; white-space: pre-wrap; color: var(--muted); background: var(--bg); border-radius: 12px; padding: 12px; max-height: 220px; overflow:auto; }
  .check { display:flex; gap:8px; align-items:flex-start; color: var(--muted); font-size: 14px; }
</style>
</head>
<body>
<header>
  <div>
    <p class="kicker">LINUX · STEAM · PROTON</p>
    <h1>ENHANCE</h1>
    <p class="sub">Installed Steam games, with their covers. One click places ReShade 6.8.0, Lecram's DLSS 5 add-on, and the NVIDIA neural runtime into a DX11 or DX12 game.</p>
  </div>
  <button class="ghost" id="rescan" type="button">Rescan Steam</button>
</header>
<main>
  <section class="panel">
    <div class="row">
      <input id="q" type="search" placeholder="Filter games" aria-label="Filter games"/>
    </div>
    <div class="chips" role="toolbar">
      <button class="chip" data-filter="all" aria-pressed="true" type="button">All</button>
      <button class="chip" data-filter="ready" aria-pressed="false" type="button">Ready</button>
      <button class="chip" data-filter="installed" aria-pressed="false" type="button">Installed</button>
      <button class="chip" data-filter="skipped" aria-pressed="false" type="button">Skipped</button>
    </div>
    <div id="list" class="shelf" role="listbox" aria-label="Installed Steam games"></div>
  </section>
  <section class="panel" id="detail"></section>
</main>
<script>
const state = { games: [], filter: "all", q: "", id: null, hook: "dxgi", overwrite: false, ack: false, log: [], busy: false };
const listEl = document.getElementById("list");
const detailEl = document.getElementById("detail");
function ready(g) { return (g.api === "dx11" || g.api === "dx12") && g.bits !== 32 && g.exe; }
function skipped(g) { return !ready(g) || !!g.anticheat; }
function launch(hook) { return 'WINEDLLOVERRIDES="' + hook + '=n,b" PROTON_ENABLE_NVAPI=1 %command%'; }
function pills(g) {
  const api = g.api === "dx11" || g.api === "dx12" ? g.api.toUpperCase() : (g.api || "unknown");
  const bits = g.bits ? g.bits + "-bit" : "bitness unknown";
  let html = '<span class="pill">' + api + '</span><span class="pill">' + bits + '</span>';
  if (g.hasDlss) html += '<span class="pill ok">ships DLSS</span>';
  if (g.installedByForge) html += '<span class="pill ok">ENHANCE installed</span>';
  if (g.anticheat) html += '<span class="pill bad">anti-cheat</span>';
  if (g.unsupportedReason && g.api !== "dx11" && g.api !== "dx12") html += '<span class="pill warn">skipped</span>';
  return html;
}
function visible() {
  const q = state.q.trim().toLowerCase();
  return state.games.filter(g => {
    if (q && !g.name.toLowerCase().includes(q)) return false;
    if (state.filter === "ready") return ready(g) && !g.anticheat;
    if (state.filter === "installed") return !!g.installedByForge;
    if (state.filter === "skipped") return skipped(g);
    return true;
  });
}
function coverSrc(appid) {
  return /^[0-9]+$/.test(String(appid))
    ? "https://cdn.cloudflare.steamstatic.com/steam/apps/" + appid + "/library_600x900.jpg"
    : "";
}
function renderList() {
  const games = visible();
  if (!state.id && games[0]) state.id = games[0].appid;
  listEl.innerHTML = games.map(g => {
    const why = skipped(g) ? (g.skipReason || g.unsupportedReason || "Skipped") : "";
    const hard = why && g.api !== "unknown";
    return '<button class="card' + (hard ? " dim" : "") + '" role="option" data-id="' + g.appid + '" aria-selected="' + (g.appid === state.id) + '">' +
      '<img alt="" src="' + coverSrc(g.appid) + '" onerror="this.style.display=\'none\'"/>' +
      '<span class="badge">' + escapeHtml((g.api === "dx11" || g.api === "dx12") ? g.api.toUpperCase() : (g.api || "unknown")) + '</span>' +
      (g.installedByForge ? '<span class="badge right">Installed</span>' : '') +
      '<span class="shade"><span class="name">' + escapeHtml(g.name) + '</span>' +
      (why ? '<span class="reason">' + escapeHtml(why) + '</span>' : '<span class="meta">' + (g.bits ? g.bits + "-bit" : "") + '</span>') +
      '</span></button>';
  }).join("") || '<p class="sub">No games in this filter.</p>';
  listEl.querySelectorAll(".card").forEach(btn => btn.onclick = () => { state.id = btn.dataset.id; state.log = []; state.ack = false; render(); });
}
function selected() { return state.games.find(g => g.appid === state.id) || null; }
function escapeHtml(s) { return String(s).replace(/[&<>"]/g, c => ({'&':'&','<':'<','>':'>','"':'"'}[c])); }
function notes(g) {
  const dx = g.api === "dx11"
    ? "DX11 uses dxgi.dll by default. If the game dies before the menu, switch the hook to d3d11.dll and copy the new launch option."
    : "DX12 uses dxgi.dll by default. A black screen usually means the hook should be d3d12.dll instead. Use a current Proton (Experimental, GE, or CachyOS proton-cachyos) so vkd3d-proton is new enough for the ReShade 6.8 add-on.";
  return [
    "Steam → Properties → Compatibility → check “Force the use of a specific Steam Play compatibility tool”. Pick Proton Experimental, GE-Proton, or on CachyOS proton-cachyos / proton-ge-custom. Not Proton 8 or older.",
    "Paste the launch option exactly, including %command%.",
    "NVIDIA proprietary driver. 310.8.Lecram is the RTX 50 neural DLL. On RTX 20, 30, or 40, put the matching nvngx_dlssnr.dll from the DLSS 5 Discord into ~/.local/share/enhance-dlss5/payload before installing. Nouveau cannot run this.",
    "This packs the Windows build. If the game also has a native Linux version, forcing the compatibility tool is what makes Proton start.",
    dx,
    "In game, press Home. Add-ons → enable RenoDX DLSS. If the game did not ship DLSS: Hook Method = On Present, Require DLSS = Off.",
    "Single-player only. Easy Anti-Cheat, BattlEye, and similar will block the hook or ban the account.",
    "Flatpak and Snap Steam are scanned automatically. The launch option does not change. No root is required."
  ];
}
function renderDetail() {
  const g = selected();
  if (!g) { detailEl.innerHTML = "<p>Select a game.</p>"; return; }
  const can = (g.api === "dx11" || g.api === "dx12" || g.api === "unknown") && g.bits !== 32 && g.exe;
  const files = [
    state.hook + ".dll — ReShade 6.8.0 add-on (ReShade64.dll renamed)",
    "renodx-dlss5.addon64 — Lecram DLSS 5 add-on v7.0.0-rc8",
    "nvngx_dlssnr.dll — Lecram neural runtime 310.8.Lecram",
    "ReShade.ini — loads the add-on from DllMain"
  ];
  if (!g.hasDlss || state.overwrite) files.push("nvngx_dlss.dll, nvngx_dlssg.dll, and sl.*.dll — Streamline runtime");
  else files.push("Existing DLSS / Streamline files are left alone");
  const why = skipped(g) ? (g.skipReason || g.unsupportedReason || "") : "";
  const hookHelp = {
    dxgi: "Default for both DX11 and DX12. Proton loads it when the game creates a swap chain. Start here.",
    d3d11: "DX11 only. Use this if the game closes before the menu while dxgi.dll is the hook.",
    d3d12: "DX12 only. Use this if the picture stays black but the ReShade overlay still opens with Home."
  };
  detailEl.innerHTML =
    '<div class="row" style="align-items:flex-start"><img alt="" src="' + coverSrc(g.appid) + '" style="width:72px;aspect-ratio:2/3;object-fit:cover;border-radius:8px" onerror="this.style.display=\'none\'"/>' +
    '<div><h2>' + escapeHtml(g.name) + '</h2>' +
    '<div class="pills" style="margin-top:8px">' + pills(g) + '</div></div></div>' +
    '<p class="mono" style="margin-top:10px">' + escapeHtml(g.installDir) + (g.exeRelative ? "\n" + escapeHtml(g.exeRelative) : "") + '</p>' +
    (why ? '<p class="sub" style="color:var(--warn)">' + escapeHtml(why) + '</p>' : '') +
    '<div class="block"><div class="label">Hook</div>' +
    '<p class="sub">The hook is the same ReShade file under a different name. That name is the Windows DLL Proton swaps in. The launch option has to use the same name.</p>' +
    '<div class="chips">' +
      ["dxgi","d3d11","d3d12"].map(h => '<button type="button" class="hook" data-hook="' + h + '" aria-pressed="' + (state.hook===h) + '">' + h + '.dll</button>').join("") +
    '</div>' +
    '<ul class="notes">' + ["dxgi","d3d11","d3d12"].map(h => '<li' + (state.hook===h ? ' style="color:var(--fg)"' : '') + '><strong>' + h + '.dll</strong> — ' + escapeHtml(hookHelp[h]) + '</li>').join("") + '</ul></div>' +
    '<div class="block"><div class="label">Pack</div><ul class="notes">' + files.map(f => "<li>" + escapeHtml(f) + "</li>").join("") + '</ul>' +
    '<p class="sub">A file named renodx-dlss5.addon64 or nvngx_dlssnr.dll in ~/.local/share/enhance-dlss5/payload is used instead of the download. 310.8.Lecram is the RTX 50 neural build.</p></div>' +
    '<div class="block check"><label><input id="overwrite" type="checkbox"' + (state.overwrite ? " checked" : "") + '/> Overwrite the game DLSS / Streamline DLLs</label></div>' +
    (g.anticheat ? '<div class="block check"><label><input id="ack" type="checkbox"' + (state.ack ? " checked" : "") + '/> I understand anti-cheat may ban or refuse to start</label></div>' : '') +
    '<div class="block row"><button class="primary" id="install" type="button"' + (can && !state.busy ? "" : " disabled") + '>' + (state.busy ? "Installing…" : (g.installedByForge ? "Reinstall" : "Install DLSS 5")) + '</button>' +
    (g.installedByForge ? '<button class="ghost" id="remove" type="button">Remove ENHANCE files</button>' : '') + '</div>' +
    '<div class="block"><div class="label">Steam launch option</div><div class="launch"><code id="opt">' + escapeHtml(launch(state.hook)) + '</code><button class="ghost" id="copy" type="button">Copy</button></div></div>' +
    '<div class="block"><div class="label">Compatibility</div><ul class="notes">' + notes(g).map(n => "<li>" + escapeHtml(n) + "</li>").join("") + '</ul></div>' +
    (state.log.length ? '<div class="block"><div class="label">Log</div><div class="log" id="log"></div></div>' : '');
  detailEl.querySelectorAll(".hook").forEach(btn => btn.onclick = () => { state.hook = btn.dataset.hook; renderDetail(); });
  const ov = document.getElementById("overwrite"); if (ov) ov.onchange = () => { state.overwrite = ov.checked; renderDetail(); };
  const ack = document.getElementById("ack"); if (ack) ack.onchange = () => { state.ack = ack.checked; };
  const inst = document.getElementById("install"); if (inst) inst.onclick = doInstall;
  const rem = document.getElementById("remove"); if (rem) rem.onclick = doRemove;
  const copy = document.getElementById("copy"); if (copy) copy.onclick = async () => { await navigator.clipboard.writeText(launch(state.hook)); copy.textContent = "Copied"; };
  const log = document.getElementById("log"); if (log) log.textContent = state.log.join("\n");
}
function render() { renderList(); renderDetail(); }
async function load() {
  const res = await fetch("/api/games");
  const data = await res.json();
  state.games = data.games || [];
  if (!state.games.some(g => g.appid === state.id)) state.id = (visible()[0] || state.games[0] || {}).appid || null;
  render();
}
async function poll() {
  const res = await fetch("/api/job");
  const job = await res.json();
  state.log = job.lines || [];
  state.busy = !!job.running;
  render();
  if (job.running) setTimeout(poll, 400);
  else load();
}
async function doInstall() {
  const g = selected(); if (!g) return;
  state.busy = true; render();
  const body = { appid: g.appid, hook: state.hook, overwriteDlss: state.overwrite, confirmAnticheat: state.ack };
  if (g.api === "unknown") body.apiOverride = state.hook === "d3d11" ? "dx11" : "dx12";
  const res = await fetch("/api/install", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(body) });
  if (!res.ok) { const err = await res.json(); state.busy = false; state.log = [err.error || "Could not start"]; render(); return; }
  poll();
}
async function doRemove() {
  const g = selected(); if (!g) return;
  await fetch("/api/remove", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ appid: g.appid }) });
  load();
}
document.getElementById("rescan").onclick = load;
document.getElementById("q").oninput = (e) => { state.q = e.target.value; render(); };
document.querySelectorAll(".chip").forEach(btn => btn.onclick = () => {
  state.filter = btn.dataset.filter;
  document.querySelectorAll(".chip").forEach(c => c.setAttribute("aria-pressed", c === btn ? "true" : "false"));
  render();
});
load();
</script>
</body>
</html>
"""


def open_browser(url: str) -> bool:
    import shutil
    import subprocess
    import webbrowser

    try:
        if webbrowser.open(url, new=1):
            return True
    except Exception:
        pass
    commands: list[list[str]] = []
    xdg = shutil.which("xdg-open")
    if xdg:
        commands.append([xdg, url])
    gio = shutil.which("gio")
    if gio:
        commands.append([gio, "open", url])
    for name in ("kde-open", "firefox", "chromium", "google-chrome-stable", "google-chrome"):
        path = shutil.which(name)
        if path:
            commands.append([path, url])
    for argv in commands:
        try:
            subprocess.Popen(
                argv,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                start_new_session=True,
            )
            return True
        except OSError:
            continue
    return False


def tell_user(message: str) -> None:
    import shutil
    import subprocess

    print(message, flush=True)
    if not os.environ.get("DISPLAY") and not os.environ.get("WAYLAND_DISPLAY"):
        return
    for argv in (
        ["kdialog", "--msgbox", message],
        ["zenity", "--info", "--width", "460", "--text", message],
        ["notify-send", "ENHANCE", message],
    ):
        if not shutil.which(argv[0]):
            continue
        subprocess.Popen(argv, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)
        return


def serve() -> None:
    url = f"http://127.0.0.1:{PORT}/"
    try:
        server = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    except OSError:
        print(f"ENHANCE is already running at {url}", flush=True)
        if os.environ.get("FORGE_NO_BROWSER") != "1" and not open_browser(url):
            tell_user(f"ENHANCE is already running.\nOpen {url}")
        return
    print(f"ENHANCE is running at {url}", flush=True)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    if os.environ.get("FORGE_NO_BROWSER") != "1" and not open_browser(url):
        tell_user(f"ENHANCE is running, but no browser opened.\nOpen {url}")
    try:
        threading.Event().wait()
    except KeyboardInterrupt:
        server.shutdown()


def selftest() -> None:
    sample = '''
    "libraryfolders"
    {
      "0"
      {
        "path" "/tmp/steam"
        "apps" { "10" "1" }
      }
      "1" { "path" "/mnt/games" }
    }
    '''
    parsed = parse_vdf(sample)
    assert parsed["libraryfolders"]["0"]["path"] == "/tmp/steam", parsed
    assert parsed["libraryfolders"]["1"]["path"] == "/mnt/games"

    # Minimal 64-bit PE that imports d3d12.dll
    def build_pe() -> bytes:
        dll = b"d3d12.dll\0"
        # layout: DOS | PE | optional | section hdr | raw: import desc + dll name + hint/name + ILT + IAT
        dos = bytearray(128)
        dos[0:2] = b"MZ"
        e = 128
        dos[0x3C:0x40] = e.to_bytes(4, "little")
        # We'll assemble and patch RVAs after choosing offsets.
        # File layout after headers:
        # section raw at file offset 0x200, VA 0x1000
        pe = bytearray()
        pe += b"PE\0\0"
        pe += (0x8664).to_bytes(2, "little")  # machine
        pe += (1).to_bytes(2, "little")  # sections
        pe += b"\0" * 12
        pe += (240).to_bytes(2, "little")  # size of optional header (PE32+)
        pe += (0x22).to_bytes(2, "little")  # characteristics
        opt = bytearray(240)
        opt[0:2] = (0x20B).to_bytes(2, "little")
        # import directory index 1 at optional+112+8
        opt[112 + 8 : 112 + 12] = (0x1000).to_bytes(4, "little")
        opt[112 + 12 : 112 + 16] = (40).to_bytes(4, "little")
        pe += opt
        sec = bytearray(40)
        sec[0:8] = b".rdata\0\0"
        sec[8:12] = (0x200).to_bytes(4, "little")
        sec[12:16] = (0x1000).to_bytes(4, "little")  # VA
        sec[16:20] = (0x200).to_bytes(4, "little")
        sec[20:24] = (0x200).to_bytes(4, "little")  # raw
        pe += sec
        headers = bytes(dos) + bytes(pe)
        raw = bytearray(0x200)
        # import descriptor at 0
        # Name RVA = 0x1040
        raw[12:16] = (0x1040).to_bytes(4, "little")
        raw[0:4] = (0x1060).to_bytes(4, "little")  # ILT
        raw[16:20] = (0x1080).to_bytes(4, "little")  # IAT
        raw[0x40:0x40 + len(dll)] = dll
        info_off = 0x200
        assert len(headers) <= 0x200
        blob = headers + b"\0" * (0x200 - len(headers)) + bytes(raw)
        return blob

    path = os.path.join(tempfile.mkdtemp(), "game.exe")
    with open(path, "wb") as handle:
        handle.write(build_pe())
    info = pe_info(path)
    assert info and info["bits"] == 64, info
    assert classify_api(info["imports"]) == "dx12", info
    assert launch_options("dxgi").startswith("WINEDLLOVERRIDES=")
    print("selftest ok")


if __name__ == "__main__":
    if os.environ.get("FORGE_SELFTEST") == "1":
        selftest()
    else:
        try:
            serve()
        except OSError as exc:
            print(f"ENHANCE could not listen on 127.0.0.1:{PORT}: {exc}", flush=True)
            raise SystemExit(1) from exc
