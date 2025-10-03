"use client";
import React, { useState } from "react";
import Inbox from "./Inbox";
import Sent from "./Sent";
import ComposeMessage from "./ComposeMessage";
import MessageDetail from "./MessageDetail";
import { Mail, Send, Edit } from "lucide-react";

function MessagesApp() {
  const [view, setView] = useState("inbox"); // inbox | sent | compose | detail
  const [selectedMessageId, setSelectedMessageId] = useState(null);

  // Navegación entre vistas
  const goToInbox = () => {
    setView("inbox");
    setSelectedMessageId(null);
  };
  const goToSent = () => {
    setView("sent");
    setSelectedMessageId(null);
  };
  const goToCompose = () => {
    setView("compose");
    setSelectedMessageId(null);
  };
  const goToDetail = (id) => {
    setSelectedMessageId(id);
    setView("detail");
  };

  // Renderizado condicional según la vista
  return (
  <div className="mt-8">
    <div className="flex justify-end mt-8 mb-4 px-4 gap-2 x-4 py-2 rounded">
  <button
    onClick={goToInbox}
    className={`px-4 py-2 rounded-md text-white font-medium flex items-center gap-2 transition-colors ${
      view === "inbox"
        ? "bg-[#5c7891]"
        : "bg-[#7fa1c6] hover:bg-[#5c7891]/80"
    }`}
  >
    <Mail size={18} />
    Bandeja de entrada
  </button>
  <button
    onClick={goToSent}
    className={`px-4 py-2 rounded-md text-white font-medium flex items-center gap-2 transition-colors ${
      view === "sent"
        ? "bg-[#5c7891]"
        : "bg-[#7fa1c6] hover:bg-[#5c7891]/80"
    }`}
  >
    <Send size={18} />
    Enviado
  </button>
  <button
    onClick={goToCompose}
    className={`px-4 py-2 rounded-md text-white font-medium flex items-center gap-2 transition-colors ${
      view === "compose"
        ? "bg-[#5c7891]"
        : "bg-[#7fa1c6] hover:bg-[#5c7891]/80"
    }`}
  >
    <Edit size={18} />
    Redactar
  </button>
</div>


    {/* Vista condicional */}
    <div>
      {view === "inbox" && <Inbox onSelectMessage={goToDetail} />}
      {view === "sent" && <Sent onSelectMessage={goToDetail} />}
      {view === "compose" && <ComposeMessage onSent={goToInbox} />}
      {view === "detail" && selectedMessageId && (
        <MessageDetail messageId={selectedMessageId} onBack={goToInbox} />
      )}
    </div>
  </div>
);
}

export default MessagesApp;
