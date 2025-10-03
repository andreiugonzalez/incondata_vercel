const express = require('express');
const OrganizacionController = require('../controllers/organizacion.controller');
const { authenticateMiddleware } = require('../middlewares/authentication.middleware');

const { validateOrganizacion, validate } = require('../middlewares/organizacion.middlewares');

class OrganizacionRoutes {
    constructor() {
        
        this.router = express.Router();
           // Endpoint para obtener la organización asociada al usuario
           this.router.get('/organizacion/usuario',authenticateMiddleware(['admin', 'superadmin']), OrganizacionController.getOrganizacionByUserEmail);
           
        this.router.get('/organizacion', authenticateMiddleware(['admin', 'superadmin', 'ITO', 'planner', 'superintendente', 'inspector']), OrganizacionController.getOrganizaciones);
        this.router.get('/organizacion/:id', authenticateMiddleware(['admin', 'superadmin']), OrganizacionController.getOrganizacionById);
        
        this.router.post('/organizacion', authenticateMiddleware(['admin', 'superadmin']), validateOrganizacion, validate, OrganizacionController.createOrganizacion);

        this.router.put('/organizacion/:id', authenticateMiddleware(['admin', 'superadmin']),  OrganizacionController.updateOrganizacion);

        this.router.delete('/organizacion/:id', authenticateMiddleware(['admin', 'superadmin']), OrganizacionController.deleteOrganizacion);

     
    }

    getRouter() {
        return this.router;
    }
}

const organizacionRoutes = new OrganizacionRoutes();
module.exports = organizacionRoutes;
