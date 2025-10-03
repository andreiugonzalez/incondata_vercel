import React, { useState, useEffect } from 'react';

const Tooltip = ({ text, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    // Detectar si es una pantalla pequeña
    const mediaQuery = window.matchMedia('(max-width: 550px)');
    setIsSmallScreen(mediaQuery.matches);

    const handleResize = () => {
      setIsSmallScreen(mediaQuery.matches);
    };

    // Añadir listener para cambios de tamaño de pantalla
    mediaQuery.addListener(handleResize);
    return () => {
      mediaQuery.removeListener(handleResize);
    };
  }, []);

  const toggleTooltip = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div
      className="relative inline-block"
      onClick={isSmallScreen ? toggleTooltip : undefined} // Click en pantallas pequeñas
      onMouseEnter={() => !isSmallScreen && setIsVisible(true)} // Hover en pantallas grandes
      onMouseLeave={() => !isSmallScreen && setIsVisible(false)}
    >
      {children}
      {(isVisible || (!isSmallScreen && window.matchMedia('(hover: hover)').matches)) && (
        <div
          style={{ zIndex: 999999 }}
          className={`absolute px-2 py-1 text-sm text-white transform -translate-x-1/2 bg-gray-800 rounded-md bottom-full left-1/2 whitespace-nowrap ${
            isVisible ? 'block' : 'hidden group-hover:block'
          } ${isSmallScreen ? 'overflow-x-auto max-w-[60vw]' : ''}`} // Desplazamiento horizontal en pantallas pequeñas
        >
          <div className="flex">
            {text}
          </div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;