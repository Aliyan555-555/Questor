
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentGame:null,
};

const teacherSlice = createSlice({
  name: 'teacher',
  initialState,
  reducers: {
    created (state,actions){
        state.currentGame = actions.payload
    },
    update (state,actions){
        state.currentGame = {...state.currentGame,...actions.payload};
    },
    disconnect(state){
        state.currentGame = null;
    }
  },
});

export const { created,update,disconnect } = teacherSlice.actions;

export default teacherSlice.reducer;