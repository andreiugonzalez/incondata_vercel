import React, { useEffect, useState, useCallback } from "react";
import ReactDOM from "react-dom";
// Usamos React Portal para que el modal de confirmación se muestre sobre toda la pantalla, fuera del layout del componente.
import { Bell, ThumbsUp, ChevronDown, Paperclip } from "lucide-react";
import "../style/animate_like.css";
import "../style/media_query.css";
import {
  insertCommentPartida,
  insertCommentSubpartida,
  insertCommentTarea,
  insertCommentSubtarea,
  getpartidacomment,
  getSubpartidaComment,
  getTareaComment,
  getSubtareaComment,
  updateComment,
  deleteComment,
} from "@/app/services/comment";
import Image from "next/image";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
/**
 * Modal de confirmación reutilizable, usando React Portal para asegurar que
 * siempre se muestre centrado y sobre toda la pantalla, sin importar el layout del componente padre.
 * Se usa para confirmar acciones críticas como eliminar comentarios.
 */
const ConfirmModal = ({ open, mensaje, onConfirm, onCancel }) => {
  if (!open) return null;
  return ReactDOM.createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2147483647,
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "2.5rem 2rem",
          borderRadius: "1rem",
          minWidth: 340,
          maxWidth: "90vw",
          boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <p
          style={{
            marginBottom: 32,
            color: "#222",
            fontSize: 20,
            fontWeight: 600,
          }}
        >
          {mensaje ? mensaje : "¿Estás seguro que quieres continuar?"}
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 24 }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: "10px 28px",
              background: "#e5e7eb",
              color: "#222",
              border: "none",
              borderRadius: 8,
              fontWeight: "bold",
              fontSize: 16,
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              padding: "10px 28px",
              background:
                mensaje && mensaje.toLowerCase().includes("eliminar")
                  ? "#e11d48"
                  : "#10b981",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: "bold",
              fontSize: 16,
              cursor: "pointer",
            }}
          >
            {mensaje && mensaje.toLowerCase().includes("eliminar")
              ? "Eliminar"
              : "Guardar"}
          </button>
        </div>
      </div>
    </div>,
    typeof window !== "undefined" ? document.body : null,
  );
};

