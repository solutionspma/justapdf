import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import {
  Signature,
  CheckCircle,
  Warning,
  ShieldCheck,
  ShieldWarning,
  Info,
  X,
  Certificate as CertIcon,
  Clock,
  GearSix,
  ListBullets,
  CalendarCheck
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import type { Certificate, DigitalSignature, PDFDocument, TSAServer } from '@/lib/types'
import {
  verifySignature,
  formatCertificateDate,
  extractSignaturesFromPDF
} from '@/lib/certificates'
import { validateTimestampAgainstTSA } from '@/lib/tsaServers'
import { TSAServerDialog } from '@/components/TSAServerDialog'
import { SignatureTimeline } from '@/components/SignatureTimeline'
import { cn } from '@/lib/utils'

interface SignatureVerificationPanelProps {
  document: PDFDocument
  onClose: () => void
}

export function SignatureVerificationPanel({ document, onClose }: SignatureVerificationPanelProps) {
  const [certificates] = useKV<Certificate[]>('pdf-certificates', [])
  const [tsaServers] = useKV<TSAServer[]>('tsa-servers', [])
  const [signatures, setSignatures] = useState<DigitalSignature[]>([])
  const [verificationResults, setVerificationResults] = useState<Map<string, {
    isValid: boolean
    details: string
    certificate?: Certificate
    timestampValidation?: {
      isValid: boolean
      errors: string[]
      verifiedAt: string
    }
    tsaValidation?: {
      isValid: boolean
      matchedServer?: TSAServer
      errors: string[]
    }
  }>>(new Map())
  const [isVerifying, setIsVerifying] = useState(false)
  const [selectedSignature, setSelectedSignature] = useState<DigitalSignature | null>(null)
  const [tsaDialogOpen, setTsaDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'list' | 'timeline'>('list')

  useEffect(() => {
    detectSignatures()
  }, [document])

  const detectSignatures = async () => {
    if (!document.originalFile) return

    try {
      setIsVerifying(true)
      
      let pdfData = ''
      if (typeof document.originalFile === 'string') {
        pdfData = document.originalFile
      } else {
        const reader = new FileReader()
        pdfData = await new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string)
          reader.readAsText(document.originalFile as File)
        })
      }

      const detected = await extractSignaturesFromPDF(pdfData)
      setSignatures(detected)

      if (detected.length === 0) {
        toast.info('No digital signatures found in this document')
      } else {
        toast.success(`Found ${detected.length} signature(s)`)
      }
    } catch (error) {
      console.error('Failed to detect signatures:', error)
      toast.error('Failed to detect signatures')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleVerifySignature = async (signature: DigitalSignature) => {
    setIsVerifying(true)
    try {
      const result = await verifySignature(signature, certificates || [])
      
      let tsaValidation
      if (signature.timestampToken && tsaServers && tsaServers.length > 0) {
        tsaValidation = validateTimestampAgainstTSA(signature.timestampToken, tsaServers)
      }

      const fullResult = {
        ...result,
        tsaValidation
      }

      setVerificationResults(new Map(verificationResults.set(signature.id, fullResult)))
      
      const updatedSignature = {
        ...signature,
        verified: true,
        status: result.isValid ? 'valid' : 'invalid',
        verificationDate: new Date().toISOString(),
        verificationDetails: result.details,
        timestampValidation: result.timestampValidation
      } as DigitalSignature

      setSignatures(signatures.map(sig => 
        sig.id === signature.id ? updatedSignature : sig
      ))

      if (result.isValid) {
        if (result.timestampValidation?.isValid) {
          if (tsaValidation?.isValid) {
            toast.success('Signature, timestamp, and TSA are all valid')
          } else {
            toast.success('Signature and timestamp are valid')
          }
        } else {
          toast.success('Signature is valid')
        }
      } else {
        toast.error('Signature verification failed')
      }
    } catch (error) {
      console.error('Verification failed:', error)
      toast.error('Failed to verify signature')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleVerifyAll = async () => {
    setIsVerifying(true)
    const results = new Map()
    
    for (const signature of signatures) {
      try {
        const result = await verifySignature(signature, certificates || [])
        results.set(signature.id, result)
      } catch (error) {
        console.error(`Failed to verify signature ${signature.id}:`, error)
      }
    }
    
    setVerificationResults(results)
    
    const updatedSignatures = signatures.map(sig => {
      const result = results.get(sig.id)
      if (result) {
        return {
          ...sig,
          verified: true,
          status: result.isValid ? 'valid' : 'invalid',
          verificationDate: new Date().toISOString(),
          verificationDetails: result.details,
          timestampValidation: result.timestampValidation
        } as DigitalSignature
      }
      return sig
    })
    
    setSignatures(updatedSignatures)
    setIsVerifying(false)
    
    const validCount = Array.from(results.values()).filter(r => r.isValid).length
    toast.success(`Verified ${validCount}/${signatures.length} signature(s)`)
  }

  const getStatusIcon = (status: DigitalSignature['status']) => {
    switch (status) {
      case 'valid':
        return <CheckCircle size={20} className="text-green-600" weight="fill" />
      case 'invalid':
        return <Warning size={20} className="text-red-600" weight="fill" />
      default:
        return <Info size={20} className="text-gray-600" weight="fill" />
    }
  }

  const getStatusBadge = (status: DigitalSignature['status']) => {
    switch (status) {
      case 'valid':
        return <Badge className="bg-green-600">Valid</Badge>
      case 'invalid':
        return <Badge variant="destructive">Invalid</Badge>
      default:
        return <Badge variant="outline">Unverified</Badge>
    }
  }

  return (
    <div className="fixed right-0 top-0 bottom-0 w-96 bg-background border-l shadow-lg z-50 flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck size={24} weight="fill" className="text-primary" />
          <div>
            <h2 className="font-semibold">Signature Verification</h2>
            <p className="text-xs text-muted-foreground">
              {signatures.length} signature(s) found
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X />
        </Button>
      </div>

      <div className="p-4 border-b space-y-2">
        <Button
          onClick={handleVerifyAll}
          disabled={isVerifying || signatures.length === 0}
          className="w-full"
          size="sm"
        >
          <ShieldCheck className="mr-2" />
          {isVerifying ? 'Verifying...' : 'Verify All Signatures'}
        </Button>
        
        <Button
          onClick={() => setTsaDialogOpen(true)}
          variant="outline"
          className="w-full"
          size="sm"
        >
          <GearSix className="mr-2" />
          Manage TSA Servers
        </Button>

        {tsaServers && tsaServers.length > 0 && (
          <div className="text-xs text-muted-foreground text-center">
            {tsaServers.filter(s => s.enabled).length} TSA server(s) configured
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'list' | 'timeline')} className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b px-4">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="list" className="gap-2">
              <ListBullets size={16} />
              <span>Signatures</span>
            </TabsTrigger>
            <TabsTrigger value="timeline" className="gap-2">
              <CalendarCheck size={16} />
              <span>Timeline</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="list" className="flex-1 m-0 overflow-hidden">
          <ScrollArea className="h-full p-4">
            {signatures.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Signature size={48} className="mx-auto mb-4 opacity-50" />
                <p>No signatures detected</p>
                <p className="text-sm mt-2">This document has no digital signatures</p>
              </div>
            ) : (
              <div className="space-y-4">
                {signatures.map((signature) => {
                  const result = verificationResults.get(signature.id)
                  
                  return (
                    <Card
                      key={signature.id}
                      className={cn(
                        "cursor-pointer transition-colors",
                        selectedSignature?.id === signature.id && "border-primary"
                      )}
                      onClick={() => setSelectedSignature(signature)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(signature.status)}
                            <CardTitle className="text-sm">
                              {signature.signedBy}
                            </CardTitle>
                          </div>
                          {getStatusBadge(signature.status)}
                        </div>
                        <CardDescription className="text-xs">
                          Signed: {formatCertificateDate(signature.signedDate)}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="space-y-3">
                        {signature.reason && (
                          <div>
                            <Label className="text-xs text-muted-foreground">REASON</Label>
                            <p className="text-sm">{signature.reason}</p>
                          </div>
                        )}
                        
                        {signature.location && (
                          <div>
                            <Label className="text-xs text-muted-foreground">LOCATION</Label>
                            <p className="text-sm">{signature.location}</p>
                          </div>
                        )}

                        {signature.timestampToken && (
                          <>
                            <Separator />
                            <div className="p-2 bg-muted/50 rounded-md space-y-2">
                              <div className="flex items-center gap-2">
                                <Clock size={16} className="text-primary" weight="fill" />
                                <Label className="text-xs font-medium">TIMESTAMP AUTHORITY</Label>
                              </div>
                              
                              <div className="space-y-1 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Issued By:</span>
                                  <span className="font-medium truncate ml-2 max-w-[60%]" title={signature.timestampToken.issuedBy}>
                                    {signature.timestampToken.issuedBy}
                                  </span>
                                </div>
                                
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Issued At:</span>
                                  <span className="font-medium">
                                    {formatCertificateDate(signature.timestampToken.issuedAt)}
                                  </span>
                                </div>
                                
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Algorithm:</span>
                                  <span className="font-medium font-mono">
                                    {signature.timestampToken.digestAlgorithm}
                                  </span>
                                </div>
                                
                                {signature.timestampToken.accuracy && (
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Accuracy:</span>
                                    <span className="font-medium">{signature.timestampToken.accuracy}</span>
                                  </div>
                                )}
                                
                                {signature.timestampToken.tsaUrl && (
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">TSA URL:</span>
                                    <span className="font-medium truncate ml-2 max-w-[60%]" title={signature.timestampToken.tsaUrl}>
                                      {signature.timestampToken.tsaUrl}
                                    </span>
                                  </div>
                                )}
                              </div>
                              
                              {signature.timestampValidation && (
                                <div className="mt-2 pt-2 border-t border-border/50">
                                  {signature.timestampValidation.isValid ? (
                                    <div className="flex items-center gap-2 text-green-600">
                                      <CheckCircle size={14} weight="fill" />
                                      <span className="text-xs font-medium">Timestamp Verified</span>
                                    </div>
                                  ) : (
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2 text-red-600">
                                        <Warning size={14} weight="fill" />
                                        <span className="text-xs font-medium">Timestamp Invalid</span>
                                      </div>
                                      {signature.timestampValidation.errors.length > 0 && (
                                        <p className="text-xs text-red-600 pl-5">
                                          {signature.timestampValidation.errors.join(', ')}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}

                              {result?.tsaValidation && (
                                <div className="mt-2 pt-2 border-t border-border/50">
                                  {result.tsaValidation.isValid ? (
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2 text-green-600">
                                        <ShieldCheck size={14} weight="fill" />
                                        <span className="text-xs font-medium">TSA Validated</span>
                                      </div>
                                      {result.tsaValidation.matchedServer && (
                                        <p className="text-xs text-muted-foreground pl-5">
                                          Server: {result.tsaValidation.matchedServer.name}
                                        </p>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2 text-yellow-600">
                                        <Warning size={14} weight="fill" />
                                        <span className="text-xs font-medium">TSA Not Validated</span>
                                      </div>
                                      {result.tsaValidation.errors.length > 0 && (
                                        <p className="text-xs text-yellow-600 pl-5">
                                          {result.tsaValidation.errors.join(', ')}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </>
                        )}

                        {signature.verified && signature.verificationDetails && (
                          <>
                            <Separator />
                            <div>
                              <Label className="text-xs text-muted-foreground">VERIFICATION</Label>
                              <p className="text-xs break-words">{signature.verificationDetails}</p>
                              {signature.verificationDate && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Verified: {formatCertificateDate(signature.verificationDate)}
                                </p>
                              )}
                            </div>
                          </>
                        )}

                        {result?.certificate && (
                          <>
                            <Separator />
                            <div className="flex items-start gap-2 p-2 bg-muted rounded-md">
                              <CertIcon size={16} className="mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">
                                  {result.certificate.name}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {result.certificate.subject}
                                </p>
                                {result.certificate.isTrusted ? (
                                  <Badge variant="outline" className="mt-1 text-xs border-green-600 text-green-600">
                                    <ShieldCheck size={10} className="mr-1" weight="fill" />
                                    Trusted
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="mt-1 text-xs border-yellow-600 text-yellow-600">
                                    <ShieldWarning size={10} className="mr-1" weight="fill" />
                                    Not Trusted
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </>
                        )}

                        {!signature.verified && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleVerifySignature(signature)
                            }}
                            disabled={isVerifying}
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            <ShieldCheck className="mr-2" size={14} />
                            Verify Signature
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="timeline" className="flex-1 m-0 overflow-hidden">
          <SignatureTimeline
            signatures={signatures}
            onSelectSignature={setSelectedSignature}
            selectedSignatureId={selectedSignature?.id}
          />
        </TabsContent>
      </Tabs>

      {!certificates || certificates.length === 0 ? (
        <div className="p-4 border-t bg-yellow-50 dark:bg-yellow-950/20">
          <div className="flex gap-2 text-sm text-yellow-800 dark:text-yellow-200">
            <Warning size={20} className="flex-shrink-0" weight="fill" />
            <div>
              <p className="font-medium">No certificates installed</p>
              <p className="text-xs mt-1">
                Add trusted certificates to verify signatures
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {(!tsaServers || tsaServers.length === 0) && (
        <div className="p-4 border-t bg-blue-50 dark:bg-blue-950/20">
          <div className="flex gap-2 text-sm text-blue-800 dark:text-blue-200">
            <Clock size={20} className="flex-shrink-0" weight="fill" />
            <div>
              <p className="font-medium">No TSA servers configured</p>
              <p className="text-xs mt-1">
                Add timestamp authority servers to validate timestamps
              </p>
              <Button
                onClick={() => setTsaDialogOpen(true)}
                variant="link"
                size="sm"
                className="h-auto p-0 mt-2 text-blue-800 dark:text-blue-200"
              >
                Configure TSA Servers →
              </Button>
            </div>
          </div>
        </div>
      )}

      <TSAServerDialog open={tsaDialogOpen} onOpenChange={setTsaDialogOpen} />
    </div>
  )
}
