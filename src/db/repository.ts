import type { Model, ModelStatic, CreationAttributes } from 'sequelize'

/**
 * Generic repository interface for CRUD operations
 */
export interface Repository<T> {
  findById(id: string | number): Promise<T | null>
  save(entity: Partial<T>): Promise<T>
  bulkSave(entities: Partial<T>[]): Promise<T[]>
  delete(id: string | number): Promise<number>
  update(id: string | number, entity: Partial<T>): Promise<number>
  findAll(limit: number, offset: number): Promise<T[]>
  count(): Promise<number>
}

/**
 * Generic Sequelize repository implementation
 * Works with any Sequelize model
 */
export class SequelizeRepository<T extends Model> implements Repository<T> {
  constructor(private model: ModelStatic<T>) {}

  findById(id: string | number): Promise<T | null> {
    return this.model.findByPk(id)
  }

  save(entity: Partial<T>): Promise<T> {
    return this.model.create(entity as CreationAttributes<T>)
  }

  bulkSave(entities: Partial<T>[]): Promise<T[]> {
    return this.model.bulkCreate(entities as CreationAttributes<T>[])
  }

  delete(id: string | number): Promise<number> {
    return this.model.destroy({ where: { id } as any })
  }

  async update(id: string | number, entity: Partial<T>): Promise<number> {
    const [affectedCount] = await this.model.update(entity as any, {
      where: { id } as any,
    })
    return affectedCount
  }

  findAll(limit: number, offset: number): Promise<T[]> {
    return this.model.findAll({ limit, offset })
  }

  count(): Promise<number> {
    return this.model.count()
  }
}
