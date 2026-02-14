/**
 * eSocial RPA (Robotic Process Automation) client.
 * Automates interaction with the eSocial web portal using Playwright.
 * Used for domestic employer operations that can't be done via WS-SOAP API.
 *
 * Flow:
 * 1. Launch browser with .p12 certificate
 * 2. Authenticate via Gov.br SSO (certificate-based)
 * 3. Navigate domestic employer sections
 * 4. Generate DAE, download PDFs
 */

import * as path from 'path'
import * as fs from 'fs'

// Playwright types (optional peer dependency, stubbed when not installed)
/* eslint-disable @typescript-eslint/no-explicit-any */
type Browser = any
type BrowserContext = any
type Page = any

export interface RpaConfig {
  /** Path to the .p12 certificate file */
  certPath: string
  /** Password for the .p12 certificate */
  certPassword: string
  /** Path to Chromium executable */
  chromiumPath?: string
  /** Whether to run headless (default: true) */
  headless?: boolean
  /** Screenshots directory for debugging */
  screenshotDir?: string
  /** Timeout for navigation in ms (default: 30000) */
  timeout?: number
}

export interface RpaSessionInfo {
  authenticated: boolean
  employerName?: string
  cnpj?: string
  portalUrl?: string
  error?: string
}

export interface DaeDownloadResult {
  success: boolean
  pdfPath?: string
  barcode?: string
  totalAmount?: number
  dueDate?: string
  referenceMonth?: string
  error?: string
}

export type RpaLogLevel = 'info' | 'warn' | 'error' | 'debug'

export interface RpaLogEntry {
  timestamp: string
  level: RpaLogLevel
  message: string
  screenshot?: string
}

/**
 * eSocial RPA Client.
 * Manages browser automation for eSocial portal interactions.
 */
export class EsocialRpaClient {
  private config: RpaConfig
  private browser: Browser | null = null
  private context: BrowserContext | null = null
  private page: Page | null = null
  private logs: RpaLogEntry[] = []
  private onLog?: (entry: RpaLogEntry) => void

  // Portal URLs
  private static readonly ESOCIAL_LOGIN = 'https://login.esocial.gov.br/'
  private static readonly ESOCIAL_PORTAL = 'https://login.esocial.gov.br/'
  private static readonly GOVBR_SSO_BASE = 'https://sso.acesso.gov.br'

  constructor(config: RpaConfig, onLog?: (entry: RpaLogEntry) => void) {
    this.config = {
      chromiumPath: '/usr/bin/chromium-browser',
      headless: true,
      timeout: 30000,
      ...config,
    }
    this.onLog = onLog

    if (config.screenshotDir) {
      fs.mkdirSync(config.screenshotDir, { recursive: true })
    }
  }

