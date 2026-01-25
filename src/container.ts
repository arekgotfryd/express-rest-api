import { UserService } from './services/userService.ts'
import { OrderService } from './services/orderService.ts'
import { OrganizationService } from './services/organizationService.ts'
import { SequelizeUserRepository } from './db/repository/SequelizeUserRepository.ts'
import { SequelizeOrderRepository } from './db/repository/SequelizeOrderRepository.ts'
import { SequelizeOrganizationRepository } from './db/repository/SequelizeOrganizationRepository.ts'

// Dependency Injection Container
export const container = {
  userService: new UserService(new SequelizeUserRepository()),
  orderService: new OrderService(new SequelizeOrderRepository()),
  organizationService: new OrganizationService(new SequelizeOrganizationRepository()),
}

export type Container = typeof container
