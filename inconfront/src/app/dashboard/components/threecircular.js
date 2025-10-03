import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const CircularChartthree = ({ percentage, label, subLabel, color, mainLabel }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const data = {
      datasets: [{
        data: percentage === 100 ? [100] : [percentage, 100 - percentage],
        backgroundColor: percentage === 100 ? [color] : [color, '#ecf0f1'],
        borderWidth: 2,
        borderRadius: 10,
      }],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '80%', // Ajustar el recorte para que el gráfico sea visible pero delgado
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: false,
        },
      },
    };

    chartInstanceRef.current = new Chart(ctx, {
      type: 'doughnut',
      data: data,
      options: options,
    });

  }, [percentage, color]);

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 w-full h-full flex flex-col justify-between">
      <div className="text-center text-base font-bold font-zen-kaku">{subLabel}</div>
      <div className="relative flex-grow flex items-center justify-center">
        <div className="w-32 h-32 relative">
          <canvas ref={chartRef} className="absolute top-0 left-0 w-full h-full"/>
        </div>
        <span className="absolute text-2xl font-bold font-zen-kaku">
          {percentage}%
        </span>
      </div>
      <div className="text-center mt-2">
        <div className="text-sm font-zen-kaku">{label}</div>
        <div className="text-black text-sm font-zen-kaku font-bold">{mainLabel}</div>
      </div>
    </div>
  );
};

export default CircularChartthree;