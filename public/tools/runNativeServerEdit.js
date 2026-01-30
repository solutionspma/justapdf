import { apiConfig } from "/src/config.js";

function toBase64(bytes) {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const chunkSize = 0x8000;
  let binary = '';
  for (let i = 0; i < view.length; i += chunkSize) {
    binary += String.fromCharCode(...view.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function fromBase64(base64) {
  if (!base64) {
    return new Uint8Array();
  }
  const binary = atob(base64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    out[i] = binary.charCodeAt(i);
  }
  return out;
}

export async function runNativeServerEdit(payload) {
  const endpoint = apiConfig.nativeEditUrl
    ? `${apiConfig.nativeEditUrl}/native-edit`
    : '/api/native-edit';
  const pdfBytes = payload?.bytes instanceof Uint8Array
    ? payload.bytes
    : payload?.bytes instanceof ArrayBuffer
      ? new Uint8Array(payload.bytes)
      : null;
  if (!pdfBytes) {
    throw new Error("Missing PDF bytes.");
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      pdfBase64: toBase64(pdfBytes),
      engine: payload.engine || apiConfig.nativeEditEngine || "rewrite",
      pageIndex: payload.pageIndex ?? 0,
      bbox: payload.bbox,
      originalText: payload.originalText,
      newText: payload.newText,
      fontName: payload.fontName,
      fontSize: payload.size,
      color: payload.color
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.ok) {
    throw new Error(data.error || "Native edit failed.");
  }
  return fromBase64(data.bytesBase64 || "");
}
