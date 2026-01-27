import rateLimit from 'express-rate-limit'
import type { Request, Response } from 'express'
import type { AuthenticatedRequest } from './auth.ts'
import { env } from '../config/env.ts'

/**
 * Rate limiter for API endpoints
 * Limits requests per organization based on env configuration
 * Defaults: 30 requests per 60 seconds
 */
export const organizationRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  
  // Use organization ID as the key for rate limiting
  keyGenerator: (req: Request): string => {
    const authReq = req as AuthenticatedRequest
    // Use organizationId for authenticated requests
    // This avoids IP-based fallback and IPv6 issues
    return authReq.user?.organizationId || 'anonymous'
  },

  // Custom handler when rate limit is exceeded
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil(env.RATE_LIMIT_WINDOW_MS / 1000), // seconds
    })
  },

  // Skip rate limiting in test environment
  skip: () => process.env.APP_STAGE === 'test',
})
