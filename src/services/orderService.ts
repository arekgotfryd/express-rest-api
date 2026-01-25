import { Order } from '../models/index.ts'
import type { OrderRepository } from '../db/repository/OrderRepository.ts'

export class OrderService {
  OrderRepository: OrderRepository
  constructor(OrderRepository: OrderRepository) {
    this.OrderRepository = OrderRepository
  }
  findById(id: string | number) {
    return this.OrderRepository.findById(id)
  }
  save(order: Partial<Order>) {
    return this.OrderRepository.save(order)
  }
  delete(id: string | number) {
    return this.OrderRepository.delete(id)
  }
  update(id: string | number, order: Partial<Order>) {
    return this.OrderRepository.update(id, order)
  }
  count() {
    return this.OrderRepository.count()
  }
  findAll(limit: number, offset: number): Promise<Order[] | null> {
    return this.OrderRepository.findAll(limit, offset)
  }
}
