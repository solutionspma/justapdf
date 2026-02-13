import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import {
  Certificate as CertIcon,
  Trash,
  Plus,
  Warning,
  CheckCircle,
  X,
  Info,
  Upload,
  ShieldCheck,
  ShieldWarning
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import type { Certificate } from '@/lib/types'
import {
  getCertificateStatus,
  formatCertificateDate,
  getCertificateUsageString,
  parseCertificateFromFile,
  verifyCertificate
} from '@/lib/certificates'
import { cn } from '@/lib/utils'

interface CertificateDialogProps {
  trigger?: React.ReactNode
}

export function CertificateDialog({ trigger }: CertificateDialogProps) {
  const [certificates, setCertificates] = useKV<Certificate[]>('pdf-certificates', [])
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null)
  const [isAddingCert, setIsAddingCert] = useState(false)
  const [newCertForm, setNewCertForm] = useState<Partial<Certificate>>({
    name: '',
    issuer: '',
    subject: '',
    serialNumber: '',
    validFrom: '',
    validTo: '',
    usages: [],
    isTrusted: false,
    notes: ''
  })

  const handleDeleteCertificate = (certId: string) => {
    setCertificates((current) => current?.filter(cert => cert.id !== certId) || [])
    if (selectedCert?.id === certId) {
      setSelectedCert(null)
    }
    toast.success('Certificate deleted')
  }

  const handleToggleTrust = (certId: string) => {
    setCertificates((current) => 
      current?.map(cert => 
        cert.id === certId 
          ? { ...cert, isTrusted: !cert.isTrusted }
          : cert
      ) || []
    )
    if (selectedCert?.id === certId) {
      setSelectedCert({ ...selectedCert, isTrusted: !selectedCert.isTrusted })
    }
    toast.success('Certificate trust updated')
  }

  const handleImportCertificate = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const parsed = await parseCertificateFromFile(file)
    if (!parsed) {
      toast.error('Failed to parse certificate file')
      return
    }

    setNewCertForm({
      ...newCertForm,
      name: file.name.replace(/\.[^/.]+$/, ''),
      publicKey: parsed.publicKey,
      fingerprint: parsed.fingerprint
    })
    setIsAddingCert(true)
    toast.success('Certificate file loaded')
  }

  const handleAddCertificate = async () => {
    if (!newCertForm.name || !newCertForm.subject || !newCertForm.validFrom || !newCertForm.validTo) {
      toast.error('Please fill in all required fields')
      return
    }

    const newCert: Certificate = {
      id: `cert-${Date.now()}`,
      name: newCertForm.name,
      issuer: newCertForm.issuer || 'Self-Signed',
      subject: newCertForm.subject,
      serialNumber: newCertForm.serialNumber || `SN-${Date.now()}`,
      validFrom: newCertForm.validFrom,
      validTo: newCertForm.validTo,
      fingerprint: newCertForm.fingerprint || `FP:${Math.random().toString(36).substr(2, 16).toUpperCase()}`,
      publicKey: newCertForm.publicKey || '',
      isTrusted: newCertForm.isTrusted || false,
      usages: newCertForm.usages || ['Digital Signature', 'Document Signing'],
      status: 'valid',
      addedDate: new Date().toISOString(),
      notes: newCertForm.notes
    }

    const verification = await verifyCertificate(newCert)
    newCert.status = verification.status

    setCertificates((current) => [...(current || []), newCert])
    
    setIsAddingCert(false)
    setNewCertForm({
      name: '',
      issuer: '',
      subject: '',
      serialNumber: '',
      validFrom: '',
      validTo: '',
      usages: [],
      isTrusted: false,
      notes: ''
    })
    
    toast.success('Certificate added successfully')
  }

  const getStatusIcon = (status: Certificate['status']) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="text-green-600" weight="fill" />
      case 'expired':
        return <Warning className="text-red-600" weight="fill" />
      case 'untrusted':
        return <ShieldWarning className="text-yellow-600" weight="fill" />
      default:
        return <Info className="text-gray-600" weight="fill" />
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="h-8 w-8 p-0" title="Certificates">
            <CertIcon size={16} weight="bold" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck size={24} weight="fill" className="text-primary" />
            Certificate Management
          </DialogTitle>
          <DialogDescription>
            Manage trusted certificates for digital signature verification
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden px-6">
          <Tabs defaultValue="certificates" className="h-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="certificates">
                Certificates ({certificates?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="details" disabled={!selectedCert}>
                Certificate Details
              </TabsTrigger>
            </TabsList>

            <TabsContent value="certificates" className="mt-4">
              <div className="flex gap-2 mb-4">
                <Button
                  onClick={() => setIsAddingCert(true)}
                  variant="default"
                  size="sm"
                  className="flex-shrink-0"
                >
                  <Plus className="mr-2" />
                  Add Certificate
                </Button>
                
                <Label htmlFor="cert-file-upload" className="flex-shrink-0">
                  <Button variant="outline" size="sm" asChild>
                    <span>
                      <Upload className="mr-2" />
                      Import Certificate
                    </span>
                  </Button>
                </Label>
                <Input
                  id="cert-file-upload"
                  type="file"
                  accept=".pem,.crt,.cer,.der"
                  onChange={handleImportCertificate}
                  className="hidden"
                />
              </div>

              {isAddingCert && (
                <div className="border rounded-lg p-4 mb-4 bg-muted/30">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Add New Certificate</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsAddingCert(false)}
                    >
                      <X />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cert-name">Certificate Name *</Label>
                      <Input
                        id="cert-name"
                        value={newCertForm.name}
                        onChange={(e) => setNewCertForm({ ...newCertForm, name: e.target.value })}
                        placeholder="My Certificate"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="cert-subject">Subject (Owner) *</Label>
                      <Input
                        id="cert-subject"
                        value={newCertForm.subject}
                        onChange={(e) => setNewCertForm({ ...newCertForm, subject: e.target.value })}
                        placeholder="CN=John Doe, O=Company"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="cert-issuer">Issuer</Label>
                      <Input
                        id="cert-issuer"
                        value={newCertForm.issuer}
                        onChange={(e) => setNewCertForm({ ...newCertForm, issuer: e.target.value })}
                        placeholder="CN=Certificate Authority"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="cert-serial">Serial Number</Label>
                      <Input
                        id="cert-serial"
                        value={newCertForm.serialNumber}
                        onChange={(e) => setNewCertForm({ ...newCertForm, serialNumber: e.target.value })}
                        placeholder="Auto-generated"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="cert-valid-from">Valid From *</Label>
                      <Input
                        id="cert-valid-from"
                        type="datetime-local"
                        value={newCertForm.validFrom}
                        onChange={(e) => setNewCertForm({ ...newCertForm, validFrom: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="cert-valid-to">Valid To *</Label>
                      <Input
                        id="cert-valid-to"
                        type="datetime-local"
                        value={newCertForm.validTo}
                        onChange={(e) => setNewCertForm({ ...newCertForm, validTo: e.target.value })}
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <Label htmlFor="cert-notes">Notes</Label>
                      <Textarea
                        id="cert-notes"
                        value={newCertForm.notes}
                        onChange={(e) => setNewCertForm({ ...newCertForm, notes: e.target.value })}
                        placeholder="Additional information about this certificate"
                        rows={2}
                      />
                    </div>
                    
                    <div className="col-span-2 flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="cert-trusted"
                        checked={newCertForm.isTrusted}
                        onChange={(e) => setNewCertForm({ ...newCertForm, isTrusted: e.target.checked })}
                        className="rounded"
                      />
                      <Label htmlFor="cert-trusted" className="cursor-pointer">
                        Trust this certificate
                      </Label>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => setIsAddingCert(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddCertificate}>
                      Add Certificate
                    </Button>
                  </div>
                </div>
              )}

              <ScrollArea className="h-[400px]">
                {!certificates || certificates.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <ShieldWarning size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No certificates added yet</p>
                    <p className="text-sm mt-2">Add certificates to verify digital signatures</p>
                  </div>
                ) : (
                  <div className="space-y-2 pr-4">
                    {certificates.map((cert) => {
                      const statusInfo = getCertificateStatus(cert)
                      return (
                        <div
                          key={cert.id}
                          className={cn(
                            "border rounded-lg p-4 cursor-pointer transition-colors",
                            selectedCert?.id === cert.id 
                              ? "border-primary bg-primary/5" 
                              : "hover:border-primary/50"
                          )}
                          onClick={() => setSelectedCert(cert)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {getStatusIcon(statusInfo.status)}
                                <h4 className="font-semibold">{cert.name}</h4>
                                <Badge variant={statusInfo.variant === 'success' ? 'default' : 'destructive'}>
                                  {statusInfo.message}
                                </Badge>
                                {cert.isTrusted && (
                                  <Badge variant="outline" className="border-green-600 text-green-600">
                                    <ShieldCheck size={12} className="mr-1" weight="fill" />
                                    Trusted
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-1">
                                <strong>Subject:</strong> {cert.subject}
                              </p>
                              <p className="text-sm text-muted-foreground mb-1">
                                <strong>Issuer:</strong> {cert.issuer}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                <strong>Valid:</strong> {formatCertificateDate(cert.validFrom)} - {formatCertificateDate(cert.validTo)}
                              </p>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleToggleTrust(cert.id)
                                }}
                                title={cert.isTrusted ? 'Revoke trust' : 'Mark as trusted'}
                              >
                                {cert.isTrusted ? (
                                  <ShieldCheck className="text-green-600" weight="fill" />
                                ) : (
                                  <ShieldWarning className="text-yellow-600" weight="fill" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteCertificate(cert.id)
                                }}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="details" className="mt-4">
              {selectedCert && (
                <ScrollArea className="h-[450px] pr-4">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        {getStatusIcon(getCertificateStatus(selectedCert).status)}
                        {selectedCert.name}
                      </h3>
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground">STATUS</Label>
                      <p className="font-mono text-sm">
                        {getCertificateStatus(selectedCert).message}
                      </p>
                    </div>

                    <Separator />

                    <div>
                      <Label className="text-xs text-muted-foreground">SUBJECT (OWNER)</Label>
                      <p className="font-mono text-sm break-all">{selectedCert.subject}</p>
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground">ISSUER</Label>
                      <p className="font-mono text-sm break-all">{selectedCert.issuer}</p>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">SERIAL NUMBER</Label>
                        <p className="font-mono text-sm">{selectedCert.serialNumber}</p>
                      </div>
                      
                      <div>
                        <Label className="text-xs text-muted-foreground">FINGERPRINT</Label>
                        <p className="font-mono text-xs break-all">{selectedCert.fingerprint}</p>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <Label className="text-xs text-muted-foreground">VALID FROM</Label>
                      <p className="font-mono text-sm">{formatCertificateDate(selectedCert.validFrom)}</p>
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground">VALID TO</Label>
                      <p className="font-mono text-sm">{formatCertificateDate(selectedCert.validTo)}</p>
                    </div>

                    <Separator />

                    <div>
                      <Label className="text-xs text-muted-foreground">KEY USAGE</Label>
                      <p className="text-sm">{getCertificateUsageString(selectedCert.usages)}</p>
                    </div>

                    {selectedCert.notes && (
                      <>
                        <Separator />
                        <div>
                          <Label className="text-xs text-muted-foreground">NOTES</Label>
                          <p className="text-sm">{selectedCert.notes}</p>
                        </div>
                      </>
                    )}

                    <Separator />

                    <div>
                      <Label className="text-xs text-muted-foreground">ADDED DATE</Label>
                      <p className="font-mono text-sm">{formatCertificateDate(selectedCert.addedDate)}</p>
                    </div>

                    <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
                      {selectedCert.isTrusted ? (
                        <>
                          <ShieldCheck size={20} className="text-green-600" weight="fill" />
                          <span className="text-sm">This certificate is trusted for signature verification</span>
                        </>
                      ) : (
                        <>
                          <ShieldWarning size={20} className="text-yellow-600" weight="fill" />
                          <span className="text-sm">This certificate is not trusted</span>
                        </>
                      )}
                    </div>
                  </div>
                </ScrollArea>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="px-6 pb-6">
          <Button variant="outline" onClick={() => setSelectedCert(null)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
