export function runTextRewrite(payload) {
  return new Promise((resolve) => {
    const worker = new Worker("/tools/workers/textRewrite.worker.js", { type: "module" });
    worker.onmessage = (event) => {
      const data = event.data || {};
      worker.terminate();
      resolve(data);
    };
    worker.onerror = (error) => {
      worker.terminate();
      resolve({ ok: false, reason: error?.message || "Text rewrite failed." });
    };
    worker.postMessage(payload);
  });
}
