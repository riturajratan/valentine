import dns from 'dns'
import { promisify } from 'util'

const resolveMx = promisify(dns.resolveMx)

// Email regex pattern (RFC 5322 simplified)
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

// Common disposable email domains to block
const DISPOSABLE_DOMAINS = [
  'tempmail.com',
  'throwaway.email',
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'maildrop.cc',
  'temp-mail.org',
  'yopmail.com',
  'sharklasers.com',
  'trashmail.com',
  'getnada.com',
  'fakeinbox.com',
]

interface EmailValidationResult {
  valid: boolean
  error?: string
}

export async function validateEmail(email: string): Promise<EmailValidationResult> {
  // Basic format check
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' }
  }

  // Trim whitespace and lowercase
  email = email.trim().toLowerCase()

  // Length check
  if (email.length < 3 || email.length > 254) {
    return { valid: false, error: 'Email length is invalid' }
  }

  // Regex pattern check
  if (!EMAIL_REGEX.test(email)) {
    return { valid: false, error: 'Email format is invalid' }
  }

  // Extract domain
  const domain = email.split('@')[1]

  if (!domain) {
    return { valid: false, error: 'Email format is invalid' }
  }

  // Check for disposable email domains
  if (DISPOSABLE_DOMAINS.includes(domain)) {
    return {
      valid: false,
      error: 'Disposable email addresses are not allowed'
    }
  }

  // Check for common typos in popular domains
  const suggestions = checkCommonTypos(domain)
  if (suggestions) {
    return {
      valid: false,
      error: `Did you mean ${suggestions}?`,
    }
  }

  // Verify domain has MX records (can receive emails)
  try {
    const mxRecords = await resolveMx(domain)
    if (!mxRecords || mxRecords.length === 0) {
      return {
        valid: false,
        error: 'Email domain cannot receive emails'
      }
    }
  } catch (error) {
    // DNS lookup failed - domain doesn't exist or has no MX records
    return {
      valid: false,
      error: 'Invalid email domain - domain does not exist'
    }
  }

  return { valid: true }
}

function checkCommonTypos(domain: string): string | null {
  const commonDomains: Record<string, string[]> = {
    'gmail.com': ['gmai.com', 'gmial.com', 'gmali.com', 'gmaill.com'],
    'yahoo.com': ['yahooo.com', 'yaho.com', 'yhoo.com'],
    'hotmail.com': ['hotmai.com', 'hotmial.com', 'hotmil.com'],
    'outlook.com': ['outlok.com', 'outloo.com'],
  }

  for (const [correct, typos] of Object.entries(commonDomains)) {
    if (typos.includes(domain)) {
      return correct
    }
  }

  return null
}
