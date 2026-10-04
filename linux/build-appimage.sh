#!/bin/sh
# Build public/ENHANCE-x86_64.AppImage as a normal executable.
# It unpacks itself and starts python3. It does not need FUSE.
set -eu
ROOT="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
WORK="$(mktemp -d)"
cleanup() { rm -rf "$WORK"; }
trap cleanup EXIT
UA='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/128.0.0.0 Safari/537.36'

curl -fsSL -A "$UA" -L -o "$WORK/7z.tar.xz" \
  "https://github.com/ip7z/7zip/releases/download/26.03/7z2603-linux-x64.tar.xz"
mkdir -p "$WORK/seven" "$WORK/root/usr/bin" "$WORK/root/usr/share/forge"
tar -xJf "$WORK/7z.tar.xz" -C "$WORK/seven"
SEVEN="$(find "$WORK/seven" -type f -name 7zz | head -n 1)"
test -n "$SEVEN"
cp "$SEVEN" "$WORK/root/usr/bin/7zz"
cp "$ROOT/linux/forge_agent.py" "$WORK/root/usr/share/forge/forge_agent.py"
chmod 755 "$WORK/root/usr/bin/7zz" "$WORK/root/usr/share/forge/forge_agent.py"
tar -C "$WORK/root" -cJf "$WORK/payload.tar.xz" usr

gcc -O2 -s -o "$WORK/launcher" "$ROOT/linux/enhance_launch.c"
python3 - "$WORK/launcher" "$WORK/footer" << 'PY'
import struct, sys
offset = __import__("os").path.getsize(sys.argv[1])
open(sys.argv[2], "wb").write(struct.pack("<Q", offset) + b"ENHANCE1")
PY

OUT="$ROOT/public/ENHANCE-x86_64.AppImage"
cat "$WORK/launcher" "$WORK/payload.tar.xz" "$WORK/footer" > "$OUT"
chmod 755 "$OUT"
ls -lh "$OUT"
