"use client";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { fetchSent } from "@/app/services/emailService";

function Sent({ onSelectMessage }) {
  const userId = useSelector((state) => state.user.user?.id);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetchSent(userId).then((data) => {
      setMessages(data.data || []);
      setLoading(false);
    });
  }, [userId]);

  if (!userId)
    return <div>Debes iniciar sesión para ver tus mensajes enviados.</div>;
  if (loading) return <div>Cargando mensajes enviados...</div>;

  return (
    <div className="p-4">
      <h2 className="mx-auto text-3xl font-extrabold text-gray-800 select-none font-zen-kaku text-center mb-8">
        | Enviados |
        </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-black rounded shadow">
          <thead>
            <tr className="bg-[#5c7891] text-white">
              <th className="py-2 px-4 text-center">Asunto</th>
              <th className="py-2 px-4 text-center">Destinatario</th>
              <th className="py-2 px-4 text-center">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {messages.length === 0 && (
              <tr>
                <td colSpan={3} className="py-4 text-center text-gray-500">
                  No has enviado mensajes.
                </td>
              </tr>
            )}
            {messages.map((msg) => (
              <tr
                key={msg.id}
                className="cursor-pointer hover:bg-blue-100 transition-colors"
                onClick={() => onSelectMessage && onSelectMessage(msg.id)}
              >
                <td className="py-2 px-4 text-center">{msg.subject}</td>
                <td className="py-2 px-4 text-center">{msg.toUser?.names}</td>
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

export default Sent;
