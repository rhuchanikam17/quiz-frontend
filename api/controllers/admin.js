const User = require('../models/User');
const Quiz = require('../models/Quiz');
const QuizAssignment = require('../models/QuizAssignment');

// @desc    Create a new user (by Admin)
// @route   POST /api/admin/users
// @access  Private (Admin)
const createUser = async (req, res) => {
  const { username, password, role } = req.body;

  // Basic validation
  if (!username || !password || !role) {
    return res.status(400).json({ message: 'Please provide username, password, and role' });
  }

  try {
    // Check if user already exists
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    // The password will be automatically hashed by the pre-save hook in the User model
    const user = await User.create({
      username,
      password,
      role,
    });

    if (user) {
      // Send back user info (but not the password)
      res.status(201).json({
        _id: user._id,
        username: user.username,
        role: user.role,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all users (by Admin)
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res) => {
  try {
    // Find all users and exclude their password hash
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Assign a quiz to a student (by Admin)
// @route   POST /api/admin/assignments
// @access  Private (Admin)
const assignQuiz = async (req, res) => {
  const { quizId, studentId, testDate } = req.body;

  try {
    // --- Validation ---
    // 1. Check if student exists and is a student
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    // 2. Check if quiz exists
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // 3. Check if this assignment already exists
    const assignmentExists = await QuizAssignment.findOne({ quizId, studentId });
    if (assignmentExists) {
      return res.status(400).json({ message: 'Student is already assigned this quiz' });
    }

    // --- Create Assignment ---
    const assignment = await QuizAssignment.create({
      quizId,
      studentId,
      testDate: new Date(testDate),
    });

    res.status(201).json(assignment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  assignQuiz,
};
