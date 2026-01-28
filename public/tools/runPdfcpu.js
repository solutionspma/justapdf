export async function runPdfcpu(action, payload = {}) {
  const files = payload.files || [];
  const transferFiles = await Promise.all(
    files.map(async (file, index) => ({
      name: file.name || `input-${index + 1}.pdf`,
      type: file.type || "application/pdf",
      data: await file.arrayBuffer()
    }))
  );

  return new Promise((resolve, reject) => {
    const worker = new Worker("/tools/workers/pdfcpu.worker.js", { type: "module" });
    worker.onmessage = (event) => {
      const data = event.data || {};
      if (!data.ok) {
        worker.terminate();
        reject(new Error(data.error || "pdfcpu error"));
        return;
      }
      const result = data.result || {};
      const file = new File([result.data], result.name || "output.pdf", {
        type: result.type || "application/pdf"
      });
      worker.terminate();
      resolve({ file });
    };
    worker.onerror = (error) => {
      worker.terminate();
      reject(error);
    };
    worker.postMessage({ action, files: transferFiles }, transferFiles.map((item) => item.data));
  });
}
