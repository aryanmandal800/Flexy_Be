'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('jobs');
    if (table.published_at) {
      await queryInterface.removeColumn('jobs', 'published_at');
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('jobs');
    if (!table.published_at) {
      await queryInterface.addColumn('jobs', 'published_at', {
        type: Sequelize.DATE,
        allowNull: true
      });
    }
  }
};


