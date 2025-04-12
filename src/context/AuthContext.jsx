import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Stores user info { id, name, role }
  const [loading, setLoading] = useState(true); // Check if auth state is loaded

  // Check local storage for existing session on initial load
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('user'); // Clear corrupted data
    } finally {
       setLoading(false); // Finished loading auth state
    }
  }, []);

  const login = (userData) => {
    // In a real app, you'd validate credentials and fetch user data from an API
    // Here, we just receive the userData (including role)
    if (userData && userData.role) {
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      // Redirect based on role after login (can be done in Login page or here)
    } else {
      console.error("Login failed: User data or role missing");
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    // Redirect to login page (usually handled by ProtectedRoute or directly)
  };

  // Don't render children until auth state is determined
  if (loading) {
    return <div>Loading authentication...</div>; // Or a spinner component
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  // Return loading state as well
  return context;
}; 