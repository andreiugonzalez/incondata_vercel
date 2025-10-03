import React, { useState, useEffect } from 'react';
import { updatePasswordTemp } from '@/app/services/user';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';

const PasswordChangeModalWithCurrent = ({ isOpen, onClose, user }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log(`isOpen changed to: ${isOpen}`);
  }, [isOpen]);

  const handleSubmit = async () => {
    if (newPassword !== confirmPassword) {
      setError('Las nuevas contraseñas no coinciden');
      return;
    }

    try {
      const response = await updatePasswordTemp(user.id, currentPassword, newPassword);
console.log(response);
      if (response.message === "Contraseña actualizada exitosamente") {
        toast.success('Contraseña actualizada exitosamente');
        
        onClose();
      } else {
        setError(response.message || 'Error al actualizar la contraseña');
      }
    } catch (error) {
      setError('Error al actualizar la contraseña');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75">
      <div className="bg-white p-6 rounded shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Hola {user.names}, actualiza tu contraseña</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Contraseña Actual</label>
          <div className="relative">
            <input
              type={showCurrentPassword ? "text" : "password"}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <span
              className="absolute transform -translate-y-1/2 cursor-pointer right-3 top-1/2"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              {showCurrentPassword ? <FontAwesomeIcon icon={faEyeSlash} /> : <FontAwesomeIcon icon={faEye} />}
            </span>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Nueva Contraseña</label>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <span
              className="absolute transform -translate-y-1/2 cursor-pointer right-3 top-1/2"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? <FontAwesomeIcon icon={faEyeSlash} /> : <FontAwesomeIcon icon={faEye} />}
            </span>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Confirmar Nueva Contraseña</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <span
              className="absolute transform -translate-y-1/2 cursor-pointer right-3 top-1/2"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FontAwesomeIcon icon={faEyeSlash} /> : <FontAwesomeIcon icon={faEye} />}
            </span>
          </div>
        </div>
      
        <div className="flex justify-end">
          <button
            onClick={() => {
              console.log('Closing modal via Cancel button');
              onClose();
            }}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded mr-2"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Cambiar Contraseña
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordChangeModalWithCurrent;
