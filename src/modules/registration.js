import { createSlice } from '@reduxjs/toolkit';
import { LOG_OUT } from './reset';

const name = 'registration';

// Selectors

export const selectRegistrationEmail = (state) => state[name].email;

// Slice

const initialState = { email: '' };

const slice = createSlice({
  name,
  initialState,
  extraReducers: {
    [LOG_OUT]: () => initialState,
  },
  reducers: {
    setRegistrationEmail: (state, { payload }) => ({ email: payload }),
  },
});

export const { setRegistrationEmail } = slice.actions;
export default slice;
