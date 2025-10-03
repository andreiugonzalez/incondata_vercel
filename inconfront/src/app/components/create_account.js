import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { forgetPassword, changeUserPassword } from '../services/user';
import toast from 'react-hot-toast';
const { useRouter } = require('next/navigation');

function Create(){
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    const newEmail = e.target.value;
  const emailPattern = /^[a-zA-ZáéíóúüÁÉÍÓÚÜñÑ0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // Expresión regular para validar el formato del correo con cualquier dominio y caracteres especiales
  if (newEmail.includes("@")) {
    if (!emailPattern.test(newEmail)) {
      setEmailError("Por favor ingresa un correo electrónico válido (Ejemplo: juan@dominio.cl o juan@dominio.com)");
    } else {
      setEmailError(""); // Reinicia el mensaje de error si el correo es válido
    }
  } else {
    if (newEmail.length < 5) {
      setEmailError("El nombre de usuario debe tener al menos 5 caracteres");
    } else {
      setEmailError(""); // Reinicia el mensaje de error si el nombre de usuario es válido
    }
  }
  setEmail(newEmail);
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setNewPassword(password);
    
    if (password.length < 8) {
      setPasswordError("La contraseña debe tener al menos 8 caracteres");
    } else {
      setPasswordError("");
    }
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const handleContinueClick = async () => {
    let isValid = true;
    if (!email) {
      setEmailError('Por favor ingrese su correo electrónico');
      isValid = false;
    } else {
      setEmailError("");
    }
    if (isValid) {
        const response = await forgetPassword(email);

        if(response.statusCode === 200){
            toast.success('Correo verificado! Ahora puedes actualizar tu contraseña');
            // Extraer el token de la respuesta si está disponible
            // Si no está en la respuesta, generamos uno temporal para el modal
            setToken(response.data?.token || 'temp_token');
            setShowPasswordModal(true);
        }

        if (response?.error) {
          toast.error(response?.error?.message || 'Error al verificar el correo');
        }
    }
  };

  const handlePasswordUpdate = async () => {
    if (!newPassword) {
      setPasswordError('Por favor ingrese su nueva contraseña');
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }

    try {
      // Usar el endpoint de cambio de contraseña
      const response = await changeUserPassword(newPassword, token);
      
      console.log('Response from changeUserPassword:', response);
      
      if (response?.statusCode === 200) {
        toast.success('Contraseña actualizada correctamente');
        setShowPasswordModal(false);
        router.push('/login');
      } else {
        console.error('Error response:', response);
        toast.error(response?.message || response?.error?.message || 'Error al actualizar la contraseña');
      }
    } catch (error) {
      console.error('Catch error:', error);
      toast.error('Error al actualizar la contraseña');
    }
  };

  const handleback = () => {
    router.push('/login');
  };

  const closeModal = () => {
    setShowPasswordModal(false);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
  };

    return(
        <div className="min-h-screen flex items-center justify-center">
          {/* Fondo con overlay */}
          <div className="fixed inset-0 bg-cover bg-center z-0" style={{ backgroundImage: "url('/municipalidad2.jpg')" }}>
            <div className="absolute inset-0 bg-black opacity-60"></div>
          </div>
          
          {/* Contenedor del formulario */}
          <div className="relative z-10 w-full max-w-md mx-auto px-4 sm:px-6">
            <div className="bg-white rounded-lg shadow-xl">
              <div className="px-6 py-8">
                <div className="flex items-center mb-6">
                  <button 
                    onClick={handleback}
                    className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <FontAwesomeIcon icon={faArrowLeft} className="mr-2" /> 
                    <span className="font-zen-kaku">Regresar</span>
                  </button>
                </div>
                
                <h1 className="font-zen-kaku text-3xl sm:text-4xl font-bold text-center mb-4">Olvidaste tu contraseña</h1>
                
                <p className="text-sm sm:text-base text-gray-600 mb-6 font-zen-kaku text-center">
                  Ingrese el correo electrónico asociado con su cuenta y le enviaremos el código de verificación para restablecer su contraseña.
                </p>
                
                <div className="mb-6 relative">
                  <input 
                    type="text" 
                    id="email" 
                    name="email" 
                    onChange={handleEmailChange} 
                    required 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7FC3BB]" 
                    placeholder="E-mail o Usuario"
                  />
                  {emailError && (
                    <span className="text-red-500 text-sm mt-2 block">
                      {emailError}
                    </span>
                  )}
                </div>
                
                <button
                  type="button"
                  className="w-full transition duration-200 bg-[#7FC3BB] hover:bg-[#9AEDE3] focus:bg-[#A6FFF5] focus:shadow-sm focus:ring-4 focus:ring-[#7FC3BB] focus:ring-opacity-50 text-black py-3 rounded-lg shadow-sm hover:shadow-md font-semibold text-center"
                  onClick={handleContinueClick}
                >
                  <span className="font-zen-kaku text-lg sm:text-xl">Continuar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Modal para actualizar contraseña */}
          {showPasswordModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                <div className="px-6 py-8">
                  <h2 className="font-zen-kaku text-2xl font-bold text-center mb-4">Actualizar Contraseña</h2>
                  <p className="text-sm text-gray-600 mb-6 font-zen-kaku text-center">
                    Ingresa tu nueva contraseña para completar el proceso.
                  </p>
                  
                  <div className="mb-4 relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7FC3BB] pr-12"
                      placeholder="Nueva contraseña"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>

                  <div className="mb-4 relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7FC3BB] pr-12"
                      placeholder="Confirmar contraseña"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>

                  {passwordError && (
                    <span className="text-red-500 text-sm mb-4 block">
                      {passwordError}
                    </span>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-zen-kaku"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handlePasswordUpdate}
                      className="flex-1 px-4 py-3 bg-[#7FC3BB] hover:bg-[#9AEDE3] text-black rounded-lg transition-colors font-zen-kaku font-semibold"
                    >
                      Actualizar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
    );

}
export default Create;