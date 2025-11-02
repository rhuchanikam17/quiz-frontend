const mammoth = require('mammoth');

/**
 * Parses the raw text from a .docx file into a quiz JSON structure.
 * * Assumes a VERY specific format in the Word document:
 * * Question 1: Which of the following is not a Cloud Service Model?
 * A. Software as a Service (SaaS)
 * B. Programming as a Service (PaaS)
 * C. Infrastructure as a Service (laaS)
 * D. Platform as a Service (PaaS)
 * Answer: B
 *
 * (Note: Questions MUST be separated by a blank line)
 */
const parseWordDoc = async (buffer) => {
  try {
    // 1. Extract raw text from the .docx buffer
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value;

    const questions = [];
    // 2. Split the text into blocks, where each block is one question
    //    (Assumes questions are separated by one or more blank lines)
    const questionBlocks = text.split(/\n\s*\n/).filter(block => block.trim() !== '');

    // 3. Parse each block
    for (const block of questionBlocks) {
      const lines = block.split('\n').filter(line => line.trim() !== '');
      
      // Ensure we have the minimum lines (1 Q, 4 Options, 1 Answer)
      if (lines.length < 6) {
        console.warn("Skipping malformed block:", block);
        continue;
      }

      // 4. Extract data using string slicing and splitting
      // This is brittle and depends on the format!
      const questionText = lines[0].replace(/^(Question \d+|Q\d+)[.:\s]*/, '').trim();
      
      // Extract options, stripping the "A.", "B.", etc.
      const options = [
        lines[1].replace(/^[A][.:\s]*/, '').trim(),
        lines[2].replace(/^[B][.:\s]*/, '').trim(),
        lines[3].replace(/^[C][.:\s]*/, '').trim(),
        lines[4].replace(/^[D][.:\s]*/, '').trim(),
      ];

      // Extract answer, stripping the "Answer:"
      const correctAnswerText = lines[5].replace(/^Answer[.:\s]*/, '').trim();

      // Find the full answer text from the options
      // (e.g., if "Answer: B", find the text for option B)
      let correctAnswer = '';
      if (correctAnswerText.length === 1) { // e.g., "A", "B", "C", "D"
        const index = correctAnswerText.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
        if (index >= 0 && index < 4) {
          correctAnswer = options[index];
        }
      } else {
        // Assume the full answer text was provided
        correctAnswer = correctAnswerText;
      }

      if (questionText && options.length === 4 && correctAnswer) {
        questions.push({
          questionText,
          options,
          correctAnswer,
          explanation: '' // Explanation is not in this format
        });
      } else {
         console.warn("Skipping block with incomplete data:", block);
      }
    }
    
    return questions;

  } catch (error) {
    console.error("Error parsing .docx file:", error);
    throw new Error("Could not parse the Word document.");
  }
};

module.exports = { parseWordDoc };
