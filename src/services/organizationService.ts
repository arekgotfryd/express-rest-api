import { BaseCRUDService } from './crud.ts'
import { Organization } from '../models/index.ts'
import type { InferAttributes, InferCreationAttributes } from 'sequelize'

export class OrganizationService extends BaseCRUDService<
  Organization,
  InferAttributes<Organization>,
  InferCreationAttributes<Organization, {omit: 'id'}>
> {
  constructor() {
    super(Organization)
  }
}
