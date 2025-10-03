"use client";
import React from "react";

function MessageList({ messages, onSelectMessage, type = "inbox" }) {
  if (!messages || messages.length === 0) {
    return <div>No hay mensajes.</div>;
  }

  return (
    <ul>
      {messages.map((msg) => (
        <li
          key={msg.id}
          style={{
            fontWeight: type === "inbox" && !msg.read ? "bold" : "normal",
            cursor: "pointer",
          }}
          onClick={() => onSelectMessage && onSelectMessage(msg.id)}
        >
          <b>{msg.subject}</b>{" "}
          {type === "inbox"
            ? `de ${msg.fromUser?.names}`
            : `para ${msg.toUser?.names}`}
          {type === "inbox" && (msg.read ? " (Leído)" : " (No leído)")}
        </li>
      ))}
    </ul>
  );
}

export default MessageList;
