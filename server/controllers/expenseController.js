const Expense = require('../models/Expense');
const User = require('../models/User');
const sequelize = require('../utils/database');

exports.addExpense = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { amount, description, category } = req.body;
        const userId = req.user.userId;

        const user = await User.findOne({ where: { id: userId }, transaction });
        if (!user) {
            await transaction.rollback();
            return res.status(404).json({ error: "User not found!" });
        }

        user.totalExpense = (user.totalExpense || 0) + parseFloat(amount);
        await user.save({ transaction });

        const expense = await Expense.create({ amount, description, category, userId }, { transaction });

        await transaction.commit();
        res.status(201).json({ message: "Expense added successfully!", expense });
    } catch (error) {
        if (transaction) await transaction.rollback();
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

        user.totalExpense = (user.totalExpense || 0) - parseFloat(expense.amount) + parseFloat(amount);
        await user.save({ transaction });

        Object.assign(expense, { amount, description, category });
        await expense.save({ transaction });

        await transaction.commit();
        res.status(200).json({ message: "Expense updated successfully!", expense });
    } catch (error) {
        if (transaction) await transaction.rollback();
        res.status(500).json({ error: error.message });
    }
};

exports.getExpenses = async (req, res) => {
    try {
        const userId = req.user.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;

        const skipped = (page - 1) * limit; 

        const expenses = await Expense.findAll({ 
            where: { userId },
            limit,
            offset: skipped,
            order: [["createdAt", "DESC"]]
        });
        const count = await Expense.count({ where: { userId } });
        const totalPages = Math.ceil(count / limit); 
        
        res.status(200).json({
            expenses,
            pagination: {
              totalExpenses: count,
              totalPages,
              currentPage: page,
              limit,
            },
          });

    } catch (error) {
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

        user.totalExpense = (user.totalExpense || 0) - parseFloat(expense.amount);
        await user.save({ transaction });

        await expense.destroy({ transaction });
        await transaction.commit();
        
        res.status(200).json({ message: "Expense deleted successfully!" });
    } catch (error) {
        if (transaction) await transaction.rollback();
        res.status(500).json({ error: error.message });
    }
};
