import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getFilesByEvent, deleteFiles } from '@/app/services/eventos_service';
import { uploadFiles } from '@/app/services/evento_load';
import { useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { LinearProgress, Box } from '@mui/material';
import Tooltip from '../../components/tooltip';
import { BadgeHelp } from 'lucide-react';

const MAX_FILES = 10;
const MAX_SIZE_MB = 30;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const FileUpload = ({ eventId }) => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [selectedFileIds, setSelectedFileIds] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteProgress, setDeleteProgress] = useState(0);
    const fileInputRef = useRef(null);

    const searchParams = useSearchParams();
    const projectId = searchParams.get('projectId') || '';
    const id_usuario = useSelector((state) => state.user.user.id);

    // Envolver fetchUploadedFiles en useCallback
    const fetchUploadedFiles = useCallback(async () => {
        try {
            const response = await getFilesByEvent(eventId);
            setUploadedFiles(response.data);
        } catch (error) {
            console.error('Error al obtener archivos:', error);
            toast.error('Error al obtener archivos');
        }
    }, [eventId]);  // eventId es una dependencia de esta función

    useEffect(() => {
        fetchUploadedFiles();
    }, [fetchUploadedFiles]);  // Incluir fetchUploadedFiles como dependencia

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const totalSize = files.reduce((acc, file) => acc + file.size, 0);
        const currentSize = selectedFiles.reduce((acc, file) => acc + file.size, 0);

        if (files.length + selectedFiles.length > MAX_FILES) {
            toast.error('No puedes subir más de 10 archivos');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            return;
        }

        if (totalSize + currentSize > MAX_SIZE_BYTES) {
            toast.error(`El tamaño total de los archivos no puede exceder los ${MAX_SIZE_MB} MB`);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            return;
        }

        setSelectedFiles(files);
    };

    const handleUpload = async () => {
        try {
            setIsUploading(true);
            const formData = new FormData();
            selectedFiles.forEach(file => {
                formData.append('files', file);
            });
            formData.append('eventId', eventId);
            formData.append('projectId', projectId);
            formData.append('userId', id_usuario);

            const response = await uploadFiles(formData, (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setUploadProgress(percentCompleted);
                console.log(`Progreso de subida: ${percentCompleted}%`);
            });

            const newUploadedFiles = Array.isArray(response) ? response : [response];
            setUploadedFiles(prev => [...prev, ...newUploadedFiles]);
            setSelectedFiles([]);
            setUploadProgress(0);
            setIsUploading(false);
            toast.success('Archivos subidos con éxito');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            await fetchUploadedFiles(); // Actualiza la lista de archivos después de la subida
        } catch (error) {
            console.error('Error al subir archivos:', error);
            toast.error('Error al subir archivos');
            setIsUploading(false);
        }
    };

    const handleCancelUpload = () => {
        setSelectedFiles([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleMultipleFileDelete = async () => {
        try {
            setIsDeleting(true);
            const filesToDelete = selectedFileIds.map(fileId => {
                const file = uploadedFiles.find(file => file.id === fileId);
                return { fileId: file.id, filename: file.filenames };
            });

            for (let i = 0; i < filesToDelete.length; i++) {
                await deleteFiles([filesToDelete[i]]);
                setDeleteProgress(Math.round(((i + 1) * 100) / filesToDelete.length));
                setUploadedFiles(prevFiles => prevFiles.filter(file => file.id !== filesToDelete[i].fileId));
                setSelectedFileIds(prevSelected => prevSelected.filter(id => id !== filesToDelete[i].fileId));
            }

            setSelectAll(false);
            setDeleteProgress(100); // Asegúrate de que el progreso sea 100% al finalizar
            setTimeout(() => {
                setDeleteProgress(0);
                setIsDeleting(false);
            }, 1000); // Resetea el progreso después de un retraso de 1 segundo
            toast.success('Archivos eliminados con éxito');
        } catch (error) {
            console.error('Error al eliminar archivos:', error);
            toast.error('Error al eliminar archivos');
            setIsDeleting(false);
            setDeleteProgress(0);
        }
    };

    const toggleFileSelection = (fileId) => {
        setSelectedFileIds((prevSelectedFileIds) => {
            if (prevSelectedFileIds.includes(fileId)) {
                return prevSelectedFileIds.filter(id => id !== fileId);
            } else {
                return [...prevSelectedFileIds, fileId];
            }
        });
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedFileIds([]);
        } else {
            const allFileIds = uploadedFiles.map(file => file.id);
            setSelectedFileIds(allFileIds);
        }
        setSelectAll(!selectAll);
    };

    return (
        <div className="file-upload p-8 bg-white shadow-lg rounded-lg w-full h-full mx-auto my-auto">
               <div className="relative flex justify-end">
                <Tooltip text={
                  <>
                    Informacion importante: <br />
                    maximo 10 por subida archivos.<br />
                    El tamaño maximo de cada archivo es  {MAX_SIZE_MB} MB.<br />
              
                  </>
                }>
                  <div className='cursor-pointer hover:scale-110 transition-all ease-linear duration-150'>
                    <BadgeHelp size={20} className='stroke-black' />
                  </div>
                </Tooltip>
            </div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Adjuntar Archivos</h2>
         
            <input
                type="file"
                multiple
                onChange={handleFileChange}
                ref={fileInputRef}
                className="mb-4 p-3 border border-gray-300 rounded w-full"
                aria-label="Boton para subir archivos"
            />
            <div className="flex space-x-4 mb-4">
                <button
                    type="button"
                    onClick={handleUpload}
                    className="flex-1 px-4 py-2 bg-teal-500 text-white font-bold rounded hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={selectedFiles.length === 0 || isUploading}
                >
                    Subir Archivos
                </button>
                <button
                    type="button"
                    onClick={handleCancelUpload}
                    className="flex-1 px-4 py-2 bg-gray-500 text-white font-bold rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={selectedFiles.length === 0 || isUploading}
                >
                    Cancelar
                </button>
                {selectedFileIds.length > 0 && (
                    <button
                        type="button"
                        onClick={handleMultipleFileDelete}
                        className="flex-1 px-4 py-2 bg-red-500 text-white font-bold rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isDeleting}
                    >
                        Eliminar Archivos ({selectedFileIds.length})
                    </button>
                )}
            </div>
            {isUploading && (
                <Box className="w-full mb-4">
                    <LinearProgress variant="determinate" value={uploadProgress} />
                    <div className="text-center mt-2">Subiendo archivos: {`${uploadProgress}%`}</div>
                </Box>
            )}
            {selectedFileIds.length > 0 && isDeleting && (
                <Box className="w-full mb-4">
                    <LinearProgress variant="determinate" value={deleteProgress} />
                    <div className="text-center mt-2">Eliminando archivos: {`${deleteProgress}%`}</div>
                </Box>
            )}
            <h3 className="text-xl font-bold mb-4 text-gray-800">Archivos Cargados</h3>
            <div className="flex items-center w-full p-2 border my-5 border-gray-300 rounded">
                <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="mr-2"
                />
                <span className="text-gray-800">Seleccionar Todos ({selectedFileIds.length})</span>
            </div>
            <div className="overflow-y-auto max-h-64">
                <ul className="space-y-4 bord">
                    {uploadedFiles.map(file => (
                        <li key={file.id} className="flex items-center justify-between p-3 border border-gray-300 rounded">
                            <div className="flex items-center w-full">
                                <input
                                    type="checkbox"
                                    checked={selectedFileIds.includes(file.id)}
                                    onChange={() => toggleFileSelection(file.id)}
                                    className="mr-2"
                                />
                                <a
                                    href={file.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline truncate"
                                    style={{ maxWidth: 'calc(100% - 50px)' }}
                                >
                                    {file.filenames}
                                </a>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default FileUpload;
