import { createWorker } from "https://cdn.jsdelivr.net/npm/tesseract.js@5.0.5/dist/tesseract.esm.min.js";

let workerPromise = null;

async function getWorker() {
  if (!workerPromise) {
    workerPromise = (async () => {
      const worker = await createWorker("eng");
      return worker;
    })();
  }
  return workerPromise;
}

self.onmessage = async (event) => {
  const { imageBytes, width, height } = event.data || {};
  try {
    if (!imageBytes) {
      throw new Error("No image provided.");
    }
    const worker = await getWorker();
    const blob = new Blob([imageBytes], { type: "image/png" });
    const result = await worker.recognize(blob);
    const words = (result?.data?.words || []).map((word) => ({
      text: word.text,
      bbox: word.bbox
    }));
    self.postMessage({ ok: true, words, width, height });
  } catch (error) {
    self.postMessage({ ok: false, reason: error?.message || "OCR failed." });
  }
};
