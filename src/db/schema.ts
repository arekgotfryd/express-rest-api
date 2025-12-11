import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional, type ForeignKey, type NonAttribute } from 'sequelize'
import { sequelize } from './connection.ts'
import { z } from 'zod'

// User model
export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<string>
  declare email: string
  declare password: string
  declare firstName: string | null
  declare lastName: string | null
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

// Organization model
export class Organization extends Model<InferAttributes<Organization>, InferCreationAttributes<Organization>> {
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

// Associations
Organization.hasMany(User, {
  foreignKey: 'organizationId',
  as: 'users',
  onDelete: 'CASCADE',
})
User.belongsTo(Organization, { foreignKey: 'organizationId', as: 'user' })

User.hasMany(Order, {
  foreignKey: 'userId',
  as: 'orders',
  onDelete: 'CASCADE',
})
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' })

Organization.hasMany(Order, {
  foreignKey: 'organizationId',
  as: 'orders',
  onDelete: 'CASCADE'
})
Order.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' })

// Zod schemas (keep API validation similar to previous drizzle-zod usage)
export const insertUserSchema = z.object({
  email: z.email('Invalid email format'),
  password: z.string().min(8),
  firstName: z.string().max(50).optional(),
  lastName: z.string().max(50).optional(),
  organizationName: z.string().max(100)
})

// Type exports (compatible replacements)
export type UserAttributes = InferAttributes<User>
export type NewUserAttributes = InferCreationAttributes<User>

export type OrganizationAttributes = InferAttributes<Organization>
export type NewOrganizationAttributes = InferCreationAttributes<Organization>

export type OrderAttributes = InferAttributes<Order>
export type NewOrderAttributes = InferCreationAttributes<Order>

// For compatibility with previous named exports
export const users = User
export const organizations = Organization
export const orders = Order 
