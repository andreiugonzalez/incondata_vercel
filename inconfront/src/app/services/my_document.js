'use server';

import { cookies } from "next/headers";

export const getFolders = async (path = '') => {
    const token = cookies().get('token')?.value;
    const endpoint = path ? `${process.env.FAENA_BACKEND_HOST}/folders?path=${encodeURIComponent(path)}` : `${process.env.FAENA_BACKEND_HOST}/folders`;

    try {
        const foldersResp = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const response = await foldersResp.json();

      //  console.log(response);
        return response.data;
    } catch (error) {
        throw error;
    }
};


export const searchFoldersAndDocuments = async (searchTerm) => {
    const token = cookies().get('token')?.value;

    try {
        const searchResp = await fetch(`${process.env.FAENA_BACKEND_HOST}/folders_doc_Buscador?search=${encodeURIComponent(searchTerm)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const response = await searchResp.json();

        return response;
    } catch (error) {
        console.error('Error buscando carpetas y documentos:', error);
        throw error;
    }
};




export const getFolderWithChildrenById = async (id) => {
    const token = cookies().get('token')?.value;

    try {
        const folderResp = await fetch(`${process.env.FAENA_BACKEND_HOST}/getFolderwithchildrens/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });


        const response = await folderResp.json();

        // console.log(response);
        return response;
    } catch (error) {
        throw error;
    }
};



export const getTrashedFolders = async (id) => {
    const token = cookies().get('token')?.value;

    try {
        const folderResp = await fetch(`${process.env.FAENA_BACKEND_HOST}/getFoldersTrash/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const response = await folderResp.json();

        // console.log(response);
        return response;
    } catch (error) {
        throw error;
    }
};


export const getFoldersByPath = async (userId, path) => {
    const token = cookies().get('token')?.value;

    try {
        // Hacer una solicitud GET al endpoint /user/:userId/folders-by-path
        const folderResp = await fetch(`${process.env.FAENA_BACKEND_HOST}/userFolder/${userId}?path=${encodeURIComponent(path)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        // Parsear la respuesta como JSON
        const response = await folderResp.json();

        if (!folderResp.ok) {
            // Manejar errores de la respuesta
            throw new Error(response.message || 'Error al obtener las carpetas');
        }

        // Retornar la respuesta que contiene las carpetas
        return response.data;
    } catch (error) {
        console.error('Error en getFoldersByPath:', error);
        throw error;
    }
};




export const getFolderHierarchy = async (folderId) => {
    const token = cookies().get('token')?.value;

    try {
        const response = await fetch(`${process.env.FAENA_BACKEND_HOST}/folders/${folderId}/hierarchy`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Error al obtener la jerarquía de carpetas');
        }

        const data = await response.json();
        return data; // Retorna la respuesta JSON que contiene el breadcrumb y currentFolder
    } catch (error) {
        console.error('Error en getFolderHierarchy:', error);
        throw error;
    }
};



export const getFolderById = async (id) => {
    const token = cookies().get('token')?.value;

    try {
        const folderResp = await fetch(`${process.env.FAENA_BACKEND_HOST}/folders/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const response = await folderResp.json();
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getRootFolderByUserId = async (userId) => {
    const token = cookies().get('token')?.value;

    try {
        const folderResp = await fetch(`${process.env.FAENA_BACKEND_HOST}/rootFolder/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const response = await folderResp.json();
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const postFolders = async (folderData) => {
    const token = cookies().get('token')?.value;

    try {
        const foldersResp = await fetch(`${process.env.FAENA_BACKEND_HOST}/folders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(folderData),
        });

        const response = await foldersResp.json();
        return response;
    } catch (error) {
        throw error;
    }
};

export const updateFolder = async (id, updatedData) => {
    const token = cookies().get('token')?.value;

    try {
        const folderResp = await fetch(`${process.env.FAENA_BACKEND_HOST}/folders/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(updatedData),
        });

        const response = await folderResp.json();
        return response;
    } catch (error) {
        throw error;
    }
};

export const deleteFolder = async (id) => {
    const token = cookies().get('token')?.value;

    try {
        const folderResp = await fetch(`${process.env.FAENA_BACKEND_HOST}/folders/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const response = await folderResp.json();
        return response;
    } catch (error) {
        throw error;
    }
};


export const getFolderRaizUser = async (id, path) => {
    const token = cookies().get('token')?.value;

    try {
        const safePath = encodeURIComponent(path);
        const folderResp = await fetch(`${process.env.FAENA_BACKEND_HOST}/folders-raiz/${id}/${safePath}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        });
        if (!folderResp.ok) {
            const errorText = await folderResp.text();
            if (folderResp.status === 404) {
                // No existe la carpeta raíz del usuario, devolvemos null para que el flujo la cree
                return null;
            }
            throw new Error(`Error en la respuesta: ${folderResp.status} - ${errorText}`);
        }

        const contentType = folderResp.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const response = await folderResp.json();
            return response.data ?? response;
        } else {
            return null;
        }
    } catch (error) {
        throw error;
    }
};





export const getFolderRaiz = async (folderName, parentId) => {
    const token = cookies().get('token')?.value;

    // Si parentId es undefined o null, lo convertimos a 'null' para la URL
    const idParam = parentId != null ? parentId : 'null';

    try {
        const folderResp = await fetch(`${process.env.FAENA_BACKEND_HOST}/folders-root-global/${folderName}/${idParam}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        if (!folderResp.ok) {
            const errorText = await folderResp.text();
            if (folderResp.status === 404) return null;
            throw new Error(`Error en la respuesta: ${folderResp.status} - ${errorText}`);
        }

        const contentType = folderResp.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const response = await folderResp.json();
            return response.data ?? response;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error al obtener la carpeta raíz:', error);
        throw error;
    }
};


//actualizar URI 

export const updateUriFolder = async (id, uriFolder) => {
    const token = cookies().get('token')?.value;


    try {
        const response = await fetch(`${process.env.FAENA_BACKEND_HOST}/uri-folder/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ uriFolder }),
        });

        if (!response.ok) {
            // Maneja errores de respuesta HTTP
            const errorResponse = await response.json();
            throw new Error(`Error en la solicitud: ${response.status} - ${errorResponse.message || 'Error desconocido'}`);
        }

        const responseData = await response.json();

        // Retorna `responseData.data` o la respuesta completa si `data` no existe
        return responseData.data || responseData;
    } catch (error) {
        console.error('Error al actualizar la carpeta URI:', error.message || error);
        throw error;
    }
};




