const express = require('express');
const ProjectController = require('../controllers/project.controller.js');
const { authenticateMiddleware } = require('../middlewares/authentication.middleware');
const { 
  roleAuthorizationMiddleware, 
  requirePermission, 
  requireTool 
} = require('../middlewares/role-authorization.middleware');
const { validateProject } = require('../middlewares/project.middlewares');
const { validateBody, validateParams } = require('../middlewares/validation.middleware');
const { projectSchemas } = require('../utils/validation-schemas');

class ProjectRoutes {
    constructor() {
        this.router = express.Router();

        // Rutas para la entidad Project
        this.router.get('/projects', ProjectController.getProjects);
        
        this.router.get('/projects/:id', roleAuthorizationMiddleware(['admin', 'superadmin', 'superintendente']), requireTool("crear_proyecto"), validateParams(projectSchemas.params), ProjectController.getProjectById);

        this.router.post('/projects', roleAuthorizationMiddleware(['admin', 'superadmin']), requirePermission("gestion_proyectos"), validateBody(projectSchemas.create), ProjectController.crearproyecto);
        
        this.router.put('/projects/:id', roleAuthorizationMiddleware(['admin', 'superadmin']), requirePermission("gestion_proyectos"), validateParams(projectSchemas.params), validateBody(projectSchemas.update), ProjectController.updateProject);
        this.router.delete('/projects/:id', roleAuthorizationMiddleware(['admin', 'superadmin']), requirePermission("gestion_proyectos"), validateParams(projectSchemas.params), ProjectController.deleteProject);
        // this.router.post('/projects', authenticateMiddleware(['admin']), validateProject, ProjectController.createProject);


        this.router.get('/projects/:id/details', validateParams(projectSchemas.params), ProjectController.getProjectDetails);

        //traer fecha inicio y termino del proyecto
        this.router.get('/proyecto/fecha/:id', validateParams(projectSchemas.params), ProjectController.getfechabyid);
    }

    getRouter() {
        return this.router;
    }
}

const projectRoutes = new ProjectRoutes();
module.exports = projectRoutes;
