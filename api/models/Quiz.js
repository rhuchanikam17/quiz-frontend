const mongoose = require('mongoose');
const QuizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Teacher's ID
  terms: [{ type: String, maxLength: 10 }] // Max 10 bullet points
});
module.exports = mongoose.model('Quiz', QuizSchema);