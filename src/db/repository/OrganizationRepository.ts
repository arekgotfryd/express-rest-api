import type { Organization } from '../../models/organization.ts'

export interface OrganizationRepository {
  findById(id: string | number): Promise<Organization | null>
  save(Organization: Partial<Organization>): Promise<Organization>
  delete(id: string | number): Promise<number>
  update(id: string | number, Organization: Partial<Organization>): Promise<number>
  findAll(limit: number, offset: number): Promise<Organization[] | null>
  count(criteria?: any): Promise<number>
}
