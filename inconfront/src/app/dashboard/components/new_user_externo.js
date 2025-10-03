import React, { useState, useEffect } from "react";
import "../style/datepicker_new.css";
import { Upload, ChevronRight } from "lucide-react";
import Select from "react-select";
import { useSelector } from "react-redux";
import {
  getPaises,
  getRegionesPorPais,
  getComunasPorRegion,
  getOrganizacion,
  getAfp,
  getSalud,
  getTipoContrato,
  getMedioPago,
  getrol,
  getRolesExternos,
  getNombreBanco,
  getTipoCuenta,
  getPuesto,
  getRelacion,
  postUserProf,
  getCodTelefono,
  getEstado_civil,
} from "@/app/services/user";

import { genOptions, laboralStatusOptions } from "./data_option";
import { postUserDoc, registerExternalUser } from "@/app/services/user";
import toast from "react-hot-toast";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import es from "date-fns/locale/es";
import { ConfirmDialog } from "primereact/confirmdialog";
import { Button } from "primereact/button";
import "primereact/resources/themes/saga-blue/theme.css"; //tema
import "primereact/resources/primereact.min.css"; //core css
import "primeicons/primeicons.css"; //iconos
import "../style/custom_confirmation.css";
import "../style/custom_icon.css";
import "../style/media_query.css";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { formatearRUT } from './validForm/validRutChileno';

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
  validateinfoglobal,
  validatevalorglobal,
  validatecomuna,
  validateperfil,
  validatecodigoarea,
  validateseguro,
  validateafp,
  validateselectglobal,
  validatefechaglobal,
  validatecorreoe,
  validaterol,
  validateorganizacion,
  validaterelacion,
  validatenombremer,
  validatencuenta,
  validatepais,
  validateregion,
} from "./validForm/validusuario";

const formatCLP = (value) => {
  if (!value) return '';
  const num = String(value).replace(/\D/g, '');
  if (num === '') return '';
  return 'CLP $' + new Intl.NumberFormat('es-CL').format(num);
};

