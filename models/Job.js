'use strict';

module.exports = (sequelize, DataTypes) => {
  const Job = sequelize.define('Job', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    jobId: {
      // 11-digit unique job identifier
      type: DataTypes.BIGINT,
      allowNull: false,
      unique: true,
      field: 'job_id'
    },
    title: {

      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
    
      type: DataTypes.TEXT,
      allowNull: true
    },
    imageUrl: {

      type: DataTypes.STRING,
      allowNull: true,
      field: 'image_url'
    },
    pricePerHour: {
  
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'price_per_hour'
    },
    shiftTime: {
    
      type: DataTypes.STRING,
      allowNull: true,
      field: 'shift_time'
    },
    shiftDay: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'shift_day'
    },
    location: {

      type: DataTypes.STRING,
      allowNull: true
    },
    responsibilities: {
   
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      field: 'responsibilities'
    },
    requirements: {
   
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      field: 'requirements'
    },
    requiredSkills: {

      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      field: 'required_skills'
    },
    skills: {
   
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: []
    },
    dressCode: {
    
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      field: 'dress_code'
    },
    googleMapUrl: {
      
      type: DataTypes.STRING,
      allowNull: true,
      field: 'google_map_url'
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'company_name'
    },
    vendorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'vendor_id'
    }
  }, {
    tableName: 'jobs',
    underscored: true
  });
  // Generate a unique 11-digit jobId if not provided
  function generateElevenDigitId() {
    const min = 10000000000; // 11 digits, cannot start with 0
    const max = 99999999999;
    const candidate = Math.floor(Math.random() * (max - min + 1)) + min;
    return String(candidate);
  }

  Job.beforeValidate(async (job) => {
    if (!job.jobId) {
      // Try a few times to avoid rare collisions; uniqueness also enforced at DB level
      for (let attempt = 0; attempt < 5; attempt += 1) {
        const candidate = generateElevenDigitId();
        // Check existing to minimize chance of violating unique constraint
        // Note: BIGINT values are handled as strings by Sequelize when large
        const existing = await Job.findOne({ where: { jobId: candidate } });
        if (!existing) {
          job.jobId = candidate;
          break;
        }
      }
      if (!job.jobId) {
        job.jobId = generateElevenDigitId();
      }
    }
  });

  return Job;
};


