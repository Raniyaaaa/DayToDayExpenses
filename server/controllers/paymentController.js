const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const PaymentOrder = require("../models/PaymentOrder");
const User = require("../models/user");
require("dotenv").config();

const BASE_URL = process.env.CASHFREE_ENVIRONMENT === "sandbox"
  ? "https://sandbox.cashfree.com/pg/orders"
  : "https://api.cashfree.com/pg/orders";


exports.createOrder = async (req, res) => {
  try {
    const { amount, currency } = req.body;
    const userId = req.user.userId;
    const orderId = `order_${Date.now()}`;

    // Request payload for Cashfree API
    const orderData = {
      order_id: orderId,
      order_amount: amount,
      order_currency: currency || "INR",
      customer_details: {
        customer_id: userId.toString(),
        customer_email: "test@example.com", // Replace with actual user email
        customer_phone: "9999999999", // Replace with actual user phone
      },
      order_meta: {
        return_url: `http://localhost:3000/dashboard?order_id=${orderId}`,
      },
    };

    // Call Cashfree API to create a payment session
    const response = await axios.post(BASE_URL, orderData, {
      headers: {
        "Content-Type": "application/json",
        "x-api-version": "2022-09-01",
        "x-client-id": process.env.CASHFREE_APP_ID,
        "x-client-secret": process.env.CASHFREE_SECRET_KEY,
      },
    });

    if (response.data && response.data.payment_session_id) {
      // Store the payment order in DB
      await PaymentOrder.create({
        orderId,
        status: "PENDING",
        amount,
        currency,
        userId,
      });

      return res.json({ paymentSessionId: response.data.payment_session_id });
    } else {
      return res.status(400).json({ message: "Failed to create payment order" });
    }
  } catch (error) {
    console.error("Error creating payment order:", error.response?.data || error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
