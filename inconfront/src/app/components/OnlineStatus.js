// components/OnlineStatus.js
import React, { useState, useEffect } from 'react';

const OnlineStatus = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cachedLoginComponents, setCachedLoginComponents] = useState(null);
  const [showOfflineMessage, setShowOfflineMessage] = useState(!isOnline); // Mostrar el mensaje si inicialmente no hay conexión
  const [showOnlineMessage, setShowOnlineMessage] = useState(false); // Agregar estado para mostrar mensaje de conexión restablecida

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false); // Ocultar el mensaje de desconexión cuando vuelva a estar en línea
      setShowOnlineMessage(true); // Mostrar el mensaje de conexión restablecida
      setCachedLoginComponents(null); // Limpiar la caché cuando hay conexión
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true); // Mostrar el mensaje de desconexión cuando esté desconectado
      setShowOnlineMessage(false); // Ocultar el mensaje de conexión restablecida
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Almacenar en caché los componentes cuando la aplicación está cargada y hay conexión
    if (isOnline && !cachedLoginComponents) {
      // Almacena los componentes necesarios para la página de inicio de sesión en localStorage
      localStorage.setItem('loginComponents', JSON.stringify(children));
      setCachedLoginComponents(children);
    } else if (!isOnline && !cachedLoginComponents) {
      // Recuperar los componentes de la caché si no hay conexión
      try {
        const cachedComponents = localStorage.getItem('loginComponents');
        if (cachedComponents) {
          setCachedLoginComponents(JSON.parse(cachedComponents));
        }
      } catch (error) {
        console.error('Error al analizar el valor de localStorage:', error);
      }
    }

    // Manejar el restablecimiento del mensaje cuando la conexión se restablece
    if (isOnline) {
      setShowOfflineMessage(false);
    }

    // Ocultar el mensaje de conexión restablecida después de un tiempo
    if (showOnlineMessage) {
      const timeoutId = setTimeout(() => {
        setShowOnlineMessage(false);
      }, 5000); // Mostrar durante 5 segundos
      return () => clearTimeout(timeoutId);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOnline, cachedLoginComponents, children, showOnlineMessage]);

  return (
    <>
      {showOfflineMessage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            backgroundColor: 'red',
            color: 'white',
            textAlign: 'center',
            padding: '10px',
            zIndex: 9999
          }}
        >
          <p>No hay conexión a Internet. Algunas funciones pueden no estar disponibles.</p>
        </div>
      )}
      {showOnlineMessage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            backgroundColor: 'green',
            color: 'white',
            textAlign: 'center',
            padding: '10px',
            zIndex: 9999
          }}
        >
          <p>La conexión a Internet se ha restablecido.</p>
        </div>
      )}
      {cachedLoginComponents}
    </>
  );
};

export default OnlineStatus;
