'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('job_applications', 'scheduled_date', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('job_applications', 'scheduled_time', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('job_applications', 'completed_at', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('job_applications', 'notes', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    // Update the status enum to include 'completed'
    await queryInterface.changeColumn('job_applications', 'status', {
      type: Sequelize.ENUM('applied', 'review', 'accepted', 'rejected', 'completed'),
      allowNull: false,
      defaultValue: 'applied'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('job_applications', 'scheduled_date');
    await queryInterface.removeColumn('job_applications', 'scheduled_time');
    await queryInterface.removeColumn('job_applications', 'completed_at');
    await queryInterface.removeColumn('job_applications', 'notes');

    // Revert the status enum to original values
    await queryInterface.changeColumn('job_applications', 'status', {
      type: Sequelize.ENUM('applied', 'review', 'accepted', 'rejected'),
      allowNull: false,
      defaultValue: 'applied'
    });
  }
};
