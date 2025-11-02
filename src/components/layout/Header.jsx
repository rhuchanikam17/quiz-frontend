import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Removed .jsx extension

const Layout = () => {
  const { user, logout } = useAuth();

  return (
    <>
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left side: Org Name */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-bold text-indigo-600">
                QuizApp {/* Your Organization Name */}
              </Link>
            </div>
            
            {/* Right side: Auth Status */}
            <div className="flex items-center">
              {user ? (
                // If user is logged in
                <>
                  <span className="text-gray-700 mr-4">
                    Welcome, <span className="font-semibold">{user.username}</span> ({user.role})
                  </span>
                  <button
                    onClick={logout}
                    className="py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Logout
                  </button>
                </>
              ) : (
                // If user is logged out
                <Link
                  to="/login"
                  className="py-2 px-4 border border-transparent rounded-md text-sm font-medium text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* Outlet renders the current route's component (e.g., Login, Dashboard) */}
          <Outlet />
        </div>
      </main>
    </>
  );
};

export default Layout;

