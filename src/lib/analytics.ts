/**
 * Google Analytics 4 and Meta Pixel tracking helpers.
 * All functions are client-side only (check for `window` before calling gtag/fbq).
 */

/**
 * Send a custom event to Google Analytics 4.
 * @param name - Event name (e.g., 'signup_started')
 * @param params - Optional key-value pairs attached to the event
 */
export function trackEvent(name: string, params?: Record<string, string | number | boolean>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', name, params)
  }
}

/**
 * Send a custom event to Meta (Facebook) Pixel.
 * @param name - Standard or custom event name (e.g., 'Lead', 'Purchase')
 * @param params - Optional event parameters
 */
export function trackMetaEvent(name: string, params?: Record<string, string | number | boolean>) {
  if (typeof window !== 'undefined' && window.fbq) {
    if (params) {
      window.fbq('track', name, params)
    } else {
      window.fbq('track', name)
    }
  }
}

/** Track the start of the signup flow (GA4 + Meta Lead). */
export function trackSignupStarted() {
  trackEvent('signup_started')
  trackMetaEvent('Lead')
}

/** Track successful signup completion. */
export function trackSignupCompleted() {
  trackEvent('signup_completed')
}

/**
 * Track calculator usage (GA4 + Meta ViewContent).
 * @param calculatorType - Which calculator was used (e.g., 'payroll', 'vacation')
 */
export function trackCalculatorUsed(calculatorType: string) {
  trackEvent('calculator_used', { calculator_type: calculatorType })
  trackMetaEvent('ViewContent', { content_name: calculatorType })
}

/** Track when a user initiates a background check. */
export function trackBackgroundCheckStarted() {
  trackEvent('background_check_started')
}

/** Track when a user starts the subscription checkout (GA4 + Meta InitiateCheckout). */
export function trackSubscriptionCheckoutStarted() {
  trackEvent('subscription_checkout_started')
  trackMetaEvent('InitiateCheckout')
}

/** Track when a new employee is added to the system. */
export function trackEmployeeAdded() {
  trackEvent('employee_added')
}

/** Track when an employment contract PDF is generated. */
export function trackContractGenerated() {
  trackEvent('contract_generated')
}

/**
 * Track a PDF download event.
 * @param documentType - Type of document (e.g., 'payslip', 'contract', 'termination')
 */
export function trackPdfDownloaded(documentType: string) {
  trackEvent('pdf_downloaded', { document_type: documentType })
}

// Type declarations for global window objects
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
    fbq: (...args: unknown[]) => void
  }
}
