const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database");

const PaymentOrder = sequelize.define("PaymentOrder", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    orderId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    paymentId: {
        type: DataTypes.STRING,
        allowNull: true, 
    },
    status: {
        type: DataTypes.STRING(20), // Increase length to 20 if needed
        allowNull: false,
    },      
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    currency: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
});

module.exports = PaymentOrder;
