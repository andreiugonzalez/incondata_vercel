const express = require('express');
const paisController = require('../controllers/pais.controller');
const { authenticateMiddleware } = require('../middlewares/authentication.middleware');

class PaisRoutes {
    constructor() {
        this.router = express.Router();
        this.router.get('/pais', paisController.getPaises);
    }

    getRouter() {
        return this.router;
    }
}

const paisRoutes = new PaisRoutes();
module.exports = paisRoutes;