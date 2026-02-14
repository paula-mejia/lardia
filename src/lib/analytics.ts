// Google Analytics 4 and Meta Pixel tracking helpers

// GA4 event tracking
export function trackEvent(name: string, params?: Record<string, string | number | boolean>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', name, params)
  }
}

// Meta Pixel event tracking
export function trackMetaEvent(name: string, params?: Record<string, string | number | boolean>) {
  if (typeof window !== 'undefined' && window.fbq) {
    if (params) {
      window.fbq('track', name, params)
    } else {
      window.fbq('track', name)
    }
  }
}

// Combined tracking helpers for common actions
export function trackSignupStarted() {
  trackEvent('signup_started')
  trackMetaEvent('Lead')
}

export function trackSignupCompleted() {
  trackEvent('signup_completed')
}

export function trackCalculatorUsed(calculatorType: string) {
  trackEvent('calculator_used', { calculator_type: calculatorType })
  trackMetaEvent('ViewContent', { content_name: calculatorType })
}

export function trackBackgroundCheckStarted() {
  trackEvent('background_check_started')
}

export function trackSubscriptionCheckoutStarted() {
  trackEvent('subscription_checkout_started')
  trackMetaEvent('InitiateCheckout')
}

export function trackEmployeeAdded() {
  trackEvent('employee_added')
}

export function trackContractGenerated() {
  trackEvent('contract_generated')
}

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
