import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Request, Response, NextFunction } from 'express'
import { cacheControl, etag } from '../../../src/middleware/cache.ts'

describe('Cache Middleware', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockNext: NextFunction

  beforeEach(() => {
    mockRequest = {
      method: 'GET',
      get: vi.fn(),
    }

    mockResponse = {
      set: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      end: vi.fn().mockReturnThis(),
      on: vi.fn(),
    }

    mockNext = vi.fn()

    vi.clearAllMocks()
  })

  describe('cacheControl', () => {
    it('should set Cache-Control header with default 10 minutes for GET requests', () => {
      const middleware = cacheControl()

      middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      )

      expect(mockResponse.set).toHaveBeenCalledWith(
        'Cache-Control',
        'private, max-age=600'
      )
      expect(mockNext).toHaveBeenCalled()
    })

    it('should set Cache-Control header with custom max-age', () => {
      const middleware = cacheControl(300) // 5 minutes

      middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      )

      expect(mockResponse.set).toHaveBeenCalledWith(
        'Cache-Control',
        'private, max-age=300'
      )
      expect(mockNext).toHaveBeenCalled()
    })

    it('should not set Cache-Control header for non-GET requests', () => {
      mockRequest.method = 'POST'
      const middleware = cacheControl()

      middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      )

      expect(mockResponse.set).not.toHaveBeenCalled()
      expect(mockNext).toHaveBeenCalled()
    })

    it('should not set Cache-Control header for PUT requests', () => {
      mockRequest.method = 'PUT'
      const middleware = cacheControl()

      middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      )

      expect(mockResponse.set).not.toHaveBeenCalled()
      expect(mockNext).toHaveBeenCalled()
    })

    it('should not set Cache-Control header for DELETE requests', () => {
      mockRequest.method = 'DELETE'
      const middleware = cacheControl()

      middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      )

      expect(mockResponse.set).not.toHaveBeenCalled()
      expect(mockNext).toHaveBeenCalled()
    })
  })

  describe('etag', () => {
    it('should generate ETag header and return full response on first request', () => {
      const middleware = etag()
      const testBody = { orders: [{ id: 1, name: 'Test' }] }

      // No If-None-Match header
      vi.mocked(mockRequest.get as ReturnType<typeof vi.fn>).mockReturnValue(undefined)

      middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      )

      expect(mockNext).toHaveBeenCalled()

      // Call the overridden json method
      const res = mockResponse as Response
      res.json(testBody)

      expect(mockResponse.set).toHaveBeenCalledWith('ETag', expect.stringMatching(/^"[a-f0-9]{32}"$/))
      expect(mockResponse.set).toHaveBeenCalledWith('Cache-Control', 'private, no-cache')
    })

    it('should return 304 Not Modified when ETag matches', () => {
      const middleware = etag()
      const testBody = { orders: [{ id: 1, name: 'Test' }] }

      // Calculate expected ETag (MD5 of JSON stringified body)
      const crypto = require('crypto')
      const expectedHash = crypto.createHash('md5').update(JSON.stringify(testBody)).digest('hex')
      const expectedEtag = `"${expectedHash}"`

      // Client sends matching If-None-Match
      vi.mocked(mockRequest.get as ReturnType<typeof vi.fn>).mockImplementation((header: string) => {
        if (header === 'If-None-Match') return expectedEtag
        return undefined
      })

      middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      )

      expect(mockNext).toHaveBeenCalled()

      // Call the overridden json method
      const res = mockResponse as Response
      res.json(testBody)

      expect(mockResponse.status).toHaveBeenCalledWith(304)
      expect(mockResponse.end).toHaveBeenCalled()
    })

    it('should return full response when ETag does not match', () => {
      const middleware = etag()
      const testBody = { orders: [{ id: 1, name: 'Test' }] }

      // Client sends non-matching If-None-Match
      vi.mocked(mockRequest.get as ReturnType<typeof vi.fn>).mockImplementation((header: string) => {
        if (header === 'If-None-Match') return '"old-etag-value"'
        return undefined
      })

      // Store original json mock
      const originalJsonMock = vi.fn().mockReturnThis()
      mockResponse.json = originalJsonMock

      middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      )

      expect(mockNext).toHaveBeenCalled()

      // Call the overridden json method
      const res = mockResponse as Response
      res.json(testBody)

      expect(mockResponse.set).toHaveBeenCalledWith('ETag', expect.stringMatching(/^"[a-f0-9]{32}"$/))
      expect(mockResponse.status).not.toHaveBeenCalledWith(304)
    })

    it('should skip ETag processing for non-GET requests', () => {
      mockRequest.method = 'POST'
      const middleware = etag()

      middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      )

      expect(mockNext).toHaveBeenCalled()
      // json method should not be overridden
      expect(mockResponse.set).not.toHaveBeenCalled()
    })

    it('should skip ETag processing for PUT requests', () => {
      mockRequest.method = 'PUT'
      const middleware = etag()

      middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      )

      expect(mockNext).toHaveBeenCalled()
      expect(mockResponse.set).not.toHaveBeenCalled()
    })

    it('should generate different ETags for different response bodies', () => {
      const middleware1 = etag()
      const middleware2 = etag()

      const body1 = { data: 'first' }
      const body2 = { data: 'second' }

      vi.mocked(mockRequest.get as ReturnType<typeof vi.fn>).mockReturnValue(undefined)

      // First request
      const capturedEtags: string[] = []
      mockResponse.set = vi.fn().mockImplementation((key: string, value: string) => {
        if (key === 'ETag') capturedEtags.push(value)
        return mockResponse
      })

      middleware1(mockRequest as Request, mockResponse as Response, mockNext)
      ;(mockResponse as Response).json(body1)

      // Reset for second request
      mockResponse.json = vi.fn().mockReturnThis()
      middleware2(mockRequest as Request, mockResponse as Response, mockNext)
      ;(mockResponse as Response).json(body2)

      expect(capturedEtags.length).toBe(2)
      expect(capturedEtags[0]).not.toBe(capturedEtags[1])
    })
  })
})
