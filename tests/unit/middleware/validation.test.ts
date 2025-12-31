import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { validateBody, validateParams, validateQuery } from '../../../src/middleware/validation.ts'

describe('Validation Middleware', () => {
  let mockReq: Partial<Request>
  let mockRes: Partial<Response>
  let mockNext: NextFunction

  beforeEach(() => {
    mockReq = {}
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    }
    mockNext = vi.fn()
  })

  describe('validateBody', () => {
    const schema = z.object({
      name: z.string().min(1),
      email: z.string().email(),
    })

    it('should call next() for valid body', () => {
      mockReq.body = { name: 'John', email: 'john@example.com' }

      const middleware = validateBody(schema)
      middleware(mockReq as Request, mockRes as Response, mockNext)

      expect(mockNext).toHaveBeenCalledWith()
      expect(mockRes.status).not.toHaveBeenCalled()
    })

    it('should return 400 for invalid body', () => {
      mockReq.body = { name: '', email: 'invalid-email' }

      const middleware = validateBody(schema)
      middleware(mockReq as Request, mockRes as Response, mockNext)

      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Validation failed',
          details: expect.arrayContaining([
            expect.objectContaining({ field: expect.any(String), message: expect.any(String) }),
          ]),
        })
      )
    })

    it('should pass non-ZodError to next()', () => {
      const badSchema = {
        parse: () => {
          throw new Error('Unexpected error')
        },
      }

      mockReq.body = {}
      const middleware = validateBody(badSchema as any)
      middleware(mockReq as Request, mockRes as Response, mockNext)

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error))
    })
  })

  describe('validateParams', () => {
    const schema = z.object({
      id: z.string().uuid(),
    })

    it('should call next() for valid params', () => {
      mockReq.params = { id: '550e8400-e29b-41d4-a716-446655440000' }

      const middleware = validateParams(schema)
      middleware(mockReq as Request, mockRes as Response, mockNext)

      expect(mockNext).toHaveBeenCalledWith()
    })

    it('should return 400 for invalid params', () => {
      mockReq.params = { id: 'not-a-uuid' }

      const middleware = validateParams(schema)
      middleware(mockReq as Request, mockRes as Response, mockNext)

      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Invalid parameters',
        })
      )
    })

    it('should pass non-ZodError to next()', () => {
      const badSchema = {
        parse: () => {
          throw new Error('Unexpected error')
        },
      }

      mockReq.params = {}
      const middleware = validateParams(badSchema as any)
      middleware(mockReq as Request, mockRes as Response, mockNext)

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error))
    })
  })

  describe('validateQuery', () => {
    const schema = z.object({
      page: z.coerce.number().positive(),
      limit: z.coerce.number().positive().max(100),
    })

    it('should call next() for valid query', () => {
      mockReq.query = { page: '1', limit: '10' }

      const middleware = validateQuery(schema)
      middleware(mockReq as Request, mockRes as Response, mockNext)

      expect(mockNext).toHaveBeenCalledWith()
    })

    it('should return 400 for invalid query', () => {
      mockReq.query = { page: '-1', limit: '200' }

      const middleware = validateQuery(schema)
      middleware(mockReq as Request, mockRes as Response, mockNext)

      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Invalid query parameters',
        })
      )
    })

    it('should pass non-ZodError to next()', () => {
      const badSchema = {
        parse: () => {
          throw new Error('Unexpected error')
        },
      }

      mockReq.query = {}
      const middleware = validateQuery(badSchema as any)
      middleware(mockReq as Request, mockRes as Response, mockNext)

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error))
    })
  })
})
