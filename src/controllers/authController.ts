import type { Request, Response } from 'express'
import {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateTokenFamily,
} from '../utils/jwt.ts'
import { User, Organization } from '../models/index.ts'
import { logger } from '../utils/logger.ts'
import { toUserDTO } from '../dtos/mappers.ts'
import { hashPassword, comparePassword } from '../utils/password.ts'
import type {
  AuthResponseDTO,
  RefreshTokenResponseDTO,
  ErrorDTO,
} from '../dtos/index.ts'
import { RefreshToken } from '../models/refreshToken.ts'

export const register = async (
  req: Request,
  res: Response<AuthResponseDTO | ErrorDTO>,
) => {
  try {
    const { email, password, firstName, lastName, organizationName } = req.body

    // Hash password
    const hashedPassword = await hashPassword(password)

    const organization = await Organization.findOne({
      where: { name: organizationName },
    })
    if (!organization) {
      return res.status(400).json({ error: 'Organization does not exist' })
    }

    // Create user via Sequelize
    const created = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      organizationId: organization.id,
    })

    // Generate JWT
    const token = await generateToken({
      id: created.id,
      email: created.email,
      organizationId: organization.id,
    })

    // Generate refresh token
    const refreshToken = await generateRefreshToken({
      id: created.id,
      email: created.email,
      organizationId: organization.id,
    })

    await RefreshToken.create({
      token: await hashPassword(refreshToken),
      tokenFamily: generateTokenFamily(),
      userId: created.id,
    })

    res.status(201).json({
      message: 'User created successfully',
      user: toUserDTO(created),
      token,
      refreshToken,
    })
  } catch (error) {
    logger.error('Registration error:', error)
    res.status(500).json({ error: 'Failed to create user' })
  }
}

export const login = async (
  req: Request,
  res: Response<AuthResponseDTO | ErrorDTO>,
) => {
  try {
    const { email, password } = req.body

    // Find user by email
    const user = await User.findOne({ where: { email } })

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password)

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Generate JWT
    const token = await generateToken({
      id: user.id,
      email: user.email,
      organizationId: user.organizationId,
    })

    // Generate refresh token
    const refreshToken = await generateRefreshToken({
      id: user.id,
      email: user.email,
      organizationId: user.organizationId,
    })

    res.json({
      message: 'Login successful',
      user: toUserDTO(user),
      token,
      refreshToken,
    })
  } catch (error) {
    logger.error('Login error:', error)
    res.status(500).json({ error: 'Failed to login' })
  }
}

export const refreshToken = async (
  req: Request,
  res: Response<RefreshTokenResponseDTO | ErrorDTO>,
) => {
  try {
    const { refreshToken: token } = req.body

    if (!token) {
      return res.status(400).json({ error: 'Refresh token is required' })
    }

    // Verify the refresh token
    // just jose verification
    const payload = await verifyRefreshToken(token)

    // Verify user still exists
    const user = await User.findByPk(payload.id)
    if (!user) {
      return res.status(401).json({ error: 'User not found' })
    }
    //hash token and check if exists in db and it hasn't been revoked
    //if it has been revoked revoke all refresh tokens and access token and respond that
    //user should log in again
    //if not revoke this single refresh token
    const hashedRefreshToken = await hashPassword(token);
    const refreshToken = await RefreshToken.findOne({where: { token: hashedRefreshToken}})
    if(refreshToken.revoked){
      await RefreshToken.update({revoked: true},{where: {tokenFamily: refreshToken.tokenFamily}}) 
      return  res.status(401).json({ error: 'Refresh token has been revoked. Please log in again.' })
    } else {
      await RefreshToken.update({revoked: true},{where: {token: hashedRefreshToken}}) 
    }

    // Generate new tokens
    const newToken = await generateToken({
      id: user.id,
      email: user.email,
      organizationId: user.organizationId,
    })

    const newRefreshToken = await generateRefreshToken({
      id: user.id,
      email: user.email,
      organizationId: user.organizationId,
    })

    await RefreshToken.create({
      token: await hashPassword(newRefreshToken),
      userId: user.id,
      tokenFamily: refreshToken.tokenFamily,
    })

    res.json({
      token: newToken,
      refreshToken: newRefreshToken,
    })
  } catch (error) {
    logger.error('Refresh token error:', error)
    res.status(401).json({ error: 'Invalid or expired refresh token' })
  }
}
