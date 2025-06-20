import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { Question } from "@/src/types";

interface Avatar {
  _id: string;
  resource: string;
  colors: {
    bodyColor: string;
    chinColor: string;
    eyeBorderColor: string;
    eyeballColor: string;
    eyebrowColor: string;
    lipColor: string;
    mouthColor: string;
    pupilColor: string;
    teethColor: string;
    teethType: string;
    tongueColor: string;
  };
}

interface Accessory {
  _id: string;
  type: string;
  resource: string;
}

interface CurrentGame {
  roomId: string;
  refreshToken: string;
  student: {
    _id: string;
    nickname: string;
    score: number;
    rank: number;
    quiz: {
      theme: {
        image: string;
      };
    };
    item: {
      _id: string;
      resource: string;
    };
    room: {
      _id: string;
      currentStage: {
        question: string | Question;
        isLastStage: boolean;
        stage: number;
      };
    };
    isActive: boolean;
    avatar: Avatar;
  };
}

interface Theme {
  _id: string;
  image: string;
}

export interface CurrentDraft {
  _id: string;
  name: string;
  isPrivet: boolean;
  description: string;
  coverImage: string;
  status: "draft" | "active";
  questions: Question[];
  theme: {
    _id: string;
    image: string;
  };
}

interface User {
  _id: string;
  name: string;
  email: string;
  authToken: string;
  profileImage: string;
  providerId: string;
  providerName: string;
  favorites: string[];
}

interface StudentState {
  currentGame: CurrentGame | null;
  avatars: Avatar[];
  accessories: Accessory[];
  user: User | null;
  isAuthenticated: boolean;
  themes: Theme[];
  currentDraft: null | CurrentDraft;
}

const initialState: StudentState = {
  currentGame: null,
  avatars: [],
  accessories: [],
  user: null,
  isAuthenticated: false,
  themes: [],
  currentDraft: null,
};

const studentSlice = createSlice({
  name: "student",
  initialState,
  reducers: {
    changeQuestionValueInDraft(state, action) {
      if (!state.currentDraft) return;

      const { questionId, field, value } = action.payload;
      const questionIndex = state.currentDraft.questions.findIndex(
        (question) => question._id === questionId
      );

      if (questionIndex !== -1) {
        state.currentDraft.questions[questionIndex][field] = value;
      }
    },

    updateDraftQuestion(state, action: PayloadAction<Question>) {
      if (state.currentDraft) {
        const questionIndex = state.currentDraft.questions.findIndex(
          (q: Question) => q._id === action.payload._id
        );
        if (questionIndex !== -1) {
          state.currentDraft.questions[questionIndex] = action.payload;
        }
      }
    },
    setFavorites(state, action) {
      if (state.user) {
        state.user.favorites = action.payload;
      }
    },
    setScore(state, action) {
      state.currentGame.student.score = action.payload.score;
      state.currentGame.student.rank = action.payload.rank;
    },
    join(state, action) {
      state.currentGame = action.payload;
    },
    update(state, action) {
      state.currentGame = { ...state.currentGame, ...action.payload };
    },
    disconnect(state) {
      state.currentGame = null;
    },
    changeCharacters(state, actions) {
      if (state.currentGame) {
        state.currentGame.student.avatar = actions.payload;
      }
    },
    changeCharacterAccessories(state, actions) {
      if (state.currentGame) {
        state.currentGame.student.item = actions.payload;
      }
    },
    setAvatars(state, action) {
      state.avatars = action.payload;
    },
    addAvatar(state, action) {
      state.avatars.push(action.payload);
    },
    updateAvatar(state, action) {
      const index = state.avatars.findIndex(
        (avatar) => avatar._id === action.payload.id
      );
      if (index !== -1) {
        state.avatars[index] = action.payload;
      }
    },
    removeAvatar(state, action) {
      state.avatars = state.avatars.filter(
        (avatar) => avatar._id !== action.payload.id
      );
    },
    setAccessories(state, action) {
      state.accessories = action.payload;
    },
    addAccessory(state, action) {
      state.accessories.push(action.payload);
    },
    updateAccessory(state, action) {
      const index = state.accessories.findIndex(
        (accessory) => accessory._id === action.payload.id
      );
      if (index !== -1) {
        state.accessories[index] = action.payload;
      }
    },
    removeAccessory(state, action) {
      state.accessories = state.accessories.filter(
        (accessory) => accessory._id !== action.payload.id
      );
    },
    login(state, action: PayloadAction<User>) {
      if (state.isAuthenticated) {
        toast.error("User is already logged in");
        return;
      }
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.currentDraft = null;
    },
    updateUser(state, action) {
      state.user = { ...state.user, ...action.payload };
    },
    createNewDraft() {},
    updateDraft() {},
    deleteDraft() {},
    clearCurrentDraft(state) {
      state.currentDraft = null;
    },
    setThemes(state, action: PayloadAction<Theme[]>) {
      state.themes = action.payload;
    },
    setCurrentDraft(state, action: PayloadAction<CurrentDraft>) {
      state.currentDraft = action.payload;
    },
    updateQuestion(state, action: PayloadAction<Question>) {
      if (!state.currentDraft) return;

      state.currentDraft.questions = state.currentDraft.questions.map(
        (question) =>
          question._id === action.payload._id ? action.payload : question
      );
    },
    setQuestionsIndex(state, action) {
      state.currentDraft = { ...state.currentDraft, questions: action.payload };
    },
    updateCurrentDraft(state, action: PayloadAction<CurrentDraft>) {
      state.currentDraft = { ...state.currentDraft, ...action.payload };
    },
    updateQuestionMedia(state, action: PayloadAction<Question>) {
      if (state.currentDraft) {
        const questionIndex = state.currentDraft.questions.findIndex(
          (q: Question) => q._id === action.payload._id
        );
        if (questionIndex !== -1) {
          state.currentDraft.questions[questionIndex] = action.payload;
        }
      }
    },
  },
});

export const {
  join,
  updateQuestion,
  updateQuestionMedia,
  setCurrentDraft,
  clearCurrentDraft,
  setFavorites,
  updateCurrentDraft,
  setThemes,
  setQuestionsIndex,
  login,
  logout,
  changeQuestionValueInDraft,
  updateUser,
  update,
  disconnect,
  updateDraftQuestion,
  setAvatars,
  addAvatar,
  updateAvatar,
  removeAvatar,
  setAccessories,
  addAccessory,
  changeCharacterAccessories,
  updateAccessory,
  changeCharacters,
  removeAccessory,
  setScore,
} = studentSlice.actions;

export default studentSlice.reducer;
