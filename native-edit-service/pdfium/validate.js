import { PDFiumLibrary } from "@hyzyla/pdfium";

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
