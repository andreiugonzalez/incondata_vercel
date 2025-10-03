"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import "../style/input_border.css";
import CircularChart from "./chart";
import CircularChartv2 from "./circularchart";
import DonutChart from "./donutschart";
import GaugeChart from "./barchart";
import Loader from "./loader";
import { getProjects } from "@/app/services/project";
const { useRouter } = require("next/navigation");
import "../style/media_query.css";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";

import { PiHandWaving } from "react-icons/pi";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { getPrimaryRole } from "@/app/utils/roleUtils";

function Newproyect() {
  const [projects, setProjects] = useState([]);
  const [global, setGlobal] = useState(0);
  const [userRole, setUserRole] = useState("admin");
  const [estadoglobal, setestadoglobal] = useState([]);
  const router = useRouter();
  const userStore = useSelector((state) => state.user);
  const role = getPrimaryRole(userStore.user);

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProjects, setFilteredProjects] = useState(projects);
  const [totalplanned, setTotalplanned] = useState(0);
  const [totalavanzado, setTotalavanzado] = useState(0);
  const [valorganado, setValorganado] = useState(0);
  const [totalcpi, settotalcpi] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const results = projects.filter((project) =>
      project.nombre.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredProjects(results);
  }, [searchTerm, projects]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true); // Activar loader al iniciar la llamada
      try {
        const projectsResp = await getProjects();

        // Verificar si projectsResp y projectsResp.data existen
        if (projectsResp && projectsResp.data) {
          const allProjects = projectsResp.data.projects || [];

          // Obtener el userId y verificar si el usuario tiene el rol 'admin' o 'superadmin'
          const userId = userStore.user ? userStore.user.id : null;
          const isAdmin = userStore.user
            ? userStore.user.roles.some((role) => role.name === "admin" || role.name === "superadmin")
            : false;

          // Si el usuario es 'admin' o 'superadmin', mostramos todos los proyectos
          let userProjects;
          if (isAdmin) {
            userProjects = allProjects; // Mostrar todos los proyectos para admin y superadmin
          } else {
            // Filtrar los proyectos en los que el usuario está involucrado
            userProjects = allProjects.filter((project) =>
              project.user_project_project.some(
                (userProject) => userProject.userId === userId,
              ),
            );
          }

          setProjects(userProjects); // Guardar los proyectos (todos o filtrados)

          setGlobal(projectsResp.data.avanceGlobal || []);
          setestadoglobal(projectsResp.data.estadoglobal || []);
          setTotalplanned(projectsResp.data.totalPlannedDays || 0);
          setTotalavanzado(projectsResp.data.roundedSPI || 0);
          setValorganado(projectsResp.data.valorganado || 0);
          settotalcpi(
            isNaN(projectsResp.data.totalCPI) ? 0 : projectsResp.data.totalCPI,
          );
        } else {
          // Si no hay datos válidos, establece valores predeterminados
          setProjects([]);
          setGlobal([]);
          setestadoglobal([]);
          setTotalplanned(0);
          setTotalavanzado(0);
          setValorganado(0);
          settotalcpi(0);
        }
      } catch (error) {
        console.error("Error al obtener los proyectos:", error);
        setProjects([]);
        setGlobal([]);
        setestadoglobal([]);
        setTotalplanned(0);
        setTotalavanzado(0);
        setValorganado(0);
        settotalcpi(0);
      } finally {
        setIsLoading(false); // Desactivar loader después de la llamada
      }
    };

    fetchProjects();
  }, [userStore.user]);

  //👋
  const saludo = `¡Hola ${userStore.user?.names || "Test"}!`;

  const handleProjectClick = (project) => {
    router.push(`/dashboard/dashboard_roles?projectId=${project.id}`);
  };
  const handleproyectid = (project) => {
    router.push(`/dashboard/update_proyecto${project.id}`);
  };

  const fechaActual = new Date();
  const opcionesFecha = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };
  const fechaFormateada = fechaActual.toLocaleDateString(
    "es-CL",
    opcionesFecha,
  );

  const waveAnimation = {
    initial: { rotate: 0 },
    animate: {
      rotate: [0, 50, -5, 0],
      transition: {
        duration: 1.5, // Ajusta la duración para suavizar el movimiento
        repeat: 1,
        repeatType: "loop",
        ease: "easeInOut", // Utiliza una curva de Bézier para suavizar el movimiento
      },
    },
  };

  return (
    <div className="min-h-screen w-full px-0 py-4 md:px-6 md:py-8 bg-white max-w-screen-2xl mx-auto flex flex-col">
      {isLoading ? (
        <div className="flex justify-center items-center flex-1">
          <Loader /> {/* Mostrar loader mientras se cargan los datos */}
        </div>
      ) : (
        <>
          {/* Saludo */}
          <div className="mb-4 text-2xl font-bold text-gray-800 select-none flex items-center justify-center md:justify-start font-zen-kaku">
            {saludo}
            <motion.div
              className="inline-block ml-2"
              variants={waveAnimation}
              initial="initial"
              animate="animate"
            >
              <PiHandWaving width={24} height={24} className="fill-black" />
            </motion.div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 select-none custom-label-user">
            <div className="flex justify-start md:justify-start text-base md:text-lg font-zen-kaku md:w-1/4">
              <label>{fechaFormateada}</label>
            </div>
            <label
              htmlFor="filtroSelect"
              className="text-center text-lg font-extrabold text-gray-800 select-none font-zen-kaku md:flex-1"
            >
              | Panel de proyectos |
            </label>
            <div className="hidden md:block md:w-1/4"></div>
          </div>

          {/* Grilla de charts responsiva - Alineada a la izquierda */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mt-4 mb-8 w-full justify-items-start">
            <div className="select-none border rounded-md shadow bg-white p-2 flex items-start justify-start w-full max-w-sm">
              <CircularChart {...global} />
            </div>
            <div className="select-none border rounded-md shadow bg-white p-2 flex items-center justify-end w-full max-w-sm">
              <DonutChart
                data={estadoglobal.map((item) => item.data)}
                label={estadoglobal.map((item) => item.label)}
                colors={estadoglobal.map((item) => item.colors)}
              />
            </div>
            <div className="border rounded-md shadow bg-white p-2 flex items-end justify-end w-full max-w-sm">
              <GaugeChart
                width={160}
                height={170}
                value={totalavanzado}
                startAngle={-90}
                endAngle={90}
                valueMin={0}
                valueMax={2}
                label="Índice de Rendimiento Tiempo (SPI)"
                subtitle={`${totalplanned} días`}
              />
            </div>
            <div className="border rounded-md shadow bg-white p-2 flex items-center justify-center w-full max-w-sm">
              <GaugeChart
                width={160}
                height={170}
                value={totalcpi}
                valueMin={0}
                valueMax={2}
                startAngle={-90}
                endAngle={90}
                label="Índice de Rendimiento Financiero (CPI)"
                subtitle={`${valorganado}`}
              />
            </div>
          </div>

          {/* Barra de búsqueda horizontal - Centrada */}
          <div className="relative mb-0 font-zen-kaku w-full max-w-4xl mx-auto px-0">
            <input
              type="text"
              placeholder="Buscar proyecto..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full p-1 pl-10 border rounded-lg shadow-md bg-gray-100 text-gray-700 placeholder-gray-500 hover:bg-white hover:placeholder-gray-700 hover:text-black focus:bg-white focus:placeholder-gray-700 focus:text-black transition-all duration-300 outline-none text-lg"
            />
            <span className="absolute inset-y-0 left-0 flex items-center pl-2">
              <MagnifyingGlassIcon
                className="h-6 w-6 text-gray-500"
                aria-hidden="true"
              />
            </span>
          </div>

          {/* Layout de proyectos - Vertical en móvil, horizontal en desktop */}
          <div className="flex flex-col md:flex-row md:gap-10 md:overflow-x-auto pb-14 pt-6 relative">
            {/* Eliminamos el botón duplicado que aparecía en móvil */}
            
            {/* Modal para móvil - Solo se muestra cuando isMenuOpen es true */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    className="flex flex-col text-center gap-2 p-4 bg-white rounded-lg shadow-xl select-none border w-4/5 max-h-[80vh] overflow-y-auto font-zen-kaku"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h1 className="font-bold font-zen-kaku">
                      Nombre del proyecto
                    </h1>
                    <div className="border-b-2 border-gray-200"></div>
                    <h1 className="pt-1 pb-1 font-bold font-zen-kaku">
                      Fecha inicio y termino
                    </h1>
                    <div className="border-b-2 border-gray-200"></div>
                    <h1 className="font-zen-kaku font-bold">
                      Progreso del proyecto
                    </h1>
                    <div className="border-b-2 border-gray-200"></div>
                    <h1 className="pt-1 font-bold font-zen-kaku">
                      Etapa de proyecto
                    </h1>
                    <div className="border-b-2 border-gray-200"></div>
                    <h1 className="pt-1 font-bold font-zen-kaku">Encargado</h1>
                    <div className="border-b-2 border-gray-200"></div>
                    <h1 className="pt-1 mb-2 font-bold font-zen-kaku">
                      Tiempo planeado
                    </h1>
                    <h1 className="font-bold font-zen-kaku">Horas actuales</h1>
                    <div className="border-b-2 border-gray-200"></div>
                    <h1 className="font-bold font-zen-kaku">
                      Actualización usuario
                    </h1>
                    <div className="border-b-2 border-gray-200"></div>
                    <h1 className="font-bold font-zen-kaku pt-2">
                      Actualizado por
                    </h1>
                    <button
                      className="mt-4 bg-[#5c7891] hover:bg-[#597387] focus:bg-[#46607a] active:bg-[#46607a] transition-all duration-200 text-white px-4 py-2 rounded-lg shadow font-bold"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Cerrar
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header de columnas - Solo visible en desktop */}
            <div className="hidden md:flex flex-col gap-2 p-3 bg-white rounded-lg shadow-xl select-none whitespace-nowrap border sticky left-0 top-0 custom-list-mobil">
              <h1 className="font-bold font-zen-kaku">Proyecto</h1>
              <div className="border-b-2 border-gray-200"></div>
              <h1 className="pt-1 pb-1 font-bold font-zen-kaku">Fechas</h1>
              <div className="border-b-2 border-gray-200"></div>
              <h1 className="font-zen-kaku font-bold pt-20 pb-[4.5rem]">
                Progreso
              </h1>
              <div className="border-b-2 border-gray-200"></div>
              <h1 className="pt-1 font-bold font-zen-kaku">
                Etapa de proyecto
              </h1>
              <div className="border-b-2 border-gray-200"></div>
              <h1 className="pt-1 font-bold font-zen-kaku">Encargado</h1>
              <div className="border-b-2 border-gray-200"></div>
              <h1 className="pt-1 mb-2 font-bold font-zen-kaku">
                Tiempo planeado
              </h1>
              <h1 className="font-bold font-zen-kaku">Horas actuales</h1>
              <div className="border-b-2 border-gray-200"></div>
              <h1 className="font-bold font-zen-kaku">Actualización usuario</h1>
              <div className="border-b-2 border-gray-200"></div>
              <h1 className="font-bold font-zen-kaku pt-2">Actualizado por</h1>
            </div>

            {/* Contenedor de proyectos - Vertical en móvil, horizontal en desktop */}
            <div className="flex-1 w-full">
              {filteredProjects.length > 0 ? (
                <div className="flex flex-wrap justify-start items-start gap-1 px-0 group">
                  {filteredProjects.map((data, index) => {
                    const isHighlighted =
                      searchTerm &&
                      data.nombre
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase());
                    return (
                      <div
                        className={`relative col-span-1 border shadow-xl rounded-lg transition-all transform ease-linear cursor-pointer my-4 w-[95%] max-w-[380px] mx-0 md:w-[360px] md:max-w-[360px] md:mr-0 group-hover:blur-sm hover:!blur-none hover:scale-90 group-hover:shadow hover:!shadow-2xl`}
                        key={index}
                        onClick={() => {
                          handleProjectClick(data);
                        }}
                      >
                        {/* Botón más visible en cada tarjeta */}
                        <button
                          className="absolute top-2 right-1 z-10 p-2 text-white bg-[#5c7891] hover:bg-[#597387] rounded-lg shadow-lg transition-all duration-200 opacity-90 hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsMenuOpen(!isMenuOpen);
                          }}
                        >
                          ⋮
                        </button>
                        <CircularChartv2
                          {...data}
                          isHighlighted={isHighlighted}
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center mt-10">
                  <Image
                    src="/Not_Found.png"
                    width={240}
                    height={240}
                    alt="No projects found"
                  />
                  <p className="text-center select-none text-gray-500 mt-4 font-zen-kaku">
                    No existen proyectos
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Newproyect;