export const uploadFile = async (formData) => {
    const token = cookies().get('token')?.value;

    if (!token) {
        throw new Error("Token no encontrado. Por favor, inicia sesión.");
    }

    try {
        const uploadResp = await fetch(`${process.env.FAENA_BACKEND_HOST}/upload-file-folder`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        if (!uploadResp.ok) {
            // Intentamos extraer un mensaje de error si está disponible
            let errorMessage = 'Error desconocido';
            try {
                const errorData = await uploadResp.json();
                errorMessage = errorData.message || errorMessage;
            } catch (jsonError) {
                console.error('Error al convertir la respuesta a JSON:', jsonError);
            }

            throw new Error(`Error en la solicitud: ${uploadResp.status} - ${errorMessage}`);
        }

        const response = await uploadResp.json();
        return response;

    } catch (error) {
        console.error('Error al subir el archivo:', error.message || error);
        throw error;
    }
};



export const updateDocumentFilename = async (id, updatedData) => {
    const token = cookies().get('token')?.value;

    try {
        const response = await fetch(`${process.env.FAENA_BACKEND_HOST}/documents/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(updatedData),
        });

        return await response.json();
    } catch (error) {
        throw error;
    }
};





export const getTotalFileSize = async (userUriFolder) => {
    const token = cookies().get('token')?.value;

    try {
        const backendHost = (process.env.NEXT_PUBLIC_FAENA_BACKEND_HOST || process.env.FAENA_BACKEND_HOST || '').replace(/\/$/, "");
        // Codificar el valor para evitar que las barras se interpreten como segmentos de ruta
        const encodedUriFolder = encodeURIComponent(userUriFolder);
        // Construimos la URL con el path codificado como parte de la ruta
        const response = await fetch(`${backendHost}/total-file-size/${encodedUriFolder}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        });

        // console.log(response);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error en la respuesta: ${response.status} - ${errorText}`);
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const responseData = await response.json();
            return responseData.totalSizedata;  // Aquí se extrae el valor de totalSize
        } else {
            throw new Error('Respuesta no es JSON');
        }
    } catch (error) {
        console.error('Error al obtener el tamaño total de los archivos:', error);
        throw error;
    }
};


export const toggleFavoriteFolder = async (folderId,userId) => {
    const token = cookies().get('token')?.value;



    try {
        const response = await fetch(`${process.env.FAENA_BACKEND_HOST}/folders/toggle-favorite`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ folderId ,userId}),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al agregar/quitar favorito.');
        }

        return await response.json();
    } catch (error) {
        console.error('Error al agregar/quitar favorito:', error.message || error);
        throw error;
    }
};



export const toggleFavoriteDocument = async (documentId, userId) => {
    const token = cookies().get('token')?.value;

    try {
        const response = await fetch(`${process.env.FAENA_BACKEND_HOST}/documents/toggle-favorite`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ documentId, userId }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al agregar/quitar favorito.');
        }

        return await response.json();
    } catch (error) {
        console.error('Error al agregar/quitar favorito:', error.message || error);
        throw error;
    }
};



