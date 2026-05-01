import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize users if not present
  useEffect(() => {
    const savedUsers = localStorage.getItem('lms_users');
    if (!savedUsers) {
      const demoUsers = [
        { id: 1, email: 'student@lms.com', password: 'student123', role: 'student', name: 'John Doe' },
        { id: 2, email: 'teacher@lms.com', password: 'teacher123', role: 'teacher', name: 'Jane Smith' },
        { id: 3, email: 'admin@lms.com', password: 'admin123', role: 'admin', name: 'Admin User' }
      ];
      localStorage.setItem('lms_users', JSON.stringify(demoUsers));
    }
  }, []);

  // Check for existing user session on app load
  useEffect(() => {
    const savedUser = localStorage.getItem('lms_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('lms_users') || '[]');
        const foundUser = users.find(u => u.email === email && u.password === password);
        
        if (foundUser) {
          const { password, ...userWithoutPassword } = foundUser;
          setUser(userWithoutPassword);
          localStorage.setItem('lms_user', JSON.stringify(userWithoutPassword));
          resolve(userWithoutPassword);
        } else {
          reject(new Error('Invalid email or password'));
        }
      }, 1000);
    });
  };

  const signup = async (name, email, password, role) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('lms_users') || '[]');
        if (users.find(u => u.email === email)) {
          reject(new Error('Email already exists'));
          return;
        }

        const newUser = {
          id: Date.now(),
          name,
          email,
          password,
          role: role.toLowerCase()
        };

        users.push(newUser);
        localStorage.setItem('lms_users', JSON.stringify(users));
        resolve(true);
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('lms_user');
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
