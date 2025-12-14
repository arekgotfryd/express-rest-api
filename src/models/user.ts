import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional, type ForeignKey, type NonAttribute } from 'sequelize'
import { sequelize } from '../db/connection.ts'
import { Organization } from './organization.ts'
import { Order } from './order.ts'

// User model
export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<string>
  declare email: string
  declare password: string
  declare firstName: string | null
  declare lastName: string | null
  declare organizationName: NonAttribute<string>
  declare organizationId: ForeignKey<Organization['id']>
  declare orders: NonAttribute<Order[]>
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'first_name',
    },
    lastName: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'last_name',
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'organization_id',
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    underscored: true,
    createdAt: 'date_created',
    updatedAt: false,
  }
)
User.belongsTo(Organization, { foreignKey: 'organizationId', as: 'user' })

User.hasMany(Order, {
  foreignKey: 'userId',
  as: 'orders',
  onDelete: 'CASCADE',
})
// Type exports (compatible replacements)
export type UserAttributes = InferAttributes<User>
export type NewUserAttributes = InferCreationAttributes<User>
// For compatibility with previous named exports
export const users = User