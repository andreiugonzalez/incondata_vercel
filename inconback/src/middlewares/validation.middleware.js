const Joi = require('joi');

/**
 * Middleware genérico para validación usando Joi
 * @param {Object} schema - Esquema de validación de Joi
 * @param {string} property - Propiedad del request a validar ('body', 'params', 'query')
 * @returns {Function} Middleware de Express
 */
const validate = (schema, property = 'body') => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[property], {
            abortEarly: false, // Retorna todos los errores, no solo el primero
            allowUnknown: false, // No permite propiedades no definidas en el schema
            stripUnknown: true // Remueve propiedades no definidas en el schema
        });

        if (error) {
            const errorDetails = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
                value: detail.context.value
            }));

            return res.status(400).json({
                success: false,
                message: 'Error de validación',
                errors: errorDetails
            });
        }

        // Reemplaza los datos originales con los datos validados y sanitizados
        req[property] = value;
        next();
    };
};

/**
 * Middleware para validar el body de la request
 * @param {Object} schema - Esquema de validación de Joi
 * @returns {Function} Middleware de Express
 */
const validateBody = (schema) => validate(schema, 'body');

/**
 * Middleware para validar los parámetros de la request
 * @param {Object} schema - Esquema de validación de Joi
 * @returns {Function} Middleware de Express
 */
const validateParams = (schema) => validate(schema, 'params');

/**
 * Middleware para validar los query parameters de la request
 * @param {Object} schema - Esquema de validación de Joi
 * @returns {Function} Middleware de Express
 */
const validateQuery = (schema) => validate(schema, 'query');

/**
 * Middleware combinado para validar múltiples partes de la request
 * @param {Object} schemas - Objeto con esquemas para body, params, query
 * @returns {Function} Middleware de Express
 */
const validateAll = (schemas) => {
    return (req, res, next) => {
        const errors = [];

        // Validar body si se proporciona schema
        if (schemas.body) {
            const { error } = schemas.body.validate(req.body, {
                abortEarly: false,
                allowUnknown: false,
                stripUnknown: true
            });
            if (error) {
                errors.push(...error.details.map(detail => ({
                    field: `body.${detail.path.join('.')}`,
                    message: detail.message,
                    value: detail.context.value
                })));
            }
        }

        // Validar params si se proporciona schema
        if (schemas.params) {
            const { error } = schemas.params.validate(req.params, {
                abortEarly: false,
                allowUnknown: false,
                stripUnknown: true
            });
            if (error) {
                errors.push(...error.details.map(detail => ({
                    field: `params.${detail.path.join('.')}`,
                    message: detail.message,
                    value: detail.context.value
                })));
            }
        }

        // Validar query si se proporciona schema
        if (schemas.query) {
            const { error } = schemas.query.validate(req.query, {
                abortEarly: false,
                allowUnknown: false,
                stripUnknown: true
            });
            if (error) {
                errors.push(...error.details.map(detail => ({
                    field: `query.${detail.path.join('.')}`,
                    message: detail.message,
                    value: detail.context.value
                })));
            }
        }

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Error de validación',
                timestamp: new Date().toISOString(),
                errors: errors
            });
        }

        next();
    };
};

module.exports = {
    validate,
    validateBody,
    validateParams,
    validateQuery,
    validateAll
};