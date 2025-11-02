const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env vars from .env file
dotenv.config();

// --- Database Connection ---
const connectDB = async () => {
  try {
    // Use the connection string from your .env file
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    // Exit process with failure if DB connection fails
    process.exit(1);
  }
};

// Execute DB connection
connectDB();

// --- Initialize Express App ---
const app = express();

// --- Middleware ---

// 1. Enable CORS (Cross-Origin Resource Sharing)
// This allows your React frontend (on a different domain) to make requests to this backend
app.use(cors());

// 2. Body Parser Middleware
// This replaces the old `body-parser` and allows the server to accept JSON in request bodies
app.use(express.json());

// --- API Routes ---

// A simple test route to make sure the server is working
app.get('/', (req, res) => res.send('API is running...'));

// Load and use the route files
// Any request starting with /api/auth will be handled by auth.js
app.use('/api/auth', require('./routes/auth'));
// Any request starting with /api/admin will be handled by admin.js
app.use('/api/admin', require('./routes/admin'));
// Any request starting with /api/teacher will be handled by teacher.js
app.use('/api/teacher', require('./routes/teacher'));
// Any request starting with /api/student will be handled by student.js
app.use('/api/student', require('./routes/student'));

// --- Start Server ---

// Get port from environment variables or default to 5000
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));