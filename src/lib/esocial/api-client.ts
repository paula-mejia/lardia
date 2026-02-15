/**
 * eSocial SOAP API client.
 * Handles communication with eSocial web services using digital certificate.
 */

import * as https from 'https'
import * as crypto from 'crypto'
import { parseStringPromise } from 'xml2js'
import { CertificateBundle } from './certificate'

// eSocial environments
export const ESOCIAL_ENDPOINTS = {
  // Restricted production (testing)
  restricted: {
    enviarLoteEventos:
      'https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.svc',
    consultarLoteEventos:
      'https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/lote/eventos/envio/consulta/retornoProcessamento/WsConsultarLoteEventos.svc',
  },
  // Real production
  production: {
    enviarLoteEventos:
      'https://webservices.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.svc',
    consultarLoteEventos:
      'https://webservices.esocial.gov.br/servicos/empregador/lote/eventos/envio/consulta/retornoProcessamento/WsConsultarLoteEventos.svc',
  },
} as const

export type EsocialEnvironment = keyof typeof ESOCIAL_ENDPOINTS

// SOAP Actions
const SOAP_ACTIONS = {
  enviarLoteEventos:
    'http://www.esocial.gov.br/servicos/empregador/lote/eventos/envio/v1_1_0/ServicoEnviarLoteEventos/EnviarLoteEventos',
  consultarLoteEventos:
    'http://www.esocial.gov.br/servicos/empregador/lote/eventos/envio/consulta/retornoProcessamento/v1_1_0/ServicoConsultarLoteEventos/ConsultarLoteEventos',
}

// Response types
export interface EsocialApiResponse {
  success: boolean
  statusCode: number
  statusDescription: string
  protocol?: string
  occurrences: EsocialOccurrence[]
  rawXml: string
  httpStatus: number
}

export interface EsocialOccurrence {
  code: string
  description: string
  type: string
  location?: string
}

export interface EventSubmission {
  eventId: string
  eventXml: string
}

// API interaction log entry
export interface ApiLogEntry {
  timestamp: string
  endpoint: string
  action: string
  requestXml: string
  responseXml: string
  httpStatus: number
  esocialStatus: number
  duration: number
}

/**
 * Generate an eSocial event ID.
 * Format: ID + tpInsc(1) + nrInsc(14) + YYYY(4) + MM(2) + DD(2) + HH(2) + mm(2) + ss(2) + seq(5)
 */
export function generateEventId(tpInsc: number, nrInsc: string, sequence: number = 1): string {
  const now = new Date()
  const dateStr =
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0') +
    String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0') +
    String(now.getSeconds()).padStart(2, '0')
  const seqStr = String(sequence).padStart(5, '0')
  return `ID${tpInsc}${nrInsc.padStart(14, '0')}${dateStr}${seqStr}`
}

/**
 * Build SOAP envelope for EnviarLoteEventos.
 */
export function buildEnviarLoteEnvelope(
  tpInsc: number,
  nrInsc: string,
  grupo: number,
  events: EventSubmission[]
): string {
  // nrInsc for ideEmpregador uses first 8 digits for CNPJ (raiz)
  const nrInscEmpregador = nrInsc.substring(0, 8)

  const eventosXml = events
    .map((e) => `<evento Id="${e.eventId}">${e.eventXml}</evento>`)
    .join('\n              ')

  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v1="http://www.esocial.gov.br/servicos/empregador/lote/eventos/envio/v1_1_0">
  <soapenv:Header/>
  <soapenv:Body>
    <v1:EnviarLoteEventos>
      <v1:loteEventos>
        <eSocial xmlns="http://www.esocial.gov.br/schema/lote/eventos/envio/v1_1_1">
          <envioLoteEventos grupo="${grupo}">
            <ideEmpregador>
              <tpInsc>${tpInsc}</tpInsc>
              <nrInsc>${nrInscEmpregador}</nrInsc>
            </ideEmpregador>
            <ideTransmissor>
              <tpInsc>${tpInsc}</tpInsc>
              <nrInsc>${nrInsc}</nrInsc>
            </ideTransmissor>
            <eventos>
              ${eventosXml}
            </eventos>
          </envioLoteEventos>
        </eSocial>
      </v1:loteEventos>
    </v1:EnviarLoteEventos>
  </soapenv:Body>
</soapenv:Envelope>`
}

/**
 * Build SOAP envelope for ConsultarLoteEventos.
 */
export function buildConsultarLoteEnvelope(protocoloEnvio: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v1="http://www.esocial.gov.br/servicos/empregador/lote/eventos/envio/consulta/retornoProcessamento/v1_1_0">
  <soapenv:Header/>
  <soapenv:Body>
    <v1:ConsultarLoteEventos>
      <v1:consulta>
        <eSocial xmlns="http://www.esocial.gov.br/schema/lote/eventos/envio/consulta/retornoProcessamento/v1_1_0">
          <consultaLoteEventos>
            <protocoloEnvio>${protocoloEnvio}</protocoloEnvio>
          </consultaLoteEventos>
        </eSocial>
      </v1:consulta>
    </v1:ConsultarLoteEventos>
  </soapenv:Body>
</soapenv:Envelope>`
}

