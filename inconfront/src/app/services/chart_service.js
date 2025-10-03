'use server';

import { cookies } from "next/headers";

export const chartinc = async (id) => {
    try {
        const token = cookies().get('token')?.value;
        
        if (!token) {
            throw new Error('Token no encontrado en las cookies');
        }

        const treeResp = await fetch(`${process.env.FAENA_BACKEND_HOST}/EventosByProjectGrafico/${id}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

    //    if (!treeResp.ok) {
     //       throw new Error('Error fetching project details');
      //  }

        const response = await treeResp.json();
        return response;
    } catch (error) {
        console.error('Error fetching project details:', error);
        throw error;
    }
};



export const getproyectoYtareas = async (id) => {
    try {
        const token = cookies().get('token')?.value;
        
        if (!token) {
            throw new Error('Token no encontrado en las cookies');
        }

        const treeResp = await fetch(`${process.env.FAENA_BACKEND_HOST}/projects/${id}/details`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!treeResp.ok) {
            // Intentar leer el cuerpo de la respuesta (puede contener detalles del error)
            let errorMessage = `Error ${treeResp.status}: ${treeResp.statusText}`;
            
            try {
                const errorData = await treeResp.json();
                // Si el backend devuelve un campo "message" o "error", úsalo
                if (errorData.message) {
                    errorMessage = `${errorMessage} - ${errorData.message}`;
                } else if (errorData.error) {
                    errorMessage = `${errorMessage} - ${errorData.error}`;
                } else if (Array.isArray(errorData.errors)) {
                    errorMessage = `${errorMessage} - ${errorData.errors[0]}`;
                }
            } catch (e) {
                // Si no se puede parsear JSON, usamos el mensaje genérico
                console.warn('No se pudo leer el cuerpo del error:', e);
            }

            throw new Error(errorMessage);
        }

        const response = await treeResp.json();
        return response;
    } catch (error) {
        console.error('Error fetching project details:', error);
        throw error;
    }
}


export const gethisoticoPartidas= async (id) => {
    try {
        const token = cookies().get('token')?.value;
        
        if (!token) {
            throw new Error('Token no encontrado en las cookies');
        }

        const treeResp = await fetch(`${process.env.FAENA_BACKEND_HOST}/partida/historylist/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

      //  if (!treeResp.ok) {
       //     throw new Error('Error fetching project details');
       // }

        const response = await treeResp.json();
        return response;
    } catch (error) {
        console.error('Error fetching project details:', error);
        throw error;
    }}



    // Obtener configuraciones de gráficos para un usuario y proyecto específico
    export const getUserChartSettings = async (userId, projectId, chartId) => {
        try {
            const token = cookies().get('token')?.value;
            
            if (!token) {
                throw new Error('Token no encontrado en las cookies');
            }
    
            const response = await fetch(`${process.env.FAENA_BACKEND_HOST}/userChartSettings/${userId}/${projectId}/${chartId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
    
            if (!response.ok) {
                throw new Error(`Error al obtener configuraciones del gráfico: ${response.statusText}`);
            }
    
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error al obtener las configuraciones del gráfico:', error);
            throw error;
        }
    };



// Guardar o actualizar configuraciones de gráficos para un usuario y proyecto específico
export const saveUserChartSettings = async (settingsData) => {
    try {
        const token = cookies().get('token')?.value;
        
        if (!token) {
            throw new Error('Token no encontrado en las cookies');
        }

        const response = await fetch(`${process.env.FAENA_BACKEND_HOST}/saveChartSettings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(settingsData)
        });

        if (!response.ok) {
            // Agregar más información en el error, como el status y el mensaje del servidor
            const errorDetails = await response.json();
            throw new Error(`Error saving chart settings: ${response.status} - ${errorDetails.message}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error saving chart settings:', error);
        throw error;
    }
};
