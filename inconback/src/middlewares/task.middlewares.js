const { body, validationResult } = require('express-validator');

const validateTask = [
    body('nombre')
        .isString()
        .withMessage('El nombre debe ser un string')
        .notEmpty()
        .withMessage('El nombre no puede estar vacío')
        .escape(),
    body('estado')
        .isString()
        .withMessage('El estado debe ser un string')
        .notEmpty()
        .withMessage('El estado no puede estar vacío')
        .escape(),
    body('descripcion')
        .optional({ nullable: true })
        .isString()
        .withMessage('La descripción debe ser un string')
        .escape()
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
    validateTask,
    validate
};
