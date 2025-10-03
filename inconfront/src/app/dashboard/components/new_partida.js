import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ChevronsRight,
  User,
  Phone,
  Mail,
  Loader,
  Calendar,
  CircleArrowDown,
  BadgePercent,
  Filter,
  Search,
  SlidersHorizontal,
  ChevronRight,
  FileText,
  X,
  Check,
  CloudUpload,
  CircleDollarSign,
  Info,
  Lock,
  Unlock,
  Trash2,
  MessageCircle,
  ChevronsLeft,
} from "lucide-react";
import DatePicker, { registerLocale } from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import es from "date-fns/locale/es";
registerLocale("es", es);
import { parse, format, toDate, isWithinInterval } from "date-fns-tz";
import CommentSection from "./comments";
import Select from "react-select";
import {
  getEstadotarea,
  getPrioridad,
  getlistUser,
  deleteProjectItem
} from "@/app/services/partidas";
import {
  updatePartidanewpartida,
  updatesubPartidanewpartida,
  updateTareanewpartida,
  updateSubtareanewpartida,
  getfechabyid,
} from "@/app/services/project";
import {
  uploadDocumentPartida,
  getDocumentsByEntityId,
  markDocumentAsDeleted,
} from "@/app/services/my_document";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import "../style/media_query.css";
import "../style/custom_confirmation.css";
import ReactDOM from "react-dom";
import { confirmDialog } from 'primereact/confirmdialog';
import { ConfirmDialog } from 'primereact/confirmdialog';
import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primeicons/primeicons.css';

