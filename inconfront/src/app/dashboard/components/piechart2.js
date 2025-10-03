import React, { useState, useEffect } from 'react';
import { Pie, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import Modal from 'react-modal';
import { Padding } from '@mui/icons-material';
import { CogIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import "../style/media_query.css";

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart2 = ({usuariosPorRol}) => {
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

  const filteredUsuariosPorRol = Object.keys(usuariosPorRol)
    .filter(role => role !== 'superadmin' && role !== 'admin')
    .reduce((obj, key) => {
      obj[key] = usuariosPorRol[key];
      return obj;
    }, {});
    const colors = [
      '#94a3b8',
      '#fda4af',
      '#64748b',
      '#a8a29e',
      '#f7bd83',
      '#b1c3d7',
      '#e59696',
      '#75b9be',
      '#b2a2cf',
    ];

    const total = Object.values(filteredUsuariosPorRol).reduce((acc, curr) => acc + curr, 0);

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
            size: 12, // Aumenta el tamaño de la fuente si es necesario
          },
          generateLabels: (chart) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const value = data.datasets[0].data[i];
                return {
                  text: `${label} (${value})`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  hidden: isNaN(data.datasets[0].data[i]) || data.datasets[0].data[i] === 0,
                  lineCap: 'round',
                  lineDash: [],
                  lineDashOffset: 0,
                  lineJoin: 'round',
                  strokeStyle: data.datasets[0].borderColor[i],
                  pointStyle: 'circle',
                  rotation: 0,
                };
              });
            }
            return [];
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const value = context.raw;
            const percentage = ((value / total) * 100).toFixed(2);
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
    //console.log('Datos actualizados');
  };

  useEffect(() => {
    handleRefresh();
  }, [usuariosPorRol]);

  const renderChart = () => {
    switch (chartType) {
      case 'pie':
        return <Pie options={options} data={data} />;
      case 'doughnut':
        return <Doughnut options={options} data={data} />;
      default:
        return <Pie options={options} data={data} />;
    }
  };

  return (
    <div className="flex flex-col items-center bg-white shadow-lg p-4 max-w-full w-full h-full font-zen-kaku">
      <div className="flex w-full max-w-full justify-start items-start mb-4 flex-wrap">

        <div className="flex flex-col items-start mr-4">
        <div className="flex items-center">
          <button onClick={handleRefresh} className="p-2 rounded hover:text-teal-500 transition-colors flex items-center justify-center">
            <ArrowPathIcon className="h-6 w-6 transition-transform duration-200 ease-in-out hover:rotate-180" />
          </button>
          <button onClick={openModal} className="p-2 rounded hover:text-teal-500 transition-colors flex items-center justify-center">
            <CogIcon className="h-6 w-6 transition-transform duration-200 ease-in-out hover:rotate-90" />
          </button>
        </div>
          <h2 className="text-base mb-4">Número de dotación de personal por cargo</h2>

          <div className="flex items-center mb-4">
            <div className="flex flex-col items-center">
              <span className="text-4xl font-bold">{total}</span>
              <span>Total de dotación de personal</span>
            </div>
          </div>
        </div>
        <div className="flex justify-start w-full max-w-full overflow-auto">
    <div className="relative w-full max-w-full min-w-0 mt-16">
      {renderChart()}
    </div>
  </div>
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
            <select aria-label="Campo de seleccion tipo de gráfico" value={chartType} onChange={handleChartTypeChange} className="w-full border border-gray-300 rounded p-2">
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
          {Object.keys(filteredUsuariosPorRol).map((role) => (
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
          <button onClick={handleRefresh} className="px-4 py-2 bg-blue-500 text-white rounded">
            Actualizar
          </button>
          <button onClick={closeModal} className="px-4 py-2 bg-red-500 text-white rounded">
            Cerrar
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default PieChart2;