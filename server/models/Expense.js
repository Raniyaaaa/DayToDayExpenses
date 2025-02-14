const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');
const User = require('../models/User');

const Expense = sequelize.define('Expense', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.ENUM('Fuel', 'Food', 'Electricity', 'Movie'),
    allowNull: false,
  },
}, {
  timestamps: true,
});

module.exports = Expense;
