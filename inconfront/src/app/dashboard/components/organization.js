"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUpFromBracket,
  faArrowDown,
  faTrashCan,
  faPenToSquare,
  faSearch,
  faHandPaper,
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Modalorganization from "./new_organization_modal";
import Drawer from "./new_user_externo";
import { SlidersHorizontal, Search } from "lucide-react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import "../style/media_query.css";
import { useRouter } from "next/navigation";
import Tooltip from "@/app/components/tooltip";
import { getPrimaryRole } from "@/app/utils/roleUtils";
import toast from "react-hot-toast";
import { deleteOrganization } from "@/app/services/organizacion";

import Loader from "@/app/dashboard/components/loader";

function highlightMatch(text, searchTerm) {
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

function OrganizationDashboardComponent({ organizations }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [orderBy, setOrderBy] = useState("");
  const [isNewUserOpen, setIsNewUserOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const [isOnline, setIsOnline] = useState(true); // Estado para verificar si el usuario está en línea u offline

  const router = useRouter();

  useEffect(() => {
    console.log(isOnline);
    function handleOnlineStatus() {
      setIsOnline(navigator.onLine);
    }

    return () => {
      window.removeEventListener("online", handleOnlineStatus);
      window.removeEventListener("offline", handleOnlineStatus);
    };
  }, [isOnline]);

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

  const handleDeleteOrganization = async (orgId, orgName) => {
    if (
      window.confirm(
        `¿Estás seguro de que deseas eliminar la organización ${orgName}? Esta acción no se puede deshacer.`,
      )
    ) {
      try {
        const response = await deleteOrganization(orgId);
        if (response?.statusCode === 200 || response?.status === "success") {
          toast.success(
            response?.message || "Organización eliminada correctamente",
          );
          window.location.reload();
        } else {
          toast.error(
            response?.message || "Error al eliminar la organización",
          );
        }
      } catch (error) {
        console.error("Error al eliminar organización:", error);
        toast.error("Error al eliminar la organización");
      }
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleOrderBy = (event) => {
    setOrderBy(event.target.value);
  };

  const handleNewUser = () => {
    // Redirigir directamente a crear organización interna
    router.push('/dashboard/organization_interno');
  };

  const filteredOrganizations = organizations
    ? organizations.filter((organization) => {
        return (
          organization.nombre
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          organization.direccion
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          organization.telefono
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          organization.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          organization.sitio_web
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          organization.descripcion
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        );
      })
    : [];

  // Lunixia: Fix avanzado para ordenamiento de campos anidados y fechas descendentes.
  // Lunixia: Todos los campos string ahora se ordenan case-insensitive (alfabético real)
  const orderByAccessors = {
    nombre: (o) => (o.nombre || "").toLowerCase(),
    rut: (o) => (o.rut || "").toLowerCase(),
    representante_legal: (o) => (o.representante_legal || "").toLowerCase(),
    direccion: (o) => (o.direccion || "").toLowerCase(),
    telefono: (o) => (o.telefono || "").toLowerCase(),
    tipo_organizacion: (o) => (o.tipo_organizacion || "").toLowerCase(),
    ultimo_acceso: (o) => {
      if (!o.ultimo_acceso || o.ultimo_acceso === "No ha accedido") return null;
      return new Date(o.ultimo_acceso);
    },
  };

  const sortedOrganizations =
    !orderBy || orderBy === "placeholder"
      ? filteredOrganizations
      : filteredOrganizations.sort((a, b) => {
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

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleExport = async () => {
    console.log("pree");
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Organizaciones");

    // Definir las cabeceras
    worksheet.columns = [
      { header: "Nombre oficial de la empresa", key: "nombreoficialdelaempresa" },
      { header: "Rut de la empresa", key: "rutdelaempresa" },
      { header: "Representante legal", key: "representantelegal" },
      { header: "Dirección", key: "direccion" },
      { header: "Celular", key: "telefono" },
      { header: "Tipo de organización", key: "tipoOrganizacion" },
      { header: "Último acceso", key: "ultimoAcceso" },
    ];

    // Agregar los datos
    organizations.forEach((org) => {
      worksheet.addRow({
        nombre: org.nombre || "",
        rut: org.rut || "",
        representante: org.representante_legal || "",
        direccion: org.direccion || "",
        telefono: org.telefono || "",
        tipo: org.tipo_organizacion || "",
        ultimoAcceso: org.ultimo_acceso
          ? format(new Date(org.ultimo_acceso), "MMMM d, yyyy", { locale: es })
          : "",
      });
    });

    // Convertir el rango en una tabla
    worksheet.addTable({
      name: "Organizaciones",
      ref: "A1",
      headerRow: true,
      totalsRow: false,
      style: {
        theme: "TableStyleMedium2",
        showRowStripes: true,
      },
      columns: [
        { name: "Nombre oficial de la empresa", filterButton: true },
        { name: "Rut de la empresa", filterButton: true },
        { name: "Representante legal", filterButton: true },
        { name: "Dirección", filterButton: true },
        { name: "Celular", filterButton: true },
        { name: "Tipo de organización", filterButton: true },
        { name: "Último acceso", filterButton: true },
      ],
      rows: organizations.map((org) => [
        org.nombre || "",
        org.rut || "",
        org.representante_legal || "",
        org.direccion || "",
        org.telefono || "",
        org.tipo_organizacion || "",
        org.ultimo_acceso
          ? format(new Date(org.ultimo_acceso), "MMMM d, yyyy", { locale: es })
          : "",
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
    saveAs(new Blob([buffer]), "organizaciones.xlsx");
  };

  // paginacion

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedOrganizations.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(sortedOrganizations.length / itemsPerPage);

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(Number(event.target.value));
    setCurrentPage(1); // Reiniciar a la primera página cuando se cambie el número de filas por página
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
      {isNewUserOpen && <Modalorganization isOpen={setIsNewUserOpen} />}
      <div className="flex flex-col mx-auto h-full bg-white max-w-full custom-class-user">
        <div className="mt-20"></div>
        <div className="flex flex-col gap-4 mb-8 select-none custom-label-user">
          <h1 className="mx-auto text-3xl font-extrabold text-gray-800 select-none font-zen-kaku text-center">
            | Vista general de Organizaciones |
          </h1>
          <div className="flex items-center justify-between gap-4 font-semibold font-zen-kaku">
            {/* Izquierda: Buscador y filtro */}
            <div className="flex flex-wrap items-center gap-4 p-4 custom-user-search">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="p-2 pl-10 rounded-lg group outline-none shadow-lg bg-gray-100 hover:bg-white border border-black hover:border-black focus:border-black bg-gray-100 focus:bg-white transition-all ease-linear duration-150"
                  onChange={handleSearch}
                  style={{ paddingLeft: "2.5rem" }}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search
                    size={20}
                    className="text-black transition-all ease-linear duration-150"
                  />
                </div>
              </div>
              <div>
                <select
                  id="filtroSelect"
                  name="filtroSelect"
                  className={`p-2 px-8 py-3 border border-black transition-all ease-linear duration-150 shadow-lg rounded-lg cursor-pointer custom-select-user bg-gray-100 hover:bg-white hover:border-black focus:border-black`}
                  defaultValue="placeholder"
                  onChange={handleOrderBy}
                  onClick={handleSelectClick}
                  onBlur={handleSelectBlur}
                >
                  <option value="placeholder" disabled>
                    Ordenar por:
                  </option>
                  <option value="nombre">Nombre oficial de la empresa</option>
                  <option value="rut">Rut de la empresa</option>
                  <option value="representante_legal">
                    Representante legal
                  </option>
                  <option value="direccion">Dirección</option>
                  <option value="telefono">Celular</option>

                  <option value="ultimo_acceso">Último acceso</option>
                </select>
              </div>
            </div>
            {/* Derecha: Botones de acción */}
            <div className="flex flex-auto gap-4 justify-end custom-button-user pr-4">
              {/* Botón que no hace nada.
              <button
                className="flex items-center justify-center w-10 h-10 rounded-full border border-black bg-gradient-to-br from-white via-gray-100 to-gray-200 shadow-2xl mx-1 transition-all duration-200 ease-in-out hover:from-teal-100 hover:to-white hover:shadow-[0_8px_24px_rgba(0,0,0,0.18)] hover:scale-105 active:scale-95 focus:outline-none focus:ring-teal-400"
                aria-label="Actualizar organización"
                title="Actualizar organización"
                type="button"
              >
                <FontAwesomeIcon
                  icon={faArrowDown}
                  size="lg"
                  className="text-black"
                />
              </button>
              */}
              <button
                className="flex items-center justify-center w-10 h-10 rounded-full border border-black bg-gradient-to-br from-white via-gray-100 to-gray-200 shadow-2xl mx-1 transition-all duration-200 ease-in-out hover:from-teal-100 hover:to-white hover:shadow-[0_8px_24px_rgba(0,0,0,0.18)] hover:scale-105 active:scale-95 focus:outline-none focus:ring-teal-400"
                onClick={handleExport}
                aria-label="Descargar organización"
                title="Descargar organización"
                type="button"
              >
                <FontAwesomeIcon
                  icon={faArrowUpFromBracket}
                  size="lg"
                  className="text-black"
                />
              </button>
              <button
                className={`flex items-center justify-center w-10 h-10 rounded-full border border-black bg-gradient-to-br from-white via-gray-100 to-gray-200 shadow-2xl mx-1 transition-all duration-200 ease-in-out hover:from-teal-100 hover:to-white hover:shadow-[0_8px_24px_rgba(0,0,0,0.18)] hover:scale-105 active:scale-95 focus:outline-none focus:ring-teal-400 ${hiddenRoles.includes(role) ? "hidden" : ""}`}
                onClick={handleNewUser}
                aria-label="Agregar nueva organización"
                title="Agregar nueva organización"
                type="button"
              >
                <span className="text-2xl font-bold text-black">+</span>
              </button>
            </div>
          </div>
        </div>
        {/* Desktop Table View */}
        <div className="hidden tablet:block overflow-x-auto">
          <div className="table p-4 select-none font-zen-kaku overflow-x-auto w-full min-w-full">
            <table className="table-auto w-full border-separate border-spacing-0 overflow-x-auto rounded-t-xl shadow-sm">
              <thead>
                <tr className="bg-[#5C7891] text-gray-100 rounded-t-xl">
                  <th className="py-3 px-2 font-semibold rounded-tl-xl"></th>
                  <th className="py-3 px-2 text-xs font-semibold tracking-wide text-gray-100 text-left">
                    <div className="flex items-center">
                      Nombre oficial de la empresa
                    </div>
                  </th>
                  <th className="py-3 px-2 text-xs font-semibold tracking-wide text-gray-100 text-left">
                    <div className="flex items-center">Rut de la empresa</div>
                  </th>
                  <th className="py-3 px-2 text-xs font-semibold tracking-wide text-gray-100 text-left">
                    <div className="flex items-center">Representante legal</div>
                  </th>
                  <th className="py-3 px-2 text-xs font-semibold tracking-wide text-gray-100 text-left">
                    <div className="flex items-center">Dirección</div>
                  </th>
                  <th className="py-3 px-2 text-xs font-semibold tracking-wide text-gray-100 text-left">
                    <div className="flex  justify-left font-bold select-none font-zen-kaku">
                      Celular
                    </div>
                  </th>

                  <th className="py-3 px-2 text-xs font-semibold tracking-wide text-gray-100 text-left">
                    <div className="flex items-center">Último acceso</div>
                  </th>

                    <th className="py-3 px-2 text-xs font-semibold tracking-wide text-gray-100 text-left"> 
                    <div className="flex items-center">Acciones</div>
                  </th> 
                  <th className="p-4 cursor-pointer text-sm font-thin text-black opacity-50">
                    <div className="flex items-center justify-left font-bold select-none font-zen-kaku"></div>
                  </th>
                </tr>
              </thead>
              <tbody className="select-none">
                {currentItems.map((organization, index) => (
                  // Renderizar filas de la tabla según el resultado del filtrado
                  <tr
                    key={index}
                    className="bg-white text-left text-sm text-gray-600 border-b font-zen-kaku"
                  >
                    <td className="p-4 flex justify-center">
                      {/* <input type="checkbox" className="h-5 w-5" /> */}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center font-zen-kaku">
                        <div className="h-9 w-12 rounded-full overflow-hidden mr-2">
                          {isOnline && (
                            <Image
                              src={
                                organization.documents[0]?.link || "/hola.png"
                              }
                              alt="Logo"
                              width={100}
                              height={100}
                              className="object-cover h-full w-full"
                              style={{ filter: "brightness(50%)" }}
                            />
                          )}
                        </div>
                        {highlightMatch(organization.nombre, searchTerm)}
                      </div>
                    </td>
                    <td className="p-4">
                      {highlightMatch(organization.rut, searchTerm)}
                    </td>
                    <td className="p-4">
                      {highlightMatch(
                        organization.representante_legal,
                        searchTerm,
                      )}
                    </td>
                    <td className="p-4">
                      {highlightMatch(organization.direccion, searchTerm)}
                    </td>
                    <td className="p-4">
                      {highlightMatch(organization.telefono, searchTerm)}
                    </td>
                    <td className="p-4">
                      {format(
                        organization?.ultimo_acceso || "2024-01-01",
                        "MMMM d, yyyy",
                        { locale: es },
                      )}
                    </td>
                    <td className="flex items-center justify-center p-2 gap-3">
                      {[
                        "planner",
                        "admin",
                        "supervisor",
                        "superintendente",
                        "superadmin",
                      ].includes(role) && (
                        <Tooltip text="Editar">
                          <button
                            onClick={() =>
                              router.push(
                                `/dashboard/updateorganizacion/${organization.id}`,
                              )
                            }
                            aria-label="Editar organización"
                          >
                            <FontAwesomeIcon icon={faPenToSquare} size="lg" />
                          </button>
                        </Tooltip>
                      )}
                      {["admin", "superadmin"].includes(role) && (
                        <Tooltip text="Eliminar">
                          <button
                            onClick={() =>
                              handleDeleteOrganization(
                                organization.id,
                                organization.nombre,
                              )
                            }
                            aria-label="Eliminar organización"
                            className="text-red-600 hover:text-red-700"
                          >
                            <FontAwesomeIcon icon={faTrashCan} size="lg" />
                          </button>
                        </Tooltip>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="block tablet:hidden">
          <div className="space-y-4 p-4">
            {currentItems.map((organization, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 font-zen-kaku"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full overflow-hidden mr-3 flex-shrink-0">
                      {isOnline && (
                        <Image
                          src={organization.documents[0]?.link || "/hola.png"}
                          alt="Logo"
                          width={48}
                          height={48}
                          className="object-cover h-full w-full"
                          style={{ filter: "brightness(50%)" }}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {highlightMatch(organization.nombre, searchTerm)}
                      </h3>
                      <p className="text-xs text-gray-500">
                        RUT: {highlightMatch(organization.rut, searchTerm)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {[
                      "planner",
                      "admin",
                      "supervisor",
                      "superintendente",
                      "superadmin",
                    ].includes(role) && (
                      <button
                        onClick={() =>
                          router.push(
                            `/dashboard/updateorganizacion/${organization.id}`,
                          )
                        }
                        className="p-2 text-gray-400 hover:text-gray-600"
                        aria-label="Editar organización"
                      >
                        <FontAwesomeIcon icon={faPenToSquare} size="sm" />
                      </button>
                    )}
                    {["admin", "superadmin"].includes(role) && (
                      <button
                        onClick={() =>
                          handleDeleteOrganization(
                            organization.id,
                            organization.nombre,
                          )
                        }
                        className="p-2 text-red-600 hover:text-red-700"
                        aria-label="Eliminar organización"
                      >
                        <FontAwesomeIcon icon={faTrashCan} size="sm" />
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2 text-xs text-gray-600">
                  <div>
                    <span className="font-medium text-gray-700">Representante:</span>{" "}
                    {highlightMatch(organization.representante_legal, searchTerm)}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Dirección:</span>{" "}
                    {highlightMatch(organization.direccion, searchTerm)}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Celular:</span>{" "}
                    {highlightMatch(organization.telefono, searchTerm)}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Último acceso:</span>{" "}
                    {format(
                      organization?.ultimo_acceso || "2024-01-01",
                      "MMMM d, yyyy",
                      { locale: es },
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination - Common for both views */}
        <hr className="my-4 border-b border-[#5C7891] mt-10 mb-7" />
        <div className="flex justify-between items-center mb-4">
          <div>
            Mostrar
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="p-1 ml-2 mr-2 border border-[#5C7891] rounded"
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
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default OrganizationDashboardComponent;
