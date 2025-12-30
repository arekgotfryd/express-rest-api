import type { Model, ModelStatic, FindOptions, CreateOptions, UpdateOptions, DestroyOptions } from 'sequelize'

/**
 * Generic CRUD interface for service classes
 * @template TModel - The Sequelize Model class
 * @template TAttributes - The model's attributes type
 * @template TCreationAttributes - The model's creation attributes type
 */
export interface CRUD<
  TModel extends Model<TAttributes, TCreationAttributes>,
  TAttributes = any,
  TCreationAttributes = TAttributes
> {
  /**
   * Create a new record
   * @param data - The data for creating the record
   * @param options - Optional Sequelize create options
   * @returns The created record
   */
  create(data: TCreationAttributes, options?: CreateOptions): Promise<TModel>

  /**
   * Find a single record by ID
   * @param id - The record ID
   * @param options - Optional Sequelize find options
   * @returns The found record or null
   */
  findById(id: string | number, options?: Omit<FindOptions<TAttributes>, 'where'>): Promise<TModel | null>

  /**
   * Find a single record by criteria
   * @param criteria - The search criteria
   * @param options - Optional Sequelize find options
   * @returns The found record or null
   */
  findOne(criteria: Partial<TAttributes>, options?: Omit<FindOptions<TAttributes>, 'where'>): Promise<TModel | null>

  /**
   * Find all records matching criteria
   * @param criteria - Optional search criteria
   * @param options - Optional Sequelize find options
   * @returns Array of matching records
   */
  findAll(criteria?: Partial<TAttributes>, options?: Omit<FindOptions<TAttributes>, 'where'>): Promise<TModel[]>

  /**
   * Update a record by ID
   * @param id - The record ID
   * @param data - The data to update
   * @param options - Optional Sequelize update options
   * @returns The number of affected rows
   */
  update(id: string | number, data: Partial<TAttributes>, options?: Omit<UpdateOptions, 'where'>): Promise<[number]>

  /**
   * Delete a record by ID
   * @param id - The record ID
   * @param options - Optional Sequelize destroy options
   * @returns The number of deleted rows
   */
  delete(id: string | number, options?: Omit<DestroyOptions, 'where'>): Promise<number>

  /**
   * Count records matching criteria
   * @param criteria - Optional search criteria
   * @returns The count of matching records
   */
  count(criteria?: Partial<TAttributes>): Promise<number>

  /**
   * Check if a record exists by ID
   * @param id - The record ID
   * @returns True if the record exists, false otherwise
   */
  exists(id: string | number): Promise<boolean>
}

/**
 * Base CRUD service implementation
 * Provides default implementations for common CRUD operations
 */
export abstract class BaseCRUDService<
  TModel extends Model<TAttributes, TCreationAttributes>,
  TAttributes = any,
  TCreationAttributes = TAttributes
> implements CRUD<TModel, TAttributes, TCreationAttributes> {
  protected model: ModelStatic<TModel>
  
  constructor(model: ModelStatic<TModel>) {
    this.model = model
  }

  async create(data: TCreationAttributes, options?: CreateOptions): Promise<TModel> {
    return await this.model.create(data as any, options)
  }

  async findById(id: string | number, options?: Omit<FindOptions<TAttributes>, 'where'>): Promise<TModel | null> {
    return await this.model.findByPk(id, options as FindOptions<TAttributes>)
  }

  async findOne(criteria: Partial<TAttributes>, options?: Omit<FindOptions<TAttributes>, 'where'>): Promise<TModel | null> {
    return await this.model.findOne({
      ...options,
      where: criteria as any,
    } as FindOptions<TAttributes>)
  }

  async findAll(criteria?: Partial<TAttributes>, options?: Omit<FindOptions<TAttributes>, 'where'>): Promise<TModel[]> {
    return await this.model.findAll({
      ...options,
      where: criteria as any,
    } as FindOptions<TAttributes>)
  }

  async update(id: string | number, data: Partial<TAttributes>, options?: Omit<UpdateOptions, 'where'>): Promise<[number]> {
    const [affectedCount] = await this.model.update(data as any, {
      ...options,
      where: { id } as any,
    } as UpdateOptions)
    return [affectedCount]
  }

  async delete(id: string | number, options?: Omit<DestroyOptions, 'where'>): Promise<number> {
    return await this.model.destroy({
      ...options,
      where: { id } as any,
    })
  }

  async count(criteria?: Partial<TAttributes>): Promise<number> {
    return await this.model.count({
      where: criteria as any,
    })
  }

  async exists(id: string | number): Promise<boolean> {
    const count = await this.model.count({
      where: { id } as any,
    })
    return count > 0
  }
}
