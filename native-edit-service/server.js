import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { Pdfcpu } from "pdfcpu-wasm";
import { validateTextPresence } from "./pdfium/validate.js";

const require = createRequire(import.meta.url);
const wasmPath = require.resolve("pdfcpu-wasm/pdfcpu.wasm");
const cpu = new Pdfcpu(wasmPath);
let pdfiumAvailable = false;
try {
  require.resolve("@hyzyla/pdfium");
  pdfiumAvailable = true;
} catch (error) {
  pdfiumAvailable = false;
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.get("/health", (_req, res) => {
  const defaultWasmPath = path.resolve("pdfium/pdfium.wasm");
  const wasmPath = process.env.PDFIUM_WASM_PATH || defaultWasmPath;
  const engine = process.env.NATIVE_EDIT_ENGINE || "rewrite";
  res.json({
    ok: true,
    engine,
    pdfium: {
      wasmPath,
      available: fs.existsSync(wasmPath),
      moduleAvailable: pdfiumAvailable,
      validationEnabled: process.env.NATIVE_EDIT_VALIDATE_PDFIUM === "true"
    }
  });
});

app.post("/native-edit", async (req, res) => {
  try {
    const {
      pdfBase64,
      engine,
      pageIndex = 0,
      bbox,
      originalText,
      newText,
      fontName,
      fontSize,
      color
    } = req.body || {};

    if (!pdfBase64 || !bbox || !newText || !originalText) {
      res.status(400).json({ ok: false, error: "Invalid payload" });
      return;
    }

    const bytes = Uint8Array.from(Buffer.from(pdfBase64, "base64"));
    const activeEngine = engine || process.env.NATIVE_EDIT_ENGINE || "rewrite";
    const shouldValidate = process.env.NATIVE_EDIT_VALIDATE_PDFIUM === "true";
    if (shouldValidate) {
      if (!pdfiumAvailable) {
        res.status(500).json({ ok: false, error: "PDFium module not available." });
        return;
      }
      const validation = await validateTextPresence({
        bytes,
        pageIndex: Number(pageIndex),
        originalText
      });
      if (!validation.ok) {
        res.status(422).json({ ok: false, error: validation.reason });
        return;
      }
    }
    if (activeEngine === "pdfium") {
      res.status(501).json({
        ok: false,
        error: "PDFium WASM does not support operand-level rewrite. Use engine: 'rewrite'."
      });
      return;
    }

    const inputFile = new Blob([bytes], { type: "application/pdf" });
    inputFile.name = "input.pdf";
    const outputName = "output.pdf";
    const page = Number(pageIndex) + 1;
    const bboxString = `${bbox.x.toFixed(2)} ${bbox.y.toFixed(2)} ${bbox.width.toFixed(2)} ${bbox.height.toFixed(2)}`;

    const args = [
      "replace",
      "-pages",
      String(page),
      "-bbox",
      bboxString,
      "-font",
      fontName || "Helvetica",
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
      res.status(500).json({ ok: false, error: "No output produced" });
      return;
    }
    const data = new Uint8Array(await outFile.arrayBuffer());
    res.json({ ok: true, bytesBase64: Buffer.from(data).toString("base64"), warnings: [] });
  } catch (error) {
    res.status(500).json({ ok: false, error: error?.message || "Native edit failed" });
  }
});

const port = process.env.PORT || 8787;
app.listen(port, () => {
  console.log(`Native edit service listening on ${port}`);
});
