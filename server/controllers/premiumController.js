const Expense = require("../models/Expense");
const User = require("../models/User");
const sequelize = require("sequelize");

exports.getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await User.findAll({
            attributes: [
                "id",
                "username",
                [sequelize.fn("SUM", sequelize.col("Expenses.amount")), "totalExpenses"], // Alias for totalExpenses
            ],
            include: [
                {
                    model: Expense,
                    attributes: [],
                },
            ],
            group: ["User.id"],
            order: [[sequelize.literal("totalExpenses"), "DESC"]], // Sorting by totalExpenses
            raw: true, // Returns raw JSON instead of Sequelize objects
        });

        res.json({ leaderboard });
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        res.status(500).json({ message: "Server error" });
    }
};
