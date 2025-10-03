import React, { useState, useEffect, useCallback } from "react";
import Select from "react-select";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import es from "date-fns/locale/es";
import { Button } from "primereact/button";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { updateProject } from "@/app/services/project";
import { getProjectById } from "@/app/services/project";
import {
  getrolinspector,
  getrolsuperintendente,
  getUserITO,
  getUserplanner,
  getUsersupervisor,
  getUsersadmincontrato,
  getUserprevencionista,
} from "@/app/services/user";
import { estadodeproyecto } from "@/app/services/project";
import Loader from "@/app/dashboard/components/loader";
registerLocale("es", es);

const ProjectUpdateForm = ({ projectId }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    fecha_inicio: null,
    fecha_fin: null,
    estado: "",
    superintendente: [],
    inspector: [],
    ITO: [],
    planner: [],
    supervisor: [],
    admincontrato: [],
    prevencionista: [],
  });

  const handleGoBack = () => {
    window.history.back();
  };

  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  const userStore = useSelector((state) => state.user);
  const id = userStore.user ? `${userStore.user.id}` : "";

  // Estado para las opciones de select
  const [inspectorOptions, setInspectorOptions] = useState([]);
  const [superintendenteOptions, setSuperintendenteOptions] = useState([]);
  const [itoOptions, setITOOptions] = useState([]);
  const [plannerOptions, setPlannerOptions] = useState([]);
  const [supervisorOptions, setSupervisorOptions] = useState([]);
  const [adminContratoOptions, setAdminContratoOptions] = useState([]);
  const [prevencionistaOptions, setPrevencionistaOptions] = useState([]);
  const [estadoOptions, setEstadoOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Función para obtener las opciones de los selectores
  const fetchSelectOptions = async () => {
    setIsLoading(true);
    try {
      // Inspector
      const inspectorData = await getrolinspector();
      const formattedInspectorOptions = inspectorData.map((role) => ({
        value: role.id_user,
        label: `${role.nombre_usuario} ${role.apellido_p} ${role.apellido_m}`,
      }));
      setInspectorOptions(formattedInspectorOptions);

      // Superintendente
      const superintendenteData = await getrolsuperintendente();
      const formattedSuperintendenteOptions = superintendenteData.map((role) => ({
        value: role.id_user,
        label: `${role.nombre_usuario} ${role.apellido_p} ${role.apellido_m}`,
      }));
      setSuperintendenteOptions(formattedSuperintendenteOptions);

      // ITO
      const itoData = await getUserITO();
      const formattedITOOptions = itoData.map((role) => ({
        value: role.id,
        label: `${role.names} ${role.apellido_p} ${role.apellido_m}`,
      }));
      setITOOptions(formattedITOOptions);

      // Planner
      const plannerData = await getUserplanner();
      const formattedPlannerOptions = plannerData.map((role) => ({
        value: role.id,
        label: `${role.names} ${role.apellido_p} ${role.apellido_m}`,
      }));
      setPlannerOptions(formattedPlannerOptions);

      // Supervisor
      const supervisorData = await getUsersupervisor();
      const formattedSupervisorOptions = supervisorData.map((role) => ({
        value: role.id,
        label: `${role.names} ${role.apellido_p} ${role.apellido_m}`,
      }));
      setSupervisorOptions(formattedSupervisorOptions);

      // Admin Contrato
      const adminContratoData = await getUsersadmincontrato();
      const formattedAdminContratoOptions = adminContratoData.map((role) => ({
        value: role.id,
        label: `${role.names} ${role.apellido_p} ${role.apellido_m}`,
      }));
      setAdminContratoOptions(formattedAdminContratoOptions);

      // Prevencionista
      const prevencionistaData = await getUserprevencionista();
      const formattedPrevencionistaOptions = prevencionistaData.map((role) => ({
        value: role.id,
        label: `${role.names} ${role.apellido_p} ${role.apellido_m}`,
      }));
      setPrevencionistaOptions(formattedPrevencionistaOptions);

      // Estados
      const estadoData = await estadodeproyecto();
      const formattedEstadoOptions = estadoData.map((estado) => ({
        value: estado.id,
        label: estado.nombre,
      }));
      setEstadoOptions(formattedEstadoOptions);

    } catch (error) {
      console.error("Error fetching select options:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSelectOptions();
  }, []);

  const loadProjectData = useCallback(async () => {
    if (
      !superintendenteOptions.length ||
      !inspectorOptions.length ||
      !itoOptions.length ||
      !plannerOptions.length ||
      !supervisorOptions.length ||
      !adminContratoOptions.length ||
      !prevencionistaOptions.length
    ) {
      console.error("Las opciones no han sido cargadas correctamente.");
      return;
    }

    try {
      const projectData = await getProjectById(projectId);

      // Filtrar y mapear por rol para asignar múltiples superintendentes e inspectores
      const superintendentes = projectData.user_project_project
        .filter((user) => user.userProject_Rol.name === "superintendente")
        .map((user) =>
          superintendenteOptions.find(
            (option) => option.value === user.user_project_user.id,
          ),
        )
        .filter(Boolean);

      const inspectores = projectData.user_project_project
        .filter((user) => user.userProject_Rol.name === "inspector")
        .map((user) =>
          inspectorOptions.find(
            (option) => option.value === user.user_project_user.id,
          ),
        )
        .filter(Boolean);

      const ITOs = projectData.user_project_project
        .filter((user) => user.userProject_Rol.name === "ITO")
        .map((user) =>
          itoOptions.find(
            (option) => option.value === user.user_project_user.id,
          ),
        )
        .filter(Boolean);

      const planners = projectData.user_project_project
        .filter((user) => user.userProject_Rol.name === "planner")
        .map((user) =>
          plannerOptions.find(
            (option) => option.value === user.user_project_user.id,
          ),
        )
        .filter(Boolean);

      const supervisors = projectData.user_project_project
        .filter((user) => user.userProject_Rol.name === "supervisor")
        .map((user) =>
          supervisorOptions.find(
            (option) => option.value === user.user_project_user.id,
          ),
        )
        .filter(Boolean);

      const admincontratos = projectData.user_project_project
        .filter((user) => user.userProject_Rol.name === "administrador de contrato")
        .map((user) =>
          adminContratoOptions.find(
            (option) => option.value === user.user_project_user.id,
          ),
        )
        .filter(Boolean);

      const prevencionistas = projectData.user_project_project
        .filter((user) => user.userProject_Rol.name === "prevencionista")
        .map((user) =>
          prevencionistaOptions.find(
            (option) => option.value === user.user_project_user.id,
          ),
        )
        .filter(Boolean);

      setFormData({
        nombre: projectData.nombre || "",
        descripcion: projectData.descripcion || "",
        fecha_inicio: projectData.fecha_inicio ? new Date(projectData.fecha_inicio) : null,
        fecha_fin: projectData.fecha_fin ? new Date(projectData.fecha_fin) : null,
        estado: projectData.estado || "",
        superintendente: superintendentes,
        inspector: inspectores,
        ITO: ITOs,
        planner: planners,
        supervisor: supervisors,
        admincontrato: admincontratos,
        prevencionista: prevencionistas,
      });

    } catch (error) {
      console.error("Error loading project data:", error);
    }
  }, [
    projectId,
    superintendenteOptions,
    inspectorOptions,
    itoOptions,
    plannerOptions,
    supervisorOptions,
    adminContratoOptions,
    prevencionistaOptions,
  ]);

  useEffect(() => {
    if (
      superintendenteOptions.length &&
      inspectorOptions.length &&
      itoOptions.length &&
      plannerOptions.length &&
      supervisorOptions.length &&
      adminContratoOptions.length &&
      prevencionistaOptions.length
    ) {
      loadProjectData();
    }
  }, [
    superintendenteOptions,
    inspectorOptions,
    itoOptions,
    plannerOptions,
    supervisorOptions,
    adminContratoOptions,
    prevencionistaOptions,
    loadProjectData,
  ]);

  const handleChange = (selectedOption, actionMeta) => {
    const { name } = actionMeta;
    setFormData((prevData) => ({
      ...prevData,
      [name]: selectedOption,
    }));
  };

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setDateRange([start, end]);
    setFormData((prevData) => ({
      ...prevData,
      fecha_inicio: start,
      fecha_fin: end,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedData = {
        ...formData,
        superintendente: formData.superintendente?.map((item) => item.value) || [],
        inspector: formData.inspector?.map((item) => item.value) || [],
        ITO: formData.ITO?.map((item) => item.value) || [],
        planner: formData.planner?.map((item) => item.value) || [],
        supervisor: formData.supervisor?.map((item) => item.value) || [],
        admincontrato: formData.admincontrato?.map((item) => item.value) || [],
        prevencionista: formData.prevencionista?.map((item) => item.value) || [],
      };

      await updateProject(projectId, updatedData);
      toast.success("Proyecto actualizado exitosamente");
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("Error al actualizar el proyecto");
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Configuración del Proyecto</h2>
        <Button
          onClick={handleGoBack}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Volver
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Proyecto
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <Select
              name="estado"
              options={estadoOptions}
              value={estadoOptions.find(option => option.value === formData.estado)}
              onChange={(selectedOption) => setFormData({...formData, estado: selectedOption?.value || ""})}
              placeholder="Seleccione estado"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción
          </label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fechas del Proyecto
          </label>
          <DatePicker
            selectsRange={true}
            startDate={startDate}
            endDate={endDate}
            onChange={handleDateChange}
            locale="es"
            dateFormat="dd/MM/yyyy"
            placeholderText="Seleccionar rango de fechas"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Superintendente
              </label>
              <Select
                className="basic-single font-zen-kaku"
                classNamePrefix="select"
                isSearchable={true}
                name="superintendente"
                placeholder="Seleccione superintendente"
                options={superintendenteOptions}
                value={formData.superintendente}
                onChange={handleChange}
                isMulti
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prevencionista
              </label>
              <Select
                className="basic-single font-zen-kaku"
                classNamePrefix="select"
                isSearchable={true}
                name="prevencionista"
                placeholder="Seleccione prevencionista"
                options={prevencionistaOptions}
                value={formData.prevencionista}
                onChange={handleChange}
                isMulti
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Inspector
              </label>
              <Select
                className="basic-single font-zen-kaku"
                classNamePrefix="select"
                isSearchable={true}
                name="inspector"
                placeholder="Seleccione inspector"
                options={inspectorOptions}
                value={formData.inspector}
                onChange={handleChange}
                isMulti
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ITO
              </label>
              <Select
                className="basic-single font-zen-kaku"
                classNamePrefix="select"
                isSearchable={true}
                name="ITO"
                placeholder="Seleccione ITO"
                options={itoOptions}
                value={formData.ITO}
                onChange={handleChange}
                isMulti
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Planner
              </label>
              <Select
                className="basic-single font-zen-kaku"
                classNamePrefix="select"
                isSearchable={true}
                name="planner"
                placeholder="Seleccione planner"
                options={plannerOptions}
                value={formData.planner}
                onChange={handleChange}
                isMulti
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supervisor
              </label>
              <Select
                className="basic-single font-zen-kaku"
                classNamePrefix="select"
                isSearchable={true}
                name="supervisor"
                placeholder="Seleccione supervisor"
                options={supervisorOptions}
                value={formData.supervisor}
                onChange={handleChange}
                isMulti
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Contrato
              </label>
              <Select
                className="basic-single font-zen-kaku"
                classNamePrefix="select"
                isSearchable={true}
                name="admincontrato"
                placeholder="Seleccione admin contrato"
                options={adminContratoOptions}
                value={formData.admincontrato}
                onChange={handleChange}
                isMulti
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Actualizar Proyecto
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProjectUpdateForm;
