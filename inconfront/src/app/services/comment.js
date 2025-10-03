"use server";

import { cookies } from "next/headers";
import axios from "axios";

// Inserta un comentario de partida, soportando archivos adjuntos (FormData)
export const insertCommentPartida = async (formData) => {
  const token = cookies().get("token").value;

  const resp = await fetch(
    `${process.env.FAENA_BACKEND_HOST}/comentario/partida`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    },
  );

  if (!resp.ok) {
    let errorMsg = `Error ${resp.status}: ${resp.statusText}`;
    try {
      const errorJson = await resp.json();
      errorMsg = errorJson.message || errorMsg;
    } catch {
      // Si no es JSON, deja el mensaje por defecto
    }
    throw new Error(errorMsg);
  }

  return await resp.json();
};
// Inserta un comentario de subpartida, soportando archivos adjuntos (FormData)
export const insertCommentSubpartida = async (formData) => {
  const token = cookies().get("token").value;

  const commentSubpartida = await fetch(
    `${process.env.FAENA_BACKEND_HOST}/comentario/subpartida`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    },
  );

  const response = await commentSubpartida.json();
  return response;
};
// Inserta un comentario de tarea, soportando archivos adjuntos (FormData)
export const insertCommentTarea = async (formData) => {
  const token = cookies().get("token").value;

  const commentTarea = await fetch(
    `${process.env.FAENA_BACKEND_HOST}/comentario/tarea`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    },
  );

  const response = await commentTarea.json();
  return response;
};
// Inserta un comentario de subtarea, soportando archivos adjuntos (FormData)
export const insertCommentSubtarea = async (formData) => {
  const token = cookies().get("token").value;

  const commentSubtarea = await fetch(
    `${process.env.FAENA_BACKEND_HOST}/comentario/subtarea`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    },
  );

  const response = await commentSubtarea.json();
  return response;
};

// Obtiene los comentarios de partida por ID
export const getpartidacomment = async (id) => {
  const token = cookies().get("token").value;

  const projectsResp = await fetch(
    `${process.env.FAENA_BACKEND_HOST}/comentarios/partida/${id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  const response = await projectsResp.json();

  return response;
};

// Elimina un comentario por ID
export const deleteComment = async (id, tipo) => {
  // <--- AÑADIDO PARÁMETRO 'tipo'
  if (!id || !tipo) {
    // Validación básica de parámetros
    console.error("deleteComment service: 'id' y 'tipo' son requeridos.");
    // Podrías lanzar un error aquí para que el componente lo maneje
    throw new Error(
      "'id' y 'tipo' son requeridos para eliminar el comentario.",
    );
  }

  const token = cookies().get("token")?.value; // Usar optional chaining por si la cookie no existe
  if (!token) {
    console.error("deleteComment service: Token no encontrado.");
    throw new Error("Usuario no autenticado."); // O un error más específico
  }

  // Construir la URL con el query parameter 'tipo'
  const url = new URL(`${process.env.FAENA_BACKEND_HOST}/comments/${id}`);
  url.searchParams.append("tipo", tipo);

  try {
    const resp = await fetch(url.toString(), {
      // Usar url.toString()
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        // "Content-Type": "application/json", // No es necesario para DELETE sin body
      },
    });

    if (!resp.ok) {
      let errorData = { message: `Error ${resp.status}: ${resp.statusText}` }; // Mensaje por defecto
      try {
        // Intenta parsear el cuerpo del error del backend, que podría tener un formato JSON como { message: "..." }
        const backendError = await resp.json();
        if (backendError && backendError.message) {
          errorData.message = backendError.message;
        } else if (backendError && backendError.error) {
          // Otra forma común de devolver errores
          errorData.message = backendError.error;
        }
      } catch (e) {
        // Si el cuerpo del error no es JSON o está vacío, usa el statusText.
        console.warn(
          "deleteComment service: No se pudo parsear el cuerpo del error como JSON.",
          e,
        );
      }
      console.error(
        `Error en servicio deleteComment (${resp.status}):`,
        errorData.message,
      );
      throw new Error(errorData.message); // Lanza un error con el mensaje del backend o el statusText
    }

    // Si la respuesta es OK (ej. 200 o 204), la eliminación (soft delete) fue exitosa.
    // Para DELETE, a menudo no hay un cuerpo de respuesta significativo.
    return { success: true, message: "Comentario eliminado correctamente." };
  } catch (error) {
    // Si el error ya fue lanzado (ej. por !resp.ok o por fetch fallando),
    // o si es un error de validación de parámetros o token.
    // console.error("Excepción en servicio deleteComment:", error.message); // Ya logueado arriba si es de !resp.ok
    throw error; // Re-lanza el error para que el componente que llama lo maneje.
  }
};

// Actualiza un comentario por ID
export const updateComment = async (id, data, tipo) => {
  // <--- AÑADIDO PARÁMETRO 'tipo'
  if (!id || !tipo) {
    console.error("updateComment service: 'id' y 'tipo' son requeridos.");
    throw new Error(
      "'id' y 'tipo' son requeridos para actualizar el comentario.",
    );
  }
  // ... (lógica similar para token y URL con query param 'tipo')
  const token = cookies().get("token")?.value;
  if (!token) {
    console.error("updateComment service: Token no encontrado.");
    throw new Error("Usuario no autenticado.");
  }

  const url = new URL(`${process.env.FAENA_BACKEND_HOST}/comments/${id}`);
  url.searchParams.append("tipo", tipo);

  console.log(
    `EDITAR COMENTARIO (servicio) - URL: ${url.toString()}, ID: ${id}, Tipo: ${tipo}, Data:`,
    data,
  );

  try {
    const resp = await fetch(url.toString(), {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data), // 'data' solo debe contener campos de contenido (detalle, fileUrl, etc.)
    });

    if (!resp.ok) {
      let errorData = { message: `Error ${resp.status}: ${resp.statusText}` };
      try {
        const backendError = await resp.json();
        if (backendError && backendError.message)
          errorData.message = backendError.message;
      } catch (e) {
        /* ignorar error de parseo */
      }
      console.error(
        `Error en servicio updateComment (${resp.status}):`,
        errorData.message,
      );
      throw new Error(errorData.message);
    }

    return await resp.json(); // Asume que el backend devuelve el comentario actualizado
  } catch (error) {
    throw error;
  }
};

// Obtiene los comentarios de subpartida por ID
export const getSubpartidaComment = async (id) => {
  const token = cookies().get("token").value;

  try {
    const response = await axios.get(`${process.env.FAENA_BACKEND_HOST}/comentarios/subpartida/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener comentarios de subpartida:", error);
    throw error;
  }
};

// Obtiene los comentarios de tarea por ID
export const getTareaComment = async (id) => {
  const token = cookies().get("token").value;

  const projectsResp = await fetch(
    `${process.env.FAENA_BACKEND_HOST}/comentarios/tarea/${id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  const response = await projectsResp.json();
  return response;
};

// Obtiene los comentarios de subtarea por ID
export const getSubtareaComment = async (id) => {
  const token = cookies().get("token").value;

  const projectsResp = await fetch(
    `${process.env.FAENA_BACKEND_HOST}/comentarios/subtarea/${id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  //creando funciones de prueba eliminar y editar

  const response = await projectsResp.json();
  return response;
};
