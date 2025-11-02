// This file loads all controllers directly, avoiding Vercel's 12-function limit.

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// --- Import All Controllers & Middleware ---
const { protect, isAdmin, isTeacher, isStudent } = require('./middleware/auth');
const upload = require('./middleware/upload');

// Admin Controller
const admin = require('./controllers/admin');
// Teacher Controller
const teacher = require('./controllers/teacher');
// Student Controller
const student = require('./controllers/student');
// Auth Controller (Auth logic is usually separate)
const { login, register } = require('./controllers/auth');

// Initialize the Express app
const app = express();

// --- DB Connection Function ---
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully.');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
  }
};

// --- Middleware & Global Setup ---
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*', 
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// --- ROUTES: All routes are now defined here for Vercel consolidation ---

// 1. AUTH ROUTES (Public)
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);

// 2. ADMIN ROUTES (Protected: Admin)
app.post('/api/admin/users', protect, isAdmin, admin.createUser);
app.get('/api/admin/users', protect, isAdmin, admin.getUsers);
app.post('/api/admin/assignments', protect, isAdmin, admin.assignQuiz);

// 3. TEACHER ROUTES (Protected: Teacher)
app.post('/api/teacher/quizzes', protect, isTeacher, teacher.createQuiz);
app.get('/api/teacher/quizzes', protect, isTeacher, teacher.getQuizzes); 
app.post('/api/teacher/questions/upload', protect, isTeacher, upload, teacher.uploadQuestions);
app.get('/api/teacher/results/:quizId', protect, isTeacher, teacher.getResults);
app.get('/api/teacher/results/:quizId/export', protect, isTeacher, teacher.exportResults);

// 4. STUDENT ROUTES (Protected: Student)
app.get('/api/student/quizzes', protect, isStudent, student.getAssignedQuizzes);
app.get('/api/student/quiz/:assignmentId', protect, isStudent, student.getQuizQuestions);
app.post('/api/student/quiz/:assignmentId', protect, isStudent, student.submitQuiz);
app.get('/api/student/quiz/:assignmentId/results', protect, isStudent, student.getQuizResult);


// --- Vercel Export Handler (The Serverless Function) ---
module.exports = async (req, res) => {
  await connectDB();
  return app(req, res);
};
