import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Calendar.css';

const Calendar = () => {
  const { user } = useAuth();
  
  // Check if user is a teacher
  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';
  
  // State for calendar
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Initialize events from localStorage, or use default events
  const [events, setEvents] = useState(() => {
    try {
      const savedEvents = localStorage.getItem('lms_calendar_events');
      if (savedEvents) {
        return JSON.parse(savedEvents);
      }
    } catch (error) {
      console.error('Error loading events from localStorage:', error);
    }
    
    // Default events if localStorage is empty
    return [
      {
        id: 1,
        date: '2026-02-15',
        title: 'React Workshop',
        description: 'Advanced React patterns and hooks',
        time: '10:00 AM',
        color: '#3498db'
      },
      {
        id: 2,
        date: '2026-02-18',
        title: 'Assignment Deadline',
        description: 'Submit JavaScript project',
        time: '11:59 PM',
        color: '#e74c3c'
      },
      {
        id: 3,
        date: '2026-02-20',
        title: 'Class Discussion',
        description: 'Database design principles',
        time: '2:00 PM',
        color: '#2ecc71'
      }
    ];
  });

  // State for modal
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    time: '10:00 AM',
    color: '#3498db'
  });
  const [selectedDate, setSelectedDate] = useState(null);

  // Save events to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('lms_calendar_events', JSON.stringify(events));
    } catch (error) {
      console.error('Error saving events to localStorage:', error);
    }
  }, [events]);

  // Listen for storage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      // Only update if the calendar events key changed
      if (e.key === 'lms_calendar_events' && e.newValue) {
        try {
          const updatedEvents = JSON.parse(e.newValue);
          setEvents(updatedEvents);
        } catch (error) {
          console.error('Error parsing updated events:', error);
        }
      }
    };

    // Add listener for storage changes from other tabs/windows
    window.addEventListener('storage', handleStorageChange);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Get calendar days for current month
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
    const dateString = formatDateString(day);
    return events.filter(event => event.date === dateString);
  };

  // Previous month
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  // Next month
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  // Handle add event click
  const handleAddEvent = (day) => {
    if (!isTeacher) return;
    
    setSelectedDate(day);
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      time: '10:00 AM',
      color: '#3498db'
    });
    setShowModal(true);
  };

  // Handle edit event
  const handleEditEvent = (event, e) => {
    if (!isTeacher) return;
    
    e.stopPropagation();
    setSelectedDate(null);
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      time: event.time,
      color: event.color
    });
    setShowModal(true);
  };

  // Handle delete event
  const handleDeleteEvent = (id, e) => {
    if (!isTeacher) return;
    
    e.stopPropagation();
    setEvents(events.filter(event => event.id !== id));
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Please enter an event title');
      return;
    }

    if (editingEvent) {
      // Update existing event
      setEvents(events.map(event =>
        event.id === editingEvent.id
          ? {
              ...event,
              title: formData.title,
              description: formData.description,
              time: formData.time,
              color: formData.color
            }
          : event
      ));
    } else if (selectedDate) {
      // Add new event
      const newEvent = {
        id: Math.max(...events.map(e => e.id), 0) + 1,
        date: formatDateString(selectedDate),
        title: formData.title,
        description: formData.description,
        time: formData.time,
        color: formData.color
      };
      setEvents([...events, newEvent]);
    }

    setShowModal(false);
  };

  // Handle form input change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calendarDays = getCalendarDays();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="calendar-page">
      <div className="calendar-header-section">
        <div className="calendar-title">
          <h1>📅 Calendar</h1>
          <p>{isTeacher ? 'Manage your class events and deadlines' : 'View class events and deadlines'}</p>
        </div>
        <div className="calendar-role-badge">
          {isTeacher ? '👨‍🏫 Teacher' : '👨‍🎓 Student'}
        </div>
      </div>

      <div className="calendar-container">
        <div className="calendar-navigation">
          <button 
            className="nav-button prev-button"
            onClick={handlePrevMonth}
            title="Previous month"
          >
            ← Prev
          </button>
          <h2 className="current-month">{monthYear}</h2>
          <button 
            className="nav-button next-button"
            onClick={handleNextMonth}
            title="Next month"
          >
            Next →
          </button>
        </div>

        <div className="calendar-wrapper">
          <div className="calendar-grid">
            {/* Week days header */}
            <div className="week-header">
              {weekDays.map(day => (
                <div key={day} className="week-day">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="days-grid">
              {calendarDays.map((day, index) => {
                const dayEvents = day ? getEventsForDate(day) : [];
                const isToday = day && 
                  new Date().getFullYear() === currentDate.getFullYear() &&
                  new Date().getMonth() === currentDate.getMonth() &&
                  new Date().getDate() === day;

                return (
                  <div
                    key={index}
                    className={`calendar-day-cell ${day ? '' : 'empty'} ${isToday ? 'today' : ''} ${dayEvents.length > 0 ? 'has-events' : ''}`}
                  >
                    {day && (
                      <>
                        <div className="day-number">{day}</div>
                        <div className="day-events">
                          {dayEvents.slice(0, 3).map(event => (
                            <div
                              key={event.id}
                              className="event-item"
                              style={{ borderLeftColor: event.color }}
                              onClick={(e) => isTeacher && handleEditEvent(event, e)}
                              title={event.title}
                            >
                              <span className="event-title">{event.title}</span>
                              {isTeacher && (
                                <button
                                  className="event-delete-btn"
                                  onClick={(e) => handleDeleteEvent(event.id, e)}
                                  title="Delete event"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          ))}
                          {dayEvents.length > 3 && (
                            <div className="event-more">+{dayEvents.length - 3} more</div>
                          )}
                        </div>

                        {/* Add event button for teachers */}
                        {isTeacher && (
                          <button
                            className="add-event-btn"
                            onClick={() => handleAddEvent(day)}
                            title="Add event"
                          >
                            +
                          </button>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Event Details Section */}
      {!isTeacher && (
        <div className="calendar-events-list">
          <div className="section-header">
            <h2>📋 Upcoming Events</h2>
          </div>
          <div className="events-timeline">
            {events.length === 0 ? (
              <div className="no-events">No events scheduled</div>
            ) : (
              events
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .map(event => (
                  <div key={event.id} className="timeline-event" style={{ borderLeftColor: event.color }}>
                    <div className="event-date">
                      {new Date(event.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="event-details">
                      <h4>{event.title}</h4>
                      <p className="event-time">⏰ {event.time}</p>
                      {event.description && <p className="event-description">{event.description}</p>}
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* Modal for adding/editing events - only available to teachers */}
      {isTeacher && showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingEvent ? 'Edit Event' : 'Add New Event'}</h2>
              <button
                className="modal-close-btn"
                onClick={() => setShowModal(false)}
                title="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="event-form">
              <div className="form-group">
                <label htmlFor="title">Event Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  placeholder="Enter event title"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="Enter event description (optional)"
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="time">Time</label>
                  <input
                    type="text"
                    id="time"
                    name="time"
                    value={formData.time}
                    onChange={handleFormChange}
                    placeholder="e.g., 10:00 AM"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="color">Color</label>
                  <div className="color-picker">
                    <input
                      type="color"
                      id="color"
                      name="color"
                      value={formData.color}
                      onChange={handleFormChange}
                    />
                    <span className="color-preview" style={{ backgroundColor: formData.color }}></span>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingEvent ? 'Update Event' : 'Add Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
