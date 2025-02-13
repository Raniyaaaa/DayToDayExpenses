const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database");

const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isPremium: {
    type: DataTypes.BOOLEAN,
    defaultValue: false, // Default is NOT premium
  },
});

module.exports = User;
