const Expense = require('../models/Expense');
const User = require('../models/User');
const sequelize = require('../utils/database'); // Ensure this is correctly imported

exports.addExpense = async (req, res) => {
    const transaction = await sequelize.transaction(); // Start a transaction
    try {
        const { amount, description, category } = req.body;
        const userId = req.user.userId;

        const user = await User.findOne({ where: { id: userId }, transaction });

        if (!user) {
            await transaction.rollback();
            return res.status(404).json({ error: "User not found!" });
        }

        console.log("Before adding expense, totalExpense:", user.totalExpense);
        
        // Update totalExpense
        user.totalExpense = (user.totalExpense || 0) + parseFloat(amount);
        await user.save({ transaction });

        // Add expense
        const expense = await Expense.create({
            amount,
            description,
            category,
            userId,
        }, { transaction });

        await transaction.commit();
        console.log("After adding expense, totalExpense:", user.totalExpense);

        res.status(201).json({ message: "Expense added successfully!", expense });
    } catch (error) {
        await transaction.rollback();
        console.error("Error adding expense:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.editExpense = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { amount, description, category } = req.body;
        const userId = req.user.userId;

        const expense = await Expense.findOne({ where: { id, userId }, transaction });

        if (!expense) {
            await transaction.rollback();
            return res.status(404).json({ error: "Expense not found or unauthorized" });
        }

        const user = await User.findOne({ where: { id: userId }, transaction });
        if (!user) {
            await transaction.rollback();
            return res.status(404).json({ error: "User not found" });
        }

        console.log("Before editing, totalExpense:", user.totalExpense);

        // Update totalExpense correctly
        user.totalExpense = (user.totalExpense || 0) - parseFloat(expense.amount) + parseFloat(amount);
        await user.save({ transaction });

        expense.amount = amount;
        expense.description = description;
        expense.category = category;
        await expense.save({ transaction });

        await transaction.commit();
        console.log("After editing, totalExpense:", user.totalExpense);

        res.status(200).json({ message: "Expense updated successfully!", expense });
    } catch (error) {
        await transaction.rollback();
        console.error("Error editing expense:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.getExpenses = async (req, res) => {
    try {
        const userId = req.user.userId;

        const expenses = await Expense.findAll({ where: { userId } });

        res.status(200).json({ expenses });
    } catch (error) {
        console.error("Error fetching expenses:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.deleteExpense = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const expense = await Expense.findOne({ where: { id, userId }, transaction });

        if (!expense) {
            await transaction.rollback();
            return res.status(404).json({ error: "Expense not found or unauthorized" });
        }

        const user = await User.findOne({ where: { id: userId }, transaction });
        if (!user) {
            await transaction.rollback();
            return res.status(404).json({ error: "User not found" });
        }

        console.log("Before deleting, totalExpense:", user.totalExpense);

        // Subtract the deleted expense from totalExpense
        user.totalExpense = (user.totalExpense || 0) - parseFloat(expense.amount);
        await user.save({ transaction });

        await expense.destroy({ transaction });
        await transaction.commit();

        console.log("After deleting, totalExpense:", user.totalExpense);
        
        res.status(200).json({ message: "Expense deleted successfully!" });
    } catch (error) {
        await transaction.rollback();
        console.error("Error deleting expense:", error);
        res.status(500).json({ error: error.message });
    }
};
