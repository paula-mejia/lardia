/**
 * eSocial SOAP API client.
 * Handles communication with eSocial web services using digital certificate.
 */

import * as https from 'https'
import * as tls from 'tls'
import { parseStringPromise } from 'xml2js'
import { CertificateBundle, signXml } from './certificate'
import { v4 as uuidv4 } from 'uuid'

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
          secureOptions: tls.constants?.SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION,
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
  1310: 'Empregador domestico nao pode transmitir eventos por este canal',
}
