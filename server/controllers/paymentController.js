const express = require("express");
const router = express.Router();
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const PaymentOrder = require("../models/PaymentOrder");
const User = require("../models/User");
require("dotenv").config();

const BASE_URL = process.env.CASHFREE_ENVIRONMENT === "sandbox"
  ? "https://sandbox.cashfree.com/pg/orders"
  : "https://api.cashfree.com/pg/orders";

exports.createPayment = async (req, res) => {
  try {
    const { amount, currency } = req.body;
    const userId = req.user.userId;
    const orderId = `order_${Date.now()}`;
    console.log("Hppppppppppppppppppp");
    const orderData = {
      order_id: orderId,
      order_amount: amount,
      order_currency: currency || "INR",
      customer_details: {
        customer_id: userId.toString(),
        customer_email: "test@example.com", // Use actual user email
        customer_phone: "9999999999", // Use actual user phone
      },
      order_meta: {
        return_url: `http://localhost:3000/dashboard?order_id=${orderId}`,
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

    console.log("Payment response data:",response.data)

    if (response.data && response.data.payment_session_id) {
      await PaymentOrder.create({
        orderId,
        paymentId: response.data.payment_session_id,
        status: "PENDING",
        amount,
        currency,
        userId,
      });

      console.log("ORDERID::::::", response.data.order_id);

      return res.json({ paymentSessionId: response.data.payment_session_id, orderId: response.data.order_id });
    } else {
      return res.status(400).json({ message: "Failed to create payment order" });
    }
  } catch (error) {
    console.error("❌ Error creating payment order:", error.response?.data || error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.verifyPayment = async (req, res) => {
  try {

    console.log("HIIIIIIIIIIIIIIIIIIIIIIIIIi");
    console.log("🔹 Incoming Verification Request:", req.body);

    const { order_id, payment_id, status } = req.body;

    const paymentOrder = await PaymentOrder.findOne({ where: { orderId: order_id } });

    if (!paymentOrder) {
      return res.status(404).json({ message: "Payment order not found" });
    }

    paymentOrder.paymentId = payment_id;
    paymentOrder.status = status === "SUCCESS" ? "SUCCESS" : "FAILED";
    await paymentOrder.save();

    // ✅ If payment is successful, update user to premium
    if (status === "SUCCESS") {
      await User.update({ isPremium: true }, { where: { id: paymentOrder.userId } });
    }

    return res.json({ message: "Payment status updated successfully" });
  } catch (error) {
    console.error("❌ Error verifying payment:", error.response?.data || error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};