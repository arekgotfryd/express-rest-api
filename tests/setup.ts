// Set required environment variables for unit tests only
// E2E tests should use real .env values
const isE2E = process.env.npm_lifecycle_event === 'test:e2e'

if (!isE2E) {
  process.env.APP_STAGE = 'test'
  process.env.DATABASE_URL = 'mysql://test:test@localhost:3306/test'
  process.env.JWT_SECRET = '12345678901234567890123456789012'
  process.env.REFRESH_TOKEN_SECRET = '12345678901234567890123456789012'
}
