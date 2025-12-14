import { BaseCRUDService } from './crud.ts'
import { User } from '../models/user.ts'
import type { InferAttributes, InferCreationAttributes } from 'sequelize'

export class UserService extends BaseCRUDService<
  User,
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  constructor() {
    super(User)
  }

  // Add custom user-specific methods here
  async findByEmail(email: string): Promise<User | null> {
    return await this.findOne({ email } as Partial<InferAttributes<User>>)
  }

  async findByOrganization(organizationId: string): Promise<User[]> {
    return await this.findAll({ organizationId } as Partial<InferAttributes<User>>)
  }
}