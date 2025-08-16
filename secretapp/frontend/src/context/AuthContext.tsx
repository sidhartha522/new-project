import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User } from '../types';
import authService from '../services/authService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_USER'; payload: Partial<User> };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    default:
      return state;
  }
};

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  clearError: () => void;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check authentication status on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const storedUser = authService.getStoredUser();
      const isAuthenticated = authService.isAuthenticated();

      if (isAuthenticated && storedUser) {
        // Verify with server
        const response = await authService.getCurrentUser();
        if (response.success && response.data) {
          dispatch({ type: 'SET_USER', payload: response.data });
          authService.setStoredUser(response.data);
        } else {
          // Token might be invalid, logout
          authService.logout();
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        // Not authenticated
        authService.logout();
        dispatch({ type: 'LOGOUT' });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      authService.logout();
      dispatch({ type: 'LOGOUT' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: 'LOGIN_START' });

    try {
      console.log('AuthContext: Calling authService.login');
      const response = await authService.login({ email, password });
      console.log('AuthContext: Login response:', response);
      
      if (response.success && response.user) {
        dispatch({ type: 'LOGIN_SUCCESS', payload: response.user });
        authService.setStoredUser(response.user);
        return true;
      } else {
        console.log('AuthContext: Login failed - no success or user');
        dispatch({ 
          type: 'LOGIN_FAILURE', 
          payload: response.message || 'Login failed' 
        });
        return false;
      }
    } catch (error: any) {
      console.error('AuthContext: Login error:', error);
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      return false;
    }
  };

  const register = async (userData: any): Promise<boolean> => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const response = await authService.register(userData);
      
      if (response.success && response.user) {
        dispatch({ type: 'LOGIN_SUCCESS', payload: response.user });
        authService.setStoredUser(response.user);
        return true;
      } else {
        dispatch({ 
          type: 'LOGIN_FAILURE', 
          payload: response.message || 'Registration failed' 
        });
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      return false;
    }
  };

  const logout = () => {
    authService.logout();
    authService.removeStoredUser();
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (userData: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
    if (state.user) {
      const updatedUser = { ...state.user, ...userData };
      authService.setStoredUser(updatedUser);
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    clearError,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
