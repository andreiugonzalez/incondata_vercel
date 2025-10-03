"use client";

import React from "react";
import ReactDOM from "react-dom";

// Reusable confirmation dialog using a simple portal overlay
// Props:
// - open: boolean to control visibility
// - onClose: function to close the dialog
// - accept: function to execute on confirm
// - acceptLabel: text for confirm button
// - title: dialog title
// - description: dialog message
// - cancelLabel: optional text for cancel button (default "Cancelar")
export default function ConfirmDialog({
  open,
  onClose,
  accept,
  acceptLabel = "Confirmar",
  title = "Confirmación",
  description = "¿Estás seguro que quieres continuar?",
  cancelLabel = "Cancelar",
}) {
  if (!open) return null;

  const handleAccept = async () => {
    try {
      await Promise.resolve(accept?.());
    } finally {
      onClose?.();
    }
  };

  const handleCancel = () => {
    onClose?.();
  };

  return ReactDOM.createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-desc"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2147483647,
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "1.75rem",
          borderRadius: "0.75rem",
          width: "min(520px, 92vw)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
        }}
      >
        <h2
          id="confirm-dialog-title"
          style={{ margin: 0, marginBottom: 12, fontSize: 20, fontWeight: 700 }}
        >
          {title}
        </h2>
        <p id="confirm-dialog-desc" style={{ marginBottom: 24, color: "#333" }}>
          {description}
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={handleCancel}
            style={{
              background: "#f3f4f6",
              color: "#111827",
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: "8px 16px",
              fontWeight: 600,
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleAccept}
            style={{
              background: "#dc2626",
              color: "white",
              border: "1px solid #b91c1c",
              borderRadius: 8,
              padding: "8px 16px",
              fontWeight: 600,
            }}
          >
            {acceptLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}