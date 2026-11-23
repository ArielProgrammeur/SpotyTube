
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser } from '../types/auth.types';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  status: 'idle',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,

  reducers: {
    setUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.status = 'authenticated';
    },

    setLoading: (state) => {
      state.status = 'loading';
    },

    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.status = 'unauthenticated';
    },
  },
});

export const {
  setUser,
  setLoading,
  clearAuth,
} = authSlice.actions;

export default authSlice.reducer;
