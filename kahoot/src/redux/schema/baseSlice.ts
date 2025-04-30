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
  
interface QuestionStudentType {
    answer:string;
    student:{
        nickname:string;
    };
    timeSpend:number;
    score:number;
}
 export interface ReportQuestion {
    _id:string;
    question:string;
    type:string;
    correctAnswersPercentage:number;
    answerIndex:number[];
    studentAnswers:string[];
    students:QuestionStudentType[];
    options:string[];
    media?:string;
  }

  interface ReportType {
    _id:string;
    roomId:string;
    status:string;
    name:string;
    endTime:string;
    numberOfParticipants:number
    students:{
        nickname:string;
        score:number
        correctAnswers:number;
        unansweredQuestions:number;
        rank:number;
    }[];
    hostName:string;
    questions:ReportQuestion[]
  }

interface BaseState {
    publicQuizzes: QuizType[];
    userDraftQuizzes: QuizType[];
    userPublishedQuizzes: QuizType[];
    activeQuizzes: string[];
    reports:ReportType[]
}

// Initial state with type safety
const initialState: BaseState = {
    publicQuizzes: [],
    userDraftQuizzes: [],
    userPublishedQuizzes: [],
    activeQuizzes: [],
    reports:[],
};

const baseSlice = createSlice({
    name: "base",
    initialState,
    reducers: {
        setActiveQuizzes(state, action: PayloadAction<string[]>) {
            state.activeQuizzes = action.payload;
        },
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
        deleteQuiz(state, action: PayloadAction<string>) {
            const quizId = action.payload;
            state.publicQuizzes = state.publicQuizzes.filter(quiz => quiz._id !== quizId);
            state.userDraftQuizzes = state.userDraftQuizzes.filter(quiz => quiz._id !== quizId);
            state.userPublishedQuizzes = state.userPublishedQuizzes.filter(quiz => quiz._id !== quizId);
        },
        logoutClearData(state) {
            state.userDraftQuizzes =[];
            state.userPublishedQuizzes = [];
            state.activeQuizzes = [];
            state.reports = [];
        },
        setReports(state,action){
            state.reports = action.payload;
        },
        addReport(state,action){
            state.reports.push(action.payload);
        },
        deleteReport(state,action){
            state.reports = state.reports.filter(r => r._id !== action.payload);
        }
    },
});

export const {
    setReports,
    deleteReport,
    addReport,
    logoutClearData,
    setPublicQuizzes,
    setUserDraftQuizzes,
    deleteQuiz,
    setUserPublishedQuizzes,
    addPublicQuiz,
    addUserDraftQuiz,
    addUserPublishedQuiz,
    setActiveQuizzes,
} = baseSlice.actions;

export default baseSlice.reducer;
