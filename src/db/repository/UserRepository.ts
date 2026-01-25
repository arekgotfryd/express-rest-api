import type { User } from "../../models/user.ts"

export interface UserRepository {
 findById(id:string|number): Promise<User | null>
 save(user:User): Promise<User>
 delete(id: string | number): Promise<number>
 update(id: string | number, user: User): Promise<number>
 findAll(limit:number, offset:number): Promise<User[] | null>
 count(criteria?:any): Promise<number>
}