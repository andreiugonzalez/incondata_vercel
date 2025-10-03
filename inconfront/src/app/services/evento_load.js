"use client"
import axios from 'axios';
import Cookies from 'js-cookie';

// src/app/services/eventos_service.js
export const uploadFiles = async (formData, onUploadProgress) => {
    const token = Cookies.get('token'); // Usa js-cookie para obtener la cookie en el cliente

    const response = await axios.post(`${process.env.FAENA_BACKEND_HOST}/archivos`, formData, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        onUploadProgress,
    });

    if (response.status !== 200) {
        throw new Error('Error al subir los archivos');
    }

    return response.data;
};
