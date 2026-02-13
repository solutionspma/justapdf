import { PDFDocument as PDFLibDocument, rgb, degrees, PDFFont, StandardFonts, PDFPage as PDFLibPage } from 'pdf-lib'
import type { PDFDocument, PDFElement, FormElement, ExportSettings, WatermarkSettings, StampSettings } from './types'

export async function exportPDF(document: PDFDocument, settings?: ExportSettings): Promise<Blob> {
  if (!document.originalFile) {
    throw new Error('No original PDF file found')
  }

  let arrayBuffer: ArrayBuffer
  
  if (typeof document.originalFile === 'string') {
    const response = await fetch(document.originalFile)
    arrayBuffer = await response.arrayBuffer()
  } else {
    arrayBuffer = await document.originalFile.arrayBuffer()
  }
  
  const pdfDoc = await PDFLibDocument.load(arrayBuffer)
  
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const courierFont = await pdfDoc.embedFont(StandardFonts.Courier)
  const timesFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)
  const timesBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)
  
  const pages = pdfDoc.getPages()

  for (let i = 0; i < document.pages.length; i++) {
    const page = document.pages[i]
    const pdfPage = pages[i]
    
    if (!pdfPage) continue

    const { height: pageHeight } = pdfPage.getSize()

    if (page.rotation !== 0) {
      pdfPage.setRotation(degrees(page.rotation))
    }

    const sortedElements = [...page.elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))

    for (const element of sortedElements) {
      const y = pageHeight - element.y - element.height

      if (element.type === 'text') {
        try {
          const hexColor = element.data.color?.replace('#', '') || '000000'
          const r = parseInt(hexColor.slice(0, 2), 16) / 255
          const g = parseInt(hexColor.slice(2, 4), 16) / 255
          const b = parseInt(hexColor.slice(4, 6), 16) / 255

          let font: PDFFont = helveticaFont
          const fontFamily = element.data.fontFamily?.toLowerCase() || 'helvetica'
          
          if (fontFamily.includes('courier') || fontFamily.includes('mono')) {
            font = courierFont
          } else if (fontFamily.includes('times')) {
            font = element.data.bold ? timesBoldFont : timesFont
          } else {
            font = element.data.bold ? helveticaBoldFont : helveticaFont
          }

          const content = element.data.content || ''
          const lines = content.split('\n')
          const lineHeight = element.data.fontSize * 1.2

          lines.forEach((line, index) => {
            if (line.trim()) {
              pdfPage.drawText(line, {
                x: element.x,
                y: y - (index * lineHeight),
                size: element.data.fontSize || 12,
                font,
                color: rgb(r, g, b),
                rotate: degrees(element.rotation || 0)
              })
            }
          })
        } catch (error) {
          console.error('Failed to draw text element:', error)
        }
      } else if (element.type === 'image' || element.type === 'signature') {
        try {
          const imageData = element.data.src
          if (!imageData) continue
          
          let embeddedImage

          if (imageData.startsWith('data:image/png')) {
            const base64Data = imageData.split(',')[1]
            const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))
            embeddedImage = await pdfDoc.embedPng(imageBytes)
          } else if (imageData.startsWith('data:image/jpeg') || imageData.startsWith('data:image/jpg')) {
            const base64Data = imageData.split(',')[1]
            const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))
            embeddedImage = await pdfDoc.embedJpg(imageBytes)
          }

          if (embeddedImage) {
            pdfPage.drawImage(embeddedImage, {
              x: element.x,
              y,
              width: element.width,
              height: element.height,
              rotate: degrees(element.rotation || 0),
              opacity: element.type === 'image' ? (element.data.opacity || 1) : 1
            })
          }
        } catch (error) {
          console.error('Failed to embed image:', error)
        }
      } else if (element.type === 'form') {
        try {
          const formElement = element as FormElement
          const fieldType = formElement.data.fieldType

          if (fieldType === 'checkbox') {
            const size = Math.min(element.width, element.height)
            pdfPage.drawRectangle({
              x: element.x,
              y,
              width: size,
              height: size,
              borderColor: rgb(0, 0, 0),
              borderWidth: 1.5
            })

            if (formElement.data.value) {
              pdfPage.drawText('✓', {
                x: element.x + 2,
                y: y + 2,
                size: size * 0.7,
                font: helveticaBoldFont,
                color: rgb(0, 0, 0)
              })
            }
          } else if (fieldType === 'text') {
            pdfPage.drawRectangle({
              x: element.x,
              y,
              width: element.width,
              height: element.height,
              borderColor: rgb(0.7, 0.7, 0.7),
              borderWidth: 1
            })

            if (formElement.data.value && typeof formElement.data.value === 'string') {
              pdfPage.drawText(formElement.data.value, {
                x: element.x + 4,
                y: y + element.height / 2 - 4,
                size: 12,
                font: helveticaFont,
                color: rgb(0, 0, 0)
              })
            }
          } else if (fieldType === 'radio') {
            const radius = Math.min(element.width, element.height) / 2
            const centerX = element.x + radius
            const centerY = y + radius

            pdfPage.drawCircle({
              x: centerX,
              y: centerY,
              size: radius,
              borderColor: rgb(0, 0, 0),
              borderWidth: 1.5
            })

            if (formElement.data.value) {
              pdfPage.drawCircle({
                x: centerX,
                y: centerY,
                size: radius * 0.5,
                color: rgb(0, 0, 0)
              })
            }
          }
        } catch (error) {
          console.error('Failed to draw form element:', error)
        }
      }

      drawAnnotations(element, pdfPage, y, helveticaFont, helveticaBoldFont)
    }

    if (settings?.watermark?.enabled) {
      applyWatermark(pdfPage, settings.watermark, pageHeight)
    }

    if (settings?.stamp?.enabled) {
      const shouldApplyStamp = shouldApplyStampToPage(settings.stamp, i, document.pages.length)
      if (shouldApplyStamp) {
        applyStamp(pdfPage, settings.stamp, pageHeight, helveticaBoldFont)
      }
    }
  }

  const pdfBytes = await pdfDoc.save()
  return new Blob([pdfBytes as BlobPart], { type: 'application/pdf' })
}

