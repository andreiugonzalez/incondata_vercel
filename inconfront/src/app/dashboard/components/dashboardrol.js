"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "next/navigation";
import "../style/input_border.css";
import CircularChart from "./chart";
import CircularChartv2 from "./circularchart";
import DonutChart from "./donutschart";
import GaugeChart from "./barchart";
import { getproyectoYtareas } from "@/app/services/chart_service";
import { getUserWithRoleName } from "@/app/services/user";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import {
  Crown,
  List,
  Calendar,
  Ticket,
  Loader,
  Cylinder,
  ChevronDown,
  User,
  BookUser,
  FilePenLine,
  FileText,
  Cog,
} from "lucide-react";
import Estimadochart from "./estimado";
import ProjectProgress from "./threeprogress";
import ChartComponent from "./barchart2";
import LineChartComponent from "./linechart";
import ChartComponentaccidente from "./accidentechart";
import PieChart from "./piechart";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Sidebarpartida from "./new_partida";
import TaskComponent from "./nodos_clickup";
import TablaResumen from "./dashboard_prevencionista";
import "../style/media_query.css";
import PieChartacc from "./piecharttipoacc";
import ScatterChart from "./ocurrenciachart";

import NotificationButton from "@/app/components/notify";
import LoginOnProject from "@/app/components/loginOnproyects";

import DocumentosComponent from "./adjuntos_proyecto_tab";
import AccidentCounter from "./AccidentCounter";
import { Getaccidentesbyproject } from "@/app/services/eventos_service";
import { HiDocumentText } from "react-icons/hi";

const { useRouter } = require("next/navigation");

import Tooltip from "../../components/tooltip";

