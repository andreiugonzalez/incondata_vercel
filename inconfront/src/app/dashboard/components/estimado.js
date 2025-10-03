import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import {ChevronRight, ChevronLeft} from "lucide-react";
import "../style/media_query.css";

const Estimadochart = ({presupuesto, totalGastado, porcentajeFormateado, actualizado, estimadoFormateado}) => {

  const porcentajeClass = porcentajeFormateado > 100 ? 'text-red-500' : 'text-[#23A73A]';

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 w-full h-full max-w-full flex flex-col items-center justify-center">
  <div className="flex flex-col items-center text-center text-base font-bold font-zen-kaku">
    <span className='font-zen-kaku mb-4'>Estimado al finalizar</span>
    <span className='font-zen-kaku text-3xl mb-6'>${estimadoFormateado}</span>
  </div>
  <div className="flex flex-col items-center text-center text-base font-bold font-zen-kaku">
    <span className='font-zen-kaku mb-4'>Presupuesto utilizado</span>
    <span className={`font-zen-kaku mb-4 text-3xl ${porcentajeClass}`}>{porcentajeFormateado}%</span>
  </div>
  <div className="flex flex-row justify-between w-full px-4 mt-4">
    <div className="flex flex-col items-start text-base font-bold font-zen-kaku">
      <span className='font-zen-kaku mb-2 xl:text-3xl lg:text-3xl md:text-xl custom-text-estimado'>${totalGastado}</span>
      <span className='font-zen-kaku mb-4 text-sm'>Cantidad gastada</span>
    </div>
    <div className="border-l-2 border-gray-300 mx-4"></div>
    <div className="flex flex-col items-end text-base font-bold font-zen-kaku">
      <span className='font-zen-kaku mb-2 xl:text-3xl lg:text-3xl md:text-xl custom-text-estimado'>${presupuesto}</span>
      <span className='font-zen-kaku mb-4 text-sm'>Presupuesto total</span>
    </div>
  </div>
  <span className="text-gray-500 text-xs mt-4">{actualizado}</span>
</div>
  );
};

export default Estimadochart;