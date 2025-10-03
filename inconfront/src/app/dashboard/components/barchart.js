import React, { useState, useEffect } from 'react';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
import "../style/media_query.css";
import { motion } from 'framer-motion';

// Función para interpolar entre dos colores
const interpolateColor = (startColor, endColor, factor) => {
  const result = startColor.slice(1).match(/.{2}/g).map((hex, i) =>
    Math.round(parseInt(hex, 16) * (1 - factor) + parseInt(endColor.slice(1).substr(i * 2, 2), 16) * factor)
  );
  return `#${result.map(x => x.toString(16).padStart(2, '0')).join('')}`;
};

const GaugeChart = ({ width, height, value, startAngle, endAngle, label, subtitle, valueMin, valueMax }) => {

  const [animatedValue, setAnimatedValue] = useState(0);
  const [barColor, setBarColor] = useState('#dc3545');

  useEffect(() => {
    const animationDuration = 2000; // Duración de la animación en milisegundos
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / animationDuration, 1);

      // Asegúrate de que el valor no exceda valueMax
      const newValue = Math.min(Math.round(progress * value * 100) / 100, valueMax);
      setAnimatedValue(newValue);

      // Interpolación del color
      const finalColor = getColor(newValue); // Cambia 'value' a 'newValue' para usar el valor limitado
      const interpolatedColor = interpolateColor('#dc3545', finalColor, progress);
      setBarColor(interpolatedColor);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setBarColor(finalColor);
      }
    };

    requestAnimationFrame(animate);
  }, [value, valueMax]); // Incluye valueMax en las dependencias

  const getColor = (value) => {
    if (value > 1) {
      return '#56c1fe'; // Verde para valores mayores a 1
    } else if (value > 0.5) {
      return '#ff0000'; // Amarillo para valores mayores a 0.5
    } else {
      return '#ff2700'; // Rojo para valores menores o iguales a 0.5
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-2 w-full h-full flex flex-col justify-center items-center select-none">
      <span className="text-center text-base font-bold mb-4 font-zen-kaku">{label}</span>
      <div className="w-full h-full relative flex justify-center items-center select-none">
        <Gauge
          width={width}
          height={height}
          value={animatedValue}
          startAngle={startAngle}
          endAngle={endAngle}
          valueMin={valueMin}
          valueMax={valueMax}
          sx={(theme) => ({
            [`& .${gaugeClasses.valueText}`]: {
              fontSize: 12,
              transform: 'translate(0px, 10px)',
              fontWeight: 'bold',
            },
            [`& .${gaugeClasses.valueArc}`]: {
              fill: barColor, // Color dinámico basado en la animación
            },
            [`& .${gaugeClasses.referenceArc}`]: {
              fill: theme.palette.text.disabled,
            },
          })}
          text={
            ({ value }) => `${value} / ${subtitle}`
          }
        />
      </div>
        <span className='font-zen-kaku font-bold p-2 whitespace-nowrap'>Indicadores del proyecto</span>
    </div>
  );
};

export default GaugeChart;
