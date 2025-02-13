import { Teacher } from "@/src/types";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentGame: null as Teacher | null,
};

const teacherSlice = createSlice({
  name: "teacher",
  initialState,
  reducers: {
    created(state, actions) {
      state.currentGame = actions.payload;
    },
    update(state, actions) {
      state.currentGame = { ...state.currentGame, ...actions.payload };
    },
    disconnect(state) {
      state.currentGame = null;
    },
    setStudents(state, actions) {
      if (state.currentGame) {
        state.currentGame.students = actions.payload;
      }
    },
    changeStudentCharacter(state, actions) {
      if (!state.currentGame) {
        console.error("No current game found.");
        return;
      }
    
      state.currentGame.students = state.currentGame.students.map((s) => {
        return s._id.toString() === actions.payload._id.toString() ? actions.payload : s;
      });
    },
    
    changeStudentCharacterAccessories(state, actions) {
      if (!state.currentGame) {
        console.error("No current game found.");
        return;
      }
      state.currentGame.students = state.currentGame.students.map((s) => {
        return s._id.toString() === actions.payload._id.toString() ? actions.payload : s;
      });

      
    },
    
  },
});

export const {
  created,
  update,
  disconnect,
  setStudents,
  changeStudentCharacterAccessories,
  changeStudentCharacter,
} = teacherSlice.actions;

export default teacherSlice.reducer;
