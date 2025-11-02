const express = require('express');
const router = express.Router();
// Import the controller functions
const { registerUser, loginUser } = require('../controllers/auth');

// @route   POST api/auth/login
// @desc    Authenticate user & get token (from Phase 1)
// @access  Public
router.post('/login', loginUser);

// @route   POST api/auth/register
// @desc    Register a new user (from Phase 1)
// @access  Public (or protected admin)
router.post('/register', registerUser);

module.exports = router;
