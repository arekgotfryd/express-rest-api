import { Organization } from '../models/index.ts'
import type { OrganizationRepository } from '../db/repository/OrganizationRepository.ts'

export class OrganizationService {
  OrganizationRepository: OrganizationRepository
  constructor(OrganizationRepository: OrganizationRepository) {
    this.OrganizationRepository = OrganizationRepository
  }
  findById(id: string | number) {
    return this.OrganizationRepository.findById(id)
  }
  save(organization: Partial<Organization>) {
    return this.OrganizationRepository.save(organization)
  }
  delete(id: string | number) {
    return this.OrganizationRepository.delete(id)
  }
  update(id: string | number, Organization: Partial<Organization>) {
    return this.OrganizationRepository.update(id, Organization)
  }
  count() {
    return this.OrganizationRepository.count()
  }
  findAll(limit: number, offset: number): Promise<Organization[] | null> {
    return this.OrganizationRepository.findAll(limit, offset)
  }
}
