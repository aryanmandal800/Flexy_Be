'use strict';

module.exports = (sequelize, DataTypes) => {
  const UserProfile = sequelize.define('UserProfile', {
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
    nationality: {
      type: DataTypes.STRING,
      allowNull: true
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true
    },
    postcode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    contactPhone: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'contact_phone'
    },
    bankIfsc: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'bank_ifsc'
    },
    bankAccountNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'bank_account_number'
    },
    bankAccountName: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'bank_account_name'
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'image_url'
    },
    birthDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'birth_date'
    },
    languagesKnown: {
      // store as JSON array of strings
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'languages_known'
    },
    importantDetails: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'important_details'
    }
  }, {
    tableName: 'user_profiles',
    underscored: true
  });

  UserProfile.associate = (models) => {
    UserProfile.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
      onDelete: 'CASCADE'
    });
  };

  return UserProfile;
};


