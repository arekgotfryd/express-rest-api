import { BaseCRUDService } from './crud.ts'
import { Organization } from '../models/organization.ts'
import type { InferAttributes, InferCreationAttributes } from 'sequelize'

export class OrganizationService extends BaseCRUDService<
  Organization,
  InferAttributes<Organization>,
  InferCreationAttributes<Organization>
> {
  constructor() {
    super(Organization)
  }

  // Add custom organization-specific methods here
  async findByIndustry(industry: string): Promise<Organization[]> {
    return await this.findAll({ industry } as Partial<InferAttributes<Organization>>)
  }

  async findByName(name: string): Promise<Organization | null> {
    return await this.findOne({ name } as Partial<InferAttributes<Organization>>)
  }
}
