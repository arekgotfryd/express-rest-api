'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. RefreshTokens
    await queryInterface.createTable('refresh_tokens', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      token: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      tokenFamily: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('refresh_tokens')
  },
}
