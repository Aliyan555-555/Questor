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
    updateStudentScore(state,actions){
    state.currentGame.students.find(student => student._id === actions.payload.student).score = actions.payload.score
    state.currentGame.students.find(student => student._id === actions.payload.student).rank = actions.payload.rank
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
  updateStudentScore,

} = teacherSlice.actions;

export default teacherSlice.reducer;
