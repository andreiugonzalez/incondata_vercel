import React, { useEffect, useState, useCallback } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { gethisoticoPartidas, saveUserChartSettings, getUserChartSettings } from "@/app/services/chart_service"; // Ajusta la ruta según tu estructura de archivos
import 'chart.js/auto';
import { format, startOfWeek, addDays, endOfWeek, subWeeks, addWeeks } from 'date-fns';
import Modal from 'react-modal';


import { ArrowPathIcon , Cog6ToothIcon  } from '@heroicons/react/24/solid'; // Sustituye `RefreshIcon` por `ArrowPathIcon`

import { es } from 'date-fns/locale';
const { useRouter } = require('next/navigation');
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux'; // Importar el hook de Redux
import toast from 'react-hot-toast'; // Importar toast para notificaciones
import Loader from '@/app/dashboard/components/loader'; // Asumimos que tienes un componente Loader


const getWeekLabels = (start) => {
  const labels = [];
  const daysInSpanish = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
  for (let i = 0; i < 7; i++) {
    const day = addDays(start, i);
    labels.push(`${daysInSpanish[i]} ${format(day, 'dd/MM', { locale: es })}`);
  }
  return labels;
};

const processData = (data, weekStart) => {
  const horasHombre = Array(7).fill(0);
  const horasMaquina = Array(7).fill(0);

  // Filtrar solo registros de PARTIDAS (nivel más alto) para evitar duplicación
  const partidasUnicamente = data.filter(item => item.id_partida && !item.id_subpartida && !item.id_task && !item.id_subtask);
  

  partidasUnicamente.forEach(item => {
    // Manejar tanto datos directos como estructura con históricos
    if (item.historicos && item.historicos.length > 0) {
      // Si tiene estructura de históricos, procesar solo los históricos
      item.historicos.forEach(historico => {
        const date = new Date(historico.createdAt);
        const day = date.getDay();
        const index = (day + 6) % 7;

        if (date >= weekStart && date < addDays(weekStart, 7)) {
          horasHombre[index] = parseFloat((horasHombre[index] + parseFloat(historico.horas_hombre || 0)).toFixed(2));
          horasMaquina[index] = parseFloat((horasMaquina[index] + parseFloat(historico.horas_maquina || 0)).toFixed(2));
        }
      });
    } else if (item.createdAt) {
      // Si es dato directo (sin históricos), procesar normalmente
      const date = new Date(item.createdAt);
      const day = date.getDay();
      const index = (day + 6) % 7;

      if (date >= weekStart && date < addDays(weekStart, 7)) {
        horasHombre[index] = parseFloat((horasHombre[index] + parseFloat(item.horas_hombre || 0)).toFixed(2));
        horasMaquina[index] = parseFloat((horasMaquina[index] + parseFloat(item.horas_maquina || 0)).toFixed(2));
      }
    }
  });

  // Ver totales finales
  const totalHH = horasHombre.reduce((sum, h) => sum + h, 0);
  const totalHM = horasMaquina.reduce((sum, h) => sum + h, 0);

  const maxHorasHombre = Math.max(...horasHombre);
  const maxHorasMaquina = Math.max(...horasMaquina);
  const maxY = Math.max(maxHorasHombre, maxHorasMaquina) * 1.2; // Agregar un 20% al valor máximo

  const labels = getWeekLabels(weekStart);
  return { labels, horasHombre, horasMaquina, maxY };
};

