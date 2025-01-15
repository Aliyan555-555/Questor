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
      const updatedStudents = state.currentGame.students.map((student) => {
        if (student._id === actions.payload._id) {
          return { ...student, avatar: actions.payload.avatar };
        }
        return student;
      });
      const updatedKahootStudents = state.currentGame.kahoot.students.map((student) => {
        if (student._id === actions.payload._id) {
          return { ...student, avatar: actions.payload.avatar };
        }
        return student;
      });
      state.currentGame = {
        ...state.currentGame,
        students: updatedStudents,
        kahoot: {
          ...state.currentGame.kahoot,
          students: updatedKahootStudents,
        },
      };
    },
    changeStudentCharacterAccessories(state, actions) {
      if (!state.currentGame) {
        console.error("No current game found.");
        return;
      }
      const updatedStudents = state.currentGame.students.map((student) => {
        if (student._id === actions.payload._id) {
          return { ...student, item: actions.payload.item};
        }
        return student;
      });
      const updatedKahootStudents = state.currentGame.kahoot.students.map((student) => {
        if (student._id === actions.payload._id) {
          return { ...student, item: actions.payload.item };
        }
        return student;
      });
      state.currentGame = {
        ...state.currentGame,
        students: updatedStudents,
        kahoot: {
          ...state.currentGame.kahoot,
          students: updatedKahootStudents,
        },
      };
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
