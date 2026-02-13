import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

export async function generateTestPDF(): Promise<string> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([612, 792])
  const { width, height } = page.getSize()
  
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  
  const testPositions = [
    { text: 'Top Left Corner (50, 50)', x: 50, y: height - 50, size: 12, font: font },
    { text: 'Top Right Corner (450, 50)', x: 450, y: height - 50, size: 12, font: font },
    { text: 'Center (250, 396)', x: 250, y: height - 396, size: 14, font: boldFont },
    { text: 'Bottom Left (50, 750)', x: 50, y: height - 750, size: 12, font: font },
    { text: 'Bottom Right (450, 750)', x: 450, y: height - 750, size: 12, font: font },
    
    { text: 'Line 1: This text should align perfectly', x: 100, y: height - 150, size: 16, font: boldFont },
    { text: 'Line 2: after extraction from PDF', x: 100, y: height - 180, size: 14, font: font },
    { text: 'Line 3: with exact positioning', x: 100, y: height - 210, size: 14, font: font },
    
    { text: 'Small Text (8pt)', x: 200, y: height - 300, size: 8, font: font },
    { text: 'Medium Text (12pt)', x: 200, y: height - 330, size: 12, font: font },
    { text: 'Large Text (18pt)', x: 200, y: height - 370, size: 18, font: boldFont },
    { text: 'Extra Large (24pt)', x: 200, y: height - 410, size: 24, font: boldFont },
  ]
  
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    borderColor: rgb(0.8, 0.8, 0.8),
    borderWidth: 1,
  })
  
  testPositions.forEach(({ text, x, y, size, font: textFont }) => {
    page.drawText(text, {
      x,
      y,
      size,
      font: textFont,
      color: rgb(0, 0, 0),
    })
  })
  
  page.drawLine({
    start: { x: 0, y: height / 2 },
    end: { x: width, y: height / 2 },
    thickness: 0.5,
    color: rgb(0.9, 0.9, 0.9),
    dashArray: [5, 5],
  })
  
  page.drawLine({
    start: { x: width / 2, y: 0 },
    end: { x: width / 2, y: height },
    thickness: 0.5,
    color: rgb(0.9, 0.9, 0.9),
    dashArray: [5, 5],
  })
  
  const pdfBytes = await pdfDoc.save()
  const arrayBuffer = pdfBytes.buffer as ArrayBuffer
  const blob = new Blob([arrayBuffer], { type: 'application/pdf' })
  return URL.createObjectURL(blob)
}
