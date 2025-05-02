import { configureStore, combineReducers } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";

import orderReducer from "./slices/orderSlice";
import categoryReducer from "./slices/categorySlice";
import userReducer from "./slices/userSlice";
import siteConfig from './slices/siteConfigSlice'
import departmentsReducer from './slices/departmentSlice'
// ✅ Nested persist config for user slice (exclude loading)
const userPersistConfig = {
  key: "user",
  storage,
  blacklist: ["loading"], // ❌ exclude only loading state
};

// ✅ Root persist config
const rootPersistConfig = {
  key: "root",
  storage,
  blacklist: [], // No need to blacklist user anymore
};

const rootReducer = combineReducers({
  orders: orderReducer,
  categories: categoryReducer,
  siteConfig,
  departments: departmentsReducer,
  user: persistReducer(userPersistConfig, userReducer), // 👈 nested config
});

const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
