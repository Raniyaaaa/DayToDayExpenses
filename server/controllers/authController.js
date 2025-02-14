const User = require('../models/User');
const sequelize = require('../utils/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
