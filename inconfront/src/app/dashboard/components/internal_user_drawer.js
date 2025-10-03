import React, { useState, useEffect } from "react";
import {
  postUserProf,
  registerUser,
  getPaises,
  getRegionesPorPais,
  getComunasPorRegion,
  getAfp,
  getSalud,
  getEstado_civil,
  getCodTelefono,
  getrol,
  getRolesInternos,
  getOrganizacion,
  getRelacion,
  getGrupo,
  getPuesto,
  postUserDoc,
} from "@/app/services/user";
import {
  Upload,
  PencilLine,
  BriefcaseBusiness,
  Check,
  ChevronRight,
} from "lucide-react";
import Select from "react-select";
import {
  genOptions,
  paisOptions,
  previsionOptions,
  afpOptions,
  comunaOptions,
} from "./data_option";
import "../style/datepicker_new.css";
import Image from "next/image";
import { useSelector } from "react-redux";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import es from "date-fns/locale/es";
const { useRouter } = require("next/navigation");
import toast from "react-hot-toast";
registerLocale("es", es);
import {
  validaterutrabajador,
  validateNombre,
  validateapellidopaterno,
  validateapellidomaterno,
  validategenero,
  validatefecha,
  validatecorreo,
  validatelefono,
  validatenombreusuario,
  validatepassword,
  validatestadocivil,
  validatedireccion,
  validatecodigopostal,
  validatepais,
  validateregion,
  validatecomuna,
  validateperfil,
  validatecodigoarea,
  validateseguro,
  validateafp,
  validaterelacion,
  validatenombremer,
  validatecorreoe,
  validaterol,
  validateorganizacion,
  validatepuesto,
  validategrupo,
} from "../components/validForm/validusuario";
import { ConfirmDialog } from "primereact/confirmdialog";
import { Button } from "primereact/button";
import "primereact/resources/themes/saga-blue/theme.css"; //tema
import "primereact/resources/primereact.min.css"; //core css
import "primeicons/primeicons.css"; //iconos
import "../style/custom_confirmation.css";
import "../style/custom_icon.css";
import "../style/media_query.css";
const crypto = require("crypto");
import { motion } from "framer-motion";

