import { Order } from '../../models/order.ts'
import type { OrderRepository } from './OrderRepository.ts'

export class SequelizeOrderRepository implements OrderRepository {
  findById(id: string | number): Promise<Order> {
    return Order.findByPk(id)
  }
  save(order: Order): Promise<Order> {
    return Order.create(order)
  }
  delete(id: string | number): Promise<number> {
    return Order.destroy({ where: { id } })
  }
  async update(id: string | number, order: Order): Promise<number> {
    const [affectedCount] = await Order.update(order, { where: { id } })
    return affectedCount
  }
  findAll(limit: number, offset: number) {
    return Order.findAll({ limit, offset })
  }
  count(criteria?: any) {
    return Order.count({
      where: criteria as any,
    })
  }
}
