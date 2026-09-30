import express from "express";
import cors from "cors";
import fs from "fs";
import os from "os";
import path from "path";
import { createRequire } from "module";
import { spawn } from "child_process";
import { Pdfcpu } from "pdfcpu-wasm";
import { runPdfiumEdit } from "./pdfium/edit.js";
import { extractPageText, renderPagePng, validateTextPresence } from "./pdfium/validate.js";

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

async function runGlyphEdit({ bytes, pageIndex, originalText, newText, operandIndex, match = "exact" }) {
  const tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "glyph-edit-"));
  const inputPath = path.join(tempDir, "input.pdf");
  const outputPath = path.join(tempDir, "output.pdf");
  const scriptPath = path.resolve("glyph_edit.py");
  try {
    await fs.promises.writeFile(inputPath, Buffer.from(bytes));
    const runOnce = (mode) => new Promise((resolve, reject) => {
      const pythonBin = process.env.PYTHON_BIN || "python3";
      const args = [
        scriptPath,
        "--input",
        inputPath,
        "--output",
        outputPath,
        "--page",
        String(Number(pageIndex) || 0),
        "--new",
        newText,
        "--match",
        mode
      ];
      if (typeof operandIndex === "number" && Number.isFinite(operandIndex)) {
        args.push("--index", String(operandIndex));
      } else if (originalText) {
        args.push("--original", originalText);
      }
      const proc = spawn(pythonBin, args, { stdio: ["ignore", "pipe", "pipe"] });
      let stdout = "";
      let stderr = "";
      proc.stdout.on("data", (chunk) => {
        stdout += chunk.toString();
      });
      proc.stderr.on("data", (chunk) => {
        stderr += chunk.toString();
      });
      proc.on("error", reject);
      proc.on("close", (code) => {
        if (code !== 0) {
          reject(new Error(stderr || stdout || "Glyph edit failed."));
          return;
        }
        resolve(stdout);
      });
    });

    let result = await runOnce(match);
    let info = JSON.parse(String(result || "{}"));
    if (!info.ok && info.error === "No matching operands" && match !== "contains") {
      result = await runOnce("contains");
      info = JSON.parse(String(result || "{}"));
    }

    if (!info.ok) {
      throw new Error(info.error || "Glyph edit failed.");
    }
    const outBytes = await fs.promises.readFile(outputPath);
    return { bytes: new Uint8Array(outBytes), meta: info };
  } finally {
    await fs.promises.rm(tempDir, { recursive: true, force: true });
  }
}

async function runGlyphList({ bytes, pageIndex, searchText, limit = 500 }) {
  const tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "glyph-list-"));
  const inputPath = path.join(tempDir, "input.pdf");
  const scriptPath = path.resolve("glyph_list.py");
  try {
    await fs.promises.writeFile(inputPath, Buffer.from(bytes));
    const result = await new Promise((resolve, reject) => {
      const pythonBin = process.env.PYTHON_BIN || "python3";
      const args = [
        scriptPath,
        "--input",
        inputPath,
        "--limit",
        String(Number(limit) || 500)
      ];
      if (typeof pageIndex === "number" && Number.isFinite(pageIndex)) {
        args.push("--page", String(Number(pageIndex)));
      }
      if (searchText) {
        args.push("--search", String(searchText));
      }
      const proc = spawn(pythonBin, args, { stdio: ["ignore", "pipe", "pipe"] });
      let stdout = "";
      let stderr = "";
      proc.stdout.on("data", (chunk) => {
        stdout += chunk.toString();
      });
      proc.stderr.on("data", (chunk) => {
        stderr += chunk.toString();
      });
      proc.on("error", reject);
      proc.on("close", (code) => {
        if (code !== 0) {
          reject(new Error(stderr || stdout || "Glyph list failed."));
          return;
        }
        resolve(stdout);
      });
    });

    const info = JSON.parse(String(result || "{}"));
    if (!info.ok) {
      throw new Error(info.error || "Glyph list failed.");
    }
    return info;
  } finally {
    await fs.promises.rm(tempDir, { recursive: true, force: true });
  }
}

app.get("/health", (_req, res) => {
  const defaultWasmPath = path.resolve("pdfium/pdfium.wasm");
  const wasmPath = process.env.PDFIUM_WASM_PATH || defaultWasmPath;
  const engine = process.env.NATIVE_EDIT_ENGINE || "glyph";
  res.json({
    ok: true,
    engine,
    overlayFallbackEnabled: process.env.NATIVE_EDIT_ALLOW_OVERLAY === "true",
    pdfium: {
      wasmPath,
      available: fs.existsSync(wasmPath),
      moduleAvailable: pdfiumAvailable,
      validationEnabled: process.env.NATIVE_EDIT_VALIDATE_PDFIUM === "true"
    }
  });
});

