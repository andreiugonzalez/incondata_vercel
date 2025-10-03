'use client';

import { useState, useEffect , useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    updateUser, getPaises, getRegionesPorPais, getComunasPorRegion, getAfp, getSalud, getEstado_civil,
    getCodTelefono, getOrganizacion, getRelacion, getPuesto, getGrupo, postUserProf, postUserDoc, getLocationByComuna
} from '@/app/services/user';

import { Upload, ChevronRight, Eye, FileText, XCircle } from 'lucide-react';

import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import es from 'date-fns/locale/es';
import '../style/datepicker_new.css';
import Loader from './loader';
import { genOptions } from "./data_option";
import Tooltip from '../../components/tooltip';
import "../style/media_query.css";

import PasswordChangeModal from '@/app/components/ramdon_pwd_user';

const documentosEsperados = [
    { codigo: 21, descripcion: 'Certificado de vigencia de la empresa', estado: '', archivo: 'vigencia_empresa.pdf', fecha_vencimiento: '2024-06-31', carga: '1' },
    { codigo: 22, descripcion: 'Certificado de vigencia de la sociedad', estado: '', archivo: 'vigencia_sociedad.pdf', fecha_vencimiento: '2024-06-31', carga: '1' },
    { codigo: 23, descripcion: 'Certificado de no adeudo de la empresa', estado: '', archivo: 'no_adeudo.pdf', fecha_vencimiento: '2024-05-31', carga: '1' },
    { codigo: 15, descripcion: 'Poliza de seguro', estado: '', archivo: 'poliza_seguro.pdf', fecha_vencimiento: '2024-12-31' },
    { codigo: 2, descripcion: 'Contrato laboral del proyecto', estado: '', archivo: 'Contrato_laboral_del_proyecto.pdf', fecha_vencimiento: '2024-05-31', carga: '1' },
    { codigo: 17, descripcion: 'Bancarización', estado: '', archivo: 'bancarizacion.pdf', fecha_vencimiento: '2024-12-31' },
    { codigo: 24, descripcion: 'Certificado de impuestos internos', estado: '', archivo: 'certificado_de_impuestos_internos.pdf', fecha_vencimiento: '2024-12-31', carga: '1' },
    { codigo: 25, descripcion: 'Certificado de afiliación a salud', estado: ' ', archivo: 'certificado_de_afiliacion_a_salud.pdf', fecha_vencimiento: '2024-12-31', carga: '1' },
];

const validarDocumentos = (docs) => {
    const docsActualizados = documentosEsperados.map(docEsperado => {
        const docEncontrado = docs.find(doc => doc.documentTypeId === docEsperado.codigo);
        return {
            ...docEsperado,
            estado: docEncontrado ? 'Pendiente Validación' : 'No existe',
            archivo: docEncontrado ? docEncontrado.link.split('/').pop() : docEsperado.archivo,
            link: docEncontrado ? docEncontrado.link : null,
            file: docEncontrado ? null : undefined,
            carga: docEncontrado ? null : undefined, // Añade un campo file inicializado como undefined
        };
    });
    return docsActualizados;
};

