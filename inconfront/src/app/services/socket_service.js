'use server';

import { cookies } from "next/headers";

// src/services/socket_service.js


export const getConnectedUsersAndProjects = async () => {
    try {
        const response = await fetch(`${process.env.FAENA_BACKEND_HOST}/connected-data`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Error al obtener los datos de usuarios y proyectos conectados');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        throw error;
    }
};




export const getUsersByIds = async (ids) => {
  try {
    const token = cookies().get('token').value;
    const response = await fetch(`${process.env.FAENA_BACKEND_HOST}/users/by-ids`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ ids }), // Pasa la lista de IDs en el cuerpo de la solicitud
    });

    const data = await response.json();
    return data.data; // Asegúrate de acceder al array de usuarios en la respuesta
  } catch (error) {
    console.error('Error fetching users by IDs:', error);
    throw new Error('Error fetching users by IDs');
  }
};
export const getConnectedUsersByProject = async (projectId) => {
    try {
        const response = await fetch(`${process.env.FAENA_BACKEND_HOST}/connected-users/${projectId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Error al obtener los usuarios conectados por proyecto');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        throw error;
    }
};
