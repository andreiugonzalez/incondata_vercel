'use client';
//index.js

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import { SocketProvider } from '@/app/services/SocketContext';  // Asegúrate de importar el SocketProvider correctamente

export const Providers = ({ children }) => {
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <SocketProvider>  {/* Envuelve tus hijos con el SocketProvider */}
                    {children}
                </SocketProvider>
            </PersistGate>
        </Provider>
    );
};
