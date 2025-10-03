import React, { useEffect, useRef, useCallback, useState } from "react";
import EmailModal from "./emailModal"; // Asegúrate de que la ruta sea correcta

const UserCard = ({ user, isOnline, onClose, position, onSendMail }) => {
  const cardRef = useRef();
  const [showModal, setShowModal] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  // Maneja el click fuera de la tarjeta
  const handleClickOutside = useCallback(
    (event) => {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  if (!user) return null;

  const { top, left } = position;

  // const handleSendEmail = async () => {
  //   try {
  //     const response = await fetch("/api/send-email", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         to: user.email,
  //         subject,
  //         message,
  //       }),
  //     });

  //     if (response.ok) {
  //       setStatus("¡Correo enviado exitosamente!");
  //       setSubject("");
  //       setMessage("");
  //       setShowEmailForm(false);
  //     } else {
  //       setStatus("Error al enviar el correo.");
  //     }
  //   } catch (error) {
  //     setStatus("Error de red al enviar el correo.");
  //   }
  // };

  // const handleCancel = () => {
  //   setSubject("");
  //   setMessage("");
  //   setShowEmailForm(false);
  //   setStatus("");
  // };

  return (
    <div
      ref={cardRef}
      className="absolute bg-white p-6 rounded-lg shadow-xl transition-transform transform hover:scale-105"
      style={{ top, left, zIndex: 1000, minWidth: "350px", maxWidth: "400px" }}
    >
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-red-500 float-right focus:outline-none"
      >
        {/* ...SVG de cerrar... */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
      {/* ...Datos del usuario... */}
      <div className="flex items-center mb-4 relative">
        <div className="mr-4 relative">
          <div
            className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl text-white font-bold"
            style={{ backgroundColor: "#007bff" }}
          >
            {user.names.charAt(0)}
          </div>
          <span
            className={`absolute bottom-0 right-0 w-4 h-4 border-2 border-white rounded-full ${isOnline ? "bg-green-500" : "bg-gray-400"}`}
          ></span>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">
            {user.names} {user.apellido_p} {user.apellido_m}
          </h2>
          <p className="text-gray-500">
            {user.user_puesto?.nombre_puesto || "Sin puesto"}
          </p>
          <p className="text-gray-500">
            {user.roles && user.roles.length > 0
              ? user.roles.join(", ")
              : "Sin rol"}
          </p>
        </div>
      </div>
      <div className="text-sm">
        <p className="text-gray-600 mb-1">
          <strong>Email:</strong> {user.email}
        </p>
        <p className="text-gray-600 mb-1">
          <strong>Género:</strong> {user.genero}
        </p>
        <p className="text-gray-600 mb-1">
          <strong>Celular:</strong> {user.telefono}
        </p>
        <p className="text-gray-600 mb-1">
          <strong>Organización:</strong>{" "}
          {user.organizacion?.nombre || "Sin organización"}
        </p>
        <p className="text-gray-600 mb-1">
          <strong>Grupo:</strong> {user.user_grupo?.nombre_grupo || "Sin grupo"}
        </p>
      </div>
      <div className="flex justify-center mt-4">
        <button
          onClick={onSendMail}
          className="bg-[#5c7891] hover:bg-[#597387] text-white font-semibold px-8 py-2 rounded-full transition"
          type="button"
        >
          Enviar mensaje
        </button>
        {/* {showModal && (
          <EmailModal user={user} onClose={() => setShowModal(false)} />
        )} */}
      </div>
      {/* {showEmailModal && (
        <EmailModal to={user.email} onClose={() => setShowEmailModal(false)} />
      )}*/}
    </div>
  );
};

export default UserCard;
