const regex = /^[a-zA-Z0-9\s]+$/;

export const validateNombreEmpresa = (nombre) => {
    if (!nombre) {
        return 'El nombre de la empresa es requerido';
    } else if (!regex.test(nombre)) {
        return 'El nombre de la empresa solo puede contener letras y números';
    } else if (nombre.length > 50) {
        return 'El nombre de la empresa no puede exceder los 50 caracteres';
    }
    return '';
};

import { validateRUT as validarRUTReal } from './validRutChileno';

export const validateRUT = (rut) => {
    return validarRUTReal(rut);
};

export const validateDireccion = (direccion) => {
    if (!direccion) {
        return 'Dirección incorrecta';
    } else if (!regex.test(direccion)) {
        return 'La dirección solo puede contener letras y números';
    } else if (direccion.length > 50) {
        return 'La dirección no puede exceder los 50 caracteres';
    }
    return '';
};

export const validateCodigoPostal = (codigoPostal) => {
    if (!codigoPostal || !/^\d{7}$/.test(codigoPostal)) {
        return 'Código postal incorrecto, minimo 7 digitos.';
    }
    return '';
};

export const validateTelefono = (telefono) => {
    if (!telefono || !/^\d{9}$/.test(telefono)) {
        return 'Error, ejemplo: (+56) 9(su numero)';
    }
    return '';
};

export const validateCodigoTelefono = (codigoTelefono) => {
    if (!codigoTelefono) {
        return 'Seleccione un código';
    }
    return '';
};

export const validateRepresentanteLegal = (representanteLegal) => {
    if (!representanteLegal) {
        return 'Nombre del representante legal incorrecto';
    } else if (!regex.test(representanteLegal)) {
        return 'El nombre del representante legal solo puede contener letras y números';
    } else if (representanteLegal.length > 50) {
        return 'El nombre del representante legal no puede exceder los 50 caracteres';
    }
    return '';
};

import { validateRUTRepresentanteLegal as validarRUTRepresentanteReal } from './validRutChileno';

export const validateRUTRepresentanteLegal = (rutRepresentanteLegal) => {
    return validarRUTRepresentanteReal(rutRepresentanteLegal);
};

export const validatePais = (pais) => {
    if (!pais) {
        return 'País no seleccionado';
    }
    return '';
};

export const validateRegion = (region) => {
    if (!region) {
        return 'Región no seleccionada';
    }
    return '';
};

export const validateComuna = (comuna) => {
    if (!comuna) {
        return 'Comuna no seleccionada';
    }
    return '';
};

export const validateEmail = (email) => {
    if (!email) {
        return 'El correo electrónico es requerido';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return 'El correo electrónico no es válido';
    }
    if (email.length > 100) {
        return 'El correo electrónico no puede exceder los 100 caracteres';
    }
    return '';
};

export const validateTipoEmpresa = (tipoEmpresa) => {
    if (!tipoEmpresa) {
        return 'Seleccione un tipo de empresa';
    }
    return '';
};
