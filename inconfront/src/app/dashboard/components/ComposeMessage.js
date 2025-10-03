"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { fetchUsers, sendMessage } from "@/app/services/emailService";
import { createUserNotificationClient } from "@/app/services/notificationsClient";
import { useNotificationUpdate } from "../layout";
import { Paperclip } from "lucide-react";

function ComposeMessage({ onSent }) {
  const fromUserId = useSelector((state) => state.user.user?.id);
  const { refreshNotifications } = useNotificationUpdate();
  const [toUserInput, setToUserInput] = useState(""); // input de email
  const [toUserId, setToUserId] = useState(""); // id real
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState("");

  const [attachment, setAttachment] = useState(null);
  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    setAttachment(e.target.files[0]);
    console.log("Archivo seleccionado:", e.target.files[0]);
  };

  // Cargar lista de usuarios para seleccionar destinatario
  useEffect(() => {
    fetchUsers().then((data) => setUsers(data.data || []));
  }, []);

  const handleSend = async () => {
    if (!toUserId || !subject || !body) {
      setStatus(
        "Completa todos los campos y selecciona un destinatario válido.",
      );
      return;
    }
    // Debug: loguear lo que se va a enviar
    console.log("Enviando mensaje:", {
      fromUserId,
      toUserId,
      subject,
      body,
      attachment,
    });
    const formData = new FormData();
    formData.append("fromUserId", fromUserId);
    formData.append("toUserId", toUserId);
    formData.append("subject", subject);
    formData.append("body", body);
    if (attachment) {
      formData.append("attachment", attachment);
    }

    // Aquí podrías enviar el archivo adjunto si tu backend lo soporta
    const res = await sendMessage(formData, true);
    if (res && !res.error) {
      // Lunixia: Crear notificación tipo mail para el destinatario (client-side seguro) usando id_proyecto: 0
      try {
        // Log para debug
        console.log("Payload notificación usuario-usuario:", {
          resumen: subject || "Nuevo mensaje recibido",
          message: "Tienes un nuevo correo en tu bandeja de entrada.",
          userId: toUserId,
        });
        await createUserNotificationClient({
          resumen: subject || "Nuevo mensaje recibido",
          message: "Tienes un nuevo correo en tu bandeja de entrada.",
          userId: toUserId,
        });
      } catch (e) {
        // Si falla la notificación, igual continúa
        console.error("No se pudo crear la notificación de correo:", e);
      }
      setStatus("¡Mensaje enviado!");
      setToUserId("");
      setToUserInput("");
      setSubject("");
      setBody("");
      setAttachment(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      // Refrescar el contador de notificaciones ya que se creó una nueva
      refreshNotifications();

      onSent && onSent();
    } else {
      setStatus("Error al enviar el mensaje.");
    }
  };

  return (
    <div
      className="relative w-full max-w-6xl mx-auto bg-white rounded shadow"
      style={{
        border: "2px solid gray",
        minWidth: 900,
        minHeight: 500,
        padding: 0,
      }}
    >
      {/* Barra superior estilo Gmail */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 rounded-t bg-gray-50">
        <span className="font-semibold text-base text-gray-900">
          Mensaje nuevo
        </span>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-500 cursor-pointer hover:underline">
            CC CCO
          </span>
        </div>
      </div>
      {/* Campos Para y Asunto en línea */}
      <div className="px-4 pt-2">
        <div className="flex items-center border-b border-gray-200">
          <input
            className="flex-1 py-4 px-0 bg-transparent outline-none text-base border-none"
            style={{ borderColor: "transparent" }}
            placeholder="Para"
            value={toUserInput}
            aria-label="Ingresar destinatario"
            onChange={(e) => {
              setToUserInput(e.target.value);
              const foundUser = users.find((u) => u.email === e.target.value);
              setToUserId(foundUser ? foundUser.id : "");
            }}
            list="users-list"
          />
          <datalist id="users-list">
            {users
              .filter((u) => u.id !== fromUserId)
              .map((u) => (
                <option key={u.id} value={u.email}>
                  {u.names} ({u.email})
                </option>
              ))}
          </datalist>
        </div>
        <div className="flex items-center border-b border-gray-200">
          <input
            className="flex-1 py-4 px-0 bg-transparent outline-none text-base border-none"
            style={{ borderColor: "transparent" }}
            placeholder="Asunto"
            aria-label="Ingresar asunto"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>
      </div>
      {/* Área de mensaje expandida */}
      <div className="px-4 pt-2 pb-24">
        <textarea
          className="w-full h-64 resize-none border-none outline-none bg-transparent text-lg"
          style={{ borderColor: "transparent" }}
          placeholder=""
          aria-label="Ingresar cuerpo del correo"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        {/* Mostrar nombre del archivo adjunto si hay uno */}
        {attachment && (
          <div className="mt-4 p-2 bg-gray-50 rounded border text-sm text-gray-700">
            📎 Archivo adjunto:{" "}
            <span className="font-semibold">{attachment.name}</span>
          </div>
        )}
      </div>

      {/* Input de archivo oculto */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
      />

      {/* Pie de acciones fijo abajo */}
      <div className="flex items-center gap-4 px-4 py-4 absolute left-0 bottom-0 w-full bg-white border-t border-gray-200">
        <button
          className="bg-[#5c7891] text-white px-10 py-3 rounded-full hover:bg-[#597387] transition font-semibold text-lg"
          style={{ minWidth: 120 }}
          onClick={handleSend}
        >
          Enviar
        </button>
        {/* Botón Paperclip dispara el input file oculto */}
        <button
          type="button"
          className="text-black px-6 py-2 rounded hover:bg-gray-100-700 transition"
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
        >
          <Paperclip size={20} className="inline-black" />
        </button>
        {/* Input file oculto, conectado al ref */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </div>

      {status && (
        <div className={`mt-3 text-center text-sm ${
          status.includes('Error') || status.includes('demasiado grande') 
            ? 'text-red-600' 
            : 'text-blue-700'
        }`}>
          {status}
        </div>
      )}
    </div>
  );
}

export default ComposeMessage;
