import {
  DataTypes,
  Model,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  type NonAttribute,
} from 'sequelize'
import { sequelize } from '../db/connection.ts'
import { User } from './user.ts'
import { Order } from './order.ts'

// Organization model
export class Organization extends Model<
  InferAttributes<Organization>,
  InferCreationAttributes<Organization>
> {
  declare id: CreationOptional<string>
  declare name: string
  declare industry: string
  declare dateFounded: Date
  declare orders: NonAttribute<Order[]>
}

Organization.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    industry: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    dateFounded: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'date_founded',
    },
  },
  {
    sequelize,
    tableName: 'organizations',
    timestamps: true,
    createdAt: false,
    updatedAt: false,
    underscored: true,
  }
)
// Associations
Organization.hasMany(User, {
  foreignKey: 'organizationId',
  as: 'users',
  onDelete: 'CASCADE',
})
Organization.hasMany(Order, {
  foreignKey: 'organizationId',
  as: 'orders',
  onDelete: 'CASCADE'
})
export type OrganizationAttributes = InferAttributes<Organization>
export type NewOrganizationAttributes = InferCreationAttributes<Organization>
export const organizations = Organization
