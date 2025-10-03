const response = (statusCode, message, data = null, extra = null) => {
    const response = { statusCode, message };
    if (data != null) response.data = data;
    if (extra != null) response.extra = extra;
    return response;
}

const enhancedResponse = (statusCode, message, data = null, extra = null, enhanced = false) => {
    if (!enhanced) {
        return response(statusCode, message, data, extra);
    }
    
    const timestamp = new Date().toISOString();
    const responseObj = {
        statusCode,
        message,
        timestamp
    };
    
    if (data != null) responseObj.data = data;
    if (extra != null) responseObj.extra = extra;
    
    return responseObj;
}

const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
};

module.exports = { 
    response,           // Función original
    enhancedResponse,   // Función mejorada opcional
    HTTP_STATUS         // Constantes útiles
};