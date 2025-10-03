"use client";

import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDown,
  faSearch,
  faTable,
  faTh,
  faBars,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useSelector } from "react-redux";
import Drawer from "./new_user_externo";
import {
  SlidersHorizontal,
  Building2,
  BookCheck,
  Folder,
  ChevronDown,
  FileText,
  User,
  Calendar,
  UserPlus,
  Star,
  ArrowDownToLine,
  Eye,
  PenLine,
  FolderPlus,
  FileUp,
  FolderUp,
  ArrowUpFromLine,
  Landmark,
  Link,
  X,
  MoreVertical,
  HomeIcon,
  FolderIcon,
  UserIcon,
  ClockIcon,
  StarIcon,
} from "lucide-react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import SearchIcon from "@mui/icons-material/Search";
import WarningIcon from "@mui/icons-material/Warning";
import Paper from "@mui/material/Paper";
import Select from "react-select";
import { minaOptions, lectorOptions } from "./data_option";
import "../style/media_query.css";
import { getFileIcon } from "../components/validForm/fileIcons"; // se encuentra en validform
import { FiMoreVertical } from "react-icons/fi";
import toast from "react-hot-toast";
import { Modal } from "react-modal";
import { BsDeviceHdd } from "react-icons/bs";
import { PiFolderSimpleStar } from "react-icons/pi";
import { FaTrashAlt, FaArrowLeft, FaFile } from "react-icons/fa";
import { TiCloudStorageOutline } from "react-icons/ti";
import { BsShare } from "react-icons/bs";
import { FiStar, FiEdit, FiMove } from "react-icons/fi";
import Hidebyrol from "./hiddenroles";
import { RiDeleteBin6Line, RiArrowGoBackFill } from "react-icons/ri";
import CryptoJS from "crypto-js";
import Loader from "@/app/dashboard/components/loader";

import {
  postFolders,
  getFolderRaizUser,
  getFolderRaiz,
  uploadFile,
  updateFolder,
  updateDocumentFilename,
  toggleFavoriteFolder,
  toggleFavoriteDocument,
  getFolderHierarchy,
  toggleTrashFolder,
  toggleTrashDocument,
  deleteFolderPermanently,
  deleteDocumentPermanently,
  emptyTrash,
} from "@/app/services/my_document";

import SearchComponent from "@/app/dashboard/components/ModuloDrive/SearchComponent ";

