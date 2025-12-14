
import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional, type ForeignKey, type NonAttribute } from 'sequelize'
import { User } from './user.ts'
import { Organization } from './organization.ts'
import { sequelize } from '../db/connection.ts'

// Order model
export class Order extends Model<InferAttributes<Order>, InferCreationAttributes<Order>> {
  declare id: CreationOptional<string>
  declare totalAmount: number
  declare userId: ForeignKey<User['id']>
  declare organizationId: ForeignKey<Organization['id']>
}

Order.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    totalAmount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'total_amount',
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'organization_id',
    },
  },
  {
    sequelize,
    tableName: 'orders',
    timestamps: true,
    createdAt: 'order_date',
    updatedAt: false,
    underscored: true,
  }
)

Order.belongsTo(User, { foreignKey: 'userId', as: 'user' })
Order.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' })
// export type OrderAttributes = InferAttributes<Order>
// export type NewOrderAttributes = InferCreationAttributes<Order>

export const orders = Order 