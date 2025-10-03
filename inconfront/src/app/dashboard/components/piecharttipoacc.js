import React, { useState, useEffect, useCallback } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import Modal from 'react-modal';

import { ArrowPathIcon , Cog6ToothIcon  } from '@heroicons/react/24/solid';


ChartJS.register(ArcElement, Tooltip, Legend);

const PieChartacc = ({ accidentData = {}, actualizado, fetchProjects }) => {  // Proporciona un valor por defecto a accidentData
  const initialSettings = {
    chartType: 'pie',
    showLegend: true,
    hiddenLegends: {},
  };

  const [chartType, setChartType] = useState(initialSettings.chartType);
  const [showLegend, setShowLegend] = useState(initialSettings.showLegend);
  const [hiddenLegends, setHiddenLegends] = useState(initialSettings.hiddenLegends);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const colors = ['#d1e7dd', '#fff3cd', '#f8d7da'];

  const total = Object.values(accidentData).reduce((acc, curr) => acc + curr, 0);

  const data = {
    labels: Object.keys(accidentData),
    datasets: [
      {
        data: Object.keys(accidentData).map(key => hiddenLegends[key] ? 0 : accidentData[key]),
        backgroundColor: colors,
        borderColor: colors,
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
            size: 12,
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

  const handleRefresh = useCallback(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  return (
    <div className="p-4 flex flex-col justify-between w-full mx-auto bg-white shadow-lg h-full">
      <div className="flex justify-between items-center mr-10 mt-4">
        <h2 className="text-base font-bold mb-4 font-zen-kaku">Tipos de accidentes</h2>
        <div className="flex space-x-2">
          <button onClick={handleRefresh} className="p-2 rounded hover:text-teal-500 transition-colors flex items-center justify-center">
            <ArrowPathIcon className="h-6 w-6 transition-transform duration-200 ease-in-out hover:rotate-180" />
          </button>
          <button onClick={openModal} className="p-2 rounded hover:text-teal-500 transition-colors flex items-center justify-center">
            <Cog6ToothIcon  className="h-6 w-6 transition-transform duration-200 ease-in-out hover:rotate-90" />
          </button>
        </div>
      </div>

      <div className="relative h-60 mt-16">
        <Pie options={options} data={data} />
      </div>
      <p className="mt-4 text-sm font-zen-kaku text-center">{`${actualizado}`}</p>

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
        <h2 className="text-xl font-bold mb-4 font-zen-kaku">Configuraciones del Gráfico</h2>
        <div className="space-y-4">
          <div>
            <label className="block font-semibold mb-1 font-zen-kaku">Tipo de Gráfico:</label>
            <select aria-label="Casilla seleccionable Tipo de gráfico" value={chartType} onChange={handleChartTypeChange} className="w-full border border-gray-300 hover:bg-white transition-all duration-150 ease-linear rounded p-2 font-zen-kaku">
              <option value="pie">Pastel</option>
              <option value="doughnut">Doughnut</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1 font-zen-kaku">
              <input
                type="checkbox"
                aria-label="Casilla de mostrar leyenda"
                checked={showLegend}
                onChange={handleLegendChange}
                className="mr-2"
              />
              Mostrar Leyenda
            </label>
          </div>
          <div className="font-semibold mb-1 font-zen-kaku">Ocultar Leyendas Individuales:</div>
          {Object.keys(accidentData).map((type) => (
            <div key={type}>
              <label className="block font-semibold mb-1 font-zen-kaku">
                <input
                  type="checkbox"
                  aria-label="Casilla de ocultar leyendas individuales"
                  name={type}
                  checked={!hiddenLegends[type]}
                  onChange={handleHiddenLegendChange}
                  className="mr-2"
                />
                {type}
              </label>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-center space-x-2">
          <button onClick={handleRefresh} className="px-4 py-2 bg-teal-500 hover:bg-teal-600 transition-all ease-linear duration-150 text-white rounded font-zen-kaku">
            Actualizar
          </button>
          <button onClick={closeModal} className="px-4 py-2 bg-red-400 hover:bg-red-500 transition-all ease-linear duration-150 text-white rounded font-zen-kaku">
            Cerrar
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default PieChartacc;
