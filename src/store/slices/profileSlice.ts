import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { UserProfile } from '../../types';
import { getProfile, saveProfile } from '../../firebase/dataLayer';

interface ProfileState {
  data: UserProfile | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: ProfileState = { data: null, status: 'idle' };

export const fetchProfile = createAsyncThunk('profile/fetch', async (uid: string) => {
  return await getProfile(uid);
});

export const updateProfile = createAsyncThunk(
  'profile/update',
  async ({ uid, data }: { uid: string; data: Partial<UserProfile> }) => {
    await saveProfile(uid, data);
    return data;
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfile(state, action: PayloadAction<UserProfile>) {
      state.data = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchProfile.pending,   s => { s.status = 'loading'; })
      .addCase(fetchProfile.fulfilled, (s, a) => { s.status = 'succeeded'; s.data = a.payload; })
      .addCase(fetchProfile.rejected,  s => { s.status = 'failed'; })
      .addCase(updateProfile.fulfilled, (s, a) => {
        if (s.data) s.data = { ...s.data, ...a.payload };
      });
  },
});

export const { setProfile } = profileSlice.actions;
export default profileSlice.reducer;
