const mongoose = require('mongoose');
const ResultSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  percentage: { type: Number, required: true },
  // Encrypt the entire answers object
  answers: { type: String, required: true }, // Encrypted JSON string of { questionId: selectedAnswer }
  submittedAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Result', ResultSchema);