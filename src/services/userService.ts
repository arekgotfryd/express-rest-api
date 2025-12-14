import { BaseCRUDService } from './crud.ts'
import { User } from '../models/index.ts'
import type { InferAttributes, InferCreationAttributes } from 'sequelize'

export class UserService extends BaseCRUDService<
  User,
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  constructor() {
    super(User)
  }
}
