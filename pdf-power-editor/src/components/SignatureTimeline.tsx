import { useMemo } from 'react'
import {
  Clock,
  CheckCircle,
  Warning,
  Signature,
  Certificate as CertIcon,
  CalendarCheck,
  MapPin,
  User
} from '@phosphor-icons/react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { DigitalSignature } from '@/lib/types'
import { cn } from '@/lib/utils'

interface TimelineEvent {
  id: string
  type: 'signature' | 'timestamp'
  date: string
  signature: DigitalSignature
  title: string
  subtitle: string
  status: 'valid' | 'invalid' | 'unknown'
  icon: React.ReactNode
}

interface SignatureTimelineProps {
  signatures: DigitalSignature[]
  onSelectSignature?: (signature: DigitalSignature) => void
  selectedSignatureId?: string
}

export function SignatureTimeline({
  signatures,
  onSelectSignature,
  selectedSignatureId
}: SignatureTimelineProps) {
  const timelineEvents = useMemo(() => {
    const events: TimelineEvent[] = []

    signatures.forEach((signature) => {
      events.push({
        id: `sig-${signature.id}`,
        type: 'signature',
        date: signature.signedDate,
        signature,
        title: `Signed by ${signature.signedBy}`,
        subtitle: signature.reason || 'Digital signature applied',
        status: signature.status,
        icon: <Signature size={16} weight="fill" />
      })

      if (signature.timestampToken) {
        events.push({
          id: `ts-${signature.id}`,
          type: 'timestamp',
          date: signature.timestampToken.issuedAt,
          signature,
          title: `Timestamp issued`,
          subtitle: `By ${signature.timestampToken.issuedBy}`,
          status: signature.timestampValidation?.isValid ? 'valid' : signature.timestampValidation ? 'invalid' : 'unknown',
          icon: <Clock size={16} weight="fill" />
        })
      }

      if (signature.verificationDate) {
        events.push({
          id: `ver-${signature.id}`,
          type: 'signature',
          date: signature.verificationDate,
          signature,
          title: 'Signature verified',
          subtitle: signature.verificationDetails || 'Verification completed',
          status: signature.status,
          icon: <CheckCircle size={16} weight="fill" />
        })
      }
    })

    return events.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
  }, [signatures])

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return {
        date: date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        }),
        time: date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true
        })
      }
    } catch {
      return { date: dateStr, time: '' }
    }
  }

  const getStatusColor = (status: 'valid' | 'invalid' | 'unknown') => {
    switch (status) {
      case 'valid':
        return 'text-green-600 border-green-600'
      case 'invalid':
        return 'text-red-600 border-red-600'
      default:
        return 'text-gray-600 border-gray-600'
    }
  }

  const getStatusIcon = (status: 'valid' | 'invalid' | 'unknown') => {
    switch (status) {
      case 'valid':
        return <CheckCircle size={12} weight="fill" className="text-green-600" />
      case 'invalid':
        return <Warning size={12} weight="fill" className="text-red-600" />
      default:
        return null
    }
  }

  if (timelineEvents.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <CalendarCheck size={48} className="mx-auto mb-4 opacity-50" />
        <p>No timeline events</p>
        <p className="text-sm mt-2">Signatures and timestamps will appear here</p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="relative px-6 py-4">
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />
        
        <div className="space-y-6">
          {timelineEvents.map((event, index) => {
            const { date, time } = formatDate(event.date)
            const isSelected = selectedSignatureId === event.signature.id
            
            return (
              <div key={event.id} className="relative">
                <div 
                  className={cn(
                    "absolute left-[1.875rem] w-4 h-4 rounded-full border-2 bg-background",
                    getStatusColor(event.status)
                  )}
                />
                
                <Card
                  className={cn(
                    "ml-14 cursor-pointer transition-all hover:shadow-md",
                    isSelected && "border-primary shadow-md",
                    event.type === 'timestamp' && "bg-accent/30"
                  )}
                  onClick={() => onSelectSignature?.(event.signature)}
                >
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1">
                        <div className={cn(
                          "mt-0.5 flex-shrink-0",
                          getStatusColor(event.status)
                        )}>
                          {event.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold truncate">
                              {event.title}
                            </h4>
                            {getStatusIcon(event.status)}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {event.subtitle}
                          </p>
                        </div>
                      </div>
                      
                      <Badge variant="outline" className="text-xs whitespace-nowrap flex-shrink-0">
                        {event.type === 'signature' ? <Signature size={10} className="mr-1" /> : <Clock size={10} className="mr-1" />}
                        {event.type === 'signature' ? 'Signature' : 'Timestamp'}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CalendarCheck size={12} />
                        <span>{date}</span>
                      </div>
                      {time && (
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          <span>{time}</span>
                        </div>
                      )}
                    </div>

                    {event.signature.location && event.type === 'signature' && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin size={12} />
                        <span className="truncate">{event.signature.location}</span>
                      </div>
                    )}

                    {event.type === 'timestamp' && event.signature.timestampToken?.tsaUrl && (
                      <div className="text-xs">
                        <Label className="text-xs text-muted-foreground">TSA URL</Label>
                        <p className="font-mono text-xs truncate" title={event.signature.timestampToken.tsaUrl}>
                          {event.signature.timestampToken.tsaUrl}
                        </p>
                      </div>
                    )}

                    {event.type === 'timestamp' && event.signature.timestampToken?.digestAlgorithm && (
                      <div className="flex items-center gap-4 text-xs">
                        <div>
                          <Label className="text-xs text-muted-foreground">Algorithm</Label>
                          <p className="font-mono">{event.signature.timestampToken.digestAlgorithm}</p>
                        </div>
                        {event.signature.timestampToken.accuracy && (
                          <div>
                            <Label className="text-xs text-muted-foreground">Accuracy</Label>
                            <p className="font-mono">{event.signature.timestampToken.accuracy}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>
      </div>
    </ScrollArea>
  )
}
