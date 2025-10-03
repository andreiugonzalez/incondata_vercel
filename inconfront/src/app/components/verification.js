import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
const { useRouter } = require('next/navigation');

function Verification(){
  const router = useRouter();
  const [seconds, setSeconds] = useState(60);
  const [inputs, setInputs] = useState(Array(6).fill(""));

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prevSeconds => prevSeconds - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleback = () => {
    router.push('/login');
  };
  const handleInputChange = (index, value) => {
    if (/^\d*$/.test(value)) {
      const newInputs = [...inputs];
      newInputs[index] = value;
      setInputs(newInputs);

      // Check if all inputs are filled
      if (!newInputs.includes("")) {
        router.push('/new_password');
      }
    }
  };

  
    return(

        <div className="p-10 xs:p-0 ml-auto custom-width-create align-right custom-verification">
      <div className=" w-full divide-y divide-gray-200 border-login">
        <div className="px-5 py-7">
          <span className='cursor-pointer custom-back-3'
          onClick={handleback}>
          <FontAwesomeIcon icon={faArrowLeft} /> 
          Regresar
             </span>
             <h1 className='font-zen-kaku text-5xl font-bold text-center mb-4 custom-title-1'>Ingrese el código de verificación</h1>
      <h3 className="text-base mb-4 font-zen-kaku custom-p-1">El código de verificación ha sido enviado a su correo electrónico test@faena.com</h3>
      <div className="form-field-3">
        <div className="flex justify-center items-center">
          {inputs.map((value, index) => (
            <input
              key={index}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              className="w-10 h-10 text-center border rounded mx-1"
              maxLength={1}
              minLength={1}
              value={value}
              onChange={(e) => handleInputChange(index, e.target.value)}
            />
          ))}
        </div>
      </div>
          <div className="flex justify-start">
      <div className="text-left">
        {seconds > 0 ? (
          <span className='text-[#747778] font-zen-kaku'>Reenviar después de {seconds} segundos</span>
        ) : (
          <a href="#" className='text-[#747778] font-zen-kaku'>Solicitar código de nuevo</a>
        )}
      </div>
    </div>
          <br></br>
        </div>
      </div>
    </div>
    );

}
export default Verification;