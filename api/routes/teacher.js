const express = require('express');
const router = express.Router();
const {
  createQuiz,
  addQuestion,
  getResults,
  exportResults,
  uploadQuestions // --- IMPORT THE NEW FUNCTION ---
} = require('../controllers/teacher.js');

// --- IMPORT THE NEW MIDDLEWARE ---
const upload = require('../middleware/upload'); 
const { protect, isTeacher } = require('../middleware/auth.js');

// Apply auth middleware to all routes
router.use(protect, isTeacher);

// --- Routes for creating quizzes and manual questions ---
router.post('/quizzes', createQuiz);
router.post('/questions', addQuestion); // Kept the manual add route

// --- ADD THIS NEW ROUTE ---
// This route handles the .docx file upload
router.post(
  '/questions/upload', 
  upload, // 1. Multer middleware runs first to handle the file
  uploadQuestions // 2. Controller runs next
);


// --- Routes for results ---
router.get('/results/:quizId', getResults);
router.get('/results/:quizId/export', exportResults);

module.exports = router;

