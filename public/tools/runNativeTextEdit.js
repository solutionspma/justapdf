export function runNativeTextEdit(payload) {
  return new Promise((resolve) => {
    const worker = new Worker("/tools/workers/nativeTextEdit.worker.js", { type: "module" });
    worker.onmessage = (event) => {
      const data = event.data || {};
      worker.terminate();
      resolve(data);
    };
    worker.onerror = (error) => {
      worker.terminate();
      resolve({ ok: false, reason: error?.message || "Native edit failed." });
    };
    const bytes =
      payload?.bytes instanceof Uint8Array
        ? payload.bytes.buffer.slice(0)
        : payload?.bytes instanceof ArrayBuffer
          ? payload.bytes.slice(0)
          : null;
    worker.postMessage({ ...payload, bytes }, bytes ? [bytes] : []);
  });
}
