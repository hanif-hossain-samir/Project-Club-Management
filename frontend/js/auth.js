import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from './api.js';

const AuthContext = createContext(undefined);

export const CUCC_CONTROLLER_USER = {
  id: 'usr-ctrl-1',
  name: 'Tanvir Ahmed',
  email: 'controller.tech@cityuniversity.edu',
  role: 'controller',
  studentId: 'CU-21-CSE-045',
  department: 'Computer Science & Engineering',
  semester: '7th Semester',
  clubAffiliation: 'computer_club',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  joinedAt: '2022-03-15',
  phone: '+880 1822-456789'
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => CUCC_CONTROLLER_USER);

  useEffect(() => {
    try {
      localStorage.setItem('cuec_current_user', JSON.stringify(CUCC_CONTROLLER_USER));
    } catch {
      // ignore storage write errors
    }
  }, []);

  const loginAsDemo = async () => {
    setUser(CUCC_CONTROLLER_USER);
  };

  const loginWithEmail = async (email) => {
    try {
      const res = await api.login(email);
      if (res.success && res.user) {
        setUser(res.user);
        return { success: true };
      }
      return { success: false, message: res.message || 'Login failed.' };
    } catch (err) {
      return { success: false, message: err?.message || 'Server error.' };
    }
  };

  const registerUser = async (data) => {
    try {
      const res = await api.register(data);
      if (res.success && res.user) {
        setUser(res.user);
        return { success: true };
      }
      return { success: false, message: res.message || 'Registration failed.' };
    } catch (err) {
      return { success: false, message: err?.message || 'Server error.' };
    }
  };

  const logout = () => {
    setUser(null);
  };

  const refreshUser = async () => {
    if (!user) return;
    try {
      const res = await api.getUsers(user.id);
      if (res.success && Array.isArray(res.users)) {
        const found = res.users.find((u) => u.id === user.id || u.studentId === user.studentId);
        if (found) setUser(found);
      }
    } catch {
      // ignore refresh failures
    }
  };

  return React.createElement(
    AuthContext.Provider,
    {
      value: {
        user,
        role: user?.role || 'user',
        isAuthenticated: !!user,
        loginAsDemo,
        loginWithEmail,
        registerUser,
        logout,
        refreshUser
      }
    },
    children
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