/**
 * eSocial API client class.
 */
export class EsocialApiClient {
  private cert: CertificateBundle
  private environment: EsocialEnvironment
  private logs: ApiLogEntry[] = []
  private onLog?: (entry: ApiLogEntry) => void

  constructor(
    cert: CertificateBundle,
    environment: EsocialEnvironment = 'restricted',
    onLog?: (entry: ApiLogEntry) => void
  ) {
    this.cert = cert
    this.environment = environment
    this.onLog = onLog
  }

  /**
   * Send a SOAP request to an eSocial endpoint.
   */
  private async soapRequest(url: string, soapAction: string, body: string): Promise<{ status: number; data: string }> {
    const startTime = Date.now()
    const urlObj = new URL(url)

    return new Promise((resolve, reject) => {
      const options: https.RequestOptions = {
        hostname: urlObj.hostname,
        port: 443,
        path: urlObj.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml;charset=UTF-8',
          'SOAPAction': soapAction,
          'Content-Length': Buffer.byteLength(body),
        },
        cert: this.cert.certPem,
        key: this.cert.keyPem,
        // Force HTTP/1.1 (eSocial does TLS renegotiation for client cert)
        agent: new https.Agent({
          cert: this.cert.certPem,
          key: this.cert.keyPem,
          secureOptions: crypto.constants?.SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION,
        }),
      }

      const req = https.request(options, (res) => {
        let data = ''
        res.on('data', (chunk) => { data += chunk })
        res.on('end', () => {
          const duration = Date.now() - startTime
          const entry: ApiLogEntry = {
            timestamp: new Date().toISOString(),
            endpoint: url,
            action: soapAction.split('/').pop() || '',
            requestXml: body.substring(0, 2000),
            responseXml: data.substring(0, 5000),
            httpStatus: res.statusCode || 0,
            esocialStatus: 0,
            duration,
          }
          this.logs.push(entry)
          this.onLog?.(entry)
          resolve({ status: res.statusCode || 0, data })
        })
      })

      req.on('error', (err) => reject(err))
      req.setTimeout(30000, () => {
        req.destroy()
        reject(new Error('Request timeout after 30s'))
      })

      req.write(body)
      req.end()
    })
  }

  /**
   * Submit a batch of events to eSocial.
   */
  async enviarLoteEventos(
    tpInsc: number,
    nrInsc: string,
    grupo: number,
    events: EventSubmission[]
  ): Promise<EsocialApiResponse> {
    const endpoints = ESOCIAL_ENDPOINTS[this.environment]
    const envelope = buildEnviarLoteEnvelope(tpInsc, nrInsc, grupo, events)

    try {
      const { status, data } = await this.soapRequest(
        endpoints.enviarLoteEventos,
        SOAP_ACTIONS.enviarLoteEventos,
        envelope
      )

      return this.parseResponse(data, status)
    } catch (error) {
      return {
        success: false,
        statusCode: -1,
        statusDescription: `Connection error: ${(error as Error).message}`,
        occurrences: [],
        rawXml: '',
        httpStatus: 0,
      }
    }
  }

  /**
   * Query the result of a previously submitted batch.
   */
  async consultarLoteEventos(protocoloEnvio: string): Promise<EsocialApiResponse> {
    const endpoints = ESOCIAL_ENDPOINTS[this.environment]
    const envelope = buildConsultarLoteEnvelope(protocoloEnvio)

    try {
      const { status, data } = await this.soapRequest(
        endpoints.consultarLoteEventos,
        SOAP_ACTIONS.consultarLoteEventos,
        envelope
      )

      return this.parseResponse(data, status)
    } catch (error) {
      return {
        success: false,
        statusCode: -1,
        statusDescription: `Connection error: ${(error as Error).message}`,
        occurrences: [],
        rawXml: '',
        httpStatus: 0,
      }
    }
  }

  /**
   * Parse the SOAP response XML into a structured response.
   */
  private async parseResponse(xml: string, httpStatus: number): Promise<EsocialApiResponse> {
    try {
      const parsed = await parseStringPromise(xml, { explicitArray: false, ignoreAttrs: false })

      // Navigate the SOAP envelope to get the eSocial response
      const body = parsed?.['s:Envelope']?.['s:Body']
      const enviarResult = body?.EnviarLoteEventosResponse?.EnviarLoteEventosResult
      const consultarResult = body?.ConsultarLoteEventosResponse?.ConsultarLoteEventosResult

      const esocialResult = enviarResult || consultarResult
      if (!esocialResult) {
        return {
          success: false,
          statusCode: -2,
          statusDescription: 'Could not parse eSocial response',
          occurrences: [],
          rawXml: xml,
          httpStatus,
        }
      }

      // Extract the retorno
      const esocial = esocialResult.eSocial || esocialResult
      const retorno =
        esocial?.retornoEnvioLoteEventos ||
        esocial?.retornoProcessamentoLoteEventos

      if (!retorno) {
        return {
          success: false,
          statusCode: -2,
          statusDescription: 'No retorno found in response',
          occurrences: [],
          rawXml: xml,
          httpStatus,
        }
      }

      const status = retorno.status || {}
      const cdResposta = parseInt(status.cdResposta || '-1', 10)
      const descResposta = status.descResposta || 'Unknown'
      const protocol = retorno.dadosRecepcaoLote?.protocoloEnvio

      // Parse occurrences
      const occurrences: EsocialOccurrence[] = []
      const ocorrencias = status.ocorrencias?.ocorrencia
      if (ocorrencias) {
        const ocList = Array.isArray(ocorrencias) ? ocorrencias : [ocorrencias]
        for (const oc of ocList) {
          occurrences.push({
            code: oc.codigo || '',
            description: oc.descricao || '',
            type: oc.tipo || '',
            location: oc.localizacao || '',
          })
        }
      }

      return {
        success: cdResposta === 201 || cdResposta === 202,
        statusCode: cdResposta,
        statusDescription: descResposta,
        protocol,
        occurrences,
        rawXml: xml,
        httpStatus,
      }
    } catch (parseError) {
      return {
        success: false,
        statusCode: -3,
        statusDescription: `XML parse error: ${(parseError as Error).message}`,
        occurrences: [],
        rawXml: xml,
        httpStatus,
      }
    }
  }

  /**
   * Get all API interaction logs.
   */
  getLogs(): ApiLogEntry[] {
    return [...this.logs]
  }

  /**
   * Get the current environment.
   */
  getEnvironment(): EsocialEnvironment {
    return this.environment
  }
}

