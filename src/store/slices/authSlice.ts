import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  uid: string | null;
  loading: boolean;
}

const initialState: AuthState = { uid: null, loading: true };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<string | null>) {
      state.uid     = action.payload;
      state.loading = false;
    },
  },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;
