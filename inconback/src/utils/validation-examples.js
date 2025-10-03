/**
 * Ejemplos de uso del middleware de validación con Joi
 * 
 * Este archivo contiene ejemplos prácticos de cómo usar el middleware de validación
 * implementado en la aplicación.
 */

const { validateBody, validateParams, validateQuery, validateAll } = require('../middlewares/validation.middleware');
const { userSchemas, projectSchemas, commentSchemas, querySchemas } = require('./validation-schemas');

/**
 * EJEMPLO 1: Validación simple del body
 * 
 * Uso en rutas:
 * router.post('/login', validateBody(userSchemas.login), UserController.login);
 */

/**
 * EJEMPLO 2: Validación de parámetros
 * 
 * Uso en rutas:
 * router.get('/user/:id', validateParams(userSchemas.params), UserController.getUserById);
 */

/**
 * EJEMPLO 3: Validación de query parameters
 * 
 * Uso en rutas:
 * router.get('/users', validateQuery(querySchemas.pagination), UserController.getUsers);
 */

/**
 * EJEMPLO 4: Validación múltiple (body + params)
 * 
 * Uso en rutas:
 * router.put('/user/:id', 
 *   validateParams(userSchemas.params),
 *   validateBody(userSchemas.update),
 *   UserController.updateUser
 * );
 */

/**
 * EJEMPLO 5: Validación combinada usando validateAll
 * 
 * Uso en rutas:
 * router.put('/user/:id', 
 *   validateAll({
 *     params: userSchemas.params,
 *     body: userSchemas.update,
 *     query: querySchemas.filters
 *   }),
 *   UserController.updateUser
 * );
 */

/**
 * EJEMPLO 6: Esquema personalizado inline
 * 
 * const Joi = require('joi');
 * 
 * const customSchema = Joi.object({
 *   email: Joi.string().email().required(),
 *   age: Joi.number().integer().min(18).max(100).required()
 * });
 * 
 * router.post('/custom', validateBody(customSchema), Controller.customMethod);
 */

/**
 * EJEMPLO 7: Manejo de errores de validación
 * 
 * Cuando la validación falla, el middleware retorna automáticamente:
 * 
 * {
 *   "success": false,
 *   "message": "Error de validación",
 *   "errors": [
 *     {
 *       "field": "email",
 *       "message": "\"email\" must be a valid email",
 *       "value": "invalid-email"
 *     },
 *     {
 *       "field": "password",
 *       "message": "\"password\" length must be at least 6 characters long",
 *       "value": "123"
 *     }
 *   ]
 * }
 */

/**
 * EJEMPLO 8: Validación con archivos (multer + joi)
 * 
 * router.post('/upload',
 *   upload.single('file'),
 *   validateBody(Joi.object({
 *     title: Joi.string().required(),
 *     description: Joi.string().optional()
 *   })),
 *   Controller.uploadFile
 * );
 */

/**
 * EJEMPLO 9: Validación condicional
 * 
 * const conditionalSchema = Joi.object({
 *   type: Joi.string().valid('user', 'admin').required(),
 *   permissions: Joi.when('type', {
 *     is: 'admin',
 *     then: Joi.array().items(Joi.string()).required(),
 *     otherwise: Joi.forbidden()
 *   })
 * });
 */

/**
 * EJEMPLO 10: Validación con transformación de datos
 * 
 * const transformSchema = Joi.object({
 *   email: Joi.string().email().lowercase().trim().required(),
 *   name: Joi.string().trim().required(),
 *   age: Joi.number().integer().min(0).max(120).required()
 * });
 * 
 * // Los datos se transforman automáticamente (email a minúsculas, trim en strings)
 */

module.exports = {
    // Este archivo es solo para documentación y ejemplos
    // No exporta funciones, solo sirve como referencia
};