/**
 * Build S-1000 (Employer Information) event XML.
 * This is the initial registration event required before any other events.
 */
export function buildS1000Xml(params: {
  eventId: string
  tpAmb: number // 1=production, 2=restricted production
  nrInsc: string
  iniValid: string // YYYY-MM
  classTrib: string
  nmCtt: string
  cpfCtt: string
  fonePrinc: string
  email?: string
}): string {
  const nrInscRaiz = params.nrInsc.substring(0, 8)
  return `<eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtInfoEmpregador/v_S_01_02_00">
  <evtInfoEmpregador Id="${params.eventId}">
    <ideEvento>
      <tpAmb>${params.tpAmb}</tpAmb>
      <procEmi>1</procEmi>
      <verProc>lardia_1.0</verProc>
    </ideEvento>
    <ideEmpregador>
      <tpInsc>1</tpInsc>
      <nrInsc>${nrInscRaiz}</nrInsc>
    </ideEmpregador>
    <infoEmpregador>
      <inclusao>
        <idePeriodo>
          <iniValid>${params.iniValid}</iniValid>
        </idePeriodo>
        <infoCadastro>
          <classTrib>${params.classTrib}</classTrib>
          <indCoop>0</indCoop>
          <indConstr>0</indConstr>
          <indDesFolha>0</indDesFolha>
          <indOpcCP>0</indOpcCP>
          <contato>
            <nmCtt>${params.nmCtt}</nmCtt>
            <cpfCtt>${params.cpfCtt}</cpfCtt>
            <fonePrinc>${params.fonePrinc}</fonePrinc>${params.email ? `
            <email>${params.email}</email>` : ''}
          </contato>
        </infoCadastro>
      </inclusao>
    </infoEmpregador>
  </evtInfoEmpregador>
</eSocial>`
}

