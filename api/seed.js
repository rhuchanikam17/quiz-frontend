const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Quiz = require('./models/Quiz');
const Question = require('./models/Question');
const { encrypt } = require('./utils/crypto');
const quizData = require('./quiz_seed_data.json');

// Load env vars
dotenv.config();

// --- Database Connection ---
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // --- 1. Clear Old Data ---
    // We wipe all questions, quizzes, and our mock teacher to prevent duplicates
    await Question.deleteMany({});
    await Quiz.deleteMany({});
    await User.deleteMany({ username: 'test_teacher' }); // Clear only our test teacher

    console.log('Old data cleared...');

    // --- 2. Create a "Teacher" User ---
    // This teacher will be the "owner" of the quizzes
    const teacher = await User.create({
      username: 'test_teacher',
      password: 'password123', // Will be auto-hashed by our model
      role: 'teacher',
    });
    console.log('Test teacher created...');

    // --- 3. Create Quizzes ---
    // We'll split the 40 questions into two quizzes
    const quiz1 = await Quiz.create({
      title: 'Quiz 1: Cloud Fundamentals',
      subject: 'Cloud Security',
      createdBy: teacher._id,
      terms: [
        'This is a timed test.',
        'No back navigation is allowed.',
        'Results are final.',
      ],
    });

    const quiz2 = await Quiz.create({
      title: 'Quiz 2: Data Security & IRM',
      subject: 'Cloud Security',
      createdBy: teacher._id,
      terms: ['One question per page.', 'Good luck.'],
    });
    console.log('Quizzes created...');

    // --- 4. Encrypt and Prepare Questions ---
    const questionsToSeed = [];

    quizData.forEach((q, index) => {
      // Create the encrypted question object
      const encryptedQuestion = {
        // Assign first 20 to Quiz 1, next 20 to Quiz 2
        quizId: index < 20 ? quiz1._id : quiz2._id,
        
        // Encrypt all sensitive fields
        questionText: encrypt(q.questionText),
        correctAnswer: encrypt(q.correctAnswer),
        options: q.options.map((opt) => encrypt(opt)),
        
        // Explanation is null for this data, but we could encrypt it too
        explanation: encrypt(q.explanation || null),
      };
      questionsToSeed.push(encryptedQuestion);
    });

    // --- 5. Insert All Questions at Once ---
    await Question.insertMany(questionsToSeed);

    console.log('----------------------------------');
    console.log('SUCCESS: Database has been seeded!');
    console.log('----------------------------------');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

// --- Run the Seeder ---
const runSeeder = async () => {
  await connectDB();
  await seedData();
};

runSeeder();
