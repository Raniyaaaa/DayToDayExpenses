const express = require("express");
const router = express.Router();
const axios = require("axios");
const sequelize = require("../utils/database");
const PaymentOrder = require("../models/PaymentOrder");
const User = require("../models/User");
require("dotenv").config();

const BASE_URL = process.env.CASHFREE_ENVIRONMENT === "sandbox"
  ? "https://sandbox.cashfree.com/pg/orders"
  : "https://api.cashfree.com/pg/orders";

exports.createPayment = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { amount, currency = "INR" } = req.body;
    const userId = req.user.userId;
    const orderId = `order_${Date.now()}`;

    // Ensure user exists before creating the payment order
    const user = await User.findOne({ where: { id: userId }, transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ message: "User not found" });
    }

    const orderData = {
      order_id: orderId,
      order_amount: amount,
      order_currency: currency,
      customer_details: {
        customer_id: userId.toString(),
        customer_email: "test@example.com",
        customer_phone: "9999999999",
      },
      order_meta: {
        return_url: `http://localhost:3000/dashboard?order_id=${orderId}`,
        payment_methods: "upi,cc,dc",
      },
    };

    const response = await axios.post(BASE_URL, orderData, {
      headers: {
        "Content-Type": "application/json",
        "x-api-version": "2022-09-01",
        "x-client-id": process.env.CASHFREE_APP_ID,
        "x-client-secret": process.env.CASHFREE_SECRET_KEY,
      },
    });

    if (!response.data?.payment_session_id) {
      throw new Error("Failed to create payment order");
    }

    await PaymentOrder.create({
      orderId,
      paymentId: response.data.payment_session_id,
      status: "PENDING",
      amount,
      currency,
      userId,
    }, { transaction });

    await transaction.commit();
    res.json({ paymentSessionId: response.data.payment_session_id, orderId });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Error creating payment order:", error.response?.data || error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.verifyPayment = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { order_id } = req.body;

    // Ensure payment order exists
    const paymentOrder = await PaymentOrder.findOne({ where: { orderId: order_id }, transaction });
    if (!paymentOrder) {
      await transaction.rollback();
      return res.status(404).json({ message: "Payment order not found" });
    }

    const cashfreeResponse = await axios.get(`${BASE_URL}/${order_id}`, {
      headers: {
        "Content-Type": "application/json",
        "x-api-version": "2022-09-01",
        "x-client-id": process.env.CASHFREE_APP_ID,
        "x-client-secret": process.env.CASHFREE_SECRET_KEY,
      },
    });

    const latestStatus = cashfreeResponse.data?.order_status;
    if (!latestStatus) {
      await transaction.rollback();
      return res.status(400).json({ message: "Invalid response from Cashfree" });
    }

    // Update payment order status
    paymentOrder.status = latestStatus;
    await paymentOrder.save({ transaction });

    // If payment is successful, update the user's premium status
    if (latestStatus === "PAID") {
      const user = await User.findOne({ where: { id: paymentOrder.userId }, transaction });
      if (!user) {
        await transaction.rollback();
        return res.status(404).json({ message: "User not found for premium update" });
      }

      user.isPremium = true;
      await user.save({ transaction });
    }

    await transaction.commit();
    res.json({ latestStatus });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Error verifying payment:", error.response?.data || error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
