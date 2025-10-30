'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('jobs');
    if (!table.shift_day) {
      await queryInterface.addColumn('jobs', 'shift_day', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }
    if (!table.company_name) {
      await queryInterface.addColumn('jobs', 'company_name', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }
    if (table.latitude) {
      await queryInterface.removeColumn('jobs', 'latitude');
    }
    if (table.longitude) {
      await queryInterface.removeColumn('jobs', 'longitude');
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('jobs');
    if (table.shift_day) {
      await queryInterface.removeColumn('jobs', 'shift_day');
    }
    if (table.company_name) {
      await queryInterface.removeColumn('jobs', 'company_name');
    }
    if (!table.latitude) {
      await queryInterface.addColumn('jobs', 'latitude', {
        type: Sequelize.DECIMAL(9, 6),
        allowNull: true
      });
    }
    if (!table.longitude) {
      await queryInterface.addColumn('jobs', 'longitude', {
        type: Sequelize.DECIMAL(9, 6),
        allowNull: true
      });
    }
  }
};


