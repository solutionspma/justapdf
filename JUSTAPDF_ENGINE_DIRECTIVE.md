# JustaPDF PDF engine directive

The editor must treat a PDF as a structured object graph, not as a Word document or a screenshot.

## Editing modes

1. Native direct editing mutates the traced source `Tj`, `TJ`, `'`, or `"` operation in its page/content stream while retaining surrounding operators and resources.
2. Native reconstruction removes only the traced text-showing operation and inserts a replacement using a compatible existing or embedded font/resource.
3. Overlay editing is a labeled compatibility fallback only. It must never be reported as native editing and must never be the default native engine.
4. Scanned pages are image-only and require an explicitly requested OCR operation.

## Source mapping

Selection data must map to page, content stream or Form XObject, operator index/range, text object state, font resource, encoded string/TJ array, and coordinates. pdf.js rendering text items are useful for hit testing but are not authoritative source identity.

## Font and stream requirements

Handle literal and hexadecimal strings, Flate streams, multiple page content streams, text matrices, CTMs, spacing/rise/rendering state, simple and composite fonts, CMaps, ToUnicode maps, subset fonts, Form XObjects, and incremental-update PDFs conservatively. If glyph encoding or source identity cannot be established, return a structured unsupported capability instead of changing the wrong object.

## Credit rules

Preview, open, upload, and download are free. A paid credit is reserved for an actual successful PDF operation. Failed operations must be refunded in the same database transaction.

## Current known limitations

The current operand editor is suitable for direct edits where a decoded source string is unambiguous. Composite-font decoding, precise width compensation, native reconstruction with embedded replacement fonts, nested Form XObject selection mapping, OCR, signed-PDF refusal, and broad fixture coverage require explicit validation before being advertised as complete.