function shouldApplyStampToPage(stamp: StampSettings, pageIndex: number, totalPages: number): boolean {
  if (stamp.pages === 'all') return true
  if (stamp.pages === 'first') return pageIndex === 0
  if (stamp.pages === 'last') return pageIndex === totalPages - 1
  if (Array.isArray(stamp.pages)) return stamp.pages.includes(pageIndex)
  return false
}

function applyWatermark(page: PDFLibPage, watermark: WatermarkSettings, pageHeight: number) {
  const { width: pageWidth, height } = page.getSize()
  const fontSize = watermark.fontSize || 48
  const color = parseColor(watermark.color || '#000000')
  const opacity = watermark.opacity || 0.3

  let x = 0
  let y = 0
  let rotation = watermark.rotation || 0

  switch (watermark.position) {
    case 'center':
      x = pageWidth / 2
      y = height / 2
      break
    case 'diagonal':
      x = pageWidth / 2
      y = height / 2
      rotation = -45
      break
    case 'top-left':
      x = 50
      y = height - 50
      break
    case 'top-right':
      x = pageWidth - 50
      y = height - 50
      break
    case 'bottom-left':
      x = 50
      y = 50
      break
    case 'bottom-right':
      x = pageWidth - 50
      y = 50
      break
  }

  page.drawText(watermark.text, {
    x,
    y,
    size: fontSize,
    color: rgb(color.r, color.g, color.b),
    opacity,
    rotate: degrees(rotation)
  })
}

