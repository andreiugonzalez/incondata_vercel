const express = require('express');
const DocumentController = require('../controllers/document.controller');
const { roleAuthorizationMiddleware, requireTool } = require('../middlewares/role-authorization.middleware');
const multer = require('multer');

const upload = multer();

class DocumentRoutes {
    constructor() {
        this.router = express.Router();
        this.router.post('/document/create', roleAuthorizationMiddleware(['superadmin','admin','superintendente','supervisor','ITO','contratista','proyectista','prevencionista','planner','administrador de contrato','inspector','normal']), requireTool('documentos'), upload.array('files'), DocumentController.postDocument);
        this.router.post('/document/organization/create', roleAuthorizationMiddleware(['superadmin','admin']), upload.single('file'), DocumentController.postDocumentOrganization);
        this.router.post('/document/organization_profile/create', roleAuthorizationMiddleware(['superadmin','admin']), upload.single('file'), DocumentController.postProfDocumentOrganization);

        //profile para mina
        this.router.post('/document/mina_profile/create', roleAuthorizationMiddleware(['superadmin','admin']), upload.single('file'), DocumentController.postProfDocumentMina);

        this.router.post('/document/user_profile/create', roleAuthorizationMiddleware(['superadmin','admin','proyectista']), upload.single('file'), DocumentController.postProfUser);

        //crear docs
        this.router.post('/document/user/create', roleAuthorizationMiddleware(['superadmin','admin','proyectista','superintendente','supervisor','ITO']), requireTool('documentos'), upload.single('file'), DocumentController.postDocumentUser);


        this.router.post('/document/project/create', roleAuthorizationMiddleware(['superadmin','admin','superintendente','ITO','supervisor']), requireTool('documentos'), upload.single('file'), DocumentController.postDocumentProject);
        this.router.post('/document/folder/create', roleAuthorizationMiddleware(['superadmin','admin','superintendente','supervisor','ITO','proyectista']), requireTool('documentos'), upload.single('file'), DocumentController.postDocumentFolder);


        // Ruta para actualizar la imagen de perfil del usuario
        // this.router.patch('/user/:id/profile-picture', authenticateMiddleware(['superadmin', 'admin']), upload.single('profile_picture'), DocumentController.updateProfilePicture);

        this.router.get('/Adjuntos_proyecto/:id', roleAuthorizationMiddleware(['superadmin','admin','superintendente','ITO','supervisor','contratista','inspector','planner']), requireTool('documentos'), DocumentController.GetAdjuntosProyecto)

        //actualizar nombre de documento en modulo drive

        this.router.patch('/documents/:id', roleAuthorizationMiddleware(['superadmin','admin','superintendente','supervisor','ITO','proyectista']), requireTool('documentos'), DocumentController.updateDocumentFilename);

        // Adjuntar documentos a partidas restringido a roles de ejecución (no proyectista)
        this.router.post('/document/partida/create', roleAuthorizationMiddleware(['superadmin','admin','superintendente','supervisor','ITO','contratista','planner']), requireTool('partidas'), upload.array('files'), DocumentController.postDocumentPartida);


        //obtener adjuntos partidas

        this.router.get('/document/partidas_adjuntos/:id/:entityType', roleAuthorizationMiddleware(['superadmin','admin','superintendente','supervisor','ITO','contratista','planner']), requireTool('partidas'), DocumentController.getDocumentByEntityId)

        // Ruta para marcar un documento como eliminado permanentemente
        this.router.patch('/document/permanently-delete/:id', roleAuthorizationMiddleware(['superadmin','admin']), DocumentController.markAsPermanentlyDeleted);


    }

    getRouter() {
        return this.router;
    }
}

const documentRoutes = new DocumentRoutes();
module.exports = documentRoutes;