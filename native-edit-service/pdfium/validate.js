import { PDFiumLibrary } from "@hyzyla/pdfium";
import sharp from "sharp";

let libraryPromise = null;

async function getLibrary() {
  if (!libraryPromise) {
    libraryPromise = PDFiumLibrary.init();
  }
  return libraryPromise;
}

export async function validateTextPresence({ bytes, pageIndex, originalText }) {
  if (!originalText || !originalText.trim()) {
    return { ok: false, reason: "Missing original text." };
  }

  const library = await getLibrary();
  let document = null;
  try {
    document = await library.loadDocument(bytes);
    const page = document.getPage(pageIndex);
    const text = page.getText();
    if (!text || !text.includes(originalText)) {
      return { ok: false, reason: "PDFium could not locate the text on the page." };
    }
    return { ok: true };
  } catch (error) {
    return { ok: false, reason: error?.message || "PDFium validation failed." };
  } finally {
    if (document?.destroy) {
      document.destroy();
    }
  }
}

export async function extractPageText({ bytes, pageIndex }) {
  const library = await getLibrary();
  let document = null;
  try {
    document = await library.loadDocument(bytes);
    const page = document.getPage(pageIndex);
    const text = page.getText();
    return { ok: true, text: text || "" };
  } catch (error) {
    return { ok: false, reason: error?.message || "PDFium extract failed." };
  } finally {
    if (document?.destroy) {
      document.destroy();
    }
  }
}

export async function renderPagePng({ bytes, pageIndex, scale = 2 }) {
  const library = await getLibrary();
  let document = null;
  try {
    document = await library.loadDocument(bytes);
    const page = document.getPage(pageIndex);
    const bitmap = await page.render({ scale, render: "bitmap" });
    const data = bitmap?.data || bitmap;
    const width = bitmap?.width;
    const height = bitmap?.height;
    if (!data || !width || !height) {
      return { ok: false, reason: "PDFium render returned empty bitmap." };
    }
    const buffer = await sharp(data, {
      raw: {
        width,
        height,
        channels: 4
      }
    })
      .png()
      .toBuffer();
    return { ok: true, buffer, width, height };
  } catch (error) {
    return { ok: false, reason: error?.message || "PDFium render failed." };
  } finally {
    if (document?.destroy) {
      document.destroy();
    }
  }
}
