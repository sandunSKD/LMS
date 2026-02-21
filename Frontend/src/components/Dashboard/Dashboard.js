import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState([]);

  const [announcements, setAnnouncements] = useState([
    { id: 1, title: 'New Course Available: Advanced React Patterns', date: '2024-01-12', type: 'info' },
    { id: 2, title: 'System Maintenance Scheduled', date: '2024-01-14', type: 'warning' },
    { id: 3, title: 'Congratulations on completing JavaScript Basics!', date: '2024-01-10', type: 'success' }
  ]);

  // Load calendar events from localStorage
  useEffect(() => {
    const loadEvents = () => {
      try {
        const savedEvents = localStorage.getItem('lms_calendar_events');
        if (savedEvents) {
          setCalendarEvents(JSON.parse(savedEvents));
        }
      } catch (error) {
        console.error('Error loading calendar events:', error);
      }
    };

    loadEvents();

    // Listen for changes from other tabs
    const handleStorageChange = (e) => {
      if (e.key === 'lms_calendar_events' && e.newValue) {
        try {
          setCalendarEvents(JSON.parse(e.newValue));
        } catch (error) {
          console.error('Error parsing updated events:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const stats = [
    { title: 'Enrolled Courses', value: '6', icon: '', color: '#3498db', gradient: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)' },
    { title: 'Completed Assignments', value: '24', icon: '', color: '#3498db', gradient: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)' },
    { title: 'Upcoming Deadlines', value: '3', icon: '', color: '#3498db', gradient: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)' },
    { title: 'Overall Progress', value: '78%', icon: '', color: '#3498db', gradient: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)' }
  ];

  const joinedClasses = [
    { id: 1, name: 'React Development', instructor: 'Dr. Smith', time: 'Mon, Wed, Fri 10:00 AM', room: '201', color: '#3498db' },
    { id: 2, name: 'JavaScript Fundamentals', instructor: 'Prof. Johnson', time: 'Tue, Thu 2:00 PM', room: '305', color: '#3498db' },
    { id: 3, name: 'Web Design Principles', instructor: 'Ms. Davis', time: 'Wed 1:00 PM', room: '102', color: '#3498db' },
    { id: 4, name: 'Database Management', instructor: 'Dr. Wilson', time: 'Mon, Wed 3:00 PM', room: '404', color: '#3498db' }
  ];

  const monthlyPlan = [
    { week: 'Week 1', focus: 'React Hooks & State Management', status: 'in-progress' },
    { week: 'Week 2', focus: 'Advanced JavaScript Patterns', status: 'upcoming' },
    { week: 'Week 3', focus: 'UI/UX Design Principles', status: 'upcoming' },
    { week: 'Week 4', focus: 'Database Design & Optimization', status: 'upcoming' }
  ];

  // Get proper calendar days for current month
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  // Format date to YYYY-MM-DD
  const formatDateString = (day) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const date = String(day).padStart(2, '0');
    return `${year}-${month}-${date}`;
  };

  // Get events for a specific date
  const getEventsForDate = (day) => {
    if (!day) return [];
    const dateString = formatDateString(day);
    return calendarEvents.filter(event => event.date === dateString);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const deleteAnnouncement = (id) => {
    setAnnouncements(announcements.filter(ann => ann.id !== id));
  };

  const calendarDays = getCalendarDays();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>{user?.name}!</h1>
          <p>Here's your personalized learning dashboard</p>
        </div>
        <div className="header-date">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card" style={{ background: stat.gradient }}>
            <div className="stat-icon">
              {stat.icon}
            </div>
            <div className="stat-content">
              <h3>{stat.value}</h3>
              <p>{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-top-section">
        {/* Joined Classes */}
        <div className="dashboard-section joined-classes-section">
          <div className="section-header">
            <h2>👥 Joined Classes</h2>
            <span className="section-count">{joinedClasses.length} Classes</span>
          </div>
          <div className="classes-grid">
            {joinedClasses.map(classItem => (
              <div key={classItem.id} className="class-card" style={{ borderLeftColor: classItem.color }}>
                <div className="class-header">
                  <h4>{classItem.name}</h4>
                  <span className="room-badge">{classItem.room}</span>
                </div>
                <p className="class-instructor">👨‍🏫 {classItem.instructor}</p>
                <p className="class-time">⏱️ {classItem.time}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar */}
        <div className="dashboard-section calendar-section">
          <div className="calendar-header-section">
            <div>
              <h2>📅 Calendar</h2>
            </div>
            <div className="calendar-nav-buttons">
              <button 
                className="calendar-nav-btn"
                onClick={handlePrevMonth}
                title="Previous month"
              >
                ← Prev
              </button>
              <span className="month-year">{monthYear}</span>
              <button 
                className="calendar-nav-btn"
                onClick={handleNextMonth}
                title="Next month"
              >
                Next →
              </button>
            </div>
          </div>
          
          <div className="calendar">
            <div className="calendar-weekdays">
              {weekDays.map(day => (
                <div key={day} className="calendar-weekday-header">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="calendar-days">
              {calendarDays.map((day, index) => {
                const dayEvents = getEventsForDate(day);
                const isToday = day &&
                  new Date().getFullYear() === currentDate.getFullYear() &&
                  new Date().getMonth() === currentDate.getMonth() &&
                  new Date().getDate() === day;

                return (
                  <div
                    key={index}
                    className={`calendar-day ${day ? '' : 'empty'} ${isToday ? 'today' : ''} ${dayEvents.length > 0 ? 'has-events' : ''}`}
                  >
                    {day && (
                      <>
                        <div className="day-number">{day}</div>
                        <div className="day-event-indicators">
                          {dayEvents.slice(0, 2).map((event, idx) => (
                            <div
                              key={idx}
                              className="event-dot"
                              style={{ backgroundColor: event.color }}
                              title={event.title}
                            ></div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="event-more-dots">+{dayEvents.length - 2}</div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Plan */}
      <div className="dashboard-section monthly-plan-section">
        <div className="section-header">
          <h2>📋 This Month's Plan</h2>
        </div>
        <div className="monthly-plan-grid">
          {monthlyPlan.map((plan, index) => (
            <div key={index} className={`plan-card ${plan.status}`}>
              <div className="plan-week">{plan.week}</div>
              <div className="plan-focus">{plan.focus}</div>
              <div className="plan-status-badge">{plan.status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Announcements */}
        <div className="dashboard-section announcements-section">
          <div className="section-header">
            <h2>📢 Announcements</h2>
            <span className="section-count">{announcements.length} New</span>
          </div>
          <div className="announcements-list">
            {announcements.length === 0 ? (
              <div className="no-announcements">No announcements at the moment</div>
            ) : (
              announcements.map(announcement => (
                <div key={announcement.id} className={`announcement-item type-${announcement.type}`}>
                  <div className="announcement-content">
                    <h4>{announcement.title}</h4>
                    <p>{announcement.date}</p>
                  </div>
                  <div className="announcement-actions">
                    <div className={`announcement-badge type-${announcement.type}`}>
                      {announcement.type === 'info' && '💡'}
                      {announcement.type === 'warning' && '⚠️'}
                      {announcement.type === 'success' && '🎉'}
                    </div>
                    <button 
                      className="delete-btn" 
                      onClick={() => deleteAnnouncement(announcement.id)}
                      title="Delete announcement"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
