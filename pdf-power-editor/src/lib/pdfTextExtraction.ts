import { pdfjs } from 'react-pdf'
import type { PDFElement, TextElement } from './types'

export interface ExtractedTextItem {
  text: string
  x: number
  y: number
  width: number
  height: number
  fontSize: number
  fontFamily: string
  transform: number[]
  hasEOL: boolean
}

export async function extractTextFromPDF(pdfData: string | ArrayBuffer): Promise<Map<number, ExtractedTextItem[]>> {
  try {
    const loadingTask = pdfjs.getDocument(pdfData)
    const pdf = await loadingTask.promise
    
    const textByPage = new Map<number, ExtractedTextItem[]>()
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const textContent = await page.getTextContent()
      const viewport = page.getViewport({ scale: 1.0 })
      
      const items: ExtractedTextItem[] = []
      
      textContent.items.forEach((item: any) => {
        if (item.str && item.str.trim()) {
          const transform = item.transform
          
          const scaleX = transform[0]
          const skewY = transform[1]
          const skewX = transform[2]
          const scaleY = transform[3]
          const translateX = transform[4]
          const translateY = transform[5]
          
          const fontSize = Math.sqrt(scaleX * scaleX + skewY * skewY)
          
          const x = translateX
          const rawY = translateY
          
          const y = viewport.height - rawY - fontSize
          
          const textWidth = item.width
          
          items.push({
            text: item.str,
            x: x,
            y: y,
            width: textWidth,
            height: fontSize,
            fontSize: fontSize,
            fontFamily: item.fontName || 'sans-serif',
            transform: transform,
            hasEOL: item.hasEOL || false
          })
        }
      })
      
      textByPage.set(pageNum - 1, items)
    }
    
    return textByPage
  } catch (error) {
    console.error('PDF text extraction error:', error)
    throw new Error('Failed to extract text from PDF')
  }
}

export function convertExtractedTextToPDFElements(items: ExtractedTextItem[], pageWidth: number, pageHeight: number, baselineOffset: number = 0): Omit<PDFElement, 'id'>[] {
  return items.map((item, index) => {
    const adjustedY = item.y + baselineOffset
    
    const avgCharWidth = item.width / item.text.length
    
    const baseCharWidth = item.fontSize * 0.6
    
    const letterSpacingPx = avgCharWidth - baseCharWidth
    
    const letterSpacingEm = letterSpacingPx / item.fontSize
    
    return {
      type: 'text' as const,
      x: item.x,
      y: adjustedY,
      width: item.width,
      height: item.height,
      rotation: 0,
      data: {
        content: item.text,
        fontSize: item.fontSize,
        fontFamily: 'Inter',
        color: '#000000',
        bold: false,
        italic: false,
        isExtracted: true,
        baselineOffset: baselineOffset,
        letterSpacing: letterSpacingPx,
        letterSpacingEm: letterSpacingEm,
        avgCharWidth: avgCharWidth,
        pdfWidth: item.width
      },
      zIndex: 1000 + index
    }
  })
}

export async function extractAndAddTextElements(
  pdfData: string | ArrayBuffer,
  pageIndex: number,
  baselineOffset: number = 0
): Promise<Omit<PDFElement, 'id'>[]> {
  const loadingTask = pdfjs.getDocument(pdfData)
  const pdf = await loadingTask.promise
  const page = await pdf.getPage(pageIndex + 1)
  const viewport = page.getViewport({ scale: 1.0 })
  
  const textByPage = await extractTextFromPDF(pdfData)
  const pageText = textByPage.get(pageIndex) || []
  return convertExtractedTextToPDFElements(pageText, viewport.width, viewport.height, baselineOffset)
}

export async function getAllPDFText(pdfData: string | ArrayBuffer): Promise<string> {
  try {
    const textByPage = await extractTextFromPDF(pdfData)
    let allText = ''
    
    textByPage.forEach((items, pageNum) => {
      items.forEach(item => {
        allText += item.text + ' '
      })
      allText += '\n\n'
    })
    
    return allText.trim()
  } catch (error) {
    console.error('Failed to extract all PDF text:', error)
    return ''
  }
}
