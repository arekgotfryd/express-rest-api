'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: { type: Sequelize.UUID, primaryKey: true },
      email: { type: Sequelize.STRING(255), allowNull: false, unique: true },
      username: { type: Sequelize.STRING(50), allowNull: false, unique: true },
      password: { type: Sequelize.STRING(255), allowNull: false },
      first_name: { type: Sequelize.STRING(50) },
      last_name: { type: Sequelize.STRING(50) },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    })

    await queryInterface.createTable('habits', {
      id: { type: Sequelize.UUID, primaryKey: true },
      user_id: { type: Sequelize.UUID, allowNull: false },
      name: { type: Sequelize.STRING(100), allowNull: false },
      description: { type: Sequelize.TEXT },
      frequency: { type: Sequelize.STRING(20), allowNull: false },
      target_count: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    })

    await queryInterface.createTable('entries', {
      id: { type: Sequelize.UUID, primaryKey: true },
      habit_id: { type: Sequelize.UUID, allowNull: false },
      completion_date: { type: Sequelize.DATE, allowNull: false },
      note: { type: Sequelize.TEXT },
      created_at: { type: Sequelize.DATE, allowNull: false },
    })

    await queryInterface.createTable('tags', {
      id: { type: Sequelize.UUID, primaryKey: true },
      name: { type: Sequelize.STRING(50), allowNull: false, unique: true },
      color: { type: Sequelize.STRING(7), allowNull: false, defaultValue: '#6B7280' },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    })

    await queryInterface.createTable('habit_tags', {
      id: { type: Sequelize.UUID, primaryKey: true },
      habit_id: { type: Sequelize.UUID, allowNull: false },
      tag_id: { type: Sequelize.UUID, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
    })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('habit_tags')
    await queryInterface.dropTable('tags')
    await queryInterface.dropTable('entries')
    await queryInterface.dropTable('habits')
    await queryInterface.dropTable('users')
  },
}
