import type { Order } from '../models/order.ts'
import type { Repository } from '../db/repository.ts'

export class OrderService {
  constructor(private repository: Repository<Order>) {}

  findById(id: string | number) {
    return this.repository.findById(id)
  }

  save(order: Partial<Order>) {
    return this.repository.save(order)
  }

  bulkSave(orders: Partial<Order>[]) {
    return this.repository.bulkSave(orders)
  }

  delete(id: string | number) {
    return this.repository.delete(id)
  }

  update(id: string | number, order: Partial<Order>) {
    return this.repository.update(id, order)
  }

  count() {
    return this.repository.count()
  }

  findAll(limit: number, offset: number): Promise<Order[]> {
    return this.repository.findAll(limit, offset)
  }
}
