'use client';

import React, { useState, useEffect } from 'react';
import Select from 'react-select';

import { useRouter } from 'next/navigation';
import { Upload, ChevronRight, Eye, FileText, XCircle, BriefcaseBusiness } from 'lucide-react';
import { postOrganizationDoc, updateOrganization, postOrganizationProf, getPaises, getComunasPorRegion, getRegionesPorPais, getTipoEmpresa, getCodTelefono , getLocationByComuna} from '@/app/services/organizacion';
import Tooltip from '../../components/tooltip';
import Loader from '@/app/dashboard/components/loader';
import Image from 'next/image';
import {  toast } from 'react-hot-toast';
import { formatRut, cleanRut } from '@/app/utils/rut';

import {
    validateNombreEmpresa,
    validateRUT,
    validateDireccion,

    validateTelefono,
    validateCodigoTelefono,
    validateRepresentanteLegal,
    validateRUTRepresentanteLegal,
    validatePais,
    validateRegion,
    validateComuna,
    validateTipoEmpresa
} from '@/app/dashboard/components/validForm/valid_organizacion';

const documentosEsperados = [
    { codigo: 4, descripcion: 'Contrato laboral del proyecto', estado: '', archivo: 'Contrato_laboral_del_proyecto.pdf', fecha_vencimiento: '2024-05-31', carga: '1' },
    { codigo: 14, descripcion: 'Póliza de seguro', estado: '', archivo: 'poliza_seguro.pdf', fecha_vencimiento: '2024-12-31', carga: '1' },
    { codigo: 16, descripcion: 'Bancarización', estado: '', archivo: 'bancarizacion.pdf', fecha_vencimiento: '2024-12-31', carga: '1' },
    { codigo: 20, descripcion: 'Certificado de vigencia de la empresa', estado: '', archivo: 'vigencia_empresa.pdf', fecha_vencimiento: '2024-06-31', carga: '1' },
    { codigo: 21, descripcion: 'Certificado de vigencia de la sociedad', estado: '', archivo: 'vigencia_sociedad.pdf', fecha_vencimiento: '2024-06-31', carga: '1' },
    { codigo: 22, descripcion: 'Certificado de no adeudo de la empresa', estado: '', archivo: 'no_adeudo.pdf', fecha_vencimiento: '2024-05-31', carga: '1' },
    { codigo: 23, descripcion: 'Certificado de impuestos internos', estado: '', archivo: 'certificado_de_impuestos_internos.pdf', fecha_vencimiento: '2024-12-31', carga: '1' },
    { codigo: 24, descripcion: 'Certificado de afiliación a salud', estado: '', archivo: 'certificado_de_afiliacion_a_salud.pdf', fecha_vencimiento: '2024-12-31', carga: '1' },
];

const validarDocumentos = (docs) => {
    return documentosEsperados.map(docEsperado => {
        // Buscar el documento correspondiente en 'docs' basado en el código del tipo de documento
        const docEncontrado = docs.find(doc => doc.documentType?.id === docEsperado.codigo);

        return {
            ...docEsperado,
            estado: docEncontrado ? 'Pendiente Validación' : 'No existe', // Actualiza el estado según existencia
            archivo: docEncontrado ? docEncontrado.filenames : docEsperado.archivo,
            link: docEncontrado ? docEncontrado.link : null,
            file: docEncontrado ? null : undefined,
            carga: docEncontrado ? null : undefined
        };
    });
};



