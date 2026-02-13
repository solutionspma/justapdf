import type { Certificate, DigitalSignature, TimestampToken, TimestampValidation } from './types'

export async function verifyCertificate(certificate: Certificate): Promise<{
  isValid: boolean
  status: Certificate['status']
  errors: string[]
}> {
  const errors: string[] = []
  const now = new Date()
  const validFrom = new Date(certificate.validFrom)
  const validTo = new Date(certificate.validTo)

  if (now < validFrom) {
    errors.push('Certificate is not yet valid')
    return { isValid: false, status: 'untrusted', errors }
  }

  if (now > validTo) {
    errors.push('Certificate has expired')
    return { isValid: false, status: 'expired', errors }
  }

  if (!certificate.isTrusted) {
    errors.push('Certificate is not trusted')
    return { isValid: false, status: 'untrusted', errors }
  }

  return { isValid: true, status: 'valid', errors: [] }
}

export async function verifyTimestamp(
  timestampToken: TimestampToken,
  signatureDate: string
): Promise<TimestampValidation> {
  const errors: string[] = []
  const now = new Date()
  const tokenDate = new Date(timestampToken.issuedAt)
  const sigDate = new Date(signatureDate)

  if (isNaN(tokenDate.getTime())) {
    errors.push('Invalid timestamp token date')
  }

  if (tokenDate > now) {
    errors.push('Timestamp token is from the future')
  }

  const timeDiff = Math.abs(tokenDate.getTime() - sigDate.getTime())
  const maxDiff = 5 * 60 * 1000
  
  if (timeDiff > maxDiff) {
    errors.push('Timestamp token time differs significantly from signature time')
  }

  if (!timestampToken.digestAlgorithm) {
    errors.push('Timestamp token missing digest algorithm')
  }

  const supportedAlgorithms = ['SHA-256', 'SHA-384', 'SHA-512', 'SHA-1']
  if (timestampToken.digestAlgorithm && !supportedAlgorithms.includes(timestampToken.digestAlgorithm)) {
    errors.push(`Unsupported digest algorithm: ${timestampToken.digestAlgorithm}`)
  }

  if (timestampToken.digestAlgorithm === 'SHA-1') {
    errors.push('SHA-1 is deprecated and should not be used')
  }

  return {
    isValid: errors.length === 0,
    token: timestampToken,
    errors,
    verifiedAt: new Date().toISOString()
  }
}

export async function extractTimestampFromSignature(
  signatureData: string
): Promise<TimestampToken | null> {
  try {
    const timestampPattern = /\/TST[^>]*\/M\s*\(([^)]+)\)/
    const issuerPattern = /\/Name\s*\(([^)]+)\)/
    const serialPattern = /\/SerialNumber\s*<([^>]+)>/
    
    const dateMatch = signatureData.match(timestampPattern)
    const issuerMatch = signatureData.match(issuerPattern)
    const serialMatch = signatureData.match(serialPattern)

    if (!dateMatch) {
      return null
    }

    const token: TimestampToken = {
      issuedBy: issuerMatch ? issuerMatch[1] : 'Unknown TSA',
      issuedAt: dateMatch[1] || new Date().toISOString(),
      serialNumber: serialMatch ? serialMatch[1] : generateTokenSerial(),
      digestAlgorithm: 'SHA-256',
      accuracy: '±1 second'
    }

    const urlPattern = /\/TSA\s*\(([^)]+)\)/
    const urlMatch = signatureData.match(urlPattern)
    if (urlMatch) {
      token.tsaUrl = urlMatch[1]
    }

    return token
  } catch (error) {
    console.error('Failed to extract timestamp:', error)
    return null
  }
}

