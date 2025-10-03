import { validaterutrabajador as validarRUTTrabajadorReal } from './validRutChileno';

export const validaterutrabajador = (rutrabajador) => {
    return validarRUTTrabajadorReal(rutrabajador);
};

export const validateNombre = (nombre) => {
    if (!nombre) {
        return 'Ingrese su nombre';
    }
    return '';
};

export const validateapellidopaterno = (apellidop) => {
    if (!apellidop) {
        return 'Ingrese su apellido paterno';
    }
    return '';
};

export const validateapellidomaterno = (apellidom) => {
    if (!apellidom) {
        return 'Ingrese su apellido materno';
    }
    return '';
};

export const validategenero = (genero) => {
    if (!genero) {
        return 'Seleccione su género';
    }
    return '';
};

export const validatefecha = (fecha) => {
    if (!fecha) {
        return 'Ingrese su fecha de nacimiento';
    }
    return '';
};

export const validatecorreo = (correo) => {
    const dominioRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!correo) {
        return 'Ingrese su correo';
    }

    if (!dominioRegex.test(correo)) {
        return 'Ingrese un correo electrónico válido (ejemplo: usuario@dominio.cl o usuario@dominio.com)';
    }

    return '';
};

export const validatelefono = (telefono) => {
    if (!telefono) {
        return 'El celular es requerido';
    }
    // Eliminar cualquier espacio en blanco
    const telefonoLimpio = telefono.replace(/\s/g, '');
    
    // Verificar que solo contenga números
    if (!/^\d+$/.test(telefonoLimpio)) {
        return 'El celular solo debe contener números';
    }
    
    // Verificar la longitud (8 o 9 dígitos para teléfonos chilenos)
    if (telefonoLimpio.length < 8 || telefonoLimpio.length > 9) {
        return 'El celular debe tener entre 8 y 9 dígitos';
    }
    
    // Verificar que no exceda el límite de INTEGER en PostgreSQL (2147483647)
    if (parseInt(telefonoLimpio) > 2147483647) {
        return 'El número de celular es demasiado largo';
    }
    
    return '';
};

export const validatenombreusuario = (usuario) => {
    if (!usuario) {
        return 'Ingrese un nombre de usuario';
    }
    return '';
};

export const validatepassword = (password) => {
    if (!password) {
        return 'Ingrese una contraseña';
    }
    return '';
};

export const validatestadocivil = (estadocivil) => {
    if (!estadocivil) {
        return 'Seleccione su estado civil';
    }
    return '';
};

export const validatedireccion = (direccion) => {
    if (!direccion) {
        return 'Ingrese su dirección';
    }
    return '';
};

export const validatecodigopostal = (cpostal) => {
    if (!cpostal || !/^\d+$/.test(cpostal)) {
        return 'Ingrese el código postal';
    }
    return '';
};

export const validatepais = (pais) => {
    if (!pais) {
        return 'Seleccione su país';
    }
    return '';
};

export const validateregion = (region, regionLabel = 'región') => {
    if (!region) {
        return `Seleccione su ${regionLabel.toLowerCase()}`;
    }
    return '';
};

export const validatecomuna = (comuna, comunaLabel = 'comuna') => {
    if (!comuna) {
        return `Seleccione su ${comunaLabel.toLowerCase()}`;
    }
    return '';
};

export const validateperfil = (perfil) => {
    if (!perfil) {
        return 'Seleccione su foto de perfil';
    }
    return '';
};

export const validatecodigoarea = (codigoA) => {
    if (!codigoA) {
        return 'Seleccione su código de área';
    }
    return '';
};

//laborales

export const validategrupo = (grupo) => {
    if (!grupo && grupo !== 0) {
        return 'Seleccione un grupo';
    }
    return '';
};
export const validatepuesto = (puesto) => {
    if (!puesto && puesto !== 0) {
        return 'Seleccione un puesto';
    }
    return '';
};
export const validateorganizacion = (organizacionid) => {
    if (!organizacionid) {
        return 'Seleccione una organización';
    }
    return '';
};
export const validaterol = (rol) => {
    if (!rol) {
        return 'Seleccione un rol';
    }
    return '';
};
export const validatecorreoe = (correoem) => {
    const dominioRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!correoem) {
        return 'Ingrese el correo de emergencia';
    }

    return '';
};
export const validatenombremer = (nombremer) => {
    if (!nombremer) {
        return 'Ingrese el nombre de contacto de emergencia';
    }
    return '';
};
export const validaterelacion = (relacion) => {
    if (!relacion) {
        return 'Seleccione su relación de contacto de emergencia';
    }
    return '';
};
export const validateafp = (afp) => {
    if (!afp) {
        return 'Seleccione su AFP';
    }
    return '';
};
export const validateseguro = (seguro) => {
    if (!seguro) {
        return 'Seleccione su previsión';
    }
    return '';
};
export const validateselectglobal = (option) => {
    if (!option) {
        return 'Seleccione una opción';
    }
    return '';
};
export const validatefechaglobal = (date) => {
    if (!date) {
        return 'Seleccione una fecha';
    }
    return '';
};

export const validateinfoglobal = (info) => {
    if (!info) {
        return 'Ingrese información correspondiente';
    }
    return '';
};

export const validatevalorglobal = (valor) => {
    if (!valor || !/^\d+$/.test(valor)) {
        return 'Valor incorrecto';
    }
    return '';
};
export const validatencuenta = (ncuenta) => {
    if (!ncuenta || !/^\d+$/.test(ncuenta)) {
        return 'Número de cuenta incorrecto';
    }
    return '';
};