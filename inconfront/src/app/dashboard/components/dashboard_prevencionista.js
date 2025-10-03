import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import ReactDOM from "react-dom";
import { Modal, Box, Button, Tooltip } from "@mui/material";
import {
  ArrowDropUp,
  ArrowDropDown,
  ArrowForward,
  ArrowBack,
  LastPage,
  FirstPage,
  DragIndicator,
  Edit,
  Delete,
  StickyNote2,
  AttachFile,
  DeleteOutline,
  GetApp,
} from "@mui/icons-material";
import { Paperclip } from "lucide-react";
import { useRouter } from "next/navigation";
import PrevencionForm from "@/app/dashboard/components/crear_evento_prevencionista";
import { GetEventosByProject, getEvento, deleteEvento, createNotaTrabajo, getNotasByEventoId, createNotification, deleteNotaTrabajo } from "@/app/services/eventos_service";
import ActualizarPrevencionForm from "@/app/dashboard/components/event_update";
import FileUpload from "@/app/dashboard/components/adjuntos_eventos";
import { v4 as uuidv4 } from "uuid";
import NotificationForm from "@/app/dashboard/components/notificacion_prevencionista";
import { useSelector } from "react-redux";
import { format } from 'date-fns';
import toast from "react-hot-toast";
import { getPrimaryRole } from "@/app/utils/roleUtils";

