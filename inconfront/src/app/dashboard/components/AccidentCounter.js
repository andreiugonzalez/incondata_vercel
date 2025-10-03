import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

const AccidentCounter = ({ daysWithoutAccidents, actualizado }) => {
  return (
    <div className="flex flex-col items-center justify-between bg-white shadow-lg rounded-lg p-6 w-full font-zen-kaku">
      {/* Título del contador */}
      <h2 className="text-xl font-bold mb-4 text-black">Días sin accidentes</h2>

      {/* Animación del contador */}
      <motion.div
        className="text-5xl font-bold text-green-600"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      >
        <div className='flex justify-center items-center'>
        <Image src={"/accident-svgrepo-com.png"} width={70} height={70} alt="" priority/>
        <span>{daysWithoutAccidents}</span>
        </div>
      </motion.div>

      {/* Subtítulo opcional */}
      <p className="text-sm text-black mt-2">{actualizado}</p>
    </div>
  );
};

export default AccidentCounter;