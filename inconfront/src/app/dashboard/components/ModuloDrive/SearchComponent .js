import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolder, faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import { searchFoldersAndDocuments } from "@/app/services/my_document"; // Ajusta la ruta según tu proyecto
import { getFileIcon } from "@/app/dashboard/components/validForm/fileIcons"; // Asegúrate de ajustar la ruta según tu estructura de proyecto

const SearchComponent = ({ handleFolderClick, setSelectedSection }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [folders, setFolders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false); // Maneja el estado de enfoque
  const [hasSearched, setHasSearched] = useState(false); // Estado para controlar si ya se ha hecho una búsqueda
  const searchContainerRef = useRef(null); // Referencia al contenedor del componente

  // Función de búsqueda con debounce (opcional)
  const handleSearch = (event) => {
    const term = event.target.value;
    setSearchTerm(term);
  };

  // Limpiar el término de búsqueda
  const clearSearch = () => {
    setSearchTerm("");
    setFolders([]);
    setHasSearched(false); // Reiniciar el estado de búsqueda
  };

  // Función para manejar el clic en un resultado
  const handleClick = (item) => {
    let path;
    if (item.nombre_carpeta) {
      // Es una carpeta
      path = item.id_folder; // Utilizamos el id_folder de la carpeta
    } else {
      // Es un documento
      path = item.folderId; // Utilizamos el id_folder del documento
    }

    // Llamamos a la función handleFolderClick pasando el path
    handleFolderClick(path);

    // Cerrar el menú de búsqueda después de hacer clic
    setIsFocused(false);

    // Limpiar la variable selectedSection
    setSelectedSection(null);
  };

  // Llama al servicio cuando el usuario deja de escribir
  useEffect(() => {
    if (searchTerm === "") {
      setFolders([]); // Limpia los resultados si no hay término de búsqueda
      setHasSearched(false); // Reiniciar el estado de búsqueda
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      setHasSearched(true); // Indicar que se ha realizado una búsqueda
      try {
        const result = await searchFoldersAndDocuments(searchTerm);
        setFolders(result); // Actualiza las carpetas encontradas
      } catch (error) {
        console.error("Error al buscar:", error);
      } finally {
        setIsLoading(false); // La carga ha terminado
      }
    }, 500); // 500 ms de debounce

    return () => clearTimeout(timeoutId); // Limpia el timeout al cambiar el valor
  }, [searchTerm]);

  // Manejar el clic fuera del componente para ocultar las opciones
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchContainerRef]);

  return (
    <div
      ref={searchContainerRef}
      className="flex flex-col md:flex-row items-start md:items-center mb-3"
    >
      <div className="relative flex-grow md:mb-0 custom-doc">
        <input
          type="text"
          placeholder="Buscar en documentos"
          className="pl-10 pr-10 border border-custom-blue p-2 rounded-lg w-full custom-doc2 outline-none focus:border-custom-blue"
          onChange={handleSearch}
          value={searchTerm}
          onFocus={() => setIsFocused(true)} // Manejar el enfoque
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <FontAwesomeIcon icon={faSearch} className="text-custom-blue" />
        </div>

        {/* Botón "X" para limpiar el texto */}
        {searchTerm && (
          <div
            className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
            onClick={clearSearch}
          >
            <FontAwesomeIcon icon={faTimes} className="text-custom-blue" />
          </div>
        )}

        {/* Contenedor de resultados, solo mostrar si hay búsqueda */}
        {isFocused && searchTerm && (
          <div className="absolute top-full mt-1 w-full bg-white shadow-lg rounded-lg z-50 max-h-60 overflow-hidden">
            {isLoading ? (
              <p className="p-4 text-center text-gray-600">Cargando...</p>
            ) : (
              <>
                {folders.length > 0 ? (
                  <div className="max-h-48 overflow-y-auto">
                    {folders.map((item) => (
                      <div
                        key={item.id_folder || item.id}
                        className="p-4 flex items-center justify-between hover:bg-gray-100 hover:border-l-4 hover:border-green-200 cursor-pointer border-l-4 border-transparent"
                        onClick={() => handleClick(item)} // Llamar a handleClick al hacer clic
                      >
                        {/* Icono de carpeta o documento */}
                        <div className="flex items-center space-x-4">
                          {item.nombre_carpeta ? (
                            <FontAwesomeIcon
                              icon={faFolder}
                              className="text-custom-blue"
                            />
                          ) : (
                            getFileIcon(item.fileExtension) // Usar el ícono según el formato del archivo
                          )}
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {item.nombre_carpeta || item.filenames}
                            </span>
                            <span className="text-sm text-gray-500">
                              {item.folder_usuario
                                ? `${item.folder_usuario.names || ""} ${item.folder_usuario.apellido_p || ""} ${item.folder_usuario.apellido_m || ""}`.trim() ||
                                  "Automatica"
                                : item.user?.nombre_completo || "Automatica"}
                            </span>
                          </div>
                        </div>

                        {/* Fecha */}
                        <div className="text-sm text-gray-500">
                          {item.updatedAt
                            ? new Date(item.updatedAt).toLocaleDateString(
                                "es-ES",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                },
                              )
                            : "Sin fecha"}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  hasSearched &&
                  !isLoading && (
                    <p className="p-4 text-center text-red-600">
                      No se encontraron resultados.
                    </p>
                  )
                )}

                {/* Opciones en la parte inferior, estáticas */}
                <div className="p-2 flex justify-between items-center bg-gray-50">
                  <a href="#" className="text-blue-600 text-sm">
                    Búsqueda avanzada
                  </a>
                  <a href="#" className="text-blue-600 text-sm">
                    Todos los resultados
                  </a>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchComponent;
