import React, { useState, useEffect } from 'react';
import { Pie, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import Modal from 'react-modal';
import { CogIcon, ArrowPathIcon  } from '@heroicons/react/24/outline';
import { saveUserChartSettings, getUserChartSettings } from '@/app/services/chart_service'; // Importar servicios
import { useSelector } from 'react-redux'; // Importar el hook de Redux
import { useSearchParams } from 'next/navigation'; // Importar el hook para parámetros de búsqueda
import toast from 'react-hot-toast'; // Importar toast para notificaciones
import Loader from '@/app/dashboard/components/loader'; // Asumimos que tienes un componente Loader

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({ usuariosPorRol }) => {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId'); // Obtener el valor de la URL

  const userStore = useSelector((state) => state.user);
  const userId = userStore.user ? userStore.user.id : ''; // Obtener userId de la store de Redux

  const chartId = 1; // Asignar un chartId directamente

  const initialSettings = {
    chartType: 'pie',
    showLegend: true,
    hiddenLegends: {},
  };

  const [chartType, setChartType] = useState(initialSettings.chartType);
  const [showLegend, setShowLegend] = useState(initialSettings.showLegend);
  const [hiddenLegends, setHiddenLegends] = useState(initialSettings.hiddenLegends);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actualizado, setActualizado] = useState('');
  const [loading, setLoading] = useState(true); // Estado de carga
  const [chartData, setChartData] = useState(null);

  // Función para cargar las configuraciones
  useEffect(() => {
    const fetchChartSettings = async () => {
      try {
        const savedSettings = await getUserChartSettings(userId, projectId, chartId);
        if (savedSettings && savedSettings.length > 0 && savedSettings[0].settings) {
          const { chartType, showLegend, hiddenLegends } = savedSettings[0].settings;
          setChartType(chartType);
          setShowLegend(showLegend);
          setHiddenLegends(hiddenLegends || {});
        }
      } catch (error) {
        console.error('Error al cargar las configuraciones:', error);
        toast.error('Error al cargar las configuraciones');
      } finally {
        setLoading(false); // Finaliza la carga
      }
    };

    if (userId && projectId) {
      fetchChartSettings();
    }
  }, [userId, projectId, chartId]);

  useEffect(() => {
    if (!loading) {
      // Actualizar el gráfico cuando las configuraciones cambian
      const filteredUsuariosPorRol = Object.keys(usuariosPorRol)
        .filter(role => role !== 'superadmin' && role !== 'admin')
        .reduce((obj, key) => {
          obj[key] = usuariosPorRol[key];
          return obj;
        }, {});

      const total = Object.values(filteredUsuariosPorRol).reduce((acc, curr) => acc + curr, 0);

      const colors = [
        '#94a3b8', '#fda4af', '#64748b', '#a8a29e',
        '#f7bd83', '#b1c3d7', '#e59696', '#75b9be', '#b2a2cf',
      ];

      const data = {
        labels: Object.keys(filteredUsuariosPorRol),
        datasets: [
          {
            data: Object.keys(filteredUsuariosPorRol).map(key => hiddenLegends[key] ? 0 : usuariosPorRol[key]),
            backgroundColor: colors.slice(0, Object.keys(filteredUsuariosPorRol).length),
            borderColor: colors.slice(0, Object.keys(filteredUsuariosPorRol).length),
            borderWidth: 1,
          },
        ],
      };

      setChartData(data);
    }
  }, [usuariosPorRol, chartType, showLegend, hiddenLegends, loading]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: 'right',
        labels: {
          filter: (legendItem) => !hiddenLegends[legendItem.text],
          padding: 4,
          boxWidth: 10,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const value = context.raw;
            const percentage = ((value / Object.values(usuariosPorRol).reduce((acc, curr) => acc + curr, 0)) * 100).toFixed(2);
            return `${percentage}%`;
          },
        },
      },
    },
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    saveSettings(); // Guardar configuración al cerrar el modal
    setIsModalOpen(false);
  };

  const handleChartTypeChange = (e) => {
    setChartType(e.target.value);
  };

  const handleLegendChange = (e) => {
    setShowLegend(e.target.checked);
  };

  const handleHiddenLegendChange = (e) => {
    const { name, checked } = e.target;
    setHiddenLegends({ ...hiddenLegends, [name]: !checked });
  };

  const handleRefresh = () => {
    setActualizado(new Date().toLocaleString());
  };

  // Función para restablecer los valores predeterminados
  const resetToDefault = () => {
    setChartType(initialSettings.chartType);
    setShowLegend(initialSettings.showLegend);
    setHiddenLegends(initialSettings.hiddenLegends);
    toast.success('Valores restablecidos a los predeterminados');
  };

  useEffect(() => {
    handleRefresh();
  }, [usuariosPorRol]);

  const renderChart = () => {
    if (loading || !chartData) return <Loader />; // Mostrar loader mientras cargan los datos
    switch (chartType) {
      case 'pie':
        return <Pie options={options} data={chartData} />;
      case 'doughnut':
        return <Doughnut options={options} data={chartData} />;
      default:
        return <Pie options={options} data={chartData} />;
    }
  };

  // Función para guardar las configuraciones
  const saveSettings = async () => {
    if (!userId || !projectId) {
      toast.error('Faltan el userId o projectId');
      return;
    }

    const settingsData = {
      userId, // Obtenido desde Redux
      projectId, // Obtenido desde la URL
      chartId, // Asignado directamente en el componente
      settings: {
        chartType,
        showLegend,
        hiddenLegends,
      },
    };


    try {
      await saveUserChartSettings(settingsData); // Llamar al servicio de guardado
      toast.success('Configuraciones guardadas correctamente');
    } catch (error) {
      console.error('Error al guardar las configuraciones:', error);
      toast.error('Error al guardar las configuraciones');
    }
  };

  return (
    <div className="p-4 w-full mx-auto bg-white shadow-lg h-full max-w-lg relative">
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
          <Loader /> {/* Muestra el loader */}
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mr-10 mt-4">
            <h2 className="text-base font-bold mb-4 font-zen-kaku">Número de dotación de personal por cargo</h2>
            <div className="flex space-x-2">
              <button onClick={handleRefresh} className="p-2 rounded hover:text-[#5c7891] transition-colors flex items-center justify-center">
                <ArrowPathIcon className="h-6 w-6 transition-transform duration-200 ease-in-out hover:rotate-180" />
              </button>
              <button onClick={openModal} className="p-2 rounded hover:text-[#5c7891] transition-colors flex items-center justify-center">
                <CogIcon className="h-6 w-6 transition-transform duration-200 ease-in-out hover:rotate-90" />
              </button>
            </div>
          </div>

          <div className="relative h-60 mt-16">
            {renderChart()}
          </div>

          <div className="mt-4 flex flex-col items-center">
            <span className="text-4xl font-bold">{Object.values(usuariosPorRol).reduce((acc, curr) => acc + curr, 0)}</span>
            <span className="ml-2 text-start">Total de dotación de personal</span>
          </div>
          <p className="mt-4 text-sm font-zen-kaku text-center">{actualizado}</p>

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
            <div className="space-y-4">
              <div>
                <label className="block font-semibold mb-1">Tipo de Gráfico:</label>
                <select aria-label="Campo de seleccion Tipo de gráfico" value={chartType} onChange={handleChartTypeChange} className="w-full border border-gray-300 rounded p-2">
                  <option value="pie">Pastel</option>
                  <option value="doughnut">Doughnut</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">
                  <input
                    type="checkbox"
                    aria-label="Casilla mostrar leyenda"
                    checked={showLegend}
                    onChange={handleLegendChange}
                    className="mr-2"
                  />
                  Mostrar Leyenda
                </label>
              </div>
              <div className="font-semibold mb-1">Ocultar Leyendas Individuales:</div>
              {Object.keys(usuariosPorRol).map((role) => (
                <div key={role}>
                  <label className="block font-semibold mb-1">
                    <input
                      type="checkbox"
                      aria-label="Casilla ocultar leyendas individuales"
                      name={role}
                      checked={!hiddenLegends[role]}
                      onChange={handleHiddenLegendChange}
                      className="mr-2"
                    />
                    {role}
                  </label>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-center space-x-2">
              {/* <button onClick={saveSettings} className="px-4 py-2 bg-blue-500 text-white rounded">
                Guardar
              </button> */}
              <button onClick={resetToDefault} className="px-4 py-2 bg-gray-500 text-white rounded">
                Restablecer
              </button>
              <button onClick={closeModal} className="px-4 py-2 bg-red-500 text-white rounded">
                Cerrar
              </button>
            </div>
          </Modal>
        </>
      )}
    </div>
  );
};

export default PieChart;
