import React, { useState, useEffect } from "react";
import Select from "react-select";
import { Upload, PencilLine, BriefcaseBusiness, Check } from "lucide-react";
import "../style/external_user.css";
import {
  postOrganization,
  postOrganizationDoc,
  postOrganizationProf,
} from "@/app/services/organizacion";
import Image from "next/image";
import "../style/datepicker_new.css";
import toast from "react-hot-toast";
import {
  genOptions,
  paisOptions,
  previsionOptions,
  afpOptions,
  contractTypeOptions,
  laboralStatusOptions,
  positionOptions,
  payType,
  banksOptions,
  bankAccountTypeOptions,
  regionOptions,
  comunaOptions,
  genResponsable,
} from "./data_option";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import es from "date-fns/locale/es";
registerLocale("es", es);

const Newproyectdrawer = ({
  isOpen,
  onClose,
  userType,
  setModalVisible,
  value,
  onChange,
}) => {
  const [imagenPerfil, setImagenPerfil] = useState(null);
  const [fileValidity, setFileValidity] = useState(false);
  const [fileOwe, setFileOwe] = useState(false);
  const [fileContract, setFileContract] = useState(false);
  const [fileSii, setFileSii] = useState(false);
  const [fileSocietyValidity, setFileSocietyValidity] = useState(false);
  const [fileEnsurance, setFileEnsurance] = useState(false);
  const [fileBank, setFileBank] = useState(false);
  const [fileHealth, setFileHealth] = useState(false);
  const [createdOrganizationId, setCreatedOrganizationId] = useState("");
  const [profileFile, setProfileFile] = useState(null);
  const [fechainicio, setfechainicio] = useState(null);
  const [fechatermino, setfechatermino] = useState(null);

  const manejarCambioImagen = async (evento) => {
    const archivo = evento.target.files[0];
    console.log(archivo);
    if (archivo && archivo.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagenPerfil(reader.result);
      };
      reader.readAsDataURL(archivo);
      setUploadText("Cambiar foto");
      setProfileFile(archivo);
    }
  };

  const onFileValidityChange = async (e) => {
    console.log("onFileValidityChange");
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("document_type", "Certificado de vigencia de la empresa");
      formData.append("organizationId", createdOrganizationId);

      try {
        const response = await postOrganizationDoc(formData);
        console.log(response);
        setFileValidity(true);
      } catch (error) {
        console.log(error);
        toast.error("Error al subir el archivo");
      }
    }

    // setTimeout(() => {
    //     setFileValidity(false);
    // }, 5000);
  };

  const onFileOweChange = async (e) => {
    console.log("onFileOweChange");
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "document_type",
        "Certificado de no adeudo de la empresa",
      );
      formData.append("organizationId", createdOrganizationId);

      try {
        const response = await postOrganizationDoc(formData);
        console.log(response);
        setFileOwe(true);
      } catch (error) {
        console.log(error);
        toast.error("Error al subir el archivo");
      }
    }

    // setTimeout(() => {
    //     setFileOwe(false);
    // }, 5000);
  };

  const onFileContractChange = async (e) => {
    console.log("onFileContractChange");
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("document_type", "Contrato laboral de proyecto");
      formData.append("organizationId", createdOrganizationId);

      try {
        const response = await postOrganizationDoc(formData);
        console.log(response);

        setFileContract(true);
      } catch (error) {
        console.log(error);
        toast.error("Error al subir el archivo");
      }
    }
  };

  const onFileSiiChange = async (e) => {
    console.log("onFileSiiChange");
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "document_type",
        "Certificado del servicio de impuestos internos",
      );
      formData.append("organizationId", createdOrganizationId);

      try {
        const response = await postOrganizationDoc(formData);
        console.log(response);
        setFileSii(true);
      } catch (error) {
        console.log(error);
        toast.error("Error al subir el archivo");
      }
    }

    // setTimeout(() => {
    //     setFileSii(false);
    // }, 5000);
  };

  const onFileSocietyValidityChange = async (e) => {
    console.log("onFileSocietyValidityChange");

    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "document_type",
        "Certificado de vigencia de la sociedad",
      );
      formData.append("organizationId", createdOrganizationId);

      try {
        const response = await postOrganizationDoc(formData);
        console.log(response);
        setFileSocietyValidity(true);
      } catch (error) {
        console.log(error);
        toast.error("Error al subir el archivo");
      }
    }
  };

  const onFileEnsurance = async (e) => {
    console.log("onFileEnsurance");

    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("document_type", "Póliza de seguro");
      formData.append("organizationId", createdOrganizationId);

      try {
        const response = await postOrganizationDoc(formData);
        console.log(response);
        setFileEnsurance(true);
      } catch (error) {
        console.log(error);
        toast.error("Error al subir el archivo");
      }
    }
  };

  const onFileBankChange = async (e) => {
    console.log("onFileBankChange");

    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("document_type", "Bancarización");
      formData.append("organizationId", createdOrganizationId);

      try {
        const response = await postOrganizationDoc(formData);

        setFileBank(true);
      } catch (error) {
        console.log(error);
        toast.error("Error al subir el archivo");
      }
    }
  };

  const onFileHealthChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("document_type", "Certificado de afiliación a salud");
      formData.append("organizationId", createdOrganizationId);

      try {
        const response = await postOrganizationDoc(formData);

        setFileHealth(true);
      } catch (error) {
        console.log(error);
        toast.error("Error al subir el archivo");
      }
    }
  };

  // Formulario datos personales
  const [formData, setFormData] = useState({
    nombre: "",
    direccion: "",
    telefono: "",
    email: "",
    sitio_web: "",
    descripcion: "",
    rut: "",
    tipo: "",
    representante_legal: "",
    cant_partidas: 0,
  });

  const [showInternUser, setShowInternUser] = useState(false);
  const [showExternalUser, setExternalUser] = useState(false);
  const [showPersonalData, setShowPersonalData] = useState(false);
  const [showWorkData, setShowWorkData] = useState(false);
  const [showDocuments, setshowDocuments] = useState(false);
  const [showDocumentstwo, setshowDocumentstwo] = useState(false);
  const [showUserCreated, setShowUserCreated] = useState(false);
  const [isSearchable, setIsSearchable] = useState(true);
  const [organizationCreated, setOrganizationCreated] = useState("");
  const [uploadText, setUploadText] = useState("Subir foto");
  const [autoIncremento, setAutoIncremento] = useState(null);

  useEffect(() => {
    setExternalUser(false);
    setShowInternUser(true);
  }, [userType]);

  // Maneja input de los campos del formulario datos personales
  const handleInput = (e) => {
    const fieldName = e.target.name;
    let fieldValue = e.target.value;

    // Formateo especial para el campo RUT
    if (fieldName === 'rut') {
      // Eliminar caracteres no permitidos (solo números y 'k'/'K')
      fieldValue = fieldValue.replace(/[^0-9kK]/g, '');
      
      // Convertir 'k' minúscula a mayúscula
      fieldValue = fieldValue.replace(/k/g, 'K');
      
      // Limitar a 9 caracteres (8 dígitos + 1 verificador)
      if (fieldValue.length > 9) {
        fieldValue = fieldValue.slice(0, 9);
      }
      
      // Formatear con puntos y guión
      if (fieldValue.length > 0) {
        // Separar cuerpo y dígito verificador
        const body = fieldValue.slice(0, -1);
        const dv = fieldValue.slice(-1);
        
        // Formatear cuerpo con puntos
        let formattedBody = '';
        for (let i = body.length - 1, j = 0; i >= 0; i--, j++) {
          if (j > 0 && j % 3 === 0) {
            formattedBody = '.' + formattedBody;
          }
          formattedBody = body[i] + formattedBody;
        }
        
        // Unir cuerpo formateado con guión y dígito verificador
        fieldValue = formattedBody + (dv ? '-' + dv : '');
      }
    }
    // Formateo para campos de nombre y representante legal
    else if (fieldName === 'nombre' || fieldName === 'representante_legal' || 
             fieldName === 'nombre_contacto' || fieldName === 'apellido_p' || 
             fieldName === 'apellido_m' || fieldName === 'direccion') {
      // Capitalizar primera letra de cada palabra
      fieldValue = fieldValue
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }

    setFormData((prevState) => ({
      ...prevState,
      [fieldName]: fieldValue,
    }));
  };

  const onClickNextPersonal = () => {
    setShowInternUser(false);
    setShowWorkData(true);
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

  // Función para mandar formulario de creación de usuario al backend
  const postCreateOrganization = async () => {
    setshowDocumentstwo(false);
    setShowUserCreated(true);
  };

  // Botón volver atras del formulario de datos laborales
  const previousLaboral = () => {
    setShowWorkData(false);
    setShowInternUser(true);
  };
  const formback1 = () => {
    setShowWorkData(false);
    setShowInternUser(true);
  };
  const showdocs1 = async (e) => {
    e.preventDefault();

    setOrganizationCreated(formData.nombre);

    const organization = {
      nombre: formData.nombre,
      direccion: formData.direccion,
      telefono: formData.telefono,
      email: "test@test.com",
      sitio_web: formData.sitio_web,
      descripcion: formData.descripcion,
      rut: formData.rut,
      tipo: "Interno",
      representante_legal: formData.representante_legal,
    };

    try {
      const response = await postOrganization(organization);
      setCreatedOrganizationId(response.data.id);
      const formData = new FormData();
      formData.append("file", profileFile);
      formData.append("document_type", "Foto de perfil organización");
      formData.append("organizationId", response.data.id);
      await postOrganizationProf(formData);
    } catch (error) {
      console.log(error);
    }

    setShowWorkData(false);
    setshowDocuments(true);
  };
  const handleWorkPrevious = () => {
    setShowWorkData(true);
    setshowDocuments(false);
  };
  const nextdocstwo = () => {
    setshowDocuments(false);
    setshowDocumentstwo(true);
  };
  const backdocs1 = () => {
    setshowDocuments(true);
    setshowDocumentstwo(false);
  };

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
      }, 100); // Ajusta este valor para controlar la velocidad de incremento
    }
    return () => clearInterval(intervalo);
  }, [autoIncremento]);

  const incrementar = () => {
    setFormData((formData) => ({
      ...formData,
      cant_partidas: formData.cant_partidas + 1,
    }));
  };

  const decrementar = () => {
    setFormData((formData) => ({
      ...formData,
      cant_partidas: Math.max(0, formData.cant_partidas - 1),
    }));
  };

  return (
    <div
      className={`fixed inset-0 bg-gray-800 bg-opacity-75 z-50 ${isOpen ? "" : "hidden"}`}
    >
      <div className="flex flex-col w-full h-screen">
        {/* Header */}
        <div className="bg-[#7FC3BB] text-white py-4 flex items-center px-10 ">
          <button
            onClick={onClose}
            className="text-white text-3xl focus:outline-none mr-10"
          >
            &times;
          </button>
          <h3 className="text-2xl font-semibold font-zen select-none">
            Agregar nuevo proyecto
          </h3>
        </div>

        <div className="bg-white flex-1 p-4 overflow-y-auto">
          {/* Content */}

          <div className="flex-grow justify-center items-center font-zen-kaku bg-white p-4 select-none">
            <form
              className="mx-auto px-20 font-zen-kaku"
              style={{ width: "37vw" }}
            >
              {showInternUser && (
                <>
                  <div className="flex justify-between container">
                    <h3 className="text-3xl font-semibold m-5 font-zen-kaku">
                      Datos proyecto
                    </h3>
                  </div>
                  <div className="flex justify-between container">
                    <label className="font-zen-kaku ml-10 font-semibold">
                      Información básica
                    </label>
                  </div>

                  <div className="flex flex-wrap mb-3 mt-4">
                    <div className="w-full  px-3 md:mb-0">
                      <input
                        className="w-full px-3 py-2 border rounded font-zen-kaku"
                        id="grid-first-name"
                        type="text"
                        placeholder="Nombre de obra"
                        aria-label="Campo de ingreso de nombre de la obra"
                        name="nombre_obra"
                        onChange={handleInput}
                        value={formData.nombre_obra}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap mb-3">
                    <div className="w-full md:w-1/2 px-3 md:mb-0">
                      <input
                        className="w-full px-3 py-2 border rounded font-zen-kaku"
                        id="grid-first-name"
                        type="text"
                        placeholder="Ubicación"
                        aria-label="Campo de ingreso de ubicacion"
                        name="ubicacion"
                        onChange={handleInput}
                        value={formData.ubicacion}
                      />
                    </div>
                    <div className="w-80 md:w-1/2 px-3 mb-6 md:mb-0">
                      <input
                        className="w-full px-3 py-2 border rounded font-zen-kaku"
                        id="grid-first-name"
                        type="text"
                        placeholder="Código bip"
                        aria-label="Campode de ingreso codigo bip"
                        name="codigo"
                        onChange={handleInput}
                        value={formData.codigo}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap mb-3 mt-1">
                    <div className="w-full md:w-1/2  px-3 md:mb-0">
                      <input
                        className="w-full px-3 py-2 border rounded font-zen-kaku"
                        id="grid-first-name"
                        type="text"
                        placeholder="Nombre Unidad Técnica"
                        aria-label="Campo de ingreso de nombre unidad técnica"
                        name="nombre_unidad"
                        onChange={handleInput}
                        value={formData.nombre_unidad}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap mb-3">
                    <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                      <input
                        className="w-full px-3 py-2 border rounded font-zen-kaku"
                        id="grid-first-name"
                        type="text"
                        placeholder="Rut unidad técnica"
                        aria-label="Campo de ingreso RUT unidad técnica"
                        name="rut_unidad"
                        onChange={handleInput}
                        value={formData.rut_unidad}
                      />
                    </div>
                    <div className="w-full md:w-1/2 px-3 md:mb-0">
                      <input
                        className="w-full px-3 py-2 border rounded font-zen-kaku"
                        id="grid-first-name"
                        type="text"
                        placeholder="Rut empresa"
                        name="rutempresa"
                        aria-label="Campo de ingreso de RUT empresa"
                        onChange={handleInput}
                        value={formData.rutempresa}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between container">
                    <label className="font-zen-kaku ml-10 font-semibold">
                      Información de fechas
                    </label>
                  </div>
                  <div className="flex flex-auto mb-3 mt-2">
                    <div className="customDatePickerWidth w-full md:w-1/2 px-3 mb-6 md:mb-0">
                      <DatePicker
                        selected={fechainicio}
                        onChange={(date) => setfechainicio(date)}
                        placeholderText="Fecha inicio de proyecto"
                        aria-label="Campo de seleccion fehca inicio de proyecto"
                        className="font-zen-kaku px-3 py-1.5 border border-gray-300 rounded w-full"
                        locale="es"
                        dateFormat="yyyy/MM/dd"
                      />
                    </div>
                    <div className="customDatePickerWidth w-full md:w-1/2 px-3 md:mb-0">
                      <DatePicker
                        selected={fechatermino}
                        onChange={(date) => setfechatermino(date)}
                        placeholderText="Fecha término de proyecto"
                        aria-label="Campo de seleccion fehca término de proyecto"
                        className="font-zen-kaku px-3 py-1.5 border border-gray-300 rounded w-full"
                        locale="es"
                        dateFormat="yyyy/MM/dd"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between container">
                    <label className="font-zen-kaku ml-10 font-semibold">
                      Información financiera
                    </label>
                  </div>
                  <div className="flex flex-wrap mb-3">
                    <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                      <input
                        className="w-full px-3 py-2 border rounded font-zen-kaku"
                        id="grid-last-name"
                        type="text"
                        placeholder="Presupuesto global"
                        name="presupuesto"
                        aria-label="Campo de ingreso de presupuesto global"
                        onChange={handleInput}
                        value={formData.presupuesto}
                      />
                    </div>
                    <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                      <input
                        className="w-full px-3 py-2 border rounded font-zen-kaku"
                        id="grid-last-name"
                        type="text"
                        placeholder="Monto total bruto"
                        aria-label="Campo de ingreso monto total bruto"
                        name="monto_total"
                        onChange={handleInput}
                        value={formData.monto_total}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap mb-3">
                    <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                      <input
                        className="w-full px-3 py-2 border rounded font-zen-kaku"
                        id="grid-last-name"
                        type="text"
                        placeholder="Monto neto"
                        aria-label="Campo de ingreso monto neto"
                        name="monto_neto"
                        onChange={handleInput}
                        value={formData.monto_neto}
                      />
                    </div>
                    <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                      <input
                        className="w-full px-3 py-2 border rounded font-zen-kaku"
                        id="grid-last-name"
                        type="text"
                        placeholder="Monto mensual"
                        name="monto_mensual"
                        aria-label="Campo de monto mensual"
                        onChange={handleInput}
                        value={formData.monto_mensual}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between container">
                    <label className="font-zen-kaku ml-10 font-semibold">
                      Responsale
                    </label>
                  </div>
                  <div className="flex flex-wrap mb-3 mt-1">
                    <div className="w-full  px-3 md:mb-0">
                      <Select
                        className={`basic-single font-zen-kaku `}
                        classNamePrefix="select"
                        isSearchable={isSearchable}
                        name="responsable"
                        aria-label="Campo de ingreso responsable"
                        placeholder="Seleccionar responsable del proyecto"
                        options={genResponsable}
                      />
                    </div>
                  </div>
                  <div className="flex flex-auto justify-between ml-10">
                    <label className="font-zen-kaku font-semibold">
                      Otra información
                    </label>
                    <label className="font-zen-kaku  font-semibold mr-16">
                      Cantidad de partidas
                    </label>
                  </div>

                  <div className="flex flex-wrap mb-3">
                    <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                      <input
                        className="w-full px-3 py-2 border rounded font-zen-kaku"
                        id="grid-last-name"
                        type="text"
                        placeholder="Geolocalización"
                        aria-label="Campo de ingreso Geolocalización"
                        name="geolocalizacion"
                        onChange={handleInput}
                        value={formData.geolocalizacion}
                      />
                    </div>
                    <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0 flex items-center">
                      <button
                        type="button"
                        className="px-3 py-2 border rounded-l bg-[#D2E7E4] hover:bg-[#a9bebb] font-semibold"
                        onMouseDown={() => setAutoIncremento("decremento")}
                        onMouseUp={() => setAutoIncremento(null)}
                        onMouseLeave={() => setAutoIncremento(null)}
                        onClick={decrementar}
                      >
                        -
                      </button>
                      <input
                        className="w-full px-3 py-2 border-t border-b text-center font-zen-kaku"
                        type="text"
                        readOnly
                        value={formData.cant_partidas.toString()}
                      />
                      <button
                        type="button"
                        className="px-3 py-2 border rounded-r bg-[#5D8F89] hover:bg-[#49706c] font-semibold"
                        onMouseDown={() => setAutoIncremento("incremento")}
                        onMouseUp={() => setAutoIncremento(null)}
                        onMouseLeave={() => setAutoIncremento(null)}
                        onClick={incrementar}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="relative left-[35vw]">
                    <button
                      onClick={onClose}
                      className=" flex-1 text-gray-400 hover:text-gray-600 font-bold uppercase text-base px-6 py-3 rounded  mr-1 mb-1 transition-all duration-150 font-zen-kaku"
                      type="button"
                    >
                      Cancelar
                    </button>
                    <button
                      className="bg-[#5c7891] text-white flex-1 active:bg-[#597387] font-bold uppercase text-base px-10 py-4 rounded-lg shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 font-zen-kaku hover:opacity-75"
                      type="submit"
                      onClick={onClickNextPersonal}
                    >
                      Guardar datos
                    </button>
                  </div>
                </>
              )}
              {showExternalUser && (
                <>
                  <div className="flex justify-between container">
                    <h3 className="text-3xl font-semibold m-5 font-zen-kaku">
                      Datos organización
                    </h3>
                    <h3 className="text-lg m-6 text-gray-400 font-zen ">1/4</h3>
                  </div>
                  <div className="flex flex-wrap mb-6 mt-24">
                    <div className="w-full px-3">
                      <input
                        className="w-full px-3 py-2 border rounded font-zen-kaku"
                        id="grid-first-name"
                        type="text"
                        placeholder="Nombre de empresa"
                        aria-label="Campo de ingreso nombre de empresa"
                        name="empresa"
                        onChange={handleInput}
                        value={formData.rut}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap mb-6">
                    <div className="w-80 md:w-1/2 px-3 mb-6 md:mb-0">
                      <input
                        className="w-full px-3 py-2 border rounded font-zen-kaku"
                        id="grid-first-name"
                        type="text"
                        placeholder="RUT de la empresa"
                        aria-label="Campo de ingreso RUT de la empresa"
                        name="rut"
                        onChange={handleInput}
                        value={formData.name}
                      />
                    </div>
                    <div className="w-full md:w-1/2 px-3 md:mb-0">
                      <input
                        className="w-full px-3 py-2 border rounded font-zen-kaku"
                        id="grid-last-name"
                        type="text"
                        placeholder="+56 222 222 222"
                        aria-label="Campo de ingreso celular"
                        name="telefono"
                        onChange={handleInput}
                        value={formData.apellido_p}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap mb-6">
                    <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                      <input
                        className="w-full px-3 py-2 border rounded font-zen-kaku"
                        id="grid-first-name"
                        type="text"
                        aria-label="Campo de ingreso dirección"
                        placeholder="Dirección"
                        name="calle"
                        onChange={handleInput}
                        value={formData.calle}
                      />
                    </div>
                    <div className="w-full md:w-1/2 px-3 md:mb-0">
                      <Select
                        className={`basic-single font-zen-kaku `}
                        aria-label="Campo de seleccion comuna, ciudad o municipio"
                        classNamePrefix="select"
                        isSearchable={isSearchable}
                        name="genero"
                        placeholder="Comuna/Ciudad/Municipio"
                        options={comunaOptions}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap mb-6">
                    <div className="w-full md:w-1/3 px-3 mb-6 md:mb-0">
                      <input
                        className="w-full px-3 py-2 border rounded font-zen-kaku"
                        id="grid-last-name"
                        type="text"
                        placeholder="Región/Estado"
                        aria-label="Campo de ingreso region o estado"
                        name="estado_region"
                        onChange={handleInput}
                        value={formData.codigo_postal}
                      />
                    </div>
                    <div className="w-full md:w-1/3 px-3 md:mb-0">
                      <Select
                        className={`basic-single font-zen-kaku `}
                        classNamePrefix="select"
                        isSearchable={isSearchable}
                        name="genero"
                        placeholder="País"
                        aria-label="Campo de seleccion país"
                        options={paisOptions}
                      />
                    </div>
                    <div className="w-full md:w-1/3 px-3 md:mb-0">
                      <input
                        className="w-full px-3 py-2 border rounded font-zen-kaku"
                        id="grid-last-name"
                        type="text"
                        placeholder="Código Postal"
                        aria-label="Campo de ingreso codigo postal"
                        name="codigo_postal"
                        onChange={handleInput}
                        value={formData.codigo_postal}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap mb-6">
                    <div className="w-full  px-3 mb-6 md:mb-0">
                      <input
                        className="w-full px-3 py-2 border rounded font-zen-kaku"
                        id="grid-last-name"
                        type="text"
                        placeholder="Nombre persona responsable o representante legal"
                        aria-label="Campo de ingreso nombre persona responsable"
                        name="responsable"
                        onChange={handleInput}
                        value={formData.codigo_postal}
                      />
                    </div>
                  </div>
                  <div className="flex justify-center items-center mt-36">
                    <button
                      onClick={onClose}
                      className=" text-gray-400 hover:text-gray-600 font-bold uppercase text-base px-6 py-3 rounded  mr-1 mb-1 transition-all duration-150 font-zen-kaku"
                      type="button"
                    >
                      Cancelar
                    </button>
                    <button
                      className="bg-[#7FC3BB] text-white active:bg-emerald-600 font-bold uppercase text-base px-10 py-4 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 font-zen-kaku"
                      type="submit"
                      onClick={onClickNextPersonal}
                    >
                      Guardar datos
                    </button>
                  </div>
                </>
              )}
            </form>
            {showWorkData && (
              <form className="mx-auto px-20" style={{ width: "49vw" }}>
                <>
                  <div className="flex justify-between container">
                    <h3 className="text-3xl font-semibold m-5 mr-44 font-zen-kaku select-none">
                      Agregar partida
                    </h3>
                  </div>
                  <div className="flex justify-between container">
                    <label className="font-zen-kaku ml-6 font-semibold">
                      Nombre de partida
                    </label>
                    <label className="font-zen-kaku ml-9 font-semibold">
                      Fecha de inicio de partida
                    </label>
                    <label className="font-zen-kaku mr-5 font-semibold">
                      Fecha de término de partida
                    </label>
                  </div>
                  <div className="flex flex-auto  mb-6">
                    <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                      <input
                        className="w-full px-3 py-2 border rounded font-zen-kaku"
                        id="grid-last-name"
                        type="text"
                        aria-label="Campo de ingreso nombre de partida 1"
                        placeholder="Ingresar nombre de partida #1"
                        name="name_partida"
                        onChange={handleInput}
                        value={formData.name_partida}
                      />
                    </div>
                    <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                      <input
                        className="w-full px-3 py-2 border rounded font-zen-kaku"
                        id="grid-last-name"
                        type="text"
                        placeholder="Fecha de inicio de partida"
                        aria-label="Campo de ingreso fecha de inicio de partida"
                        name="name_partida"
                        onChange={handleInput}
                        value={formData.name_partida}
                      />
                    </div>
                    <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                      <input
                        className="w-full px-3 py-2 border rounded font-zen-kaku"
                        id="grid-last-name"
                        type="text"
                        placeholder="Fecha de término de partida"
                        aria-label="Campo de ingreso fecha de término de partida"
                        name="name_partida"
                        onChange={handleInput}
                        value={formData.name_partida}
                      />
                    </div>
                  </div>
                  <div className="flex justify-center mb-3">
                    <div className="relative w-32 h-32 rounded-full bg-[#D2E7E4] bg-opacity-80 border-[#7FC3BB] border-4 flex items-center justify-center overflow-hidden transition-transform transform-gpu hover:scale-110">
                      {imagenPerfil ? (
                        <Image
                          src={imagenPerfil}
                          alt="Foto de perfil"
                          layout="fill"
                          objectFit="cover"
                        />
                      ) : (
                        <BriefcaseBusiness size={60} color="#87ACA7" />
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap mb-3 mt-14">
                    <div className="w-full  px-3 md:mb-0">
                      <label
                        htmlFor="fileUpload"
                        className="flex items-center justify-center px-4 py-3 border border-teal-500 rounded-lg cursor-pointer font-zen-kaku text-sm hover:shadow-lg select-none hover:border-teal-800 ease-linear transition-all duration-150"
                      >
                        <Upload color="#000000" className="mr-2 h-5 w-5" />
                        {uploadText}
                      </label>
                      <input
                        type="file"
                        id="fileUpload"
                        className="hidden"
                        onChange={manejarCambioImagen}
                      />
                    </div>
                  </div>
                </>
                <div className="relative left-[35vw]">
                  <button
                    className=" text-gray-400 flex-1 hover:text-gray-600 font-bold uppercase text-base px-6 py-3 rounded  mr-1 mb-1 transition-all duration-150 font-zen-kaku"
                    type="button"
                    onClick={formback1}
                  >
                    Atras
                  </button>
                  <button
                    className="bg-[#5c7891] text-white flex-1 hover:opacity-75 active:bg-emerald-600 font-zen-kaku font-bold uppercase text-base px-10 py-4 rounded-lg shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    onClick={showdocs1}
                  >
                    Guardar datos
                  </button>
                </div>
              </form>
            )}
            {showDocuments && (
              <form className="mx-auto px-20" style={{ width: "39vw" }}>
                <>
                  <div className="flex justify-between container">
                    <h3 className="text-3xl font-semibold m-5 font-zen select-none">
                      Carga de documentos
                    </h3>
                    <h3 className="text-lg m-6 text-gray-400 font-zen select-none">
                      3/4
                    </h3>
                  </div>
                  <div className="flex flex-wrap mb-3">
                    <div className="w-80 md:w-1/2 px-3 mb-6 md:mb-0">
                      <label className="w-full px-3 py-2 font-zen-kaku font-semibold select-none">
                        Documentos de la organización
                      </label>
                    </div>
                  </div>
                  <div className="flex flex-wrap mb-3">
                    <div className="w-full px-3 mb-6 md:mb-0">
                      <label className="w-full px-3 py-2 font-zen-kaku text-base select-none">
                        Solo admite archivos PDF, DOCX, IMG &gt; 30 MB
                      </label>
                    </div>
                  </div>
                  <div className="flex flex-wrap mb-3 mt-32">
                    <div className="w-full px-3 md:mb-0">
                      <label className="w-full px-3 py-2 font-zen-kaku font-semibold select-none">
                        Certificado de vigencia de la empresa
                      </label>
                    </div>
                  </div>
                  <div className="flex flex-wrap mb-3">
                    <div className="mr-4 ml-5">
                      <Upload size={26} color="#7FC3BB" />
                    </div>
                    <div className="mr-4">
                      <p className="font-zen-kaku select-none">
                        Arrastrar y soltar archivos o explorar
                      </p>
                    </div>
                    {fileValidity && (
                      <div className="text-green-500">
                        El archivo se ha subido correctamente.
                      </div>
                    )}
                    {/* Botón de subir archivos */}
                    <input
                      type="file"
                      id="fileValidity"
                      name="fileValidity"
                      style={{ display: "none" }}
                      onChange={onFileValidityChange}
                    />
                    <label
                      htmlFor="fileValidity"
                      className="px-4 py-1 ml-auto text-[#7FC3BB] border border-[#7FC3BB] rounded-md font-zen-kaku font-semibold overflow-hidden transition-transform transform-gpu hover:scale-110 cursor-pointer"
                    >
                      Subir
                    </label>
                  </div>
                  <div className="flex flex-wrap mb-3">
                    <div className="w-full px-3 md:mb-0">
                      <label className="w-full px-3 py-2 font-zen-kaku font-semibold select-none">
                        Certificado de no adeudo de la empresa
                      </label>
                    </div>
                  </div>
                  <div className="flex flex-wrap mb-3">
                    {/* Icono de subida de archivo */}
                    <div className="mr-4 ml-5">
                      <Upload size={26} color="#7FC3BB" />
                      <input type="file" id="fileUpload" className="hidden" />
                    </div>
                    {/* Texto "Arrastrar y soltar archivos o explorar" */}
                    <div className="mr-4">
                      <p className="font-zen-kaku select-none">
                        Arrastrar y soltar archivos o explorar
                      </p>
                    </div>
                    {fileOwe && (
                      <div className="text-green-500">
                        El archivo se ha subido correctamente.
                      </div>
                    )}
                    {/* Botón de subir archivos */}
                    <input
                      type="file"
                      id="fileOwe"
                      name="fileOwe"
                      style={{ display: "none" }}
                      onChange={onFileOweChange}
                    />
                    <label
                      htmlFor="fileOwe"
                      className="px-4 py-1 ml-auto text-[#7FC3BB] border border-[#7FC3BB] rounded-md font-zen-kaku font-semibold overflow-hidden transition-transform transform-gpu hover:scale-110 cursor-pointer"
                    >
                      Subir
                    </label>
                  </div>
                  <div className="flex flex-wrap mb-3">
                    <div className="w-full px-3 md:mb-0">
                      <label className="w-full px-3 py-2 font-zen-kaku font-semibold select-none">
                        Contrato laboral de proyecto
                      </label>
                    </div>
                  </div>
                  <div className="flex flex-wrap mb-3">
                    {/* Icono de subida de archivo */}
                    <div className="mr-4 ml-5">
                      <Upload size={26} color="#7FC3BB" />
                    </div>
                    {/* Texto "Arrastrar y soltar archivos o explorar" */}
                    <div className="mr-4">
                      <p className="font-zen-kaku select-none">
                        Arrastrar y soltar archivos o explorar
                      </p>
                    </div>
                    {fileContract && (
                      <div className="text-green-500">
                        El archivo se ha subido correctamente.
                      </div>
                    )}
                    {/* Botón de subir archivos */}
                    <input
                      type="file"
                      id="fileContract"
                      name="fileContract"
                      className="hidden"
                      onChange={onFileContractChange}
                    />
                    <label
                      htmlFor="fileContract"
                      className="px-4 py-1 ml-auto text-[#7FC3BB] border border-[#7FC3BB] rounded-md font-zen-kaku font-semibold overflow-hidden transition-transform transform-gpu hover:scale-110 cursor-pointer"
                    >
                      Subir
                    </label>
                  </div>
                  <div className="flex flex-wrap mb-3">
                    <div className="w-full px-3 md:mb-0">
                      <label className="w-full px-3 py-2 font-zen-kaku font-semibold select-none">
                        Certificado del servicio de impuestos internos
                      </label>
                    </div>
                  </div>
                  <div className="flex flex-wrap mb-3">
                    {/* Icono de subida de archivo */}
                    <div className="mr-4 ml-5">
                      <Upload size={26} color="#7FC3BB" />
                    </div>
                    {/* Texto "Arrastrar y soltar archivos o explorar" */}
                    <div className="mr-4">
                      <p className="font-zen-kaku select-none">
                        Arrastrar y soltar archivos o explorar
                      </p>
                    </div>
                    {fileSii && (
                      <div className="text-green-500">
                        El archivo se ha subido correctamente.
                      </div>
                    )}
                    {/* Botón de subir archivos */}
                    <input
                      type="file"
                      id="file"
                      name="fileSii"
                      style={{ display: "none" }}
                      onChange={onFileSiiChange}
                    />
                    <label
                      htmlFor="file"
                      className="px-4 py-1 ml-auto text-[#7FC3BB] border border-[#7FC3BB] rounded-md font-zen-kaku font-semibold overflow-hidden transition-transform transform-gpu hover:scale-110 cursor-pointer"
                    >
                      Subir
                    </label>
                  </div>
                </>
                <div className="flex justify-center items-center mt-36">
                  <button
                    className=" font-zen text-gray-400 hover:text-gray-600 font-bold uppercase text-base px-6 py-3 rounded  mr-1 mb-1 transition-all duration-150"
                    type="submit"
                    onClick={handleWorkPrevious}
                  >
                    Atras
                  </button>
                  <button
                    className="bg-[#5c7891] hover:bg-[#597387] font-zen text-white active:bg-[#597387] font-bold uppercase text-base px-16 py-4 rounded-lg shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="submit"
                    onClick={nextdocstwo}
                  >
                    Siguiente
                  </button>
                </div>
              </form>
            )}
            {showDocumentstwo && (
              <form className="mx-auto px-20" style={{ width: "39vw" }}>
                <>
                  <div className="flex justify-between container">
                    <h3 className="text-3xl font-semibold m-5 font-zen select-none">
                      Carga de documentos
                    </h3>
                    <h3 className="text-lg m-6 text-gray-400 font-zen select-none">
                      4/4
                    </h3>
                  </div>
                  <div className="flex flex-wrap mb-3">
                    <div className="w-80 md:w-1/2 px-3 mb-6 md:mb-0">
                      <label className="w-full px-3 py-2 font-zen-kaku font-semibold select-none">
                        Documentos de la organización
                      </label>
                    </div>
                  </div>
                  <div className="flex flex-wrap mb-3">
                    <div className="w-full px-3 mb-6 md:mb-0">
                      <label className="w-full px-3 py-2 font-zen-kaku text-base select-none">
                        Solo admite archivos PDF, DOCX, IMG &gt; 30 MB
                      </label>
                    </div>
                  </div>
                  <div className="flex flex-wrap mb-3 mt-32">
                    <div className="w-full px-3 md:mb-0">
                      <label className="w-full px-3 py-2 font-zen-kaku font-semibold select-none">
                        Certificado de vigencia de la sociedad
                      </label>
                    </div>
                  </div>
                  <div className="flex flex-wrap mb-3">
                    {/* Icono de subida de archivo */}
                    <div className="mr-4 ml-5">
                      <Upload size={26} color="#5c7891" />
                    </div>
                    {/* Texto "Arrastrar y soltar archivos o explorar" */}
                    <div className="mr-4">
                      <p className="font-zen-kaku select-none">
                        Arrastrar y soltar archivos o explorar
                      </p>
                    </div>
                    {fileSocietyValidity && (
                      <div className="text-green-500">
                        El archivo se ha subido correctamente.
                      </div>
                    )}
                    {/* Botón de subir archivos */}
                    <input
                      type="file"
                      id="fileSocietyValidity"
                      name="fileSocietyValidity"
                      style={{ display: "none" }}
                      onChange={onFileSocietyValidityChange}
                    />
                    <label
                      htmlFor="fileSocietyValidity"
                      className="px-4 py-1 ml-auto text-[#5c7891] border border-[#5c7891] rounded-md font-zen-kaku font-semibold overflow-hidden transition-transform transform-gpu hover:scale-110 cursor-pointer"
                    >
                      Subir
                    </label>
                  </div>
                  <div className="flex flex-wrap mb-3">
                    <div className="w-full px-3 md:mb-0">
                      <label className="w-full px-3 py-2 font-zen-kaku font-semibold select-none">
                        Póliza de seguro
                      </label>
                    </div>
                  </div>
                  <div className="flex flex-wrap mb-3">
                    {/* Icono de subida de archivo */}
                    <div className="mr-4 ml-5">
                      <Upload size={26} color="#5c7891" />
                    </div>

                    {/* Texto "Arrastrar y soltar archivos o explorar" */}
                    <div className="mr-4">
                      <p className="font-zen-kaku select-none">
                        Arrastrar y soltar archivos o explorar
                      </p>
                    </div>

                    {fileEnsurance && (
                      <div className="text-green-500">
                        El archivo se ha subido correctamente.
                      </div>
                    )}

                    {/* Botón de subir archivos */}
                    <input
                      type="file"
                      id="fileEnsurance"
                      name="fileEnsurance"
                      style={{ display: "none" }}
                      onChange={onFileEnsurance}
                    />
                    <label
                      htmlFor="fileEnsurance"
                      className="px-4 py-1 ml-auto text-[#7FC3BB] border border-[#7FC3BB] rounded-md font-zen-kaku font-semibold overflow-hidden transition-transform transform-gpu hover:scale-110 cursor-pointer"
                    >
                      Subir
                    </label>
                  </div>

                  <div className="flex flex-wrap mb-3">
                    <div className="w-full px-3 md:mb-0">
                      <label className="w-full px-3 py-2 font-zen-kaku font-semibold select-none">
                        Bancarización
                      </label>
                    </div>
                  </div>
                  <div className="flex flex-wrap mb-3">
                    {/* Icono de subida de archivo */}
                    <div className="mr-4 ml-5">
                      <Upload size={26} color="#5c7891" />
                    </div>

                    {/* Texto "Arrastrar y soltar archivos o explorar" */}
                    <div className="mr-4">
                      <p className="font-zen-kaku select-none">
                        Arrastrar y soltar archivos o explorar
                      </p>
                    </div>

                    {fileBank && (
                      <div className="text-green-500">
                        El archivo se ha subido correctamente.
                      </div>
                    )}

                    {/* Botón de subir archivos */}
                    <input
                      type="file"
                      id="fileBank"
                      name="fileBank"
                      style={{ display: "none" }}
                      onChange={onFileBankChange}
                    />
                    <label
                      htmlFor="fileBank"
                      className="px-4 py-1 ml-auto text-[#7FC3BB] border border-[#7FC3BB] rounded-md font-zen-kaku font-semibold overflow-hidden transition-transform transform-gpu hover:scale-110 cursor-pointer"
                    >
                      Subir
                    </label>
                  </div>
                  <div className="flex flex-wrap mb-3">
                    <div className="w-full px-3 md:mb-0">
                      <label className="w-full px-3 py-2 font-zen-kaku font-semibold select-none">
                        Certificado de afiliación a salud
                      </label>
                    </div>
                  </div>
                  <div className="flex flex-wrap mb-3">
                    {/* Icono de subida de archivo */}
                    <div className="mr-4 ml-5">
                      <Upload size={26} color="###7FC3BB" />
                    </div>

                    {/* Texto "Arrastrar y soltar archivos o explorar" */}
                    <div className="mr-4">
                      <p className="font-zen-kaku select-none">
                        Arrastrar y soltar archivos o explorar
                      </p>
                    </div>

                    {fileHealth && (
                      <div className="text-green-500">
                        El archivo se ha subido correctamente.
                      </div>
                    )}

                    {/* Botón de subir archivos */}
                    <input
                      type="file"
                      id="fileHealth"
                      name="fileHealth"
                      style={{ display: "none" }}
                      onChange={onFileHealthChange}
                    />
                    <label
                      htmlFor="fileHealth"
                      className="px-4 py-1 ml-auto text-[#7FC3BB] border border-[#7FC3BB] rounded-md font-zen-kaku font-semibold overflow-hidden transition-transform transform-gpu hover:scale-110 cursor-pointer"
                    >
                      Subir
                    </label>
                  </div>
                </>
                <div className="flex justify-center items-center mt-36">
                  <button
                    className=" font-zen text-gray-400 hover:text-gray-600 font-bold uppercase text-base px-6 py-3 rounded  mr-1 mb-1 transition-all duration-150"
                    type="submit"
                    onClick={backdocs1}
                  >
                    Atras
                  </button>
                  <button
                    className="bg-[#5c7891] hover:bg-[#7FC3BB] font-zen text-white active:bg-emerald-600 font-bold uppercase text-base px-16 py-4 rounded-lg shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="submit"
                    onClick={postCreateOrganization}
                  >
                    Siguiente
                  </button>
                </div>
              </form>
            )}
            {showUserCreated && (
              <form className="mx-auto px-20">
                <>
                  <div className="flex justify-center items-center mt-48 animate-spin-and-back">
                    <div className="relative w-32 h-32 rounded-full bg-[#D2E7E4] bg-opacity-80 border-[#D2E7E4] border-opacity-80 border-1 flex items-center justify-center shadow-xl z-10">
                      <Check size={60} color="#87ACA7" />
                    </div>
                    <div className="absolute">
                      <svg
                        width="172"
                        height="172"
                        viewBox="0 0 172 172"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M76.7808 3.96925C82.075 -0.60718 89.925 -0.60718 95.2192 3.96925V3.96925C98.9751 7.21594 104.162 8.24766 108.874 6.68544V6.68544C115.517 4.48338 122.769 7.48742 125.909 13.7415V13.7415C128.137 18.1784 132.534 21.1165 137.486 21.4766V21.4766C144.465 21.9841 150.016 27.5348 150.523 34.5144V34.5144C150.884 39.466 153.822 43.8632 158.259 46.0908V46.0908C164.513 49.2307 167.517 56.4831 165.315 63.1256V63.1256C163.752 67.8381 164.784 73.0249 168.031 76.7808V76.7808C172.607 82.075 172.607 89.925 168.031 95.2192V95.2192C164.784 98.9751 163.752 104.162 165.315 108.874V108.874C167.517 115.517 164.513 122.769 158.259 125.909V125.909C153.822 128.137 150.884 132.534 150.523 137.486V137.486C150.016 144.465 144.465 150.016 137.486 150.523V150.523C132.534 150.884 128.137 153.822 125.909 158.259V158.259C122.769 164.513 115.517 167.517 108.874 165.315V165.315C104.162 163.752 98.9751 164.784 95.2192 168.031V168.031C89.925 172.607 82.075 172.607 76.7808 168.031V168.031C73.0249 164.784 67.8381 163.752 63.1256 165.315V165.315C56.4831 167.517 49.2307 164.513 46.0908 158.259V158.259C43.8632 153.822 39.466 150.884 34.5144 150.523V150.523C27.5348 150.016 21.9841 144.465 21.4766 137.486V137.486C21.1165 132.534 18.1784 128.137 13.7415 125.909V125.909C7.48742 122.769 4.48338 115.517 6.68544 108.874V108.874C8.24766 104.162 7.21594 98.9751 3.96925 95.2192V95.2192C-0.60718 89.925 -0.60718 82.075 3.96925 76.7808V76.7808C7.21594 73.0249 8.24766 67.8381 6.68544 63.1256V63.1256C4.48338 56.4831 7.48742 49.2307 13.7415 46.0908V46.0908C18.1784 43.8632 21.1165 39.466 21.4766 34.5144V34.5144C21.9841 27.5348 27.5348 21.9841 34.5144 21.4766V21.4766C39.466 21.1165 43.8632 18.1784 46.0908 13.7415V13.7415C49.2307 7.48742 56.4831 4.48338 63.1256 6.68544V6.68544C67.8381 8.24766 73.0249 7.21594 76.7808 3.96925V3.96925Z"
                          fill="#7FC3BB"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex justify-center mt-16">
                    <h3 className="text-3xl font-semibold m-5 font-zen-kaku select-none ">
                      ¡Organización {organizationCreated} creada correctamente!
                    </h3>
                  </div>
                  <div className="flex justify-center">
                    <h3 className="text-base m-5 font-zen-kaku select-none">
                      ¡Bienvenido a bordo!¡Comience su viaje hacia el éxito con
                      Incon!
                    </h3>
                  </div>
                </>
                <div className="flex justify-center items-center mt-16">
                  <button
                    className="bg-[#5c7891] text-white active:bg-[#597387] hover:opacity-75 font-bold uppercase text-base px-6 py-4 rounded-md shadow-xl outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 font-zen-kaku"
                    onClick={onClose}
                  >
                    Cerrar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Newproyectdrawer;
