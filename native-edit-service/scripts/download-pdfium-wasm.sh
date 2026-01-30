#!/usr/bin/env sh
set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="$ROOT_DIR/pdfium"
URL="https://github.com/bblanchon/pdfium-binaries/releases/latest/download/pdfium-wasm.tgz"

mkdir -p "$OUT_DIR"
curl -L "$URL" -o "$OUT_DIR/pdfium-wasm.tgz"
tar -xzf "$OUT_DIR/pdfium-wasm.tgz" -C "$OUT_DIR"
echo "Downloaded PDFium WASM to $OUT_DIR"