const LineChartComponent = ({ projectId }) => {


  const chartId = 3;
  const userStore = useSelector((state) => state.user);
  const userId = userStore.user ? userStore.user.id : ''; // Obtener userId de la store de Redux



  const initialSettings = {
    chartType: 'line',
    categories: { horasHombre: true, horasMaquina: true },
    showLegend: true,
    gridLines: true,
    yAxisMin: 0,
    yAxisMax: null,
  };

  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [chartData, setChartData] = useState({
    labels: getWeekLabels(currentWeek),
    datasets: [
      {
        label: 'Horas hombre',
        data: [0, 0, 0, 0, 0, 0, 0],
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: 'rgba(255, 99, 132, 1)',
      },
      {
        label: 'Horas máquina',
        data: [0, 0, 0, 0, 0, 0, 0],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: 'rgba(75, 192, 192, 1)',
      },
    ],
  });

  const [actualizado, setActualizado] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chartType, setChartType] = useState(initialSettings.chartType);
  const [categories, setCategories] = useState(initialSettings.categories);
  const [showLegend, setShowLegend] = useState(initialSettings.showLegend);
  const [gridLines, setGridLines] = useState(initialSettings.gridLines);
  const [yAxisMin, setYAxisMin] = useState(initialSettings.yAxisMin);
  const [yAxisMax, setYAxisMax] = useState(initialSettings.yAxisMax);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingDOM, setLoadingDOM] = useState(true); // Loader para la carga inicial del DOM



  // Función para guardar configuraciones
  const saveSettings = async () => {
    const settingsData = {
      userId,
      projectId,
      chartId,
      settings: {
        chartType,
        categories,
        showLegend,
        gridLines,
        yAxisMin,
        yAxisMax,
      },
    };
    try {
      await saveUserChartSettings(settingsData);
      toast.success('Configuraciones guardadas correctamente');
    } catch (error) {
      console.error('Error al guardar las configuraciones:', error);
      toast.error('Error al guardar las configuraciones');
    }
  };

  // Función para recuperar configuraciones
  useEffect(() => {
    const fetchChartSettings = async () => {
      try {
        const savedSettings = await getUserChartSettings(userId, projectId, chartId);
        if (savedSettings && savedSettings.length > 0 && savedSettings[0].settings) {
          const { chartType, categories, showLegend, gridLines, yAxisMin, yAxisMax } = savedSettings[0].settings;
          setChartType(chartType);
          setCategories(categories);
          setShowLegend(showLegend);
          setGridLines(gridLines);
          setYAxisMin(yAxisMin);
          setYAxisMax(yAxisMax);
        }
      } catch (error) {
        console.error('Error al cargar configuraciones:', error);
      }
    };

    if (userId && projectId) {
      fetchChartSettings();
    }
  }, [userId, projectId, chartId]);


  const fetchEventos = useCallback(async (weekStart) => {
    try {
      const response = await gethisoticoPartidas(projectId);
      const data = response;

      const { labels, horasHombre, horasMaquina, maxY } = processData(data, weekStart);

      const datasets = [];
      if (categories.horasHombre) {
        datasets.push({
          label: 'Horas hombre',
          data: horasHombre,
        });
      }
      if (categories.horasMaquina) {
        datasets.push({
          label: 'Horas máquina',
          data: horasMaquina,
        });
      }

      setChartData({
        labels,
        datasets,
      });

      setYAxisMax(maxY);
      setActualizado(new Date().toLocaleString());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoadingDOM(false); // Desactivar loader DOM después de cargar los datos
    }
  }, [projectId, categories]);

  useEffect(() => {
    fetchEventos(currentWeek);
  }, [projectId, categories, currentWeek, fetchEventos]);



  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: chartType === 'stackedBar',
        grid: {
          display: gridLines,
        },
      },
      y: {
        stacked: chartType === 'stackedBar',
        beginAtZero: true,
        min: yAxisMin,
        max: yAxisMax,
        ticks: {
          callback: function (value) {
            // Redondear y mostrar máximo 1 decimal
            return parseFloat(value).toFixed(value % 1 === 0 ? 0 : 1);
          },
        },
        grid: {
          display: gridLines,
        },
      },
    },
    plugins: {
      legend: {
        display: showLegend,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const value = parseFloat(tooltipItem.raw);
            return `${tooltipItem.dataset.label}: ${value.toFixed(1)}`;
          },
        },
      },
    },
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    saveSettings();
    setIsModalOpen(false);
  };

  const handleChartTypeChange = (e) => {
    const selectedChartType = e.target.value;
    setChartType(selectedChartType);
  };

  const handleCategoryChange = (e) => {
    setCategories({ ...categories, [e.target.name]: e.target.checked });
  };

  const handleLegendChange = (e) => {
    setShowLegend(e.target.checked);
  };

  const handleGridLinesChange = (e) => {
    setGridLines(e.target.checked);
  };

  const handleYAxisMinChange = (e) => {
    const value = Number(e.target.value);
    if (value >= 0 && (yAxisMax === null || value < yAxisMax)) {
      setYAxisMin(value);
    } else {
      alert('El valor mínimo debe ser mayor o igual a 0 y menor que el valor máximo.');
    }
  };

  const handleYAxisMaxChange = (e) => {
    const value = Number(e.target.value);
    if (value > yAxisMin) {
      setYAxisMax(value);
    } else {
      alert('El valor máximo debe ser mayor que el valor mínimo.');
    }
  };

  const handlePreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const handleRefresh = () => {
    fetchEventos(currentWeek);
  };

  const handleReset = () => {
    setChartType(initialSettings.chartType);
    setCategories(initialSettings.categories);
    setShowLegend(initialSettings.showLegend);
    setGridLines(initialSettings.gridLines);
    setYAxisMin(initialSettings.yAxisMin);
    setYAxisMax(initialSettings.yAxisMax);
  };

  const isChartDataEmpty =
    !chartData || !chartData.datasets || chartData.datasets.length === 0;

  const allDataZero = chartData.datasets.every(dataset =>
    dataset.data.every(value => value === 0)
  );

  const showMessage = isChartDataEmpty || allDataZero;

  const renderChart = () => {

    switch (chartType) {
      case 'bar':
        return <Bar options={options} data={chartData} />;
      case 'stackedBar':
        return <Bar options={{ ...options, scales: { x: { stacked: true }, y: { stacked: true } } }} data={chartData} />;
      case 'line':
        return <Line options={options} data={chartData} />;
      default:
        return <Line options={options} data={chartData} />;
    }
  };

  const handleLabelClick = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    router.push(`/dashboard/partida_suma?project=${projectId}`);
  };


  const getFormattedWeekRange = (start) => {
    const startDate = format(start, 'dd/MM', { locale: es });
    const endDate = format(endOfWeek(start, { weekStartsOn: 1 }), 'dd/MM', { locale: es });
    return `${startDate} - ${endDate}`;
  };


  return (
    <div className="p-4 w-full mx-auto bg-white shadow-lg h-full">
      <div className="relative h-96">
        {loadingDOM ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
            <Loader /> {/* Loader durante la carga del gráfico */}
          </div>
        ) : (
          <>
            {/* Encabezado y botones */}
            <div className="flex justify-between items-center mr-10 mt-4">
              <h2 className="text-base font-bold mb-4 font-zen-kaku">Horas hombre y horas máquina</h2>

              <div className="flex space-x-2">
                <button
                  onClick={handleRefresh}
                  className="p-2 rounded hover:bg-[#5c7891] transition-colors flex items-center justify-center"
                >
                  <ArrowPathIcon
                    className="h-6 w-6 transition-transform duration-200 ease-in-out hover:rotate-180"
                  />
                </button>
                <button
                  onClick={openModal}
                  className="p-2 rounded hover:text-[#5c7891] transition-colors flex items-center justify-center"
                >
                  <Cog6ToothIcon
                    className="h-6 w-6 transition-transform duration-200 ease-in-out hover:rotate-90"
                  />
                </button>
              </div>
            </div>
  
            {/* Render del gráfico o mensaje */}
            {showMessage ? (
              <div className="flex flex-col items-center justify-center h-full font-zen-kaku">
                <p className="text-xl font-semibold mb-4">
                  Por favor, insertar datos en sumazalda
                </p>
                <motion.button
                  onClick={handleLabelClick}
                  className="bg-[#5c7891] text-white px-4 py-2 rounded hover:bg-[#597387] transition-colors ease-linear duration-150"
                  whileTap={{ scale: 0.95 }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="none"
                          d="M4 12a8 8 0 0116 0 8 8 0 01-16 0"
                        ></path>
                      </svg>
                      Cargando...
                    </span>
                  ) : (
                    'Ir'
                  )}
                </motion.button>
              </div>
            ) : (
              renderChart()
            )}
            
            {!showMessage && (
              <div className="text-center font-zen-kaku">
                <p>{actualizado}</p>
              </div>
            )}
          </>
        )}
      </div>
  
      {/* Modal de configuraciones */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Configuraciones"
        ariaHideApp={false}
        style={{
          content: {
            width: 'fit-content',
            height: 'fit-content',
            margin: 'auto',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            backgroundColor: '#fff',
          },
        }}
      >
        <h2 className="text-xl font-bold mb-4">Configuraciones del Gráfico</h2>
  
        <div className="text-center text-gray-600 mb-4">
          <div className="font-semibold">Semana Actual:</div>
          <div>{getFormattedWeekRange(currentWeek)}</div>
        </div>
  
        <div className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">Tipo de Gráfico:</label>
            <select value={chartType} onChange={handleChartTypeChange} className="w-full border border-gray-300 rounded p-2" aria-label="Seleccionar tipo de gráfico">
              <option value="bar">Barras</option>
              <option value="stackedBar">Barras Apiladas</option>
              <option value="line">Líneas</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1">
              <input
                type="checkbox"
                name="horasHombre"
                aria-label="Casilla mostrar horas hombre"
                checked={categories.horasHombre}
                onChange={handleCategoryChange}
                className="mr-2"
              />
              Mostrar Horas Hombre
            </label>
          </div>
          <div>
            <label className="block font-semibold mb-1">
              <input
                type="checkbox"
                name="horasMaquina"
                aria-label="Casilla mostrar horas maquina"
                checked={categories.horasMaquina}
                onChange={handleCategoryChange}
                className="mr-2"
              />
              Mostrar Horas Máquina
            </label>
          </div>
          <div>
            <label className="block font-semibold mb-1">
              <input
                type="checkbox"
                checked={showLegend}
                aria-label="Mostrar horas leyenda"
                onChange={handleLegendChange}
                className="mr-2"
              />
              Mostrar Leyenda
            </label>
          </div>
          <div>
            <label className="block font-semibold mb-1">
              <input
                type="checkbox"
                aria-label="Casilla mostrar líneas de cuadrícula"
                checked={gridLines}
                onChange={handleGridLinesChange}
                className="mr-2"
              />
              Mostrar Líneas de Cuadrícula
            </label>
          </div>
          <div>
            <label className="block font-semibold mb-1">
              Rango Mínimo del Eje Y:
              <input
                type="number"
                aria-label="Ingresar rango minimo del eje y"
                value={yAxisMin}
                onChange={handleYAxisMinChange}
                className="ml-2 border border-gray-300 rounded p-2"
              />
            </label>
          </div>
          <div>
            <label className="block font-semibold mb-1">
              Rango Máximo del Eje Y:
              <input
                type="number"
                aria-label="Ingresar rango maximo del eje y"
                value={yAxisMax}
                onChange={handleYAxisMaxChange}
                className="ml-2 border border-gray-300 rounded p-2"
              />
            </label>
          </div>
        </div>
        <div className="mt-4 flex justify-center space-x-4">
          <button onClick={handlePreviousWeek} className="px-6 py-3 bg-[#5c7891] text-white rounded-lg flex flex-col items-center">
            <span className="font-semibold">Semana Anterior</span>
            <span className="text-sm text-gray-200">{getFormattedWeekRange(subWeeks(currentWeek, 1))}</span>
          </button>
          <button onClick={handleNextWeek} className="px-6 py-3 bg-[#5c7891] text-white rounded-lg flex flex-col items-center">
            <span className="font-semibold">Semana Siguiente</span>
            <span className="text-sm text-gray-200">{getFormattedWeekRange(addWeeks(currentWeek, 1))}</span>
          </button>
        </div>
  
        <div className="mt-4 flex justify-center space-x-2">
          <button onClick={handleReset} className="px-4 py-2 bg-yellow-500 text-white rounded">
            Reiniciar Configuraciones
          </button>
          <button onClick={closeModal} className="px-4 py-2 bg-red-500 text-white rounded">
            Cerrar
          </button>
        </div>
      </Modal>
    </div>
  );
  
};

export default LineChartComponent;
