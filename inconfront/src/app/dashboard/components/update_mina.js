"use client";

import { useSelector } from "react-redux";
import React, { useState, useEffect } from "react";
import NewMinaForm from "../minas/components/new.mina.form";
import NewMinaDoc from "../minas/components/new.mina.doc";
import { ConfirmDialog } from "primereact/confirmdialog";
import toast from "react-hot-toast";
import { Button } from "primereact/button";
import "../style/custom_confirmation.css";
import "primereact/resources/themes/saga-blue/theme.css"; //tema
import "primereact/resources/primereact.min.css"; //core css
import "primeicons/primeicons.css"; //iconos
import Select from "react-select";
import { useRouter } from "next/navigation";
import { Upload, BriefcaseBusiness } from "lucide-react";
import { getPaises, getOrganizacion, getUsers } from "@/app/services/user";

import { updateMina, postMinaProf } from "@/app/services/minas";
import Image from "next/image";

const UpdateMinaPage = ({ minaData, paises, users, organizations }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [step, setStep] = useState(1);
  const [visible, setVisible] = useState(false);
  const stepsTotal = 2;
  const stepTitles = ["Datos de la obra", "Cargar foto"];
  const userStore = useSelector((state) => state.user);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleStepChange = (newStep) => {
    console.log(newStep);
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
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [createdMinaId, setCreatedMinaId] = useState("");

  const handleInput = (e) => {
    const { name, value } = e.target;
    let fieldValue = value;

    if (name === 'rut') {
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
    } else if (name === 'name' || name === 'direccion') {
      // Capitalizar la primera letra de cada palabra
      fieldValue = fieldValue.toLowerCase().split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }

    setFormData((prevState) => ({
      ...prevState,
      [name]: fieldValue,
    }));
  };

  const handleSelect = (selectedOption, { name }) => {
    if (!selectedOption) return;

    setFormData((prevState) => ({
      ...prevState,
      [name]: selectedOption.value,
    }));

    if (name === "id_pais") {
      setSelectedPais(selectedOption);
      setRegiones(selectedOption.regiones_pais || []);
      setSelectedRegion(null);
      setSelectedComuna(null);
      setFormData((prevState) => ({
        ...prevState,
        id_region: null,
        id_comuna: null,
      }));
    } else if (name === "id_region") {
      setSelectedRegion(selectedOption);
      setComunas(selectedOption.comunas_regions || []);
      setSelectedComuna(null);
      setFormData((prevState) => ({
        ...prevState,
        id_comuna: null,
      }));
    } else if (name === "id_comuna") {
      setSelectedComuna(selectedOption);
    } else if (name === "id_usuario") {
      setSelectedUser(selectedOption);
    } else if (name === "id_organizacion") {
      setSelectedOrganization(selectedOption);
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
    // Sin autoselección; usuario debe elegir comuna explícitamente
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

  useEffect(() => {
    if (minaData && isInitialLoad) {
      setFormData({ ...minaData });

      const paisSeleccionado = paisOptions.find(
        (pais) => pais.value === minaData.id_pais,
      );
      setSelectedPais(paisSeleccionado || null);

      if (paisSeleccionado) {
        setRegiones(paisSeleccionado.regiones_pais || []);
      } else {
        setRegiones([]);
      }

      const regionSeleccionada = paisSeleccionado?.regiones_pais?.find(
        (region) => region.id_region === minaData.id_region,
      );
      setSelectedRegion(regionSeleccionada || null);

      if (regionSeleccionada) {
        setComunas(regionSeleccionada.comunas_regions || []);
      } else {
        setComunas([]);
      }

      const comunaSeleccionada = regionSeleccionada?.comunas_regions?.find(
        (comuna) => comuna.id_comuna === minaData.id_comuna,
      );
      setSelectedComuna(comunaSeleccionada || null);

      const usuarioSeleccionado = userOptions.find(
        (user) => user.value === minaData.id_usuario,
      );
      setSelectedUser(usuarioSeleccionado || null);

      const organizacionSeleccionada = organizationOptions.find(
        (org) => org.value === minaData.id_organizacion,
      );
      setSelectedOrganization(organizacionSeleccionada || null);

      setIsInitialLoad(false);
    }
  }, [minaData, paisOptions, userOptions, organizationOptions, isInitialLoad]);

  useEffect(() => {
    console.log("organizationOptions:", organizationOptions);
  }, [organizationOptions]);

  const [uploadText, setUploadText] = useState("Subir foto");
  const [imagenPerfil, setImagenPerfil] = useState(null);
  const [profileFile, setProfileFile] = useState(null);

  // Validaciones requeridas para el paso 1
  const cleanRut = (rutStr) => (rutStr || "").replace(/\.|-/g, "");
  const isValidRut = (rutStr) => {
    const clean = cleanRut(rutStr).toUpperCase();
    if (!clean || clean.length < 2) return false;
    const cuerpo = clean.slice(0, -1);
    const dv = clean.slice(-1);
    if (!/^\d+$/.test(cuerpo)) return false;
    let suma = 0;
    let multiplicador = 2;
    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += parseInt(cuerpo[i], 10) * multiplicador;
      multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }
    const resto = 11 - (suma % 11);
    const dvEsperado = resto === 11 ? "0" : resto === 10 ? "K" : String(resto);
    return dvEsperado === dv;
  };

  const validateStep1 = () => {
    const errors = [];
    if (!formData.name || !String(formData.name).trim()) {
      errors.push("El nombre de la obra es requerido.");
    }
    if (!formData.direccion || !String(formData.direccion).trim()) {
      errors.push("La ubicación es requerida.");
    }
    if (!formData.id_pais) {
      errors.push("Seleccione un país.");
    }
    if (!formData.id_region) {
      errors.push("Seleccione una región.");
    }
    if (!formData.id_comuna) {
      errors.push("Seleccione una comuna.");
    }
    if (!formData.rut || !String(formData.rut).trim()) {
      errors.push("El RUT de la unidad técnica es requerido.");
    } else if (!isValidRut(formData.rut)) {
      errors.push("El RUT ingresado no es válido.");
    }
    if (!formData.id_usuario) {
      errors.push("Seleccione un usuario responsable.");
    }
    if (!formData.id_organizacion) {
      errors.push("Seleccione una organización.");
    }
    return { valid: errors.length === 0, errors };
  };

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
    const { valid, errors } = validateStep1();
    if (!valid) {
      toast.error(errors[0]);
      // Regresar al paso 1 para corregir
      setStep(1);
      setCurrentStep(1);
      return;
    }
    setIsLoading(true);
    try {
      const updatedData = {
        ...formData,
      };

      console.log("Datos enviados:", updatedData);

      const response = await updateMina(minaData.id, updatedData);

      if (profileFile) {
        const profileFormData = new FormData();
        profileFormData.append("file", profileFile);
        profileFormData.append("document_type", "Foto de perfil mina");
        profileFormData.append("minaId", minaData.id);

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
    <div className="flex flex-col w-full h-screen bg-gray-800 bg-opacity-75 overflow-x-hidden">
      <div className="flex-grow justify-center items-center font-zen-kaku bg-[#FAFAFA] p-4 select-none overflow-x-hidden">
        <div className="mt-6"></div>
        <div className="grid grid-cols-3 gap-4 items-center mb-10 font-zen-kaku">
          <label
            htmlFor="filtroSelect"
            className="mx-auto text-3xl font-extrabold text-gray-800 select-none font-zen-kaku text-center"
          >
            | Nueva obra |
          </label>
        </div>
        <div className="bg-white rounded-xl shadow-lg mx-auto overflow-x-hidden">
          <div
            className={`relative flex flex-col items-start ml-4 top-12 z-0 ${currentStep > stepsTotal ? "hidden" : ""}`}
          >
            {[...Array(stepsTotal)].map((_, index) => (
              <div key={index} className="flex flex-row items-center mb-4">
                {/* Número del paso */}
                <span
                  className={`font-zen-kaku rounded-full h-8 w-8 flex justify-center items-center cursor-pointer mr-2 transition-transform hover:scale-110 ease-linear ${index === 0 ? "bg-[#5C7891] text-white" : currentStep === index + 1 ? "bg-[#5C7891] text-white ring-1 ring-[#5C7891] border-white border-4  " : "border border-gray-400 text-gray-400"} ${index === 0 ? "bg-[#5C7891] text-white border-transparent" : currentStep === index + 2 ? "bg-[#5C7891] text-white border-[#597387]" : "border border-gray-400 text-gray-400"}`}
                  onClick={() => handleStepChange(index + 1)}
                >
                  {index + 1}
                </span>
                <span className="text-black text-sm font-semibold font-zen-kaku">
                  {stepTitles[index]}
                </span>
              </div>
            ))}
          </div>

          {step === 1 && (
            <form
              className="mx-auto px-10 font-zen-kaku ml-64 md:w-4/4"
              style={{ marginTop: "-90px" }}
            >
              <div className="flex flex-wrap mb-3">
                <div className="w-full px-3 md:mb-0 z-50">
                  <label className="font-zen-kaku font-semibold">
                    Nombre de la obra
                  </label>
                  <input
                    className="w-full px-3 py-2  rounded border border-gray-300 font-zen-kaku z-10"
                    id="grid-first-name"
                    type="text"
                    placeholder="Ingresar nombre de obra"
                    aria-label="Campo de ingreso nombre de la obra"
                    name="name"
                    onChange={handleInput}
                    value={formData.name}
                  />
                </div>
              </div>
              <div className="flex flex-row mb-3 ">
                <div className="w-full md:w-1/2 px-3 md:mb-0 z-50">
                  <label className="font-zen-kaku z-50 font-semibold">
                    Ubicación
                  </label>
                  <input
                    className="w-full px-3 py-2 z-50 rounded border border-gray-300 font-zen-kaku"
                    id="grid-first-name"
                    type="text"
                    placeholder="Ingrese ubicación"
                    aria-label="Campo de ingreso ubicacion"
                    name="direccion"
                    onChange={handleInput}
                    value={formData.direccion}
                  />
                </div>
              </div>
              <div className="flex flex-nowrap mb-3 mt-1">
                <div className="w-full md:w-1/3  px-3 md:mb-0 z-50">
                  <label className="font-zen-kaku font-semibold">País</label>
                  <Select
                    className={`basic-single font-zen-kaku`}
                    classNamePrefix="select"
                    isSearchable={isSearchable}
                    name="id_pais"
                    placeholder="Seleccione país"
                    aria-label="Campo de seleccion pais"
                    options={paises.map((pais) => ({
                      label: pais.NombrePais,
                      value: pais.id_pais,
                      regiones_pais: pais.regiones_pais,
                    }))}
                    onChange={handleSelectPais}
                    value={selectedPais}
                  />
                </div>
                <div className="w-full md:w-1/3 px-3 md:mb-0">
                  <label className="font-zen-kaku font-semibold">Región</label>
                  <Select
                    className={`basic-single font-zen-kaku`}
                    classNamePrefix="select"
                    isSearchable={isSearchable}
                    name="id_region"
                    placeholder="Seleccione región"
                    aria-label="Campo de seleccion región"
                    options={regiones.map((region) => ({
                      label: region.nombre,
                      value: region.id_region,
                      comunas_regions: region.comunas_regions,
                    }))}
                    onChange={handleSelectRegion}
                    isDisabled={!selectedPais}
                    value={selectedRegion}
                  />
                </div>
                <div className="w-full md:w-1/3 px-3 md:mb-0">
                  <label className="font-zen-kaku font-semibold">Comuna</label>
                  <Select
                    className={`basic-single font-zen-kaku`}
                    classNamePrefix="select"
                    isSearchable={isSearchable}
                    name="id_comuna"
                    placeholder="Seleccione comuna"
                    aria-label="Campo de seleccion comuna"
                    options={comunas.map((comuna) => ({
                      label: comuna.nombre,
                      value: comuna.id_comuna,
                    }))}
                    onChange={(option) =>
                      handleSelect(option, { name: "id_comuna" })
                    }
                    isDisabled={!selectedRegion}
                    value={selectedComuna}
                  />
                </div>
              </div>
              <div className="flex flex-wrap mb-3">
                <div className="w-full md:w-1/3 px-3 mb-6 md:mb-0">
                  <label className="font-zen-kaku font-semibold">
                    Rut unidad técnica
                  </label>
                  <input
                    className="w-full px-3 py-2  rounded border border-gray-300 font-zen-kaku"
                    id="grid-first-name"
                    type="text"
                    placeholder="Ingresar rut unidad técnica"
                    aria-label="Campo de ingreso ingreso RUT unidad tecnica"
                    name="rut"
                    onChange={handleInput}
                    value={formData.rut}
                  />
                </div>
                <div className="w-full md:w-1/3 px-3 md:mb-0">
                  <label className="font-zen-kaku font-semibold">Usuario</label>
                  <Select
                    className={`basic-single font-zen-kaku`}
                    classNamePrefix="select"
                    isSearchable={isSearchable}
                    name="id_usuario"
                    placeholder="Seleccionar responsable del proyecto"
                    aria-label="Campo de seleccion responsable del proyecto"
                    options={userOptions}
                    onChange={handleSelect}
                    value={userOptions.find(
                      (option) => option.value === formData.id_usuario || null,
                    )}
                  />
                </div>
              </div>
              <div className="flex flex-auto mb-3">
                <div className="w-full  px-3 md:mb-0">
                  <label className="font-zen-kaku font-semibold">
                    Organización
                  </label>
                  <Select
                    className={`basic-single font-zen-kaku`}
                    classNamePrefix="select"
                    isSearchable={isSearchable}
                    name="id_organizacion"
                    placeholder="Seleccionar organización"
                    aria-label="Campo de seleccion organizacion"
                    options={organizationOptions}
                    onChange={handleSelect}
                    value={
                      organizationOptions.find(
                        (option) => option.value === formData.id_organizacion,
                      ) || null
                    }
                  />
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
                  onClick={() => {
                    const { valid, errors } = validateStep1();
                    if (!valid) {
                      toast.error(errors[0]);
                      return;
                    }
                    handleStepChange(currentStep + 1);
                  }}
                >
                  Continuar
                </button>
              </div>
            </form>
          )}
          {step === 2 && (
            <form className="mx-auto px-20" style={{ width: "37vw" }}>
              <>
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
                      className="flex items-center px-4 py-3 border border-[#5C7891] rounded-lg cursor-pointer font-zen-kaku text-sm hover:shadow-lg select-none hover:border-[#597387] ease-linear transition-all duration-150"
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
                <div className="flex flex-wrap justify-end mr-12 font-zen-kaku mt-28">
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
                    className="confirm-dialog-custom"
                  />
                  <div className="flex justify-content-center h-12 w-38 rounded-lg mb-4">
                    <button
                      type="button"
                      onClick={() => handleStepChange(currentStep - 1)}
                      className="mr-10 text-lg font-zen-kaku text-zinc-500 hover:text-zinc-600"
                    >
                      Cancelar{" "}
                    </button>
                    <Button
                      type="button"
                      onClick={() => setVisible(true)}
                      icon="pi pi-check"
                      label="Guardar datos"
                      className=" bg-[#5C7891] rounded-lg px-10 hover:bg-[#597387] font-semibold text-white"
                    />
                  </div>
                </div>
              </>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdateMinaPage;
