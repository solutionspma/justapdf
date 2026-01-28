import { Pdfcpu } from "https://cdn.jsdelivr.net/npm/pdfcpu-wasm@0.1.0/index.js";

const cpu = new Pdfcpu("https://cdn.jsdelivr.net/npm/pdfcpu-wasm@0.1.0/pdfcpu.wasm");

function sanitizeName(name, fallback) {
  const safe = (name || fallback || "input.pdf").replace(/[^a-zA-Z0-9._-]/g, "_");
  return safe.toLowerCase().endsWith(".pdf") ? safe : `${safe}.pdf`;
}

function buildArgs(op, inputFiles, payload) {
  const outputName = payload.outputName || payload.output || "output.pdf";
  switch (op) {
    case "merge": {
      return {
        outputName,
        args: ["merge", `/output/${outputName}`, ...inputFiles.map((file) => `/input/${file.name}`)]
      };
    }
    case "split": {
      const span = payload.span ? String(payload.span) : null;
      return {
        outputName: null,
        args: ["split", `/input/${inputFiles[0].name}`, "/output", ...(span ? [span] : [])]
      };
    }
    case "rotate": {
      const deg = payload.deg || payload.rotation;
      if (!deg) return null;
      const pages = payload.pages ? ["-pages", payload.pages] : [];
      return {
        outputName,
        args: ["rotate", ...pages, `/input/${inputFiles[0].name}`, String(deg), `/output/${outputName}`]
      };
    }
    case "removePages": {
      if (!payload.pages) return null;
      return {
        outputName,
        args: ["pages", "remove", "-pages", payload.pages, `/input/${inputFiles[0].name}`, `/output/${outputName}`]
      };
    }
    case "reorder": {
      if (!payload.order) return null;
      return {
        outputName,
        args: ["collect", "-pages", payload.order, `/input/${inputFiles[0].name}`, `/output/${outputName}`]
      };
    }
    case "watermarkText": {
      if (!payload.text) return null;
      const position = payload.position || "c";
      const opacity = payload.opacity != null ? `op:${payload.opacity}` : "";
      const rotation = payload.rotation != null ? `rot:${payload.rotation}` : "";
      const description = [`pos:${position}`, opacity, rotation].filter(Boolean).join(", ");
      return {
        outputName,
        args: [
          "watermark",
          "add",
          "-mode",
          "text",
          "--",
          payload.text,
          description,
          `/input/${inputFiles[0].name}`,
          `/output/${outputName}`
        ]
      };
    }
    case "watermarkImage": {
      const imageFile = inputFiles[1];
      if (!imageFile) return null;
      const position = payload.position || "c";
      const opacity = payload.opacity != null ? `op:${payload.opacity}` : "";
      const rotation = payload.rotation != null ? `rot:${payload.rotation}` : "";
      const description = [`pos:${position}`, opacity, rotation].filter(Boolean).join(", ");
      return {
        outputName,
        args: [
          "watermark",
          "add",
          "-mode",
          "image",
          "--",
          `/input/${imageFile.name}`,
          description,
          `/input/${inputFiles[0].name}`,
          `/output/${outputName}`
        ]
      };
    }
    case "readMeta": {
      return {
        outputName: "metadata.txt",
        contentType: "text/plain",
        args: ["properties", "list", `/input/${inputFiles[0].name}`, "/output/metadata.txt"]
      };
    }
    case "writeMeta": {
      if (!payload.kv) return null;
      return {
        outputName,
        args: ["properties", "add", payload.kv, `/input/${inputFiles[0].name}`, `/output/${outputName}`]
      };
    }
    case "removeMeta": {
      const keys = payload.keys || "all";
      return {
        outputName,
        args: ["properties", "remove", keys, `/input/${inputFiles[0].name}`, `/output/${outputName}`]
      };
    }
    case "encrypt": {
      if (!payload.userPw || !payload.ownerPw) return null;
      return {
        outputName,
        args: [
          "encrypt",
          "-upw",
          payload.userPw,
          "-opw",
          payload.ownerPw,
          `/input/${inputFiles[0].name}`,
          `/output/${outputName}`
        ]
      };
    }
    case "decrypt": {
      if (!payload.userPw) return null;
      return {
        outputName,
        args: ["decrypt", "-upw", payload.userPw, `/input/${inputFiles[0].name}`, `/output/${outputName}`]
      };
    }
    case "setPermissions": {
      if (!payload.perms) return null;
      return {
        outputName,
        args: [
          "permissions",
          "set",
          payload.perms,
          `/input/${inputFiles[0].name}`,
          `/output/${outputName}`
        ]
      };
    }
    case "repair": {
      return {
        outputName,
        args: ["repair", `/input/${inputFiles[0].name}`, `/output/${outputName}`]
      };
    }
    case "flatten": {
      return {
        outputName,
        args: ["flatten", `/input/${inputFiles[0].name}`, `/output/${outputName}`]
      };
    }
    case "normalizeStrict": {
      return {
        outputName,
        args: ["normalize", "-strict", `/input/${inputFiles[0].name}`, `/output/${outputName}`]
      };
    }
    case "linearize": {
      return {
        outputName,
        args: ["linearize", `/input/${inputFiles[0].name}`, `/output/${outputName}`]
      };
    }
    case "grayscale": {
      return {
        outputName,
        args: ["colorspace", "gray", `/input/${inputFiles[0].name}`, `/output/${outputName}`]
      };
    }
    case "convertColor": {
      return {
        outputName,
        args: ["colorspace", "cmyk", `/input/${inputFiles[0].name}`, `/output/${outputName}`]
      };
    }
    case "redactFull": {
      return {
        outputName,
        args: ["redact", "-mode", "full", `/input/${inputFiles[0].name}`, `/output/${outputName}`]
      };
    }
    case "unredactLegal": {
      return {
        outputName,
        args: ["recover", "redactions", `/input/${inputFiles[0].name}`, `/output/${outputName}`]
      };
    }
    case "optimize": {
      return {
        outputName,
        args: ["optimize", `/input/${inputFiles[0].name}`, `/output/${outputName}`]
      };
    }
    case "optimizeStrong": {
      return {
        outputName,
        args: ["optimize", "-mode", "strong", `/input/${inputFiles[0].name}`, `/output/${outputName}`]
      };
    }
    case "optimizeWeb": {
      return {
        outputName,
        args: ["optimize", "-mode", "web", `/input/${inputFiles[0].name}`, `/output/${outputName}`]
      };
    }
    case "normalize": {
      return {
        outputName,
        args: ["normalize", `/input/${inputFiles[0].name}`, `/output/${outputName}`]
      };
    }
    default:
      return null;
  }
}

