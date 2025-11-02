const QuizAssignment = require('../models/QuizAssignment');
const Question = require('../models/Question');
const Quiz = require('../models/Quiz');
const Result = require('../models/Result'); // --- Import the Result model
const { decrypt, encrypt } = require('../utils/crypto'); // --- Import encrypt

// Helper to check if a date is "today"
const isToday = (date) => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
};

/**
 * @desc    Get all quizzes assigned to the logged-in student
 * @route   GET /api/student/quizzes
 * @access  Private (Student)
 */
const getAssignedQuizzes = async (req, res) => {
  try {
    const assignments = await QuizAssignment.find({ studentId: req.user.id })
      .populate('quizId', 'title totalQuestions')
      .sort({ testDate: 1 });

    res.json(assignments);
  } catch (error) {
    console.error('Error fetching assigned quizzes:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * @desc    Get a specific quiz for taking (decrypts questions)
 * @route   GET /api/student/quiz/:assignmentId
 * @access  Private (Student)
 */
const getQuizQuestions = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const studentId = req.user.id;

    const assignment = await QuizAssignment.findById(assignmentId)
      .populate('quizId', 'title');

    // --- Validation Checks ---
    if (!assignment) {
      return res.status(404).json({ message: 'Quiz assignment not found.' });
    }
    if (assignment.studentId.toString() !== studentId) {
      return res.status(403).json({ message: 'Not authorized to take this quiz.' });
    }
    if (assignment.completed) {
      return res.status(403).json({ message: 'You have already completed this quiz.' });
    }
    if (!isToday(new Date(assignment.testDate))) {
      return res.status(403).json({ message: 'This quiz is not scheduled for today.' });
    }

    const encryptedQuestions = await Question.find({ quizId: assignment.quizId._id });
    const randomizedQuestions = encryptedQuestions.sort(() => 0.5 - Math.random());

    const decryptedQuestions = randomizedQuestions.map(q => {
      return {
        _id: q._id,
        questionText: decrypt(q.questionText),
        options: q.options.map(opt => decrypt(opt)),
      };
    });

    res.json({
      quizTitle: assignment.quizId.title,
      questions: decryptedQuestions,
    });

  } catch (error) {
    console.error('Error fetching quiz questions:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * @desc    Submit answers for a quiz
 * @route   POST /api/student/quiz/:assignmentId
 * @access  Private (Student)
 */
const submitQuiz = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const studentId = req.user.id;
    // Get answers from req.body (as sent from Quiz.jsx)
    const studentAnswers = req.body.answers; // [{ questionId, selectedAnswer }]

    // 1. Find QuizAssignment (checking studentId)
    const assignment = await QuizAssignment.findOne({
      _id: assignmentId,
      studentId: studentId
    });

    if (!assignment) {
      return res.status(403).json({ message: 'Not authorized or assignment not found.' });
    }
    
    // 2. If already completed, return error.
    if (assignment.completed) {
      return res.status(403).json({ message: 'Quiz already submitted.' });
    }

    // 3. Get quizId and fetch all encrypted Questions
    const quizId = assignment.quizId;
    const allQuestions = await Question.find({ quizId: quizId });

    // 4. Initialize score and grade the quiz
    let score = 0;
    const reviewData = []; // To store encrypted review data
    const totalQuestions = allQuestions.length;

    // 5. Iterate through the questions from the DB (more secure)
    for (const question of allQuestions) {
      // Find the student's answer for this question
      const studentAnswer = studentAnswers.find(
        a => a.questionId === question._id.toString()
      );

      // If student didn't answer, selectedAnswer is null
      const selectedAnswer = studentAnswer ? studentAnswer.selectedAnswer : null;
      
      // 6. Decrypt correct answer and compare
      const correctAnswer = decrypt(question.correctAnswer);
      const isCorrect = (selectedAnswer === correctAnswer);

      if (isCorrect) {
        score++;
      }

      // 7. Store data for the review (all encrypted)
      reviewData.push({
        questionText: question.questionText, // Already encrypted
        options: question.options, // Already encrypted
        correctAnswer: question.correctAnswer, // Already encrypted
        selectedAnswer: encrypt(selectedAnswer || ""), // Encrypt student's answer
        isCorrect: isCorrect,
      });
    }

    // 8. Calculate percentage
    const percentage = (score / totalQuestions) * 100;

    // 9. Save the new Result document
    const newResult = new Result({
      studentId: studentId,
      quizId: quizId,
      assignmentId: assignmentId,
      score: score,
      totalQuestions: totalQuestions,
      percentage: percentage,
      reviewData: reviewData, // Save the encrypted review
    });
    
    await newResult.save();

    // 10. Update the Assignment
    assignment.completed = true;
    assignment.resultId = newResult._id;
    await assignment.save();

    // 11. Return the immediate results (unencrypted)
    res.status(201).json({
      message: 'Quiz submitted successfully!',
      score: score,
      totalQuestions: totalQuestions,
      percentage: percentage,
    });

  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};


// --- ADD THIS NEW FUNCTION ---

/**
 * @desc    Get the results and review data for a completed quiz
 * @route   GET /api/student/quiz/:assignmentId/results
 * @access  Private (Student)
 */
const getQuizResult = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const studentId = req.user.id;

    // 1. Find the result document
    // We check against assignmentId AND studentId for security
    const result = await Result.findOne({
      assignmentId: assignmentId,
      studentId: studentId,
    });

    if (!result) {
      return res.status(404).json({ message: 'Result not found.' });
    }

    // 2. Decrypt the reviewData for the frontend
    const decryptedReview = result.reviewData.map(item => ({
      questionText: decrypt(item.questionText),
      options: item.options.map(opt => decrypt(opt)),
      correctAnswer: decrypt(item.correctAnswer),
      selectedAnswer: decrypt(item.selectedAnswer),
      isCorrect: item.isCorrect,
    }));

    // 3. Return the full result and decrypted review
    res.json({
      score: result.score,
      totalQuestions: result.totalQuestions,
      percentage: result.percentage,
      reviewData: decryptedReview,
    });

  } catch (error) {
    console.error('Error fetching quiz result:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};


module.exports = {
  getAssignedQuizzes,
  getQuizQuestions,
  submitQuiz,
  getQuizResult, // --- EXPORT THE NEW FUNCTION ---
};

