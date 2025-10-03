import React, { useState, useEffect } from 'react';

const PasswordChangeModal = ({ isOpen, onClose, onSubmit }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [generatedPassword, setGeneratedPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!isOpen) {
            // Limpiar estados al cerrar el modal
            setNewPassword('');
            setConfirmPassword('');
            setGeneratedPassword('');
            setErrorMessage('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const generateRandomPassword = (minLength = 13, maxLength = 19) => {
        const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-";
        let password = "";
        for (let i = 0, n = charset.length; i < length; ++i) {
            password += charset.charAt(Math.floor(Math.random() * n));
        }
        setNewPassword(password);
        setConfirmPassword(password);
        setGeneratedPassword(password);
        setErrorMessage('');
    };

    const copyToClipboardFallback = (text) => {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            document.body.removeChild(textArea);
            // alert('Contraseña copiada al portapapeles');
        } catch (err) {
            document.body.removeChild(textArea);
            alert('Error al copiar la contraseña');
        }
    };

    const copyToClipboard = () => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(generatedPassword).then(() => {
                // alert('Contraseña copiada al portapapeles');
            }).catch(err => {
                alert('Error al copiar la contraseña');
            });
        } else {
            copyToClipboardFallback(generatedPassword);
        }
    };

    const handleSubmit = () => {
        if (newPassword !== confirmPassword) {
            setErrorMessage('Las contraseñas no coinciden');
            return;
        }
        onSubmit(newPassword, confirmPassword, true);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-75">
            <div className="bg-white rounded-lg shadow-lg p-6 w-1/3">
                <h2 className="text-xl font-bold mb-4">Cambiar Contraseña un solo uso</h2>
                <div className="mb-4">
                    <label className="block text-sm font-bold mb-2">Nueva Contraseña</label>
                    <input 
                        type="password" 
                        className="w-full px-3 py-2 border rounded" 
                        value={newPassword} 
                        onChange={(e) => {
                            setNewPassword(e.target.value);
                            setGeneratedPassword('');
                            setErrorMessage('');
                        }} 
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-bold mb-2">Confirmar Contraseña</label>
                    <input 
                        type="password" 
                        className="w-full px-3 py-2 border rounded" 
                        value={confirmPassword} 
                        onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            setErrorMessage('');
                        }} 
                    />
                </div>
                {errorMessage && (
                    <div className="text-red-500 text-sm mb-4">
                        {errorMessage}
                    </div>
                )}
                <div className="flex items-center justify-between mb-4">
                    <button 
                        type="button" 
                        className="px-4 py-2 bg-green-500 text-white rounded mr-2 transition duration-150 ease-in-out transform hover:bg-green-600 active:bg-green-700 active:scale-95" 
                        onClick={() => generateRandomPassword(8, 16)}
                    >
                        Generar Clave Aleatoria
                    </button>
                    {generatedPassword && (
                        <div className="flex items-center">
                            <span className="mr-2 font-medium">Nueva clave es: {generatedPassword}</span>
                            <button 
                                type="button" 
                                className="px-2 py-1 bg-[#7FC3BB] text-white rounded transition duration-150 ease-in-out transform hover:bg-[#b6f0e9] active:bg-emerald-600" 
                                onClick={copyToClipboard}
                            >
                                Copiar
                            </button>
                        </div>
                    )}
                </div>
                <div className="flex justify-end">
                    <button 
                        type="button" 
                        className="px-4 py-2 bg-gray-500 text-white rounded mr-2 transition duration-150 ease-in-out transform hover:bg-gray-600 active:bg-gray-700 active:scale-95" 
                        onClick={onClose}
                    >
                        Cancelar
                    </button>
                    <button 
                        type="button" 
                        className="px-4 py-2 bg-[#7FC3BB] text-white rounded transition duration-150 ease-in-out transform hover:bg-[#b6f0e9] active:bg-emerald-600 active:scale-95" 
                        onClick={handleSubmit}
                        disabled={newPassword !== confirmPassword || !newPassword || !confirmPassword}
                    >
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PasswordChangeModal;
