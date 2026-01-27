import { LRUCache } from 'lru-cache'
import type { Request, Response, NextFunction, RequestHandler } from 'express'
import crypto from 'crypto'

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
  etag: string
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
 * Get Cache-Control header value based on entity type
 * - Users/Organizations: cacheable for 10 minutes (private, max-age=600)
 * - Orders: must revalidate with ETag (no-cache)
 */
const getCacheControlHeader = (entityType: EntityType | null): string => {
  if (entityType === 'users' || entityType === 'organizations') {
    return 'private, max-age=600'
  }
  // Orders use ETag validation only
  return 'no-cache'
}

/**
 * Generate a unique cache key from the request
 * Includes: method and URL (with query params)
 */
const generateCacheKey = (req: Request): string => {
  const keyData = `${req.method}:${req.originalUrl}`
  return crypto.createHash('md5').update(keyData).digest('hex')
}

/**
 * HTTP caching middleware combining server-side LRU cache with client-side caching
 * - Caches GET responses in memory (LRU) for 10 minutes
 * - Generates ETag headers for client-side cache validation
 * - Returns 304 Not Modified when client's If-None-Match matches current ETag
 * - Sets Cache-Control headers:
 *   - Users/Organizations: "private, max-age=600" (10 min client cache)
 *   - Orders: "no-cache" (must revalidate with ETag)
 * - Sets X-Cache header (HIT/MISS) to indicate server cache status
 */
export const httpCache = (): RequestHandler => {
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
      res.set('ETag', cachedResponse.etag)
      res.set('Cache-Control', getCacheControlHeader(cachedResponse.entityType))

      // Check If-None-Match before returning full response
      const clientEtag = req.get('If-None-Match')
      if (clientEtag && clientEtag === cachedResponse.etag) {
        return res.status(304).end()
      }

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
        const bodyString = JSON.stringify(body)
        const etag = `"${crypto.createHash('md5').update(bodyString).digest('hex')}"`
        const entityType = extractEntityType(req.originalUrl)

        const responseToCache: CachedResponse = {
          body,
          statusCode: res.statusCode,
          headers: {
            'Content-Type': 'application/json',
          },
          timestamp: Date.now(),
          entityType,
          etag,
        }
        cache.set(cacheKey, responseToCache)

        res.set('ETag', etag)
        res.set('Cache-Control', getCacheControlHeader(entityType))

        // Check If-None-Match for cache miss scenario
        const clientEtag = req.get('If-None-Match')
        if (clientEtag && clientEtag === etag) {
          res.set('X-Cache', 'MISS')
          res.set('X-Cache-Key', cacheKey)
          return res.status(304).end()
        }
      }

      res.set('X-Cache', 'MISS')
      res.set('X-Cache-Key', cacheKey)

      return originalJson(body)
    }

    next()
  }
}

/**
 * Invalidate cache entries matching entity type
 * Call this after mutations (POST, PUT, DELETE)
 * @param entityType - The type of entity that was mutated (e.g., 'users', 'orders')
 */
export const invalidateCache = (entityType: EntityType): void => {
  for (const [key, value] of cache.entries()) {
    // Check if this cache entry matches the entity type
    if (value.entityType === entityType) {
      cache.delete(key)
    }
  }
}

/**
 * Middleware to invalidate cache after mutations
 * Apply to POST, PUT, DELETE routes
 */
export const invalidateCacheMiddleware = (entityType: EntityType): RequestHandler => {
  return (_req: Request, res: Response, next: NextFunction) => {
    // Store original json method
    const originalJson = res.json.bind(res)

    // Override json method to invalidate cache after successful response
    res.json = (body: unknown): Response => {
      // Invalidate cache on successful mutations
      if (res.statusCode >= 200 && res.statusCode < 300) {
        invalidateCache(entityType)
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
