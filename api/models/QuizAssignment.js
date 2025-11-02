const mongoose = require('mongoose');
const QuizAssignmentSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  testDate: { type: Date, required: true },
  completed: { type: Boolean, default: false },
  reviewViewed: { type: Boolean, default: false } // For "never be shown again"
});
module.exports = mongoose.model('QuizAssignment', QuizAssignmentSchema);