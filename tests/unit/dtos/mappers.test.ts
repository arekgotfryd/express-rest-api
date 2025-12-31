import { describe, it, expect } from 'vitest'
import {
  toUserDTO,
  toUserWithOrganizationDTO,
  toOrganizationDTO,
  toOrderDTO,
  toOrderWithRelationsDTO,
  toPaginationDTO,
  toUserDTOList,
  toOrganizationDTOList,
  toOrderDTOList,
} from '../../../src/dtos/mappers.ts'

describe('DTO Mappers', () => {
  describe('toUserDTO', () => {
    it('should map user to UserDTO excluding sensitive fields', () => {
      const user = {
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'secret-hash',
        organizationId: 'org-123',
      }

      const result = toUserDTO(user as any)

      expect(result).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      })
      expect(result).not.toHaveProperty('password')
      expect(result).not.toHaveProperty('organizationId')
    })

    it('should handle null firstName and lastName', () => {
      const user = {
        id: 'user-123',
        email: 'test@example.com',
        firstName: null,
        lastName: null,
      }

      const result = toUserDTO(user as any)

      expect(result.firstName).toBeUndefined()
      expect(result.lastName).toBeUndefined()
    })
  })

  describe('toUserWithOrganizationDTO', () => {
    it('should include organizationId', () => {
      const user = {
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        organizationId: 'org-456',
      }

      const result = toUserWithOrganizationDTO(user as any)

      expect(result).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        organizationId: 'org-456',
      })
    })
  })

  describe('toOrganizationDTO', () => {
    it('should map organization correctly', () => {
      const org = {
        id: 'org-123',
        name: 'Acme Corp',
        industry: 'Technology',
        dateFounded: new Date('2020-01-15'),
      }

      const result = toOrganizationDTO(org as any)

      expect(result).toEqual({
        id: 'org-123',
        name: 'Acme Corp',
        industry: 'Technology',
        dateFounded: new Date('2020-01-15'),
      })
    })
  })

  describe('toOrderDTO', () => {
    it('should map order correctly', () => {
      const order = {
        id: 'order-123',
        totalAmount: 99.99,
        userId: 'user-456',
        organizationId: 'org-789',
      }

      const result = toOrderDTO(order as any)

      expect(result).toEqual({
        id: 'order-123',
        totalAmount: 99.99,
        userId: 'user-456',
        organizationId: 'org-789',
      })
    })
  })

  describe('toOrderWithRelationsDTO', () => {
    it('should include user and organization relations', () => {
      const order = {
        id: 'order-123',
        totalAmount: 99.99,
        userId: 'user-456',
        organizationId: 'org-789',
        user: {
          id: 'user-456',
          email: 'user@example.com',
        },
        organization: {
          id: 'org-789',
          name: 'Acme Corp',
        },
      }

      const result = toOrderWithRelationsDTO(order as any)

      expect(result).toEqual({
        id: 'order-123',
        totalAmount: 99.99,
        userId: 'user-456',
        organizationId: 'org-789',
        user: {
          id: 'user-456',
          email: 'user@example.com',
        },
        organization: {
          id: 'org-789',
          name: 'Acme Corp',
        },
      })
    })

    it('should handle missing user relation', () => {
      const order = {
        id: 'order-123',
        totalAmount: 99.99,
        userId: 'user-456',
        organizationId: 'org-789',
        user: null,
        organization: {
          id: 'org-789',
          name: 'Acme Corp',
        },
      }

      const result = toOrderWithRelationsDTO(order as any)

      expect(result.user).toBeUndefined()
      expect(result.organization).toBeDefined()
    })

    it('should handle missing organization relation', () => {
      const order = {
        id: 'order-123',
        totalAmount: 99.99,
        userId: 'user-456',
        organizationId: 'org-789',
        user: {
          id: 'user-456',
          email: 'user@example.com',
        },
        organization: null,
      }

      const result = toOrderWithRelationsDTO(order as any)

      expect(result.user).toBeDefined()
      expect(result.organization).toBeUndefined()
    })
  })

  describe('toPaginationDTO', () => {
    it('should calculate pagination correctly', () => {
      const result = toPaginationDTO(2, 10, 45)

      expect(result).toEqual({
        page: 2,
        limit: 10,
        totalCount: 45,
        totalPages: 5,
        hasNextPage: true,
        hasPreviousPage: true,
      })
    })

    it('should return hasNextPage false on last page', () => {
      const result = toPaginationDTO(5, 10, 50)

      expect(result.hasNextPage).toBe(false)
      expect(result.hasPreviousPage).toBe(true)
    })

    it('should return hasPreviousPage false on first page', () => {
      const result = toPaginationDTO(1, 10, 50)

      expect(result.hasNextPage).toBe(true)
      expect(result.hasPreviousPage).toBe(false)
    })

    it('should handle single page', () => {
      const result = toPaginationDTO(1, 10, 5)

      expect(result.totalPages).toBe(1)
      expect(result.hasNextPage).toBe(false)
      expect(result.hasPreviousPage).toBe(false)
    })

    it('should handle empty results', () => {
      const result = toPaginationDTO(1, 10, 0)

      expect(result.totalPages).toBe(0)
      expect(result.hasNextPage).toBe(false)
      expect(result.hasPreviousPage).toBe(false)
    })
  })

  describe('List mappers', () => {
    it('toUserDTOList should map array of users', () => {
      const users = [
        { id: 'u1', email: 'u1@test.com', firstName: 'A', lastName: 'B' },
        { id: 'u2', email: 'u2@test.com', firstName: 'C', lastName: 'D' },
      ]

      const result = toUserDTOList(users as any)

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('u1')
      expect(result[1].id).toBe('u2')
    })

    it('toOrganizationDTOList should map array of organizations', () => {
      const orgs = [
        { id: 'o1', name: 'Org1', industry: 'Tech', dateFounded: new Date() },
        { id: 'o2', name: 'Org2', industry: 'Finance', dateFounded: new Date() },
      ]

      const result = toOrganizationDTOList(orgs as any)

      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('Org1')
      expect(result[1].name).toBe('Org2')
    })

    it('toOrderDTOList should map array of orders', () => {
      const orders = [
        { id: 'ord1', totalAmount: 100, userId: 'u1', organizationId: 'o1' },
        { id: 'ord2', totalAmount: 200, userId: 'u2', organizationId: 'o2' },
      ]

      const result = toOrderDTOList(orders as any)

      expect(result).toHaveLength(2)
      expect(result[0].totalAmount).toBe(100)
      expect(result[1].totalAmount).toBe(200)
    })
  })
})
