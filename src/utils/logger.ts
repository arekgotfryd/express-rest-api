import { createLogger, format, transports } from 'winston'
import { env } from '../../env.ts'

const logger = createLogger({
  level: env.LOG_LEVEL,
  defaultMeta: { service: 'express-rest-api' },
  transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log`.
    // - Write all logs error (and below) to `error.log`.
    //
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'combined.log' }),
  ],
})

//
// If we're not in production then **ALSO** log to the `console`
// with the colorized simple format.
//
if (env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ level, message, ms, ...rest }) => {
          // Format SQL queries with timing
          if (ms !== undefined) {
            return `${level}: ${message} (${ms}ms)`
          }
          // Format regular messages
          const extra = Object.keys(rest).length > 1 ? ` ${JSON.stringify(rest)}` : ''
          return `${level}: ${message}${extra}`
        })
      ),
    })
  )
}

export { logger }
export default logger
