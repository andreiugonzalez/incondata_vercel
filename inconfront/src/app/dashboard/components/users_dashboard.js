"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUpFromBracket,
  faArrowDown,
  faTrashCan,
  faPenToSquare,
  faSearch,
  faHandPaper,
  faFileUpload,
} from "@fortawesome/free-solid-svg-icons";
import { Plus, Download } from "lucide-react";
import Image from "next/image";
import { format, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Modal from "./new_user_modal";
import Drawer from "./new_user_externo";

import RoleDrawer from "./roleDrawer";
import { useRouter } from "next/navigation";

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

import Tooltip from "@/app/components/tooltip";

import { registerUsersFromExcel, deleteUser } from "@/app/services/user";

import DrawerCargaExcelUsuarios from "@/app/components/carga_usuarios_excelDrawer";
import toast from "react-hot-toast";
import "../style/media_query.css";
import { Search } from "lucide-react";

import { getPrimaryRole } from "@/app/utils/roleUtils";

function highlightMatch(text, searchTerm) {
  if (!text) return "";
  if (!searchTerm) return text;
  const regex = new RegExp(`(${searchTerm})`, "gi");
  return text.split(regex).map((part, index) =>
    part.toLowerCase() === searchTerm.toLowerCase() ? (
      <span key={index} style={{ backgroundColor: "yellow" }}>
        {part}
      </span>
    ) : (
      part
    ),
  );
}

function UsersDashboardComponent({ users, setFilter, Hidebyrol }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [orderBy, setOrderBy] = useState("");
  const [isNewUserOpen, setIsNewUserOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((err) =>
          console.log("Service Worker registration failed: ", err),
        );
    }
  }, []);

  const userStore = useSelector((state) => state.user);
  const role = getPrimaryRole(userStore.user);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleOrderBy = (event) => {
    setOrderBy(event.target.value);
  };

  const handleNewUser = () => {
    // Redirigir directamente a crear usuario interno
    router.push("/dashboard/internaluser");
    
    // Código comentado para preservar funcionalidad de modal de selección
    // setIsNewUserOpen(true);
  };

  // Función para manejar la eliminación de usuarios
  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar al usuario ${userName}? Esta acción no se puede deshacer.`)) {
      try {
        const response = await deleteUser(userId);
        if (response.statusCode === 200) {
          toast.success(response.message || "Usuario eliminado correctamente");
          // Recargar la página para actualizar la lista de usuarios
          window.location.reload();
        } else {
          toast.error(response.message || "Error al eliminar el usuario");
        }
      } catch (error) {
        console.error("Error al eliminar usuario:", error);
        toast.error("Error al eliminar el usuario");
      }
    }
  };

  const filteredUsers = users?.filter((user) => {
    return (
      (user.names?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (user.organizacion?.nombre?.toLowerCase() || "").includes(
        searchTerm.toLowerCase(),
      ) ||
      (user.estatus?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (user.puesto?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (user.rol?.name?.toLowerCase() || "").includes(
        searchTerm.toLowerCase(),
      ) ||
      (user.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (typeof user.ultimo_acceso === "string" &&
      user.ultimo_acceso === "No ha accedido"
        ? "No ha accedido".toLowerCase().includes(searchTerm.toLowerCase())
        : (() => {
            const fecha = new Date(user.ultimo_acceso);
            if (isValid(fecha)) {
              return format(fecha, "MMMM d, yyyy", { locale: es })
                .toLowerCase()
                .includes(searchTerm.toLowerCase());
            }
            return false;
          })())
    );
  });

  // Lunixia: Fix avanzado para ordenamiento de campos anidados y strings case-insensitive (alfabético real)
  const orderByAccessors = {
    names: (u) => (u.names || "").toLowerCase(),
    organizacion: (u) => (u.organizacion?.nombre || "").toLowerCase(),
    estatus: (u) => (u.user_estado?.nombre_estado_cuenta || "").toLowerCase(),
    puesto: (u) => (u.user_puesto?.nombre_puesto || "").toLowerCase(),
    email: (u) => (u.email || "").toLowerCase(),
    ultimo_acceso: (u) => {
      // Si es string vacío o "No ha accedido", lo mandamos al final
      if (!u.ultimo_acceso || u.ultimo_acceso === "No ha accedido") return null;
      return new Date(u.ultimo_acceso);
    },
  };

  const sortedUsers =
    !orderBy || orderBy === "placeholder"
      ? filteredUsers
      : filteredUsers.sort((a, b) => {
          const getValue = orderByAccessors[orderBy];
          if (!getValue) return 0;
          const valA = getValue(a);
          const valB = getValue(b);

          if (orderBy === "ultimo_acceso") {
            // Orden descendente: más nuevo primero
            if (valA === null && valB === null) return 0;
            if (valA === null) return 1;
            if (valB === null) return -1;
            return valB - valA;
          }

          if (valA < valB) return -1;
          if (valA > valB) return 1;
          return 0;
        });

  const saludo = `¡Hola ${userStore.user?.names}! 👋`;

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleUpdateRoles = (updatedRoles) => {
    setSelectedUserRoles(updatedRoles);
    console.log("actualizo");
    // Aquí puedes hacer una llamada a la API para actualizar los roles en el backend si es necesario
  };

  const handleExport = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Usuarios");

    // Definir las cabeceras
    worksheet.columns = [
      { header: "Nombre", key: "names" },
      { header: "Compañía", key: "company" },
      { header: "Estatus", key: "status" },
      { header: "Puesto", key: "position" },
      { header: "Roles", key: "roles" },
      { header: "Grupo", key: "group" },
      { header: "Email", key: "email" },
      { header: "Último acceso", key: "lastAccess" },
    ];

    // Agregar los datos
    users.forEach((user) => {
      worksheet.addRow({
        names: user.names || "",
        company: user.organizacion?.nombre || "",
        status: user.estatus || "",
        position: user.puesto || "",
        roles: user.roles?.name || "",
        group: user.user_grupo?.nombre_grupo || "", // Ajustar según sea necesario
        email: user.email || "",
        lastAccess: (() => {
          if (user.ultimo_acceso) {
            const fecha = new Date(user.ultimo_acceso);
            if (isValid(fecha)) {
              return format(fecha, "MMMM d, yyyy", { locale: es });
            }
          }
          return "";
        })(),
      });
    });

    // Convertir el rango en una tabla
    worksheet.addTable({
      name: "Usuarios",
      ref: "A1",
      headerRow: true,
      totalsRow: false,
      style: {
        theme: "TableStyleMedium2",
        showRowStripes: true,
      },
      columns: [
        { name: "Nombre", filterButton: true },
        { name: "Compañía", filterButton: true },
        { name: "Estatus", filterButton: true },
        { name: "Puesto", filterButton: true },
        { name: "Roles", filterButton: true },
        { name: "Grupo", filterButton: true },
        { name: "Email", filterButton: true },
        { name: "Último acceso", filterButton: true },
      ],
      rows: users.map((user) => [
        user.names || "",
        user.organizacion?.nombre || "",
        user.user_estado?.nombre_estado_cuenta || "",
        user.puesto || "",
        user.roles?.name || "",
        user.user_grupo?.nombre_grupo || "",
        user.email || "",
        (() => {
          if (user.ultimo_acceso) {
            const fecha = new Date(user.ultimo_acceso);
            if (isValid(fecha)) {
              return format(fecha, "MMMM d, yyyy", { locale: es });
            }
          }
          return "";
        })(),
      ]),
    });

    // Ajustar el ancho de las columnas
    worksheet.columns.forEach((column) => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = maxLength + 2;
    });

    // Guardar el archivo
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "usuarios.xlsx");
  };

  //export

  //paginacion

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentItems = sortedUsers
    ? sortedUsers.slice(indexOfFirstItem, indexOfLastItem)
    : [];
  const totalPages = sortedUsers
    ? Math.ceil(sortedUsers.length / itemsPerPage)
    : 0;

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(Number(event.target.value));
    setCurrentPage(1); // Reiniciar a la primera página cuando se cambie el número de filas por página
  };

  //modal roles
  const [isRoleDrawerOpen, setIsRoleDrawerOpen] = useState(false);
  const [selectedUserRoles, setSelectedUserRoles] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const openRoleDrawer = (user) => {
    if (hiddenRoles.includes(role)) {
      toast.error(
        "Acceso denegado. No tienes permiso para acceder a esta función.",
      );
    } else {
      setSelectedUser(user);
      setSelectedUserRoles(user.roles || []);
      setIsRoleDrawerOpen(true);
    }
  };

  const closeRoleDrawer = () => {
    setIsRoleDrawerOpen(false);
    setSelectedUser(null);
    setSelectedUserRoles([]);
  };

  const [isDrawerOpenExcel, setIsDrawerOpenExcel] = useState(false);

  const toggleDrawerCargaExcel = () => {
    setIsDrawerOpenExcel(!isDrawerOpenExcel);
  };

  const hiddenRoles = ["ITO", "planner", "superintendente", "inspector"];

  const [isClicked, setIsClicked] = useState(false); // Estado para manejar el clic

  const handleSelectClick = () => {
    setIsClicked(true); // Cambia el estado a true cuando se hace clic
  };

  const handleSelectBlur = () => {
    setIsClicked(false); // Cambia el estado a false cuando se pierde el foco
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
      {isNewUserOpen && <Modal isOpen={setIsNewUserOpen} />}
      <div className="flex flex-col w-full h-full bg-white custom-class-user">
        <div className="mt-4"></div>
        {/* <div className="mb-4 ml-4 text-2xl font-bold text-gray-800 select-none font-zen-kaku">{saludo}</div> */}
        <div className="flex flex-col gap-4 mb-8 select-none custom-label-user">
          <h1 className="mx-auto text-3xl font-extrabold text-gray-800 select-none font-zen-kaku text-center">
            | Vista General de usuarios |
          </h1>
        </div>
        <div className="flex justify-center mb-4">
          <button onClick={() => setFilter('all')} className="px-4 py-2 mr-2 font-semibold text-gray-800 bg-gray-200 rounded-lg shadow-md hover:bg-gray-300">Todos</button>
          <button onClick={() => setFilter('internal')} className="px-4 py-2 mr-2 font-semibold text-gray-800 bg-gray-200 rounded-lg shadow-md hover:bg-gray-300">Internos</button>
          <button onClick={() => setFilter('external')} className="px-4 py-2 font-semibold text-gray-800 bg-gray-200 rounded-lg shadow-md hover:bg-gray-300">Externos</button>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8 font-semibold font-zen-kaku px-4">
          {/* Buscador y filtro - Responsivo */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto custom-user-search">
            <div className="relative group w-full sm:w-auto">
              <input
                type="text"
                placeholder="Buscar usuarios..."
                className="w-full p-3 pl-12 rounded-lg outline-none shadow-lg bg-gray-100 hover:bg-white border border-black hover:border-black focus:border-black focus:bg-white transition-all ease-linear duration-150 text-base"
                onChange={handleSearch}
                aria-label="Campo de busqueda de usuarios"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Search
                  size={20}
                  className="text-black transition-all ease-linear duration-150"
                />
              </div>
            </div>
            <div className="w-full sm:w-auto">
              <select
                id="filtroSelect"
                name="filtroSelect"
                className="w-full p-3 border border-black transition-all ease-linear duration-150 shadow-lg rounded-lg cursor-pointer bg-gray-100 hover:bg-white hover:border-black focus:border-black text-base"
                defaultValue="placeholder"
                onChange={handleOrderBy}
                onClick={handleSelectClick}
                onBlur={handleSelectBlur}
                aria-label="Ordenar usuarios por:"
              >
                <option value="placeholder" disabled>
                  Ordenar por:
                </option>
                <option value="names">Nombre</option>
                <option value="organizacion">Compañía</option>
                <option value="estatus">Estatus</option>
                <option value="puesto">Puesto</option>
                <option value="email">Correo electrónico</option>
                <option value="lastAccess">Último acceso</option>
              </select>
            </div>
          </div>
          {/* Derecha: Botones de acción */}
          <div className="flex flex-wrap gap-2 justify-center lg:justify-end w-full lg:w-auto custom-button-user">
            {/*
            Botón: Actualizar usuario
            <button
              className="flex items-center justify-center w-12 h-12 lg:w-10 lg:h-10 rounded-full border border-black bg-gradient-to-br from-white via-gray-100 to-gray-200 shadow-2xl transition-all duration-200 ease-in-out hover:from-teal-100 hover:to-white hover:shadow-[0_8px_24px_rgba(0,0,0,0.18)] hover:scale-105 active:scale-95 focus:outline-none focus:ring-teal-400"
              aria-label="Actualizar usuario"
              title="Actualizar usuario"
              type="button"
            >
              <FontAwesomeIcon
                icon={faArrowDown}
                size="lg"
                className="text-black"
              />
            </button>
            */}
            {/* Botón: Descargar usuarios */}
            <button
              className="flex items-center justify-center w-12 h-12 lg:w-10 lg:h-10 rounded-full border border-black bg-gradient-to-br from-white via-gray-100 to-gray-200 shadow-2xl transition-all duration-200 ease-in-out hover:from-teal-100 hover:to-white hover:shadow-[0_8px_24px_rgba(0,0,0,0.18)] hover:scale-105 active:scale-95 focus:outline-none focus:ring-teal-400"
              onClick={handleExport}
              aria-label="Descargar usuarios"
              title="Descargar usuarios"
              type="button"
            >
              <Download size={22} color="black" />
            </button>
            {/* Botón: Abrir cargador de usuarios */}
            <button
              onClick={toggleDrawerCargaExcel}
              className={`flex items-center justify-center w-12 h-12 lg:w-10 lg:h-10 rounded-full border border-black bg-gradient-to-br from-white via-gray-100 to-gray-200 shadow-2xl transition-all duration-200 ease-in-out hover:from-teal-100 hover:to-white hover:shadow-[0_8px_24px_rgba(0,0,0,0.18)] hover:scale-105 active:scale-95 focus:outline-none focus:ring-teal-400 ${hiddenRoles.includes(role) ? "hidden" : ""}`}
              aria-label="Abrir cargador de usuarios"
              title="Abrir cargador de usuarios"
              type="button"
            >
              <FontAwesomeIcon
                icon={faFileUpload}
                size="lg"
                className="text-black"
              />
            </button>
            {/* Botón: Agregar usuario */}
            <button
              className={`flex items-center justify-center w-12 h-12 lg:w-10 lg:h-10 rounded-full border border-black bg-gradient-to-br from-white via-gray-100 to-gray-200 shadow-2xl transition-all duration-200 ease-in-out hover:from-teal-100 hover:to-white hover:shadow-[0_8px_24px_rgba(0,0,0,0.18)] hover:scale-105 active:scale-95 focus:outline-none focus:ring-teal-400 ${hiddenRoles.includes(role) ? "hidden" : ""}`}
              onClick={handleNewUser}
              aria-label="Agregar nuevo usuario"
              title="Agregar nuevo usuario"
              type="button"
            >
              <Plus size={24} color="black" />
            </button>
            <div>
              <DrawerCargaExcelUsuarios
                isOpen={isDrawerOpenExcel}
                onClose={toggleDrawerCargaExcel}
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto px-4">
          <div className="table select-none font-zen-kaku overflow-x-auto w-full min-w-full">
            <table className="table-auto w-full border-separate border-spacing-0 overflow-x-auto rounded-t-xl shadow-sm">
              <thead>
                <tr className="bg-[#5C7891] ext-gray-100 rounded-t-xl">
                  <th className="py-3 px-2 font-semibold rounded-tl-xl"></th>
                  <th className="py-3 px-2 text-xs font-semibold tracking-wide text-gray-100 text-left">
                    <div className="flex items-center">Nombre</div>
                  </th>
                  <th className="py-3 px-2 text-xs font-semibold tracking-wide text-gray-100 text-left">
                    <div className="flex items-center">Compañía</div>
                  </th>
                  <th className="py-3 px-2 text-xs font-semibold tracking-wide text-gray-100 text-left">
                    <div className="flex items-center">Estatus</div>
                  </th>
                  <th className="py-3 px-2 text-xs font-semibold tracking-wide text-gray-100 text-left">
                    <div className="flex items-center">Puesto</div>
                  </th>
                  <th className="py-3 px-2 text-xs font-semibold tracking-wide text-gray-100 text-left">
                    <div className="flex items-center">Roles</div>
                  </th>
                  <th className="py-3 px-2 text-xs font-semibold tracking-wide text-gray-100 text-left">
                    <div className="flex items-center">Grupo</div>
                  </th>
                  <th className="py-3 px-2 text-xs font-semibold tracking-wide text-gray-100 text-left">
                    <div className="flex items-center">Correo electrónico</div>
                  </th>
                  <th className="py-3 px-2 text-xs font-semibold tracking-wide text-gray-100 text-left">
                    <div className="flex items-center">Último acceso</div>
                  </th>
                  <th className="py-3 px-2 font-semibold rounded-tr-xl text-gray-100">
                    <div
                      className={`flex items-center ${hiddenRoles.includes(role) ? "hidden" : ""}`}
                    >
                      Acciones
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody>
                {currentItems.map((user, index) => (
                  <tr
                    key={index}
                    className={`text-sm text-left font-semibold transition-colors border-b border-gray-200 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-gray-100`}
                  >
                    <td className="p-2"></td>
                    <td className="p-2">
                      <div className="flex items-center">
                        {/* <div className="w-8 h-8 mr-2 overflow-hidden rounded-full">
                          <Image
                            src={
                              user.documents && user.documents[0]
                                ? user.documents[0].link
                                : ""
                            }
                            alt="Profile"
                            width={100}
                            height={100}
                            className="object-cover w-full h-full"
                            style={{ filter: "brightness(50%)" }}
                          />
                        </div> */}
                        {highlightMatch(
                          `${user.names} ${user.apellido_p} ${user.apellido_m}`,
                          searchTerm,
                        )}
                      </div>
                    </td>
                    <td className="p-2">
                      {highlightMatch(user.organizacion?.nombre, searchTerm)}
                    </td>
                    <td>
                      <div
                        href="#"
                        className={`p-4 text-white text-center hover:shadow-lg text-xs rounded-md py-2 px-2 ${
                          user.user_estado?.nombre_estado_cuenta === "Bloqueado"
                            ? "bg-red-500"
                            : user.user_estado?.nombre_estado_cuenta ===
                                "Activo"
                              ? "bg-[#3B82F6]" // azul vibrante
                              : user.user_estado?.nombre_estado_cuenta ===
                                "Inactivo"
                        }`}
                      >
                        {highlightMatch(
                          user.user_estado?.nombre_estado_cuenta,
                          searchTerm,
                        )}
                      </div>
                    </td>
                    <td className="p-2">
                      {highlightMatch(
                        user.user_puesto ? user.user_puesto.nombre_puesto : "Sin puesto",
                        searchTerm,
                      )}
                    </td>
                    <td className="p-2">
                      {user.roles && user.roles.length > 0 ? (
                        <>
                          <a
                            href="#"
                            className="p-4 text-white text-xs rounded-md py-2 px-5"
                            // onClick={() => openGroupDrawer(user)}
                          >
                            <div
                              href="#"
                              className={`p-4 text-white text-center hover:shadow-lg text-xs rounded-md py-2 px-5 font-zen-kaku
                ${
                  user.roles[0].name === "admin"
                    ? "bg-[#2563EB]" // azul intenso
                    : user.roles[0].name === "administrador de contrato"
                      ? "bg-[#3B82F6]" // azul vibrante
                      : user.roles[0].name === "superadmin"
                        ? "bg-[#60A5FA]" // azul pastel
                        : user.roles[0].name === "planner"
                          ? "bg-[#1E40AF]" // azul oscuro
                          : user.roles[0].name === "ITO"
                            ? "bg-[#0EA5E9]" // azul cyan
                            : user.roles[0].name === null ||
                                user.roles[0].name === ""
                              ? "bg-[#38BDF8]" // azul cielo
                              : user.roles[0].name === "normal"
                                ? "bg-[#3B82F6]" // azul vibrante
                                : user.roles[0].name === "superintendente"
                                  ? "bg-[#60A5FA]" // azul pastel
                                  : user.roles[0].name === "prevencionista"
                                    ? "bg-[#1D4ED8]" // azul royal
                                      : user.roles[0].name === "supervisor"
                                        ? "bg-[#0EA5E9]" // azul cyan
                                        : user.roles[0].name === "inspector"
                                          ? "bg-[#3B82F6]" // azul vibrante
                                          : "bg-[#2563EB]" // azul intenso por defecto
                }`}
                              onClick={() => openRoleDrawer(user)}
                            >
                              {highlightMatch(user.roles[0].name, searchTerm)}
                              {user.roles.length > 1 &&
                                ` +${user.roles.length - 1}`}
                            </div>
                          </a>
                        </>
                      ) : (
                        <a
                          href="#"
                          className="p-4 text-white hover:shadow-lg text-xs rounded-md py-2 px-5 bg-[#AC8C7E]"
                          onClick={() => openRoleDrawer(user)}
                        >
                          No roles available
                        </a>
                      )}
                    </td>

                    <td className="p-2">
                      {user.user_grupo && user.user_grupo.nombre_grupo ? (
                        <a
                          href="#"
                          className="p-4 text-white text-xs rounded-md py-2 px-5"
                          // onClick={() => openGroupDrawer(user)}
                        >
                          <div
                            className={`py-2 px-2 rounded-md hover:shadow-lg text-center
                    ${
                      user.user_grupo.nombre_grupo ===
                      "Administración y Finanzas"
                        ? "bg-[#4F8EDC]" // azul medio
                        : user.user_grupo.nombre_grupo === "Operaciones Mineras"
                          ? "bg-[#5DADE2]" // azul claro
                          : user.user_grupo.nombre_grupo ===
                              "Seguridad y Salud Ocupacional"
                            ? "bg-[#2986CC]" // azul fuerte
                            : user.user_grupo.nombre_grupo ===
                                "Mantenimiento y Servicios"
                              ? "bg-[#6CB4EE]" // azul celeste
                              : user.user_grupo.nombre_grupo ===
                                  "Exploración Geológica"
                                ? "bg-[#3B82F6]" // azul vibrante
                                : user.user_grupo.nombre_grupo ===
                                    "Ingeniería y Proyectos"
                                  ? "bg-[#60A5FA]" // azul pastel
                                  : user.user_grupo.nombre_grupo ===
                                      "Medio Ambiente y Sustentabilidad"
                                    ? "bg-[#2563EB]" // azul intenso
                                    : user.user_grupo.nombre_grupo ===
                                        "Recursos Humanos"
                                      ? "bg-[#1E40AF]" // azul oscuro
                                      : user.user_grupo.nombre_grupo ===
                                          "Logística y Abastecimiento"
                                        ? "bg-[#38BDF8]" // azul cielo
                                        : user.user_grupo.nombre_grupo ===
                                            "Tecnología de la Información"
                                          ? "bg-[#0EA5E9]" // azul cyan
                                          : user.user_grupo.nombre_grupo ===
                                              "Relaciones Comunitarias"
                                            ? "bg-[#1D4ED8]" // azul royal
                                            : user.user_grupo.nombre_grupo ===
                                                "Comercial y Ventas"
                                              ? "bg-[#3B82F6]" // azul vibrante
                                              : user.user_grupo.nombre_grupo ===
                                                  "Planificación y Control"
                                                ? "bg-[#60A5FA]" // azul pastel
                                                : user.user_grupo
                                                      .nombre_grupo ===
                                                    "Gestión de Riesgos"
                                                  ? "bg-[#2563EB]" // azul intenso
                                                  : user.user_grupo
                                                        .nombre_grupo ===
                                                      "Control de Calidad"
                                                    ? "bg-[#1E40AF]" // azul oscuro
                                                    : user.user_grupo
                                                          .nombre_grupo ===
                                                        "Compras y Contrataciones"
                                                      ? "bg-[#38BDF8]" // azul cielo
                                                      : user.user_grupo
                                                            .nombre_grupo ===
                                                          "Investigación y Desarrollo"
                                                        ? "bg-[#0EA5E9]" // azul cyan
                                                        : user.user_grupo
                                                              .nombre_grupo ===
                                                            "Gestión de Activos"
                                                          ? "bg-[#3B82F6]" // azul vibrante
                                                          : user.user_grupo
                                                                .nombre_grupo ===
                                                              "Relaciones Institucionales"
                                                            ? "bg-[#60A5FA]" // azul pastel
                                                            : user.user_grupo
                                                                  .nombre_grupo ===
                                                                "Auditoría Interna"
                                                              ? "bg-[#2563EB]" // azul intenso
                                                              : user.user_grupo
                                                                    .nombre_grupo ===
                                                                  "Asuntos Legales"
                                                                ? "bg-[#1E40AF]" // azul oscuro
                                                                : user
                                                                      .user_grupo
                                                                      .nombre_grupo ===
                                                                    "Comunicación Corporativa"
                                                                  ? "bg-[#38BDF8]" // azul cielo
                                                                  : user
                                                                        .user_grupo
                                                                        .nombre_grupo ===
                                                                      "Responsabilidad Social Empresarial"
                                                                    ? "bg-[#0EA5E9]" // azul cyan
                                                                    : user
                                                                          .user_grupo
                                                                          .nombre_grupo ===
                                                                        "Capacitación y Desarrollo"
                                                                      ? "bg-[#3B82F6]" // azul vibrante
                                                                      : user
                                                                            .user_grupo
                                                                            .nombre_grupo ===
                                                                          "Investigación de Mercado"
                                                                        ? "bg-[#60A5FA]" // azul pastel
                                                                        : user
                                                                              .user_grupo
                                                                              .nombre_grupo ===
                                                                            "Cierre de Minas"
                                                                          ? "bg-[#2563EB]" // azul intenso
                                                                          : user
                                                                                .user_grupo
                                                                                .nombre_grupo ===
                                                                              "Sistemas de Información Geográfica"
                                                                            ? "bg-[#1E40AF]" // azul oscuro
                                                                            : user
                                                                                  .user_grupo
                                                                                  .nombre_grupo ===
                                                                                "Soporte Técnico"
                                                                              ? "bg-[#38BDF8]" // azul cielo
                                                                              : user
                                                                                    .user_grupo
                                                                                    .nombre_grupo ===
                                                                                  "Servicios Generales"
                                                                                ? "bg-[#0EA5E9]" // azul cyan
                                                                                : user
                                                                                      .user_grupo
                                                                                      .nombre_grupo ===
                                                                                    "Finanzas Corporativas"
                                                                                  ? "bg-[#3B82F6]" // azul vibrante
                                                                                  : user
                                                                                        .user_grupo
                                                                                        .nombre_grupo ===
                                                                                      "Producción"
                                                                                    ? "bg-[#60A5FA]" // azul pastel
                                                                                    : user
                                                                                          .user_grupo
                                                                                          .nombre_grupo ===
                                                                                        "Ingeniería de Procesos"
                                                                                      ? "bg-[#2563EB]" // azul intenso
                                                                                      : user
                                                                                            .user_grupo
                                                                                            .nombre_grupo ===
                                                                                          "Servicios Legales"
                                                                                        ? "bg-[#1E40AF]" // azul oscuro
                                                                                        : user
                                                                                              .user_grupo
                                                                                              .nombre_grupo ===
                                                                                            "Control Interno"
                                                                                          ? "bg-[#38BDF8]" // azul cielo
                                                                                          : user
                                                                                                .user_grupo
                                                                                                .nombre_grupo ===
                                                                                              "Inspección de Seguridad"
                                                                                            ? "bg-[#0EA5E9]" // azul cyan
                                                                                            : user
                                                                                                  .user_grupo
                                                                                                  .nombre_grupo ===
                                                                                                "Mantenimiento Preventivo"
                                                                                              ? "bg-[#3B82F6]" // azul vibrante
                                                                                              : user
                                                                                                    .user_grupo
                                                                                                    .nombre_grupo ===
                                                                                                  "Geología de Exploración"
                                                                                                ? "bg-[#60A5FA]" // azul pastel
                                                                                                : user
                                                                                                      .user_grupo
                                                                                                      .nombre_grupo ===
                                                                                                    "Desarrollo Sostenible"
                                                                                                  ? "bg-[#2563EB]" // azul intenso
                                                                                                  : "bg-[#A3A1F7]" // violeta claro por defecto
                    }`}
                          >
                            {highlightMatch(
                              user.user_grupo.nombre_grupo,
                              searchTerm,
                            )}
                          </div>
                        </a>
                      ) : (
                        <a
                          href="#"
                          className="p-4 text-black hover:shadow-lg text-xs rounded-md py-2 px-5"
                          onClick={() => openGroupDrawer(user)}
                        >
                          No group available
                        </a>
                      )}
                    </td>

                    <td className="p-2">
                      <div className="break-all whitespace-normal">
                        {highlightMatch(user.email, searchTerm)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {typeof user.ultimo_acceso === "string" &&
                      user.ultimo_acceso === "No ha accedido"
                        ? "No ha accedido"
                        : (() => {
                            // Obtener la fecha del backend
                            const fechaBackend = user.ultimo_acceso;

                            // Solución más directa: Parsear la fecha manualmente
                            // y crear los componentes de la fecha directamente
                            const [year, month, day] = fechaBackend.split("-");

                            // Crear string de fecha en español
                            const meses = [
                              "enero",
                              "febrero",
                              "marzo",
                              "abril",
                              "mayo",
                              "junio",
                              "julio",
                              "agosto",
                              "septiembre",
                              "octubre",
                              "noviembre",
                              "diciembre",
                            ];

                            // Eliminar ceros a la izquierda del día
                            const dayNumber = parseInt(day, 10);

                            // Crear fecha formateada manualmente (mes es 0-indexed en el array)
                            const formattedDate = `${meses[parseInt(month, 10) - 1]} ${dayNumber}, ${year}`;

                            return formattedDate;
                          })()}
                    </td>
                    <td
                      className={`p-2 ${hiddenRoles.includes(role) ? "hidden" : ""}`}
                    >
                      <div className="flex items-center justify-center gap-3 h-full min-h-[40px]">
                        <Tooltip text="Desactivar">
                          <button 
                            className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-200 transition-all duration-150" 
                            onClick={() => handleDeleteUser(user.id, user.names)}
                            aria-label="Desactivar usuario">
                            <FontAwesomeIcon icon={faTrashCan} size="lg" />
                          </button>
                        </Tooltip>
                        <Tooltip text="Editar">
                          <button
                            className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-200 transition-all duration-150"
                            onClick={() =>
                              router.push(`/dashboard/update_users/${user.id}`)
                            }
                            aria-label="Editar usuario"
                          >
                            <FontAwesomeIcon icon={faPenToSquare} size="lg" />
                          </button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <RoleDrawer
              isOpen={isRoleDrawerOpen}
              onClose={closeRoleDrawer}
              user={selectedUser}
              roles={selectedUserRoles}
              onUpdateRoles={handleUpdateRoles}
            />

            <hr className="my-4 mt-10 border-b border-[#5C7891] mb-7" />
            <div className="flex items-center justify-between mb-4">
              <div>
                Mostrar
                <select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="p-1 ml-2 mr-2 border border-[#5C7891] rounded"
                  aria-label="Seleccionar la cantidad de filas a mostrar"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                </select>
                filas por página
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="flex gap-1 items-center">
                  <button
                    className={`px-3 py-1 rounded-lg bg-[#7fa1c6] text-white shadow transition-all duration-200 hover:bg-[#5c7891] focus:outline-none font-zen-kaku ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={() =>
                      currentPage > 1 && setCurrentPage(currentPage - 1)
                    }
                    disabled={currentPage === 1}
                    aria-label="Mostrar página anterior"
                  >
                    &lt;
                  </button>
                  <span className="text-sm font-semibold text-gray-700 ml-2">
                    Página
                  </span>
                  <span className="inline-block px-2 py-1 rounded bg-[#e3f1fa] text-[#46607a] font-bold shadow-sm mx-1">
                    {currentPage}
                  </span>
                  <span className="text-sm font-semibold text-gray-700">
                    de
                  </span>
                  <span className="inline-block px-2 py-1 rounded bg-gray-100 text-[#7fa1c6] font-bold shadow-sm mx-1">
                    {totalPages}
                  </span>
                  <button
                    className={`px-3 py-1 rounded-lg bg-[#7fa1c6] text-white shadow transition-all duration-200 hover:bg-[#5c7891] focus:outline-none font-zen-kaku ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={() =>
                      currentPage < totalPages &&
                      setCurrentPage(currentPage + 1)
                    }
                    disabled={currentPage === totalPages}
                    aria-label="Mostrar página siguiente"
                  >
                    &gt;
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export default UsersDashboardComponent;
