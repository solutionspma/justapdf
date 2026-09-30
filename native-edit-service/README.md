# JustaPDF Native Edit Service

Owner-controlled sidecar for conservative native PDF text edits.

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

## PDFium validation (optional)

Use this to validate text presence before edit:

```
NATIVE_EDIT_VALIDATE_PDFIUM=true
```

This uses `@hyzyla/pdfium` to confirm the text exists on the page.

## Native edit engine

```
NATIVE_EDIT_ENGINE=pdfium
```

The default `glyph` engine directly rewrites a traced text-showing operand in
the source content stream. It returns `capability: native-direct` only after
the output is re-opened by the PDF parser. Ambiguous encodings, Form XObject
source mapping, and unsupported fonts fail conservatively.

`pdfium` and `rewrite` are visual overlay compatibility paths. They are
disabled unless `NATIVE_EDIT_ALLOW_OVERLAY=true` and return
`capability: overlay-only`; they are never reported as native editing.

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
