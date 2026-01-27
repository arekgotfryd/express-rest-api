'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. RefreshTokens
    await queryInterface.createTable('refresh_tokens', {
      id: {
        type: Sequelize.UUID,
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
        field: 'user_id',
      },
      tokenFamily: {
        type: Sequelize.STRING(255),
        allowNull: false,
        field: 'token_family',
      },
      revoked: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      dateCreated: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'date_created',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('refresh_tokens')
  },
}
