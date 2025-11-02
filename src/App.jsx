import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';

// Import all the components we have built
import Layout from './components/layout/Header.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';
import { useAuth } from './context/AuthContext.jsx';

// Import all the pages we have built
import Login from './pages/Login.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import TeacherDashboard from './pages/TeacherDashboard.jsx';

// Import Student pages
import StudentDashboard from './pages/StudentDashboard.jsx';
import Quiz from './pages/Quiz.jsx';
import Results from './pages/Results.jsx'; // This is now imported

function App() {
  return (
    <Routes>
      {/* All routes are children of Layout, so they all get the Header */}
      <Route element={<Layout />}>
        
        {/* === Public Routes === */}
        <Route path="/login" element={<Login />} />
        
        {/* === Protected Admin Route === */}
        <Route element={<ProtectedRoute role="admin" />}>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Route>

        {/* === Protected Teacher Route === */}
        <Route element={<ProtectedRoute role="teacher" />}>
          <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        </Route>

        {/* === Protected Student Routes === */}
        <Route element={<ProtectedRoute role="student" />}>
          <Route path="/dashboard" element={<StudentDashboard />} />
          
          {/* --- THESE ROUTES ARE NOW ACTIVE --- */}
          <Route path="/quiz/:assignmentId" element={<Quiz />} />
          <Route path="/quiz/:assignmentId/results" element={<Results />} />
        </Route>
        
        {/* === Catch-all / Home Page === */}
        {/* This will be the default page */}
        <Route path="/" element={<Home />} /> 
        
      </Route>
    </Routes>
  );
}

// A simple placeholder Home component to direct users
const Home = () => {
  const { user } = useAuth();

  // This component will show a different message based on login state
  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-md text-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to the Quiz App</h1>
      {user ? (
        <div>
          <p className="text-lg text-gray-700">You are logged in as {user.username} ({user.role}).</p>
          {user.role === 'student' && <Link to="/dashboard" className="block mt-4 text-indigo-600 hover:underline">Go to My Dashboard</Link>}
          {user.role === 'admin' && <Link to="/admin-dashboard" className="block mt-4 text-indigo-600 hover:underline">Go to Admin Dashboard</Link>}
          {user.role === 'teacher' && <Link to="/teacher-dashboard" className="block mt-4 text-indigo-600 hover:underline">Go to Teacher Dashboard</Link>}
        </div>
      ) : (
        <p className="text-lg text-gray-700">
          Please <Link to="/login" className="text-indigo-600 hover:underline font-semibold">login</Link> to continue.
        </p>
      )}
    </div>
  );
};

export default App;

