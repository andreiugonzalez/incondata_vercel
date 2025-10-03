import { createSlice } from "@reduxjs/toolkit";
import Cookies from 'js-cookie'; // Importa js-cookie

// Definición del slice del usuario
const userSlice = createSlice({
    name: "user",
    initialState: {
        user: '', // Estado inicial del usuario
        isReady: false, // Estado inicial de isReady
        link: '', // Estado inicial para el enlace
        role: '', // Estado inicial para el rol
        token: '', // Estado inicial para el token
        isLoggedIn: false, // Estado inicial para la conexión
        urifolder: '' // Estado inicial para urifolder
    },
    reducers: {
        setUser: (state, action) => {
            console.log('Action setUser:', action.payload);
            state.user = action.payload; // Establece el usuario con los datos proporcionados
            state.isReady = true; // Marca el estado como listo
            state.isLoggedIn = true; // Marca el estado de conexión como verdadero
            console.log('Updated state after setUser:', state);
        },
        setLink: (state, action) => {
            console.log('Action setLink:', action.payload);
            state.link = action.payload; // Establece el enlace con los datos proporcionados
            console.log('Updated state after setLink:', state);
        },
        setRole: (state, action) => {
            console.log('Action setRole:', action.payload);
            state.role = action.payload; // Establece el rol con los datos proporcionados
            console.log('Updated state after setRole:', state);
        },
        setToken: (state, action) => {
            console.log('Action setToken:', action.payload);
            state.token = action.payload; // Establece el token con los datos proporcionados
            console.log('Updated state after setToken:', state);
        },
        setUriFolder: (state, action) => {
            console.log('Action setUriFolder:', action.payload);
            state.urifolder = action.payload; // Establece el urifolder con los datos proporcionados
            console.log('Updated state after setUriFolder:', state);
        },
        logout: (state) => {
            console.log('Action logout');
            state.user = ''; // Resetea el estado del usuario
            state.isReady = false; // Marca el estado como no listo
            state.link = ''; // Resetea el estado del enlace
            state.role = ''; // Resetea el estado del rol
            state.token = ''; // Resetea el estado del token
            state.urifolder = ''; // Resetea el estado de urifolder
            state.isLoggedIn = false; // Marca el estado de conexión como falso
            Cookies.remove('token'); // Elimina la cookie del token
            console.log('Updated state after logout:', state);
        }
    },
});

// Exporta las acciones generadas por el slice
export const { setUser, setLink, setRole, setToken, setUriFolder, logout } = userSlice.actions;

// Exporta el reductor del slice del usuario
export default userSlice.reducer;
