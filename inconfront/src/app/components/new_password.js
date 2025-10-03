import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import { setUserPassword, changeUserPassword } from '../services/user';
import toast from 'react-hot-toast';
const { useRouter } = require('next/navigation');
import '../style/new_password.css';

function New_password({ token, flow }){
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleback = () => {
    router.push('/login');
  };
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    const newPassword = e.target.value;
  if (newPassword.length < 8) {
    setPasswordError("La contraseña debe tener al menos 8 caracteres");
  } else {
    setPasswordError(""); // Reinicia el mensaje de error si la longitud es válida
  }
  setPassword(newPassword);
  };

  const handlePasswordFocus = () => {
    setPasswordFocused(true);
  };

  const handlePasswordBlur = () => {
    if (!password) {
      setPasswordFocused(false);
    }
  };

  const handleContinueClick = async () => {
    let isValid = true;
    if (!password) {
      setPasswordError('Por favor ingrese su contraseña');
      isValid = false;
    } else {
      setPasswordError("");
    }
    if (isValid) {
      if (flow === 'set') {
        await handleSetUserPassword(password);
      }
      if (flow === 'change') {
        await handleChangeUserPassword(password);
      }
    }
  };

  const handleSetUserPassword = async (password) => {
    const response = await setUserPassword(password, token);
    if (response?.statusCode === 200) {
      router.push('/correct_password');
    }
    if (response?.error) {
      toast.error(response?.error?.message || 'Error al establecer la contraseña');
    }
  }

  const handleChangeUserPassword = async (password) => {
    const response = await changeUserPassword(password, token);
    if (response?.statusCode === 200) {
      router.push('/correct_password');
    }
    if (response?.error) {
      toast.error(response?.error?.message || 'Error al cambiar la contraseña');
    }
  }

  
    return(

        <div className="p-10 xs:p-0 mx-auto custom-newpass">
      <div className=" w-full divide-y divide-gray-200 border-login">
        <div className="px-5 py-7">
          <span className='cursor-pointer custom-back-new'
          onClick={handleback}>
          <FontAwesomeIcon icon={faArrowLeft} /> 
          Regresar
             </span>
             <h1 className='font-zen-kaku text-4xl font-bold text-center mb-4 custom-title-new'>Establecer contraseña</h1>
      <h3 className="text-base mb-4 font-zen-kaku custom-p-new">La contraseña requiere un mínimo de 8 caracteres y contiene una combinación de letras, números y símbolos.</h3>
      <div className="form-field-newpass relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              required
              onFocus={handlePasswordFocus}
              onBlur={handlePasswordBlur}
              onChange={handlePasswordChange}
            />
            <label htmlFor="password" className={passwordFocused ? 'font-zen-kaku active' : 'font-zen-kaku'}>
              Password
            </label>
            {passwordError && <p className="text-red-502 text-sm mt-2">{passwordError}</p>}
            <span
              className="absolute inset-y-14 right-14 flex items-center pr-3 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FontAwesomeIcon icon={faEye} alt="Show password" className="h-5 w-5 mb-3" /> : <FontAwesomeIcon icon={faEyeSlash} alt="Hide password" className="h-5 w-5 mb-3" />}
            </span>
          </div>
          <br></br>
          <div className='flex items-center'>
          <button
            type="button"
            className="transition duration-200 bg-[#7FC3BB] hover:bg-[#9AEDE3] focus:bg-[#A6FFF5] focus:shadow-sm focus:ring-4 focus:ring-[#7FC3BB] focus:ring-opacity-50 text-white py-4 rounded-lg text-sm shadow-sm hover:shadow-md font-semibold text-center inline-block custom-buton"
            onClick={handleContinueClick}
          >
            <span className="inline-block font-zen-kaku text-[#000000] text-xl">Continuar</span>
          </button>
          </div>
        </div>
      </div>
    </div>
    );

}
export default New_password;