/**
 * Test script for eSocial API connection.
 * Run with: npx tsx scripts/test-esocial-api.ts
 */

import { loadCertificate, validateCertificate, signXml } from '../src/lib/esocial/certificate'
import {
  EsocialApiClient,
  generateEventId,
  buildS1000Xml,
  ESOCIAL_ERROR_CODES,
} from '../src/lib/esocial/api-client'

const CERT_PATH = '/home/ubuntu/lardia/.certificates/ecnpj.p12'
const CERT_PASSWORD = '7oCR0Bd4El4yyR'
const CNPJ = '46728966000140'

async function main() {
  console.log('=== eSocial API Connection Test ===\n')

  // Step 1: Load and validate certificate
  console.log('1. Loading certificate...')
  let cert
  try {
    cert = loadCertificate(CERT_PATH, CERT_PASSWORD)
    console.log(`   Subject: ${cert.info.subject}`)
    console.log(`   CNPJ: ${cert.info.cnpj}`)
    console.log(`   Issuer: ${cert.info.issuer}`)
    console.log(`   Valid: ${cert.info.notBefore.toISOString()} to ${cert.info.notAfter.toISOString()}`)
    console.log(`   Days until expiry: ${cert.info.daysUntilExpiry}`)

    const validation = validateCertificate(cert.info)
    if (!validation.valid) {
      console.log(`   WARNINGS: ${validation.errors.join(', ')}`)
    } else {
      console.log('   Certificate is VALID')
    }
  } catch (err) {
    console.error(`   FAILED to load certificate: ${(err as Error).message}`)
    return
  }

  // Step 2: Build and sign a test event (S-1000)
  console.log('\n2. Building S-1000 test event...')
  const eventId = generateEventId(1, CNPJ, 1)
  console.log(`   Event ID: ${eventId}`)

  const eventXml = buildS1000Xml({
    eventId,
    tpAmb: 2, // restricted production
    nrInsc: CNPJ,
    iniValid: '2026-01',
    classTrib: '21', // Domestic employer
    nmCtt: 'PAULA MEJIA',
    cpfCtt: '27011987717',
    fonePrinc: '11999999999',
  })

  console.log('   Event XML built successfully')

  // Step 3: Sign the XML
  console.log('\n3. Signing XML with certificate...')
  let signedXml: string
  try {
    signedXml = signXml(eventXml, cert, eventId)
    console.log('   XML signed successfully')
    console.log(`   Signed XML length: ${signedXml.length} chars`)
    // Show if Signature element exists
    if (signedXml.includes('<Signature')) {
      console.log('   Signature element present: YES')
    }
  } catch (err) {
    console.error(`   FAILED to sign XML: ${(err as Error).message}`)
    // Continue without signature to see what error we get
    signedXml = eventXml
    console.log('   Continuing with unsigned XML...')
  }

  // Step 4: Submit to restricted production
  console.log('\n4. Submitting to eSocial restricted production...')
  const client = new EsocialApiClient(cert, 'restricted', (log) => {
    console.log(`   [LOG] ${log.action} - HTTP ${log.httpStatus} - ${log.duration}ms`)
  })

  const response = await client.enviarLoteEventos(1, CNPJ, 1, [
    { eventId, eventXml: signedXml },
  ])

  console.log(`\n   HTTP Status: ${response.httpStatus}`)
  console.log(`   eSocial Status: ${response.statusCode} - ${response.statusDescription}`)
  if (response.protocol) {
    console.log(`   Protocol: ${response.protocol}`)
  }
  if (response.occurrences.length > 0) {
    console.log('   Occurrences:')
    for (const oc of response.occurrences) {
      const knownError = ESOCIAL_ERROR_CODES[parseInt(oc.code, 10)]
      console.log(`     - [${oc.code}] ${oc.description}${oc.location ? ` @ ${oc.location}` : ''}`)
      if (knownError) {
        console.log(`       Known: ${knownError}`)
      }
    }
  }

  // Step 5: Also test with classTrib 22 (non-domestic) to see different error
  console.log('\n5. Testing with classTrib=22 (non-domestic employer)...')
  const eventId2 = generateEventId(1, CNPJ, 2)
  const eventXml2 = buildS1000Xml({
    eventId: eventId2,
    tpAmb: 2,
    nrInsc: CNPJ,
    iniValid: '2026-01',
    classTrib: '22',
    nmCtt: 'PAULA MEJIA',
    cpfCtt: '27011987717',
    fonePrinc: '11999999999',
  })

  let signedXml2: string
  try {
    signedXml2 = signXml(eventXml2, cert, eventId2)
  } catch {
    signedXml2 = eventXml2
  }

  const response2 = await client.enviarLoteEventos(1, CNPJ, 1, [
    { eventId: eventId2, eventXml: signedXml2 },
  ])

  console.log(`   eSocial Status: ${response2.statusCode} - ${response2.statusDescription}`)
  if (response2.occurrences.length > 0) {
    for (const oc of response2.occurrences) {
      console.log(`     - [${oc.code}] ${oc.description}${oc.location ? ` @ ${oc.location}` : ''}`)
    }
  }

  // Summary
  console.log('\n=== SUMMARY ===')
  console.log(`Certificate: ${cert.info.isValid ? 'VALID' : 'INVALID'}`)
  console.log(`API Connection: ${response.httpStatus === 200 ? 'OK' : 'FAILED'}`)
  console.log(`Domestic employer (classTrib=21): Status ${response.statusCode}`)
  console.log(`Non-domestic (classTrib=22): Status ${response2.statusCode}`)

  // Save raw responses
  const fs = require('fs')
  fs.mkdirSync('/home/ubuntu/.openclaw/workspace/esocial-project', { recursive: true })
  fs.writeFileSync(
    '/home/ubuntu/.openclaw/workspace/esocial-project/raw-response-classtrib21.xml',
    response.rawXml
  )
  fs.writeFileSync(
    '/home/ubuntu/.openclaw/workspace/esocial-project/raw-response-classtrib22.xml',
    response2.rawXml
  )
  console.log('\nRaw responses saved to esocial-project/')
}

main().catch(console.error)