const CommentSection = ({
  id_usuario,
  nombre_usuario,
  id,
  nivel,
  id_proyecto,
}) => {
  
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [newReply, setNewReply] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [emptyCommentWarning, setEmptyCommentWarning] = useState(false);

  // Estados para edición
  // const [editIndex, setEditIndex] = useState(null);
  // const [editText, setEditText] = useState("");
  // const [removeImage, setRemoveImage] = useState(false);

  // Estados para confirmación de acciones
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // "edit" | "delete" // Mantendremos "edit" aquí por ahora para no romper la lógica del modal, pero lo simplificaremos
  // const [pendingEdit, setPendingEdit] = useState(null); // { comment, index }
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  // Obtiene los comentarios según el nivel (partida, subpartida, tarea, subtarea)
  // y setea el estado local. Si hay error, deja el array vacío.
  const fetchComentarios = useCallback(async () => {
    console.log("=== FETCH COMENTARIOS PARAMS ===");
    console.log("Nivel:", nivel);
    console.log("ID:", id, typeof id);
    console.log("ID Proyecto:", id_proyecto);
    
    try {
      let response = {};
      if (nivel === "partida") {
        console.log("Obteniendo comentarios de partida con ID de proyecto:", id_proyecto);
        response = await getpartidacomment(id_proyecto);
      } else if (nivel === "subpartida") {
        console.log("Obteniendo comentarios de subpartida con ID:", id);
        response = await getSubpartidaComment(id);
      } else if (nivel === "tarea") {
        console.log("Obteniendo comentarios de tarea con ID:", id);
        response = await getTareaComment(id);
      } else if (nivel === "subtarea") {
        console.log("Obteniendo comentarios de subtarea con ID:", id);
        response = await getSubtareaComment(id);
      }

      console.log("Respuesta completa del servidor:", response);
      
      if (response.statusCode === 200 && Array.isArray(response.data)) {
        // Filtrar los comentarios según el nivel y el ID correspondiente
        let comentariosFiltrados = response.data;
        if (nivel === "partida") {
          comentariosFiltrados = response.data.filter(comment => 
            String(comment.id_partida) === String(id)
          );
        }
        
        setComments(comentariosFiltrados);
        console.log("Comentarios cargados:", comentariosFiltrados.length);
        console.log("Datos de comentarios filtrados:", comentariosFiltrados);
      } else {
        console.error(
          "Error al obtener comentarios:",
          response.message || "Datos no válidos"
        );
        setComments([]);
      }
    } catch (err) {
      console.error("Error en fetchComentarios:", err);
      setError(err.message);
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [id_proyecto, nivel, id]);

  useEffect(() => {
    setLoading(true);
    fetchComentarios();
  }, [fetchComentarios]);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  /**
   * Maneja el envío de un nuevo comentario, permitiendo adjuntar archivos (imágenes, docs, etc).
   * Usa los servicios centralizados para mantener la lógica limpia y reutilizable.
   */
  const handleAddComment = async () => {
    if (loading) return;
    if (!newComment.trim() && !selectedFile) {
      setEmptyCommentWarning(true);
      return;
    }
    setEmptyCommentWarning(false);

    // Preparamos el FormData para enviar texto y archivo
    const formData = new FormData();
    formData.append("id_usuario", id_usuario);
    formData.append("id", id);
    formData.append("text", newComment);
    formData.append("fecha", new Date().toISOString()); // Agregamos la fecha actual
    
    // Añadir campos específicos según el tipo de comentario
    if (nivel === "partida") {
      formData.append("id_partida", id);
    } else if (nivel === "subpartida") {
      formData.append("id_subpartida", id);
    } else if (nivel === "tarea") {
      formData.append("id_task", id);
    } else if (nivel === "subtarea") {
      formData.append("id_subtask", id);
    }
    
    if (selectedFile) {
      formData.append("file", selectedFile);
    }
    
    console.log("=== DATOS DEL COMENTARIO ===");
    console.log("Nivel:", nivel);
    console.log("ID:", id);
    console.log("ID Usuario:", id_usuario);
    console.log("Texto:", newComment);
    console.log("Fecha:", new Date().toISOString());
    console.log("Archivo adjunto:", selectedFile ? selectedFile.name : "No hay archivo");

    setLoading(true);
    let result;
    try {
      // Usamos los servicios según el nivel, todos deben aceptar FormData
      if (nivel === "partida") {
        result = await insertCommentPartida(formData);
      } else if (nivel === "subpartida") {
        result = await insertCommentSubpartida(formData);
      } else if (nivel === "tarea") {
        result = await insertCommentTarea(formData);
      } else if (nivel === "subtarea") {
        result = await insertCommentSubtarea(formData);
      }
        
      // Si el backend responde OK, limpiamos el formulario y refrescamos comentarios
      if (result && (result.statusCode === 200 || result.statusCode === 201)) {
        // Normaliza el comentario recién creado para que pase el filtro y se muestre al tiro
        let nuevoComentario = result.data;
        // Asegura que el campo detalle esté presente
        if (!nuevoComentario.detalle) nuevoComentario.detalle = newComment;
  
        // Asegura que el campo de id esté presente y del tipo correcto
        if (nivel === "partida" && !nuevoComentario.id_partida) {
          nuevoComentario.id_partida = Number(id);
        } else if (nivel === "subpartida" && !nuevoComentario.id_subpartida) {
          nuevoComentario.id_subpartida = Number(id);
        } else if (nivel === "tarea" && !nuevoComentario.id_task) {
          nuevoComentario.id_task = Number(id);
        } else if (nivel === "subtarea" && !nuevoComentario.id_subtask) {
          nuevoComentario.id_subtask = Number(id);
        }
  
        // Agrega el usuario para mostrar el nombre al tiro
        if (nivel === "partida") {
          nuevoComentario.user_Comment = {
            names: nombre_usuario,
            apellido_p: "",
            apellido_m: "",
          };
        } else if (nivel === "subpartida") {
          nuevoComentario.user_Comment_subpartida = {
            names: nombre_usuario,
            apellido_p: "",
            apellido_m: "",
          };
        } else if (nivel === "tarea") {
          nuevoComentario.user_Comment_tarea = {
            names: nombre_usuario,
            apellido_p: "",
            apellido_m: "",
          };
        } else if (nivel === "subtarea") {
          nuevoComentario.user_Comment_subtarea = {
            names: nombre_usuario,
            apellido_p: "",
            apellido_m: "",
          };
        }
  
        // Asegura que el comentario nuevo tenga el userId del autor para mostrar el botón eliminar
        nuevoComentario.userId = id_usuario;
  
        setComments((prevComments) => [nuevoComentario, ...prevComments]);
        setNewComment("");
        setSelectedFile(null);
        toast.success("Comentario agregado correctamente");
      } else if (result && result.message) {
        console.error("Error al agregar comentario:", result.message);
        toast.error(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Error al insertar comentario:", error);
      console.error("Mensaje de error:", error.message);
      console.error("Stack de error:", error.stack);
      toast.error(`Error: ${error.message || "Error desconocido"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReply = () => {
    setComments((prevComments) =>
      prevComments.map((comment, i) => {
        if (i === replyingTo) {
          const reply = {
            name: nombre_usuario,
            avatar: "https://via.placeholder.com/150",
            text: newReply,
            timestamp: new Date().toLocaleString(),
          };
          return { ...comment, replies: [...comment.replies, reply] };
        } else {
          return comment;
        }
      }),
    );
    setNewReply("");
    setReplyingTo(null);
  };

  // Eliminar comentario: abre el modal personalizado y confirma eliminación
  /**
   * Cuando el usuario hace click en "Eliminar", guardamos el ID del comentario,
   * seteamos la acción a "delete" y abrimos el modal de confirmación.
   */
  const handleDeleteComment = (commentId) => {
    setPendingDeleteId(commentId);
    setConfirmAction("delete");
    setShowConfirm(true);
  };

  // Confirmar eliminación desde el modal
  // (solo una versión, sin duplicados)
  // Elimina el comentario si se confirma en el modal
  // y limpia los estados relacionados
  // (esta función es llamada desde el modal)
  //
  /**
   * Si el usuario confirma en el modal, ejecutamos el borrado real del comentario.
   * Luego limpiamos los estados para cerrar el modal y dejar todo listo para la próxima acción.
   */
  const handleConfirmDelete = async () => {
    if (!pendingDeleteId) {
      console.warn("handleConfirmDelete: No hay pendingDeleteId.");
      return;
    }

    // Obtener el 'tipo' del comentario. Asumo que 'nivel' es la prop correcta.
    // 'nivel' podría ser "partida", "subpartida", "tarea", "subtarea".
    const commentType = nivel;

    if (!commentType) {
      console.error(
        "handleConfirmDelete: El 'tipo' (nivel) del comentario no está definido. No se puede eliminar.",
      );
      // Podrías mostrar una notificación al usuario aquí.
      setShowConfirm(false); // Cierra el modal de confirmación
      setPendingDeleteId(null);
      // setConfirmAction(null); // Si aún usas confirmAction para diferenciar acciones
      return;
    }

    try {
      // LLAMADA AL SERVICIO MODIFICADO: ahora pasas 'pendingDeleteId' y 'commentType'
      const response = await deleteComment(pendingDeleteId, commentType);

      if (response && response.success) {
        // Éxito: el backend confirmó el soft delete.
        setComments((prevComments) =>
          prevComments.filter((comment) => comment.id !== pendingDeleteId),
        );

        // Opcional: Mostrar una notificación de éxito al usuario (ej. con react-toastify o similar)
        // toast.success(response.message || "Comentario eliminado.");
      } else {
        // El servicio deleteComment ahora debería lanzar un error si !response.success,
        // por lo que este 'else' podría no alcanzarse si el manejo de errores en el servicio es robusto.
        // Sin embargo, es bueno tenerlo como salvaguarda.
        console.error(
          "Error al eliminar comentario (respuesta no exitosa del servicio):",
          response?.message,
        );
        // Opcional: Mostrar notificación de error al usuario
        // toast.error(response?.message || "No se pudo eliminar el comentario.");
      }
    } catch (error) {
      // Captura errores lanzados por el servicio deleteComment (incluyendo errores del backend)
      console.error("Error al intentar eliminar el comentario:", error.message);
      // Opcional: Mostrar notificación de error al usuario con error.message
      // toast.error(error.message || "Ocurrió un error al eliminar.");
    } finally {
      // Siempre se ejecuta, para limpiar el estado del modal
      setShowConfirm(false);
      setPendingDeleteId(null);
      // setConfirmAction(null); // Si lo usas
    }
  };

  // Guardar edición de comentario
  // const handleSaveEdit = (comment, index) => {
  //   setPendingEdit({ comment, index });
  //   setConfirmAction("edit");
  //   setShowConfirm(true);
  // };

  // const handleConfirmEdit = async () => {
  //   if (!pendingEdit) return;
  //   const { comment, index } = pendingEdit;
  //   try {
  //     // Si hay archivo adjunto, usamos FormData
  //     let res;
  //     if (selectedFile) {
  //       const formData = new FormData();
  //       formData.append("detalle", editText);
  //       formData.append("file", selectedFile);
  //       if (removeImage) {
  //         formData.append("fileUrl", "");
  //         formData.append("fileOriginalName", "");
  //       } else {
  //         if (comment.fileUrl !== undefined)
  //           formData.append("fileUrl", comment.fileUrl);
  //         if (comment.fileOriginalName !== undefined)
  //           formData.append("fileOriginalName", comment.fileOriginalName);
  //       }
  //       console.log("EDITAR COMENTARIO - Antes del fetch (FormData)");
  //       res = await updateComment(comment.id, formData);
  //     } else {
  //       // Si no hay archivo, enviamos como JSON normal
  //       const body = { detalle: editText };
  //       if (removeImage) {
  //         body.fileUrl = null;
  //         body.fileOriginalName = null;
  //       } else {
  //         if (comment.fileUrl !== undefined) body.fileUrl = comment.fileUrl;
  //         if (comment.fileOriginalName !== undefined)
  //           body.fileOriginalName = comment.fileOriginalName;
  //       }
  //       console.log("EDITAR COMENTARIO - Antes del fetch");
  //       res = await updateComment(comment.id, body);
  //     }

  //     console.log("EDITAR COMENTARIO - Respuesta del backend:", res);

  //     if (res && (res.statusCode === 200 || comment.fileOriginalName)) {
  //       setComments((prev) =>
  //         prev.map((c) =>
  //           c.id === comment.id
  //             ? {
  //                 ...c,
  //                 // Solo actualiza el texto, manteniendo la fecha original y demás campos
  //                 detalle: editText,
  //               }
  //             : c,
  //         ),
  //       );
  //       setEditIndex(null);
  //       setRemoveImage(false);
  //       setSelectedFile(null);
  //     } else {
  //       console.error("error al editar comentario", res);
  //     }
  //   } catch (error) {
  //     console.error("Error al guardar edición:", error);
  //   } finally {
  //     setShowConfirm(false);
  //     setPendingEdit(null);
  //     setConfirmAction(null);
  //   }
  // };

  /**
   * Si el usuario cancela en el modal, simplemente cerramos el modal y limpiamos los estados.
   */
  const handleCancelConfirm = () => {
    setShowConfirm(false);
    // setPendingEdit(null); // Comentado porque pendingEdit ya está comentado
    setPendingDeleteId(null);
    setConfirmAction(null);
  };

  // Iniciar edición
  // const handleStartEdit = (comment, index) => {
  //   // setEditIndex(index);
  //   // setEditText(comment.detalle);
  //   // setRemoveImage(false);
  // };

  // Cancelar edición
  // const handleCancelEdit = () => {
  //   // setEditIndex(null);
  //   // setRemoveImage(false);
  // };

  // const handleLike = (index) => {
  //   setComments(prevComments => prevComments.map((comment, i) => {
  //     if (i === index && !comment.liked) {
  //       return {...comment, likes: comment.likes + 1, liked: true};
  //     } else {
  //       return comment;
  //     }
  //   }));
  // };

  // const toggleReplies = (index) => {
  //   setComments(prevComments => prevComments.map((comment, i) => {
  //     if (i === index) {
  //       return {...comment, repliesVisible: !comment.repliesVisible};
  //     } else {
  //       return comment;
  //     }
  //   }));
  // };

  const renderTextWithMentions = (text) => {
    return text.split(" ").map((word, i) => {
      if (word.startsWith("@")) {
        return (
          <span key={i} style={{ color: "#5D8F89", fontWeight: "bold" }}>
            {word}{" "}
          </span>
        );
      } else {
        return word + " ";
      }
    });
  };

  // const handleReplyClick = (index) => {
  //     if (replyingTo === index) {
  //       setReplyingTo(null); // Si ya se está respondiendo a este comentario, oculta el formulario de respuesta
  //     } else {
  //       setReplyingTo(index); // Si no, muestra el formulario de respuesta
  //     }
  //   };

  // Debug logs para ver tipos y valores de IDs y asegurar que el filtro funcione bien.
  // Esto ayuda a detectar problemas de tipo (string vs number) y ver qué datos llegan.

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const renderUserComment = (comment) => {
    if (nivel === "partida") {
      return (
        <span className="font-bold font-zen-kaku">
          {comment.user_Comment.names} {comment.user_Comment.apellido_p}{" "}
          {comment.user_Comment.apellido_m}
        </span>
      );
    } else if (nivel === "subpartida") {
      return (
        <span className="font-bold font-zen-kaku">
          {comment.user_Comment_subpartida.names}{" "}
          {comment.user_Comment_subpartida.apellido_p}{" "}
          {comment.user_Comment_subpartida.apellido_m}
        </span>
      );
    } else if (nivel === "tarea") {
      return (
        <span className="font-bold font-zen-kaku">
          {comment.user_Comment_tarea.names}{" "}
          {comment.user_Comment_tarea.apellido_p}{" "}
          {comment.user_Comment_tarea.apellido_m}
        </span>
      );
    } else if (nivel === "subtarea") {
      return (
        <span className="font-bold font-zen-kaku">
          {comment.user_Comment_subtarea.names}{" "}
          {comment.user_Comment_subtarea.apellido_p}{" "}
          {comment.user_Comment_subtarea.apellido_m}
        </span>
      );
    } else {
      return null;
    }
  };
  // El handleSubmit no se usa, la lógica está en handleAddComment

  // Obtener usuario y rol actual desde Redux
  const userStore = useSelector((state) => state.user);
  const currentUserId = userStore?.user?.id;
  const currentUserRole = userStore?.user?.roles?.[0]?.name || "";

  // Modificar la función de filtrado de comentarios
  const comentariosFiltrados = comments
    .filter((comment) => {
      if (nivel === "partida") {
        return String(comment.id_partida) === String(id);
      } else if (nivel === "subpartida") {
        console.log("Filtrando subpartida - ID del comentario:", comment.id_subpartida, "ID a comparar:", id);
        return String(comment.id_subpartida) === String(id);
      } else if (nivel === "tarea") {
        return String(comment.id_task) === String(id);
      } else if (nivel === "subtarea") {
        return String(comment.id_subtask) === String(id);
      } else {
        return false;
      }
    })
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  return (
    <div className="p-4 w-full">
      <div className="bg-white p-4 rounded-lg shadow-lg">
        {" "}
        {/* Cambié el fondo y añadí sombra */}
        <div className="mt-4">
          <input
            type="text"
            placeholder="Agregar comentario, documento o imagen"
            className="p-3 w-full h-20 rounded-lg border-l-4 border-yellow-400 bg-gray-50 focus:border-gray-500 focus:ring-teal-500 focus:outline-none" // Ajusté las clases para coincidir con el estilo del textarea
            value={newComment}
            onChange={(e) => {
              setNewComment(e.target.value);
              if (
                emptyCommentWarning &&
                (e.target.value.trim() || selectedFile)
              ) {
                setEmptyCommentWarning(false);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
              }
            }}
          />

          <div className="relative mt-6" style={{ minHeight: 48 }}>
            {/* Botón Enviar a la esquina inferior izquierda */}
            <div className="absolute left-0 bottom-0 flex items-center gap-2">
              <button
                type="button"
                className="px-6 py-2 bg-[#597387] hover:bg-[#42536a] rounded-lg text-white font-bold transition-all ease-linear duration-150 font-zen-kaku"
                disabled={loading}
                onClick={handleAddComment}
              >
                Enviar
              </button>
              {emptyCommentWarning && (
                <span
                  className="ml-2 font-zen-kaku"
                  style={{
                    color: "rgba(225,29,72,0.7)",
                    fontWeight: "bold",
                    fontSize: 14,
                    background: "rgba(255,255,255,0.7)",
                    borderRadius: "6px",
                    padding: "4px 10px",
                    boxShadow: "0 1px 6px rgba(225,29,72,0.08)",
                    letterSpacing: "0.01em",
                    display: "inline-block",
                    verticalAlign: "middle",
                  }}
                >
                  &quot;Agrega texto o archivo para enviar&quot;
                </span>
              )}
            </div>
            {/* Adjuntar archivo y nombre de archivo a la derecha */}
            <div className="absolute right-0 bottom-0 flex items-center gap-2">
              <input
                id="adjuntar-archivo"
                type="file"
                accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx"
                onChange={(e) => {
                  handleFileChange(e);
                  if (
                    emptyCommentWarning &&
                    e.target.files &&
                    e.target.files[0]
                  ) {
                    setEmptyCommentWarning(false);
                  }
                }}
                style={{ display: "none" }}
              />
              <label
                htmlFor="adjuntar-archivo"
                className="flex items-center cursor-pointer px-3 py-2 rounded hover:bg-gray-100 transition-colors duration-150"
                title="Adjuntar archivo"
              >
                <Paperclip size={20} className="text-gray-500" />
                <span className="ml-1 text-sm text-gray-500">Adjuntar</span>
              </label>
              {selectedFile && (
                <span className="ml-2 text-sm text-gray-600 font-zen-kaku">
                  Archivo: {selectedFile.name}
                </span>
              )}
            </div>
          </div>
          {/* El mensaje de advertencia ahora aparece al lado del botón Enviar */}
        </div>
      </div>
      {/*
       Modal de confirmación para eliminar o editar comentario.
        - Se abre solo cuando showConfirm y confirmAction es "delete" o "edit".
        - onConfirm ejecuta la acción correspondiente.
        - onCancel cierra el modal sin hacer nada.
        - El modal se muestra sobre toda la pantalla gracias a React Portal.
      */}
      <ConfirmModal
        open={
          showConfirm && confirmAction === "delete" //|| confirmAction === "edit")
        }
        mensaje={"¿Estás seguro que quieres eliminar este comentario?"}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelConfirm}
      />

      {comments.length > 0 ? (
        comments.map((comment, index) => (
          <motion.div
            key={comment.id}
            className="p-4 bg-gray-50 border-l-4 border-yellow-400 rounded-lg shadow-sm m-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 8,
              bounce: 0.25,
              duration: 0.5,
            }}
          >
            <div className="flex justify-between items-center mb-2 custom-comment-nodos">
              {renderUserComment(comment)}
              <div className="flex flex-auto justify-end gap-2">
                <span className="text-xs text-gray-500 font-zen-kaku">
                  {formatDate(comment.fecha)}
                </span>
                {/* MostrarBotón editar */}

                {/* <button
                    className="ml-2 px-2 py-1 bg-blue-500 hover:bg-blue-600 rounded text-white text-xs font-bold"
                    onClick={() => {
                      console.log(
                        "DEBUG: Botón Editar clickeado",
                        comment.id,
                        index,
                      );
                      handleStartEdit(comment, index);
                    }}
                  >
                    Editar
                  </button> */}
                {/* Botón eliminar */}
                {(currentUserRole === "admin" ||
                  currentUserRole === "superadmin" ||
                  String(currentUserId) === String(comment.userId)) && (
                  <button
                    type="button"
                    className="px-2 py-1 bg-red-500 hover:bg-red-600 rounded text-white text-xs font-bold"
                    onClick={() => handleDeleteComment(comment.id)}
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </div>
            <p>{comment.detalle}</p>
            {/* Separador visual entre comentario y la imagen */}
            {comment.fileUrl &&
              /\.(jpg|jpeg|png|gif)$/i.test(comment.fileUrl) && (
                <div className="mt-3">
                  <img
                    src={comment.fileUrl}
                    alt="Adjunto"
                    style={{
                      maxWidth: 400,
                      maxHeight: 400,
                      width: "100%",
                      height: "auto",
                      marginBottom: 10,
                      borderRadius: 8,
                      objectFit: "contain",
                    }}
                  />
                </div>
              )}
            {/* Si es otro tipo de archivo, mostrar link de descarga */}
            {comment.fileUrl &&
              !/\.(jpg|jpeg|png|gif)$/i.test(comment.fileUrl) && (
                <a
                  href={comment.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#007bff", textDecoration: "underline" }}
                >
                  Descargar archivo adjunto
                </a>
              )}

          </motion.div>
        ))
      ) : (
        <div className="text-center text-gray-500 py-4 font-zen-kaku">
          No hay comentarios aún
        </div>
      )}
      {replyingTo !== null && (
        <div className="mt-4 bg-[#c4c4c4] px-4 py-3 rounded-lg">
          <input
            type="text"
            placeholder="Agregar respuesta"
            className="p-2 w-full rounded border-transparent bg-[#c4c4c4]"
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
          />
          <div className="flex flex-auto justify-end">
            <button
              type="button"
              className="mt-2 p-2 bg-teal-500 hover:bg-teal-600 rounded-lg text-white font-bold font-zen-kaku px-6 py-1 transition-all ease-linear duration-150"
              onClick={handleAddReply}
            >
              Enviar respuesta
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default CommentSection;
