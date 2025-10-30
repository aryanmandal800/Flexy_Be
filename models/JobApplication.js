'use strict';

module.exports = (sequelize, DataTypes) => {
  const JobApplication = sequelize.define('JobApplication', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id'
    },
    jobId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'job_id'
    },
    coverLetter: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'cover_letter'
    },
    status: {
      type: DataTypes.ENUM('applied', 'review', 'accepted', 'rejected', 'completed'),
      allowNull: false,
      defaultValue: 'applied'
    },
    scheduledDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'scheduled_date'
    },
    scheduledTime: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'scheduled_time'
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'completed_at'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'job_applications',
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'job_id']
      }
    ]
  });

  JobApplication.associate = (models) => {
    JobApplication.belongsTo(models.User, { foreignKey: 'userId', as: 'user', onDelete: 'CASCADE' });
    JobApplication.belongsTo(models.Job, { foreignKey: 'jobId', as: 'job', onDelete: 'CASCADE' });
  };

  return JobApplication;
};