export const getFavoriteFolders = async (userId) => {
    const token = cookies().get('token')?.value;

    try {
        const response = await fetch(`${process.env.FAENA_BACKEND_HOST}/folders/favorites/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al obtener carpetas favoritas.');
        }

        return await response.json();
    } catch (error) {
        console.error('Error al obtener carpetas favoritas:', error.message || error);
        throw error;
    }
};



export const uploadDocumentPartida = async (formData) => {
    const token = cookies().get('token')?.value;

    if (!token) {
        throw new Error("Token no encontrado. Por favor, inicia sesión.");
    }

    try {
        const uploadResp = await fetch(`${process.env.FAENA_BACKEND_HOST}/document/partida/create`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        if (!uploadResp.ok) {
            let errorMessage = 'Error desconocido';
            try {
                const errorData = await uploadResp.json();
                errorMessage = errorData.message || errorMessage;
            } catch (jsonError) {
                console.error('Error al convertir la respuesta a JSON:', jsonError);
            }

            throw new Error(`Error en la solicitud: ${uploadResp.status} - ${errorMessage}`);
        }

        // Aquí solo intentamos leer el cuerpo una vez, después de confirmar que la respuesta es correcta
        const response = await uploadResp.json();
        return response;

    } catch (error) {
        console.error('Error al subir el documento de la partida:', error.message || error);
        throw error;
    }
};



export const getDocumentsByEntityId = async (id, entityType) => {
    const token = cookies().get('token')?.value;

    if (!token) {
        throw new Error("Token no encontrado. Por favor, inicia sesión.");
    }

    try {
        const response = await fetch(`${process.env.FAENA_BACKEND_HOST}/document/partidas_adjuntos/${id}/${entityType}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            let errorMessage = 'Error desconocido';
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (jsonError) {
                console.error('Error al convertir la respuesta a JSON:', jsonError);
            }

            throw new Error(`Error en la solicitud: ${response.status} - ${errorMessage}`);
        }

        const responseData = await response.json();
        return responseData;

    } catch (error) {
        console.error('Error al obtener los documentos:', error.message || error);
        throw error;
    }
};





export const markDocumentAsDeleted = async (documentId) => {
    const token = cookies().get('token')?.value;

    if (!token) {
        throw new Error("Token no encontrado. Por favor, inicia sesión.");
    }

    try {
        const response = await fetch(`${process.env.FAENA_BACKEND_HOST}/document/permanently-delete/${documentId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ permanentlyDeleted: true }),
        });

        if (!response.ok) {
            let errorMessage = 'Error desconocido';
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (jsonError) {
                console.error('Error al convertir la respuesta a JSON:', jsonError);
            }

            throw new Error(`Error en la solicitud: ${response.status} - ${errorMessage}`);
        }

        const responseData = await response.json();
        return responseData;

    } catch (error) {
        console.error('Error al marcar el documento como eliminado:', error.message || error);
        throw error;
    }
};


export const toggleTrashFolder = async (folderId, isTrashed) => {
    const token = cookies().get('token')?.value;

    try {
        const response = await fetch(`${process.env.FAENA_BACKEND_HOST}/folderstrash/${folderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                trashed: !isTrashed, // Alterna entre `true` y `false` según el estado actual
                trashedAt: !isTrashed ? new Date() : null, // Si se restaura, trashedAt es `null`
            }),
        });

   

        return await response.json();
    } catch (error) {
        console.error('Error al mover/restaurar carpeta:', error.message || error);
        throw error;
    }
};



export const toggleTrashDocument = async (documentId, isTrashed) => {
    const token = cookies().get('token')?.value;

    try {
        const response = await fetch(`${process.env.FAENA_BACKEND_HOST}/foldersdocumentstrash/${documentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                trashed: !isTrashed, // Alterna entre `true` y `false` según el estado actual
                trashedAt: !isTrashed ? new Date() : null, // Si se restaura, trashedAt es `null`
            }),
        });

        return await response.json();
    } catch (error) {
        console.error('Error al mover/restaurar documento:', error.message || error);
        throw error;
    }
};

// Eliminar carpeta permanentemente
export const deleteFolderPermanently = async (folderId) => {
    const token = cookies().get('token')?.value;

    try {
        const response = await fetch(`${process.env.FAENA_BACKEND_HOST}/folders/permanently/${folderId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al eliminar carpeta permanentemente');
        }

        return await response.json();
    } catch (error) {
        console.error('Error al eliminar carpeta permanentemente:', error.message || error);
        throw error;
    }
};

// Eliminar documento permanentemente
export const deleteDocumentPermanently = async (documentId) => {
    const token = cookies().get('token')?.value;

    try {
        const response = await fetch(`${process.env.FAENA_BACKEND_HOST}/documents/permanently/${documentId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al eliminar documento permanentemente');
        }

        return await response.json();
    } catch (error) {
        console.error('Error al eliminar documento permanentemente:', error.message || error);
        throw error;
    }
};

// Vaciar papelera
export const emptyTrash = async (userId) => {
    const token = cookies().get('token')?.value;

    try {
        const response = await fetch(`${process.env.FAENA_BACKEND_HOST}/trash/empty`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                userId: userId,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al vaciar papelera');
        }

        return await response.json();
    } catch (error) {
        console.error('Error al vaciar papelera:', error.message || error);
        throw error;
    }
};

