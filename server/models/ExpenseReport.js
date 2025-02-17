const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database");
const User = require("./User");

const ExpenseReport = sequelize.define("ExpenseReport", {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    fileURL: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

// Set up the relationship
User.hasMany(ExpenseReport, { foreignKey: "userId", onDelete: "CASCADE" });
ExpenseReport.belongsTo(User, { foreignKey: "userId" });

module.exports = ExpenseReport;
