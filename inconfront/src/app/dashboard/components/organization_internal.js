import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { Upload, BriefcaseBusiness, Check } from 'lucide-react';
import '../style/external_user.css';
import { postOrganization, postOrganizationDoc, postOrganizationProf, getPaises, getComunasPorRegion, getRegionesPorPais, getCodTelefono } from '@/app/services/organizacion';
import Image from 'next/image';
import toast from 'react-hot-toast';
const { useRouter } = require('next/navigation');
import { Button } from 'primereact/button';
import 'primereact/resources/themes/saga-blue/theme.css'; //tema
import 'primereact/resources/primereact.min.css'; //core css
import 'primeicons/primeicons.css'; //iconos
import "../style/custom_confirmation.css";
import { ConfirmDialog } from 'primereact/confirmdialog';
import "../style/custom_icon.css";
import Loader from '@/app/dashboard/components/loader';

import {
    validateNombreEmpresa,
    validateRUT,
    validateDireccion,
    validateCodigoPostal,
    validateTelefono,
    validateCodigoTelefono,
    validateRepresentanteLegal,
    validateRUTRepresentanteLegal,
    validatePais,
    validateRegion,
    validateComuna,
    validateEmail,
    
} from '@/app/dashboard/components/validForm/valid_organizacion';
import { formatearRUT } from '@/app/dashboard/components/validForm/validRutChileno';

