import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "next/navigation";
import { createNotification } from "@/app/services/eventos_service";
import toast from "react-hot-toast";
const NotificationForm = ({ closeModal }) => {
  const [resumen, setResumen] = useState("");
  const [message, setMessage] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString());
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado para manejar el envío

  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId") || "";
  const id_usuario = useSelector((state) => state.user.user.id);

  useEffect(() => {
    setFecha(new Date().toISOString());
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true); // Deshabilitar el botón de envío

    try {
      await createNotification({
        resumen,
        message,
        userId: id_usuario,
        id_proyecto: parseInt(projectId, 10),
        fecha,
      });
      setResumen("");
      setMessage("");
      setFecha(new Date().toISOString());
      toast.success("Notificación enviada exitosamente");
      closeModal();
    } catch (error) {
      console.error("Error al enviar la notificación:", error);
      toast.error("Error al enviar la notificación");
    } finally {
      setIsSubmitting(false); // Habilitar el botón de envío
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 bg-white rounded-lg font-zen-kaku"
    >
      <div className="mb-4">
        <label htmlFor="resumen" className="block text-gray-700 font-bold mb-2">
          Resumen
        </label>
        <input
          aria-label="Resumen del mensaje"
          type="text"
          id="resumen"
          value={resumen}
          onChange={(e) => setResumen(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="message" className="block text-gray-700 font-bold mb-2">
          Mensaje
        </label>
        <textarea
          aria-label="Cuerpo del mensaje"
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <button
        type="submit"
        className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-all ease-linear duration-150"
        disabled={isSubmitting} // Deshabilitar el botón mientras se envía la solicitud
      >
        Enviar Notificación
      </button>
    </form>
  );
};

export default NotificationForm;