const Drawerinternal = ({ isOpen, onClose, userType, setModalVisible }) => {
  const router = useRouter();
  // Formulario datos personales
  const [formData, setFormData] = useState({
    region: "",
    rut: "",
    name: "",
    apellido_p: "",
    apellido_m: "",
    genero: "",
    fecha_de_nacimiento: "",
    email: "",
    codtelefono: 0,
    telefono: "",
    username: "",
    password: "",
    calle: "",
    codigo_postal: "",
    id_codtelefono: "",

    ID_comuna: 0,
    estado_cuenta: 0,
    estado_civil: 0,
    urifolder: "",
  });

  // Formulario datos laborales
  const [formWorkData, setFormWorkData] = useState({
    id_rol: 0,
    id_salud: 0,
    id_afp: 0,
    organizacionid: 0,
    nombre_emergencia: "",
    telefono_emergencia: "",
    codigo_area_emergencia: 0,
    correo_emergencia: "",
    id_relacion_emergencia: 0,
    id_puesto: 0,
    id_grupo: 0,
  });

  const [fileName, setFileName] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [imagenPerfil, setImagenPerfil] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [uploadText, setUploadText] = useState("Subir foto");

  const [showInternUser, setShowInternUser] = useState(false);
  const [showExternalUser, setExternalUser] = useState(false);
  const [showPersonalData, setShowPersonalData] = useState(false);
  const [showWorkData, setShowWorkData] = useState(false);
  const [showWorkData1, setShowWorkData1] = useState(false);
  const [showUserCreated, setShowUserCreated] = useState(false);
  const [isSearchable, setIsSearchable] = useState(true);
  const [date, setDate] = useState("");
  const [isDateInput, setIsDateInput] = useState(false);
  const [step, setStep] = useState(1);
  const [currentStep, setCurrentStep] = useState(1);

  //adjuntos no perfil
  const [certificadoVigenciaEmpresa, setCertificadoVigenciaEmpresa] =
    useState(null);
  const [certificadoVigenciaSociedad, setCertificadoVigenciaSociedad] =
    useState(null);
  const [certificadoNoAdeudoEmpresa, setCertificadoNoAdeudoEmpresa] =
    useState(null);
  const [polizaSeguro, setPolizaSeguro] = useState(null);
  const [contratoLaboralProyecto, setContratoLaboralProyecto] = useState(null);
  const [bancarizacion, setBancarizacion] = useState(null);
  const [certificadoImpuestosInternos, setCertificadoImpuestosInternos] =
    useState(null);
  const [certificadoAfiliacionSalud, setCertificadoAfiliacionSalud] =
    useState(null);

  //captura nombre

  const [
    certificadoVigenciaEmpresaFileName,
    setCertificadoVigenciaEmpresaFileName,
  ] = useState("");
  const [certificadoVigenciaEmpresaFile, setCertificadoVigenciaEmpresaFile] =
    useState(null);

  const [
    certificadoVigenciaSociedadFileName,
    setCertificadoVigenciaSociedadFileName,
  ] = useState("");
  const [certificadoVigenciaSociedadFile, setCertificadoVigenciaSociedadFile] =
    useState(null);

  const [
    certificadoNoAdeudoEmpresaFileName,
    setCertificadoNoAdeudoEmpresaFileName,
  ] = useState("");
  const [certificadoNoAdeudoEmpresaFile, setCertificadoNoAdeudoEmpresaFile] =
    useState(null);

  const [polizaSeguroFileName, setPolizaSeguroFileName] = useState("");
  const [polizaSeguroFile, setPolizaSeguroFile] = useState(null);

  const [contratoLaboralProyectoFileName, setContratoLaboralProyectoFileName] =
    useState("");
  const [contratoLaboralProyectoFile, setContratoLaboralProyectoFile] =
    useState(null);

  const [bancarizacionFileName, setBancarizacionFileName] = useState("");
  const [bancarizacionFile, setBancarizacionFile] = useState(null);

  const [
    certificadoImpuestosInternosFileName,
    setCertificadoImpuestosInternosFileName,
  ] = useState("");
  const [
    certificadoImpuestosInternosFile,
    setCertificadoImpuestosInternosFile,
  ] = useState(null);

  const [
    certificadoAfiliacionSaludFileName,
    setCertificadoAfiliacionSaludFileName,
  ] = useState("");
  const [certificadoAfiliacionSaludFile, setCertificadoAfiliacionSaludFile] =
    useState(null);

  const [showConfirm, setShowConfirm] = useState(false);
  const userStore = useSelector((state) => state.user);
  const saludo = userStore.user ? `${userStore.user.names}` : "";

  const [regionLabel, setRegionLabel] = useState("Ubicación");
  const [comunaLabel, setComunaLabel] = useState("Localidad");

  useEffect(() => {
    setExternalUser(false);
    setShowInternUser(true);
  }, [userType]);

  // Maneja input de los campos del formulario datos personales
  const handleInput = (e) => {
    const fieldName = e.target.name;
    let fieldValue = e.target.value;

    // Autocompletado y formato para RUT
    if (fieldName === "rut") {
      // Solo números y k/K permitidos
      fieldValue = fieldValue.replace(/[^0-9kK]/g, "");
      
      // Permitir hasta 9 dígitos para el cuerpo + 1 dígito verificador
      if (fieldValue.length > 9) {
        fieldValue = fieldValue.slice(0, 9);
      }
      
      // Formatear con puntos y guion
      if (fieldValue.length >= 2) {
        let rutSinFormato = fieldValue;
        let cuerpo = rutSinFormato.slice(0, -1);
        let dv = rutSinFormato.slice(-1).toUpperCase();
        let rutFormateado = "";
        
        if (cuerpo.length > 6) {
          rutFormateado = cuerpo.slice(0, cuerpo.length-6) + "." + 
                         cuerpo.slice(cuerpo.length-6, cuerpo.length-3) + "." + 
                         cuerpo.slice(cuerpo.length-3) + "-" + dv;
        } else if (cuerpo.length > 3) {
          rutFormateado = cuerpo.slice(0, cuerpo.length-3) + "." + 
                         cuerpo.slice(cuerpo.length-3) + "-" + dv;
        } else {
          rutFormateado = cuerpo + "-" + dv;
        }
        fieldValue = rutFormateado;
      }
    }

    // Autocompletado y formato para nombres y apellidos
    if (["name", "apellido_p", "apellido_m"].includes(fieldName)) {
      // Capitalizar primera letra de cada palabra
      fieldValue = fieldValue.replace(/\b\w/g, (l) => l.toUpperCase());
    }

    setFormData((prevState) => ({
      ...prevState,
      [fieldName]: fieldValue,
    }));
  };

  const handleSelect = (e) => {
    const fieldName = e.name;
    const fieldValue = e.value;

    setFormData((prevState) => ({
      ...prevState,
      [fieldName]: fieldValue,
    }));
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

  const manejarCambioImagen = async (evento) => {
    const archivo = evento.target.files[0];
    if (archivo && archivo.type.startsWith("image/")) {
      setIsUploading(true);
      setFileName(archivo.name);
      setProfileFile(archivo);

      // Simulación de carga de archivo
      const reader = new FileReader();
      reader.onloadstart = () => {
        setUploadProgress(0);
        setUploadText("Cargando...");
      };
      reader.onprogress = (event) => {
        if (event.loaded > 0 && event.total > 0) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };
      reader.onloadend = () => {
        // Asegurarse de que la animación sea visible durante al menos 1 segundo
        setTimeout(() => {
          setImagenPerfil(reader.result);
          setUploadProgress(100);
          setUploadText("Cambiar foto");
          setIsUploading(false);
        }, 500); // Tiempo mínimo de simulación
      };
      reader.readAsDataURL(archivo);

      // Añadir un tiempo mínimo para la animación
      setTimeout(() => {
        if (uploadProgress < 100) {
          setUploadProgress(100);
        }
      }, 500); // Ajusta este valor según lo necesites
    }
  };

  // Maneja input de los campos del formulario datos laborales
  const handleWorkInput = (e) => {
    const fieldName = e.target.name;
    const fieldValue = e.target.value;

    setFormWorkData((prevState) => ({
      ...prevState,
      [fieldName]: fieldValue,
    }));
  };

  const postCreateUser = async (e) => {
    const generateEncryptedUriFolder = () => {
      const hash = crypto.createHash("sha256");
      const randomValue = crypto.randomBytes(16).toString("hex"); // Genera un valor aleatorio
      hash.update(randomValue + Date.now().toString()); // Combina el valor aleatorio con la fecha y hora actual
      return hash.digest("hex"); // Devuelve un hash hexadecimal
    };
    // Genera un uriFolder único y encriptado
    const uriFolder = generateEncryptedUriFolder();

    console.log("Creando usuario...");

    const personal = {
      rut: formData.rut,
      nombre: formData.name,
      apellido_p: formData.apellido_p,
      apellido_m: formData.apellido_m,
      username: formData.username,
      genero: formData.genero,
      fecha_de_nacimiento: fechaNacimiento,
      email: formData.email,
      telefono: formData.telefono,
      codtelefono: formData.codtelefono,
      direccion: formData.calle,
      ID_comuna: formData.ID_comuna,
      codigo_postal: formData.codigo_postal,
      password: formData.password,
      usuario: formData.usuario,
      urifolder: uriFolder,
      pais: selectedPais ? selectedPais.value : null,
      region: selectedRegion ? selectedRegion.value : null,
      estado_cuenta: 1,
      estado_civil: formData.estado_civil,
    };

    const laboral = {
      id_rol: formWorkData.id_rol,
      organizacionid: formWorkData.organizacionid,
      id_salud: formWorkData.id_salud,
      id_afp: formWorkData.id_afp,
      telefono_emergencia: formWorkData.telefono_emergencia,
      codigo_area_emergencia: formWorkData.codigo_area_emergencia,
      nombre_emergencia: formWorkData.nombre_emergencia,
      id_relacion_emergencia: formWorkData.id_relacion_emergencia,
      id_puesto: formWorkData.id_puesto,
      id_grupo: formWorkData.id_grupo,
      correo_emergencia: formWorkData.correo_emergencia,
    };
    console.log("laboral:", laboral);

    try {
      const response = await registerUser(personal, laboral);

      if (profileFile) {
        const formData = new FormData();
        formData.append("file", profileFile);
        formData.append("userEmail", personal.email);
        formData.append("document_type", "Foto de perfil usuario");
        await postUserProf(formData);
      }

      const documents = [
        {
          file: certificadoVigenciaEmpresa,
          name: "Certificado de vigencia de la empresa",
        },
        {
          file: certificadoVigenciaSociedad,
          name: "Certificado de vigencia de la sociedad",
        },
        {
          file: certificadoNoAdeudoEmpresa,
          name: "Certificado de no adeudo de la empresa",
        },
        { file: polizaSeguro, name: "Póliza de seguro" },
        {
          file: contratoLaboralProyecto,
          name: "Contrato laboral del proyecto",
        },
        { file: bancarizacion, name: "Bancarización" },
        {
          file: certificadoImpuestosInternos,
          name: "Certificado de impuestos internos",
        },
        {
          file: certificadoAfiliacionSalud,
          name: "Certificado de afiliación a salud",
        },
      ];

      for (const doc of documents) {
        if (doc.file) {
          const formData = new FormData();
          formData.append("file", doc.file);
          formData.append("userEmail", personal.email);
          formData.append("document_type", doc.name);
          await postUserDoc(formData);
        }
      }

      setShowWorkData1(false);
      setShowUserCreated(true);
      router.push("/dashboard/users");
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  const [fechaNacimiento, setFechaNacimiento] = useState(null);

  //select pais, region y comuna

  const [paisOptions, setPaisOptions] = useState([
    { value: "", label: "Selecciona país" },
  ]); // Opción inicial
  const [regionOptions, setRegionOptions] = useState([
    { value: "", label: "Selecciona región" },
  ]);
  const [selectedPais, setSelectedPais] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [comunaOptions, setComunaOptions] = useState([
    { value: "", label: "Selecciona comuna" },
  ]);
  const [selectedComuna, setSelectedComuna] = useState(null);

  useEffect(() => {
    fetchPaises();
  }, []);

  async function fetchPaises() {
    try {
      const responsePaises = await getPaises();
      const paises = responsePaises.map((pais) => ({
        value: pais.id,
        label: pais.nombre,
      }));
      setPaisOptions(paises);
    } catch (error) {
      console.error("Error fetching countries:", error);
    }
  }

  async function fetchRegiones(paisId) {
    const responseRegiones = await getRegionesPorPais(paisId);
    setRegionOptions(
      responseRegiones.map((region) => ({
        value: region.id,
        label: region.nombre,
      })),
    );
  }

  const fetchComunas = async (regionId) => {
    if (!regionId) {
      setComunaOptions([]);
      setSelectedComuna(null);
      return;
    }

    try {
      const comunas = await getComunasPorRegion(regionId);
      setComunaOptions(
        comunas.map((comuna) => ({ value: comuna.id, label: comuna.nombre })),
      );
      // Sin autoselección; usuario debe elegir comuna explícitamente
      setSelectedComuna(null);
    } catch (error) {
      console.error("Error fetching comunas:", error);
      setComunaOptions([]);
    }
  };

  const handleSelectRegion = (selectedOption) => {
    if (!selectedOption) {
      setSelectedRegion(null);
      setComunaOptions([]);
      setSelectedComuna(null);
      setFormData((prevState) => ({
        ...prevState,
        region: null,
      }));
      return;
    }

    setSelectedRegion(selectedOption);
    setFormData((prevState) => ({
      ...prevState,
      region: selectedOption.value,
    }));
    fetchComunas(selectedOption.value);
  };

  const handleSelectComuna = (selectedOption) => {
    setSelectedComuna(selectedOption);
    setFormData((prevState) => ({
      ...prevState,
      ID_comuna: selectedOption ? selectedOption.value : null,
    }));
  };

  const handleSelectPais = (selectedOption) => {
    if (selectedOption) {
      setSelectedRegion(null);
      setSelectedComuna(null);
      setComunaOptions([]);
      setRegionOptions([]);

      // Limpiamos los errores específicos de región y comuna
      setErrors((prevErrors) => ({
        ...prevErrors,
        region: "",
        ID_comuna: "",
      }));

      setSelectedPais(selectedOption);

      // Actualizamos las etiquetas según el país
      switch (selectedOption.value) {
        case 1: // Chile
          setRegionLabel("Región");
          setComunaLabel("Comuna");
          break;
        case 2: // México
          setRegionLabel("Estado");
          setComunaLabel("Municipio");
          break;
        case 3: // Argentina
          setRegionLabel("Provincia");
          setComunaLabel("Localidad");
          break;
        default:
          setRegionLabel("Ubicación");
          setComunaLabel("Localidad");
      }

      fetchRegiones(selectedOption.value);
      setFormData((prevState) => ({
        ...prevState,
        ID_comuna: null,
        region: null,
      }));
    } else {
      setSelectedPais(null);
      setRegionLabel("Ubicación");
      setComunaLabel("Localidad");
      setSelectedRegion(null);
      setSelectedComuna(null);
      setComunaOptions([]);
      setRegionOptions([]);

      // Limpiamos los errores
      setErrors((prevErrors) => ({
        ...prevErrors,
        region: "",
        ID_comuna: "",
      }));

      setFormData((prevState) => ({
        ...prevState,
        ID_comuna: null,
        region: null,
      }));
    }
  };

  //select pais, region y comuna

  const [afpOptions, setAfpOptions] = useState([]);
  const [selectedAfp, setSelectedAfp] = useState(null);

  useEffect(() => {
    const fetchAfpData = async () => {
      try {
        const data = await getAfp();
        const formattedOptions = data.map((afp) => ({
          value: afp.id,
          label: afp.nombre,
        }));
        setAfpOptions(formattedOptions);
        console.log(formattedOptions);
      } catch (error) {
        console.error("Error al obtener los datos de AFP:", error);
      }
    };

    fetchAfpData();
  }, []);

  //EJEMPLO FUNCIONAL FORANEA

  // const handleSelectAFP = (selectedOption) => {
  //    setSelectedAfp(selectedOption);
  //     };

  const handleSelectAFP = (selectedOption) => {
    setSelectedAfp(selectedOption);
    setFormWorkData((prevState) => ({
      ...prevState,
      id_afp: selectedOption ? selectedOption.value : 0,
    }));
  };

  useEffect(() => {
    const fetchSaludData = async () => {
      try {
        const data = await getSalud();
        const formattedOptions = data.map((item) => ({
          value: item.id,
          label: item.nombre,
        }));
        setSaludOptions(formattedOptions);
        console.log("Datos formateados de Salud:", formattedOptions);
      } catch (error) {
        console.error("Error al obtener los datos de Salud:", error);
      }
    };

    fetchSaludData();
  }, []);

  const [saludOptions, setSaludOptions] = useState([]);
  const [selectedSalud, setSelectedSalud] = useState(null);

  const handleSelectSalud = (selectedOption) => {
    console.log("salud es : ", selectedOption);
    setSelectedSalud(selectedOption);
    setFormWorkData((prevState) => ({
      ...prevState,
      id_salud: selectedOption ? selectedOption.value : null,
    }));
  };

  const stepsTotal = 3;
  const stepTitles = [
    "Datos personales",
    "Datos laborales",
    "Carga de documentos",
  ];

  const handleStepChange = (nextStep) => {
    // Si vamos hacia atrás, no validamos
    if (nextStep < currentStep) {
      setStep(nextStep);
      setCurrentStep(nextStep);
      return;
    }

    // Si vamos hacia adelante en el paso 1, validamos datos personales
    if (currentStep === 1) {
      if (validateForm()) {
        setStep(nextStep);
        setCurrentStep(nextStep);
      } else {
        toast.error("Formulario incompleto o con errores");
      }
    }
    // Si vamos hacia adelante en el paso 2, validamos datos laborales
    else if (currentStep === 2) {
      if (validateFormlabolares()) {
        setStep(nextStep);
        setCurrentStep(nextStep);
      } else {
        toast.error("Por favor, corrija los errores en el formulario");
      }
    }
  };

  //estado civil

  // Estado para las opciones de estado civil
  const [estadoCivilOptions, setEstadoCivilOptions] = useState([]);

  const [selectedEstadoCivil, setSelectedEstadoCivil] = useState(null);

  // Otros estados y efectos

  useEffect(() => {
    // Fetch estado civil options
    const fetchEstadoCivilOptions = async () => {
      try {
        const data = await getEstado_civil();
        const formattedOptions = data.map((estado) => ({
          value: estado.id_estado_civil,
          label: estado.nombre_estado_civil,
        }));
        setEstadoCivilOptions(formattedOptions);
      } catch (error) {
        console.error("Error fetching estado civil options:", error);
      }
    };

    fetchEstadoCivilOptions();
  }, []);

  const handleSelectEstadoCivil = (selectedOption) => {
    setSelectedEstadoCivil(selectedOption);

    setFormData((prevState) => ({
      ...prevState,
      estado_civil: selectedOption ? selectedOption.value : null,
    }));
  };

  //codigo de area

  // Estado para las opciones de código de área
  const [codigoAreaOptions, setCodigoAreaOptions] = useState([]);
  const [selectedCodigoArea, setSelectedCodigoArea] = useState(null);

  useEffect(() => {
    // Fetch código de área options
    const fetchCodigoAreaOptions = async () => {
      try {
        const data = await getCodTelefono();
        const formattedOptions = data.map((codigo) => ({
          value: codigo.id,
          label: codigo.cod_numero,
        }));
        setCodigoAreaOptions(formattedOptions);
      } catch (error) {
        console.error("Error fetching código de área options:", error);
      }
    };

    fetchCodigoAreaOptions();
  }, []);

  const handleSelectCodigoArea = (selectedOption) => {
    setSelectedCodigoArea(selectedOption);
    setFormData((prevState) => ({
      ...prevState,
      codtelefono: selectedOption ? selectedOption.value : null,
    }));
  };

  const [selectedCodigoAreaEmergencia, setSelectedCodigoAreaEmergencia] =
    useState(null);

  const handleSelectCodigoArea_emergencia = (selectedOption) => {
    setSelectedCodigoAreaEmergencia(selectedOption);
    setFormWorkData((prevState) => ({
      ...prevState,
      codigo_area_emergencia: selectedOption ? selectedOption.value : null,
    }));
  };

  const handleRedirect = () => {
    router.push("/dashboard/users");
  };

  // getrol

  // Estado para las opciones de rol
  const [rolOptions, setRolOptions] = useState([]);

  useEffect(() => {
    // Fetch roles
    const fetchRoles = async () => {
      try {
        const roles = await getRolesInternos();
        const formattedOptions = roles.map((rol) => ({
          value: rol.id,
          label: rol.nombre,
        }));
        setRolOptions(formattedOptions);
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };

    fetchRoles();
  }, []);

  // organizacion
  const [organizacionOptions, setOrganizacionOptions] = useState([]);
  const [selectedorganizacion, setSelectedorganizacion] = useState(null);

  useEffect(() => {
    const fetchOrganizaciones = async () => {
      try {
        const organizaciones = await getOrganizacion();
        const formattedOptions = organizaciones.map((org) => ({
          value: org.id,
          label: org.nombre,
        }));
        setOrganizacionOptions(formattedOptions);
      } catch (error) {
        console.error("Error fetching organizaciones:", error);
      }
    };

    fetchOrganizaciones();
  }, []);

  //relacion_contacto

  const [relacionesOptions, setRelacionesOptions] = useState([]);
  const [selectedRelacion, setSelectedRelacion] = useState(null);

  useEffect(() => {
    // Fetch relaciones
    const fetchRelaciones = async () => {
      try {
        const data = await getRelacion();
        const formattedOptions = data.map((relacion) => ({
          value: relacion.id_relacion,
          label: relacion.nombre,
        }));
        setRelacionesOptions(formattedOptions);
      } catch (error) {
        console.error("Error fetching relaciones:", error);
      }
    };

    fetchRelaciones();
  }, []);

  const handleSelectRelacion = (selectedOption) => {
    setSelectedRelacion(selectedOption);
    setFormWorkData((prevState) => ({
      ...prevState,
      id_relacion_emergencia: selectedOption ? selectedOption.value : null,
    }));
  };

  const [puestosOptions, setPuestosOptions] = useState([]);
  const [selectedPuesto, setSelectedPuesto] = useState(null);

  const [gruposOptions, setGruposOptions] = useState([]);
  const [selectedGrupo, setSelectedGrupo] = useState(null);

  useEffect(() => {
    const fetchPuestos = async () => {
      try {
        const data = await getPuesto();
        const formattedOptions = data.map((puesto) => ({
          value: puesto.id,
          label: puesto.nombre,
        }));
        setPuestosOptions(formattedOptions);
      } catch (error) {
        console.error("Error fetching puestos:", error);
      }
    };

    const fetchGrupos = async () => {
      try {
        const data = await getGrupo();
        const formattedOptions = data.map((grupo) => ({
          value: grupo.id,
          label: grupo.nombre,
        }));
        setGruposOptions(formattedOptions);
      } catch (error) {
        console.error("Error fetching grupos:", error);
      }
    };

    fetchPuestos();
    fetchGrupos();
  }, []);

  const handleSelectorganizacion = (selectedOption) => {
    setSelectedorganizacion(selectedOption);
    setFormWorkData((prevState) => ({
      ...prevState,
      organizacionid: selectedOption ? selectedOption.value : null,
    }));
  };

  const handleSelectPuesto = (selectedOption) => {
    setSelectedPuesto(selectedOption);
    setFormWorkData((prevState) => ({
      ...prevState,
      id_puesto: selectedOption ? selectedOption.value : null,
    }));
  };

  const handleSelectGrupo = (selectedOption) => {
    setSelectedGrupo(selectedOption);
    setFormWorkData((prevState) => ({
      ...prevState,
      id_grupo: selectedOption ? selectedOption.value : null,
    }));
  };

  //validators

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    newErrors.rut = validaterutrabajador(formData.rut);
    newErrors.name = validateNombre(formData.name);
    newErrors.apellido_p = validateapellidopaterno(formData.apellido_p);
    newErrors.apellido_m = validateapellidomaterno(formData.apellido_m);
    newErrors.genero = validategenero(formData.genero);
    newErrors.fechaNacimiento = validatefecha(fechaNacimiento);
    newErrors.email = validatecorreo(formData.email);
    newErrors.codigo_area = validatecodigoarea(formData.codtelefono);
    newErrors.telefono = validatelefono(formData.telefono);
    newErrors.username = validatenombreusuario(formData.username);
    newErrors.password = validatepassword(formData.password);
    newErrors.estado_civil = validatestadocivil(formData.estado_civil);
    newErrors.calle = validatedireccion(formData.calle);
    newErrors.codigo_postal = validatecodigopostal(formData.codigo_postal);

    // Usar selectedPais y selectedRegion directamente para la validación
    newErrors.pais = validatepais(selectedPais ? selectedPais.value : null);
    newErrors.region = validateregion(
      selectedRegion ? selectedRegion.value : null,
      regionLabel,
    );
    newErrors.ID_comuna = validatecomuna(formData.ID_comuna, comunaLabel);
    newErrors.perfil = validateperfil(fileName);

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => error === "");
  };

  const validateFormlabolares = () => {
    const newErrors = {};
    newErrors.codigo_area_emergencia = validatecodigoarea(
      formWorkData.codigo_area_emergencia,
    );
    newErrors.telefono_emergencia = validatelefono(
      formWorkData.telefono_emergencia,
    );
    newErrors.id_salud = validateseguro(formWorkData.id_salud);
    newErrors.afp = validateafp(formWorkData.id_afp);
    newErrors.relacion = validaterelacion(formWorkData.id_relacion_emergencia);
    newErrors.nombre_emergencia = validatenombremer(
      formWorkData.nombre_emergencia,
    );
    newErrors.correo_emergencia = validatecorreoe(
      formWorkData.correo_emergencia,
    );
    newErrors.organizacionid = validateorganizacion(
      formWorkData.organizacionid,
    );
    newErrors.id_grupo = validategrupo(formWorkData.id_grupo);
    newErrors.id_puesto = validatepuesto(formWorkData.id_puesto);
    newErrors.id_rol = validaterol(formWorkData.id_rol);

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => error === "");
  };

  const validformnext = (e) => {
    e.preventDefault();
    if (validateForm()) {
      handleStepChange(currentStep + 1);
      toast.success("Datos del formulario correctos");
    } else {
      toast.error("Por favor, corrija los errores en el formulario");
    }
  };
  const validformnextlaborales = (e) => {
    e.preventDefault();
    const newErrors = {};
    // Removemos las validaciones de los campos que ya no se usan
    newErrors.codigo_area_emergencia = validatecodigoarea(
      formWorkData.codigo_area_emergencia,
    );
    newErrors.telefono_emergencia = validatelefono(
      formWorkData.telefono_emergencia,
    );
    newErrors.id_salud = validateseguro(formWorkData.id_salud);
    newErrors.afp = validateafp(formWorkData.id_afp);
    newErrors.relacion = validaterelacion(formWorkData.id_relacion_emergencia);
    newErrors.nombre_emergencia = validatenombremer(
      formWorkData.nombre_emergencia,
    );
    newErrors.correo_emergencia = validatecorreoe(
      formWorkData.correo_emergencia,
    );
    newErrors.organizacionid = validateorganizacion(
      formWorkData.organizacionid,
    );
    newErrors.id_grupo = validategrupo(formWorkData.id_grupo);
    newErrors.id_puesto = validatepuesto(formWorkData.id_puesto);
    newErrors.id_rol = validaterol(formWorkData.id_rol);

    setErrors(newErrors);

    // Verificar específicamente los campos de contacto de emergencia
    if (
      !formWorkData.id_relacion_emergencia ||
      !formWorkData.nombre_emergencia ||
      !formWorkData.correo_emergencia
    ) {
      toast.error(
        "Por favor, complete todos los campos de contacto de emergencia",
      );
      return;
    }

    // Filtrar los errores que no están vacíos
    const erroresActivos = Object.entries(newErrors)
      .filter(([_, value]) => value !== "")
      .map(([key, value]) => `${key}: ${value}`);

    if (erroresActivos.length > 0) {
      toast.error("Por favor, corrija los errores en el formulario");
      return;
    }

    handleStepChange(currentStep + 1);
    toast.success("Datos del formulario correctos");
  };

  const accept = () => {
    // Lógica para aceptar el mensaje de confirmación
    setShowConfirm(false);
    postCreateUser();
    toast.success("Usuario interno creado correctamente");
    router.push("/dashboard/users");
  };

  const reject = () => {
    // Lógica para rechazar el mensaje de confirmación
    setShowConfirm(false);
  };

  const onclickfinishform = (e) => {
    e.preventDefault();
    // if (validateformdocuments()) {
    setShowConfirm(true);
    // } else {
    //     toast.error('Por favor, adjunte los archivos necesarios');
    // }
  };

    return (
        <div className="z-50 flex flex-col w-full h-screen overflow-x-hidden">
            <div className="flex-grow justify-center items-center font-zen-kaku bg-[#FAFAFA] p-4 select-none overflow-x-hidden">
                <div className='mt-6'></div>
                
                {/* Header */}
                <div className="grid items-center grid-cols-1 md:grid-cols-3 gap-4 mb-6 font-zen-kaku">
                    <label htmlFor="filtroSelect" className="ml-4 text-base font-bold text-black select-none font-zen-kaku">
                        Usuario | Nuevo Usuario Interno
                    </label>
                </div>

                {/* Contenedor Principal en Flex - Siguiendo el patrón de organization_internal */}
                <div className='mx-auto bg-white shadow-lg rounded-xl flex flex-col lg:flex-row gap-2 w-full lg:w-4/5'>

                    {/* Progress Bar que se adapta en mobile */}
                    <div className='flex flex-wrap lg:flex-col w-full lg:w-1/4 items-center lg:items-start p-4 sm:p-6'>
                        {[...Array(stepsTotal)].map((_, index) => (
                            <div key={index} className="flex flex-row items-center mb-3 lg:mb-4 mr-3">
                                {/* Número del paso */}
                                <span className={`font-zen-kaku rounded-full h-10 w-10 flex justify-center items-center cursor-pointer transition-transform hover:scale-110 ease-linear 
                                    ${currentStep > index + 1
                                        ? 'bg-teal-500 text-white' 
                                        : currentStep === index + 1
                                            ? 'bg-teal-500 text-white ring-1 ring-teal-500 border-white border-4' 
                                            : 'border border-gray-400 text-gray-400'}`} 
                                    onClick={() => handleStepChange(index + 1)}>
                                    {index + 1}
                                </span>
                                <span className="text-sm font-semibold text-black font-zen-kaku ml-2 break-words max-w-[120px] lg:max-w-none">
                                    {stepTitles[index]}
                                </span>
                            </div>
                        ))}
                    </div>

                    {step === 1 && (
                        <form className='z-50 h-full p-4 mx-auto font-zen-kaku w-full custom-form1'><>
                                {/* Grid responsivo - 3 columnas en desktop, 1 en mobile */}
              <div className='grid grid-cols-2 gap-4 mb-6 mt-6 custom-form-project'>
                  <div className="col-span-1">
                    <div className="z-40 w-full px-3">
                      <label className='text-sm font-bold font-zen-kaku'>RUT del Trabajador</label>
                      <input className="w-full px-3 py-2 border rounded" type="text" placeholder="RUT del trabajador" name='rut' onChange={handleInput} value={formData.rut} aria-label="Ingresar RUT del trabajador"/>
                      {errors.rut && <p className="text-red-500 text-sm">{errors.rut}</p>}
                      </div>
                  </div>

                  <div className="col-span-1">
                    <div className="z-40 w-full px-3">
                      <label className="text-sm font-bold font-zen-kaku">
                        Nombre
                      </label>
                      <input
                        className="w-full px-3 py-2 border rounded"
                        type="text"
                        placeholder="Nombre"
                        name="name"
                        onChange={handleInput}
                        value={formData.name}
                        aria-label="Ingresar nombre del trabajador"
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm">{errors.name}</p>
                      )}
                    </div>
                  </div>

                  <div className="col-span-1">
                    <div className="z-40 w-full px-3">
                      <label className="text-sm font-bold font-zen-kaku">
                        Apellido Paterno
                      </label>
                      <input
                        className="w-full px-3 py-2 border rounded"
                        type="text"
                        placeholder="Apellido paterno"
                        name="apellido_p"
                        onChange={handleInput}
                        value={formData.apellido_p}
                        aria-label="Ingresar apellido paterno del trabajador"
                      />
                      {errors.apellido_p && (
                        <p className="text-red-500 text-sm">
                          {errors.apellido_p}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="col-span-1">
                    <div className="z-40 w-full px-3">
                      <label className="text-sm font-bold font-zen-kaku">
                        Apellido Materno
                      </label>
                      <input
                        className="w-full px-3 py-2 border rounded"
                        type="text"
                        placeholder="Apellido materno"
                        name="apellido_m"
                        onChange={handleInput}
                        value={formData.apellido_m}
                        aria-label="Ingresar apellido materno del trabajador"
                      />
                      {errors.apellido_m && (
                        <p className="text-red-500 text-sm">
                          {errors.apellido_m}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="col-span-1">
                    <div className="z-40 w-full px-3 customDatePickerWidth md:mb-0">
                      <div className="z-50 w-full">
                        <label className="text-sm font-bold font-zen-kaku">Fecha de Nacimiento</label>
                      </div>
                        <DatePicker
                          selected={fechaNacimiento}
                          onChange={(date) => {
                            setFechaNacimiento(date);
                            handleInput({
                              target: {
                                name: "fecha_de_nacimiento",
                                value: date,
                              },
                            });
                          }}
                          placeholderText="Selecciona fecha de nacimiento"
                          aria-label="Ingresar la fecha de nacimiento"
                          className="font-zen-kaku px-3 py-2 border border-gray-300 rounded w-full"
                          locale="es"
                          name="fecha_de_nacimiento"
                          dateFormat="yyyy/MM/dd"
                          showMonthDropdown
                          showYearDropdown
                          dropdownMode="select"
                        />
                        {errors.fechaNacimiento && (
                          <p className="text-red-500 text-sm">
                            {errors.fechaNacimiento}
                          </p>
                        )}
                    </div>
                  </div>

                  <div className="col-span-1">
                    <div className="z-40 w-full px-3">
                      <label className="text-sm font-bold font-zen-kaku">
                        Género
                      </label>
                      <Select
                        className={`basic-single font-zen-kaku`}
                        classNamePrefix="select"
                        isSearchable={isSearchable}
                        name="genero"
                        placeholder="Selecciona género"
                        aria-label="Ingresar género del trabajador"
                        options={genOptions}
                        value={genOptions.find(
                          (option) => option.value === formData.genero,
                        )}
                        onChange={handleSelect}
                      />
                      {errors.genero && (
                        <p className="text-red-500 text-sm">{errors.genero}</p>
                      )}
                    </div>
                  </div>                  

                  <div className="col-span-1">
                    <div className="z-40 w-full px-3">
                      <label className="text-sm font-bold font-zen-kaku">
                        Correo Electrónico
                      </label>
                      <input
                        className="w-full px-3 py-2 border rounded"
                        type="text"
                        placeholder="Correo electrónico"
                        name="email"
                        aria-label="Ingresar correo electrónico"
                        onChange={handleInput}
                        value={formData.email}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="col-span-1">
                    <div className="z-40 w-full px-3">
                      <label className="text-sm font-bold font-zen-kaku">
                        Celular
                      </label>
                      <div className="flex">
                        <div className="w-2/6">
                          <Select
                            className="basic-single"
                            classNamePrefix="select"
                            isSearchable={true}
                            name="codigo_area"
                            aria-label="Ingresar código de área del celular"
                            placeholder="+56"
                            options={codigoAreaOptions}
                            value={codigoAreaOptions.find(
                              (option) => option.value === formData.codigo_area,
                            )}
                            onChange={handleSelectCodigoArea}
                            styles={{
                              menu: (provided) => ({
                                ...provided,
                                zIndex: 9999,
                              }),
                            }}
                          />
                          {errors.codigo_area && (
                            <p className="text-red-500 text-sm">
                              {errors.codigo_area}
                            </p>
                          )}
                        </div>
                        <div className="flex-grow">
                          <input
                            className="w-full px-3 py-2 border border-l-0 rounded rounded-l-none"
                            type="text"
                            placeholder="222 222 222"
                            name="telefono"
                            onChange={handleInput}
                            value={formData.telefono}
                            aria-label="Ingresar número de celular"
                          />
                          {errors.telefono && (
                            <p className="text-red-500 text-sm">
                              {errors.telefono}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-1">
                    <div className="z-40 w-full px-3">
                      <label className="text-sm font-bold font-zen-kaku">
                        Usuario
                      </label>
                      <input
                        className="w-full px-3 py-2 border rounded"
                        type="text"
                        placeholder="Usuario"
                        name="username"
                        onChange={handleInput}
                        value={formData.username}
                        aria-label="Ingresar nombre de usuario"
                      />
                      {errors.username && (
                        <p className="text-red-500 text-sm">
                          {errors.username}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="col-span-1">
                    <div className="z-40 w-full px-3">
                      <label className="text-sm font-bold font-zen-kaku">
                        Contraseña
                      </label>
                      <input
                        className="w-full px-3 py-2 border rounded"
                        type="text"
                        placeholder="Contraseña"
                        name="password"
                        onChange={handleInput}
                        value={formData.password}
                        aria-label="Ingresar contraseña"
                      />
                      {errors.password && (
                        <p className="text-red-500 text-sm">
                          {errors.password}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className='col-span-1'>
                      <div className='z-40 w-full px-3'>
                          <label className='text-sm font-bold font-zen-kaku'>Estado Civil</label>
                          <Select
                              className="basic-single"
                              classNamePrefix="select"
                              isSearchable={true}
                              name="estado_civil"
                              placeholder="Selecciona estado civil"
                              aria-label="Seleccionar estado civil"
                              options={estadoCivilOptions}
                              value={estadoCivilOptions.find(option => option.value === formData.estado_civil)}
                              onChange={handleSelectEstadoCivil}
                              styles={{
                                  menu: (provided) => ({
                                      ...provided,
                                      zIndex: 9999
                                  })
                              }}
                          />
                          {errors.estado_civil && <p className="text-red-500 text-sm">{errors.estado_civil}</p>}
                      </div>
                  </div>

                  <div className="col-span-1">
                    <div className="z-40 w-full px-3">
                      <label className="text-sm font-bold font-zen-kaku">
                        País
                      </label>
                      <Select
                        className="basic-single"
                        classNamePrefix="select"
                        isSearchable={true}
                        name="pais"
                        placeholder="Selecciona país"
                        aria-label="Seleccionar país"
                        options={paisOptions}
                        value={selectedPais}
                        onChange={handleSelectPais}
                        styles={{
                          menu: (provided) => ({
                            ...provided,
                            zIndex: 9999,
                          }),
                        }}
                      />
                      {errors.pais && (
                        <p className="text-red-500 text-sm">{errors.pais}</p>
                      )}
                    </div>
                  </div>

                  <div className="col-span-1">
                    <div className="z-40 w-full px-3">
                      <label className="text-sm font-bold font-zen-kaku">
                        {regionLabel}
                      </label>
                      <Select
                        className="basic-single"
                        classNamePrefix="select"
                        isSearchable={true}
                        name="region"
                        placeholder={`Selecciona ${regionLabel.toLowerCase()}`}
                        aria-label="Seleccionar región"
                        options={regionOptions}
                        value={selectedRegion}
                        onChange={handleSelectRegion}
                        isDisabled={!selectedPais}
                        isClearable={true}
                        styles={{
                          menu: (provided) => ({
                            ...provided,
                            zIndex: 9999,
                          }),
                        }}
                      />
                      {errors.region && (
                        <p className="text-red-500 text-sm">{errors.region}</p>
                      )}
                    </div>
                  </div>

                  <div className="col-span-1">
                    <div className="z-40 w-full px-3">
                      <label className="text-sm font-bold font-zen-kaku">
                        {comunaLabel}
                      </label>
                      <Select
                        className="basic-single"
                        classNamePrefix="select"
                        isSearchable={true}
                        name="id_comuna"
                        placeholder={`Selecciona ${comunaLabel.toLowerCase()}`}
                        aria-label="Seleccionar Comuna"
                        options={comunaOptions}
                        value={selectedComuna}
                        onChange={handleSelectComuna}
                        isDisabled={!selectedRegion}
                        isClearable={true}
                        styles={{
                          menu: (provided) => ({
                            ...provided,
                            zIndex: 9999,
                            marginTop: "4px",
                          }),
                          control: (provided) => ({
                            ...provided,
                            marginBottom: "8px",
                          }),
                        }}
                      />
                      {errors.ID_comuna && (
                        <p className="text-red-500 text-sm">
                          {errors.ID_comuna}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="col-span-1">
                    <div className="z-40 w-full px-3">
                      <label className="text-sm font-bold font-zen-kaku">
                        Dirección
                      </label>
                      <input
                        className="w-full px-3 py-2 border rounded"
                        type="text"
                        placeholder="Dirección"
                        aria-label="Ingresar dirección"
                        name="calle"
                        onChange={handleInput}
                        value={formData.calle}
                      />
                      {errors.calle && (
                        <p className="text-red-500 text-sm">{errors.calle}</p>
                      )}
                    </div>
                  </div>

                  <div className="col-span-1">
                    <div className="z-40 w-full px-3">
                      <label className="text-sm font-bold font-zen-kaku">
                        Código Postal
                      </label>
                      <input
                        className="w-full px-3 py-2 border rounded"
                        type="text"
                        placeholder="Código Postal"
                        aria-label="Ingresar código postal"
                        name="codigo_postal"
                        onChange={handleInput}
                        value={formData.codigo_postal}
                      />
                      {errors.codigo_postal && (
                        <p className="text-red-500 text-sm">
                          {errors.codigo_postal}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap mb-3">
                    <div className="w-full px-3">
                      <label className="block mb-2 text-sm font-bold font-zen-kaku">
                        Agregar foto de perfil
                      </label>
                      <div className="flex items-center px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg font-zen-kaku">
                        <Upload
                          color="#828080"
                          className="flex-shrink-0 w-5 h-5 mr-2"
                        />
                        {fileName ? (
                          <div className="flex items-center flex-grow">
                            <span className="max-w-full min-w-0 ml-1 font-medium text-blue-600">
                              {fileName}
                            </span>
                            <button
                              type="button"
                              aria-label="Eliminar imagen cargada"
                              onClick={() => {
                                setFileName("");
                                setUploadProgress(0);
                                setIsUploading(false);
                              }}
                              className="flex-shrink-0 ml-2 text-xs text-red-600 cursor-pointer hover:text-red-800"
                              style={{ fontSize: "1rem", lineHeight: "1rem" }}
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <label
                            htmlFor="workerFile"
                            className="flex items-center flex-grow cursor-pointer"
                          >
                            <span className="flex-grow truncate">
                              Haga clic aquí para cargar imagen
                            </span>
                            <input
                              type="file"
                              id="workerFile"
                              className="z-30 hidden"
                              name="perfil"
                              onChange={manejarCambioImagen}
                            />
                          </label>
                        )}
                      </div>
                      {isUploading && (
                        <motion.div
                          className="w-full bg-gray-200 h-2 rounded mt-2"
                          initial={{ width: "0%" }}
                          animate={{ width: `${uploadProgress}%` }}
                          transition={{ duration: 0.5, ease: "easeInOut" }}
                        >
                          <motion.div className="bg-teal-600 h-full rounded" />
                        </motion.div>
                      )}
                      {errors.perfil && (
                        <p className="text-red-500 text-sm">{errors.perfil}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end mt-16">
                  <button
                    type="button"
                    onClick={handleRedirect}
                    className="px-4 py-3 mb-1 mr-1 text-base font-bold text-gray-400 uppercase transition-all duration-150 rounded hover:text-gray-600 font-zen-kaku"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="bg-[#5C7891] ml-10 text-gray-100 active:bg-[#597387] font-bold uppercase text-base px-10 py-3 rounded-lg shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 font-zen-kaku hover:opacity-75"
                    onClick={validformnext}
                  >
                    Siguiente
                  </button>
                </div>
              </>
            </form>
          )}
          {step === 2 && (
            <form
              className="h-auto p-4 mx-auto font-zen-kaku custom-form-proyect"
              /*style={{ marginTop: "-120px" }}*/
            >
              <div className="grid grid-cols-2 gap-4 mb-6 mt-6 custom-form-project">
                <div className="col-span-1">
                  <div className="relative w-full px-3 mb-2">
                    <label className="text-sm font-bold font-zen-kaku">
                      Seguro Social
                    </label>
                  </div>
                  <Select
                    className="basic-single font-zen-kaku"
                    classNamePrefix="select"
                    isSearchable={true}
                    name="selectSalud"
                    placeholder="Selecciona previsión"
                    aria-label="Seleccionar previsión"
                    onChange={handleSelectSalud}
                    value={selectedSalud}
                    options={saludOptions}
                  />
                  {errors.id_salud && (
                    <p className="text-red-500 text-sm">{errors.id_salud}</p>
                  )}
                </div>

                <div className="col-span-1">
                  <div className="relative w-full px-0 mb-2">
                    <div className="relative w-full px-3 mb-2">
                      <label className="text-sm font-bold font-zen-kaku">
                        Administradoras de Fondos de Pensiones
                      </label>
                    </div>
                    <Select
                      className="basic-single"
                      classNamePrefix="select"
                      isSearchable={true}
                      name="selectAfp"
                      placeholder="Selecciona una AFP"
                      aria-label="Seleccionar una AFP"
                      onChange={handleSelectAFP}
                      value={selectedAfp}
                      options={afpOptions}
                      styles={{
                        menu: (provided) => ({
                          ...provided,
                          zIndex: 9999,
                        }),
                      }}
                    />
                    {errors.afp && (
                      <p className="text-red-500 text-sm">{errors.afp}</p>
                    )}
                  </div>
                </div>

                <div className="col-span-1">
                  <div className="relative w-full px-3 mb-2">
                    <label className="text-sm font-bold font-zen-kaku">
                      Nombre Contacto de Emergencia
                    </label>
                  </div>
                  <input
                    className="w-full px-3 py-2 border rounded"
                    id="grid-last-name"
                    type="text"
                    placeholder="Nombre del contacto de emergencia"
                    name="nombre_emergencia"
                    aria-label="Ingresar nombre del contacto de emergencia"
                    onChange={handleWorkInput}
                    value={formWorkData.nombre_emergencia}
                  />
                  {errors.nombre_emergencia && (
                    <p className="text-red-500 text-sm">
                      {errors.nombre_emergencia}
                    </p>
                  )}
                </div>

                <div className="col-span-1">
                  <div className="relative w-full px-0 mb-2">
                    <div className="relative w-full px-3 mb-2">
                      <label className="text-sm font-bold font-zen-kaku">
                        Relación de Contacto de Emergencia
                      </label>
                    </div>
                    <Select
                      className="basic-single"
                      classNamePrefix="select"
                      isSearchable={true}
                      name="relacion"
                      placeholder="Relación Contacto"
                      options={relacionesOptions}
                      aria-label="Seleccionar relación con el contacto de emergencia"
                      value={relacionesOptions.find(
                        (option) =>
                          option.value === formWorkData.id_relacion_emergencia,
                      )}
                      onChange={handleSelectRelacion}
                      styles={{
                        menu: (provided) => ({
                          ...provided,
                          zIndex: 9999,
                        }),
                      }}
                    />
                    {errors.relacion && (
                      <p className="text-red-500 text-sm">{errors.relacion}</p>
                    )}
                  </div>
                </div>

                <div className="col-span-1">
                  <div className="relative w-full px-3 mb-2">
                    <label className="text-sm font-bold font-zen-kaku">
                      Número Contacto de Emergencia
                    </label>
                  </div>
                  <div className="flex">
                    <div className="w-2/6">
                      <Select
                        className="basic-single"
                        classNamePrefix="select"
                        isSearchable={true}
                        name="codigo_area_emergencia"
                        placeholder="+56"
                        aria-label="Seleccionar código de celular"
                        options={codigoAreaOptions}
                        onChange={handleSelectCodigoArea_emergencia}
                        value={selectedCodigoAreaEmergencia}
                        styles={{
                          menu: (provided) => ({
                            ...provided,
                            zIndex: 9999,
                          }),
                        }}
                      />
                      {errors.codigo_area_emergencia && (
                        <p className="text-red-500 text-sm">
                          {errors.codigo_area_emergencia}
                        </p>
                      )}
                    </div>

                    <div className="flex-grow">
                      <input
                        className="w-full px-3 py-2 border border-l-0 rounded rounded-l-none ml-2"
                        type="text"
                        placeholder="222 222 222"
                        name="telefono_emergencia"
                        onChange={handleWorkInput}
                        aria-label="Ingresar celular de emergencia"
                        value={formWorkData.telefono_emergencia}
                      />
                      {errors.telefono_emergencia && (
                        <p className="text-red-500 text-sm ml-3">
                          {errors.telefono_emergencia}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="col-span-1">
                  <div className="relative w-full px-3 mb-2">
                    <label className="text-sm font-bold font-zen-kaku">
                      Correo Contacto de Emergencia
                    </label>
                  </div>
                  <input
                    className="w-full px-3 py-2 border rounded"
                    id="grid-last-name"
                    type="text"
                    placeholder="Correo del contacto de emergencia"
                    name="correo_emergencia"
                    aria-label="Ingresar correo de emergencia"
                    onChange={handleWorkInput}
                    value={formWorkData.correo_emergencia}
                  />
                  {errors.correo_emergencia && (
                    <p className="text-red-500 text-sm">
                      {errors.correo_emergencia}
                    </p>
                  )}
                </div>

                <div className="col-span-1">
                  <div className="relative w-full px-3 mb-2">
                    <label className="text-sm font-bold font-zen-kaku">
                      Rol de Usuario
                    </label>
                  </div>
                  <Select
                    className="basic-single font-zen-kaku"
                    classNamePrefix="select"
                    isSearchable={true}
                    name="id_rol"
                    placeholder="Selecciona un rol"
                    aria-label="Seleccionar Rol del usuario"
                    onChange={(selectedOption) => {
                      console.log("Rol seleccionado:", selectedOption);
                      setFormWorkData((prevState) => ({
                        ...prevState,
                        id_rol: selectedOption ? selectedOption.value : 0,
                      }));
                    }}
                    options={rolOptions}
                    value={rolOptions.find(
                      (option) => option.value === formWorkData.id_rol,
                    )}
                  />
                  {errors.id_rol && (
                    <p className="text-red-500 text-sm">{errors.id_rol}</p>
                  )}
                </div>
                <div className="col-span-1">
                  <div className="relative w-full px-3 mb-2">
                    <label className="text-sm font-bold font-zen-kaku">
                      Organización
                    </label>
                  </div>
                  <Select
                    className="basic-single"
                    classNamePrefix="select"
                    isSearchable={true}
                    name="organizacion"
                    placeholder="Selecciona una organización"
                    aria-label="Organización"
                    options={organizacionOptions}
                    value={selectedorganizacion}
                    onChange={handleSelectorganizacion}
                  />
                  {errors.organizacionid && (
                    <p className="text-red-500 text-sm">
                      {errors.organizacionid}
                    </p>
                  )}
                </div>

                <div className="col-span-1">
                  <div className="relative w-full px-3 mb-2">
                    <label className="text-sm font-bold font-zen-kaku">
                      Puesto
                    </label>
                  </div>
                  <Select
                    className="basic-single"
                    classNamePrefix="select"
                    isSearchable={true}
                    name="puesto"
                    placeholder="Selecciona un puesto"
                    aria-label="Puesto"
                    options={puestosOptions}
                    onChange={handleSelectPuesto}
                    value={selectedPuesto}
                    styles={{
                      menu: (provided) => ({
                        ...provided,
                        zIndex: 9999,
                      }),
                    }}
                  />
                  {errors.id_puesto && (
                    <p className="text-red-500 text-sm">{errors.id_puesto}</p>
                  )}
                </div>

                <div className="col-span-1">
                  <div className="relative w-full px-3 mb-2">
                    <label className="text-sm font-bold font-zen-kaku">
                      Grupo
                    </label>
                  </div>
                  <Select
                    className="basic-single"
                    classNamePrefix="select"
                    isSearchable={true}
                    name="grupo"
                    placeholder="Selecciona un grupo"
                    aria-label="Grupo"
                    options={gruposOptions}
                    onChange={handleSelectGrupo}
                    value={selectedGrupo}
                    styles={{
                      menu: (provided) => ({
                        ...provided,
                        zIndex: 9999,
                      }),
                    }}
                  />
                  {errors.id_grupo && (
                    <p className="text-red-500 text-sm">{errors.id_grupo}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-end mt-28">
                <button
                  type="button"
                  onClick={() => handleStepChange(currentStep - 1)}
                  className="px-6 py-3 mb-1 mr-1 text-base font-bold text-gray-400 uppercase transition-all duration-150 rounded hover:text-gray-600 font-zen-kaku"
                >
                  Volver
                </button>
                <button
                  type="button"
                  className="bg-[#7FC3BB] ml-10 text-black hover:opacity-75 active:bg-emerald-600 font-zen-kaku font-bold uppercase text-base px-10 py-3 rounded-lg shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                  onClick={validformnextlaborales}
                >
                  Siguiente
                </button>
              </div>
            </form>
          )}
          {step === 3 && (
            <form
              className="z-50 h-auto p-4 mx-auto font-zen-kaku custom-form-proyect3"
              /*style={{ marginTop: "-120px" }}*/
              onSubmit={postCreateUser}
            >
              <>
                <div className="grid grid-cols-2 gap-4 mb-6 mt-6 custom-button-document">
                  <div className="col-span-2">
                    <div className="flex flex-row w-full px-2 mb-4 md:mb-0">
                      <label className="flex flex-row w-full px-3 py-2 text-sm font-zen-kaku">
                        Solo admite archivos PDF, DOCX, IMG{" "}
                        <ChevronRight strokeWidth={1} /> 30 MB
                      </label>
                    </div>
                  </div>
                  <div className="col-span-1">
                    <div className="relative w-full px-3 mb-2">
                      <label className="text-sm font-bold font-zen-kaku">
                        Certificado de vigencia de la empresa
                      </label>
                    </div>
                    <div className="flex items-center">
                      <label
                        htmlFor="certificadoVigenciaEmpresa"
                        className="flex items-center flex-grow px-4 py-3 text-sm border border-gray-300 rounded-lg cursor-pointer font-zen-kaku"
                      >
                        <Upload color="#828080" className="w-5 h-5 mr-2" />
                        {certificadoVigenciaEmpresaFileName
                          ? certificadoVigenciaEmpresaFileName
                          : "Haga clic o arrastre el archivo aquí para cargarlo"}
                      </label>
                      {certificadoVigenciaEmpresaFileName && (
                        <button
                          type="button"
                          onClick={() =>
                            eliminarArchivo(
                              setCertificadoVigenciaEmpresa,
                              setCertificadoVigenciaEmpresaFileName,
                            )
                          }
                          className="flex-shrink-0 ml-2 text-xs text-red-600 cursor-pointer hover:text-red-800"
                          style={{ fontSize: "1rem", lineHeight: "1rem" }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <input
                      type="file"
                      id="certificadoVigenciaEmpresa"
                      className="hidden"
                      onChange={(e) =>
                        manejarCambioArchivo(
                          e,
                          setCertificadoVigenciaEmpresa,
                          setCertificadoVigenciaEmpresaFileName,
                        )
                      }
                    />
                  </div>
                  <div className="col-span-1">
                    <div className="relative w-full px-3 mb-2">
                      <label className="text-sm font-bold font-zen-kaku">
                        Certificado de vigencia de la sociedad
                      </label>
                    </div>
                    <div className="flex items-center">
                      <label
                        htmlFor="certificadoVigenciaSociedad"
                        className="flex items-center flex-grow px-4 py-3 text-sm border border-gray-300 rounded-lg cursor-pointer font-zen-kaku"
                      >
                        <Upload color="#828080" className="w-5 h-5 mr-2" />
                        {certificadoVigenciaSociedadFileName
                          ? certificadoVigenciaSociedadFileName
                          : "Haga clic o arrastre el archivo aquí para cargarlo"}
                      </label>
                      {certificadoVigenciaSociedadFileName && (
                        <button
                          type="button"
                          onClick={() =>
                            eliminarArchivo(
                              setCertificadoVigenciaSociedad,
                              setCertificadoVigenciaSociedadFileName,
                            )
                          }
                          className="flex-shrink-0 ml-2 text-xs text-red-600 cursor-pointer hover:text-red-800"
                          style={{ fontSize: "1rem", lineHeight: "1rem" }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <input
                      type="file"
                      id="certificadoVigenciaSociedad"
                      className="hidden"
                      onChange={(e) =>
                        manejarCambioArchivo(
                          e,
                          setCertificadoVigenciaSociedad,
                          setCertificadoVigenciaSociedadFileName,
                        )
                      }
                    />
                  </div>
                  <div className="col-span-1">
                    <div className="relative w-full px-3 mb-2">
                      <label className="text-sm font-bold font-zen-kaku">
                        Certificado de no adeudo de la empresa
                      </label>
                    </div>
                    <div className="flex items-center">
                      <label
                        htmlFor="certificadoNoAdeudoEmpresa"
                        className="flex items-center flex-grow px-4 py-3 text-sm border border-gray-300 rounded-lg cursor-pointer font-zen-kaku"
                      >
                        <Upload color="#828080" className="w-5 h-5 mr-2" />
                        {certificadoNoAdeudoEmpresaFileName
                          ? certificadoNoAdeudoEmpresaFileName
                          : "Haga clic o arrastre el archivo aquí para cargarlo"}
                      </label>
                      {certificadoNoAdeudoEmpresaFileName && (
                        <button
                          type="button"
                          onClick={() =>
                            eliminarArchivo(
                              setCertificadoNoAdeudoEmpresa,
                              setCertificadoNoAdeudoEmpresaFileName,
                            )
                          }
                          className="flex-shrink-0 ml-2 text-xs text-red-600 cursor-pointer hover:text-red-800"
                          style={{ fontSize: "1rem", lineHeight: "1rem" }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <input
                      type="file"
                      id="certificadoNoAdeudoEmpresa"
                      className="hidden"
                      onChange={(e) =>
                        manejarCambioArchivo(
                          e,
                          setCertificadoNoAdeudoEmpresa,
                          setCertificadoNoAdeudoEmpresaFileName,
                        )
                      }
                    />
                  </div>

                  <div className="col-span-1">
                    <div className="relative w-full px-3 mb-2">
                      <label className="text-sm font-bold font-zen-kaku">
                        Póliza de seguro
                      </label>
                    </div>
                    <div className="flex items-center">
                      <label
                        htmlFor="polizaSeguro"
                        className="flex items-center flex-grow px-4 py-3 text-sm border border-gray-300 rounded-lg cursor-pointer font-zen-kaku"
                      >
                        <Upload color="#828080" className="w-5 h-5 mr-2" />
                        {polizaSeguroFileName
                          ? polizaSeguroFileName
                          : "Haga clic o arrastre el archivo aquí para cargarlo"}
                      </label>
                      {polizaSeguroFileName && (
                        <button
                          type="button"
                          onClick={() =>
                            eliminarArchivo(
                              setPolizaSeguro,
                              setPolizaSeguroFileName,
                            )
                          }
                          className="flex-shrink-0 ml-2 text-xs text-red-600 cursor-pointer hover:text-red-800"
                          style={{ fontSize: "1rem", lineHeight: "1rem" }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <input
                      type="file"
                      id="polizaSeguro"
                      className="hidden"
                      onChange={(e) =>
                        manejarCambioArchivo(
                          e,
                          setPolizaSeguro,
                          setPolizaSeguroFileName,
                        )
                      }
                    />
                  </div>
                  <div className="col-span-1">
                    <div className="relative w-full px-3 mb-2">
                      <label className="text-sm font-bold font-zen-kaku">
                        Contrato laboral del proyecto
                      </label>
                    </div>
                    <div className="flex items-center">
                      <label
                        htmlFor="contratoLaboralProyecto"
                        className="flex items-center flex-grow px-4 py-3 text-sm border border-gray-300 rounded-lg cursor-pointer font-zen-kaku"
                      >
                        <Upload color="#828080" className="w-5 h-5 mr-2" />
                        {contratoLaboralProyectoFileName
                          ? contratoLaboralProyectoFileName
                          : "Haga clic o arrastre el archivo aquí para cargarlo"}
                      </label>
                      {contratoLaboralProyectoFileName && (
                        <button
                          type="button"
                          onClick={() =>
                            eliminarArchivo(
                              setContratoLaboralProyecto,
                              setContratoLaboralProyectoFileName,
                            )
                          }
                          className="flex-shrink-0 ml-2 text-xs text-red-600 cursor-pointer hover:text-red-800"
                          style={{ fontSize: "1rem", lineHeight: "1rem" }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <input
                      type="file"
                      id="contratoLaboralProyecto"
                      className="hidden"
                      onChange={(e) =>
                        manejarCambioArchivo(
                          e,
                          setContratoLaboralProyecto,
                          setContratoLaboralProyectoFileName,
                        )
                      }
                    />
                  </div>

                  <div className="col-span-1">
                    <div className="relative w-full px-3 mb-2">
                      <label className="text-sm font-bold font-zen-kaku">
                        Bancarización
                      </label>
                    </div>
                    <div className="flex items-center">
                      <label
                        htmlFor="bancarizacion"
                        className="flex items-center flex-grow px-4 py-3 text-sm border border-gray-300 rounded-lg cursor-pointer font-zen-kaku"
                      >
                        <Upload color="#828080" className="w-5 h-5 mr-2" />
                        {bancarizacionFileName
                          ? bancarizacionFileName
                          : "Haga clic o arrastre el archivo aquí para cargarlo"}
                      </label>
                      {bancarizacionFileName && (
                        <button
                          type="button"
                          onClick={() =>
                            eliminarArchivo(
                              setBancarizacion,
                              setBancarizacionFileName,
                            )
                          }
                          className="flex-shrink-0 ml-2 text-xs text-red-600 cursor-pointer hover:text-red-800"
                          style={{ fontSize: "1rem", lineHeight: "1rem" }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <input
                      type="file"
                      id="bancarizacion"
                      className="hidden"
                      onChange={(e) =>
                        manejarCambioArchivo(
                          e,
                          setBancarizacion,
                          setBancarizacionFileName,
                        )
                      }
                    />
                  </div>
                  <div className="col-span-1">
                    <div className="relative w-full px-3 mb-2">
                      <label className="text-sm font-bold font-zen-kaku">
                        Certificado de impuestos internos
                      </label>
                    </div>
                    <div className="flex items-center">
                      <label
                        htmlFor="certificadoImpuestosInternos"
                        className="flex items-center flex-grow px-4 py-3 text-sm border border-gray-300 rounded-lg cursor-pointer font-zen-kaku"
                      >
                        <Upload color="#828080" className="w-5 h-5 mr-2" />
                        {certificadoImpuestosInternosFileName
                          ? certificadoImpuestosInternosFileName
                          : "Haga clic o arrastre el archivo aquí para cargarlo"}
                      </label>
                      {certificadoImpuestosInternosFileName && (
                        <button
                          type="button"
                          onClick={() =>
                            eliminarArchivo(
                              setCertificadoImpuestosInternos,
                              setCertificadoImpuestosInternosFileName,
                            )
                          }
                          className="flex-shrink-0 ml-2 text-xs text-red-600 cursor-pointer hover:text-red-800"
                          style={{ fontSize: "1rem", lineHeight: "1rem" }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <input
                      type="file"
                      id="certificadoImpuestosInternos"
                      className="hidden"
                      onChange={(e) =>
                        manejarCambioArchivo(
                          e,
                          setCertificadoImpuestosInternos,
                          setCertificadoImpuestosInternosFileName,
                        )
                      }
                    />
                  </div>

                  <div className="col-span-1">
                    <div className="relative w-full px-3 mb-2">
                      <label className="text-sm font-bold font-zen-kaku">
                        Certificado de afiliación a salud
                      </label>
                    </div>
                    <div className="flex items-center">
                      <label
                        htmlFor="certificadoAfiliacionSalud"
                        className="flex items-center flex-grow px-4 py-3 text-sm border border-gray-300 rounded-lg cursor-pointer font-zen-kaku"
                      >
                        <Upload color="#828080" className="w-5 h-5 mr-2" />
                        {certificadoAfiliacionSaludFileName
                          ? certificadoAfiliacionSaludFileName
                          : "Haga clic o arrastre el archivo aquí para cargarlo"}
                      </label>
                      {certificadoAfiliacionSaludFileName && (
                        <button
                          type="button"
                          onClick={() =>
                            eliminarArchivo(
                              setCertificadoAfiliacionSalud,
                              setCertificadoAfiliacionSaludFileName,
                            )
                          }
                          className="flex-shrink-0 ml-2 text-xs text-red-600 cursor-pointer hover:text-red-800"
                          style={{ fontSize: "1rem", lineHeight: "1rem" }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <input
                      type="file"
                      id="certificadoAfiliacionSalud"
                      aria-label="Ingreso de certificado de afiliacion de salud"
                      className="hidden"
                      onChange={(e) =>
                        manejarCambioArchivo(
                          e,
                          setCertificadoAfiliacionSalud,
                          setCertificadoAfiliacionSaludFileName,
                        )
                      }
                    />
                  </div>
                </div>
              </>
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
                    className="px-10 font-semibold text-black bg-teal-500 rounded-lg hover:bg-teal-600"
                  />
                  <ConfirmDialog
                    visible={showConfirm}
                    onHide={() => setShowConfirm(false)}
                    message={
                      <div>
                        Usuario interno creado correctamente!
                        <br />
                        Por favor rediríjase a la lista de usuarios.
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
                          className="px-2 py-1 text-base text-black transition-all duration-150 ease-linear bg-teal-500 rounded-md font-zen-kaku hover:bg-teal-600"
                          onClick={reject}
                        >
                          Rechazar
                        </button>
                        <button
                          className="px-2 py-1 text-base text-black transition-all duration-150 ease-linear bg-teal-500 rounded-md font-zen-kaku hover:bg-teal-600"
                          onClick={accept}
                        >
                          Aceptar
                        </button>
                      </div>
                    }
                  />
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Drawerinternal;
