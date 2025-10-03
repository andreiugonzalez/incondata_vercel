const { body, validationResult } = require('express-validator');

const validateFolder = [
    body('id_adjunto')
        .isInt()
        .withMessage('El id_adjunto debe ser un número entero'),

    body('nombre_archivo')
        .isString()
        .withMessage('El nombre del archivo debe ser una cadena de caracteres')
        .notEmpty()
        .withMessage('El nombre del archivo no puede estar vacío'),

    body('nombre_S3_cloud')
        .isString()
        .withMessage('El nombre del archivo en S3 debe ser una cadena de caracteres')
        .notEmpty()
        .withMessage('El nombre del archivo en S3 no puede estar vacío'),

    body('enlace')
        .isString()
        .withMessage('El enlace debe ser una cadena de caracteres')
        .notEmpty()
        .withMessage('El enlace no puede estar vacío'),

    body('usuario')
        .isInt()
        .withMessage('El usuario debe ser un número entero')
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
}

module.exports = {
    validateFolder,
    validate
};
