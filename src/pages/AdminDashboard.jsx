import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  // --- State for Create User Form ---
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');

  // --- State for Assign Quiz Form ---
  const [students, setStudents] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [testDate, setTestDate] = useState('');

  // --- UI State ---
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // --- Fetch data for dropdowns on component load ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all users (to get students)
        const usersRes = await axios.get('/api/admin/users');
        setStudents(usersRes.data.filter(u => u.role === 'student'));

        // Fetch all quizzes
        // Note: We need to create this API endpoint. 
        // For now, let's assume '/api/quizzes' exists or mock it.
        // Let's create a temporary mock quiz list.
        // const quizRes = await axios.get('/api/quizzes'); 
        // setQuizzes(quizRes.data);
        
        // MOCK DATA until backend route exists:
        setQuizzes([
          { _id: 'mock-quiz-1', title: 'Quiz 1: Cloud Fundamentals' },
          { _id: 'mock-quiz-2', title: 'Quiz 2: Data Security & IRM' },
        ]);

      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load initial data for dropdowns.");
      }
    };
    fetchData();
  }, []);

  // --- Form Submit Handlers ---
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    try {
      const { data } = await axios.post('/api/admin/users', { username, password, role });
      setMessage(`User "${data.username}" created successfully!`);
      setUsername('');
      setPassword('');
      setRole('student');
      // Re-fetch student list if a new student was created
      if (role === 'student') {
        const usersRes = await axios.get('/api/admin/users');
        setStudents(usersRes.data.filter(u => u.role === 'student'));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user.');
    }
  };

  const handleAssignQuiz = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !selectedQuiz || !testDate) {
      setError("Please select a student, quiz, and date.");
      return;
    }
    setMessage(null);
    setError(null);
    try {
      await axios.post('/api/admin/assignments', {
        studentId: selectedStudent,
        quizId: selectedQuiz,
        testDate: testDate,
      });
      setMessage(`Quiz assigned successfully!`);
      // Clear form
      setSelectedStudent('');
      setSelectedQuiz('');
      setTestDate('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign quiz.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 p-4">
      
      {/* --- Column 1: Create User --- */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New User</h2>
        <form onSubmit={handleCreateUser} className="space-y-4">
          {message && <div className="p-3 text-sm text-green-700 bg-green-100 rounded-lg">{message}</div>}
          {error && <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg">{error}</div>}
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create User
          </button>
        </form>
      </div>

      {/* --- Column 2: Assign Quiz --- */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Assign Quiz to Student</h2>
        <form onSubmit={handleAssignQuiz} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Student</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            >
              <option value="">Select a student</option>
              {students.map(student => (
                <option key={student._id} value={student._id}>{student.username}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Quiz</label>
            <select
              value={selectedQuiz}
              onChange={(e) => setSelectedQuiz(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            >
              <option value="">Select a quiz</option>
              {quizzes.map(quiz => (
                <option key={quiz._id} value={quiz._id}>{quiz.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Test Date</label>
            <input
              type="date"
              value={testDate}
              onChange={(e) => setTestDate(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Assign Quiz
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;

