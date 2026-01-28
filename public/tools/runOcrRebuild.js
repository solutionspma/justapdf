import * as pdfjsLib from "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.2.67/build/pdf.mjs";
import { PDFDocument, StandardFonts, rgb } from "https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.esm.js";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.2.67/build/pdf.worker.mjs";

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  const size = value.length === 3 ? 1 : 2;
  const parts = value.match(new RegExp(`.{${size}}`, "g")) || [];
  const [r, g, b] = parts.map((part) => parseInt(part.length === 1 ? part + part : part, 16) / 255);
  return rgb(r || 0, g || 0, b || 0);
}

async function renderPageToImage(bytes, pageIndex) {
  const loadingTask = pdfjsLib.getDocument({ data: bytes });
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(pageIndex + 1);
  const viewport = page.getViewport({ scale: 2 });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const context = canvas.getContext("2d");
  await page.render({ canvasContext: context, viewport }).promise;
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  const imageBytes = await blob.arrayBuffer();
  return { imageBytes, width: canvas.width, height: canvas.height };
}

async function runOcrWorker(imageBytes, width, height) {
  return new Promise((resolve) => {
    const worker = new Worker("/tools/workers/ocrRebuild.worker.js", { type: "module" });
    worker.onmessage = (event) => {
      const data = event.data || {};
      worker.terminate();
      resolve(data);
    };
    worker.onerror = (error) => {
      worker.terminate();
      resolve({ ok: false, reason: error?.message || "OCR failed." });
    };
    worker.postMessage({ imageBytes, width, height }, [imageBytes]);
  });
}

export async function runOcrRebuild(payload) {
  const bytes =
    payload?.bytes instanceof Uint8Array
      ? payload.bytes
      : payload?.bytes instanceof ArrayBuffer
        ? new Uint8Array(payload.bytes)
        : null;
  if (!bytes) {
    return { ok: false, reason: "Missing PDF bytes." };
  }

  const pageIndex = Number(payload.pageIndex || 0);
  const { imageBytes, width, height } = await renderPageToImage(bytes, pageIndex);
  const ocrResult = await runOcrWorker(imageBytes.slice(0), width, height);
  if (!ocrResult.ok) {
    return ocrResult;
  }

  const pdfDoc = await PDFDocument.load(bytes);
  const page = pdfDoc.getPage(pageIndex);
  const pageSize = page.getSize();
  const font = pdfDoc.embedStandardFont(StandardFonts[payload.font] || StandardFonts.Helvetica);

  const image = await pdfDoc.embedPng(imageBytes);
  page.drawImage(image, {
    x: 0,
    y: 0,
    width: pageSize.width,
    height: pageSize.height
  });

  const words = ocrResult.words || [];
  for (const word of words) {
    if (!word?.text || !word?.bbox) continue;
    const wordWidth = ((word.bbox.x1 - word.bbox.x0) / width) * pageSize.width;
    const wordHeight = ((word.bbox.y1 - word.bbox.y0) / height) * pageSize.height;
    const x = (word.bbox.x0 / width) * pageSize.width;
    const y = pageSize.height - (word.bbox.y1 / height) * pageSize.height;
    page.drawText(word.text, {
      x,
      y,
      size: Math.max(6, wordHeight * 0.9),
      font,
      color: rgb(0, 0, 0),
      maxWidth: wordWidth,
      opacity: 0.01
    });
  }

  if (payload.selectionBox && payload.text) {
    page.drawRectangle({
      x: payload.selectionBox.x,
      y: payload.selectionBox.y,
      width: payload.selectionBox.width,
      height: payload.selectionBox.height,
      color: rgb(1, 1, 1),
      opacity: 1
    });
    page.drawText(payload.text, {
      x: payload.selectionBox.x,
      y: payload.selectionBox.y + (payload.selectionBox.height - (payload.size || 12)),
      size: payload.size || Math.max(6, payload.selectionBox.height * 0.85),
      font,
      color: hexToRgb(payload.color || "#000000"),
      maxWidth: payload.selectionBox.width,
      lineHeight: (payload.size || 12) * 1.2
    });
  }

  const updatedBytes = await pdfDoc.save();
  return { ok: true, bytes: updatedBytes };
}
