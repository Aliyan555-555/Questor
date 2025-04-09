import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define a type for a quiz
interface QuizType {
    _id: string;
    name: string;
    description: string;
    creator: string;
    coverImage: string;
    status: string;
  }
  

// Define the state interface
interface BaseState {
    publicQuizzes: QuizType[];
    userDraftQuizzes: QuizType[];
    userPublishedQuizzes: QuizType[];
}

// Initial state with type safety
const initialState: BaseState = {
    publicQuizzes: [],
    userDraftQuizzes: [],
    userPublishedQuizzes: [],
};

const baseSlice = createSlice({
    name: "base",
    initialState,
    reducers: {
        setPublicQuizzes(state, action: PayloadAction<QuizType[]>) {
            state.publicQuizzes = action.payload;
        },
        setUserDraftQuizzes(state, action: PayloadAction<QuizType[]>) {
            state.userDraftQuizzes = action.payload;
        },
        setUserPublishedQuizzes(state, action: PayloadAction<QuizType[]>) {
            state.userPublishedQuizzes = action.payload;
        },
        addPublicQuiz(state, action: PayloadAction<QuizType>) {
            state.publicQuizzes.push(action.payload);
        },
        addUserDraftQuiz(state, action: PayloadAction<QuizType>) {
            state.userDraftQuizzes.push(action.payload);
        },
        addUserPublishedQuiz(state, action: PayloadAction<QuizType>) {
            state.userPublishedQuizzes.push(action.payload);
        },
    },
});

export const {
    setPublicQuizzes,
    setUserDraftQuizzes,
    setUserPublishedQuizzes,
    addPublicQuiz,
    addUserDraftQuiz,
    addUserPublishedQuiz,
} = baseSlice.actions;

export default baseSlice.reducer;
