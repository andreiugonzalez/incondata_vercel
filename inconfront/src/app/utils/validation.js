// Expresiones regulares para validación de campos
export const validationPatterns = {
  // Permite letras (incluyendo ñ, acentos), espacios y guiones
  name: /^[a-zA-ZáéíóúüÁÉÍÓÚÜñÑ\s-]+$/,
  
  // Permite letras, números, espacios y caracteres especiales comunes
  text: /^[a-zA-ZáéíóúüÁÉÍÓÚÜñÑ0-9\s.,;:¿?¡!@#$%&*()-_+=]+$/,
  
  // Permite solo números y guiones (para RUT)
  rut: /^[0-9.-]+$/,
  
  // Permite letras, números y caracteres especiales comunes para direcciones
  address: /^[a-zA-ZáéíóúüÁÉÍÓÚÜñÑ0-9\s.,#-]+$/
};

// Funciones de validación
export const validateField = (value, pattern) => {
  if (!value) return false;
  return pattern.test(value);
};

// Mensajes de error personalizados
export const errorMessages = {
  name: "Solo se permiten letras, espacios y guiones",
  text: "Caracteres no permitidos en el texto",
  rut: "El RUT solo debe contener números y guiones",
  address: "La dirección contiene caracteres no permitidos"
};