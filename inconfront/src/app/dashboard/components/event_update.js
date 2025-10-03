import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getEvento, updateEvento, getTipoCapacitaciones, getTipoEventos, createNotification } from '@/app/services/eventos_service';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { validateEventoForm } from '@/app/dashboard/components/validForm/valid_update_events';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { es } from 'date-fns/locale';

// Registra el locale en español
registerLocale('es', es);

const ActualizarPrevencionForm = ({ closeModal, refreshEventos, eventId, onUpdate, formRef }) => {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId') || '';
  const id_usuario = useSelector((state) => state.user.user.id);

  const [selectedEvent, setSelectedEvent] = useState('');
  const [eventTypeName, setEventTypeName] = useState('');
  const [showTrainingOptions, setShowTrainingOptions] = useState(false);
  const [formData, setFormData] = useState({
    eventType: '',
    trainingType: '',
    description: '',
    notification: false,
    fecha_inc: new Date()
  });

  const [tipoCapacitaciones, setTipoCapacitaciones] = useState([]);
  const [tipoEventos, setTipoEventos] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const eventoData = await getEvento(eventId);

        const capacitacionesData = await getTipoCapacitaciones();
        const eventosData = await getTipoEventos();

        const eventTypeId = eventoData.data.id_tipo_evento.toString();
        const eventType = eventosData.data.find(evento => evento.id_tipo_evento.toString() === eventTypeId);

        setFormData({
          eventType: eventTypeId,
          trainingType: eventoData.data.id_tipo_capacitacion || '',
          description: eventoData.data.resumen || '',
          notification: eventoData.data.notification || false,
          fecha_inc: new Date(eventoData.data.fecha_inc)
        });
        setSelectedEvent(eventTypeId);
        setEventTypeName(eventType ? eventType.nombre : '');
        setShowTrainingOptions(eventoData.data.id_tipo_evento === 1);

        setTipoCapacitaciones(capacitacionesData.data);
        setTipoEventos(eventosData.data);
      } catch (error) {
        console.error('Error al obtener los datos iniciales:', error);
      }
    };

    fetchInitialData();
  }, [eventId]);

  const handleEventChange = (e) => {
    const value = e.target.value;
    const eventType = tipoEventos.find(evento => evento.id_tipo_evento.toString() === value);

    setSelectedEvent(value);
    setEventTypeName(eventType ? eventType.nombre : '');
    setShowTrainingOptions(value === '1');
    setFormData({ ...formData, eventType: value });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, fecha_inc: date });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateEventoForm(formData, showTrainingOptions);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      const { eventType, trainingType, description, notification, fecha_inc } = formData;

      const eventoData = {
        id_usuario,
        id_tipo_evento: parseInt(eventType),
        id_proyecto: projectId,
        resumen: description,
        notification: notification,
        fecha_inc: fecha_inc.toISOString(), // Fecha completa con hora
        id_tipo_capacitacion: eventType === '1' ? parseInt(trainingType) : null
      };

      const response = await updateEvento(eventId, eventoData);

      if (response.error) {
        throw new Error(response.error);
      }

      if (notification) {
        await createNotification({
          resumen: `Evento actualizado: ${eventTypeName} `,
          message: ` ${description}`,
          userId: id_usuario,
          id_proyecto: parseInt(projectId, 10),
          fecha: new Date().toISOString()
        });
        toast.success('Evento y notificación actualizados exitosamente');
      } else {
        toast.success('Evento actualizado exitosamente');
      }

      if (onUpdate) {
        onUpdate(); // Llama al callback onUpdate si está definido
      }

      closeModal();
      refreshEventos();
    } catch (error) {
      toast.error('Error al actualizar el evento o notificación: ' + error.message);
      console.error('Error al actualizar el evento o notificación:', error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full font-zen-kaku">
      <div className="w-full max-w-lg mx-auto">
        <h2 className="text-xl font-bold mb-6 text-center">Modificar Evento</h2>
        <form onSubmit={handleSubmit} ref={formRef}>
          <div className="form-group mb-4">
            <label htmlFor="event-type" className="block text-sm font-bold mb-2">Tipo de Evento:</label>
            <select
              id="event-type"
              name="eventType"
              value={selectedEvent}
              onChange={handleEventChange}
              className={`w-full p-3 border rounded-lg ${errors.eventType ? 'border-red-500' : 'border-gray-300'}`}
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
                className={`w-full p-3 border rounded-lg ${errors.trainingType ? 'border-red-500' : 'border-gray-300'}`}
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
              className={`w-full p-3 border rounded-lg h-24 resize-none ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Describe los detalles del evento..."
            ></textarea>
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>
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
              showWeekNumbers
              renderCustomHeader={({ date, decreaseMonth, increaseMonth, decreaseWeek, increaseWeek }) => (
                <div className="flex justify-between mb-2">
                  <button onClick={decreaseMonth} type="button">{"< Mes"}</button>
                  <button onClick={() => decreaseWeek()} type="button">{"< Semana"}</button>
                  <span>{date.toLocaleString('es', { month: 'long', year: 'numeric' })}</span>
                  <button onClick={() => increaseWeek()} type="button">{"Semana >"}</button>
                  <button onClick={increaseMonth} type="button">{"Mes >"}</button>
                </div>
              )}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="form-group mb-6">
            <label htmlFor="notification" className="block text-sm font-bold mb-2">Incluir Notificación:</label>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notification"
                name="notification"
                checked={formData.notification}
                onChange={handleInputChange}
                className="mr-2 h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
              />
              <span className="text-sm">Enviar notificación</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActualizarPrevencionForm;