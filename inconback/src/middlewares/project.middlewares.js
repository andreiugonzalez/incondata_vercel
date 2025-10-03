const { body, validationResult } = require('express-validator');

const validateProject = [
    body('nombre')
        .isString()
        .withMessage('El nombre debe ser un string')
        .notEmpty()
        .withMessage('El nombre no puede estar vacío')
        .escape(),
    body('fecha_inicio')
        .isDate()
        .withMessage('La fecha de inicio debe ser una fecha válida')
        .notEmpty()
        .withMessage('La fecha de inicio no puede estar vacía')
        .escape(),
    body('fecha_termino')
        .optional({ nullable: true })
        .isDate()
        .withMessage('La fecha de término debe ser una fecha válida')
        .escape(),
    body('duenio')
        .isString()
        .withMessage('El dueño debe ser un string')
        .notEmpty()
        .withMessage('El dueño no puede estar vacío')
        .escape(),
    body('informador')
        .optional({ nullable: true })
        .isString()
        .withMessage('El informador debe ser un string')
        .escape(),
    body('presupuesto')
        .optional({ nullable: true })
        .isDecimal({ decimal_digits: '2' })
        .withMessage('El presupuesto debe ser un número decimal válido')
        .escape(),
        body('codigo_bip')
        .isInt()
        .withMessage('El codigo bip debe ser un int')
        .notEmpty()
        .escape(),
        body('nombre_unidad_tecnica')
        .isString()
        .withMessage('El nombre de la unidad tecnica debe ser un string')
        .notEmpty()
        .escape(),
        body('total_general')
        .isInt()
        .withMessage('El total general debe ser un int')
        .notEmpty()
        .escape(),
        body('geolocalizacion')
        .isString()
        .withMessage('La geolocalizacion debe ser un string')
        .notEmpty()
        .escape(),
        body('monto_total_bruto')
        .isInt()
        .withMessage('El monto total bruto debe ser un int')
        .notEmpty()
        .escape(),
        body('monto_neto')
        .isInt()
        .withMessage('El monto neto debe ser un int')
        .notEmpty()
        .escape(),
        body('monto_mensual')
        .isInt()
        .withMessage('El monto mensual debe ser un int')
        .notEmpty()
        .escape(),
        body('rut_unidad_tecnica')
        .isString()
        .withMessage('El rut unidad tecnica debe ser un string')
        .notEmpty()
        .escape(),
        body('rut_empresa')
        .isString()
        .withMessage('El rut empresa debe ser un string')
        .notEmpty()
        .escape(),
        body('id_estadoproyecto')
        .isInt()
        .withMessage('El id del estado de proyecto debe ser un int')
        .notEmpty()
        .escape(),
        body('id_mina')
        .isInt()
        .withMessage('El id de la mina debe ser un int')
        .notEmpty()
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
    validateProject,
    validate
};
