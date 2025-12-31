import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Request, Response } from 'express'
import { errorHandler, type CustomError } from '../../../src/middleware/errorHandler.ts'

vi.mock('../../../src/utils/logger.ts', () => ({
  logger: {
    error: vi.fn(),
  },
}))

describe('Error Handler Middleware', () => {
  let mockReq: Partial<Request>
  let mockRes: Partial<Response>
  let mockNext: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockReq = {}
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    }
    mockNext = vi.fn()
    vi.clearAllMocks()
  })

  it('should handle generic error with default status 500', () => {
    const error: CustomError = new Error('Something went wrong')

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext)

    expect(mockRes.status).toHaveBeenCalledWith(500)
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Something went wrong',
      })
    )
  })

  it('should use custom status if provided', () => {
    const error: CustomError = new Error('Not Found')
    error.status = 404

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext)

    expect(mockRes.status).toHaveBeenCalledWith(404)
  })

  it('should handle ValidationError', () => {
    const error: CustomError = new Error('Invalid input')
    error.name = 'ValidationError'

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext)

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Validation Error',
      })
    )
  })

  it('should handle UnauthorizedError', () => {
    const error: CustomError = new Error('Not authorized')
    error.name = 'UnauthorizedError'

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext)

    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Unauthorized',
      })
    )
  })

  it('should handle SequelizeUniqueConstraintError', () => {
    const error: CustomError = new Error('Duplicate entry')
    error.name = 'SequelizeUniqueConstraintError'

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext)

    expect(mockRes.status).toHaveBeenCalledWith(409)
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Resource already exists',
      })
    )
  })

  it('should handle ER_DUP_ENTRY code', () => {
    const error: CustomError = new Error('Duplicate entry')
    error.code = 'ER_DUP_ENTRY'

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext)

    expect(mockRes.status).toHaveBeenCalledWith(409)
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Resource already exists',
      })
    )
  })

  it('should handle SequelizeForeignKeyConstraintError', () => {
    const error: CustomError = new Error('FK constraint')
    error.name = 'SequelizeForeignKeyConstraintError'

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext)

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Invalid reference to related resource',
      })
    )
  })

  it('should handle ER_NO_REFERENCED_ROW_2 code', () => {
    const error: CustomError = new Error('FK constraint')
    error.code = 'ER_NO_REFERENCED_ROW_2'

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext)

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Invalid reference to related resource',
      })
    )
  })

  it('should handle SequelizeValidationError with errors array', () => {
    const error: CustomError = new Error('Validation failed')
    error.name = 'SequelizeValidationError'
    error.errors = [{ message: 'Field is required' }]

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext)

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Field is required',
      })
    )
  })

  it('should handle SequelizeValidationError without errors array', () => {
    const error: CustomError = new Error('Validation failed')
    error.name = 'SequelizeValidationError'

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext)

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Validation Error',
      })
    )
  })

  it('should use default message for error without message', () => {
    const error: CustomError = new Error()
    error.message = ''

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext)

    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Internal Server Error',
      })
    )
  })
})
