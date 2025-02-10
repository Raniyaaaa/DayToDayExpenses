const User = require('../models/user')
const sequelize = require('../utils/database');

exports.signup = async (req, res) => {
  
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = await User.create(
      { username, email, password: hashedPassword },
    );

    return res.status(201).json({ message: 'User created successfully', user });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};