import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './MCQMarking.css';

const MCQMarking = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [links, setLinks] = useState({});

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/classes');
      const data = await response.json();
      setClasses(data);
      
      // Initialize links state from fetched data
      const initialLinks = {};
      data.forEach(cls => {
        initialLinks[cls._id] = cls.mcqLink || '';
      });
      setLinks(initialLinks);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching classes:', err);
      setLoading(false);
    }
  };

  const handleLinkChange = (classId, value) => {
    setLinks({
      ...links,
      [classId]: value
    });
  };

  const saveLink = async (classId) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/classes/${classId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': user.role
        },
        body: JSON.stringify({ mcqLink: links[classId] })
      });

      if (response.ok) {
        alert('Link updated successfully!');
        fetchClasses();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (err) {
      console.error('Error saving link:', err);
      alert('Failed to save link.');
    }
  };

  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">📝</div>
      </div>
    );
  }

  return (
    <div className="mcq-marking-container">
      <header className="mcq-header">
        <h1>MCQ Paper Marking</h1>
        <p>{isTeacher ? 'Manage student answer submission links for each class.' : 'Select your class to check answers and submit your MCQ papers.'}</p>
      </header>

      <div className="mcq-grid">
        {classes.map((cls) => (
          <div key={cls._id} className="mcq-card" style={{ borderLeftColor: cls.color }}>
            <div className="mcq-card-header">
              <h3>{cls.name}</h3>
              <span className={`class-type type-${cls.type}`}>{cls.type}</span>
            </div>
            
            <div className="mcq-card-body">
              <span className="mcq-instructor">Instructor: {cls.instructor}</span>
              <p>Check your answers and submit papers through the Google Form provided below.</p>
            </div>

            <div className="mcq-action-section">
              {isTeacher ? (
                <div className="teacher-actions">
                  <label style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '0.5rem', display: 'block' }}>
                    Google Form Link:
                  </label>
                  <input
                    type="text"
                    className="mcq-link-input"
                    placeholder="https://docs.google.com/forms/..."
                    value={links[cls._id] || ''}
                    onChange={(e) => handleLinkChange(cls._id, e.target.value)}
                  />
                  <button 
                    className="btn-save-link"
                    onClick={() => saveLink(cls._id)}
                  >
                    Save MCQ Link
                  </button>
                </div>
              ) : (
                <div className="student-actions">
                  {cls.mcqLink ? (
                    <a 
                      href={cls.mcqLink} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn-view-paper"
                    >
                      <span>Check Your Answers</span>
                      <span style={{ fontSize: '1.2rem' }}>↗</span>
                    </a>
                  ) : (
                    <div className="no-link-message">
                      No marking link available yet. Please check back later.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MCQMarking;
