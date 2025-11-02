import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
// Corrected import path to be relative
import { useAuth } from '../context/AuthContext.jsx';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [todaysQuizzes, setTodaysQuizzes] = useState([]);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        // The AuthContext automatically sends the token
        const { data } = await axios.get('/api/student/quizzes');
        
        // 1. Set all assignments
        setAssignments(data);

        // 2. Calculate progress (as requested)
        const total = data.length;
        const completed = data.filter(a => a.completed).length;
        setProgress({ total, completed });

        // 3. Filter for today's quizzes that are not yet completed
        const today = new Date().setHours(0, 0, 0, 0);
        const filtered = data.filter(a => {
          const testDate = new Date(a.testDate).setHours(0, 0, 0, 0);
          return testDate === today && !a.completed;
        });
        setTodaysQuizzes(filtered);
        
        setError(null);
      } catch (err) {
        console.error("Error fetching quizzes:", err);
        setError(err.response?.data?.message || "Failed to load quizzes.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []); // Runs once on component mount

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl font-semibold text-gray-700">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome, {user?.username}!</h1>
      <p className="text-lg text-gray-600 mb-6">Here are your tasks for today.</p>

      {/* --- Overall Progress --- */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-3">Your Overall Progress</h2>
        <p className="text-gray-700 mb-2">
          You have completed {progress.completed} of {progress.total} quizzes.
        </p>
        <progress 
          className="w-full h-4 rounded-lg [&::-webkit-progress-bar]:rounded-lg [&::-webkit-progress-value]:rounded-lg [&::-webkit-progress-bar]:bg-gray-200 [&::-webkit-progress-value]:bg-indigo-500 [&::-moz-progress-bar]:bg-indigo-500"
          value={progress.completed} 
          max={progress.total > 0 ? progress.total : 1} // Avoid division by zero
        >
          {Math.round((progress.completed / (progress.total || 1)) * 100)}%
        </progress>
      </div>

      {/* --- Today's Quizzes --- */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Today's Assigned Quizzes</h2>
        {error && <div className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</div>}
        
        {todaysQuizzes.length > 0 ? (
          <ul className="space-y-3">
            {todaysQuizzes.map(assignment => (
              <li key={assignment._id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center transition-all hover:shadow-lg">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{assignment.quizId.title}</h3>
                  <p className="text-sm text-gray-600">Total Questions: {assignment.quizId.totalQuestions}</p>
                </div>
                <Link
                  to={`/quiz/${assignment._id}`}
                  className="bg-indigo-600 text-white font-semibold px-5 py-2 rounded-md transition-all duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                >
                  Start Quiz
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">You have no quizzes scheduled for today. Great job!</p>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;

