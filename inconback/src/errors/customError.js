class CustomError extends Error {
    httpStatusCode;
    timestamp;
    documentationUrl;
  
    constructor(httpStatusCode, message, documentationUrl) {
      if (message) {
        super(message);
      } else {
        super("A generic error occurred!");
      }
  
      this.httpStatusCode = httpStatusCode;
      this.timestamp = new Date().toISOString();
      this.status = 'error';
      this.documentationUrl = documentationUrl;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  module.exports = {
    CustomHttpError: CustomError,
  };
  