const UpdateUserPage = ({ userData }) => {

    console.log(userData);
    const [isLoading, setIsLoading] = useState(true); // Estado de carga

    const router = useRouter();
    const [formData, setFormData] = useState({});
    const [formWorkData, setFormWorkData] = useState({});
    const [fechaNacimiento, setFechaNacimiento] = useState(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [documentos, setDocumentos] = useState([]);

    const [paisOptions, setPaisOptions] = useState([]);
    const [regionOptions, setRegionOptions] = useState([]);
    const [comunaOptions, setComunaOptions] = useState([]);
    const [afpOptions, setAfpOptions] = useState([]);
    const [saludOptions, setSaludOptions] = useState([]);
    const [estadoCivilOptions, setEstadoCivilOptions] = useState([]);
    const [codigoAreaOptions, setCodigoAreaOptions] = useState([]);
    const [puestosOptions, setPuestosOptions] = useState([]);
    const [gruposOptions, setGruposOptions] = useState([]);

    const [organizacionOptions, setOrganizacionOptions] = useState([]);
    const [relacionesOptions, setRelacionesOptions] = useState([]);

    const [imagenPerfil, setImagenPerfil] = useState(null);
    const [imagenPerfilURL, setImagenPerfilURL] = useState(null);
    const [uploadText, setUploadText] = useState('Subir foto');
    const [profileFile, setProfileFile] = useState(null);
    const [fileName, setFileName] = useState('');

    const stepsTotal = 3;
    const stepTitles = ['Datos personales', 'Datos laborales', 'Carga de documentos'];

    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isPasswordChanged, setIsPasswordChanged] = useState(false);

    const [comunaData, setComunaData] = useState({});

    const handlePasswordChange = (newPassword, confirmPassword, isTemporary) => {
        if (newPassword !== confirmPassword) {
            alert('Las contraseñas no coinciden');
            return;
        }

        const today = new Date();
        const expirationDate = new Date(today);
        expirationDate.setHours(23, 59, 59, 999);

        setFormData((prevState) => ({
            ...prevState,
            hashedPassword: newPassword,
            isTemporaryPassword: isTemporary,
            passwordExpirationDate: expirationDate
        }));
        setIsPasswordChanged(true);
        setIsPasswordModalOpen(false);
    };


    const fetchLocationData = useCallback(async (comunaId) => {
        setIsLoading(true);
        try {
            const locationData = await getLocationByComuna(comunaId);
            if (locationData) {
                const { id_pais, id_region } = locationData;
                setFormData((prevData) => ({
                    ...prevData,
                    pais: id_pais,
                    region: id_region,
                    ID_comuna: comunaId,
                }));
                fetchRegiones(id_pais); // Cargar opciones de región para el país
                fetchComunas(id_region); // Cargar opciones de comuna para la región
            }
        } catch (error) {
            console.error('Error fetching location data:', error);
        } finally {
            // setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const initializeData = async () => {
            setIsLoading(true);
            try {
                if (userData) {
                    setFormData({
                        ...userData,
                        fecha_de_nacimiento: new Date(userData.fecha_de_nacimiento),
                    });
                    setFormWorkData({
                        id_salud: userData.id_salud,
                        id_afp: userData.id_afp,
                        codigo_area_emergencia: userData.emergencia_user[0]?.cod_telefono || null,
                        telefono_emergencia: userData.emergencia_user[0]?.telefono || '',
                        id_relacion_emergencia: userData.emergencia_user[0]?.id_relacion || null,
                        nombre_emergencia: userData.emergencia_user[0]?.nombre_contacto || '',
                        correo_emergencia: userData.emergencia_user[0]?.correo || '',
                        id_puesto: userData.id_puesto,
                        id_grupo: userData.id_grupo,
                        organizacionid: userData.organizacionid,
                    });
                    setFechaNacimiento(new Date(userData.fecha_de_nacimiento));
                    const documentosValidados = validarDocumentos(userData.documents);
                    setDocumentos(documentosValidados);
                }
    
                await fetchLocationData(userData.ID_comuna);
                await fetchOptions();
            } catch (error) {
                console.error("Error initializing data:", error);
            } finally {
                setIsLoading(false); // Finaliza la carga sin importar si hubo errores
            }
        };
    
        initializeData();
    }, [userData, fetchLocationData]);
    


    const fetchOptions = async () => {
        try {
            const [paises, afp, salud, estadosCiviles, codigosTelefono, organizaciones, relaciones, id_puesto, id_grupo] = await Promise.all([
                getPaises(),
                getAfp(),
                getSalud(),
                getEstado_civil(),
                getCodTelefono(),
                getOrganizacion(),
                getRelacion(),
                getPuesto(),
                getGrupo(),
            ]);

            setPaisOptions(paises.map(pais => ({ value: pais.id, label: pais.nombre })));
            setAfpOptions(afp.map(item => ({ value: item.id, label: item.nombre })));
            setSaludOptions(salud.map(item => ({ value: item.id, label: item.nombre })));
            setEstadoCivilOptions(estadosCiviles.map(item => ({ value: item.id_estado_civil, label: item.nombre_estado_civil })));
            setCodigoAreaOptions(codigosTelefono.map(item => ({ value: item.id, label: item.cod_numero })));

            setOrganizacionOptions(organizaciones.map(item => ({ value: item.id, label: item.nombre })));
            setRelacionesOptions(relaciones.map(item => ({ value: item.id_relacion, label: item.nombre })));
            setPuestosOptions(id_puesto.map(item => ({ value: item.id, label: item.nombre })));
            setGruposOptions(id_grupo.map(item => ({ value: item.id, label: item.nombre })));
        } catch (error) {
            console.error('Error fetching options:', error);
        }
    };

    const fetchRegiones = async (paisId) => {
        try {
            const regiones = await getRegionesPorPais(paisId);
            setRegionOptions(regiones.map(region => ({ value: region.id, label: region.nombre })));
        } catch (error) {
            console.error('Error fetching regiones:', error);
        }
    };

  const fetchComunas = async (regionId) => {
    try {
      const comunas = await getComunasPorRegion(regionId);
      setComunaOptions(comunas.map(comuna => ({ value: comuna.id, label: comuna.nombre })));
      // No auto-seleccionar comuna; dejar al usuario elegir
    } catch (error) {
      console.error('Error fetching comunas:', error);
    }
  };

    const handleInput = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleWorkInput = (e) => {
        const { name, value } = e.target;
        setFormWorkData((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSelect = (selectedOption, { name }) => {
        setFormData((prevState) => ({
            ...prevState,
            [name]: selectedOption.value
        }));
    };

    const handleWorkSelect = (selectedOption, { name }) => {
        setFormWorkData((prevState) => ({
            ...prevState,
            [name]: selectedOption.value
        }));
    };

    const handleDateChange = (date) => {
        setFechaNacimiento(date);
        setFormData((prevState) => ({
            ...prevState,
            fecha_de_nacimiento: date
        }));
    };

    const handleStepChange = (newStep) => {
        setCurrentStep(newStep);
    };

    const manejarCambioImagen = async (evento) => {
        const archivo = evento.target.files[0];
        if (archivo && archivo.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagenPerfil(reader.result);
            };
            reader.readAsDataURL(archivo);
            setUploadText('Cambiar foto');
            setProfileFile(archivo);
            setFileName(archivo.name);
        } else {
            console.error('El archivo seleccionado no es una imagen');
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true); // Empieza a cargar
        setCurrentStep(0); // Cambiar el paso a 0 mientras carga
        try {
            const updatedData = {
                ...formData,
                ...formWorkData,
                fecha_de_nacimiento: formData.fecha_de_nacimiento.toISOString().split('T')[0],
                emergencia_user: [{
                    cod_telefono: formWorkData.codigo_area_emergencia,
                    telefono: formWorkData.telefono_emergencia,
                    id_relacion: formWorkData.id_relacion_emergencia,
                    nombre_contacto: formWorkData.nombre_emergencia,
                    correo: formWorkData.correo_emergencia,


                }],
                hashedPassword: "", // Estos campos no deben estar aquí
                isTemporaryPassword: false, // Estos campos no deben estar aquí
                passwordExpirationDate: "" // Estos campos no deben estar aquí
            };
            console.log(isPasswordChanged);
            // Solo agregar los datos de la contraseña si isPasswordChanged es true
            if (isPasswordChanged) {
                updatedData.hashedPassword = formData.hashedPassword;
                updatedData.isTemporaryPassword = formData.isTemporaryPassword;
                updatedData.passwordExpirationDate = formData.passwordExpirationDate;

                console.log("Password Changed:");
                console.log("hashedPassword:", formData.hashedPassword);
                console.log("isTemporaryPassword:", formData.isTemporaryPassword);
                console.log("passwordExpirationDate:", formData.passwordExpirationDate);
            } else {
                //console.log para depurar cuando no cambia la contraseña
                console.log("Password Not Changed");
            }

            console.log('Datos enviados:', updatedData);


            // Si hay un archivo de perfil, subirlo
            if (profileFile) {
                const formDataForImage = new FormData();
                formDataForImage.append('file', profileFile);
                formDataForImage.append('userEmail', formData.email); // Asegúrate de que 'formData.email' contiene el correo correcto
                formDataForImage.append('document_type', 'Foto de perfil usuario');

                console.log('Uploading profile image:', formDataForImage.get('file'));

                try {
                    const imageUploadResponse = await postUserProf(formDataForImage);
                    console.log('Image upload response:', imageUploadResponse);
                } catch (uploadError) {
                    console.error('Error uploading image:', uploadError);
                    throw new Error('Error uploading image');
                }
            }

            console.log('Datos enviados:', updatedData);

            const response = await updateUser(userData.id, updatedData);

            if (response) {
                // Subir documentos esperados
                for (const doc of documentos) {
                    if (doc.file) {
                        const formDataDoc = new FormData();
                        formDataDoc.append('file', doc.file);
                        formDataDoc.append('userEmail', formData.email);
                        formDataDoc.append('document_type', doc.descripcion); // Asegúrate de que 'descripcion' contiene el tipo de documento correcto

                        console.log('Uploading document:', formDataDoc.get('file'));

                        try {
                            const docUploadResponse = await postUserDoc(formDataDoc);
                            console.log('Document upload response:', docUploadResponse);
                        } catch (uploadError) {
                            console.error('Error uploading document:', uploadError);
                            throw new Error('Error uploading document');
                        }
                    }
                }


            } else {
                console.error('Error updating user: No response from server');
            }
        } catch (error) {
            console.error('Error updating user:', error);
        } finally {
            setIsLoading(false); // Finaliza la carga
            router.push('/dashboard/users');
        }
    };







    const removeFile = () => {
        setFileName('');
        setProfileFile(null);
        setUploadText('Subir foto');
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

    return (

        <div className="z-50 flex flex-col w-full h-screen overflow-x-hidden">

            {isLoading ? (
                <Loader />
            ) : (

                <div className="flex-grow justify-center items-center font-zen-kaku bg-[#FAFAFA] p-4 select-none overflow-x-hidden">
                    <div className="grid items-center grid-cols-3 gap-4 mb-10 font-zen-kaku">
                        <label htmlFor="filtroSelect" className="mx-auto text-3xl font-extrabold text-gray-800 select-none font-zen-kaku text-center">
                            | Actualizar usuario |
                        </label>
                    </div>
                    <div className='mx-auto overflow-x-hidden bg-white shadow-lg rounded-xl' style={{ marginTop: '-30px' }}>

                        <div className={`flex flex-col items-start ml-4 mt-8 top-12 z-50 w-auto custom-progress ${currentStep >= stepsTotal ? '' : ''}`}>
                            {[...Array(stepsTotal)].map((_, index) => (
                                <div key={index} className="flex flex-row items-center mb-4">
                                    <span
                                        className={`font-zen-kaku rounded-full h-8 w-8 flex justify-center items-center cursor-pointer mr-2 transition-transform hover:scale-110 ease-linear ${currentStep === 0 ? 'bg-[#5C7891] text-white border-[#5C7891]' :
                                            currentStep === index + 1 ? 'bg-[#5C7891] text-white ring-1 ring-[#597387] border-white border-4' :
                                                currentStep === index + 2 ? 'bg-[#5C7891] text-white border-[#597387]' :
                                                    currentStep === index + 3 ? 'bg-[#5C7891] text-white border-[#597387]' :
                                                        'border border-gray-400 text-gray-400'
                                            }`}
                                        onClick={() => handleStepChange(index + 1)}
                                    >
                                        {index + 1}
                                    </span>

                                    <span className="text-sm font-semibold text-black font-zen-kaku">{stepTitles[index]}</span>
                                </div>
                            ))}
                        </div>



                        {/* Aquí se muestra el Loader */}
                        {!isLoading && currentStep === 1 && (
                            <form className='z-50 h-auto p-4 mx-auto pl-80 font-zen-kaku custom-form1' /*style={{ marginTop: '-120px' }}*/>
                                <div className='grid grid-cols-3 gap-4'>
                                    <div className='col-span-1'>
                                        <div className='z-40 w-full px-3'>
                                            <label className='text-sm font-bold font-zen-kaku'>Rut del trabajador</label>
                                            <input 
                                                className="w-full px-3 py-2 border rounded" 
                                                type="text" 
                                                placeholder="Rut del trabajador" 
                                                aria-label="Campo de ingreso RUT del trabajador"
                                                name='rut' 
                                                onChange={handleInput} 
                                                value={formData.rut || ''}
                                                />
                                        </div>
                                    </div>
                                    <div className='col-span-1'>
                                        <div className='z-40 w-full px-3'>
                                            <label className='text-sm font-bold font-zen-kaku'>Nombre</label>
                                            <input className="w-full px-3 py-2 border rounded" type="text" aria-label="Campo de ingreso nombre" placeholder="Nombre" name='names' onChange={handleInput} value={formData.names || ''} />
                                        </div>
                                    </div>
                                    <div className='col-span-1'>
                                        <div className='z-40 w-full px-3'>
                                            <label className='text-sm font-bold font-zen-kaku'>Apellido paterno</label>
                                            <input className="w-full px-3 py-2 border rounded" type="text" aria-label="Campo de ingreso apellido paterno" placeholder="Apellido paterno" name='apellido_p' onChange={handleInput} value={formData.apellido_p || ''} />
                                        </div>
                                    </div>
                                    <div className='col-span-1'>
                                        <div className='z-40 w-full px-3'>
                                            <label className='text-sm font-bold font-zen-kaku'>Apellido materno</label>
                                            <input className="w-full px-3 py-2 border rounded" type="text" placeholder="Apellido materno" aria-label="Campo de ingreso apellido materno" name='apellido_m' onChange={handleInput} value={formData.apellido_m || ''} />
                                        </div>
                                    </div>
                                    <div className='col-span-1'>
                                        <div className='z-40 w-full px-3'>
                                            <label className='text-sm font-bold font-zen-kaku'>Género</label>
                                            <Select
                                                className={`basic-single font-zen-kaku`}
                                                classNamePrefix="select"
                                                isSearchable
                                                name="genero"
                                                placeholder="Selecciona género"
                                                aria-label="Campo seleccionable de genero"
                                                options={genOptions}
                                                value={genOptions.find(option => option.value === formData.genero)}
                                                onChange={handleSelect}
                                            />
                                        </div>
                                    </div>
                                    <div className='col-span-1'>
                                        <div className='z-40 w-full px-3 mb-3 customDatePickerWidth md:mb-0'>
                                            <div className='z-50 w-full px-3 mb-2'>
                                                <label className='text-sm font-bold font-zen-kaku'>Fecha de nacimiento</label>
                                            </div>
                                            <DatePicker
                                                selected={fechaNacimiento}
                                                onChange={handleDateChange}
                                                placeholderText="Selecciona fecha de nacimiento"
                                                className="font-zen-kaku px-3 py-1.5 border border-gray-300 rounded w-full"
                                                locale="es"
                                                name="fecha_de_nacimiento"
                                                dateFormat="yyyy/MM/dd"
                                            />
                                        </div>
                                    </div>
                                    <div className='col-span-1'>
                                        <div className='z-40 w-full px-3'>
                                            <label className='text-sm font-bold font-zen-kaku'>Correo electrónico</label>
                                            <input className="w-full px-3 py-2 border rounded" aria-label="Campo de ingreso correo electrronico" type="text" placeholder="Correo electrónico" name='email' onChange={handleInput} value={formData.email || ''} />
                                        </div>
                                    </div>
                                    <div className='col-span-1'>
                                        <div className='z-40 w-full px-3'>
                                            <label className='text-sm font-bold font-zen-kaku'>Celular</label>
                                            <div className='flex'>
                                                <div className='w-2/6 custom-telefono'>
                                                    <Select
                                                        className="basic-single"
                                                        classNamePrefix="select"
                                                        isSearchable
                                                        name="codtelefono"
                                                        placeholder="+56"
                                                        options={codigoAreaOptions}
                                                        value={codigoAreaOptions.find(option => option.value === formData.id_cod_telf)}
                                                        onChange={(option) => handleSelect(option, { name: 'id_cod_telf' })}
                                                        styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                                                    />
                                                </div>
                                                <div className='flex-grow'>
                                                    <input
                                                        className="w-full px-3 py-2 border border-l-0 rounded rounded-l-none"
                                                        type="text"
                                                        aria-label="Campo de ingreso celular"
                                                        placeholder="222 222 222"
                                                        name='telefono'
                                                        onChange={handleInput}
                                                        value={formData.telefono || ''}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='col-span-1'>
                                        <div className='z-40 w-full px-3'>
                                            <label className='text-sm font-bold font-zen-kaku'>Usuario</label>
                                            <input className="w-full px-3 py-2 border rounded" aria-label="Campo de ingreso usuario" type="text" placeholder="Usuario" name='username' onChange={handleInput} value={formData.username || ''} />
                                        </div>
                                    </div>
                                    <div className='col-span-1'>
                                        <div className='z-40 w-full px-3'>
                                            <label className='text-sm font-bold font-zen-kaku'>Contraseña</label>
                                            {/* <input className="w-full px-3 py-2 border rounded" type="text" placeholder="Contraseña" name='password' onChange={handleInput} value={formData.password || ''} /> */}
                                            <button
                                                type="button"
                                                className={`w-full px-3 py-2 border rounded text-white ${isPasswordChanged ? 'bg-[#5C7891]' : ' bg-[#597387] hover:bg-[#597387]'} font-bold`}
                                                onClick={() => setIsPasswordModalOpen(true)}
                                            >
                                                Cambiar Contraseña {isPasswordChanged && '(Preparado)'}
                                            </button>
                                        </div>

                                    </div>
                                    <div className='col-span-1'>
                                        <div className='z-40 w-full px-3'>
                                            <label className='text-sm font-bold font-zen-kaku'>Estado Civil</label>
                                            <Select
                                                className="basic-single"
                                                classNamePrefix="select"
                                                isSearchable
                                                name="estado_civil"
                                                placeholder="Selecciona estado civil"
                                                options={estadoCivilOptions}
                                                value={estadoCivilOptions.find(option => option.value === formData.id_estado_civil)}
                                                onChange={(option) => handleSelect(option, { name: 'id_estado_civil' })}
                                                styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                                            />
                                        </div>
                                    </div>
                                    <div className='col-span-1'>
                                        <div className='z-40 w-full px-3'>
                                            <label className='text-sm font-bold font-zen-kaku'>Dirección</label>
                                            <input className="w-full px-3 py-2 border rounded" type="text" aria-label="Campo de ingreso direccion" placeholder="Dirección" name='direccion' onChange={handleInput} value={formData.direccion || ''} />
                                        </div>
                                    </div>
                                    <div className='col-span-1'>
                                        <div className='z-40 w-full px-3'>
                                            <label className='text-sm font-bold font-zen-kaku'>Código Postal</label>
                                            <input className="w-full px-3 py-2 border rounded" type="text" aria-label="Campo de ingreso codigo postal" placeholder="Código Postal" name='codigo_postal' onChange={handleInput} value={formData.codigo_postal || ''} />
                                        </div>
                                    </div>
                                    <div className='col-span-1'>
                                        <div className='z-40 w-full px-3'>
                                            <label className='text-sm font-bold font-zen-kaku'>País</label>
                                            <Select
                                                className="basic-single"
                                                classNamePrefix="select"
                                                isSearchable
                                                name="pais"
                                                placeholder="Selecciona país"
                                                aria-label="Campo seleccionable de paises"
                                                options={paisOptions}
                                                value={paisOptions.find(option => option.value === formData.pais)}
                                                onChange={(option) => {
                                                    handleSelect(option, { name: 'pais' });
                                                    fetchRegiones(option.value); // Carga las regiones del país seleccionado
                                                    setFormData({ ...formData, region: null, ID_comuna: null }); // Restablece región y comuna
                                                }}
                                                styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                                            />
                                        </div>
                                    </div>
                                    <div className='col-span-1'>
                                        <div className='z-40 w-full px-3'>
                                            <label className='text-sm font-bold font-zen-kaku'>Región</label>
                                            <Select
                                                className="basic-single"
                                                classNamePrefix="select"
                                                isSearchable
                                                name="region"
                                                placeholder="Selecciona región"
                                                aria-label="Campo seleccionable de regiones"
                                                options={regionOptions}
                                                value={regionOptions.find(option => option.value === formData.region)}
                                                onChange={(option) => {
                                                    handleSelect(option, { name: 'region' });
                                                    fetchComunas(option.value); // Carga las comunas de la región seleccionada
                                                    setFormData({ ...formData, ID_comuna: null }); // Restablece comuna
                                                }}
                                                isDisabled={!formData.pais}
                                                styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                                            />
                                        </div>
                                    </div>
                                    <div className='col-span-1'>
                                        <div className='z-40 w-full px-3'>
                                            <label className='text-sm font-bold font-zen-kaku'>Comuna</label>
                                            <Select
                                                className="basic-single"
                                                classNamePrefix="select"
                                                isSearchable
                                                name="ID_comuna"
                                                placeholder="Selecciona comuna"
                                                aria-label="Campo de seleccionable de comunas"
                                                options={comunaOptions}
                                                value={comunaOptions.find(option => option.value === formData.ID_comuna)}
                                                onChange={(option) => handleSelect(option, { name: 'ID_comuna' })}
                                                isDisabled={!formData.region}
                                                styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                                            />
                                        </div>
                                    </div>
                                    <div className='col-span-1 custom-perfil'>
                                        <div className='z-40 w-full px-3'>
                                            <label className='block mb-2 text-sm font-bold font-zen-kaku'>Agregar foto de perfil</label>
                                            <div className="flex items-center px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg font-zen-kaku">
                                                <Upload color="#828080" className="flex-shrink-0 w-5 h-5 mr-2" />
                                                {fileName ? (
                                                    <div className="flex items-center flex-grow">
                                                        <span className="max-w-full min-w-0 ml-1 font-medium text-blue-600 ">{fileName}</span>
                                                        <button
                                                            type="button"
                                                            onClick={removeFile}
                                                            className="flex-shrink-0 ml-2 text-xs text-red-600 cursor-pointer hover:text-red-800"
                                                            style={{ fontSize: '1rem', lineHeight: '1rem' }}
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <label htmlFor="workerFile" className="flex items-center flex-grow cursor-pointer">
                                                        <span className="flex-grow truncate">Haga clic aquí para cargar imagen</span>
                                                        <input type="file" id="workerFile" className="z-30 hidden" name='perfil' onChange={manejarCambioImagen} />
                                                    </label>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='flex items-center justify-end mt-16'>
                                    <button type="button" onClick={() => router.push('/dashboard/users')} className="px-4 py-3 mb-1 mr-1 text-base font-bold text-gray-400 uppercase transition-all duration-150 rounded hover:text-gray-600 font-zen-kaku">
                                        Cancelar
                                    </button>
                                    <button type="button"
                                        className="bg-[#5C7891] ml-10 text-white active:bg-[#597387] font-bold uppercase text-base px-10 py-3 rounded-lg shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 font-zen-kaku hover:opacity-75"
                                        onClick={() => handleStepChange(currentStep + 1)}
                                    >
                                        Continuar
                                    </button>
                                </div>
                            </form>
                        )}
                        {currentStep === 2 && (
                            <form className='z-10 h-auto p-4 mx-auto pl-80 font-zen-kaku custom-form1' /*style={{ marginTop: '-120px' }}*/>
                                <div className='grid grid-cols-2 gap-4'>
                                    <div className='relative w-full px-3'>
                                        <div className='relative w-full px-3 mb-2'>
                                            <label className='text-sm font-bold font-zen-kaku'>Seguro social</label>
                                        </div>
                                        <Select
                                            className='basic-single font-zen-kaku'
                                            classNamePrefix="select"
                                            isSearchable
                                            name="id_salud"
                                            placeholder="Selecciona previsión"
                                            aria-label="Campo de seleccionable de prevision"
                                            onChange={handleWorkSelect}
                                            value={saludOptions.find(option => option.value === formWorkData.id_salud)}
                                            options={saludOptions}
                                        />
                                    </div>
                                    <div className='relative w-full px-3'>
                                        <div className='relative w-full px-3 mb-2'>
                                            <label className='text-sm font-bold font-zen-kaku whitespace-nowrap'>Administradoras de fondos de pensiones(AFP)</label>
                                        </div>
                                        <Select
                                            className='basic-single font-zen-kaku'
                                            classNamePrefix="select"
                                            isSearchable
                                            name="id_afp"
                                            placeholder="Selecciona una AFP"
                                            aria-label="Campo seleccionable de AFP" 
                                            onChange={handleWorkSelect}
                                            value={afpOptions.find(option => option.value === formWorkData.id_afp)}
                                            options={afpOptions}
                                        />
                                    </div>
                                    <div className='relative w-full px-3'>
                                        <div className='relative w-full px-0 mb-2'>
                                            <label className='text-sm font-bold font-zen-kaku'>Número de contacto de emergencia</label>
                                            <div className='col-span-1'>
                                                <div className='relative w-full px-3'>
                                                    <div className='flex'>
                                                        <div className='relative w-2/6'>
                                                            <Select
                                                                className="basic-single"
                                                                classNamePrefix="select"
                                                                isSearchable
                                                                name="codigo_area_emergencia"
                                                                aria-label="Campo de ingreso codigo celular de emergencia"
                                                                placeholder="+56"
                                                                options={codigoAreaOptions}
                                                                value={codigoAreaOptions.find(option => option.value === formWorkData.codigo_area_emergencia)}
                                                                onChange={(option) => handleWorkSelect(option, { name: 'codigo_area_emergencia' })}
                                                                styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                                                            />
                                                        </div>
                                                        <div className='relative flex-grow'>
                                                            <input
                                                                className="w-full px-3 py-2 border border-l-0 rounded rounded-l-none"
                                                                type="text"
                                                                placeholder="222 222 222"
                                                                name='telefono_emergencia'
                                                                aria-label="Campo de ingreso celular de emergencia"
                                                                onChange={handleWorkInput}
                                                                value={formWorkData.telefono_emergencia || ''}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='relative w-full px-2'>
                                        <div className='relative w-full px-1 mb-3'>
                                            <label className='text-sm font-bold font-zen-kaku'>Relación de contacto de emergencia</label>
                                            <Select
                                                className="basic-single"
                                                classNamePrefix="select"
                                                isSearchable
                                                name="id_relacion_emergencia"
                                                placeholder="Relación Contacto"
                                                aria-label="Campo seleccionable relacion contacto de emergencia"
                                                options={[
                                                    { value: 1, label: "Padre/Madre" },
                                                    { value: 2, label: "Hermano/a" },
                                                    { value: 3, label: "Cónyuge/Pareja" },
                                                    { value: 4, label: "Hijo/a" },
                                                    { value: 5, label: "Amigo/a" },
                                                    { value: 6, label: "Otro" }
                                                ]}
                                                value={[
                                                    { value: 1, label: "Padre/Madre" },
                                                    { value: 2, label: "Hermano/a" },
                                                    { value: 3, label: "Cónyuge/Pareja" },
                                                    { value: 4, label: "Hijo/a" },
                                                    { value: 5, label: "Amigo/a" },
                                                    { value: 6, label: "Otro" }
                                                ].find(option => option.value === formWorkData.id_relacion_emergencia)}
                                                onChange={(option) => handleWorkSelect(option, { name: 'id_relacion_emergencia' })}
                                                styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                                            />
                                        </div>
                                    </div>
                                    <div className='relative w-full px-3'>
                                        <div className='relative w-full px-3 mb-2'>
                                            <label className='text-sm font-bold font-zen-kaku'>Nombre contacto de emergencia</label>
                                        </div>
                                        <input className="w-full px-3 py-2 border rounded" aria-label="Campo de ingreso nombre contacto de emergencia" type="text" placeholder="Nombre del contacto de emergencia" name='nombre_emergencia' onChange={handleWorkInput} value={formWorkData.nombre_emergencia || ''} />
                                    </div>
                                    <div className='relative w-full px-3'>
                                        <div className='relative w-full px-3 mb-2'>
                                            <label className='text-sm font-bold font-zen-kaku'>Correo contacto de emergencia</label>
                                        </div>
                                        <input className="w-full px-3 py-2 border rounded" aria-label="Campo de ingreso correo contacto de emergencia" type="text" placeholder="Correo del contacto de emergencia" name='correo_emergencia' onChange={handleWorkInput} value={formWorkData.correo_emergencia || ''} />
                                    </div>
                                    <div className='relative w-full px-3'>
                                        <div className='relative w-full px-3 mb-2'>
                                            <label className='text-sm font-bold font-zen-kaku'>Puesto</label>
                                        </div>
                                        <Select
                                            className="basic-single"
                                            classNamePrefix="select"
                                            isSearchable={true}
                                            name="id_puesto"
                                            placeholder="Seleccione un puesto"
                                            aria-label="Campo seleccionable de puesto"
                                            options={puestosOptions}
                                            onChange={handleWorkSelect}
                                            value={puestosOptions.find(option => option.value === formWorkData.id_puesto)}
                                            styles={{
                                                menu: (provided) => ({
                                                    ...provided,
                                                    zIndex: 9999
                                                })
                                            }}
                                        />
                                    </div>

                                    <div className='relative w-full px-3'>
                                        <div className='relative w-full px-3 mb-2'>
                                            <label className='text-sm font-bold font-zen-kaku'>Grupo</label>
                                        </div>
                                        <Select
                                            className="basic-single"
                                            classNamePrefix="select"
                                            isSearchable={true}
                                            name="id_grupo"
                                            placeholder="Seleccione un grupo"
                                            aria-label="Campo seleccionable de grupo"
                                            options={gruposOptions}
                                            onChange={handleWorkSelect}
                                            value={gruposOptions.find(option => option.value === formWorkData.id_grupo)}
                                            styles={{
                                                menu: (provided) => ({
                                                    ...provided,
                                                    zIndex: 9999
                                                })
                                            }}
                                        />
                                    </div>
                                    <div className='relative w-full px-3'>
                                        <div className='relative w-full px-3 mb-2'>
                                            <label className='text-sm font-bold font-zen-kaku'>Organización</label>
                                        </div>
                                        <Select
                                            className="basic-single"
                                            classNamePrefix="select"
                                            isSearchable
                                            name="organizacionid"
                                            placeholder="Selecciona una organización"
                                            aria-label="Campo seleccionable de organizacion"
                                            options={organizacionOptions}
                                            value={organizacionOptions.find(option => option.value === formWorkData.organizacionid)}
                                            onChange={(option) => handleWorkSelect(option, { name: 'organizacionid' })}
                                        />
                                    </div>
                                </div>
                                <div className='flex items-center justify-end mt-52'>
                                    <button type="button" onClick={() => handleStepChange(currentStep - 1)} className="px-6 py-3 mb-1 mr-1 text-base font-bold text-gray-400 uppercase transition-all duration-150 rounded hover:text-gray-600 font-zen-kaku">
                                        Atras
                                    </button>
                                    <button type="button"
                                        className="bg-[#5C7891] ml-10 text-white hover:opacity-75 active:bg-[#5C7891] font-zen-kaku font-bold uppercase text-base px-10 py-3 rounded-lg shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                        onClick={() => handleStepChange(currentStep + 1)}
                                    >
                                        Continuar
                                    </button>
                                </div>
                            </form>
                        )}

                        {currentStep === 3 && (
                            <form className='z-50 h-auto p-4 mx-auto pl-80 font-zen-kaku custom-form3' style={{ marginTop: '-130px' }}>
                                <div className='flex flex-row'>
                                    <div className='flex flex-row w-full px-2 mb-4 md:mb-0'>
                                        <label className='flex flex-row w-full px-3 py-2 text-sm font-zen-kaku'>
                                            Solo admite archivos PDF, DOCX, IMG <ChevronRight strokeWidth={1} /> 30 MB
                                        </label>
                                    </div>
                                </div>
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
                                <div className='flex items-center justify-end mt-20'>
                                    <button type="button" onClick={() => handleStepChange(currentStep - 1)} className="px-6 py-3 mb-1 mr-1 text-base font-bold text-gray-400 uppercase transition-all duration-150 rounded font-zen hover:text-gray-600">
                                        Atras
                                    </button>
                                    <button
                                        className="bg-[#5C7891] hover:bg-[#597387] ml-10 font-zen text-white active:bg-emerald-600 font-bold uppercase text-base px-10 py-3 rounded-lg shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                        type="button" onClick={handleSubmit}
                                    >
                                        Guardar datos
                                    </button>
                                </div>


                            </form>
                        )}
                        <PasswordChangeModal
                            isOpen={isPasswordModalOpen}
                            onClose={() => setIsPasswordModalOpen(false)}
                            onSubmit={handlePasswordChange}
                        />

                    </div>
                </div>)}
        </div>
    );
};

export default UpdateUserPage;
