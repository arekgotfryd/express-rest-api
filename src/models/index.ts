// Import all models
import { User } from './user.ts'
import { Organization } from './organization.ts'
import { Order } from './order.ts'

// Define all associations here to avoid circular dependencies
// User associations
User.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' })
User.hasMany(Order, {
  foreignKey: 'userId',
  as: 'orders',
  onDelete: 'CASCADE',
})

// Organization associations
Organization.hasMany(User, {
  foreignKey: 'organizationId',
  as: 'users',
  onDelete: 'CASCADE',
})
Organization.hasMany(Order, {
  foreignKey: 'organizationId',
  as: 'orders',
  onDelete: 'CASCADE',
})

// Order associations
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' })
Order.belongsTo(Organization, {
  foreignKey: 'organizationId',
  as: 'organization',
})

// Export all models
export { User, Organization, Order }
