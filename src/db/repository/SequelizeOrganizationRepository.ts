import { Organization } from '../../models/organization.ts'
import type { OrganizationRepository } from './OrganizationRepository.ts'

export class SequelizeOrganizationRepository implements OrganizationRepository {
  findById(id: string | number) {
    return Organization.findByPk(id)
  }
  save(organization: Organization) {
    return Organization.create(organization)
  }
  delete(id: string | number) {
    return Organization.destroy({ where: { id } })
  }
  async update(id: string | number, organization: Organization) {
    const [affectedNumber] = await Organization.update(organization, {
      where: { id },
    })
    return affectedNumber
  }
  findAll(limit: number, offset: number) {
    return Organization.findAll({ limit, offset })
  }
  count(criteria?: any) {
    return Organization.count({
      where: criteria as any,
    })
  }
}
