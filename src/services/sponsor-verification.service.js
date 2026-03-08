const dns = require('dns').promises;
const crypto = require('crypto');
const axios = require('axios');

const BLOCKED_FREE_DOMAINS = new Set([
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'icloud.com',
  'protonmail.com',
  'aol.com',
]);

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  '10minutemail.com',
  'tempmail.com',
  'guerrillamail.com',
]);

function extractDomainFromEmail(email) {
  const normalized = String(email || '').trim().toLowerCase();
  const parts = normalized.split('@');
  if (parts.length !== 2 || !parts[1]) return null;
  return parts[1];
}

function normalizeHost(host) {
  return String(host || '').trim().toLowerCase().replace(/^www\./, '');
}

function validateCorporateEmail(email) {
  const domain = extractDomainFromEmail(email);
  if (!domain) {
    return { valid: false, domain: null, reason: 'Invalid email format' };
  }
  if (BLOCKED_FREE_DOMAINS.has(domain)) {
    return { valid: false, domain, reason: 'Use a corporate email, not a personal provider' };
  }
  return { valid: true, domain, reason: null };
}

function isDisposableEmail(domain) {
  return DISPOSABLE_DOMAINS.has(String(domain || '').toLowerCase());
}

async function verifyMxRecords(domain) {
  try {
    const mx = await dns.resolveMx(domain);
    return Array.isArray(mx) && mx.length > 0;
  } catch {
    return false;
  }
}

function parseUrl(inputUrl) {
  try {
    const value = String(inputUrl || '').trim();
    if (!value) return null;
    const normalized = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    return new URL(normalized);
  } catch {
    return null;
  }
}

async function isUrlReachable(url) {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      maxRedirects: 5,
      validateStatus: () => true,
    });
    return response.status >= 200 && response.status < 300;
  } catch {
    return false;
  }
}

async function verifyCompanyWebsite(companyWebsite, emailDomain) {
  const parsed = parseUrl(companyWebsite);
  if (!parsed) {
    return {
      valid: false,
      reachable: false,
      domain: null,
      domainMatches: false,
      reason: 'Invalid company website URL',
      manualReview: true,
    };
  }

  const websiteDomain = normalizeHost(parsed.hostname);
  const normalizedEmailDomain = normalizeHost(emailDomain);
  const domainMatches =
    websiteDomain === normalizedEmailDomain ||
    websiteDomain.endsWith(`.${normalizedEmailDomain}`) ||
    normalizedEmailDomain.endsWith(`.${websiteDomain}`);

  const reachable = await isUrlReachable(parsed.toString());
  return {
    valid: reachable,
    reachable,
    domain: websiteDomain,
    domainMatches,
    reason: reachable ? null : 'Company website is not reachable (HTTP 200 required)',
    manualReview: !domainMatches,
  };
}

async function verifyLinkedInCompanyPage(linkedinCompanyPage) {
  const parsed = parseUrl(linkedinCompanyPage);
  if (!parsed) {
    return { valid: false, domainValid: false, hasCompanyPath: false, reachable: false, reason: 'Invalid LinkedIn URL' };
  }

  const host = normalizeHost(parsed.hostname);
  const domainValid = host === 'linkedin.com' || host.endsWith('.linkedin.com');
  const hasCompanyPath = parsed.pathname.toLowerCase().includes('/company/');
  const reachable = await isUrlReachable(parsed.toString());

  return {
    valid: domainValid && hasCompanyPath && reachable,
    domainValid,
    hasCompanyPath,
    reachable,
    reason:
      domainValid && hasCompanyPath && reachable
        ? null
        : 'LinkedIn company page must be a reachable linkedin.com/company/... URL',
  };
}

function createVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

function verificationExpiry() {
  return new Date(Date.now() + 24 * 60 * 60 * 1000);
}

module.exports = {
  validateCorporateEmail,
  extractDomainFromEmail,
  isDisposableEmail,
  verifyMxRecords,
  verifyCompanyWebsite,
  verifyLinkedInCompanyPage,
  createVerificationToken,
  verificationExpiry,
};
