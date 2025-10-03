import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { createEvento, getTipoCapacitaciones, getTipoEventos, createNotification, getTipoAccidente } from '@/app/services/eventos_service';
import { uploadFiles } from '@/app/services/evento_load'; // Importa la función para subir archivos
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { validateEventoForm } from '@/app/dashboard/components/validForm/valid_update_events';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { es } from 'date-fns/locale';
import { LinearProgress, Box } from '@mui/material';

// Registra el locale en español
registerLocale('es', es);

const MAX_FILES = 10;
const MAX_SIZE_MB = 30;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const PrevencionForm = ({ closeModal, refreshEventos, fetchProjects }) => {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId') || '';
  const id_usuario = useSelector((state) => state.user.user.id); // Obtén el ID del usuario desde el estado de Redux

  const [selectedEvent, setSelectedEvent] = useState('');
  const [eventTypeName, setEventTypeName] = useState(''); // Nuevo estado para guardar el nombre del tipo de evento
  const [showTrainingOptions, setShowTrainingOptions] = useState(false);
  const [showgraveOptions, setgraveOptions] = useState(false);
  const [formData, setFormData] = useState({
    eventType: '',
    trainingType: '',
    accidentType: '',
    description: '',
    fecha_inc: new Date(), // Inicializa con la fecha y hora actual
    notification: false // Estado para la notificación
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [tipoCapacitaciones, setTipoCapacitaciones] = useState([]);
  const [tipoAccidentes, settipoAccidentes] = useState([]);
  const [tipoEventos, setTipoEventos] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const capacitacionesData = await getTipoCapacitaciones();
        const eventosData = await getTipoEventos();
        const accidentesData = await getTipoAccidente();

        setTipoCapacitaciones(capacitacionesData.data);
        settipoAccidentes(accidentesData.data);
        setTipoEventos(eventosData.data);
      } catch (error) {
        console.error('Error al obtener los datos iniciales:', error);
      }
    };

    fetchInitialData();
  }, []);

  const handleEventChange = (e) => {
    const value = e.target.value;
    const eventType = tipoEventos.find(evento => evento.id_tipo_evento.toString() === value);

    setSelectedEvent(value);
    setEventTypeName(eventType ? eventType.nombre : ''); // Guarda el nombre del tipo de evento
    setShowTrainingOptions(value === '1'); // Ajustado para usar valores numéricos como string
    setgraveOptions(value === '2');
    setFormData({ ...formData, eventType: value });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, fecha_inc: date });
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateEventoForm(formData, showTrainingOptions, showgraveOptions);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true); // Deshabilitar el botón de envío

    try {
      const { eventType, trainingType, accidentType ,description, fecha_inc, notification } = formData;

      const eventoData = {
        fecha_inc: fecha_inc.toISOString(), // Fecha completa con hora YYYY-MM-DDTHH:mm:ss.sssZ
        notification, // Estado de la notificación
        id_usuario, // Obtén el ID del usuario desde el estado de Redux
        id_tipo_evento: parseInt(eventType), // Convertir eventType a entero
        id_proyecto: projectId, // Obtén el ID del proyecto desde la URL
        resumen: description,
        id_tipo_capacitacion: eventType === '1' ? parseInt(trainingType) : null, // Convertir trainingType a entero solo si es entrenamiento
        id_tipo_accidente: eventType === '2' ? parseInt(accidentType) : null // Convertir accidentType a entero solo si es un accidente
      };

      const response = await createEvento(eventoData);
      console.log(response);
      refreshEventos();
      fetchProjects();

      if (response.error) {
        throw new Error(response.error);
      }

      const eventId = response.data.id_evento; // Asegúrate de que response.id esté correctamente definido
      console.log(eventId);
      // Subir los archivos si hay archivos seleccionados
      if (selectedFiles.length > 0) {
        const uploadData = new FormData();
        selectedFiles.forEach(file => {
          uploadData.append('files', file);
        });
        uploadData.append('eventId', eventId); // Usa la ID del evento creada
        uploadData.append('projectId', projectId);
        uploadData.append('userId', id_usuario);

        await uploadFiles(uploadData, (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        });

        // toast.success('Archivos subidos con éxito');
        setSelectedFiles([]);
        setUploadProgress(0);
      }

      // Si notification es true, enviar la notificación
      if (notification) {
        await createNotification({
          resumen: `Nuevo evento: ${eventTypeName} `, // Incluye el nombre del tipo de evento en el resumen
          message: ` ${description}`,
          userId: id_usuario,
          id_proyecto: parseInt(projectId, 10),
          fecha: new Date().toISOString()
        });
        toast.success('Evento y notificación creados exitosamente');
      } else {
        toast.success('Evento creado exitosamente');
      }

      closeModal(); // Cerrar el modal después de crear el evento con éxito
      refreshEventos();
    } catch (error) {
      toast.error('Error al crear el evento o subir archivos: ' + error.message);
      console.error('Error al crear el evento o subir archivos:', error);
    } finally {
      setIsSubmitting(false); // Habilitar el botón de envío
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg max-w-lg mx-auto font-zen-kaku">
      <h2 className="text-2xl font-bold mb-6 text-center">Formulario de Prevención</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group mb-4">
          <label htmlFor="event-type" className="block text-sm font-bold mb-2">Tipo de Evento:</label>
          <select
            id="event-type"
            name="eventType"
            value={selectedEvent}
            onChange={handleEventChange}
            className={`w-full p-3 border rounded-lg ${errors.eventType ? 'border-red-500' : ''}`}
          >
            <option value="">Seleccione una opción</option>
            {tipoEventos.map(evento => (
              <option key={evento.id_tipo_evento} value={evento.id_tipo_evento.toString()}>
                {evento.nombre}
              </option>
            ))}
          </select>
          {errors.eventType && <p className="text-red-500 text-xs mt-1">{errors.eventType}</p>}
        </div>
        {showTrainingOptions && (
          <div className="form-group mb-4">
            <label htmlFor="training-type" className="block text-sm font-bold mb-2">Tipo de Capacitación:</label>
            <select
              id="training-type"
              name="trainingType"
              value={formData.trainingType}
              onChange={handleInputChange}
              className={`w-full p-3 border rounded-lg ${errors.trainingType ? 'border-red-500' : ''}`}
            >
              <option value="">Seleccione una opción</option>
              {tipoCapacitaciones.map(capacitacion => (
                <option key={capacitacion.id_tipo_capacitacion} value={capacitacion.id_tipo_capacitacion.toString()}>
                  {capacitacion.nombre}
                </option>
              ))}
            </select>
            {errors.trainingType && <p className="text-red-500 text-xs mt-1">{errors.trainingType}</p>}
          </div>
        )}
        <div className="form-group mb-4">
          <label htmlFor="description" className="block text-sm font-bold mb-2">Descripción del Caso:</label>
          <textarea
            id="description"
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleInputChange}
            className={`w-full p-3 border rounded-lg ${errors.description ? 'border-red-500' : ''}`}
          ></textarea>
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
        </div>
        {showgraveOptions && (
          <div className="form-group mb-4">
          <label htmlFor="grave-type" className="block text-sm font-bold mb-2">Tipo de accidente:</label>
          <select
            id="grave-type"
            name="accidentType"
            value={formData.accidentType}
            onChange={handleInputChange}
            className={`w-full p-3 border rounded-lg ${errors.accidentType ? 'border-red-500' : ''}`}
          >
            <option value="">Seleccione una opción</option>
            {tipoAccidentes.map(accidente => (
              <option key={accidente.id_tipo_accidente} value={accidente.id_tipo_accidente.toString()}>
                {accidente.nombre}
              </option>
            ))}
          </select>
          {errors.accidentType && <p className="text-red-500 text-xs mt-1">{errors.accidentType}</p>}
        </div>
        )}
        <div className="form-group mb-4">
          <label htmlFor="fecha_inc" className="block text-sm font-bold mb-2">Fecha de Evento:</label>
          <DatePicker
            selected={formData.fecha_inc}
            onChange={handleDateChange}
            showTimeSelect
            dateFormat="Pp"
            timeFormat="p"
            timeIntervals={1}
            locale="es"
            className="w-full p-3 border rounded-lg"
          />
        </div>
        <div className="form-group mb-4">
          <label className="block text-sm font-bold mb-2">Incluir notificación:</label>
          <input
            type="checkbox"
            id="notification"
            name="notification"
            checked={formData.notification}
            onChange={handleInputChange}
            className="mr-2 leading-tight"
          />
          <span className="text-sm"> Enviar</span>
        </div>
        <div className="form-group mb-4">
          <label htmlFor="file-upload" className="block text-sm font-bold mb-2">Adjuntar Archivos:</label>
          <input
            type="file"
            id="file-upload"
            multiple
            onChange={handleFileChange}
            ref={fileInputRef}
            className="w-full p-3 border rounded-lg"
          />
          {isUploading && (
            <Box className="w-full mb-4">
              <LinearProgress variant="determinate" value={uploadProgress} />
              <div className="text-center mt-2">Subiendo archivos: {`${uploadProgress}%`}</div>
            </Box>
          )}
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-teal-500 text-white font-bold rounded-lg hover:bg-teal-600 transition-all ease-linear duration-150"
          disabled={isSubmitting} // Deshabilitar el botón mientras se envía la solicitud
        >
          Enviar
        </button>
      </form>
    </div>
  );
};

export default PrevencionForm;
