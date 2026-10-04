#!/bin/sh
# Rebuild public/ENHANCE-x86_64.AppImage from linux/forge_agent.py.
# Needs python3 and curl. No root. The image uses the system python3 and
# bundles 7zz so ReShade can be unpacked without a distro package.
set -eu
ROOT="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
WORK="$(mktemp -d)"
cleanup() { rm -rf "$WORK"; }
trap cleanup EXIT
UA='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/128.0.0.0 Safari/537.36'

# appimagetool shells out to file(1). Some minimal systems do not ship it.
if ! command -v file >/dev/null 2>&1; then
  mkdir -p "$WORK/bin"
  cat > "$WORK/bin/file" << 'EOF'
#!/bin/sh
target=""
for arg in "$@"; do
  case "$arg" in
    -*) ;;
    *) target="$arg" ;;
  esac
done
python3 - "$target" << 'PY'
import sys
path = sys.argv[1]
try:
    data = open(path, "rb").read(64)
except OSError:
    print(path + ": cannot open")
    raise SystemExit(0)
if data[:4] == b"\x7fELF":
    bits = "64-bit" if data[4] == 2 else "32-bit"
    endian = "little" if data[5] == 1 else "big"
    machine = int.from_bytes(data[18:20], endian)
    name = {62: "x86-64", 3: "Intel 80386", 183: "ARM aarch64", 40: "ARM"}.get(machine, "unknown")
    print(f"{path}: ELF {bits} LSB executable, {name}, version 1 (GNU/Linux)")
else:
    print(f"{path}: data")
PY
EOF
  chmod 755 "$WORK/bin/file"
  export PATH="$WORK/bin:$PATH"
fi

curl -fsSL -A "$UA" -L -o "$WORK/appimagetool" \
  "https://github.com/AppImage/appimagetool/releases/download/continuous/appimagetool-x86_64.AppImage"
chmod 755 "$WORK/appimagetool"

curl -fsSL -A "$UA" -L -o "$WORK/7z.tar.xz" \
  "https://github.com/ip7z/7zip/releases/download/26.03/7z2603-linux-x64.tar.xz"
mkdir -p "$WORK/seven"
tar -xJf "$WORK/7z.tar.xz" -C "$WORK/seven"
SEVEN="$(find "$WORK/seven" -type f -name 7zz | head -n 1)"
test -n "$SEVEN"

APP="$WORK/ForgeDLSS5.AppDir"
mkdir -p "$APP/usr/bin" "$APP/usr/share/forge"
cp "$ROOT/linux/forge_agent.py" "$APP/usr/share/forge/forge_agent.py"
cp "$SEVEN" "$APP/usr/bin/7zz"
chmod 755 "$APP/usr/bin/7zz" "$APP/usr/share/forge/forge_agent.py"

cat > "$APP/AppRun" << 'EOF'
#!/bin/sh
HERE="$(dirname "$(readlink -f "$0" 2>/dev/null || printf '%s\n' "$0")")"
export PATH="$HERE/usr/bin:${PATH:-/usr/bin}"
export FORGE_BUNDLED_7Z="$HERE/usr/bin/7zz"
if ! command -v python3 >/dev/null 2>&1; then
  printf '%s\n' "ENHANCE needs python3, which is already installed on Arch, CachyOS, Fedora, and Debian." >&2
  if command -v notify-send >/dev/null 2>&1; then
    notify-send "ENHANCE" "python3 is not installed."
  fi
  exit 1
fi
exec python3 "$HERE/usr/share/forge/forge_agent.py" "$@"
EOF
chmod 755 "$APP/AppRun"

cat > "$APP/enhance.desktop" << 'EOF'
[Desktop Entry]
Name=ENHANCE
Comment=Install Lecram's DLSS 5 pack into Steam games under Proton
Exec=AppRun
Icon=enhance
Type=Application
Categories=Utility;
Terminal=false
EOF

python3 - "$APP/enhance.png" << 'PY'
import struct, sys, zlib
path = sys.argv[1]
w = h = 256
def px(x, y):
    # rounded square, light F, near-black ground
    nx = (x + 0.5) / w
    ny = (y + 0.5) / h
    # inset border
    m = 0.06
    inside = m <= nx <= 1 - m and m <= ny <= 1 - m
    # rounded by cutting corners
    r = 0.16
    def corner(cx, cy):
        dx, dy = nx - cx, ny - cy
        return dx * dx + dy * dy > r * r and (
            (nx < m + r and ny < m + r and cx < 0.5 and cy < 0.5)
            or (nx > 1 - m - r and ny < m + r and cx > 0.5 and cy < 0.5)
            or (nx < m + r and ny > 1 - m - r and cx < 0.5 and cy > 0.5)
            or (nx > 1 - m - r and ny > 1 - m - r and cx > 0.5 and cy > 0.5)
        )
    cut = corner(m + r, m + r) or corner(1 - m - r, m + r) or corner(m + r, 1 - m - r) or corner(1 - m - r, 1 - m - r)
    if not inside or cut:
        return (0, 0, 0, 0)
    # E geometry
    def in_mark():
        if 0.26 <= nx <= 0.40 and 0.22 <= ny <= 0.78:
            return True
        if 0.26 <= nx <= 0.74 and 0.22 <= ny <= 0.36:
            return True
        if 0.26 <= nx <= 0.62 and 0.44 <= ny <= 0.56:
            return True
        if 0.26 <= nx <= 0.74 and 0.64 <= ny <= 0.78:
            return True
        return False
    if in_mark():
        return (231, 235, 242, 255)
    return (12, 13, 16, 255)
raw = bytearray()
for y in range(h):
    raw.append(0)
    for x in range(w):
        raw.extend(px(x, y))
def chunk(tag, data):
    return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
png = b"\x89PNG\r\n\x1a\n"
png += chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0))
png += chunk(b"IDAT", zlib.compress(bytes(raw), 9))
png += chunk(b"IEND", b"")
open(path, "wb").write(png)
PY

OUT="$ROOT/public/ENHANCE-x86_64.AppImage"
rm -f "$OUT"
ARCH=x86_64 "$WORK/appimagetool" --appimage-extract-and-run --no-appstream "$APP" "$OUT"
chmod 755 "$OUT"
ls -lh "$OUT"