function applyStamp(page: PDFLibPage, stamp: StampSettings, pageHeight: number, font: PDFFont) {
  const { width: pageWidth, height } = page.getSize()
  const stampText = stamp.type === 'custom' ? (stamp.customText || 'STAMP') : stamp.type.toUpperCase()
  const color = parseColor(stamp.color || '#FF0000')
  
  const stampWidth = 120
  const stampHeight = 40
  const padding = 20

  let x = 0
  let y = 0

  switch (stamp.position) {
    case 'top-left':
      x = padding
      y = height - padding - stampHeight
      break
    case 'top-right':
      x = pageWidth - padding - stampWidth
      y = height - padding - stampHeight
      break
    case 'bottom-left':
      x = padding
      y = padding
      break
    case 'bottom-right':
      x = pageWidth - padding - stampWidth
      y = padding
      break
  }

  page.drawRectangle({
    x,
    y,
    width: stampWidth,
    height: stampHeight,
    borderColor: rgb(color.r, color.g, color.b),
    borderWidth: 3,
    rotate: degrees(-15)
  })

  page.drawText(stampText, {
    x: x + 10,
    y: y + stampHeight / 2 - 5,
    size: 16,
    font,
    color: rgb(color.r, color.g, color.b),
    rotate: degrees(-15)
  })
}

function parseColor(hexColor: string): { r: number; g: number; b: number } {
  const hex = hexColor.replace('#', '')
  return {
    r: parseInt(hex.slice(0, 2), 16) / 255,
    g: parseInt(hex.slice(2, 4), 16) / 255,
    b: parseInt(hex.slice(4, 6), 16) / 255
  }
}

