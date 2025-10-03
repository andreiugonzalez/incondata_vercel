import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';
import "../style/media_query.css";

const CircularChart = ({ percentage, color, actualizado }) => {
  const data = {
    datasets: [{
      data: [percentage, 100 - percentage],
      backgroundColor: [color, '#ecf0f1'],
      borderWidth: 6,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '80%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  };

  return (

    <div className="chart-container relative xl:w-32 xl:h-32 lg:w-28 lg:h-28 md:w-20 md:h-20 sm:w-20 sm:h-20">
      <Doughnut data={data} options={options} />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="chart-text xl:text-2xl lg:text-2xl font-bold">{percentage}%</span>
      </div>
    </div>
  );
};

const ProjectProgress = ({ percentage, actualizado }) => {
  // Función para validar y convertir NaN a 0
  const validatePercentage = (value) => {
    const percentage = parseFloat(value);
    return isNaN(percentage) ? 0 : percentage;
  };

 // console.log(percentage);

  const chartData = [
    { percentage: validatePercentage(percentage.planificacion), label: 'Planeación', subLabel: `${validatePercentage(percentage.planificacion)}%`, color: '#b3cde0' },
    { percentage: validatePercentage(percentage.ejecucion), label: 'Ejecución', subLabel: `${validatePercentage(percentage.ejecucion)}%`, color: '#fbb4ae' },
    { percentage: validatePercentage(percentage.pendiente), label: 'Pendiente', subLabel: `${validatePercentage(percentage.pendiente)}%`, color: '#ef8172' },
  ];

  return (
    <div className="flex flex-col items-center justify-center w-full h-full max-w-fll p-4 bg-white rounded-lg shadow-lg">
      <div className="block mb-5 text-base font-bold text-center font-zen-kaku">Progreso del proyecto partidas</div>
      <div className="flex justify-around w-full mb-4 font-zen-kaku ">
        {chartData.map((data, index) => (
          <div key={index} className="flex flex-col items-center">
            <CircularChart percentage={data.percentage} color={data.color} />
            <div className="mt-2 text-center">
              <div className="text-sm font-zen-kaku">{data.label}</div>
              <div className="text-sm font-bold text-black font-zen-kaku">{data.subLabel}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center mb-4 space-x-2 font-zen-kaku custom-chart-porcentaje">
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 bg-[#b3cde0] rounded-full inline-block"></span>
          <span className="text-sm">Planeación</span>
          <span className="text-sm font-bold font-zen-kaku">{validatePercentage(percentage.planificacion)}%</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 bg-[#fbb4ae] rounded-full inline-block"></span>
          <span className="text-sm">Ejecución</span>
          <span className="text-sm font-bold font-zen-kaku">{validatePercentage(percentage.ejecucion)}%</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 bg-[#ef8172] rounded-full inline-block"></span>
          <span className="text-sm">Pendiente</span>
          <span className="text-sm font-bold font-zen-kaku">{validatePercentage(percentage.pendiente)}%</span>
        </div>
      </div>
      <span className="mt-4 text-xs text-gray-500 font-zen-kaku">{actualizado}</span>
    </div>
  );
};

export default ProjectProgress;
