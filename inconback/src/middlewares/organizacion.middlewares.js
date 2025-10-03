const { body, validationResult } = require('express-validator');

const validateOrganizacion = [
    body('nombre')
        .isString().withMessage('El nombre debe ser un string')
        .notEmpty().withMessage('El nombre no puede estar vacío')
        .isLength({ max: 100 }).withMessage('El nombre no puede exceder los 100 caracteres')
        .escape(),
        
    body('direccion')
        .isString().withMessage('La dirección debe ser un string')
        .notEmpty().withMessage('La dirección no puede estar vacía')
        .isLength({ max: 100 }).withMessage('La dirección no puede exceder los 100 caracteres')
        .escape(),

    body('id_codtelefono')
        .isInt().withMessage('El código de teléfono debe ser un número entero')
        .notEmpty().withMessage('El código de teléfono no puede estar vacío'),

    body('telefono')
        .isString().withMessage('El teléfono debe ser un string')
        .notEmpty().withMessage('El teléfono no puede estar vacío')
        .isLength({ max: 100 }).withMessage('El teléfono no puede exceder los 100 caracteres')
        .escape(),

    body('rut')
        .isString().withMessage('El RUT debe ser un string')
        .notEmpty().withMessage('El RUT no puede estar vacío')
        .isLength({ max: 12 }).withMessage('El RUT no puede exceder los 12 caracteres')
        .escape(),

    body('representante_legal')
        .isString().withMessage('El nombre del representante legal debe ser un string')
        .notEmpty().withMessage('El nombre del representante legal no puede estar vacío')
        .isLength({ max: 100 }).withMessage('El nombre del representante legal no puede exceder los 100 caracteres')
        .escape(),

    body('rut_representante_legal')
        .isString().withMessage('El RUT del representante legal debe ser un string')
        .notEmpty().withMessage('El RUT del representante legal no puede estar vacío')
        .isLength({ max: 100 }).withMessage('El RUT del representante legal no puede exceder los 100 caracteres')
        .escape(),

    body('id_comuna')
        .isInt().withMessage('El ID de la comuna debe ser un número entero')
        .notEmpty().withMessage('El ID de la comuna no puede estar vacío'),

    body('id_tipoempresa')
        .isInt().withMessage('El ID del tipo de empresa debe ser un número entero')
        .notEmpty().withMessage('El ID del tipo de empresa no puede estar vacío')
];

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    const errorMessages = errors.array().map(error => error.msg);
    return res.status(400).json({ 
        status: 'error', 
        statusCode: 400, 
        timestamp: new Date().toISOString(),
        errors: errorMessages 
    });
};

module.exports = {
    validateOrganizacion,
    validate
};