export async function exportSinglePage(document: PDFDocument, pageIndex: number, settings?: ExportSettings): Promise<Blob> {
  if (!document.originalFile) {
    throw new Error('No original PDF file found')
  }

  let arrayBuffer: ArrayBuffer
  
  if (typeof document.originalFile === 'string') {
    const response = await fetch(document.originalFile)
    arrayBuffer = await response.arrayBuffer()
  } else {
    arrayBuffer = await document.originalFile.arrayBuffer()
  }
  
  const sourcePdfDoc = await PDFLibDocument.load(arrayBuffer)
  const newPdfDoc = await PDFLibDocument.create()
  
  const helveticaFont = await newPdfDoc.embedFont(StandardFonts.Helvetica)
  const helveticaBoldFont = await newPdfDoc.embedFont(StandardFonts.HelveticaBold)
  const courierFont = await newPdfDoc.embedFont(StandardFonts.Courier)
  const timesFont = await newPdfDoc.embedFont(StandardFonts.TimesRoman)
  const timesBoldFont = await newPdfDoc.embedFont(StandardFonts.TimesRomanBold)
  
  const [copiedPage] = await newPdfDoc.copyPages(sourcePdfDoc, [pageIndex])
  newPdfDoc.addPage(copiedPage)
  
  const page = document.pages[pageIndex]
  const pdfPage = newPdfDoc.getPages()[0]
  
  if (!pdfPage) {
    throw new Error('Failed to create page')
  }

  const { height: pageHeight } = pdfPage.getSize()

  if (page.rotation !== 0) {
    pdfPage.setRotation(degrees(page.rotation))
  }

  const sortedElements = [...page.elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))

  for (const element of sortedElements) {
    const y = pageHeight - element.y - element.height

    if (element.type === 'text') {
      try {
        const hexColor = element.data.color?.replace('#', '') || '000000'
        const r = parseInt(hexColor.slice(0, 2), 16) / 255
        const g = parseInt(hexColor.slice(2, 4), 16) / 255
        const b = parseInt(hexColor.slice(4, 6), 16) / 255

        let font: PDFFont = helveticaFont
        const fontFamily = element.data.fontFamily?.toLowerCase() || 'helvetica'
        
        if (fontFamily.includes('courier') || fontFamily.includes('mono')) {
          font = courierFont
        } else if (fontFamily.includes('times')) {
          font = element.data.bold ? timesBoldFont : timesFont
        } else {
          font = element.data.bold ? helveticaBoldFont : helveticaFont
        }

        const content = element.data.content || ''
        const lines = content.split('\n')
        const lineHeight = element.data.fontSize * 1.2

        lines.forEach((line, index) => {
          if (line.trim()) {
            pdfPage.drawText(line, {
              x: element.x,
              y: y - (index * lineHeight),
              size: element.data.fontSize || 12,
              font,
              color: rgb(r, g, b),
              rotate: degrees(element.rotation || 0)
            })
          }
        })
      } catch (error) {
        console.error('Failed to draw text element:', error)
      }
    } else if (element.type === 'image' || element.type === 'signature') {
      try {
        const imageData = element.data.src
        if (!imageData) continue
        
        let embeddedImage

        if (imageData.startsWith('data:image/png')) {
          const base64Data = imageData.split(',')[1]
          const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))
          embeddedImage = await newPdfDoc.embedPng(imageBytes)
        } else if (imageData.startsWith('data:image/jpeg') || imageData.startsWith('data:image/jpg')) {
          const base64Data = imageData.split(',')[1]
          const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))
          embeddedImage = await newPdfDoc.embedJpg(imageBytes)
        }

        if (embeddedImage) {
          pdfPage.drawImage(embeddedImage, {
            x: element.x,
            y,
            width: element.width,
            height: element.height,
            rotate: degrees(element.rotation || 0),
            opacity: element.type === 'image' ? (element.data.opacity || 1) : 1
          })
        }
      } catch (error) {
        console.error('Failed to embed image:', error)
      }
    } else if (element.type === 'form') {
      try {
        const formElement = element as FormElement
        const fieldType = formElement.data.fieldType

        if (fieldType === 'checkbox') {
          const size = Math.min(element.width, element.height)
          pdfPage.drawRectangle({
            x: element.x,
            y,
            width: size,
            height: size,
            borderColor: rgb(0, 0, 0),
            borderWidth: 1.5
          })

          if (formElement.data.value) {
            pdfPage.drawText('✓', {
              x: element.x + 2,
              y: y + 2,
              size: size * 0.7,
              font: helveticaBoldFont,
              color: rgb(0, 0, 0)
            })
          }
        } else if (fieldType === 'text') {
          pdfPage.drawRectangle({
            x: element.x,
            y,
            width: element.width,
            height: element.height,
            borderColor: rgb(0.7, 0.7, 0.7),
            borderWidth: 1
          })

          if (formElement.data.value && typeof formElement.data.value === 'string') {
            pdfPage.drawText(formElement.data.value, {
              x: element.x + 4,
              y: y + element.height / 2 - 4,
              size: 12,
              font: helveticaFont,
              color: rgb(0, 0, 0)
            })
          }
        } else if (fieldType === 'radio') {
          const radius = Math.min(element.width, element.height) / 2
          const centerX = element.x + radius
          const centerY = y + radius

          pdfPage.drawCircle({
            x: centerX,
            y: centerY,
            size: radius,
            borderColor: rgb(0, 0, 0),
            borderWidth: 1.5
          })

          if (formElement.data.value) {
            pdfPage.drawCircle({
              x: centerX,
              y: centerY,
              size: radius * 0.5,
              color: rgb(0, 0, 0)
            })
          }
        }
      } catch (error) {
        console.error('Failed to draw form element:', error)
      }
    }

    drawAnnotations(element, pdfPage, y, helveticaFont, helveticaBoldFont)
  }

  if (settings?.watermark?.enabled) {
    applyWatermark(pdfPage, settings.watermark, pageHeight)
  }

  if (settings?.stamp?.enabled) {
    applyStamp(pdfPage, settings.stamp, pageHeight, helveticaBoldFont)
  }

  const pdfBytes = await newPdfDoc.save()
  return new Blob([pdfBytes as BlobPart], { type: 'application/pdf' })
}

