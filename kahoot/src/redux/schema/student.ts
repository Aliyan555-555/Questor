import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentGame: null,
};

const studentSlice = createSlice({
  name: "student",
  initialState,
  reducers: {
    join(state, actions) {
      state.currentGame = actions.payload;
    },
    update(state, actions) {
      // console.log(actions.payload)
      state.currentGame = { ...state.currentGame, ...actions.payload };
      // state.currentGame.student = {...actions.payload}
      // console.log(state.currentGame)
    },
    disconnect(state) {
      state.currentGame = null;
    },
  },
});

export const { join, disconnect, update } = studentSlice.actions;

export default studentSlice.reducer;