const InternalorganizationDrawer = ({ isOpen, userType, setModalVisible }) => {
    const [imagenPerfil, setImagenPerfil] = useState(null);

    const [createdOrganizationId, setCreatedOrganizationId] = useState('');
    const [profileFile, setProfileFile] = useState(null);
    const [showUserCreated, setShowUserCreated] = useState(false);
    const [organizationCreated, setOrganizationCreated] = useState('');
    const [uploadText, setUploadText] = useState('Subir foto');

    const [paisOptions, setPaisOptions] = useState([{ value: '', label: 'Seleccione pais' }]);
    const [regionOptions, setRegionOptions] = useState([]);
    const [selectedPais, setSelectedPais] = useState(null);
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [comunaOptions, setComunaOptions] = useState([]);
    const [selectedComuna, setSelectedComuna] = useState(null);
    const [tipoEmpresaOptions, setTipoEmpresaOptions] = useState([]);
    const [codTelefonoOptions, setCodTelefonoOptions] = useState([]);

    const [selectedCodTelefono, setSelectedCodTelefono] = useState(null);
    const [selectedTipoEmpresa, setSelectedTipoEmpresa] = useState(null);

    const [errors, setErrors] = useState({});
    const [dragActive, setDragActive] = useState(false);


    const handleDragOver = (e) => {
        e.preventDefault(); // Previene el comportamiento por defecto del navegador
        setDragActive(true); // Activar el estado de arrastre
    };

    const handleDragLeave = (e) => {
        e.preventDefault(); // Previene el comportamiento por defecto del navegador
        setDragActive(false); // Desactivar el estado de arrastre
    };

    const handleDrop = (e, documentKey) => {
        e.preventDefault(); // Previene el comportamiento por defecto del navegador
        setDragActive(false); // Desactivar el estado de arrastre

        const file = e.dataTransfer.files[0]; // Obtener el archivo arrastrado
        if (!file) {
            toast.error('No se seleccionó ningún archivo');
            return;
        }

        // Validar el archivo antes de guardarlo
        const allowedExtensions = ['pdf', 'docx', 'png', 'jpg'];
        const allowedMimeTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg'];
        const maxSizeInMB = 30;

        const isValid = validarArchivo(file, maxSizeInMB, allowedExtensions, allowedMimeTypes);
        if (!isValid) return;

        // Guardar el archivo en el estado correspondiente
        setFileInputs((prevState) => ({
            ...prevState,
            [documentKey]: file,
        }));

        toast.success(`${documentTypes[documentKey]} cargado correctamente.`);
    };


    const validateForm = () => {
        const newErrors = {};

        newErrors.nombre = validateNombreEmpresa(formData.nombre);
        newErrors.rut = validateRUT(formData.rut);
        newErrors.direccion = validateDireccion(formData.direccion);
        newErrors.codigo_postal = validateCodigoPostal(formData.codigo_postal);
        newErrors.telefono = validateTelefono(formData.telefono);
        newErrors.codigoArea = validateCodigoTelefono(formData.id_codtelefono);
        newErrors.representante_legal = validateRepresentanteLegal(formData.representante_legal);
        newErrors.rut_representante_legal = validateRUTRepresentanteLegal(formData.rut_representante_legal);
        newErrors.pais = validatePais(selectedPais);
        newErrors.region = validateRegion(selectedRegion);
        newErrors.comuna = validateComuna(selectedComuna);
   

        setErrors(newErrors);

        // Retornar true si no hay errores, de lo contrario, false
        return Object.values(newErrors).every(error => error === '');
    };




    const [step, setStep] = useState(1);
    const [currentStep, setCurrentStep] = useState(1);
    const stepsTotal = 4;
    const stepTitles = ['Datos organización', 'Foto organización', 'Carga de documentos', 'Segunda carga'];
    const [showConfirm, setShowConfirm] = useState(false);
    const router = useRouter();

    const [loading, setLoading] = useState(false); // Nuevo estado para el loader


    const [fileInputs, setFileInputs] = useState({
        fileValidity: null,
        fileOwe: null,
        fileContract: null,
        fileSii: null,
        fileSocietyValidity: null,
        fileEnsurance: null,
        fileBank: null,
        fileHealth: null
    });





    const manejarCambioImagen = (evento) => {
        const archivo = evento.target.files[0];
        console.log(archivo)
        if (archivo && archivo.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagenPerfil(reader.result);
            };
            reader.readAsDataURL(archivo);
            setUploadText('Cambiar foto');
            setProfileFile(archivo);
        }
    };

    const documentTypes = {
        fileValidity: 'Certificado de vigencia de la empresa',
        fileOwe: 'Certificado de no adeudo de la empresa',
        fileContract: 'Contrato laboral del proyecto',
        fileSii: 'Certificados SII',
        fileSocietyValidity: 'Certificado de vigencia de la sociedad',
        fileEnsurance: 'Póliza de seguro',
        fileBank: 'Bancarización',
        fileHealth: 'Certificado de afiliación a salud',
    };





    const [formData, setFormData] = useState({
        nombre: "",
        direccion: "",
        id_comuna: 1,
        telefono: "",
        id_codtelefono: 1,
        rut: "",
        representante_legal: "",
        rut_representante_legal: "",
        id_tipoempresa: 8,
        codigo_postal: "",
        email: "",
        sitio_web: "",
        descripcion: ""
    });

    const handleInput = (e) => {
        const fieldName = e.target.name;
        let fieldValue = e.target.value;

        if (fieldName === 'rut' || fieldName === 'rut_representante_legal') {
            fieldValue = formatearRUT(fieldValue);
        } else if (fieldName === 'nombre' || fieldName === 'representante_legal') {
            // Capitalizar la primera letra de cada palabra
            fieldValue = fieldValue.toLowerCase().split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        }

        setFormData((prevState) => ({
            ...prevState,
            [fieldName]: fieldValue
        }));
    }

    const onClickNextPersonal = (e) => {
        e.preventDefault();

        if (validateForm()) {
            handleStepChange(currentStep + 1); // O cualquier otra acción si la validación pasa
        } else {
            toast.error('Por favor, corrija los errores en el formulario');
        }
    };


    const formback1 = () => {
        handleStepChange(currentStep - 1);
    }



    const handleFileUpload = (e, documentKey) => {
        const file = e.target.files[0]; // Captura el archivo del input
        if (!file) {
            toast.error('No se seleccionó ningún archivo');
            return;
        }

        // Validar archivo antes de guardarlo en el estado
        const allowedExtensions = ['pdf', 'docx', 'png', 'jpg'];
        const allowedMimeTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg'];
        const maxSizeInMB = 30; // Tamaño máximo permitido en MB

        // Función de validación
        const isValid = validarArchivo(file, maxSizeInMB, allowedExtensions, allowedMimeTypes);
        if (!isValid) return; // Si no pasa la validación, detenemos el proceso

        // Actualizar el archivo seleccionado en el estado correspondiente
        setFileInputs((prevState) => ({
            ...prevState,
            [documentKey]: file // Guarda el archivo en el estado bajo su clave
        }));

        // Mensaje de éxito
        toast.success(`${documentTypes[documentKey]} cargado correctamente.`);
    };



    // Validación del archivo
    const validarArchivo = (file, maxSizeInMB, allowedExtensions, allowedMimeTypes) => {
        const fileSizeInMB = file.size / 1024 / 1024; // Convertir tamaño a MB
        const fileExtension = file.name.split('.').pop().toLowerCase(); // Obtener la extensión del archivo
        const fileMimeType = file.type; // Obtener el tipo MIME del archivo

        // Validar la extensión del archivo
        if (!allowedExtensions.includes(fileExtension)) {
            toast.error('El tipo de archivo no es válido. Solo se permiten archivos PDF, DOCX, PNG, JPG.');
            return false;
        }

        // Validar el tipo MIME del archivo
        if (!allowedMimeTypes.includes(fileMimeType)) {
            toast.error('El tipo de archivo no es válido. Solo se permiten archivos PDF, DOCX, PNG, JPG.');
            return false;
        }

        // Validar el tamaño del archivo
        if (fileSizeInMB > maxSizeInMB) {
            toast.error(`El archivo supera el tamaño máximo permitido de ${maxSizeInMB} MB.`);
            return false;
        }

        return true; // Si todas las validaciones pasan
    };


    // Envío de archivos al backend
    const handleFinalSubmit = async (organizationId) => {
        const documentKeys = Object.keys(fileInputs); // Obtén las claves de los archivos seleccionados

        for (const documentKey of documentKeys) {
            const file = fileInputs[documentKey]; // Archivo específico

            // Si hay un archivo cargado para este documento, lo subimos
            if (file) {
                const formData = new FormData();
                const fileSizeInBytes = file.size; // Tamaño del archivo
                const fileExtension = file.name.split('.').pop().toLowerCase(); // Extensión del archivo

                // Adjuntar los datos necesarios
                formData.append('file', file); // Archivo en sí
                formData.append('document_type', documentTypes[documentKey]); // Tipo de documento
                formData.append('organizationId', organizationId); // ID de la organización
                formData.append('filesize', fileSizeInBytes); // Tamaño del archivo
                formData.append('fileExtension', fileExtension); // Extensión del archivo

                try {
                    // Subir archivo al backend
                    await postOrganizationDoc(formData);
                    toast.success(`${documentTypes[documentKey]} cargado correctamente.`);
                } catch (error) {
                    console.error(`Error al subir el archivo de ${documentTypes[documentKey]}`, error);
                    toast.error(`Error al subir el archivo de ${documentTypes[documentKey]}`);
                }
            }
        }
    };


    const showdocs1 = async (e) => {
        console.log("formdata: ", formData);

        setOrganizationCreated(formData.nombre);
        setLoading(true); // Inicia el loader

        const organization = {
            nombre: formData.nombre,
            id_comuna: formData.id_comuna,
            direccion: formData.direccion,
            id_codtelefono: formData.id_codtelefono,
            telefono: formData.telefono,
            rut: formData.rut,
            representante_legal: formData.representante_legal,
            rut_representante_legal: formData.rut_representante_legal,
            id_tipoempresa: formData.id_tipoempresa,
            email: formData.email,
            sitio_web: formData.sitio_web,
            descripcion: formData.descripcion,
        };

        console.log("=== DEBUGGING ORGANIZATION CREATION ===");
        console.log("Organization object being sent to backend:", organization);
        console.log("Field validation check:");
        console.log("- nombre:", organization.nombre, "| Type:", typeof organization.nombre, "| Length:", organization.nombre?.length);
        console.log("- id_comuna:", organization.id_comuna, "| Type:", typeof organization.id_comuna);
        console.log("- direccion:", organization.direccion, "| Type:", typeof organization.direccion, "| Length:", organization.direccion?.length);
        console.log("- id_codtelefono:", organization.id_codtelefono, "| Type:", typeof organization.id_codtelefono);
        console.log("- telefono:", organization.telefono, "| Type:", typeof organization.telefono, "| Length:", organization.telefono?.length);
        console.log("- rut:", organization.rut, "| Type:", typeof organization.rut, "| Length:", organization.rut?.length);
        console.log("- representante_legal:", organization.representante_legal, "| Type:", typeof organization.representante_legal, "| Length:", organization.representante_legal?.length);
        console.log("- rut_representante_legal:", organization.rut_representante_legal, "| Type:", typeof organization.rut_representante_legal, "| Length:", organization.rut_representante_legal?.length);
        console.log("- id_tipoempresa:", organization.id_tipoempresa, "| Type:", typeof organization.id_tipoempresa);
        console.log("==========================================");

        try {
            // Crear organización
            const response = await postOrganization(organization);
            const organizationId = response.data.id;
            setCreatedOrganizationId(organizationId);

            // Subir la foto de perfil (si existe)
            if (profileFile) {
                const formData = new FormData();
                const fileSizeInBytes = profileFile.size;
                const fileExtension = profileFile.name.split('.').pop().toLowerCase();

                formData.append('file', profileFile);
                formData.append('document_type', 'Foto de perfil organización');
                formData.append('organizationId', organizationId);
                formData.append('filesize', fileSizeInBytes);
                formData.append('fileExtension', fileExtension);

                await postOrganizationProf(formData);
            }

            // Subir los documentos restantes
            await handleFinalSubmit(organizationId);

            // Redirigir con toast tras crear organización
            toast.success('Organización creada correctamente.');
            router.push('/dashboard/organization');
        } catch (error) {
            console.error('Error al crear la organización o subir los documentos', error);
            toast.error('Error al crear la organización o subir los documentos');
        } finally {
            setLoading(false); // Termina el loader
        }
    };



    const handleWorkPrevious = () => {
        handleStepChange(currentStep - 1);
    }
    const nextdocstwo = () => {
        handleStepChange(currentStep + 1);
    }
    const backdocs1 = () => {
        handleStepChange(currentStep - 1);
    }


    useEffect(() => {
        fetchPaises();
    }, []);

    async function fetchPaises() {
        try {
            const responsePaises = await getPaises();
            const paises = responsePaises.map(pais => ({ value: pais.id, label: pais.nombre }));
            setPaisOptions(paises);
        } catch (error) {
            console.error('Error fetching countries:', error);
        }
    }
    async function fetchRegiones(paisId) {
        const responseRegiones = await getRegionesPorPais(paisId);
        setRegionOptions(responseRegiones.map(region => ({ value: region.id, label: region.nombre })));
    }
    const fetchComunas = async (regionId) => {
        if (!regionId) {
            setComunaOptions([]);
            setSelectedComuna(null);
            return;
        }
        try {
            const comunas = await getComunasPorRegion(regionId);
            setComunaOptions(comunas.map(comuna => ({ value: comuna.id, label: comuna.nombre })));
            // No auto-seleccionar comuna; limpiar selección previa y esperar elección
            setSelectedComuna(null);
        } catch (error) {
            console.error('Error fetching comunas:', error);
            setComunaOptions([]);
        }
    };

    const handleSelectRegion = (selectedOption) => {
        if (!selectedOption) {
            setRegionOptions([]);
            setSelectedRegion(null);
            setComunaOptions([]);
            return;
        }
        // Guardar la opción completa para que el Select resuelva correctamente el valor
        setSelectedRegion(selectedOption);
        fetchComunas(selectedOption.value);
    };
    const handleSelectPais = (selectedOption) => {
        if (selectedOption) {
            setSelectedPais(selectedOption);
            fetchRegiones(selectedOption.value);
            setSelectedRegion(null);
            setComunaOptions([]);
            setSelectedComuna(null);
            console.log("País seleccionado:", selectedOption);
            console.log("Estado de región después de cambio de país:", selectedRegion);
        } else {
            setSelectedPais(null);
            setRegionOptions([]);
            setSelectedRegion(null);
            setComunaOptions([]);
            setSelectedComuna(null);
        }
    };

    const handleStepChange = (newStep) => {
        // Realizar la validación en los pasos donde corresponde
        if (currentStep === 1 && !validateForm()) {
            toast.error('Por favor, corrija los errores antes de continuar.');
            return;  // Detener el cambio de paso si la validación falla
        }

        // Continuar solo si la validación es exitosa o si el paso no requiere validación
        setStep(newStep);
        setCurrentStep(newStep);
    };

    const cancelorganization = () => {
        router.push('/dashboard/organization');
    };

    const nextdocs1 = (e) => {
        e.preventDefault();
        handleStepChange(currentStep + 1);
    }


    const accept = () => {
        setShowConfirm(false);
        showdocs1();
        // setShowUserCreated(true);
    };

    const reject = () => {
        setShowConfirm(false);
    };

    const onclickfinishform = (e) => {
        e.preventDefault();
        setShowConfirm(true);
    };

    const handleRedirect = () => {
        router.push('/dashboard/organization');
    };


    useEffect(() => {
        const fetchData = async () => {
      
            await fetchCodTelefono();
        };

        fetchData();
    }, []);


    // Fetch códigos de teléfono
    const fetchCodTelefono = async () => {
        try {
            const codigos = await getCodTelefono();
            // Verifica que los datos estén correctos
            setCodTelefonoOptions(codigos.map(codigo => ({
                value: codigo.id,
                label: codigo.cod_numero
            })));
        } catch (error) {
            console.error('Error al cargar códigos de teléfono:', error);
        }
    };


    // Manejar selección de código de teléfono
    const handleCodTelefonoChange = (option) => {
        setSelectedCodTelefono(option);  // Actualiza el estado visual
        setFormData((prevState) => ({
            ...prevState,
            id_codtelefono: option?.value || 0  // Actualiza id_codtelefono en formData
        }));
    };


    return (
        <div className="flex flex-col w-full h-screen overflow-x-hidden">
            <div className="flex-grow justify-center items-center font-zen-kaku bg-[#FAFAFA] p-4 select-none overflow-x-hidden">
                {/* Header */}
                <div className='mt-6'></div>



                {/* Filtro y Organización */}
                <div className="grid items-center grid-cols-1 md:grid-cols-3 gap-4 mb-6 font-zen-kaku">
                    <label htmlFor="filtroSelect" className="ml-4 text-base font-bold text-black select-none font-zen-kaku">
                        | Nueva organización Interna minera |
                    </label>
                </div>
                {/* Loader */}
                {loading && (
                    <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 z-50">
                        <div className="text-white text-lg">    <Loader /> {/* Muestra el loader */}</div>
                    </div>
                )}

                {/* Contenido normal */}
                {!loading && (
                    <>
                        {/* Contenedor Principal en Flex - Mejorado para móvil */}
                        <div className='mx-auto bg-white shadow-lg rounded-xl flex flex-col desktop:flex-row gap-2 w-full desktop:w-4/5 custom-form-container'>

                            {/* Progress Bar que se adapta en mobile */}
                            <div className='flex flex-wrap desktop:flex-col w-full desktop:w-1/4 items-center desktop:items-start p-4 tablet:p-6'>
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
                                <form className='h-full p-4 mx-auto font-zen-kaku w-full' >
                                    <>
                                        <div className='flex flex-wrap mb-6 mt-6'>
                                            <div className='w-full px-3'>
                                                <label className='text-sm font-bold font-zen-kaku'>Nombre de empresa</label>
                                                <input
                                                    className="w-full px-3 py-2 border rounded font-zen-kaku"
                                                    id="grid-first-name"
                                                    type="text"
                                                    placeholder="Nombre de empresa"
                                                    name='nombre'
                                                    onChange={handleInput}
                                                    value={formData.nombre}
                                                />
                                                {errors.nombre && <p className="text-red-500 text-sm">{errors.nombre}</p>} {/* Mostrar error */}
                                            </div>
                                        </div>

                                        <div className='flex flex-wrap mb-6'>
                                            <div className='w-full tablet:w-1/2 px-3 mb-6 tablet:mb-0 custom-input-group'>
                                                <label className='text-sm font-bold font-zen-kaku'>RUT de la empresa</label>
                                                <input
                                                    className="w-full px-3 py-2 border rounded font-zen-kaku"
                                                    id="grid-first-name"
                                                    type="text"
                                                    placeholder="RUT de la empresa"
                                                    name='rut'
                                                    onChange={handleInput}
                                                    value={formData.rut}
                                                />
                                                {errors.rut && <p className="text-red-500 text-sm">{errors.rut}</p>} {/* Mostrar error */}
                                            </div>
                                            <div className='w-full tablet:w-1/2 px-3 tablet:mb-0'>
                                                <label className='text-sm font-bold font-zen-kaku'>Celular</label>

                                                {/* Contenedor para el Select del código y el input del número */}
                                                <div className="flex gap-2 custom-input-group">
                                                    <div className='w-1/3'>
                                                        {/* Select para el código de teléfono */}
                                                        <Select
                                                            className="basic-single"
                                                            classNamePrefix="select"
                                                            isSearchable={true}
                                                            name="cod_telefono"
                                                            placeholder="Código"
                                                            options={codTelefonoOptions}
                                                            value={codTelefonoOptions.find(option => option.value === selectedCodTelefono?.value)}
                                                            onChange={handleCodTelefonoChange}
                                                            menuPlacement="auto"
                                                            menuPosition="fixed"
                                                        />
                                                    </div>
                                                    <div className='w-2/3'>
                                                        {/* Input para el número de teléfono */}
                                                        <input
                                                            className="w-full px-3 py-2 border rounded font-zen-kaku"
                                                            id="grid-last-name"
                                                            type="text"
                                                            placeholder="Número de celular"
                                                            name='telefono'
                                                            onChange={handleInput}
                                                            value={formData.telefono}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Contenedor para los mensajes de error, alineado con el input */}
                                                <div className="flex gap-2 mt-1">
                                                    <div className='w-1/3'>
                                                        {/* Mensaje de error para código de teléfono */}
                                                        {errors.codigoArea && <p className="text-red-500 text-sm">{errors.codigoArea}</p>}
                                                    </div>
                                                    <div className='w-2/3'>
                                                        {/* Mensaje de error para número de teléfono */}
                                                        {errors.telefono && <p className="text-red-500 text-sm">{errors.telefono}</p>}
                                                    </div>
                                                </div>
                                            </div>


                                        </div>

                                        <div className='flex flex-wrap mb-6'>
                                            <div className='w-full tablet:w-1/2 px-3 mb-6 tablet:mb-0'>
                                                <label className='text-sm font-bold font-zen-kaku'>Dirección</label>
                                                <input
                                                    className="w-full px-3 py-2 border rounded font-zen-kaku"
                                                    id="grid-first-name"
                                                    type="text"
                                                    placeholder="Dirección"
                                                    name='direccion'
                                                    onChange={handleInput}
                                                    value={formData.direccion}
                                                />
                                                {errors.direccion && <p className="text-red-500 text-sm">{errors.direccion}</p>} {/* Mostrar error */}
                                            </div>
                                            <div className='w-full tablet:w-1/2 px-3 tablet:mb-0'>
                                                <label className='text-sm font-bold font-zen-kaku'>Código Postal</label>
                                                <input
                                                    className="w-full px-3 py-2 border rounded font-zen-kaku"
                                                    id="grid-last-name"
                                                    type="text"
                                                    placeholder="Código Postal"
                                                    name='codigo_postal'
                                                    onChange={handleInput}
                                                    value={formData.codigo_postal}
                                                />
                                                {errors.codigo_postal && <p className="text-red-500 text-sm">{errors.codigo_postal}</p>} {/* Mostrar error */}
                                            </div>
                                        </div>

                                        <div className='flex flex-wrap mb-6'>
                                            <div className='w-full desktop:w-1/3 px-3 mb-6 desktop:mb-0'>
                                                <label className='text-sm font-bold font-zen-kaku'>País</label>
                                                <Select
                                                    className="basic-single"
                                                    classNamePrefix="select"
                                                    isSearchable={true}
                                                    name="pais"
                                                    placeholder="Selecciona país"
                                                    options={paisOptions}
                                                    value={paisOptions.find(option => option.value === selectedPais?.value)}
                                                    onChange={handleSelectPais}
                                                />
                                                {errors.pais && <p className="text-red-500 text-sm">{errors.pais}</p>} {/* Mostrar error */}
                                            </div>

                                            <div className='w-full desktop:w-1/3 px-3 mb-6 desktop:mb-0'>
                                                <label className='text-sm font-bold font-zen-kaku'>Región</label>
                                                <Select
                                                    className="basic-single"
                                                    classNamePrefix="select"
                                                    isSearchable={true}
                                                    name="region"
                                                    placeholder="Selecciona región"
                                                    options={regionOptions}
                                                    value={regionOptions.find(option => option.value === selectedRegion?.value)}
                                                    onChange={handleSelectRegion}
                                                    isDisabled={!selectedPais}
                                                />
                                                {errors.region && <p className="text-red-500 text-sm">{errors.region}</p>} {/* Mostrar error */}
                                            </div>

                                            <div className='w-full desktop:w-1/3 px-3 desktop:mb-0'>
                                                <label className='text-sm font-bold font-zen-kaku'>Comuna</label>
                                                <Select
                                                    className="basic-single"
                                                    classNamePrefix="select"
                                                    isSearchable={true}
                                                    name="id_comuna"
                                                    placeholder="Selecciona comuna"
                                                    options={comunaOptions}
                                                    value={comunaOptions.find(option => option.value === selectedComuna?.value)}
                                                    onChange={(option) => {
                                                        setSelectedComuna(option);
                                                        const simulatedEvent = {
                                                            target: {
                                                                name: 'id_comuna',
                                                                value: option ? option.value : ''
                                                            }
                                                        };
                                                        handleInput(simulatedEvent);
                                                    }}
                                                    isDisabled={!selectedRegion}
                                                />
                                                {errors.comuna && <p className="text-red-500 text-sm">{errors.comuna}</p>} {/* Mostrar error */}
                                            </div>
                                        </div>

                                        <div className='flex flex-wrap mb-6'>
                                            <div className='w-full px-3 mb-6 md:mb-0'>
                                                <label className='text-sm font-bold font-zen-kaku'>Nombre responsable o representante legal</label>
                                                <input
                                                    className="w-full px-3 py-2 border rounded font-zen-kaku"
                                                    id="grid-last-name"
                                                    type="text"
                                                    placeholder="Nombre responsable o representante legal"
                                                    name='representante_legal'
                                                    onChange={handleInput}
                                                    value={formData.representante_legal}
                                                />
                                                {errors.representante_legal && <p className="text-red-500 text-sm">{errors.representante_legal}</p>} {/* Mostrar error */}
                                            </div>
                                        </div>

                                        <div className='flex flex-wrap mb-6'>
                                            <div className='w-full px-3 mb-6 md:mb-0'>
                                                <label className='text-sm font-bold font-zen-kaku'>Rut responsable o representante legal</label>
                                                <input
                                                    className="w-full px-3 py-2 border rounded font-zen-kaku"
                                                    id="grid-last-name"
                                                    type="text"
                                                    placeholder="Rut responsable o representante legal"
                                                    name='rut_representante_legal'
                                                    onChange={handleInput}
                                                    value={formData.rut_representante_legal}
                                                />
                                                {errors.rut_representante_legal && <p className="text-red-500 text-sm">{errors.rut_representante_legal}</p>} {/* Mostrar error */}
                                            </div>
                                        </div>

                                        <div className='flex flex-wrap mb-6'>
                                            <div className='w-full px-3 mb-6 md:mb-0'>
                                                <label className='text-sm font-bold font-zen-kaku'>Email</label>
                                                <input
                                                    className="w-full px-3 py-2 border rounded font-zen-kaku"
                                                    id="grid-email"
                                                    type="email"
                                                    placeholder="Email de la organización"
                                                    name='email'
                                                    onChange={handleInput}
                                                    value={formData.email}
                                                />
                                                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>} {/* Mostrar error */}
                                            </div>
                                        </div>

                                        <div className='flex flex-wrap mb-6'>
                                            <div className='w-full px-3 mb-6 md:mb-0'>
                                                <label className='text-sm font-bold font-zen-kaku'>Sitio Web</label>
                                                <input
                                                    className="w-full px-3 py-2 border rounded font-zen-kaku"
                                                    id="grid-sitio-web"
                                                    type="url"
                                                    placeholder="Sitio web de la organización"
                                                    name='sitio_web'
                                                    onChange={handleInput}
                                                    value={formData.sitio_web}
                                                />
                                                {errors.sitio_web && <p className="text-red-500 text-sm">{errors.sitio_web}</p>} {/* Mostrar error */}
                                            </div>
                                        </div>

                                        <div className='flex flex-wrap mb-6'>
                                            <div className='w-full px-3 mb-6 md:mb-0'>
                                                <label className='text-sm font-bold font-zen-kaku'>Descripción</label>
                                                <textarea
                                                    className="w-full px-3 py-2 border rounded font-zen-kaku"
                                                    id="grid-descripcion"
                                                    rows="4"
                                                    placeholder="Descripción de la organización"
                                                    name='descripcion'
                                                    onChange={handleInput}
                                                    value={formData.descripcion}
                                                />
                                                {errors.descripcion && <p className="text-red-500 text-sm">{errors.descripcion}</p>} {/* Mostrar error */}
                                            </div>
                                        </div>


                                        <div className='flex justify-center items-center mt-47'>
                                            <button onClick={cancelorganization} className=" text-gray-400 hover:text-gray-600 font-bold uppercase text-base px-6 py-3 rounded  mr-1 mb-1 transition-all duration-150 font-zen-kaku" type="button">
                                                Cancelar
                                            </button>
                                            <button
                                                className="bg-[#5C7891] text-white active:bg-[#597387] font-bold uppercase text-base px-10 py-4 rounded-lg shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 font-zen-kaku hover:opacity-75"
                                                type="submit"
                                                onClick={onClickNextPersonal}
                                            >
                                                Guardar datos
                                            </button>
                                        </div>
                                    </>
                                </form>

                            )}
                            {step === 2 && (
                                <form className='mx-auto p-4 w-full flex flex-col pr-20'>
                                    <>
                                        <div className='flex flex-wrap mb-6 '>
                                            <div className='w-full px-3 mb-6 md:mb-0'>
                                                <label className='font-zen-kaku flex justify-center mt-32 select-none'>Agregar foto de perfil</label>
                                            </div>
                                        </div>
                                        <div className='flex justify-center mb-3'>
                                            <div className="relative w-32 h-32 rounded-full bg-[#D2E7E4] bg-opacity-80 border-[#7FC3BB] border-4 flex items-center justify-center overflow-hidden transition-transform transform-gpu hover:scale-110">
                                                {imagenPerfil ? (
                                                    <Image src={imagenPerfil} alt="Foto de perfil" layout='fill' objectFit='cover' />
                                                ) : (
                                                    <BriefcaseBusiness size={60} color="#87ACA7" />
                                                )}
                                            </div>
                                        </div>
                                        <div className='flex flex-wrap mb-3 mt-14'>
                                            <div className='w-full  px-3 md:mb-0'>
                                                <label htmlFor="fileUpload" className="flex items-center justify-center px-4 py-3 border border-teal-500 rounded-lg cursor-pointer font-zen-kaku text-sm hover:shadow-lg select-none hover:border-teal-800 ease-linear transition-all duration-150">
                                                    <Upload color="#000000" className="mr-2 h-5 w-5" />
                                                    {uploadText}
                                                </label>
                                                <input type="file" id="fileUpload" className='hidden' onChange={manejarCambioImagen} />
                                            </div>
                                        </div>
                                    </>
                                    <div className='flex justify-center items-center mt-64'>
                                        <button className=" text-gray-400 hover:text-gray-600 font-bold uppercase text-base px-6 py-3 rounded  mr-1 mb-1 transition-all duration-150 font-zen-kaku" type="button"
                                            onClick={formback1}
                                        >Atras</button>
                                        <button className="bg-[#5C7891] text-white hover:opacity-75 active:bg-[#597387] font-zen-kaku font-bold uppercase text-base px-10 py-4 rounded-lg shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                            onClick={nextdocs1}
                                        >Guardar datos       </button>
                                    </div>
                                </form>
                            )}
                            {step === 3 && (
                                <form className='mx-auto w-full p-6'>
                                    <>
                                        <div className='flex flex-wrap mb-3'>
                                            <div className='w-full px-3 mb-6 md:mb-0'>
                                                <label className='w-full px-3 py-2 font-zen-kaku text-base select-none'>
                                                    Solo admite archivos PDF, DOCX, IMG &gt; 30 MB
                                                </label>
                                            </div>
                                        </div>

                                        {/* Certificado de vigencia de la empresa */}
                                        <div
                                            className={`flex flex-wrap mb-3 mt-32 ${dragActive ? 'border border-dashed border-teal-500' : ''}`}
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={(e) => handleDrop(e, 'fileValidity')}  // Manejar el drop
                                        >
                                            <div className='w-full px-3 md:mb-0'>
                                                <label className='w-full px-3 py-2 font-zen-kaku font-semibold select-none'>
                                                    Certificado de vigencia de la empresa
                                                </label>
                                            </div>
                                            <div className="mr-4 ml-5">
                                                <Upload size={26} color="#7FC3BB" />
                                            </div>
                                            <div className="mr-4">
                                                <p className="font-zen-kaku select-none">Arrastrar y soltar archivos o explorar</p>
                                            </div>
                                            {fileInputs.fileValidity && (
                                                <div className="text-green-500">
                                                    {fileInputs.fileValidity.name} seleccionado.
                                                </div>
                                            )}
                                            {/* Botón de subir archivos */}
                                            <input
                                                type="file"
                                                id="fileValidity"
                                                style={{ display: 'none' }}
                                                onChange={(e) => handleFileUpload(e, 'fileValidity')}
                                            />
                                            <label htmlFor="fileValidity" className="px-4 py-1 ml-auto text-[#7FC3BB] border border-[#7FC3BB] rounded-md font-zen-kaku font-semibold overflow-hidden transition-transform transform-gpu hover:scale-110 cursor-pointer">
                                                Subir
                                            </label>
                                        </div>
                                        <div className='border border-b-2 shadow-xl'></div>

                                        {/* Certificado de no adeudo de la empresa */}
                                        <div
                                            className={`flex flex-wrap mb-3 ${dragActive ? 'border border-dashed border-teal-500' : ''}`}
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={(e) => handleDrop(e, 'fileOwe')}  // Manejar el drop
                                        >
                                            <div className='w-full px-3 md:mb-0'>
                                                <label className='w-full px-3 py-2 font-zen-kaku font-semibold select-none'>
                                                    Certificado de no adeudo de la empresa
                                                </label>
                                            </div>
                                            <div className="mr-4 ml-5">
                                                <Upload size={26} color="#7FC3BB" />
                                            </div>
                                            <div className="mr-4">
                                                <p className="font-zen-kaku select-none">Arrastrar y soltar archivos o explorar</p>
                                            </div>
                                            {fileInputs.fileOwe && (
                                                <div className="text-green-500">
                                                    {fileInputs.fileOwe.name} seleccionado.
                                                </div>
                                            )}
                                            {/* Botón de subir archivos */}
                                            <input
                                                type="file"
                                                id="fileOwe"
                                                style={{ display: 'none' }}
                                                onChange={(e) => handleFileUpload(e, 'fileOwe')}
                                            />
                                            <label htmlFor="fileOwe" className="px-4 py-1 ml-auto text-[#7FC3BB] border border-[#7FC3BB] rounded-md font-zen-kaku font-semibold overflow-hidden transition-transform transform-gpu hover:scale-110 cursor-pointer">
                                                Subir
                                            </label>
                                        </div>
                                        <div className='border border-b-2 shadow-xl'></div>

                                        {/* Contrato laboral de proyecto */}
                                        <div
                                            className={`flex flex-wrap mb-3 ${dragActive ? 'border border-dashed border-teal-500' : ''}`}
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={(e) => handleDrop(e, 'fileContract')}  // Manejar el drop
                                        >
                                            <div className='w-full px-3 md:mb-0'>
                                                <label className='w-full px-3 py-2 font-zen-kaku font-semibold select-none'>
                                                    Contrato laboral de proyecto
                                                </label>
                                            </div>
                                            <div className="mr-4 ml-5">
                                                <Upload size={26} color="#7FC3BB" />
                                            </div>
                                            <div className="mr-4">
                                                <p className="font-zen-kaku select-none">Arrastrar y soltar archivos o explorar</p>
                                            </div>
                                            {fileInputs.fileContract && (
                                                <div className="text-green-500">
                                                    {fileInputs.fileContract.name} seleccionado.
                                                </div>
                                            )}
                                            {/* Botón de subir archivos */}
                                            <input
                                                type="file"
                                                id="fileContract"
                                                style={{ display: 'none' }}
                                                onChange={(e) => handleFileUpload(e, 'fileContract')}
                                            />
                                            <label htmlFor="fileContract" className="px-4 py-1 ml-auto text-[#7FC3BB] border border-[#7FC3BB] rounded-md font-zen-kaku font-semibold overflow-hidden transition-transform transform-gpu hover:scale-110 cursor-pointer">
                                                Subir
                                            </label>
                                        </div>
                                        <div className='border border-b-2 shadow-xl'></div>

                                        {/* Certificado del servicio de impuestos internos */}
                                        <div
                                            className={`flex flex-wrap mb-3 ${dragActive ? 'border border-dashed border-teal-500' : ''}`}
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={(e) => handleDrop(e, 'fileSii')}  // Manejar el drop
                                        >
                                            <div className='w-full px-3 md:mb-0'>
                                                <label className='w-full px-3 py-2 font-zen-kaku font-semibold select-none'>
                                                    Certificado del servicio de impuestos internos
                                                </label>
                                            </div>
                                            <div className="mr-4 ml-5">
                                                <Upload size={26} color="#7FC3BB" />
                                            </div>
                                            <div className="mr-4">
                                                <p className="font-zen-kaku select-none">Arrastrar y soltar archivos o explorar</p>
                                            </div>
                                            {fileInputs.fileSii && (
                                                <div className="text-green-500">
                                                    {fileInputs.fileSii.name} seleccionado.
                                                </div>
                                            )}
                                            {/* Botón de subir archivos */}
                                            <input
                                                type="file"
                                                id="fileSii"
                                                style={{ display: 'none' }}
                                                onChange={(e) => handleFileUpload(e, 'fileSii')}
                                            />
                                            <label htmlFor="fileSii" className="px-4 py-1 ml-auto text-[#7FC3BB] border border-[#7FC3BB] rounded-md font-zen-kaku font-semibold overflow-hidden transition-transform transform-gpu hover:scale-110 cursor-pointer">
                                                Subir
                                            </label>
                                        </div>
                                        <div className='border border-b-2 shadow-xl'></div>
                                    </>

                                    <div className='flex justify-center items-center mt-36'>
                                        <button className="font-zen text-gray-400 hover:text-gray-600 font-bold uppercase text-base px-6 py-3 rounded mr-1 mb-1 transition-all duration-150" type="submit" onClick={handleWorkPrevious}>
                                            Atras
                                        </button>
                                        <button
                                            className="bg-[#5C7891] hover:bg-[#5C7891] font-zen text-white active:bg-[#597387] font-bold uppercase text-base px-16 py-4 rounded-lg shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                            type="submit"
                                            onClick={nextdocstwo}
                                        >
                                            Guardar datos
                                        </button>
                                    </div>
                                </form>


                            )}
                            {step === 4 && (
                                <form className='mx-auto w-full p-6'>
                                    <>
                                        <div className='flex flex-wrap mb-3'>
                                            <div className='w-full px-3 mb-6 md:mb-0'>
                                                <label className='w-full px-3 py-2 font-zen-kaku text-base select-none'>
                                                    Solo admite archivos PDF, DOCX, IMG &gt; 30 MB
                                                </label>
                                            </div>
                                        </div>

                                        {/* Certificado de vigencia de la sociedad */}
                                        <div
                                            className={`flex flex-wrap mb-3 mt-32 ${dragActive ? 'border border-dashed border-teal-500' : ''}`}
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={(e) => handleDrop(e, 'fileSocietyValidity')}  // Manejar el drop
                                        >
                                            <div className='w-full px-3 md:mb-0'>
                                                <label className='w-full px-3 py-2 font-zen-kaku font-semibold select-none'>
                                                    Certificado de vigencia de la sociedad
                                                </label>
                                            </div>
                                            <div className="mr-4 ml-5">
                                                <Upload size={26} color="#7FC3BB" />
                                            </div>
                                            <div className="mr-4">
                                                <p className="font-zen-kaku select-none">Arrastrar y soltar archivos o explorar</p>
                                            </div>
                                            {fileInputs.fileSocietyValidity && (
                                                <div className="text-green-500">
                                                    {fileInputs.fileSocietyValidity.name} seleccionado.
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                id="fileSocietyValidity"
                                                name="fileSocietyValidity"
                                                style={{ display: 'none' }}
                                                onChange={(e) => handleFileUpload(e, 'fileSocietyValidity')}
                                            />
                                            <label htmlFor="fileSocietyValidity" className="px-4 py-1 ml-auto text-[#7FC3BB] border border-[#7FC3BB] rounded-md font-zen-kaku font-semibold overflow-hidden transition-transform transform-gpu hover:scale-110 cursor-pointer">
                                                Subir
                                            </label>
                                        </div>
                                        <div className='border border-b-2 shadow-xl'></div>

                                        {/* Póliza de seguro */}
                                        <div
                                            className={`flex flex-wrap mb-3 ${dragActive ? 'border border-dashed border-teal-500' : ''}`}
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={(e) => handleDrop(e, 'fileEnsurance')}  // Manejar el drop
                                        >
                                            <div className='w-full px-3 md:mb-0'>
                                                <label className='w-full px-3 py-2 font-zen-kaku font-semibold select-none'>
                                                    Póliza de seguro
                                                </label>
                                            </div>
                                            <div className="mr-4 ml-5">
                                                <Upload size={26} color="#7FC3BB" />
                                            </div>
                                            <div className="mr-4">
                                                <p className="font-zen-kaku select-none">Arrastrar y soltar archivos o explorar</p>
                                            </div>
                                            {fileInputs.fileEnsurance && (
                                                <div className="text-green-500">
                                                    {fileInputs.fileEnsurance.name} seleccionado.
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                id="fileEnsurance"
                                                name="fileEnsurance"
                                                style={{ display: 'none' }}
                                                onChange={(e) => handleFileUpload(e, 'fileEnsurance')}
                                            />
                                            <label htmlFor="fileEnsurance" className="px-4 py-1 ml-auto text-[#7FC3BB] border border-[#7FC3BB] rounded-md font-zen-kaku font-semibold overflow-hidden transition-transform transform-gpu hover:scale-110 cursor-pointer">
                                                Subir
                                            </label>
                                        </div>
                                        <div className='border border-b-2 shadow-xl'></div>

                                        {/* Bancarización */}
                                        <div
                                            className={`flex flex-wrap mb-3 ${dragActive ? 'border border-dashed border-teal-500' : ''}`}
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={(e) => handleDrop(e, 'fileBank')}  // Manejar el drop
                                        >
                                            <div className='w-full px-3 md:mb-0'>
                                                <label className='w-full px-3 py-2 font-zen-kaku font-semibold select-none'>
                                                    Bancarización
                                                </label>
                                            </div>
                                            <div className="mr-4 ml-5">
                                                <Upload size={26} color="#7FC3BB" />
                                            </div>
                                            <div className="mr-4">
                                                <p className="font-zen-kaku select-none">Arrastrar y soltar archivos o explorar</p>
                                            </div>
                                            {fileInputs.fileBank && (
                                                <div className="text-green-500">
                                                    {fileInputs.fileBank.name} seleccionado.
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                id="fileBank"
                                                name="fileBank"
                                                style={{ display: 'none' }}
                                                onChange={(e) => handleFileUpload(e, 'fileBank')}
                                            />
                                            <label htmlFor="fileBank" className="px-4 py-1 ml-auto text-[#7FC3BB] border border-[#7FC3BB] rounded-md font-zen-kaku font-semibold overflow-hidden transition-transform transform-gpu hover:scale-110 cursor-pointer">
                                                Subir
                                            </label>
                                        </div>
                                        <div className='border border-b-2 shadow-xl'></div>

                                        {/* Certificado de afiliación a salud */}
                                        <div
                                            className={`flex flex-wrap mb-3 ${dragActive ? 'border border-dashed border-teal-500' : ''}`}
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={(e) => handleDrop(e, 'fileHealth')}  // Manejar el drop
                                        >
                                            <div className='w-full px-3 md:mb-0'>
                                                <label className='w-full px-3 py-2 font-zen-kaku font-semibold select-none'>
                                                    Certificado de afiliación a salud
                                                </label>
                                            </div>
                                            <div className="mr-4 ml-5">
                                                <Upload size={26} color="#7FC3BB" />
                                            </div>
                                            <div className="mr-4">
                                                <p className="font-zen-kaku select-none">Arrastrar y soltar archivos o explorar</p>
                                            </div>
                                            {fileInputs.fileHealth && (
                                                <div className="text-green-500">
                                                    {fileInputs.fileHealth.name} seleccionado.
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                id="fileHealth"
                                                name="fileHealth"
                                                style={{ display: 'none' }}
                                                onChange={(e) => handleFileUpload(e, 'fileHealth')}
                                            />
                                            <label htmlFor="fileHealth" className="px-4 py-1 ml-auto text-[#7FC3BB] border border-[#7FC3BB] rounded-md font-zen-kaku font-semibold overflow-hidden transition-transform transform-gpu hover:scale-110 cursor-pointer">
                                                Subir
                                            </label>
                                        </div>
                                        <div className='border border-b-2 shadow-xl'></div>
                                    </>
                                    <div className='flex justify-center items-center mt-36'>
                                        <button className=" font-zen text-gray-400 hover:text-gray-600 font-bold uppercase text-base px-6 py-3 rounded mr-1 mb-1 transition-all duration-150" type="submit" onClick={backdocs1}>
                                            Atras
                                        </button>
                                        <Button type='button' onClick={onclickfinishform} icon="pi pi-check" label="Guardar datos" className='px-10 py-4 font-semibold text-black bg-teal-500 rounded-lg hover:bg-teal-600' />
                                        <ConfirmDialog
                                            visible={showConfirm}
                                            onHide={() => setShowConfirm(false)}
                                            message={
                                                <div>
                                                    <span>¿Desea crear su organización?</span>
                                                </div>
                                            }
                                            icon="pi pi-check custom-icon"
                                            accept={accept}
                                            reject={reject}
                                            closable={false}
                                            className="select-none"
                                            footer={
                                                <div className='flex justify-end gap-2'>
                                                    <button className="px-2 py-1 text-base text-white transition-all duration-150 ease-linear bg-[#5C7891] rounded-md font-zen-kaku hover:bg-[#7fa1c6]" onClick={reject}>
                                                        Rechazar
                                                    </button>
                                                    <button className="px-2 py-1 text-base text-white transition-all duration-150 ease-linear bg-[#5C7891] rounded-md font-zen-kaku hover:bg-[#7fa1c6]" onClick={accept}>
                                                        Aceptar
                                                    </button>
                                                </div>
                                            }
                                        />
                                    </div>
                                </form>



                            )}
                            {showUserCreated && (

                                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                                    <form className="bg-white w-auto mx-auto px-10 py-8 rounded-lg shadow-lg relative z-50">
                                        <>
                                            <div className='flex justify-center items-center mt-48 animate-spin-and-back'>
                                                <div className="relative w-32 h-32 rounded-full bg-[#D2E7E4] bg-opacity-80 border-[#D2E7E4] border-opacity-80 border-1 flex items-center justify-center shadow-xl z-10">
                                                    <Check size={60} color="#87ACA7" />
                                                </div>
                                                <div className='absolute'>
                                                    <svg width="172" height="172" viewBox="0 0 172 172" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M76.7808 3.96925C82.075 -0.60718 89.925 -0.60718 95.2192 3.96925V3.96925C98.9751 7.21594 104.162 8.24766 108.874 6.68544V6.68544C115.517 4.48338 122.769 7.48742 125.909 13.7415V13.7415C128.137 18.1784 132.534 21.1165 137.486 21.4766V21.4766C144.465 21.9841 150.016 27.5348 150.523 34.5144V34.5144C150.884 39.466 153.822 43.8632 158.259 46.0908V46.0908C164.513 49.2307 167.517 56.4831 165.315 63.1256V63.1256C163.752 67.8381 164.784 73.0249 168.031 76.7808V76.7808C172.607 82.075 172.607 89.925 168.031 95.2192V95.2192C164.784 98.9751 163.752 104.162 165.315 108.874V108.874C167.517 115.517 164.513 122.769 158.259 125.909V125.909C153.822 128.137 150.884 132.534 150.523 137.486V137.486C150.016 144.465 144.465 150.016 137.486 150.523V150.523C132.534 150.884 128.137 153.822 125.909 158.259V158.259C122.769 164.513 115.517 167.517 108.874 165.315V165.315C104.162 163.752 98.9751 164.784 95.2192 168.031V168.031C89.925 172.607 82.075 172.607 76.7808 168.031V168.031C73.0249 164.784 67.8381 163.752 63.1256 165.315V165.315C56.4831 167.517 49.2307 164.513 46.0908 158.259V158.259C43.8632 153.822 39.466 150.884 34.5144 150.523V150.523C27.5348 150.016 21.9841 144.465 21.4766 137.486V137.486C21.1165 132.534 18.1784 128.137 13.7415 125.909V125.909C7.48742 122.769 4.48338 115.517 6.68544 108.874V108.874C8.24766 104.162 7.21594 98.9751 3.96925 95.2192V95.2192C-0.60718 89.925 -0.60718 82.075 3.96925 76.7808V76.7808C7.21594 73.0249 8.24766 67.8381 6.68544 63.1256V63.1256C4.48338 56.4831 7.48742 49.2307 13.7415 46.0908V46.0908C18.1784 43.8632 21.1165 39.466 21.4766 34.5144V34.5144C21.9841 27.5348 27.5348 21.9841 34.5144 21.4766V21.4766C39.466 21.1165 43.8632 18.1784 46.0908 13.7415V13.7415C49.2307 7.48742 56.4831 4.48338 63.1256 6.68544V6.68544C67.8381 8.24766 73.0249 7.21594 76.7808 3.96925V3.96925Z" fill="#7FC3BB" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <div className='flex justify-center mt-16'>
                                                <h3 className="text-3xl font-semibold m-5 font-zen-kaku select-none ">
                                                    ¡Organización {organizationCreated} creada correctamente!
                                                </h3>
                                            </div>
                                            <div className='flex justify-center'>
                                                <h3 className="text-base m-5 font-zen-kaku select-none">
                                                    ¡Bienvenido a bordo!¡Comience su viaje hacia el éxito con Incon!
                                                </h3>
                                            </div>
                                        </>
                                        <div className='flex justify-center items-center mt-16'>
                                            <button
                                                className="bg-[#5c7891] text-white active:bg-[#597387] hover:opacity-75 font-bold uppercase text-base px-6 py-4 rounded-md shadow-xl outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 font-zen-kaku"
                                                onClick={handleRedirect}
                                            >
                                                Cerrar
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                        </div>

                    </>
                )}
            </div>


        </div>
    );
};

export default InternalorganizationDrawer;
