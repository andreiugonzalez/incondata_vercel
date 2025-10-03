'use server';

import { cookies } from "next/headers";

export const getEstadotarea = async () => {

    const token = cookies().get('token').value;

    const estadoTarea = await fetch(`${process.env.FAENA_BACKEND_HOST}/estadotarea`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    })

    const response = await estadoTarea.json();
    return response;
}

export const getPrioridad = async () => {

    const token = cookies().get('token').value;

    const prioridad = await fetch(`${process.env.FAENA_BACKEND_HOST}/prioridadtarea`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    })

    const response = await prioridad.json();
    return response;
}

export const getlistUser = async () => {

    const token = cookies().get('token').value;

    const prioridad = await fetch(`${process.env.FAENA_BACKEND_HOST}/userlist`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    })

    const response = await prioridad.json();
    return response;
}

export const postpartida = async (partidaInsert) => {

    const token = cookies().get('token').value;

    const createpartidahistorico = await fetch(`${process.env.FAENA_BACKEND_HOST}/partida/history`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(partidaInsert),
    })

    const response = await createpartidahistorico.json();
    return response;
}


// export const postDatosPartidas = async (partidaInsert, projectId) => {

//     const token = cookies().get('token').value;

//     const createpartidahistorico = await fetch(`${process.env.FAENA_BACKEND_HOST}/partida/history_todas`, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${token}`,
//         },
//         body: JSON.stringify(partidaInsert, projectId),
//     })

//     const response = await createpartidahistorico.json();
//     return response;
// }

export const postDatosPartidas = async (partidaInsert, projectId) => {
    const token = cookies().get('token').value;

    const createpartidahistorico = await fetch(`${process.env.FAENA_BACKEND_HOST}/partida/history_todas`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ newPartida: partidaInsert, projectId }),
    });

    const response = await createpartidahistorico.json();
    return response;
}

export const getTareasupdate = async () => {

    const token = cookies().get('token').value;

    const tareas = await fetch(`${process.env.FAENA_BACKEND_HOST}/tasks`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    })

    const response = await tareas.json();
    return response;
}

/**
 * Elimina un elemento del proyecto (partida, subpartida, tarea o subtarea)
 * @param {string} type - El tipo de elemento a eliminar: 'partida', 'subpartida', 'tarea' o 'subtarea'
 * @param {number|string} id - El ID del elemento a eliminar
 * @returns {Promise<Object>} - El resultado de la operación
 */
export const deleteProjectItem = async (type, id) => {
    try {
        // Validar que tenemos los parámetros necesarios
        if (!type || !id) {
            console.error(`Error: Parámetros incompletos - tipo=${type}, id=${id}`);
            throw new Error(`Parámetros incompletos para eliminar: tipo=${type}, id=${id}`);
        }
        
        // Asegurarse de que el tipo sea uno de los valores permitidos
        const validTypes = ['partida', 'subpartida', 'tarea', 'subtarea'];
        if (!validTypes.includes(type)) {
            console.error(`Error: Tipo no válido - ${type}`);
            throw new Error(`Tipo no válido: ${type}. Debe ser uno de: ${validTypes.join(', ')}`);
        }
        
        // Convertir ID a número si es posible
        const numericId = Number(id);
        if (isNaN(numericId)) {
            console.warn(`Advertencia: ID no numérico - ${id}`);
        }
        
        console.log(`Iniciando eliminación: ${type} con ID ${id} (${typeof id})`);
        
        const token = cookies().get('token')?.value;
        if (!token) {
            throw new Error('No se encontró el token de autenticación');
        }
        
        // Construir la URL para la API y verificar que es correcta
        const url = `${process.env.FAENA_BACKEND_HOST}/delete/${type}/${id}`;
        console.log(`URL de eliminación: ${url}`);
        
        // Hacer la solicitud DELETE con los headers correctos
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        });

        console.log(`Respuesta recibida: status=${response.status}`);
        
        // Manejar errores HTTP
        if (!response.ok) {
            let errorMessage = `Error HTTP: ${response.status} ${response.statusText}`;
            try {
                const errorData = await response.json();
                console.error("Datos del error:", errorData);
                if (errorData.message) {
                    errorMessage = errorData.message;
                }
            } catch (e) {
                console.error("Error al parsear respuesta de error:", e);
            }
            throw new Error(errorMessage);
        }

        // Parsear respuesta exitosa
        let data;
        try {
            data = await response.json();
            console.log("Datos de respuesta:", data);
        } catch (e) {
            console.error("Error al parsear respuesta JSON:", e);
            // Si no hay JSON en la respuesta pero el status es OK, asumimos éxito
            data = { 
                success: true, 
                message: `${type} eliminado correctamente`,
                status: response.status
            };
        }
        
        if (data.alreadyDeleted) {
            console.log(`Elemento de tipo ${type} con ID ${id} ya eliminado previamente`);
        } else {
            console.log(`Elemento de tipo ${type} con ID ${id} eliminado correctamente`);
        }
        
        return data;
    } catch (error) {
        console.error(`Error en deleteProjectItem:`, error);
        throw error;
    }
};