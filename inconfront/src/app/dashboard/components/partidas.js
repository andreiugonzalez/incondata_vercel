"use client";
import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import "../style/external_user.css";
import "../style/datepicker_new.css";
import { useSelector } from "react-redux";

import Sidebarpartida from "./new_partida";
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
  Upload,
  ChevronRight,
  FileText,
  Eye,
  Trash2,
} from "lucide-react";
import { postProject, postProjectDoc } from "@/app/services/project";
import {
  getOrganizacion,
  getUserITO,
  getUsersupervisor,
  getrolsuperintendente,
} from "@/app/services/user";
import {
  registerproject,
  getnotmyUser,
  estadodeproyecto,
} from "@/app/services/project";
import { getminasname } from "@/app/services/minas";
import toast from "react-hot-toast";
const { useRouter } = require("next/navigation");
import "../style/tooltipcs.css";
import "../style/media_query.css";

import {
  validateNombreobra,
  validateubicacion,
  validatecodigoBip,
  validateNombreunidad,
  validatesupervisor,
  validatesuperintendente,
  validaterutunidad,
  validaterutempresa,
  validatepresupuestoglobal,
  validateresponsable,
  validatemontoneto,
  validatemontototalbruto,
  validatemontomensual,
  validatetotalgeneral,
  validatelocalizacion,
  validatemina,
  validatestadoproyecto,
  validatedocumento1,
  validateDateRange,
  validateorganizacion
} from "../components/validForm/validproject.js";

import "../style/custom_icon.css";

const formatCLP = (value) => {
  console.log('DEBUG - formatCLP called with value:', value, 'type:', typeof value);
  if (value === null || value === undefined || value === '') return '';
  const num = String(value).replace(/\D/g, '');
  if (num === '') return '';
  const formatted = 'CLP$ ' + new Intl.NumberFormat('es-CL').format(num);
  console.log('DEBUG - formatCLP returning:', formatted);
  return formatted;
};

