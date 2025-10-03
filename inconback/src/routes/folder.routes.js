const express = require('express');
const FolderController = require('../controllers/folder.controller');
const { authenticateMiddleware } = require('../middlewares/authentication.middleware');
const { roleAuthorizationMiddleware, requirePermission, requireTool } = require('../middlewares/role-authorization.middleware');
const { validateFolder } = require('../middlewares/folder.middlewares');
const multer = require('multer');
const folderController = require('../controllers/folder.controller');

// Configuración de multer para manejar la subida de archivos
const storage = multer.memoryStorage(); // Guarda los archivos en memoria
const upload = multer({ storage });

class FolderRoutes {
    constructor() {
        this.router = express.Router();

        // Define las rutas
        // Listado general de folders requiere acceso a herramienta "documentos" o "mis_documentos"
        this.router.get(
            '/folders',
            roleAuthorizationMiddleware(['superadmin','admin','superintendente','supervisor','ITO','contratista','proyectista','prevencionista','planner','administrador de contrato','inspector','normal']),
            (req, res, next) => {
                // Permitir si tiene cualquiera de las herramientas de documentos
                if (req.user && (req.user.tools?.includes('documentos') || req.user.tools?.includes('mis_documentos'))) {
                    return next();
                }
                return res.status(403).json({ status: 'error', statusCode: 403, message: 'Acceso denegado a documentos' });
            },
            FolderController.getAllFolders
        );

        //buscador
        // Buscador en documentos requiere herramienta de documentos
        this.router.get(
            '/folders_doc_Buscador',
            roleAuthorizationMiddleware(['superadmin','admin','superintendente','supervisor','ITO','contratista','proyectista','prevencionista','planner','administrador de contrato','inspector','normal']),
            requireTool('documentos'),
            FolderController.getAllFoldersBuscador
        );


        //render con parent folder
        // Ver jerarquía con hijos requiere herramienta documentos o mis_documentos
        this.router.get(
            '/getFolderwithchildrens/:id',
            roleAuthorizationMiddleware(['superadmin','admin','superintendente','supervisor','ITO','contratista','proyectista','prevencionista','planner','administrador de contrato','inspector','normal']),
            (req, res, next) => {
                if (req.user && (req.user.tools?.includes('documentos') || req.user.tools?.includes('mis_documentos'))) {
                    return next();
                }
                return res.status(403).json({ status: 'error', statusCode: 403, message: 'Acceso denegado a documentos' });
            },
            FolderController.GetFolderWithchildrens
        )

        // Definimos la ruta para obtener la jerarquía de carpetas
        this.router.get(
            '/folders/:id/hierarchy',
            roleAuthorizationMiddleware(['superadmin','admin','superintendente','supervisor','ITO','contratista','proyectista','prevencionista','planner','administrador de contrato','inspector','normal']),
            requireTool('documentos'),
            FolderController.getFolderHierarchy
        );

        //traer carpetas del usuario para mover segun el id user y su path
        // Folders por path del usuario: accesible a dueños y roles con mis_documentos
        this.router.get(
            '/userFolder/:userId',
            roleAuthorizationMiddleware(['superadmin','admin','superintendente','supervisor','ITO','contratista','proyectista','prevencionista','planner','administrador de contrato','inspector','normal']),
            (req, res, next) => {
                const requestedUserId = parseInt(req.params.userId, 10);
                if (req.user && (req.user.id === requestedUserId || req.user.tools?.includes('mis_documentos'))) {
                    return next();
                }
                return res.status(403).json({ status: 'error', statusCode: 403, message: 'Acceso denegado al repositorio del usuario' });
            },
            folderController.getFoldersByPath
        )

        // papelera
        this.router.get(
            '/getFoldersTrash/:id',
            roleAuthorizationMiddleware(['superadmin','admin','superintendente','supervisor','ITO','contratista','proyectista','prevencionista','planner','administrador de contrato','inspector','normal']),
            requireTool('documentos'),
            FolderController.getTrashedFoldersAndDocuments
        )
        
        //carpeta raiz del usuario 
        this.router.get(
            '/rootFolder/:userId',
            roleAuthorizationMiddleware(['superadmin','admin','superintendente','supervisor','ITO','contratista','proyectista','prevencionista','planner','administrador de contrato','inspector','normal']),
            FolderController.getRootFolderByUserId
        );

        //traer folder por id
        this.router.get(
            '/folders/:id',
            roleAuthorizationMiddleware(['superadmin','admin','superintendente','supervisor','ITO','contratista','proyectista','prevencionista','planner','administrador de contrato','inspector','normal']),
            FolderController.getFolderById
        );

        //crear carpetas
        // Crear carpeta: permitir a usuarios con mis_documentos o documentos
        this.router.post(
            '/folders',
            roleAuthorizationMiddleware(['superadmin','admin','superintendente','supervisor','ITO','contratista','proyectista','prevencionista','planner','administrador de contrato','inspector','normal']),
            validateFolder,
            (req, res, next) => {
                if (req.user && (req.user.tools?.includes('mis_documentos') || req.user.tools?.includes('documentos'))) {
                    return next();
                }
                return res.status(403).json({ status: 'error', statusCode: 403, message: 'Permiso requerido para crear carpetas' });
            },
            FolderController.createFolder
        );

        //cambiar nombre de carpetas
        this.router.patch(
            '/folders/:id',
            roleAuthorizationMiddleware(['superadmin','admin','superintendente','supervisor','ITO','contratista','proyectista','prevencionista','planner','administrador de contrato','inspector','normal']),
            validateFolder,
            requireTool('documentos'),
            FolderController.updateFolder
        );

        //aun sin uso
        this.router.delete(
            '/folders/:id',
            roleAuthorizationMiddleware(['superadmin','admin','superintendente','supervisor','ITO','contratista','proyectista','prevencionista','planner','administrador de contrato','inspector','normal']),
            requireTool('documentos'),
            FolderController.deleteFolder
        );

        //buscar la carpeta root global
        this.router.get(
            '/folders-root-global/:folderName/:idParam',
            roleAuthorizationMiddleware(['superadmin','admin','superintendente','supervisor','ITO','contratista','proyectista','prevencionista','planner','administrador de contrato','inspector','normal']),
            requireTool('documentos'),
            FolderController.getFolderRaiz
        );

        // Ruta para obtener la carpeta raíz del usuario
        this.router.get(
            '/folders-raiz/:id/:path',
            roleAuthorizationMiddleware(['superadmin','admin','superintendente','supervisor','ITO','contratista','proyectista','prevencionista','planner','administrador de contrato','inspector','normal']),
            FolderController.getFolderRaizUser
        );

        //ruta para actualizar el urifolder tabla user (descontinuado)
        this.router.patch(
            '/uri-folder/:id',
            roleAuthorizationMiddleware(['superadmin','admin']),
            FolderController.updateFolderUri
        );

        // Nueva ruta para subir archivos con multer como middleware
        // Subida de archivos a folder restringida a herramienta documentos
        this.router.post(
            '/upload-file-folder',
            roleAuthorizationMiddleware(['superadmin','admin','superintendente','supervisor','ITO','contratista','proyectista','prevencionista','planner','administrador de contrato','inspector','normal']),
            requireTool('documentos'),
            upload.single('file'),
            FolderController.uploadFile
        );

        //calcular el total size general no unico por carpeta ni doc
        this.router.get(
            '/total-file-size/:path',
            roleAuthorizationMiddleware(['superadmin','admin','superintendente','supervisor','ITO','contratista','proyectista','prevencionista','planner','administrador de contrato','inspector','normal']),
            requireTool('documentos'),
            FolderController.getTotalFileSize
        );



        // Ruta para agregar o quitar usuarios de favoritos
        this.router.post(
            '/folders/toggle-favorite',
            roleAuthorizationMiddleware(['superadmin','admin','superintendente','supervisor','ITO','contratista','proyectista','prevencionista','planner','administrador de contrato','inspector','normal']),
            requireTool('documentos'),
            FolderController.toggleFavorite
        );

        // Nueva ruta para agregar o quitar favoritos de documentos
        this.router.post(
            '/documents/toggle-favorite',
            roleAuthorizationMiddleware(['superadmin','admin','superintendente','supervisor','ITO','contratista','proyectista','prevencionista','planner','administrador de contrato','inspector','normal']),
            requireTool('documentos'),
            FolderController.toggleFavoritedocument
        );


        this.router.get(
            '/folders/favorites/:userId',
            roleAuthorizationMiddleware(['superadmin','admin','superintendente','supervisor','ITO','contratista','proyectista','prevencionista','planner','administrador de contrato','inspector','normal']),
            FolderController.getFavoriteFolders
        );





        // mover a papelera 
        // Rutas para las carpetas
        this.router.put(
            '/folderstrash/:id_folder',
            roleAuthorizationMiddleware(['superadmin','admin','superintendente','supervisor','ITO','contratista','proyectista','prevencionista','planner','administrador de contrato','inspector','normal']),
            requireTool('documentos'),
            FolderController.toggleTrashFolder
        );


        // Rutas para los documentos
        this.router.put(
            '/foldersdocumentstrash/:id_document',
            roleAuthorizationMiddleware(['superadmin','admin','superintendente','supervisor','ITO','contratista','proyectista','prevencionista','planner','administrador de contrato','inspector','normal']),
            requireTool('documentos'),
            FolderController.toggleTrashDocument
        );

        // Eliminar permanentemente carpetas
        this.router.delete('/folders/permanently/:id_folder', FolderController.deleteFolderPermanently);

        // Eliminar permanentemente documentos  
        this.router.delete('/documents/permanently/:id_document', FolderController.deleteDocumentPermanently);

        // Vaciar papelera
        this.router.put('/trash/empty', FolderController.emptyTrash);
    }

    getRouter() {
        return this.router;
    }
}

const folderRoutes = new FolderRoutes();
module.exports = folderRoutes;
