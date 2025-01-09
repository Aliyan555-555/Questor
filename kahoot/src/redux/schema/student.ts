import { createSlice } from "@reduxjs/toolkit";

interface CurrentGame {
  roomId: string;
  student: {
    _id: string;
    nickname: string;
    score: number;
  };
}

// <<<<<<< Tabnine <<<<<<<
const initialState = {
  currentGame: null as CurrentGame | null,//+
};
// >>>>>>> Tabnine >>>>>>>// {"conversationId":"51931566-5d1a-4de4-84e8-b32998575474","source":"instruct"}

const studentSlice = createSlice({
  name: "student",
  initialState,
  reducers: {
    join(state, actions) {
      state.currentGame = actions.payload;
    },
    update(state, actions) {
      // console.log(actions.payload)
      state.currentGame = {...actions.payload };
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
