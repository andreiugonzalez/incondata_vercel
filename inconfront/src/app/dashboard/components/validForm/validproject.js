// validar proyecto
const alphanumericRegex = /^[a-zA-Z0-9\s]+$/;

export const validateNombreobra = (obra) => {
    if (!obra) {
        return 'Nombre de obra incorrecto';
    }

    if (!alphanumericRegex.test(obra)) {
        return 'El nombre de la obra solo puede contener letras y números';
    }

    return '';
};
export const validateubicacion = (ubicacion) => {
    if (!ubicacion) {
        return 'Ubicación incorrecta';
    }

    if (!alphanumericRegex.test(ubicacion)) {
        return 'La ubicación solo puede contener letras y números';
    }
    return '';
};

export const validatecodigoBip = (codigobip) => {
    if (!codigobip || !/^\d+$/.test(codigobip)) {
        return 'Valor incorrecto';
    }
    if (codigobip.length > 9) {
        return 'El valor no debe exceder los 9 dígitos';
    }

    if (!alphanumericRegex.test(codigobip)) {
        return 'La ubicación solo puede contener letras y números';
    }

    return '';
};

export const validateNombreunidad = (unidadtecnica) => {
    if (!unidadtecnica) {
        return 'Nombre de la unida tecnica incorrecto';
    }

    if (!alphanumericRegex.test(unidadtecnica)) {
        return 'El nombre de la unidad tecnica solo puede contener letras y números';
    }

    return '';
};

export const validatesupervisor = (supervisor) => {
    if (!supervisor || supervisor.length === 0) {
        return 'Debe seleccionar al menos un supervisor';
    }
    return '';
};

export const validatesuperintendente = (superintendente) => {
    if (!superintendente || superintendente.length === 0) {
        return 'Debe seleccionar al menos un superintendente';
    }
    return '';
};

import { validaterutunidad as validarRUTUnidadReal, validaterutempresa as validarRUTEmpresaReal } from './validRutChileno';

export const validaterutunidad = (rutunidadtecnica) => {
    return validarRUTUnidadReal(rutunidadtecnica);
};

export const validaterutempresa = (rutempresa) => {
    return validarRUTEmpresaReal(rutempresa);
};

export const validateDateRange = (fechaInicio, fechaTermino) => {
    if (!fechaInicio || !fechaTermino) {
      return 'Ingrese su fecha de inicio y término';
    }

    if (fechaInicio > fechaTermino) {
      return 'La fecha de inicio no puede ser posterior a la fecha de término';
    }

    return '';
  };



export const validatepresupuestoglobal = (presupuestoglobal) => {
    if (!presupuestoglobal || !/^\d+$/.test(presupuestoglobal)) {
        return 'Valor incorrecto';
    }
    if (presupuestoglobal.length > 10) {
        return 'El valor no debe exceder los 10 dígitos';
    }
    return '';
};

export const validateresponsable = (responsable) => {
    if (!responsable) {
        return 'Seleccione un responsable';
    }
    return '';
};

export const validatemontoneto = (montoneto) => {
    if (!montoneto || !/^\d+$/.test(montoneto)) {
        return 'Valor incorrecto';
    }
    if (montoneto.length > 9) {
        return 'El valor no debe exceder los 9 dígitos';
    }
    return '';
};

export const validatemontototalbruto = (montototalbruto) => {
    if (!montototalbruto || !/^\d+$/.test(montototalbruto)) {
        return 'Valor incorrecto';
    }
    if (montototalbruto.length > 9) {
        return 'El valor no debe exceder los 9 dígitos';
    }
    return '';
};

export const validatemontomensual = (montomensual) => {
    if (!montomensual || !/^\d+$/.test(montomensual)) {
        return 'Valor incorrecto';
    }
    if (montomensual.length > 9) {
        return 'El valor no debe exceder los 9 dígitos';
    }
    return '';
};

export const validatetotalgeneral = (totalgeneral) => {
    if (!totalgeneral || !/^\d+$/.test(totalgeneral)) {
        return 'Valor incorrecto';
    }
    if (totalgeneral.length > 10) {
        return 'El valor no debe exceder los 10 dígitos';
    }
    return '';
};

export const validatelocalizacion = (localizacion) => {
    if (!localizacion) {
        return 'Nombre de la localización incorrecta';
    }
    if (!alphanumericRegex.test(localizacion)) {
        return 'La localicación solo puede contener letras y números';
    }
    return '';
};

export const validatecantidadpartidas = (cantidadpartidas) => {
    if (!cantidadpartidas) {
        return 'ingrese cantidad de partidas';
    }
    return '';
};

export const validatemina = (mina) => {
    if (!mina) {
        return 'Seleccione una obra';
    }
    return '';
};
export const validatestadoproyecto = (estadoproyecto) => {
    if (!estadoproyecto) {
        return 'Seleccione el estado del proyecto';
    }
    return '';
};

export const validateavance = (avance) => {
    if (!avance || isNaN(avance)) {
        return 'Valor incorrecto. Debe ser un número válido.';
    }

    const avanceNum = parseFloat(avance);
    if (avanceNum < 0 || avanceNum > 100) {
        return 'El porcentaje de avance debe estar entre 0 y 100.';
    }

    return ''; // El valor es válido
};

export const validatedocumento1 = (document1) => {
    if (!document1) {
        return 'Adjunte su archivo';
    }
    return '';
};

export const validateorganizacion = (organizacion) => {
    if (!organizacion) {
        return 'Debe seleccionar una empresa';
    }
    return '';
};
