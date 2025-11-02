const mongoose = require('mongoose');
const QuestionSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  questionText: { type: String, required: true }, // Encrypted
  options: [{ type: String }], // Array of encrypted strings
  correctAnswer: { type: String, required: true }, // Encrypted
  explanation: { type: String } // Encrypted
});
module.exports = mongoose.model('Question', QuestionSchema);