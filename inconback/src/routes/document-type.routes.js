const express = require('express');
const DocumentTypeController = require('../controllers/document-type.controller');
const { authenticateMiddleware } = require('../middlewares/authentication.middleware');
const multer = require('multer');

const upload = multer();

class DocumentTypeRoutes {
    constructor() {
        this.router = express.Router();
        this.router.post('/document_type/create', authenticateMiddleware(['admin', 'superadmin']), upload.array('files'), DocumentTypeController.createDocumentType);
        this.router.get('/document_type', DocumentTypeController.getAllDocumentTypes); // Nueva ruta GET

    }

    getRouter() {
        return this.router;
    }
}

module.exports = new DocumentTypeRoutes();