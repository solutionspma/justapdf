export type EditMode = 'select' | 'text' | 'image' | 'form' | 'signature' | 'ocr' | 'highlight' | 'note' | 'arrow' | 'shape' | 'stamp'

export interface PDFPage {
  id: string
  pageNumber: number
  width: number
  height: number
  rotation: number
  elements: PDFElement[]
}

export interface PDFElement {
  id: string
  type: 'text' | 'image' | 'signature' | 'form' | 'highlight' | 'note' | 'arrow' | 'shape' | 'stamp'
  x: number
  y: number
  width: number
  height: number
  rotation: number
  data: any
  zIndex: number
}

export interface TextElement extends PDFElement {
  type: 'text'
  data: {
    content: string
    fontSize: number
    fontFamily: string
    color: string
    bold: boolean
    italic: boolean
    align?: 'left' | 'center' | 'right' | 'justify'
    isExtracted?: boolean
    isMerged?: boolean
    baselineOffset?: number
    letterSpacing?: number
    letterSpacingEm?: number
    avgCharWidth?: number
    pdfWidth?: number
    wordSpacing?: number
    lineHeight?: number
  }
}

export interface ImageElement extends PDFElement {
  type: 'image'
  data: {
    src: string
    opacity: number
  }
}

export interface SignatureElement extends PDFElement {
  type: 'signature'
  data: {
    src: string
    signatureType: 'draw' | 'type' | 'upload'
  }
}

export interface FormElement extends PDFElement {
  type: 'form'
  data: {
    fieldType: 'text' | 'checkbox' | 'radio'
    value: string | boolean
    placeholder?: string
  }
}

export interface HighlightElement extends PDFElement {
  type: 'highlight'
  data: {
    color: string
    opacity: number
  }
}

export interface NoteReply {
  id: string
  author: string
  content: string
  createdAt: string
}

export interface NoteElement extends PDFElement {
  type: 'note'
  data: {
    content: string
    color: string
    author?: string
    createdAt: string
    isOpen: boolean
    replies?: NoteReply[]
  }
}

export interface PDFDocument {
  id: string
  name: string
  pages: PDFPage[]
  originalFile: File | string | null
}

export interface WatermarkSettings {
  enabled: boolean
  text: string
  fontSize: number
  opacity: number
  rotation: number
  color: string
  position: 'center' | 'diagonal' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

export interface StampSettings {
  enabled: boolean
  type: 'approved' | 'confidential' | 'draft' | 'final' | 'copy' | 'custom'
  customText?: string
  color: string
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  pages: 'all' | 'first' | 'last' | number[]
}

export interface ExportSettings {
  watermark?: WatermarkSettings
  stamp?: StampSettings
  password?: string
  quality: 'standard' | 'high'
  includeMetadata: boolean
}

export interface Certificate {
  id: string
  name: string
  issuer: string
  subject: string
  serialNumber: string
  validFrom: string
  validTo: string
  fingerprint: string
  publicKey: string
  isTrusted: boolean
  usages: string[]
  status: 'valid' | 'expired' | 'revoked' | 'untrusted'
  addedDate: string
  notes?: string
}

export interface TimestampToken {
  issuedBy: string
  issuedAt: string
  serialNumber: string
  digestAlgorithm: string
  tsaUrl?: string
  accuracy?: string
  nonce?: string
}

export interface TimestampValidation {
  isValid: boolean
  token?: TimestampToken
  errors: string[]
  verifiedAt: string
}

export interface DigitalSignature {
  id: string
  signedBy: string
  signedDate: string
  certificateId?: string
  status: 'valid' | 'invalid' | 'unknown'
  reason?: string
  location?: string
  contactInfo?: string
  signatureData: string
  verified: boolean
  verificationDate?: string
  verificationDetails?: string
  timestampToken?: TimestampToken
  timestampValidation?: TimestampValidation
}

export interface SignedPDFDocument extends PDFDocument {
  signatures: DigitalSignature[]
  certificateChain?: Certificate[]
}

export interface TSAServer {
  id: string
  name: string
  url: string
  enabled: boolean
  isTrusted: boolean
  description?: string
  addedDate: string
  lastValidated?: string
  validationStatus?: 'valid' | 'invalid' | 'unknown'
  validationError?: string
}

export interface ArrowElement extends PDFElement {
  type: 'arrow'
  data: {
    startX: number
    startY: number
    endX: number
    endY: number
    color: string
    strokeWidth: number
    arrowheadSize: number
    style: 'solid' | 'dashed' | 'dotted'
  }
}

export interface ShapeElement extends PDFElement {
  type: 'shape'
  data: {
    shapeType: 'rectangle' | 'circle' | 'line' | 'triangle'
    color: string
    fillColor?: string
    strokeWidth: number
    filled: boolean
    opacity: number
  }
}

export interface StampElement extends PDFElement {
  type: 'stamp'
  data: {
    stampType: 'approved' | 'rejected' | 'confidential' | 'draft' | 'final' | 'reviewed' | 'void' | 'copy' | 'custom'
    text: string
    color: string
    rotation: number
  }
}

export interface PageTemplate {
  id: string
  name: string
  category: 'business' | 'legal' | 'personal' | 'custom'
  thumbnail?: string
  elements: PDFElement[]
  width: number
  height: number
  description?: string
}
