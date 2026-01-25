import type { Organization } from '../models/organization.ts'
import type { Repository } from '../db/repository/Repository.ts'

export class OrganizationService {
  constructor(private repository: Repository<Organization>) {}

  findById(id: string | number) {
    return this.repository.findById(id)
  }

  save(organization: Partial<Organization>) {
    return this.repository.save(organization)
  }

  delete(id: string | number) {
    return this.repository.delete(id)
  }

  update(id: string | number, organization: Partial<Organization>) {
    return this.repository.update(id, organization)
  }

  count() {
    return this.repository.count()
  }

  findAll(limit: number, offset: number): Promise<Organization[]> {
    return this.repository.findAll(limit, offset)
  }
}
