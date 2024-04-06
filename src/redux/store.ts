import { configureStore } from '@reduxjs/toolkit';
import { passAPI } from './api/passAPI';
import { userReducer } from './reducer/userReducer';
import { userAPI } from './api/userAPI';
export const server = import.meta.env.VITE_SERVER;

export const store = configureStore({
  reducer: {
    [passAPI.reducerPath]: passAPI.reducer,
    [userAPI.reducerPath]: userAPI.reducer,
    [userReducer.name]: userReducer.reducer
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(passAPI.middleware, userAPI.middleware)
});

export type RootState = ReturnType<typeof store.getState>;
