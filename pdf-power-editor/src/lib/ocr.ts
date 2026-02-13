import type { PDFElement } from './types'

async function compressImage(dataUrl: string, maxWidth: number = 1200): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }

      let width = img.width
      let height = img.height

      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      canvas.width = width
      canvas.height = height
      
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, width, height)
      
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      
      ctx.drawImage(img, 0, 0, width, height)
      
      resolve(canvas.toDataURL('image/jpeg', 0.5))
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = dataUrl
  })
}

function getSensitivityInstructions(sensitivity: number): string {
  if (sensitivity <= 0.2) {
    return `DETECTION MODE: LOW SENSITIVITY (Only Major Text)
- Focus ONLY on large, prominent text (headers, titles, key content)
- Skip small text, fine print, captions, footnotes
- Ignore faint or low-contrast text
- Skip watermarks, background text, decorative elements
- Extract only the most obvious and readable text elements`
  } else if (sensitivity <= 0.4) {
    return `DETECTION MODE: MEDIUM-LOW SENSITIVITY (Main Content)
- Focus on clearly readable text (headers, body paragraphs)
- Include medium-sized text elements
- Skip very small text (subscripts, superscripts, tiny captions)
- Ignore faint or barely visible text
- Extract primary content only`
  } else if (sensitivity <= 0.6) {
    return `DETECTION MODE: BALANCED SENSITIVITY (Standard Text)
- Extract all clearly visible text (headers, body text, labels)
- Include normal-sized text elements
- Consider including small text if clearly legible
- Extract text in margins and footers if prominent
- Balance thoroughness with accuracy`
  } else if (sensitivity <= 0.8) {
    return `DETECTION MODE: MEDIUM-HIGH SENSITIVITY (Detailed Text)
- Extract ALL clearly visible text including smaller elements
- Include small text (captions, footnotes, fine print)
- Detect text in margins, headers, footers
- Include numbers, dates, labels, annotations
- Be thorough but skip extremely faint text`
  } else {
    return `DETECTION MODE: MAXIMUM SENSITIVITY (Everything)
- Extract EVERY visible text element with highest sensitivity
- Include even very small text (subscripts, superscripts, tiny print)
- Detect faint or low-contrast text
- Extract text at any angle or orientation
- Include watermarks and background text if readable
- Scan every corner: margins, headers, footers, annotations
- Be extremely thorough - capture all readable characters`
  }
}

export interface OCROptions {
  sensitivity: number
}

export async function detectTextInImage(
  imageDataUrl: string, 
  options: OCROptions = { sensitivity: 0.5 }
): Promise<Omit<PDFElement, 'id'>[]> {
  try {
    if (!imageDataUrl || imageDataUrl === '') {
      throw new Error('No image data provided')
    }

    const compressedImage = await compressImage(imageDataUrl, 1200)

    const sensitivityInstructions = getSensitivityInstructions(options.sensitivity)

    const prompt = window.spark.llmPrompt`You are an advanced OCR system for text detection in PDF pages.

Analyze this PDF page image and extract visible text.

${sensitivityInstructions}

For each distinct text element, provide:
- "content": exact text (preserve case, spacing, punctuation)
- "xPercent": horizontal position (0-100, from left edge)
- "yPercent": vertical position (0-100, from top edge)
- "size": font category:
  * "xlarge" for titles/main headers (>20pt)
  * "large" for subheaders (16-20pt)
  * "medium" for body text (10-15pt)
  * "small" for fine print/captions (7-9pt)
  * "xsmall" for very small text (<7pt)

Rules:
1. Break into logical chunks (one line/phrase per element)
2. Scan systematically: top to bottom, left to right
3. Position from TOP-LEFT corner of each text block
4. If truly no text exists, return: {"textElements": []}
5. Only report text you can actually see - no guessing

Return ONLY valid JSON:
{"textElements": [{"content": "Text Here", "xPercent": 15, "yPercent": 20, "size": "small"}]}

Image: ${compressedImage}`

    const response = await window.spark.llm(prompt, 'gpt-4o-mini', true)
    const parsed = JSON.parse(response)
    
    if (!parsed.textElements || !Array.isArray(parsed.textElements)) {
      return []
    }

    if (parsed.textElements.length === 0) {
      return []
    }

    const elements: Omit<PDFElement, 'id'>[] = parsed.textElements.map((item: any) => {
      const sizeMap: { [key: string]: number } = {
        'xlarge': 24,
        'large': 18,
        'medium': 12,
        'small': 8,
        'xsmall': 6
      }
      
      const fontSize = sizeMap[item.size] || 12
      const content = String(item.content || '')
      const estimatedWidth = Math.max(content.length * fontSize * 0.6, 30)
      
      return {
        type: 'text' as const,
        x: Math.max(0, (item.xPercent / 100) * 612),
        y: Math.max(0, (item.yPercent / 100) * 792),
        width: estimatedWidth,
        height: fontSize * 1.5,
        rotation: 0,
        data: {
          content,
          fontSize,
          fontFamily: 'Inter',
          color: '#000000',
          bold: item.size === 'xlarge' || item.size === 'large',
          italic: false
        },
        zIndex: Date.now() + Math.random()
      }
    })

    return elements
  } catch (error: any) {
    console.error('OCR error:', error)
    if (error?.message?.includes('tokens_limit_reached') || error?.message?.includes('413')) {
      throw new Error('Page image is too large. Try a simpler page or use the test PDF.')
    }
    throw error
  }
}

export async function capturePageAsImage(pageElement: HTMLElement): Promise<string> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  if (!ctx) {
    throw new Error('Could not get canvas context')
  }

  const canvasElement = pageElement.querySelector('canvas')
  if (!canvasElement) {
    throw new Error('Could not find page canvas')
  }

  canvas.width = canvasElement.width
  canvas.height = canvasElement.height
  
  ctx.drawImage(canvasElement, 0, 0)
  
  return canvas.toDataURL('image/png')
}
