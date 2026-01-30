# PDFium binaries

This folder is reserved for PDFium artifacts (WASM build).

Use the helper script:
```
./scripts/download-pdfium-wasm.sh
```

By default, the service expects:
- `native-edit-service/pdfium/pdfium.wasm`

Override with:
- `PDFIUM_WASM_PATH=/absolute/path/to/pdfium.wasm`
