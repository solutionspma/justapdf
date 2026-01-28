import { TOOLS } from "./registry.js";

function consumeCredits(cost, payload) {
  const balance = Number(payload?.credits);
  if (!Number.isFinite(balance)) {
    return;
  }
  if (balance < cost) {
    throw new Error("Insufficient credits");
  }
  payload.credits = balance - cost;
}

function checkGating(tool, toolId, payload) {
  if (!tool.gated) return;
  const addons = payload?.addons || [];
  if (!addons.includes(tool.op) && !addons.includes(toolId)) {
    throw new Error("Upgrade required");
  }
}

function checkAttestation(tool, payload) {
  if (!tool.requiresAttestation) return;
  if (payload?.attest !== true) {
    throw new Error("Legal attestation required");
  }
}

function logUsage(toolId, cost) {
  console.table({
    tool: toolId,
    credits: cost,
    time: Date.now()
  });
}

function normalizePayload(payload) {
  const files = Array.isArray(payload.files) ? [...payload.files] : [];
  if (payload.input instanceof File) {
    files.unshift(payload.input);
  }
  if (payload.image instanceof File) {
    files.push(payload.image);
  }
  const cloned = { ...payload, files };
  if (payload.bytes instanceof ArrayBuffer) {
    cloned.bytes = payload.bytes.slice(0);
  }
  if (payload.bytes instanceof Uint8Array) {
    cloned.bytes = payload.bytes.slice().buffer;
  }
  return cloned;
}

export function runTool(toolId, payload = {}) {
  const tool = TOOLS[toolId];
  if (!tool || tool.disabled) {
    throw new Error("Tool not found");
  }
  const normalizedPayload = normalizePayload(payload);
  checkGating(tool, toolId, normalizedPayload);
  checkAttestation(tool, normalizedPayload);
  consumeCredits(tool.cost, normalizedPayload);

  return new Promise((resolve, reject) => {
    const worker = new Worker("/tools/workers/pdfcpu.worker.js", { type: "module" });
    worker.onmessage = (event) => {
      const data = event.data || {};
      if (data.error) {
        worker.terminate();
        reject(new Error(data.error));
        return;
      }
      worker.terminate();
      logUsage(toolId, tool.cost);
      resolve(data.result);
    };
    worker.onerror = (error) => {
      worker.terminate();
      reject(error);
    };
    worker.postMessage({ op: tool.op, payload: normalizedPayload });
  });
}
