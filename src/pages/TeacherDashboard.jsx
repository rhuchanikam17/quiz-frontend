import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const TeacherDashboard = () => {
  // --- State for Forms ---
  const [quizTitle, setQuizTitle] = useState('');
  
  // --- New State for File Upload ---
  const [file, setFile] = useState(null); // Holds the selected file
  const [uploading, setUploading] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState(''); // For uploading questions

  // --- State for Data Display ---
  const [quizzes, setQuizzes] = useState([]); // List of quizzes
  const [results, setResults] = useState([]); // Results for a selected quiz
  const [viewingQuizId, setViewingQuizId] = useState(''); // For viewing results

  // --- UI State ---
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Fetch all quizzes created by this teacher
  const fetchQuizzes = async () => {
    try {
      // TODO: Replace with real API call
      // const { data } = await axios.get('/api/teacher/quizzes');
      // setQuizzes(data);
      console.log("TODO: Fetch quizzes");
      // MOCK DATA until backend route exists:
      setQuizzes([
        { _id: 'mock-quiz-1', title: 'Quiz 1: Cloud Fundamentals' },
        { _id: 'mock-quiz-2', title: 'Quiz 2: Data Security & IRM' },
      ]);
    } catch (err) {
      setError("Failed to fetch quizzes.");
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    try {
      const { data } = await axios.post('/api/teacher/quizzes', { title: quizTitle });
      setMessage(`Quiz "${data.title}" created!`);
      setQuizTitle('');
      fetchQuizzes(); // Refresh quiz list
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create quiz.");
    }
  };

  // --- New File Upload Handler ---
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUploadQuestions = async (e) => {
    e.preventDefault();
    if (!file || !selectedQuizId) {
      setError("Please select a quiz and a file to upload.");
      return;
    }

    setMessage(null);
    setError(null);
    setUploading(true);

    // We must use FormData to send files
    const formData = new FormData();
    formData.append('quizId', selectedQuizId);
    formData.append('questionsFile', file); // 'questionsFile' must match the backend

    try {
      // This new backend endpoint needs to be created.
      // It will handle parsing the .docx or .pptx file.
      await axios.post('/api/teacher/questions/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage(`File uploaded successfully! Questions are being processed.`);
      // Clear form
      setFile(null);
      setSelectedQuizId('');
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload file.");
    } finally {
      setUploading(false);
    }
  };


  const handleFetchResults = async (quizId) => {
    setViewingQuizId(quizId);
    setMessage(null);
    setError(null);
    try {
      const { data } = await axios.get(`/api/teacher/results/${quizId}`);
      setResults(data);
      if (data.length === 0) {
        setMessage("No results found for this quiz yet.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch results.");
      setResults([]);
    }
  };

  // Format results data for the chart
  const chartData = results.map(r => ({
    name: r.studentName,
    percentage: r.percentage,
  }));

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Teacher Dashboard</h1>
      
      {message && <div className="p-3 rounded-md bg-green-100 text-green-700 mb-4">{message}</div>}
      {error && <div className="p-3 rounded-md bg-red-100 text-red-700 mb-4">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* --- Create Quiz Form --- */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Create New Quiz</h2>
          <form onSubmit={handleCreateQuiz} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Quiz Title</label>
              <input
                type="text"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <button type="submit" className="w-full py-2 px-4 rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
              Create Quiz
            </button>
          </form>
        </div>

        {/* --- REPLACED: Add Question Form --- */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Upload Quiz File</h2>
          <form onSubmit={handleUploadQuestions} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Quiz</label>
              <select
                value={selectedQuizId}
                onChange={(e) => setSelectedQuizId(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              >
                <option value="">Select a quiz to add to</option>
                {quizzes.map(q => <option key={q._id} value={q._id}>{q.title}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Questions File</label>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".docx, .pptx" // Accepts Word and PowerPoint files
                required
                className="mt-1 block w-full text-sm text-gray-500
                           file:mr-4 file:py-2 file:px-4
                           file:rounded-md file:border-0
                           file:text-sm file:font-semibold
                           file:bg-indigo-50 file:text-indigo-700
                           hover:file:bg-indigo-100"
              />
              <p className="text-xs text-gray-500 mt-1">Upload a .docx or .pptx file.</p>
            </div>
            
            <button 
              type="submit" 
              className="w-full py-2 px-4 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400"
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload and Process File'}
            </button>
          </form>
        </div>
      </div>

      {/* --- View Results Section --- */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">View Quiz Results</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {quizzes.map(q => (
            <button
              key={q._id}
              onClick={() => handleFetchResults(q._id)}
              className={`py-2 px-4 rounded-md text-sm ${viewingQuizId === q._id ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Results for {q.title}
            </button>
          ))}
        </div>

        {results.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Table */}
            <div className="overflow-x-auto">
              <h3 className="text-lg font-medium mb-2">Scores</h3>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.map(r => (
                    <tr key={r.studentId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{r.studentName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.correctQuestions} / {r.totalQuestions}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.percentage.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Chart */}
            <div className="h-64">
              <h3 className="text-lg font-medium mb-2">Score Distribution</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                  <Bar dataKey="percentage" fill="#4f46e5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">{viewingQuizId ? (error ? 'Error loading results.' : 'Loading results...') : 'Select a quiz to view results.'}</p>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;

