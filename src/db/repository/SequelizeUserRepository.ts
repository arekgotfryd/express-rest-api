import { User } from '../../models/user.ts'
import type { UserRepository } from './UserRepository.ts'

export class SequelizeUserRepository implements UserRepository {
  findById(id: string | number) {
    return User.findByPk(id)
  }
  save(user: User) {
    return User.create(user)
  }
  delete(id: string | number) {
    return User.destroy({ where: { id } })
  }
  async update(id: string | number, user: User) {
    const [affectedNumber] = await User.update(user, { where: { id } })
    return affectedNumber
  }
  findAll(limit: number, offset: number) {
    return User.findAll({ limit, offset })
  }
  count(criteria?: any) {
    return User.count({
      where: criteria as any,
    })
  }
}
