import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import storage from "redux-persist/lib/storage";
import studentReducer from "./schema/student";
import teacherReducer from "./schema/teacher";
import baseReducer from "./schema/baseSlice";

// Create a persist config
const persistConfig = {
  key: "root",
  version: 1,
  whitelist: ["student", "teacher","base"], // Persist only these reducers
  storage,
  // migrate: async (state) => {
  //   // If there's no previous state, just return undefined
  //   if (!state) return undefined;

  //   // Extract student.user safely
  //   const preservedUser = state?.student?.user || null;

  //   return {
  //     student: {
  //       user: preservedUser,
  //     },
      
  //     // teacher: undefined, // reset
  //     // base: undefined, // reset
  //   };
  // },
};

// Combine reducers
const rootReducer = combineReducers({
  student: studentReducer,
  teacher: teacherReducer,
  base:baseReducer
});

// Persist reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Create persistor
const persistor = persistStore(store);

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export { store, persistor };
