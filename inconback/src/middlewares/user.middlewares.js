const { body, validationResult } = require('express-validator');

const validateUser = [
    body('names')
        .isString()
        .withMessage('El nombre debe ser un string')
        .notEmpty()
        .withMessage('El nombre no puede estar vacío')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .withMessage('El nombre solo puede contener letras y espacios'),
    body('apellido_p')
        .isString()
        .withMessage('El apellido paterno debe ser un string')
        .notEmpty()
        .withMessage('El apellido paterno no puede estar vacío')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .withMessage('El apellido paterno solo puede contener letras y espacios'),
    body('apellido_m')
        .isString()
        .withMessage('El apellido materno debe ser un string')
        .notEmpty()
        .withMessage('El apellido materno no puede estar vacío')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .withMessage('El apellido materno solo puede contener letras y espacios'),
    body('mail').
        isString().
        withMessage('El correo debe ser un string').
        isEmail().
        withMessage('El correo debe ser un correo válido').
        notEmpty().
        withMessage('El correo no puede estar vacío').
        escape(),
    body('password').
        isString().
        withMessage('La contraseña debe ser un string').
        notEmpty().
        withMessage('La contraseña no puede estar vacía').
        escape(),
    body('genero').
        isString().
        withMessage('El genero debe ser un string').
        notEmpty().
        withMessage('El genero no puede estar vacío').
        escape(),
    body('prevision').
        isString().
        withMessage('La prevision debe ser un string').
        notEmpty().
        withMessage('La prevision no puede estar vacío').
        escape(),
    body('fecha_de_nacimiento').
        isString().
        withMessage('La fecha de nacimiento debe ser un date').
        notEmpty().
        withMessage('La fecha de nacimiento no puede estar vacío').
        escape(),
    body('telefono').
        isNumeric().
        withMessage('El telefono debe ser un numero').
        notEmpty().
        withMessage('El telefono no puede estar vacío').
        escape(),
    body('afp').
        isString().
        withMessage('La afp debe ser un string').
        notEmpty().
        withMessage('La afp no puede estar vacío').
        escape(),
    body('direccion').
        isString().
        withMessage('La direccion debe ser un string').
        notEmpty().
        withMessage('La direccion no puede estar vacío').
        escape(),
    body('rut').
        isString().
        withMessage('El rut debe ser un string').
        notEmpty().
        withMessage('El rut no puede estar vacío').
        escape(),
    body('region').
        isString().
        withMessage('La region debe ser un string').
        notEmpty().
        withMessage('La region no puede estar vacío').
        escape(),
    body('comuna').
        isString().
        withMessage('La comuna debe ser un string').
        notEmpty().
        withMessage('La comuna no puede estar vacío').
        escape(),
    body('rol').
        isString().
        withMessage('El rol debe ser un string').
        notEmpty().
        withMessage('El rol no puede estar vacío').
        escape(),
];

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    const errorMessages = errors.array().map(error => error.msg);
    return res.status(400).json( { 
        status: 'error', 
        statusCode: 400,  
        timestamp: new Date().toISOString(),
        errors: errorMessages 
    } );
}

module.exports = {
    validateUser,
    validate
}