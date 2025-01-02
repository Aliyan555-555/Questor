
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentGame:null,
};

const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    join (state,actions){
        state.currentGame = actions.payload
    },
    disconnect(state){
        state.currentGame = null;
    }
  },
});

export const { join,disconnect } = studentSlice.actions;

export default studentSlice.reducer;