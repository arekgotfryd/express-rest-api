import type { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import { generateToken } from '../utils/jwt.ts'
import { User, Organization } from '../models/index.ts'
import { logger } from '../utils/logger.ts'
import { env } from '../../env.ts'
import { toUserDTO } from '../dtos/mappers.ts'
import type { AuthResponseDTO, ErrorDTO } from '../dtos/index.ts'

export const register = async (
  req: Request,
  res: Response<AuthResponseDTO | ErrorDTO>
) => {
  try {
    const { email, password, firstName, lastName, organizationName } = req.body

    // Hash password
    const saltRounds = env.BCRYPT_SALT_ROUNDS || 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

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

    res.status(201).json({
      message: 'User created successfully',
      user: toUserDTO(created),
      token,
    })
  } catch (error) {
    logger.error('Registration error:', error)
    res.status(500).json({ error: 'Failed to create user' })
  }
}

export const login = async (
  req: Request,
  res: Response<AuthResponseDTO | ErrorDTO>
) => {
  try {
    const { email, password } = req.body

    // Find user by email
    const user = await User.findOne({ where: { email } })

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Generate JWT
    const token = await generateToken({
      id: user.id,
      email: user.email,
      organizationId: user.organizationId,
    })

    res.json({
      message: 'Login successful',
      user: toUserDTO(user),
      token,
    })
  } catch (error) {
    logger.error('Login error:', error)
    res.status(500).json({ error: 'Failed to login' })
  }
}
