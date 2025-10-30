'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('job_applications', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      job_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'jobs', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      cover_letter: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('applied', 'review', 'accepted', 'rejected'),
        allowNull: false,
        defaultValue: 'applied'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }
    });
    await queryInterface.addConstraint('job_applications', {
      fields: ['user_id', 'job_id'],
      type: 'unique',
      name: 'uniq_job_applications_user_job'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('job_applications');
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS \"enum_job_applications_status\";");
  }
};