const Modal = ({ onClose, onAdd, partidaId, tipo, userId }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedCount, setSelectedCount] = useState(0);

  const fileInputRef = useRef(null);
  const maxFiles = 10;

  // Obtener el rol del usuario
  const userStore = useSelector((state) => state.user);
  const isSuperintendente =
    userStore.user?.roles?.[0]?.name === "superintendente";

  const fetchDocuments = useCallback(async () => {
    try {
      const response = await getDocumentsByEntityId(partidaId, tipo);
      setDocuments(response);
    } catch (error) {
      console.error("Error al obtener los documentos:", error);
      toast.error("Error al obtener los documentos");
    }
  }, [partidaId, tipo]);

  useEffect(() => {
    if (partidaId && tipo && userId) {
      fetchDocuments();
    }
  }, [partidaId, tipo, userId, fetchDocuments]);

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    if (files.length + selectedFiles.length > maxFiles) {
      toast.error(`Solo se permiten hasta ${maxFiles} archivos por carga.`);
      return;
    }
    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragOver(false);
    const selectedFiles = Array.from(event.dataTransfer.files);
    if (files.length + selectedFiles.length > maxFiles) {
      toast.error(`Solo se permiten hasta ${maxFiles} archivos por carga.`);
      return;
    }
    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
  };

  const handleAdd = async () => {
    if (!partidaId || !tipo || !userId) {
      toast.error("Faltan parámetros requeridos");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });
    formData.append(
      "dataupload",
      JSON.stringify({
        documentType: tipo,
        partidaId: partidaId,
        tipo: tipo,
        userId: userId,
      }),
    );

    try {
      const response = await uploadDocumentPartida(formData);
      toast.success("Documentos subidos correctamente");
      onAdd(files);
      setFiles([]);
      fetchDocuments();
    } catch (error) {
      console.error("Error al subir los documentos:", error);
      toast.error("Error al subir los documentos");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const handleDeleteDocument = async (documentId) => {
    try {
      await markDocumentAsDeleted(documentId);
      toast.success("Documento marcado como eliminado correctamente");
      fetchDocuments();
    } catch (error) {
      console.error("Error al marcar el documento como eliminado:", error);
      toast.error("Error al marcar el documento como eliminado");
    }
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleCheckboxChange = (documentId) => {
    if (selectedDocuments.includes(documentId)) {
      setSelectedDocuments((prevSelected) =>
        prevSelected.filter((id) => id !== documentId),
      );
    } else {
      setSelectedDocuments((prevSelected) => [...prevSelected, documentId]);
    }
  };

  const handleDeleteSelectedDocuments = () => {
    setShowConfirmation(true);
  };

  const confirmDeleteSelectedDocuments = async () => {
    try {
      await Promise.all(
        selectedDocuments.map(async (documentId) => {
          await markDocumentAsDeleted(documentId);
        }),
      );
      toast.success("Documentos eliminados correctamente");
      setSelectedDocuments([]);
      fetchDocuments();
    } catch (error) {
      console.error("Error eliminar documentos :", error);
      toast.error("Error eliminar documentos ");
    } finally {
      setShowConfirmation(false);
    }
  };

  const cancelDeleteSelectedDocuments = () => {
    setShowConfirmation(false);
  };

  useEffect(() => {
    setSelectedCount(selectedDocuments.length);
  }, [selectedDocuments]);

  return ReactDOM.createPortal(
    <div
      className="fixed top-0 left-0 right-0 w-full min-h-full bottom-0 flex justify-center items-center bg-black bg-opacity-50 z-50 select-none"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-8 shadow-lg font-zen-kaku"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-black mr-20 font-zen-kaku">
            Carga tus documentos
          </h2>
          <button onClick={onClose} type="button">
            <X
              strokeWidth={3}
              size={24}
              className="stroke-[#828080] hover:stroke-[#504e4e] transition-all ease-linear duration-150"
            />
          </button>
        </div>
        <div
          className={`border-2 p-4 text-center mb-4 rounded-lg transition-all duration-300 ease-in-out ${
            isDragOver
              ? "bg-yellow-100 border-yellow-400"
              : "bg-gray-100 border-gray-300"
          } ${isDragOver ? "shadow-xl" : "shadow-md"}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <CloudUpload
            size={48}
            className="mx-auto mb-4 stroke-teal-500 opacity-60"
          />
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
            ref={fileInputRef}
            disabled={isSuperintendente}
          />
          {loading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
          ) : (
            <div className="text-[#635F60] font-semibold font-zen-kaku">
              <p className="mb-2">
                Haga clic o arrastre los archivos aquí para cargarlos
              </p>
              <p className="text-sm font-normal">Solo admite PDF, DOCX, IMG</p>
              <p className="text-sm font-normal">
                El archivo máximo está limitado a 30 MB
              </p>
              {isSuperintendente && (
                <p className="text-red-500 text-xs mt-2">
                  No tienes permisos para agregar archivos.
                </p>
              )}
            </div>
          )}
        </div>

        {files.length > 0 && (
          <div className="mt-4 max-h-48 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-2">
              Archivos seleccionados:
            </h3>
            {files.map((file, index) => (
              <div
                key={index}
                className="flex justify-between items-center mb-2"
              >
                <div className="flex items-center">
                  <FileText size={19} className="stroke-teal-500 mr-4" />
                  <span className="truncate max-w-[200px]">
                    {file.name.length > 20
                      ? `...${file.name.substring(file.name.length - 20)}`
                      : file.name}
                  </span>
                </div>
                <div className="flex items-center">
                  <Check
                    size={20}
                    strokeWidth={3}
                    className="text-green-500 mr-4"
                  />
                  <button
                    onClick={() => handleDeleteFile(index)}
                    type="button"
                    disabled={isSuperintendente}
                  >
                    <Trash2
                      size={19}
                      className="stroke-teal-500 hover:stroke-teal-600"
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {documents.length > 0 && (
          <div className="mt-4 max-h-48 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-2 flex justify-between items-center">
              Documentos adjuntos:
              {selectedDocuments.length > 0 && !isSuperintendente && (
                <button
                  onClick={handleDeleteSelectedDocuments}
                  className="text-red-500 px-2 py-1 font-bold rounded-md hover:text-white bg-red-100 hover:bg-red-500 transition-all ease-linear duration-150"
                  type="button"
                >
                  Eliminar ({selectedCount})
                </button>
              )}
            </h3>
            <ul className="divide-y divide-gray-200">
              {documents.map((document, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center py-2"
                >
                  <div className="flex flex-row items-center">
                    <input
                      type="checkbox"
                      checked={selectedDocuments.includes(document.id)}
                      onChange={() => handleCheckboxChange(document.id)}
                      className="mr-3"
                    />
                    <FileText size={19} className="stroke-teal-500 mr-4" />
                    <a
                      href={document.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline truncate max-w-[200px]"
                    >
                      {document.filenames.length > 20
                        ? `...${document.filenames.substring(document.filenames.length - 20)}`
                        : document.filenames}
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {showConfirmation && !isSuperintendente && (
          <div className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-8 rounded-lg shadow-lg w-96">
              <p className="text-lg font-semibold mb-4">
                ¿Está seguro que desea eliminar los documentos seleccionados?
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Esta acción es irreversible.
              </p>
              <div className="flex justify-end">
                <button
                  onClick={confirmDeleteSelectedDocuments}
                  className="text-white bg-red-500 px-4 py-2 font-bold rounded-md mr-2 hover:bg-red-600 transition-all ease-linear duration-150"
                  type="button"
                >
                  Eliminar
                </button>
                <button
                  onClick={cancelDeleteSelectedDocuments}
                  className="text-[#635F60] px-4 py-2 font-bold rounded-md hover:text-[#424242] transition-all ease-linear duration-150"
                  type="button"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-row justify-end">
          <button
            onClick={onClose}
            className="text-[#635F60] px-2 py-1 mr-10 font-bold rounded-md hover:text-[#424242] transition-all ease-linear duration-150"
          >
            Cancelar
          </button>
          {files.length > 0 && !loading && !isSuperintendente && (
            <button
              onClick={handleAdd}
              type="button"
              className="text-black bg-teal-500 px-3 py-1 font-bold rounded-md hover:bg-teal-600 hover:text-white transition-all ease-linear duration-150"
            >
              Agregar
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};

// carga de doc

const Sidebarpartida = ({
  isAnimating,
  blockClose,
  toggleBlockClose,
  isSidebarOpen,
  toggleSidebar,
  nivel,
  tipo,
  id,
  recargartabla,
  id_proyecto,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isSearchable, setIsSearchable] = useState(true);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  const [partidaDateRange, setPartidaDateRange] = useState([null, null]);
  const [subpartidaDateRange, setSubpartidaDateRange] = useState([null, null]);
  const [tareaDateRange, setTareaDateRange] = useState([null, null]);
  const [fechasProyecto, setFechasProyecto] = useState({
    fecha_ini: null,
    fecha_term: null,
  });

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  // Controla el bloqueo del cerrado
  const popupRef = useRef(null);

  const [prevValues, setPrevValues] = useState({
    avance: 0,
    name: "",
  });

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  // Función para manejar clics fuera del popup
  // Define handleClickOutside usando useCallback para memorizar la función
  const handleClickOutside = useCallback(
    (event) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target) &&
        !blockClose
      ) {
        setIsPopupOpen(false); // Cierra el popup si no está bloqueado
      }
    },
    [popupRef, blockClose],
  );

  useEffect(() => {
    if (isPopupOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside); // Limpia el evento cuando se desmonta o se cierra el popup
    };
  }, [isPopupOpen, blockClose, handleClickOutside]); // Dependencias actualizadas

  // carga de doc
  const adjustDate = (dateString) => {
    const date = new Date(dateString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + userTimezoneOffset);
  };

  useEffect(() => {
    const fechaproyecto = async () => {
      try {
        const data = await getfechabyid(id_proyecto);
        if (data && data.length > 0) {
          const fecha_ini = adjustDate(data[0].fecha_inicio);
          const fecha_term = adjustDate(data[0].fecha_termino);
          setFechasProyecto({ fecha_ini, fecha_term });
        }
      } catch (error) {
        console.error("Error fetching project dates:", error);
      }
    };

    fechaproyecto();
  }, [id_proyecto]);

  const [inputValues, setInputValues] = useState({
    nombre: "",
    responsable: "",
    telefono: "",
    correo: "",
  });
  const [avance, setAvance] = useState(0);
  const [name, setName] = useState("");

  const userStore = useSelector((state) => state.user);
  const nombre_usuario = userStore.user ? `${userStore.user.names}` : "";
  const id_usuario = userStore.user ? `${userStore.user.id}` : "";
  const isSuperintendente =
    userStore.user?.roles?.[0]?.name === "superintendente";

  useEffect(() => {
    if (nivel) {
      setAvance(nivel.avancepart || 0);
      setName(nivel.nombre || "");
      setPrevValues({
        name: nivel.nombre || "",
      });
    }
  }, [nivel]);

  useEffect(() => {
    if (nivel) {
      setName(nivel.nombre || "");
    }
  }, [nivel]);

  useEffect(() => {
    if (nivel) {
      const responsable =
        [
          nivel.user?.names || "",
          nivel.user?.apellido_p || "",
          nivel.user?.apellido_m || "",
        ]
          .filter(Boolean)
          .join(" ") || null;

      setInputValues({
        nombre: nivel?.nombre || "",
        responsable: responsable,
        telefono: nivel.user?.telefono || null,
        correo: nivel.user?.email || null,
      });
    }
  }, [nivel]);

  // opciones de lista de usuarios
  const [userOptions, setuserOptions] = useState([]);
  const [selecteduser, setuser] = useState(null);
  const [userPhone, setUserPhone] = useState("");
  const [email, setemail] = useState("");

  useEffect(() => {
    const fetchuserOptions = async () => {
      try {
        const data = await getlistUser();
        const formattedOptions = data.map((list) => ({
          value: list.id_usuario,
          label: `${list.nombre_usuario} ${list.apellido_paterno} ${list.apellido_materno}`,
          telefono: list.telefono,
          email: list.email,
        }));
        setuserOptions(formattedOptions);
      } catch (error) {
        console.error("Error fetching user options:", error);
      }
    };

    fetchuserOptions();
  }, []);

  // Estado para las opciones de estado
  const [estadoOptions, setestadoOptions] = useState([]);
  const [selectedestado, setestado] = useState(null);

  useEffect(() => {
    const fetchestadoOptions = async () => {
      try {
        const data = await getEstadotarea();
        const formattedOptions = data.map((estado) => ({
          value: estado.id_estado,
          label: estado.nombre_estado,
        }));
        setestadoOptions(formattedOptions);
      } catch (error) {
        console.error("Error fetching estado de tarea options:", error);
      }
    };

    fetchestadoOptions();
  }, []);

  // Estado para las opciones de prioridad
  const [prioridadOptions, setprioridadOptions] = useState([]);
  const [selectedprioridad, setprioridad] = useState(null);

  useEffect(() => {
    const fetchprioridadOptions = async () => {
      try {
        const data = await getPrioridad();
        const formattedOptions = data.map((prioridad) => ({
          value: prioridad.id_prioridad,
          label: prioridad.nombre_prioridad,
        }));
        setprioridadOptions(formattedOptions);
      } catch (error) {
        console.error("Error fetching prioridad options:", error);
      }
    };

    fetchprioridadOptions();
  }, []);

  useEffect(() => {
    if (nivel) {
      const userId = nivel.user?.id;

      if (userId) {
        const selectedOption = userOptions.find(
          (option) => option.value === userId,
        );
        setuser(selectedOption || null);
      } else {
        setuser(null);
      }
      const estadoId = nivel.id_estado;
      if (estadoId) {
        const selectedOption = estadoOptions.find(
          (option) => option.value === estadoId,
        );
        setestado(selectedOption);
      } else {
        setestado(null);
      }
      const prioridadId = nivel.prioridadpart;
      if (prioridadId) {
        const selectedOption = prioridadOptions.find(
          (option) => option.value === prioridadId,
        );
        setprioridad(selectedOption);
      } else {
        setprioridad(null);
      }
      const adjustDate = (dateString) => {
        const date = new Date(dateString);
        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() + userTimezoneOffset);
      };
      const start = nivel.fechainicio ? adjustDate(nivel.fechainicio) : null;
      const end = nivel.fechatermino ? adjustDate(nivel.fechatermino) : null;
      setDateRange([start, end]);
    }
  }, [nivel, userOptions, estadoOptions, prioridadOptions]);

  useEffect(() => {
    if (selecteduser) {
      setUserPhone(selecteduser.telefono || "");
      setemail(selecteduser.email || "");
    } else {
      setUserPhone(inputValues.telefono || "");
      setemail(inputValues.correo || "");
    }
  }, [selecteduser, inputValues]);

  const handleSelectUser = async (selectedOption) => {
    if (selectedOption) {
      setuser(selectedOption);
      setUserPhone(selectedOption.telefono);
      setemail(selectedOption.email);
      await updateData(selectedOption, "user");
    } else {
      setUserPhone(userPhone);
      setemail(email);
      await updateData(null, "user");
    }
  };

  const handleSelectEstado = async (selectedOption) => {
    setestado(selectedOption);
    await updateData(selectedOption, "estado");
  };

  const handleSelectprioridad = async (selectedOption) => {
    setprioridad(selectedOption);
    await updateData(selectedOption, "prioridad");
  };

  const handleBlur = async () => {
    let value = parseFloat(avance.replace(",", "."));

    if (isNaN(value) || value < 0) {
      value = 0;
    } else if (value > 100) {
      value = 100;
    } else {
      value = value.toFixed(1);
    }

    setAvance(value);
    await updateData(selecteduser, "user");
  };

  const handleBlurname = async () => {
    if (prevValues.name !== name) {
      await updateData(name, "nombre");
      setPrevValues((prev) => ({ ...prev, name })); // Actualizamos los valores previos solo si se hace una actualización
    }
  };

  const handleChange = (e) => {
    const inputValue = e.target.value.replace(",", ".");
    const regex = /^(\d{0,3})(\.\d?)?$/;

    if (regex.test(inputValue) && inputValue <= 100) {
      setAvance(inputValue);
    }
  };

  //formatear fecha inicio y termino

  const formatDate = (date) => {
    if (!date) return null;
    return date.toISOString().split("T")[0]; // yyyy-MM-dd
  };

  //actualizar partida
  const updateData = async (selectedOption, fieldType) => {
    if (!selectedOption) return;

    let updateData = {};

    if (tipo === "partida") {
      if (fieldType === "user") {
        updateData = {
          id_usuario: selectedOption.value,
          email_user: selectedOption.email,
          telefono_user: selectedOption.telefono,
        };
      } else if (fieldType === "estado") {
        updateData = {
          id_EstadoTarea: selectedOption.value,
        };
      } else if (fieldType === "prioridad") {
        updateData = {
          prioridad: selectedOption.value,
        };
      }
      updateData.avance = avance;
      updateData.nombre_partida = name;

      try {
        const response = await updatePartidanewpartida(id, updateData);
        toast.success(`Campo ${name} actualizado correctamente`);
        recargartabla();
      } catch (error) {
        console.error("Error updating partida:", error);
      }
    } else if (tipo === "subpartida") {
      if (fieldType === "user") {
        updateData = {
          id_usuario: selectedOption.value,
          email_user: selectedOption.email,
          telefono_user: selectedOption.telefono,
        };
      } else if (fieldType === "estado") {
        updateData = {
          id_EstadoTarea: selectedOption.value,
        };
      } else if (fieldType === "prioridad") {
        updateData = {
          prioridad: selectedOption.value,
        };
      }

      updateData.avance = avance;
      updateData.nombre_sub_partida = name;

      try {
        const response = await updatesubPartidanewpartida(id, updateData);
        toast.success(`Campo ${name} actualizado correctamente`);
        recargartabla();
      } catch (error) {
        console.error("Error updating subpartida:", error);
      }
    } else if (tipo === "tarea") {
      if (fieldType === "user") {
        updateData = {
          id_usuario: selectedOption.value,
          email_user: selectedOption.email,
          telefono_user: selectedOption.telefono,
        };
      } else if (fieldType === "estado") {
        updateData = {
          id_EstadoTarea: selectedOption.value,
        };
      } else if (fieldType === "prioridad") {
        updateData = {
          prioridad: selectedOption.value,
        };
      }

      updateData.avance = avance;
      updateData.nombre = name;

      try {
        const response = await updateTareanewpartida(id, updateData);
        toast.success(`Campo ${name} actualizado correctamente`);
        recargartabla();
      } catch (error) {
        console.error("Error updating tarea:", error);
      }
    } else if (tipo === "subtarea") {
      if (fieldType === "user") {
        updateData = {
          id_usuario: selectedOption.value,
          email_user: selectedOption.email,
          telefono_user: selectedOption.telefono,
        };
      } else if (fieldType === "estado") {
        updateData = {
          id_EstadoTarea: selectedOption.value,
        };
      } else if (fieldType === "prioridad") {
        updateData = {
          prioridad: selectedOption.value,
        };
      }

      updateData.avance = avance;
      updateData.nombre = name;

      try {
        const response = await updateSubtareanewpartida(id, updateData);
        toast.success(`Campo ${name} actualizado correctamente`);
        recargartabla();
      } catch (error) {
        console.error("Error updating Subtarea:", error);
      }
    }
  };

  const handleDateChange = async (
    update,
    fecha_ini_proyecto,
    fecha_term_proyecto,
  ) => {
    setDateRange(update);
    const [start, end] = update;

    if (start < fecha_ini_proyecto || end > fecha_term_proyecto) {
      return;
    }

    const formattedStartDate = formatDate(start);
    const formattedEndDate = formatDate(end);

    const fechas = {
      fecha_inicio: formattedStartDate,
      fecha_termino: formattedEndDate,
      // Incluir campos requeridos con valores por defecto para evitar errores de null
      id_unidad: nivel?.id_unidad || 1,
      id_EstadoTarea: nivel?.id_EstadoTarea || 1,
      id_usuario: nivel?.id_usuario || 1,
      prioridad: nivel?.prioridad || 1,
      telefono_user: nivel?.telefono_user || 0,
      email_user: nivel?.email_user || "default@email.com",
    };

    try {
      let response;
      if (tipo === "partida") {
        response = await updatePartidanewpartida(id, fechas);
        setPartidaDateRange(update);
      } else if (tipo === "subpartida") {
        response = await updatesubPartidanewpartida(id, fechas);
        setSubpartidaDateRange(update);
      } else if (tipo === "tarea") {
        response = await updateTareanewpartida(id, fechas);
        setTareaDateRange(update);
      } else if (tipo === "subtarea") {
        response = await updateSubtareanewpartida(id, fechas);
      }
      toast.success(`Campo ${nivel.nombre} actualizado correctamente`);
      console.log(`${tipo} actualizada:`, response);
    } catch (error) {
      console.error(`Error updating ${tipo}:`, error);
    }
  };

  const getMinMaxDates = () => {
    if (tipo === "partida") {
      return [fechasProyecto.fecha_ini, fechasProyecto.fecha_term];
    }
    if (tipo === "subpartida" && partidaDateRange) {
      return partidaDateRange;
    }
    if (tipo === "tarea" && subpartidaDateRange) {
      return subpartidaDateRange;
    }
    if (tipo === "subtarea" && tareaDateRange) {
      return tareaDateRange;
    }
    return [fechasProyecto.fecha_ini, fechasProyecto.fecha_term];
  };

  const [minDate, maxDate] = getMinMaxDates();

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleAddDocuments = (files) => {
    setUploadedFiles([...uploadedFiles, ...files]);
  };

  const tipoColores = {
    partida: "bg-green-400", // Color para partidas
    subpartida: "bg-blue-400", // Color para subpartidas
    tarea: "bg-orange-500", // Color para tareas
    subtarea: "bg-indigo-500", // Color para subtareas
  };

  const tipoColoresvertical = {
    partida: "border-green-400", // Borde para partidas
    subpartida: "border-blue-400", // Borde para subpartidas
    tarea: "border-orange-500", // Borde para tareas
    subtarea: "border-indigo-500", // Borde para subtareas
  };

  const handleDeleteItem = () => {
    
    // Verificar que nivel existe
    if (!nivel) {
      toast.error("No se pudo encontrar la información del elemento a eliminar");
      return;
    }

    // Determinar el tipo correcto basado en las propiedades del nivel o usar el tipo proporcionado como prop
    let itemType = tipo; // Comenzamos con el tipo que viene como prop
    let itemId = id;     // Comenzamos con el id que viene como prop
    let nombreItem = nivel.nombre || nivel.nombre_partida || nivel.nombre_sub_partida || "elemento";

    // Verificar qué tipo de ID está presente en el nivel
    if (nivel.id_partida !== undefined) {
      itemType = "partida";
      itemId = nivel.id_partida;
      nombreItem = nivel.nombre_partida || nombreItem;
    } else if (nivel.id_subpartida !== undefined) {
      itemType = "subpartida";
      itemId = nivel.id_subpartida;
      nombreItem = nivel.nombre_sub_partida || nombreItem;
    } else if (nivel.id_subtask !== undefined) {
      // Si hay id_subtask, es definitivamente una subtarea
      itemType = "subtarea";
      itemId = nivel.id_subtask;
      nombreItem = nivel.nombre || nombreItem;
    } else if (nivel.id !== undefined) {
      // Si solo tenemos un ID genérico, usamos el tipo proporcionado como prop
      // En lugar de asumir que es una tarea
      itemId = nivel.id;
      nombreItem = nivel.nombre || nombreItem;
    }
    
    
    confirmDialog({
        message: `¿Estás seguro de que quieres eliminar "${nombreItem}"?`,
        header: 'Confirmación de eliminación',
        icon: 'pi pi-exclamation-triangle',
        acceptClassName: 'p-button-danger p-button-lg',
        rejectClassName: 'p-button-text p-button-lg',
        acceptLabel: 'Eliminar',
        rejectLabel: 'Cancelar',
        className: 'custom-confirm-dialog',
        style: { width: '450px' },
        contentStyle: { padding: '2rem', fontSize: '1.2rem' },
        accept: async () => {
            try {
                const response = await deleteProjectItem(itemType, itemId);
                
                // Verificar si el elemento ya había sido eliminado
                if (response.alreadyDeleted) {
                    toast.success(`"${nombreItem}" ya había sido eliminado. Actualizando vista...`);
                } else {
                    toast.success(`"${nombreItem}" se ha eliminado correctamente.`);
                }
                
                // En cualquier caso, actualizar la vista y cerrar el sidebar
                toggleSidebar(); // Cerrar el sidebar primero
                setTimeout(() => {
                    recargartabla(); // Recargar la tabla después de un breve retraso
                }, 300);
            } catch (error) {
                console.error("Error completo:", error);
                toast.error(`Error al eliminar: ${error.message || 'Error desconocido'}`);
            }
        },
        reject: () => {
        }
    });
  };

  return (
    <div
      className={`bg-gray-100 w-[40rem] custom-sidebar fixed right-0 top-0 h-full shadow-md z-50 transition-all duration-300 ease-in-out overflow-y-auto
  ${isSidebarOpen === "full" ? "translate-x-0" : isSidebarOpen === "partial" ? `translate-x-[90%] border-l-8 ${tipoColoresvertical[tipo]}` : "translate-x-full"}`}
    >
      <ConfirmDialog />
      <button
        type="button"
        onClick={toggleSidebar}
        className="text-gray-500 hover:text-gray-700 focus:outline-none absolute top-14 left-4 z-50"
      >
        {isSidebarOpen === "full" ? <ChevronsRight /> : <ChevronsLeft />}
      </button>

      <button
        type="button"
        onClick={toggleBlockClose} // Llamamos a la función para activar o desactivar el candado
        className={`absolute top-14 right-4 z-50 transition-all ${
          blockClose ? "text-red-700" : "text-green-500"
        } ${isAnimating ? "animate-swing text-purple-700" : ""} hover:scale-150`} // Mantiene la animación swing y el cambio de color
      >
        {blockClose ? <Lock size={24} /> : <Unlock size={24} />}
      </button>

      <button
        type="button"
        onClick={handleDeleteItem}
        className="absolute top-14 right-12 z-40 text-red-500 hover:text-red-700 hover:scale-125 transition-all"
        title="Eliminar"
      >
        <Trash2 size={24} />
      </button>

      {/* Contenido del Sidebar */}
      <div
        className={`${isSidebarOpen === "partial" ? "relative h-full w-full" : "opacity-100"}`}
      >
        {/* Texto que se ve en la imagen cuando está en "partial" */}
        {isSidebarOpen === "partial" && (
          <div className="absolute left-5 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-sm shadow-md origin-left rotate-90">
            <p className="text-center text-2xl font-bold">Detalles: {name}</p>
          </div>
        )}
      </div>

      {/* Asegúrate de cerrar esta condición */}
      {isSidebarOpen === "full" && (
        <>
          <div className="relative w-full">
            {/* Botón a la izquierda */}

            {/* Barra de color completa justo debajo del botón */}
            <div
              className={`h-5 w-full mt-8 absolute top-14 left-0 rounded-sm ${tipoColores[tipo]}`}
            ></div>

            {/* Contenido principal, como el título y los demás elementos */}
            <div className="p-4 pt-32 w-full">
              {/* Input de nombre */}
              <input
                type="text"
                name="nombre"
                className="text-xl font-semibold font-zen-kaku text-[#635F60] bg-gray-100 w-full"
                placeholder="nombre partida"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleBlurname}
              />
            </div>
          </div>

          <div className="flex flex-wrap mb-3">
            {/* Responsable */}
            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0 flex items-center">
              <User size={18} className="mr-2" style={{ stroke: "#597387" }} />
              <label className="font-zen-kaku font-semibold text-[#635F60]">
                Responsable
              </label>
            </div>

            <div className="w-full md:w-1/2 px-3 mb-0 flex items-center relative">
              <div className="flex-grow">
                <Select
                  className={`basic-single font-zen-kaku`}
                  classNamePrefix="select"
                  isSearchable={true}
                  name="usuarios"
                  placeholder="Seleccione un responsable"
                  aria-label="Campo de seleccion de responsable"
                  options={userOptions}
                  value={selecteduser}
                  onChange={handleSelectUser}
                  isDisabled={isSuperintendente}
                />
              </div>

              <button
                type="button"
                onClick={togglePopup}
                className="text-[#597387] bg-[#D2E7E4] h-full p-0 rounded-md hover:bg-[#597387] hover:text-white transition-all ease-linear duration-150 ml-2 flex items-center justify-center"
                style={{ width: "40px" }}
              >
                <Info size={28} style={{ stroke: "#597387" }} />
              </button>

              {/* Ventana emergente de información */}
              {isPopupOpen && (
                <div
                  ref={popupRef}
                  className="absolute top-full right-0 mt-2 p-4 bg-white border border-gray-200 rounded-xl shadow-xl z-10 transition-all duration-300 ease-in-out max-w-xs min-w-[200px]"
                >
                  {/* Contenedor flex para alinear "Contacto" con el botón del candado */}
                  <div className="flex justify-between items-center mb-4">
                    {/* Label de "Contacto" */}
                    <label className="text-gray-700 font-semibold text-lg">
                      Contacto
                    </label>

                    {/* Botón pequeño dentro del popup para bloquear el cerrado */}
                    <button
                      type="button"
                      onClick={toggleBlockClose}
                      className="text-white bg-teal-500 px-2 py-1 rounded-md hover:bg-teal-700 transition-all ease-linear duration-150 flex items-center"
                    >
                      {blockClose ? <Lock size={18} /> : <Unlock size={18} />}
                    </button>
                  </div>

                  {/* Información de contacto */}
                  <div className="flex items-center mb-4">
                    <Phone
                      size={22}
                      className="mr-2"
                      style={{ stroke: "#597387" }}
                    />
                    <span className="text-gray-800 font-semibold">
                      {nivel?.user?.telefono || "No disponible"}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <Mail
                      size={22}
                      className="mr-2"
                      style={{ stroke: "#597387" }}
                    />
                    <span className="text-gray-800 font-semibold">
                      {nivel?.user?.email || "No disponible"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap mb-3">
            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0 flex items-center">
              <Loader
                size={18}
                className="mr-2"
                style={{ stroke: "#597387" }}
              />
              <label className="font-zen-kaku font-semibold text-[#635F60]">
                Estado
              </label>
            </div>
            <div className="w-full md:w-1/2 px-3 md:mb-0">
              <Select
                className={`basic-single font-zen-kaku `}
                classNamePrefix="select"
                isSearchable={isSearchable}
                name="estado"
                placeholder="Seleccione estado de tarea"
                aria-label="Campo de seleccion estado de tarea"
                options={estadoOptions}
                value={selectedestado}
                onChange={handleSelectEstado}
                isDisabled={isSuperintendente}
              />
            </div>
          </div>
          <div className="flex flex-wrap mb-3">
            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0 flex items-center">
              <Calendar
                size={18}
                className="mr-2"
                style={{ stroke: "#597387" }}
              />
              <label className="font-zen-kaku font-semibold text-[#635F60]">
                Fechas
              </label>
            </div>
            <div className="w-full md:w-1/2 px-3 md:mb-0">
              <DatePicker
                selectsRange
                startDate={startDate}
                endDate={endDate}
                onChange={(update) =>
                  handleDateChange(
                    update,
                    fechasProyecto.fecha_ini,
                    fechasProyecto.fecha_term,
                  )
                }
                isClearable
                name="rango_fecha"
                placeholderText="Seleccionar fechas"
                aria-label="Campo de seleccion de fechas"
                locale="es"
                className="font-zen-kaku px-3 py-1.5 border-gray-300 rounded w-full border"
                dateFormat="yyyy/MM/dd"
                minDate={minDate}
                maxDate={maxDate}
                disabled={isSuperintendente}
              />
            </div>
          </div>
          <div className="flex flex-wrap mb-3">
            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0 flex items-center">
              <CircleArrowDown
                size={18}
                className="mr-2"
                style={{ stroke: "#597387" }}
              />
              <label className="font-zen-kaku font-semibold text-[#635F60]">
                Prioridad
              </label>
            </div>
            <div className="w-full md:w-1/2 px-3 md:mb-0">
              <Select
                className={`basic-single font-zen-kaku `}
                classNamePrefix="select"
                isSearchable={isSearchable}
                name="prioridad"
                placeholder="Seleccione prioridad"
                aria-label="Campo de seleccion de prioridad"
                options={prioridadOptions}
                value={selectedprioridad}
                onChange={handleSelectprioridad}
                isDisabled={isSuperintendente}
              />
            </div>
          </div>

          <div className="flex flex-wrap mb-3">
            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0 flex items-center ">
              <CircleDollarSign
                size={18}
                className="mr-2"
                style={{ stroke: "#597387" }}
              />
              <label className="font-zen-kaku font-semibold text-[#635F60]">
                Valor Total
              </label>
            </div>
            <div className="w-full md:w-1/2 px-3 md:mb-0">
              <div className="font-zen-kaku text-base bg-gray-100 w-full px-3 py-2 rounded">
                {`$${Number(nivel?.precio_total ?? 0).toLocaleString("es-CL", { maximumFractionDigits: 0 })}`}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap mb-3">
            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0 flex items-center ">
              <CircleDollarSign
                size={18}
                className="mr-2"
                style={{ stroke: "#597387" }}
              />
              <label className="font-zen-kaku font-semibold text-[#635F60]">
                Valor Gastado
              </label>
            </div>
            <div className="w-full md:w-1/2 px-3 md:mb-0">
              <div className="font-zen-kaku text-base bg-gray-100 w-full px-3 py-2 rounded">
                {(() => {               
                  const cantidadAcum = parseFloat(nivel?.cantidad_acumulada || 0);
                  const precioUnit = parseFloat(nivel?.precio_unit || 0);
                  const valorGastado = cantidadAcum * precioUnit;
                  
                  return `$${valorGastado.toLocaleString("es-CL", { maximumFractionDigits: 0 })}`;
                })()}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap mb-4">
            <div className="w-full md:w-1/2 px-3 mb-0 flex items-center">
              <BadgePercent
                size={18}
                className="mr-2"
                style={{ stroke: "#597387" }}
              />
              <label className="font-zen-kaku font-semibold text-[#635F60]">
                Avance
              </label>
            </div>

            <div className="w-full md:w-1/2 flex items-center">
              <div className="flex items-center gap-2 w-full">
                {/* Input del avance */}
                <div className="flex items-center bg-gray-100  rounded-md ">
                  <input
                    className="font-zen-kaku text-right w-10 border-none bg-transparent focus:outline-none"
                    min={0}
                    max={100}
                    type="text"
                    aria-label="Campo de ingreso de avance"
                    value={avance}
                    onChange={handleChange}
                    disabled
                  />
                  <label className="ml-1 text-gray-600">%</label>
                </div>

                {/* Barra de progreso */}
                <div className="w-full flex items-center">
                  <progress
                    className="progress-bar w-full h-4 rounded-lg shadow-md"
                    value={avance ? avance : 1}
                    max="100"
                  ></progress>
                </div>

                <style jsx>{`
                  .progress-bar {
                    background-color: #cecece;
                    opacity: 0.6;
                    transition: all 0.5s ease;
                  }

                  progress::-webkit-progress-value {
                    background-color: ${avance <= 20
                      ? "#f87171"
                      : avance <= 50
                        ? "#facc15"
                        : "#22c55e"};
                    transition: all 0.5s ease;
                  }

                  progress::-moz-progress-bar {
                    background-color: ${avance <= 20
                      ? "#f87171"
                      : avance <= 50
                        ? "#facc15"
                        : "#22c55e"};
                    transition: all 0.5s ease;
                  }

                  progress::-ms-fill {
                    background-color: ${avance <= 20
                      ? "#f87171"
                      : avance <= 50
                        ? "#facc15"
                        : "#22c55e"};
                    transition: all 0.5s ease;
                  }
                `}</style>
              </div>
            </div>
          </div>

          <div className="flex flex-nowrap mb-3 border-b-2 border-[#DDD9D8] pb-2 mr-4 ml-4 rounded-sm"></div>

          <div className="flex flex-nowrap mb-3">
            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0 flex items-center ">
              <FileText
                size={18}
                className="mr-2"
                style={{ stroke: "#597387" }}
              />
              <label className="font-zen-kaku font-semibold text-[#635F60]">
                Carga de documentos
              </label>
            </div>
            <div className="flex flex-row justify-end w-full md:w-1/2 px-3 md:mb-0 mr-10">
              <button
                type="button"
                onClick={openModal}
                className="text-[#597387] bg-[#D2E7E4] px-2 py-1 font-bold rounded-md hover:bg-[#597387] hover:text-white transition-all ease-linear duration-150"
              >
                + Agregar documentos
              </button>
            </div>
          </div>
          <div className="flex flex-nowrap mb-3 border-b-2 border-[#DDD9D8] pb-2 mr-4 ml-4 rounded-sm"></div>

          {/* Modal */}
          {isModalOpen && (
            <Modal
              onClose={closeModal}
              onAdd={handleAddDocuments}
              partidaId={id} // Aquí pasas el id correspondiente a partidaId
              tipo={tipo} // Pasas el tipo adecuado
              userId={id_usuario} // Pasas el id del usuario
            />
          )}

          {/* Display uploaded files */}
          {/* {uploadedFiles.length > 0 && (
        <div className="mt-4">
          <h3>Documentos agregados:</h3>
          <ul>
            {uploadedFiles.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        </div>
      )} */}

          <div className="flex flex-nowrap mb-3">
            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0 flex items-center ">
              <MessageCircle
                size={18}
                className="mr-2"
                style={{ stroke: "#597387" }}
              />
              <label className="font-zen-kaku font-semibold text-[#635F60]">
                Actividad
              </label>
            </div>
            <div className="flex flex-row justify-end w-full md:w-1/2 px-3 md:mb-0 mr-10">
              <Filter
                size={18}
                className="cursor-pointer mr-3 hover:stroke-[#979391] transition-all ease-linear duration-100"
                style={{ stroke: "#597387" }}
              />
              <Search
                size={18}
                className="cursor-pointer mr-3 hover:stroke-[#979391] transition-all ease-linear duration-100"
                style={{ stroke: "#597387" }}
              />
              <SlidersHorizontal
                size={18}
                className="cursor-pointer hover:stroke-[#979391] transition-all ease-linear duration-100"
                style={{ stroke: "#597387" }}
              />
            </div>
          </div>
          <div className="flex flex-nowrap mb-3">
            <div className="w-full px-3 mb-6 md:mb-0 flex items-center custom-comment-nodos2">
              <CommentSection
                id_usuario={id_usuario}
                nombre_usuario={nombre_usuario}
                id={id}
                nivel={tipo}
                id_proyecto={id_proyecto}
              />
            </div>
          </div>

          {/* Sigue el resto del contenido del sidebar... */}
        </>
      )}
    </div>
  );
};

export default Sidebarpartida;
