#!/bin/sh
# Gera a versão independente (GitHub Pages, sem Base44) em ./dist
# Uso, a partir da raiz do repositório:  sh standalone/build.sh
set -e
ROOT=$(cd "$(dirname "$0")/.." && pwd)
TMP=$(mktemp -d)
(cd "$ROOT" && tar --exclude=.git --exclude=node_modules --exclude=dist --exclude=standalone -cf - .) | (cd "$TMP" && tar -xf -)
cp -r "$ROOT/standalone/overlay/." "$TMP/"
cd "$TMP"
[ -f "$ROOT/standalone/patch.py" ] && python3 "$ROOT/standalone/patch.py"
if [ -d "$ROOT/node_modules" ]; then ln -s "$ROOT/node_modules" node_modules; else npm install --no-audit --no-fund >/dev/null; fi
npx vite build >/dev/null
rm -rf "$ROOT/dist" && cp -r dist "$ROOT/dist"
rm -rf "$TMP"
echo "Pronto: dist/ (publique o conteúdo na branch gh-pages)"
