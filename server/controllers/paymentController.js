const express = require("express");
const router = express.Router();
const axios = require("axios");
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
        customer_email: "test@example.com",
        customer_phone: "9999999999",
      },
      order_meta: {
        return_url: `http://localhost:3000/dashboard?order_id=${orderId}`,
        payment_methods: `upi,cc,dc`
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
    console.error("Error creating payment order:", error.response?.data || error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


exports.verifyPayment = async (req, res) => {
  try {
    console.log("🔹 Incoming Payment Verification:", req.body);

    const { order_id } = req.body;
    const paymentOrder = await PaymentOrder.findOne({ where: { orderId: order_id } });

    if (!paymentOrder) {
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

    console.log("Cashfree Response:", cashfreeResponse.data);

    const latestStatus = cashfreeResponse.data.order_status;

    if (!latestStatus) {
      return res.status(400).json({ message: "Invalid response from Cashfree" });
    }

    console.log("LatestStatus:::::", latestStatus)
    paymentOrder.status = latestStatus;
    await paymentOrder.save();
    if (latestStatus === "PAID") {
      const updatedUser = await User.findOne({ where: { id: paymentOrder.userId } });
      if (updatedUser) {
        updatedUser.isPremium = true;
        await updatedUser.save();
        console.log("Updated User to Premium:", updatedUser);
      }
    }

    return res.json({ latestStatus });
  } catch (error) {
    console.error("Error verifying payment:", error.response?.data || error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
