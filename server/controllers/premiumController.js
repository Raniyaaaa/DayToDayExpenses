const Expense = require("../models/Expense");
const User = require("../models/User");
const sequelize = require("sequelize");

exports.getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await User.findAll({
            attributes: [
                'id',
                'username',
                'totalExpense'
            ],
            order: [['totalexpense', "DESC"]]
        })
        console.log(leaderboard);
        res.status(200).json(leaderboard);
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.downloadExpenseReport = async (req, res) => {
    try {
      const userId = req.user.userId; 
  
      const expenses = await Expense.findAll({ where: { userId } });
  
      if (expenses.length === 0) {
        return res.status(404).json({ error: "No expenses found" });
      }
  
      const user = await User.findOne({
        where: {
          id: userId,
        },
        attributes:[
          "totalExpense"
        ]
      });
      
      res.status(200).json({user , expenses});
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };