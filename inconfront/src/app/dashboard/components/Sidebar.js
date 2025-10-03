import React, {
  useContext,
  useState,
  createContext,
  useRef,
  useEffect,
} from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { usePermisos } from "../../hooks/usePermisos";
import { getPrimaryRole } from "@/app/utils/roleUtils";
import io from "socket.io-client";
import Image from "next/image";
import Link from "next/link";
import { LogOut, Mail } from "lucide-react";
import { logout } from "../../store/user/user";
import { getAllNotifications } from "@/app/services/eventos_service";

const socket = io(`${process.env.NEXT_PUBLIC_FAENA_BACKEND_SOCKET_HOST}`);
    const loginSocket = io(`${process.env.NEXT_PUBLIC_FAENA_BACKEND_SOCKET_HOST}`, {
  path: "/login-socket",
});
const SidebarContext = createContext();

export default function Sidebar({ children, users, toglemodal }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const userStore = useSelector((state) => state.user);
  const { tienePermiso, tieneTool } = usePermisos();
  const saludo = userStore.user ? `${userStore.user.names}` : "";
  const role = getPrimaryRole(userStore.user);
  const link =
    userStore.link ||
    "https://ui-avatars.com/api/?background=c7d2fe&color=3730a3&bold=true";

  const imageUrl = `${link}?${new Date().getTime()}`;

  const adminHome = "/dashboard/users";
  const dashboard = "/dashboard/dashboardproyect";
  const linkHref =
    role === "admin" || role === "superadmin" ? adminHome : dashboard;

  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true); // Mostrar pantalla blanca inmediatamente
    setTimeout(() => {
      const userId = userStore.user.id;
      dispatch(logout());
      loginSocket.emit("logout", userId);
      window.location.replace("/login");
    }, 10); // Pequeño delay para asegurar el render del overlay
  };

  const [expanded, setExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [manualControl, setManualControl] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Eliminado: El contador de correos no leídos se manejará desde layout.js

  const asideRef = useRef(null);

  // Ocultar scrollbars globalmente cuando el sidebar esté expandido
  useEffect(() => {
    if (typeof document !== "undefined") {
      const targets = [document.body, document.documentElement];
      if (expanded) {
        targets.forEach(el => el && el.classList.add("hide-scrollbar-all"));
      } else {
        targets.forEach(el => el && el.classList.remove("hide-scrollbar-all"));
      }
      return () => {
        targets.forEach(el => el && el.classList.remove("hide-scrollbar-all"));
      };
    }
  }, [expanded]);

  // Función para colapsar la sidebar (usada al navegar)
  const handleSidebarNavigate = () => {
    // Solo colapsar si no está en modo de control manual
    if (!manualControl) {
      setExpanded(false);
    }
  };

  // Función para alternar el panel manualmente
  const toggleSidebar = () => {
    setExpanded(prev => !prev);
  };

  const adjustAsideForScreenSize = () => {
    const isMobileView = window.innerWidth < 560;
    setIsMobile(isMobileView);
    
    // En móvil, siempre colapsar el sidebar y resetear control manual
    if (isMobileView) {
      setExpanded(false);
      setManualControl(false);
    }
    
    if (!isInitialized) {
      setExpanded(false);
      setIsInitialized(true);
    }
  };

  useEffect(() => {
    adjustAsideForScreenSize();
    window.addEventListener("resize", adjustAsideForScreenSize);
    return () => window.removeEventListener("resize", adjustAsideForScreenSize);
  }, [isInitialized]);

  // Eliminado: El contador de correos no leídos se manejará desde layout.js

  if (loggingOut) {
    return <div style={{background: '#fff', width: '100vw', height: '100vh', position: 'fixed', inset: 0, zIndex: 9999}} />;
  }

  return (
    <div className={`flex flex-col min-h-screen ${isMobile ? 'w-full' : ''}`}>
      <div className={`flex flex-1 ${isMobile ? 'w-full' : ''}`}>
        {/* Botón fijo para abrir/cerrar el panel lateral */}
        <button
          onClick={() => {
            toggleSidebar();
            setManualControl(true);
          }}
          className={`fixed top-4 left-4 p-2 rounded-lg bg-[#5c7891] hover:bg-[#46607a] transition-all duration-200 shadow-lg ${
            isMobile ? 'z-[9999]' : 'z-[9999]'
          }`}
        >
          <span className="text-white font-bold text-sm">
            {expanded ? "◀" : "▶"}
          </span>
        </button>

        <aside
          ref={asideRef}
          className={`
            fixed top-0 h-full z-50
            flex flex-col border-r shadow-xl overscroll-x-none !bg-gradient-to-b !from-[#5c7891] !to-[#46607a]
            transition-all duration-300 ease-in-out overflow-x-hidden
            ${isMobile 
              ? (expanded ? "mobile-sidebar-expanded" : "mobile-sidebar-hidden")
              : (expanded ? "sidebar-expanded left-0" : "sidebar-hidden -left-72")
            }
          `}
        >
          {/* Aquí va el movimineto el menú lateral  */}
          <nav className="flex flex-col flex-1 bg-transparent h-full">
            <div className="flex items-center px-4 py-3">
              <Link href="">
                <span
                  className={`flex items-center transition-all duration-300 select-none ${
                    expanded ? "w-32 h-16" : "w-12 h-12"
                  }`}
                  style={{
                    minWidth: expanded ? "8rem" : "3rem",
                    minHeight: expanded ? "4rem" : "3rem",
                    marginTop: "2.5rem",
                  }}
                >
                  {expanded ? (
                    <span
                      className="font-extrabold tracking-widest text-white text-2xl font-[Montserrat,sans-serif] drop-shadow-md flex items-center"
                      style={{
                        letterSpacing: "0.18em",
                        fontFamily: "Montserrat, 'Segoe UI', Arial, sans-serif",
                        lineHeight: "1",
                      }}
                    >
                      INCON
                    </span>
                  ) : (
                    <span
                      className="font-extrabold text-white text-xl font-[Montserrat,sans-serif] drop-shadow-md flex items-center"
                      style={{
                        fontFamily: "Montserrat, 'Segoe UI', Arial, sans-serif",
                        lineHeight: "1",
                      }}
                    ></span>
                  )}
                </span>
              </Link>
              {/* Botón de desplegar barra solo visible en móvil */}
              <button
                onClick={() => setExpanded((curr) => !curr)}
                className="p-2 rounded-lg group hover:bg-[#7fa1c6]/80 bg-gray-50 transition-all duration-200 sidebar-toggle-icon block md:hidden ml-auto"
              >
              </button>
            </div>
            <hr className="border-t-2 border-white opacity-90 mx-4 my-2 rounded-full" />
            <SidebarContext.Provider value={{ expanded, setExpanded }}>
              <ul
                className={`flex-1 flex flex-col gap-y-1 py-2 overflow-y-auto ${expanded ? "px-2" : "px-0"}`}
              >
                {/* Eliminado: El SidebarItem de Correo se manejará desde layout.js */}
                {React.Children.map(children, (child) =>
                  React.isValidElement(child)
                    ? child
                    : child,
                )}
              </ul>
            </SidebarContext.Provider>
            {/* Avatar/logout siempre pegados al fondo */}
            <div className="flex-shrink-0 flex flex-col items-center justify-end w-fu ll mt-auto">
              {!expanded && (
                <hr className="border-t-2 border-white opacity-90 mx-4 my-2 rounded-full w-10" />
              )}
              <Image
                src={imageUrl}
                alt="User Avatar"
                className={`rounded-full cursor-pointer ${expanded ? "w-11 h-11 mb-2" : "w-7 h-7 mb-2"}`}
                width={expanded ? 44 : 28}
                height={expanded ? 44 : 28}
                style={{
                  minWidth: expanded ? 44 : 28,
                  minHeight: expanded ? 44 : 28,
                  objectFit: "cover",
                }}
                onClick={toglemodal}
              />
              <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-1 rounded bg-black text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                Perfil de usuario
              </span>
              {expanded ? (
                <div
                  className={`flex justify-between items-center overflow-hidden transition-all ml-4 ${expanded ? "w-48 ml-3" : "w-0 h-0"}`}
                >
                  <div className="leading-4 select-none">
                    <h4 className="font-semibold text-white">{saludo}</h4>
                    <span className="text-xs text-gray-200">{role}</span>
                  </div>
                  <div
                    className="hover:bg-[#7fa1c6]/80 rounded-lg p-2 ml-2 cursor-pointer group transition-all duration-150"
                    onClick={handleLogout}
                  >
                    <LogOut
                      size={20}
                      className="stroke-[#cbe7ff] group-hover:stroke-white"
                    />
                  </div>
                </div>
              ) : (
                <div
                  className="hover:bg-[#7fa1c6]/80 rounded-lg p-2 mt-2 cursor-pointer group transition-all duration-150"
                  onClick={handleLogout}
                >
                  <LogOut
                    size={18}
                    className="stroke-[#cbe7ff] group-hover:stroke-white"
                  />
                </div>
              )}
            </div>
          </nav>
        </aside>
        {/* Overlay oscuro cuando la sidebar está expandida */}
        {expanded && (
          <div
            className="fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity duration-300"
            onClick={() => setExpanded(false)}
          />
        )}
        <main className="flex-1 overflow-auto w-full ml-0">
          {/* Aquí va el contenido principal de la página */}
        </main>
      </div>
    </div>
  );
}

