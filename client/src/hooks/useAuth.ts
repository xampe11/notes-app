import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { setAuth, logout } from '@/redux/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user, token } = useSelector((state: RootState) => state.auth);
  
  // On initial load, check if token exists in localStorage
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token && !isAuthenticated) {
      // Fetch user data with token
      fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => {
          if (!res.ok) {
            throw new Error('Failed to authenticate');
          }
          return res.json();
        })
        .then(userData => {
          dispatch(setAuth({
            isAuthenticated: true,
            user: userData,
            token,
          }));
        })
        .catch(() => {
          // If token is invalid, remove it
          localStorage.removeItem('auth_token');
        });
    }
  }, [dispatch, isAuthenticated]);
  
  // Login function
  const login = async (username: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }
    
    const data = await response.json();
    
    // Save token to localStorage
    localStorage.setItem('auth_token', data.token);
    
    // Update Redux store
    dispatch(setAuth({
      isAuthenticated: true,
      user: data.user,
      token: data.token,
    }));
    
    return data;
  };
  
  // Register function
  const register = async (userData: any) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }
    
    return await response.json();
  };
  
  // Logout function
  const logoutUser = () => {
    localStorage.removeItem('auth_token');
    dispatch(logout());
  };
  
  return {
    isAuthenticated,
    user,
    token,
    login,
    register,
    logout: logoutUser,
  };
};