import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // Puedes usar sessionStorage en lugar de localStorage
import userReducer from './user/user';
import { useDispatch, useSelector } from 'react-redux'; // Importa useDispatch y  //useSelector eliminar en caso de falla useselector

const persistConfig = {
  key: 'root',
  storage,
};

const persistedReducer = persistReducer(persistConfig, userReducer);

export const store = configureStore({
  reducer: {
    user: persistedReducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST', 
          'persist/REHYDRATE',
          'persist/REGISTER',
          'persist/PURGE',
          'persist/FLUSH',
          'persist/PAUSE'
        ],
        ignoredPaths: ['register', 'rehydrate'],
      },
    }),
});

export const persistor = persistStore(store);

// Usa useDispatch directamente aquí, ya que se necesita en los componentes
export const useAppDispatch = () => useDispatch();
export const useAppSelector = (selector) => useSelector(selector);
