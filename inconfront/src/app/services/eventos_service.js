"use server";

import { cookies } from "next/headers";

export const createEvento = async (eventoData) => {
  try {
    const token = cookies().get("token").value;

    const response = await fetch(
      `${process.env.FAENA_BACKEND_HOST}/create-evento`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(eventoData),
      },
    );

    if (!response.ok) {
      throw new Error("Error al crear el evento");
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    throw error;
  }
};

export const getEvento = async (id) => {
  try {
    const token = cookies().get("token").value;

    const response = await fetch(
      `${process.env.FAENA_BACKEND_HOST}/evento/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Error al obtener el evento");
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    throw error;
  }
};

export const updateEvento = async (id, eventoData) => {
  try {
    const token = cookies().get("token").value;

    const response = await fetch(
      `${process.env.FAENA_BACKEND_HOST}/evento/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(eventoData),
      },
    );

    if (!response.ok) {
      throw new Error("Error al actualizar el evento");
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    throw error;
  }
};

export const deleteEvento = async (id) => {
  try {
    const token = cookies().get("token").value;

    const response = await fetch(
      `${process.env.FAENA_BACKEND_HOST}/evento/${id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Error al eliminar el evento");
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    throw error;
  }
};

export const getAllEventos = async () => {
  try {
    const token = cookies().get("token").value;

    const response = await fetch(`${process.env.FAENA_BACKEND_HOST}/eventos`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Error al obtener los eventos");
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    throw error;
  }
};

export const GetEventosByProject = async (id) => {
  try {
    const token = cookies().get("token").value;

    const response = await fetch(
      `${process.env.FAENA_BACKEND_HOST}/EventosByProject/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    throw error;
  }
};

export const Getaccidentesbyproject = async (id) => {
  try {
    const token = cookies().get("token").value;

    const response = await fetch(
      `${process.env.FAENA_BACKEND_HOST}/sinaccidentesbyproject/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const responseData = await response.json();
    console.log("Datos recibidos del backend:", responseData);
    return responseData;
  } catch (error) {
    console.error("Error fetching project details:", error);
    throw error;
  }
};

// src/app/services/eventos_service.js  // ahora se usa en el servicio archivo evento_load por client
export const uploadFiles = async (formData) => {
  const token = cookies().get("token").value;

  const response = await fetch(`${process.env.FAENA_BACKEND_HOST}/archivos`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Error al subir los archivos");
  }

  const responseData = await response.json();
  return responseData;
};
// src/app/services/eventos_service.js  // ahora se usa en el servicio archivo evento_load por client

export const getFilesByEvent = async (eventId) => {
  try {
    const token = cookies().get("token").value;

    const response = await fetch(
      `${process.env.FAENA_BACKEND_HOST}/eventos/${eventId}/archivos`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Error al obtener los archivos");
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    throw error;
  }
};

export const deleteFiles = async (files) => {
  try {
    const token = cookies().get("token").value;

    const response = await fetch(`${process.env.FAENA_BACKEND_HOST}/archivos`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ files }), // Añadir la lista de archivos al cuerpo de la solicitud
    });

    if (!response.ok) {
      throw new Error("Error al eliminar los archivos");
    }
  } catch (error) {
    throw error;
  }
};

export const getTipoCapacitaciones = async () => {
  try {
    const token = cookies().get("token").value;
    console.log("📚 Obteniendo capacitaciones - Token:", token ? "✅" : "❌");

    const response = await fetch(
      `${process.env.FAENA_BACKEND_HOST}/tipo_capacitacion`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    console.log("📚 Capacitaciones status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log("❌ Error capacitaciones:", errorText);
      throw new Error(`Error al obtener tipos de capacitación: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();
    console.log("📚 Capacitaciones data:", responseData);
    return responseData;
  } catch (error) {
    console.error("💥 Error en getTipoCapacitaciones:", error);
    throw error;
  }
};

export const getTipoAccidente = async () => {
  try {
    const token = cookies().get("token").value;
    console.log("⚠️ Obteniendo accidentes - Token:", token ? "✅" : "❌");

    const response = await fetch(
      `${process.env.FAENA_BACKEND_HOST}/tipo_accidente`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    console.log("⚠️ Accidentes status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log("❌ Error accidentes:", errorText);
      throw new Error(`Error al obtener tipos de accidente: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();
    console.log("⚠️ Accidentes data:", responseData);
    return responseData;
  } catch (error) {
    console.error("💥 Error en getTipoAccidente:", error);
    throw error;
  }
};

export const getTipoEventos = async () => {
  try {
    const token = cookies().get("token").value;
    console.log("🔑 Token encontrado:", token ? "✅" : "❌");
    console.log("🌐 URL completa:", `${process.env.FAENA_BACKEND_HOST}/tipo_evento`);

    const response = await fetch(
      `${process.env.FAENA_BACKEND_HOST}/tipo_evento`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    console.log("📡 Status de respuesta:", response.status);
    console.log("📡 Response OK:", response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.log("❌ Error response text:", errorText);
      throw new Error(`Error al obtener tipos de evento: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();
    console.log("📦 Data recibida:", responseData);
    return responseData;
  } catch (error) {
    console.error("💥 Error en getTipoEventos:", error);
    throw error;
  }
};

// notificaciones service

export const createNotification = async (notificationData) => {
  try {
    const token = cookies().get("token").value;

    const response = await fetch(
      `${process.env.FAENA_BACKEND_HOST}/notification`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(notificationData),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error response:", errorData);
      throw new Error(`Error al crear la notificación: ${response.statusText}`);
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    throw error;
  }
};

export const getNotification = async (id) => {
  try {
    const token = cookies().get("token").value;

    const response = await fetch(
      `${process.env.FAENA_BACKEND_HOST}/notification/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Error al obtener la notificación");
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    throw error;
  }
};

export const updateNotification = async (id, notificationData) => {
  try {
    const token = cookies().get("token").value;

    const response = await fetch(
      `${process.env.FAENA_BACKEND_HOST}/notification/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(notificationData),
      },
    );

    if (!response.ok) {
      throw new Error("Error al actualizar la notificación");
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    throw error;
  }
};

// src/services/eventos_service.js

export const getAllNotifications = async () => {
  try {
    const token = cookies().get("token").value;
    if (!token)
      throw new Error("No hay token en las cookies, usuario no autenticado.");
    const response = await fetch(
      `${process.env.FAENA_BACKEND_HOST}/notification`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    // if (!response.ok) {
    //   throw new Error("Error al obtener las notificaciones");
    // }

    const responseData = await response.json();
    if (Array.isArray(responseData.data)) {
      return responseData.data; // Extraer notificaciones de la clave `data`
    } else {
      throw new Error("Formato de respuesta inesperado");
    }
  } catch (error) {
    throw error;
  }
};

export const getNotificationsByProject = async (id) => {
  try {
    const token = cookies().get("token").value;
    if (!token)
      throw new Error("No hay token en las cookies, usuario no autenticado.");
    const response = await fetch(
      `${process.env.FAENA_BACKEND_HOST}/notificationbyproject/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    // if (!response.ok) {
    //     throw new Error('Error al obtener las notificaciones');
    // }

    const responseData = await response.json();
    if (Array.isArray(responseData.data)) {
      return responseData.data; // Extraer notificaciones de la clave `data`
    } else {
      throw new Error("Formato de respuesta inesperado");
    }
  } catch (error) {
    throw error;
  }
};

export const markAsRead = async (id, userId) => {
  try {
    const token = cookies().get("token").value;

    const response = await fetch(
      `${process.env.FAENA_BACKEND_HOST}/notification/${id}/read`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      },
    );

    if (!response.ok) {
      throw new Error("Error al marcar la notificación como leída");
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    throw error;
  }
};

export const deleteNotification = async (id, userId) => {
  try {
    const token = cookies().get("token").value;

    const response = await fetch(
      `${process.env.FAENA_BACKEND_HOST}/notification/${id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      },
    );

    if (!response.ok) {
      throw new Error("Error al eliminar la notificación");
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    throw error;
  }
};

export const createNotaTrabajo = async (eventoId, formData) => {
  try {
    const token = cookies().get('token').value;

    const headers = {
      'Authorization': `Bearer ${token}`,
      // No agregar Content-Type para FormData, el navegador lo maneja automáticamente
    };

    const response = await fetch(`${process.env.FAENA_BACKEND_HOST}/eventonotas/${eventoId}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    // Verificar si la respuesta es JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const responseData = await response.json();
      return responseData;
    } else {
      const responseText = await response.text();
      console.error('Response is not JSON:', responseText);
      throw new Error('Server returned non-JSON response');
    }
  } catch (error) {
    console.error('Error in createNotaTrabajo:', error);
    throw error;
  }
};

export const getNotasByEventoId = async (eventoId) => {
  try {
    const token = cookies().get('token').value;

    const response = await fetch(`${process.env.FAENA_BACKEND_HOST}/notasbysevento/${eventoId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { data: [] }; // Retornar array vacío si no hay notas
      }
      throw new Error('Error al obtener las notas del evento');
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    if (error.message.includes('404')) {
      return { data: [] }; // Retornar array vacío si no hay notas
    }
    throw error;
  }
};

export const deleteNotaTrabajo = async (notaId) => {
  try {
    const token = cookies().get('token').value;

    const response = await fetch(`${process.env.FAENA_BACKEND_HOST}/notastrabajo/${notaId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al eliminar la nota de trabajo');
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    throw error;
  }
};


