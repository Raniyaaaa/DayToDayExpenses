const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

  const ForgotPasswordRequests = sequelize.define('ForgotPasswordRequests', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4, 
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
  });

  

module.exports = ForgotPasswordRequests;