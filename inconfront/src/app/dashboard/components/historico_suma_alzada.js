"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Select from "react-select";
import "../style/external_user.css";
import "../style/datepicker_new.css";
import { useSelector } from "react-redux";

import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import es from "date-fns/locale/es";
registerLocale("es", es);
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Button } from "primereact/button";
import "primereact/resources/themes/saga-blue/theme.css"; //tema
import "primereact/resources/primereact.min.css"; //core css
import "primeicons/primeicons.css"; //iconos
import "../style/custom_confirmation.css";
import {
  Crown,
  List,
  Calendar,
  User,
  Ticket,
  Loader,
  Cylinder,
  ChevronDown,
  ChevronRight,
  BadgeHelp,
  RefreshCw,
} from "lucide-react";
import HistoricoTreesuma from "@/app/dashboard/components/tree_historico_suma";
import {
  getPartidasByProjectStd,
  getPartidasByProjectStdwithHistorico,
} from "@/app/services/project";
import toast from "react-hot-toast";
import Tooltip from "../../components/tooltip";
import { getproyectoYtareas } from "@/app/services/chart_service";
import Hidebyrol from "./hiddenroles";
import { FileUp, SaveAll, Expand } from "lucide-react";
import { BiCollapse } from "react-icons/bi";
import ReactDOM from "react-dom";

import "react-datepicker/dist/react-datepicker.css";

