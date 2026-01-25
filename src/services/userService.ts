import { User } from '../models/index.ts'
import type { UserRepository } from '../db/repository/UserRepository.ts'

export class UserService {
  userRepository: UserRepository
  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository
  }
  findById(id: string | number) {
    return this.userRepository.findById(id)
  }
  save(user: User) {
    return this.userRepository.save(user)
  }
  delete(id: string | number) {
    return this.userRepository.delete(id)
  }
  update(id: string | number, user: User) {
    return this.userRepository.update(id, user)
  }
  count() {
    return this.userRepository.count()
  }
  findAll(limit: number, offset: number): Promise<User[] | null> {
    return this.userRepository.findAll(limit, offset)
  }
}
