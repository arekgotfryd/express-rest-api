import { LRUCache } from 'lru-cache'
import type { Request, Response, NextFunction, RequestHandler } from 'express'
import crypto from 'crypto'
import type { AuthenticatedRequest } from './auth.ts'

/**
 * Cache invalidation patterns
 * Maps entity types to cache key patterns that should be invalidated
 */
type EntityType = 'users' | 'organizations' | 'orders'

/**
 * Server-side LRU cache configuration
 * TTL: 10 minutes (600000ms)
 * Max entries: 500
 */
const cache = new LRUCache<string, CachedResponse>({
  max: 500,
  ttl: 10 * 60 * 1000, // 10 minutes in milliseconds
})

interface CachedResponse {
  body: unknown
  statusCode: number
  headers: Record<string, string>
  timestamp: number
  entityType: EntityType | null
  organizationId: string
}

/**
 * Extract entity type from URL path
 * e.g., /api/users/123 -> 'users', /api/orders -> 'orders'
 */
const extractEntityType = (url: string): EntityType | null => {
  const match = url.match(/\/api\/(users|orders|organizations)/)
  if (match) {
    return match[1] as EntityType
  }
  return null
}

/**
 * Generate a unique cache key from the request
 * Includes: method, URL, query params, and user organization
 */
const generateCacheKey = (req: Request): string => {
  const authReq = req as AuthenticatedRequest
  const organizationId = authReq.user?.organizationId || 'anonymous'
  const keyData = `${req.method}:${req.originalUrl}:${organizationId}`
  return crypto.createHash('md5').update(keyData).digest('hex')
}

/**
 * Server-side caching middleware using LRU cache
 * Caches GET responses for 10 minutes
 * Automatically includes cache metadata in response headers
 */
export const serverCache = (): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next()
    }

    const cacheKey = generateCacheKey(req)
    const cachedResponse = cache.get(cacheKey)

    // Return cached response if available
    if (cachedResponse) {
      res.set('X-Cache', 'HIT')
      res.set('X-Cache-Key', cacheKey)
      res.set('X-Cache-Age', String(Math.floor((Date.now() - cachedResponse.timestamp) / 1000)))
      
      // Restore original headers
      Object.entries(cachedResponse.headers).forEach(([key, value]) => {
        res.set(key, value)
      })

      return res.status(cachedResponse.statusCode).json(cachedResponse.body)
    }

    // Store original json method
    const originalJson = res.json.bind(res)

    // Override json method to cache the response
    res.json = (body: unknown): Response => {
      // Only cache successful responses (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const authReq = req as AuthenticatedRequest
        const responseToCache: CachedResponse = {
          body,
          statusCode: res.statusCode,
          headers: {
            'Content-Type': 'application/json',
          },
          timestamp: Date.now(),
          entityType: extractEntityType(req.originalUrl),
          organizationId: authReq.user?.organizationId || 'anonymous',
        }
        cache.set(cacheKey, responseToCache)
      }

      res.set('X-Cache', 'MISS')
      res.set('X-Cache-Key', cacheKey)

      return originalJson(body)
    }

    next()
  }
}

/**
 * Invalidate cache entries matching entity type and optionally organization
 * Call this after mutations (POST, PUT, DELETE)
 * @param entityType - The type of entity that was mutated (e.g., 'users', 'orders')
 * @param organizationId - Optional org ID to scope invalidation (if not provided, invalidates all orgs)
 */
export const invalidateCache = (entityType: EntityType, organizationId?: string): void => {
  for (const [key, value] of cache.entries()) {
    // Check if this cache entry matches the entity type
    if (value.entityType === entityType) {
      // If organizationId is provided, only invalidate for that org
      // Otherwise, invalidate all entries of this entity type
      if (!organizationId || value.organizationId === organizationId) {
        cache.delete(key)
      }
    }
  }
}

/**
 * Middleware to invalidate cache after mutations
 * Apply to POST, PUT, DELETE routes
 */
export const invalidateCacheMiddleware = (entityType: EntityType): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Store original json method
    const originalJson = res.json.bind(res)

    // Override json method to invalidate cache after successful response
    res.json = (body: unknown): Response => {
      // Invalidate cache on successful mutations
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const authReq = req as AuthenticatedRequest
        invalidateCache(entityType, authReq.user?.organizationId)
      }

      return originalJson(body)
    }

    next()
  }
}

/**
 * Get cache statistics for monitoring
 */
export const getCacheStats = (): { size: number; maxSize: number; ttl: number } => ({
  size: cache.size,
  maxSize: 500,
  ttl: 10 * 60 * 1000,
})

/**
 * Clear all cache entries
 * Useful for testing or manual cache invalidation
 */
export const clearCache = (): void => {
  cache.clear()
}

export { cache }
