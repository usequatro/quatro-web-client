import { createSlice } from '@reduxjs/toolkit';

const name = 'registration';

// Selectors

export const selectRegistrationEmail = (state) => state[name].email;

// Slice

const initialState = { email: '' };

/* eslint-disable no-param-reassign */
const slice = createSlice({
  name,
  initialState,
  reducers: {
    setRegistrationEmail: (state, { payload }) => {
      state.email = payload;
    },
  },
});
/* eslint-enable no-param-reassign */

export const { setRegistrationEmail } = slice.actions;
export default slice;
