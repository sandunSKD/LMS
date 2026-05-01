import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import '../Login/Login.css';

const SignUp = ({ onNavigateToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signup(name, email, password, role);
      // Once signed up successfully, navigate to login page
      onNavigateToLogin();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-illustration">
        <div className="illustration-content">
          <div className="education-graphic">
            <div className="book-stack">
              <div className="book book-1">📘</div>
              <div className="book book-2">📗</div>
              <div className="book book-3">📙</div>
            </div>
            <div className="graduation-cap">🎓</div>
            <div className="lightbulb">💡</div>
          </div>
          <h2>Join Us Today!</h2>
          <p>Start your learning journey with NextGen LMS</p>
        </div>
      </div>
      
      <div className="login-card">
        <div className="login-header">
          <h1>📚 NextGen LMS</h1>
          <p>Create a new account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Create Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Create a password"
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <div className="role-selection" style={{ display: 'flex', gap: '15px', marginTop: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', fontWeight: 'normal', cursor: 'pointer', color: '#495057' }}>
                <input 
                  type="radio" 
                  name="role" 
                  value="student" 
                  checked={role === 'student'} 
                  onChange={(e) => setRole(e.target.value)} 
                  style={{ width: 'auto', marginRight: '6px' }}
                />
                Student
              </label>
              <label style={{ display: 'flex', alignItems: 'center', fontWeight: 'normal', cursor: 'pointer', color: '#495057' }}>
                <input 
                  type="radio" 
                  name="role" 
                  value="teacher" 
                  checked={role === 'teacher'} 
                  onChange={(e) => setRole(e.target.value)}
                  style={{ width: 'auto', marginRight: '6px' }}
                />
                Teacher
              </label>
              <label style={{ display: 'flex', alignItems: 'center', fontWeight: 'normal', cursor: 'pointer', color: '#495057' }}>
                <input 
                  type="radio" 
                  name="role" 
                  value="admin" 
                  checked={role === 'admin'} 
                  onChange={(e) => setRole(e.target.value)}
                  style={{ width: 'auto', marginRight: '6px' }}
                />
                Admin
              </label>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>

        <div className="login-footer">
          <p>Already have an account? <span style={{ color: '#667eea', fontWeight: '500', cursor: 'pointer' }} onClick={onNavigateToLogin}>Log in here</span></p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;