const UpdateOrganizationPage = ({ organizationData }) => {

    console.log(typeof organizationData); // Asegúrate de que organizationData sea un objeto
    console.log(organizationData);

    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState(1);
    const stepsTotal = 3;
    const stepTitles = ['Datos de la organización', 'Foto de perfil', 'Carga de documentos'];
    const [imagenPerfil, setImagenPerfil] = useState(null);
    const [uploadText, setUploadText] = useState('Subir foto');
    const [profileFile, setProfileFile] = useState(null);
    const [documentos, setDocumentos] = useState([]);
    const [initialFormData, setInitialFormData] = useState(null);
    const [initialDocuments, setInitialDocuments] = useState([]);
    const [errors, setErrors] = useState({});

    console.log(documentos);

    const [tipoEmpresaOptions, setTipoEmpresaOptions] = useState([]);
    const [codTelefonoOptions, setCodTelefonoOptions] = useState([]);
    const [paisOptions, setPaisOptions] = useState([]);
    const [regionOptions, setRegionOptions] = useState([]);
    const [comunaOptions, setComunaOptions] = useState([]);


    const validateForm = () => {
        const newErrors = {};
    
        newErrors.nombre = validateNombreEmpresa(formData.nombre);
        newErrors.rut = validateRUT(formData.rut);
        newErrors.direccion = validateDireccion(formData.direccion);

        newErrors.telefono = validateTelefono(formData.telefono);
        newErrors.id_codtelefono = validateCodigoTelefono(formData.id_codtelefono); // ajustado a `id_codtelefono`
        newErrors.representante_legal = validateRepresentanteLegal(formData.representante_legal);
        newErrors.rut_representante_legal = validateRUTRepresentanteLegal(formData.rut_representante_legal);
        newErrors.pais = validatePais(formData.pais); // ajustado a `formData.pais`
        newErrors.region = validateRegion(formData.region); // ajustado a `formData.region`
        newErrors.comuna = validateComuna(formData.comuna); // ajustado a `formData.comuna`
        newErrors.id_tipo_empresa = validateTipoEmpresa(formData.id_tipo_empresa); // ajustado a `id_tipo_empresa`
    
        setErrors(newErrors);
    
        // Retornar true si no hay errores, de lo contrario, false
        return Object.values(newErrors).every(error => error === '');
    };
    

    const [formData, setFormData] = useState({
        id: null,
        nombre: '',
        rut: '',
        direccion: '',
        telefono: '',
        id_codtelefono: null,
        representante_legal: '',
        rut_representante_legal: '',
        id_tipo_empresa: null,
        pais: null,
        region: null,
        comuna: null,
    });

    const fetchLocationData = async (comunaId) => {
        try {
            const locationData = await getLocationByComuna(comunaId);
            if (locationData) {
                const { id_pais, id_region, id_comuna } = locationData;

                setFormData((prevData) => ({
                    ...prevData,
                    pais: id_pais,
                    region: id_region,
                    comuna: id_comuna,
                }));

                const fetchedRegiones = await getRegionesPorPais(id_pais);
                setRegionOptions(fetchedRegiones.map((region) => ({
                    value: region.id,
                    label: region.nombre,
                })));

                const fetchedComunas = await getComunasPorRegion(id_region);
                setComunaOptions(fetchedComunas.map((comuna) => ({
                    value: comuna.id,
                    label: comuna.nombre,
                })));
            }
        } catch (error) {
            console.error('Error fetching location data:', error);
        }
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                if (organizationData) {
                    const initialData = {
                        id: organizationData.id,
                        nombre: organizationData.nombre || '',
                        rut: formatRut(organizationData.rut || ''),
                        direccion: organizationData.direccion || '',
                        telefono: organizationData.telefono || '',
                        id_codtelefono: organizationData.id_codtelefono || null,
                        representante_legal: organizationData.representante_legal || '',
                        rut_representante_legal: formatRut(organizationData.rut_representante_legal || ''),
                        id_tipo_empresa: organizationData.id_tipoempresa || null,
                        comuna: organizationData.id_comuna || null,
                    };
                    setFormData(initialData);
                    setInitialFormData(initialData);

                    if (organizationData.id_comuna) {
                        await fetchLocationData(organizationData.id_comuna);
                    }

                    if (organizationData.documents) {
                        const documentosValidados = validarDocumentos(organizationData.documents);
                        setDocumentos(documentosValidados);
                        setInitialDocuments(documentosValidados);
                    }

                    const fotoPerfilDoc = organizationData.documents.find(
                        (doc) => doc.documentType.name === "Foto de perfil organización"
                    );

                    if (fotoPerfilDoc && fotoPerfilDoc.link) {
                        setImagenPerfil(fotoPerfilDoc.link);
                    }
                }

                // Carga de opciones de selects iniciales
                const fetchedTipoEmpresa = await getTipoEmpresa();
                setTipoEmpresaOptions(fetchedTipoEmpresa.map((tipo) => ({ value: tipo.id, label: tipo.nombre })));

                const fetchedCodTelefono = await getCodTelefono();
                setCodTelefonoOptions(fetchedCodTelefono.map((codigo) => ({ value: codigo.id, label: codigo.cod_numero })));

                const fetchedPaises = await getPaises();
                setPaisOptions(fetchedPaises.map((pais) => ({ value: pais.id, label: pais.nombre })));

            } catch (error) {
                console.error('Error initializing data:', error);
            } finally {
                setIsLoading(false); // Oculta el loader cuando se completa la carga de datos
            }
        };

        fetchInitialData();
    }, [organizationData]);

    const hasFormChanged = () => {
        return (
            JSON.stringify(formData) !== JSON.stringify(initialFormData) ||
            profileFile ||
            documentos.some((doc, index) => doc.file || doc !== initialDocuments[index])
        );
    };



    console.log("organizationData.documents:", organizationData.documents);


    // Efecto para cargar opciones de selects
    useEffect(() => {
        const fetchOptions = async () => {
            const fetchedTipoEmpresa = await getTipoEmpresa();
            const tipos = Array.isArray(fetchedTipoEmpresa)
                ? fetchedTipoEmpresa
                : (fetchedTipoEmpresa && Array.isArray(fetchedTipoEmpresa.data) ? fetchedTipoEmpresa.data : []);
            setTipoEmpresaOptions(tipos.map(tipo => ({ value: tipo.id, label: tipo.nombre })));

            const fetchedCodTelefono = await getCodTelefono();
            const codigos = Array.isArray(fetchedCodTelefono)
                ? fetchedCodTelefono
                : (fetchedCodTelefono && Array.isArray(fetchedCodTelefono.data) ? fetchedCodTelefono.data : []);
            setCodTelefonoOptions(codigos.map(codigo => ({ value: codigo.id, label: codigo.cod_numero })));

            const fetchedPaises = await getPaises();
            const paises = Array.isArray(fetchedPaises)
                ? fetchedPaises
                : (fetchedPaises && Array.isArray(fetchedPaises.data) ? fetchedPaises.data : []);
            setPaisOptions(paises.map(pais => ({ value: pais.id, label: pais.nombre })));

            if (formData.pais) {
                const fetchedRegiones = await getRegionesPorPais(formData.pais);
                const regiones = Array.isArray(fetchedRegiones)
                    ? fetchedRegiones
                    : (fetchedRegiones && Array.isArray(fetchedRegiones.data) ? fetchedRegiones.data : []);
                setRegionOptions(regiones.map(region => ({ value: region.id, label: region.nombre })));
            }
            if (formData.region) {
                const fetchedComunas = await getComunasPorRegion(formData.region);
                const comunas = Array.isArray(fetchedComunas)
                    ? fetchedComunas
                    : (fetchedComunas && Array.isArray(fetchedComunas.data) ? fetchedComunas.data : []);
                setComunaOptions(comunas.map(comuna => ({ value: comuna.id, label: comuna.nombre })));
            }
        };
        fetchOptions();
    }, [formData.pais, formData.region]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Aplicar formateo a campos de RUT
        if (name === 'rut' || name === 'rut_representante_legal') {
            const clean = cleanRut(value);
            const formatted = formatRut(clean);
            setFormData((prevData) => ({
                ...prevData,
                [name]: formatted,
            }));
            return;
        }

        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSelectChange = (selectedOption, field) => {
        setFormData((prevData) => ({
            ...prevData,
            [field]: selectedOption ? selectedOption.value : null,
        }));
    };

    const handleCountryChange = async (selectedCountry) => {
        setFormData((prevData) => ({ ...prevData, pais: selectedCountry.value, region: null, comuna: null }));
        const fetchedRegiones = await getRegionesPorPais(selectedCountry.value);
        setRegionOptions(fetchedRegiones.map(region => ({ value: region.id, label: region.nombre })));
        setComunaOptions([]);
    };

    const handleRegionChange = async (selectedRegion) => {
        setFormData((prevData) => ({ ...prevData, region: selectedRegion.value, comuna: null }));
        const fetchedComunas = await getComunasPorRegion(selectedRegion.value);
        setComunaOptions(fetchedComunas.map(comuna => ({ value: comuna.id, label: comuna.nombre })));
        // No auto-seleccionar comuna; mantener nulo hasta elección explicita
    };

    const cancelorganization = () => {
        router.push('/dashboard/organization');
    };


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



    const handleStepChange = (newStep) => {
        // Realizar la validación en los pasos donde corresponde
        if (currentStep === 1 && !validateForm()) {
            toast.error('Por favor, corrija los errores antes de continuar.');
            return;  // Detener el cambio de paso si la validación falla
        }

        // Continuar solo si la validación es exitosa o si el paso no requiere validación
       
        setCurrentStep(newStep);
    };

    const getFechaVencimientoColor = (fechaVencimiento) => {
        const hoy = new Date();
        const fecha = new Date(fechaVencimiento);
        const diferenciaDias = (fecha - hoy) / (1000 * 60 * 60 * 24);

        if (diferenciaDias < 0) {
            return 'bg-red-500';
        } else if (diferenciaDias <= 30) {
            return 'bg-yellow-500';
        } else {
            return 'bg-green-500';
        }
    };


    const manejarCambioDocumento = (evento, codigo) => {
        const archivo = evento.target.files[0];
        if (archivo) {
            setDocumentos(prevDocs =>
                prevDocs.map(doc =>
                    doc.codigo === codigo ? { ...doc, file: archivo, carga: archivo.name } : doc
                )
            );
        }
    };

    const DocumentoRow = ({ doc }) => {
        const fechaVencimientoColor = getFechaVencimientoColor(doc.fecha_vencimiento);

        return (
            <tr className="border-t border-gray-200">
                <td className="px-4 py-2">{doc.codigo}</td>
                <td className="px-4 py-2">{doc.descripcion}</td>


                <td className="flex items-center justify-center px-4 py-2">
                    <div className="relative inline-block group">
                        <a href={doc.link} target="_blank" rel="noopener noreferrer">
                            <Tooltip text="Ver Actual">
                                <Eye className="w-5 h-5 mr-2 text-blue-500" />
                            </Tooltip>
                        </a>



                    </div>
                    <div className="relative inline-block group">
                        <label htmlFor={`upload-${doc.codigo}`} className="cursor-pointer">
                            <Tooltip text="Cargar un Documento">
                                <Upload className="w-5 h-5 text-gray-500" />
                            </Tooltip>
                        </label>



                    </div>
                    <input type="file" id={`upload-${doc.codigo}`} className="hidden" onChange={(e) => manejarCambioDocumento(e, doc.codigo)} />
                </td>



                <td className="px-4 py-2 text-center">
                    {doc.file ? (
                        <div className="relative inline-block group">
                            <Tooltip text={doc.file.name}>
                                <FileText className="w-5 h-5 mx-auto text-gray-500" />
                            </Tooltip>
                        </div>

                    ) : (
                        <div className="relative inline-block group">
                            <Tooltip text="No Cargado">
                                <XCircle className="w-5 h-5 mx-auto text-gray-500" />
                            </Tooltip>
                        </div>

                    )}
                </td>



                <td className="px-4 py-2 text-center">
                    <span >
                        <div className={`px-2 py-1 rounded-md text-white ${doc.estado === 'Aceptado' ? 'bg-green-500' : doc.estado === 'No existe' ? 'bg-red-600' : doc.estado === 'Rechazado' ? 'bg-red-500' : 'bg-yellow-500'}`}>
                            {doc.estado}
                        </div>
                    </span>
                </td>
                <td className="px-4 py-2 text-center">
                    <span className={`px-2 py-1 rounded-full text-white ${fechaVencimientoColor}`}>
                        {doc.fecha_vencimiento}
                    </span>
                </td>
            </tr>
        );
    };


    const handleSubmit = async (e) => {

        if (!hasFormChanged()) {
            console.log('No hay cambios en el formulario.');

            router.push('/dashboard/organization');
            return;
        }

        e.preventDefault();

        if (!validateForm()) {
            toast.error("Por favor, corrija los errores antes de enviar.");
            return;
        }


        setIsLoading(true);

        console.log(isLoading);
        // Construir `organizationData` con comprobación previa de ID
        if (!formData.id) {
            console.error('El ID de la organización es obligatorio.');
            setIsLoading(false);
            return;
        }

        const organizationData = {
            id: formData.id,
            nombre: formData.nombre,
            rut: formData.rut,
            direccion: formData.direccion,
            telefono: formData.telefono,
            id_codtelefono: formData.id_codtelefono,
            representante_legal: formData.representante_legal,
            rut_representante_legal: formData.rut_representante_legal,
            id_tipoempresa: formData.id_tipo_empresa,
            id_comuna: formData.comuna,
        };

        try {
            // Subir foto de perfil si existe `profileFile`
            if (profileFile) {
                setIsLoading(true);
                const fileExtension = profileFile.name.split('.').pop();
                const formDataForProfile = new FormData();
                formDataForProfile.append('file', profileFile);
                formDataForProfile.append('document_type', 'Foto de perfil organización');
                formDataForProfile.append('organizationId', organizationData.id); // Asegurarse de que se incluya el ID
                formDataForProfile.append('filesize', profileFile.size); // Tamaño del archivo
                formDataForProfile.append('fileExtension', fileExtension); // Extensión del archivo
                await postOrganizationProf(formDataForProfile);
            }

            // Subir documentos adicionales si existen
            for (const doc of documentos) {
                if (doc.file) {
                    setIsLoading(true);
                    const fileExtension = doc.file.name.split('.').pop();
                    const formDataDoc = new FormData();
                    formDataDoc.append('file', doc.file);
                    formDataDoc.append('document_type', doc.descripcion);
                    formDataDoc.append('organizationId', organizationData.id); // Asegurarse de que se incluya el ID
                    formDataDoc.append('filesize', doc.file.size); // Tamaño del archivo
                    formDataDoc.append('fileExtension', fileExtension); // Extensión del archivo
                    await postOrganizationDoc(formDataDoc);
                }
            }

            // Llamar al servicio de actualización
            const response = await updateOrganization(organizationData.id, organizationData);

            if (response) {
                toast.success('Actualización exitosa.');
                router.push('/dashboard/organization');

            } else {
                console.error('Error en la actualización de la organización');
                setIsLoading(false);
                toast.error('Error en la actualización de la organización');
            }
        } catch (error) {
            console.error('Error en la actualización de la organización:', error);
            toast.error('Error en la actualización de la organización');
        } finally {
  
        }
    };


    return (
        <div className="z-50 flex flex-col w-full h-screen overflow-x-hidden">
            {isLoading ? (
                <Loader />
            ) : (

                <div className="flex-grow justify-center items-center font-zen-kaku bg-[#FAFAFA] p-4 select-none overflow-x-hidden">


                    <div className="grid items-center grid-cols-1 md:grid-cols-3 gap-4 mb-10 font-zen-kaku">
                        <label
                            htmlFor="filtroSelect"
                            className="col-span-1 ml-4 text-base font-bold text-black select-none font-zen-kaku"
                        >
                            <span> | Actualizar Organización |</span>
                            <div className="text-sm font-normal text-gray-700">Nombre empresa: {organizationData.nombre}</div>
                        </label>

                    </div>
                    {/* Contenedor Principal en Flex */}
                    <div className='mx-auto bg-white shadow-lg rounded-xl flex flex-col lg:flex-row gap-2 w-full lg:w-full'>

                        {/* Progress Bar que se adapta en mobile */}
                        <div className='flex flex-wrap lg:flex-col w-full h-full lg:w-1/4 items-center lg:items-start p-4 sm:p-6'>
                            {[...Array(stepsTotal)].map((_, index) => (
                                <div key={index} className="flex flex-row items-center mb-3 lg:mb-4 mr-3">
                                    {/* Número del paso */}
                                    <span
                                        className={`font-zen-kaku rounded-full h-10 w-10 flex justify-center items-center cursor-pointer transition-transform hover:scale-110 ease-linear 
                                    ${currentStep > index + 1
                                                ? 'bg-[#5C7891] text-white' // Paso completado
                                                : currentStep === index + 1
                                                    ? 'bg-[#5C7891] text-white ring-1 ring-[#597387] border-white border-4' // Paso activo
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

                        {!isLoading && currentStep === 1 && (
                         <form className="z-50 h-auto p-4 mx-auto font-zen-kaku w-full">
                         <>
                             <div className="flex flex-wrap mb-6 mt-6">
                                 <div className="w-full px-3">
                                     <label className="text-sm font-bold font-zen-kaku">Nombre de empresa</label>
                                     <input
                                         className="w-full px-3 py-2 border rounded font-zen-kaku"
                                         id="grid-first-name"
                                         type="text"
                                         placeholder="Nombre de empresa"
                                         aria-label="Campo de ingreso nombre de empresa"
                                         name="nombre"
                                         onChange={handleInputChange}
                                         value={formData.nombre}
                                     />
                                     {errors.nombre && <p className="text-red-500 text-sm">{errors.nombre}</p>}
                                 </div>
                             </div>
                     
                             <div className="flex flex-wrap mb-6">
                                 <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                                     <label className="text-sm font-bold font-zen-kaku">RUT de la empresa</label>
                                     <input
                                         className="w-full px-3 py-2 border rounded font-zen-kaku"
                                         type="text"
                                         placeholder="RUT de la empresa"
                                         aria-label="Campo de ingreso rut de la empresa"
                                         name="rut"
                                         onChange={handleInputChange}
                                         value={formData.rut}
                                     />
                                     {errors.rut && <p className="text-red-500 text-sm">{errors.rut}</p>}
                                 </div>
                                 <div className="w-full md:w-1/2 px-3">
                                     <label className="text-sm font-bold font-zen-kaku">Celular</label>
                                     <div className="flex gap-2">
                                         <div className="w-1/3">
                                             <Select
                                                 className="basic-single"
                                                 classNamePrefix="select"
                                                 isSearchable={true}
                                                 name="cod_telefono"
                                                 aria-label="Campo seleccionable de codigo de celular"
                                                 placeholder="Código"
                                                 options={codTelefonoOptions}
                                                 value={codTelefonoOptions.find(option => option.value === formData.id_codtelefono)}
                                                 onChange={(option) => handleSelectChange(option, "id_codtelefono")}
                                                 menuPlacement="auto"
                                                 menuPosition="fixed"
                                             />
                                             {errors.codigoArea && <p className="text-red-500 text-sm">{errors.codigoArea}</p>}
                                         </div>
                                         <div className="w-2/3">
                                             <input
                                                 className="w-full px-3 py-2 border rounded font-zen-kaku"
                                                 type="text"
                                                 placeholder="Número de celular"
                                                 name="telefono"
                                                 aria-label="Campo de ingreso numero de celular"
                                                 onChange={handleInputChange}
                                                 value={formData.telefono}
                                             />
                                             {errors.telefono && <p className="text-red-500 text-sm">{errors.telefono}</p>}
                                         </div>
                                     </div>
                                 </div>
                             </div>
                     
                             <div className="flex flex-wrap mb-6">
                                 <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                                     <label className="text-sm font-bold font-zen-kaku">Dirección</label>
                                     <input
                                         className="w-full px-3 py-2 border rounded font-zen-kaku"
                                         type="text"
                                         placeholder="Dirección"
                                         aria-label="Campo de ingreso direccion"
                                         name="direccion"
                                         onChange={handleInputChange}
                                         value={formData.direccion}
                                     />
                                     {errors.direccion && <p className="text-red-500 text-sm">{errors.direccion}</p>}
                                 </div>
                             </div>
                     
                             <div className="flex flex-wrap mb-6">
                                 <div className="w-full md:w-1/3 px-3 mb-6 md:mb-0">
                                     <label className="text-sm font-bold font-zen-kaku">País</label>
                                     <Select
                                         className="basic-single"
                                         classNamePrefix="select"
                                         isSearchable={true}
                                         name="pais"
                                         placeholder="Selecciona país"
                                         aria-label="Campo seleccionable de país"
                                         options={paisOptions}
                                         value={paisOptions.find(option => option.value === formData.pais)}
                                         onChange={handleCountryChange}
                                     />
                                     {errors.pais && <p className="text-red-500 text-sm">{errors.pais}</p>}
                                 </div>
                     
                                 <div className="w-full md:w-1/3 px-3">
                                     <label className="text-sm font-bold font-zen-kaku">Región</label>
                                     <Select
                                         className="basic-single"
                                         classNamePrefix="select"
                                         isSearchable={true}
                                         name="region"
                                         placeholder="Selecciona región"
                                         aria-label="Campo seleccionable de region"
                                         options={regionOptions}
                                         value={regionOptions.find(option => option.value === formData.region)}
                                         onChange={handleRegionChange}
                                         isDisabled={!formData.pais}
                                     />
                                     {errors.region && <p className="text-red-500 text-sm">{errors.region}</p>}
                                 </div>
                     
                                 <div className="w-full md:w-1/3 px-3">
                                     <label className="text-sm font-bold font-zen-kaku">Comuna</label>
                                     <Select
                                         className="basic-single"
                                         classNamePrefix="select"
                                         isSearchable={true}
                                         name="id_comuna"
                                         placeholder="Selecciona comuna"
                                         aria-label="Campo seleccionable de comuna"
                                         options={comunaOptions}
                                         value={comunaOptions.find(option => option.value === formData.comuna)}
                                         onChange={(option) => handleSelectChange(option, "comuna")}
                                         isDisabled={!formData.region}
                                     />
                                     {errors.comuna && <p className="text-red-500 text-sm">{errors.comuna}</p>}
                                 </div>
                             </div>
                     
                             <div className="flex flex-wrap mb-6">
                                 <div className="w-full px-3 mb-6 md:mb-0">
                                     <label className="text-sm font-bold font-zen-kaku">Nombre responsable o representante legal</label>
                                     <input
                                         className="w-full px-3 py-2 border rounded font-zen-kaku"
                                         type="text"
                                         placeholder="Nombre responsable o representante legal"
                                         aria-label="Campo de ingreso responsable o representante legal"
                                         name="representante_legal"
                                         onChange={handleInputChange}
                                         value={formData.representante_legal}
                                     />
                                     {errors.representante_legal && <p className="text-red-500 text-sm">{errors.representante_legal}</p>}
                                 </div>
                             </div>
                     
                             <div className="flex flex-wrap mb-6">
                                 <div className="w-full px-3 mb-6 md:mb-0">
                                     <label className="text-sm font-bold font-zen-kaku">Rut responsable o representante legal</label>
                                     <input
                                         className="w-full px-3 py-2 border rounded font-zen-kaku"
                                         type="text"
                                         placeholder="Rut responsable o representante legal"
                                         name="rut_representante_legal"
                                         onChange={handleInputChange}
                                         value={formData.rut_representante_legal}
                                     />
                                     {errors.rut_representante_legal && <p className="text-red-500 text-sm">{errors.rut_representante_legal}</p>}
                                 </div>
                             </div>
                     
                             <div className="flex flex-wrap mb-6">
                                 <div className="w-full px-3">
                                     <Select
                                         className="basic-single"
                                         classNamePrefix="select"
                                         isSearchable={true}
                                         name="tipo_empresa"
                                         placeholder="Selecciona tipo de empresa"
                                         aria-label="Campo seleccionable para tipo de empresa"
                                         options={tipoEmpresaOptions}
                                         value={tipoEmpresaOptions.find(option => option.value === formData.id_tipo_empresa)}
                                         onChange={(option) => handleSelectChange(option, "id_tipo_empresa")}
                                         menuPlacement="auto"
                                         menuPosition="fixed"
                                     />
                                     {errors.tipo_empresa && <p className="text-red-500 text-sm">{errors.tipo_empresa}</p>}
                                 </div>
                             </div>
                     
                             <div className="flex justify-center items-center mt-10">
                                 <button type="button" onClick={() => cancelorganization()} className="text-gray-400 hover:text-gray-600 font-bold uppercase text-base px-6 py-3 rounded mr-1 mb-1 transition-all duration-150 font-zen-kaku">
                                     Cancelar
                                 </button>
                                 <button type="button" onClick={() => handleStepChange(currentStep + 1)} className="bg-[#5C7891] text-white font-bold uppercase text-base px-10 py-4 rounded-lg shadow hover:shadow-lg outline-none focus:outline-none transition-all duration-150 font-zen-kaku hover:opacity-75">
                                     Guardar datos
                                 </button>
                             </div>
                         </>
                     </form>
                     
                        )}



                        {!isLoading && currentStep === 2 && (
                            <form className='mx-auto p-4 w-full flex flex-col pr-20'>
                                <>
                                    <div className='flex flex-wrap mb-6'>
                                        <div className='w-full px-3 mb-6 md:mb-0'>
                                            <label className='font-zen-kaku flex justify-center mt-24 select-none'>Agregar foto de perfil</label>
                                        </div>
                                    </div>
                                    <div className='flex justify-center mb-3'>
                                        <div className="relative w-48 h-48 rounded-full bg-[#5C7891] bg-opacity-80 border-[#597387] border-4 flex items-center justify-center overflow-hidden transition-transform transform-gpu hover:scale-110">
                                            {imagenPerfil ? (
                                                <Image src={imagenPerfil} alt="Foto de perfil" layout='fill' objectFit='cover' />
                                            ) : (
                                                <BriefcaseBusiness size={80} color="#87ACA7" />
                                            )}
                                        </div>
                                    </div>


                                    <div className='flex flex-wrap mb-3 mt-14'>
                                        <div className='w-full  px-3 md:mb-0'>
                                            <label htmlFor="fileUpload" className="flex items-center justify-center px-4 py-3 border border-[#597387] rounded-lg cursor-pointer font-zen-kaku text-sm hover:shadow-lg select-none hover:border-teal-800 ease-linear transition-all duration-150">
                                                <Upload color="#fffff" className="mr-2 h-5 w-5" />
                                                {uploadText}
                                            </label>
                                            <input type="file" id="fileUpload" className='hidden' onChange={manejarCambioImagen} />
                                        </div>
                                    </div>
                                </>
                                <div className="flex justify-center items-center mt-10">
                                    <button type="button" onClick={() => handleStepChange(currentStep - 1)} className="text-gray-400 hover:text-gray-600 font-bold uppercase text-base px-6 py-3 rounded mr-1 mb-1 transition-all duration-150 font-zen-kaku">
                                        Atrás
                                    </button>
                                    <button type="button" onClick={() => handleStepChange(currentStep + 1)} className="bg-[#5C7891] text-white font-bold uppercase text-base px-10 py-4 rounded-lg shadow hover:shadow-lg outline-none focus:outline-none transition-all duration-150 font-zen-kaku hover:opacity-75">
                                        Guardar datos
                                    </button>
                                </div>
                            </form>
                        )}
                        {!isLoading && currentStep === 3 && (
                            <div className="z-50 h-auto p-0 md:p-10 mx-auto bg-white rounded-lg w-11/12 font-zen-kaku">

                                <div className="overflow-x-auto">
                                    <table className="min-w-full bg-white">
                                        <thead>
                                            <tr className="w-full text-sm leading-normal text-gray-600 uppercase bg-gray-200">
                                                <th className="px-6 py-3 text-left">CÓDIGO</th>
                                                <th className="px-6 py-3 text-left">DESCRIPCIÓN</th>
                                                <th className="px-6 py-3 text-center">ACCIONES</th>
                                                <th className="px-6 py-3 text-center">CARGA</th>
                                                <th className="px-6 py-3 text-center">ESTADO</th>
                                                <th className="px-6 py-3 text-center">FECHA DE VENCIMIENTO</th>

                                            </tr>
                                        </thead>
                                        <tbody className="text-sm font-light text-gray-600">
                                            {documentos.map((doc) => (
                                                <DocumentoRow key={doc.codigo} doc={doc} />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="flex justify-center items-center mt-10">
                                    <button type="button" onClick={() => handleStepChange(currentStep - 1)} className="text-gray-400 hover:text-gray-600 font-bold uppercase text-base px-6 py-3 rounded mr-1 mb-1 transition-all duration-150 font-zen-kaku">
                                        Atrás
                                    </button>
                                    <button type="button" onClick={handleSubmit} className="bg-[#5C7891] text-white font-bold uppercase text-base px-10 py-4 rounded-lg shadow hover:shadow-lg outline-none focus:outline-none transition-all duration-150 font-zen-kaku hover:opacity-75">
                                        Guardar datos
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                </div>

            )}




        </div>


    );
};

export default UpdateOrganizationPage;