// Error messages in Portuguese for user-facing display
export const ESOCIAL_PROXY_ERRORS = {
  TIMEOUT: 'Tempo limite excedido ao conectar com o servidor eSocial. Tente novamente em alguns minutos.',
  PROXY_DOWN: 'Servidor proxy eSocial indisponível. Nossa equipe foi notificada.',
  CERTIFICATE_ERROR: 'Erro de certificado digital ao conectar com o eSocial. Verifique se o certificado está válido.',
  NETWORK_ERROR: 'Erro de rede ao conectar com o servidor eSocial. Verifique sua conexão.',
  AUTH_ERROR: 'Erro de autenticação com o servidor proxy. Contate o suporte.',
  PARSE_ERROR: 'Erro ao processar resposta do eSocial. Tente novamente.',
  UNKNOWN: 'Erro inesperado na comunicação com o eSocial. Tente novamente.',
} as const

/**
 * Classify a proxy error into a Portuguese user-facing message.
 */
function classifyProxyError(error: Error): string {
  const msg = error.message.toLowerCase()
  if (msg.includes('timeout') || msg.includes('abort')) return ESOCIAL_PROXY_ERRORS.TIMEOUT
  if (msg.includes('econnrefused') || msg.includes('enotfound')) return ESOCIAL_PROXY_ERRORS.PROXY_DOWN
  if (msg.includes('cert') || msg.includes('ssl') || msg.includes('tls')) return ESOCIAL_PROXY_ERRORS.CERTIFICATE_ERROR
  if (msg.includes('fetch') || msg.includes('network')) return ESOCIAL_PROXY_ERRORS.NETWORK_ERROR
  return ESOCIAL_PROXY_ERRORS.UNKNOWN
}

/**
 * Proxy-based eSocial API client.
 * Routes requests through the EC2 proxy in São Paulo instead of making
 * direct SOAP calls (which fail from Vercel's serverless environment).
 *
 * EC2 proxy endpoints:
 *   POST {proxyUrl}/esocial/producaorestrita/{path} - restricted production
 *   POST {proxyUrl}/esocial/producao/{path}         - real production
 *   GET  {proxyUrl}/health                          - health check
 */
export class EsocialProxyClient {
  private proxyUrl: string
  private apiKey: string
  private environment: EsocialEnvironment

  constructor(proxyUrl: string, apiKey: string, environment: EsocialEnvironment = 'restricted') {
    this.proxyUrl = proxyUrl.replace(/\/+$/, '')
    this.apiKey = apiKey
    this.environment = environment
  }

  /** Get the proxy base path for the current environment */
  private getBasePath(): string {
    return this.environment === 'production'
      ? '/esocial/producao'
      : '/esocial/producaorestrita'
  }

