"use client";
import React, { useState } from "react";
import { sendMessage } from "../services/emailService";
import { useSelector } from "react-redux";
import ReactDOM from "react-dom";
import { createUserNotificationClient } from "@/app/services/notificationsClient";
import { useNotificationUpdate } from "../dashboard/layout";

const EmailModal = ({ user, onClose, usersList, id_proyecto }) => {
  const fromUserId = useSelector((state) => state.user.user?.id);

  // Hook opcional - puede fallar si se usa fuera del dashboard
  let refreshNotifications = null;
  try {
    const notificationContext = useNotificationUpdate();
    refreshNotifications = notificationContext?.refreshNotifications;
  } catch (e) {
    // No hay contexto disponible, no pasa nada
    console.log("EmailModal usado fuera del contexto de notificaciones");
  }
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState("");
  const [toUserId, setToUserId] = useState(user?.id || "");

  const handleSend = async () => {
    if (!subject || !body || !toUserId) {
      setStatus("Completa todos los campos.");
      return;
    }
    console.log("Enviando mensaje con id_proyecto:", id_proyecto);
    const res = await sendMessage({
      fromUserId,
      toUserId,
      subject,
      body,
      id_proyecto, // Siempre enviamos el id_proyecto recibido por prop
    });
    if (res && !res.error) {
      // Crear notificación para el destinatario
      try {
        await createUserNotificationClient({
          resumen: subject || "Nuevo correo recibido",
          message: "Tienes un nuevo correo en tu bandeja de entrada.",
          userId: toUserId,
        });
        console.log(
          "✅ Notificación de correo externo creada para usuario:",
          toUserId,
        );

        // Refrescar el contador de notificaciones si está disponible
        if (refreshNotifications) {
          refreshNotifications();
        }
      } catch (e) {
        console.error("No se pudo crear la notificación de correo externo:", e);
      }
      setStatus("Correo enviado correctamente.");
      onClose();
    } else {
      setStatus("Error al enviar el correo.");
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20">
      <div className="bg-white rounded-lg shadow p-0 w-full max-w-3xl relative border border-gray-300">
        {/* Botón X para cerrar */}
        <button
          className="absolute top-2 right-4 text-red-500 hover:text-red-700 text-2xl font-bold"
          onClick={onClose}
          aria-label="Cerrar"
          type="button"
        >
          ×
        </button>
        {/* Header */}
        <div className="border-b border-gray-300 px-4 py-3 flex items-center justify-between rounded-t-lg">
          <span className="font-semibold text-lg">Mensaje nuevo</span>
          {/* Puedes agregar aquí CC/CCO si lo necesitas */}
        </div>
        {/* Campos */}
        <div className="px-4 pt-4 pb-2">
          <input
            type="text"
            className="w-full border-0 border-b border-gray-200 focus:ring-0 focus:border-gray-400 mb-2 text-gray-700 bg-transparent"
            placeholder="Para"
            value={user?.names || ""}
            disabled
            aria-label="Ingresar destinatario del correo"
          />
          <input
            type="text"
            className="w-full border-0 border-b border-gray-200 focus:ring-0 focus:border-gray-400 mb-2 text-gray-700 bg-transparent"
            placeholder="Asunto"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            aria-label="Ingresar asunto del correo"
          />
          <textarea
            className="w-full border-0 mt-2 text-gray-700 bg-transparent min-h-[120px] resize-none focus:ring-0 focus:border-0"
            placeholder=""
            aria-label="Ingresar cuerpo del correo"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>
        {/* Footer */}
        <div className="flex items-center px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button
            className="bg-[#5c7891] hover:bg-[#597387] text-white font-semibold px-8 py-2 rounded-full transition"
            onClick={handleSend}
            type="button"
          >
            Enviar
          </button>
          {/* No adjunto, solo botón enviar */}
          {status && <div className="ml-4 text-sm text-blue-700">{status}</div>}
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default EmailModal;
