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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { signup } = useAuth();

  const images = [
    {
      url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      alt: "Students in lecture hall"
    },
    {
      url: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      alt: "Group of female students"
    },
    {
      url: "https://images.unsplash.com/photo-1552589350-631276093e7e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      alt: "Students collaborating"
    },
    {
      url: "https://images.unsplash.com/photo-1581382533508-14bc92515c2a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      alt: "University study hall"
    },
    {
      url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      alt: "Students in modern study space"
    },
    {
      url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      alt: "Classroom with students"
    },
    {
      url: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      alt: "Study hall environment"
    },
    {
      url: "https://images.unsplash.com/photo-1577896851231-70ef18881754?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      alt: "Female student studying"
    }
  ];

  // Auto-rotate images
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [images.length]);

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
        <div 
          className="background-slideshow"
          style={{ backgroundImage: `url(${images[currentImageIndex].url})` }}
        >
          <div className="background-overlay"></div>
        </div>
        <div className="illustration-content">
          <div className="image-indicators">
            {images.map((_, index) => (
              <button
                key={index}
                type="button"
                className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                onClick={() => setCurrentImageIndex(index)}
              />
            ))}
          </div>
          <h2>Join Us Today!</h2>
          <p>Start your learning journey with NextGen LMS</p>
        </div>
      </div>
      
      <div className="login-card">
        <div className="login-header">
          <h1> NextGen LMS</h1>
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