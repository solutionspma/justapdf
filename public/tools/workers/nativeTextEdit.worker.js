import { Pdfcpu } from "https://cdn.jsdelivr.net/npm/pdfcpu-wasm@0.1.0/index.js";

const cpu = new Pdfcpu("https://cdn.jsdelivr.net/npm/pdfcpu-wasm@0.1.0/pdfcpu.wasm");

self.onmessage = async (event) => {
  const { bytes, pageIndex, bbox, originalText, newText, fontName } = event.data || {};
  try {
    if (!bytes || !bbox || !newText || !originalText) {
      throw new Error("Invalid payload.");
    }
    const inputFile = new File([bytes], "input.pdf", { type: "application/pdf" });
    const outputName = "output.pdf";
    const page = Number(pageIndex) + 1;
    const safeFont = fontName || "Helvetica";
    const bboxString = `${bbox.x.toFixed(2)} ${bbox.y.toFixed(2)} ${bbox.width.toFixed(2)} ${bbox.height.toFixed(2)}`;
    const args = [
      "replace",
      "-pages",
      String(page),
      "-bbox",
      bboxString,
      "-font",
      safeFont,
      "-old",
      originalText,
      "-new",
      newText,
      `/input/${inputFile.name}`,
      `/output/${outputName}`
    ];

    const handle = await cpu.run(args, [inputFile]);
    const outFile = await handle.readFile(`/output/${outputName}`, "application/pdf");
    if (!outFile) {
      throw new Error("No output produced.");
    }
    const data = await outFile.arrayBuffer();
    self.postMessage({ ok: true, bytes: data }, [data]);
  } catch (error) {
    self.postMessage({ ok: false, reason: error?.message || "Native edit failed." });
  }
};
