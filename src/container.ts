import { UserService } from './services/userService.ts'
import { OrderService } from './services/orderService.ts'
import { OrganizationService } from './services/organizationService.ts'

// Dependency Injection Container
export const container = {
  userService: new UserService(),
  orderService: new OrderService(),
  organizationService: new OrganizationService(),
}

export type Container = typeof container
