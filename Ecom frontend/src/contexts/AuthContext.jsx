// src/contexts/AuthContext.js (FINAL CORRECTION FOR REDIRECTION)
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'; // Added useCallback
import api from '../api';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom'; // <--- NEW: Import useNavigate
 
const AuthContext = createContext(null);
 
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // <--- NEW: Get the navigate function here
 
  // Function to decode and set user from token
  const decodeAndSetUser = useCallback((token) => {
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;
 
        if (decodedToken.exp < currentTime) {
          console.warn('JWT token expired. Clearing token.');
          localStorage.removeItem('jwtToken'); // Use jwtToken consistently
          setUser(null);
          setIsAuthenticated(false);
          return false;
        }
 
        let userRoles = [];
        if (Array.isArray(decodedToken.roles)) {
            userRoles = decodedToken.roles;
        } else if (typeof decodedToken.roles === 'string' && decodedToken.roles.length > 0) {
            userRoles = decodedToken.roles.split(',');
        }
       
        setUser({
          id: decodedToken.userId,
          email: decodedToken.sub,
          roles: userRoles,
          exp: decodedToken.exp
        });
        setIsAuthenticated(true);
        // Ensure Axios default header is set when token is loaded from storage
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        return true;
      } catch (error) {
        console.error('Error decoding JWT token:', error);
        localStorage.removeItem('jwtToken'); // Use jwtToken consistently
        setUser(null);
        setIsAuthenticated(false);
        return false;
      }
    } else {
      setUser(null);
      setIsAuthenticated(false);
      return false;
    }
  }, []); // useCallback dependency array
 
  useEffect(() => {
    const token = localStorage.getItem('jwtToken'); // Use jwtToken consistently
    decodeAndSetUser(token);
    setLoading(false);
  }, [decodeAndSetUser]);
 
  // Login function now handles navigation
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { token } = response.data;
 
      // Use jwtToken consistently here
      localStorage.setItem('jwtToken', token);
     
      // Decode and set user state within the context
      decodeAndSetUser(token); // This will update user, isAuthenticated
 
      console.log('Login successful, token stored, user set in context. Navigating...');
      setLoading(false);
      navigate('/'); // <--- THE CRUCIAL REDIRECTION HERE!
      return true;
    } catch (err) {
      console.error('Login failed:', err.response?.data?.message || err.message);
      // Clear any potentially bad tokens/state on login failure
      localStorage.removeItem('jwtToken');
      setIsAuthenticated(false);
      setUser(null);
      setLoading(false);
      throw err;
    }
  };
 
  // Logout function also handles navigation
  const logout = () => {
    localStorage.removeItem('jwtToken'); // Use jwtToken consistently
    setUser(null);
    setIsAuthenticated(false);
    delete api.defaults.headers.common['Authorization'];
    console.log('User logged out. Navigating to login page.');
    navigate('/'); // <--- REDIRECTION ON LOGOUT!
  };
 
  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
  };
 
  if (loading) {
    return <div>Loading authentication...</div>;
  }
 
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
 
export const useAuth = () => {
  return useContext(AuthContext);
};