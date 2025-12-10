import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional, type ForeignKey, type NonAttribute } from 'sequelize'
import { sequelize } from './connection.ts'
import { z } from 'zod'

// Users model
export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<string>
  declare email: string
  declare username: string
  declare password: string
  declare firstName: string | null
  declare lastName: string | null
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  declare habits?: NonAttribute<Habit[]>
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
    username: {
      type: DataTypes.STRING(50),
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
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    underscored: true,
  }
)

// Habits model
export class Habit extends Model<InferAttributes<Habit>, InferCreationAttributes<Habit>> {
  declare id: CreationOptional<string>
  declare userId: ForeignKey<User['id']>
  declare name: string
  declare description: string | null
  declare frequency: string
  declare targetCount: CreationOptional<number>
  declare isActive: CreationOptional<boolean>
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  declare user?: NonAttribute<User>
  declare entries?: NonAttribute<Entry[]>
  declare tags?: NonAttribute<Tag[]>
}

Habit.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    frequency: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    targetCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      field: 'target_count',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    tableName: 'habits',
    timestamps: true,
    underscored: true,
  }
)

// Entries model
export class Entry extends Model<InferAttributes<Entry>, InferCreationAttributes<Entry>> {
  declare id: CreationOptional<string>
  declare habitId: ForeignKey<Habit['id']>
  declare completionDate: CreationOptional<Date>
  declare note: string | null
  declare createdAt: CreationOptional<Date>

  declare habit?: NonAttribute<Habit>
}

Entry.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    habitId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'habit_id',
    },
    completionDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'completion_date',
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at',
    },
  },
  {
    sequelize,
    tableName: 'entries',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    underscored: true,
  }
)

// Tags model
export class Tag extends Model<InferAttributes<Tag>, InferCreationAttributes<Tag>> {
  declare id: CreationOptional<string>
  declare name: string
  declare color: CreationOptional<string>
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  declare habits?: NonAttribute<Habit[]>
}

Tag.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    color: {
      type: DataTypes.STRING(7),
      allowNull: false,
      defaultValue: '#6B7280',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    tableName: 'tags',
    timestamps: true,
    underscored: true,
  }
)

// HabitTags (junction) model
export class HabitTag extends Model<InferAttributes<HabitTag>, InferCreationAttributes<HabitTag>> {
  declare id: CreationOptional<string>
  declare habitId: ForeignKey<Habit['id']>
  declare tagId: ForeignKey<Tag['id']>
  declare createdAt: CreationOptional<Date>

  declare habit?: NonAttribute<Habit>
  declare tag?: NonAttribute<Tag>
}

HabitTag.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    habitId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'habit_id',
    },
    tagId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'tag_id',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at',
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'habit_tags',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    underscored: true,
  }
)

// Associations
User.hasMany(Habit, {
  foreignKey: 'userId',
  as: 'habits',
  onDelete: 'CASCADE',
})
Habit.belongsTo(User, { foreignKey: 'userId', as: 'user' })

Habit.hasMany(Entry, {
  foreignKey: 'habitId',
  as: 'entries',
  onDelete: 'CASCADE',
})
Entry.belongsTo(Habit, { foreignKey: 'habitId', as: 'habit' })

Habit.belongsToMany(Tag, {
  through: HabitTag,
  foreignKey: 'habitId',
  otherKey: 'tagId',
  as: 'tags',
})
Tag.belongsToMany(Habit, {
  through: HabitTag,
  foreignKey: 'tagId',
  otherKey: 'habitId',
  as: 'habits',
})

HabitTag.belongsTo(Habit, { foreignKey: 'habitId', as: 'habit' })
HabitTag.belongsTo(Tag, { foreignKey: 'tagId', as: 'tag' })

// Zod schemas (keep API validation similar to previous drizzle-zod usage)
export const insertUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  username: z.string().min(3).max(50),
  password: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
})

// Type exports (compatible replacements)
export type UserAttributes = InferAttributes<User>
export type NewUserAttributes = InferCreationAttributes<User>

export type HabitAttributes = InferAttributes<Habit>
export type NewHabitAttributes = InferCreationAttributes<Habit>

export type EntryAttributes = InferAttributes<Entry>
export type NewEntryAttributes = InferCreationAttributes<Entry>

export type TagAttributes = InferAttributes<Tag>
export type NewTagAttributes = InferCreationAttributes<Tag>

export type HabitTagAttributes = InferAttributes<HabitTag>
export type NewHabitTagAttributes = InferCreationAttributes<HabitTag>

// For compatibility with previous named exports
export const users = User
export const habits = Habit
export const entries = Entry
export const tags = Tag
export const habitTags = HabitTag
