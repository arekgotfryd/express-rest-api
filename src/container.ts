import { UserService } from './services/userService.ts'
import { OrderService } from './services/orderService.ts'
import { OrganizationService } from './services/organizationService.ts'
import { SequelizeRepository } from './db/repository/Repository.ts'
import { User } from './models/user.ts'
import { Order } from './models/order.ts'
import { Organization } from './models/organization.ts'

// Dependency Injection Container
export const container = {
  userService: new UserService(new SequelizeRepository(User)),
  orderService: new OrderService(new SequelizeRepository(Order)),
  organizationService: new OrganizationService(new SequelizeRepository(Organization)),
}

export type Container = typeof container
