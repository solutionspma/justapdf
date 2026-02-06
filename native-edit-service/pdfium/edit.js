import fs from "fs/promises";
import path from "path";
import { init } from "@embedpdf/pdfium";

let pdfiumInstancePromise = null;

function getExports(pdfium) {
  return pdfium.pdfium || pdfium.wasmExports || pdfium;
}

function getMalloc(pdfium) {
  const exports = getExports(pdfium);
  return exports.malloc || exports._malloc;
}

function getFree(pdfium) {
  const exports = getExports(pdfium);
  return exports.free || exports._free;
}

function getHeap(pdfium) {
  const exports = getExports(pdfium);
  return exports.HEAPU8 || pdfium.HEAPU8;
}



async function getPdfiumInstance() {
  if (!pdfiumInstancePromise) {
    pdfiumInstancePromise = (async () => {
      const wasmPath = path.resolve(
        "node_modules/@embedpdf/pdfium/dist/pdfium.wasm"
      );
      const wasmBinary = await fs.readFile(wasmPath);
      const instance = await init({ wasmBinary });
      instance.FPDF_InitLibrary();
      instance.PDFiumExt_Init();
      return instance;
    })();
  }
  return pdfiumInstancePromise;
}

function allocateUtf16(pdfium, text) {
  const bytes = (text.length + 1) * 2;
  const malloc = getMalloc(pdfium);
  if (!malloc) {
    throw new Error("PDFium malloc export unavailable.");
  }
  const ptr = malloc(bytes);
  const heap = getHeap(pdfium);
  if (!heap) {
    throw new Error("PDFium heap unavailable.");
  }
  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    heap[ptr + i * 2] = code & 0xff;
    heap[ptr + i * 2 + 1] = (code >> 8) & 0xff;
  }
  heap[ptr + text.length * 2] = 0;
  heap[ptr + text.length * 2 + 1] = 0;
  return ptr;
}

function parseColor(color) {
  if (!color || typeof color !== "string") {
    return { r: 0, g: 0, b: 0 };
  }
  const hex = color.startsWith("#") ? color.slice(1) : color;
  if (hex.length !== 6) {
    return { r: 0, g: 0, b: 0 };
  }
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return { r, g, b };
}

function writeFileFromPdfium(pdfium, documentHandle) {
  const writer = pdfium.PDFiumExt_OpenFileWriter();
  const saved = pdfium.PDFiumExt_SaveAsCopy(documentHandle, writer);
  if (!saved) {
    pdfium.PDFiumExt_CloseFileWriter(writer);
    throw new Error("PDFium save failed.");
  }
  const size = pdfium.PDFiumExt_GetFileWriterSize(writer);
  const malloc = getMalloc(pdfium);
  const free = getFree(pdfium);
  const heap = getHeap(pdfium);
  if (!malloc || !free || !heap) {
    pdfium.PDFiumExt_CloseFileWriter(writer);
    throw new Error("PDFium memory exports unavailable.");
  }
  const bufferPtr = malloc(size);
  pdfium.PDFiumExt_GetFileWriterData(writer, bufferPtr, size);
  const bytes = new Uint8Array(heap.subarray(bufferPtr, bufferPtr + size));
  free(bufferPtr);
  pdfium.PDFiumExt_CloseFileWriter(writer);
  return bytes;
}

export async function runPdfiumEdit({
  bytes,
  pageIndex,
  bbox,
  newText,
  fontName,
  fontSize,
  color
}) {
  if (!bbox) {
    throw new Error("Missing bbox.");
  }
  if (!newText || !newText.trim()) {
    throw new Error("Missing new text.");
  }

  const pdfium = await getPdfiumInstance();
  const malloc = getMalloc(pdfium);
  const free = getFree(pdfium);
  const heap = getHeap(pdfium);
  if (!malloc || !free || !heap) {
    throw new Error("PDFium memory exports unavailable.");
  }
  const dataPtr = malloc(bytes.length);
  heap.set(bytes, dataPtr);

  const doc = pdfium.FPDF_LoadMemDocument(dataPtr, bytes.length, "");
  if (!doc) {
    free(dataPtr);
    throw new Error("PDFium failed to load document.");
  }

  const page = pdfium.FPDF_LoadPage(doc, pageIndex);
  if (!page) {
    pdfium.FPDF_CloseDocument(doc);
    free(dataPtr);
    throw new Error("PDFium failed to load page.");
  }

  const size = Number.isFinite(fontSize) ? Number(fontSize) : Math.max(6, bbox.height * 0.8);
  const { r, g, b } = parseColor(color);

  const rect = pdfium.FPDFPageObj_CreateNewRect(bbox.x, bbox.y, bbox.width, bbox.height);
  pdfium.FPDFPageObj_SetFillColor(rect, 255, 255, 255, 255);
  pdfium.FPDFPage_InsertObject(page, rect);

  let textObj = pdfium.FPDFPageObj_NewTextObj(doc, fontName || "Helvetica", size);
  if (!textObj && fontName) {
    textObj = pdfium.FPDFPageObj_NewTextObj(doc, "Helvetica", size);
  }
  if (!textObj) {
    pdfium.FPDF_ClosePage(page);
    pdfium.FPDF_CloseDocument(doc);
    free(dataPtr);
    throw new Error("PDFium failed to create text object.");
  }
  const textPtr = allocateUtf16(pdfium, newText);
  let setOk = pdfium.FPDFText_SetText(textObj, textPtr);
  free(textPtr);
  if (!setOk && fontName) {
    textObj = pdfium.FPDFPageObj_NewTextObj(doc, "Helvetica", size);
    if (textObj) {
      const fallbackPtr = allocateUtf16(pdfium, newText);
      setOk = pdfium.FPDFText_SetText(textObj, fallbackPtr);
      free(fallbackPtr);
    }
  }
  if (!setOk) {
    pdfium.FPDF_ClosePage(page);
    pdfium.FPDF_CloseDocument(doc);
    free(dataPtr);
    throw new Error("PDFium failed to set text.");
  }

  pdfium.FPDFPageObj_SetFillColor(textObj, r, g, b, 255);
  pdfium.FPDFPageObj_Transform(textObj, 1, 0, 0, 1, bbox.x, bbox.y + bbox.height - size);
  pdfium.FPDFPage_InsertObject(page, textObj);
  pdfium.FPDFPage_GenerateContent(page);

  const outBytes = writeFileFromPdfium(pdfium, doc);

  pdfium.FPDF_ClosePage(page);
  pdfium.FPDF_CloseDocument(doc);
  free(dataPtr);

  return outBytes;
}
