const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper function to generate a JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '1d', // Token expires in 1 day
  });
};

// @desc    Register a new user (for Admins)
// @route   POST /api/auth/register
// @access  Public (will be protected by Admin later)
const registerUser = async (req, res) => {
  const { username, password, role } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user (password is auto-hashed by pre-save hook in model)
    const user = await User.create({
      username,
      password,
      role,
    });

    // If user created successfully
    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Authenticate user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check for user by username
    const user = await User.findOne({ username });

    // Check if user exists AND password matches
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { registerUser, loginUser };