const { body, validationResult } = require('express-validator');

const validateComment = [
    body('resumen')
        .isString()
        .withMessage('El resumen debe ser un string')
        .notEmpty()
        .withMessage('El resumen no puede estar vacío')
        .escape(),
    body('detalle')
        .isString()
        .withMessage('El detalle debe ser un string')
        .notEmpty()
        .withMessage('El detalle no puede estar vacío')
        .escape(),
    body('fecha')
        .isISO8601()
        .toDate()
        .withMessage('La fecha debe ser una fecha válida en formato ISO8601')
        .notEmpty()
        .withMessage('La fecha no puede estar vacía'),
    body('publicador')
        .isString()
        .withMessage('El publicador debe ser un string')
        .notEmpty()
        .withMessage('El publicador no puede estar vacío')
        .escape(),
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
        errors: errorMessages });
}

module.exports = {
    validateComment,
    validate   
};
