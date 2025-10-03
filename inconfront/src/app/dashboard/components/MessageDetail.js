"use client";
import React, { useEffect, useState } from "react";
import {
  fetchMessageById,
  markMessageAsRead,
} from "@/app/services/emailService";
import {
  markNotificationAsReadClient,
  getAllNotificationsClient,
} from "@/app/services/notificationsClient";
import { useSelector } from "react-redux";
import { useNotificationUpdate } from "../layout";

function MessageDetail({ messageId, onBack }) {
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [projectName, setProjectName] = useState(null);
  const userStore = useSelector((state) => state.user);
  const { refreshNotifications } = useNotificationUpdate();

  useEffect(() => {
    if (!messageId) return;
    setLoading(true);
    fetchMessageById(messageId).then(async (data) => {
      setMessage(data.data);
      console.log("Mensaje recibido:", data.data);

      // Si el mensaje tiene id_proyecto, buscar el nombre del proyecto
      if (data.data?.id_proyecto) {
        try {
          const projectResponse = await fetch(
            `${process.env.FAENA_BACKEND_HOST}/project/${data.data.id_proyecto}`,
          );
          if (projectResponse.ok) {
            const projectData = await projectResponse.json();
            console.log("Respuesta del proyecto:", projectData);
            setProjectName(projectData.data?.nombre || "Proyecto sin nombre");
          } else {
            setProjectName("Sin proyecto asociado");
          }
        } catch (error) {
          console.error("Error al buscar proyecto:", error);
          setProjectName("Sin proyecto asociado");
        }
      } else {
        setProjectName("Sin proyecto asociado");
      }

      setLoading(false);
      // Marcar como leído automáticamente al abrir (correo y notificación)
      markMessageAsRead(messageId);

      // Lunixia: Buscar y marcar notificación relacionada como leída
      if (userStore.user?.id) {
        try {
          // Buscar notificaciones del usuario que sean tipo correo
          const notifications = await getAllNotificationsClient();
          console.log("🔍 Todas las notificaciones:", notifications);
          console.log("🎯 Usuario actual ID:", userStore.user.id);
          console.log("📧 Mensaje createdAt:", data.data.createdAt);

          // Buscar la notificación más reciente que aún esté en newFor (no leída)
          const candidateNotifications = notifications.filter(
            (n) =>
              // Es un correo (sin id_proyecto)
              (!n.id_proyecto || n.id_proyecto === null) &&
              // Es para este usuario
              String(n.userId) === String(userStore.user.id) &&
              // Está en newFor (no leída aún)
              n.newFor &&
              Array.isArray(n.newFor) &&
              (n.newFor.includes(userStore.user.id) ||
                n.newFor.includes(String(userStore.user.id)) ||
                n.newFor.includes(Number(userStore.user.id))) &&
              // NO está en readBy
              (!n.readBy ||
                !Array.isArray(n.readBy) ||
                (!n.readBy.includes(userStore.user.id) &&
                  !n.readBy.includes(String(userStore.user.id)) &&
                  !n.readBy.includes(Number(userStore.user.id)))),
          );

          // De las candidatas, tomar la más reciente (última creada)
          const relatedNotification = candidateNotifications.sort(
            (a, b) => new Date(b.fecha) - new Date(a.fecha),
          )[0];

          console.log(
            "🔍 Notificación relacionada encontrada:",
            relatedNotification,
          );

          if (relatedNotification) {
            console.log(
              "📝 Intentando marcar como leída la notificación:",
              relatedNotification.id,
            );
            console.log("📝 ReadBy antes:", relatedNotification.readBy);
            console.log("📝 NewFor antes:", relatedNotification.newFor);

            await markNotificationAsReadClient(
              relatedNotification.id,
              userStore.user.id,
            );
            console.log(
              "✅ Notificación marcada como leída:",
              relatedNotification.id,
            );
          } else {
            console.log(
              "❌ No se encontró notificación relacionada para marcar como leída",
            );
          }

          // Refrescar el contador de no leídos
          console.log("🔄 Refrescando contador de notificaciones...");
          refreshNotifications();
        } catch (e) {
          // Si falla, no rompe la vista
          console.error("No se pudo marcar la notificación como leída:", e);
        }
      }
    });
  }, [messageId, userStore.user?.id]);

  if (!messageId) return <div>Selecciona un mensaje para ver el detalle.</div>;
  if (loading) return <div>Cargando mensaje...</div>;
  if (!message) return <div>No se encontró el mensaje.</div>;

  // Log para debuggear el contenido del mensaje
  console.log("DEBUG message en MessageDetail:", message);

  // Construir la URL absoluta del archivo adjunto
  const backendHost = process.env.NEXT_PUBLIC_FAENA_BACKEND_HOST?.replace(/\/$/, "");
  const fileUrl = message.fileUrl?.startsWith("/")
    ? message.fileUrl
    : `/${message.fileUrl}`;
  const fullFileUrl = `${backendHost}${fileUrl}`;

  return (
    <div
      className="relative w-full max-w-6xl mx-auto bg-white rounded"
      style={{
        border: "1px solid #d1d5db",
        minWidth: 1100, // Más largo horizontalmente
        minHeight: 500, // Más vertical
        padding: 0,
      }}
    >
      {/* Barra superior estilo tabla */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 rounded-t bg-gray-50">
        <span className="font-semibold text-lg text-gray-900">
          Mensaje recibido
        </span>
      </div>
      {/* Campos Para y Asunto en línea */}
      <div className="px-6 pt-2">
        <div
          className="flex items-center"
          style={{ borderBottom: "1px solid #e5e7eb" }}
        >
          <input
            className="flex-1 py-3 px-0 bg-transparent outline-none text-lg border-none"
            style={{ borderColor: "transparent" }}
            value={`De: ${message.fromUser?.names} (${message.fromUser?.email})`}
            disabled
            aria-label="Remitente del correo"
          />
        </div>
        <div
          className="flex items-center"
          style={{ borderBottom: "1px solid #e5e7eb" }}
        >
          <input
            className="flex-1 py-3 px-0 bg-transparent outline-none text-lg border-none"
            style={{ borderColor: "transparent" }}
            value={`Para: ${message.toUser?.names} (${message.toUser?.email})`}
            aria-label="Destinatario del correo"
            disabled
          />
        </div>
        {/* Mostrar nombre del proyecto solo si el mensaje tiene un proyecto asociado */}
        {message.id_proyecto && (
          <div
            className="flex items-center"
            style={{ borderBottom: "1px solid #e5e7eb" }}
          >
            <input
              className="flex-1 py-3 px-0 bg-transparent outline-none text-lg border-none text-blue-700 font-semibold"
              style={{ borderColor: "transparent" }}
              value={`Proyecto: ${projectName || "Cargando..."}`}
              aria-label="Proyecto asociado"
              disabled
            />
          </div>
        )}
        <div
          className="flex items-center"
          style={{ borderBottom: "1px solid #e5e7eb" }}
        >
          <input
            className="flex-1 py-3 px-0 bg-transparent outline-none text-2xl font-bold border-none"
            style={{ borderColor: "transparent" }}
            value={message.subject}
            aria-label="Aunto del mensaje"
            disabled
          />
        </div>
      </div>
      {/* Área de mensaje más grande */}
      <div className="px-6 pt-2 pb-16">
        <div
          className="w-full min-h-[4rem] border-none outline-none bg-transparent text-xl break-words"
          style={{ borderColor: "transparent" }}
          aria-label="Contenido del correo"
          tabIndex='0'
        >
          {message.body}
        </div>
        {/* Bloque para mostrar archivo adjunto */}
        {message.fileUrl && (
          <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col gap-2">
            <span className="font-semibold text-gray-700 mr-2">Adjunto:</span>
            <a
              href={fullFileUrl}
              aria-label=""
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline mb-2"
              download={message.fileOriginalName}
            >
              {message.fileOriginalName || "Descargar archivo"}
            </a>
            {/* Vista previa si es imagen */}
            {/\.(jpg|jpeg|png|gif|webp)$/i.test(
              message.fileOriginalName || "",
            ) && (
              <img
                src={fullFileUrl}
                alt={message.fileOriginalName}
                aria-label="Vista previa de imagen adjunta"
                style={{
                  maxWidth: 300,
                  maxHeight: 200,
                  borderRadius: 8,
                  border: "1px solid #d1d5db",
                }}
              />
            )}
          </div>
        )}
      </div>
      {/* Pie de acciones fijo abajo */}
      <div className="flex items-center gap-4 px-6 py-4 absolute left-0 bottom-0 w-full bg-white border-t border-gray-200">
        <span className="text-base text-gray-500">
          Enviado: {new Date(message.createdAt).toLocaleString()}
        </span>
        <button
          className="ml-auto bg-[#5c7891] hover:bg-[#597387] text-white px-8 py-3 rounded-full transition text-base"
          onClick={onBack}
        >
          Volver
        </button>
      </div>
    </div>
  );
}

export default MessageDetail;