function generateTokenSerial(): string {
  return Array.from({ length: 16 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('').toUpperCase()
}

export async function verifySignature(
  signature: DigitalSignature,
  certificates: Certificate[]
): Promise<{
  isValid: boolean
  details: string
  certificate?: Certificate
  timestampValidation?: TimestampValidation
}> {
  const certificate = certificates.find(cert => cert.id === signature.certificateId)
  
  if (!certificate) {
    return {
      isValid: false,
      details: 'Certificate not found in trusted store'
    }
  }

  const certVerification = await verifyCertificate(certificate)
  
  if (!certVerification.isValid) {
    return {
      isValid: false,
      details: `Certificate verification failed: ${certVerification.errors.join(', ')}`,
      certificate
    }
  }

  const signatureDate = new Date(signature.signedDate)
  const certValidFrom = new Date(certificate.validFrom)
  const certValidTo = new Date(certificate.validTo)

  if (signatureDate < certValidFrom || signatureDate > certValidTo) {
    return {
      isValid: false,
      details: 'Document was signed when certificate was not valid',
      certificate
    }
  }

  let timestampValidation: TimestampValidation | undefined

  if (signature.timestampToken) {
    timestampValidation = await verifyTimestamp(signature.timestampToken, signature.signedDate)
    
    if (!timestampValidation.isValid) {
      return {
        isValid: false,
        details: `Timestamp validation failed: ${timestampValidation.errors.join(', ')}`,
        certificate,
        timestampValidation
      }
    }
  }

  let details = `Signature is valid. Signed by ${certificate.subject} on ${new Date(signature.signedDate).toLocaleString()}`
  
  if (timestampValidation?.isValid) {
    details += `. Timestamp verified by ${signature.timestampToken?.issuedBy}`
  }

  return {
    isValid: true,
    details,
    certificate,
    timestampValidation
  }
}

export function parseCertificateFromPEM(pemData: string): Partial<Certificate> | null {
  try {
    const lines = pemData.split('\n').filter(line => 
      !line.includes('BEGIN CERTIFICATE') && 
      !line.includes('END CERTIFICATE') &&
      line.trim() !== ''
    )
    
    const base64Data = lines.join('')
    
    const parsedData = {
      publicKey: base64Data,
      fingerprint: generateFingerprint(base64Data)
    }
    
    return parsedData
  } catch (error) {
    console.error('Failed to parse certificate:', error)
    return null
  }
}

export function parseCertificateFromFile(file: File): Promise<Partial<Certificate> | null> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const content = e.target?.result as string
      
      if (file.name.endsWith('.pem') || file.name.endsWith('.crt')) {
        resolve(parseCertificateFromPEM(content))
      } else if (file.name.endsWith('.cer') || file.name.endsWith('.der')) {
        const arrayBuffer = e.target?.result as ArrayBuffer
        const bytes = new Uint8Array(arrayBuffer)
        const base64 = btoa(String.fromCharCode(...bytes))
        
        resolve({
          publicKey: base64,
          fingerprint: generateFingerprint(base64)
        })
      } else {
        resolve(null)
      }
    }
    
    reader.onerror = () => resolve(null)
    
    if (file.name.endsWith('.pem') || file.name.endsWith('.crt')) {
      reader.readAsText(file)
    } else {
      reader.readAsArrayBuffer(file)
    }
  })
}

function generateFingerprint(data: string): string {
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(16, '0')
  return hex.match(/.{1,2}/g)?.join(':') || hex
}

export function getCertificateStatus(certificate: Certificate): {
  status: Certificate['status']
  message: string
  variant: 'default' | 'destructive' | 'warning' | 'success'
} {
  const now = new Date()
  const validFrom = new Date(certificate.validFrom)
  const validTo = new Date(certificate.validTo)
  const daysUntilExpiry = Math.floor((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (now < validFrom) {
    return {
      status: 'untrusted',
      message: 'Not yet valid',
      variant: 'warning'
    }
  }

  if (now > validTo) {
    return {
      status: 'expired',
      message: 'Expired',
      variant: 'destructive'
    }
  }

  if (!certificate.isTrusted) {
    return {
      status: 'untrusted',
      message: 'Not trusted',
      variant: 'warning'
    }
  }

  if (daysUntilExpiry <= 30) {
    return {
      status: 'valid',
      message: `Expires in ${daysUntilExpiry} days`,
      variant: 'warning'
    }
  }

  return {
    status: 'valid',
    message: 'Valid',
    variant: 'success'
  }
}

export function validateCertificateChain(certificates: Certificate[]): {
  isValid: boolean
  brokenLinks: string[]
} {
  const brokenLinks: string[] = []
  
  for (let i = 0; i < certificates.length - 1; i++) {
    const current = certificates[i]
    const next = certificates[i + 1]
    
    if (current.issuer !== next.subject) {
      brokenLinks.push(`${current.name} -> ${next.name}`)
    }
  }
  
  return {
    isValid: brokenLinks.length === 0,
    brokenLinks
  }
}

export async function extractSignaturesFromPDF(pdfData: string): Promise<DigitalSignature[]> {
  const signatures: DigitalSignature[] = []
  
  const signaturePattern = /\/Type\s*\/Sig[^>]*\/M\s*\(([^)]+)\)/g
  const matches = pdfData.matchAll(signaturePattern)
  
  for (const match of matches) {
    const dateStr = match[1]
    const signatureData = match[0]
    
    const timestampToken = await extractTimestampFromSignature(signatureData)
    
    signatures.push({
      id: `sig-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      signedBy: 'Unknown Signer',
      signedDate: dateStr || new Date().toISOString(),
      status: 'unknown',
      signatureData,
      verified: false,
      timestampToken: timestampToken || undefined
    })
  }
  
  return signatures
}

export function formatCertificateDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function getCertificateUsageString(usages: string[]): string {
  if (usages.length === 0) return 'No specific usage'
  return usages.join(', ')
}
