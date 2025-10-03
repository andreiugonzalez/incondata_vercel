const BACKEND_URL = process.env.NEXT_PUBLIC_FAENA_BACKEND_HOST;

// Mensajes internos
export async function fetchInbox(userId) {
  const res = await fetch(`${BACKEND_URL}/api/messages/inbox/${userId}`);
  return res.json();
}

export async function fetchSent(userId) {
  const res = await fetch(`${BACKEND_URL}/api/messages/sent/${userId}`);
  return res.json();
}

export async function fetchMessageById(messageId) {
  const res = await fetch(`${BACKEND_URL}/api/messages/${messageId}`);
  return res.json();
}

export async function sendMessage(data, isMultipart = false) {
  const url = `${BACKEND_URL}/api/messages`;
  let options = { method: "POST" };
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  if (isMultipart) {
    options.body = data;
    options.headers = headers;
  } else {
    options.headers = { ...headers, "Content-Type": "application/json" };
    options.body = JSON.stringify(data);
  }
  const res = await fetch(url, options);
  // Manejo de error HTTP
  if (!res.ok) {
    let errorMsg = "Error al enviar el mensaje";
    try {
      const errData = await res.json();
      errorMsg = errData.message || errorMsg;
    } catch (e) {}
    throw new Error(errorMsg);
  }
  return res.json();
}

export async function markMessageAsRead(messageId) {
  const res = await fetch(`${BACKEND_URL}/api/messages/${messageId}/read`, {
    method: "PATCH",
  });
  return res.json();
}

// Usuarios
export async function fetchUsers() {
  const res = await fetch(`${BACKEND_URL}/users`);
  return res.json();
}

// (Si quieres mantener el envío de correos externos, puedes dejarlo así)
export async function sendEmail({ to, subject, message, files, userId }) {
  const formData = new FormData();
  formData.append("to", to);
  formData.append("subject", subject);
  formData.append("message", message);
  formData.append("userId", userId);
  if (files && files.length) {
    Array.from(files).forEach((file) => {
      formData.append("attachments", file);
    });
  }
  const response = await fetch(`${BACKEND_URL}/api/email/send-email`, {
    method: "POST",
    body: formData,
  });
  return response.ok;
}
