import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
// --- FIXING PATHS ---
// Changed from relative to absolute (from /) to fix build errors
import Timer from '/src/components/student/Timer.jsx';
import { useAuth } from '/src/context/AuthContext.jsx';

const Quiz = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();

  // --- 1. State Management (as you defined) ---
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0); // Index of current question
  const [answers, setAnswers] = useState({}); // { [questionId]: "selectedOption" }
  const [timer, setTimer] = useState(3600); // 1 hour in seconds

  // --- Other state ---
  const [quizInfo, setQuizInfo] = useState({ title: '', totalQuestions: 0 });
  const [selectedOption, setSelectedOption] = useState(''); // Tracks the radio button
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const submittedRef = useRef(false); // Prevents double submission

  // --- 2. Fetch Quiz Questions ---
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/student/quiz/${assignmentId}`);
    setQuestions(data.questions);
    setQuizInfo({
          title: data.quizTitle,
      totalQuestions: data.questions.length,
    });
        // You could set the timer dynamically from the backend if needed
    // setTimer(data.durationInSeconds); 
  } catch (err) {
        console.error("Error fetching quiz:", err);
    setError(err.response?.data?.message || "Failed to load the quiz.");
  } finally {
        setLoading(false);
  }
};
    fetchQuiz();
  }, [assignmentId]);

  // --- 3. Timer Countdown Logic ---
  useEffect(() => {
    // Exit if time is up or quiz is not loaded yet
    if (timer <= 0) {
      handleTimeUp();
      return;
    }
    
    if (loading) {
      return; // Don't start timer until quiz is loaded
    }

    // Set up the interval
    const intervalId = setInterval(() => {
      setTimer((prevTimer) => prevTimer - 1);
    }, 1000);

    // Clean up the interval
    return () => clearInterval(intervalId);
  }, [timer, loading]); // Runs every time 'timer' or 'loading' changes

  // --- 4. Block Back Button (as requested) ---
  useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    const onBackButton = (e) => {
      e.preventDefault();
      window.history.pushState(null, '', window.location.href);
      alert("You cannot go back during the quiz. Please use the controls on the page.");
    };
    window.addEventListener('popstate', onBackButton);
    
    // Cleanup on unmount
    return () => {
      window.removeEventListener('popstate', onBackButton);
    };
  }, []);

  // --- 5. Handle Submission ---
  const submitQuiz = async () => {
    // Prevent multiple submissions
    if (submittedRef.current) return;
    submittedRef.current = true;

    // Convert the answers object { qId: "answer" } to the
    // array [{ questionId, selectedAnswer }] that the backend expects.
    const finalAnswers = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
      questionId,
      selectedAnswer
    }));
    
    // Ensure the current question's answer is also included if not submitted
    const currentQuestion = questions[currentQ];
    if (selectedOption && !finalAnswers.find(a => a.questionId === currentQuestion._id)) {
        finalAnswers.push({
            questionId: currentQuestion._id,
            selectedAnswer: selectedOption
        });
    }

    try {
      await axios.post(`/api/student/quiz/${assignmentId}`, { answers: finalAnswers });
      // Navigate to the results page
      navigate(`/quiz/${assignmentId}/results`);
    } catch (err) {
      console.error("Error submitting quiz:", err);
      setError("An error occurred while submitting your quiz. Please try again.");
      submittedRef.current = false; // Allow retry on error
    }
  };

  // --- 6. Handle Timer Time Up ---
  const handleTimeUp = () => {
    if (!submittedRef.current) { // Only submit if not already submitted
      alert("Time is up! Submitting your quiz now.");
      submitQuiz();
    }
  };

  // --- 7. Handle "Next" / "Submit" Click ---
  const handleNext = () => {
    if (selectedOption === '') {
      alert("Please select an answer.");
      return;
    }

    // Save the answer to the state object
    const currentQuestion = questions[currentQ];
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [currentQuestion._id]: selectedOption
    }));
    
    // Reset selected option for the next question
    setSelectedOption('');

    // Check if it's the last question
    if (currentQ < questions.length - 1) {
      setCurrentQ(prevIndex => prevIndex + 1);
    } else {
      // This was the last question, submit
      submitQuiz();
    }
  };
  
  // --- 8. Pre-fill radio button if user already answered this question ---
  useEffect(() => {
    if (questions.length > 0) {
      const currentQuestion = questions[currentQ];
      if (answers[currentQuestion._id]) {
        setSelectedOption(answers[currentQuestion._id]);
      } else {
        setSelectedOption('');
      }
    }
  }, [currentQ, questions, answers]);


  // --- Render Logic ---
  if (loading) return <div className="flex justify-center items-center min-h-screen"><div className="text-xl font-semibold">Loading Quiz...</div></div>;
  if (error) return <div className="flex justify-center items-center min-h-screen"><div className="text-xl font-semibold text-red-600 p-8 bg-red-100 rounded-lg">{error}</div></div>;
  if (questions.length === 0) return <div className="flex justify-center items-center min-h-screen"><div className="text-xl font-semibold">No questions found for this quiz.</div></div>;

  const currentQuestion = questions[currentQ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4 py-12">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl p-6 md:p-8">
        
        {/* Header: Info and Timer */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-300 pb-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{quizInfo.title}</h1>
            <p className="text-lg text-gray-600 mt-1">
              Question {currentQ + 1} of {quizInfo.totalQuestions}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            {/* Pass the state variable to the "dumb" Timer component */}
            <Timer timeLeftInSeconds={timer} />
          </div>
        </div>

        {/* Question Area */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6" style={{ whiteSpace: 'pre-wrap' }}>
            {currentQuestion.questionText}
          </h2>
          <div className="space-y-4">
            {currentQuestion.options.map((option, index) => (
              <label
                key={index}
                className={`block w-full p-4 border rounded-lg cursor-pointer transition-all duration-150
                  ${selectedOption === option 
                    ? 'bg-indigo-100 border-indigo-600 ring-2 ring-indigo-500' 
                    : 'bg-white border-gray-300 hover:bg-gray-50'
                  }`}
              >
                <input
                  type="radio"
                  name="option"
                  value={option}
                  checked={selectedOption === option}
                  onChange={() => setSelectedOption(option)}
                  className="mr-3 h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
                <span className="text-gray-800 text-lg">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Footer: Navigation */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-300">
          <button
            onClick={submitQuiz}
            className="bg-red-600 text-white font-semibold px-6 py-2 rounded-md shadow transition-all duration-200 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Submit Test
          </button>
          <button
            onClick={handleNext}
            className="bg-indigo-600 text-white font-bold px-10 py-3 rounded-md shadow transition-all duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {currentQ === questions.length - 1 ? 'Submit Final Answer' : 'Next Question'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Quiz;

