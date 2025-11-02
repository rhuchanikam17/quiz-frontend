const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Result = require('../models/Result');
const User = require('../models/User');
const { encrypt } = require('../utils/crypto');
const ExcelJS = require('exceljs');

// --- IMPORT THE NEW PARSER ---
const { parseWordDoc } = require('../utils/fileParser');

// @desc    Create a new quiz
// @route   POST /api/teacher/quizzes
// @access  Private (Teacher)
const createQuiz = async (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ message: 'Please enter a quiz title' });
  }

  try {
    const quiz = new Quiz({
      title,
      createdBy: req.user._id,
    });

    const createdQuiz = await quiz.save();
    res.status(201).json(createdQuiz);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add a question manually (for MVP)
// @route   POST /api/teacher/questions
// @access  Private (Teacher)
const addQuestion = async (req, res) => {
  const { quizId, questionText, options, correctAnswer, explanation } = req.body;

  if (!quizId || !questionText || !options || !correctAnswer) {
    return res.status(400).json({ message: 'Please provide all fields' });
  }

  if (options.length !== 4) {
    return res.status(400).json({ message: 'Please provide 4 options' });
  }

  try {
    const question = new Question({
      quizId,
      questionText: encrypt(questionText),
      options: options.map(opt => encrypt(opt)),
      correctAnswer: encrypt(correctAnswer),
      explanation: encrypt(explanation || ''),
    });

    await question.save();
    
    // Update the quiz's totalQuestions count
    await Quiz.findByIdAndUpdate(quizId, { $inc: { totalQuestions: 1 } });

    res.status(201).json({ message: 'Question added' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get results for a quiz
// @route   GET /api/teacher/results/:quizId
// @access  Private (Teacher)
const getResults = async (req, res) => {
  const { quizId } = req.params;

  try {
    const results = await Result.find({ quizId }).populate('studentId', 'username');

    const formattedResults = results.map(result => ({
      studentId: result.studentId._id,
      studentName: result.studentId.username,
      totalQuestions: result.totalQuestions,
      correctQuestions: result.correctQuestions,
      percentage: (result.correctQuestions / result.totalQuestions) * 100,
    }));

    res.json(formattedResults);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Export results to Excel
// @route   GET /api/teacher/results/:quizId/export
// @access  Private (Teacher)
const exportResults = async (req, res) => {
  const { quizId } = req.params;

  try {
    const results = await Result.find({ quizId }).populate('studentId', 'username');
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`${quiz.title} Results`);

    worksheet.columns = [
      { header: 'Student Name', key: 'studentName', width: 30 },
      { header: 'Student ID', key: 'studentUsername', width: 30 },
      { header: 'Total Questions', key: 'totalQuestions', width: 15 },
      { header: 'Correct Questions', key: 'correctQuestions', width: 15 },
      { header: 'Percentage', key: 'percentage', width: 15 },
    ];

    results.forEach(result => {
      if (result.studentId) { // Ensure student data exists
        worksheet.addRow({
          studentName: result.studentId.username, // Assuming name is username
          studentUsername: result.studentId.username,
          totalQuestions: result.totalQuestions,
          correctQuestions: result.correctQuestions,
          percentage: ((result.correctQuestions / result.totalQuestions) * 100).toFixed(2) + '%',
        });
      }
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${quiz.title}-results.xlsx"`
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error exporting results' });
  }
};

// --- ADD THIS NEW FUNCTION ---
// @desc    Upload questions from a .docx file
// @route   POST /api/teacher/questions/upload
// @access  Private (Teacher)
const uploadQuestions = async (req, res) => {
  // req.file is added by the 'upload' middleware
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  const { quizId } = req.body;
  if (!quizId) {
    return res.status(400).json({ message: 'No quiz ID provided.' });
  }

  try {
    // 1. Parse the Word document buffer using the parser from the Canvas
    const questions = await parseWordDoc(req.file.buffer);

    if (questions.length === 0) {
      return res.status(400).json({ message: 'No questions could be parsed from the file. Please check the format.' });
    }

    // 2. Encrypt and format the questions for the database
    const encryptedQuestions = questions.map(q => ({
      quizId: quizId,
      questionText: encrypt(q.questionText),
      options: q.options.map(opt => encrypt(opt)),
      correctAnswer: encrypt(q.correctAnswer),
      explanation: encrypt(q.explanation || ''), // Encrypt an empty string if no explanation
    }));

    // 3. Save all new questions to the database
    await Question.insertMany(encryptedQuestions);

    // 4. Update the totalQuestions count on the Quiz model
    await Quiz.findByIdAndUpdate(quizId, {
      $inc: { totalQuestions: questions.length }
    });

    res.status(201).json({ 
      message: `${questions.length} questions added successfully to the quiz!`,
      questionsAdded: questions.length 
    });

  } catch (error) {
    console.error("Error in uploadQuestions:", error);
    res.status(500).json({ message: 'Server error during file processing.', error: error.message });
  }
};


module.exports = {
  createQuiz,
  addQuestion,
  getResults,
  exportResults,
  uploadQuestions // --- EXPORT THE NEW FUNCTION ---
};

