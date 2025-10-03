import React, {useState} from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import { motion } from 'framer-motion';
const { useRouter } = require('next/navigation');

const ChartComponent = ({ actualizado, porcentajefecha, porcentajepartidas, projectId }) => {

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const realPercentage = isNaN(porcentajepartidas) ? 0 : porcentajepartidas;

  const data = {
    labels: ['Avance Planeado', 'Avance Real'],
    datasets: [
      {
        label: 'Porcentaje',
        data: [porcentajefecha || 0, realPercentage || 0],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
        ],
        borderRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000, // Duración de la animación en milisegundos
      easing: 'easeOutBounce', // Tipo de animación
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return value + '%';
          },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return tooltipItem.raw + '%';
          },
        },
      },
    },
  };

  const showMessage = realPercentage === 0;

  const handleRedirect = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    router.push(`/dashboard/partida_suma?project=${projectId}`);
  };

  return (
    <div className="p-4 w-full h-full mx-auto bg-white shadow-lg">
    <h2 className="text-base font-bold mb-2 font-zen-kaku">Avance planeado vs avance real</h2>
    <div className={`flex items-center justify-start space-x-4 w-full ${showMessage ? '' : 'hidden'}`}>
          <p className="text-base font-zen-kaku font-bold text-center">
            Por favor, insertar datos en el avance real
          </p>
          <motion.button
            onClick={handleRedirect}
            className="bg-[#5c7891] text-white px-4 py-1 rounded hover:bg-[#597387] transition-colors ease-linear duration-150"
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
    <div className="relative h-96">
    <Bar options={options} data={data} />
    </div>
    <div className='text-center font-zen-kaku'>
      <p>{actualizado}</p>
    </div>
  </div>
);
};

export default ChartComponent;