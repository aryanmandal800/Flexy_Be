'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('jobs', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      job_id: {
        // 11-digit unique job identifier
        type: Sequelize.BIGINT,
        allowNull: false,
        unique: true
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      image_url: {
        type: Sequelize.STRING,
        allowNull: true
      },
      price_per_hour: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      published_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      shift_time: {
        type: Sequelize.STRING,
        allowNull: true
      },
      location: {
        type: Sequelize.STRING,
        allowNull: true
      },
      responsibilities: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: []
      },
      requirements: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: []
      },
      required_skills: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: []
      },
      skills: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: []
      },
      dress_code: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: []
      },
      google_map_url: {
        type: Sequelize.STRING,
        allowNull: true
      },
      latitude: {
        type: Sequelize.DECIMAL(9, 6),
        allowNull: true
      },
      longitude: {
        type: Sequelize.DECIMAL(9, 6),
        allowNull: true
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('jobs');
  }
};