  private async request(method: string, path: string, body?: unknown, timeoutMs = 30000): Promise<{ ok: boolean; status: number; data: unknown }> {
    try {
      const res = await fetch(`${this.proxyUrl}${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
        signal: AbortSignal.timeout(timeoutMs),
      })

      if (res.status === 401 || res.status === 403) {
        throw new Error(ESOCIAL_PROXY_ERRORS.AUTH_ERROR)
      }

      const contentType = res.headers.get('content-type') || ''
      const data = contentType.includes('json') ? await res.json() : await res.text()
      return { ok: res.ok, status: res.status, data }
    } catch (error) {
      if ((error as Error).message === ESOCIAL_PROXY_ERRORS.AUTH_ERROR) throw error
      throw new Error(classifyProxyError(error as Error))
    }
  }

  /** Check proxy health via GET /health */
  async checkHealth(): Promise<{ healthy: boolean; message: string; latencyMs: number }> {
    const start = Date.now()
    try {
      const res = await fetch(`${this.proxyUrl}/health`, {
        headers: { 'x-api-key': this.apiKey },
        signal: AbortSignal.timeout(10000),
      })
      const latencyMs = Date.now() - start
      if (res.ok) {
        const data = await res.json().catch(() => ({}))
        return { healthy: true, message: (data as Record<string, string>).status || 'OK', latencyMs }
      }
      return { healthy: false, message: `HTTP ${res.status}`, latencyMs }
    } catch {
      return { healthy: false, message: ESOCIAL_PROXY_ERRORS.PROXY_DOWN, latencyMs: Date.now() - start }
    }
  }

  /** Test connectivity to the eSocial proxy (alias for checkHealth) */
  async testConnection(): Promise<{ connected: boolean; message?: string; latencyMs?: number }> {
    const health = await this.checkHealth()
    return { connected: health.healthy, message: health.message, latencyMs: health.latencyMs }
  }

  /** Send events through the EC2 proxy */
  async sendEvents(payload: {
    soapBody: string
    environment?: EsocialEnvironment
  }): Promise<EsocialApiResponse> {
    try {
      const basePath = this.getBasePath()
      const { data } = await this.request('POST', `${basePath}/enviarLoteEventos`, payload)
      return data as EsocialApiResponse
    } catch (error) {
      return {
        success: false,
        statusCode: -1,
        statusDescription: (error as Error).message || ESOCIAL_PROXY_ERRORS.UNKNOWN,
        occurrences: [],
        rawXml: '',
        httpStatus: 0,
      }
    }
  }

  /** Query event results through the EC2 proxy */
  async queryEvents(payload: {
    protocoloEnvio: string
    environment?: EsocialEnvironment
  }): Promise<EsocialApiResponse> {
    try {
      const basePath = this.getBasePath()
      const { data } = await this.request('POST', `${basePath}/consultarLoteEventos`, payload)
      return data as EsocialApiResponse
    } catch (error) {
      return {
        success: false,
        statusCode: -1,
        statusDescription: (error as Error).message || ESOCIAL_PROXY_ERRORS.UNKNOWN,
        occurrences: [],
        rawXml: '',
        httpStatus: 0,
      }
    }
  }

  /** Get the current environment */
  getEnvironment(): EsocialEnvironment {
    return this.environment
  }

  /** Set the environment */
  setEnvironment(env: EsocialEnvironment) {
    this.environment = env
  }
}

/**
 * Create an EsocialProxyClient from environment variables.
 * Returns null if proxy is not configured.
 *
 * Environment toggle:
 * - Production (NODE_ENV=production): always uses proxy (required for Vercel)
 * - Development: uses proxy if ESOCIAL_PROXY_URL is set, otherwise allows direct connection
 */
export function createProxyClient(environment?: EsocialEnvironment): EsocialProxyClient | null {
  const url = process.env.ESOCIAL_PROXY_URL
  const key = process.env.ESOCIAL_PROXY_API_KEY

  if (!url || !key) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[eSocial] ESOCIAL_PROXY_URL and ESOCIAL_PROXY_API_KEY are required in production')
    }
    return null
  }

  const env = environment || (process.env.NODE_ENV === 'production' ? 'production' : 'restricted')
  return new EsocialProxyClient(url, key, env)
}

/**
 * Determine if the proxy should be used.
 * In production, always true. In development, true if proxy env vars are set.
 */
export function shouldUseProxy(): boolean {
  if (process.env.NODE_ENV === 'production') return true
  return !!(process.env.ESOCIAL_PROXY_URL && process.env.ESOCIAL_PROXY_API_KEY)
}

/**
 * Known eSocial error codes relevant to domestic employers.
 */
export const ESOCIAL_ERROR_CODES: Record<number, string> = {
  201: 'Lote recebido com sucesso',
  202: 'Lote recebido com advertencias',
  301: 'Erro de schema',
  401: 'Lote incorreto - erro de preenchimento',
  402: 'Lote incorreto - erro de schema',
  403: 'Lote incorreto - XML mal formado',
  404: 'Lote incorreto - certificado invalido',
  501: 'Lote em processamento',
  502: 'Lote processado com erros em um ou mais eventos',
  601: 'Assinatura digital invalida',
  609: 'Codigo de ID invalido',
  1310: 'Empregador doméstico não pode transmitir eventos por este canal',
}
