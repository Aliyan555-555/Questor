import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import storage from "redux-persist/lib/storage";
import studentReducer from "./schema/student";
import teacherReducer from "./schema/teacher";
import baseReducer from "./schema/baseSlice";

// Create a persist config
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["student", "teacher","base"], // Persist only these reducers
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