app.post("/native-validate", async (req, res) => {
  try {
    const { pdfBase64, pageIndex = 0, originalText } = req.body || {};
    if (!pdfBase64 || !originalText) {
      res.status(400).json({ ok: false, error: "Invalid payload" });
      return;
    }
    const bytes = Uint8Array.from(Buffer.from(pdfBase64, "base64"));
    const validation = await validateTextPresence({
      bytes,
      pageIndex: Number(pageIndex),
      originalText
    });
    if (!validation.ok) {
      res.status(422).json({ ok: false, error: validation.reason });
      return;
    }
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, error: error?.message || "Validation failed." });
  }
});

app.post("/native-extract", async (req, res) => {
  try {
    const { pdfBase64, pageIndex = 0 } = req.body || {};
    if (!pdfBase64) {
      res.status(400).json({ ok: false, error: "Invalid payload" });
      return;
    }
    const bytes = Uint8Array.from(Buffer.from(pdfBase64, "base64"));
    const result = await extractPageText({
      bytes,
      pageIndex: Number(pageIndex)
    });
    if (!result.ok) {
      res.status(500).json({ ok: false, error: result.reason });
      return;
    }
    res.json({ ok: true, text: result.text });
  } catch (error) {
    res.status(500).json({ ok: false, error: error?.message || "Extract failed." });
  }
});

app.post("/native-render", async (req, res) => {
  try {
    const { pdfBase64, pageIndex = 0, scale = 2 } = req.body || {};
    if (!pdfBase64) {
      res.status(400).json({ ok: false, error: "Invalid payload" });
      return;
    }
    const bytes = Uint8Array.from(Buffer.from(pdfBase64, "base64"));
    const result = await renderPagePng({
      bytes,
      pageIndex: Number(pageIndex),
      scale: Number(scale) || 2
    });
    if (!result.ok) {
      res.status(500).json({ ok: false, error: result.reason });
      return;
    }
    res.json({
      ok: true,
      pngBase64: result.buffer.toString("base64"),
      width: result.width,
      height: result.height
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error?.message || "Render failed." });
  }
});

app.post("/native-operands", async (req, res) => {
  try {
    const { pdfBase64, pageIndex, searchText, limit } = req.body || {};
    if (!pdfBase64) {
      res.status(400).json({ ok: false, error: "Invalid payload" });
      return;
    }
    const bytes = Uint8Array.from(Buffer.from(pdfBase64, "base64"));
    const result = await runGlyphList({
      bytes,
      pageIndex: typeof pageIndex === "number" ? Number(pageIndex) : undefined,
      searchText,
      limit
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ ok: false, error: error?.message || "Operand list failed." });
  }
});

app.post("/native-edit", async (req, res) => {
  try {
    const {
      pdfBase64,
      engine,
      pageIndex = 0,
      bbox,
      originalText,
      operandIndex,
      newText,
      fontName,
      fontSize,
      color
    } = req.body || {};

    const bytes = Uint8Array.from(Buffer.from(pdfBase64, "base64"));
    const activeEngine = engine || process.env.NATIVE_EDIT_ENGINE || "glyph";
    const hasOperandIndex = typeof operandIndex === "number" && Number.isFinite(operandIndex);
    if (!pdfBase64 || !newText || (!originalText && !hasOperandIndex) || (activeEngine !== "glyph" && !bbox)) {
      res.status(400).json({ ok: false, error: "Invalid payload" });
      return;
    }
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
    if (activeEngine === "glyph") {
      const result = await runGlyphEdit({
        bytes,
        pageIndex: Number(pageIndex),
        originalText,
        operandIndex: hasOperandIndex ? Number(operandIndex) : undefined,
        newText,
        match: "exact"
      });
      res.json({
        ok: true,
        bytesBase64: Buffer.from(result.bytes).toString("base64"),
        warnings: [],
        mode: result.meta.mode || "native-direct",
        capability: result.meta.capability || "native-direct",
        meta: result.meta
      });
      return;
    }

    if (process.env.NATIVE_EDIT_ALLOW_OVERLAY !== "true") {
      res.status(422).json({
        ok: false,
        capability: "overlay-only",
        error: "This edit path is visual overlay fallback and is disabled unless explicitly enabled."
      });
      return;
    }

    if (activeEngine === "pdfium") {
      const outBytes = await runPdfiumEdit({
        bytes,
        pageIndex: Number(pageIndex),
        bbox,
        newText,
        fontName,
        fontSize,
        color
      });
      res.json({ ok: true, bytesBase64: Buffer.from(outBytes).toString("base64"), mode: "overlay-only", capability: "overlay-only", warnings: ["Visual overlay fallback; original text was not natively replaced."] });
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
    res.json({ ok: true, bytesBase64: Buffer.from(data).toString("base64"), mode: "overlay-only", capability: "overlay-only", warnings: ["Visual overlay fallback; original text was not natively replaced."] });
  } catch (error) {
    res.status(500).json({ ok: false, error: error?.message || "Native edit failed" });
  }
});

const port = process.env.PORT || 8787;
const host = process.env.HOST || "0.0.0.0";
app.listen(port, host, () => {
  console.log(`Native edit service listening on ${host}:${port}`);
});