async function readOutputs(handle) {
  const directory = handle?.dir;
  const entries = directory?.contents ? Array.from(directory.contents.keys()) : [];
  const outputFiles = [];

  for (const name of entries) {
    const file = await handle.readFile(`/output/${name}`, "application/pdf");
    if (!file) continue;
    const data = await file.arrayBuffer();
    outputFiles.push({ name: file.name || name, type: file.type, data });
  }
  return outputFiles;
}

self.onmessage = async (event) => {
  const { op, payload = {} } = event.data || {};
  try {
    const files = payload.files || [];
    if (!files.length) {
      throw new Error("No input files provided.");
    }
    if (op === "unredact") {
      throw new Error("Unsupported op");
    }

    const inputFiles = files.map((file, index) => {
      const name = sanitizeName(file.name, `input-${index + 1}.pdf`);
      return new File([file.data], name, { type: file.type || "application/pdf" });
    });

    const config = buildArgs(op, inputFiles, payload);
    if (!config) {
      throw new Error("Unsupported operation");
    }

    const handle = await cpu.run(config.args, inputFiles);
    if (!config.outputName) {
      const outputs = await readOutputs(handle);
      if (!outputs.length) {
        throw new Error("No output produced.");
      }
      const transfer = outputs.map((item) => item.data);
      self.postMessage({ result: { files: outputs } }, transfer);
      return;
    }

    const outFile = await handle.readFile(
      `/output/${config.outputName}`,
      config.contentType || "application/pdf"
    );
    if (!outFile) {
      throw new Error("No output produced.");
    }
    const data = await outFile.arrayBuffer();
    self.postMessage(
      { result: { name: outFile.name || config.outputName, type: outFile.type, data } },
      [data]
    );
  } catch (error) {
    self.postMessage({ error: error?.message || "pdfcpu failed" });
  }
};
