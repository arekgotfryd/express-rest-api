import { BaseCRUDService } from './crud.ts'
import { Order } from '../models/order.ts'
import type { InferAttributes, InferCreationAttributes } from 'sequelize'

export class OrderService extends BaseCRUDService<
  Order,
  InferAttributes<Order>,
  InferCreationAttributes<Order, {omit: 'id'}>>
 {
  constructor() {
    super(Order)
  }

  async findByUser(userId: string): Promise<Order[]> {
    return await this.findAll({ userId } as Partial<InferAttributes<Order>>)
  }

  async findByOrganization(organizationId: string): Promise<Order[]> {
    return await this.findAll({ organizationId } as Partial<
      InferAttributes<Order>
    >)
  }

  async getTotalAmountByUser(userId: string): Promise<number> {
    const orders = await this.findByUser(userId)
    return orders.reduce((sum, order) => sum + order.totalAmount, 0)
  }
}
