import type { User } from '../models/user.ts'
import type { Repository } from '../db/repository/Repository.ts'

export class UserService {
  constructor(private repository: Repository<User>) {}

  findById(id: string | number) {
    return this.repository.findById(id)
  }

  save(user: Partial<User>) {
    return this.repository.save(user)
  }

  delete(id: string | number) {
    return this.repository.delete(id)
  }

  update(id: string | number, user: Partial<User>) {
    return this.repository.update(id, user)
  }

  count() {
    return this.repository.count()
  }

  findAll(limit: number, offset: number): Promise<User[]> {
    return this.repository.findAll(limit, offset)
  }
}
