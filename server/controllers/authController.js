const User = require('../models/User');
const ForgotPasswordRequests = require("../models/ForgotPasswordRequests");
const sequelize = require('../utils/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Sib = require('sib-api-v3-sdk');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

exports.signup = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ where: { email }, transaction });
    if (existingUser) {
      await transaction.rollback();
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword }, { transaction });

    await transaction.commit();
    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    if (transaction) await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email }, transaction });

    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ error: "User not found!" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await transaction.rollback();
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY);

    await transaction.commit();
    res.status(200).json({ message: "Login successful", token, user });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Login error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getUser = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const userId = req.user.userId; // Assuming `req.user` contains authenticated user info

    const user = await User.findOne({
      where: { id: userId },
      attributes: ["id", "username", "email", "isPremium"],
      transaction,
    });

    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ message: "User not found" });
    }

    await transaction.commit();
    res.json({ user });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.forgetPassword = async(req, res) => {
  try{
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

     const requestId = uuidv4();

     await ForgotPasswordRequests.create({
       id: requestId,
       userId: user.id,
       isActive: true,
     });

    const resetUrl = `http://localhost:3000/reset-password?requestId=${requestId}&email=${email}`;

    console.log("API_KEY:", process.env.API_KEY);
    
    const Client = Sib.ApiClient.instance;
    const apiKey = Client.authentications['api-key']
    apiKey.apiKey = process.env.API_KEY;

    const tranEmailAPI = new Sib.TransactionalEmailsApi();

    const sender = {
      email: 'raniya182002@gmail.com'
    }

    const receivers = [
      {
        email: email,
      }
    ]

    await tranEmailAPI.sendTransacEmail({
      sender,
      to: receivers,
      subject: "Password Reset Request",
      textContent: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
        Please click on the following link, or paste it into your browser to complete the process:\n\n
        ${resetUrl}\n\n
        If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    })
    res.status(200).json({ message: "Reset link sent to your email." });
  }catch(error){
    console.error("Error sending email:", error);
        res.status(500).json({ error: "Failed to send reset link." });
  }
}

exports.resetPassword = async (req, res) => {
  try {
    const { email, password ,requestId} = req.body;

    const request = await ForgotPasswordRequests.findOne({
      where: { id: requestId, isActive: true },
    });

    if (!request) {
      return res.status(404).json({ error: 'Invalid or expired reset link' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await user.update({ password: hashedPassword });

    await request.update({ isActive: false });
    
    res.status(200).json({ message: 'Password reset successful.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
