import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'react-toastify';
import CryptoJS from 'crypto-js';
import Cookies from 'js-cookie';

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  biometricEnrolled: false,
  sessionTimeout: null,
  authMethod: null, // 'biometric', 'otp', 'email', 'password'
  permissions: [],
  lastActivity: null,
  failedAttempts: 0,
  isLocked: false,
  lockoutTime: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true };
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        authMethod: action.payload.method,
        permissions: action.payload.permissions,
        lastActivity: new Date().toISOString(),
        failedAttempts: 0,
        isLocked: false,
      };
    
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isLoading: false,
        failedAttempts: state.failedAttempts + 1,
        isLocked: state.failedAttempts >= 4,
        lockoutTime: state.failedAttempts >= 4 ? new Date(Date.now() + 15 * 60 * 1000) : null,
      };
    
    case 'LOGOUT':
      return {
        ...initialState,
        biometricEnrolled: state.biometricEnrolled,
      };
    
    case 'BIOMETRIC_ENROLL':
      return {
        ...state,
        biometricEnrolled: true,
      };
    
    case 'UPDATE_SESSION':
      return {
        ...state,
        lastActivity: new Date().toISOString(),
      };
    
    case 'SET_PERMISSIONS':
      return {
        ...state,
        permissions: action.payload,
      };
    
    case 'REQUIRE_REAUTH':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
      };
    
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state from cookies/localStorage
  useEffect(() => {
    const savedUser = Cookies.get('user');
    const savedAuth = Cookies.get('authToken');
    
    if (savedUser && savedAuth) {
      try {
        const user = JSON.parse(savedUser);
        const token = savedAuth;
        
        // Verify token validity (in real app, verify with backend)
        if (token && user) {
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user,
              method: 'token',
              permissions: user.permissions || [],
            },
          });
        }
      } catch (error) {
        console.error('Error parsing saved auth:', error);
        logout();
      }
    }
  }, []);

  // Session timeout management
  useEffect(() => {
    if (state.isAuthenticated && state.lastActivity) {
      const timeout = setTimeout(() => {
        const lastActivity = new Date(state.lastActivity);
        const now = new Date();
        const diffMinutes = (now - lastActivity) / (1000 * 60);
        
        if (diffMinutes > 30) { // 30 minute timeout
          logout();
          toast.warning('Session expired due to inactivity');
        }
      }, 60000); // Check every minute

      return () => clearTimeout(timeout);
    }
  }, [state.isAuthenticated, state.lastActivity]);

  const login = async (credentials, method = 'password') => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data
      const user = {
        id: '1',
        username: credentials.username || credentials.email,
        email: credentials.email,
        name: 'Dr. John Doe',
        role: 'doctor',
        permissions: ['patient:read', 'patient:write', 'biometric:access'],
        mobile: '+91-9876543210',
        department: 'Cardiology',
      };
      
      // Store in cookies
      Cookies.set('user', JSON.stringify(user), { expires: 7 });
      Cookies.set('authToken', 'mock-jwt-token', { expires: 7 });
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user,
          method,
          permissions: user.permissions,
        },
      });
      
      toast.success('Login successful');
      return true;
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      toast.error('Login failed: ' + error.message);
      return false;
    }
  };

  const loginWithBiometric = async (biometricData) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      // Simulate biometric verification
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock verification result
      const isVerified = biometricData.quality > 60;
      
      if (isVerified) {
        const user = {
          id: '1',
          username: 'biometric_user',
          name: 'Dr. John Doe',
          role: 'doctor',
          permissions: ['patient:read', 'patient:write', 'biometric:access'],
        };
        
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user,
            method: 'biometric',
            permissions: user.permissions,
          },
        });
        
        toast.success('Biometric authentication successful');
        return true;
      } else {
        throw new Error('Biometric verification failed');
      }
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      toast.error('Biometric authentication failed');
      return false;
    }
  };

  const loginWithOTP = async (mobile, otp) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      // Simulate OTP verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock OTP validation (in real app, verify with backend)
      if (otp === '123456') {
        const user = {
          id: '1',
          username: mobile,
          name: 'Dr. John Doe',
          role: 'doctor',
          permissions: ['patient:read', 'patient:write'],
        };
        
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user,
            method: 'otp',
            permissions: user.permissions,
          },
        });
        
        toast.success('OTP verification successful');
        return true;
      } else {
        throw new Error('Invalid OTP');
      }
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      toast.error('OTP verification failed');
      return false;
    }
  };

  const sendOTP = async (mobile) => {
    try {
      // Simulate OTP sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real app, this would call the backend API
      console.log(`OTP sent to ${mobile}: 123456`);
      toast.success('OTP sent successfully');
      return true;
    } catch (error) {
      toast.error('Failed to send OTP');
      return false;
    }
  };

  const logout = () => {
    Cookies.remove('user');
    Cookies.remove('authToken');
    dispatch({ type: 'LOGOUT' });
    toast.info('Logged out successfully');
  };

  const updateActivity = () => {
    dispatch({ type: 'UPDATE_SESSION' });
  };

  const requireReauth = () => {
    dispatch({ type: 'REQUIRE_REAUTH' });
    toast.warning('Re-authentication required for this action');
  };

  const enrollBiometric = async (biometricData) => {
    try {
      // Simulate biometric enrollment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Store biometric hash (in real app, encrypt and store securely)
      const biometricHash = CryptoJS.SHA256(JSON.stringify(biometricData)).toString();
      localStorage.setItem('biometricHash', biometricHash);
      
      dispatch({ type: 'BIOMETRIC_ENROLL' });
      toast.success('Biometric enrollment successful');
      return true;
    } catch (error) {
      toast.error('Biometric enrollment failed');
      return false;
    }
  };

  const hasPermission = (permission) => {
    return state.permissions.includes(permission) || state.permissions.includes('admin');
  };

  const isLockedOut = () => {
    if (state.isLocked && state.lockoutTime) {
      const now = new Date();
      const lockoutEnd = new Date(state.lockoutTime);
      return now < lockoutEnd;
    }
    return false;
  };

  const value = {
    ...state,
    login,
    loginWithBiometric,
    loginWithOTP,
    sendOTP,
    logout,
    updateActivity,
    requireReauth,
    enrollBiometric,
    hasPermission,
    isLockedOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 