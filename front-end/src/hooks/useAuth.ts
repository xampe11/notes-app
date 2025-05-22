import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { setAuth, logout } from '@/redux/authSlice';
import { apiRequest, getQueryFn } from '@/lib/queryClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user, token } = useSelector((state: RootState) => state.auth);
  const queryClient = useQueryClient();
  
  // On initial load, check if token exists in localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken && !isAuthenticated) {
      fetchUserProfile();
    }
  }, [dispatch, isAuthenticated]);
  
  // Fetch user profile with token
  const fetchUserProfile = async () => {
    try {
      const userData = await apiRequest('/api/auth/me', {
        method: 'GET'
      });
      
      dispatch(setAuth({
        isAuthenticated: true,
        user: userData,
        token: localStorage.getItem('auth_token') || '',
      }));
      
      return userData;
    } catch (error) {
      // If token is invalid, remove it
      localStorage.removeItem('auth_token');
      return null;
    }
  };
  
  // Login function
  const login = async (username: string, password: string) => {
    const data = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    // Save token to localStorage
    localStorage.setItem('auth_token', data.token);
    
    // Update Redux store
    dispatch(setAuth({
      isAuthenticated: true,
      user: data.user,
      token: data.token,
    }));
    
    // Invalidate any user-related queries
    queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
    
    return data;
  };
  
  // Register function
  const register = async (userData: any) => {
    return await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  };
  
  // Logout function
  const logoutUser = () => {
    localStorage.removeItem('auth_token');
    dispatch(logout());
    
    // Invalidate all queries on logout
    queryClient.clear();
  };
  
  // User profile query hook (can be used in components that need user data)
  const userQuery = useQuery({
    queryKey: ['/api/auth/me'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    enabled: isAuthenticated,
  });
  
  return {
    isAuthenticated,
    user,
    token,
    login,
    register,
    logout: logoutUser,
    userQuery,
  };
};