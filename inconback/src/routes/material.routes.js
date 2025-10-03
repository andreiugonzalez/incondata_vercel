const express = require('express');
const MaterialController = require('../controllers/material.controller');
const { authenticateMiddleware } = require('../middlewares/authentication.middleware');

class MaterialRoutes {
    constructor() {
        this.router = express.Router();
        this.router.post('/material/create',  MaterialController.createMaterial);
        this.router.put('/material/update/:id', MaterialController.updateMaterial);
        this.router.delete('/material/delete/:id', MaterialController.deleteMaterial);

        //Endpoint actualizar material por id
        this.router.put("/material/:id", MaterialController.updatedmaterialbyid);


           // Nuevo endpoint para validar existencia de materiales
           this.router.get('/material/validate', MaterialController.validateMaterials);
    }

    getRouter() {
        return this.router;
    }
}

module.exports = new MaterialRoutes();