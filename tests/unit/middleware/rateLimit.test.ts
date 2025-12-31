import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Response, NextFunction } from 'express'
import type { AuthenticatedRequest } from '../../../src/middleware/auth.ts'

// Mock express-rate-limit before importing the module
vi.mock('express-rate-limit', () => ({
  default: vi.fn((options) => {
    // Return a middleware that captures the options for testing
    const middleware = (req: Request, res: Response, next: NextFunction) => {
      // Store options on request for testing
      ;(req as any)._rateLimitOptions = options
      
      // Check if should skip
      if (options.skip && options.skip(req)) {
        return next()
      }
      
      // Generate key
      const key = options.keyGenerator ? options.keyGenerator(req) : 'default'
      ;(req as any)._rateLimitKey = key
      
      next()
    }
    
    // Attach options to middleware for inspection
    ;(middleware as any)._options = options
    return middleware
  }),
}))

// Import after mocking
import { organizationRateLimiter } from '../../../src/middleware/rateLimit.ts'

describe('Rate Limit Middleware', () => {
  let mockReq: Partial<AuthenticatedRequest>
  let mockRes: Partial<Response>
  let mockNext: NextFunction

  beforeEach(() => {
    mockReq = {
      user: undefined,
    }
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    }
    mockNext = vi.fn()
    vi.clearAllMocks()
  })

  it('should be configured with correct options', () => {
    const options = (organizationRateLimiter as any)._options
    
    expect(options.standardHeaders).toBe(true)
    expect(options.legacyHeaders).toBe(false)
    expect(options.windowMs).toBeDefined()
    expect(options.max).toBeDefined()
  })

  it('should use organizationId as rate limit key for authenticated requests', () => {
    const options = (organizationRateLimiter as any)._options

    const authReq = {
      user: {
        id: 'user-123',
        email: 'test@example.com',
        organizationId: 'org-456',
      },
    } as AuthenticatedRequest

    const key = options.keyGenerator(authReq)
    expect(key).toBe('org-456')
  })

  it('should use "anonymous" as rate limit key for unauthenticated requests', () => {
    const options = (organizationRateLimiter as any)._options

    const unauthReq = {} as AuthenticatedRequest

    const key = options.keyGenerator(unauthReq)
    expect(key).toBe('anonymous')
  })

  it('should skip rate limiting in test environment', () => {
    const options = (organizationRateLimiter as any)._options
    
    const originalAppStage = process.env.APP_STAGE
    process.env.APP_STAGE = 'test'
    
    const shouldSkip = options.skip()
    expect(shouldSkip).toBe(true)
    
    process.env.APP_STAGE = originalAppStage
  })

  it('should not skip rate limiting in production', () => {
    const options = (organizationRateLimiter as any)._options
    
    const originalAppStage = process.env.APP_STAGE
    process.env.APP_STAGE = 'production'
    
    const shouldSkip = options.skip()
    expect(shouldSkip).toBe(false)
    
    process.env.APP_STAGE = originalAppStage
  })

  it('should return 429 with correct response when rate limit exceeded', () => {
    const options = (organizationRateLimiter as any)._options

    options.handler(mockReq as AuthenticatedRequest, mockRes as Response)

    expect(mockRes.status).toHaveBeenCalledWith(429)
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: expect.any(Number),
      })
    )
  })
})
