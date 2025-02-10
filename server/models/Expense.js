const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

const Expense = sequelize.define('Expense', {
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