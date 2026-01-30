# JustaPDF Native Edit Service

Minimal HTTP service for native text edits using pdfcpu-wasm.

## Run

```
npm install
npm run start
```

## PDFium binaries

The repo `pdfium-binaries-master` contains build scripts, not the actual binaries.
Use the download script to fetch the WASM build:

```
./scripts/download-pdfium-wasm.sh
```

You can also set `PDFIUM_WASM_PATH` to point at a custom location.

## PDFium validation (recommended)

Use this to validate text presence before edit:

```
NATIVE_EDIT_VALIDATE_PDFIUM=true
```

This uses `@hyzyla/pdfium` to confirm the text exists on the page.

## Native edit engine

```
NATIVE_EDIT_ENGINE=pdfium
```

When set to `rewrite`, the service performs operand-level rewrite via pdfcpu (no white-out).
Use `NATIVE_EDIT_VALIDATE_PDFIUM=true` to validate with PDFium before rewrite.

## API

`POST /native-edit`

Payload:
```
{
  "pdfBase64": "...",
  "pageIndex": 0,
  "bbox": { "x": 10, "y": 20, "width": 100, "height": 12 },
  "originalText": "Old",
  "newText": "New",
  "fontName": "Helvetica"
}
```

Response:
```
{ "ok": true, "bytesBase64": "..." }
```