export function SidebarItem({
  icon,
  text,
  toggleDropdown,
  children,
  alert,
  // badgeCount eliminado, ahora se maneja desde layout.js
  organization,
  toglemodal,
  onClick, // Nuevo prop soportado
  hideDropdownIndicator = false, // Nuevo prop para controlar la visibilidad del indicador
}) {
  const router = useRouter();
  const { expanded, setExpanded } = useContext(SidebarContext);

  const handleClick = () => {
    let navigated = false;
    if (typeof onClick === "function") {
      onClick();
      navigated = true;
    } else if (toggleDropdown) {
      if (expanded) {
        toggleDropdown();
        navigated = true;
      } else {
        // Si no está expandido, expandir primero y luego abrir el dropdown
        setExpanded(true);
        // Usar setTimeout para asegurar que el sidebar se expanda antes de abrir el dropdown
        setTimeout(() => {
          toggleDropdown();
        }, 100);
        navigated = true;
      }
    } else if (text === "Correo") {
      router.push("/dashboard/correos");
      navigated = true;
    } else if (text === "Organización") {
      router.push("/dashboard/organization");
      navigated = true;
    } else if (text === "Usuarios") {
      router.push("/dashboard/users");
      navigated = true;
    } else if (text === "Dashboard") {
      router.push("/dashboard/dashboardproyect");
      navigated = true;
    } else if (text === "Crear proyecto") {
      router.push("/dashboard/partidas");
      navigated = true;
    } else if (text === "Mis documentos") {
      router.push("/dashboard/my_documents?path=proyectos");
      navigated = true;
    } else if (text === "Minas" || text === "Obras") {
      router.push("/dashboard/minas");
      navigated = true;
    } else if (text === "Configuración" && toglemodal) {
      toglemodal();
      navigated = true;
    } else if (text === "Control de Permisos") {
      router.push("/dashboard/control-permisos");
      navigated = true;
    } else if (text === "SuperAdmin") {
      router.push("/dashboard/superadmin");
      navigated = true;
    }

  };

  return (
    <li
      className={`relative flex items-center py-2 my-1 font-medium rounded-md cursor-pointer transition-colors group sidebar-item
        hover:bg-[#7fa1c6]/80
        hover:text-white
        ${!expanded ? "overflow-hidden justify-center px-2" : "overflow-x-hidden px-3"}
      `}
      onClick={handleClick}
      data-hide-dropdown={hideDropdownIndicator}
    >
      {icon &&
        React.cloneElement(icon, {
          className:
            "stroke-[#cbe7ff] group-hover:stroke-white transition-colors duration-150",
        })}
      <span
        className={`overflow-hidden transition-all duration-500 ease-in-out text-white group-hover:text-white select-none text-ellipsis whitespace-nowrap ${expanded ? "w-48 ml-3 opacity-100" : "w-0 ml-0 opacity-0"}`}
        style={{ fontFamily: '"zen kaku gothic antique", sans-serif' }}
      >
        {text}
      </span>
      {children}
      {alert && (
        <div
          className={`absolute right-2 w-2 h-2 rounded bg-indigo-400 ${expanded ? "" : "top-2"}`}
        >
          {" "}
        </div>
      )}
      {/* badgeCount eliminado, ahora se maneja desde layout.js */}
      {!expanded && (
        <div
          className="absolute z-10 left-20 ml-6 px-2 py-1 bg-[#7fa1c6] text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-all"
          style={{ fontFamily: '"zen kaku gothic antique", sans-serif' }}
        >
          {text}
        </div>
      )}
    </li>
  );
}