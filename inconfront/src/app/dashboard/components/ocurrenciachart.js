import React, { useState, useEffect, useCallback } from 'react';
import { Scatter } from 'react-chartjs-2';
import { Chart as ChartJS, Tooltip, Legend, PointElement, LinearScale, Title } from 'chart.js';
import { chartinc } from "@/app/services/chart_service";
import { parse, differenceInDays, startOfWeek, endOfWeek, addWeeks, subWeeks, format, addDays, isWithinInterval } from "date-fns";
import { es } from "date-fns/locale";
import Modal from "react-modal";
import { CogIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

ChartJS.register(Tooltip, Legend, PointElement, LinearScale, Title);

const ScatterChart = ({ actualizado, projectId, fetchProjects }) => {
  const [chartData, setChartData] = useState({
    datasets: []
  });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLegend, setShowLegend] = useState(true);
  const [pointSize, setPointSize] = useState(8);
  const [showTooltips, setShowTooltips] = useState(true);
  
  // Agregar estado para navegación de semanas
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

  // Función para obtener etiquetas de la semana
  const getFormattedWeekRange = (start) => {
    const startFormatted = format(start, 'dd/MM/yyyy', { locale: es });
    const endFormatted = format(endOfWeek(start, { weekStartsOn: 1 }), 'dd/MM/yyyy', { locale: es });
    return `${startFormatted} - ${endFormatted}`;
  };

  // Función para convertir fecha a días desde el inicio de la semana seleccionada
  const convertirFechaADias = (fechaStr, weekStart) => {
    try {
      const fecha = parse(fechaStr, "dd/MM/yyyy, HH:mm:ss", new Date());
      const diasDesdeInicioSemana = differenceInDays(fecha, weekStart);
      return Math.max(diasDesdeInicioSemana, 0);
    } catch (error) {
      console.error('Error parsing date:', fechaStr, error);
      return 0;
    }
  };

  // Función para convertir tipo de accidente a valor numérico
  const getGravedadValue = (evento) => {
    // Priorizar el tipo de accidente específico
    if (evento.evento_tipo_accidente?.nombre) {
      const tipo = evento.evento_tipo_accidente.nombre.toLowerCase();
      if (tipo.includes('leve') || tipo.includes('menor')) return 1;
      if (tipo.includes('grave') || tipo.includes('serio')) return 2;
      if (tipo.includes('fatal') || tipo.includes('mortal')) return 3;
    }
    
    // Fallback: revisar el id_tipo_accidente si existe
    if (evento.id_tipo_accidente) {
      // Asumiendo que: 1=Leve, 2=Grave, 3=Fatal
      return Math.min(Math.max(evento.id_tipo_accidente, 1), 3);
    }
    
    return 1; // Default: Leve
  };

  const fetchAccidentes = useCallback(async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const response = await chartinc(projectId);
      const eventos = Array.isArray(response.data) ? response.data : [];

      // Definir el rango de la semana
      const weekStart = currentWeek;
      const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });

      // Filtrar solo eventos de tipo "accidentes" y dentro de la semana actual
      const accidentes = eventos.filter(evento => {
        if (!evento.evento_tipo_evento?.nombre?.toLowerCase().includes('accidente')) {
          return false;
        }
        
        // Filtrar por fecha dentro de la semana
        try {
          const fechaEvento = parse(evento.fecha_inc, "dd/MM/yyyy, HH:mm:ss", new Date());
          return isWithinInterval(fechaEvento, { start: weekStart, end: weekEnd });
        } catch (error) {
          console.error('Error parsing date for filtering:', evento.fecha_inc, error);
          return false;
        }
      });

      // Procesar datos para el scatter chart
      const datasets = [
        {
          label: 'Leve',
          data: [],
          backgroundColor: '#d1e7dd',
          borderColor: '#d1e7dd',
          borderWidth: 1,
          pointStyle: 'circle',
          pointRadius: pointSize,
        },
        {
          label: 'Grave', 
          data: [],
          backgroundColor: '#fff3cd',
          borderColor: '#fff3cd',
          borderWidth: 1,
          pointStyle: 'triangle',
          pointRadius: pointSize,
        },
        {
          label: 'Fatal',
          data: [],
          backgroundColor: '#f8d7da',
          borderColor: '#f8d7da',
          borderWidth: 1,
          pointStyle: 'rect',
          pointRadius: pointSize,
        },
      ];

      // Mapear accidentes a puntos en el gráfico con separación para evitar superposiciones
      const puntosUsados = new Map(); // Para rastrear posiciones ya usadas
      
      accidentes.forEach(accidente => {
        const x = convertirFechaADias(accidente.fecha_inc, currentWeek);
        const gravedad = getGravedadValue(accidente); // Pasar el evento completo
        
        // Solo mostrar puntos dentro del rango de la semana (0-6 días)
        if (x >= 0 && x <= 6) {
          // Crear una clave única para la posición
          const clavePosition = `${x}-${gravedad}`;
          
          // Si ya existe un punto en esta posición, ajustar ligeramente
          let xAjustado = x;
          let contador = 0;
          while (puntosUsados.has(`${xAjustado}-${gravedad}`) && contador < 10) {
            xAjustado = x + (contador * 0.1); // Separar horizontalmente
            contador++;
          }
          
          puntosUsados.set(`${xAjustado}-${gravedad}`, true);
          
          const punto = {
            x: xAjustado,
            y: gravedad,
            accidente: accidente // Datos adicionales para tooltip
          };

          // Agregar al dataset correspondiente
          if (gravedad === 1) {
            datasets[0].data.push(punto);
          } else if (gravedad === 2) {
            datasets[1].data.push(punto);
          } else if (gravedad === 3) {
            datasets[2].data.push(punto);
          }
        }
      });

      // Filtrar datasets vacíos
      const datasetsConDatos = datasets.filter(dataset => dataset.data.length > 0);

      setChartData({
        datasets: datasetsConDatos.length > 0 ? datasetsConDatos : [{
          label: 'Sin datos',
          data: [],
          backgroundColor: '#e9ecef',
          borderColor: '#e9ecef',
          borderWidth: 1,
          pointRadius: 0,
        }]
      });

    } catch (error) {
      console.error('Error fetching accidentes:', error);
      setChartData({
        datasets: [{
          label: 'Error al cargar datos',
          data: [],
          backgroundColor: '#dc3545',
          borderColor: '#dc3545',
          borderWidth: 1,
          pointRadius: 0,
        }]
      });
    } finally {
      setLoading(false);
    }
  }, [projectId, pointSize, currentWeek]);

  useEffect(() => {
    fetchAccidentes();
  }, [fetchAccidentes]);

  // Efecto adicional para refrescar cuando cambie de pestaña o se actualice el componente
  useEffect(() => {
    if (projectId) {
      fetchAccidentes();
    }
  }, [projectId, actualizado]);

  // Efecto de limpieza cuando el componente se desmonta
  useEffect(() => {
    return () => {
      // Limpiar estado si es necesario
      setLoading(false);
    };
  }, []);

  // Funciones para el modal y configuración
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchAccidentes();
    if (fetchProjects && typeof fetchProjects === 'function') {
      fetchProjects();
    }
  };

  const handleLegendChange = (e) => {
    setShowLegend(e.target.checked);
  };

  const handlePointSizeChange = (e) => {
    setPointSize(Number(e.target.value));
  };

  const handleTooltipsChange = (e) => {
    setShowTooltips(e.target.checked);
  };

  const handleReset = () => {
    setShowLegend(true);
    setPointSize(8);
    setShowTooltips(true);
    // Refrescar datos después de resetear configuraciones
    setTimeout(() => {
      fetchAccidentes();
    }, 100);
  };

  // Funciones de navegación de semanas
  const handlePreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const handleCurrentWeek = () => {
    setCurrentWeek(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Días de la semana',
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        min: 0,
        max: 6,
        grid: {
          display: true,
          color: '#e9ecef'
        },
        ticks: {
          stepSize: 1,
          callback: function(value) {
            const daysInSpanish = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
            return daysInSpanish[value] || '';
          }
        }
      },
      y: {
        title: {
          display: true,
          text: 'Gravedad',
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        min: 0,
        max: 4,
        ticks: {
          stepSize: 1,
          callback: function(value) {
            const labels = {
              1: 'Leve',
              2: 'Grave', 
              3: 'Fatal'
            };
            return labels[value] || '';
          }
        },
        grid: {
          display: true,
          color: '#e9ecef'
        }
      },
    },
    plugins: {
      legend: {
        display: showLegend,
        position: 'right',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 11
          }
        }
      },
      tooltip: {
        enabled: showTooltips,
        mode: 'point',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#fff',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: function(context) {
            const punto = context[0].raw;
            const resumen = punto.accidente?.resumen || 'Sin descripción';
            return resumen.length > 40 ? `${resumen.substring(0, 40)}...` : resumen;
          },
          label: function(context) {
            const punto = context.raw;
            const gravedad = punto.y === 1 ? 'Leve' : punto.y === 2 ? 'Grave' : 'Fatal';
            const fechaIncidente = punto.accidente?.fecha_inc || 'Fecha no disponible';
            const usuario = punto.accidente?.evento_usuario?.full_name || 'Usuario no especificado';
            
            return [
              `Gravedad: ${gravedad}`,
              `Fecha: ${fechaIncidente}`,
              `Reportado por: ${usuario}`
            ];
          }
        }
      }
    },
  };

  return (
    <div className="p-4 flex flex-col justify-between w-full mx-auto bg-white shadow-lg h-full">
      <div className="flex justify-between items-center mr-10 mt-4">
        <h2 className="text-base font-bold mb-4 font-zen-kaku">Ocurrencia de accidentes</h2>
        <div className="flex space-x-2">
          <button
            onClick={handleRefresh}
            className="p-2 rounded hover:text-teal-500 transition-colors flex items-center justify-center"
          >
            <ArrowPathIcon className="h-6 w-6 transition-transform duration-200 ease-in-out hover:rotate-180" />
          </button>
          <button
            onClick={openModal}
            className="p-2 rounded hover:text-teal-500 transition-colors flex items-center justify-center"
          >
            <CogIcon className="h-6 w-6 transition-transform duration-200 ease-in-out hover:rotate-90" />
          </button>
        </div>
      </div>

      <div className="relative h-60 mt-4">
        {!loading ? (
          chartData.datasets.length > 0 && chartData.datasets[0].data.length > 0 ? (
            <Scatter data={chartData} options={options} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-gray-500 mb-4">No hay accidentes para la semana seleccionada</div>
              <button
                onClick={handleCurrentWeek}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Ir a semana actual
              </button>
            </div>
          )
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Cargando datos de accidentes...</div>
          </div>
        )}
      </div>
      
      <div className="mt-2 text-center">
        <p className="text-sm font-zen-kaku text-gray-600">
          {chartData.datasets.length > 0 && chartData.datasets[0].data.length > 0 
            ? `${chartData.datasets.reduce((total, dataset) => total + dataset.data.length, 0)} accidentes registrados en la semana ${getFormattedWeekRange(currentWeek)}`
            : `No hay accidentes registrados para la semana ${getFormattedWeekRange(currentWeek)}`
          }
        </p>
        <p className="text-sm font-zen-kaku text-center">{actualizado}</p>
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Configuraciones"
        ariaHideApp={false}
        style={{
          content: {
            width: "fit-content",
            height: "fit-content",
            margin: "auto",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
            backgroundColor: "#fff",
          },
        }}
      >
        <h2 className="text-xl font-bold mb-4">
          Configuraciones del Gráfico
        </h2>

        {/* Mostrar la semana actual */}
        <div className="text-center text-gray-600 mb-4">
          <div className="font-semibold">Semana Actual:</div>
          <div>{getFormattedWeekRange(currentWeek)}</div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">
              <input
                type="checkbox"
                checked={showLegend}
                onChange={handleLegendChange}
                aria-label="Casilla de mostrar leyenda"
                className="mr-2"
              />
              Mostrar Leyenda
            </label>
          </div>
          <div>
            <label className="block font-semibold mb-1">
              <input
                type="checkbox"
                checked={showTooltips}
                onChange={handleTooltipsChange}
                aria-label="Casilla de mostrar tooltips"
                className="mr-2"
              />
              Mostrar Tooltips
            </label>
          </div>
          <div>
            <label className="block font-semibold mb-1">
              Tamaño de Puntos:
              <input
                type="range"
                min="4"
                aria-label="Ingreso de tamaño de puntos"
                max="16"
                value={pointSize}
                onChange={handlePointSizeChange}
                className="ml-2 w-full"
              />
              <span className="text-sm text-gray-600 ml-2">{pointSize}px</span>
            </label>
          </div>
        </div>

        <div className="mt-4 flex justify-center space-x-4">
          <button
            onClick={handlePreviousWeek}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg flex flex-col items-center"
          >
            <span className="font-semibold">Semana Anterior</span>
            <span className="text-sm text-gray-200">
              {getFormattedWeekRange(subWeeks(currentWeek, 1))}
            </span>
          </button>
          <button
            onClick={handleNextWeek}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg flex flex-col items-center"
          >
            <span className="font-semibold">Semana Siguiente</span>
            <span className="text-sm text-gray-200">
              {getFormattedWeekRange(addWeeks(currentWeek, 1))}
            </span>
          </button>
        </div>

        <div className="mt-4 flex justify-center space-x-2">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-yellow-500 text-white rounded"
          >
            Reiniciar Configuraciones
          </button>
          <button
            onClick={closeModal}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Cerrar
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ScatterChart;