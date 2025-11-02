import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';

// Helper function to determine the grade based on score
const getGrade = (percentage) => {
  if (percentage === null || percentage === undefined) return 'N/A';
  
  // Based on your requirements:
  // Excellent → 15 marks and above
  // Good → 8 to 14 marks
  // Poor / Needs to Improve → 7 marks or below
  // We'll assume a 20-question quiz for this logic.
  // Let's use percentage, which is more flexible.
  
  if (percentage >= 75) { // 15/20 = 75%
    return { text: 'Excellent', className: 'text-green-600' };
  } else if (percentage >= 40) { // 8/20 = 40%
    return { text: 'Good', className: 'text-yellow-600' };
  } else { // 7/20 = 35% or below
    return { text: 'Poor / Needs to Improve', className: 'text-red-600' };
  }
};

const Results = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // This state tracks if the student has dismissed the page.
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        // This endpoint returns the final result, including the review data
        const { data } = await axios.get(`/api/student/quiz/${assignmentId}/results`);
        
        // Check if the results have already been viewed and dismissed
        if (data.viewedResults) {
          setDismissed(true);
        } else {
          setResult(data);
        }
        setError(null);
      } catch (err) {
        console.error("Error fetching results:", err);
        setError(err.response?.data?.message || "Failed to load results.");
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [assignmentId]);

  // Handle the "Dismiss" button click
  // This fulfills the "never be shown again" requirement
  const handleDismiss = () => {
    // We could also make an API call here to mark it as "viewed"
    // But for now, we just navigate away.
    setDismissed(true);
  };

  // If dismissed, redirect to the dashboard
  if (dismissed) {
    return <Navigate to="/dashboard" replace />;
  }

  if (loading) {
    return <div className="text-center p-10 font-semibold">Calculating your results...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-600 font-semibold">{error}</div>;
  }

  if (!result) {
    return <div className="text-center p-10 font-semibold">No results found.</div>;
  }

  const grade = getGrade(result.percentage);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        {/* --- 1. Results Summary --- */}
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Quiz Completed!</h1>
        <p className="text-lg text-center text-gray-600 mb-6">
          Here is your performance summary, {user?.username}.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-8">
          <div className="bg-blue-100 p-4 rounded-lg">
            <div className="text-sm font-medium text-blue-700">Total Questions</div>
            <div className="text-2xl font-bold text-blue-900">{result.totalQuestions}</div>
          </div>
          <div className="bg-green-100 p-4 rounded-lg">
            <div className="text-sm font-medium text-green-700">Correct Answers</div>
            <div className="text-2xl font-bold text-green-900">{result.correctCount}</div>
          </div>
          <div className="bg-yellow-100 p-4 rounded-lg">
            <div className="text-sm font-medium text-yellow-700">Percentage</div>
            <div className="text-2xl font-bold text-yellow-900">{result.percentage.toFixed(1)}%</div>
          </div>
          <div className="bg-indigo-100 p-4 rounded-lg">
            <div className="text-sm font-medium text-indigo-700">Grade</div>
            <div className={`text-2xl font-bold ${grade.className}`}>{grade.text}</div>
          </div>
        </div>

        {/* --- 2. Review Section --- */}
        <div className="border-t pt-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Review Your Answers</h2>
          <div className="space-y-6">
            {result.review.map((item, index) => (
              <div key={item.questionId} className="p-4 border rounded-lg bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900 mb-3" style={{ whiteSpace: 'pre-wrap' }}>
                  {index + 1}. {item.questionText}
                </h3>
                
                <div className="space-y-2">
                  {item.options.map((option, optIndex) => {
                    const isCorrect = option === item.correctAnswer;
                    const isSelected = option === item.selectedAnswer;
                    
                    let className = 'p-3 border rounded-md';
                    
                    if (isCorrect) {
                      // This is the correct answer
                      className += ' bg-green-100 border-green-300 text-green-800';
                    } else if (isSelected) {
                      // This is the user's WRONG selection
                      className += ' bg-red-100 border-red-300 text-red-800';
                    } else {
                      // Just a regular (wrong) option
                      className += ' bg-white border-gray-200';
                    }

                    return (
                      <div key={optIndex} className={className}>
                        {option}
                        {isCorrect && <span className="font-bold ml-2">(Correct Answer)</span>}
                        {isSelected && !isCorrect && <span className="font-bold ml-2">(Your Answer)</span>}
                      </div>
                    );
                  })}
                </div>

              </div>
            ))}
          </div>
        </div>
        
        {/* --- 3. Dismiss Button --- */}
        <div className="text-center mt-8">
          <button
            onClick={handleDismiss}
            className="w-full md:w-auto bg-indigo-600 text-white font-semibold px-10 py-3 rounded-md transition-all hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Dismiss and Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Results;