export async function exportSelectedPages(document: PDFDocument, pageIndices: number[], settings?: ExportSettings): Promise<Blob> {
  if (!document.originalFile) {
    throw new Error('No original PDF file found')
  }

  let arrayBuffer: ArrayBuffer
  
  if (typeof document.originalFile === 'string') {
    const response = await fetch(document.originalFile)
    arrayBuffer = await response.arrayBuffer()
  } else {
    arrayBuffer = await document.originalFile.arrayBuffer()
  }
  
  const sourcePdfDoc = await PDFLibDocument.load(arrayBuffer)
  const newPdfDoc = await PDFLibDocument.create()
  
  const helveticaFont = await newPdfDoc.embedFont(StandardFonts.Helvetica)
  const helveticaBoldFont = await newPdfDoc.embedFont(StandardFonts.HelveticaBold)
  const courierFont = await newPdfDoc.embedFont(StandardFonts.Courier)
  const timesFont = await newPdfDoc.embedFont(StandardFonts.TimesRoman)
  const timesBoldFont = await newPdfDoc.embedFont(StandardFonts.TimesRomanBold)
  
  const copiedPages = await newPdfDoc.copyPages(sourcePdfDoc, pageIndices)
  copiedPages.forEach(page => newPdfDoc.addPage(page))
  
  const pages = newPdfDoc.getPages()

  for (let i = 0; i < pageIndices.length; i++) {
    const pageIndex = pageIndices[i]
    const page = document.pages[pageIndex]
    const pdfPage = pages[i]
    
    if (!pdfPage) continue

    const { height: pageHeight } = pdfPage.getSize()

    if (page.rotation !== 0) {
      pdfPage.setRotation(degrees(page.rotation))
    }

    const sortedElements = [...page.elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))

    for (const element of sortedElements) {
      const y = pageHeight - element.y - element.height

      if (element.type === 'text') {
        try {
          const hexColor = element.data.color?.replace('#', '') || '000000'
          const r = parseInt(hexColor.slice(0, 2), 16) / 255
          const g = parseInt(hexColor.slice(2, 4), 16) / 255
          const b = parseInt(hexColor.slice(4, 6), 16) / 255

          let font: PDFFont = helveticaFont
          const fontFamily = element.data.fontFamily?.toLowerCase() || 'helvetica'
          
          if (fontFamily.includes('courier') || fontFamily.includes('mono')) {
            font = courierFont
          } else if (fontFamily.includes('times')) {
            font = element.data.bold ? timesBoldFont : timesFont
          } else {
            font = element.data.bold ? helveticaBoldFont : helveticaFont
          }

          const content = element.data.content || ''
          const lines = content.split('\n')
          const lineHeight = element.data.fontSize * 1.2

          lines.forEach((line, index) => {
            if (line.trim()) {
              pdfPage.drawText(line, {
                x: element.x,
                y: y - (index * lineHeight),
                size: element.data.fontSize || 12,
                font,
                color: rgb(r, g, b),
                rotate: degrees(element.rotation || 0)
              })
            }
          })
        } catch (error) {
          console.error('Failed to draw text element:', error)
        }
      } else if (element.type === 'image' || element.type === 'signature') {
        try {
          const imageData = element.data.src
          if (!imageData) continue
          
          let embeddedImage

          if (imageData.startsWith('data:image/png')) {
            const base64Data = imageData.split(',')[1]
            const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))
            embeddedImage = await newPdfDoc.embedPng(imageBytes)
          } else if (imageData.startsWith('data:image/jpeg') || imageData.startsWith('data:image/jpg')) {
            const base64Data = imageData.split(',')[1]
            const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))
            embeddedImage = await newPdfDoc.embedJpg(imageBytes)
          }

          if (embeddedImage) {
            pdfPage.drawImage(embeddedImage, {
              x: element.x,
              y,
              width: element.width,
              height: element.height,
              rotate: degrees(element.rotation || 0),
              opacity: element.type === 'image' ? (element.data.opacity || 1) : 1
            })
          }
        } catch (error) {
          console.error('Failed to embed image:', error)
        }
      } else if (element.type === 'form') {
        try {
          const formElement = element as FormElement
          const fieldType = formElement.data.fieldType

          if (fieldType === 'checkbox') {
            const size = Math.min(element.width, element.height)
            pdfPage.drawRectangle({
              x: element.x,
              y,
              width: size,
              height: size,
              borderColor: rgb(0, 0, 0),
              borderWidth: 1.5
            })

            if (formElement.data.value) {
              pdfPage.drawText('✓', {
                x: element.x + 2,
                y: y + 2,
                size: size * 0.7,
                font: helveticaBoldFont,
                color: rgb(0, 0, 0)
              })
            }
          } else if (fieldType === 'text') {
            pdfPage.drawRectangle({
              x: element.x,
              y,
              width: element.width,
              height: element.height,
              borderColor: rgb(0.7, 0.7, 0.7),
              borderWidth: 1
            })

            if (formElement.data.value && typeof formElement.data.value === 'string') {
              pdfPage.drawText(formElement.data.value, {
                x: element.x + 4,
                y: y + element.height / 2 - 4,
                size: 12,
                font: helveticaFont,
                color: rgb(0, 0, 0)
              })
            }
          } else if (fieldType === 'radio') {
            const radius = Math.min(element.width, element.height) / 2
            const centerX = element.x + radius
            const centerY = y + radius

            pdfPage.drawCircle({
              x: centerX,
              y: centerY,
              size: radius,
              borderColor: rgb(0, 0, 0),
              borderWidth: 1.5
            })

            if (formElement.data.value) {
              pdfPage.drawCircle({
                x: centerX,
                y: centerY,
                size: radius * 0.5,
                color: rgb(0, 0, 0)
              })
            }
          }
        } catch (error) {
          console.error('Failed to draw form element:', error)
        }
      }

      drawAnnotations(element, pdfPage, y, helveticaFont, helveticaBoldFont)
    }

    if (settings?.watermark?.enabled) {
      applyWatermark(pdfPage, settings.watermark, pageHeight)
    }

    if (settings?.stamp?.enabled) {
      const shouldApplyStamp = shouldApplyStampToPage(settings.stamp, i, pageIndices.length)
      if (shouldApplyStamp) {
        applyStamp(pdfPage, settings.stamp, pageHeight, helveticaBoldFont)
      }
    }
  }

  const pdfBytes = await newPdfDoc.save()
  return new Blob([pdfBytes as BlobPart], { type: 'application/pdf' })
}

