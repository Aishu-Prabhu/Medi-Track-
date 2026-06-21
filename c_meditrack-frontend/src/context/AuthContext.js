// src/context/AuthContext.js
// Global auth state using Context API + useReducer
// Supports: PATIENT, DOCTOR, ADMIN, SUPER_ADMIN

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
} from 'react';

import { jwtDecode } from 'jwt-decode';

// ─────────────────────────────────────────────
// INITIAL STATE
// ─────────────────────────────────────────────
const initialState = {
  token: null,
  user: null, // { email, role, name }
  role: null,
  isAuthenticated: false,
  loading: true,
};

// ─────────────────────────────────────────────
// REDUCER updates state based on action type.
// ─────────────────────────────────────────────
function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user,
        role: action.payload.user.role,
        isAuthenticated: true,
        loading: false,
      };

    case 'LOGOUT':
      return {
        ...initialState,
        loading: false,
      };

    case 'RESTORE':
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user,
        role: action.payload.user.role,
        isAuthenticated: true,
        loading: false,
      };

    case 'STOP_LOADING':
      return {
        ...state,
        loading: false,
      };

    default:
      return state;
  }
}

// ─────────────────────────────────────────────
// CONTEXT
// ─────────────────────────────────────────────
const AuthContext = createContext(null);

// ─────────────────────────────────────────────
// PROVIDER
// ─────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(
    authReducer,
    initialState
  );

  // Restore login after refresh
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedName = localStorage.getItem('name');

    if (!token) {
      dispatch({ type: 'STOP_LOADING' });
      return;
    }

    try {
      const decoded = jwtDecode(token);

      // Token expired
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.clear();
        dispatch({ type: 'LOGOUT' });
        return;
      }

      const user = {
        email: decoded.sub,
        role: decoded.role, // ADMIN / SUPER_ADMIN / DOCTOR / PATIENT
        name: savedName || decoded.sub,
      };

      dispatch({
        type: 'RESTORE',
        payload: { token, user },
      });

    } catch (error) {
      localStorage.clear();
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  // Login
  const login = (token, name = '') => {
    try {
      const decoded = jwtDecode(token);

      const user = {
        email: decoded.sub,
        role: decoded.role,
        name: name || decoded.sub,
      };

      localStorage.setItem('token', token);
      localStorage.setItem('name', user.name);

      dispatch({
        type: 'LOGIN',
        payload: { token, user },
      });

    } catch (error) {
      localStorage.clear();
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Logout
  const logout = () => {
    localStorage.clear();
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─────────────────────────────────────────────
// CUSTOM HOOK
// ─────────────────────────────────────────────
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider'
    );
  }

  return context;
}

export default AuthContext;