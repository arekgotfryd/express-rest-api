import {
  DataTypes,
  Model,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
} from 'sequelize'
import { sequelize } from '../db/connection.ts'

export class RefreshToken extends Model<
  InferAttributes<RefreshToken>,
  InferCreationAttributes<RefreshToken>
> {
  declare id: CreationOptional<string>
  declare token: string
  declare userId: string
  declare tokenFamily: string
  declare revoked: boolean
}

RefreshToken.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    token: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    tokenFamily: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    revoked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
  },
  {
    sequelize,
    tableName: 'refresh_tokens',
    timestamps: true,
    underscored: true,
    createdAt: 'date_created',
    updatedAt: false,
  },
)

export const refresh_tokens = RefreshToken
