import type { PDFElement } from './types'

export interface TextBlock {
  elements: PDFElement[]
  minX: number
  minY: number
  maxX: number
  maxY: number
  text: string
  lines: PDFElement[][]
  avgFontSize: number
  avgLineHeight: number
}

export interface MergeAnalysis {
  totalElements: number
  estimatedBlocks: number
  wouldMerge: boolean
  reason?: string
}

export function analyzeMergePotential(elements: PDFElement[]): MergeAnalysis {
  const extractedTextElements = elements.filter(
    el => el.type === 'text' && el.data.isExtracted && !el.data.isMerged
  )

  const totalElements = extractedTextElements.length

  if (totalElements === 0) {
    return {
      totalElements: 0,
      estimatedBlocks: 0,
      wouldMerge: false,
      reason: 'No extracted text elements found'
    }
  }

  if (totalElements === 1) {
    return {
      totalElements: 1,
      estimatedBlocks: 1,
      wouldMerge: false,
      reason: 'Only one text element - nothing to merge'
    }
  }

  const blocks = mergeTextElementsIntoBlocks(elements, 5)
  const estimatedBlocks = blocks.length

  if (estimatedBlocks >= totalElements) {
    return {
      totalElements,
      estimatedBlocks,
      wouldMerge: false,
      reason: 'Text elements are already well-separated'
    }
  }

  return {
    totalElements,
    estimatedBlocks,
    wouldMerge: true
  }
}

/**
 * Merges extracted text elements into freely editable blocks based on proximity and alignment.
 * 
 * This function intelligently groups text elements that appear on the same line or in the same
 * paragraph into cohesive, editable blocks. The merging process:
 * 
 * 1. Groups text elements into lines based on vertical proximity
 * 2. Groups lines into paragraphs based on spacing and alignment
 * 3. Preserves line breaks within merged blocks for natural editing
 * 4. Calculates appropriate font size and line height for each block
 * 
 * @param elements - Array of all PDF elements on the page
 * @param proximityThreshold - Distance threshold (in pixels) for grouping elements (default: 5)
 * @returns Array of TextBlock objects representing merged text regions
 * 
 * @example
 * const blocks = mergeTextElementsIntoBlocks(pageElements, 5)
 * blocks.forEach(block => {
 *   console.log(`Block with ${block.elements.length} elements: "${block.text}"`)
 * })
 */
export function mergeTextElementsIntoBlocks(elements: PDFElement[], proximityThreshold = 5): TextBlock[] {
  const textElements = elements
    .filter(el => el.type === 'text' && el.data.isExtracted && !el.data.isMerged)
    .sort((a, b) => {
      const yDiff = a.y - b.y
      if (Math.abs(yDiff) < proximityThreshold) {
        return a.x - b.x
      }
      return yDiff
    })

  if (textElements.length === 0) return []

  const lines = groupIntoLines(textElements, proximityThreshold)
  
  const paragraphBlocks = groupLinesIntoParagraphs(lines, proximityThreshold)
  
  return paragraphBlocks.map(createTextBlock)
}

function groupIntoLines(textElements: PDFElement[], proximityThreshold: number): PDFElement[][] {
  if (textElements.length === 0) return []
  
  const lines: PDFElement[][] = []
  let currentLine: PDFElement[] = [textElements[0]]

  for (let i = 1; i < textElements.length; i++) {
    const prev = textElements[i - 1]
    const curr = textElements[i]

    const yDistance = Math.abs(curr.y - prev.y)
    const xDistance = curr.x - (prev.x + prev.width)
    const sameLine = yDistance < proximityThreshold

    if (sameLine && xDistance < proximityThreshold * 10) {
      currentLine.push(curr)
    } else {
      if (currentLine.length > 0) {
        lines.push(currentLine)
      }
      currentLine = [curr]
    }
  }

  if (currentLine.length > 0) {
    lines.push(currentLine)
  }

  return lines
}

function groupLinesIntoParagraphs(lines: PDFElement[][], proximityThreshold: number): PDFElement[][] {
  if (lines.length === 0) return []
  
  const paragraphs: PDFElement[][] = []
  let currentParagraph: PDFElement[] = [...lines[0]]

  for (let i = 1; i < lines.length; i++) {
    const prevLine = lines[i - 1]
    const currLine = lines[i]
    
    const prevLineBottom = Math.max(...prevLine.map(el => el.y + el.height))
    const currLineTop = Math.min(...currLine.map(el => el.y))
    const lineSpacing = currLineTop - prevLineBottom
    
    const prevLineFontSize = prevLine[0]?.data.fontSize || 16
    const currLineFontSize = currLine[0]?.data.fontSize || 16
    const avgFontSize = (prevLineFontSize + currLineFontSize) / 2
    
    const prevLineX = Math.min(...prevLine.map(el => el.x))
    const currLineX = Math.min(...currLine.map(el => el.x))
    const xAlignment = Math.abs(prevLineX - currLineX)
    
    const shouldMerge = 
      lineSpacing < avgFontSize * 1.8 && 
      xAlignment < proximityThreshold * 5
    
    if (shouldMerge) {
      currentParagraph.push(...currLine)
    } else {
      if (currentParagraph.length > 0) {
        paragraphs.push(currentParagraph)
      }
      currentParagraph = [...currLine]
    }
  }

  if (currentParagraph.length > 0) {
    paragraphs.push(currentParagraph)
  }

  return paragraphs
}

