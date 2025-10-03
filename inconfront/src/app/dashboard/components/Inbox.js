"use client";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { fetchInbox } from "@/app/services/emailService";

function Inbox({ onSelectMessage }) {
  // Obtén el userId desde Redux (ajusta según tu estructura)
  const userId = useSelector((state) => state.user.user?.id);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetchInbox(userId).then((data) => {
      setMessages(data.data || []);
      setLoading(false);
    });
  }, [userId]);

  if (!userId) return <div>Debes iniciar sesión para ver tus mensajes.</div>;
  if (loading) return <div>Cargando mensajes...</div>;

  return (
    <div className="p-4">
      <h2 className="mx-auto text-3xl font-extrabold text-gray-800 select-none font-zen-kaku text-center mb-8">
        | Bandeja de entrada |
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-black rounded shadow">
          <thead>
            <tr className="bg-[#5c7891] text-white">
              <th className="py-2 px-4 text-center">Asunto</th>
              <th className="py-2 px-4 text-center">Remitente</th>
              <th className="py-2 px-4 text-center">Estado</th>
              <th className="py-2 px-4 text-center">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {messages.length === 0 && (
              <tr>
                <td colSpan={4} className="py-4 text-center text-gray-500">
                  No tienes mensajes.
                </td>
              </tr>
            )}
            {messages.map((msg) => (
              <tr
                key={msg.id}
                className={`cursor-pointer transition-colors ${!msg.read ? "bg-blue-50 font-semibold" : ""} hover:bg-blue-100`}
                onClick={() => onSelectMessage && onSelectMessage(msg.id)}
              >
                <td className="py-2 px-4 text-center">{msg.subject}</td>
                <td className="py-2 px-4 text-center">{msg.fromUser?.names}</td>
                <td className="py-2 px-4 text-center">
                  {msg.read ? (
                    <span className="text-green-600 font-medium">Leído</span>
                  ) : (
                    <span className="text-blue-600 font-medium">No leído</span>
                  )}
                </td>
                <td className="py-2 px-4 text-center">
                  {new Date(msg.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Inbox;
