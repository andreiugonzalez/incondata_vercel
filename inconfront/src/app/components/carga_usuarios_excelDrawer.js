import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileUpload, faTimes, faDownload } from "@fortawesome/free-solid-svg-icons";
import ExcelJS from 'exceljs'; // Cambiado a exceljs
import { registerUserFromExcel } from '@/app/services/user';

const DrawerCargaExcelUsuarios = ({ isOpen, onClose }) => {
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [log, setLog] = useState('');
    const [progress, setProgress] = useState(0);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [hideOmitted, setHideOmitted] = useState(false); // Nuevo estado para controlar el checkbox
    const isAbortedRef = useRef(false);
    const fileInputRef = useRef(null);

    const getCurrentTime = () => {
        const now = new Date();
        return now.toLocaleTimeString();
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setFileName(e.target.files[0]?.name || '');
        setLog(''); // Clear log on file change
    };

    const handleClearFile = () => {
        setFile(null);
        setFileName('');
        setLog('');
        setProgress(0);
        setElapsedTime(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = null;
        }
    };

    const handleAbort = () => {
        isAbortedRef.current = true;
        setIsProcessing(false);
        setLog(prevLog => prevLog + `[${getCurrentTime()}] Proceso abortado por el usuario.\n`);
    };

    const handleUpload = async () => {
        if (!file) {
            alert("¡Por favor selecciona un archivo primero!");
            return;
        }

        try {
            setIsProcessing(true);
            isAbortedRef.current = false;
            setLog(`[${getCurrentTime()}] Procesando archivo...\n`);
            const data = await processExcel(file);
            const totalUsers = data.length;
            const startTime = Date.now();

            let logMessages = [`[${getCurrentTime()}] Comenzando a cargar ${totalUsers} usuarios...\n\n`];

            for (let i = 0; i < totalUsers; i++) {
                if (isAbortedRef.current) {
                    logMessages.push(`[${getCurrentTime()}] Proceso abortado por el usuario.\n`);
                    break;
                }

                try {
                    const user = JSON.parse(JSON.stringify(data[i])); // Ensure the object is plain
                    const response = await registerUserFromExcel([user]); // Send as an array
                    if (response.status === 'success') {
                        logMessages.push(...response.messages.map(msg => `[${getCurrentTime()}] ${msg}\n`)); // Agregar los mensajes del backend con hora
                    } else if (response.status === 'exists') {
                        logMessages.push(`[${getCurrentTime()}] Usuario ${user.Username} ya existe. Omitido.\n`);
                    } else {
                        logMessages.push(`[${getCurrentTime()}] Usuario ${user.Username} no se pudo cargar. Error: ${response.message}\n`);
                    }
                } catch (error) {
                    logMessages.push(`[${getCurrentTime()}] Usuario ${data[i].Username} no se pudo cargar. Error: ${error.message}\n`);
                }

                setProgress(((i + 1) / totalUsers) * 100);
                setLog(logMessages.join('')); // Update log message
            }

            const endTime = Date.now();
            setElapsedTime((endTime - startTime) / 1000); // time in seconds

            setLog(logMessages.join(''));
            setIsProcessing(false);
        } catch (error) {
            console.error("Error cargando usuarios:", error);
            setLog(`[${getCurrentTime()}] Error cargando usuarios: ${error.message}\n`);
            setIsProcessing(false);
        }
    };

    const processExcel = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = async (event) => {
                try {
                    const workbook = new ExcelJS.Workbook();
                    await workbook.xlsx.load(event.target.result); // Carga el archivo Excel
                    const worksheet = workbook.getWorksheet(1); // Obtén la primera hoja

                    const data = [];
                    worksheet.eachRow((row, rowNumber) => {
                        if (rowNumber > 1) { // Ignorar encabezado
                            const user = {};
                            row.eachCell((cell, colNumber) => {
                                user[`Column${colNumber}`] = cell.text; // Ajusta según tu formato
                            });
                            data.push(user);
                        }
                    });
                    resolve(data);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = (error) => {
                reject(error);
            };

            reader.readAsArrayBuffer(file);
        });
    };

    const downloadExcel = async () => {
        const response = await fetch('/download-excel', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'filename.xlsx';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } else {
            console.error('Error downloading file:', response.statusText);
        }
    };

    const filteredLog = log.split('\n').filter(msg => !hideOmitted || !msg.includes('ya existe. Omitido.')).join('\n');

    return (
        <div className={`fixed inset-0 flex items-center justify-center z-50 ${isOpen ? '' : 'hidden'}`}>
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-4xl w-full mx-4 sm:mx-auto">
                <div className="bg-white px-6 py-5 sm:py-6">
                    <div className="sm:flex sm:items-start">
                        <div className="w-full">
                            <div className="text-center sm:text-left">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4" id="modal-title">
                                    Cargar Usuarios desde Excel
                                </h3>
                            </div>
                            <div>
                                <input
                                    type="file"
                                    accept=".xlsx"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                    id="fileUpload"
                                    ref={fileInputRef}
                                />
                                <div className="flex items-center mb-4">
                                    <label htmlFor="fileUpload" className="px-4 py-2 mr-4 font-bold text-teal-500 transition-all duration-150 ease-linear bg-white rounded-md cursor-pointer hover:text-teal-600">
                                        Subir usuarios <FontAwesomeIcon className="mx-auto mr-2" icon={faFileUpload} />
                                    </label>
                                    <input
                                        type="text"
                                        readOnly
                                        value={fileName}
                                        className="flex-1 p-2 border rounded-md"
                                    />
                                    {fileName && (
                                        <button onClick={handleClearFile} className="ml-2 text-red-500 hover:text-red-700">
                                            <FontAwesomeIcon icon={faTimes} />
                                        </button>
                                    )}
                                </div>
                                <div className="flex justify-between mb-4">
                                    <button onClick={handleUpload} className="px-4 py-2 font-bold text-white bg-teal-500 rounded-md hover:bg-teal-600 transition-all duration-150 ease-linear">
                                        Cargar Archivo
                                    </button>
                                    {isProcessing && (
                                        <button onClick={handleAbort} className="px-4 py-2 font-bold text-white bg-red-500 rounded-md hover:bg-red-600 transition-all duration-150 ease-linear">
                                            Abortar
                                        </button>
                                    )}
                                </div>
                                <div className="flex justify-between mb-4">
                                    <button onClick={downloadExcel} className="px-4 py-2 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-all duration-150 ease-linear">
                                        Descargar Formato
                                    </button>
                                </div>
                                <div className="flex items-center mb-4">
                                    <input
                                        type="checkbox"
                                        id="hideOmitted"
                                        checked={hideOmitted}
                                        onChange={() => setHideOmitted(!hideOmitted)}
                                        className="mr-2"
                                    />
                                    <label htmlFor="hideOmitted" className="text-sm text-gray-700">
                                        Ocultar estatus omitidos
                                    </label>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                                    <div className="bg-teal-500 h-full rounded-full" style={{ width: `${progress}%` }}></div>
                                </div>
                                <div className="text-sm text-gray-500 mb-4">Tiempo transcurrido: {elapsedTime.toFixed(2)} segundos</div>
                                <textarea
                                    value={filteredLog}
                                    readOnly
                                    className="w-full p-2 border rounded-md h-96"
                                    rows={15}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                        type="button"
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        onClick={onClose}
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DrawerCargaExcelUsuarios;
