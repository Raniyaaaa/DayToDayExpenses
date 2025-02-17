const Expense = require("../models/Expense");
const User = require("../models/User");
const ExpenseReport = require('../models/ExpenseReport');
const S3services = require('../services/S3services')

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
        res.status(200).json(leaderboard);
    } catch (error) {
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
      const StringifiedExpenses = JSON.stringify(expenses);
      const filename = `Expense${userId}/${new Date()}.txt`;
      const fileURL = await S3services.uploadToS3(StringifiedExpenses, filename);
      await ExpenseReport.create({ userId, fileURL });

      res.status(200).json({fileURL, success:true});
    } catch (error) {
      res.status(500).json({fileUR: '', success: false, error: error });
    }
  };

  exports.ExpenseReport = async (req, res) => {
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

  exports.getUserReports = async (req, res) => {
    try {
        const userId = req.user.userId;
        const reports = await ExpenseReport.findAll({ where: { userId } });

        if (!reports.length) {
            return res.status(404).json({ message: "No reports found" });
        }

        res.status(200).json({ reports });
    } catch (error) {
        console.error("Error fetching reports:", error);
        res.status(500).json({ error: error.message });
    }
};
