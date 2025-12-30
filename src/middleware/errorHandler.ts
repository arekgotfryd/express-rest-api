import type { Request, Response, NextFunction } from 'express'
import env from '../../env.ts'
import { logger } from '../utils/logger.ts'

export interface CustomError extends Error {
  status?: number
  code?: string
  errors?: Array<{ message: string }>
}

export const errorHandler = (err: CustomError, req: Request, res: Response, _next: NextFunction) => {
  logger.error(err.stack)

  // Default error
  let status = err.status || 500
  let message = err.message || 'Internal Server Error'

  // Handle specific error types
  if (err.name === 'ValidationError') {
    status = 400
    message = 'Validation Error'
  }

  if (err.name === 'UnauthorizedError') {
    status = 401
    message = 'Unauthorized'
  }

  // Sequelize/MySQL specific errors
  if (
    err.name === 'SequelizeUniqueConstraintError' ||
    (err as CustomError).code === 'ER_DUP_ENTRY'
  ) {
    status = 409
    message = 'Resource already exists'
  }

  if (
    err.name === 'SequelizeForeignKeyConstraintError' ||
    (err as CustomError).code === 'ER_NO_REFERENCED_ROW_2'
  ) {
    status = 400
    message = 'Invalid reference to related resource'
  }

  if (err.name === 'SequelizeValidationError') {
    status = 400
    message = (err as CustomError).errors?.[0]?.message || 'Validation Error'
  }

  res.status(status).json({
    error: message,
    ...((env.APP_STAGE === 'dev' || env.APP_STAGE === 'local') && {
      stack: err.stack,
      details: err.message,
    }),
  })
}
