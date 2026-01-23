import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { Request, Response, NextFunction } from 'express'
import {
  serverCache,
  invalidateCache,
  invalidateCacheMiddleware,
  clearCache,
  getCacheStats,
  cache,
} from '../../../src/middleware/cache.ts'
import type { AuthenticatedRequest } from '../../../src/middleware/auth.ts'

describe('Server Cache Middleware', () => {
  let mockRequest: Partial<AuthenticatedRequest>
  let mockResponse: Partial<Response>
  let mockNext: NextFunction

  beforeEach(() => {
    // Clear cache before each test
    clearCache()

    mockRequest = {
      method: 'GET',
      originalUrl: '/api/users',
      user: {
        id: 'user-123',
        email: 'test@example.com',
        organizationId: 'org-123',
      },
      get: vi.fn().mockReturnValue(undefined),
    }

    mockResponse = {
      set: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      end: vi.fn().mockReturnThis(),
      statusCode: 200,
    }

    mockNext = vi.fn()

    vi.clearAllMocks()
  })

  afterEach(() => {
    clearCache()
  })

  describe('serverCache', () => {
    it('should skip caching for non-GET requests', () => {
      mockRequest.method = 'POST'

      const middleware = serverCache()
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      )

      expect(mockNext).toHaveBeenCalled()
      expect(mockResponse.set).not.toHaveBeenCalled()
    })

    it('should cache GET responses and set X-Cache: MISS on first request', () => {
      const middleware = serverCache()
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      )

      expect(mockNext).toHaveBeenCalled()

      // Simulate controller calling res.json()
      const responseBody = { users: [{ id: '1', name: 'Test' }] }
      mockResponse.json!(responseBody)

      expect(mockResponse.set).toHaveBeenCalledWith('X-Cache', 'MISS')
      expect(mockResponse.set).toHaveBeenCalledWith('X-Cache-Key', expect.any(String))
      expect(getCacheStats().size).toBe(1)
    })

    it('should return cached response with X-Cache: HIT on subsequent requests', () => {
      const middleware = serverCache()
      const responseBody = { users: [{ id: '1', name: 'Test' }] }

      // First request - cache miss
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      )
      mockResponse.json!(responseBody)

      // Reset mocks for second request
      vi.clearAllMocks()
      mockResponse.json = vi.fn().mockReturnThis()

      // Second request - should be cache hit
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      )

      expect(mockResponse.set).toHaveBeenCalledWith('X-Cache', 'HIT')
      expect(mockResponse.set).toHaveBeenCalledWith('X-Cache-Age', expect.any(String))
      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith(responseBody)
      // next() should NOT be called for cached responses
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should generate different cache keys for different URLs', () => {
      const middleware = serverCache()

      // First request to /api/users
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      )
      mockResponse.json!({ users: [] })

      // Second request to /api/orders
      mockRequest.originalUrl = '/api/orders'
      vi.clearAllMocks()

      middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      )

      // Should be a cache miss (different URL)
      expect(mockNext).toHaveBeenCalled()
    })

    it('should generate different cache keys for different organizations', () => {
      const middleware = serverCache()

      // First request from org-123
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      )
      mockResponse.json!({ users: [] })

      // Second request from org-456
      mockRequest.user = { id: 'user-456', email: 'other@example.com', organizationId: 'org-456' }
      vi.clearAllMocks()
      mockResponse.json = vi.fn().mockReturnThis()

      middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      )

      // Should be a cache miss (different org)
      expect(mockNext).toHaveBeenCalled()
      expect(mockResponse.set).not.toHaveBeenCalledWith('X-Cache', 'HIT')
    })

    it('should not cache non-2xx responses', () => {
      const middleware = serverCache()
      mockResponse.statusCode = 404

      middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      )
      mockResponse.json!({ error: 'Not found' })

      expect(getCacheStats().size).toBe(0)
    })
  })

  describe('invalidateCache', () => {
    it('should invalidate cache entries for specific entity type', () => {
      // Manually add cache entries
      cache.set('key1', {
        body: { users: [] },
        statusCode: 200,
        headers: {},
        timestamp: Date.now(),
        entityType: 'users',
        organizationId: 'org-123',
        etag: '"abc123"',
      })
      cache.set('key2', {
        body: { orders: [] },
        statusCode: 200,
        headers: {},
        timestamp: Date.now(),
        entityType: 'orders',
        organizationId: 'org-123',
        etag: '"def456"',
      })

      expect(cache.size).toBe(2)

      // Invalidate only users
      invalidateCache('users')

      expect(cache.size).toBe(1)
      expect(cache.has('key1')).toBe(false)
      expect(cache.has('key2')).toBe(true)
    })

    it('should invalidate cache entries for specific organization only', () => {
      // Add entries for different orgs
      cache.set('key1', {
        body: { users: [] },
        statusCode: 200,
        headers: {},
        timestamp: Date.now(),
        entityType: 'users',
        organizationId: 'org-123',
        etag: '"abc123"',
      })
      cache.set('key2', {
        body: { users: [] },
        statusCode: 200,
        headers: {},
        timestamp: Date.now(),
        entityType: 'users',
        organizationId: 'org-456',
        etag: '"def456"',
      })

      expect(cache.size).toBe(2)

      // Invalidate users for org-123 only
      invalidateCache('users', 'org-123')

      expect(cache.size).toBe(1)
      expect(cache.has('key1')).toBe(false)
      expect(cache.has('key2')).toBe(true)
    })

    it('should not invalidate entries of different entity types', () => {
      cache.set('key1', {
        body: { orders: [] },
        statusCode: 200,
        headers: {},
        timestamp: Date.now(),
        entityType: 'orders',
        organizationId: 'org-123',
        etag: '"abc123"',
      })

      invalidateCache('users', 'org-123')

      expect(cache.size).toBe(1)
      expect(cache.has('key1')).toBe(true)
    })
  })

  describe('invalidateCacheMiddleware', () => {
    it('should invalidate cache after successful mutation', () => {
      // Pre-populate cache
      cache.set('key1', {
        body: { users: [] },
        statusCode: 200,
        headers: {},
        timestamp: Date.now(),
        entityType: 'users',
        organizationId: 'org-123',
        etag: '"abc123"',
      })

      expect(cache.size).toBe(1)

      mockRequest.method = 'POST'
      mockResponse.statusCode = 201

      const middleware = invalidateCacheMiddleware('users')
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      )

      expect(mockNext).toHaveBeenCalled()

      // Simulate controller response
      mockResponse.json!({ message: 'Created' })

      // Cache should be invalidated
      expect(cache.size).toBe(0)
    })

    it('should not invalidate cache on error responses', () => {
      // Pre-populate cache
      cache.set('key1', {
        body: { users: [] },
        statusCode: 200,
        headers: {},
        timestamp: Date.now(),
        entityType: 'users',
        organizationId: 'org-123',
        etag: '"abc123"',
      })

      mockRequest.method = 'POST'
      mockResponse.statusCode = 500

      const middleware = invalidateCacheMiddleware('users')
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      )

      mockResponse.json!({ error: 'Server error' })

      // Cache should NOT be invalidated
      expect(cache.size).toBe(1)
    })
  })

  describe('getCacheStats', () => {
    it('should return correct cache statistics', () => {
      cache.set('key1', {
        body: {},
        statusCode: 200,
        headers: {},
        timestamp: Date.now(),
        entityType: 'users',
        organizationId: 'org-123',
        etag: '"abc123"',
      })

      const stats = getCacheStats()

      expect(stats.size).toBe(1)
      expect(stats.maxSize).toBe(500)
      expect(stats.ttl).toBe(10 * 60 * 1000)
    })
  })

  describe('clearCache', () => {
    it('should clear all cache entries', () => {
      cache.set('key1', {
        body: {},
        statusCode: 200,
        headers: {},
        timestamp: Date.now(),
        entityType: 'users',
        organizationId: 'org-123',
        etag: '"abc123"',
      })
      cache.set('key2', {
        body: {},
        statusCode: 200,
        headers: {},
        timestamp: Date.now(),
        entityType: 'orders',
        organizationId: 'org-123',
        etag: '"def456"',
      })

      expect(cache.size).toBe(2)

      clearCache()

      expect(cache.size).toBe(0)
    })
  })
})
