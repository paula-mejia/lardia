/**
 * eSocial digital certificate manager.
 * Handles loading .p12 certificates, extracting keys, and XML signing.
 */

import * as fs from 'fs'
import * as forge from 'node-forge'
import { SignedXml } from 'xml-crypto'

export interface CertificateInfo {
  subject: string
  issuer: string
  cnpj: string
  notBefore: Date
  notAfter: Date
  serialNumber: string
  isValid: boolean
  daysUntilExpiry: number
}

export interface CertificateBundle {
  certPem: string
  keyPem: string
  caCertsPem: string[]
  p12Buffer: Buffer
  p12Password: string
  info: CertificateInfo
}

/**
 * Load a .p12 certificate file and extract all components.
 */
export function loadCertificate(p12Path: string, password: string): CertificateBundle {
  const p12Buffer = fs.readFileSync(p12Path)
  const p12Asn1 = forge.asn1.fromDer(forge.util.createBuffer(p12Buffer.toString('binary')))
  const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password)

  // Extract certificate
  const certBags = p12.getBags({ bagType: forge.pki.oids.certBag })
  const certBag = certBags[forge.pki.oids.certBag]
  if (!certBag || certBag.length === 0) {
    throw new Error('No certificate found in .p12 file')
  }

  // Find the end-entity cert (has localKeyId or is first with a matching key)
  const cert = certBag[0].cert
  if (!cert) {
    throw new Error('Certificate extraction failed')
  }

  // Extract private key
  const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })
  const keyBag = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag]
  if (!keyBag || keyBag.length === 0) {
    throw new Error('No private key found in .p12 file')
  }

  const privateKey = keyBag[0].key
  if (!privateKey) {
    throw new Error('Private key extraction failed')
  }

  // Convert to PEM
  const certPem = forge.pki.certificateToPem(cert)
  const keyPem = forge.pki.privateKeyToPem(privateKey)

  // Extract CA certs
  const caCertsPem: string[] = []
  if (certBag.length > 1) {
    for (let i = 1; i < certBag.length; i++) {
      if (certBag[i].cert) {
        caCertsPem.push(forge.pki.certificateToPem(certBag[i].cert!))
      }
    }
  }

  // Extract CNPJ from subject CN (format: "COMPANY NAME:CNPJ")
  const cn = cert.subject.getField('CN')?.value || ''
  const cnpjMatch = cn.match(/(\d{14})/)
  const cnpj = cnpjMatch ? cnpjMatch[1] : ''

  const now = new Date()
  const notAfter = cert.validity.notAfter
  const daysUntilExpiry = Math.floor((notAfter.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  const info: CertificateInfo = {
    subject: cn,
    issuer: cert.issuer.getField('CN')?.value || '',
    cnpj,
    notBefore: cert.validity.notBefore,
    notAfter,
    serialNumber: cert.serialNumber,
    isValid: now >= cert.validity.notBefore && now <= notAfter,
    daysUntilExpiry,
  }

  return {
    certPem,
    keyPem,
    caCertsPem,
    p12Buffer,
    p12Password: password,
    info,
  }
}

/**
 * Sign an eSocial XML event using XMLDSig (enveloped signature).
 * The signature is placed inside the event element, as required by eSocial.
 */
export function signXml(xml: string, certBundle: CertificateBundle, referenceUri: string): string {
  const sig = new SignedXml({
    privateKey: certBundle.keyPem,
    canonicalizationAlgorithm: 'http://www.w3.org/TR/2001/REC-xml-c14n-20010315',
    signatureAlgorithm: 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256',
  })

  sig.addReference({
    xpath: `//*[@Id='${referenceUri}']`,
    digestAlgorithm: 'http://www.w3.org/2001/04/xmlenc#sha256',
    transforms: [
      'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
      'http://www.w3.org/TR/2001/REC-xml-c14n-20010315',
    ],
    uri: `#${referenceUri}`,
  })

  // Add X509 certificate data to KeyInfo
  const certBase64 = certBundle.certPem
    .replace('-----BEGIN CERTIFICATE-----', '')
    .replace('-----END CERTIFICATE-----', '')
    .replace(/\s/g, '')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(sig as any).keyInfoProvider = {
    getKeyInfo() {
      return `<X509Data><X509Certificate>${certBase64}</X509Certificate></X509Data>`
    },
  }

  sig.computeSignature(xml, {
    location: { reference: `//*[@Id='${referenceUri}']`, action: 'append' },
  })

  return sig.getSignedXml()
}

/**
 * Validate certificate is not expired and is suitable for eSocial.
 */
export function validateCertificate(info: CertificateInfo): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!info.isValid) {
    errors.push('Certificado expirado ou ainda não válido')
  }

  if (info.daysUntilExpiry < 30) {
    errors.push(`Certificado expira em ${info.daysUntilExpiry} dias`)
  }

  if (!info.cnpj) {
    errors.push('CNPJ não encontrado no certificado')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
