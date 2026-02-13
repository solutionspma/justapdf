import type { TSAServer } from './types'

export const PRESET_TSA_SERVERS: Omit<TSAServer, 'id' | 'addedDate'>[] = [
  {
    name: 'DigiCert Timestamp Server',
    url: 'http://timestamp.digicert.com',
    enabled: true,
    isTrusted: true,
    description: 'DigiCert\'s free timestamp authority service'
  },
  {
    name: 'Sectigo Timestamp Server',
    url: 'http://timestamp.sectigo.com',
    enabled: true,
    isTrusted: true,
    description: 'Sectigo (formerly Comodo) timestamp service'
  },
  {
    name: 'GlobalSign TSA',
    url: 'http://timestamp.globalsign.com/tsa/r6advanced1',
    enabled: true,
    isTrusted: true,
    description: 'GlobalSign\'s RFC 3161 compliant TSA'
  },
  {
    name: 'Entrust Timestamp Server',
    url: 'http://timestamp.entrust.net/TSS/RFC3161sha2TS',
    enabled: true,
    isTrusted: true,
    description: 'Entrust RFC 3161 timestamp service'
  },
  {
    name: 'SSL.com Timestamp Server',
    url: 'http://ts.ssl.com',
    enabled: true,
    isTrusted: true,
    description: 'SSL.com public timestamp authority'
  },
  {
    name: 'SwissSign TSA',
    url: 'http://tsa.swisssign.net',
    enabled: true,
    isTrusted: true,
    description: 'SwissSign timestamp authority'
  },
  {
    name: 'QuoVadis TSA',
    url: 'http://tsa01.quovadisglobal.com/TSS/HttpTspServer',
    enabled: true,
    isTrusted: true,
    description: 'QuoVadis Global timestamp service'
  },
  {
    name: 'Verisign TSA',
    url: 'http://sha256timestamp.ws.symantec.com/sha256/timestamp',
    enabled: true,
    isTrusted: true,
    description: 'Symantec/Verisign SHA-256 timestamp'
  },
  {
    name: 'Thawte Timestamp Server',
    url: 'http://timestamp.thawte.com',
    enabled: true,
    isTrusted: true,
    description: 'Thawte timestamp authority service'
  },
  {
    name: 'GlobalTrust TSA',
    url: 'http://tsa.globaltrust.eu/tsa',
    enabled: true,
    isTrusted: true,
    description: 'GlobalTrust European timestamp service'
  },
  {
    name: 'Certum TSA',
    url: 'http://time.certum.pl',
    enabled: true,
    isTrusted: true,
    description: 'Certum Polish timestamp authority'
  },
  {
    name: 'Adobe Timestamp',
    url: 'http://timestamp.adobe.com',
    enabled: true,
    isTrusted: true,
    description: 'Adobe\'s document timestamp service'
  }
]

export async function validateTSAServer(url: string): Promise<{
  isValid: boolean
  error?: string
  responseTime?: number
}> {
  const startTime = Date.now()
  
  try {
    if (!url || !url.startsWith('http://') && !url.startsWith('https://')) {
      return {
        isValid: false,
        error: 'Invalid URL format'
      }
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    try {
      const response = await fetch(url, {
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      const responseTime = Date.now() - startTime

      return {
        isValid: true,
        responseTime
      }
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      
      if (fetchError.name === 'AbortError') {
        return {
          isValid: false,
          error: 'Request timeout (5s)'
        }
      }

      return {
        isValid: false,
        error: fetchError.message || 'Connection failed'
      }
    }
  } catch (error: any) {
    return {
      isValid: false,
      error: error.message || 'Unknown error'
    }
  }
}

export function getTSAServerByUrl(servers: TSAServer[], url: string): TSAServer | undefined {
  return servers.find(server => server.url === url && server.enabled)
}

export function getEnabledTSAServers(servers: TSAServer[]): TSAServer[] {
  return servers.filter(server => server.enabled)
}

export function getTrustedTSAServers(servers: TSAServer[]): TSAServer[] {
  return servers.filter(server => server.enabled && server.isTrusted)
}

export function validateTimestampAgainstTSA(
  timestampToken: any,
  tsaServers: TSAServer[]
): {
  isValid: boolean
  matchedServer?: TSAServer
  errors: string[]
} {
  const errors: string[] = []

  if (!timestampToken?.tsaUrl) {
    return {
      isValid: false,
      errors: ['Timestamp token missing TSA URL']
    }
  }

  const matchedServer = getTSAServerByUrl(tsaServers, timestampToken.tsaUrl)

  if (!matchedServer) {
    errors.push(`TSA server not found in trusted list: ${timestampToken.tsaUrl}`)
    return {
      isValid: false,
      errors
    }
  }

  if (!matchedServer.enabled) {
    errors.push(`TSA server is disabled: ${matchedServer.name}`)
    return {
      isValid: false,
      matchedServer,
      errors
    }
  }

  if (!matchedServer.isTrusted) {
    errors.push(`TSA server is not marked as trusted: ${matchedServer.name}`)
    return {
      isValid: false,
      matchedServer,
      errors
    }
  }

  return {
    isValid: true,
    matchedServer,
    errors: []
  }
}
