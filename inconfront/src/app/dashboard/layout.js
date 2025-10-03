"use client";
import React, {
  useState,
  useRef,
  useEffect,
  createContext,
  useContext,
} from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import Sidebar, { SidebarItem } from "./components/Sidebar";
import { getPrimaryRole } from "@/app/utils/roleUtils";
import {
  LayoutDashboard,
  Settings,
  Users,
  MessageCircleMore,
  MessageSquareText,
  Bell,
  ClipboardList,
  BookUser,
  ImageUp,
  User,
  Building2,
  Mountain,
  Mail,
  Shield,
} from "lucide-react";
import { Modal } from "react-responsive-modal";
import "react-responsive-modal/styles.css";
import Image from "next/image";
import Cropper from "react-easy-crop";

import { getUsersbyidlist, postUserProf } from "@/app/services/user";
import { setLink, setUser } from "../store/user/user";
import { getCroppedImg } from "../components/cropImage";

import { getAllNotificationsClient } from "@/app/services/notificationsClient";
import { usePermisos } from "../hooks/usePermisos";

// Contexto para compartir la función de actualización del contador
const NotificationContext = createContext();

export const useNotificationUpdate = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotificationUpdate debe usarse dentro de NotificationProvider",
    );
  }
  return context;
};

export default function NavItems({ children }) {
  const hiddenRoles = ["ITO", "inspector", "prevencionista"];
  const hiddenrolcontractor = [
    "administrador de contrato",
    "planner",
    "prevencionista",
    "ITO",
    "supervisor",
    "superintendente",
  ];
  const userStore = useSelector((state) => state.user);
  const role = getPrimaryRole(userStore.user);
  const id = userStore.user ? userStore.user.id : "";
  
  // Hook de permisos
  const { tienePermiso } = usePermisos();
  
  // Estado para forzar re-render cuando cambien los permisos
  const [permisosVersion, setPermisosVersion] = useState(0);

  // Función para verificar si tiene acceso a alguna herramienta del sistema
  const tieneAccesoAlSistema = () => {
    if (role === "superintendente" || role === "superadmin") return true;
    
    const herramientasSistema = [
      "dashboard",
      "correo", 
      "usuarios",
      "organizacion",
      "minas",
      "crear_proyecto",
      "mis_documentos",
      "general_proyecto",
      "documentos_proyecto"
    ];
    
    return herramientasSistema.some(herramienta => tienePermiso(role, herramienta));
  };

  // Función para verificar si debe mostrar elemento (reemplaza hiddenRoles)
  const debeOcultarPorRol = (roles) => {
    // Si es superintendente o superadmin, nunca ocultar
    if (role === "superintendente" || role === "superadmin") return false;
    
    // Si está en la lista de roles ocultos, ocultar
    return roles.includes(role);
  };

  // Función para verificar permisos de manera unificada
  const tieneAcceso = (herramienta) => {
    // Unificar verificación: sin bypass global; se usa matriz de permisos
    return tienePermiso(role, herramienta);
  };
  const [openModal, setOpenModal] = useState(false);
  const [imagenPerfil, setImagenPerfil] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [uploadText, setUploadText] = useState("Subir foto");
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [userData, setUserData] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [cropMode, setCropMode] = useState(false);
  const [file, setFile] = useState(null);
  const [rawFile, setRawFile] = useState(null);
  const dispatch = useDispatch();

  // Estado para contador de correos no leídos tipo mail
  const [unreadMailCount, setUnreadMailCount] = useState(0);

  useEffect(() => {
    const fetchUserList = async () => {
      if (id) {
        try {
          const response = await getUsersbyidlist(id);
          if (response && response.data) {
            setUserData(response.data);
          } else {
            console.log("No se encontraron datos para el usuario.");
          }
        } catch (error) {
          console.error("Error al obtener los usuarios:", error);
        }
      } else {
        console.log("ID no está disponible.");
      }
    };

    fetchUserList();
  }, [id]);

  // Traer notificaciones tipo mail no leídas al cargar layout (client-side seguro)
  // Exponer fetchUnread para refresco automático desde hijos
  const fetchUnread = async () => {
    try {
      const notifications = await getAllNotificationsClient();
      console.log(
        "🚨 DEBUG CONTADOR - Notificaciones traídas para badge:",
        notifications,
      );
      console.log("🚨 DEBUG CONTADOR - Usuario actual ID:", userStore.user?.id);
      console.log(
        "🚨 DEBUG CONTADOR - Total notificaciones:",
        notifications.length,
      );

      // Loguear todos los mensajes candidatos y su campo readBy
      notifications.forEach((n) => {
        if (
          (!("id_proyecto" in n) ||
            n.id_proyecto === null ||
            n.id_proyecto === 0) &&
          String(n.userId) === String(userStore.user?.id)
        ) {
        }
      });

      const unread = notifications.filter((n) => {
        const isCorreo =
          !("id_proyecto" in n) ||
          n.id_proyecto === null ||
          n.id_proyecto === 0;

        const isForUser = String(n.userId) === String(userStore.user?.id);

        // Verificar si está no leído: debe estar en newFor Y no estar en readBy
        const userId = userStore.user?.id;
        const userIdStr = String(userId);
        const userIdNum = Number(userId);

        // Verificar readBy (si existe y contiene el userId, ya fue leído)
        const isInReadBy =
          n.readBy &&
          Array.isArray(n.readBy) &&
          (n.readBy.includes(userId) ||
            n.readBy.includes(userIdStr) ||
            n.readBy.includes(userIdNum));

        // Verificar deletedBy (si existe y contiene el userId, fue eliminado por el usuario)
        const isDeleted =
          n.deletedBy &&
          Array.isArray(n.deletedBy) &&
          (n.deletedBy.includes(userId) ||
            n.deletedBy.includes(userIdStr) ||
            n.deletedBy.includes(userIdNum));

        // Verificar newFor (debe estar presente para que sea nuevo para este usuario)
        const isInNewFor =
          n.newFor &&
          Array.isArray(n.newFor) &&
          (n.newFor.includes(userId) ||
            n.newFor.includes(userIdStr) ||
            n.newFor.includes(userIdNum));

        const isUnread = isInNewFor && !isInReadBy && !isDeleted;

        const shouldInclude = isCorreo && isForUser && isUnread;

        return shouldInclude;
      });

      setUnreadMailCount(unread.length);
    } catch (err) {
      setUnreadMailCount(0);
    }
  };

  useEffect(() => {
    if (userStore.user?.id) {
      fetchUnread();
    }
  }, [userStore.user?.id]);

  // Escuchar cambios en permisos
  useEffect(() => {
    const handlePermisosActualizados = () => {
      setPermisosVersion(prev => prev + 1);
    };

    window.addEventListener('permisos-actualizados', handlePermisosActualizados);
    
    return () => {
      window.removeEventListener('permisos-actualizados', handlePermisosActualizados);
    };
  }, []);

  // Función temporal para debug - exponer globalmente
  useEffect(() => {
    window.markNotificationAsReadDebug = async (notificationId, userId) => {
      try {
        const { markNotificationAsReadClient } = await import(
          "@/app/services/notificationsClient"
        );
        await markNotificationAsReadClient(notificationId, userId);
        fetchUnread(); // Refrescar contador
      } catch (error) {
        console.error("❌ Error marcando notificación:", error);
      }
    };
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const isValidImage = ["image/jpeg", "image/jpg", "image/png"].includes(
        file.type,
      );
      if (!isValidImage) {
        console.error("Solo se permiten archivos JPEG, JPG o PNG.");
        return;
      }

      const imageUrl = URL.createObjectURL(file);
      setFile(imageUrl);
      setRawFile(file);
      setCropMode(true);
    }
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleUpload = async () => {
    setIsLoading(true);
    try {
      if (!rawFile) {
        throw new Error("No se ha seleccionado un archivo para recortar.");
      }

      const imageType = rawFile.type;

      if (!["image/jpeg", "image/png", "image/jpg"].includes(rawFile.type)) {
        throw new Error("Tipo de archivo no soportado para recortar.");
      }

      if (!croppedAreaPixels) {
        throw new Error("No se ha definido el área recortada.");
      }

      const { blob } = await getCroppedImg(file, croppedAreaPixels, imageType);

      const previewUrl = URL.createObjectURL(blob);
      setImagenPerfil(previewUrl);

      const extension = imageType.split("/")[1];
      const croppedImageFile = new File([blob], `cropped-image.${extension}`, {
        type: imageType,
      });

      setProfileFile(croppedImageFile);
      setCropMode(false);
    } catch (error) {
      console.error("Error al recortar la imagen:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (profileFile) {
      const formDataForImage = new FormData();
      formDataForImage.append("file", profileFile);
      formDataForImage.append("userEmail", userStore.user.email);
      formDataForImage.append("document_type", "Foto de perfil usuario");

      try {
        const imageUploadResponse = await postUserProf(formDataForImage);

        const newImageLink = imageUploadResponse?.data?.link;
        if (newImageLink) {
          dispatch(setLink(""));

          dispatch(setLink(newImageLink));
        }
      } catch (uploadError) {
        console.error("Error al subir la imagen:", uploadError);
      } finally {
        setIsLoading(false);
        setOpenModal(false);
        setFile(null);
        setRawFile(null);
        setImagenPerfil(null);
        setProfileFile(null);
        setCropMode(false);
      }
    }
  };

  const toglemodal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setFile(null);
    setRawFile(null);
    setImagenPerfil(null);
    setProfileFile(null);
    setCropMode(false);
  };

  return (
    <>
      {/* Proveedor del contexto de notificaciones envuelve todo */}
      <NotificationContext.Provider
        value={{ refreshNotifications: fetchUnread }}
      >
        <div className="bg-slate-100 overflow-x-hidden overflow-y-auto w-full h-full antialiased text-slate-300 selection:bg-blue-600 selection:text-white">
          <div className="flex">
            <Sidebar toglemodal={toglemodal}>
              {tieneAcceso("dashboard") && (
                <SidebarItem
                  icon={<LayoutDashboard size={20} />}
                  text="Dashboard"
                />
              )}
              {tieneAcceso("correo") && (
                <SidebarItem icon={<Mail size={20} />} text="Correo">
                  {unreadMailCount > 0 && (
                    <span
                      className="absolute right-3 top-2 bg-red-600 text-white text-xs rounded-full px-2 py-0.5 font-bold shadow-lg border-2 border-white z-50"
                      style={{
                        minWidth: 22,
                        textAlign: "center",
                        fontSize: "1em",
                        fontWeight: "bold",
                        boxShadow: "0 0 0 2px #fff",
                      }}
                    >
                      {unreadMailCount}
                    </span>
                  )}
                </SidebarItem>
              )}
              <div className={`${debeOcultarPorRol(hiddenRoles) ? "hidden" : ""}`}>
                {tieneAcceso("usuarios") && (
                  <SidebarItem icon={<User size={18} />} text="Usuarios" />
                )}
                {tieneAcceso("organizacion") && (
                  <SidebarItem icon={<Building2 size={18} />} text="Organización" />
                )}
                {tieneAcceso("minas") && (
                  <SidebarItem icon={<Mountain size={18} />} text="Obras" />
                )}
              </div>
              <div
                className={`${hiddenrolcontractor.includes(role) ? "hidden" : ""}`}
              ></div>
              {tieneAcceso("crear_proyecto") && (
                <div
                  className={`${debeOcultarPorRol(hiddenRoles) ? "hidden" : ""} ${debeOcultarPorRol(hiddenrolcontractor) ? "hidden" : ""}`}
                >
                  <SidebarItemWithDropdownproyecto />
                </div>
              )}
              {/* <SidebarItem icon={<MessageSquareText size={20} />} text="Chat" /> */}
              {tieneAcceso("mis_documentos") && (
                <SidebarItemWithDropdowndocs />
              )}
              {/* <SidebarItem icon={<MessageCircleMore size={20} />} text="Recordatorios" /> */}

              <hr className="border-t-2 border-white opacity-90 mx-4 my-2 rounded-full " />

              {/* Control de Permisos - Solo visible si el rol tiene control_permisos (superadmin) */}
              {tieneAcceso("control_permisos") && (
                <SidebarItem icon={<Shield size={18} />} text="Control de Permisos" />
              )}

              {/* SuperAdmin - Para usuarios con permiso gestion_superadmin */}
              {tieneAcceso("gestion_superadmin") && (
                <SidebarItem icon={<User size={18} />} text="SuperAdmin" />
              )}

              {/* <SidebarItem icon={<Bell size={20} />} text="Notificaciones" /> */}
            </Sidebar>

            <div className="w-full max-w-screen-3xl text-slate-900">
              {/* Verificar si tiene acceso al sistema */}
              {!tieneAccesoAlSistema() ? (
                <div className="flex items-center justify-center min-h-screen">
                  <div className="text-center p-8 bg-white rounded-lg shadow-sm border border-gray-200 max-w-md">
                    <div className="mb-4">
                      <Shield className="h-16 w-16 text-gray-400 mx-auto" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      Sin Acceso a Herramientas del Sistema
                    </h3>
                    <p className="text-gray-500 mb-4">
                      No tienes permisos para acceder a ninguna herramienta del sistema.
                    </p>
                    <p className="text-sm text-gray-400">
                      Contacta al superintendente para solicitar acceso.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {children}
                  {`${hiddenrolcontractor.includes(role) ? "" : ""}`}
                </>
              )}
            </div>
          </div>
        </div>
      </NotificationContext.Provider>
      <Modal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          handleCloseModal();
        }}
        center
        classNames={{
          modal: "rounded-lg shadow-lg p-6 w-auto h-auto",
          closeButton:
            "absolute top-4 right-4 hover:scale-90 transition-all ease-linear duration-150",
        }}
      >
        <h2 className="text-lg font-zen-kaku mb-4">Datos del usuario</h2>
        <form onSubmit={handleSubmit} className="font-zen-kaku">
          <div className="flex flex-col space-y-2 mb-8">
            {userData ? (
              <>
                <div className="space-x-2">
                  <label className="font-zen-kaku font-bold">
                    Nombre completo del usuario:
                  </label>
                  <span>
                    {userData.names} {userData.apellido_p} {userData.apellido_m}
                  </span>
                </div>
                <div className="space-x-2">
                  <label className="font-zen-kaku font-bold">Rut:</label>
                  <span>{userData.rut}</span>
                  <label className="font-zen-kaku font-bold">Puesto:</label>
                  <span>{userData.puesto}</span>
                </div>
                <div className="space-x-2">
                  <label className="font-zen-kaku font-bold">Email:</label>
                  <span>{userData.email}</span>
                </div>
                <div className="space-x-2">
                  <label className="font-zen-kaku font-bold">
                    Organización:
                  </label>
                  {/* Accede a la información de la organización */}
                  {userData.organizacion ? (
                    <span>{userData.organizacion.nombre}</span>
                  ) : (
                    <span>No disponible</span>
                  )}
                </div>
                <div>
                  <table className="min-w-full divide-y divide-gray-200 border border-gray-300 font-zen-kaku shadow-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-bold text-black">
                          Rol de {userData.names} {userData.apellido_p}{" "}
                          {userData.apellido_m}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 font-zen-kaku">
                      {userData.roles && userData.roles.length > 0 ? (
                        userData.roles.map((role) => (
                          <tr key={role.id}>
                            <td className="px-6 py-4 text-base text-gray-900">
                              {role.name}{" "}
                              {/* Cambia a `role.name` según la propiedad correcta */}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            No hay roles asignados
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <p>Cargando...</p>
            )}
          </div>
          <div className="mb-4">
            <label
              className="block text-sm font-bold mb-2"
              htmlFor="imagenPerfil"
            >
              Selecciona una nueva foto perfil
            </label>
            <div className="relative">
              <input
                type="file"
                id="imagenPerfil"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="imagenPerfil"
                className="flex items-center justify-center cursor-pointer bg-gray-100 border border-gray-300 rounded-lg p-4 text-gray-700 hover:bg-gray-200 transition-colors ease-in-out"
              >
                <ImageUp className="mr-4" />
                <span className="mr-2">Selecciona un archivo</span>
              </label>
              {fileName && !cropMode && (
                <div className="mt-2 text-sm text-gray-600">{fileName}</div>
              )}
              {cropMode ? (
                <div className="mt-4 flex flex-col justify-center items-center">
                  <div className="relative w-64 h-64 overflow-hidden rounded-full">
                    <Cropper
                      image={file}
                      crop={crop}
                      zoom={zoom}
                      aspect={1}
                      onCropChange={setCrop}
                      onCropComplete={onCropComplete}
                      onZoomChange={setZoom}
                      style={{
                        containerStyle: { borderRadius: "50%" },
                        cropAreaStyle: { borderRadius: "50%" },
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleUpload}
                    className={`mt-4 bg-teal-500 px-4 py-2 rounded-md text-white hover:bg-teal-600 transition-all ease-linear duration-150 ${
                      isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={isLoading}
                  >
                    {isLoading ? "Recortando..." : "Recortar y Subir"}
                  </button>
                </div>
              ) : (
                imagenPerfil && (
                  <Image
                    src={imagenPerfil}
                    alt="Preview"
                    className="mt-4 rounded-full w-32 h-32 object-cover"
                    width={128}
                    height={128}
                    objectFit="cover"
                  />
                )
              )}
            </div>
          </div>
          {!cropMode && (
            <div className="flex items-center justify-center">
              <button
                type="submit"
                className={`bg-[#5C7891] px-4 py-2 rounded-md text-white hover:bg-[#597399] transition-all ease-linear duration-150 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={isLoading}
              >
                {isLoading ? "Subiendo..." : "Subir Imagen"}
              </button>
            </div>
          )}
        </form>
      </Modal>
    </>
  );
}

function SidebarItemWithDropdown() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();
  const userStore = useSelector((state) => state.user);
  const role = getPrimaryRole(userStore.user);
  // console.log("rol desde sidebar:", role);
  const hiddenins = ["inspector", "prevencionista"];

  const organization = () => {
    router.push("/dashboard/organization");
  };
  const redirectUsers = () => {
    //console.log("ALO")
    router.push("/dashboard/users");
  };
  const redirectMinas = () => {
    //  console.log("Minas")
    router.push("/dashboard/minas");
  };
  const minas = () => {
    router.push("/dashboard/minas");
  };
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
    if (isDropdownOpen) {
      // Calcular la altura necesaria basada en el número de elementos en el menú desplegable
      const dropdownHeight = dropdownRef.current.scrollHeight;
      // Aplicar la altura calculada al contenedor del menú desplegable
      dropdownRef.current.style.height = `${dropdownHeight}px`;
    } else {
      // Cuando se cierra el menú, restablecer la altura a 0 para ocultarlo
      dropdownRef.current.style.height = "0";
    }
    // Agregar un event listener para cerrar el menú desplegable cuando se haga clic fuera de él
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (!event.target.classList.contains("toggle-dropdown-button")) {
          setIsDropdownOpen(false);
        }
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isDropdownOpen, dropdownRef]);

  return (
    <>
      <SidebarItem
        icon={<Users size={20} />}
        text="Directorio"
        // Agregar evento onClick para alternar el estado del menú desplegable
        toggleDropdown={toggleDropdown}
        hideDropdownIndicator={true}
      />
      {/* Renderizar el menú desplegable si isDropdownOpen es true */}
      <div
        ref={dropdownRef}
        className={`overflow-hidden transition-height duration-300 ease-in-out`}
      >
        {isDropdownOpen && (
          <ul className="ml-4">
            <div className={`${hiddenins.includes(role) ? "hidden" : ""}`}>
              <SidebarItem
                text="Usuarios"
                onClick={redirectUsers}
                textdrop="Usuarios"
              />
            </div>
            <SidebarItem
              text="Organización"
              textdrop="Organización"
              organization={organization}
            />
            <SidebarItem
              text="Obras"
              onClick={redirectMinas}
              textdrop="Obras"
              minas={minas}
            />
          </ul>
        )}
      </div>
    </>
  );
}

function SidebarItemWithDropdownproyecto() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();
  const userStore = useSelector((state) => state.user);
  const role = getPrimaryRole(userStore.user);
  const { tienePermiso, permisos } = usePermisos();

  // Función para verificar permisos de manera unificada
  const tieneAcceso = (herramienta) => {
    if (role === "superintendente" || role === "superadmin") return true;
    return tienePermiso(role, herramienta);
  };

  const redirectCrearProyecto = () => {
    router.push("/dashboard/partidas");
  };
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Forzar re-render cuando cambien los permisos
  useEffect(() => {
    // Re-render cuando cambien los permisos
  }, [permisos]);
  useEffect(() => {
    if (isDropdownOpen) {
      // Calcular la altura necesaria basada en el número de elementos en el menú desplegable
      const dropdownHeight = dropdownRef.current.scrollHeight;
      // Aplicar la altura calculada al contenedor del menú desplegable
      dropdownRef.current.style.height = `${dropdownHeight}px`;
    } else {
      // Cuando se cierra el menú, restablecer la altura a 0 para ocultarlo
      dropdownRef.current.style.height = "0";
    }
    // Agregar un event listener para cerrar el menú desplegable cuando se haga clic fuera de él
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (!event.target.classList.contains("toggle-dropdown-button")) {
          setIsDropdownOpen(false);
        }
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isDropdownOpen, dropdownRef]);

  return (
    <>
      <SidebarItem
        icon={<BookUser size={20} />}
        text="Proyecto"
        // Agregar evento onClick para alternar el estado del menú desplegable
        toggleDropdown={toggleDropdown}
        hideDropdownIndicator={true}
      />
      {/* Renderizar el menú desplegable si isDropdownOpen es true */}
      <div
        ref={dropdownRef}
        className={"overflow-hidden transition-height duration-300 ease-in-out"}
      >
        {isDropdownOpen && (
          <ul className="ml-4">
            {tieneAcceso("crear_proyecto") && (
              <SidebarItem
                text="Crear proyecto"
                onClick={redirectCrearProyecto}
                textdrop="Crear proyecto"
              />
            )}
          </ul>
        )}
      </div>
    </>
  );
}

function SidebarItemWithDropdowndocs() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();
  const userStore = useSelector((state) => state.user);
  const role = getPrimaryRole(userStore.user);
  const { tienePermiso } = usePermisos();

  // Función para verificar permisos de manera unificada
  const tieneAcceso = (herramienta) => {
    if (role === "superintendente" || role === "superadmin") return true;
    const permiso = tienePermiso(role, herramienta);
    console.log(`🔍 Dropdown Documentos - Rol: ${role}, Herramienta: ${herramienta}, Permiso: ${permiso}`);
    return permiso;
  };

  const redirectdocs = () => {
    router.push("/dashboard/my_documents");
  };
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  useEffect(() => {
    if (isDropdownOpen) {
      // Calcular la altura necesaria basada en el número de elementos en el menú desplegable
      const dropdownHeight = dropdownRef.current.scrollHeight;
      // Aplicar la altura calculada al contenedor del menú desplegable
      dropdownRef.current.style.height = `${dropdownHeight}px`;
    } else {
      // Cuando se cierra el menú, restablecer la altura a 0 para ocultarlo
      dropdownRef.current.style.height = "0";
    }
    // Agregar un event listener para cerrar el menú desplegable cuando se haga clic fuera de él
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (!event.target.classList.contains("toggle-dropdown-button")) {
          setIsDropdownOpen(false);
        }
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isDropdownOpen, dropdownRef]);

  return (
    <>
      <SidebarItem
        icon={<ClipboardList size={20} />}
        text="Documentos"
        // Agregar evento onClick para alternar el estado del menú desplegable
        toggleDropdown={toggleDropdown}
      />
      {/* Renderizar el menú desplegable si isDropdownOpen es true */}
      <div
        ref={dropdownRef}
        className={"overflow-hidden transition-height duration-300 ease-in-out"}
      >
        {isDropdownOpen && (
          <ul className="ml-4">
            {tieneAcceso("mis_documentos") && (
              <SidebarItem
                text="Mis documentos"
                onClick={redirectdocs}
                textdrop="Mis documentos"
              />
            )}
          </ul>
        )}
      </div>
    </>
  );
}