function drawAnnotations(element: PDFElement, pdfPage: PDFLibPage, y: number, helveticaFont: PDFFont, helveticaBoldFont: PDFFont) {
  if (element.type === 'highlight') {
    try {
      const hexColor = element.data.color?.replace('#', '') || 'FFEB3B'
      const r = parseInt(hexColor.slice(0, 2), 16) / 255
      const g = parseInt(hexColor.slice(2, 4), 16) / 255
      const b = parseInt(hexColor.slice(4, 6), 16) / 255
      const opacity = element.data.opacity || 0.4

      pdfPage.drawRectangle({
        x: element.x,
        y,
        width: element.width,
        height: element.height,
        color: rgb(r, g, b),
        opacity,
        rotate: degrees(element.rotation || 0)
      })
    } catch (error) {
      console.error('Failed to draw highlight:', error)
    }
  } else if (element.type === 'note') {
    try {
      const hexColor = element.data.color?.replace('#', '') || 'FFA726'
      const r = parseInt(hexColor.slice(0, 2), 16) / 255
      const g = parseInt(hexColor.slice(2, 4), 16) / 255
      const b = parseInt(hexColor.slice(4, 6), 16) / 255

      pdfPage.drawRectangle({
        x: element.x,
        y,
        width: element.width,
        height: element.height,
        color: rgb(r, g, b),
        opacity: 0.95,
        rotate: degrees(element.rotation || 0)
      })

      pdfPage.drawRectangle({
        x: element.x,
        y: y + element.height - 25,
        width: element.width,
        height: 25,
        color: rgb(r * 0.8, g * 0.8, b * 0.8),
        opacity: 1,
        rotate: degrees(element.rotation || 0)
      })

      const author = element.data.author || 'Note'
      pdfPage.drawText(author, {
        x: element.x + 8,
        y: y + element.height - 17,
        size: 10,
        font: helveticaBoldFont,
        color: rgb(1, 1, 1),
        rotate: degrees(element.rotation || 0)
      })

      const content = element.data.content || ''
      const lines = content.split('\n')
      const lineHeight = 14
      const maxLines = Math.floor((element.height - 30) / lineHeight)

      lines.slice(0, maxLines).forEach((line, index) => {
        if (line.trim()) {
          pdfPage.drawText(line.substring(0, 40), {
            x: element.x + 8,
            y: y + element.height - 35 - (index * lineHeight),
            size: 11,
            font: helveticaFont,
            color: rgb(0, 0, 0),
            rotate: degrees(element.rotation || 0)
          })
        }
      })
    } catch (error) {
      console.error('Failed to draw note:', error)
    }
  }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
