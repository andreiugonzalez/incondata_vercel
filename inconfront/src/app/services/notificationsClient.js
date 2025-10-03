/**
 * notificationsClient.js
 * Cliente seguro para notificaciones (client-side) usando JWT desde cookies.
 * Lunixia style: seguro, modular y fácil de integrar.
 */

import Cookies from "js-cookie";

const BACKEND_URL = process.env.NEXT_PUBLIC_FAENA_BACKEND_HOST;

// Helper para obtener el token JWT de cookies (más seguro que localStorage)
function getToken() {
  // js-cookie maneja bien cookies httpOnly si están accesibles, si no, retorna undefined
  return Cookies.get("token");
}

// Obtener todas las notificaciones del usuario autenticado
export async function getAllNotificationsClient() {
  const token = getToken();
  if (!token)
    throw new Error("No autenticado: token no encontrado en cookies.");

  const res = await fetch(`${BACKEND_URL}/notification`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const responseData = await res.json();
  if (Array.isArray(responseData.data)) {
    return responseData.data;
  } else {
    throw new Error("Formato de respuesta inesperado");
  }
}

// Crear una nueva notificación (requiere id_proyecto)
export async function createNotificationClient(notificationData) {
  const token = getToken();
  if (!token)
    throw new Error("No autenticado: token no encontrado en cookies.");

  // Loguear el payload para debug
  console.log(
    "Payload notificación (createNotificationClient):",
    notificationData,
  );

  // Asegurar que el body es JSON plano y los headers son correctos
  const res = await fetch(`${BACKEND_URL}/notification`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(notificationData),
  });

  const text = await res.text();
  if (!res.ok) {
    let msg = "Error al crear la notificación";
    try {
      console.error("Respuesta cruda del backend al crear notificación:", text);
      const err = JSON.parse(text);
      msg = err.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return JSON.parse(text);
}

// Crear una notificación entre usuarios (sin id_proyecto)
export async function createUserNotificationClient(notificationData) {
  const token = getToken();
  if (!token)
    throw new Error("No autenticado: token no encontrado en cookies.");

  console.log(
    "Payload notificación usuario-usuario (createUserNotificationClient):",
    notificationData,
  );

  const res = await fetch(`${BACKEND_URL}/notification/user`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(notificationData),
  });

  const text = await res.text();
  if (!res.ok) {
    let msg = "Error al crear la notificación usuario-usuario";
    try {
      console.error(
        "Respuesta cruda del backend al crear notificación usuario-usuario:",
        text,
      );
      const err = JSON.parse(text);
      msg = err.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return JSON.parse(text);
}

// Marcar notificación como leída
export async function markNotificationAsReadClient(id, userId) {
  const token = getToken();
  if (!token)
    throw new Error("No autenticado: token no encontrado en cookies.");

  const res = await fetch(`${BACKEND_URL}/notification/${id}/read`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ userId }),
  });

  if (!res.ok) {
    throw new Error("Error al marcar la notificación como leída");
  }

  return res.json();
}

// Eliminar notificación
export async function deleteNotificationClient(id, userId) {
  const token = getToken();
  if (!token)
    throw new Error("No autenticado: token no encontrado en cookies.");

  const res = await fetch(`${BACKEND_URL}/notification/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ userId }),
  });

  if (!res.ok) {
    throw new Error("Error al eliminar la notificación");
  }

  return res.json();
}