  private log(level: RpaLogLevel, message: string, screenshot?: string) {
    const entry: RpaLogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      screenshot,
    }
    this.logs.push(entry)
    this.onLog?.(entry)
  }

  /**
   * Take a screenshot and save it for debugging.
   */
  private async screenshot(name: string): Promise<string | undefined> {
    if (!this.page || !this.config.screenshotDir) return undefined
    const filePath = path.join(this.config.screenshotDir, `${name}-${Date.now()}.png`)
    try {
      await this.page.screenshot({ path: filePath, fullPage: true })
      return filePath
    } catch {
      return undefined
    }
  }

  /**
   * Launch browser with client certificate configured.
   * Chromium supports --client-certificate flags or NSS database.
   */
  async launch(): Promise<void> {
    const pw = 'playwright'
    const { chromium } = await import(/* webpackIgnore: true */ pw)

    this.log('info', 'Launching browser...')

    // For client certificate auth, we need to use the --ignore-certificate-errors
    // and configure the PKCS12 cert. Playwright supports clientCertificates in context.
    this.browser = await chromium.launch({
      executablePath: this.config.chromiumPath,
      headless: this.config.headless,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    })

    // Create context with client certificate
    this.context = await this.browser.newContext({
      clientCertificates: [
        {
          origin: 'https://sso.acesso.gov.br',
          pfxPath: this.config.certPath,
          passphrase: this.config.certPassword,
        },
        {
          origin: 'https://login.esocial.gov.br',
          pfxPath: this.config.certPath,
          passphrase: this.config.certPassword,
        },
        {
          origin: 'https://cav.receita.fazenda.gov.br',
          pfxPath: this.config.certPath,
          passphrase: this.config.certPassword,
        },
      ],
      ignoreHTTPSErrors: true,
    })

    this.page = await this.context.newPage()
    this.page.setDefaultTimeout(this.config.timeout || 30000)

    this.log('info', 'Browser launched successfully')
  }

  /**
   * Authenticate with eSocial via Gov.br SSO using certificate.
   */
  async authenticate(): Promise<RpaSessionInfo> {
    if (!this.page) {
      return { authenticated: false, error: 'Browser not launched' }
    }

    try {
      this.log('info', 'Navigating to eSocial login...')
      await this.page.goto(EsocialRpaClient.ESOCIAL_LOGIN, { waitUntil: 'networkidle' })
      await this.screenshot('01-login-page')

      // Click the Gov.br login button
      this.log('info', 'Clicking Gov.br login button...')
      const govbrButton = this.page.locator('button:has-text("Entrar com gov.br"), button.br-button.sign-in')
      if (await govbrButton.count() > 0) {
        await govbrButton.first().click()
        await this.page.waitForLoadState('networkidle')
      } else {
        // Maybe already redirected
        this.log('warn', 'Gov.br button not found, checking if already on SSO page')
      }

      await this.screenshot('02-govbr-sso')

      // On Gov.br SSO, look for certificate login option
      const currentUrl = this.page.url()
      this.log('info', `Current URL: ${currentUrl}`)

      if (currentUrl.includes('sso.acesso.gov.br') || currentUrl.includes('acesso.gov.br')) {
        // Look for "Seu Certificado Digital" or certificate login option
        const certButton = this.page.locator(
          'button:has-text("Certificado"), a:has-text("Certificado"), ' +
          '[data-toggle="certificate"], .certificate-login'
        )

        if (await certButton.count() > 0) {
          this.log('info', 'Clicking certificate login option...')
          await certButton.first().click()
          await this.page.waitForLoadState('networkidle')
        }

        await this.screenshot('03-cert-auth')
      }

      // Wait for redirect back to eSocial
      try {
        await this.page.waitForURL('**/esocial.gov.br/**', { timeout: 15000 })
      } catch {
        this.log('warn', 'Did not redirect to eSocial portal yet')
      }

      await this.screenshot('04-post-auth')

      const finalUrl = this.page.url()
      const pageTitle = await this.page.title()

      // Check if we're authenticated
      const isAuthenticated = finalUrl.includes('esocial.gov.br') &&
        !finalUrl.includes('login.aspx') &&
        !finalUrl.includes('sso.acesso.gov.br')

      if (isAuthenticated) {
        // Try to extract employer info from the portal
        const employerName = await this.page.locator('.employer-name, .nome-empregador, #nomeEmpregador')
          .first()
          .textContent()
          .catch(() => undefined)

        this.log('info', `Authenticated successfully. Employer: ${employerName || 'unknown'}`)

        return {
          authenticated: true,
          employerName: employerName || undefined,
          portalUrl: finalUrl,
        }
      }

      this.log('warn', `Authentication may have failed. URL: ${finalUrl}, Title: ${pageTitle}`)
      return {
        authenticated: false,
        portalUrl: finalUrl,
        error: `Not redirected to portal. Current page: ${pageTitle}`,
      }
    } catch (error) {
      const screenshotPath = await this.screenshot('error-auth')
      this.log('error', `Authentication error: ${(error as Error).message}`, screenshotPath)
      return {
        authenticated: false,
        error: (error as Error).message,
      }
    }
  }

  /**
   * Navigate to the domestic employer (empregador domestico) section.
   */
  async navigateToDomesticEmployer(): Promise<boolean> {
    if (!this.page) return false

    try {
      this.log('info', 'Navigating to domestic employer section...')

      // Look for "Empregador Domestico" menu/link
      const domesticLink = this.page.locator(
        'a:has-text("Empregador Dom"), a:has-text("Empregado Dom"), ' +
        '[href*="domestico"], [href*="empregador"]'
      )

      if (await domesticLink.count() > 0) {
        await domesticLink.first().click()
        await this.page.waitForLoadState('networkidle')
        await this.screenshot('05-domestic-section')
        return true
      }

      this.log('warn', 'Domestic employer link not found')
      await this.screenshot('05-no-domestic-link')
      return false
    } catch (error) {
      this.log('error', `Navigation error: ${(error as Error).message}`)
      return false
    }
  }

  /**
   * Navigate to the DAE generation page and generate DAE for a month.
   */
  async generateDae(month: number, year: number): Promise<DaeDownloadResult> {
    if (!this.page) {
      return { success: false, error: 'Browser not launched' }
    }

    try {
      this.log('info', `Generating DAE for ${month}/${year}...`)

      // Navigate to "Folha/Recepcao/DAE" section
      const daeLink = this.page.locator(
        'a:has-text("DAE"), a:has-text("Guia"), ' +
        'a:has-text("Folha de Pagamento"), [href*="dae"], [href*="guia"]'
      )

      if (await daeLink.count() > 0) {
        await daeLink.first().click()
        await this.page.waitForLoadState('networkidle')
      }

      await this.screenshot('06-dae-page')

      // Select month/year
      const monthSelect = this.page.locator('select[name*="mes"], select[name*="month"], #mes')
      const yearSelect = this.page.locator('select[name*="ano"], select[name*="year"], #ano')

      if (await monthSelect.count() > 0) {
        await monthSelect.selectOption(String(month))
      }
      if (await yearSelect.count() > 0) {
        await yearSelect.selectOption(String(year))
      }

      // Click generate button
      const generateBtn = this.page.locator(
        'button:has-text("Gerar"), button:has-text("Emitir"), ' +
        'input[type="submit"]:has-text("Gerar"), a:has-text("Gerar DAE")'
      )

      if (await generateBtn.count() > 0) {
        // Set up download listener
        const downloadPromise = this.page.waitForEvent('download', { timeout: 30000 }).catch(() => null)

        await generateBtn.first().click()
        await this.page.waitForLoadState('networkidle')

        await this.screenshot('07-dae-generated')

        // Check if a PDF was downloaded
        const download = await downloadPromise
        if (download) {
          const downloadDir = this.config.screenshotDir || '/tmp'
          const pdfPath = path.join(downloadDir, `dae-${year}-${String(month).padStart(2, '0')}.pdf`)
          await download.saveAs(pdfPath)
          this.log('info', `DAE PDF saved: ${pdfPath}`)

          return {
            success: true,
            pdfPath,
            referenceMonth: `${year}-${String(month).padStart(2, '0')}`,
          }
        }

        // Try to extract barcode from the page
        const barcodeEl = this.page.locator('.barcode, .codigo-barras, [data-barcode]')
        const barcode = await barcodeEl.first().textContent().catch(() => undefined)

        // Try to extract amount
        const amountEl = this.page.locator('.total, .valor-total, [data-total]')
        const amountText = await amountEl.first().textContent().catch(() => undefined)
        const totalAmount = amountText ? parseFloat(amountText.replace(/[^\d,]/g, '').replace(',', '.')) : undefined

        return {
          success: true,
          barcode: barcode || undefined,
          totalAmount,
          referenceMonth: `${year}-${String(month).padStart(2, '0')}`,
        }
      }

      return { success: false, error: 'Generate button not found on DAE page' }
    } catch (error) {
      await this.screenshot('error-dae')
      this.log('error', `DAE generation error: ${(error as Error).message}`)
      return { success: false, error: (error as Error).message }
    }
  }

  /**
   * Close the browser and cleanup.
   */
  async close(): Promise<void> {
    try {
      if (this.context) await this.context.close()
      if (this.browser) await this.browser.close()
    } catch {
      // Ignore close errors
    }
    this.browser = null
    this.context = null
    this.page = null
    this.log('info', 'Browser closed')
  }

  /**
   * Get all RPA logs.
   */
  getLogs(): RpaLogEntry[] {
    return [...this.logs]
  }

  /**
   * Full DAE generation workflow.
   * Launches browser, authenticates, navigates, generates DAE.
   */
  async fullDaeWorkflow(month: number, year: number): Promise<DaeDownloadResult> {
    try {
      await this.launch()

      const session = await this.authenticate()
      if (!session.authenticated) {
        return { success: false, error: `Authentication failed: ${session.error}` }
      }

      const navigated = await this.navigateToDomesticEmployer()
      if (!navigated) {
        return { success: false, error: 'Could not navigate to domestic employer section' }
      }

      return await this.generateDae(month, year)
    } finally {
      await this.close()
    }
  }
}
