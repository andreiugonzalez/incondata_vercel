const express = require('express');
const { authenticateMiddleware } = require('../middlewares/authentication.middleware');
const ComponenteController = require('../controllers/componente.controller');

class ComponenteRoutes {
    constructor() {
        this.router = express.Router();
        this.router.get('/componente/:id/:relationType', ComponenteController.getComponentesByRelationId);
    }

    getRouter() {
        return this.router;
    }
}

const componenteRoutes = new ComponenteRoutes();
module.exports = componenteRoutes;