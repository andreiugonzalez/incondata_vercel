import { useState, useEffect, useCallback } from 'react';
import { Upload, Eye, FileText, XCircle, ChevronRight } from 'lucide-react';
import Tooltip from '../../components/tooltip';
import { getAdjuntosByProyectoId, postProjectDoc } from '@/app/services/project';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

const documentosEsperados = [
    { codigo: 1, descripcion: 'DNI', estado: '', archivo: 'fotocopia_cedula.pdf', fecha_vencimiento: '2024-12-31', carga: '1' },
    { codigo: 14, descripcion: 'Póliza de seguro', estado: '', archivo: 'poliza_seguros.pdf', fecha_vencimiento: '2024-12-31' },
    { codigo: 25, descripcion: 'Documento de autorización', estado: '', archivo: 'documento_autorizacion.pdf', fecha_vencimiento: '2024-06-30', carga: '1' },
    { codigo: 26, descripcion: 'Servicios de Impuestos Internos Tributarios', estado: '', archivo: 'servicios_sii_tributarios.pdf', fecha_vencimiento: '2024-06-30', carga: '1' },
    { codigo: 27, descripcion: 'Tasa de trabajo seguro', estado: '', archivo: 'tasa_trabajo_seguro.pdf', fecha_vencimiento: '2024-12-31', carga: '1' },
    { codigo: 28, descripcion: 'Representante legal y sociedad actualizada', estado: '', archivo: 'representante_legal_sociedad_actualizada.pdf', fecha_vencimiento: '2024-05-31', carga: '1' },
    { codigo: 29, descripcion: 'Servicios de estatutos', estado: '', archivo: 'servicios_estatutos.pdf', fecha_vencimiento: '2024-12-31', carga: '1' },
    { codigo: 30, descripcion: 'Garantías', estado: '', archivo: 'garantias.pdf', fecha_vencimiento: '2024-05-31', carga: '1' },
    { codigo: 31, descripcion: 'Cheque', estado: '', archivo: 'cheque.pdf', fecha_vencimiento: '2024-12-31', carga: '1' },
    { codigo: 32, descripcion: 'Asociados a garantía', estado: '', archivo: 'asociados_garantia_poliza.pdf', fecha_vencimiento: '2024-12-31' },
    { codigo: 33, descripcion: 'Afiliación a caja de compensación', estado: '', archivo: 'afiliacion_caja_compensacion.pdf', fecha_vencimiento: '2024-12-31', carga: '1' },
    { codigo: 34, descripcion: 'Seguro Laboral de Empresa', estado: '', archivo: 'seguro_laboral_empresa.pdf', fecha_vencimiento: '2024-12-31', carga: '1' }
];

const validarDocumentos = (docs = []) => {
    const docsActualizados = documentosEsperados.map(docEsperado => {
        const docEncontrado = docs.find(doc => doc.documentTypeId === docEsperado.codigo);
        return {
            ...docEsperado,
            estado: docEncontrado ? 'Pendiente Validación' : 'No existe',
            archivo: docEncontrado ? docEncontrado.link.split('/').pop() : docEsperado.archivo,
            link: docEncontrado ? docEncontrado.link : null,
            file: docEncontrado ? null : undefined,
            carga: docEncontrado ? docEncontrado.filenames : undefined,
        };
    });
    return docsActualizados;
};

const DocumentosComponent = ({ projectId }) => {
    const [documentos, setDocumentos] = useState([]);
    const [loading, setLoading] = useState(false);

     // Obtén el ID del usuario desde Redux
     const userId = useSelector(state => state.user.user.id);

     console.log(userId);

    // Envolver fetchDocumentos en useCallback
    const fetchDocumentos = useCallback(() => {
        if (projectId) {
            getAdjuntosByProyectoId(projectId)
                .then(response => {
                    const data = response.data || [];
                    const documentosValidados = validarDocumentos(data);
                    setDocumentos(documentosValidados);
                })
                .catch(error => {
                    console.error('Error fetching project documents:', error);
                    toast.error("Error al obtener los documentos del proyecto.");
                    setDocumentos(validarDocumentos([])); // Renderiza la lista esperada si hay un error
                });
        } else {
            setDocumentos(validarDocumentos([])); // Renderiza la lista esperada si no hay projectId
        }
    }, [projectId]);  // Incluir projectId como dependencia

    useEffect(() => {
        fetchDocumentos();
    }, [fetchDocumentos]);  // Incluir fetchDocumentos como dependencia

    const manejarCambioDocumento = async (evento, codigo) => {
        const archivo = evento.target.files[0];
        if (archivo) {
            setLoading(true);
            const toastId = toast.loading("Cargando documento...");

            const extension = archivo.name.split('.').pop();
            const tamaño = archivo.size;

            const formData = new FormData();
            formData.append('file', archivo);
            formData.append('projectId', projectId);
            formData.append('document_type', documentosEsperados.find(doc => doc.codigo === codigo).descripcion);
            formData.append('filename', archivo.name);
            formData.append('extension', extension);
            formData.append('size', tamaño);
            formData.append('userId', userId);

            try {
                await postProjectDoc(formData);
                fetchDocumentos();
                toast.success("Documento cargado con éxito", { id: toastId });
                setLoading(false);
            } catch (error) {
                console.error('Error uploading document:', error);
                toast.error("Error al cargar el documento", { id: toastId });
                setLoading(false);
            }
        }
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
                <td className="flex items-center justify-center px-4 py-2 space-x-2">
                    {doc.link ? (
                        <div className="relative inline-block group">
                            <a href={doc.link} target="_blank" rel="noopener noreferrer">
                                <Tooltip text="Ver Actual">
                                    <Eye className="w-5 h-5 text-blue-500" />
                                </Tooltip>
                            </a>
                        </div>
                    ) : (
                        <div className="relative inline-block group">
                            <Tooltip text="Documento no disponible">
                                <Eye className="w-5 h-5 text-gray-400" />
                            </Tooltip>
                        </div>
                    )}
                    <div className="relative inline-block group">
                        <label htmlFor={`upload-${doc.codigo}`} className="cursor-pointer">
                            <Tooltip text="Cargar un Documento">
                                <Upload className="w-5 h-5 text-gray-500" />
                            </Tooltip>
                        </label>
                        <input type="file" id={`upload-${doc.codigo}`} className="hidden" onChange={(e) => manejarCambioDocumento(e, doc.codigo)} />
                    </div>
                </td>
                <td className="px-4 py-2 text-center">
                    {doc.carga ? (
                        <div className="relative inline-block group">
                            <Tooltip text={doc.carga}>
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
        <div className='w-full'>
            <div className='flex flex-row'>
                <div className='flex flex-row w-full px-2 mb-4 md:mb-0'>
                    <label className='flex flex-row w-full px-3 py-2 text-sm font-zen-kaku'>
                        Solo admite archivos PDF, DOCX, IMG <ChevronRight strokeWidth={1} /> 30 MB
                    </label>
                </div>
            </div>
            <div className='overflow-x-auto'>
            <div className="table p-4 select-none font-zen-kaku overflow-x-auto w-full min-w-full">
                <table className="table-auto w-full border-collapse border overflow-x-auto bg-white">
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
            </div>
        </div>
    );
};

export default DocumentosComponent;
