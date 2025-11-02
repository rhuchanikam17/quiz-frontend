const express = require('express');
const router = express.Router();

// Import the controller functions
const { 
  createUser, 
  getAllUsers, 
  assignQuiz 
} = require('../controllers/admin');

// Import the security middleware
const { protect, isAdmin } = require('../middleware/auth');

// --- Admin Routes ---
// Note: All routes in this file are protected by both 'protect' and 'isAdmin'

// @route   POST /api/admin/users
// @desc    Create a new user (student, teacher, or admin)
// @access  Private (Admin)
router.post('/users', protect, isAdmin, createUser);

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin)
router.get('/users', protect, isAdmin, getAllUsers);

// @route   POST /api/admin/assignments
// @desc    Assign a quiz to a student
// @access  Private (Admin)
router.post('/assignments', protect, isAdmin, assignQuiz);

// Add other future admin routes here...

module.exports = router;
