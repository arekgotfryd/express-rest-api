/**
 * Mapper functions to transform models to DTOs
 * These ensure consistent API responses and prevent leaking sensitive data
 */

import type { User } from '../models/user.ts'
import type { Organization } from '../models/organization.ts'
import type { Order } from '../models/order.ts'
import type {
  UserDTO,
  UserWithOrganizationDTO,
  OrganizationDTO,
  OrderDTO,
  OrderWithRelationsDTO,
  PaginationDTO,
} from './index.ts'

/**
 * Map User model to UserDTO (excludes password and other sensitive fields)
 */
export const toUserDTO = (user: User): UserDTO => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName ?? undefined,
  lastName: user.lastName ?? undefined,
})

/**
 * Map User model to UserWithOrganizationDTO
 */
export const toUserWithOrganizationDTO = (user: User): UserWithOrganizationDTO => ({
  ...toUserDTO(user),
  organizationId: user.organizationId,
})

/**
 * Map Organization model to OrganizationDTO
 */
export const toOrganizationDTO = (organization: Organization): OrganizationDTO => ({
  id: organization.id,
  name: organization.name,
  industry: organization.industry,
  dateFounded: organization.dateFounded,
})

/**
 * Map Order model to OrderDTO
 */
export const toOrderDTO = (order: Order): OrderDTO => ({
  id: order.id,
  totalAmount: order.totalAmount,
  userId: order.userId,
  organizationId: order.organizationId,
})

/**
 * Map Order model with relations to OrderWithRelationsDTO
 */
export const toOrderWithRelationsDTO = (order: Order): OrderWithRelationsDTO => ({
  ...toOrderDTO(order),
  user: order.user
    ? {
        id: order.user.id,
        email: order.user.email,
      }
    : undefined,
  organization: order.organization
    ? {
        id: order.organization.id,
        name: order.organization.name,
      }
    : undefined,
})

/**
 * Create pagination metadata
 */
export const toPaginationDTO = (
  page: number,
  limit: number,
  totalCount: number
): PaginationDTO => {
  const totalPages = Math.ceil(totalCount / limit)
  return {
    page,
    limit,
    totalCount,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  }
}

/**
 * Map an array of models to DTOs
 */
export const toUserDTOList = (users: User[]): UserDTO[] => users.map(toUserDTO)

export const toOrganizationDTOList = (organizations: Organization[]): OrganizationDTO[] =>
  organizations.map(toOrganizationDTO)

export const toOrderDTOList = (orders: Order[]): OrderDTO[] => orders.map(toOrderDTO)