function Dashroles({ projectId, Hidebyrol }) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") || "General";

  // Mapeo de tabs string a números
  const tabMapping = {
    "General": 0,
    "Materiales": 1,
    "Documentos": 2,
    "Accidentes": 3,
    "Config": 4
  };

  const reverseTabMapping = {
    0: "General",
    1: "Materiales", 
    2: "Documentos",
    3: "Accidentes",
    4: "Config"
  };

  const [projectsChardata, setProjectschardata] = useState([]);
  const [horasPorDia, sethorasPorDia] = useState([]);
  const [selectedTab, setSelectedTab] = useState(tabMapping[tabParam] || 0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [idproject, setProjectId] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [presupuesto, setPresupuesto] = useState(0);
  const [totalGastado, setTotalgastado] = useState(0);
  const [porcentajeFormateado, setPorcentajeformateado] = useState(0);
  const [actualizado, setActualizado] = useState([]);
  const [usuariosPorRol, setUsuariorol] = useState([]);
  const [estimadoFormateado, setEstimado] = useState(0);
  const [nombreProyecto, setNombreProyecto] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [porcentajefecha, setPorcentajefecha] = useState([]);
  const [porcentajepartidas, setPorcentajepartidas] = useState([]);
  const [daysWithoutAccidents, setDiasSinAccidentes] = useState(0);
  const [accidentData, setAccidentData] = useState({
    Leve: 0,
    Grave: 0,
    Fatal: 0,
  });
  const router = useRouter();

  const fetchProjects = useCallback(async () => {
    try {
      const projectsResp = await getproyectoYtareas(projectId);
      setProjectschardata(projectsResp.data);
      setPercentage(projectsResp.porcentajes);
      sethorasPorDia(projectsResp.horasPorDia);
      setPresupuesto(projectsResp.presupuestoFormateado);
      setTotalgastado(projectsResp.totalGastadoFormateado);
      setPorcentajeformateado(projectsResp.porcentajeFormateado);
      setActualizado(projectsResp.actualizado);
      setUsuariorol(projectsResp.usuariosPorRol);
      setEstimado(projectsResp.estimadoFormateado);
      setNombreProyecto(projectsResp.project.nombre);
      setPorcentajefecha(projectsResp.porcentajeAvance);
      setPorcentajepartidas(projectsResp.porcentajetotal_partidas);
      setDiasSinAccidentes(projectsResp.diferenciaEnDias);
      setAccidentData(projectsResp.accidentesCount);
    } catch (error) {
      console.error("Error fetching project details:", error);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      setProjectId(projectId);
      fetchProjects();
    }
  }, [projectId, fetchProjects]);

  const handleLabelClick = () => {
    router.push(`/dashboard/partida_suma?project=${projectId}`);
  };

  const handleLabelClickAjustes = () => {
    router.push(`/dashboard/projectsettings?project=${projectId}`);
  };

  const userStore = useSelector((state) => state.user);
  const id = userStore.user ? `${userStore.user.id}` : "";
  const role = userStore?.user?.roles?.[0]?.name || "";

  //obtener todos los roles por usuarios
  const [roleNames, setRoleNames] = useState([]);
  useEffect(() => {
    const roles =
      userStore?.user?.roles?.map((rolesnames) => rolesnames.name) || [];
    setRoleNames(roles);
  }, [userStore]);

  //Usar hasRole para los dash. Problemas: duplicidad de graficos.
  const hasRole = (rolesnames) => roleNames.includes(rolesnames);

  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    setUserRole(role);
  }, [role]);

  const saludo = `¡Hola ${userStore.user?.names || "Test"}! 👋`;

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("tab", reverseTabMapping[newValue] || "General");
    window.history.pushState(
      null,
      "",
      `${window.location.pathname}?${searchParams.toString()}`,
    );
  };

  const fecha = new Date();
  const fechaFormateada =
    format(fecha, "EEEE d 'de' MMMM yyyy", { locale: es })
      .charAt(0)
      .toUpperCase() +
    format(fecha, "EEEE d 'de' MMMM yyyy", { locale: es }).slice(1);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <div className="h-full p-8 mx-auto overflow-y-none bg-white xl:max-w-full-2xl lg:max-w-full-2xl custom-width-roles">
        <div className="absolute top-4 right-4 z-50 mr-2">
          <NotificationButton />
        </div>
        {/* <div className="mb-4 text-2xl font-bold text-gray-800 select-none">{saludo}</div> */}
        <div className="mt-6"></div>
        <div className="flex items-center justify-between gap-4 mb-8 select-none custom-label-user">
          <label
            htmlFor="filtroSelect"
            className="col-span-1 text-sm font-bold text-gray select-none font-zen-kaku"
          >
            Bienvenido al proyecto{" "}
            <span className="text-[#5c7891] text-lg">
              {isLoading ? "Cargando..." : nombreProyecto}
            </span>
          </label>
          <div className="flex justify-end mr-2 font-bold md:col-span-2">
            <label className="select-none font-zen-kaku">
              {fechaFormateada}
            </label>
          </div>
        </div>
        <div className=" top-4 right-10 z-50 content-end">
          <LoginOnProject />
        </div>
        <Box sx={{ width: "100%", bgcolor: "background.paper" }}>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            aria-label="basic tabs example"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              "& .MuiTabs-indicator": {
                backgroundColor: "#5c7891",
              },
            }}
          >
            {[
              "prevencionista",
              "admin",
              "superadmin",
              "ITO",
              "administrador de contrato",
              "inspector",
              "superintendente",
              "planner",
              "supervisor",
            ].includes(userRole) && (
              <Tab
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flexDirection: "row",
                  gap: "8px",
                  fontFamily: '"zen kaku gothic antique", sans-serif',
                  textTransform: "capitalize",
                }}
                icon={<Crown />}
                label="General"
                value={tabMapping["General"]}
              />
            )}
            {[
              "admin",
              "superadmin",
              "planner",
              "superintendente",
              "administrador de contrato",
              "supervisor",
              "ITO",
            ].includes(userRole) && (
              <Tab
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flexDirection: "row",
                  gap: "8px",
                  fontFamily: '"zen kaku gothic antique", sans-serif',
                  textTransform: "capitalize",
                }}
                icon={<List />}
                label="Partidas"
                value={tabMapping["Materiales"]}
              />
            )}
            {[
              "prevencionista",
              "admin",
              "superadmin",
              "ITO",
              "administrador de contrato",
              "inspector",
              "superintendente",
              "planner",
              "supervisor",
            ].includes(userRole) && (
              <Tab
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flexDirection: "row",
                  gap: "8px",
                  fontFamily: '"zen kaku gothic antique", sans-serif',
                  textTransform: "capitalize",
                }}
                icon={<Calendar />}
                label="Documentos"
                value={tabMapping["Documentos"]}
              />
            )}
            {[
              "prevencionista",
              "admin",
              "superadmin",
              "superintendente",
              "ITO",
              "supervisor",
            ].includes(userRole) && (
              <Tab
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flexDirection: "row",
                  gap: "8px",
                  fontFamily: '"zen kaku gothic antique", sans-serif',
                  textTransform: "capitalize",
                }}
                icon={<User />}
                label="Accidentes de trabajo"
                value={tabMapping["Accidentes"]}
              />
            )}

            <div
              onClick={handleLabelClick}
              className="inline-flex items-center gap-2 cursor-pointer"
            >
              <div className="bg-[#7fa1c6] hover:bg-[#5c7891] text-white font-bold py-2 px-4 rounded-lg shadow transition-all duration-200 text-center flex items-center justify-center gap-2">
                <span className="flex items-center gap-2">
                  <FilePenLine size={20} className="text-white" />
                  Control Carta Gantt
                </span>
              </div>
            </div>

            {!(
              userRole === "prevencionista" || userRole === "superintendente" || userRole === "superadmin"
            ) && (
              <div
                onClick={handleLabelClickAjustes}
                className="absolute right-4 top-4 inline-flex items-center gap-2 cursor-pointer"
              >
                <div className="bg-[#7fa1c6] hover:bg-[#5c7891] text-white font-bold py-2 px-4 rounded-lg shadow transition-all duration-200 text-center flex items-center justify-center">
                  <Cog size={20} className="text-white" />
                </div>
              </div>
            )}
          </Tabs>
        </Box>
        <div className="flex flex-nowrap mb-3 border-b-2 border-[#DDD9D8] pb-2 mr-4 ml-4 rounded-sm"></div>

        {userRole === "admin" && (
          <>
            {selectedTab === tabMapping["General"] && (
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mt-4 mb-4">
                <div className="select-none">
                  <ProjectProgress
                    data={projectsChardata}
                    percentage={percentage}
                    actualizado={actualizado}
                  />
                </div>
                <div className="select-none">
                  <Estimadochart
                    data={projectsChardata}
                    presupuesto={presupuesto}
                    totalGastado={totalGastado}
                    porcentajeFormateado={porcentajeFormateado}
                    actualizado={actualizado}
                    estimadoFormateado={estimadoFormateado}
                  />
                </div>
                <div className="select-none">
                  <ChartComponent
                    actualizado={actualizado}
                    projectId={idproject}
                    porcentajefecha={porcentajefecha}
                    porcentajepartidas={porcentajepartidas}
                  />
                </div>

                <div className="select-none">
                  <LineChartComponent
                    data={projectsChardata}
                    horasPorDia={horasPorDia}
                    actualizado={actualizado}
                    projectId={idproject}
                  />
                </div>
                <div className="select-none">
                  <ChartComponentaccidente
                    actualizado={actualizado}
                    projectId={projectId}
                    fetchProjects={fetchProjects}
                  />
                </div>
                <div className="select-none">
                  <PieChart
                    actualizado={actualizado}
                    usuariosPorRol={usuariosPorRol}
                  />
                </div>
              </div>
            )}
            {selectedTab === tabMapping["Materiales"] && (
              <div className="flex flex-wrap gap-8 mt-4 mb-4">
                <form
                  className="px-10 py-2  overflow-hidden font-zen-kaku md:w-11/12 custom-nodos"
                  style={{ marginTop: "-20px" }}
                >
                  <div className="overflow-x-hidden bg-white">
                    <div className="flex items-center justify-between p-4">
                      <div className="z-50 flex space-x-4 font-zen-kaku">
                        <div className="flex flex-nowrap mb-3 border-b-2 border-[#DDD9D8] pb-2 mr-4 ml-4 rounded-sm"></div>
                      </div>
                    </div>
                    {/* <div className="flex items-center justify-start p-4 ">
                      <div className='z-40 group'>
                        <button type='button' className="flex items-center transition-all duration-200 border-0 bg-[#7fa1c6] hover:bg-[#5c7891] text-white font-semibold rounded-lg p-2 pl-2 pr-2 h-8 text-sm shadow group-hover:text-white">
                          <Ticket className="w-4 h-4 mr-2 group" />
                          Item
                          <ChevronDown className='group' />
                        </button>
                      </div>
                      <div className='z-40 group'>
                        <button type='button' className="flex items-center transition-all duration-200 border-0 bg-[#7fa1c6] hover:bg-[#5c7891] text-white font-semibold rounded-lg p-2 pl-2 pr-2 h-8 text-sm shadow group-hover:text-white mr-4 ml-4">
                          <Loader className="w-4 h-4 mr-2" />
                          Partida
                          <ChevronDown />
                        </button>
                      </div>
                      <div className='z-40 group'>
                        <button type='button' className="flex items-center transition-all duration-200 border-0 bg-[#7fa1c6] hover:bg-[#5c7891] text-white font-semibold rounded-lg p-2 pl-2 pr-2 h-8 text-sm shadow group-hover:text-white">
                          <Cylinder className="w-4 h-4 mr-2" />
                          Unidad
                          <ChevronDown />
                        </button>
                      </div>
                    </div> */}
                    <div className="p-4 text-[#635F60] font-bold text-base">
                      {idproject && (
                        <TaskComponent
                          id_proyecto={idproject}
                          id_usuario={id}
                        />
                      )}
                    </div>
                  </div>
                </form>
              </div>
            )}
            {selectedTab === tabMapping["Documentos"] && (
              <div className="overflow-x-auto">
                <div className="flex flex-wrap gap-8 mt-4 mb-4 justify-center">
                  <DocumentosComponent projectId={idproject} />
                </div>
              </div>
            )}
            {selectedTab === tabMapping["Accidentes"] && (
              <div>
                <div className="overflow-x-auto bg-white shadow-lg">
                  <div className="table p-4 select-none font-zen-kaku overflow-x-auto w-full min-w-full">
                    <div className="flex flex-wrap gap-8 mt-4 mb-4 justify-center custom-prevencion">
                      <TablaResumen
                        projectId={projectId}
                        selectedTab={selectedTab}
                        fetchProjects={fetchProjects}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mt-4 mb-4">
                  <div className="select-none ">
                    {/* gado */}
                    <ChartComponentaccidente
                      actualizado={actualizado}
                      projectId={projectId}
                      fetchProjects={fetchProjects}
                    />
                  </div>
                  <div className="select-none">
                    <PieChartacc
                      actualizado={actualizado}
                      accidentData={accidentData}
                      fetchProjects={fetchProjects}
                    />
                  </div>
                  <div className="select-none">
                    <ScatterChart 
                      actualizado={actualizado}
                      projectId={projectId}
                      fetchProjects={fetchProjects}
                    />
                  </div>
                  <div className="select-none">
                    <AccidentCounter
                      daysWithoutAccidents={daysWithoutAccidents}
                      actualizado={actualizado}
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedTab === tabMapping["Config"] && (
              <div>
                <div className="overflow-x-auto bg-white shadow-lg">
                  <div className="table p-4 select-none font-zen-kaku overflow-x-auto w-full min-w-full">
                    <div className="flex flex-wrap gap-8 mt-4 mb-4 justify-center custom-prevencion">
                      <TablaResumen
                        projectId={projectId}
                        selectedTab={selectedTab}
                        fetchProjects={fetchProjects}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mt-4 mb-4">
                  <div className="select-none ">
                    {/* gado */}
                    <ChartComponentaccidente
                      actualizado={actualizado}
                      projectId={projectId}
                      fetchProjects={fetchProjects}
                    />
                  </div>
                  <div className="select-none">
                    <PieChartacc
                      actualizado={actualizado}
                      accidentData={accidentData}
                      fetchProjects={fetchProjects}
                    />
                  </div>
                  <div className="select-none">
                    <ScatterChart 
                      actualizado={actualizado}
                      projectId={projectId}
                      fetchProjects={fetchProjects}
                    />
                  </div>
                  <div className="select-none">
                    <AccidentCounter
                      daysWithoutAccidents={daysWithoutAccidents}
                      actualizado={actualizado}
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {(userRole === "superintendente" || userRole === "superadmin") && (
          <>
            {selectedTab === tabMapping["General"] && (
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mt-4 mb-4">
                <div className="select-none">
                  <ProjectProgress
                    data={projectsChardata}
                    percentage={percentage}
                    actualizado={actualizado}
                  />
                </div>
                <div className="select-none">
                  <Estimadochart
                    data={projectsChardata}
                    presupuesto={presupuesto}
                    totalGastado={totalGastado}
                    porcentajeFormateado={porcentajeFormateado}
                    actualizado={actualizado}
                  />
                </div>
                <div className="select-none">
                  <ChartComponent
                    actualizado={actualizado}
                    projectId={idproject}
                    porcentajefecha={porcentajefecha}
                    porcentajepartidas={porcentajepartidas}
                  />
                </div>
                <div className="select-none ">
                  <LineChartComponent
                    data={projectsChardata}
                    horasPorDia={horasPorDia}
                    actualizado={actualizado}
                    projectId={idproject}
                  />
                </div>
                <div className="select-none">
                  <ChartComponentaccidente
                    actualizado={actualizado}
                    projectId={projectId}
                    fetchProjects={fetchProjects}
                  />
                </div>
              </div>
            )}
            {selectedTab === tabMapping["Materiales"] && (
              <div className="flex flex-wrap gap-8 mt-4 mb-4">
                <form
                  className="px-10 py-2  overflow-hidden font-zen-kaku md:w-11/12 custom-nodos"
                  style={{ marginTop: "-20px" }}
                >
                  <div className="overflow-x-hidden bg-white">
                    <div className="flex items-center justify-between p-4">
                      <div className="z-50 flex space-x-4 font-zen-kaku">
                        <div className="flex flex-nowrap mb-3 border-b-2 border-[#DDD9D8] pb-2 mr-4 ml-4 rounded-sm"></div>
                      </div>
                    </div>
                    {/* <div className="flex items-center justify-start p-4 ">
                      <div className='z-40 group'>
                        <button type='button' className="flex items-center transition-all ease-linear duration-150 border z-40 border-[#BEB7B4] rounded-lg p-2 pl-2 pr-2 h-8 text-sm font-semibold text-[#BEB7B4] hover:bg-gray-300 group-hover:text-white group-hover:border-gray-300">
                          <Ticket className="w-4 h-4 mr-2 group" />
                          Item
                          <ChevronDown className='group' />
                        </button>
                      </div>
                      <div className='z-40 group'>
                        <button type='button' className="flex items-center transition-all ease-linear duration-150 border z-40 mr-4 ml-4 border-[#BEB7B4] rounded-lg p-2 pl-2 pr-2 h-8 text-sm font-semibold text-[#BEB7B4] hover:bg-gray-300 group-hover:text-white group-hover:border-gray-300">
                          <Loader className="w-4 h-4 mr-2" />
                          Partida
                          <ChevronDown />
                        </button>
                      </div>
                      <div className='z-40 group'>
                        <button type='button' className="flex items-center transition-all ease-linear duration-150 border z-40 border-[#BEB7B4] rounded-lg p-2 pl-2 pr-2 h-8 text-sm font-semibold text-[#BEB7B4] hover:bg-gray-300 group-hover:text-white group-hover:border-gray-300">
                          <Cylinder className="w-4 h-4 mr-2" />
                          Unidad
                          <ChevronDown />
                        </button>
                      </div>
                    </div> */}
                    <div className="p-4 text-[#635F60] font-bold text-base">
                      {idproject && (
                        <TaskComponent
                          id_proyecto={idproject}
                          id_usuario={id}
                        />
                      )}
                    </div>
                  </div>
                </form>
              </div>
            )}
            {selectedTab === tabMapping["Documentos"] && (
              <div className="overflow-x-auto">
                <div className="flex flex-wrap gap-8 mt-4 mb-4 justify-center">
                  <DocumentosComponent projectId={idproject} />
                </div>
              </div>
            )}
            {selectedTab === tabMapping["Accidentes"] && (
              <div>
                <div className="overflow-x-auto bg-white shadow-lg">
                  <div className="table p-4 select-none font-zen-kaku overflow-x-auto w-full min-w-full">
                    <div className="flex flex-wrap gap-8 mt-4 mb-4 justify-center custom-prevencion">
                      <TablaResumen
                        projectId={projectId}
                        selectedTab={selectedTab}
                        fetchProjects={fetchProjects}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mt-4 mb-4">
                  <div className="select-none ">
                    {/* gado */}
                    <ChartComponentaccidente
                      actualizado={actualizado}
                      projectId={projectId}
                      fetchProjects={fetchProjects}
                    />
                  </div>
                  <div className="select-none">
                    <PieChartacc
                      actualizado={actualizado}
                      accidentData={accidentData}
                      fetchProjects={fetchProjects}
                    />
                  </div>
                  <div className="select-none">
                    <ScatterChart
                      actualizado={actualizado}
                      projectId={projectId}
                      fetchProjects={fetchProjects}
                    />
                  </div>
                  <div className="select-none">
                    <AccidentCounter
                      daysWithoutAccidents={daysWithoutAccidents}
                      actualizado={actualizado}
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        {userRole === "inspector" && (
          <>
            {selectedTab === tabMapping["General"] && (
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mt-4 mb-4">
                <div className="select-none">
                  <ProjectProgress
                    data={projectsChardata}
                    percentage={percentage}
                    actualizado={actualizado}
                  />
                </div>
                <div className="select-none">
                  <Estimadochart
                    data={projectsChardata}
                    presupuesto={presupuesto}
                    totalGastado={totalGastado}
                    porcentajeFormateado={porcentajeFormateado}
                    actualizado={actualizado}
                  />
                </div>
                <div className="select-none">
                  <ChartComponent
                    actualizado={actualizado}
                    projectId={idproject}
                    porcentajefecha={porcentajefecha}
                    porcentajepartidas={porcentajepartidas}
                  />
                </div>
                <div className="select-none">
                  <LineChartComponent
                    data={projectsChardata}
                    horasPorDia={horasPorDia}
                    actualizado={actualizado}
                    projectId={idproject}
                  />
                </div>
                <div className="select-none">
                  <ChartComponentaccidente actualizado={actualizado} />
                </div>
              </div>
            )}
          </>
        )}

        {userRole === "administrador de contrato" && (
          <>
            {selectedTab === tabMapping["General"] && (
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mt-4 mb-4">
                <div className="select-none">
                  <ProjectProgress
                    data={projectsChardata}
                    percentage={percentage}
                    actualizado={actualizado}
                  />
                </div>
                <div className="select-none">
                  <Estimadochart
                    data={projectsChardata}
                    presupuesto={presupuesto}
                    totalGastado={totalGastado}
                    porcentajeFormateado={porcentajeFormateado}
                    actualizado={actualizado}
                  />
                </div>
                <div className="select-none">
                  <ChartComponent
                    actualizado={actualizado}
                    projectId={idproject}
                    porcentajefecha={porcentajefecha}
                    porcentajepartidas={porcentajepartidas}
                  />
                </div>
                <div className="select-none">
                  <LineChartComponent
                    data={projectsChardata}
                    horasPorDia={horasPorDia}
                    actualizado={actualizado}
                    projectId={idproject}
                  />
                </div>
              </div>
            )}
            {selectedTab === tabMapping["Documentos"] && (
              <div className="overflow-x-auto">
                <div className="flex flex-wrap gap-8 mt-4 mb-4 justify-center">
                  <DocumentosComponent projectId={idproject} />
                </div>
              </div>
            )}
            {selectedTab === tabMapping["Materiales"] && (
              <div className="flex flex-wrap gap-8 mt-4 mb-4">
                <form
                  className="px-10 py-2  overflow-hidden font-zen-kaku md:w-11/12 custom-nodos"
                  style={{ marginTop: "-20px" }}
                >
                  <div className="overflow-x-hidden bg-white">
                    <div className="flex items-center justify-between p-4">
                      <div className="z-50 flex space-x-4 font-zen-kaku">
                        <div className="flex flex-nowrap mb-3 border-b-2 border-[#DDD9D8] pb-2 mr-4 ml-4 rounded-sm"></div>
                      </div>
                    </div>
                    {/* <div className="flex items-center justify-start p-4 ">
                      <div className='z-40 group'>
                        <button type='button' className="flex items-center transition-all ease-linear duration-150 border z-40 border-[#BEB7B4] rounded-lg p-2 pl-2 pr-2 h-8 text-sm font-semibold text-[#BEB7B4] hover:bg-gray-300 group-hover:text-white group-hover:border-gray-300">
                          <Ticket className="w-4 h-4 mr-2 group" />
                          Item
                          <ChevronDown className='group' />
                        </button>
                      </div>
                      <div className='z-40 group'>
                        <button type='button' className="flex items-center transition-all ease-linear duration-150 border z-40 mr-4 ml-4 border-[#BEB7B4] rounded-lg p-2 pl-2 pr-2 h-8 text-sm font-semibold text-[#BEB7B4] hover:bg-gray-300 group-hover:text-white group-hover:border-gray-300">
                          <Loader className="w-4 h-4 mr-2" />
                          Partida
                          <ChevronDown />
                        </button>
                      </div>
                      <div className='z-40 group'>
                        <button type='button' className="flex items-center transition-all ease-linear duration-150 border z-40 border-[#BEB7B4] rounded-lg p-2 pl-2 pr-2 h-8 text-sm font-semibold text-[#BEB7B4] hover:bg-gray-300 group-hover:text-white group-hover:border-gray-300">
                          <Cylinder className="w-4 h-4 mr-2" />
                          Unidad
                          <ChevronDown />
                        </button>
                      </div>
                    </div> */}
                    <div className="p-4 text-[#635F60] font-bold text-base">
                      {idproject && (
                        <TaskComponent
                          id_proyecto={idproject}
                          id_usuario={id}
                        />
                      )}
                    </div>
                  </div>
                </form>
              </div>
            )}
          </>
        )}

        {userRole === "ITO" && (
          <>
            {selectedTab === tabMapping["General"] && (
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mt-4 mb-4">
                <div className="select-none">
                  <ChartComponent
                    actualizado={actualizado}
                    projectId={idproject}
                    porcentajefecha={porcentajefecha}
                    porcentajepartidas={porcentajepartidas}
                  />
                </div>
                <div className="select-none">
                  <LineChartComponent
                    data={projectsChardata}
                    horasPorDia={horasPorDia}
                    actualizado={actualizado}
                    projectId={idproject}
                  />
                </div>
                <div className="select-none">
                  <ChartComponentaccidente actualizado={actualizado} />
                </div>
                <div className="select-none">
                  <PieChart
                    actualizado={actualizado}
                    usuariosPorRol={usuariosPorRol}
                  />
                </div>
                {/* Componentes agregados */}
                <div className="select-none">
                  <ProjectProgress
                    data={projectsChardata}
                    percentage={percentage}
                  />
                </div>
                <div className="select-none">
                  <Estimadochart
                    data={projectsChardata}
                    presupuesto={presupuesto}
                    totalGastado={totalGastado}
                    porcentajeFormateado={porcentajeFormateado}
                    actualizado={actualizado}
                  />
                </div>
              </div>
            )}
            {selectedTab === tabMapping["Documentos"] && (
              <div className="overflow-x-auto">
                <div className="flex flex-wrap gap-8 mt-4 mb-4 justify-center">
                  <DocumentosComponent projectId={idproject} />
                </div>
              </div>
            )}
            {selectedTab === tabMapping["Materiales"] && (
              <div className="flex flex-wrap gap-8 mt-4 mb-4">
                <form
                  className="px-10 py-2  overflow-hidden font-zen-kaku md:w-11/12 custom-nodos"
                  style={{ marginTop: "-20px" }}
                >
                  <div className="overflow-x-hidden bg-white">
                    <div className="flex items-center justify-between p-4">
                      <div className="z-50 flex space-x-4 font-zen-kaku">
                        <div className="flex flex-nowrap mb-3 border-b-2 border-[#DDD9D8] pb-2 mr-4 ml-4 rounded-sm"></div>
                      </div>
                    </div>
                    {/* <div className="flex items-center justify-start p-4 ">
                      <div className='z-40 group'>
                        <button type='button' className="flex items-center transition-all ease-linear duration-150 border z-40 border-[#BEB7B4] rounded-lg p-2 pl-2 pr-2 h-8 text-sm font-semibold text-[#BEB7B4] hover:bg-gray-300 group-hover:text-white group-hover:border-gray-300">
                          <Ticket className="w-4 h-4 mr-2 group" />
                          Item
                          <ChevronDown className='group' />
                        </button>
                      </div>
                      <div className='z-40 group'>
                        <button type='button' className="flex items-center transition-all ease-linear duration-150 border z-40 mr-4 ml-4 border-[#BEB7B4] rounded-lg p-2 pl-2 pr-2 h-8 text-sm font-semibold text-[#BEB7B4] hover:bg-gray-300 group-hover:text-white group-hover:border-gray-300">
                          <Loader className="w-4 h-4 mr-2" />
                          Partida
                          <ChevronDown />
                        </button>
                      </div>
                      <div className='z-40 group'>
                        <button type='button' className="flex items-center transition-all ease-linear duration-150 border z-40 border-[#BEB7B4] rounded-lg p-2 pl-2 pr-2 h-8 text-sm font-semibold text-[#BEB7B4] hover:bg-gray-300 group-hover:text-white group-hover:border-gray-300">
                          <Cylinder className="w-4 h-4 mr-2" />
                          Unidad
                          <ChevronDown />
                        </button>
                      </div>
                    </div> */}
                    <div className="p-4 text-[#635F60] font-bold text-base">
                      {idproject && (
                        <TaskComponent
                          id_proyecto={idproject}
                          id_usuario={id}
                        />
                      )}
                    </div>
                  </div>
                </form>
              </div>
            )}
            {selectedTab === tabMapping["Accidentes"] && (
              <div>
                <div className="overflow-x-auto bg-white shadow-lg">
                  <div className="table p-4 select-none font-zen-kaku overflow-x-auto w-full min-w-full">
                    <div className="flex flex-wrap gap-8 mt-4 mb-4 justify-center custom-prevencion">
                      <TablaResumen
                        projectId={projectId}
                        selectedTab={selectedTab}
                        fetchProjects={fetchProjects}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mt-4 mb-4">
                  <div className="select-none ">
                    {/* gado */}
                    <ChartComponentaccidente
                      actualizado={actualizado}
                      projectId={projectId}
                      fetchProjects={fetchProjects}
                    />
                  </div>
                  <div className="select-none">
                    <PieChartacc
                      actualizado={actualizado}
                      accidentData={accidentData}
                      fetchProjects={fetchProjects}
                    />
                  </div>
                  <div className="select-none">
                    <ScatterChart 
                      actualizado={actualizado}
                      projectId={projectId}
                      fetchProjects={fetchProjects}
                    />
                  </div>
                  <div className="select-none">
                    <AccidentCounter
                      daysWithoutAccidents={daysWithoutAccidents}
                      actualizado={actualizado}
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {userRole === "supervisor" && (
          <>
            {selectedTab === tabMapping["General"] && (
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mt-4 mb-4">
                <div className="select-none">
                  <ProjectProgress
                    data={projectsChardata}
                    percentage={percentage}
                  />
                </div>

                {/* <div className="flex-1 min-w-[24vw] flex select-none">
                    <Estimadochart data={projectsChardata} presupuesto={presupuesto} totalGastado={totalGastado} porcentajeFormateado={porcentajeFormateado} actualizado={actualizado} />
                  </div> */}
                <div className="select-none">
                  <ChartComponent
                    actualizado={actualizado}
                    projectId={idproject}
                    porcentajefecha={porcentajefecha}
                    porcentajepartidas={porcentajepartidas}
                  />
                </div>
                <div className="select-none">
                  <LineChartComponent
                    data={projectsChardata}
                    horasPorDia={horasPorDia}
                    actualizado={actualizado}
                    projectId={idproject}
                  />
                </div>
              </div>
            )}
            {selectedTab === tabMapping["Documentos"] && (
              <div className="overflow-x-auto">
                <div className="flex flex-wrap gap-8 mt-4 mb-4 justify-center">
                  <DocumentosComponent projectId={idproject} />
                </div>
              </div>
            )}
            {selectedTab === tabMapping["Materiales"] && (
              <div className="flex flex-wrap gap-8 mt-4 mb-4">
                <form
                  className="px-10 py-2  overflow-hidden font-zen-kaku md:w-11/12 custom-nodos"
                  style={{ marginTop: "-20px" }}
                >
                  <div className="overflow-x-hidden bg-white">
                    <div className="flex items-center justify-between p-4">
                      <div className="z-50 flex space-x-4 font-zen-kaku">
                        <div className="flex flex-nowrap mb-3 border-b-2 border-[#DDD9D8] pb-2 mr-4 ml-4 rounded-sm"></div>
                      </div>
                    </div>
                    {/* <div className="flex items-center justify-start p-4 ">
                      <div className='z-40 group'>
                        <button type='button' className="flex items-center transition-all ease-linear duration-150 border z-40 border-[#BEB7B4] rounded-lg p-2 pl-2 pr-2 h-8 text-sm font-semibold text-[#BEB7B4] hover:bg-gray-300 group-hover:text-white group-hover:border-gray-300">
                          <Ticket className="w-4 h-4 mr-2 group" />
                          Item
                          <ChevronDown className='group' />
                        </button>
                      </div>
                      <div className='z-40 group'>
                        <button type='button' className="flex items-center transition-all ease-linear duration-150 border z-40 mr-4 ml-4 border-[#BEB7B4] rounded-lg p-2 pl-2 pr-2 h-8 text-sm font-semibold text-[#BEB7B4] hover:bg-gray-300 group-hover:text-white group-hover:border-gray-300">
                          <Loader className="w-4 h-4 mr-2" />
                          Partida
                          <ChevronDown />
                        </button>
                      </div>
                      <div className='z-40 group'>
                        <button type='button' className="flex items-center transition-all ease-linear duration-150 border z-40 border-[#BEB7B4] rounded-lg p-2 pl-2 pr-2 h-8 text-sm font-semibold text-[#BEB7B4] hover:bg-gray-300 group-hover:text-white group-hover:border-gray-300">
                          <Cylinder className="w-4 h-4 mr-2" />
                          Unidad
                          <ChevronDown />
                        </button>
                      </div>
                    </div> */}
                    <div className="p-4 text-[#635F60] font-bold text-base">
                      {idproject && (
                        <TaskComponent
                          id_proyecto={idproject}
                          id_usuario={id}
                        />
                      )}
                    </div>
                  </div>
                </form>
              </div>
            )}
            {selectedTab === tabMapping["Accidentes"] && (
              <div>
                <div className="overflow-x-auto bg-white shadow-lg">
                  <div className="table p-4 select-none font-zen-kaku overflow-x-auto w-full min-w-full">
                    <div className="flex flex-wrap gap-8 mt-4 mb-4 justify-center custom-prevencion">
                      <TablaResumen
                        projectId={projectId}
                        selectedTab={selectedTab}
                        fetchProjects={fetchProjects}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mt-4 mb-4">
                  <div className="select-none ">
                    {/* gado */}
                    <ChartComponentaccidente
                      actualizado={actualizado}
                      projectId={projectId}
                      fetchProjects={fetchProjects}
                    />
                  </div>
                  <div className="select-none">
                    <PieChartacc
                      actualizado={actualizado}
                      accidentData={accidentData}
                      fetchProjects={fetchProjects}
                    />
                  </div>
                  <div className="select-none">
                    <ScatterChart
                      actualizado={actualizado}
                      projectId={projectId}
                      fetchProjects={fetchProjects}
                    />
                  </div>
                  <div className="select-none">
                    <AccidentCounter
                      daysWithoutAccidents={daysWithoutAccidents}
                      actualizado={actualizado}
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {userRole === "prevencionista" && (
          <>
            {selectedTab === tabMapping["General"] && (
              <div className="xl:flex xl:flex-wrap lg:flex lg:flex-wrap md:grid md:grid-cols-1 gap-8 mt-4 mb-4 custom-dash-prev">
                <div className="flex-1 custom-dash-preve-1 md:max-w-[90vw] xl:min-w-full lg:min-w-full flex w-full h-full xl:w-full xl:lg:w-full lg:w-full lg:h-full">
                  <PieChart
                    actualizado={actualizado}
                    usuariosPorRol={usuariosPorRol}
                  />
                </div>
              </div>
            )}
            {selectedTab === tabMapping["Documentos"] && (
              <div className="flex gap-8 mt-4 mb-4 justify-center">
                <DocumentosComponent projectId={idproject} />
              </div>
            )}
            {selectedTab === tabMapping["Accidentes"] && (
              <div>
                <div className="overflow-x-auto bg-white shadow-lg">
                  <div className="table p-4 select-none font-zen-kaku overflow-x-auto w-full min-w-full">
                    <div className="flex flex-wrap gap-8 mt-4 mb-4 justify-center custom-prevencion">
                      <TablaResumen
                        projectId={projectId}
                        selectedTab={selectedTab}
                        fetchProjects={fetchProjects}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mt-4 mb-4">
                  <div className="select-none ">
                    {/* gado */}
                    <ChartComponentaccidente
                      actualizado={actualizado}
                      projectId={projectId}
                      fetchProjects={fetchProjects}
                    />
                  </div>
                  <div className="select-none">
                    <PieChartacc
                      actualizado={actualizado}
                      accidentData={accidentData}
                      fetchProjects={fetchProjects}
                    />
                  </div>
                  <div className="select-none">
                    <ScatterChart
                      actualizado={actualizado}
                      projectId={projectId}
                      fetchProjects={fetchProjects}
                    />
                  </div>
                  <div className="select-none">
                    <AccidentCounter
                      daysWithoutAccidents={daysWithoutAccidents}
                      actualizado={actualizado}
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {userRole === "supervisor de area" && (
          <>
            {selectedTab === tabMapping["General"] && (
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mt-4 mb-4">
                <div className="select-none">
                  <Estimadochart
                    data={projectsChardata}
                    presupuesto={presupuesto}
                    totalGastado={totalGastado}
                    porcentajeFormateado={porcentajeFormateado}
                    actualizado={actualizado}
                  />
                </div>
                <div className="select-none">
                  <PieChart
                    actualizado={actualizado}
                    usuariosPorRol={usuariosPorRol}
                  />
                </div>
                <div className="select-none">
                  <LineChartComponent
                    data={projectsChardata}
                    horasPorDia={horasPorDia}
                    actualizado={actualizado}
                    projectId={idproject}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default Dashroles;
