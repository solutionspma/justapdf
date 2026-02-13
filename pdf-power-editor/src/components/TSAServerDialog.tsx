import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import {
  Clock,
  Plus,
  Trash,
  CheckCircle,
  Warning,
  X,
  PencilSimple,
  Globe,
  ShieldCheck
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import type { TSAServer } from '@/lib/types'
import { validateTSAServer, PRESET_TSA_SERVERS } from '@/lib/tsaServers'

interface TSAServerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TSAServerDialog({ open, onOpenChange }: TSAServerDialogProps) {
  const [servers, setServers] = useKV<TSAServer[]>('tsa-servers', [])
  const [editingServer, setEditingServer] = useState<TSAServer | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [formData, setFormData] = useState<Partial<TSAServer>>({
    name: '',
    url: '',
    enabled: true,
    isTrusted: false
  })
  const [isValidating, setIsValidating] = useState(false)

  const handleAddPreset = (preset: Omit<TSAServer, 'id' | 'addedDate'>) => {
    const exists = servers?.some(s => s.url === preset.url)
    if (exists) {
      toast.error('This TSA server is already in your list')
      return
    }

    const newServer: TSAServer = {
      ...preset,
      id: `tsa-${Date.now()}`,
      addedDate: new Date().toISOString()
    }
    setServers((current) => [...(current || []), newServer])
    toast.success(`Added ${preset.name}`)
  }

  const handleAddAllPresets = () => {
    let addedCount = 0
    const newServers = [...(servers || [])]

    PRESET_TSA_SERVERS.forEach((preset) => {
      const exists = newServers.some(s => s.url === preset.url)
      if (!exists) {
        const newServer: TSAServer = {
          ...preset,
          id: `tsa-${Date.now()}-${Math.random()}`,
          addedDate: new Date().toISOString()
        }
        newServers.push(newServer)
        addedCount++
      }
    })

    if (addedCount > 0) {
      setServers(newServers)
      toast.success(`Added ${addedCount} TSA server${addedCount > 1 ? 's' : ''}`)
    } else {
      toast.info('All preset TSA servers are already in your list')
    }
  }

  const handleSaveServer = async () => {
    if (!formData.name || !formData.url) {
      toast.error('Please fill in all required fields')
      return
    }

    if (editingServer) {
      setServers((current) =>
        (current || []).map(s =>
          s.id === editingServer.id
            ? { ...s, ...formData, lastValidated: new Date().toISOString() }
            : s
        )
      )
      toast.success('TSA server updated')
    } else {
      const newServer: TSAServer = {
        id: `tsa-${Date.now()}`,
        name: formData.name!,
        url: formData.url!,
        enabled: formData.enabled ?? true,
        isTrusted: formData.isTrusted ?? false,
        addedDate: new Date().toISOString(),
        description: formData.description
      }
      setServers((current) => [...(current || []), newServer])
      toast.success('TSA server added')
    }

    setEditingServer(null)
    setIsAddingNew(false)
    setFormData({ name: '', url: '', enabled: true, isTrusted: false })
  }

  const handleDeleteServer = (id: string) => {
    setServers((current) => (current || []).filter(s => s.id !== id))
    toast.success('TSA server removed')
  }

  const handleToggleServer = (id: string) => {
    setServers((current) =>
      (current || []).map(s =>
        s.id === id ? { ...s, enabled: !s.enabled } : s
      )
    )
  }

  const handleToggleTrust = (id: string) => {
    setServers((current) =>
      (current || []).map(s =>
        s.id === id ? { ...s, isTrusted: !s.isTrusted } : s
      )
    )
  }

  const handleValidateServer = async (server: TSAServer) => {
    setIsValidating(true)
    try {
      const result = await validateTSAServer(server.url)
      
      setServers((current) =>
        (current || []).map(s =>
          s.id === server.id
            ? {
                ...s,
                lastValidated: new Date().toISOString(),
                validationStatus: result.isValid ? 'valid' : 'invalid',
                validationError: result.error
              }
            : s
        )
      )

      if (result.isValid) {
        toast.success(`${server.name} is reachable and responding`)
      } else {
        toast.error(`${server.name} validation failed: ${result.error}`)
      }
    } catch (error) {
      toast.error('Failed to validate TSA server')
    } finally {
      setIsValidating(false)
    }
  }

  const handleEditServer = (server: TSAServer) => {
    setEditingServer(server)
    setFormData({
      name: server.name,
      url: server.url,
      enabled: server.enabled,
      isTrusted: server.isTrusted,
      description: server.description
    })
    setIsAddingNew(true)
  }

  const handleCancelEdit = () => {
    setEditingServer(null)
    setIsAddingNew(false)
    setFormData({ name: '', url: '', enabled: true, isTrusted: false })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center gap-3">
            <Clock size={32} weight="fill" className="text-primary" />
            <div>
              <DialogTitle>Timestamp Authority Servers</DialogTitle>
              <DialogDescription>
                Manage trusted TSA servers for signature timestamp validation
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        <div className="flex-1 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1 px-6">
            <div className="space-y-6 py-4">
              {isAddingNew && (
                <Card className="border-primary">
                  <CardHeader>
                    <CardTitle className="text-base">
                      {editingServer ? 'Edit TSA Server' : 'Add New TSA Server'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="server-name">Server Name *</Label>
                      <Input
                        id="server-name"
                        placeholder="e.g., DigiCert TSA"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="server-url">Server URL *</Label>
                      <Input
                        id="server-url"
                        placeholder="e.g., http://timestamp.digicert.com"
                        value={formData.url || ''}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="server-description">Description (Optional)</Label>
                      <Input
                        id="server-description"
                        placeholder="Additional notes about this TSA"
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="server-enabled">Enable Server</Label>
                      <Switch
                        id="server-enabled"
                        checked={formData.enabled ?? true}
                        onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="server-trusted">Mark as Trusted</Label>
                      <Switch
                        id="server-trusted"
                        checked={formData.isTrusted ?? false}
                        onCheckedChange={(checked) => setFormData({ ...formData, isTrusted: checked })}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleSaveServer} className="flex-1">
                        {editingServer ? 'Update Server' : 'Add Server'}
                      </Button>
                      <Button onClick={handleCancelEdit} variant="outline">
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">Preset TSA Servers</h3>
                  <Button
                    onClick={handleAddAllPresets}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="mr-2" size={14} />
                    Add All
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {PRESET_TSA_SERVERS.map((preset) => {
                    const alreadyAdded = servers?.some(s => s.url === preset.url)
                    return (
                      <Card key={preset.url} className="relative">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <Globe size={16} className="text-primary flex-shrink-0" />
                              <CardTitle className="text-sm">{preset.name}</CardTitle>
                            </div>
                            {alreadyAdded && (
                              <Badge variant="outline" className="text-xs">
                                <CheckCircle size={10} className="mr-1" />
                                Added
                              </Badge>
                            )}
                          </div>
                          {preset.description && (
                            <CardDescription className="text-xs">
                              {preset.description}
                            </CardDescription>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <p className="text-xs text-muted-foreground break-all font-mono">
                              {preset.url}
                            </p>
                            <Button
                              onClick={() => handleAddPreset(preset)}
                              disabled={alreadyAdded}
                              variant="outline"
                              size="sm"
                              className="w-full"
                            >
                              <Plus className="mr-2" size={14} />
                              {alreadyAdded ? 'Already Added' : 'Add to List'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>

              <Separator />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">
                    Your TSA Servers ({servers?.length || 0})
                  </h3>
                  <Button
                    onClick={() => {
                      setIsAddingNew(true)
                      setEditingServer(null)
                      setFormData({ name: '', url: '', enabled: true, isTrusted: false })
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="mr-2" size={14} />
                    Add Custom
                  </Button>
                </div>

                {!servers || servers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock size={48} className="mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No TSA servers configured</p>
                    <p className="text-xs mt-1">Add servers from presets or create custom ones</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {servers.map((server) => (
                      <Card key={server.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-sm">{server.name}</h4>
                                  {server.isTrusted && (
                                    <Badge variant="outline" className="text-xs border-green-600 text-green-600">
                                      <ShieldCheck size={10} className="mr-1" weight="fill" />
                                      Trusted
                                    </Badge>
                                  )}
                                  {!server.enabled && (
                                    <Badge variant="outline" className="text-xs">
                                      Disabled
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              <p className="text-xs text-muted-foreground break-all font-mono mb-2">
                                {server.url}
                              </p>

                              {server.description && (
                                <p className="text-xs text-muted-foreground mb-2">
                                  {server.description}
                                </p>
                              )}

                              {server.lastValidated && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  {server.validationStatus === 'valid' ? (
                                    <CheckCircle size={12} className="text-green-600" weight="fill" />
                                  ) : server.validationStatus === 'invalid' ? (
                                    <Warning size={12} className="text-red-600" weight="fill" />
                                  ) : null}
                                  <span>
                                    Last validated: {new Date(server.lastValidated).toLocaleDateString()}
                                  </span>
                                  {server.validationError && (
                                    <span className="text-red-600">- {server.validationError}</span>
                                  )}
                                </div>
                              )}

                              <div className="flex items-center gap-2 mt-3">
                                <Button
                                  onClick={() => handleValidateServer(server)}
                                  disabled={isValidating}
                                  variant="outline"
                                  size="sm"
                                >
                                  <CheckCircle className="mr-2" size={14} />
                                  Validate
                                </Button>

                                <Button
                                  onClick={() => handleToggleServer(server.id)}
                                  variant="outline"
                                  size="sm"
                                >
                                  {server.enabled ? 'Disable' : 'Enable'}
                                </Button>

                                <Button
                                  onClick={() => handleToggleTrust(server.id)}
                                  variant="outline"
                                  size="sm"
                                >
                                  <ShieldCheck className="mr-2" size={14} />
                                  {server.isTrusted ? 'Untrust' : 'Trust'}
                                </Button>

                                <Button
                                  onClick={() => handleEditServer(server)}
                                  variant="ghost"
                                  size="sm"
                                >
                                  <PencilSimple size={14} />
                                </Button>

                                <Button
                                  onClick={() => handleDeleteServer(server.id)}
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash size={14} />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>

        <Separator />

        <DialogFooter className="p-6 pt-4">
          <Button onClick={() => onOpenChange(false)} variant="outline">
            <X className="mr-2" size={14} />
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
