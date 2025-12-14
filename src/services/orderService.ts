import { BaseCRUDService } from './crud.ts'
import { Order } from '../models/index.ts'
import type { InferAttributes, InferCreationAttributes } from 'sequelize'

export class OrderService extends BaseCRUDService<
  Order,
  InferAttributes<Order>,
  InferCreationAttributes<Order, { omit: 'id' }>
> {
  constructor() {
    super(Order)
  }
}
