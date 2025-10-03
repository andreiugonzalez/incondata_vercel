import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

const CargaPartidasExcelDrawer = ({ handleAddTask }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      toast.error('Por favor, selecciona un archivo.');
      return;
    }
    setSelectedFile(file);
  };

  const handleFileUpload = () => {
    if (!selectedFile) {
      toast.error('Por favor, selecciona un archivo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      console.log("Worksheet data:", worksheet); // Log para verificar los datos

      worksheet.forEach((row) => {
        const { title, type, parentRealId } = row;
        if (!title || !type || !parentRealId) {
          toast.error('El archivo contiene datos incompletos.');
          return;
        }
        handleAddTask(null, 1, type, parentRealId, title);
      });

      toast.success('Tareas cargadas exitosamente.');
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Carga de Partidas desde Excel</h2>
      <p className="text-gray-600">Selecciona un archivo Excel (.xlsx o .xls) para cargar las partidas.</p>
      <input 
        type="file" 
        accept=".xlsx, .xls" 
        onChange={handleFileChange} 
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      <button
        onClick={handleFileUpload}
        className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
      >
        Cargar Partidas
      </button>
    </div>
  );
};

export default CargaPartidasExcelDrawer;
