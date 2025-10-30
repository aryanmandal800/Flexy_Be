'use strict';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'password_hash'
    }
  }, {
    tableName: 'users',
    underscored: true
  });
  
  User.associate = (models) => {
    User.hasOne(models.UserProfile, {
      foreignKey: 'userId',
      as: 'profile',
      onDelete: 'CASCADE'
    });
  };

  return User;
};


