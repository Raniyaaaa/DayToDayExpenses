const Expense = require('../models/Expense');
const User = require('../models/user');
const sequelize = require('../utils/database');

exports.addExpense = async ( req, res) => {
    try {
        const { amount, description, category } = req.body;
        const userId = req.user.userId;

        const user = await User.findOne({
            where: {
                id: userId,
            }
        })
        if(!user){
            return res.status(404).json({ error: "Usernot found!!" });
        }

        const expense = await Expense.create({
            amount,
            description,
            category,
            userId,
        })

        res.status(201).json({ message: "Expense added successfully!!", expense })
    }catch (error) {
        res.status(500).json({error: error.message });
    }
}

exports.getExpenses = async (req, res) => {
    try {
      const userId = req.user.userId; 
  
      const expenses = await Expense.findAll({
        where: { userId },
      });

      res.status(200).json({ expenses });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};


exports.deleteExpense = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
  
      // Find the expense before deleting
      const expense = await Expense.findOne({ where: { id, userId } });
  
      if (!expense) {
        return res.status(404).json({ error: "Expense not found or unauthorized" });
      }
  
      await Expense.destroy({ where: { id, userId } });
  
      res.status(200).json({ message: "Expense deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  