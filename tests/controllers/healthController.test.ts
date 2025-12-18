import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Request, Response } from 'express'
import { health, readiness } from '../../src/controllers/healthController.ts'
import { sequelize } from '../../src/db/connection.ts'
import { logger } from '../../src/utils/logger.ts'

vi.mock('../../src/db/connection.ts', () => ({
  sequelize: {
    authenticate: vi.fn(),
  },
}))

vi.mock('../../src/utils/logger.ts', () => {
  const mockLogger = {
    info: vi.fn(),
    error: vi.fn(),
  }
  return {
    logger: mockLogger,
    default: mockLogger,
  }
})

describe('Health Controller', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>

  beforeEach(() => {
    mockRequest = {}

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    }

    vi.clearAllMocks()
  })

  describe('health', () => {
    it('should return OK status', async () => {
      await health(mockRequest as Request, mockResponse as Response)

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'OK',
        timestamp: expect.any(String),
        service: 'Express REST API',
      })
    })
  })

  describe('readiness', () => {
    it('should return ready status when all checks pass', async () => {
      vi.mocked(sequelize.authenticate).mockResolvedValue(undefined)

      await readiness(mockRequest as Request, mockResponse as Response)

      expect(sequelize.authenticate).toHaveBeenCalled()
      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'ready',
        timestamp: expect.any(String),
        checks: {
          database: true,
          cache: true,
        },
      })
    })

    it('should return not ready status when database check fails', async () => {
      vi.mocked(sequelize.authenticate).mockRejectedValue(
        new Error('Database connection failed')
      )

      await readiness(mockRequest as Request, mockResponse as Response)

      expect(mockResponse.status).toHaveBeenCalledWith(503)
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'not ready',
        timestamp: expect.any(String),
        checks: {
          database: false,
          cache: false,
        },
        error: 'Database connection failed',
      })
    })

    it('should handle unknown errors', async () => {
      vi.mocked(sequelize.authenticate).mockRejectedValue('Unknown error type')

      await readiness(mockRequest as Request, mockResponse as Response)

      expect(mockResponse.status).toHaveBeenCalledWith(503)
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'not ready',
        timestamp: expect.any(String),
        checks: {
          database: false,
          cache: false,
        },
        error: 'Unknown error',
      })
    })
  })
})