function createTextBlock(elements: PDFElement[]): TextBlock {
  const minX = Math.min(...elements.map(e => e.x))
  const minY = Math.min(...elements.map(e => e.y))
  const maxX = Math.max(...elements.map(e => e.x + e.width))
  const maxY = Math.max(...elements.map(e => e.y + e.height))
  
  const lines = groupIntoLines(elements, 5)
  
  const sortedElements = [...elements].sort((a, b) => {
    const yDiff = a.y - b.y
    if (Math.abs(yDiff) < 5) {
      return a.x - b.x
    }
    return yDiff
  })
  
  const text = lines.map(line => 
    line.map(el => el.data.content).join(' ')
  ).join('\n')
  
  const fontSizes = elements.map(e => e.data.fontSize || 16)
  const avgFontSize = fontSizes.reduce((a, b) => a + b, 0) / fontSizes.length
  
  let totalLineHeight = 0
  for (let i = 0; i < lines.length - 1; i++) {
    const currentLineBottom = Math.max(...lines[i].map(el => el.y + el.height))
    const nextLineTop = Math.min(...lines[i + 1].map(el => el.y))
    totalLineHeight += (nextLineTop - currentLineBottom)
  }
  const avgLineHeight = lines.length > 1 ? totalLineHeight / (lines.length - 1) : avgFontSize * 1.2

  return {
    elements: sortedElements,
    minX,
    minY,
    maxX,
    maxY,
    text,
    lines,
    avgFontSize,
    avgLineHeight
  }
}

export function convertBlockToMergedElement(block: TextBlock): Omit<PDFElement, 'id'> {
  const firstElement = block.elements[0]
  const mostCommonFontSize = Math.round(block.avgFontSize)
  const mostCommonFontFamily = firstElement.data.fontFamily || 'Inter'
  const mostCommonColor = firstElement.data.color || '#000000'
  
  const lineHeight = block.avgLineHeight > 0 ? block.avgLineHeight : mostCommonFontSize * 1.2
  
  return {
    type: 'text',
    x: block.minX,
    y: block.minY,
    width: block.maxX - block.minX,
    height: block.maxY - block.minY,
    rotation: 0,
    data: {
      content: block.text,
      fontSize: mostCommonFontSize,
      fontFamily: mostCommonFontFamily,
      color: mostCommonColor,
      bold: firstElement.data.bold || false,
      italic: firstElement.data.italic || false,
      align: 'left',
      isExtracted: true,
      isMerged: true,
      lineHeight: lineHeight
    },
    zIndex: Date.now()
  }
}

export function replaceElementsWithMergedBlocks(
  allElements: PDFElement[],
  blocks: TextBlock[]
): PDFElement[] {
  const elementIdsToRemove = new Set(
    blocks.flatMap(block => block.elements.map(e => e.id))
  )

  const nonTextElements = allElements.filter(el => !elementIdsToRemove.has(el.id))

  const mergedElements = blocks.map((block, idx) => ({
    ...convertBlockToMergedElement(block),
    id: `merged-text-${Date.now()}-${idx}`
  }))

  return [...nonTextElements, ...mergedElements]
}

export function getMergeStatistics(blocks: TextBlock[]): {
  totalBlocks: number
  totalLines: number
  avgElementsPerBlock: number
  largestBlock: { elements: number; lines: number; chars: number }
} {
  const totalBlocks = blocks.length
  const totalLines = blocks.reduce((sum, block) => sum + block.lines.length, 0)
  const totalElements = blocks.reduce((sum, block) => sum + block.elements.length, 0)
  const avgElementsPerBlock = totalElements / totalBlocks

  const largestBlock = blocks.reduce((largest, block) => {
    const elements = block.elements.length
    const lines = block.lines.length
    const chars = block.text.length
    
    if (elements > largest.elements) {
      return { elements, lines, chars }
    }
    return largest
  }, { elements: 0, lines: 0, chars: 0 })

  return {
    totalBlocks,
    totalLines,
    avgElementsPerBlock: Math.round(avgElementsPerBlock * 10) / 10,
    largestBlock
  }
}
