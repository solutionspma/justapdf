import fs from 'node:fs/promises'
import path from 'node:path'
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib'

const root = path.resolve(new URL('.', import.meta.url).pathname, 'fixtures')
await fs.mkdir(root, { recursive: true })

const write = async (name, doc) => {
  const bytes = await doc.save({ useObjectStreams: false })
  await fs.writeFile(path.join(root, name), bytes)
}

const makeDoc = async (size = [612, 792]) => {
  const doc = await PDFDocument.create()
  const page = doc.addPage(size)
  return { doc, page }
}

const standardFonts = async (doc) => ({
  regular: await doc.embedFont(StandardFonts.Helvetica),
  bold: await doc.embedFont(StandardFonts.HelveticaBold),
  italic: await doc.embedFont(StandardFonts.HelveticaOblique),
  times: await doc.embedFont(StandardFonts.TimesRoman),
  courier: await doc.embedFont(StandardFonts.Courier)
})

const drawFixtureText = (page, fonts, label = 'JustaPDF native editing fixture') => {
  page.drawText(label, { x: 60, y: 700, size: 18, font: fonts.bold, color: rgb(0.05, 0.12, 0.25) })
  page.drawText('John Smith', { x: 60, y: 650, size: 14, font: fonts.regular })
  page.drawText('The quick brown fox jumps over the lazy dog.', { x: 60, y: 610, size: 12, font: fonts.times })
}

// 01–08: ordinary text/layout classes.
{
  let x = await makeDoc(); const f = await standardFonts(x.doc)
  x.page.drawText('Basic paragraph: John Smith lives at 123 Main Street.', { x: 60, y: 700, size: 12, font: f.regular })
  x.page.drawText('Second line remains selectable after editing.', { x: 60, y: 680, size: 12, font: f.regular }); await write('01-simple-helvetica.pdf', x.doc)
}
{
  let x = await makeDoc(); const f = await standardFonts(x.doc)
  ;[8, 12, 18, 24].forEach((size, i) => x.page.drawText(`Size ${size} John Smith`, { x: 60, y: 700 - i * 45, size, font: f.regular })); await write('02-multiple-font-sizes.pdf', x.doc)
}
{
  let x = await makeDoc(); const f = await standardFonts(x.doc)
  ;[['Helvetica', f.regular], ['Times', f.times], ['Courier', f.courier]].forEach(([name, font], i) => x.page.drawText(`${name} John Smith`, { x: 60, y: 700 - i * 45, size: 14, font })); await write('03-multiple-fonts.pdf', x.doc)
}
{
  let x = await makeDoc(); const f = await standardFonts(x.doc)
  x.page.drawText('Bold John Smith', { x: 60, y: 700, size: 14, font: f.bold }); x.page.drawText('Italic John Smith', { x: 60, y: 660, size: 14, font: f.italic }); await write('04-bold-italic.pdf', x.doc)
}
{
  let x = await makeDoc(); const f = await standardFonts(x.doc)
  x.page.drawText('Colored John Smith', { x: 60, y: 700, size: 16, font: f.regular, color: rgb(0.8, 0.1, 0.2) }); await write('05-colored-text.pdf', x.doc)
}
{
  let x = await makeDoc(); const f = await standardFonts(x.doc)
  x.page.drawText('Rotated John Smith', { x: 180, y: 400, size: 16, font: f.regular, rotate: degrees(32) }); await write('06-rotated-text.pdf', x.doc)
}
{
  let x = await makeDoc(); const f = await standardFonts(x.doc)
  drawFixtureText(x.page, f, 'Multiple text blocks'); x.page.drawText('Independent block B', { x: 350, y: 500, size: 12, font: f.bold }); await write('07-multiple-text-blocks.pdf', x.doc)
}
{
  let x = await makeDoc(); const f = await standardFonts(x.doc)
  x.page.drawText('Multiline paragraph: John Smith\ncontinues on another line\nand preserves its separate runs.', { x: 60, y: 700, size: 13, font: f.regular, lineHeight: 18 }); await write('08-multiline-paragraph.pdf', x.doc)
}

// 09–11: pdf-lib emits Tj/TJ-style source operations; these fixtures are named
// by the source class and are inspected by the corpus runner rather than trusted
// from the filename alone.
for (const [name, label] of [['09-tj-operator.pdf', 'Tj John Smith'], ['10-tj-array.pdf', 'TJ John Smith'], ['11-positioned-glyphs.pdf', 'Positioned J o h n Smith']]) {
  const x = await makeDoc(); const f = await standardFonts(x.doc)
  x.page.drawText(label, { x: 60, y: 700, size: 14, font: f.regular }); x.page.drawText('Unrelated content', { x: 60, y: 620, size: 12, font: f.times }); await write(name, x.doc)
}

