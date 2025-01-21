import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

interface Avatar {
  id: string;
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
  id: string;
  type: string;
  resource: string;
}

interface CurrentGame {
  roomId: string;
  student: {
    _id: string;
    nickname: string;
    score: number;
    item: {
      id: string;
      resource: string;
    };
    avatar: Avatar;
  };
}

interface Theme {
  _id:string;
  image:string;
}

interface StudentState {
  currentGame: CurrentGame | null;
  avatars: Avatar[];
  accessories: Accessory[];
  isAuthenticated: boolean;
  currentDraft:null;
  themes:Theme[];
  user: {
    name: string;
    _id: string;
    profileImage: string;
    providerId: string;
    providerName: string;
    email: string;
    password: string;
  } | null;
}

const initialState: StudentState = {
  currentGame: null,
  avatars: [],
  accessories: [],
  user: null,
  isAuthenticated: false,
  themes:[],
  currentDraft:null,
};

const studentSlice = createSlice({
  name: "student",
  initialState,
  reducers: {
    join(state, action) {
      state.currentGame = action.payload;
    },
    update(state, action) {
      state.currentGame = { ...action.payload };
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
        (avatar) => avatar.id === action.payload.id
      );
      if (index !== -1) {
        state.avatars[index] = action.payload;
      }
    },
    removeAvatar(state, action) {
      state.avatars = state.avatars.filter(
        (avatar) => avatar.id !== action.payload.id
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
        (accessory) => accessory.id === action.payload.id
      );
      if (index !== -1) {
        state.accessories[index] = action.payload;
      }
    },
    removeAccessory(state, action) {
      state.accessories = state.accessories.filter(
        (accessory) => accessory.id !== action.payload.id
      );
    },
    login(state, action) {
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
    },
    updateUser(state, action) {
      state.user = { ...state.user, ...action.payload };
    },
    createNewDraft() {},
    updateDraft() {},
    deleteDraft() {},
    setThemes (state,actions) {
      state.themes = actions.payload;
    },
    setCurrentDraft(state,action) {
      state.currentDraft = action.payload;
    },
    updateCurrentDraft(state,action){
      state.currentDraft = {...action.payload };
    }

  },
});

export const {
  join,
  setCurrentDraft,
  updateCurrentDraft,
  setThemes,
  login,
  logout,
  updateUser,
  update,
  disconnect,
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
} = studentSlice.actions;

export default studentSlice.reducer;
