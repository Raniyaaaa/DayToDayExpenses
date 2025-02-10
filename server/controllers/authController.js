const { compare } = require('semver');
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
      { username, email, password },
    );

    return res.status(201).json({ message: 'User created successfully', user });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {

  try{
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email }})
    if(!user){
      return res.status(404).json({ error: "User not found" });
    }
    if (password !== user.password) {
      return res.status(401).json({ error: 'Invalid password' });
    }    
    res.status(200).json({ message: 'Login successful', user});
  }catch{
    res.status(500).json({ error: error.message });
  }
}