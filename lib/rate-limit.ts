/**
 * Simple in-memory rate limiter using token bucket algorithm
 * 
 * For production, consider using:
 * - Redis for distributed rate limiting
 * - Upstash Rate Limit for serverless
 * - Vercel Edge Config for edge function rate limiting
 */

interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  uniqueTokenPerInterval: number; // Max unique tokens (IPs/user IDs) to track
  maxRequests: number; // Max requests per interval per token
}

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

class RateLimiter {
  private config: RateLimitConfig;
  private buckets: Map<string, TokenBucket>;

  constructor(config: RateLimitConfig) {
    this.config = config;
    this.buckets = new Map();
  }

  /**
   * Check if request is allowed
   * @param token - Unique identifier (IP address, user ID, etc.)
   * @returns { allowed: boolean, remaining: number, resetAt: Date }
   */
  check(token: string): { allowed: boolean; remaining: number; resetAt: Date } {
    const now = Date.now();
    let bucket = this.buckets.get(token);

    if (!bucket) {
      // First request from this token
      bucket = {
        tokens: this.config.maxRequests - 1, // Use one token
        lastRefill: now,
      };
      this.buckets.set(token, bucket);

      // Clean up old tokens to prevent memory leak
      if (this.buckets.size > this.config.uniqueTokenPerInterval) {
        this.cleanup();
      }

      return {
        allowed: true,
        remaining: bucket.tokens,
        resetAt: new Date(now + this.config.interval),
      };
    }

    // Refill tokens if interval has passed
    const timeSinceLastRefill = now - bucket.lastRefill;
    if (timeSinceLastRefill >= this.config.interval) {
      bucket.tokens = this.config.maxRequests;
      bucket.lastRefill = now;
    }

    // Check if tokens available
    if (bucket.tokens > 0) {
      bucket.tokens--;
      return {
        allowed: true,
        remaining: bucket.tokens,
        resetAt: new Date(bucket.lastRefill + this.config.interval),
      };
    }

    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(bucket.lastRefill + this.config.interval),
    };
  }

  /**
   * Clean up old tokens to prevent memory leak
   */
  private cleanup() {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, bucket] of this.buckets.entries()) {
      if (now - bucket.lastRefill > this.config.interval * 2) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.buckets.delete(key));
  }

  /**
   * Reset rate limit for a specific token (useful for testing or manual overrides)
   */
  reset(token: string) {
    this.buckets.delete(token);
  }

  /**
   * Get current status for a token without consuming a request
   */
  getStatus(token: string): { remaining: number; resetAt: Date } | null {
    const bucket = this.buckets.get(token);
    if (!bucket) {
      return {
        remaining: this.config.maxRequests,
        resetAt: new Date(Date.now() + this.config.interval),
      };
    }

    return {
      remaining: bucket.tokens,
      resetAt: new Date(bucket.lastRefill + this.config.interval),
    };
  }
}

// Create rate limiters for different endpoints
// Adjust these based on your needs

/**
 * Strict rate limiter for authentication endpoints
 * 5 requests per minute per IP
 */
export const authRateLimiter = new RateLimiter({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // Track up to 500 IPs
  maxRequests: 5,
});

/**
 * Moderate rate limiter for API endpoints
 * 100 requests per minute per user
 */
export const apiRateLimiter = new RateLimiter({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 1000, // Track up to 1000 users
  maxRequests: 100,
});

/**
 * Generous rate limiter for public endpoints
 * 30 requests per minute per IP
 */
export const publicRateLimiter = new RateLimiter({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 2000, // Track up to 2000 IPs
  maxRequests: 30,
});

/**
 * Very strict rate limiter for expensive operations (AI, file uploads)
 * 10 requests per 5 minutes per user
 */
export const expensiveRateLimiter = new RateLimiter({
  interval: 5 * 60 * 1000, // 5 minutes
  uniqueTokenPerInterval: 500,
  maxRequests: 10,
});

/**
 * Helper to get client IP from request
 */
export function getClientIp(request: Request): string {
  // Check for Vercel/Cloudflare forwarded IP
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  // Check for real IP header
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback (should not happen in production)
  return 'unknown';
}

/**
 * Apply rate limiting to a Next.js API route
 * 
 * Usage:
 * ```typescript
 * export async function POST(request: Request) {
 *   const rateLimitResult = await applyRateLimit(request, apiRateLimiter, 'user-id-123');
 *   if (!rateLimitResult.allowed) {
 *     return rateLimitResult.response;
 *   }
 *   
 *   // Continue with normal request handling
 * }
 * ```
 */
export async function applyRateLimit(
  request: Request,
  limiter: RateLimiter,
  token?: string
): Promise<
  | { allowed: true }
  | { allowed: false; response: Response }
> {
  // Use provided token or fall back to IP address
  const identifier = token || getClientIp(request);
  const result = limiter.check(identifier);

  if (!result.allowed) {
    const retryAfter = Math.ceil(
      (result.resetAt.getTime() - Date.now()) / 1000
    );

    return {
      allowed: false,
      response: new Response(
        JSON.stringify({
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': limiter['config'].maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': result.resetAt.toISOString(),
          },
        }
      ),
    };
  }

  return { allowed: true };
}
