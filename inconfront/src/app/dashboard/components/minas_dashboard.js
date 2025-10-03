"use client";

import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUpFromBracket,
  faArrowDown,
  faTrashCan,
  faPenToSquare,
  faSearch,
  faPlus,
  faPencilAlt,
} from "@fortawesome/free-solid-svg-icons";
import { format } from "date-fns";
import { es } from "date-fns/locale";
const { useRouter } = require("next/navigation");

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { useState } from "react";
import ConfirmDialog from "../../components/confirm_dialog";
import { deleteMina } from "@/app/services/minas";
import "../style/media_query.css";
import { Search } from "lucide-react";
import Tooltip from "../../components/tooltip";
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

function MinasComponent({ minas }) {
  console.log(minas);
  const router = useRouter();
  const userStore = useSelector((state) => state.user);
  const saludo = `¡Hola ${userStore.user?.names || "Test"}! 👋`;
  const role = getPrimaryRole(userStore.user);

  const [searchTerm, setSearchTerm] = useState("");
  const [orderBy, setOrderBy] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  // Mantener una lista local de minas para reflejar eliminaciones sin recargar
  const [minesList, setMinesList] = useState(minas || []);

  const filteredMines = minesList?.filter(
    (mina) =>
      mina?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mina?.direccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mina?.giro_mina.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mina?.rut.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Fix avanzado para ordenamiento de campos anidados y fechas descendentes.
  const orderByAccessors = {
    // Lunixia: Ahora 'name' y 'User_mine.names' son case-insensitive para orden alfabético real
    name: (m) => (m.name || "").toLowerCase(),
    rut: (m) => m.rut || "",
    direccion: (m) => m.direccion || "",
    "User_mine.names": (m) => (m.User_mine?.names || "").toLowerCase(),
    "mine_organizacion.nombre": (m) =>
      (m.mine_organizacion?.nombre || "").toLowerCase(),
    updatedAt: (m) => {
      if (!m.updatedAt) return null;
      return new Date(m.updatedAt);
    },
  };

  const sortedMines =
    !orderBy || orderBy === "placeholder"
      ? filteredMines
      : filteredMines.sort((a, b) => {
          const getValue = orderByAccessors[orderBy];
          if (!getValue) return 0;
          const valA = getValue(a);
          const valB = getValue(b);

          if (orderBy === "updatedAt") {
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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedMines.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedMines.length / itemsPerPage);

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(Number(event.target.value));
    setCurrentPage(1); // Reiniciar a la primera página cuando se cambie el número de filas por página
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleOrderBy = (event) => {
    setOrderBy(event.target.value);
  };

  const onClickNewMina = () => {
    router.push("/dashboard/minas/create");
  };

  const handleExport = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Obras");

    // Definir las cabeceras
    worksheet.columns = [
      { header: "Nombre de la obra", key: "name" },
      { header: "Rut Unidad Técnica", key: "rut" },
      { header: "Usuario", key: "user" },
      { header: "Dirección", key: "direccion" },
      { header: "Organización", key: "organizacion" },
      { header: "Último acceso", key: "ultimoAcceso" },
    ];

    // Agregar los datos
    minesList.forEach((mina) => {
      worksheet.addRow({
        name: mina.name || "",
        rut: mina.rut || "",
        user: mina.User_mine?.names || "",
        direccion: mina.direccion || "",
        organizacion: mina.mine_organizacion?.nombre || "",
        ultimoAcceso: mina.updatedAt
          ? format(new Date(mina.updatedAt), "MMMM d, yyyy", { locale: es })
          : "",
      });
    });

    // Convertir el rango en una tabla
    worksheet.addTable({
      name: "Obras",
      ref: "A1",
      headerRow: true,
      totalsRow: false,
      style: {
        theme: "TableStyleMedium2",
        showRowStripes: true,
      },
      columns: [
        { name: "Nombre de la obra", filterButton: true },
        { name: "Rut Unidad Técnica", filterButton: true },
        { name: "Usuario", filterButton: true },
        { name: "Dirección", filterButton: true },
        { name: "Organización", filterButton: true },
        { name: "Último acceso", filterButton: true },
      ],
      rows: minesList.map((mina) => [
        mina.name || "",
        mina.rut || "",
        mina.User_mine?.names || "",
        mina.direccion || "",
        mina.mine_organizacion?.nombre || "",
        mina.updatedAt
          ? format(new Date(mina.updatedAt), "MMMM d, yyyy", { locale: es })
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
    saveAs(new Blob([buffer]), "obras.xlsx");
  };

  const hiddenRoles = ["ITO", "planner", "superintendente", "inspector"];

  const [isClicked, setIsClicked] = useState(false); // Estado para manejar el clic

  const handleSelectClick = () => {
    setIsClicked(true); // Cambia el estado a true cuando se hace clic
  };

  const handleSelectBlur = () => {
    setIsClicked(false); // Cambia el estado a false cuando se pierde el foco
  };

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [minaToDelete, setMinaToDelete] = useState(null);

  const askDelete = (mina) => {
    setMinaToDelete(mina);
    setConfirmOpen(true);
  };

  const onAcceptDelete = async () => {
    if (!minaToDelete) return;
    try {
      await deleteMina(minaToDelete.id);
      // Refrescar lista local: eliminar del estado
      setMinesList((prev) => prev.filter((m) => m.id !== minaToDelete.id));
      setMinaToDelete(null);
      setConfirmOpen(false);
      // Opcional: router.refresh si usamos fetch server-side
      // router.refresh();
    } catch (e) {
      console.error(e);
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <div className="flex flex-col mx-auto h-full bg-white max-w-full custom-class-user">
        <div className="mt-20"></div>
        {/* <div className="text-2xl font-bold text-gray-800 mb-4 ml-4 font-zen-kaku select-none">{saludo}</div> */}
        <div className="flex flex-col gap-4 mb-8 select-none custom-label-user">
          <h1 className="mx-auto text-3xl font-extrabold text-gray-800 select-none font-zen-kaku text-center">
            | Gestión de Obras |
          </h1>
        </div>
        <div className="flex items-center justify-between gap-4 mb-8 font-semibold font-zen-kaku">
          {/* Izquierda: Buscador y filtro */}
          <div className="flex flex-wrap items-center gap-4 p-4 custom-user-search">
            <div className="relative group">
              <input
                type="text"
                placeholder="Buscar..."
                aria-label="Campo de búsqueda de obras"
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
              aria-label="Ordenar obras por:"
                onChange={handleOrderBy}
                onClick={handleSelectClick}
                onBlur={handleSelectBlur}
              >
                <option value="placeholder" disabled>
                  Ordenar por:
                </option>
                <option value="name">Nombre</option>
                <option value="rut">Rut Unidad Técnica</option>
                <option value="user">Usuario</option>
                <option value="direccion">Dirección</option>
                <option value="organizacion">Organización</option>
                <option value="ultimoAccesso">Último acceso</option>
              </select>
            </div>
          </div>
          <div className="flex flex-auto gap-4 justify-end custom-button-user pr-8">
            {/* Botón que no hace nada
            <button
              className={`flex items-center justify-center w-10 h-10 rounded-full border border-black bg-gradient-to-br from-white via-gray-100 to-gray-200 shadow-2xl mx-1 transition-all duration-200 ease-in-out hover:from-teal-100 hover:to-white hover:shadow-[0_8px_24px_rgba(0,0,0,0.18)] hover:scale-105 active:scale-95 focus:outline-none focus:ring-[#5c7891] `}
              aria-label="Agregar cualquier cosa"
              title="Agregar cualquier cosa"
              type="button"
            >
              <FontAwesomeIcon
                icon={faArrowDown}
                size="lg"
                className="text-black"
              />
            </button>
            */}
            {/* Botón: Descargar minas */}
            <button
              className={`flex items-center justify-center w-10 h-10 rounded-full border border-black bg-gradient-to-br from-white via-gray-100 to-gray-200 shadow-2xl mx-1 transition-all duration-200 ease-in-out hover:from-teal-100 hover:to-white hover:shadow-[0_8px_24px_rgba(0,0,0,0.18)] hover:scale-105 active:scale-95 focus:outline-none focus:ring-[#5c7891] `}
              onClick={handleExport}
              aria-label="Descargar obras"
              title="Descargar obras"
              type="button"
            >
              <FontAwesomeIcon
                icon={faArrowUpFromBracket}
                size="lg"
                className="text-black"
              />
            </button>
            {/* Botón: Nueva mina */}
            <button
              className={`flex items-center justify-center w-10 h-10 bg-white rounded-full border border-black hover:bg-gray-200 transition-all duration-150 ease-linear shadow-md ${hiddenRoles.includes(role) ? "hidden" : ""}`}
              onClick={onClickNewMina}
              aria-label="Agregar nueva obra"
              title="Agregar nueva obra"
              type="button"
            >
              <FontAwesomeIcon icon={faPlus} size="lg" className="text-black" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <div className="table p-4 select-none font-zen-kaku overflow-x-auto w-full min-w-full">
            <table className="table-auto w-full border-separate border-spacing-0 overflow-x-auto rounded-t-xl shadow-sm">
              <thead>
                <tr className="bg-[#5C7891] text-gray-100 rounded-t-xl">
                  <th className="py-3 px-2 text-xs font-semibold tracking-wide text-gray-100 text-left rounded-tl-xl">
                    <div className="flex items-center">Nombre de la obra</div>
                  </th>
                  <th className="py-3 px-2 text-xs font-semibold tracking-wide text-gray-100 text-left">
                    <div className="flex items-center">Rut Unidad Técnica</div>
                  </th>
                  <th className="py-3 px-2 text-xs font-semibold tracking-wide text-gray-100 text-left">
                    <div className="flex items-center">Usuario</div>
                  </th>
                  <th className="py-3 px-2 text-xs font-semibold tracking-wide text-gray-100 text-left">
                    <div className="flex items-center">Dirección</div>
                  </th>
                  <th className="py-3 px-2 text-xs font-semibold tracking-wide text-gray-100 text-left">
                    <div className="flex items-center">Organización</div>
                  </th>
                  <th className="py-3 px-2 text-xs font-semibold tracking-wide text-gray-100 text-left">
                    <div className="flex items-center">Último acceso</div>
                  </th>
                  <th className="py-3 px-2 text-xs font-semibold tracking-wide text-gray-100 text-right rounded-tr-xl">
                    <div className="flex items-center justify-end">Acciones</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentItems && currentItems.length > 0 ? (
                  currentItems.map((mina, index) => (
                    <tr
                      key={mina.id}
                      className={`bg-white hover:bg-gray-50 ${
                        index === currentItems.length - 1 ? "rounded-b-xl" : ""
                      }`}
                    >
                      <td className="py-3 px-2 text-sm text-gray-700">
                        {mina.name || "N/A"}
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-700">
                        {mina.rut || "N/A"}
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-700">
                        {mina.User_mine?.names || "N/A"}
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-700">
                        {mina.direccion || "N/A"}
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-700">
                        {mina.mine_organizacion?.nombre || "N/A"}
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-700">
                        {mina.updatedAt
                          ? format(new Date(mina.updatedAt), "MMMM d, yyyy", {
                              locale: es,
                            })
                          : "N/A"}
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-700 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => router.push(`/dashboard/update_mina/${mina.id}`)}
                            className="text-gray-600 hover:text-gray-900"
                            title="Editar obra"
                            aria-label="Editar obra"
                          >
                            <FontAwesomeIcon icon={faPencilAlt} />
                          </button>
                          <button
                            onClick={() => askDelete(mina)}
                            className={`text-red-600 hover:text-red-800 ${hiddenRoles.includes(role) ? "hidden" : ""}`}
                            title="Eliminar obra"
                            aria-label="Eliminar obra"
                          >
                            <FontAwesomeIcon icon={faTrashCan} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      No se encontraron obras
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        accept={onAcceptDelete}
        acceptLabel="Eliminar"
        title="Confirmar eliminación"
        description={minaToDelete ? `¿Eliminar la obra "${minaToDelete.name}"?` : "¿Eliminar la obra?"}
      />
    </>
  );
}

export default MinasComponent;