function Mydocuments({
  folders,
  currentPath,
  fetchFolders,
  RespUrifolderprop,
  totalFileSizestoragelimit,
  favoriteDocuments,
  allmove,
  userFolder,
}) {


  const [isNewUserOpen, setIsNewUserOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [isfileModalOpen, setisfileModalOpen] = useState(false);
  const [isfolderfileModalOpen, setisfolderfileModalOpen] = useState(false);
  const [ismodificadoModal, setismodificadoModal] = useState(false);
  const [ispersonasmodal, setispersonasmodal] = useState(false);
  const [isshareDocs, setisshareDocs] = useState(false);
  const [istipomodal, setistipomodal] = useState(false);

  // Refs para los menús desplegables
  const addMenuRef = useRef(null);
  const tipoMenuRef = useRef(null);
  const modificadoMenuRef = useRef(null);
  const [newFolderName, setNewFolderName] = useState("");
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const peopleList = ["Juan", "María", "Pedro", "Ana", "Luis"];
  const [selectedOption, setSelectedOption] = useState(minaOptions[0]);
  const [selectedOptionshare, setSelectedOptionshare] = useState(
    lectorOptions[0],
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [foldersState, setFoldersState] = useState(folders);



  const [isTableView, setIsTableView] = useState(true); // Estado para controlar la vista
  const router = useRouter();
  const userStore = useSelector((state) => state.user);

  const [selectedSection, setSelectedSection] = useState("Proyectos");

  const userUriFolder = userStore.user.urifolder;
  const { totalSize, storageLimit } = totalFileSizestoragelimit;

  const [file, setFile] = useState(null);

  const [isDragging, setIsDragging] = useState(false);

  const [editingFolderId, setEditingFolderId] = useState(null);
  const [editedName, setEditedName] = useState("");

  const [editingDocumentId, setEditingDocumentId] = useState(null);
  const [editedFilename, setEditedFilename] = useState("");

  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);

  // Estados para modales de confirmación personalizados
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmData, setConfirmData] = useState({
    title: "",
    message: "",
    onConfirm: null,
    confirmText: "Confirmar",
    cancelText: "Cancelar",
    type: "danger" // danger, warning, info
  });

  const [selectedFolderName, setSelectedFolderName] = useState("");

  const [isDraggingOverGrid, setIsDraggingOverGrid] = useState(false);
  const [isDraggingOverItem, setIsDraggingOverItem] = useState(null);

  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
  const [folderToReplace, setFolderToReplace] = useState(null);

  const [replaceOption, setReplaceOption] = useState(null);
  const [foldersQueue, setFoldersQueue] = useState(null);

  // Usa las props para definir estas variables
  const filteredFoldersFavorite = currentPath === "favoritos" ? folders : [];
  const filteredDocumentsFavorite =
    currentPath === "favoritos"
      ? filteredFoldersFavorite.flatMap((folder) => folder.documents || [])
      : [];
  const favoriteDocumentsOutsideFolders =
    currentPath === "favoritos" ? favoriteDocuments : [];

  // Estados para el modal de edición
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState(null);
  const [newName, setNewName] = useState("");
  const [originalExtension, setOriginalExtension] = useState("");
  const [breadcrumb, setBreadcrumb] = useState([]);

  const [CurrentFolder, setCurrentFolder] = useState([]);

  const [currentMovePath, setCurrentMovePath] = useState(userFolder?.id_folder);
  const [navigationHistory, setNavigationHistory] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  // Función para abrir el modal de edición
  const openEditModal = (item, type) => {
    let initialName = "";
    if (type === "folder") {
      initialName = item.nombre_carpeta;
    } else {
      const [nameWithoutExtension, extension] =
        item.filenames.split(/(?=\.[^.]+$)/);
      initialName = nameWithoutExtension;
      setOriginalExtension(extension); // Almacenar la extensión original del archivo
    }
    setCurrentEditItem({ ...item, type });
    setNewName(initialName); // Asegurarse de que el nombre inicial esté correctamente capturado
    setIsEditModalOpen(true);
  };

  // Función para guardar la edición desde el modal
  const handleSaveEdit = () => {
    if (!newName.trim()) {
      toast.error("El nombre no puede estar vacío."); // Mensaje de error si el nombre está vacío
      return;
    }

    if (currentEditItem.type === "folder") {
      handleSaveClick(
        { ...currentEditItem, nombre_carpeta: newName },
        "folder",
      );
    } else {
      const updatedFilename = `${newName}${originalExtension}`;
      handleSaveClick(
        { ...currentEditItem, filenames: updatedFilename },
        "document",
      );
    }

    setIsEditModalOpen(false);
  };

  const toggleView = () => {
    const newView = !isTableView;
    setIsTableView(newView);
    localStorage.setItem("viewMode", newView ? "table" : "grid");
  };

  useEffect(() => {
    const savedViewMode = localStorage.getItem("viewMode");
    if (savedViewMode) {
      setIsTableView(savedViewMode === "table");
    }
  }, []);

  const createFolder = async () => {
    if (!newFolderName.trim()) {
      toast("Por favor, ingresa un nombre para la carpeta.", { icon: "⚠️" });
      return;
    }

    const toastId = toast.loading("Creando carpeta...");

    try {
      let rootGlobal = await getFolderRaiz("root", null);
      let usuariosFolder;
      let userFolder;

      // Si la carpeta 'root' no existe, se crea
      if (!rootGlobal) {
        const rootFolderData = {
          nombre_carpeta: "root",
          nombre_S3_cloud: "root",
          enlace: "root",
          parent_folder_id: null,
          path: "root",
          depth: 0,
        };
        const createdRootFolder = await postFolders(rootFolderData);
        rootGlobal = createdRootFolder.data;
      }

      // Verificar si la carpeta 'usuarios' existe dentro de 'root'
      usuariosFolder = await getFolderRaiz("usuarios", rootGlobal.id);
      if (!usuariosFolder) {
        const usuariosFolderData = {
          nombre_carpeta: "usuarios",
          nombre_S3_cloud: "usuarios",
          enlace: "usuarios",
          parent_folder_id: rootGlobal.id_folder ?? rootGlobal.id,
          path: "root/usuarios",
          depth: 1,
        };
        const createdUsuariosFolder = await postFolders(usuariosFolderData);
        usuariosFolder = createdUsuariosFolder.data;
      }

      // Verificar si la carpeta del usuario existe dentro de 'usuarios'
      userFolder = await getFolderRaizUser(
        userStore.user.id,
        RespUrifolderprop,
      );
      if (!userFolder) {
        const userFolderData = {
          nombre_carpeta: RespUrifolderprop,
          nombre_S3_cloud: RespUrifolderprop,
          enlace: RespUrifolderprop,
          usuario_id: userStore.user.id,
          parent_folder_id: usuariosFolder.id_folder ?? usuariosFolder.id,
          path: `root/usuarios/${RespUrifolderprop}`, // Ajuste en el path
          depth: 2,
        };
        const createdUserFolder = await postFolders(userFolderData);
        userFolder = createdUserFolder.data;
      }

      // Verificación de "Mi unidad" sin redirigir si estás en una subcarpeta
      if (currentPath === userFolder.id_folder) {
        handleSidebarSelection("Mi unidad");
      }

      let parentFolderId, newPath, depth;

      // Lógica mejorada para determinar la carpeta padre según el contexto
      if (currentPath === "proyectos") {
        // Si estamos en "proyectos", crear la carpeta dentro de la carpeta del usuario
        parentFolderId = userFolder.id_folder;
        newPath = `${userFolder.path}/${newFolderName}`;
        depth = userFolder.depth + 1;
      } else if (currentPath === userFolder.id_folder || currentPath === "MyDisk") {
        // Si estamos en "Mi unidad", crear la carpeta dentro de la carpeta del usuario
        parentFolderId = userFolder.id_folder;
        newPath = `${userFolder.path}/${newFolderName}`;
        depth = userFolder.depth + 1;
      } else if (folders && folders.folder) {
        // Si tenemos una carpeta específica cargada, usar esa como padre
        const parentFolder = folders.folder;
        parentFolderId = parentFolder.id_folder;
        newPath = `${parentFolder.path}/${newFolderName}`;
        depth = parentFolder.depth + 1;
      } else {
        // Fallback: usar la carpeta del usuario como padre
        parentFolderId = userFolder.id_folder;
        newPath = `${userFolder.path}/${newFolderName}`;
        depth = userFolder.depth + 1;
      }

      // Preparar los datos para crear la nueva carpeta
      const folderData = {
        nombre_carpeta: newFolderName,
        nombre_S3_cloud: newFolderName,
        enlace: newPath,
        usuario_id: userStore.user.id,
        parent_folder_id: parentFolderId,
        path: newPath,
        depth: depth,
      };

              // Crear la carpeta en la base de datos
        const createResponse = await postFolders(folderData);

      toast.success("Carpeta creada con éxito.", { id: toastId });

      // Cerrar el modal y refrescar las carpetas
      closeNewFolderModal();
      await fetchFolders();
    } catch (error) {
      console.error("Error al crear la carpeta:", error);
      toast.error(
        "Se produjo un error al intentar crear la carpeta. Por favor, inténtalo de nuevo más tarde.",
        { id: toastId },
      );
    }
  };

  // Memoiza fetchFolders para evitar recrear la función en cada render
  // Mapeo de paths a secciones
  // Dentro de tu componente
  const pathToSectionMap = useMemo(
    () => ({
      proyectos: "Proyectos",
      MyDisk: "Mi unidad",
      favoritos: "Favoritos",
      users: "Usuarios",
      papelera: "Papelera",
    }),
    [],
  ); // Sin dependencias, ya que no cambia

  // Actualiza la selección del sidebar
  const handleSidebarSelection = useCallback(
    (section) => {
      setSelectedSection(section);

      let newPath = "";
      switch (section) {
        case "Proyectos":
          newPath = "proyectos";
          break;
        case "Mi unidad":
          newPath = "MyDisk";
          break;
        case "Favoritos":
          newPath = "favoritos";
          break;
        case "Partidas":
          newPath = "partidas";
          break;
        case "Usuarios":
          newPath = "users";
          break;
        case "Compartido conmigo":
          newPath = "compartido-conmigo";
          break;
        case "Papelera":
          newPath = "papelera";
          break;
        default:
          newPath = "";
      }

      // Guardar el `path` y la opción seleccionada en localStorage
      localStorage.setItem("selectedSection", section);
      localStorage.setItem("currentPath", newPath);

      router.push(
        `/dashboard/my_documents?path=${encodeURIComponent(newPath)}`,
      );
    },
    [router],
  );

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const urlPath = queryParams.get("path");

    if (urlPath && pathToSectionMap[urlPath]) {
      // Si el path de la URL coincide con uno en el mapeo, selecciona la sección correspondiente
      const matchingSection = pathToSectionMap[urlPath];
      setSelectedSection(matchingSection);
      localStorage.setItem("selectedSection", matchingSection);
    } else {
      // Recuperar del `localStorage` si no hay un `path` en la URL o no coincide con el mapeo
      let savedSection = localStorage.getItem("selectedSection");
      let savedPath = localStorage.getItem("currentPath");

              if (savedSection && savedPath) {
          setSelectedSection(savedSection);
        router.push(
          `/dashboard/my_documents?path=${encodeURIComponent(savedPath)}`,
        );
              } else {
          // Inicializar localStorage si no tiene valores guardados
          savedSection = "Mi unidad";
        savedPath = "MyDisk"; // Ajustar según lo que sea 'userUriFolder'

        localStorage.setItem("selectedSection", savedSection);
        localStorage.setItem("currentPath", savedPath);

        setSelectedSection(savedSection);
        router.push(
          `/dashboard/my_documents?path=${encodeURIComponent(savedPath)}`,
        );
      }
    }
  }, [router, pathToSectionMap]);

  useEffect(() => {
    if (currentPath) {
      setIsLoading(true); // Inicia la carga antes de llamar a fetchFolders

      fetchFolders().finally(() => setIsLoading(false)); // Finaliza la carga después de que se complete la solicitud
    }
  }, [currentPath, fetchFolders]);

  console.log(folders);

  useEffect(() => {
    const fetchHierarchy = async () => {
      try {
        // Verifica si currentPath es un ID numérico de carpeta (no un string como "favoritos", "papelera", "proyectos")
        if (
          currentPath &&
          currentPath !== "favoritos" &&
          currentPath !== "papelera" &&
          !isNaN(currentPath) && // Verificar que sea un número
          Number.isInteger(Number(currentPath)) // Verificar que sea un entero
        ) {
          const data = await getFolderHierarchy(currentPath); // Usa el servicio
          setBreadcrumb(data.breadcrumb); // Establece la jerarquía de carpetas
        } else if (currentPath === "papelera") {
          // Si es "papelera", limpia el breadcrumb
          setBreadcrumb([]);
        } else {
          // Para paths como "proyectos" u otros strings, limpia el breadcrumb
          setBreadcrumb([]);
        }
      } catch (error) {
        console.error("Error al obtener la jerarquía de carpetas:", error);
      }
    };

    fetchHierarchy();
  }, [currentPath]);

  // Mientras esté en "loading", muestra un indicador de carga

  const renderBreadcrumb = () => {
    return (
      <div className="flex items-center mb-4">
        {breadcrumb.map((folder, index) => (
          <React.Fragment key={folder.id_folder}>
            <span
              className="text-[#5C7891] cursor-pointer hover:text-[#5973]"
              onClick={() => handleBreadcrumbClick(folder.id_folder)}
            >
              {folder.nombre_carpeta}
            </span>
            {index < breadcrumb.length - 1 && <span className="mx-2">/</span>}
          </React.Fragment>
        ))}
      </div>
    );
  };

  // Función para manejar clics en el breadcrumb
  const handleBreadcrumbClick = (folderId) => {
    const encryptedFolderId = encryptFolderId(folderId); // Cifrar y codificar el folderId
    router.push(`/dashboard/my_documents?path=${encryptedFolderId}`);
    fetchFolders(folderId); // Hacer la llamada para cargar la carpeta seleccionada
  };

  useEffect(() => {
    if (folders !== foldersState) {
      setFoldersState(folders);
    }
  }, [folders, foldersState]);

  const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY;

  // Función para cifrar el folderId usando crypto-js y luego encodeURIComponent
  const encryptFolderId = (folderId) => {
    const encrypted = CryptoJS.AES.encrypt(
      folderId.toString(),
      secretKey,
    ).toString();
    return encodeURIComponent(encrypted); // Codificar el resultado para que sea seguro en una URL
  };

  // Cifrado con la clave secreta y redirección con el valor codificado
  const handleFolderClick = (folderId) => {
    if (editingFolderId !== null) {
      return; // No hacer nada si se está editando el nombre de la carpeta
    }
    const folderSlug = encryptFolderId(folderId); // Cifrar y codificar el folderId

    router.push(`/dashboard/my_documents?path=${folderSlug}`);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const saludo = `¡Hola ${userStore.user?.names}! 👋`;

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleNewUserClick = () => {
    setIsOpen(!isOpen);
  };

  const openNewFolderModal = () => {
    setIsNewFolderModalOpen(true);
  };

  const openfileModal = () => {
    setisfileModalOpen(true);
  };

  const openfolderModal = () => {
    setisfolderfileModalOpen(true);
  };

  const opensharemodal = () => {
    setisshareDocs(true);
  };

  const closeNewFolderModal = () => {
    setIsNewFolderModalOpen(false);
  };

  const closefileModal = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setisfileModalOpen(false);
  };

  const closefolderModal = () => {
    setisfolderfileModalOpen(false);

    // Forzar la limpieza del campo de entrada de archivo
    if (folderInputRef.current) {
      folderInputRef.current.value = ""; // Asegura que el input se limpie correctamente
    }

    setSelectedFolder(null); // Limpiar la carpeta seleccionada
    setSelectedFolderName(""); // Limpiar el nombre de la carpeta seleccionada
  };

  const closesharemodal = () => {
    setisshareDocs(false);
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleButtonfolderClick = () => {
    folderInputRef.current.click();
  };

  const openmenumodificado = () => {
    setismodificadoModal(!ismodificadoModal);
  };

  const openmenupersonas = () => {
    setispersonasmodal(!ispersonasmodal);
  };

  const openmenutipo = () => {
    setistipomodal(!istipomodal);
  };

      const handleSelectPerson = (event, value) => {
      if (value) {
        // Persona seleccionada
      }
    };

  const handleSelect = (selectedOption) => {
    setSelectedOption(selectedOption);
  };

  const handleSelectshare = (selectedOptionshare) => {
    setSelectedOptionshare(selectedOptionshare);
  };

  const renderOption = (props, option, { inputValue }) => {
    const isSelected = inputValue === option;
    const backgroundColor = isSelected ? "#5c7891" : "transparent";

    return (
      <div
        {...props}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#5c7891";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
        }}
        style={{ backgroundColor }}
      >
        {option}
      </div>
    );
  };

  const findFolderById = (folders, folderId) => {
    for (let folder of folders) {
      if (folder.id_folder === folderId) {
        return folder;
      }
    }
    return null;
  };

  const [selectedModification, setSelectedModification] =
    useState("Modificado");
  const [isModificationFilterActive, setIsModificationFilterActive] =
    useState(false);

  // Cierre de menús al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      // Menú agregar carpeta/archivo
      if (
        isOpen &&
        addMenuRef.current &&
        !addMenuRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
      // Menú tipo
      if (
        istipomodal &&
        tipoMenuRef.current &&
        !tipoMenuRef.current.contains(event.target)
      ) {
        setistipomodal(false);
      }
      // Menú modificado
      if (
        ismodificadoModal &&
        modificadoMenuRef.current &&
        !modificadoMenuRef.current.contains(event.target)
      ) {
        setismodificadoModal(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, istipomodal, ismodificadoModal]);

  //filtro tipo

  const handleTypeSelection = (type, label) => {
    setSelectedType({ type, label });
    setIsFilterActive(true);
    setistipomodal(false); // Cerrar el menú después de seleccionar un tipo
  };

  const clearFilter = () => {
    setSelectedType({ type: null, label: "Tipo" });
    setIsFilterActive(false);
  };

  const clearModificationFilter = () => {
    setSelectedModification("Modificado");
    setIsModificationFilterActive(false);
  };

  const handleModificationSelection = (modification) => {
    setSelectedModification(modification);
    setIsModificationFilterActive(true);
    setismodificadoModal(false); // Cierra el menú desplegable
    // Aquí puedes agregar cualquier lógica adicional que necesites cuando cambie la selección del filtro de modificación
  };

  // mover secttion

  const [isOpenMover, setIsOpenMover] = useState(false);
  //  const [selectedFolder, setSelectedFolder] = useState(null);
  const [itemToMove, setItemToMove] = useState(null);

  // useEffect(() => {
  //     setFoldersState(folders);
  // }, [folders]);

  const openMoveModal = (item) => {
    setItemToMove(item);
    setSelectedFolder(null); // Resetea la carpeta seleccionada al abrir el modal
    setIsOpenMover(true);
    setNavigationHistory([]); // Limpia el historial al abrir el modal
    setCurrentMovePath(userFolder?.id_folder); // Restablecer la ubicación currentMovePath a la raíz
  };

  const handleMove = async () => {
    if (!selectedFolder) {
      toast.error("Por favor, selecciona una carpeta destino.");
      return;
    }

    try {
      const itemType = itemToMove.id_folder ? "folder" : "document";
      const updateData = {
        parent_folder_id: selectedFolder,
      };

      if (itemType === "folder") {
        await updateFolder(itemToMove.id_folder, updateData);
      } else {
        await updateDocument(itemToMove.id, updateData);
      }

      toast.success(
        `${itemType === "folder" ? "Carpeta" : "Documento"} movido correctamente.`,
      );
      fetchFolders(); // Refrescar las carpetas después de mover
      setIsOpenMover(false);
    } catch (error) {
      console.error("Error al mover:", error);
      toast.error("Error al mover el ítem.");
    }
  };

  const [selectedType, setSelectedType] = useState({
    type: null,
    label: "Tipo",
  });
  const [isFilterActive, setIsFilterActive] = useState(false);

  // Función para filtrar por tipo de documento
  const matchesTypeFilter = (document) => {
    if (!selectedType.type || selectedType.type === "Documentos") return true;

    const ext = document.fileExtension.toLowerCase();

    const typeFilters = {
      "Hojas de cálculo": ["xls", "xlsx", "ods", "txt"],
      Presentaciones: ["ppt", "pptx", "odp"],
      Formularios: ["forms"],
      "Fotos e imágenes": ["jpg", "jpeg", "png", "gif"],
      PDFs: ["pdf"],
      Videos: ["mp4", "avi", "mov", "wmv"],
      "Accesos directos": document.isShortcut,
      Sites: ["site"],
      Audio: ["mp3", "wav", "flac"],
      Dibujos: ["draw"],
      "Archivos (zip)": ["zip", "rar"],
      Emails: ["msg"], // Aseguramos que archivos .msg estén aquí
    };

    return typeFilters[selectedType.type]?.includes(ext) || false;
  };

  // Función para filtrar por fecha de modificación
  // Función para filtrar por fecha de modificación
  // Función para filtrar por fecha de modificación
  const matchesModificationFilter = (updatedAt) => {
    if (!isModificationFilterActive) return true; // Mostrar todos si el filtro no está activo

    const folderDate = new Date(updatedAt);
    const now = new Date();

    const timeFilters = {
      Hoy: () => folderDate.toDateString() === now.toDateString(),
      "Últimos 7 días": () =>
        folderDate >= new Date(now.setDate(now.getDate() - 7)),
      "Últimos 30 días": () =>
        folderDate >= new Date(now.setDate(now.getDate() - 30)),
      "Este Año": () => folderDate.getFullYear() === now.getFullYear(),
      "Año pasado": () => folderDate.getFullYear() === now.getFullYear() - 1,
    };

    return selectedModification ? timeFilters[selectedModification]() : true;
  };

  // Filtrar carpetas y subcarpetas
  // Filtrar carpetas y subcarpetas
  const filterFolders = () => {
    const filteredFolders = [];

    // Verificar si el currentPath es "papelera"
    if (currentPath === "papelera") {
      // Renderizar todas las carpetas eliminadas
      if (foldersState?.folders && Array.isArray(foldersState.folders)) {
        foldersState.folders.forEach((folder) => {
          filteredFolders.push({ ...folder, children: [] }); // children vacíos ya que no los renderizamos en papelera
        });
      }

      // No necesitamos recorrer subcarpetas en la papelera
      return filteredFolders; // Solo retornamos las carpetas eliminadas
    }

    // Lógica normal para renderizar carpetas y subcarpetas cuando no es la papelera
    if (foldersState?.folder) {
      const { folder, children } = foldersState;

      // Incluir la carpeta principal si no es "papelera"
      if (
        folder.id_folder &&
        (currentPath === "" || folder.id_folder === currentPath)
      ) {
        filteredFolders.push({ ...folder });
      }

      // Filtrar subcarpetas no eliminadas (trashed: false)
      if (children && Array.isArray(children)) {
        children.forEach((child) => {
          if (!child.trashed) {
            filteredFolders.push({ ...child });

            // Si hay más subcarpetas, recorrerlas si no están eliminadas
            if (child.children && Array.isArray(child.children)) {
              child.children.forEach((subChild) => {
                if (!subChild.trashed) {
                  filteredFolders.push({ ...subChild });
                }
              });
            }
          }
        });
      }
    }

    return filteredFolders;
  };

  // Filtrar carpetas modificadas
  const filterModifiedFolders = () => {
    const filteredModifiedFolders = [];

    if (foldersState?.folder) {
      const { folder, children } = foldersState;

      // Filtrar carpeta principal
      if (
        folder.id_folder &&
        (currentPath === "" ||
          (folder.id_folder === currentPath &&
            matchesModificationFilter(folder.updatedAt)))
      ) {
        filteredModifiedFolders.push(folder);
      }

      // Filtrar subcarpetas por fecha de modificación
      if (children && Array.isArray(children)) {
        const filteredChildren = children.filter(
          (child) =>
            child.id_folder &&
            child.parent_folder_id === currentPath &&
            matchesModificationFilter(child.updatedAt),
        );
        filteredModifiedFolders.push(...filteredChildren);
      }
    }

    return filteredModifiedFolders;
  };

  // Filtrar documentos
  // Filtrar documentos de forma recursiva
  const filterDocumentsRecursively = (folder) => {
    let allDocuments = [];

    // Filtrar documentos en la carpeta actual
    if (folder.documents && Array.isArray(folder.documents)) {
      const filteredDocs = folder.documents.filter((document) => {
        const matchesType = selectedType.type
          ? matchesTypeFilter(document)
          : true;
        const matchesModif = isModificationFilterActive
          ? matchesModificationFilter(document.updatedAt)
          : true;
        return matchesType && matchesModif;
      });
      allDocuments.push(...filteredDocs);
    }

    // Recorrer subcarpetas recursivamente
    if (folder.children && Array.isArray(folder.children)) {
      folder.children.forEach((childFolder) => {
        allDocuments = allDocuments.concat(
          filterDocumentsRecursively(childFolder),
        );
      });
    }

    return allDocuments;
  };

  // Filtrar documentos en la carpeta principal y sus subcarpetas
  const filterDocuments = () => {
    const filteredDocuments = [];

    // Verificar si el currentPath es "papelera"
    if (currentPath === "papelera") {
      // Filtrar solo los documentos que están en la papelera (trashed: true)
      if (foldersState?.documents && Array.isArray(foldersState.documents)) {
        foldersState.documents.forEach((document) => {
          if (document.trashed) {
            filteredDocuments.push(document);
          }
        });
      }

      // No necesitamos recorrer subcarpetas en la papelera, ya que no hay documentos anidados
      return filteredDocuments; // Retornar solo los documentos eliminados
    }

    // Si no es papelera, continuar con la lógica normal
    if (foldersState?.folder) {
      const { folder } = foldersState;

      // Filtrar documentos normales (trashed: false)
      if (folder.documents && Array.isArray(folder.documents)) {
        folder.documents.forEach((document) => {
          if (!document.trashed) {
            filteredDocuments.push(document);
          }
        });
      }

      // Si hay subcarpetas, filtrar documentos normales recursivamente
      if (folder.children && Array.isArray(folder.children)) {
        folder.children.forEach((child) => {
          filteredDocuments.push(...filterDocumentsRecursively(child));
        });
      }
    }

    return filteredDocuments;
  };

  // Llamar las funciones filtradas
  const filteredFolders = filterFolders();
  const filteredModifiedFolders = filterModifiedFolders();
  const filteredDocuments = filterDocuments();

  

      const handleSaveClick = async (item, type) => {
      try {

      // Usar el nombre editado (newName) sin espacios en blanco al inicio o final
      const name = newName.trim();

      // Validación 1: Longitud máxima
      if (name.length > 255) {
        toast.error("El nombre no puede tener más de 255 caracteres.");
        return;
      }

      // Validación 2: Caracteres inválidos (Windows y Linux)
      const invalidCharsWindows = [
        "\\",
        "/",
        ":",
        "*",
        "?",
        '"',
        "<",
        ">",
        "|",
      ];
      const invalidCharsLinux = ["/", "."]; // Solo '/' es inválido en Linux
      const invalidChars = [...invalidCharsWindows, ...invalidCharsLinux];

      for (let char of invalidChars) {
        if (name.includes(char)) {
          toast.error(
            `El nombre no puede contener los siguientes caracteres: \\ / : * ? " < > | .`,
          );
          return;
        }
      }

      // Validación 3: Nombres reservados (Windows)
      const reservedNamesWindows = [
        "CON",
        "PRN",
        "AUX",
        "NUL",
        "COM1",
        "COM2",
        "COM3",
        "COM4",
        "COM5",
        "COM6",
        "COM7",
        "COM8",
        "COM9",
        "LPT1",
        "LPT2",
        "LPT3",
        "LPT4",
        "LPT5",
        "LPT6",
        "LPT7",
        "LPT8",
        "LPT9",
      ];
      if (reservedNamesWindows.includes(name.toUpperCase())) {
        toast.error(
          "El nombre no puede ser un nombre reservado por el sistema.",
        );
        return;
      }

      // Validación 4: Nombres reservados (Linux)
      const reservedNamesLinux = [".", ".."];
      if (reservedNamesLinux.includes(name)) {
        toast.error("El nombre no puede ser '.' o '..'.");
        return;
      }

      // Validación 5: Extensiones no permitidas (para nombres de carpetas)
      const invalidExtensions = [
        ".exe",
        ".jpg",
        ".png",
        ".pdf",
        ".docx",
        ".zip",
        ".tar",
        ".gz",
        ".mp3",
      ];
      if (
        type === "folder" &&
        invalidExtensions.some((ext) => name.toLowerCase().endsWith(ext))
      ) {
        toast.error(
          "El nombre de la carpeta no puede terminar con una extensión de archivo.",
        );
        return;
      }

      if (type === "folder") {
        // Si todas las validaciones pasan, proceder a guardar el nombre de la carpeta
        const updatedData = { nombre_carpeta: name };

        await toast.promise(updateFolder(item.id_folder, updatedData), {
          loading: "Actualizando nombre de la carpeta...",
          success: "Nombre de la carpeta actualizado correctamente.",
          error: "Error al actualizar el nombre de la carpeta.",
        });

        fetchFolders(); // Refetch para carpetas
        setEditingFolderId(null);
      } else if (type === "document") {
        // Validaciones adicionales para nombres de documentos

        const originalExtension = item.filenames.match(/\.[^.]+$/)[0]; // Obtener la extensión original del documento
        const updatedFilename = `${name}${originalExtension}`;
        const updatedData = { filenames: updatedFilename };

        await toast.promise(updateDocumentFilename(item.id, updatedData), {
          loading: "Actualizando nombre del documento...",
          success: "Nombre del documento actualizado correctamente.",
          error: "Error al actualizar el nombre del documento.",
        });

        fetchFolders(); // Refetch para documentos si es necesario
        setEditingDocumentId(null);
      }
    } catch (error) {
      console.error(`Error updating ${type} name:`, error);
      toast.error(`Error al actualizar el nombre de ${type}.`);
    }
  };

  // Función para eliminar permanentemente
  const handlePermanentDelete = async (item, type) => {
    try {
      if (type === "folder") {
        await toast.promise(
          deleteFolderPermanently(item.id_folder),
          {
            loading: "Eliminando carpeta permanentemente...",
            success: "Carpeta eliminada permanentemente.",
            error: "Error al eliminar carpeta permanentemente.",
          },
        );
      } else if (type === "document") {
        await toast.promise(
          deleteDocumentPermanently(item.id),
          {
            loading: "Eliminando documento permanentemente...",
            success: "Documento eliminado permanentemente.",
            error: "Error al eliminar documento permanentemente.",
          },
        );
      }

      // Refresca la lista después de la eliminación
      fetchFolders();
    } catch (error) {
      console.error(`Error al eliminar ${type} permanentemente:`, error);
      toast.error(`Error al eliminar ${type} permanentemente.`);
    }
  };

  // Función para mostrar modal de confirmación personalizado
  const showConfirmModal = (title, message, onConfirm, type = "danger", confirmText = "Confirmar", cancelText = "Cancelar") => {
    setConfirmData({
      title,
      message,
      onConfirm,
      confirmText,
      cancelText,
      type
    });
    setIsConfirmModalOpen(true);
  };

  // Función para cerrar modal de confirmación
  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setConfirmData({
      title: "",
      message: "",
      onConfirm: null,
      confirmText: "Confirmar",
      cancelText: "Cancelar",
      type: "danger"
    });
  };

  // Función para vaciar papelera
  const handleEmptyTrash = async () => {
    try {
      await toast.promise(
        emptyTrash(userStore.user.id),
        {
          loading: "Vaciando papelera...",
          success: "Papelera vaciada correctamente.",
          error: "Error al vaciar papelera.",
        },
      );

      // Refresca la lista después de vaciar
      fetchFolders();
    } catch (error) {
      console.error("Error al vaciar papelera:", error);
      toast.error("Error al vaciar papelera.");
    }
  };

  // Renderizar carpetas
  const renderFolders = (folderData, level = 0) => {
    const { children } = folderData;

    if (selectedType.type && selectedType.type !== "Carpetas") {
      return null; // No renderizar carpetas si se selecciona un tipo de documento que no es carpetas
    }

    return (
      <>
        {children &&
          children.map((child) => {
            const totalSize = calculateTotalSize(child); // Calcula el tamaño total de la carpeta y sus subcarpetas

            return (
              <React.Fragment key={child.id_folder}>
                <tr className="text-sm text-left text-gray-700 bg-white even:bg-gray-50 border-b last:border-b-0 hover:bg-blue-50 transition-colors duration-150">
                  <td className="flex items-center justify-center w-auto p-4"></td>
                  <td
                    className="p-4 cursor-pointer"
                    onDoubleClick={() => handleFolderClick(child.id_folder)}
                  >
                    <div
                      className="flex items-center justify-start"
                      style={{ paddingLeft: `${level * 20}px` }}
                    >
                      <div className="w-6 h-6 mr-2">
                        <Folder size={24} className="text-custom-blue" />
                      </div>
                      {editingFolderId === child.id_folder ? (
                        <input
                          type="text"
                          value={editedName}
                          onChange={handleNameChange}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleSaveClick(child, "folder");
                            }
                          }}
                          className="border border-custom-blue rounded p-1"
                        />
                      ) : (
                        child.nombre_carpeta
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 mr-2 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
                        <Image
                          src={"/profile.png"}
                          alt="Logo"
                          width={100}
                          height={100}
                          style={{ filter: "brightness(50%)" }}
                        />
                      </div>
                      {child.usuario_id === userStore.user.id
                        ? "Yo"
                        : child.usuario_id}
                    </div>
                  </td>
                  <td className="p-4">
                    {format(new Date(child.updatedAt), "dd/MM/yyyy HH:mm:ss", {
                      locale: es,
                    })}
                  </td>
                  <td className="p-4">{formatFileSize(totalSize)}</td>
                  <td className="flex items-center justify-center p-2">
                    {/* <button className="ml-3" onClick={opensharemodal}>
                                        <UserPlus size={18} className="stroke-[#828080] hover:stroke-[#424242] transition-all ease-linear duration-150" />
                                    </button> */}
                    <button
                      className="ml-3"
                      onClick={() => handleFavoriteToggle(child, "folder")}
                    >
                      <Star
                        size={18}
                        className={`transition-all ease-linear duration-150 ${
                          child.favorited_by_users.includes(userStore.user.id)
                            ? "stroke-[#5c7891] hover:stroke-[#597387]" // Color dorado si es favorito
                            : "stroke-[#5c7891] hover:stroke-[#597387]" // Color gris si no es favorito
                        }`}
                      />
                    </button>
                    {/* <button className="ml-3">
                                        <ArrowDownToLine size={18} className="stroke-[#828080] hover:stroke-[#424242] transition-all ease-linear duration-150" />
                                    </button> */}
                    {/* <button className="ml-3">
                                        <Eye size={18} className="stroke-[#828080] hover:stroke-[#424242] transition-all ease-linear duration-150" />
                                    </button> */}
                    <button
                      className="ml-3"
                      onClick={() => openEditModal(child, "folder")}
                    >
                      <PenLine
                        size={18}
                        className="stroke-[#5c7891] hover:stroke-[#597387] transition-all ease-linear duration-150"
                      />
                    </button>
                    {/* Botón mover solo si NO estamos en papelera */}
                    {currentPath !== "papelera" && (
                      <button
                        className="ml-3"
                        onClick={() => openMoveModal(child)}
                      >
                        <FiMove
                          size={18}
                          className="stroke-[#828080] hover:stroke-[#424242] transition-all ease-linear duration-150"
                        />
                      </button>
                    )}
                    {/* Botón de papelera - Mover a papelera o Restaurar */}
                    <button
                      className="ml-3"
                      onClick={() => toggleTrash(child, "folder")}
                      title={child.trashed ? "Restaurar" : "Mover a papelera"}
                    >
                      {child.trashed ? (
                        <RiArrowGoBackFill
                          size={18}
                          className="stroke-[#10B981] hover:stroke-[#047857] transition-all ease-linear duration-150"
                        />
                      ) : (
                        <RiDeleteBin6Line
                          size={18}
                          className="stroke-[#EF4444] hover:stroke-[#DC2626] transition-all ease-linear duration-150"
                        />
                      )}
                    </button>
                    {/* Botón eliminar permanentemente solo en papelera */}
                    {currentPath === "papelera" && child.trashed && (
                      <button
                        className="ml-3"
                        onClick={() => {
                          showConfirmModal(
                            "Eliminar permanentemente",
                            `¿Está seguro de que desea eliminar permanentemente la carpeta "${child.nombre_carpeta}"? Esta acción no se puede deshacer.`,
                            () => handlePermanentDelete(child, "folder"),
                            "danger",
                            "Eliminar",
                            "Cancelar"
                          );
                        }}
                        title="Eliminar permanentemente"
                      >
                        <RiDeleteBin6Line
                          size={18}
                          className="stroke-[#991B1B] hover:stroke-[#7F1D1D] transition-all ease-linear duration-150"
                        />
                      </button>
                    )}
                  </td>
                </tr>
                {/* Renderizado recursivo de subcarpetas */}
                {child.children &&
                  renderFolders(
                    { folder: child, children: child.children || [] },
                    level + 1,
                  )}
              </React.Fragment>
            );
          })}
      </>
    );
  };

  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  const toggleMenu = (e, id) => {
    e.stopPropagation();
    setOpenMenuId((prevId) => (prevId === id ? null : id));
  };

  const renderFoldersGrid = (folders, documents) => {

    if (selectedType.type && selectedType.type !== "Carpetas") {
      folders = []; // Elimina todas las carpetas si el filtro no es "Carpetas"
    }

    // Aplicar el filtro de modificación a las carpetas y documentos
    const userFolderId = userFolder ? userFolder.id_folder : null; // Obtener dinámicamente el ID de la carpeta principal
    const filteredFolders = folders
      .filter((folder) => folder.id_folder !== currentPath) // Excluir la carpeta principal
      .filter((folder) => matchesModificationFilter(folder.updatedAt));

    const filteredDocuments = documents.filter((document) =>
      matchesModificationFilter(document.updatedAt),
    );

    // Combina las carpetas y documentos ya filtrados
    const allItems = [
      ...filteredFolders.map((folder) => ({ type: "folder", ...folder })),
      ...filteredDocuments.map((document) => ({
        type: "document",
        ...document,
      })),
    ];

    return (
      <div
        className={`grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:!grid-cols-5 gap-2 p-4 min-h-[50vh] ${isDraggingOverGrid ? "border-2 border-yellow-500" : ""}`}
        style={{
          minHeight: "10vh",
          gridTemplateColumns: `repeat(auto-fit, 255px)`,
          gridAutoRows: "minmax(100px, auto)",
          display: allItems.length === 0 ? "flex" : "grid",
          justifyContent: allItems.length === 0 ? "center" : "flex-start",
          alignItems: allItems.length === 0 ? "center" : "flex-start",
        }}
        {...(currentPath !== "papelera" && {
          onDragOver: (e) => {
            e.preventDefault();
            setIsDraggingOverGrid(true);
          },
        })}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) {
            setIsDraggingOverGrid(false);
          }
        }}
        onDrop={async (e) => {
          e.preventDefault();
          setIsDraggingOverGrid(false);

          const items = e.dataTransfer.items;
          const folders = [];
          const files = [];

          async function traverseDirectory(entry, path = "") {
            if (entry.isFile) {
              const file = await new Promise((resolve) => entry.file(resolve));
              folders.push({ file, relativePath: `${path}${file.name}` });
            } else if (entry.isDirectory) {
              const reader = entry.createReader();
              const entries = await new Promise((resolve) =>
                reader.readEntries(resolve),
              );
              for (const newEntry of entries) {
                await traverseDirectory(newEntry, `${path}${entry.name}/`);
              }
              // Asegurarse de registrar la carpeta incluso si está vacía
              if (entries.length === 0) {
                folders.push({ relativePath: `${path}${entry.name}/` });
              }
            }
          }

          for (let i = 0; i < items.length; i++) {
            const entry = items[i].webkitGetAsEntry();
            if (entry && entry.isDirectory) {
              await traverseDirectory(entry);
            } else if (entry && entry.isFile) {
              files.push(items[i].getAsFile());
            }
          }

          if (folders.length > 0) {
            try {
              await handleFolderUpload(folders); // Llama a la función directamente con los folders
            } catch (error) {
              toast.error("Error al subir la carpeta: " + error.message);
            }
          }

          if (files.length > 0) {
            try {
              await handleFileUpload(files); // Llama a la función directamente con los files
            } catch (error) {
              toast.error("Error al subir el archivo: " + error.message);
            }
          }

          if (folders.length === 0 && files.length === 0) {
            toast.error(
              "Por favor, arrastra un archivo o una carpeta completa.",
            );
          }
        }}
      >
        {allItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[40vh] w-full text-center">
            <p className="text-gray-500 text-lg">
              No hay carpetas ni archivos.
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Arrastra y suelta aquí para cargar archivos o carpetas.
            </p>
          </div>
        ) : (
          allItems.map((item) => (
            <div
              key={`${item.type}-${item.id_folder || item.id}`}
              className={`flex flex-col justify-between p-3 bg-gradient-to-r from-gray-50 via-white to-gray-100 border ${isDraggingOverItem === item.id_folder || isDraggingOverItem === item.id ? "border-yellow-500" : "border-gray-300"} rounded-lg shadow-md cursor-pointer hover:bg-gradient-to-l hover:from-teal-50 hover:to-white transition-transform duration-200`}
              style={{ minWidth: "160px", height: "90px" }}
              {...(!item.trashed && {
                onDragOver: (e) => {
                  e.preventDefault();
                  setIsDraggingOverItem(item.id_folder || item.id);
                },
              })}
              onDragLeave={() => setIsDraggingOverItem(null)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingOverItem(null);
              }}
              onDoubleClick={(e) => {
                currentPath === "papelera"
                  ? toggleMenu(e, item.id_folder || item.id)
                  : item.type === "folder"
                    ? handleFolderClick(item.id_folder)
                    : window.open(item.link, "_blank");
              }}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div className="flex items-center overflow-hidden">
                  {item.type === "folder" ? (
                    <Folder size={28} className="text-teal-600 flex-shrink-0" />
                  ) : (
                    getFileIcon(item.fileExtension)
                  )}
                  <div className="ml-2 text-sm font-semibold text-gray-900 truncate w-full">
                    {item.type === "folder"
                      ? item.nombre_carpeta
                      : item.filenames}
                  </div>
                </div>
                <div className="ml-2 flex-shrink-0 relative" ref={menuRef}>
                  <button
                    className="p-1 text-gray-500 rounded-full hover:bg-gray-100"
                    onClick={(e) => toggleMenu(e, item.id_folder || item.id)}
                  >
                    <FiMoreVertical size={18} />
                  </button>

                  <div className="absolute">
                    {openMenuId === (item.id_folder || item.id) && (
                      <div
                        className="relative right-0 mt-2 w-48 bg-white bg-opacity-70 backdrop-blur-md rounded-xl shadow-lg ring-1 ring-gray-200"
                        style={{ zIndex: 9999 }} // Se ajusta el z-index para que esté sobre todo
                      >
                        <ul className="py-2">
                          {/* Mostrar los otros botones solo si no es "papelera" */}
                          {currentPath !== "papelera" && (
                            <>
                              <li>
                                <button
                                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-900 hover:bg-gray-200 transition-colors duration-150 ease-in-out rounded-md"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    console.log(
                                      "Favoritos clickeado para",
                                      item,
                                    );
                                    handleFavoriteToggle(
                                      item,
                                      item.type === "folder"
                                        ? "folder"
                                        : "document",
                                    );
                                    setOpenMenuId(null); // Cerrar el menú después de la acción
                                  }}
                                >
                                  <FiStar className="mr-2 text-yellow-500" />{" "}
                                  {item.favorited_by_users.includes(
                                    userStore.user.id,
                                  )
                                    ? "Quitar de favoritos"
                                    : "Agregar a favoritos"}
                                </button>
                              </li>
                              <li>
                                <button
                                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-900 hover:bg-gray-200 transition-colors duration-150 ease-in-out rounded-md"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditModal(item, item.type); // Llama a la función para abrir el modal de edición
                                    setOpenMenuId(null); // Cerrar el menú después de la acción
                                  }}
                                >
                                  <FiEdit className="mr-2" /> Cambiar nombre
                                </button>
                              </li>
                              <li>
                                <button
                                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-900 hover:bg-gray-200 transition-colors duration-150 ease-in-out rounded-md"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openMoveModal(item); // Llamada correcta a la función para abrir el modal
                                    setOpenMenuId(null); // Cerrar el menú después de la acción
                                  }}
                                >
                                  <FiMove className="mr-2" /> Mover
                                </button>
                              </li>
                            </>
                          )}

                          {/* Mostrar solo el botón de Mover a la papelera o Restaurar si es "papelera" */}
                          <li>
                            <button
                              className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-900 hover:bg-gray-200 transition-colors duration-150 ease-in-out rounded-md"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTrash(item, item.type); // Llamada a la función toggleTrash
                                setOpenMenuId(null); // Cerrar el menú después de la acción
                              }}
                            >
                              {item.trashed ? (
                                <>
                                  <RiArrowGoBackFill className="mr-2" />{" "}
                                  Restaurar
                                </>
                              ) : (
                                <>
                                  <RiDeleteBin6Line className="mr-2" /> Mover a
                                  la papelera
                                </>
                              )}
                            </button>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-600 truncate flex items-center justify-between">
                <span>
                  {item.type === "folder"
                    ? "Carpeta"
                    : item.fileExtension.toUpperCase()}
                </span>
                {item.favorited_by_users.includes(userStore.user.id) && (
                  <FiStar className="ml-2 text-yellow-500" title="Favorito" />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  const toggleTrash = async (item, type) => {
    try {
      const isTrashed = item.trashed;
      const trashed = !isTrashed;
      const trashedAt = trashed ? new Date() : null; // Si se restaura, la fecha es null

      if (type === "folder") {
        // Llama al servicio para carpetas
        await toggleTrashFolder(item.id_folder, trashed);
      } else if (type === "document") {
        // Llama al servicio para documentos
        await toggleTrashDocument(item.id, trashed);
      }

      toast.success(
        trashed
          ? `${type === "folder" ? "Carpeta" : "Documento"} movido a la papelera.`
          : `${type === "folder" ? "Carpeta" : "Documento"} restaurado.`,
      );

      fetchFolders();
    } catch (error) {
      toast.error("Error al actualizar el estado.");
    }
  };

  // Renderizar documentos
  const renderDocuments = (documents, level = 0) => {

    // Si se selecciona "Carpetas", eliminar todos los documentos
    if (selectedType.type && selectedType.type === "Carpetas") {
      return null; // No renderizar documentos si el tipo seleccionado es "Carpetas"
    }

    return documents.map((document) => {
      // Extraer el nombre base y la extensión
      const [nameWithoutExtension, extension] =
        document.filenames.split(/(?=\.[^.]+$)/);

      return (
        <tr
          key={document.id}
          className={`text-sm text-left text-gray-700 bg-white even:bg-gray-50 border-b last:border-b-0 hover:bg-blue-50 transition-colors duration-150 ${editingDocumentId === document.id ? "bg-blue-100" : ""}`}
        >
          <td className="flex items-center justify-center w-auto p-4"></td>
          <td
            className="p-4 cursor-pointer"
            onClick={() =>
              !editingDocumentId && window.open(document.link, "_blank")
            }
          >
            <div
              className="flex items-center justify-start"
              style={{ paddingLeft: `${level * 20}px` }}
            >
              <div className="w-6 h-6 mr-2 overflow-hidden">
                {getFileIcon(document.fileExtension)}
              </div>
              {editingDocumentId === document.id ? (
                <input
                  type="text"
                  value={editedFilename}
                  onChange={handleFilenameChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSaveClick(document, "document");
                    }
                  }}
                  className="border border-custom-blue rounded p-1"
                />
              ) : (
                document.filenames
              )}
            </div>
          </td>
          <td className="p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 mr-2 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
                <Image
                  src={"/profile.png"}
                  alt="Logo"
                  width={100}
                  height={100}
                  style={{ filter: "brightness(50%)" }}
                />
              </div>
              {document.userId === userStore.user.id ? "Yo" : document.userId}
            </div>
          </td>
          <td className="p-4">
            {format(new Date(document.updatedAt), "dd/MM/yyyy HH:mm:ss", {
              locale: es,
            })}
          </td>
          <td className="p-4">{formatFileSize(document.filesize)}</td>
          <td className="flex items-center justify-center p-2">
            {/* <button className="ml-3" onClick={opensharemodal}>
                            <UserPlus size={18} className="stroke-[#828080] hover:stroke-[#424242] transition-all ease-linear duration-150" />
                        </button> */}
            <button
              className="ml-3"
              onClick={() => handleFavoriteToggle(document, "document")}
            >
              <Star
                size={18}
                className={`transition-all ease-linear duration-150 ${
                  document.favorited_by_users.includes(userStore.user.id)
                    ? "stroke-[#FFD700] hover:stroke-[#FFA500]" // Color dorado si es favorito
                    : "stroke-[#828080] hover:stroke-[#424242]" // Color gris si no es favorito
                }`}
              />
            </button>

            {/* <button className="ml-3">
                            <ArrowDownToLine size={18} className="stroke-[#828080] hover:stroke-[#424242] transition-all ease-linear duration-150" />
                        </button> */}
            {/* <button className="ml-3">
                            <Eye size={18} className="stroke-[#828080] hover:stroke-[#424242] transition-all ease-linear duration-150" />
                        </button> */}
            {/* Botón de edición para documentos */}
            <button
              className="ml-3"
              onClick={() => openEditModal(document, "document")}
            >
              <PenLine
                size={18}
                className="stroke-[#828080] hover:stroke-[#424242] transition-all ease-linear duration-150"
              />
            </button>
            {/* Botón mover solo si NO estamos en papelera */}
            {currentPath !== "papelera" && (
              <button className="ml-3" onClick={() => openMoveModal(document)}>
                <FiMove
                  size={18}
                  className="stroke-[#828080] hover:stroke-[#424242] transition-all ease-linear duration-150"
                />
              </button>
            )}
            {/* Botón de papelera - Mover a papelera o Restaurar */}
            <button
              className="ml-3"
              onClick={() => toggleTrash(document, "document")}
              title={document.trashed ? "Restaurar" : "Mover a papelera"}
            >
              {document.trashed ? (
                <RiArrowGoBackFill
                  size={18}
                  className="stroke-[#10B981] hover:stroke-[#047857] transition-all ease-linear duration-150"
                />
              ) : (
                <RiDeleteBin6Line
                  size={18}
                  className="stroke-[#EF4444] hover:stroke-[#DC2626] transition-all ease-linear duration-150"
                />
              )}
            </button>
            {/* Botón eliminar permanentemente solo en papelera */}
            {currentPath === "papelera" && document.trashed && (
              <button
                className="ml-3"
                onClick={() => {
                  showConfirmModal(
                    "Eliminar permanentemente",
                    `¿Está seguro de que desea eliminar permanentemente el documento "${document.filenames}"? Esta acción no se puede deshacer.`,
                    () => handlePermanentDelete(document, "document"),
                    "danger",
                    "Eliminar",
                    "Cancelar"
                  );
                }}
                title="Eliminar permanentemente"
              >
                <RiDeleteBin6Line
                  size={18}
                  className="stroke-[#991B1B] hover:stroke-[#7F1D1D] transition-all ease-linear duration-150"
                />
              </button>
            )}
          </td>
        </tr>
      );
    });
  };

  // Función para calcular el tamaño total de los documentos
  // Función para calcular el tamaño total de los documentos en la carpeta actual y sus subcarpetas
  // Función para calcular el tamaño total de los documentos y subcarpetas
  function calculateTotalSize(folder) {
    if (!folder) return 0;

    // Usar el tamaño acumulado ya calculado en el campo 'size' de la carpeta actual
    const folderSize = folder.size ? parseInt(folder.size, 10) : 0;

    // Recursivamente calcular el tamaño de las subcarpetas
    const subfoldersSize = (folder.children || []).reduce(
      (total, subfolder) => {
        const subfolderSize = calculateTotalSize(subfolder); // Calcular el tamaño de cada subcarpeta
        return total + subfolderSize; // Sumar el tamaño de cada subcarpeta al total
      },
      0,
    );

    // Retornar la suma total del tamaño de la carpeta actual y las subcarpetas
    const totalSize = folderSize + subfoldersSize;

    console.log(
      `Tamaño total de la carpeta '${folder.nombre_carpeta}': ${totalSize} bytes`,
    );

    return totalSize;
  }

  // Función para formatear el tamaño del archivo en KB, MB, GB
  function formatFileSize(bytes) {
    if (bytes === null || bytes === undefined) return "Tamaño no definido";
    if (bytes < 1) return "0 Bytes"; // Maneja casos donde los bytes sean menores a 1
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  const handleFileUpload = async (files) => {
    console.log(
      "files en handleFileUpload (tipo):",
      Array.isArray(files),
      files,
    );

    if (!Array.isArray(files) || files.length === 0) {
      toast.error("Por favor, selecciona uno o más archivos primero");
      return;
    }
    const userid = userStore.user.id;

    console.log("foldersState:", foldersState);

    // Acceder a la carpeta actual
    const folder = foldersState.folder;
    const folderId = folder ? folder.id_folder : null;

    if (!folderId) {
      toast.error("No se pudo determinar la carpeta seleccionada.");
      return;
    }

    console.log("Subiendo archivos a la carpeta con ID:", folderId);

    const toastId = toast.loading("Subiendo archivos...");
    let allFilesUploaded = true;
    const forbiddenExtensions = [".exe", ".bat", ".sh"];

    try {
      for (const file of files) {
        const fileExtension = file.name
          .slice(file.name.lastIndexOf("."))
          .toLowerCase();

        if (forbiddenExtensions.includes(fileExtension)) {
          toast.error(`El archivo ${file.name} tiene una extensión prohibida.`);
          allFilesUploaded = false;
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("folderId", folderId);
        formData.append("userid", userid);
        console.log(userid);

        // Verificar el contenido de FormData
        for (var pair of formData.entries()) {
          if (pair[1] instanceof File) {
            console.log(`${pair[0]}: Archivo con nombre: ${pair[1].name}`);
          } else {
            console.log(`${pair[0]}: ${pair[1]}`);
          }
        }

        try {
          const data = await uploadFile(formData);

          console.log(data);
          console.log(`Archivo subido correctamente: ${file.name}`);
        } catch (error) {
          console.error(`Error al subir el archivo ${file.name}:`, error);
          allFilesUploaded = false;
          toast.error(`El archivo ${file.name} no se pudo subir.`);
          if (error.response) {
            console.log("Respuesta del servidor:", error.response.data);
          }
        }
      }

      toast.dismiss(toastId);

      if (allFilesUploaded) {
        toast.success("Todos los archivos subidos correctamente.");
      } else {
        toast.error("Algunos archivos no se pudieron subir.");
      }

      closefileModal();
      fetchFolders();
    } catch (error) {
      console.error("Error al subir los archivos:", error);
      toast.dismiss(toastId);
      toast.error("Hubo un error al subir los archivos.");
    }
  };

  function formatStorageSize(sizeInBytes) {
    // Verificar si sizeInBytes es undefined o null y asignar 0 en ese caso
    if (sizeInBytes == null) {
      return "0 B"; // Si el valor es nulo o indefinido, retorna "0 B"
    }

    const size = BigInt(sizeInBytes); // Convertimos el valor a BigInt si es válido

    if (size >= 1073741824n) {
      // GB (1 GB = 1024^3 bytes)
      return `${(Number(size) / 1073741824).toFixed(2)} GB`;
    } else if (size >= 1048576n) {
      // MB (1 MB = 1024^2 bytes)
      return `${(Number(size) / 1048576).toFixed(2)} MB`;
    } else if (size >= 1024n) {
      // KB (1 KB = 1024 bytes)
      return `${(Number(size) / 1024).toFixed(2)} KB`;
    } else {
      // Bytes
      return `${size} B`;
    }
  }

  function calculateStorageUsage(totalSize, storageLimit) {
    // Calcular el porcentaje de almacenamiento utilizado
    const usagePercentage = ((totalSize / storageLimit) * 100).toFixed(2);

    // Determinar el mensaje de advertencia basado en el porcentaje de uso
    let warningMessage = "";
    if (usagePercentage >= 99) {
      warningMessage = "Espacio de almacenamiento lleno";
    } else if (usagePercentage >= 90) {
      warningMessage = "Espacio de almacenamiento casi lleno";
    } else if (usagePercentage >= 70) {
      warningMessage = "Espacio de almacenamiento superior al 70%";
    } else {
      warningMessage = "";
    }

    return {
      formattedTotalSize: formatStorageSize(totalSize),
      formattedStorageLimit: formatStorageSize(storageLimit),
      usagePercentage,
      warningMessage,
    };
  }

  // Utiliza la función para calcular los valores y obtener el mensaje de advertencia
  const {
    formattedTotalSize,
    formattedStorageLimit,
    usagePercentage,
    warningMessage,
  } = calculateStorageUsage(totalSize, storageLimit);

  // Determinar si se debe mostrar el botón
  const shouldShowButton = usagePercentage >= 90;

  let folderMap = {}; // Definición global

  const handleFolderUpload = async (folders, skipReplaceCheck = false) => {
    if (!Array.isArray(folders) || folders.length === 0) {
      toast.error("No se seleccionó ninguna carpeta.");
      return;
    }
    const userid = userStore.user.id;

    console.log(userid);
    const forbiddenExtensions = [".exe", ".bat", ".sh"]; // Extensiones prohibidas
    let allFilesUploaded = true;

    try {
      // Ajuste: Verificar si foldersState tiene la propiedad `folder`
      const parentFolder = foldersState.folder; // Acceder directamente a `folder` en lugar de usar `.find()`
      const parentFolderId = parentFolder ? parentFolder.id_folder : null;

      if (!parentFolderId) {
        toast.error("No se pudo determinar la carpeta seleccionada.");
        return;
      }

      // Inicializar folderMap con el id_folder actual
      folderMap[currentPath] = parentFolderId;

      const folderPaths = new Set();
      for (let fileObj of folders) {
        const relativePath = fileObj.relativePath || fileObj.webkitRelativePath;
        if (relativePath) {
          const pathParts = relativePath.split("/");
          const folderPath = pathParts.slice(0, -1).join("/");
          if (folderPath) {
            folderPaths.add(folderPath);
          }
        }
      }

      for (let folderPath of folderPaths) {
        const pathParts = folderPath.split("/");
        let folderId = folderMap[folderPath];

        if (!folderId) {
          const folderName = pathParts[pathParts.length - 1];

          // Verificar si la carpeta ya existe
          if (!skipReplaceCheck) {
            // Ajuste: Comparar con `folder` en vez de usar `.find()`
            const existingFolder =
              foldersState.folder &&
              foldersState.folder.nombre_carpeta === folderName &&
              foldersState.folder.parent_folder_id === parentFolderId
                ? foldersState.folder
                : null;

            if (existingFolder) {
              // Guardar la carpeta para reemplazo
              setFolderToReplace(existingFolder);

              // Mostrar el modal para que el usuario decida
              setIsReplaceModalOpen(true);
              return; // Detener la ejecución hasta que el usuario tome una decisión
            }
          }

          // Crear la nueva carpeta usando id_folder en vez de path
          const newFolder = await postFolders({
            nombre_carpeta: folderName,
            nombre_S3_cloud: folderName,
            usuario_id: userStore.user.id,
            parent_folder_id:
              folderMap[pathParts.slice(0, -1).join("/")] || parentFolderId,
            path: parentFolder.path, // No más construcción de `path`, lo manejas con id_folder
            depth: pathParts.length,
          });

          folderId = newFolder.data.id_folder;
          folderMap[folderPath] = folderId;
        }
      }

      // Mostrar el loading toast después de verificar si se requiere el modal
      toast.loading("Subiendo carpeta y archivos...");

      for (let fileObj of folders) {
        const relativePath = fileObj.relativePath || fileObj.webkitRelativePath;
        if (relativePath && fileObj.file) {
          const fileExtension = fileObj.file.name
            .slice(fileObj.file.name.lastIndexOf("."))
            .toLowerCase();

          if (forbiddenExtensions.includes(fileExtension)) {
            toast.error(
              `El archivo ${fileObj.file.name} tiene una extensión prohibida.`,
            );
            allFilesUploaded = false;
            continue;
          }

          const pathParts = relativePath.split("/");
          const folderPath = pathParts.slice(0, -1).join("/");
          const folderId = folderMap[folderPath];

          if (folderId) {
            const formData = new FormData();
            formData.append("file", fileObj.file);
            formData.append("folderId", folderId);
            formData.append("userid", userid);

            console.log("usuario enviado con file ess ", userid);
            try {
              await uploadFile(formData);
            } catch (error) {
              console.error(
                `Error al subir el archivo ${fileObj.file.name}:`,
                error,
              );
              allFilesUploaded = false;
              toast.error(`El archivo ${fileObj.file.name} no se pudo subir.`);
            }
          }
        }
      }

      toast.dismiss();

      if (allFilesUploaded) {
        toast.success("Carpeta y archivos subidos correctamente.");
      } else {
        toast.error("Algunos archivos no se pudieron subir.");
      }

      closefolderModal();
      fetchFolders();
    } catch (error) {
      console.error("Error al subir la carpeta:", error);
      toast.dismiss();
      toast.error("Hubo un error al subir la carpeta.");
    }
  };

  // drag sobre vista tabla
  const handleTableDrop = async (e) => {
    e.preventDefault();
    setIsDraggingOverGrid(false);

    const items = e.dataTransfer.items;
    const folders = [];
    const files = [];

    async function traverseDirectory(entry, path = "") {
      if (entry.isFile) {
        const file = await new Promise((resolve) => entry.file(resolve));
        folders.push({ file, relativePath: `${path}${file.name}` });
      } else if (entry.isDirectory) {
        const reader = entry.createReader();
        const entries = await new Promise((resolve) =>
          reader.readEntries(resolve),
        );
        for (const newEntry of entries) {
          await traverseDirectory(newEntry, `${path}${entry.name}/`);
        }
        // Registrar carpeta vacía si no tiene entradas
        if (entries.length === 0) {
          folders.push({ relativePath: `${path}${entry.name}/` });
        }
      }
    }

    for (let i = 0; i < items.length; i++) {
      const entry = items[i].webkitGetAsEntry();
      if (entry && entry.isDirectory) {
        await traverseDirectory(entry);
      } else if (entry && entry.isFile) {
        files.push(items[i].getAsFile());
      }
    }

    // Manejo de carpetas
    if (folders.length > 0) {
      try {
        await handleFolderUpload(folders); // Pasar las carpetas directamente
      } catch (error) {
        toast.error("Error al subir la carpeta: " + error.message);
      }
    }

    // Manejo de archivos
    if (files.length > 0) {
      try {
        await handleFileUpload(files); // Pasar los archivos directamente
      } catch (error) {
        toast.error("Error al subir el archivo: " + error.message);
      }
    }

    // No se mostrará un mensaje de error si no hay archivos o carpetas (permite carpetas vacías)
  };

  const handleReplaceDecision = (replace) => {
    setReplaceOption(replace);
  };

  const handleConfirmReplace = async () => {
    let folderNameToUse = folderToReplace.nombre_carpeta;

    // Mostrar el toast de carga
    const toastId = toast.loading("Procesando...");

    try {
      if (replaceOption === "replace") {
        // Lógica para reemplazar la carpeta existente
        await deleteFolder(folderToReplace.id_folder);
        toast.success(
          `La carpeta ${folderToReplace.nombre_carpeta} fue reemplazada.`,
          { id: toastId },
        );
      } else if (replaceOption === "keep") {
        // Lógica para mantener ambas carpetas, renombrando la nueva carpeta
        let counter = 1;
        let newPath;
        let newFolderExists = true;

        // Generar un nombre único para la nueva carpeta
        while (newFolderExists) {
          const potentialNewName = `${folderToReplace.nombre_carpeta} (${counter})`;
          newPath = `${folderToReplace.path.replace(folderToReplace.nombre_carpeta, potentialNewName)}`;

          // Verificar si ya existe una carpeta con el nombre generado
          const existingFolder = foldersState.find((f) => f.path === newPath);

          if (!existingFolder) {
            folderNameToUse = potentialNewName;
            newFolderExists = false;
          } else {
            counter++;
          }
        }

        // Crear la nueva carpeta con el nombre único
        const newFolder = await postFolders({
          nombre_carpeta: folderNameToUse,
          nombre_S3_cloud: folderNameToUse,
          enlace: newPath,
          usuario_id: userStore.user.id,
          parent_folder_id: folderToReplace.parent_folder_id,
          path: newPath,
          depth: folderToReplace.depth,
        });

        // Actualizar el mapa de carpetas para usar la nueva carpeta
        folderMap[newPath] = newFolder.data.id_folder;

        // Actualizar la lista de carpetas después de crear la nueva carpeta
        await fetchFolders();

        toast.success(
          `La carpeta ${folderNameToUse} fue creada exitosamente.`,
          { id: toastId },
        );
      }

      setIsReplaceModalOpen(false);
      setFolderToReplace(null);

      // Continuar con la subida de la carpeta después de que se ha manejado la decisión
      if (foldersQueue) {
        await handleFolderUpload(foldersQueue, true); // Pasamos skipReplaceCheck como true para evitar que vuelva a aparecer el modal
        setFoldersQueue(null); // Limpiar la cola de carpetas después de completar la subida
      }
    } catch (error) {
      console.error("Error al procesar la carpeta:", error);
      toast.error("Hubo un error al procesar la carpeta.", { id: toastId });
    }
  };

  // Estado para manejar la visibilidad del menú y la selección de elementos
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  // Contar el número de carpetas y documentos seleccionados
  const [selectedFoldersCount, setSelectedFoldersCount] = useState(0);
  const [selectedDocumentsCount, setSelectedDocumentsCount] = useState(0);

  // Lógica para manejar la selección de elementos
  const handleCheck = (item) => {
    const id = item.id || item.id_folder; // Asegúrate de obtener el ID correcto
    const isSelected = selectedItems.some(
      (selectedItem) => (selectedItem.id || selectedItem.id_folder) === id,
    );
    console.log(
      `Elemento seleccionado: ${item.nombre_carpeta || item.filenames} (ID: ${id}), ¿Ya estaba seleccionado?: ${isSelected}`,
    );

    let newSelection;
    if (isSelected) {
      newSelection = selectedItems.filter(
        (selectedItem) => (selectedItem.id || selectedItem.id_folder) !== id,
      );
      console.log("Elemento eliminado de la selección");
    } else {
      newSelection = [...selectedItems, { ...item, id }];
      console.log("Elemento añadido a la selección");
    }

    console.log("Nueva selección:", newSelection);

    setSelectedItems(newSelection);
    setIsMenuVisible(newSelection.length > 0);

    // Actualiza los contadores de carpetas y documentos
    const foldersCount = newSelection.filter(
      (selectedItem) => selectedItem.id_folder !== undefined,
    ).length;
    const documentsCount = newSelection.filter(
      (selectedItem) =>
        selectedItem.id !== undefined && selectedItem.id_folder === undefined,
    ).length;

    setSelectedFoldersCount(foldersCount);
    setSelectedDocumentsCount(documentsCount);

    console.log(`Carpetas seleccionadas: ${foldersCount}`);
    console.log(`Documentos seleccionados: ${documentsCount}`);
    console.log(`Menú visible: ${newSelection.length > 0}`);
  };

  // Lógica para cerrar el menú y limpiar la selección
  const handleMenuClose = () => {
    console.log("Cerrando menú y limpiando selección");
    setIsMenuVisible(false);
    setSelectedItems([]);
    setSelectedFoldersCount(0);
    setSelectedDocumentsCount(0);
  };

  // Efecto para cerrar el menú y deseleccionar elementos cuando cambia el path
  useEffect(() => {
    handleMenuClose();
  }, [currentPath]); // currentPath es el prop que contiene el path actual

  // filtro tipo

  //favoritos

  const handleFavoriteToggle = async (item, type) => {
    console.log("item : ", item, "type: ", type);
    try {
      // Verifica si el item es favorito
      const isFavorite = item.favorited_by_users?.includes(userStore.user.id);

      if (type === "folder") {
        if (!item.id_folder) {
          throw new Error("Carpeta no válida. Falta id_folder.");
        }

        await toast.promise(
          toggleFavoriteFolder(item.id_folder, userStore.user.id),
          {
            loading: "Actualizando favoritos...",
            success: isFavorite
              ? "Carpeta eliminada de favoritos correctamente."
              : "Carpeta añadida a favoritos correctamente.",
            error: "Error al actualizar favorito.",
          },
        );
      } else if (type === "document") {
        if (!item.id) {
          throw new Error("Documento no válido. Falta id.");
        }

        await toast.promise(
          toggleFavoriteDocument(item.id, userStore.user.id),
          {
            loading: "Actualizando favoritos...",
            success: isFavorite
              ? "Documento eliminado de favoritos correctamente."
              : "Documento añadido a favoritos correctamente.",
            error: "Error al actualizar favorito.",
          },
        );
      }

      // Refresca la lista de carpetas y documentos después de la actualización
      fetchFolders();
    } catch (error) {
      console.error(`Error al actualizar favorito para ${type}:`, error);
      toast.error(`Error al actualizar favorito para ${type}.`);
    }
  };

  return (
    <>
      {drawerOpen && (
        <div className="flex h-screen">
          <button onClick={toggleDrawer}>Abrir Drawer</button>
          <Drawer isOpen={drawerOpen} onClose={toggleDrawer} />
          <div className="flex-grow">Contenido de tu página aquí.</div>
        </div>
      )}

      {/* Modal de confirmación personalizado */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-75">
          <div className="bg-white rounded-lg shadow-lg w-[450px] p-6">
            <div className="flex items-center mb-4">
              {confirmData.type === "danger" && (
                <div className="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                  <RiDeleteBin6Line className="w-6 h-6 text-red-600" />
                </div>
              )}
              {confirmData.type === "warning" && (
                <div className="flex-shrink-0 w-10 h-10 mx-auto bg-yellow-100 rounded-full flex items-center justify-center">
                  <WarningIcon className="w-6 h-6 text-yellow-600" />
                </div>
              )}
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {confirmData.title}
                </h3>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                {confirmData.message}
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={closeConfirmModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors duration-200"
              >
                {confirmData.cancelText}
              </button>
              <button
                onClick={() => {
                  if (confirmData.onConfirm) {
                    confirmData.onConfirm();
                  }
                  closeConfirmModal();
                }}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors duration-200 ${
                  confirmData.type === "danger" 
                    ? "bg-red-600 hover:bg-red-700" 
                    : "bg-yellow-600 hover:bg-yellow-700"
                }`}
              >
                {confirmData.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-75">
          <div className="bg-white rounded-lg shadow-lg w-[400px] p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Editar Nombre
            </h2>

            <input
              type="text"
              value={newName} // Asegúrate de que newName está correctamente inicializado
              onChange={(e) => setNewName(e.target.value)}
              aria-label="Ingresar nombre"
              className="w-full p-2 border rounded mb-4"
            />
            <div className="flex justify-end">
              <button
                onClick={() => setIsEditModalOpen(false)} // Cerrar modal al cancelar
                className="mr-4 text-gray-700 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded shadow hover:shadow-lg transition-all duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit} // Asegúrate de que handleSaveEdit esté actualizando correctamente
                className="bg-blue-500 text-white px-4 py-2 rounded shadow-lg hover:bg-blue-600 hover:shadow-xl transition-all duration-200"
                disabled={!newName.trim()} // Deshabilita el botón si el nombre está vacío
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para mover elementos */}
      {isOpenMover && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-75">
          <div className="bg-white rounded-lg shadow-lg w-[500px]">
            <div className="px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Mover &quot;
                {itemToMove?.filenames || itemToMove?.nombre_carpeta}&quot;
              </h2>

              {/* Mostrar la ubicación actual de la carpeta */}
              <div className="mb-4 flex items-center space-x-2">
                <span className="text-sm text-gray-600">Ubicación actual:</span>
                <button
                  className="flex items-center border border-gray-300 rounded-full px-3 py-1 bg-gray-100 hover:bg-gray-200 transition-colors"
                  onClick={() => {
                    const parentFolderId = itemToMove?.parent_folder_id;
                    if (parentFolderId) {
                      setCurrentMovePath(parentFolderId);
                      setNavigationHistory([]); // Limpiar historial si regresa a la carpeta original
                    }
                  }}
                >
                  <BsDeviceHdd className="text-gray-500 mr-2" />{" "}
                  {/* Ícono de disco duro */}
                  <span className="text-sm text-gray-900 font-semibold">
                    {
                      // Si la carpeta es userFolder, mostrar "Mi Unidad"
                      itemToMove?.parent_folder_id === userFolder?.id_folder
                        ? "Mi Unidad"
                        : allmove.find(
                            (folder) =>
                              folder.id_folder === itemToMove?.parent_folder_id,
                          )?.nombre_carpeta || "Carpeta desconocida"
                    }
                  </span>
                </button>
              </div>

              {/* Breadcrumb basado en el historial de navegación */}
              <div className="mb-4">
                <nav className="flex items-center text-sm text-gray-600">
                  <button
                    className={`mr-2 ${currentMovePath === userFolder?.id_folder ? "font-bold" : ""}`}
                    onClick={() => {
                      setCurrentMovePath(userFolder?.id_folder);
                      setNavigationHistory([]); // Volver al nivel raíz
                    }}
                  >
                    Mi unidad
                  </button>
                  {navigationHistory.map((folderId, index) => {
                    const folder = allmove.find(
                      (f) => f.id_folder === folderId,
                    );
                    if (!folder) return null; // Evitar errores si no se encuentra la carpeta

                    return (
                      <React.Fragment key={folderId}>
                        <span className="mx-2">/</span>
                        <button
                          className={`mr-2 ${currentMovePath === folderId ? "font-bold" : ""}`}
                          onClick={() => {
                            setCurrentMovePath(folderId); // Volver a la carpeta seleccionada
                            setNavigationHistory(
                              navigationHistory.slice(0, index + 1),
                            ); // Ajustar el historial al nivel seleccionado
                          }}
                        >
                          {folder.nombre_carpeta}
                        </button>
                      </React.Fragment>
                    );
                  })}
                </nav>
              </div>

              {/* Buscador de carpetas con ícono de lupa y botón de limpiar */}
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Buscar carpeta o documento..."
                  aria-label="Campo de busqueda de carpeta o documento"
                  className="w-full p-2 pl-10 pr-10 border rounded"
                  style={{
                    borderColor: "#5c7891", // Borde principal
                    boxShadow: "0 0 0 2px #59738722", // Sombra sutil con color secundario
                  }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
                />
                {/* Ícono de lupa */}
                <div
                  className="absolute left-3 top-1/2 transform -translate-y-1/2"
                  style={{ color: "#5c7891" }}
                >
                  <SearchIcon />
                </div>
                {/* Botón de limpiar */}
                {searchTerm && (
                  <button
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    style={{ color: "#5c7891" }}
                    onClick={() => setSearchTerm("")}
                  >
                    <X />
                  </button>
                )}
              </div>

              {/* Botón de Regresar con nombre de la carpeta anterior */}
              {navigationHistory.length > 0 && (
                <div className="mb-4">
                  {/* Obtener el `id_folder` del último nivel en el historial */}
                  {(() => {
                    const previousFolderId =
                      navigationHistory[navigationHistory.length - 1]; // Última carpeta en el historial
                    const previousFolder = allmove.find(
                      (folder) => folder.id_folder === previousFolderId,
                    ); // Buscar la carpeta por `id_folder`
                    return (
                      <button
                        className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-blue-600"
                        onClick={() => {
                          navigationHistory.pop(); // Sacamos el último nivel
                          setCurrentMovePath(previousFolderId); // Volver a la carpeta anterior
                          setNavigationHistory([...navigationHistory]); // Actualizamos el historial
                        }}
                      >
                        <FaArrowLeft className="mr-2" />{" "}
                        {/* Ícono de flecha hacia la izquierda */}
                        {previousFolder?.nombre_carpeta || "Carpeta anterior"}
                      </button>
                    );
                  })()}
                </div>
              )}

              <div className="mb-4">
                <div className="flex border-b border-gray-300 mb-4">
                  <button
                    className="px-4 py-2 text-sm text-gray-600 hover:text-blue-600"
                    onClick={() => {
                      setCurrentMovePath(userFolder?.id_folder);
                      setNavigationHistory([]); // Restablecer el historial si se vuelve a la raíz
                    }}
                  >
                    Todas las ubicaciones
                  </button>
                </div>

                <div className="h-64 overflow-y-auto">
                  {/* Mostrar la carpeta raíz "Mi Unidad" en la lista */}
                  <div
                    key={userFolder.id_folder}
                    className={`flex items-center p-2 hover:bg-gray-100 cursor-pointer`}
                    onClick={() => setSelectedFolder(userFolder.id_folder)}
                  >
                    <BsDeviceHdd className="mr-2" /> {/* Ícono de disco duro */}
                    <span
                      className={
                        selectedFolder === userFolder.id_folder
                          ? "font-semibold"
                          : ""
                      }
                    >
                      Mi Unidad
                    </span>
                  </div>

                  {/* Mostrar las carpetas que están en la ruta actual */}
                  {allmove
                    .filter(
                      (folder) => folder.parent_folder_id === currentMovePath,
                    )
                    .filter((folder) =>
                      folder.nombre_carpeta.toLowerCase().includes(searchTerm),
                    )
                    .map((folder) => {
                      const folderName = folder.nombre_carpeta;

                      // Deshabilitar si la carpeta es la que se está moviendo o si es el padre de la carpeta que se está moviendo
                      const isDisabled =
                        folder.id_folder === itemToMove?.id_folder ||
                        folder.id_folder === itemToMove?.parent_folder_id;
                      const hasSubfolders = allmove.some(
                        (f) => f.parent_folder_id === folder.id_folder,
                      );

                      return (
                        <div
                          key={folder.id_folder}
                          className={`flex items-center p-2 hover:bg-gray-100 ${isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                          onClick={() =>
                            !isDisabled && setSelectedFolder(folder.id_folder)
                          }
                        >
                          <FolderIcon className="mr-2" />
                          <span
                            className={
                              selectedFolder === folder.id_folder
                                ? "font-semibold"
                                : ""
                            }
                          >
                            {folderName}
                          </span>
                          {/* Si tiene subcarpetas, mostrar botón para ingresar */}
                          {hasSubfolders && !isDisabled && (
                            <button
                              className="ml-auto text-blue-500 hover:text-blue-700"
                              onClick={(e) => {
                                e.stopPropagation(); // Evitar seleccionar la carpeta al hacer clic en el botón
                                setNavigationHistory([
                                  ...navigationHistory,
                                  currentMovePath,
                                ]); // Agregar la carpeta actual al historial
                                setCurrentMovePath(folder.id_folder); // Cambiar a la subcarpeta seleccionada
                              }}
                            >
                              Entrar
                            </button>
                          )}
                        </div>
                      );
                    })}

                  {/* Mostrar documentos dentro de la carpeta seleccionada */}
                  {allmove
                    .filter((folder) => folder.id_folder === currentMovePath) // Filtrar la carpeta actual
                    .flatMap((folder) => folder.documents) // Obtener documentos de la carpeta
                    .filter((document) =>
                      document.filenames.toLowerCase().includes(searchTerm),
                    )
                    .map((document) => (
                      <div
                        key={document.id_document}
                        className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() =>
                          setSelectedDocument(document.id_document)
                        } // Seleccionar documento
                      >
                        <FaFile className="mr-2" />{" "}
                        {/* Cambia esto por un ícono representativo del documento */}
                        <span
                          className={
                            selectedDocument === document.id_document
                              ? "font-semibold"
                              : ""
                          }
                        >
                          {document.filenames}
                        </span>
                        <span className="ml-auto text-xs text-gray-500">
                          {document.fileExtension.toUpperCase()}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setIsOpenMover(false)}
                  className="mr-4 text-gray-700 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded shadow hover:shadow-lg transition-all duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleMove}
                  className="bg-blue-500 text-white px-4 py-2 rounded shadow-lg hover:bg-blue-600 hover:shadow-xl disabled:opacity-50 transition-all duration-200"
                  disabled={!selectedFolder && !selectedDocument}
                >
                  Mover
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Menú contextual */}
      {isMenuVisible && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 w- bg-gray-950 text-white flex justify-between items-center p-2 shadow-md rounded-md animate-slide-down">
          <div className="flex items-center justify-center w-full space-x-6">
            {selectedFoldersCount > 0 && (
              <span className="bg-gray-700 px-3 py-1 rounded-full text-sm">
                {selectedFoldersCount}{" "}
                {selectedFoldersCount === 1
                  ? "Carpeta seleccionada"
                  : "Carpetas seleccionadas"}
              </span>
            )}
            {selectedDocumentsCount > 0 && (
              <span className="bg-gray-700 px-3 py-1 rounded-full text-sm">
                {selectedDocumentsCount}{" "}
                {selectedDocumentsCount === 1
                  ? "Documento seleccionado"
                  : "Documentos seleccionados"}
              </span>
            )}
            <button className="hover:bg-gray-700 px-3 py-1 rounded-full text-sm flex items-center space-x-1">
              Mover
            </button>
            <button className="hover:bg-gray-700 px-3 py-1 rounded-full text-sm flex items-center space-x-1">
              Eliminar
            </button>
            {/* <button className="hover:bg-gray-700 px-3 py-1 rounded-full text-sm flex items-center space-x-1">
                            Compartir
                        </button> */}
          </div>
          <button
            onClick={handleMenuClose}
            className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded-full text-sm"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* El código existente para renderizar la grid... */}

      {isReplaceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-75">
          <div className="bg-white rounded-lg shadow-lg w-96">
            <div className="px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Opciones de subida
              </h2>
              <p className="text-gray-600">
                La carpeta{" "}
                <span className="font-semibold">
                  {folderToReplace.nombre_carpeta}
                </span>{" "}
                ya existe en esta ubicación. ¿Qué te gustaría hacer?
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200">
              <label className="flex items-center mb-4 cursor-pointer">
                <div className="relative">
                  <input
                    type="radio"
                    name="replaceOption"
                    value="replace"
                    checked={replaceOption === "replace"}
                    className="sr-only"
                    onChange={() => handleReplaceDecision("replace")}
                  />
                  <div
                    className={`w-5 h-5 border-2 rounded-full flex items-center justify-center ${replaceOption === "replace" ? "border-blue-600" : "border-gray-400"}`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full ${replaceOption === "replace" ? "bg-blue-600" : "bg-transparent"}`}
                    ></div>
                  </div>
                </div>
                <span className="ml-3 text-gray-700">
                  Reemplazar carpeta actual
                </span>
              </label>
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    type="radio"
                    name="replaceOption"
                    value="keep"
                    checked={replaceOption === "keep"}
                    className="sr-only"
                    onChange={() => handleReplaceDecision("keep")}
                  />
                  <div
                    className={`w-5 h-5 border-2 rounded-full flex items-center justify-center ${replaceOption === "keep" ? "border-blue-600" : "border-gray-400"}`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full ${replaceOption === "keep" ? "bg-blue-600" : "bg-transparent"}`}
                    ></div>
                  </div>
                </div>
                <span className="ml-3 text-gray-700">
                  Mantener ambas carpetas
                </span>
              </label>
            </div>
            <div className="flex justify-end items-center px-6 py-4 bg-gray-100 border-t border-gray-200 rounded-b-lg">
              <button
                onClick={() => setIsReplaceModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 mr-4"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmReplace}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md"
              >
                Subir
              </button>
            </div>
          </div>
        </div>
      )}

      {isNewUserOpen && <Modal isOpen={setIsNewUserOpen} />}

      <div className="mt-14"></div>
      {/* <div className="mb-4 ml-4 text-2xl font-bold text-gray-800 select-none font-zen-kaku">
                {saludo}
            </div> */}

      <div className="flex items-center justify-between gap-4 mb-8 select-none custom-label-user">
        <label
          htmlFor="filtroSelect"
          className="mx-auto text-3xl font-extrabold text-gray-800 select-none font-zen-kaku text-center"
        >
          | Se muestran todos los archivos |
        </label>
      </div>

      <div className="relative mb-6 p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center mb-3">
          <div className="relative flex-grow md:mb-0 custom-doc">
            {/* <input
                            type="text"
                            placeholder="Buscar en documentos"
                            className="pl-10 border border-teal-500 p-2 rounded-lg w-full custom-doc2 outline-none focus:border-teal-600"
                            onChange={handleSearch}
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <FontAwesomeIcon icon={faSearch} className="text-teal-500" />
                        </div> */}

            <SearchComponent
              handleFolderClick={handleFolderClick}
              setSelectedSection={setSelectedSection}
            />
          </div>
        </div>

        <div className="flex flex-col  md:flex-row md:space-x-3 md:space-y-0 custom-filter">
          <div className="relative">
            <button
              onClick={openmenutipo}
              className="bg-[#5c7891] hover:bg-[#4a647a] text-white flex items-center font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-150 ease-in-out"
            >
              <FileText className="mr-2 text-white" />
              <span>{selectedType.label}</span>
              <ChevronDown className="ml-1 text-white" strokeWidth={2.5} />
              {isFilterActive && (
                <button
                  onClick={clearFilter}
                  className="ml-2 text-gray-500 hover:text-red-500 transition-all duration-150 ease-in-out"
                >
                  ✕
                </button>
              )}
            </button>

            {istipomodal && (
              <div
                className="absolute mt-2 rounded-md shadow-lg bg-white ring-1 ring-[#D2E7E4] ring-opacity-5 z-50 font-zen-kaku"
                ref={tipoMenuRef}
              >
                <div className="py-1" role="menu" aria-orientation="vertical">
                  <button
                    onClick={() =>
                      handleTypeSelection("Documentos", "Documentos")
                    }
                    className={`px-4 py-2 text-sm font-bold text-[#635F60] hover:bg-[#D2E7E4] flex w-full text-left whitespace-nowrap ${selectedType.type === "Documentos" && "bg-[#D2E7E4]"}`}
                  >
                    {selectedType.type === "Documentos" && "✔️"} 📄 Documentos
                  </button>
                  <button
                    onClick={() =>
                      handleTypeSelection(
                        "Hojas de cálculo",
                        "Hojas de cálculo",
                      )
                    }
                    className={`px-4 py-2 text-sm font-bold text-[#635F60] hover:bg-[#D2E7E4] flex w-full text-left whitespace-nowrap ${selectedType.type === "Hojas de cálculo" && "bg-[#D2E7E4]"}`}
                  >
                    {selectedType.type === "Hojas de cálculo" && "✔️"} 📊 Hojas
                    de cálculo
                  </button>
                  <button
                    onClick={() =>
                      handleTypeSelection("Presentaciones", "Presentaciones")
                    }
                    className={`px-4 py-2 text-sm font-bold text-[#635F60] hover:bg-[#D2E7E4] flex w-full text-left whitespace-nowrap ${selectedType.type === "Presentaciones" && "bg-[#D2E7E4]"}`}
                  >
                    {selectedType.type === "Presentaciones" && "✔️"} 📈
                    Presentaciones
                  </button>
                  <button
                    onClick={() =>
                      handleTypeSelection("Formularios", "Formularios")
                    }
                    className={`px-4 py-2 text-sm font-bold text-[#635F60] hover:bg-[#D2E7E4] flex w-full text-left whitespace-nowrap ${selectedType.type === "Formularios" && "bg-[#D2E7E4]"}`}
                  >
                    {selectedType.type === "Formularios" && "✔️"} 📝 Formularios
                  </button>
                  <button
                    onClick={() =>
                      handleTypeSelection(
                        "Fotos e imágenes",
                        "Fotos e imágenes",
                      )
                    }
                    className={`px-4 py-2 text-sm font-bold text-[#635F60] hover:bg-[#D2E7E4] flex w-full text-left whitespace-nowrap ${selectedType.type === "Fotos e imágenes" && "bg-[#D2E7E4]"}`}
                  >
                    {selectedType.type === "Fotos e imágenes" && "✔️"} 🖼️ Fotos
                    e imágenes
                  </button>
                  <button
                    onClick={() => handleTypeSelection("PDFs", "PDFs")}
                    className={`px-4 py-2 text-sm font-bold text-[#635F60] hover:bg-[#D2E7E4] flex w-full text-left whitespace-nowrap ${selectedType.type === "PDFs" && "bg-[#D2E7E4]"}`}
                  >
                    {selectedType.type === "PDFs" && "✔️"} 📚 PDFs
                  </button>
                  <button
                    onClick={() => handleTypeSelection("Videos", "Videos")}
                    className={`px-4 py-2 text-sm font-bold text-[#635F60] hover:bg-[#D2E7E4] flex w-full text-left whitespace-nowrap ${selectedType.type === "Videos" && "bg-[#D2E7E4]"}`}
                  >
                    {selectedType.type === "Videos" && "✔️"} 🎥 Videos
                  </button>
                  <button
                    onClick={() =>
                      handleTypeSelection(
                        "Accesos directos",
                        "Accesos directos",
                      )
                    }
                    className={`px-4 py-2 text-sm font-bold text-[#635F60] hover:bg-[#D2E7E4] flex w-full text-left whitespace-nowrap ${selectedType.type === "Accesos directos" && "bg-[#D2E7E4]"}`}
                  >
                    {selectedType.type === "Accesos directos" && "✔️"} 🔗
                    Accesos directos
                  </button>
                  <button
                    onClick={() => handleTypeSelection("Carpetas", "Carpetas")}
                    className={`px-4 py-2 text-sm font-bold text-[#635F60] hover:bg-[#D2E7E4] flex w-full text-left whitespace-nowrap ${selectedType.type === "Carpetas" && "bg-[#D2E7E4]"}`}
                  >
                    {selectedType.type === "Carpetas" && "✔️"} 🗂️ Carpetas
                  </button>
                  <button
                    onClick={() => handleTypeSelection("Sites", "Sites")}
                    className={`px-4 py-2 text-sm font-bold text-[#635F60] hover:bg-[#D2E7E4] flex w-full text-left whitespace-nowrap ${selectedType.type === "Sites" && "bg-[#D2E7E4]"}`}
                  >
                    {selectedType.type === "Sites" && "✔️"} 🌐 Sites
                  </button>
                  <button
                    onClick={() => handleTypeSelection("Audio", "Audio")}
                    className={`px-4 py-2 text-sm font-bold text-[#635F60] hover:bg-[#D2E7E4] flex w-full text-left whitespace-nowrap ${selectedType.type === "Audio" && "bg-[#D2E7E4]"}`}
                  >
                    {selectedType.type === "Audio" && "✔️"} 🎧 Audio
                  </button>
                  <button
                    onClick={() => handleTypeSelection("Dibujos", "Dibujos")}
                    className={`px-4 py-2 text-sm font-bold text-[#635F60] hover:bg-[#D2E7E4] flex w-full text-left whitespace-nowrap ${selectedType.type === "Dibujos" && "bg-[#D2E7E4]"}`}
                  >
                    {selectedType.type === "Dibujos" && "✔️"} 🎨 Dibujos
                  </button>
                  <button
                    onClick={() =>
                      handleTypeSelection("Archivos (zip)", "Archivos (zip)")
                    }
                    className={`px-4 py-2 text-sm font-bold text-[#635F60] hover:bg-[#D2E7E4] flex w-full text-left whitespace-nowrap ${selectedType.type === "Archivos (zip)" && "bg-[#D2E7E4]"}`}
                  >
                    {selectedType.type === "Archivos (zip)" && "✔️"} 📦 Archivos
                    (zip)
                  </button>

                  <button
                    onClick={() => handleTypeSelection("Emails", "Emails")}
                    className={`px-4 py-2 text-sm font-bold text-[#635F60] hover:bg-[#D2E7E4] flex w-full text-left whitespace-nowrap ${selectedType.type === "Emails" && "bg-[#D2E7E4]"}`}
                  >
                    {selectedType.type === "Emails" && "✔️"} ✉️ Emails
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* <div className="relative"> */}
          {/* <button
                            onClick={openmenupersonas}
                            className="bg-teal-100 hover:bg-teal-200 text-teal-600 flex items-center font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-150 ease-in-out"
                        >
                            <User className="mr-2 text-teal-500" />
                            <span>Personas</span>
                            <ChevronDown className="ml-1 text-teal-500" strokeWidth={2.5} />
                        </button> */}

          {ispersonasmodal && (
            <div className="absolute mt-2 rounded-md shadow-lg bg-white ring-1 ring-[#D2E7E4] ring-opacity-5 z-50 font-zen-kaku">
              <div className="py-1" role="menu" aria-orientation="vertical">
                <Autocomplete
                  className="z-50 w-72 font-zen-kaku"
                  options={peopleList}
                  onChange={handleSelectPerson}
                  openOnFocus
                  open={true}
                  getOptionLabel={(option) => option}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Buscar personas y grupos"
                      variant="outlined"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <SearchIcon style={{ fill: "#9DCEC8" }} />
                        ),
                        sx: { borderRadius: 3 },
                      }}
                    />
                  )}
                  PopperComponent={(props) => (
                    <Paper {...props} sx={{ borderRadius: 3 }} />
                  )}
                  renderOption={renderOption}
                />
              </div>
            </div>
          )}
          {/* </div> */}

          <div className="relative">
            <button
              onClick={openmenumodificado}
              className="bg-[#5c7891] hover:bg-[#4a647a] text-white flex items-center font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-150 ease-in-out"
            >
              <Calendar className="mr-2 text-white" />
              <span>{selectedModification}</span>
              <ChevronDown className="ml-1 text-white-500" strokeWidth={2.5} />
              {isModificationFilterActive && (
                <button
                  onClick={clearModificationFilter}
                  className="ml-2 text-gray-600 hover:text-red-600"
                >
                  ✕
                </button>
              )}
            </button>

            {ismodificadoModal && (
              <div
                className="absolute mt-2 rounded-md shadow-lg bg-white ring-1 ring-[#D2E7E4] ring-opacity-5 z-50 font-zen-kaku"
                ref={modificadoMenuRef}
              >
                <div className="py-1" role="menu" aria-orientation="vertical">
                  <button
                    onClick={() => handleModificationSelection("Hoy")}
                    className={`px-4 py-2 text-sm font-bold text-[#635F60] hover:bg-[#D2E7E4] block w-full text-left whitespace-nowrap ${selectedModification === "Hoy" && "bg-[#D2E7E4]"}`}
                  >
                    {selectedModification === "Hoy" && "✔️"} Hoy
                  </button>
                  <button
                    onClick={() =>
                      handleModificationSelection("Últimos 7 días")
                    }
                    className={`px-4 py-2 text-sm font-bold text-[#635F60] hover:bg-[#D2E7E4] block w-full text-left whitespace-nowrap ${selectedModification === "Últimos 7 días" && "bg-[#D2E7E4]"}`}
                  >
                    {selectedModification === "Últimos 7 días" && "✔️"} Últimos
                    7 días
                  </button>
                  <button
                    onClick={() =>
                      handleModificationSelection("Últimos 30 días")
                    }
                    className={`px-4 py-2 text-sm font-bold text-[#635F60] hover:bg-[#D2E7E4] block w-full text-left whitespace-nowrap ${selectedModification === "Últimos 30 días" && "bg-[#D2E7E4]"}`}
                  >
                    {selectedModification === "Últimos 30 días" && "✔️"} Últimos
                    30 días
                  </button>
                  <button
                    onClick={() => handleModificationSelection("Este Año")}
                    className={`px-4 py-2 text-sm font-bold text-[#635F60] hover:bg-[#D2E7E4] block w-full text-left whitespace-nowrap ${selectedModification === "Este Año" && "bg-[#D2E7E4]"}`}
                  >
                    {selectedModification === "Este Año" && "✔️"} Este Año (
                    {new Date().getFullYear()})
                  </button>
                  <button
                    onClick={() => handleModificationSelection("Año pasado")}
                    className={`px-4 py-2 text-sm font-bold text-[#635F60] hover:bg-[#D2E7E4] block w-full text-left whitespace-nowrap ${selectedModification === "Año pasado" && "bg-[#D2E7E4]"}`}
                  >
                    {selectedModification === "Año pasado" && "✔️"} Año pasado (
                    {new Date().getFullYear() - 1})
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {isNewFolderModalOpen && (
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-gray-500 bg-opacity-50">
          <div className="p-6 bg-white rounded-lg w-96">
            <h2 className="mb-4 text-lg font-bold font-zen-kaku">
              Crear nueva carpeta
            </h2>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Nombre de la carpeta"
              aria-label="Campo de ingreso nombre de la carpeta"
              className="border border-[#597387] rounded-lg px-3 py-2 mb-4 font-zen-kaku w-full"
            />
            <div className="flex justify-end font-zen-kaku">
              <button
                onClick={closeNewFolderModal}
                className="text-[#597387] hover:text-black px-4 py-2 rounded-md mr-2 font-bold transition-all ease-linear duration-150"
              >
                Cancelar
              </button>
              <button
                onClick={createFolder}
                className="bg-[#597387] text-[#7FC3BB] hover:bg-[#c5d6d5] px-4 py-2 rounded-md mr-2 font-semibold transition-all ease-linear duration-150"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* aqui va la el nuevo upload gado */}
      {isfileModalOpen && (
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-gray-500 bg-opacity-50">
          <div className="bg-white rounded-lg p-8 w-[30rem]">
            <h2 className="mb-4 text-lg font-bold font-zen-kaku">
              Carga de archivos
            </h2>
            <div
              className={`border-2 rounded-lg p-2 cursor-pointer w-full mb-4 ${isDragging ? "border-yellow-500" : "border-[#D2E7E4]"}`}
              onClick={handleButtonClick}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                  setIsDragging(false);
                }
              }}
              onDrop={async (e) => {
                e.preventDefault();
                setIsDragging(false);

                const files = Array.from(e.dataTransfer.files);
                if (files.length > 0) {
                  setFile(files);
                } else {
                  toast.error("Por favor, arrastra archivos válidos.");
                }
              }}
            >
              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                multiple
                onChange={(e) => {
                  const selectedFiles = e.target.files;
                  if (selectedFiles && selectedFiles.length > 0) {
                    setFile(Array.from(selectedFiles)); // Guardamos los archivos seleccionados en el estado
                  } else {
                    setFile(null); // Limpiamos el estado si no se selecciona nada
                  }
                }}
              />

              <div
                className={`flex flex-row ${isDragging ? "bg-yellow-100" : ""}`}
              >
                <ArrowUpFromLine
                  strokeWidth={3}
                  className="mr-2 stroke-teal-500"
                />
                <p className="text-[#3C3A3B] w-full font-zen-kaku">
                  {file && file.length > 0
                    ? file.length === 1
                      ? file[0].name
                      : `${file.length} archivos seleccionados: ${file.map((f) => f.name).join(", ")}`
                    : "Haga clic o arrastre los archivos aquí para cargarlos (puede seleccionar múltiples archivos)"}
                </p>
              </div>
            </div>
            <div className="flex justify-end font-zen-kaku">
              <button
                onClick={closefileModal}
                className="text-[#121212] hover:text-black px-4 py-2 rounded-md mr-2 font-bold transition-all ease-linear duration-150"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleFileUpload(file)} // Subimos el archivo solo al hacer clic en el botón
                className="bg-[#D2E7E4] text-[#7FC3BB] hover:bg-[#c5d6d5] px-4 py-2 rounded-md mr-2 font-semibold transition-all ease-linear duration-150"
                disabled={!file || file.length === 0} // Deshabilitamos el botón si no hay archivos seleccionados
              >
                Subir
              </button>
            </div>
          </div>
        </div>
      )}

      {isfolderfileModalOpen && (
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-gray-500 bg-opacity-50">
          <div className="bg-white rounded-lg p-8 w-[30rem]">
            <h2 className="mb-4 text-lg font-bold font-zen-kaku">
              Carga de carpetas
            </h2>
            <div
              className={`border-2 rounded-lg p-2 cursor-pointer w-full mb-4 ${isDragging ? "border-yellow-500" : "border-[#D2E7E4]"}`}
              onClick={handleButtonfolderClick}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={async (e) => {
                e.preventDefault();
                setIsDragging(false);

                const items = e.dataTransfer.items;
                const files = [];

                async function traverseDirectory(entry, path = "") {
                  if (entry.isFile) {
                    const file = await new Promise((resolve) =>
                      entry.file(resolve),
                    );
                    files.push({ file, relativePath: `${path}${file.name}` });
                  } else if (entry.isDirectory) {
                    const reader = entry.createReader();
                    const entries = await new Promise((resolve) =>
                      reader.readEntries(resolve),
                    );
                    for (const newEntry of entries) {
                      await traverseDirectory(
                        newEntry,
                        `${path}${entry.name}/`,
                      );
                    }
                    // Registrar la carpeta vacía si no tiene archivos
                    if (entries.length === 0) {
                      files.push({ relativePath: `${path}${entry.name}/` });
                    }
                  }
                }

                for (let i = 0; i < items.length; i++) {
                  const entry = items[i].webkitGetAsEntry();
                  if (entry && entry.isDirectory) {
                    await traverseDirectory(entry);
                  }
                }

                if (files.length > 0) {
                  setSelectedFolder(files);
                  setSelectedFolderName(files[0].relativePath.split("/")[0]);
                } else {
                  toast.error("Por favor, arrastra una carpeta completa.");
                }
              }}
            >
              <input
                type="file"
                className="hidden"
                ref={folderInputRef}
                webkitdirectory="true"
                multiple
                onChange={(e) => {
                  const files = e.target.files;
                  if (files.length > 0) {
                    const fileArray = Array.from(files).map((file) => ({
                      file,
                      relativePath: file.webkitRelativePath || file.name,
                    }));
                    setSelectedFolder(fileArray);
                    setSelectedFolderName(
                      fileArray[0].relativePath.split("/")[0],
                    );
                  }
                }}
              />
              <div
                className={`flex flex-row ${isDragging ? "bg-yellow-100" : ""}`}
              >
                <ArrowUpFromLine
                  strokeWidth={3}
                  className="mr-2 stroke-teal-500"
                />
                <p className="text-[#3C3A3B] w-full font-zen-kaku">
                  {selectedFolderName
                    ? selectedFolderName
                    : "Haga clic o arrastre su carpeta aquí para cargarla"}
                </p>
              </div>
            </div>
            <div className="flex justify-end font-zen-kaku">
              <button
                onClick={closefolderModal}
                className="text-[#635F60] hover:text-black px-4 py-2 rounded-md mr-2 font-bold transition-all ease-linear duration-150"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleFolderUpload(selectedFolder)}
                className="bg-[#D2E7E4] text-[#7FC3BB] hover:bg-[#c5d6d5] px-4 py-2 rounded-md font-semibold transition-all ease-linear duración-150"
                disabled={!selectedFolder || selectedFolder.length === 0}
              >
                Subir
              </button>
            </div>
          </div>
        </div>
      )}

      {isshareDocs && (
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-gray-500 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-[26rem]">
            <div className="flex flex-row justify-between">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Compartir &quot;NOMBRE DOCUMENTO&quot;
              </h2>

              <X
                onClick={closesharemodal}
                className="transition-transform duración-150 ease-linear cursor-pointer hover:scale-110"
              />
            </div>
            <input
              type="text"
              placeholder="Agregar personas o grupos"
              aria-label="Campo de ingreso agregar personas o grupos"
              className="border border-[#D2E7E4] rounded-lg px-3 py-2 mb-4 font-zen-kaku w-full"
            />
            <div className="flex w-full mb-4 flex-nowrap">
              <h1 className="font-bold font-zen-kaku">
                Personas que tienen acceso
              </h1>
            </div>
            <div className="flex items-center w-full mt-2 flex-nowrap">
              <Image
                src={"/profile.png"}
                alt="Logo"
                width={25}
                height={25}
                style={{ filter: "brightness(50%)" }}
              />
              <span className="ml-3 text-base font-zen-kaku">
                Ronald Richards
              </span>
              <div className="flex items-end justify-end flex-auto">
                <span className="font-zen-kaku text-[#635F60] text-sm">
                  Propietario
                </span>
              </div>
            </div>
            <div className="flex items-center w-full mt-4 flex-nowrap">
              <h1 className="font-bold font-zen-kaku">Acceso general</h1>
            </div>
            <div className="flex items-center justify-between w-full mt-2 flex-nowrap">
              <div className="flex flex-row items-center">
                <Landmark className="stroke-teal-500" />
                <Select
                  className={`basic-single font-zen-kaku w-auto font-bold text-sm`}
                  classNamePrefix="select"
                  name="mina"
                  options={minaOptions}
                  value={selectedOption}
                  onChange={handleSelect}
                  isSearchable={false}
                  styles={{
                    control: (provided, state) => ({
                      ...provided,
                      border: "none",
                      boxShadow: state.isFocused ? "none" : provided.boxShadow,
                    }),
                    indicatorSeparator: () => ({}),
                    dropdownIndicator: (provided) => ({
                      ...provided,
                      paddingRight: 0,
                      color: "#4299e1",
                    }),
                    menu: (provided) => ({
                      ...provided,
                      width: "auto",
                      zIndex: 9999,
                    }),
                    option: (provided, state) => ({
                      ...provided,
                      paddingTop: "4px",
                      paddingBottom: "4px",
                      backgroundColor: state.isFocused
                        ? "#D2E7E4"
                        : "transparent",
                      "&:hover": {
                        backgroundColor: "#D2E7E4",
                      },
                      color: state.isFocused ? "#000" : "#000",
                    }),
                    singleValue: (provided, state) => ({
                      ...provided,
                      color: selectedOption ? "#000" : "#6b7280",
                    }),
                  }}
                />
              </div>
              <Select
                className={`basic-single font-zen-kaku w-auto text-base `}
                classNamePrefix="select"
                name="share"
                options={lectorOptions}
                value={selectedOptionshare}
                onChange={handleSelectshare}
                isSearchable={false}
                styles={{
                  control: (provided, state) => ({
                    ...provided,
                    border: "none",
                    boxShadow: state.isFocused ? "none" : provided.boxShadow,
                  }),
                  indicatorSeparator: () => ({}),
                  dropdownIndicator: (provided) => ({
                    ...provided,
                    paddingRight: 0,
                    color: "#4299e1",
                  }),
                  menu: (provided) => ({
                    ...provided,
                    width: "auto",
                    zIndex: 9999,
                  }),
                  option: (provided, state) => ({
                    ...provided,
                    paddingTop: "4px",
                    paddingBottom: "4px",
                    backgroundColor: state.isFocused
                      ? "#D2E7E4"
                      : "transparent",
                    "&:hover": {
                      backgroundColor: "#D2E7E4",
                    },
                    color: state.isFocused ? "#000" : "#000",
                  }),
                  singleValue: (provided, state) => ({
                    ...provided,
                    color: selectedOption ? "#000" : "#6b7280",
                  }),
                }}
              />
            </div>
            <div className="flex flex-wrap items-center w-64 ml-8">
              <p className="font-zen-kaku text-[#635F60] text-sm">
                Cualquier usuario de este grupo puede encontrar y ver los
                elementos
              </p>
            </div>
            <div className="flex items-center justify-end mt-5 font-zen-kaku">
              <div className="flex items-center justify-start flex-auto">
                <Link size={18} className="stroke-teal-500" />
                <span className="text-[#635F60] text-sm font-bold ml-3">
                  Copiar vínculo
                </span>
              </div>
              <button className="bg-[#D2E7E4] text-[#7FC3BB] hover:bg-[#c5d6d5] px-4 py-1 rounded-md mr-2 font-semibold transition-all ease-linear duración-150">
                Crear
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center px-5 mb-4">
        {/* Breadcrumb */}
        <div className="font-zen-kaku text-base font-bold">
          {renderBreadcrumb()}
        </div>

        {/* Botones de vista */}
        <div className="flex border rounded-full overflow-hidden custom-buton-carpetas">
          <button
            onClick={toggleView}
            className={`px-4 py-2 flex items-center ${isTableView ? "bg-blue-100" : "bg-white"} hover:bg-blue-100 transition-all duration-150 ease-linear`}
          >
            <FontAwesomeIcon icon={faBars} className="text-black" />
          </button>
          <button
            onClick={toggleView}
            className={`px-4 py-2 flex items-center ${!isTableView ? "bg-blue-100" : "bg-white"} hover:bg-blue-100 transition-all duration-150 ease-linear`}
          >
            <FontAwesomeIcon icon={faTh} className="text-black" />
          </button>
        </div>
      </div>

      {/* Botón agregar carpeta/archivo arriba de la tabla */}
      {currentPath !== "papelera" && (
        <div className="w-full flex justify-end px-4 mt-2 mb-4">
          <div className="relative inline-block text-left" ref={addMenuRef}>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-custom-blue text-white font-semibold rounded-full shadow hover:bg-[#46607a] transition-all duration-150 ease-linear"
            onClick={handleNewUserClick}
            aria-label="Agregar archivos o carpetas"
            title="Agregar archivos o carpetas"
            type="button"
          >
            <FolderPlus className="w-5 h-5" />
            Agregar carpeta/archivo
          </button>
          {isOpen && (
            <div className="absolute mt-2 w-48 rounded-xl shadow-lg bg-white ring-1 ring-[#5c7891] ring-opacity-5 z-50 right-0 font-zen-kaku">
              <div
                className="py-1"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="options-menu"
              >
                <button
                  onClick={() => {
                    openNewFolderModal();
                    setIsOpen(false);
                  }}
                  className="px-4 py-2 text-sm font-bold text-[#635F60] hover:bg-[#94b7d6] flex w-full text-left whitespace-nowrap rounded-xl"
                  role="menuitem"
                >
                  <FolderPlus className="mr-2 stroke-black-500" /> Carpeta Nueva
                </button>
                <button
                  onClick={() => {
                    openfileModal();
                    setIsOpen(false);
                  }}
                  className="px-4 py-2 text-sm font-bold text-[#635F60] hover:bg-[#94b7d6] flex w-full text-left whitespace-nowrap rounded-xl"
                  role="menuitem"
                >
                  <FileUp className="mr-2 stroke-black-500" /> Subir Archivos
                </button>
                <button
                  onClick={() => {
                    openfolderModal();
                    setIsOpen(false);
                  }}
                  className="px-4 py-2 text-sm font-bold text-[#635F60] hover:bg-[#94b7d6] flex w-full text-left whitespace-nowrap rounded-xl"
                  role="menuitem"
                >
                  <FolderUp className="mr-2 stroke-black-500" /> Subir Carpeta
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      )}
      <div className="flex w-full p-4 select-none font-zen-kaku custom-document-carpetas">
        {/* Sidebar */}
        {/* Sidebar */}
        <div
          className="relative min-w-[16rem] min-h-[20re
                    m] bg-gray-50 p-6 flex flex-col shadow-lg rounded-lg z-40"
        >
          {/* Botón Nuevo */}
          {/* <button className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg mb-6 hover:bg-blue-700 transition duration-300">+ Nuevo</button> */}
          <ul className="space-y-4">
            <li>
              {/* <Hidebyrol hiddenRoles={'admin'}> */}
              <a
                onClick={() => handleSidebarSelection("Proyectos")}
                className={`flex items-center p-3 rounded-lg transition duration-300 cursor-pointer ${
                  selectedSection === "Proyectos"
                    ? "bg-gray-300 text-gray-900"
                    : "text-gray-800 hover:bg-gray-200"
                }`}
              >
                <PiFolderSimpleStar className="w-6 h-6 mr-3" />
                <span className="font-medium">Proyectos</span>
              </a>
              {/* </Hidebyrol> */}
            </li>
            <li>
              <a
                onClick={() => handleSidebarSelection("Mi unidad")}
                className={`flex items-center p-3 rounded-lg transition duration-300 cursor-pointer ${
                  selectedSection === "Mi unidad"
                    ? "bg-gray-300 text-gray-900"
                    : "text-gray-800 hover:bg-gray-200"
                }`}
              >
                <BsDeviceHdd className="w-6 h-6 mr-3" />
                <span className="font-medium">Mi unidad</span>
              </a>
            </li>
            <li>
              <a
                onClick={() => handleSidebarSelection("Favoritos")}
                className={`flex items-center p-3 rounded-lg transition duration-300 cursor-pointer ${
                  selectedSection === "Favoritos"
                    ? "bg-gray-300 text-gray-900"
                    : "text-gray-800 hover:bg-gray-200"
                }`}
              >
                <StarIcon className="w-6 h-6 mr-3" />
                <span className="font-medium">Favoritos</span>
              </a>
            </li>
            <li>
              <Hidebyrol hiddenRoles={"admin"}>
                <a
                  onClick={() => handleSidebarSelection("Partidas")}
                  className={`flex items-center p-3 rounded-lg transition duration-300 cursor-pointer ${
                    selectedSection === "Reciente"
                      ? "bg-gray-300 text-gray-900"
                      : "text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  <ClockIcon className="w-6 h-6 mr-3" />
                  <span className="font-medium">Partidas</span>
                </a>
              </Hidebyrol>
            </li>
            <li>
              <a
                onClick={() => handleSidebarSelection("Usuarios")}
                className={`flex items-center p-3 rounded-lg transition duration-300 cursor-pointer ${
                  selectedSection === "Usuarios"
                    ? "bg-gray-300 text-gray-900"
                    : "text-gray-800 hover:bg-gray-200"
                }`}
              >
                <UserIcon className="w-6 h-6 mr-3" />
                <span className="font-medium">Usuarios</span>
              </a>
            </li>
            <li>
              <Hidebyrol hiddenRoles={"admin"}>
                <a
                  onClick={() => handleSidebarSelection("Compartido conmigo")}
                  className={`flex items-center p-3 rounded-lg transition duration-300 cursor-pointer ${
                    selectedSection === "Compartido conmigo"
                      ? "bg-gray-300 text-gray-900"
                      : "text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  <BsShare className="w-6 h-6 mr-3" />
                  <span className="font-medium">Compartido conmigo</span>
                </a>
              </Hidebyrol>
            </li>
            <li>
              <a
                onClick={() => handleSidebarSelection("Papelera")}
                className={`flex items-center p-3 rounded-lg transition duration-300 cursor-pointer ${
                  selectedSection === "Papelera"
                    ? "bg-gray-300 text-gray-900"
                    : "text-gray-800 hover:bg-gray-200"
                }`}
              >
                <FaTrashAlt className="w-6 h-6 mr-3" />
                <span className="font-medium">Papelera</span>
              </a>
            </li>
          </ul>

          {/* Otros elementos del componente... */}

          <div className="mt-auto text-sm text-gray-600 flex flex-col items-center w-full max-w-lg">
            <div
              className={`flex items-center ${usagePercentage >= 90 ? "text-red-500" : usagePercentage >= 70 ? "text-yellow-500" : "text-green-500"}`}
            >
              {usagePercentage >= 70 && <WarningIcon className="mr-2" />}
              <span>{warningMessage}</span>
            </div>
            <div className="w-full mt-2 flex items-center">
              <TiCloudStorageOutline className="mr-2 text-3xl" />{" "}
              {/* Ajusta el tamaño del icono */}
              <div className="flex-1 bg-gray-200 rounded-full h-1.5 mb-2 overflow-hidden max-w-xs">
                {" "}
                {/* Ajusta el tamaño y flexibilidad de la barra */}
                <div
                  className={`h-1.5 rounded-full ${usagePercentage >= 90 ? "bg-red-500" : usagePercentage >= 70 ? "bg-yellow-500" : "bg-green-500"}`}
                  style={{ width: `${usagePercentage}%` }}
                ></div>
              </div>
            </div>

            <p
              className={`${usagePercentage >= 90 ? "text-red-500" : "text-green-500"} text-center`}
            >
              {formattedTotalSize} de {formattedStorageLimit} usado
            </p>
            {shouldShowButton && (
              <button className="bg-red-500 text-white font-bold py-2 px-4 rounded-full mt-2">
                Obtener más almacenamiento
              </button>
            )}
          </div>

          {/* Otros elementos del componente... */}
        </div>

        <div className="custom-buton-carpetas3">
          <div className="flex border rounded-full overflow-hidden custom-buton-carpetas2">
            <button
              onClick={toggleView}
              className={`px-4 py-2 flex items-center ${isTableView ? "bg-blue-100" : "bg-white"} hover:bg-blue-100 transition-all duration-150 ease-linear`}
            >
              <FontAwesomeIcon icon={faBars} className="text-black" />
            </button>
            <button
              onClick={toggleView}
              className={`px-4 py-2 flex items-center ${!isTableView ? "bg-blue-100" : "bg-white"} hover:bg-blue-100 transition-all duration-150 ease-linear`}
            >
              <FontAwesomeIcon icon={faTh} className="text-black" />
            </button>
          </div>
        </div>

        <div className="flex flex-grow overflow-x-auto">
          {/* Sección de Favoritos */}

          {currentPath === "favoritos" && (
            <div className="flex-grow">
              {isLoading ? ( // Mostrar indicador de carga mientras está cargando
                <div className="flex items-center justify-center min-h-[20rem]">
                  <Loader />
                </div>
              ) : filteredFoldersFavorite.length === 0 &&
                filteredDocumentsFavorite.length === 0 &&
                favoriteDocumentsOutsideFolders.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[40vh] w-full">
                  <p className="text-gray-500 text-lg text-center">
                    No hay carpetas ni archivos favoritos.
                  </p>
                </div>
              ) : isTableView ? (
                <div className="overflow-x-auto">
                  <div
                    className="relative overflow-x-auto sm:rounded-lg w-full min-w-full table"
                    onDragStart={(e) => e.preventDefault()} // Bloquea el arrastre
                    onDragOver={(e) => e.preventDefault()} // Bloquea el arrastre
                    onDrop={(e) => e.preventDefault()} // Bloquea el drop
                  >
                    {true && (
                      <table className="table-auto w-full bg-white shadow-md rounded-lg overflow-x-auto select-none cursor-not-allowed">
                        <thead className="bg-[#5c7891] text-white w-10 h-10 px-5">
                          <tr>
                            <th className="p-4">
                              {/* <input type="checkbox" className="w-5 h-5" /> */}
                            </th>
                            <th className="w-[38rem] justify-start text-sm font-medium">
                              <div className="flex items-center justify-start">
                                Nombre
                              </div>
                            </th>
                            <th className="w-[10rem] text-sm font-medium">
                              <div className="flex items-center justify-start">
                                Propietario
                              </div>
                            </th>
                            <th className="w-[20rem] text-sm font-medium">
                              <div className="flex items-center justify-start">
                                Fecha de edición
                              </div>
                            </th>
                            <th className="w-[10rem] text-sm font-medium">
                              <div className="flex items-center justify-start">
                                Tamaño
                              </div>
                            </th>
                            <th className="p-4 text-sm font-medium text-center">
                              <div className="flex items-center justify-center">
                                Acciones
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {renderFolders({
                            folder: { children: filteredFoldersFavorite },
                            children: filteredFoldersFavorite,
                          })}

                          {/* Renderiza documentos favoritos fuera de carpetas */}
                          {renderDocuments(
                            favoriteDocumentsOutsideFolders.filter((document) =>
                              matchesModificationFilter(document.updatedAt),
                            ),
                          )}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              ) : (
                renderFoldersGrid(filteredFoldersFavorite, [
                  ...filteredDocumentsFavorite,
                  ...favoriteDocumentsOutsideFolders,
                ])
              )}
            </div>
          )}

          {/* Sección General (no Favoritos) */}
          {currentPath !== "favoritos" && currentPath !== "papelera" && (
            <div className="flex-grow">
              {isLoading ? ( // Mostrar indicador de carga mientras está cargando
                <div className="flex items-center justify-center min-h-[20rem]">
                  <Loader />
                </div>
              ) : (!foldersState?.folder && !foldersState?.children?.length) ||
                (foldersState?.children?.length === 0 && 
                 (!foldersState?.folder?.documents || foldersState?.folder?.documents?.length === 0)) ? (
                <div className="flex flex-col items-center justify-center h-[40vh] w-full">
                  <p className="text-gray-500 text-lg text-center">
                    No hay carpetas ni archivos.
                  </p>
                </div>
              ) : isTableView ? (
                <div className="overflow-x-auto">
                  {/* Verificar si hay contenido para mostrar */}
                  {true && (
                    <div
                      className={`relative overflow-x-auto sm:rounded-lg w-full min-w-full table ${isDraggingOverGrid ? "border-2 border-yellow-500" : ""}`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingOverGrid(true);
                      }}
                      onDragLeave={(e) => {
                        if (!e.currentTarget.contains(e.relatedTarget)) {
                          setIsDraggingOverGrid(false);
                        }
                      }}
                      onDrop={handleTableDrop}
                    >
                      <table className="table-auto w-full bg-white shadow-md rounded-lg overflow-x-auto">
                        <thead className="bg-[#5c7891] text-white w-10 h-10 p-4">
                          <tr>
                            <th className="p-0"></th>
                            <th className="w-[38rem] cursor-pointer justify-start text-sm font-medium">
                              <div className="flex items-center justify-start">
                                Nombre
                              </div>
                            </th>
                            <th className="w-[10rem] cursor-pointer text-sm font-medium">
                              <div className="flex items-center justify-start">
                                Propietario
                              </div>
                            </th>
                            <th className="w-[20rem] cursor-pointer text-sm font-medium">
                              <div className="flex items-center justify-start">
                                Fecha de edición
                              </div>
                            </th>
                            <th className="w-[10rem] cursor-pointer text-sm font-medium">
                              <div className="flex items-center justify-start">
                                Tamaño
                              </div>
                            </th>
                            <th className="p-4 text-sm font-medium text-center">
                              <div className="flex items-center justify-center">
                                Acciones
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {/* Renderiza carpetas */}
                          {foldersState?.folder &&
                            renderFolders({
                              folder: foldersState.folder,
                              children: foldersState.children
                                .filter((child) => {
                                  // Aplica el filtro de modificación a las subcarpetas
                                  return isModificationFilterActive
                                    ? matchesModificationFilter(child.updatedAt)
                                    : true;
                                })
                                .filter((folder) => {
                                  // Aplica el filtro de modificación a la carpeta principal
                                  return isModificationFilterActive
                                    ? matchesModificationFilter(
                                        foldersState.folder.updatedAt,
                                      )
                                    : true;
                                }),
                            })}

                          {/* Renderiza documentos de la carpeta padre */}
                          {foldersState?.folder?.documents &&
                            Array.isArray(foldersState.folder.documents) &&
                            foldersState.folder.documents.length > 0 &&
                            renderDocuments(
                              foldersState.folder.documents.filter(
                                (document) => {
                                  const matchesType = selectedType.type
                                    ? matchesTypeFilter(document)
                                    : true;
                                  const matchesModif =
                                    isModificationFilterActive
                                      ? matchesModificationFilter(
                                          document.updatedAt,
                                        )
                                      : true;
                                  return matchesType && matchesModif;
                                },
                              ),
                            )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : (
                renderFoldersGrid(
                  filteredFolders,
                  filteredDocuments,
                  filteredModifiedFolders,
                )
              )}
            </div>
          )}

                    {currentPath === "papelera" && (
            <div className="flex-grow">
              {/* Encabezado de papelera con botón vaciar */}
              <div className="mb-4 flex justify-between items-center bg-gray-50 p-4 rounded-lg border">
                <div className="flex items-center">
                  <FaTrashAlt className="mr-3 text-gray-600" size={20} />
                  <h2 className="text-xl font-semibold text-gray-800">Papelera</h2>
                  <span className="ml-2 text-sm text-gray-500">
                    (Elementos eliminados temporalmente)
                  </span>
                </div>
                <button
                  onClick={() => {
                    showConfirmModal(
                      "Vaciar papelera",
                      "¿Está seguro de que desea vaciar completamente la papelera? Todos los elementos serán eliminados permanentemente y esta acción no se puede deshacer.",
                      () => handleEmptyTrash(),
                      "danger",
                      "Vaciar papelera",
                      "Cancelar"
                    );
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center"
                  title="Vaciar papelera"
                >
                  <RiDeleteBin6Line className="mr-2" />
                  Vaciar papelera
                </button>
              </div>
              
              {isLoading ? ( // Mostrar indicador de carga mientras está cargando
                <div className="flex  items-center justify-center w-full bg-gray-100">
                  <Loader />
                </div>
              ) : (!foldersState?.folders || foldersState?.folders?.length === 0) &&
                 (!foldersState?.documents || foldersState?.documents?.length === 0) ? (
                <div className="flex flex-col items-center justify-center h-[35vh] w-full">
                  <p className="text-gray-500 text-lg text-center">
                    No hay carpetas ni archivos en la papelera.
                  </p>
                </div>
              ) : isTableView ? (
                <div className="overflow-x-auto">
                  {/* Verificar si hay contenido eliminado para mostrar */}
                  {true && (
                    <div
                      className={`relative overflow-x-auto sm:rounded-lg w-full min-w-full table ${isDraggingOverGrid ? "border-2 border-yellow-500" : ""}`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingOverGrid(true);
                      }}
                      onDragLeave={(e) => {
                        if (!e.currentTarget.contains(e.relatedTarget)) {
                          setIsDraggingOverGrid(false);
                        }
                      }}
                      onDrop={handleTableDrop}
                    >
                      <table className="table-auto w-full bg-white shadow-md rounded-lg overflow-x-auto">
                        <thead className="bg-[#5c7891] text-white w-10 h-10 p-4">
                          <tr>
                            <th className="p-0"></th>
                            <th className="w-[38rem] cursor-pointer justify-start text-sm font-medium">
                              <div className="flex items-center justify-start">
                                Nombre
                              </div>
                            </th>
                            <th className="w-[10rem] cursor-pointer text-sm font-medium">
                              <div className="flex items-center justify-start">
                                Propietario
                              </div>
                            </th>
                            <th className="w-[20rem] cursor-pointer text-sm font-medium">
                              <div className="flex items-center justify-start">
                                Fecha de edición
                              </div>
                            </th>
                            <th className="w-[10rem] cursor-pointer text-sm font-medium">
                              <div className="flex items-center justify-start">
                                Tamaño
                              </div>
                            </th>
                            <th className="p-4 text-sm font-medium text-center">
                              <div className="flex items-center justify-center">
                                Acciones
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {/* Renderiza carpetas eliminadas */}
                          {foldersState?.folders &&
                            Array.isArray(foldersState.folders) &&
                            renderFolders({
                              folder: null, // No hay carpeta principal en la papelera, así que se pasa null
                              children: foldersState.folders.filter(
                                (folder) => {
                                  return isModificationFilterActive
                                    ? matchesModificationFilter(
                                        folder.updatedAt,
                                      )
                                    : true;
                                },
                              ),
                            })}

                          {/* Renderiza documentos eliminados */}
                          {foldersState?.documents &&
                            Array.isArray(foldersState.documents) &&
                            foldersState.documents.length > 0 &&
                            renderDocuments(
                              foldersState.documents.filter((document) => {
                                const matchesType = selectedType.type
                                  ? matchesTypeFilter(document)
                                  : true;
                                const matchesModif = isModificationFilterActive
                                  ? matchesModificationFilter(
                                      document.updatedAt,
                                    )
                                  : true;
                                return matchesType && matchesModif;
                              }),
                            )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : (
                renderFoldersGrid(
                  filteredFolders,
                  filteredDocuments,
                  filteredModifiedFolders,
                )
              )}
            </div>
          )}
        </div>
      </div>

      <hr className="my-4 mt-10 border-b border-[#5C7891] mb-7" />
      <div className="flex items-center justify-between px-1">
        <h1>Mostrando 1 a 8 de 16 entradas</h1> 
        <div className="flex justify-end px-1  select-none font-zen-kaku">
  <button
    className="px-3 py-1 rounded-lg bg-[#7fa1c6] text-white shadow transition-all duration-200 hover:bg-[#5c7891] focus:outline-none cursor-not-allowed opacity-50"
    disabled
    aria-label="Página anterior"
    title="Página anterior"
  >
    &lt;
  </button>

  <span className="mx-2 font-zen-kaku text-gray-700 font-semibold">
    Página 1 de 1
  </span>

  <button
    className="px-3 py-1 rounded-lg bg-[#7fa1c6] text-white shadow transition-all duration-200 hover:bg-[#5c7891] focus:outline-none cursor-not-allowed opacity-50"
    disabled
    aria-label="Página siguiente"
    title="Página siguiente"
  >
    &gt;
  </button>
</div>
      </div>
  </>
  );
}

export default Mydocuments;
