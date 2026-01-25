import type { Order } from "../../models/order.ts"

export interface OrderRepository {
 findById(id:string|number): Promise<Order>
 save(order:Partial<Order>): Promise<Order>
 delete(id: string | number): Promise<number>
 update(id: string | number, order:Partial<Order>): Promise<number>
 findAll(limit:number, offset:number): Promise<Order[]>
 count(criteria?:any): Promise<number>
}