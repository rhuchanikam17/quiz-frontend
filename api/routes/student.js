const express = require('express');
const router = express.Router();
const {
  getAssignedQuizzes,
  getQuizQuestions,
  submitQuiz,
  getQuizResult, // --- Import the new function ---
} = require('../controllers/student.js');
const { protect, isStudent } = require('../middleware/auth.js');

// Apply auth middleware to all routes in this file
router.use(protect, isStudent);

/**
 * @desc    Get all quizzes assigned to the logged-in student
 * @route   GET /api/student/quizzes
 */
router.get('/quizzes', getAssignedQuizzes);

/**
 * @desc    Get a specific quiz for taking (decrypts questions)
 * @route   GET /api/student/quiz/:assignmentId
 */
router.get('/quiz/:assignmentId', getQuizQuestions);

/**
 * @desc    Submit answers for a quiz
 * @route   POST /api/student/quiz/:assignmentId
 */
router.post('/quiz/:assignmentId', submitQuiz);

/**
 * @desc    Get the results and review data for a completed quiz
 * @route   GET /api/student/quiz/:assignmentId/results
 */
router.get('/quiz/:assignmentId/results', getQuizResult); // --- ADD THIS NEW ROUTE ---

module.exports = router;

