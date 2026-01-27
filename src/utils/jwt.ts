import { SignJWT, jwtVerify } from 'jose'
import { createSecretKey } from 'crypto'
import env from '../config/env.ts'
import { logger } from './logger.ts'

export interface JwtPayload {
  id: string
  email: string
  organizationId: string
  [key: string]: unknown
}

export interface RefreshTokenPayload extends JwtPayload {
  tokenId: string
  tokenFamily: string
}

export const generateToken = async (payload: JwtPayload): Promise<string> => {
  const secret = env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set')
  }

  const secretKey = createSecretKey(secret, 'utf-8')

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(env.JWT_EXPIRES_IN || '1h')
    .sign(secretKey)
}

export const verifyToken = async (token: string): Promise<JwtPayload> => {
  const secretKey = createSecretKey(env.JWT_SECRET, 'utf-8')
  const { payload } = await jwtVerify(token, secretKey)
  logger.debug('Verified JWT payload:', payload)

  return {
    id: payload.id as string,
    email: payload.email as string,
    organizationId: payload.organizationId as string,
  }
}

export interface GenerateRefreshTokenParams {
  id: string
  email: string
  organizationId: string
  tokenFamily: string
}

export interface GenerateRefreshTokenResult {
  token: string
  tokenId: string
}

/**
 * Generate a refresh token with longer expiration
 * Includes tokenId and tokenFamily in the payload for secure rotation
 */
export const generateRefreshToken = async (
  params: GenerateRefreshTokenParams,
): Promise<GenerateRefreshTokenResult> => {
  const secret = env.REFRESH_TOKEN_SECRET
  if (!secret) {
    throw new Error('REFRESH_TOKEN_SECRET environment variable is not set')
  }

  const tokenId = crypto.randomUUID()
  const secretKey = createSecretKey(secret, 'utf-8')

  const token = await new SignJWT({
    id: params.id,
    email: params.email,
    organizationId: params.organizationId,
    tokenFamily: params.tokenFamily,
    tokenId,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(env.REFRESH_TOKEN_EXPIRES_IN || '30d')
    .sign(secretKey)

  return { token, tokenId }
}

/**
 * Verify a refresh token and return the payload
 */
export const verifyRefreshToken = async (
  token: string,
): Promise<RefreshTokenPayload> => {
  const secret = env.REFRESH_TOKEN_SECRET
  if (!secret) {
    throw new Error('REFRESH_TOKEN_SECRET environment variable is not set')
  }

  const secretKey = createSecretKey(secret, 'utf-8')
  const { payload } = await jwtVerify(token, secretKey)

  return {
    id: payload.id as string,
    email: payload.email as string,
    organizationId: payload.organizationId as string,
    tokenId: payload.tokenId as string,
    tokenFamily: payload.tokenFamily as string,
  }
}

export const generateTokenFamily = (): string => {
  return crypto.randomUUID() // or crypto.randomBytes(16).toString('hex')
}
