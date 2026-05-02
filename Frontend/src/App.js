import React, { useState } from 'react';
import './App.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login/Login';
import Navbar from './components/Navbar/Navbar';
import Dashboard from './components/Dashboard/Dashboard';
import Courses from './components/Courses/Courses';
import Assignments from './components/Assignments/Assignments';
import Calendar from './components/Calendar/Calendar';
import Profile from './components/Profile/Profile';
import ChatBot from './components/ChatBot/ChatBot';

// Main LMS Application Component
const LMSApp = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">📚</div>
        <p>Loading NextGen LMS...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'courses':
        return <Courses />;
      case 'assignments':
        return <Assignments />;
      case 'grades':
        return <div className="page-placeholder">📈 Grades page coming soon!</div>;
      case 'calendar':
        return <Calendar />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="lms-app">
      <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="lms-content">
        {renderCurrentPage()}
      </main>
      <ChatBot />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <LMSApp />
      </div>
    </AuthProvider>
  );
}

export default App;

