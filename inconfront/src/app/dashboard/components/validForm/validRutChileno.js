/**
 * Función para validar RUT chileno con algoritmo de dígito verificador
 * Implementa el algoritmo oficial chileno para validar RUTs reales
 */

/**
 * Calcula el dígito verificador de un RUT chileno
 * @param {string} rutSinDV - RUT sin dígito verificador (solo números)
 * @returns {string} - Dígito verificador calculado ('0'-'9' o 'K')
 */
const calcularDigitoVerificador = (rutSinDV) => {
    let suma = 0;
    let multiplicador = 2;
    
    // Recorrer el RUT de derecha a izquierda
    for (let i = rutSinDV.length - 1; i >= 0; i--) {
        suma += parseInt(rutSinDV[i]) * multiplicador;
        multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }
    
    const resto = suma % 11;
    const dv = 11 - resto;
    
    if (dv === 11) return '0';
    if (dv === 10) return 'K';
    return dv.toString();
};

/**
 * Formatea un RUT chileno con puntos y guión
 * @param {string} rut - RUT sin formato
 * @returns {string} - RUT formateado (XX.XXX.XXX-X)
 */
export const formatearRUT = (rut) => {
    // Limpiar el RUT de caracteres no válidos
    let rutLimpio = rut.replace(/[^\dkK]/g, '');
    
    // Convertir 'k' minúscula a 'K' mayúscula
    rutLimpio = rutLimpio.replace(/k/g, 'K');
    
    // Limitar a máximo 9 caracteres (8 dígitos + 1 dígito verificador)
    if (rutLimpio.length > 9) {
        rutLimpio = rutLimpio.slice(0, 9);
    }
    
    // Si tiene menos de 2 caracteres, devolver tal como está
    if (rutLimpio.length < 2) {
        return rutLimpio;
    }
    
    // Separar cuerpo y dígito verificador
    const cuerpo = rutLimpio.slice(0, -1);
    const dv = rutLimpio.slice(-1);
    
    // Formatear el cuerpo con puntos
    let cuerpoFormateado = '';
    for (let i = cuerpo.length - 1; i >= 0; i--) {
        cuerpoFormateado = cuerpo.charAt(i) + cuerpoFormateado;
        if ((cuerpo.length - i) % 3 === 0 && i !== 0) {
            cuerpoFormateado = '.' + cuerpoFormateado;
        }
    }
    
    return cuerpoFormateado + '-' + dv;
};

/**
 * Valida un RUT chileno completo
 * @param {string} rut - RUT a validar
 * @param {string} nombreCampo - Nombre del campo para personalizar el mensaje de error
 * @returns {string} - Mensaje de error o cadena vacía si es válido
 */
export const validarRUTChileno = (rut, nombreCampo = 'RUT') => {
    if (!rut || rut.trim() === '') {
        return `${nombreCampo} es requerido. Ejemplo: 12.345.678-5`;
    }
    
    // Limpiar el RUT
    const rutLimpio = rut.replace(/\./g, '').replace(/-/g, '').trim();
    
    // Verificar formato básico (mínimo 7 caracteres, máximo 9)
    if (rutLimpio.length < 7 || rutLimpio.length > 9) {
        return `${nombreCampo} debe tener entre 7 y 9 caracteres. Ejemplo: 12.345.678-5`;
    }
    
    // Verificar que tenga el formato correcto (números + dígito verificador)
    if (!/^\d{6,8}[0-9kK]$/.test(rutLimpio)) {
        return `${nombreCampo} tiene formato inválido. Debe contener solo números y terminar con un dígito o 'K'. Ejemplo: 12.345.678-5`;
    }
    
    // Separar cuerpo y dígito verificador
    const cuerpo = rutLimpio.slice(0, -1);
    const dvIngresado = rutLimpio.slice(-1).toUpperCase();
    
    // Calcular el dígito verificador correcto
    const dvCalculado = calcularDigitoVerificador(cuerpo);
    
    // Verificar que el dígito verificador sea correcto
    if (dvIngresado !== dvCalculado) {
        return `${nombreCampo} inválido. El dígito verificador no es correcto. Verifique que el RUT esté bien escrito.`;
    }
    
    return ''; // RUT válido
};

/**
 * Validaciones específicas para diferentes campos de RUT
 */

// Para RUT de trabajador/usuario
export const validaterutrabajador = (rutrabajador) => {
    return validarRUTChileno(rutrabajador, 'RUT del trabajador');
};

// Para RUT de empresa
export const validateRUT = (rut) => {
    return validarRUTChileno(rut, 'RUT de la empresa');
};

// Para RUT de representante legal
export const validateRUTRepresentanteLegal = (rutRepresentanteLegal) => {
    return validarRUTChileno(rutRepresentanteLegal, 'RUT del representante legal');
};

// Para RUT de unidad técnica
export const validaterutunidad = (rutunidadtecnica) => {
    return validarRUTChileno(rutunidadtecnica, 'RUT de la unidad técnica');
};

// Para RUT de empresa en proyectos
export const validaterutempresa = (rutempresa) => {
    return validarRUTChileno(rutempresa, 'RUT de la empresa');
};

/**
 * Función para manejar el cambio de input de RUT con formato automático
 * @param {string} value - Valor del input
 * @param {function} setValue - Función para actualizar el estado
 * @param {string} fieldName - Nombre del campo
 */
export const handleRUTInputChange = (value, setValue, fieldName) => {
    const rutFormateado = formatearRUT(value);
    setValue(prevState => ({
        ...prevState,
        [fieldName]: rutFormateado
    }));
};

// Exportar también la función calcularDigitoVerificador para pruebas
export { calcularDigitoVerificador };