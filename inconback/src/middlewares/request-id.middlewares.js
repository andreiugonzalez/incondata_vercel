const { generateRequestId } = require('../utils/response');
const logger = require('../config/logger');

/**
 * Middleware para generar un ID único para cada request
 * y agregar logging básico de requests y responses
 */
const requestIdMiddleware = (req, res, next) => {
  // Generar ID único para la request
  req.requestId = generateRequestId();
  
  // Agregar el requestId a los headers de respuesta
  res.setHeader('X-Request-ID', req.requestId);
  
  // Log de la request entrante
  const startTime = Date.now();
  
  logger.info(`Request: ${req.method} ${req.originalUrl} - RequestID: ${req.requestId}`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    requestId: req.requestId
  });

  // Interceptar el final de la response para logging
  const originalSend = res.send;
  res.send = function(data) {
    const responseTime = Date.now() - startTime;
    
    logger.info(`Response: ${res.statusCode} - ${responseTime}ms - RequestID: ${req.requestId}`, {
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      requestId: req.requestId
    });
    
    return originalSend.call(this, data);
  };

  next();
};

module.exports = {
  requestIdMiddleware
};