const Partidasform = ({ users }) => {
  const [showInternUser, setShowInternUser] = useState(false);
  const [showWorkData, setShowWorkData] = useState(false);
  const [isSearchable, setIsSearchable] = useState(true);
  const [autoIncremento, setAutoIncremento] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(1);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedRows, setExpandedRows] = useState([]);
  const [nestedExpandedRows, setNestedExpandedRows] = useState([]);
  const [idproject, setProjectId] = useState(null); // cambiar a null al terminar -----------------------------------------------------------------------------------------------------------------------------------------
  const [showTooltip, setShowTooltip] = useState(false);
  const [showTooltip2, setShowTooltip2] = useState(false);
  const [showTooltip3, setShowTooltip3] = useState(false);
  const [showTooltip4, setShowTooltip4] = useState(false);
  const [showTooltip5, setShowTooltip5] = useState(false);

  const router = useRouter();
  const [fileName, setFileName] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  // Estados para la simulación del selector de Organización
  const [organizacionOptions, setOrganizacionOptions] = useState([]);
  const [selectedOrganizacion, setSelectedOrganizacion] = useState(null);

  const userStore = useSelector((state) => state.user);
  const saludo = userStore.user ? `${userStore.user.names}` : "";
  const id = userStore.user ? `${userStore.user.id}` : "";

  //adjunto documentos
  const [documentoautorizacion, setdocumentoautorizacion] = useState(null);
  const [servicioSII, setservicioSII] = useState(null);
  const [polizaseguro, setpolizaseguro] = useState(null);
  const [trabajoseguro, settrabajoseguro] = useState(null);
  const [representantelegal, setrepresentantelegal] = useState(null);
  const [servicioestatus, setservicioestatus] = useState(null);
  const [garantias, setgarantias] = useState(null);
  const [cheque, setcheque] = useState(null);
  const [asociadosgarantia, setasociadosgarantia] = useState(null);
  const [segurolaboral, setsegurolaboral] = useState(null);
  const [afiliacioncaja, setafiliacioncaja] = useState(null);
  const [fotocopiacedula, setfotocopiacedula] = useState(null);

  //captura nombre
  const [documentoautorizacionFileName, setdocumentoautorizacionFileName] =
    useState("");
  const [documentoautorizacionFile, setdocumentoautorizacionFile] =
    useState(null);

  const [servicioSIIFileName, setservicioSIIFileName] = useState("");
  const [servicioSIIFile, setservicioSIIFile] = useState(null);

  const [polizaseguroFileName, setpolizaseguroFileName] = useState("");
  const [polizaseguroFile, setpolizaseguroFile] = useState(null);

  const [trabajoseguroFileName, settrabajoseguroFileName] = useState("");
  const [trabajoseguroFile, settrabajoseguroFile] = useState(null);

  const [representantelegalFileName, setrepresentantelegalFileName] =
    useState("");
  const [representantelegalFile, setrepresentantelegalFile] = useState(null);

  const [servicioestatusFileName, setservicioestatusFileName] = useState("");
  const [servicioestatusFile, setservicioestatusFile] = useState(null);

  const [garantiasFileName, setgarantiasFileName] = useState("");
  const [garantiasFile, setgarantiasFile] = useState(null);

  const [chequeFileName, setchequeFileName] = useState("");
  const [chequeFile, setchequeFile] = useState(null);

  const [asociadosgarantiaFileName, setasociadosgarantiaFileName] =
    useState("");
  const [asociadosgarantiaFile, setasociadosgarantiaFile] = useState(null);

  const [segurolaboralFileName, setsegurolaboralFileName] = useState("");
  const [segurolaboralFile, setsegurolaboralFile] = useState(null);

  const [afiliacioncajaFileName, setafiliacioncajaFileName] = useState("");
  const [afiliacioncajaFile, setafiliacioncajaFile] = useState(null);

  const [fotocopiacedulaFileName, setfotocopiacedulaFileName] = useState("");
  const [fotocopiacedulaFile, setfotocopiacedulaFile] = useState(null);

  const [formData, setFormData] = useState({
    nombre: "",
    ubicacion: "",
    codigo_bip: "",
    unidad_tecnica: "",
    supervisor: [],
    superintendente: [],
    rut_unidad_tecnica: "",
    rut_empresa: "",
    presupuesto: 0,
    duenio: "",
    monto_neto: "",
    monto_total_bruto: "",
    monto_mensual: "",
    total_general: "",
    localizacion_mina: "",
    fecha_inicio: "",
    fecha_termino: "",
    informador: "",
    descripcion: "",
    id_estadoproyecto: "",
    id_mina: "",
    avance: "",
    organizacion: "",
  });

  // Función para formatear RUT en formato XX.XXX.XXX-X con límite de 8 dígitos + 1 dígito verificador
  const formatRut = (rut) => {
    let rutClean = rut.replace(/[^0-9kK]/g, '');
    
    if (rutClean.length <= 1) return rutClean;
    
    if (rutClean.length > 9) {
      rutClean = rutClean.slice(0, 9);
    }
    
    let dv = rutClean.slice(-1);
    let rutNum = rutClean.slice(0, -1);
    
    if (rutNum.length > 8) {
      rutNum = rutNum.slice(0, 8);
    }
    
    let rutFormatted = '';
    for (let i = rutNum.length - 1; i >= 0; i--) {
      rutFormatted = rutNum.charAt(i) + rutFormatted;
      if ((rutNum.length - i) % 3 === 0 && i !== 0) {
        rutFormatted = '.' + rutFormatted;
      }
    }
    
    return rutFormatted + '-' + dv;
  };
  
  // Función para capitalizar texto (primera letra de cada palabra en mayúscula)
  const capitalizeText = (text) => {
    if (!text) return '';
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    const currencyFields = ['presupuesto', 'monto_neto', 'monto_total_bruto', 'monto_mensual'];
    const rutFields = ['rut_unidad_tecnica', 'rut_empresa'];
    const nameFields = ['nombre', 'unidad_tecnica', 'duenio', 'informador'];
    
    if (rutFields.includes(name)) {
      const formattedRut = formatRut(value);
      setFormData({
        ...formData,
        [name]: formattedRut
      });
    } else if (nameFields.includes(name)) {
      const capitalizedText = capitalizeText(value);
      setFormData({
        ...formData,
        [name]: capitalizedText
      });
    } else if (currencyFields.includes(name)) {
      const numericValue = value.replace(/\D/g, '');
      setFormData(prevState => {
        const updatedState = {
          ...prevState,
          [name]: numericValue,
        };
        
        if (name === 'monto_neto' && numericValue) {
          const montoNetoFloat = parseFloat(numericValue);
          if (!isNaN(montoNetoFloat) && montoNetoFloat > 0) {
            const iva = montoNetoFloat * 0.19;
            const total = montoNetoFloat + iva;
            console.log('DEBUG - Calculating total_general:', {
              monto_neto: numericValue,
              montoNetoFloat: montoNetoFloat,
              iva: iva,
              total: total,
              isNaN: isNaN(total)
            });
            updatedState.total_general = Math.round(total);
          } else {
            updatedState.total_general = '';
          }
        } else if (name === 'monto_neto' && !numericValue) {
          updatedState.total_general = '';
        }
        
        return updatedState;
      });
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleSelect = (e) => {
    const fieldName = e.name;
    const fieldValue = e.value;

    setFormData((prevState) => ({
      ...prevState,
      [fieldName]: fieldValue,
    }));
  };



  const cancelarform = () => {
    router.push("/dashboard/dashboardproyect");
  };

  const handleNextStep = () => {
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handleStepChange = (nextStep) => {
    if (validateForm()) {
      setStep(nextStep);
      setCurrentStep(nextStep);
    } else {
      toast.error("Formulario incompleto o con errores");
    }
  };

  const stepsTotal = 2;
  const stepTitles = [
    "Datos del proyecto", 
    "Carga de documentos",
  ];


  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // useEffect para cargar las organizaciones
  useEffect(() => {
    const fetchOrganizaciones = async () => {
      try {
        console.log("🔍 Iniciando carga de organizaciones...");
        const data = await getOrganizacion();
        console.log("📊 Datos de organizaciones recibidos:", data);
        const options = data.map((org) => ({
          value: org.id,
          label: org.nombre,
        }));
        console.log("🏢 Opciones de organización formateadas:", options);
        setOrganizacionOptions(options);
        console.log("✅ organizacionOptions actualizado");
      } catch (error) {
        console.error("❌ Error fetching organizaciones:", error);
      }
    };
    fetchOrganizaciones();
  }, []);



  // Estado para las opciones de supervisor
  const [supervisorOptions, setsupervisorOptions] = useState([]);
  const [selectedsupervisor, setsupervisor] = useState(null);

  useEffect(() => {
    const fetchsupervisorOptions = async () => {
      try {
        const data = await getUsersupervisor();
        const formattedOptions = data.map((role) => ({
          value: role.id_user,
          label: `${role.nombre_usuario} ${role.apellido_p} ${role.apellido_m}`,
        }));
        setsupervisorOptions(formattedOptions);
      } catch (error) {
        console.error("Error fetching supervisor options:", error);
      }
    };

    fetchsupervisorOptions();
  }, []);

  const handleSelectsupervisor = (selectedOptions) => {
    setFormData((prevState) => ({
      ...prevState,
      supervisor: selectedOptions ? selectedOptions : [],
    }));
  };

  // Estado para las opciones de inspector
  const [superintendenteOptions, setsuperintendenteOptions] = useState([]);
  const [selectedsuperintendente, setsuperintendente] = useState(null);

  useEffect(() => {
    const fetchsuperintendenteOptions = async () => {
      try {
        const data = await getrolsuperintendente();
        const formattedOptions = data.map((role) => ({
          value: role.id_user,
          label: `${role.nombre_usuario} ${role.apellido_p} ${role.apellido_m}`,
        }));
        setsuperintendenteOptions(formattedOptions);
      } catch (error) {
        console.error("Error fetching superintendente options:", error);
      }
    };

    fetchsuperintendenteOptions();
  }, []);

  const handleSelectsuperintendente = (selectedOptions) => {
    setFormData((prevState) => ({
      ...prevState,
      superintendente: selectedOptions ? selectedOptions : [],
    }));
  };
  // Estado para las opciones de minas
  const [minaOptions, setminaOptions] = useState([]);
  const [selectedmina, setmina] = useState(null);

  useEffect(() => {
    const fetchminaOptions = async () => {
      try {
        const data = await getminasname();
        const formattedOptions = data.map((mines) => ({
          value: mines.id_mina,
          label: mines.nombre_mina,
        }));
        setminaOptions(formattedOptions);
      } catch (error) {
        console.error("Error fetching mina options:", error);
      }
    };

    fetchminaOptions();
  }, []);

  const handleSelectmina = (selectedOption) => {
    setmina(selectedOption);

    setFormData((prevState) => ({
      ...prevState,
      mina: selectedOption ? selectedOption.value : null,
    }));
  };

  //Selector de usuarios a excepcion con el que se logea.
  // Estado para las opciones de usuarios
  const [userOptions, setuserOptions] = useState([]);
  const [selectedUser, setUser] = useState(null);

  useEffect(() => {
    const fetchuserOptions = async () => {
      try {
        const data = await getnotmyUser(id);

        const formattedOptions = data.map((user) => ({
          value: user.id_usuario,
          label: `${user.nombre_usuario} ${user.apellido_paterno} ${user.apellido_materno}`,
        }));

        setuserOptions(formattedOptions);
      } catch (error) {
        console.error("Error fetching user options:", error);
      }
    };

    fetchuserOptions();
  }, [id]);

  const handleSelectUser = (selectedOption) => {
    setUser(selectedOption);

    setFormData((prevState) => ({
      ...prevState,
      duenio: selectedOption ? selectedOption.label : null,
    }));
  };

  //Selector de estado de proyecto
  const [estadoOptions, setestadoOptions] = useState([]);
  const [selectedEstado, setEstado] = useState(null);

  useEffect(() => {
    const fetchestadoOptions = async () => {
      try {
        const data = await estadodeproyecto();

        // Formatear las opciones de usuarios
        const formattedOptions = data.map((estado) => ({
          value: estado.id_estado,
          label: estado.nombre_estado,
        }));

        setestadoOptions(formattedOptions);
      } catch (error) {
        console.error("Error fetching estado options:", error);
      }
    };

    fetchestadoOptions();
  }, []);

  const handleSelectEstado = (selectedOption) => {
    setEstado(selectedOption);

    setFormData((prevState) => ({
      ...prevState,
      estado: selectedOption ? selectedOption.value : null,
    }));
  };

  const formatDate = (date) => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  //validators

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    // Validar nombre
    newErrors.nombre = validateNombreobra(formData.nombre);
    
    // Validar ubicación
    newErrors.ubicacion = validateubicacion(formData.ubicacion);
    
    // Validar código BIP
    newErrors.codigo_bip = validatecodigoBip(formData.codigo_bip);
    
    // Validar unidad técnica
    newErrors.unidad_tecnica = validateNombreunidad(formData.unidad_tecnica);
    
    // Validar empresa
    newErrors.organizacion = validateorganizacion(formData.organizacion);
    
    // Validar supervisor
    newErrors.supervisor = validatesupervisor(formData.supervisor);
    
    // Validar superintendente
    newErrors.superintendente = validatesuperintendente(formData.superintendente);
    
    // Validar RUT unidad técnica
    newErrors.rut_unidad_tecnica = validaterutunidad(formData.rut_unidad_tecnica);
    
    // Validar RUT empresa
    newErrors.rut_empresa = validaterutempresa(formData.rut_empresa);
    
    // Validar presupuesto
    newErrors.presupuesto = validatepresupuestoglobal(formData.presupuesto);
    
    // Validar dueño/responsable
    newErrors.duenio = validateresponsable(formData.duenio);
    
    // Validar monto neto
    newErrors.monto_neto = validatemontoneto(formData.monto_neto);
    
    // Validar monto total bruto
    newErrors.monto_total_bruto = validatemontototalbruto(formData.monto_total_bruto);
    
    // Validar monto mensual
    newErrors.monto_mensual = validatemontomensual(formData.monto_mensual);
    
    // Validar total general
    newErrors.total_general = validatetotalgeneral(formData.total_general);
    
    // Validar localización mina
    newErrors.localizacion_mina = validatelocalizacion(formData.localizacion_mina);
    
    // Validar fechas
    const dateRangeError = validateDateRange(formData.fecha_inicio, formData.fecha_termino);
    if (dateRangeError) {
      newErrors.fecha_inicio = dateRangeError;
    }
    
    // Validar mina
    newErrors.mina = validatemina(formData.mina);
    
    // Validar estado
    newErrors.estado = validatestadoproyecto(formData.estado);
    
    setErrors(newErrors);
    const isValid = Object.values(newErrors).every((error) => error === "");
    
    return isValid;
  };

  const validateformdocuments = () => {
    const newErrors = {};
    newErrors.documentoautorizacion = validatedocumento1(documentoautorizacion);
    newErrors.servicioSII = validatedocumento1(servicioSII);
    newErrors.polizaseguro = validatedocumento1(polizaseguro);
    newErrors.trabajoseguro = validatedocumento1(trabajoseguro);
    newErrors.representantelegal = validatedocumento1(representantelegal);
    newErrors.servicioestatus = validatedocumento1(servicioestatus);
    newErrors.garantias = validatedocumento1(garantias);
    newErrors.cheque = validatedocumento1(cheque);
    newErrors.asociadosgarantia = validatedocumento1(asociadosgarantia);
    newErrors.segurolaboral = validatedocumento1(segurolaboral);
    newErrors.afiliacioncaja = validatedocumento1(afiliacioncaja);
    newErrors.fotocopiacedula = validatedocumento1(fotocopiacedula);
    setErrors(newErrors);
    return Object.values(newErrors).every((error) => error === "");
  };

  const postCreateproyect = async () => {
    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);

    // Debug: verificar datos antes de enviar
    console.log('DEBUG - formData.organizacion:', formData.organizacion);
    console.log('DEBUG - organizacion_id que se enviará:', formData.organizacion ? formData.organizacion.value : null);

    const proyecto = {
      nombre: formData.nombre,
      ubicacion: formData.ubicacion,
      codigo_bip: formData.codigo_bip,
      unidad_tecnica: formData.unidad_tecnica,
      supervisor: Array.isArray(formData.supervisor) && formData.supervisor.length > 0 ? formData.supervisor[0].value : null,
      superintendente: Array.isArray(formData.superintendente) && formData.superintendente.length > 0 ? formData.superintendente[0].value : null,
      rut_unidad_tecnica: formData.rut_unidad_tecnica,
      rut_empresa: formData.rut_empresa,
      presupuesto: formData.presupuesto,
      duenio: formData.duenio,
      monto_neto: formData.monto_neto,
      monto_total_bruto: formData.monto_total_bruto,
      monto_mensual: formData.monto_mensual,
      total_general: formData.total_general,
      localizacion_mina: formData.localizacion_mina,
      fecha_inicio: formData.fecha_inicio,
      fecha_termino: formData.fecha_termino,
      id_estadoproyecto: formData.estado,
      id_mina: formData.mina,
      organizacion_id: formData.organizacion ? formData.organizacion.value : null,
      informador: saludo,
      avance: "0",
    };

    console.log('DEBUG - Proyecto completo a enviar:', proyecto);

    try {
      const response = await registerproject(proyecto);

      if (response && response.data && response.data.idproject) {
        const idproject = response.data.idproject;

        setProjectId(idproject);

        const documents = [
          { file: documentoautorizacion, name: "Documento de autorizacion" },
          {
            file: servicioSII,
            name: "Servicios de impuestos internos tributarios",
          },
          { file: polizaseguro, name: "Poliza de seguro" },
          { file: trabajoseguro, name: "Taza de trabajo seguro" },
          {
            file: representantelegal,
            name: "Representante legal y sociedad actualizada",
          },
          { file: servicioestatus, name: "Servicios de estatutos" },
          { file: garantias, name: "Garantias" },
          { file: cheque, name: "Cheque" },
          { file: asociadosgarantia, name: "Asociados a garantia" },
          { file: segurolaboral, name: "Seguro laboral" },
          { file: afiliacioncaja, name: "Afiliacion a caja de compesacion" },
          { file: fotocopiacedula, name: "DNI" },
        ];

        for (const doc of documents) {
          if (doc.file) {
            const formData = new FormData();
            formData.append("file", doc.file);
            formData.append("projectId", idproject);
            formData.append("document_type", doc.name);
            await postProjectDoc(formData);
            // toast.success(`Documento, ${doc.name} subido correctamente`);
            setShowConfirm(true);
          }
        }
      }
      toast.success("Proyecto creado correctamente");
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Error al crear el proyecto");
    }
  };

  const accept = () => {
    console.log('DEBUG - accept() function called');
    // Lógica para aceptar el mensaje de confirmación
    setShowConfirm(false);
    console.log('DEBUG - Calling postCreateproyect()');
    postCreateproyect();
    // Redirigir al dashboard después de crear el proyecto
    router.push("/dashboard/dashboardproyect");
  };

  const reject = () => {
    console.log('DEBUG - reject() function called');
    // Lógica para rechazar el mensaje de confirmación
    setShowConfirm(false);
  };

  const manejarCambioArchivo = (e, setFile, setFileName) => {
    const archivo = e.target.files[0];
    if (archivo) {
      setFile(archivo);
      setFileName(archivo.name);
    }
  };

  const eliminarArchivo = (setFile, setFileName) => {
    setFile(null);
    setFileName("");
  };

  const onclicknextform = (e) => {
    e.preventDefault();
    
    const isValid = validateForm();
    
    if (isValid) {
      handleStepChange(currentStep + 1);
      toast.success("Datos del formulario correctos");
    } else {
      toast.error("Por favor, corrija los errores en el formulario");
    }
  };
  const onclickfinishform = (e) => {
    console.log('DEBUG - onclickfinishform() called in step 2');
    e.preventDefault();
    // if (validateformdocuments()) {
    console.log('DEBUG - Setting showConfirm to true');
    setShowConfirm(true);
    // } else {
    //     toast.error('Por favor, adjunte los archivos necesarios');
    // }
  };

  return (
    <div className="flex flex-col w-full h-screen overflow-x-hidden bg-gray-800 bg-opacity-75">
      <div className="flex-grow justify-center items-center font-zen-kaku bg-[#FAFAFA] p-4 select-none overflow-x-hidden">
        <div className="mt-3"></div>
        <div className="flex items-center justify-between gap-4 mb-8 select-none custom-label-user">
          <label
            htmlFor="filtroSelect"
            className="mx-auto text-3xl font-extrabold text-gray-800 select-none font-zen-kaku text-center"
          >
            | Nuevo proyecto |
          </label>
        </div>
        <div className="mx-auto overflow-x-hidden bg-white shadow-lg rounded-xl">
          <div className="flex flex-col lg:flex-row custom-partidas-container p-4">
            {/* Progress Bar Section */}
            <div className="custom-partidas-progress">
              <div className="flex flex-col lg:flex-col items-start custom-progress">
                {[...Array(stepsTotal)].map((_, index) => (
                  <div key={index} className="flex flex-row items-center mb-4 w-full">
                    {/* Número del paso */}
                    <span
                      className={`font-zen-kaku rounded-full h-8 w-8 flex justify-center items-center cursor-pointer mr-2 transition-transform hover:scale-110 ease-linear
                                        ${index === 0
                                            ? "bg-[#5C7891] text-white"
                                            : currentStep === index + 1
                                              ? "bg-[#5C7891] text-white ring-1 ring-[#597387] border-white border-4"
                                              : currentStep === index + 2
                                                ? "bg-[#5C7891] text-white border-[#597387]"
                                                : "border border-gray-400 text-gray-400"
                                        }`}
                      onClick={() => handleStepChange(index + 1)}
                    >
                      {index + 1}
                    </span>

                    <span className="text-sm font-semibold text-black font-zen-kaku">
                      {stepTitles[index]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Section */}
            <div className="custom-partidas-form">
              {step === 1 && (
                <form className="px-4 lg:px-10 mx-auto font-zen-kaku custom-form-proyect1">
                  <div className="flex flex-wrap mb-3 custom-form-project">
                    <div className="relative w-full px-3 md:mb-0">
                      <label className="font-semibold font-zen-kaku">
                        Nombre de la obra
                      </label>
                  <input
                    className="relative w-full px-3 py-2 border border-gray-300 rounded font-zen-kaku bg-white focus:outline-none focus:border-[#7fa1c6] transition-colors"
                    id="grid-first-name"
                    type="text"
                    placeholder="Ingresar nombre de obra"
                    aria-label="Campo de ingreso nombre de obra"
                    name="nombre"
                    onChange={handleInput}
                    value={formData.nombre}
                  />
                  {errors.nombre && (
                    <p className="text-sm text-red-500">{errors.nombre}</p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap mb-3 custom-form-project">
                <div className="relative w-full md:w-1/3 px-3 md:mb-0">
                  <label className="font-semibold font-zen-kaku">
                    Ubicación
                  </label>
                  <input
                    className="relative w-full px-3 py-2 border border-gray-300 rounded font-zen-kaku bg-white focus:outline-none focus:border-[#7fa1c6] transition-colors"
                    id="grid-first-name"
                    type="text"
                    placeholder="Ingresar ubicación"
                    aria-label="Campo de ingreso ubicación"
                    name="ubicacion"
                    onChange={handleInput}
                    value={formData.ubicacion}
                  />
                  {errors.ubicacion && (
                    <p className="text-sm text-red-500">{errors.ubicacion}</p>
                  )}
                </div>
                <div className="relative w-full md:w-1/3 px-3 md:mb-0">
                  <label className="font-semibold font-zen-kaku">
                    Código bip
                  </label>
                  <input
                    className="relative w-full px-3 py-2 border border-gray-300 rounded font-zen-kaku bg-white focus:outline-none focus:border-[#7fa1c6] transition-colors"
                    id="grid-first-name"
                    type="text"
                    placeholder="Ingresar código bip"
                    aria-label="Campo de ingreso codigo bip"
                    name="codigo_bip"
                    onChange={handleInput}
                    value={formData.codigo_bip}
                  />
                  {errors.codigo_bip && (
                    <p className="text-sm text-red-500">{errors.codigo_bip}</p>
                  )}
                </div>
                <div className="relative w-full md:w-1/3 px-3 md:mb-0">
                  <label className="font-semibold font-zen-kaku">
                    Nombre Unidad Técnica
                  </label>
                  <input
                    className="relative w-full px-3 py-2 border border-gray-300 rounded font-zen-kaku bg-white focus:outline-none focus:border-[#7fa1c6] transition-colors"
                    id="grid-first-name"
                    type="text"
                    placeholder="Ingresar nombre unidad técnica"
                    aria-label="Campo de ingreso nombre unidad tecnica"
                    name="unidad_tecnica"
                    onChange={handleInput}
                    value={formData.unidad_tecnica}
                  />
                  {errors.unidad_tecnica && (
                    <p className="text-sm text-red-500">{errors.unidad_tecnica}</p>
                  )}
                </div>
              </div>
              <div className="flex mt-1 mb-3 flex-wrap">
                <div className="w-full px-3 md:w-1/2 md:mb-0">
                  <label className="font-semibold font-zen-kaku">
                    Empresa
                  </label>
                  <Select
                    className={`basic-single font-zen-kaku`}
                    classNamePrefix="select"
                    isSearchable={true}
                    name="organizacion"
                    placeholder="Seleccione una empresa"
                    aria-label="Campo de seleccion empresa"
                    options={organizacionOptions}
                    value={formData.organizacion}
                    onChange={(selectedOption) => {
                      console.log("🏢 Organización seleccionada:", selectedOption);
                      console.log("📋 organizacionOptions disponibles:", organizacionOptions);
                      setFormData(prevState => ({
                        ...prevState,
                        organizacion: selectedOption
                      }));
                    }}
                    menuPortalTarget={document.body}
                    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                  />
                  {errors.organizacion && (
                    <p className="text-sm text-red-500">Debe seleccionar una empresa</p>
                  )}
                </div>
                <div className="w-full px-3 md:w-1/2 md:mb-0">
                  <label className="font-semibold font-zen-kaku">
                    Supervisor
                  </label>
                  <Select
                    className={`basic-single font-zen-kaku`}
                    classNamePrefix="select"
                    isSearchable={isSearchable}
                    name="supervisor"
                    placeholder="Seleccione Supervisor"
                    aria-label="Campo de seleccion Supervisor"
                    options={supervisorOptions}
                    isMulti
                    value={formData.supervisor}
                    onChange={handleSelectsupervisor}
                    styles={{
                      menu: (base) => ({
                        ...base,
                        zIndex: 9999,
                        backgroundColor: 'white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }),
                      control: (base) => ({
                        ...base,
                        backgroundColor: 'white',
                        borderColor: '#e5e7eb',
                        '&:hover': {
                          borderColor: '#7fa1c6'
                        },
                        boxShadow: 'none'
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isSelected ? '#7fa1c6' : 'white',
                        '&:hover': {
                          backgroundColor: '#e5e7eb'
                        }
                      })
                    }}
                  />
                  {errors.supervisor && (
                    <p className="text-sm text-red-500">{errors.supervisor}</p>
                  )}
                </div>
                <div className="w-full px-3 md:w-1/2 md:mb-0">
                  <label className="font-semibold font-zen-kaku">
                    Alcalde
                  </label>
                  <Select
                    className={`basic-single font-zen-kaku`}
                    classNamePrefix="select"
                    isSearchable={isSearchable}
                    name="superintendente"
                    placeholder="Seleccione alcalde"
                    aria-label="Campo de seleccion alcalde"
                    options={superintendenteOptions}
                    isMulti
                    value={formData.superintendente}
                    onChange={handleSelectsuperintendente}
                  />
                  {errors.superintendente && (
                    <p className="text-sm text-red-500">
                      {errors.superintendente}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap mb-3">
                <div className="w-full px-3 mb-6 md:w-1/3 md:mb-0">
                  <label className="font-semibold font-zen-kaku">
                    Rut unidad técnica
                  </label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded font-zen-kaku"
                    id="grid-first-name"
                    type="text"
                    placeholder="Ingresar rut unidad técnica"
                    aria-label="Campo de ingreso RUT unidad técnica"
                    name="rut_unidad_tecnica"
                    onChange={handleInput}
                    value={formData.rut_unidad_tecnica}
                  />
                  {errors.rut_unidad_tecnica && (
                    <p className="text-sm text-red-500">
                      {errors.rut_unidad_tecnica}
                    </p>
                  )}
                </div>
                <div className="w-full px-3 md:w-1/3 md:mb-0">
                  <label className="font-semibold font-zen-kaku">
                    Rut empresa
                  </label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded font-zen-kaku"
                    id="grid-first-name"
                    type="text"
                    placeholder="Ingresar rut empresa"
                    aria-label="Campo de ingreso RUT empresa"
                    name="rut_empresa"
                    onChange={handleInput}
                    value={formData.rut_empresa}
                  />
                  {errors.rut_empresa && (
                    <p className="text-sm text-red-500">{errors.rut_empresa}</p>
                  )}
                </div>
              </div>
              <div className="flex flex-auto ">
                <label className="ml-3 font-semibold font-zen-kaku">
                  Fecha de inicio y termino de proyecto
                </label>
              </div>
              <div className="flex flex-auto mt-2 mb-3 md:w-2/6">
                <div className="w-full px-3 mb-6 customDatePickerWidth md:w-1/2 md:mb-0">
                  <DatePicker
                    selectsRange={true}
                    startDate={startDate}
                    endDate={endDate}
                    // onChange={(update) => {
                    //   setDateRange(update);
                    // }}
                    onChange={(update) => {
                      setDateRange(update);
                      const [start, end] = update;
                      setFormData({
                        ...formData,
                        fecha_inicio: formatDate(start),
                        fecha_termino: formatDate(end),
                      });
                    }}
                    isClearable={true}
                    name="rango_fecha"
                    placeholderText="Seleccionar fechas"
                    aria-label="Campo de ingreso fechas"
                    locale="es"
                    className="font-zen-kaku px-3 py-1.5  border-gray-300 rounded w-full border "
                    dateFormat="yyyy/MM/dd"
                  />
                  {errors.fecha_inicio && (
                    <p className="text-sm text-red-500">
                      {errors.fecha_inicio}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-auto mb-3 custom-form-project">
                <div className="w-full px-3 md:mb-0">
                  <label className="font-semibold font-zen-kaku">
                    Responsable de proyecto
                  </label>
                  <Select
                    className={`basic-single font-zen-kaku `}
                    classNamePrefix="select"
                    isSearchable={isSearchable}
                    name="duenio"
                    placeholder="Seleccionar responsable del proyecto"
                    aria-label="Campo de ingreso responsable del proyecto"
                    value={userOptions.find(
                      (option) => option.value === formData.duenio,
                    )}
                    options={userOptions}
                    onChange={handleSelectUser}
                  />
                  {errors.duenio && (
                    <p className="text-sm text-red-500">{errors.duenio}</p>
                  )}
                </div>
                <div className="w-full px-3 mb-6 md:mb-0 relative">
                  <label className="font-semibold font-zen-kaku">
                    Presupuesto global
                  </label>
                  <input
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    className="w-full flex-shrink-0 px-3 py-2 border border-gray-300 rounded font-zen-kaku"
                    id="grid-last-name"
                    type="text"
                    placeholder="Presupuesto global"
                    aria-label="Campo de ingreso presupuesto global"
                    name="presupuesto"
                    onChange={handleInput}
                    value={formatCLP(formData.presupuesto)}
                  />
                  {showTooltip && (
                    <div className="tooltip">
                      Presupuesto global tiene IVA y utilidades de empresa.
                    </div>
                  )}
                  {errors.presupuesto && (
                    <p className="text-sm text-red-500">{errors.presupuesto}</p>
                  )}
                </div>
                <div className="w-full px-3 mb-6 md:mb-0 relative">
                  <label className="font-semibold font-zen-kaku">
                    Monto neto
                  </label>
                  <input
                    onMouseEnter={() => setShowTooltip2(true)}
                    onMouseLeave={() => setShowTooltip2(false)}
                    className="w-full px-3 py-2 border border-gray-300 rounded font-zen-kaku"
                    id="grid-last-name"
                    type="text"
                    placeholder="Ingrese monto neto"
                    aria-label="Campo de ingreso monto neto"
                    name="monto_neto"
                    onChange={handleInput}
                    value={formatCLP(formData.monto_neto)}
                  />
                  {showTooltip2 && (
                    <div className="tooltip">Monto neto sin IVA. El Total General se calculará automáticamente.</div>
                  )}
                  {errors.monto_neto && (
                    <p className="text-sm text-red-500">{errors.monto_neto}</p>
                  )}
                </div>
              </div>
              <div className="flex mt-1 mb-3 flex-nowrap custom-form-project">
                <div className="w-full px-3 mb-6 md:w-1/2 md:mb-0 relative">
                  <label className="font-semibold font-zen-kaku">
                    Monto total bruto
                  </label>
                  <input
                    onMouseEnter={() => setShowTooltip3(true)}
                    onMouseLeave={() => setShowTooltip3(false)}
                    className="w-full px-3 py-2 border border-gray-300 rounded font-zen-kaku"
                    id="grid-last-name"
                    type="text"
                    placeholder="Ingrese monto total"
                    aria-label="Campo de ingreso monto total"
                    name="monto_total_bruto"
                    onChange={handleInput}
                    value={formatCLP(formData.monto_total_bruto)}
                  />
                  {showTooltip3 && (
                    <div className="tooltip">Monto total bruto sin IVA.</div>
                  )}
                  {errors.monto_total_bruto && (
                    <p className="text-sm text-red-500">
                      {errors.monto_total_bruto}
                    </p>
                  )}
                </div>
                <div className="w-full px-3 mb-6 md:w-1/2 md:mb-0 relative">
                  <label className="font-semibold font-zen-kaku">
                    Monto mensual
                  </label>
                  <input
                    onMouseEnter={() => setShowTooltip4(true)}
                    onMouseLeave={() => setShowTooltip4(false)}
                    className="w-full px-3 py-2 border border-gray-300 rounded font-zen-kaku"
                    id="grid-last-name"
                    type="text"
                    placeholder="Ingrese Monto"
                    aria-label="Campo de ingreso monto"
                    name="monto_mensual"
                    onChange={handleInput}
                    value={formatCLP(formData.monto_mensual)}
                  />
                  {showTooltip4 && (
                    <div className="tooltip">
                      Monto mensual es el que se asignará según programación de
                      avance planeado.
                    </div>
                  )}
                  {errors.monto_mensual && (
                    <p className="text-sm text-red-500">
                      {errors.monto_mensual}
                    </p>
                  )}
                </div>
                <div className="w-full px-3 mb-6 md:w-1/2 md:mb-0 relative">
                  <label className="font-semibold font-zen-kaku">
                    Total general
                  </label>
                  <input
                    onMouseEnter={() => setShowTooltip5(true)}
                    onMouseLeave={() => setShowTooltip5(false)}
                    className="w-full px-3 py-2 border border-gray-300 rounded font-zen-kaku bg-gray-100"
                    id="grid-last-name"
                    type="text"
                    placeholder="Cálculo automático"
                    aria-label="Campo de ingreso cálculo automatico"
                    name="total_general"
                    readOnly
                    value={formatCLP(formData.total_general)}
                  />
                  {showTooltip5 && (
                    <div className="tooltip">
                      Total general (Monto Neto + 19% IVA).
                    </div>
                  )}
                  {errors.total_general && (
                    <p className="text-sm text-red-500">
                      {errors.total_general}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap mb-3">
                <div className="w-full px-3 mb-6 md:w-1/3 md:mb-0">
                  <label className="font-semibold font-zen-kaku">
                    Localización de la obra
                  </label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded font-zen-kaku"
                    id="grid-last-name"
                    type="text"
                    placeholder="Geolocalización"
                    aria-label="Campo de ingreso geolocalización"
                    name="localizacion_mina"
                    onChange={handleInput}
                    value={formData.localizacion_mina}
                  />
                  {errors.localizacion_mina && (
                    <p className="text-sm text-red-500">
                      {errors.localizacion_mina}
                    </p>
                  )}
                </div>
                {/* <div className='flex items-center w-full px-3 mb-6 md:w-1/3 md:mb-0'>
                  <button
                    type="button"
                    className="px-3 py-2 border rounded-l bg-[#D2E7E4] hover:bg-[#a9bebb] font-semibold"
                    onMouseDown={() => setAutoIncremento('decremento')}
                    onMouseUp={() => setAutoIncremento(null)}
                    onMouseLeave={() => setAutoIncremento(null)}
                    onClick={decrementar}
                  >-</button>
                  <input
                    className="w-full px-3 py-2 text-center font-zen-kaku"
                    type="text"
                    readOnly
                    value={formData.cant_partidas.toString()}
                  />
                  <button
                    type="button"
                    className="px-3 py-2 border rounded-r bg-[#5D8F89] hover:bg-[#49706c] font-semibold"
                    onMouseDown={() => setAutoIncremento('incremento')}
                    onMouseUp={() => setAutoIncremento(null)}
                    onMouseLeave={() => setAutoIncremento(null)}
                    onClick={incrementar}
                  >+</button>
                </div> */}
                <div className="w-full px-3 md:w-1/3 md:mb-0">
                  <label className="font-semibold font-zen-kaku">Obra</label>
                  <Select
                    className={`basic-single font-zen-kaku `}
                    classNamePrefix="select"
                    isSearchable={isSearchable}
                    name="mina"
                    placeholder="Seleccione obra"
                    aria-label="Campo seleccionable de obra"
                    options={minaOptions}
                    value={minaOptions.find(
                      (option) => option.value === formData.mina,
                    )}
                    onChange={handleSelectmina}
                  />
                  {errors.mina && (
                    <p className="text-sm text-red-500">{errors.mina}</p>
                  )}
                </div>
                <div className="w-full px-3 md:w-1/3 md:mb-0">
                  <label className="font-semibold font-zen-kaku">
                    Estado del proyecto
                  </label>
                  <Select
                    className={`basic-single font-zen-kaku `}
                    classNamePrefix="select"
                    isSearchable={isSearchable}
                    name="estado"
                    placeholder="Seleccione estado del proyecto"
                    aria-label="Campo seleccionable de estado del proyecto "
                    options={estadoOptions}
                    value={estadoOptions.find(
                      (option) => option.value === formData.estado,
                    )}
                    onChange={handleSelectEstado}
                  />
                  {errors.estado && (
                    <p className="text-sm text-red-500">{errors.estado}</p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap justify-end ml-16 font-zen-kaku">
                <div className="flex h-12 mb-4 rounded-lg justify-content-center w-38">
                  <button
                    type="button"
                    onClick={cancelarform}
                    className="mr-10 text-lg font-zen-kaku text-zinc-500 hover:text-zinc-600"
                  >
                    Cancelar{" "}
                  </button>
                  <Button
                    type="Siguiente"
                    onClick={onclicknextform}
                    icon="pi pi-check"
                    label="Guardar datos"
                    className="px-10 font-semibold text-white bg-[#5C7891] rounded-lg hover:bg-[#597387]"
                  />
                </div>
              </div>
            </form>
          )}
          {step === 3 && (
            // Aquí se mostraría el segundo paso del formulario
            <form
              className="px-10 py-2 mx-auto  font-zen-kaku md:w-3/4 custom-form-proyect3"
              /*style={{ marginTop: "-120px" }}*/
            >
              <div className="overflow-x-hidden bg-white">
                <div className="flex items-center justify-between p-4">
                  <div className="z-50 flex space-x-4 font-zen-kaku">
                    <Box sx={{ width: "100%", bgcolor: "background.paper" }}>
                      <Tabs
                        value={value}
                        onChange={handleChange}
                        aria-label="basic tabs example"
                        sx={{
                          "& .MuiTabs-indicator": {
                            backgroundColor: "#38b2ac", // Este es el color equivalente a bg-teal-500 en Tailwind CSS
                          },
                        }}
                      >
                        <Tab
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            flexDirection: "row",
                            gap: "8px",
                            fontFamily: '"zen kaku gothic antique", sans-serif',
                            textTransform: "capitalize",
                          }}
                          icon=<Crown />
                          label="Por partida"
                        />
                        <Tab
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            flexDirection: "row",
                            gap: "8px",
                            fontFamily: '"zen kaku gothic antique", sans-serif',
                            textTransform: "capitalize",
                          }}
                          icon=<List />
                          label="Todas las partidas"
                        />
                        <Tab
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            flexDirection: "row",
                            gap: "8px",
                            fontFamily: '"zen kaku gothic antique", sans-serif',
                            textTransform: "capitalize",
                          }}
                          icon=<Calendar />
                          label="Calendario"
                        />
                        <Tab
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            flexDirection: "row",
                            gap: "8px",
                            fontFamily: '"zen kaku gothic antique", sans-serif',
                            textTransform: "capitalize",
                          }}
                          icon=<User />
                          label="Creadas por mi"
                        />
                      </Tabs>
                    </Box>
                    <div className="flex flex-nowrap mb-3 border-b-2 border-[#DDD9D8] pb-2 mr-4 ml-4 rounded-sm"></div>
                  </div>
                </div>
                <div className="flex items-center justify-start p-4 ">
                  <div className="z-40 group">
                    <button
                      type="button"
                      className="flex items-center transition-all ease-linear duration-150 border z-40 border-[#BEB7B4] rounded-lg p-2 pl-2 pr-2 h-8 text-sm font-semibold text-[#BEB7B4] hover:bg-gray-300 group-hover:text-white group-hover:border-gray-300"
                    >
                      <Ticket className="w-4 h-4 mr-2 group" />
                      Item
                      <ChevronDown className="group" />
                    </button>
                  </div>
                  <div className="z-40 group">
                    <button
                      type="button"
                      className="flex items-center transition-all ease-linear duration-150 border z-40 mr-4 ml-4 border-[#BEB7B4] rounded-lg p-2 pl-2 pr-2 h-8 text-sm font-semibold text-[#BEB7B4] hover:bg-gray-300 group-hover:text-white group-hover:border-gray-300"
                    >
                      <Loader className="w-4 h-4 mr-2" />
                      Partida
                      <ChevronDown />
                    </button>
                  </div>
                  <div className="z-40 group">
                    <button
                      type="button"
                      className="flex items-center transition-all ease-linear duration-150 border z-40 border-[#BEB7B4] rounded-lg p-2 pl-2 pr-2 h-8 text-sm font-semibold text-[#BEB7B4] hover:bg-gray-300 group-hover:text-white group-hover:border-gray-300"
                    >
                      <Cylinder className="w-4 h-4 mr-2" />
                      Unidad
                      <ChevronDown />
                    </button>
                  </div>
                </div>
                <div className="p-4 text-[#635F60] font-bold text-base">
                  {idproject && (
                    <TaskComponent id_proyecto={idproject} id_usuario={id} />
                  )}
                </div>
              </div>
            </form>
          )}

          {step === 2 && (
            // Aquí se mostraría el segundo paso del formulario

            <form
              className="z-10 px-1 py-20 mx-auto overflow-x-hidden font-zen-kaku ml-0 md:w-3/4 custom-form-proyect2"
              style={{ marginTop: "-150px" }}
            >
              <>
                <div className="flex mb-20 flex-nowrap">
                  <div className="flex items-center w-full px-3 mb-6 md:mb-0 ">
                    <label className="font-zen-kaku text-[#635F60] flex flex-row text-sm">
                      Solo admite archivos PDF, DOCX, IMG{" "}
                      <ChevronRight strokeWidth={1} /> 30 MB
                    </label>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                  <div className="z-10 w-full px-4  md:mb-0">
                    <div className="w-full px-3 md:mb-1">
                      <label className="text-sm font-bold font-zen-kaku">
                        Documento de autorización
                      </label>
                    </div>
                    <div className="flex items-center custom-documento-a1">
                      <label
                        htmlFor="documentoautorizacion"
                        className="flex items-center flex-grow px-4 py-3 text-sm border border-gray-300 rounded-lg cursor-pointer font-zen-kaku"
                      >
                        <Upload color="#828080" className="w-5 h-5 mr-2" />
                        {documentoautorizacionFileName
                          ? documentoautorizacionFileName
                          : "Haga clic o arrastre el archivo aquí para cargarlo"}
                      </label>
                      {documentoautorizacionFileName && (
                        <button
                          type="button"
                          onClick={() =>
                            eliminarArchivo(
                              setdocumentoautorizacion,
                              setdocumentoautorizacionFileName,
                            )
                          }
                          className="flex-shrink-0 ml-2 text-xs text-red-600 transition-all duration-150 ease-linear cursor-pointer hover:text-red-800 hover:scale-125"
                          style={{ fontSize: "1rem", lineHeight: "1rem" }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <input
                      type="file"
                      id="documentoautorizacion"
                      className="hidden"
                      onChange={(e) =>
                        manejarCambioArchivo(
                          e,
                          setdocumentoautorizacion,
                          setdocumentoautorizacionFileName,
                        )
                      }
                    />
                    {errors.documentoautorizacion && (
                      <p className="text-sm text-red-500">
                        {errors.documentoautorizacion}
                      </p>
                    )}
                  </div>
                  <div className="z-50 w-full px-3 md:mb-0">
                    <div className="w-full px-3 md:mb-2">
                      <label className="text-sm font-bold font-zen-kaku">
                        Servicios de Impuestos Internos (SII) Tributarios
                      </label>
                    </div>
                    <div className="flex items-center">
                      <label
                        htmlFor="servicioSII"
                        className="flex items-center flex-grow px-4 py-3 text-sm border border-gray-300 rounded-lg cursor-pointer font-zen-kaku"
                      >
                        <Upload color="#828080" className="w-5 h-5 mr-2" />
                        {servicioSIIFileName
                          ? servicioSIIFileName
                          : "Haga clic o arrastre el archivo aquí para cargarlo"}
                      </label>
                      {servicioSIIFileName && (
                        <button
                          type="button"
                          onClick={() =>
                            eliminarArchivo(
                              setservicioSII,
                              setservicioSIIFileName,
                            )
                          }
                          className="flex-shrink-0 ml-2 text-xs text-red-600 transition-all duration-150 ease-linear cursor-pointer hover:text-red-800 hover:scale-125"
                          style={{ fontSize: "1rem", lineHeight: "1rem" }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <input
                      type="file"
                      id="servicioSII"
                      className="hidden"
                      onChange={(e) =>
                        manejarCambioArchivo(
                          e,
                          setservicioSII,
                          setservicioSIIFileName,
                        )
                      }
                    />
                    {errors.servicioSII && (
                      <p className="text-sm text-red-500">
                        {errors.servicioSII}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="z-40 w-full px-3 md:mb-0">
                    <div className="w-full px-3 md:mb-2">
                      <label className="text-sm font-bold font-zen-kaku">
                        Póliza de seguros
                      </label>
                    </div>
                    <div className="flex items-center custom-documento-a1">
                      <label
                        htmlFor="polizaseguro"
                        className="flex items-center flex-grow px-4 py-3 text-sm border border-gray-300 rounded-lg cursor-pointer font-zen-kaku"
                      >
                        <Upload color="#828080" className="w-5 h-5 mr-2" />
                        {polizaseguroFileName
                          ? polizaseguroFileName
                          : "Haga clic o arrastre el archivo aquí para cargarlo"}
                      </label>
                      {polizaseguroFileName && (
                        <button
                          type="button"
                          onClick={() =>
                            eliminarArchivo(
                              setpolizaseguro,
                              setpolizaseguroFileName,
                            )
                          }
                          className="flex-shrink-0 ml-2 text-xs text-red-600 transition-all duration-150 ease-linear cursor-pointer hover:text-red-800 hover:scale-125"
                          style={{ fontSize: "1rem", lineHeight: "1rem" }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <input
                      type="file"
                      id="polizaseguro"
                      className="hidden"
                      onChange={(e) =>
                        manejarCambioArchivo(
                          e,
                          setpolizaseguro,
                          setpolizaseguroFileName,
                        )
                      }
                    />
                    {errors.polizaseguro && (
                      <p className="text-sm text-red-500">
                        {errors.polizaseguro}
                      </p>
                    )}
                  </div>
                  <div className="z-50 w-full px-3 md:mb-0">
                    <div className="w-full px-3 md:mb-2">
                      <label className="text-sm font-bold font-zen-kaku">
                        Taza de trabajo seguro (hoja de vida de accidentes de
                        empresa)
                      </label>
                    </div>
                    <div className="flex items-center">
                      <label
                        htmlFor="trabajoseguro"
                        className="flex items-center flex-grow px-4 py-3 text-sm border border-gray-300 rounded-lg cursor-pointer font-zen-kaku"
                      >
                        <Upload color="#828080" className="w-5 h-5 mr-2" />
                        {trabajoseguroFileName
                          ? trabajoseguroFileName
                          : "Haga clic o arrastre el archivo aquí para cargarlo"}
                      </label>
                      {trabajoseguroFileName && (
                        <button
                          type="button"
                          onClick={() =>
                            eliminarArchivo(
                              settrabajoseguro,
                              settrabajoseguroFileName,
                            )
                          }
                          className="flex-shrink-0 ml-2 text-xs text-red-600 transition-all duration-150 ease-linear cursor-pointer hover:text-red-800 hover:scale-125"
                          style={{ fontSize: "1rem", lineHeight: "1rem" }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <input
                      type="file"
                      id="trabajoseguro"
                      className="hidden"
                      onChange={(e) =>
                        manejarCambioArchivo(
                          e,
                          settrabajoseguro,
                          settrabajoseguroFileName,
                        )
                      }
                    />
                    {errors.trabajoseguro && (
                      <p className="text-sm text-red-500">
                        {errors.trabajoseguro}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="z-40 w-full px-3 md:mb-0">
                    <div className="w-full px-3 md:mb-2">
                      <label className="text-sm font-bold font-zen-kaku">
                        Representante legal y sociedad actualizada
                      </label>
                    </div>
                    <div className="flex items-center">
                      <label
                        htmlFor="representantelegal"
                        className="flex items-center flex-grow px-4 py-3 text-sm border border-gray-300 rounded-lg cursor-pointer font-zen-kaku"
                      >
                        <Upload color="#828080" className="w-5 h-5 mr-2" />
                        {representantelegalFileName
                          ? representantelegalFileName
                          : "Haga clic o arrastre el archivo aquí para cargarlo"}
                      </label>
                      {representantelegalFileName && (
                        <button
                          type="button"
                          onClick={() =>
                            eliminarArchivo(
                              setrepresentantelegal,
                              setrepresentantelegalFileName,
                            )
                          }
                          className="flex-shrink-0 ml-2 text-xs text-red-600 transition-all duration-150 ease-linear cursor-pointer hover:text-red-800 hover:scale-125"
                          style={{ fontSize: "1rem", lineHeight: "1rem" }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <input
                      type="file"
                      id="representantelegal"
                      className="hidden"
                      onChange={(e) =>
                        manejarCambioArchivo(
                          e,
                          setrepresentantelegal,
                          setrepresentantelegalFileName,
                        )
                      }
                    />
                    {errors.representantelegal && (
                      <p className="text-sm text-red-500">
                        {errors.representantelegal}
                      </p>
                    )}
                  </div>
                  <div className="z-50 w-full px-3 md:mb-0">
                    <div className="w-full px-3 md:mb-2">
                      <label className="text-sm font-bold font-zen-kaku">
                        Servicios de Estatutos
                      </label>
                    </div>
                    <div className="flex items-center">
                      <label
                        htmlFor="servicioestatus"
                        className="flex items-center flex-grow px-4 py-3 text-sm border border-gray-300 rounded-lg cursor-pointer font-zen-kaku"
                      >
                        <Upload color="#828080" className="w-5 h-5 mr-2" />
                        {servicioestatusFileName
                          ? servicioestatusFileName
                          : "Haga clic o arrastre el archivo aquí para cargarlo"}
                      </label>
                      {servicioestatusFileName && (
                        <button
                          type="button"
                          onClick={() =>
                            eliminarArchivo(
                              setservicioestatus,
                              setservicioestatusFileName,
                            )
                          }
                          className="flex-shrink-0 ml-2 text-xs text-red-600 transition-all duration-150 ease-linear cursor-pointer hover:text-red-800 hover:scale-125"
                          style={{ fontSize: "1rem", lineHeight: "1rem" }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <input
                      type="file"
                      id="servicioestatus"
                      className="hidden"
                      onChange={(e) =>
                        manejarCambioArchivo(
                          e,
                          setservicioestatus,
                          setservicioestatusFileName,
                        )
                      }
                    />
                    {errors.servicioestatus && (
                      <p className="text-sm text-red-500">
                        {errors.servicioestatus}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex mb-3 flex-nowrap">
                  <div className="z-40 w-full px-3 md:w-1/2 md:mb-0">
                    <div className="w-full px-3 md:mb-2">
                      <label className="text-sm font-bold font-zen-kaku">
                        Garantías
                      </label>
                    </div>
                    <div className="flex items-center">
                      <label
                        htmlFor="garantias"
                        className="flex items-center flex-grow px-4 py-3 text-sm border border-gray-300 rounded-lg cursor-pointer font-zen-kaku"
                      >
                        <Upload color="#828080" className="w-5 h-5 mr-2" />
                        {garantiasFileName
                          ? garantiasFileName
                          : "Haga clic o arrastre el archivo aquí para cargarlo"}
                      </label>
                      {garantiasFileName && (
                        <button
                          type="button"
                          onClick={() =>
                            eliminarArchivo(setgarantias, setgarantiasFileName)
                          }
                          className="flex-shrink-0 ml-2 text-xs text-red-600 transition-all duration-150 ease-linear cursor-pointer hover:text-red-800 hover:scale-125"
                          style={{ fontSize: "1rem", lineHeight: "1rem" }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <input
                      type="file"
                      id="garantias"
                      className="hidden"
                      onChange={(e) =>
                        manejarCambioArchivo(
                          e,
                          setgarantias,
                          setgarantiasFileName,
                        )
                      }
                    />
                    {errors.garantias && (
                      <p className="text-sm text-red-500">{errors.garantias}</p>
                    )}
                  </div>
                  <div className="z-50 w-full px-3 md:w-1/2 md:mb-0">
                    <div className="w-full px-3 md:mb-2">
                      <label className="text-sm font-bold font-zen-kaku">
                        Cheque
                      </label>
                    </div>
                    <div className="flex items-center">
                      <label
                        htmlFor="cheque"
                        className="flex items-center flex-grow px-4 py-3 text-sm border border-gray-300 rounded-lg cursor-pointer font-zen-kaku"
                      >
                        <Upload color="#828080" className="w-5 h-5 mr-2" />
                        {chequeFileName
                          ? chequeFileName
                          : "Haga clic o arrastre el archivo aquí para cargarlo"}
                      </label>
                      {chequeFileName && (
                        <button
                          type="button"
                          onClick={() =>
                            eliminarArchivo(setcheque, setchequeFileName)
                          }
                          className="flex-shrink-0 ml-2 text-xs text-red-600 transition-all duration-150 ease-linear cursor-pointer hover:text-red-800 hover:scale-125"
                          style={{ fontSize: "1rem", lineHeight: "1rem" }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <input
                      type="file"
                      id="cheque"
                      className="hidden"
                      onChange={(e) =>
                        manejarCambioArchivo(e, setcheque, setchequeFileName)
                      }
                    />
                    {errors.cheque && (
                      <p className="text-sm text-red-500">{errors.cheque}</p>
                    )}
                  </div>
                </div>

                <div className="flex mb-3 flex-nowrap">
                  <div className="z-40 w-full px-3 md:w-1/2 md:mb-0">
                    <div className="w-full px-3 md:mb-2">
                      <label className="text-sm font-bold font-zen-kaku">
                        Asociados a garantía (póliza)
                      </label>
                    </div>
                    <div className="flex items-center">
                      <label
                        htmlFor="asociadosgarantia"
                        className="flex items-center flex-grow px-4 py-3 text-sm border border-gray-300 rounded-lg cursor-pointer font-zen-kaku"
                      >
                        <Upload color="#828080" className="w-5 h-5 mr-2" />
                        {asociadosgarantiaFileName
                          ? asociadosgarantiaFileName
                          : "Haga clic o arrastre el archivo aquí para cargarlo"}
                      </label>
                      {asociadosgarantiaFileName && (
                        <button
                          type="button"
                          onClick={() =>
                            eliminarArchivo(
                              setasociadosgarantia,
                              setasociadosgarantiaFileName,
                            )
                          }
                          className="flex-shrink-0 ml-2 text-xs text-red-600 transition-all duration-150 ease-linear cursor-pointer hover:text-red-800 hover:scale-125"
                          style={{ fontSize: "1rem", lineHeight: "1rem" }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <input
                      type="file"
                      id="asociadosgarantia"
                      className="hidden"
                      onChange={(e) =>
                        manejarCambioArchivo(
                          e,
                          setasociadosgarantia,
                          setasociadosgarantiaFileName,
                        )
                      }
                    />
                    {errors.asociadosgarantia && (
                      <p className="text-sm text-red-500">
                        {errors.asociadosgarantia}
                      </p>
                    )}
                  </div>
                  <div className="z-50 w-full px-3 md:w-1/2 md:mb-0">
                    <div className="w-full px-3 md:mb-2">
                      <label className="text-sm font-bold font-zen-kaku">
                        Seguro Laboral de Empresa
                      </label>
                    </div>
                    <div className="flex items-center">
                      <label
                        htmlFor="segurolaboral"
                        className="flex items-center flex-grow px-4 py-3 text-sm border border-gray-300 rounded-lg cursor-pointer font-zen-kaku"
                      >
                        <Upload color="#828080" className="w-5 h-5 mr-2" />
                        {segurolaboralFileName
                          ? segurolaboralFileName
                          : "Haga clic o arrastre el archivo aquí para cargarlo"}
                      </label>
                      {segurolaboralFileName && (
                        <button
                          type="button"
                          onClick={() =>
                            eliminarArchivo(
                              setsegurolaboral,
                              setsegurolaboralFileName,
                            )
                          }
                          className="flex-shrink-0 ml-2 text-xs text-red-600 transition-all duration-150 ease-linear cursor-pointer hover:text-red-800 hover:scale-125"
                          style={{ fontSize: "1rem", lineHeight: "1rem" }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <input
                      type="file"
                      id="segurolaboral"
                      className="hidden"
                      onChange={(e) =>
                        manejarCambioArchivo(
                          e,
                          setsegurolaboral,
                          setsegurolaboralFileName,
                        )
                      }
                    />
                    {errors.segurolaboral && (
                      <p className="text-sm text-red-500">
                        {errors.segurolaboral}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex mb-3 flex-nowrap">
                  <div className="z-40 w-full px-3 md:w-1/2 md:mb-0">
                    <div className="w-full px-3 md:mb-2">
                      <label className="text-sm font-bold font-zen-kaku">
                        Afiliación a Caja de Compensación
                      </label>
                    </div>
                    <div className="flex items-center">
                      <label
                        htmlFor="afiliacioncaja"
                        className="flex items-center flex-grow px-4 py-3 text-sm border border-gray-300 rounded-lg cursor-pointer font-zen-kaku"
                      >
                        <Upload color="#828080" className="w-5 h-5 mr-2" />
                        {afiliacioncajaFileName
                          ? afiliacioncajaFileName
                          : "Haga clic o arrastre el archivo aquí para cargarlo"}
                      </label>
                      {afiliacioncajaFileName && (
                        <button
                          type="button"
                          onClick={() =>
                            eliminarArchivo(
                              setafiliacioncaja,
                              setafiliacioncajaFileName,
                            )
                          }
                          className="flex-shrink-0 ml-2 text-xs text-red-600 transition-all duration-150 ease-linear cursor-pointer hover:text-red-800 hover:scale-125"
                          style={{ fontSize: "1rem", lineHeight: "1rem" }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <input
                      type="file"
                      id="afiliacioncaja"
                      className="hidden"
                      onChange={(e) =>
                        manejarCambioArchivo(
                          e,
                          setafiliacioncaja,
                          setafiliacioncajaFileName,
                        )
                      }
                    />
                    {errors.afiliacioncaja && (
                      <p className="text-sm text-red-500">
                        {errors.afiliacioncaja}
                      </p>
                    )}
                  </div>
                  <div className="z-40 w-full px-3 md:w-1/2 md:mb-0">
                    <div className="w-full px-3 md:mb-2">
                      <label className="text-sm font-bold font-zen-kaku">
                        Fotocopia de cédula
                      </label>
                    </div>
                    <div className="flex items-center">
                      <label
                        htmlFor="fotocopiacedula"
                        className="flex items-center flex-grow px-4 py-3 text-sm border border-gray-300 rounded-lg cursor-pointer font-zen-kaku"
                      >
                        <Upload color="#828080" className="w-5 h-5 mr-2" />
                        {fotocopiacedulaFileName
                          ? fotocopiacedulaFileName
                          : "Haga clic o arrastre el archivo aquí para cargarlo"}
                      </label>
                      {fotocopiacedulaFileName && (
                        <button
                          type="button"
                          onClick={() =>
                            eliminarArchivo(
                              setfotocopiacedula,
                              setfotocopiacedulaFileName,
                            )
                          }
                          className="flex-shrink-0 ml-2 text-xs text-red-600 transition-all duration-150 ease-linear cursor-pointer hover:text-red-800 hover:scale-125"
                          style={{ fontSize: "1rem", lineHeight: "1rem" }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <input
                      type="file"
                      id="fotocopiacedula"
                      className="hidden"
                      onChange={(e) =>
                        manejarCambioArchivo(
                          e,
                          setfotocopiacedula,
                          setfotocopiacedulaFileName,
                        )
                      }
                    />
                    {errors.fotocopiacedula && (
                      <p className="text-sm text-red-500">
                        {errors.fotocopiacedula}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap justify-end mt-10 ml-16 font-zen-kaku">
                  <div className="flex h-12 mb-4 rounded-lg justify-content-center w-38">
                    <button
                      type="button"
                      onClick={() => handleStepChange(currentStep - 1)}
                      className="mr-10 text-lg font-zen-kaku text-zinc-500 hover:text-zinc-600"
                    >
                      Volver{" "}
                    </button>
                    <Button
                      type="button"
                      onClick={onclickfinishform}
                      icon="pi pi-check"
                      label="Guardar datos"
                      className="px-10 font-semibold text-black bg-[#5C7891] rounded-lg hover:bg-[#597387]"
                    />
                    <ConfirmDialog
                      visible={showConfirm}
                      onHide={() => setShowConfirm(false)}
                      message={
                        <div>
                          Proyecto creado correctamente!
                          <br />
                          Por favor rediríjase al dashboard para visualizar su
                          proyecto.
                        </div>
                      }
                      icon="pi pi-check custom-icon"
                      accept={accept}
                      reject={reject}
                      closable={false}
                      className="select-none"
                      footer={
                        <div className="flex justify-end gap-2">
                          <button
                            className="px-2 py-1 text-base text-white transition-all duration-150 ease-linear bg-[#5C7891] rounded-md font-zen-kaku hover:bg-[#597387]"
                            onClick={reject}
                          >
                            Rechazar
                          </button>
                          <button
                            className="px-2 py-1 text-base text-white transition-all duration-150 ease-linear bg-[#5C7891] rounded-md font-zen-kaku hover:bg-[#597387]"
                            onClick={accept}
                          >
                            Aceptar
                          </button>
                        </div>
                      }
                    />
                  </div>
                </div>
              </>
            </form>
          )}
            </div> {/* Cierre del div custom-partidas-form */}
          </div> {/* Cierre del div custom-partidas-container */}
        </div>
      </div>
    </div>
  );
};
export default Partidasform;