const Formulario_usuario_externo = ({ isOpen, onClose, setModalVisible }) => {
  const [formData, setFormData] = useState({
    name: "",
    apellido_p: "",
    apellido_m: "",
    email: "",
    rut: "",
    fecha_de_nacimiento: "",
    genero: "",
    calle: "",
    codigo_postal: "",
    ID_comuna: 0,
    organization: "",
    afp: "",
    prevision: "",
    Telefono: "",
    codtelefono: "",
    codtelefono_emergencia: "",
    tipo_contrato: "",
    fecha_actividad: "",
    estado_laboral: "",
    cargo: "",
    sueldo_base: "",
    gratificación: "",
    valor_dia: "",
    fecha_pago: "",
    fecha_ingreso: "",
    medio_pago: "",
    banco: "",
    n_cuenta: "",
    t_cuenta: "",
    c_electronico: "",
    tel_contacto: "",
    relacion: 0,
    name_contacto: "",
    correo_emergencia: "",
    username: "",
    estado_civil: "",
    estado_cuenta: 1,
  });
  const [showInternUser, setShowInternUser] = useState(false);
  const [showExternalUser, setExternalUser] = useState(false);
  const [showPersonalData, setShowPersonalData] = useState(false);
  const [showWorkData, setShowWorkData] = useState(false);
  const [showBankData, setShowBankData] = useState(false);
  const [showDocuments, setShowDocuments] = useState(false);
  const [showUserCreated, setShowUserCreated] = useState(false);
  const [date, setDate] = useState("");
  const [isDateInput, setIsDateInput] = useState(false);
  const [regionLabel, setRegionLabel] = useState("Ubicación");
  const [comunaLabel, setComunaLabel] = useState("Localidad");

  const userStore = useSelector((state) => state.user);
  const saludo = userStore.user ? `${userStore.user.names}` : "";
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    setShowPersonalData(false);
    setShowInternUser(false);
    setShowWorkData(true);
    console.log(formData);
  };

  const handleChange = (e) => {
    console.log(e.target.value);
    if (e.target.value === "interno") {
      setExternalUser(false);
      setShowInternUser(true);
    }

    if (e.target.value === "externo") {
      setShowInternUser(false);
      setExternalUser(true);
    }
  };

  const onFileChange = async (e) => {
    e.preventDefault();
    console.log("onFileChange", formData.email);
    const fileInputId = e.target.id;
    const file = e.target.files[0];
    const userMail = formData.email;
    console.log(e.target);
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("document_type", e.target.name);
      formData.append("userEmail", userMail);
      try {
        const response = await postUserDoc(formData);

        if (response.statusCode === 201) {
          toast.success(`Archivo ${e.target.name} subido correctamente`, {
            autoClose: 5000,
          });

          const fileInputElement = document.getElementById(fileInputId);
          fileInputElement.insertAdjacentHTML(
            "afterend",
            `
                        <div class="flex items-center text-sm font-zen-kaku text-green-700 rounded p-2 mt-2 transition-opacity duration-500 select-none">
                            Archivo subido correctamente
                        </div>
                    `,
          );
        }

        console.log(response);
      } catch (error) {
        console.log(error);
        toast.error("Error al subir el archivo");
      }
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    setShowPersonalData(false);
    setExternalUser(false);
    setShowInternUser(false);
    setShowWorkData(true);
  };

  const handleWorkNext = () => {
    console.log("HOlI");
    setShowWorkData(false);
    setShowBankData(true);
  };

  const handleBankNext = async () => {
    // Validar el formulario antes de proceder
    if (!validateFormcontrato()) {
        toast.error("Por favor, complete todos los campos requeridos");
        return;
    }

    // Verificar específicamente que fechaInicioContrato no sea null
    if (!fechaInicioContrato) {
        toast.error("La fecha de inicio de contrato es requerida");
        return;
    }

    const personal = {
      rut: formData.rut,
      nombre: formData.name,
      apellido_p: formData.apellido_p,
      apellido_m: formData.apellido_m,
      email: formData.email,
      password: "admin123",
      genero: formData.genero,
      fecha_de_nacimiento: fechaNacimiento,
      telefono: formData.Telefono,
      codtelefono: formData.codtelefono,
      direccion: formData.calle,
      ID_comuna: formData.ID_comuna,
      codigo_postal: formData.codigo_postal,
      organizacion: formData.organization,
      prevision: formData.prevision,
      afp: formData.afp,
      username: formData.username,
      estado_civil: formData.estado_civil,
      estado_cuenta: 1
    };

    const laboral = {
      tipo_contrato: formData.tipo_contrato,
      fecha_inicio_contrato: fechaInicioContrato,
      cargo: formData.cargo,
      sueldo_base: formData.sueldo_base,
      gratificacion: formData.gratificación,
      valor_dia: formData.valor_dia,
      fecha_de_pago: fechapago,
      fecha_de_ingreso_obra: fechaingreso,
      medio_pago: formData.medio_pago,
      id_puesto: formData.id_puesto,
      nombre_contacto: formData.name_contacto,
      telefono_emergencia: formData.tel_contacto,
      codtelefono_emergencia: formData.codtelefono_emergencia,
      correo_emergencia: formData.correo_emergencia,
      id_relacion_emergencia: formData.id_relacion_emergencia
    };
    
    const bank = {
      banco: parseInt(formData.banco) || null,
      numero_cuenta: formData.n_cuenta || null,
      tipo_cuenta: parseInt(formData.t_cuenta) || null,
      correo_banco: formData.c_electronico || null,
    };

    // Validar que los campos requeridos no estén vacíos antes de enviar
    if (!bank.banco || !bank.numero_cuenta || !bank.tipo_cuenta || !bank.correo_banco) {
      toast.error("Todos los campos bancarios son requeridos");
      return;
    }

    // Agregar este log para debuggear
    console.log("=== DEBUG BANK OBJECT ===");
    console.log("formData.banco:", formData.banco, typeof formData.banco);
    console.log("formData.n_cuenta:", formData.n_cuenta, typeof formData.n_cuenta);
    console.log("formData.t_cuenta:", formData.t_cuenta, typeof formData.t_cuenta);
    console.log("formData.c_electronico:", formData.c_electronico, typeof formData.c_electronico);
    console.log("bank object after conversion:", bank);
    console.log("========================");

    console.log("Creando usuario...", personal, laboral, bank);

    try {
      const response = await registerExternalUser(personal, laboral, bank);
      console.log(response);

      if (profileFile) {
        const formData = new FormData();
        formData.append("file", profileFile);
        formData.append("userEmail", personal.email);
        formData.append("document_type", "Foto de perfil usuario");
        await postUserProf(formData);
      }

      const documents = [
        { 
          file: fichaTrabajador, 
          name: "Ficha de trabajador" 
        },
        { 
          file: seguroLaboral, 
          name: "Seguro laboral" 
        },
        { file: examenesMedicos, 
          name: "Exámenes médicos" 
        },
        { 
          file: ultimasCotizaciones, 
          name: "Últimas cotizaciones" 
        },
        {
          file: contratoLaboralProyecto,
          name: "Contrato laboral del proyecto",
        },
        {
          file: certificadoAfiliacionSalud,
          name: "Certificado de afiliación de salud",
        },
        {
          file: certificadoAntecedentesCivil,
          name: "Certificado de antecedentes civiles",
        },
        { 
          file: licenciaConducir, 
          name: "Licencia de conducir" 
        },
        { 
          file: escaneadoCedula, name: "Escaneado de cédula" 
        },
        { 
          file: certificadoEstudios, 
          name: "Certificado de estudios" 
        },
        { 
          file: curriculumVitae, 
          name: "CV" 
        },
        { 
          file: documentosAdicionales, 
          name: "Documentos adicionales" 
        },
        { 
          file: documentosDomicilio, 
          name: "Documentos de domicilio" 
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

      if (response?.error) {
        toast.error(response.error?.message || "Error al crear usuario");
      }

      if (response?.statusCode === 201) {
        setShowBankData(false);
        setShowDocuments(true);
      }
    } catch (error) {
      console.error("Error al crear usuario", error);
      toast.error("Error al crear usuario");
    }
  };

  const handleDocumentsNext = async (e) => {
    e.preventDefault();

    setShowDocuments(false);
    setShowUserCreated(true);
  };

  const handleWorkPrevious = () => {
    setShowDocuments(false);
    setShowBankData(true);
  };
  const handlebankPrevious = () => {
    setShowBankData(false);
    setShowWorkData(true);
  };
  const handlePrevious = () => {
    setShowWorkData(false);
    setExternalUser(true);
  };

  const postCreateUser = async () => {
    setShowUserCreated(false);
    setModalVisible(false);
  };
  const [formErrors, setFormErrors] = useState({});

  const handleInput = (e) => {
    const { name, value } = e.target ? e.target : e;
    
    if (name === 'rut') {
      const rutFormateado = formatearRUT(value);
      
      setFormData({
        ...formData,
        [name]: rutFormateado,
      });
    } else if (name === 'name' || name === 'apellido_p' || name === 'apellido_m' || name === 'name_contacto') {
      // Capitalizar primera letra de cada palabra para nombres y apellidos
      const formattedValue = value
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      setFormData({
        ...formData,
        [name]: formattedValue,
      });
    } else {
      const currencyFields = ['sueldo_base', 'gratificación', 'valor_dia'];
      if (currencyFields.includes(name)) {
        const numericValue = value.replace(/\D/g, '');
        setFormData({
          ...formData,
          [name]: numericValue,
        });
      } else {
        setFormData({
          ...formData,
          [name]: value,
        });
      }
    }
  };

  const handleSelect = (e) => {
    const { name, value } = e;
    console.log(name, value);
    setFormData({
      ...formData,
      [name]: value,
    });

    console.log(formData);
  };

  const [isSearchable, setIsSearchable] = useState(true);
  const [fechaNacimiento, setFechaNacimiento] = useState(null);
  const [fechaInicioContrato, setFechaInicioContrato] = useState(null);
  const [fechaTerminoContrato, setFechaTerminoContrato] = useState(null);
  const [fechapago, setfechapago] = useState(null);
  const [fechaingreso, setfechaingreso] = useState(null);
  const [step, setStep] = useState(1);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCodTelefonoEmergencia, setSelectedCodTelefonoEmergencia] =
    useState(null);

  const [paisOptions, setPaisOptions] = useState([
    { value: "", label: "Seleccione pais" },
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

  const [codTelefonoOptions, setCodTelefonoOptions] = useState([]);
  const [selectedCodTelefono, setSelectedCodTelefono] = useState(null);

  const handleRedirect = () => {
    router.push("/dashboard/users");
  };

  useEffect(() => {
    fetchPaises();
  }, []);

  useEffect(() => {
    const fetchCodTelefono = async () => {
      try {
        const data = await getCodTelefono();
        const options = data.map((option) => ({
          value: option.id,
          label: `${option.cod_numero}`,
        }));
        setCodTelefonoOptions(options);
      } catch (error) {
        console.error("Error al obtener los códigos de teléfono:", error);
      }
    };

    fetchCodTelefono();
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
      // Limpia selección anterior y espera elección del usuario
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
      // Primero limpiamos todo
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

      // Luego actualizamos el país seleccionado
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

      // Finalmente buscamos las nuevas regiones
      fetchRegiones(selectedOption.value);

      // Limpiamos también el valor en formData
      setFormData((prevState) => ({
        ...prevState,
        ID_comuna: null,
        region: null,
      }));
    } else {
      // Limpiamos todo si no hay país seleccionado
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
  const [organizaciones, setOrganizaciones] = useState([]);
  const [selectedOrganization, setSelectedOrganization] = useState(null);

  useEffect(() => {
    const fetchOrganizaciones = async () => {
      try {
        const data = await getOrganizacion();
        setOrganizaciones(data);
      } catch (error) {
        console.error("Error al obtener las organizaciones:", error);
      }
    };

    fetchOrganizaciones();
  }, []);

  const handleSelectOrganizacion = (selectedOption) => {
    setSelectedOrganization(selectedOption);
    setFormData((prevFormData) => ({
      ...prevFormData,
      organization: selectedOption ? selectedOption.value : null,
    }));
  };

  const organizationOptions = organizaciones.map((organizacion) => ({
    value: organizacion.id,
    label: organizacion.nombre,
  }));

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

  const handleSelectAFP = (selectedOption) => {
    setSelectedAfp(selectedOption);
    setFormData((prevFormData) => ({
      ...prevFormData,
      afp: selectedOption ? selectedOption.value : null,
    }));
  };

  const [saludOptions, setSaludOptions] = useState([]);
  const [selectedSalud, setSelectedSalud] = useState(null);

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

  const handleSelectSalud = (selectedOption) => {
    setSelectedSalud(selectedOption);
    setFormData((prevFormData) => ({
      ...prevFormData,
      prevision: selectedOption ? selectedOption.value : null,
    }));
  };

  const [tipoContratoOptions, setTipoContratoOptions] = useState([]);
  const [selectedTipoContrato, setSelectedTipoContrato] = useState(null);

  useEffect(() => {
    const fetchTipoContratoData = async () => {
      try {
        const data = await getTipoContrato();
        const options = data.map((option) => ({
          value: option.id,
          label: option.nombre,
        }));
        setTipoContratoOptions(options);
      } catch (error) {
        console.error("Error al obtener los datos de tipo de contrato:", error);
      }
    };

    fetchTipoContratoData();
  }, []);

  const handleSelectTipoContrato = (selectedOption) => {
    setSelectedTipoContrato(selectedOption);
    setFormData((prevFormData) => ({
      ...prevFormData,
      tipo_contrato: selectedOption ? selectedOption.value : null,
    }));
  };

  const [medioPagoOptions, setMedioPagoOptions] = useState([]);
  const [selectedMedioPago, setSelectedMedioPago] = useState(null);

  useEffect(() => {
    const fetchMedioPagoData = async () => {
      try {
        const data = await getMedioPago();
        const options = data.map((option) => ({
          value: option.id,
          label: option.nombre,
        }));
        setMedioPagoOptions(options);
      } catch (error) {
        console.error("Error al obtener los datos de medio de pago:", error);
      }
    };

    fetchMedioPagoData();
  }, []);

  const handleSelectMedioPago = (selectedOption) => {
    setSelectedMedioPago(selectedOption);
    setFormData((prevFormData) => ({
      ...prevFormData,
      medio_pago: selectedOption ? selectedOption.value : null,
    }));
  };

  const [rolOptions, setRolOptions] = useState([]);
  const [selectedRol, setSelectedRol] = useState(null);

  useEffect(() => {
    const fetchRolData = async () => {
      try {
        const data = await getRolesExternos();
        const options = data.map((option) => ({
          value: option.id,
          label: option.nombre,
        }));
        setRolOptions(options);
      } catch (error) {
        console.error("Error al obtener los datos de rol:", error);
      }
    };

    fetchRolData();
  }, []);

  const handleSelectRol = (selectedOption) => {
    setSelectedRol(selectedOption);
    setFormData((prevFormData) => ({
      ...prevFormData,
      cargo: selectedOption ? selectedOption.value : null,
    }));
  };
  const [nombreBancoOptions, setNombreBancoOptions] = useState([]);
  const [tipoCuentaOptions, setTipoCuentaOptions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const nombreBancoData = await getNombreBanco();
        const tipoCuentaData = await getTipoCuenta();
        const nombreBancoOptionsMapped = nombreBancoData.map((opcion) => ({
          value: opcion.id_nombrebanco,
          label: opcion.nombrebanco,
        }));

        const tipoCuentaOptionsMapped = tipoCuentaData.map((opcion) => ({
          value: opcion.id,
          label: opcion.nombre,
        }));
        setNombreBancoOptions(nombreBancoOptionsMapped);
        setTipoCuentaOptions(tipoCuentaOptionsMapped);
      } catch (error) {
        console.error("Error al obtener los datos:", error);
      }
    };

    fetchData();
  }, []);

  const [selectedt_cuenta, setSelectedt_cuenta] = useState(null);

  const handletipocuenta = (option) => {
    setSelectedt_cuenta(option);
    setFormData((prevFormData) => ({
      ...prevFormData,
      t_cuenta: option ? option.value : null,
    }));
  };

  const stepsTotal = 4;
  const stepTitles = [
    "Datos personales",
    "Datos laborales",
    "Datos bancarios",
    "Carga de documentos",
  ];

  const handleStepChange = (newStep) => {
    if (validateForm()) {
      setStep(newStep);
      setCurrentStep(newStep);
    } else {
      toast.error("Formulario incompleto o con errores");
    }
  };

  const [selectedbanco, setSelectedbanco] = useState(null);

  const handleBancoChange = (option) => {
    setSelectedbanco(option);
    setFormData((prevFormData) => ({
      ...prevFormData,
      banco: option ? option.value : null,
    }));
  };

  const handleNextchange = () => {
    if (validateForm()) {
      handleStepChange(currentStep + 1);
      toast.success("Formulario correcto");
    } else {
      toast.error("Por favor, llenar el formulario");
    }
  };
  const handleNextchangeform = () => {
    if (validateFormcontrato()) {
      handleStepChange(currentStep + 1);
      toast.success("Formulario correcto");
    } else {
      toast.error("Por favor, llenar el formulario");
    }
  };
  const handleNextchangeformdata = () => {
    if (validateForbancarios()) {
      handleStepChange(currentStep + 1);
      toast.success("Formulario correcto");
    } else {
      toast.error("Por favor, llenar el formulario");
    }
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
    newErrors.telefono = validatelefono(formData.Telefono);
    newErrors.codtelefono = validatecodigoarea(formData.codtelefono);
    newErrors.username = validatenombreusuario(formData.username);
    newErrors.calle = validatedireccion(formData.calle);
    newErrors.codigo_postal = validatecodigopostal(formData.codigo_postal);
    newErrors.pais = validatepais(selectedPais ? selectedPais.value : "");
    newErrors.region = validateregion(
      selectedRegion ? selectedRegion.value : "",
      regionLabel,
    );
    newErrors.ID_comuna = validatecomuna(formData.ID_comuna, comunaLabel);
    newErrors.organization = validateorganizacion(formData.organization);
    newErrors.id_salud = validateseguro(formData.prevision);
    newErrors.afp = validateafp(formData.afp);
    newErrors.perfil = validateperfil(fileName);
    setErrors(newErrors);
    return Object.values(newErrors).every((error) => error === "");
  };
  
  const validateFormcontrato = () => {
    console.log("Validando formulario - fechaInicioContrato:", fechaInicioContrato);
    
    const newErrors = {};
    newErrors.tipo_contrato = validateselectglobal(formData.tipo_contrato);
    newErrors.fecha_inicio_contrato = validatefechaglobal(fechaInicioContrato);
    newErrors.cargo = validateselectglobal(formData.cargo);
    newErrors.relacion = validateselectglobal(formData.id_relacion_emergencia);
    newErrors.id_puesto = validateselectglobal(formData.id_puesto);
    newErrors.sueldo_base = validatevalorglobal(formData.sueldo_base);
    newErrors.gratificación = validatevalorglobal(formData.gratificación);
    newErrors.valor_dia = validatevalorglobal(formData.valor_dia);
    newErrors.fechapago = validatefechaglobal(fechapago);
    newErrors.fechaingreso = validatefechaglobal(fechaingreso);
    newErrors.medio_pago = validateselectglobal(formData.medio_pago);

    console.log("Errores de validación:", newErrors);
    
    setErrors(newErrors);
    return Object.values(newErrors).every((error) => error === "");
};

  const validateForbancarios = () => {
    const newErrors = {};
    newErrors.banco = validateselectglobal(formData.banco);
    newErrors.n_cuenta = validatencuenta(formData.n_cuenta);
    newErrors.t_cuenta = validateselectglobal(formData.t_cuenta);
    newErrors.c_electronico = validatecorreo(formData.c_electronico);
    setErrors(newErrors);
    return Object.values(newErrors).every((error) => error === "");
  };

  const accept = () => {
    // Lógica para aceptar el mensaje de confirmación
    setShowConfirm(false);
    handleBankNext();
    toast.success("Usuario externo creado correctamente");
    router.push("/dashboard/users");
  };

  const reject = () => {
    // Lógica para rechazar el mensaje de confirmación
    setShowConfirm(false);
  };

  const onclickfinishform = () => {
    // if (validateformdocuments()) {
    setShowConfirm(true);
    // } else {
    //     toast.error('Por favor, adjunte los archivos necesarios');
    // }
  };

  const [puestosOptions, setPuestosOptions] = useState([]);
  const [selectedPuesto, setSelectedPuesto] = useState(null);

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

    fetchPuestos();
  }, []);

  const handleSelectPuesto = (selectedOption) => {
    setSelectedPuesto(selectedOption);
    setFormData((prevState) => ({
      ...prevState,
      id_puesto: selectedOption ? selectedOption.value : null,
    }));
  };

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
    setFormData((prevState) => ({
      ...prevState,
      id_relacion_emergencia: selectedOption ? selectedOption.value : null,
    }));
  };

  const [fileName, setFileName] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [imagenPerfil, setImagenPerfil] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [uploadText, setUploadText] = useState("Subir foto");

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

  // Adjuntos no perfil
  const [fichaTrabajador, setFichaTrabajador] = useState(null);
  const [seguroLaboral, setSeguroLaboral] = useState(null);
  const [examenesMedicos, setExamenesMedicos] = useState(null);
  const [ultimasCotizaciones, setUltimasCotizaciones] = useState(null);
  const [contratoLaboralProyecto, setContratoLaboralProyecto] = useState(null);
  const [certificadoAfiliacionSalud, setCertificadoAfiliacionSalud] =
    useState(null);
  const [certificadoAntecedentesCivil, setCertificadoAntecedentesCivil] =
    useState(null);
  const [licenciaConducir, setLicenciaConducir] = useState(null);
  const [escaneadoCedula, setEscaneadoCedula] = useState(null);
  const [certificadoEstudios, setCertificadoEstudios] = useState(null);
  const [curriculumVitae, setCurriculumVitae] = useState(null);
  const [documentosAdicionales, setDocumentosAdicionales] = useState(null);
  const [documentosDomicilio, setDocumentosDomicilio] = useState(null);

  // Captura nombre
  const [fichaTrabajadorFileName, setFichaTrabajadorFileName] = useState("");
  const [fichaTrabajadorFile, setFichaTrabajadorFile] = useState(null);

  const [seguroLaboralFileName, setSeguroLaboralFileName] = useState("");
  const [seguroLaboralFile, setSeguroLaboralFile] = useState(null);

  const [examenesMedicosFileName, setExamenesMedicosFileName] = useState("");
  const [examenesMedicosFile, setExamenesMedicosFile] = useState(null);

  const [ultimasCotizacionesFileName, setUltimasCotizacionesFileName] =
    useState("");
  const [ultimasCotizacionesFile, setUltimasCotizacionesFile] = useState(null);

  const [contratoLaboralProyectoFileName, setContratoLaboralProyectoFileName] =
    useState("");
  const [contratoLaboralProyectoFile, setContratoLaboralProyectoFile] =
    useState(null);

  const [
    certificadoAfiliacionSaludFileName,
    setCertificadoAfiliacionSaludFileName,
  ] = useState("");
  const [certificadoAfiliacionSaludFile, setCertificadoAfiliacionSaludFile] =
    useState(null);

  const [
    certificadoAntecedentesCivilFileName,
    setCertificadoAntecedentesCivilFileName,
  ] = useState("");
  const [
    certificadoAntecedentesCivilFile,
    setCertificadoAntecedentesCivilFile,
  ] = useState(null);

  const [licenciaConducirFileName, setLicenciaConducirFileName] = useState("");
  const [licenciaConducirFile, setLicenciaConducirFile] = useState(null);

  const [escaneadoCedulaFileName, setEscaneadoCedulaFileName] = useState("");
  const [escaneadoCedulaFile, setEscaneadoCedulaFile] = useState(null);

  const [certificadoEstudiosFileName, setCertificadoEstudiosFileName] =
    useState("");
  const [certificadoEstudiosFile, setCertificadoEstudiosFile] = useState(null);

  const [curriculumVitaeFileName, setCurriculumVitaeFileName] = useState("");
  const [curriculumVitaeFile, setCurriculumVitaeFile] = useState(null);

  const [documentosAdicionalesFileName, setDocumentosAdicionalesFileName] =
    useState("");
  const [documentosAdicionalesFile, setDocumentosAdicionalesFile] =
    useState(null);

  const [documentosDomicilioFileName, setDocumentosDomicilioFileName] =
    useState("");
  const [documentosDomicilioFile, setDocumentosDomicilioFile] = useState(null);

  const [estadoCivilOptions, setEstadoCivilOptions] = useState([]);

  useEffect(() => {
    const fetchEstadoCivil = async () => {
      try {
        const data = await getEstado_civil();
        setEstadoCivilOptions(
          data.map((estado) => ({
            value: estado.id_estado_civil,
            label: estado.nombre_estado_civil,
          }))
        );
      } catch (error) {
        console.error("Error al cargar estados civiles:", error);
        toast.error("Error al cargar estados civiles");
      }
    };

    fetchEstadoCivil();
  }, []);

  const handleSelectEstadoCivil = (selectedOption) => {
    setFormData({
      ...formData,
      estado_civil: selectedOption.value,
    });
  };

  return (
    <div className="z-50 flex flex-col w-full h-screen overflow-x-hidden">
            <div className="flex-grow justify-center items-center font-zen-kaku bg-[#FAFAFA] p-4 select-none overflow-x-hidden">
                <div className='mt-6'></div>

                {/* Header */}
                <div className="grid items-center grid-cols-1 md:grid-cols-3 gap-4 mb-6 font-zen-kaku">
                    <label htmlFor="filtroSelect" className="ml-4 text-base font-bold text-black select-none font-zen-kaku">
                        Usuario | Nuevo Usuario Externo
                    </label>
                </div>

                {/* Contenedor Principal en Flex - Siguiendo el patrón de organization_internal */}
                <div className='mx-auto bg-white shadow-lg rounded-xl flex flex-col lg:flex-row gap-2 w-full lg:w-4/5'>

                    {/* Progress Bar que se adapta en mobile */}
                    <div className='flex flex-wrap lg:flex-col w-full lg:w-1/4 items-center lg:items-start p-4 sm:p-6'>
                        {[...Array(stepsTotal)].map((_, index) => (
                            <div key={index} className="flex flex-row items-center mb-3 lg:mb-4 mr-3">
                                <span
                                    className={`font-zen-kaku rounded-full h-10 w-10 flex justify-center items-center cursor-pointer transition-transform hover:scale-110 ease-linear 
                                        ${currentStep > index + 1
                                            ? 'bg-[#5C7891] text-white' 
                                            : currentStep === index + 1
                                                ? 'bg-[#7fa1c6] text-white ring-1 ring-[#5C7891] border-white border-4' 
                                                : 'border border-gray-400 text-gray-400'}`}
                                    onClick={() => handleStepChange(index + 1)}
                                >
                                    {index + 1}
                                </span>
                                <span className="text-sm font-semibold text-black font-zen-kaku ml-2 break-words max-w-[120px] lg:max-w-none">
                                    {stepTitles[index]}
                                </span>
                            </div>
                        ))}
                    </div>
          {step === 1 && (
            <form className='z-50 h-full p-4 mx-auto font-zen-kaku w-full' onSubmit={onSubmit}>
                <>

                    <div className='flex flex-wrap mb-6 mt-6'>
                        <div className='w-full md:w-1/3 px-3 mb-6 md:mb-0'>
                            <label className='text-sm font-bold font-zen-kaku'>RUT del Trabajador</label>
                            <input
                                className="w-full px-3 py-2 border rounded font-zen-kaku"
                                type="text"
                                placeholder="RUT del trabajador"
                                name='rut'
                                onChange={handleInput}
                                value={formData.rut}
                                aria-label="Ingresar RUT del trabajador"
                            />
                            {errors.rut && <p className="text-red-500 text-sm">{errors.rut}</p>}
                        </div>
                        
                        <div className='w-full md:w-1/3 px-3 mb-6 md:mb-0 z-40 justify-center'>
                            <label className='font-zen-kaku font-bold text-sm'>Nombre</label>
                            <input className={`font-zen w-full px-3 py-2 z-40 border rounded`}
                                id="grid-first-name" type="text" placeholder="Nombre" name='name' onChange={handleInput} value={formData.name} />
                                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                        </div>

                        <div className='font-zen w-full md:w-1/3 px-3 md:mb-0 z-40'>
                            <label className='font-zen-kaku font-bold text-sm'>Apellido paterno</label>
                            <input className={`w-full px-3 py-2 border rounded z-40`}
                                id="grid-last-name" type="text" placeholder="Apellido paterno" name='apellido_p' onChange={handleInput} value={formData.apellido_p} />
                                {errors.apellido_p && <p className="text-red-500 text-sm">{errors.apellido_p}</p>}
                        </div>
                        <div className='font-zen w-full md:w-1/3  px-3 md:mb-0  z-40'>
                        <div className='z-40 w-full px-3'>
                            <label className='font-zen-kaku font-bold text-sm '>Apellido Materno</label>
                        </div>
                            <input className={`w-full px-3 py-2 border rounded z-40`}
                                id="grid-last-name" type="text" placeholder="Apellido materno" name='apellido_m' onChange={handleInput} value={formData.apellido_m} />
                                {errors.apellido_m && <p className="text-red-500 text-sm">{errors.apellido_m}</p>}
                        </div>
                    </div>
                    <div className='flex flex-auto mb-3 md:w-1/2'>
                        <div className='w-full md:w-1/2 px-3 md:mb-0 flex-shrink-0'>
                        <div className='z-40 w-full px-3'>
                            <label className='font-zen-kaku font-bold text-sm'>Género</label>
                        </div>
                            <Select
                                className={`basic-single font-zen-kaku`}
                                classNamePrefix="select"
                                isSearchable={isSearchable}
                                name="genero"
                                placeholder="Selecciona género"
                                options={genOptions}
                                value={genOptions.find(option => option.value === formData.genero)}
                                onChange={handleSelect}
                            />
                            {errors.genero && <p className="text-red-500 text-sm">{errors.genero}</p>}
                        </div>
                        <div className='customDatePickerWidth22 w-full md:w-1/2 px-3 mb-6 md:mb-0'>
                        <div className='z-40 w-full px-3'>
                            <label className='font-zen-kaku font-bold text-sm'>Fecha de Nacimiento</label>
                        </div>
                            <DatePicker
                            selected={fechaNacimiento}
                            onChange={(date) => setFechaNacimiento(date)}
                            placeholderText="Selecciona fecha de nacimiento"
                            className="font-zen-kaku px-3 py-1.5 border border-gray-300 rounded w-full z-50"
                            locale="es"
                            dateFormat="yyyy/MM/dd"
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="select"
                            />
                            {errors.fechaNacimiento && (
                                <p className="text-red-500 text-sm">{errors.fechaNacimiento}</p>
                            )}
                        </div>
                    </div>
                    <div className='flex flex-auto mb-3 md:w-1/2'>
                        <div className='w-full md:w-1/2 px-3 md:mb-0 flex-shrink-0'>
                        <div className='z-40 w-full px-3'>
                            <label className='font-zen-kaku font-bold text-sm'>Estado Civil</label>
                        </div>
                            <Select
                                className={`basic-single font-zen-kaku`}
                                classNamePrefix="select"
                                isSearchable={isSearchable}
                                name="estado_civil"
                                placeholder="Selecciona estado civil"
                                options={estadoCivilOptions}
                                value={estadoCivilOptions.find(option => option.value === formData.estado_civil)}
                                onChange={handleSelectEstadoCivil}
                            />
                            {errors.estado_civil && <p className="text-red-500 text-sm">{errors.estado_civil}</p>}
                        </div>
                    </div>
                    <div className='flex flex-wrap mb-3 items-center md:w-3/4'>
                        <div className='w-full md:w-1/3 px-3 mb-6 md:mb-0'>
                        <div className='z-40 w-full px-3'>
                            <label className='font-zen-kaku font-bold text-sm whitespace-nowrap'>Correo electrónico</label>
                        </div>
                            <input className={`font-zen w-full px-3 py-2 border rounded z-40`}
                                id="grid-first-name" type="text" placeholder="Correo electrónico" name='email' onChange={handleInput} value={formData.email} />
                                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                        </div>
                        <div className='w-full md:w-1/3 px-3 md:mb-0 z-[60]'>
                        <div className='z-40 w-full px-3'>
                            <label className='font-zen-kaku font-bold text-sm'>Celular</label>
                        </div>
                        <div className="flex items-center">
                            <div className="w-1/3">
                            <Select
                                        className="basic-single"
                                        classNamePrefix="select"
                                        isSearchable={true}
                                        name="codtelefono"
                                        placeholder="+56"
                                        options={codTelefonoOptions}
                                        value={selectedCodTelefono}
                                        onChange={(option) => {
                                            setSelectedCodTelefono(option);
                                            handleSelect({ name: 'codtelefono', value: option.value });
                                        }}
                                        styles={{
                                            menu: (provided) => ({
                                                ...provided,
                                                zIndex: 9999
                                            })
                                        }}
                                    />
                                {errors.codtelefono && <p className="text-red-500 text-sm">{errors.codtelefono}</p>}
                            </div>
                            <div className="w-2/3 ml-2">
                                <input className={`font-zen w-full px-3 py-2 border rounded z-40`}
                                    id="grid-last-name" type="text" placeholder="Celular" name='Telefono' onChange={handleInput} value={formData.Telefono} />
                                {errors.telefono && <p className="text-red-500 text-sm">{errors.telefono}</p>}
                            </div>
                        </div>
                        </div>
                        
                        <div className='w-full md:w-1/3 px-3 mb-6 md:mb-0'>
                        <div className='z-40 w-full px-3'>
                            <label className='font-zen-kaku font-bold text-sm'>Usuario</label>
                        </div>
                                            <input className={`font-zen w-full px-3 py-2 border  rounded z-40`} id="grid-last-name" type="text" placeholder="Usuario" name='username' onChange={handleInput} value={formData.username} />
                                            {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}

                                    </div>
                    </div>
                    <div className='flex flex-wrap mb-3'>
                    <div className='w-full md:w-1/4 px-3 mb-6 md:mb-0'>
                    
                    <div className='w-full md:w-1/1 px-0 mb-6 md:mb-0'>
                    <div className='z-40 w-full px-3'>
                            <label className='font-zen-kaku font-bold text-sm whitespace-nowrap'>País</label>
                        </div>
                        <Select
                                className="basic-single"
                                classNamePrefix="select"
                                isSearchable={true}
                                name="pais"
                                placeholder="Selecciona país"
                                options={paisOptions}
                                value={selectedPais}
                                onChange={handleSelectPais}
                                styles={{
                                    menu: (provided) => ({
                                        ...provided,
                                        zIndex: 9999
                                    })
                                }}
                            />
                            {errors.pais && <p className="text-red-500 text-sm">{errors.pais}</p>}
                        </div>
                    </div>

                  <div className="w-full md:w-1/3 px-3 mb-6 md:mb-0 z-50">
                    <div className="z-40 w-full px-3">
                      <label className="font-zen-kaku font-bold text-sm whitespace-nowrap">
                        {regionLabel}
                      </label>
                    </div>
                    <Select
                      className="basic-single"
                      classNamePrefix="select"
                      isSearchable={true}
                      name="region"
                      placeholder={`Selecciona ${regionLabel.toLowerCase()}`}
                      options={regionOptions}
                      value={selectedRegion}
                      onChange={handleSelectRegion}
                      isDisabled={!selectedPais}
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
                  <div className="w-full md:w-1/3 px-3 md:mb-0 z-50">
                    <div className="z-40 w-full px-3">
                      <label className="font-zen-kaku font-bold text-sm whitespace-nowrap">
                        {comunaLabel}
                      </label>
                    </div>
                    <Select
                      className="basic-single"
                      classNamePrefix="select"
                      isSearchable={true}
                      name="id_comuna"
                      placeholder={`Selecciona ${comunaLabel.toLowerCase()}`}
                      options={comunaOptions}
                      value={selectedComuna}
                      onChange={handleSelectComuna}
                      isDisabled={!selectedRegion}
                      styles={{
                        menu: (provided) => ({
                          ...provided,
                          zIndex: 9999,
                        }),
                      }}
                    />
                    {errors.ID_comuna && (
                      <p className="text-red-500 text-sm">{errors.ID_comuna}</p>
                    )}
                  </div>

                  <div className="w-full md:w-1/3 px-3 md:mb-0">
                    <div className="z-40 w-full px-3 mt-4">
                      <label className="font-zen-kaku font-bold text-sm whitespace-nowrap">
                        Código Postal
                      </label>
                    </div>
                    <input
                      className={`font-zen w-full px-3 py-2 border rounded`}
                      id="grid-last-name"
                      type="text"
                      placeholder="Código Postal"
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
                  <div className="w-full md:w-1/2 px-3 md:mb-0">
                    <div className="z-40 w-full px-3 mt-4">
                      <label className="font-zen-kaku font-bold text-sm whitespace-nowrap">
                        Dirección
                      </label>
                    </div>
                    <input
                      className={`font-zen w-full px-3 py-2 border rounded z-40`}
                      id="grid-first-name"
                      type="text"
                      placeholder="Dirección"
                      name="calle"
                      onChange={handleInput}
                      value={formData.calle}
                    />
                    {errors.calle && (
                      <p className="text-red-500 text-sm">{errors.calle}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-row mb-3 md:w-3/4">
                  <div className="w-full md:w-1/3 px-3 z-40">
                    <div className="z-40 w-full px-3">
                      <label className="font-zen-kaku font-bold text-sm whitespace-nowrap">
                        Organización
                      </label>
                    </div>
                    <Select
                      className={`basic-single font-zen-kaku`}
                      classNamePrefix="select"
                      isSearchable={true}
                      name="organization"
                      placeholder="Organización a la que pertenece"
                      onChange={handleSelectOrganizacion}
                      value={selectedOrganization}
                      options={organizationOptions}
                    />
                    {errors.organization && (
                      <p className="text-red-500 text-sm">
                        {errors.organization}
                      </p>
                    )}
                  </div>
                  <div className="w-full md:w-1/3 px-3 z-40">
                    <div className="z-40 w-full px-3">
                      <label className="font-zen-kaku font-bold text-sm whitespace-nowrap">
                        Seguro Social
                      </label>
                    </div>
                    <Select
                      className={`basic-single font-zen-kaku`}
                      classNamePrefix="select"
                      isSearchable={true}
                      name="selectSalud"
                      placeholder="Selecciona previsión"
                      onChange={handleSelectSalud}
                      value={selectedSalud}
                      options={saludOptions}
                    />
                    {errors.id_salud && (
                      <p className="text-red-500 text-sm">{errors.id_salud}</p>
                    )}
                  </div>
                  <div className="w-full md:w-1/3 px-3">
                    <div className="z-40 w-full px-3">
                      <label className="font-zen-kaku font-bold text-sm whitespace-nowrap">
                        Administradoras de fondos de pensiones (AFP)
                      </label>
                    </div>
                    <Select
                      className={`basic-single font-zen-kaku`}
                      classNamePrefix="select"
                      isSearchable={true}
                      name="selectAfp"
                      placeholder="Selecciona una AFP"
                      onChange={handleSelectAFP}
                      value={selectedAfp}
                      options={afpOptions}
                    />
                    {errors.afp && (
                      <p className="text-red-500 text-sm">{errors.afp}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap mb-3 md:w-2/4">
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
                <div className="flex justify-end items-center mt-5">
                  <button
                    onClick={handleRedirect}
                    className="font-zen text-gray-400 hover:text-gray-600 font-bold uppercase text-base px-6 py-3 rounded  mr-1 mb-1 transition-all duration-150"
                    type="button"
                  >
                    Cancelar
                  </button>
                  <button
                    className="bg-[#5C7891] hover:bg-[#597387] font-zen text-gray-100 active:bg-[#597387] font-bold uppercase text-base px-10 py-3 rounded-lg shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="submit"
                    onClick={handleNextchange}
                  >
                    Siguiente
                  </button>
                </div>
              </>
            </form>
          )}

          {step === 2 && (
            <form
              className="mx-auto pl-80 p-4"
              onSubmit={onSubmit}
            >
              <>
                <div className="flex flex-auto mb-3 md:w-full">
                  <div className="w-full md:w-1/3 px-3 mb-6 md:mb-0 flex-shrink-0">
                    <div className="z-40 w-full px-3">
                      <label className="font-zen-kaku font-bold text-sm">
                        Tipo de contrato
                      </label>
                    </div>
                    <Select
                      className={`basic-single font-zen-kaku custom-zindex3`}
                      classNamePrefix="select"
                      isSearchable={true}
                      name="selectTipoContrato"
                      placeholder="Selecciona un tipo de contrato"
                      onChange={handleSelectTipoContrato}
                      value={selectedTipoContrato}
                      options={tipoContratoOptions}
                      menuPortalTarget={document.body}
                      styles={{
                        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                      }}
                    />
                    {errors.tipo_contrato && (
                      <p className="text-red-500 text-sm">
                        {errors.tipo_contrato}
                      </p>
                    )}
                  </div>
                  <div className="customDatePickerWidth22 w-full md:w-1/3 px-3 mb-6 md:mb-0">
                    <div className="z-40 w-full px-3">
                      <label className="font-zen-kaku font-bold text-sm">
                        Fecha Inicio Contrato
                      </label>
                    </div>
                    <DatePicker
                      selected={fechaInicioContrato}
                      onChange={(date) => {
                        console.log("DatePicker onChange - nueva fecha:", date);
                        setFechaInicioContrato(date);
                      }}
                      placeholderText="Selecciona fecha de inicio"
                      className="font-zen-kaku px-3 py-1.5 border border-gray-300 rounded w-full"
                      locale="es"
                      dateFormat="yyyy/MM/dd"
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                      isClearable={true}
                      required
                    />
                    {errors.fecha_inicio_contrato && (
                      <p className="text-red-500 text-sm">
                        {errors.fecha_inicio_contrato}
                      </p>
                    )}
                  </div>
                  <div className="customDatePickerWidth22 w-full md:w-1/3 px-3 mb-6 md:mb-0">
                      <div className="z-40 w-full px-3">
                        <label className="font-zen-kaku font-bold text-sm">
                          Fecha Término Contrato
                        </label>
                      </div>
                      <DatePicker
                        selected={fechaTerminoContrato}
                        onChange={(date) => setFechaTerminoContrato(date)}
                        placeholderText="Selecciona fecha de término"
                        className="font-zen-kaku px-3 py-1.5 border border-gray-300 rounded w-full"
                        locale="es"
                        dateFormat="yyyy/MM/dd"
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select"
                      />
                      {errors.fecha_termino_contrato && (
                        <p className="text-red-500 text-sm">
                          {errors.fecha_termino_contrato}
                        </p>
                      )}
                  </div>
                </div>
                <div className="flex flex-wrap mb-3 md:w-2/3">
                  <div className="w-full md:w-1/2 px-3 md:mb-0">
                    <div className="z-40 w-full px-3">
                      <label className="font-zen-kaku font-bold text-sm">
                        Rol del usuario
                      </label>
                    </div>
                        <Select
                            className={`basic-single font-zen-kaku custom-zindex4`}
                            classNamePrefix="select"
                            isSearchable={true}
                            name="selectRol"
                            placeholder="Selecciona un rol"
                            onChange={handleSelectRol}
                            value={selectedRol}
                            options={rolOptions}
                            styles={{
                                menu: (provided) => ({
                                    ...provided,
                                    zIndex: 9999
                                })
                            }}
                        />
                        {errors.cargo && <p className="text-red-500 text-sm">{errors.cargo}</p>}
                    </div>
                    <div className='relative w-full px-3'>
                                    <div className='z-40 w-full px-3'>
                                        <label className='text-sm font-bold font-zen-kaku'>Puesto</label>
                                    </div>
                                    <Select
                                        className="basic-single custom-zindex"
                                        classNamePrefix="select"
                                        isSearchable={true}
                                        name="puesto"
                                        placeholder="Seleccione un puesto"
                                        options={puestosOptions}
                                        onChange={handleSelectPuesto}
                                        value={selectedPuesto}
                                    />
                                    {errors.id_puesto && <p className="text-red-500 text-sm">{errors.id_puesto}</p>}
                                </div>
                </div>
                <div className="flex flex-wrap mb-3 z-40">
                  <div className="w-full md:w-1/3 px-3 mb-6 md:mb-0">
                    <div className="z-40 w-full px-3">
                      <label className="font-zen-kaku font-bold text-sm">
                        Sueldo base
                      </label>
                    </div>
                    <input
                      className={`w-full px-3 py-2 border rounded font-zen`}
                      id="grid-first-name"
                      type="text"
                      placeholder="Sueldo base"
                      name="sueldo_base"
                      onChange={handleInput}
                      value={formatCLP(formData.sueldo_base)}
                    />
                    {errors.sueldo_base && (
                      <p className="text-red-500 text-sm">
                        {errors.sueldo_base}
                      </p>
                    )}
                  </div>
                  <div className="w-full md:w-1/3 px-3 md:mb-0">
                    <div className="z-40 w-full px-3">
                      <label className="font-zen-kaku font-bold text-sm">
                        Gratificación
                      </label>
                    </div>
                    <input
                      className={`w-full px-3 py-2 border rounded font-zen`}
                      id="grid-last-name"
                      type="text"
                      placeholder="Gratificación"
                      name="gratificación"
                      onChange={handleInput}
                      value={formatCLP(formData.gratificación)}
                    />
                    {errors.gratificación && (
                      <p className="text-red-500 text-sm">
                        {errors.gratificación}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap mb-3 z-40">
                  <div className="w-full md:w-1/3 px-3 md:mb-0">
                    <div className="z-40 w-full px-3">
                      <label className="font-zen-kaku font-bold text-sm">
                        Valor hora
                      </label>
                    </div>
                    <input
                      className={`w-full px-3 py-2 border rounded font-zen`}
                      id="grid-last-name"
                      type="text"
                      placeholder="Valor hora"
                      name="valor_dia"
                      onChange={handleInput}
                      value={formatCLP(formData.valor_dia)}
                    />
                    {errors.valor_dia && (
                      <p className="text-red-500 text-sm">{errors.valor_dia}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-row mb-3 md:w-2/3">
                  <div className="customDatePickerWidth w-full md:w-1/2 px-3 ">
                    <div className="z-40 w-full px-3">
                      <label className="font-zen-kaku font-bold text-sm">
                        Fecha de pago
                      </label>
                    </div>
                    <DatePicker
                      selected={fechapago}
                      onChange={(date) => setfechapago(date)}
                      placeholderText="Selecciona fecha de pago"
                      className=" z-font-zen-kaku px-3 py-1.5 border border-gray-300 rounded w-full"
                      locale="es"
                      dateFormat="yyyy/MM/dd"
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                      portalId="datepicker-portal"
                      styles={{
                        menu: (provided) => ({
                          ...provided,
                          zIndex: 9999,
                        }),
                      }}
                    />
                    {errors.fechapago && (
                      <p className="text-red-500 text-sm">{errors.fechapago}</p>
                    )}
                  </div>
                  <div className="customDatePickerWidth w-full md:w-1/2 px-3 ">
                    <div className="z-40 w-full px-3">
                      <label className="font-zen-kaku font-bold text-sm">
                        Ingreso de obra
                      </label>
                    </div>
                    <DatePicker
                      selected={fechaingreso}
                      onChange={(date) => setfechaingreso(date)}
                      placeholderText="Selecciona fecha de ingreso a obra"
                      className="font-zen-kaku px-3 py-1.5 border border-gray-300 rounded w-full custom-zindex"
                      locale="es"
                      dateFormat="yyyy/MM/dd"
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                      styles={{
                        menu: (provided) => ({
                          ...provided,
                          zIndex: 9999,
                        }),
                      }}
                    />
                    {errors.fechaingreso && (
                      <p className="text-red-500 text-sm">
                        {errors.fechaingreso}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap mb-2 md:w-2/3">
                  <div className="w-full md:w-1/2 px-3 md:mb-0">
                    <div className="z-40 w-full px-3">
                      <label className="font-zen-kaku font-bold text-sm">
                        Medio de pago
                      </label>
                    </div>
                    <Select
                      className={`basic-single font-zen-kaku`}
                      classNamePrefix="select"
                      isSearchable={true}
                      name="selectMedioPago"
                      placeholder="Selecciona un medio de pago"
                      onChange={handleSelectMedioPago}
                      value={selectedMedioPago}
                      options={medioPagoOptions}
                      styles={{
                        menu: (provided) => ({
                          ...provided,
                          zIndex: 9999,
                        }),
                      }}
                    />
                    {errors.medio_pago && (
                      <p className="text-red-500 text-sm">
                        {errors.medio_pago}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap mb-5 md:w-2/3">
                  <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                    <div className="z-40 w-full px-3">
                      <label className="font-zen-kaku font-bold text-sm">
                        Número de contacto de emergencia
                      </label>
                    </div>
                    <div className="flex items-center">
                            <div className="w-1/3">
                            <Select
                                        className="basic-single"
                                        classNamePrefix="select"
                                        isSearchable={true}
                                        name="codtelefono_emergencia"
                                        placeholder="+56"
                                        options={codTelefonoOptions}
                                        value={selectedCodTelefonoEmergencia}
                                        onChange={(option) => {
                                            setSelectedCodTelefonoEmergencia(option);
                                            handleSelect({ name: 'codtelefono_emergencia', value: option ? option.value : null });
                                        }}
                                        styles={{
                                            menu: (provided) => ({
                                                ...provided,
                                                zIndex: 9999
                                            })
                                        }}
                                    />
                                {errors.codtelefono_emergencia && <p className="text-red-500 text-sm">{errors.codtelefono_emergencia}</p>}
                            </div>
                            <div className="w-2/3 ml-2">
                                <input className={`font-zen w-full px-3 py-2 border rounded`}
                                 id="grid-first-name" type="text" placeholder="Celular de contacto" name='tel_contacto' onChange={handleInput} value={formData.tel_contacto} />
                                {errors.tel_contacto && <p className="text-red-500 text-sm">{errors.tel_contacto}</p>}
                            </div>
                        </div>
                    </div>
                    <div className='relative w-full px-2 md:w-1/2'>
                                    <div className='relative w-full px-1 mb-3'>
                                        <div className='z-40 w-full px-3'>
                                        <label className='text-sm font-bold font-zen-kaku'>Relacion de contacto de emergencia</label>
                                        </div>
                                        <Select
                                            className="basic-single font-zen-kaku"
                                            classNamePrefix="select"
                                            isSearchable={true}
                                            name="relacion"
                                            placeholder="Relacion Contacto"
                                            options={relacionesOptions}
                                            value={relacionesOptions.find(option => option.value === formData.id_relacion_emergencia)}
                                            onChange={handleSelectRelacion}
                                            styles={{
                                                menu: (provided) => ({
                                                    ...provided,
                                                    zIndex: 9999
                                                })
                                            }}
                                        />
                                        {errors.relacion && <p className="text-red-500 text-sm">{errors.relacion}</p>}

                                    </div>


                                </div>
                                
                    <div className='w-full  px-3  md:mb-0 md:w-1/2'>
                    <div className='z-40 w-full px-3'>
                        <label className='font-zen-kaku font-bold text-sm'>Nombre del contacto de emergencia</label>
                    </div>
                    <input
                      className={`w-full px-3 py-2 border rounded font-zen`}
                      id="grid-last-name"
                      type="text"
                      placeholder="Nombre del contacto de emergencia"
                      name="name_contacto"
                      onChange={handleInput}
                      value={formData.name_contacto}
                    />
                    {errors.name_contacto && (
                      <p className="text-red-500 text-sm">
                        {errors.name_contacto}
                      </p>
                    )}
                  </div>
                  <div className="relative w-full px-3 md:w-1/2">
                    <div className="z-40 w-full px-3">
                      <label className="text-sm font-bold font-zen-kaku">
                        Correo contacto de emergencia
                      </label>
                    </div>
                    <input
                      className="w-full px-3 py-2 border rounded"
                      id="grid-last-name"
                      type="text"
                      placeholder="Correo del contacto de emergencia"
                      name="correo_emergencia"
                      onChange={handleInput}
                      value={formData.correo_emergencia}
                    />
                    {errors.correo_emergencia && (
                      <p className="text-red-500 text-sm">
                        {errors.correo_emergencia}
                      </p>
                    )}
                  </div>
                </div>
              </>
              <div className="flex justify-end items-center">
                <button
                  className=" font-zen text-gray-400 hover:text-gray-600 font-bold uppercase text-base px-6 py-3 rounded  mr-1 mb-1 transition-all duration-150"
                  type="submit"
                  onClick={() => handleStepChange(currentStep - 1)}
                >
                  Volver
                </button>
                <button
                  className="bg-[#5C7891] hover:bg-[#597387] font-zen text-white active:bg-emerald-600 font-bold uppercase text-base px-10 py-3 rounded-lg shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                  type="submit"
                  onClick={handleNextchangeform}
                >
                  Siguiente
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form
              className="mx-auto pl-80 p-4  select-none"
              style={{ marginTop: "-320px" }}
              onSubmit={onSubmit}
            >
              <>
                <div className="flex flex-wrap mb-6 mt-40 md:w-3/5">
                  <div className="z-40 w-full px-3">
                    <label className="font-zen-kaku font-bold">
                      Nombre del banco
                    </label>
                  </div>
                  <div
                    className="w-full px-3 mb-6 md:mb-0"
                    style={{ zIndex: 1001 }}
                  >
                    <Select
                      className={`basic-single font-zen-kaku`}
                      classNamePrefix="select"
                      isSearchable={true}
                      name="selectNombreBanco"
                      placeholder="Selecciona un nombre de banco"
                      options={nombreBancoOptions}
                      onChange={handleBancoChange}
                      value={selectedbanco}
                    />
                    {errors.banco && (
                      <p className="text-red-500 text-sm">{errors.banco}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap mb-6 md:w-3/5">
                  <div className="z-40 w-full px-3">
                    <label className="font-zen-kaku font-bold">
                      Número de cuenta
                    </label>
                  </div>
                  <div className="w-full  px-3 mb-6 md:mb-0 z-40">
                    <input
                      className={`w-full px-3 py-2 border rounded font-zen`}
                      id="grid-first-name"
                      type="text"
                      placeholder="Número de cuenta"
                      name="n_cuenta"
                      onChange={handleInput}
                      value={formData.n_cuenta}
                    />
                    {errors.n_cuenta && (
                      <p className="text-red-500 text-sm">{errors.n_cuenta}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap mb-6 md:w-3/5">
                  <div className="z-40 w-full px-3">
                    <label className="font-zen-kaku font-bold">
                      Tipo de cuenta
                    </label>
                  </div>
                  <div
                    className="w-full px-3 mb-6 md:mb-0"
                    style={{ zIndex: 1000 }}
                  >
                    <Select
                      className={`basic-single font-zen-kaku`}
                      classNamePrefix="select"
                      isSearchable={true}
                      name="selectTipoCuenta"
                      placeholder="Selecciona un tipo de cuenta"
                      options={tipoCuentaOptions}
                      onChange={handletipocuenta}
                      value={selectedt_cuenta}
                    />
                    {errors.t_cuenta && (
                      <p className="text-red-500 text-sm">{errors.t_cuenta}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap mb-6 md:w-3/5">
                  <div className="z-40 w-full px-3">
                    <label className="font-zen-kaku font-bold">
                      Correo electrónico
                    </label>
                  </div>
                  <div className="w-full px-3 mb-6 md:mb-0 z-30">
                    <input
                      className={`w-full px-3 py-2 border rounded font-zen`}
                      id="grid-first-name"
                      type="text"
                      placeholder="Correo electrónico"
                      name="c_electronico"
                      onChange={handleInput}
                      value={formData.c_electronico}
                    />
                    {errors.c_electronico && (
                      <p className="text-red-500 text-sm">
                        {errors.c_electronico}
                      </p>
                    )}
                  </div>
                </div>
              </>
              <div className="flex justify-end items-center mt-48">
                <button
                  className=" font-zen text-gray-400 hover:text-gray-600 font-bold uppercase text-base px-6 py-3 rounded  mr-1 mb-1 transition-all duration-150"
                  type="submit"
                  onClick={() => handleStepChange(currentStep - 1)}
                >
                  Volver
                </button>
                <button
                  className="bg-[#5C7891] hover:bg-[#597387] font-zen text-white active:bg-[#597387] font-bold uppercase text-base px-10 py-3 rounded-lg shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                  type="submit"
                  onClick={handleNextchangeformdata}
                >
                  Siguiente
                </button>
              </div>
            </form>
          )}

          {step === 4 && (
            <form
              className="mx-auto pl-80 p-4 "
              style={{ marginTop: "-180px" }}
              onSubmit={onSubmit}
            >
              <>
                <div className="flex flex-row">
                  <div className="w-full flex flex-row px-2 mb-4 md:mb-0">
                    <label className="w-full px-3 py-2 font-zen-kaku text-sm flex flex-row">
                      Solo admite archivos PDF, DOCX, IMG{" "}
                      <ChevronRight strokeWidth={1} /> 30 MB
                    </label>
                  </div>
                </div>
                <div className="flex flex-wrap mb-1 md:w-3/4">
                  <div className="w-full md:w-1/2 px-3 md:mb-0 z-50">
                    <div className="z-40 w-full px-3">
                      <label className="font-zen-kaku font-bold text-sm">
                        Ficha del trabajador
                      </label>
                    </div>
                    <div className="flex items-center">
                      <label
                        htmlFor="workerFile"
                        className="flex items-center flex-grow px-4 py-3 text-sm border border-gray-300 rounded-lg cursor-pointer font-zen-kaku"
                      >
                        <Upload color="#828080" className="w-5 h-5 mr-2" />
                        {fichaTrabajadorFileName
                          ? fichaTrabajadorFileName
                          : "Haga clic o arrastre el archivo aquí para cargarlo"}
                      </label>
                      {fichaTrabajadorFileName && (
                        <button
                          type="button"
                          onClick={() =>
                            eliminarArchivo(
                              setFichaTrabajador,
                              setFichaTrabajadorFileName,
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
                      id="workerFile"
                      className="hidden"
                      onChange={(e) =>
                        manejarCambioArchivo(
                          e,
                          setFichaTrabajador,
                          setFichaTrabajadorFileName,
                        )
                      }
                    />
                  </div>

                  <div className="w-full md:w-1/2 px-3 md:mb-0 z-50">
                    <div className="z-40 w-full px-3">
                      <label className="font-zen-kaku font-bold text-sm">
                        Seguro laboral
                      </label>
                    </div>
                    <div className="flex items-center">
                      <label
                        htmlFor="workEnsurance"
                        className="flex items-center flex-grow px-4 py-3 text-sm border border-gray-300 rounded-lg cursor-pointer font-zen-kaku"
                      >
                        <Upload color="#828080" className="w-5 h-5 mr-2" />
                        {seguroLaboralFileName
                          ? seguroLaboralFileName
                          : "Haga clic o arrastre el archivo aquí para cargarlo"}
                      </label>
                      {seguroLaboralFileName && (
                        <button
                          type="button"
                          onClick={() =>
                            eliminarArchivo(
                              setSeguroLaboral,
                              setSeguroLaboralFileName,
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
                      id="workEnsurance"
                      className="hidden"
                      onChange={(e) =>
                        manejarCambioArchivo(
                          e,
                          setSeguroLaboral,
                          setSeguroLaboralFileName,
                        )
                      }
                    />
                  </div>
                </div>
                <div className="flex flex-wrap mb-1 md:w-3/4">
                  <div className="w-full md:w-1/2 px-3 md:mb-0 z-50">
                    <div className="z-40 w-full px-3">
                      <label className="font-zen-kaku font-bold text-sm">
                        Exámenes médicos
                      </label>
                    </div>
                    <div className="flex items-center">
                      <label
                        htmlFor="medFile"
                        className="flex items-center flex-grow px-4 py-3 text-sm border border-gray-300 rounded-lg cursor-pointer font-zen-kaku"
                      >
                        <Upload color="#828080" className="w-5 h-5 mr-2" />
                        {examenesMedicosFileName
                          ? examenesMedicosFileName
                          : "Haga clic o arrastre el archivo aquí para cargarlo"}
                      </label>
                      {examenesMedicosFileName && (
                        <button
                          type="button"
                          onClick={() =>
                            eliminarArchivo(
                              setExamenesMedicos,
                              setExamenesMedicosFileName,
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
                      id="medFile"
                      className="hidden"
                      onChange={(e) =>
                        manejarCambioArchivo(
                          e,
                          setExamenesMedicos,
                          setExamenesMedicosFileName,
                        )
                      }
                    />
                  </div>

                  <div className="w-full md:w-1/2 px-3 md:mb-0 z-50">
                    <div className="z-40 w-full px-3">
                      <label className="font-zen-kaku font-bold text-sm">
                        Últimas cotizaciones
                      </label>
                    </div>
                    <div className="flex items-center">
                      <label
                        htmlFor="quotesFile"
                        className="flex items-center flex-grow px-4 py-3 text-sm border border-gray-300 rounded-lg cursor-pointer font-zen-kaku"
                      >
                        <Upload color="#828080" className="w-5 h-5 mr-2" />
                        {ultimasCotizacionesFileName
                          ? ultimasCotizacionesFileName
                          : "Haga clic o arrastre el archivo aquí para cargarlo"}
                      </label>
                      {ultimasCotizacionesFileName && (
                        <button
                          type="button"
                          onClick={() =>
                            eliminarArchivo(
                              setUltimasCotizaciones,
                              setUltimasCotizacionesFileName,
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
                      id="quotesFile"
                      className="hidden"
                      onChange={(e) =>
                        manejarCambioArchivo(
                          e,
                          setUltimasCotizaciones,
                          setUltimasCotizacionesFileName,
                        )
                      }
                    />
                  </div>
                </div>

                <div className="flex flex-wrap mb-1 md:w-3/4">
                  <div className="w-full md:w-1/2 px-3 md:mb-0 z-50">
                    <div className="z-40 w-full px-3">
                      <label className="font-zen-kaku font-bold text-sm">
                        Contrato laboral de proyecto
                      </label>
                    </div>
                    <div className="flex items-center">
                      <label
                        htmlFor="fileContract"
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
                      id="fileContract"
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

                  <div className="w-full md:w-1/2 px-3 md:mb-0 z-50">
                    <div className="z-40 w-full px-3">
                      <label className="font-zen-kaku font-bold text-sm">
                        Certificado de afiliación de salud
                      </label>
                    </div>
                    <div className="flex items-center">
                      <label
                        htmlFor="afpFile"
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
                      id="afpFile"
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

                <div className="flex flex-wrap mb-1 md:w-3/4">
                  <div className="w-full md:w-1/2 px-3 md:mb-0">
                    <div className="z-40 w-full px-3">
                      <label className="font-zen-kaku font-bold text-sm">
                        Certificado de antecedentes del registro civil
                      </label>
                    </div>
                    <div className="flex items-center">
                      <label
                        htmlFor="backgroundFile"
                        className="flex items-center flex-grow px-4 py-3 text-sm border border-gray-300 rounded-lg cursor-pointer font-zen-kaku"
                      >
                        <Upload color="#828080" className="w-5 h-5 mr-2" />
                        {certificadoAntecedentesCivilFileName
                          ? certificadoAntecedentesCivilFileName
                          : "Haga clic o arrastre el archivo aquí para cargarlo"}
                      </label>
                      {certificadoAntecedentesCivilFileName && (
                        <button
                          type="button"
                          onClick={() =>
                            eliminarArchivo(
                              setCertificadoAntecedentesCivil,
                              setCertificadoAntecedentesCivilFileName,
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
                      id="backgroundFile"
                      className="hidden"
                      onChange={(e) =>
                        manejarCambioArchivo(
                          e,
                          setCertificadoAntecedentesCivil,
                          setCertificadoAntecedentesCivilFileName,
                        )
                      }
                    />
                  </div>
                </div>

                <div className="flex flex-wrap mb-1 md:w-3/4">
                  <div className="w-full md:w-1/2 px-3 md:mb-0">
                    <div className="z-40 w-full px-3">
                      <label className="font-zen-kaku font-bold text-sm">
                        Licencia de conducir (Si aplica)
                      </label>
                    </div>
                    <div className="flex items-center">
                      <label
                        htmlFor="driveFile"
                        className="flex items-center flex-grow px-4 py-3 text-sm border border-gray-300 rounded-lg cursor-pointer font-zen-kaku"
                      >
                        <Upload color="#828080" className="w-5 h-5 mr-2" />
                        {licenciaConducirFileName
                          ? licenciaConducirFileName
                          : "Haga clic o arrastre el archivo aquí para cargarlo"}
                      </label>
                      {licenciaConducirFileName && (
                        <button
                          type="button"
                          onClick={() =>
                            eliminarArchivo(
                              setLicenciaConducir,
                              setLicenciaConducirFileName,
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
                      id="driveFile"
                      className="hidden"
                      onChange={(e) =>
                        manejarCambioArchivo(
                          e,
                          setLicenciaConducir,
                          setLicenciaConducirFileName,
                        )
                      }
                    />
                  </div>

                  <div className="w-full md:w-1/2 px-3 md:mb-0">
                    <div className="z-40 w-full px-3">
                      <label className="font-zen-kaku font-bold text-sm">
                        Escáner de cédula de identidad
                      </label>
                    </div>
                    <div className="flex items-center">
                      <label
                        htmlFor="dniFile"
                        className="flex items-center flex-grow px-4 py-3 text-sm border border-gray-300 rounded-lg cursor-pointer font-zen-kaku"
                      >
                        <Upload color="#828080" className="w-5 h-5 mr-2" />
                        {escaneadoCedulaFileName
                          ? escaneadoCedulaFileName
                          : "Haga clic o arrastre el archivo aquí para cargarlo"}
                      </label>
                      {escaneadoCedulaFileName && (
                        <button
                          type="button"
                          onClick={() =>
                            eliminarArchivo(
                              setEscaneadoCedula,
                              setEscaneadoCedulaFileName,
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
                      id="dniFile"
                      className="hidden"
                      onChange={(e) =>
                        manejarCambioArchivo(
                          e,
                          setEscaneadoCedula,
                          setEscaneadoCedulaFileName,
                        )
                      }
                    />
                  </div>
                </div>

                <div className="flex flex-wrap mb-1 md:w-3/4">
                  <div className="w-full md:w-1/2 px-3 md:mb-0">
                    <div className="z-40 w-full px-3">
                      <label className="font-zen-kaku font-bold text-sm">
                        Certificado de estudios
                      </label>
                    </div>
                    <div className="flex items-center">
                      <label
                        htmlFor="studyFile"
                        className="flex items-center flex-grow px-4 py-3 text-sm border border-gray-300 rounded-lg cursor-pointer font-zen-kaku"
                      >
                        <Upload color="#828080" className="w-5 h-5 mr-2" />
                        {certificadoEstudiosFileName
                          ? certificadoEstudiosFileName
                          : "Haga clic o arrastre el archivo aquí para cargarlo"}
                      </label>
                      {certificadoEstudiosFileName && (
                        <button
                          type="button"
                          onClick={() =>
                            eliminarArchivo(
                              setCertificadoEstudios,
                              setCertificadoEstudiosFileName,
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
                      id="studyFile"
                      className="hidden"
                      onChange={(e) =>
                        manejarCambioArchivo(
                          e,
                          setCertificadoEstudios,
                          setCertificadoEstudiosFileName,
                        )
                      }
                    />
                  </div>

                  <div className="w-full md:w-1/2 px-3 md:mb-0">
                    <div className="z-40 w-full px-3">
                      <label className="font-zen-kaku font-bold text-sm">
                        Curriculum Vitae
                      </label>
                    </div>
                    <div className="flex items-center">
                      <label
                        htmlFor="cvFile"
                        className="flex items-center flex-grow px-4 py-3 text-sm border border-gray-300 rounded-lg cursor-pointer font-zen-kaku"
                      >
                        <Upload color="#828080" className="w-5 h-5 mr-2" />
                        {curriculumVitaeFileName
                          ? curriculumVitaeFileName
                          : "Haga clic o arrastre el archivo aquí para cargarlo"}
                      </label>
                      {curriculumVitaeFileName && (
                        <button
                          type="button"
                          onClick={() =>
                            eliminarArchivo(
                              setCurriculumVitae,
                              setCurriculumVitaeFileName,
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
                      id="cvFile"
                      className="hidden"
                      onChange={(e) =>
                        manejarCambioArchivo(
                          e,
                          setCurriculumVitae,
                          setCurriculumVitaeFileName,
                        )
                      }
                    />
                  </div>
                </div>

                <div className="flex flex-wrap mb-1 md:w-3/4">
                  <div className="w-full md:w-1/2 px-3 md:mb-0">
                    <div className="z-40 w-full px-3">
                      <label className="font-zen-kaku font-bold text-sm">
                        Documentos adicionales (si no es profesional y es
                        obrero)
                      </label>
                    </div>
                    <div className="flex items-center">
                      <label
                        htmlFor="othersFile"
                        className="flex items-center flex-grow px-4 py-3 text-sm border border-gray-300 rounded-lg cursor-pointer font-zen-kaku"
                      >
                        <Upload color="#828080" className="w-5 h-5 mr-2" />
                        {documentosAdicionalesFileName
                          ? documentosAdicionalesFileName
                          : "Haga clic o arrastre el archivo aquí para cargarlo"}
                      </label>
                      {documentosAdicionalesFileName && (
                        <button
                          type="button"
                          onClick={() =>
                            eliminarArchivo(
                              setDocumentosAdicionales,
                              setDocumentosAdicionalesFileName,
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
                      id="othersFile"
                      className="hidden"
                      onChange={(e) =>
                        manejarCambioArchivo(
                          e,
                          setDocumentosAdicionales,
                          setDocumentosAdicionalesFileName,
                        )
                      }
                    />
                  </div>
                </div>

                <div className="flex flex-wrap mb-1 md:w-3/4">
                  <div className="w-full md:w-1/2 px-3 md:mb-0">
                    <div className="z-40 w-full px-3">
                      <label className="font-zen-kaku font-bold text-sm">
                        Documentos de domicilio y comprobante
                      </label>
                    </div>
                    <div className="flex items-center">
                      <label
                        htmlFor="homeFile"
                        className="flex items-center flex-grow px-4 py-3 text-sm border border-gray-300 rounded-lg cursor-pointer font-zen-kaku"
                      >
                        <Upload color="#828080" className="w-5 h-5 mr-2" />
                        {documentosDomicilioFileName
                          ? documentosDomicilioFileName
                          : "Haga clic o arrastre el archivo aquí para cargarlo"}
                      </label>
                      {documentosDomicilioFileName && (
                        <button
                          type="button"
                          onClick={() =>
                            eliminarArchivo(
                              setDocumentosDomicilio,
                              setDocumentosDomicilioFileName,
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
                      id="homeFile"
                      className="hidden"
                      onChange={(e) =>
                        manejarCambioArchivo(
                          e,
                          setDocumentosDomicilio,
                          setDocumentosDomicilioFileName,
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
                    className="px-10 font-semibold text-black bg-[#5C7891] rounded-lg hover:bg-[#597387]"
                  />
                  <ConfirmDialog
                    visible={showConfirm}
                    onHide={() => setShowConfirm(false)}
                    message={
                      <div>
                        Usuario externo creado correctamente!
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
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
export default Formulario_usuario_externo;
