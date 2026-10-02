function toBase64(bytes: Uint8Array): string {
  let binary = ''
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
  }
  return btoa(binary)
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return bytes
}

export async function runNativeServerEdit(payload: {
  bytes: Uint8Array
  pageIndex: number
  originalText: string
  newText: string
}): Promise<Uint8Array> {
  const response = await fetch('/api/native-edit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      pdfBase64: toBase64(payload.bytes),
      engine: 'glyph',
      pageIndex: payload.pageIndex,
      originalText: payload.originalText,
      newText: payload.newText
    })
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok || !data.ok) throw new Error(data.error || 'The PDF source could not be safely edited.')
  return fromBase64(data.bytesBase64 || '')
}
