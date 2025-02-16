const express = require("express");
const router = express.Router();
const premiumController = require("../controllers/premiumController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/leaderboard", authMiddleware, premiumController.getLeaderboard);
router.get("/download-report", authMiddleware, premiumController.downloadExpenseReport);

module.exports = router;