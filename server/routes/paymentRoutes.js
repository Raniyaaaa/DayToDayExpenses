const express = require("express");
const { createPayment, verifyPayment } = require("../controllers/paymentController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Create order 
router.post("/create", authMiddleware, createPayment);
router.post("/verify",authMiddleware, verifyPayment);


module.exports = router;
