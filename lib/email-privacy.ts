/**
 * Email Privacy - Block tracking pixels and read receipts
 */

'use server';

export interface PrivacyResult {
  sanitizedHtml: string;
  trackersBlocked: number;
  trackingStripped: boolean;
}

/**
 * Sanitize email HTML to remove tracking pixels and read receipts
 */
export function sanitizeEmailHTML(html: string): PrivacyResult {
  if (!html) {
    return {
      sanitizedHtml: '',
      trackersBlocked: 0,
      trackingStripped: false,
    };
  }

  let sanitized = html;
  let trackersBlocked = 0;

  // 1. Remove 1x1 tracking pixels
  const onePixelRegex = /<img[^>]*(?:width|height)\s*=\s*["']?1["']?[^>]*>/gi;
  const onePixelMatches = sanitized.match(onePixelRegex) || [];
  trackersBlocked += onePixelMatches.length;
  sanitized = sanitized.replace(onePixelRegex, '<!-- Tracking pixel blocked -->');

  // 2. Remove tracking domains
  const trackingDomains = [
    'track\\..*?\\.com',
    'pixel\\..*?\\.com',
    'analytics\\..*?\\.com',
    'open\\..*?\\.gif',
    'beacon\\..*?\\.com',
    'click\\..*?\\.com',
    'links\\..*?\\.com',
    't\\..*?\\.com/i/', // Common tracker pattern
    'email\\..*?\\.com/o/', // Open tracking
  ];

  for (const domain of trackingDomains) {
    const domainRegex = new RegExp(`<img[^>]*${domain}[^>]*>`, 'gi');
    const matches = sanitized.match(domainRegex) || [];
    trackersBlocked += matches.length;
    sanitized = sanitized.replace(domainRegex, '<!-- Tracking domain blocked -->');
  }

  // 3. Remove specific tracking services
  const trackingServices = [
    'doubleclick.net',
    'googleadservices.com',
    'google-analytics.com',
    'facebook.com/tr',
    'linkedin.com/px',
    'twitter.com/i',
    'mailchimp.com/open',
    'sendgrid.net/wf',
    'constantcontact.com/open',
    'hubspot.com/email-tracking',
  ];

  for (const service of trackingServices) {
    const serviceRegex = new RegExp(`<[^>]*${service.replace(/\./g, '\\.')}[^>]*>`, 'gi');
    const matches = sanitized.match(serviceRegex) || [];
    trackersBlocked += matches.length;
    sanitized = sanitized.replace(serviceRegex, '<!-- Tracking service blocked -->');
  }

  // 4. Remove read receipt parameters from links
  const readReceiptParams = ['utm_', 'email_', 'track_', 'open_', 'click_'];
  for (const param of readReceiptParams) {
    const paramRegex = new RegExp(`[?&]${param}[^"'\\s]*`, 'gi');
    sanitized = sanitized.replace(paramRegex, '');
  }

  // 5. Block invisible images (likely trackers)
  const invisibleImgRegex = /<img[^>]*(?:style|class)[^>]*(?:display:\s*none|visibility:\s*hidden)[^>]*>/gi;
  const invisibleMatches = sanitized.match(invisibleImgRegex) || [];
  trackersBlocked += invisibleMatches.length;
  sanitized = sanitized.replace(invisibleImgRegex, '<!-- Invisible tracker blocked -->');

  // 6. Remove tracking scripts
  const trackingScriptRegex = /<script[^>]*(?:track|analytics|pixel)[^>]*>[\s\S]*?<\/script>/gi;
  const scriptMatches = sanitized.match(trackingScriptRegex) || [];
  trackersBlocked += scriptMatches.length;
  sanitized = sanitized.replace(trackingScriptRegex, '<!-- Tracking script blocked -->');

  return {
    sanitizedHtml: sanitized,
    trackersBlocked,
    trackingStripped: trackersBlocked > 0,
  };
}

/**
 * Check if URL is a tracking link
 */
export function isTrackingUrl(url: string): boolean {
  const trackingPatterns = [
    /track\./i,
    /pixel\./i,
    /analytics\./i,
    /click\./i,
    /links\./i,
    /redirect\./i,
    /utm_/i,
    /email_track/i,
  ];

  return trackingPatterns.some((pattern) => pattern.test(url));
}

/**
 * Strip tracking parameters from URL
 */
export function stripTrackingParams(url: string): string {
  try {
    const urlObj = new URL(url);
    const trackingParams = ['utm_', 'email_', 'track_', 'open_', 'click_', 'ref_'];

    // Remove all tracking parameters
    for (const [key] of urlObj.searchParams) {
      if (trackingParams.some((param) => key.startsWith(param))) {
        urlObj.searchParams.delete(key);
      }
    }

    return urlObj.toString();
  } catch {
    return url; // Return original if URL parsing fails
  }
}

/**
 * Get privacy score for an email (0-100)
 */
export function getPrivacyScore(trackersBlocked: number, hasExternalImages: boolean): number {
  let score = 100;

  // Deduct points for trackers
  score -= Math.min(trackersBlocked * 10, 50);

  // Deduct points for external images
  if (hasExternalImages) {
    score -= 20;
  }

  return Math.max(score, 0);
}

/**
 * Extract external domains from email HTML
 */
export function extractExternalDomains(html: string): string[] {
  const domains = new Set<string>();
  const urlRegex = /https?:\/\/([^\/\s"'<>]+)/gi;
  const matches = html.matchAll(urlRegex);

  for (const match of matches) {
    domains.add(match[1]);
  }

  return Array.from(domains);
}

