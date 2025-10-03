"use client";

import { useSelector } from "react-redux";
import React, { useState, useEffect } from "react";
import { ConfirmDialog } from "primereact/confirmdialog";
import toast from "react-hot-toast";
import { Button } from "primereact/button";
import "../../style/custom_confirmation.css";
import "primereact/resources/themes/saga-blue/theme.css"; //tema
import "primereact/resources/primereact.min.css"; //core css
import "primeicons/primeicons.css"; //iconos
import Select from "react-select";
import { getPaises, getOrganizacion } from "@/app/services/user";

import Image from "next/image";
import { Upload, BriefcaseBusiness } from "lucide-react";
import { useRouter } from "next/navigation";
import { postMinacreate, postMinaProf } from "@/app/services/minas";
import "../../style/media_query.css";

function NewMina({ paises, users, organizations }) {
  console.log(paises);
  const [currentStep, setCurrentStep] = useState(1);
  const [step, setStep] = useState(1);
  const [visible, setVisible] = useState(false);
  const stepsTotal = 2;
  const stepTitles = ["Datos de la obra", "Cargar foto"];
  const router = useRouter();
  const [idminacreate, setidminaCreate] = useState(0);
  const [errors, setErrors] = useState({});

  const userStore = useSelector((state) => state.user);
  const saludo = `¡Hola ${userStore.user?.names || "Test"}! 👋`;

  const validateRutChileno = (rutConFormato) => {
    if (!rutConFormato) return false;
    const limpio = rutConFormato.replace(/\.|-/g, '').toUpperCase();
    const cuerpo = limpio.slice(0, -1);
    const dvIngresado = limpio.slice(-1);
    if (!/^[0-9]+$/.test(cuerpo)) return false;
    if (!/^[0-9K]$/.test(dvIngresado)) return false;
    if (cuerpo.length < 7 || cuerpo.length > 8) return false;

    let suma = 0;
    let multiplicador = 2;
    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += parseInt(cuerpo.charAt(i), 10) * multiplicador;
      multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }
    const resto = suma % 11;
    const dvCalculadoNum = 11 - resto;
    const dvCalculado = dvCalculadoNum === 11 ? '0' : dvCalculadoNum === 10 ? 'K' : String(dvCalculadoNum);
    return dvCalculado === dvIngresado;
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.name || String(formData.name).trim() === '') {
      newErrors.name = 'El nombre de la obra es obligatorio';
    }
    if (!formData.direccion || String(formData.direccion).trim() === '') {
      newErrors.direccion = 'La ubicación es obligatoria';
    }
    if (!formData.id_pais) {
      newErrors.id_pais = 'El país es obligatorio';
    }
    if (!formData.id_region) {
      newErrors.id_region = 'La región es obligatoria';
    }
    if (!formData.id_comuna) {
      newErrors.id_comuna = 'La comuna es obligatoria';
    }
    if (!formData.rut || !validateRutChileno(formData.rut)) {
      newErrors.rut = 'Ingrese un RUT chileno válido';
    }
    if (!formData.id_usuario) {
      newErrors.id_usuario = 'El usuario responsable es obligatorio';
    }
    if (!formData.id_organizacion) {
      newErrors.id_organizacion = 'La organización es obligatoria';
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    if (!isValid) {
      toast.error('Por favor, complete los campos obligatorios.');
    }
    return isValid;
  };

  const handleStepChange = (newStep) => {
    // Bloquear avance al paso 2 si falta información en paso 1
    if (step === 1 && newStep > step) {
      const ok = validateStep1();
      if (!ok) return;
    }
    setStep(newStep);
    setCurrentStep(newStep);
  };

  const accept = async () => {
    handleSubmit();
    toast.success("Ha actualizado la mina con exito.");
    router.push("/dashboard/minas");
  };

  const reject = () => {
    // Lógica para rechazar la acción
    toast.error("No se han guardado los datos");
  };

  const cancelarform = () => {
    // Lógica para rechazar la acción
    window.location.reload();
  };

  const [isSearchable, setIsSearchable] = useState(true);
  const [selectedPais, setSelectedPais] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedComuna, setSelectedComuna] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedOrganization, setSelectedOrganization] = useState(null);

  const [regiones, setRegiones] = useState([]);
  const [comunas, setComunas] = useState([]);
  const [formData, setFormData] = useState({});
  const [paisOptions, setPaisOptions] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const [organizationOptions, setOrganizationOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleInput = (e) => {
    const fieldName = e.target.name;
    let fieldValue = e.target.value;

    if (fieldName === 'rut') {
      // Eliminar caracteres no permitidos (solo números y k/K)
      let rutLimpio = fieldValue.replace(/[^\dkK]/g, '');
      
      // Convertir 'k' minúscula a mayúscula
      rutLimpio = rutLimpio.replace(/k/g, 'K');
      
      // Limitar a 8 dígitos + 1 dígito verificador
      if (rutLimpio.length > 9) {
        rutLimpio = rutLimpio.slice(0, 9);
      }
      
      // Formatear con puntos y guión
      let rutFormateado = '';
      if (rutLimpio.length > 1) {
        // Separar dígito verificador
        const cuerpo = rutLimpio.slice(0, -1);
        const dv = rutLimpio.slice(-1);
        
        // Agregar puntos
        let i = cuerpo.length;
        let contador = 0;
        while (i > 0) {
          if (contador === 3) {
            rutFormateado = '.' + rutFormateado;
            contador = 0;
          }
          rutFormateado = cuerpo.charAt(i - 1) + rutFormateado;
          i--;
          contador++;
        }
        
        // Agregar guión y dígito verificador
        rutFormateado = rutFormateado + '-' + dv;
      } else {
        rutFormateado = rutLimpio;
      }
      
      fieldValue = rutFormateado;
    } else if (fieldName === 'name' || fieldName === 'direccion') {
      // Capitalizar la primera letra de cada palabra
      fieldValue = fieldValue.toLowerCase().split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }

    setFormData((prevState) => ({
      ...prevState,
      [fieldName]: fieldValue,
    }));
    // Limpiar error del campo editado
    if (errors[fieldName]) {
      setErrors((prev) => ({ ...prev, [fieldName]: undefined }));
    }
  };

  const handleSelect = (selectedOption, actionMeta) => {
    const fieldName = actionMeta.name;
    const fieldValue = selectedOption ? selectedOption.value : null;
    setFormData((prevState) => ({
      ...prevState,
      [fieldName]: fieldValue,
    }));
    if (errors[fieldName]) {
      setErrors((prev) => ({ ...prev, [fieldName]: undefined }));
    }

    switch (fieldName) {
      case "id_comuna":
        setSelectedComuna(selectedOption);
        break;
      case "id_usuario":
        setSelectedUser(selectedOption);
        break;
      case "id_organizacion":
        setSelectedOrganization(selectedOption);
        break;
      default:
        break;
    }
  };

  const handleSelectPais = (selectedOption) => {
    setSelectedPais(selectedOption);
    setFormData((prevState) => ({
      ...prevState,
      id_pais: selectedOption ? selectedOption.value : null,
      id_region: null,
      id_comuna: null,
    }));
    setRegiones(selectedOption ? selectedOption.regiones_pais : []);
    setSelectedRegion(null);
    setComunas([]);
    setSelectedComuna(null);
    setErrors((prev) => ({ ...prev, id_pais: undefined, id_region: undefined, id_comuna: undefined }));
  };

  const handleSelectRegion = (selectedOption) => {
    setSelectedRegion(selectedOption);
    setFormData((prevState) => ({
      ...prevState,
      id_region: selectedOption ? selectedOption.value : null,
      id_comuna: null,
    }));
    setComunas(selectedOption ? selectedOption.comunas_regions : []);
    setSelectedComuna(null);
    setErrors((prev) => ({ ...prev, id_region: undefined, id_comuna: undefined }));
    // Sin autoselección; el usuario debe elegir comuna explícitamente
  };

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setPaisOptions(
          paises.map((pais) => ({
            value: pais.id_pais,
            label: pais.NombrePais,
            regiones_pais: pais.regiones_pais,
          })),
        );

        setUserOptions(
          users.map((user) => ({
            value: user.id,
            label: `${user.names} ${user.apellido_p} ${user.apellido_m}`,
          })),
        );
        setOrganizationOptions(
          organizations.map((org) => ({ value: org.id, label: org.nombre })),
        );
      } catch (error) {
        console.error("Error fetching options:", error);
      }
    };

    fetchOptions();
  }, [paises, users, organizations]);

  const [uploadText, setUploadText] = useState("Subir foto");
  const [imagenPerfil, setImagenPerfil] = useState(null);
  const [profileFile, setProfileFile] = useState(null);

  const manejarCambioImagen = async (evento) => {
    console.log("manejarCambioImagen");
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

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const updatedData = {
        ...formData,
        giro_mina: "",
      };

      console.log("Datos enviados:", updatedData);

      const response = await postMinacreate(updatedData);
      const createdMinaId = response.id;
      setidminaCreate(createdMinaId);

      if (profileFile) {
        const profileFormData = new FormData();
        profileFormData.append("file", profileFile);
        profileFormData.append("document_type", "Foto de perfil mina");
        profileFormData.append("minaId", createdMinaId);

        console.log("Uploading profile image:", profileFormData.get("file"));

        try {
          const imageUploadResponse = await postMinaProf(profileFormData);
          console.log("Image upload response:", imageUploadResponse);
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
          throw new Error("Error uploading image");
        }
      }

      if (response) {
        console.log("Datos de Mina guardados correctamente:", response);
      } else {
        console.error(
          "Error al guardar los datos de Mina: No hay respuesta del servidor",
        );
      }
    } catch (error) {
      console.error("Error al guardar los datos de Mina:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col w-full h-screen overflow-x-hidden">
        <div className="flex-grow justify-center items-center font-zen-kaku bg-[#FAFAFA] p-4 select-none overflow-x-hidden">
          <div className="mt-6"></div>
          
          {/* Header */}
          <div className="grid items-center grid-cols-1 md:grid-cols-3 gap-4 mb-6 font-zen-kaku">
            <label htmlFor="filtroSelect" className="ml-4 text-base font-bold text-black select-none font-zen-kaku">
              | Nueva obra |
            </label>
          </div>

          {/* Contenedor Principal en Flex - Siguiendo el patrón de internal_user_drawer */}
          <div className='mx-auto bg-white shadow-lg rounded-xl flex flex-col lg:flex-row gap-2 w-full lg:w-4/5'>

            {/* Progress Bar que se adapta en mobile */}
            <div className='flex flex-wrap lg:flex-col w-full lg:w-1/4 items-center lg:items-start p-4 sm:p-6'>
              {[...Array(stepsTotal)].map((_, index) => (
                <div key={index} className="flex flex-row items-center mb-3 lg:mb-4 mr-3">
                  {/* Número del paso */}
                  <span
                    className={`font-zen-kaku rounded-full h-10 w-10 flex justify-center items-center cursor-pointer transition-transform hover:scale-110 ease-linear 
                      ${currentStep > index + 1
                        ? 'bg-[#5C7891] text-white' // Paso completado
                        : currentStep === index + 1
                          ? 'bg-[#7fa1c6] text-white ring-1 ring-[#5C7891] border-white border-4' // Paso activo
                          : 'border border-gray-400 text-gray-400'}`} // Paso pendiente
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
              <form className='h-full p-4 mx-auto font-zen-kaku w-full custom-form1'>
                {/* Grid responsivo - 2 columnas en desktop, 1 en mobile */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 mt-6 custom-form-project'>
                  
                  <div className="col-span-1 md:col-span-2">
                    <div className="w-full px-3">
                      <label className="text-sm font-bold font-zen-kaku">
                        Nombre de la obra
                      </label>
                      <input
                        className={`w-full px-3 py-2 border rounded font-zen-kaku ${errors.name ? 'border-red-500' : ''}`}
                        id="grid-first-name"
                        type="text"
                        placeholder="Ingresar nombre de obra"
                        name="name"
                        onChange={handleInput}
                        value={formData.name || ''}
                      />
                      {errors.name && (
                        <p className="text-red-600 text-xs mt-1">{errors.name}</p>
                      )}
                    </div>
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <div className="w-full px-3">
                      <label className="text-sm font-bold font-zen-kaku">
                        Ubicación
                      </label>
                      <input
                        className={`w-full px-3 py-2 border rounded font-zen-kaku ${errors.direccion ? 'border-red-500' : ''}`}
                        id="grid-first-name"
                        type="text"
                        placeholder="Ingrese ubicación"
                        name="direccion"
                        onChange={handleInput}
                        value={formData.direccion || ''}
                      />
                      {errors.direccion && (
                        <p className="text-red-600 text-xs mt-1">{errors.direccion}</p>
                      )}
                    </div>
                  </div>

                  <div className="col-span-1">
                    <div className="w-full px-3">
                      <label className="text-sm font-bold font-zen-kaku">País</label>
                      <Select
                        className={`basic-single font-zen-kaku`}
                        classNamePrefix="select"
                        isSearchable={isSearchable}
                        name="id_pais"
                        placeholder="Seleccione país"
                        options={paises.map((pais) => ({
                          label: pais.NombrePais,
                          value: pais.id_pais,
                          regiones_pais: pais.regiones_pais,
                        }))}
                        onChange={handleSelectPais}
                        value={selectedPais}
                      />
                      {errors.id_pais && (
                        <p className="text-red-600 text-xs mt-1">{errors.id_pais}</p>
                      )}
                    </div>
                  </div>

                  <div className="col-span-1">
                    <div className="w-full px-3">
                      <label className="text-sm font-bold font-zen-kaku">
                        Región
                      </label>
                      <Select
                        className={`basic-single font-zen-kaku`}
                        classNamePrefix="select"
                        isSearchable={isSearchable}
                        name="id_region"
                        placeholder="Seleccione región"
                        options={regiones.map((region) => ({
                          label: region.nombre,
                          value: region.id_region,
                          comunas_regions: region.comunas_regions,
                        }))}
                        onChange={handleSelectRegion}
                        isDisabled={!selectedPais}
                        value={selectedRegion}
                      />
                      {errors.id_region && (
                        <p className="text-red-600 text-xs mt-1">{errors.id_region}</p>
                      )}
                    </div>
                  </div>

                  <div className="col-span-1">
                    <div className="w-full px-3">
                      <label className="text-sm font-bold font-zen-kaku">
                        Comuna
                      </label>
                      <Select
                        className={`basic-single font-zen-kaku`}
                        classNamePrefix="select"
                        isSearchable={isSearchable}
                        name="id_comuna"
                        placeholder="Seleccione comuna"
                        options={comunas.map((comuna) => ({
                          label: comuna.nombre,
                          value: comuna.id_comuna,
                        }))}
                        onChange={handleSelect}
                        isDisabled={!selectedRegion}
                        value={selectedComuna}
                      />
                      {errors.id_comuna && (
                        <p className="text-red-600 text-xs mt-1">{errors.id_comuna}</p>
                      )}
                    </div>
                  </div>

                  <div className="col-span-1">
                    <div className="w-full px-3">
                      <label className="text-sm font-bold font-zen-kaku">
                        Rut unidad técnica
                      </label>
                      <input
                        className={`w-full px-3 py-2 border rounded font-zen-kaku ${errors.rut ? 'border-red-500' : ''}`}
                        id="grid-first-name"
                        type="text"
                        placeholder="Ingresar rut unidad técnica"
                        name="rut"
                        onChange={handleInput}
                        value={formData.rut || ''}
                      />
                      {errors.rut && (
                        <p className="text-red-600 text-xs mt-1">{errors.rut}</p>
                      )}
                    </div>
                  </div>

                  <div className="col-span-1">
                    <div className="w-full px-3">
                      <label className="text-sm font-bold font-zen-kaku">
                        Usuario
                      </label>
                      <Select
                        className={`basic-single font-zen-kaku`}
                        classNamePrefix="select"
                        isSearchable={isSearchable}
                        name="id_usuario"
                        placeholder="Seleccionar responsable del proyecto"
                        options={userOptions}
                        onChange={handleSelect}
                        value={userOptions.find(
                          (option) => option.value === formData.id_usuario,
                        )}
                      />
                      {errors.id_usuario && (
                        <p className="text-red-600 text-xs mt-1">{errors.id_usuario}</p>
                      )}
                    </div>
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <div className="w-full px-3">
                      <label className="text-sm font-bold font-zen-kaku">
                        Organización
                      </label>
                      <Select
                        className={`basic-single font-zen-kaku`}
                        classNamePrefix="select"
                        isSearchable={isSearchable}
                        name="id_organizacion"
                        placeholder="Seleccionar organización"
                        options={organizationOptions}
                        onChange={handleSelect}
                        value={organizationOptions.find(
                          (option) => option.value === formData.id_organizacion,
                        )}
                      />
                      {errors.id_organizacion && (
                        <p className="text-red-600 text-xs mt-1">{errors.id_organizacion}</p>
                      )}
                    </div>
                  </div>

                </div>

                <div className="flex items-center justify-end mt-16 mb-6">
                  <button
                    type="button"
                    onClick={() => router.push("/dashboard/minas")}
                    className="px-4 py-3 mb-1 mr-1 text-base font-bold text-gray-400 uppercase transition-all duration-150 rounded hover:text-gray-600 font-zen-kaku"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="bg-[#5C7891] ml-10 text-white active:bg-[#597387] font-bold uppercase text-base px-10 py-3 rounded-lg shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 font-zen-kaku hover:opacity-75"
                    onClick={() => handleStepChange(currentStep + 1)}
                  >
                    Continuar
                  </button>
                </div>
              </form>
            )}

            {step === 2 && (
              <form className="h-full p-4 mx-auto font-zen-kaku w-full">
                <div className="flex flex-col items-center">
                  <div className="flex flex-wrap mb-6">
                    <div className="w-full px-3 mb-6 md:mb-0">
                      <label className="font-zen-kaku flex justify-center select-none">
                        Agregar foto de perfil
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex justify-center mb-3">
                    <div className="relative w-32 h-32 rounded-full bg-[#5C7891] bg-opacity-80 border-[#597387] border-4 flex items-center justify-center overflow-hidden transition-transform transform-gpu hover:scale-110">
                      {imagenPerfil ? (
                        <Image
                          src={imagenPerfil}
                          alt="Foto de perfil"
                          layout="fill"
                          objectFit="cover"
                        />
                      ) : (
                        <BriefcaseBusiness size={60} color="#ffffff" />
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap mb-3 mt-14">
                    <div className="w-full px-3 md:mb-0">
                      <label
                        htmlFor="fileUpload"
                        className="flex items-center justify-center px-4 py-3 border border-[#5C7891] rounded-lg cursor-pointer font-zen-kaku text-sm hover:shadow-lg select-none hover:border-teal-800 ease-linear transition-all duration-150"
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
                </div>

                <div className="flex items-center justify-end mt-16 mb-6">
                  <ConfirmDialog
                    group="declarative"
                    visible={visible}
                    onHide={() => setVisible(false)}
                    message="Tus datos podrian perderse"
                    header="¿Quiere guardar sus datos?"
                    accept={accept}
                    reject={reject}
                    acceptLabel="Guardar datos"
                    rejectLabel="Cancelar"
                    className="custom-confirm-dialog"
                  />
                  <button
                    type="button"
                    onClick={() => handleStepChange(currentStep - 1)}
                    className="px-4 py-3 mb-1 mr-1 text-base font-bold text-gray-400 uppercase transition-all duration-150 rounded hover:text-gray-600 font-zen-kaku"
                  >
                    Atrás
                  </button>
                  <button
                    type="button"
                    className="bg-[#5C7891] ml-10 text-white active:bg-[#597387] font-bold uppercase text-base px-10 py-3 rounded-lg shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 font-zen-kaku hover:opacity-75"
                    onClick={() => setVisible(true)}
                  >
                    Guardar
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      </div>
    </>
  );
}

export default NewMina;
