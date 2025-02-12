const express = require("express");
const { createOrder, handleWebhook } = require("../controllers/paymentController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Create order 
router.post("/create", authMiddleware, createOrder);

module.exports = router;