const HistoricoPartidasuma = ({ partidas, projectId }) => {
  const [autoIncremento, setAutoIncremento] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [step, setStep] = useState(1);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [nombreProyecto, setNombreProyecto] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [partidas2, setpartidas] = useState([]);

  const userStore = useSelector((state) => state.user);
  const saludo = userStore.user ? `${userStore.user.names}` : "";

  const treesumaRef = useRef(null);

  const [expandButtonText, setExpandButtonText] = useState(
    "Expandir todas las partidas",
  );

  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleDateChange = (date) => {
    setSelectedDate(date);
    // Actualiza cualquier otra lógica necesaria
  };

  const handleGuardarHistorico = () => {
    if (treesumaRef.current) {
      treesumaRef.current.handleInsertAllItemsClick(); // Llamada a la función de Treesuma
    }
  };

  const handleExpandirPartidas = () => {
    if (treesumaRef.current) {
      treesumaRef.current.handleExpandAllClick(); // Llamada a la función de Treesuma
    }
  };

  const handleExportarExcel = () => {
    if (treesumaRef.current) {
      treesumaRef.current.exportToExcel(); // Llamada a la función de Treesuma
    }
  };

  const toggleExpandButtonText = () => {
    if (expandButtonText === "Expandir todas las partidas") {
      setExpandButtonText("Contraer todas las partidas");
    } else {
      setExpandButtonText("Expandir todas las partidas");
    }
    handleExpandirPartidas(); // Llama a la función de expandir en Treesuma
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsResp = await getproyectoYtareas(projectId);
        setNombreProyecto(projectsResp.project.nombre);
        console.log("obtenido del endpoint", projectsResp);
      } catch (error) {
        console.error("Error fetching project details:", error);
        throw error;
      } finally {
        setIsLoading(false); // Desactivar el estado de carga
      }
    };
    if (projectId) {
      fetchProjects();
    }
  }, [projectId]);

  // Función para obtener los datos, que se llamará tanto en el useEffect como en el handleUpdate
  const fetchData = useCallback(async () => {
    try {
      if (!selectedDate) return;
      const formattedDate = selectedDate.toISOString().split("T")[0];
      const response = await getPartidasByProjectStdwithHistorico(
        projectId,
        formattedDate,
      );
      console.log(response);
      setpartidas(response);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [projectId, selectedDate]);

  // useEffect que llama a fetchData cuando cambia projectId o selectedDate
  useEffect(() => {
    if (projectId && selectedDate) {
      fetchData();
    }
  }, [projectId, selectedDate, fetchData]); // Se ejecuta cuando cambian projectId o selectedDate

  // handleUpdate solo fuerza la ejecución de fetchData sin modificar selectedDate
  const handleUpdate = async () => {
    await fetchData(); // Vuelve a ejecutar la función de actualización sin cambiar la fecha
  };

  useEffect(() => {
    // Verificar si el contenedor para el portal existe
    if (!document.getElementById("datepicker-portal")) {
      const portalDiv = document.createElement("div");
      portalDiv.id = "datepicker-portal";
      document.body.appendChild(portalDiv);
    }
  }, []);

  const [formData, setFormData] = useState({
    nombre: "",
    ubicacion: "",
    codigo_bip: "",
    unidad_tecnica: "",
    inspector: "",
    superintendente: "",
    rut_unidad_tecnica: "",
    rut_empresa: "",
    presupuesto: 0,
    duenio: "",
    monto_neto: "",
    monto_total_bruto: "",
    monto_mensual: "",
    total_general: "",
    localizacion_mina: "",
    cantidad_partidas: "",
    estado: "En proceso",
    fecha_inicio: dateRange[0],
    fecha_termino: dateRange[1],
    informador: "",
    descripcion: "",
    cant_partidas: 0,
  });

  console.log("id de proyecto desde sumalzada:", projectId);
  useEffect(() => {
    let intervalo;
    if (autoIncremento) {
      intervalo = setInterval(() => {
        setFormData((formData) => ({
          ...formData,
          cant_partidas:
            autoIncremento === "incremento"
              ? formData.cant_partidas + 1
              : Math.max(0, formData.cant_partidas - 1),
        }));
      }, 100);
    }
    return () => clearInterval(intervalo);
  }, [autoIncremento]);

  const handleNextStep = () => {
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handleStepChange = (newStep) => {
    window.location.reload();
  };

  const handleGoBack = () => {
    window.history.back();
  };

  const stepsTotal = 2;
  const stepTitles = ["Carga de partidas", "Partidas a suma alzada Historico"];
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const recargarpagina = () => {
    window.location.reload();
  };

  return (
    <div className="flex w-full max-w-[100vw]  sm:max-w-[90vw] md:max-w-[90vw] h-full bg-gray-800 bg-opacity-75 overflow-hidden">
      <div className="flex-grow flex justify-center items-center font-zen-kaku bg-[#FAFAFA] select-none overflow-hidden">
        <div className="bg-white shadow-lg rounded-xl overflow-hidden  h-full max-h-[95vh]">
          {/* Header de los pasos */}
          <div className="relative flex flex-row items-center justify-center  w-full h-10">
            {[...Array(stepsTotal)].map((_, index) => (
              <div key={index} className="flex flex-row items-center p-2 mb-4">
                <span
                  className={`text-black text-sm sm:text-base cursor-pointer hover:text-opacity-50 transition-all ease-linear duration-150 ${index === step ? "font-semibold" : ""} font-zen-kaku`}
                  onClick={() => {
                    if (index === 0) {
                      handleGoBack();
                    } else {
                      handleStepChange();
                    }
                  }}
                >
                  {stepTitles[index]}
                </span>
                {index < stepsTotal - 1 && (
                  <span
                    className="font-zen-kaku rounded-full h-8 w-8 flex justify-center items-center mr-2"
                    onClick={() => handleStepChange(index + 1)}
                  >
                    <ChevronRight className="stroke-[#5C7891" />
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Formulario principal */}
          <form className="px-4 sm:px-10 py-2 mx-auto font-zen-kaku overflow-y-auto w-full max-w-full ">
            <div className="bg-white">
              <div className="bg-gray-100 p-4 rounded-md ">
                {/* <div className="flex items-center mb-2">
                                    <label className="font-bold mr-2">User:</label>
                                    <input
                                        type="text"
                                        value="TEST_USER"
                                        readOnly
                                        className="border border-gray-300 rounded px-2 py-1"
                                    />
                                    </div>
                                    <div className="flex items-center mb-2">
                                    <label className="font-bold mr-2">Last Changed On:</label>
                                    <input
                                        type="text"
                                        value="GUPTARN1"
                                        readOnly
                                        className="border border-gray-300 rounded px-2 py-1 mr-2"
                                    />
                                    <input
                                        type="text"
                                        value="04.10.2010"
                                        readOnly
                                        className="border border-gray-300 rounded px-2 py-1 mr-2"
                                    />
                                    <input
                                        type="text"
                                        value="19:45:53"
                                        readOnly
                                        className="border border-gray-300 rounded px-2 py-1"
                                    />
                                    </div> */}

                <div className="relative">
                  <label className="font-bold text-sm">
                    Fecha de Busqueda:
                  </label>
                  <DatePicker
                    selected={selectedDate} // Valor inicial es la fecha actual
                    onChange={handleDateChange} // Actualizar el estado de selectedDate al cambiar la fecha
                    dateFormat="dd/MM/yyyy"
                    aria-label="Seleccione la fecha de busqueda"
                    locale="es"
                    className="inline-grid border border-gray-300 rounded px-2 py-1 w-full"
                    popperClassName="z-50"
                    popperContainer={({ children }) => (
                      <div style={{ position: "fixed", zIndex: 9999 }}>
                        {children}
                      </div>
                    )}
                  />
                  {/* Resto del contenido */}
                </div>
              </div>

              {/* Filtros y botones */}
              <div className="flex flex-col sm:flex-row gap-4 p-4 flex-wrap pt-10 justify-start items-center ">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-green-400 h-3 w-3"></div>
                  <label className="text-sm sm:text-base">Partida</label>
                </div>

                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-teal-500 h-3 w-3"></div>
                  <label className="text-sm sm:text-base">Subpartida</label>
                </div>

                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-orange-500 h-3 w-3"></div>
                  <label className="text-sm sm:text-base">Tarea</label>
                </div>

                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-purple-700 h-3 w-3"></div>
                  <label className="text-sm sm:text-base">Subtarea</label>
                </div>

                {/* Botones de acción */}
                <div className="flex flex-wrap gap-4 justify-start items-center">
                  {/* Botón Exportar a Excel */}
                  <div>
                    <button
                      type="button"
                      onClick={handleExportarExcel}
                      className="text-[#5C7891] hover:text-[#597387]  transition-all ease-linear duration-150 px-2 py-1 flex items-center"
                    >
                      <FileUp size={18} className="mr-2" />
                      <span className="text-sm sm:text-base md:text-lg">
                        Exportar a Excel
                      </span>
                    </button>
                  </div>

                  {/* Botón Guardar Histórico */}
                  {/* <div>
                                        <button
                                            type="button"
                                            onClick={handleGuardarHistorico}
                                            className="text-teal-500 hover:text-teal-600 transition-all ease-linear duration-150 px-2 py-1 flex items-center"
                                        >
                                            <SaveAll size={18} className="mr-2" />
                                            <span className="text-sm sm:text-base md:text-lg">Guardar Histórico</span>
                                        </button>
                                    </div> */}

                  {/* Botón Expandir/Contraer Todas */}
                  <div>
                    <button
                      type="button"
                      onClick={toggleExpandButtonText}
                      className="text-[#5C7891] hover:text-[#597387]  transition-all ease-linear duration-150 px-2 py-1 flex items-center"
                    >
                      {expandButtonText === "Contraer todas las partidas" ? (
                        <BiCollapse size={22} className="mr-2" />
                      ) : (
                        <Expand size={18} className="mr-2" />
                      )}
                      <span className="text-sm sm:text-base md:text-lg">
                        {expandButtonText}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Botón Recargar tabla */}

                <Tooltip text="Recargar la tabla">
                  <div
                    className="cursor-pointer hover:rotate-90 transition-all ease-linear duration-300"
                    onClick={handleUpdate}
                  >
                    <RefreshCw size={20} className="stroke-black" />
                  </div>
                </Tooltip>
              </div>

              {/* Contenido principal */}
              <div className="p-2 text-[#635F60] font-bold text-base w-full ">
                <HistoricoTreesuma
                  ref={treesumaRef}
                  partidas={partidas2}
                  projectId={projectId}
                  updatetabla={handleUpdate}
                  Hidebyrol={Hidebyrol}
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default HistoricoPartidasuma;
