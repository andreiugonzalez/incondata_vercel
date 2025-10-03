import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
const { useRouter } = require('next/navigation');
import '../style/correct_password.css';

function Correct_password(){
  const router = useRouter();

  const handleback = () => {
    router.push('/login');
  };

  


  
    return(

        <div className="p-10 xs:p-0 mx-auto custom-width">
      <div className=" w-full divide-y divide-gray-200 border-login">
        <div className="px-5 py-7">
          <span className='cursor-pointer custom-back'
          onClick={handleback}>
          <FontAwesomeIcon icon={faArrowLeft} /> 
          Regresar
             </span>
             <div className="bg-password relative"></div>
             <br></br>
             <h1 className='font-zen-kaku text-4xl font-bold text-center mb-4 custom-title'>La contraseña se creó correctamente</h1>
        </div>
      </div>
    </div>
    );

}
export default Correct_password;