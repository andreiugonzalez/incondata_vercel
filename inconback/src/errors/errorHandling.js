const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  // Log del error (mejorado)
  logger.error(`Error: ${err.message}`, {
    error: err.name,
    url: req.originalUrl,
    method: req.method,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  let statusCode = 500;
  let message = 'Internal server error';

  // Manejo básico de errores conocidos
  if (err.name === 'CustomHttpError') {
    statusCode = err.statusCode || 400;
    message = err.message;
  } else if (err.name === 'ValidationError') {
    statusCode = 422;
    message = 'Validation failed';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  // Respuesta simple con timestamp opcional
  const errorResponse = {
    statusCode,
    message,
    timestamp: new Date().toISOString()
  };

  // Agregar stack trace solo en desarrollo
  if (process.env.NODE_ENV === 'development' && err.stack) {
    errorResponse.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
};

module.exports = { errorHandler };