// 12–18: structural/graphics classes. Standard fonts are intentional here;
// true subset/CID/vector distinctions are marked as requiring dedicated samples
// when the generator cannot construct them without a font program.
for (const [name, label] of [
  ['12-subset-font.pdf', 'Subset-font candidate John Smith'], ['13-type0-cid.pdf', 'CID/Type0 candidate Unicode café'],
  ['16-transformed-text.pdf', 'Transformed John Smith'], ['17-clipped-text.pdf', 'Clipped John Smith'],
  ['18-page-with-images-and-text.pdf', 'Image plus John Smith']
]) {
  const x = await makeDoc(); const f = await standardFonts(x.doc)
  x.page.drawText(label, { x: 60, y: 700, size: 14, font: f.regular }); x.page.drawRectangle({ x: 45, y: 580, width: 220, height: 60, borderColor: rgb(0.1, 0.4, 0.8), borderWidth: 2 }); await write(name, x.doc)
}
{
  const x = await makeDoc(); const f = await standardFonts(x.doc)
  x.page.drawText('Form XObject source John Smith', { x: 0, y: 0, size: 14, font: f.regular })
  const target = x.doc.addPage([300, 200]); target.drawText('Nested form John Smith', { x: 20, y: 100, size: 14, font: f.regular })
  const embedded = await x.doc.embedPage(target)
  x.page.drawPage(embedded, { x: 80, y: 300, width: 300, height: 200 });
  await write('14-form-xobject-text.pdf', x.doc)
  await write('15-nested-form-xobject.pdf', x.doc)
}
{
  const x = await makeDoc(); const f = await standardFonts(x.doc)
  x.page.setRotation(degrees(90)); x.page.setCropBox(20, 20, 572, 752); x.page.drawText('Cropped rotated John Smith', { x: 60, y: 650, size: 14, font: f.regular }); await write('22-cropped-rotated-pages.pdf', x.doc)
}
{
  const x = await makeDoc(); const f = await standardFonts(x.doc)
  x.page.drawText('Annotation and form fixture John Smith', { x: 60, y: 700, size: 14, font: f.regular }); const form = x.doc.getForm(); const field = form.createTextField('name'); field.setText('John Smith'); field.addToPage(x.page, { x: 60, y: 580, width: 200, height: 24 }); await write('19-annotations.pdf', x.doc); await write('20-acroform.pdf', x.doc)
}
{
  const doc = await PDFDocument.create(); const f = await standardFonts(doc); for (let i = 1; i <= 3; i++) { const p = doc.addPage(); p.drawText(`Page ${i}: John Smith`, { x: 60, y: 700, size: 14, font: f.regular }) } await write('21-multipage.pdf', doc)
}
{
  const doc = await PDFDocument.create(); const f = await standardFonts(doc); const page = doc.addPage(); page.drawText('Mixed native text John Smith', { x: 60, y: 700, size: 14, font: f.regular }); page.drawRectangle({ x: 60, y: 550, width: 180, height: 60, color: rgb(0.9, 0.9, 0.2) }); const form = doc.getForm(); const field = form.createTextField('mixed'); field.setText('editable field'); field.addToPage(page, { x: 60, y: 480, width: 180, height: 24 }); await write('26-mixed-content.pdf', doc); await write('27-repeated-form-xobject.pdf', doc)
}
{
  const x = await makeDoc(); const f = await standardFonts(x.doc)
  x.page.drawText('Unicode café naïve — John Smith', { x: 60, y: 700, size: 14, font: f.regular }); await write('28-unicode.pdf', x.doc)
}
for (const [name, text] of [['29-long-replacement.pdf', 'Short'], ['30-short-replacement.pdf', 'A very long replacement string for width testing']]) { const x = await makeDoc(); const f = await standardFonts(x.doc); x.page.drawText(text, { x: 60, y: 700, size: 14, font: f.regular }); await write(name, x.doc) }
{
  const doc = await PDFDocument.create(); const page = doc.addPage(); const png = Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScfWbQAAAABJRU5ErkJggg==', 'base64')); const image = await doc.embedPng(png); page.drawImage(image, { x: 60, y: 600, width: 420, height: 120 }); await write('23-scanned-image-only.pdf', doc)
}
{
  const doc = await PDFDocument.create(); const page = doc.addPage(); const png = Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScfWbQAAAABJRU5ErkJggg==', 'base64')); const image = await doc.embedPng(png); page.drawImage(image, { x: 60, y: 600, width: 420, height: 120 }); const f = await doc.embedFont(StandardFonts.Helvetica); page.drawText('OCR layer: John Smith', { x: 60, y: 650, size: 14, font: f, opacity: 0.01 }); await write('24-ocr-layer.pdf', doc)
}
{
  const doc = await PDFDocument.create(); const page = doc.addPage(); page.drawRectangle({ x: 60, y: 600, width: 18, height: 24, borderWidth: 2 }); page.drawRectangle({ x: 84, y: 600, width: 18, height: 24, borderWidth: 2 }); page.drawLine({ start: { x: 60, y: 590 }, end: { x: 150, y: 590 }, thickness: 2 }); await write('25-vector-outline-text.pdf', doc)
}
{
  const doc = await PDFDocument.create(); const p = doc.addPage(); const f = await doc.embedFont(StandardFonts.Helvetica); p.drawText('Created from scratch: John Smith', { x: 60, y: 700, size: 14, font: f }); await write('31-create-from-scratch.pdf', doc)
}

const manifest = {
  generatedBy: 'tests/pdf-torture/generate.mjs',
  note: 'Fixtures are adversarial inputs; capability labels come from inspection, never filenames.',
  fixtures: (await fs.readdir(root)).filter((name) => name.endsWith('.pdf')).sort()
}
await fs.writeFile(path.join(root, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n')
console.log(`Generated ${manifest.fixtures.length} PDF fixtures in ${root}`)
