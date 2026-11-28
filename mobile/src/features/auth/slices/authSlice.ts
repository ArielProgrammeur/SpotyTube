
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { AuthUser } from '../types/auth.types';

type AuthStatus =
  | 'idle'
  | 'loading'
  | 'authenticated'
  | 'unauthenticated'
  | 'error';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  status: AuthStatus;
  sessionError: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  status: 'idle',
  sessionError: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,

  reducers: {
    setUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.status = 'authenticated';
      state.sessionError = null;
    },

    setLoading: (state) => {
      state.status = 'loading';
      state.sessionError = null;
    },

    setSessionError: (state, action: PayloadAction<string>) => {
      state.user = null;
      state.isAuthenticated = false;
      state.status = 'error';
      state.sessionError = action.payload;
    },

    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.status = 'unauthenticated';
      state.sessionError = null;
    },
  },
});

export const {
  setUser,
  setLoading,
  setSessionError,
  clearAuth,
} = authSlice.actions;

export default authSlice.reducer;