/**
 * Modal de confirmación reutilizable, usando React Portal para asegurar que
 * siempre se muestre centrado y sobre toda la pantalla, sin importar el layout del componente padre.
 * Se usa para confirmar acciones críticas como eliminar notas de trabajo.
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

const MAX_STORAGE_KEYS = 1;
const STORAGE_KEYS_LIST = "columnsOrderKeysList";
const RANDOM_KEY = "rk";

const defaultColumnsOrder = [
  { Header: "ID", accessor: "id_evento" },
  { Header: "Resumen", accessor: "resumen" },
  { Header: "Tipo", accessor: "evento_tipo_evento.nombre" },
  { Header: "F. de Evento", accessor: "fecha_inc" },
  { Header: "F. de Creación", accessor: "createdAt" },
  { Header: "F. de Actualización", accessor: "updatedAt" },
  { Header: "Creado por", accessor: "evento_usuario.full_name" },
  { Header: "Notificacion", accessor: "notification" },
  { Header: "Archivos", accessor: "archivos" },
  { Header: "Acciones", accessor: "acciones" },
];

const getColumnClassName = (accessor) => {
  switch (accessor) {
    case "id_evento":
    case "fecha_inc":
    case "createdAt":
    case "updatedAt":
    case "evento_usuario.full_name":
    case "resumen":
    case "evento_tipo_evento.nombre":
    case "notification":
    case "archivos":
    case "acciones":
    default:
      return "";
  }
};

const getNestedValue = (obj, path) =>
  path.split(".").reduce((acc, part) => acc && acc[part], obj);

const parseDate = (dateString) => {
  const [datePart, timePart] = dateString.split(", ");
  const [day, month, year] = datePart.split("/");
  const [hours, minutes, seconds] = timePart.split(":");
  return new Date(year, month - 1, day, hours, minutes, seconds);
};

const manageStorageKeys = (newKey) => {
  let keysList = JSON.parse(localStorage.getItem(STORAGE_KEYS_LIST)) || [];

  if (keysList.length >= MAX_STORAGE_KEYS) {
    const oldestKey = keysList.shift();
    localStorage.removeItem(oldestKey);
  }

  keysList.push(newKey);
  localStorage.setItem(STORAGE_KEYS_LIST, JSON.stringify(keysList));
};

const getStoredColumnsOrder = () => {
  const keysList = JSON.parse(localStorage.getItem(STORAGE_KEYS_LIST)) || [];
  if (keysList.length > 0) {
    const lastKey = keysList[keysList.length - 1];
    const storedOrder = JSON.parse(localStorage.getItem(lastKey));
    return storedOrder || defaultColumnsOrder;
  }
  return defaultColumnsOrder;
};

const TablaResumen = ({ projectId, selectedTab, fetchProjects }) => {
  const router = useRouter();
  const [eventos, setEventos] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [newEventModalOpen, setNewEventModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [selectedArchivos, setSelectedArchivos] = useState([]);

  // Estados para acciones de editar y eliminar
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState(null);

  // Estados para modal de notas de trabajo
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [eventForNotes, setEventForNotes] = useState(null);
  const [workNotes, setWorkNotes] = useState('');
  const [comments, setComments] = useState([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [confirmDeleteNoteOpen, setConfirmDeleteNoteOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  
  // Estados para vista previa de imágenes
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState('');

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [columnsOrder, setColumnsOrder] = useState(getStoredColumnsOrder());
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [initialized, setInitialized] = useState(false);

  const dragColumn = useRef(null);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const formRef = useRef(null);

  const handleUpdateClick = () => {
    if (formRef.current) {
      formRef.current.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      );
    }
  };

  const handleOpenNotificationModal = () => {
    setNotificationModalOpen(true);
  };

  const handleCloseNotificationModal = () => {
    setNotificationModalOpen(false);
  };

  const fetchEventos = useCallback(async () => {
    try {
      if (projectId) {
        const responseData = await GetEventosByProject(projectId);

        if (responseData.data && responseData.data.length > 0) {
          setEventos(responseData.data);
        } else {
          console.warn("No se encontraron eventos.");
          setEventos([]);
        }
      }
    } catch (error) {
      console.error("Error al obtener los eventos:", error);
      setEventos([]);
    }
  }, [projectId]);

  useEffect(() => {
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (initialized) {
      fetchProjects();
      fetchEventos();
    }
  }, [initialized, fetchProjects, fetchEventos]);

  const handleOpenModal = (id_evento) => {
    setSelectedEventId(id_evento);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleOpenNewEventModal = () => {
    setNewEventModalOpen(true);
  };

  const handleCloseNewEventModal = () => {
    setNewEventModalOpen(false);
  };

  const handleOpenUpdateModal = (id_evento) => {
    setSelectedEventId(id_evento);
    setUpdateModalOpen(true);
  };

  const handleCloseUpdateModal = () => {
    setUpdateModalOpen(false);
  };

  // Funciones para manejar las acciones de editar y eliminar
  const handleEditEvent = (evento) => {
    setEventToEdit(evento);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEventToEdit(null);
  };

  const handleDeleteEvent = (evento) => {
    setEventToDelete(evento);
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      if (eventToDelete) {
        // Llamar a la API para eliminar el evento
        await deleteEvento(eventToDelete.id_evento);
        
        // Actualizar la lista de eventos
        await fetchEventos();
        
        // Cerrar modal y limpiar estado
        setConfirmDeleteOpen(false);
        setEventToDelete(null);
        
        // Mostrar mensaje de éxito
        toast.success('Evento eliminado exitosamente');
      }
    } catch (error) {
      console.error('Error al eliminar evento:', error);
      toast.error('Error al eliminar el evento: ' + error.message);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDeleteOpen(false);
    setEventToDelete(null);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const highlightText = (text, highlight) => {
    if (!highlight) return text;
    const parts = text.split(new RegExp(`(${highlight})`, "gi"));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={i}>{part}</mark>
          ) : (
            part
          ),
        )}
      </>
    );
  };

  const filteredEventos = useMemo(
    () =>
      eventos.filter((evento) => {
        const searchString = searchTerm.toLowerCase();
        return columnsOrder.some((column) => {
          const value = getNestedValue(evento, column.accessor);
          return value && value.toString().toLowerCase().includes(searchString);
        });
      }),
    [eventos, searchTerm, columnsOrder],
  );

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedEventos = useMemo(() => {
    if (sortConfig.key) {
      return [...filteredEventos].sort((a, b) => {
        const aValue = getNestedValue(a, sortConfig.key);
        const bValue = getNestedValue(b, sortConfig.key);

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        if (typeof aValue === "string") {
          return (
            aValue.localeCompare(bValue) *
            (sortConfig.direction === "asc" ? 1 : -1)
          );
        } else {
          return (
            (aValue < bValue ? -1 : 1) *
            (sortConfig.direction === "asc" ? 1 : -1)
          );
        }
      });
    }
    return filteredEventos;
  }, [filteredEventos, sortConfig]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedEventos.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(sortedEventos.length / itemsPerPage);
  const maxPageNumbers = 4;

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === "asc" ? <ArrowDropUp /> : <ArrowDropDown />;
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    let startPage = Math.max(1, currentPage - Math.floor(maxPageNumbers / 2));
    let endPage = startPage + maxPageNumbers - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxPageNumbers + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => paginate(i)}
          className={`mx-1 px-3 py-1 border rounded-lg ${currentPage === i ? "text-[#7fa1c6] font-bold border-[#7fa1c6]" : "bg-white text-teal-500 border-teal-500"}`}
        >
          {i}
        </button>,
      );
    }

    return pageNumbers;
  };

  const handleDragStart = (index) => {
    dragColumn.current = index;
  };

  const handleDragEnter = (index) => {
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    const dragIndex = dragColumn.current;
    const hoverIndex = dragOverIndex;

    const reorderedColumns = [...columnsOrder];
    const [draggedColumn] = reorderedColumns.splice(dragIndex, 1);
    reorderedColumns.splice(hoverIndex, 0, draggedColumn);

    setColumnsOrder(reorderedColumns);
    dragColumn.current = null;
    setDragOverIndex(null);

    const columnsOrderKey = uuidv4();
    localStorage.setItem(columnsOrderKey, JSON.stringify(reorderedColumns));
    manageStorageKeys(columnsOrderKey);

    const params = new URLSearchParams(window.location.search);
    params.set(RANDOM_KEY, columnsOrderKey);
    params.set("tab", selectedTab);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    router.replace(newUrl, undefined, { shallow: true });
  };

  const hiddenRoles = ["superintendente", "ITO", "supervisor"];
  const userStore = useSelector((state) => state.user);
  const role = getPrimaryRole(userStore.user);
  const id_usuario = useSelector((state) => state.user.user.id);
  const nombre_usuario = userStore.user ? userStore.user.names : "";

  // Funciones para manejar notas de trabajo
  const handleOpenNotes = async (evento) => {
    setEventForNotes(evento);
    setNotesModalOpen(true);
    setWorkNotes('');
    
    // Cargar las notas existentes del evento
    try {
      setIsLoadingNotes(true);
      const notasData = await getNotasByEventoId(evento.id_evento);
      if (notasData.data && Array.isArray(notasData.data)) {
        setComments(notasData.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error('Error al cargar las notas:', error);
      setComments([]);
      toast.error('Error al cargar las notas de trabajo');
    } finally {
      setIsLoadingNotes(false);
    }
  };

  const handleCloseNotes = () => {
    setNotesModalOpen(false);
    setEventForNotes(null);
    setWorkNotes('');
    setComments([]);
    setSelectedFile(null);
  };

  const handleNotaSubmit = async () => {
    if (!workNotes.trim() && !selectedFile) {
      toast.error('Agrega texto o archivo para publicar');
      return;
    }

    // Preparamos el FormData para enviar texto y archivo (igual que comments)
    const formData = new FormData();
    formData.append("nota", workNotes.trim()); // Asegurar que no hay espacios
    formData.append("usuarioId", String(id_usuario)); // Convertir a string
    
    if (selectedFile) {
      formData.append("file", selectedFile);
    }
    
    console.log("=== DATOS DE LA NOTA DE TRABAJO ===");
    console.log("Evento ID:", eventForNotes.id_evento);
    console.log("Usuario ID:", id_usuario);
    console.log("Texto:", `"${workNotes}"`);
    console.log("Texto trimmed:", `"${workNotes.trim()}"`);
    console.log("Archivo adjunto:", selectedFile ? selectedFile.name : "No hay archivo");
    
    // Debug FormData
    for (let [key, value] of formData.entries()) {
      console.log(`FormData ${key}:`, value);
    }

    let result;
    try {
      // Usamos el servicio createNotaTrabajo con FormData (igual que comments)
      result = await createNotaTrabajo(eventForNotes.id_evento, formData);
        
      // Si el backend responde OK, limpiamos el formulario y refrescamos comentarios
      if (result && (result.statusCode === 200 || result.statusCode === 201)) {
        let nuevoComentario = result.data;
        
        // Asegura que el comentario tenga la estructura correcta
        if (!nuevoComentario.nota) nuevoComentario.nota = workNotes;
        
        // Agrega el usuario para mostrar el nombre
        nuevoComentario.notasTrabajo_usuario = {
          names: nombre_usuario || 'Usuario',
          apellido_p: '',
          apellido_m: '',
        };

        setComments([nuevoComentario, ...comments]);
        setWorkNotes('');
        setSelectedFile(null);
        
        // Limpiar el input de archivo
        const fileInput = document.getElementById('adjuntar-archivo-notas');
        if (fileInput) {
          fileInput.value = '';
        }
        
        toast.success("Nota de trabajo agregada correctamente");
        
        // Enviar notificación cuando se crea una nota de reporte
        try {
          const fileText = selectedFile ? ` (con archivo adjunto: ${selectedFile.name})` : '';
          const noteText = workNotes.trim() ? `"${workNotes.substring(0, 50)}${workNotes.length > 50 ? '...' : ''}"` : 'archivo adjunto';
          await createNotification({
            resumen: `Nueva nota de reporte en evento #${eventForNotes.id_evento}`,
            message: `Se ha creado una nueva nota de reporte: ${noteText}${fileText}`,
            userId: id_usuario,
            id_proyecto: parseInt(projectId, 10),
            fecha: new Date().toISOString()
          });
        } catch (notificationError) {
          console.error('Error enviando notificación:', notificationError);
        }
      } else if (result && result.message) {
        console.error("Error al agregar nota de trabajo:", result.message);
        toast.error(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Error al insertar nota de trabajo:", error);
      console.error("Mensaje de error:", error.message);
      console.error("Stack de error:", error.stack);
      toast.error(`Error: ${error.message || "Error desconocido"}`);
    }
  };

  // Funciones para manejar archivos adjuntos
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validar tamaño del archivo (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('El archivo es demasiado grande. Máximo 10MB.');
        return;
      }
      setSelectedFile(file);
      toast.success(`Archivo seleccionado: ${file.name}`);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    // Limpiar el input de archivo
    const fileInput = document.getElementById('adjuntar-archivo-notas');
    if (fileInput) {
      fileInput.value = '';
    }
    toast.info('Archivo removido');
  };

  // Funciones para eliminar notas
  const handleDeleteNote = (note) => {
    setNoteToDelete(note);
    setConfirmDeleteNoteOpen(true);
  };

  const handleConfirmDeleteNote = async () => {
    try {
      await deleteNotaTrabajo(noteToDelete.id);
      setComments(comments.filter(comment => comment.id !== noteToDelete.id));
      setConfirmDeleteNoteOpen(false);
      setNoteToDelete(null);
      toast.success('Nota eliminada correctamente');
    } catch (error) {
      toast.error('Error al eliminar la nota: ' + error.message);
      console.error('Error al eliminar la nota:', error);
    }
  };

  const handleCancelDeleteNote = () => {
    setConfirmDeleteNoteOpen(false);
    setNoteToDelete(null);
  };

  // Funciones para vista previa de imágenes
  const handleOpenImagePreview = (imageUrl) => {
    setPreviewImageUrl(imageUrl);
    setImagePreviewOpen(true);
  };

  const handleCloseImagePreview = () => {
    setImagePreviewOpen(false);
    setPreviewImageUrl('');
  };

  return (
    <div className="tabla-resumen flex flex-col items-center w-full">
      <div className="w-full flex justify-end mb-4">
        <button
          type="button"
          onClick={handleOpenNewEventModal}
          className={`relative px-4 py-2 font-bold text-white bg-[#7fa1c6] rounded-lg hover:bg-[#5c7891] transition-all duration-200 font-zen-kaku ${hiddenRoles.includes(role) ? "hidden" : ""}`}
        >
          + Nuevo Evento
        </button>
        <button
          type="button"
          onClick={handleOpenNotificationModal}
          className={`relative ml-2 px-4 py-2 font-bold text-white bg-[#7fa1c6] rounded-lg hover:bg-[#5c7891] transition-all duration-200 font-zen-kaku ${hiddenRoles.includes(role) ? "hidden" : ""}`}
        >
          + Enviar Notificación
        </button>
      </div>
      <h2 className="text-xl font-bold mb-4 text-center font-zen-kaku">
        Resumen de Incidentes, Accidentes y Entrenamientos
      </h2>
      <div className="mb-4 w-full flex justify-start font-zen-kaku">
        <input
          type="text"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="px-4 py-2 border rounded-lg w-full outline-none bg-gray-100 hover:bg-white transition-all ease-linear duration-150 focus:bg-white shadow-lg"
        />
      </div>
      <div className="overflow-x-auto w-full">
        <table className="min-w-full bg-white border rounded-lg mx-auto table-fixed font-zen-kaku">
          <thead>
            <tr>
              {columnsOrder.map((column, index) => (
                <th
                  key={column.accessor}
                  className={`py-0 pl-4 border-b text-left table-header select-none ${dragOverIndex === index ? "border-r-4 border-blue-500" : ""} ${getColumnClassName(column.accessor)}`}
                  style={
                    column.accessor === "resumen"
                      ? { minWidth: "200px", wordBreak: "break-word" }
                      : {}
                  }
                >
                  <div className="flex items-center group hover:bg-teal-200 h-10 hover:border-cyan-800 border border-transparent px-1">
                    <span
                      className="truncate multi-line"
                      onClick={() => handleSort(column.accessor)}
                    >
                      {column.Header} {renderSortIcon(column.accessor)}
                    </span>
                    <div
                      draggable
                      onDragStart={(e) => {
                        e.stopPropagation();
                        handleDragStart(index);
                      }}
                      onDragEnter={(e) => {
                        e.preventDefault();
                        handleDragEnter(index);
                      }}
                      onDragEnd={(e) => {
                        e.stopPropagation();
                        handleDragEnd();
                      }}
                      className="ml-2 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity dragging-cursor hover:bg-teal-400 rounded-sm"
                    >
                      <DragIndicator />
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentItems.length === 0 ? (
              <tr>
                <td
                  colSpan={columnsOrder.length}
                  className="text-center py-4 font-light font-zen-kaku"
                >
                  Cargando..
                </td>
              </tr>
            ) : (
              currentItems.map((evento, rowIndex) => (
                <tr
                  key={evento.id_evento}
                  className={`h-auto ${rowIndex % 2 === 0 ? "bg-white" : "bg-gray-100"}`}
                >
                  {columnsOrder.map((column, colIndex) => {
                    const value = getNestedValue(evento, column.accessor);
                    const displayValue = value != null ? value.toString() : "";

                    return (
                      <td
                        key={column.accessor}
                        className={`py-0 px-4 ${dragOverIndex === colIndex ? "border-r-4 border-blue-500" : ""} ${getColumnClassName(column.accessor)}`}
                        style={{
                          textAlign:
                            column.accessor === "notification"
                              ? "center"
                              : "left",
                          wordBreak: "break-word",
                          overflowWrap: "break-word",
                        }}
                      >
                        {column.accessor === "id_evento" ? (
                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handleOpenUpdateModal(evento.id_evento);
                            }}
                            className="text-blue-500 hover:underline"
                          >
                            {displayValue}
                          </a>
                        ) : column.accessor === "notification" ? (
                          <input type="checkbox" checked={!!value} readOnly />
                        ) : column.accessor === "archivos" ? (
                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handleOpenModal(evento.id_evento);
                            }}
                            className="text-blue-500 hover:underline"
                          >
                            Ver Archivos
                          </a>
                        ) : column.accessor === "acciones" ? (
                          <div className="flex gap-2 justify-center">
                            <Tooltip title="Notas de reporte/trabajo" arrow>
                              <button
                                onClick={() => handleOpenNotes(evento)}
                                className="p-1 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100 rounded transition-colors"
                              >
                                <StickyNote2 fontSize="small" />
                              </button>
                            </Tooltip>
                            <Tooltip title="Editar evento" arrow>
                              <button
                                onClick={() => handleEditEvent(evento)}
                                className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                              >
                                <Edit fontSize="small" />
                              </button>
                            </Tooltip>
                            <Tooltip title="Eliminar evento" arrow>
                              <button
                                onClick={() => handleDeleteEvent(evento)}
                                className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors"
                              >
                                <Delete fontSize="small" />
                              </button>
                            </Tooltip>
                          </div>
                        ) : column.accessor === "resumen" ? (
                          <Tooltip
                            title={displayValue}
                            arrow
                            PopperProps={{
                              modifiers: [
                                {
                                  name: "offset",
                                  options: { offset: [0, 8] },
                                },
                              ],
                              sx: {
                                "& .MuiTooltip-tooltip": {
                                  backgroundColor: "black",
                                  borderRadius: "0.25rem",
                                  color: "white",
                                  fontSize: "0.875rem",
                                },
                                "& .MuiTooltip-arrow": {
                                  color: "black",
                                },
                              },
                            }}
                            classes={{
                              tooltip: "bg-black text-white p-2 rounded",
                              arrow: "text-black",
                            }}
                          >
                            <span className="cursor-pointer">
                              {highlightText(
                                displayValue.length > 50
                                  ? `${displayValue.substring(0, 50)}...`
                                  : displayValue,
                                searchTerm,
                              )}
                            </span>
                          </Tooltip>
                        ) : column.accessor.includes("fecha") ? (
                          parseDate(displayValue).toLocaleString("es-ES", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })
                        ) : (
                          highlightText(displayValue, searchTerm)
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="relative w-full mt-4 font-zen-kaku">
        <div className="w-full flex justify-center">
          <div
            className="w-full bg-white border-t mx-auto"
            style={{ minWidth: "600px" }}
          >
            <div className="flex justify-between items-center mt-4 w-full px-4">
              <div>
                <label htmlFor="itemsPerPage" className="mr-2">
                  Filas por página:
                </label>
                <select
                  id="itemsPerPage"
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="border rounded-lg p-1"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => paginate(1)}
                  disabled={currentPage === 1}
                  className="mx-1 px-3 py-1 rounded-lg bg-[#7fa1c6] text-white shadow transition-all duration-200 hover:bg-[#5c7891] disabled:opacity-60"
                >
                  <FirstPage />
                </button>
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="mx-1 px-3 py-1 rounded-lg bg-[#7fa1c6] text-white shadow transition-all duration-200 hover:bg-[#5c7891] disabled:opacity-60"
                >
                  <ArrowBack />
                </button>
                {renderPageNumbers()}
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="mx-1 px-3 py-1 rounded-lg bg-[#7fa1c6] text-white shadow transition-all duration-200 hover:bg-[#5c7891] disabled:opacity-60"
                >
                  <ArrowForward />
                </button>
                <button
                  onClick={() => paginate(totalPages)}
                  disabled={currentPage === totalPages}
                  className="mx-1 px-3 py-1 rounded-lg bg-[#7fa1c6] text-white shadow transition-all duration-200 hover:bg-[#5c7891] disabled:opacity-60"
                >
                  <LastPage />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            maxWidth: 600,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          <h2 id="modal-title" className="text-lg font-bold mb-4"></h2>
          <FileUpload eventId={selectedEventId} />
          <ul id="modal-description" className="mt-4">
            {selectedArchivos &&
              selectedArchivos.map((archivo, index) => (
                <li key={index}>
                  <a
                    href={archivo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    Archivo {index + 1}
                  </a>
                </li>
              ))}
          </ul>
        </Box>
      </Modal>
      <Modal
        open={newEventModalOpen}
        onClose={handleCloseNewEventModal}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            bgcolor: "background.paper",
            border: "2px solid #fff",
            boxShadow: 24,
            borderRadius: 2,
            p: 4,
          }}
        >
          <div className="flex justify-end">
            <Button
              onClick={handleCloseNewEventModal}
              className="bg-red-500 text-white hover:bg-red-700 font-zen-kaku"
            >
              Cerrar
            </Button>
          </div>
          <PrevencionForm
            closeModal={handleCloseNewEventModal}
            refreshEventos={fetchEventos}
            fetchProjects={fetchProjects}
          />
        </Box>
      </Modal>
      <Modal
        open={updateModalOpen}
        onClose={handleCloseUpdateModal}
        aria-labelledby="update-modal-title"
        aria-describedby="update-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: {
              xs: "90%", // Ancho en dispositivos móviles
              sm: "80%", // Ancho en tabletas
              md: 800, // Ancho en pantallas medianas
              lg: 1000, // Ancho en pantallas grandes
              xl: 1200, // Ancho en pantallas extra grandes
            },
            maxHeight: "90vh", // Para evitar que el modal sea más alto que la ventana
            overflowY: "auto", // Permite scroll en el contenido si es demasiado alto
            bgcolor: "background.paper",
            border: "2px solid #fff",
            boxShadow: 24,
            p: 4,
            borderRadius: 3,
          }}
        >
          <div className="flex justify-end">
            <button
              onClick={handleUpdateClick}
              className="w-40  h-12 py-3 bg-teal-500 text-white font-bold rounded-lg hover:bg-teal-600"
            >
              Actualizar
            </button>
            <Button
              onClick={handleCloseUpdateModal}
              className="bg-red-500 text-white hover:bg-red-700"
            >
              Cerrar
            </Button>
          </div>
          <ActualizarPrevencionForm
            closeModal={handleCloseUpdateModal}
            refreshEventos={fetchEventos}
            eventId={selectedEventId}
            formRef={formRef}
          />
        </Box>
      </Modal>
      <Modal
        open={notificationModalOpen}
        onClose={handleCloseNotificationModal}
        aria-labelledby="notification-modal-title"
        aria-describedby="notification-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            bgcolor: "background.paper",
            border: "2px solid #fff",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          <div className="flex justify-end">
            <Button
              onClick={handleCloseNotificationModal}
              className="bg-red-500 text-white hover:bg-red-700"
            >
              Cerrar
            </Button>
          </div>
          <NotificationForm closeModal={handleCloseNotificationModal} />
        </Box>
      </Modal>

      {/* Modal para editar evento */}
      <Modal
        open={editModalOpen}
        onClose={handleCloseEditModal}
        aria-labelledby="edit-modal-title"
        aria-describedby="edit-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: {
              xs: "90%",
              sm: "500px", 
              md: 500,
              lg: 500,
              xl: 500,
            },
            maxHeight: "90vh",
            overflowY: "auto",
            bgcolor: "background.paper",
            border: "2px solid #fff",
            boxShadow: 24,
            p: 4,
            borderRadius: 3,
          }}
        >
          <div className="flex justify-end mb-4">
            <Button
              onClick={handleCloseEditModal}
              className="bg-red-500 text-white hover:bg-red-700"
            >
              Cerrar
            </Button>
          </div>
          {eventToEdit && (
            <ActualizarPrevencionForm
              closeModal={handleCloseEditModal}
              refreshEventos={fetchEventos}
              eventId={eventToEdit.id_evento}
              formRef={formRef}
            />
          )}
          <div className="flex justify-center mt-4">
            <button
              onClick={handleUpdateClick}
              className="px-6 py-3 bg-teal-500 text-white font-bold rounded-lg hover:bg-teal-600 transition-colors"
            >
              Guardar Cambios
            </button>
          </div>
        </Box>
      </Modal>

      {/* Modal de confirmación para eliminar */}
      <Modal
        open={confirmDeleteOpen}
        onClose={handleCancelDelete}
        aria-labelledby="confirm-delete-title"
        aria-describedby="confirm-delete-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 450,
            bgcolor: "background.paper",
            border: "none",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          {/* Header con icono */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h2 id="confirm-delete-title" className="text-lg font-semibold text-gray-900">
                  Confirmar Eliminación
                </h2>
                <p className="text-sm text-gray-500">Esta acción no se puede deshacer</p>
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="px-6 py-4">
            <p id="confirm-delete-description" className="text-gray-700 leading-relaxed">
              ¿Estás seguro de que deseas eliminar este evento?
              <br />
              <span className="font-medium text-gray-900 mt-2 block">"{eventToDelete?.resumen}"</span>
            </p>
          </div>

          {/* Footer con botones */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
            <Button
              onClick={handleCancelDelete}
              variant="outlined"
              sx={{
                color: '#6b7280',
                borderColor: '#d1d5db',
                '&:hover': {
                  borderColor: '#9ca3af',
                  backgroundColor: '#f9fafb'
                }
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmDelete}
              variant="contained"
              sx={{
                backgroundColor: '#dc2626',
                '&:hover': {
                  backgroundColor: '#b91c1c'
                }
              }}
            >
              Eliminar
            </Button>
          </div>
        </Box>
      </Modal>

      {/* Modal para notas de trabajo */}
      <Modal
        open={notesModalOpen}
        onClose={handleCloseNotes}
        aria-labelledby="notes-modal-title"
        aria-describedby="notes-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: {
              xs: "90%",
              sm: "80%", 
              md: 800,
              lg: 900,
              xl: 1000,
            },
            maxHeight: "90vh",
            overflowY: "auto",
            bgcolor: "background.paper",
            border: "2px solid #fff",
            boxShadow: 24,
            p: 4,
            borderRadius: 3,
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800 font-zen-kaku">
              Notas de Reporte - Evento #{eventForNotes?.id_usuario}
            </h2>
            <Button
              onClick={handleCloseNotes}
              className="bg-red-500 text-white hover:bg-red-700"
            >
              Cerrar
            </Button>
          </div>
          
          {eventForNotes && (
            <div className="w-full p-4 bg-white shadow-lg rounded-lg font-zen-kaku">
              <h3 className="text-xl font-bold mb-4">Notas de Reporte</h3>
              
              {/* Área para escribir nueva nota */}
              <textarea
                className="w-full h-20 p-3 border-l-4 border-yellow-400 rounded-lg mb-4 focus:border-gray-500 focus:ring-teal-500 focus:outline-none"
                placeholder="Escribe tus notas aquí..."
                value={workNotes}
                onChange={(e) => setWorkNotes(e.target.value)}
              />

              <div className="relative mt-6" style={{ minHeight: 48 }}>
                {/* Botón Publicar a la esquina inferior izquierda */}
                <div className="absolute left-0 bottom-0 flex items-center gap-2">
                  <button
                    type="button"
                    className="px-6 py-2 bg-[#597387] hover:bg-[#42536a] rounded-lg text-white font-bold transition-all ease-linear duration-150 font-zen-kaku disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={!workNotes.trim() && !selectedFile}
                    onClick={handleNotaSubmit}
                  >
                    Publicar
                  </button>
                </div>
                {/* Adjuntar archivo y nombre de archivo a la derecha */}
                <div className="absolute right-0 bottom-0 flex items-center gap-2">
                  <input
                    id="adjuntar-archivo-notas"
                    type="file"
                    accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx"
                    onChange={handleFileSelect}
                    style={{ display: "none" }}
                  />
                  <label
                    htmlFor="adjuntar-archivo-notas"
                    className="flex items-center cursor-pointer px-3 py-2 rounded hover:bg-gray-100 transition-colors duration-150"
                    title="Adjuntar archivo"
                  >
                    <Paperclip size={20} className="text-gray-500" />
                    <span className="ml-1 text-sm text-gray-500">Adjuntar</span>
                  </label>
                  {selectedFile && (
                    <div className="ml-2 flex items-center gap-2">
                      <span className="text-sm text-gray-600 font-zen-kaku">
                        Archivo: {selectedFile.name}
                      </span>
                      <button
                        onClick={handleRemoveFile}
                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-100 transition-colors"
                        title="Remover archivo"
                      >
                        <DeleteOutline fontSize="small" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Lista de comentarios existentes */}
              <h4 className="text-lg font-semibold mb-3 text-gray-700">
                Reportes ({comments.length})
              </h4>
              
              {isLoadingNotes ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                </div>
              ) : (
                <div className="space-y-4 overflow-y-auto" style={{ maxHeight: '400px' }}>
                  {comments.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      No hay notas de reporte para este evento
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="p-4 bg-gray-50 border-l-4 border-yellow-400 rounded-lg shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            {comment.notasTrabajo_usuario && (
                              <p className="font-semibold text-gray-700">
                                {comment.notasTrabajo_usuario.names} {comment.notasTrabajo_usuario.apellido_p} {comment.notasTrabajo_usuario.apellido_m}
                              </p>
                            )}
                            <p className="text-xs text-gray-500">
                              {format(new Date(comment.createdAt), 'dd/MM/yyyy HH:mm')}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {comment.fileUrl && (
                              <Tooltip title="Descargar archivo adjunto" arrow>
                                <button
                                  onClick={() => window.open(comment.fileUrl, '_blank')}
                                  className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                                >
                                  <GetApp fontSize="small" />
                                </button>
                              </Tooltip>
                            )}
                            <button
                              type="button"
                              className="px-2 py-1 bg-red-500 hover:bg-red-600 rounded text-white text-xs font-bold"
                              onClick={() => handleDeleteNote(comment)}
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                        <p className="text-gray-600 mb-2">{comment.nota}</p>
                        {/* Mostrar imagen si es un archivo de imagen - usar fileOriginalName o fileUrl para detectar tipo */}
                        {comment.fileUrl &&
                          ((comment.fileOriginalName && /\.(jpg|jpeg|png|gif)$/i.test(comment.fileOriginalName)) ||
                           /\.(jpg|jpeg|png|gif)$/i.test(comment.fileUrl)) && (
                            <div className="mt-3">
                              <img
                                src={comment.fileUrl}
                                alt="Adjunto"
                                onClick={() => handleOpenImagePreview(comment.fileUrl)}
                                className="cursor-pointer hover:opacity-80 transition-opacity"
                                style={{
                                  maxWidth: 400,
                                  maxHeight: 400,
                                  width: "100%",
                                  height: "auto",
                                  marginBottom: 10,
                                  borderRadius: 8,
                                  objectFit: "contain",
                                }}
                                title="Haz clic para ver en tamaño completo"
                              />
                            </div>
                          )}

                        {comment.fileOriginalName && (
                          <div className="flex items-center gap-2 text-sm text-blue-600 mt-2">
                            <AttachFile fontSize="small" />
                            <span>{comment.fileOriginalName}</span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </Box>
      </Modal>

      {/* Modal de confirmación para eliminar nota */}
      <ConfirmModal
        open={confirmDeleteNoteOpen}
        mensaje={"¿Estás seguro que quieres eliminar esta nota de trabajo?"}
        onConfirm={handleConfirmDeleteNote}
        onCancel={handleCancelDeleteNote}
      />

      {/* Modal de vista previa de imagen */}
      <Modal
        open={imagePreviewOpen}
        onClose={handleCloseImagePreview}
        aria-labelledby="image-preview-modal"
        aria-describedby="image-preview-description"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            maxWidth: '95vw',
            maxHeight: '95vh',
            outline: 'none',
            border: 'none',
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            cursor: 'pointer',
          }}
          onClick={handleCloseImagePreview}
        >
          {previewImageUrl && (
            <img
              src={previewImageUrl}
              alt="Vista previa"
              style={{
                width: 'auto',
                height: 'auto',
                maxWidth: '95vw',
                maxHeight: '95vh',
                objectFit: 'contain',
                display: 'block',
              }}
              onClick={(e) => e.stopPropagation()}
            />
          )}
          
          {/* Botón X elegante en la esquina superior derecha */}
          <button
            onClick={handleCloseImagePreview}
            className="absolute top-4 right-4 w-10 h-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
            style={{ fontSize: '20px', fontWeight: 'bold' }}
          >
            ×
          </button>
          
          {/* Indicador sutil de "clic para cerrar" */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm opacity-70">
            Clic para cerrar
          </div>
        </Box>
      </Modal>

    </div>
  );
};

export default TablaResumen;
