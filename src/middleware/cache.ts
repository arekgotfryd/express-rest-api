import type { Request, Response, NextFunction, RequestHandler } from 'express'
import crypto from 'crypto'

/**
 * Cache-Control middleware for client-side caching
 * Sets Cache-Control header with specified max-age
 * @param maxAgeSeconds - Cache duration in seconds (default: 600 = 10 minutes)
 */
export const cacheControl = (maxAgeSeconds: number = 600): RequestHandler => {
  return (_req: Request, res: Response, next: NextFunction) => {
    // Only apply caching to GET requests
    res.on('finish', () => {
      // Headers already sent at this point, but we set them before
    })

    // Set cache headers before response is sent
    if (_req.method === 'GET') {
      res.set('Cache-Control', `private, max-age=${maxAgeSeconds}`)
    }

    next()
  }
}

/**
 * ETag middleware for conditional requests
 * Generates ETag from response body and handles 304 Not Modified
 */
export const etag = (): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only apply to GET requests
    if (req.method !== 'GET') {
      return next()
    }

    // Store the original json method
    const originalJson = res.json.bind(res)

    // Override json method to add ETag handling
    res.json = (body: unknown): Response => {
      // Generate ETag from response body
      const bodyString = JSON.stringify(body)
      const hash = crypto.createHash('md5').update(bodyString).digest('hex')
      const etagValue = `"${hash}"`

      // Set ETag header
      res.set('ETag', etagValue)
      // Prevent caching but allow ETag validation
      res.set('Cache-Control', 'private, no-cache')

      // Check If-None-Match header from client
      const clientEtag = req.get('If-None-Match')

      if (clientEtag && clientEtag === etagValue) {
        // Resource hasn't changed, return 304 Not Modified
        res.status(304)
        return res.end()
      }

      // Resource changed or no ETag provided, send full response
      return originalJson(body)
    }

    next()
  }
}
