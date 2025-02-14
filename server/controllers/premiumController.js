const Expense = require("../models/Expense");
const User = require("../models/User");
const sequelize = require("sequelize");

exports.getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await User.findAll({
            attributes: ['id', 'username',[sequelize.fn("SUM", sequelize.col('expenses.amount')), 'totalexpense']],
            include: [
                {
                    model: Expense,
                    attributes: []
                }
            ],
            group: ['User.id'],
            order: [['totalexpense', "DESC"]]
        })
        console.log(leaderboard);
        res.status(200).json(leaderboard);
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        res.status(500).json({ message: "Server error" });
    }
};
