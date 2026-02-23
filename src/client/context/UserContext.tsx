
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { mockUser, mockTeacher } from '../store/mockStore';

interface UserContextType {
  user: User;
  switchRole: () => void;
  setUser: (u: User) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(mockUser);

  // Load from local storage if exists
  useEffect(() => {
    const savedRole = localStorage.getItem('user_role');
    if (savedRole === 'admin' || savedRole === 'teacher') {
      setUser(mockTeacher);
    } else {
      setUser(mockUser);
    }
  }, []);

  const switchRole = () => {
    if (user.role === 'student') {
      // Switch to Admin (Teacher)
      setUser(mockTeacher);
      localStorage.setItem('user_role', 'admin');
    } else {
      // Switch to Student
      setUser(mockUser);
      localStorage.setItem('user_role', 'student');
    }
  };

  return (
    <UserContext.Provider value={{ user, switchRole, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};
