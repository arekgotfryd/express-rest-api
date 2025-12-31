/**
 * Data Transfer Objects (DTOs) for API responses
 * These types ensure we don't expose internal model details to clients
 */

// User DTOs
export interface UserDTO {
  id: string
  email: string
  firstName?: string
  lastName?: string
}

export interface UserWithOrganizationDTO extends UserDTO {
  organizationId: string
}

// Organization DTOs
export interface OrganizationDTO {
  id: string
  name: string
  industry: string
  dateFounded: Date
}

// Order DTOs
export interface OrderDTO {
  id: string
  totalAmount: number
  userId: string
  organizationId: string
  orderDate?: Date
}

export interface OrderWithRelationsDTO extends OrderDTO {
  user?: {
    id: string
    email: string
  }
  organization?: {
    id: string
    name: string
  }
}

// Pagination DTO
export interface PaginationDTO {
  page: number
  limit: number
  totalCount: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

// Common Response DTOs
export interface ErrorDTO {
  error: string
}

export interface MessageDTO {
  message: string
}

// Paginated Response DTOs
export interface UsersResponseDTO {
  users: UserDTO[]
  pagination: PaginationDTO
}

export interface OrganizationsResponseDTO {
  organizations: OrganizationDTO[]
  pagination: PaginationDTO
}

export interface OrdersResponseDTO {
  orders: OrderDTO[]
  pagination: PaginationDTO
}

// Single Item Response DTOs
export interface UserResponseDTO {
  user: UserDTO
}

export interface OrganizationResponseDTO {
  organization: OrganizationDTO
}

export interface OrderResponseDTO {
  order: OrderDTO
}

export interface OrderWithRelationsResponseDTO {
  order: OrderWithRelationsDTO
}

// Auth DTO
export interface AuthResponseDTO {
  message: string
  user: UserDTO
  token: string
  refreshToken: string
}

export interface RefreshTokenResponseDTO {
  token: string
  refreshToken: string
}
