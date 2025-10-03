const express = require('express');
const { authenticateMiddleware } = require('../middlewares/authentication.middleware');
const SelectGenericoController = require('../controllers/selectgenerico.controller');

class GenericRoutes {
    constructor() {
        this.router = express.Router();




        // Definir la ruta para obtener las regiones por país
        this.router.get('/paises/:paisId/regiones', authenticateMiddleware(['admin', 'superadmin']), SelectGenericoController.getRegionesPorPais);
        //responsable
        this.router.get('/users/:userId', SelectGenericoController.getUsernotid);

        // Ruta para obtener comunas por región
        this.router.get('/regiones/:regionId/comunas', authenticateMiddleware(['admin', 'superadmin']), SelectGenericoController.getComunasPorRegion);
        this.router.get('/paises', authenticateMiddleware(['admin', 'superadmin']), SelectGenericoController.getAllPaises);
        this.router.get('/afp', SelectGenericoController.getAfp);
        this.router.get('/organizacion_select', SelectGenericoController.getOrganizacion);
        this.router.get('/salud', SelectGenericoController.getSalud);
        this.router.get('/tipo_contrato', authenticateMiddleware(['admin']), SelectGenericoController.getTipoContrato);
        this.router.get('/medio_pago', authenticateMiddleware(['admin']), SelectGenericoController.getMedioPago);
        this.router.get('/rol', SelectGenericoController.getRol);
        this.router.get('/roles/internos', SelectGenericoController.getRolesInternos);
        this.router.get('/roles/externos', SelectGenericoController.getRolesExternos);

        this.router.get('/nombre_banco', authenticateMiddleware(['admin']), SelectGenericoController.getNombreBanco);

        this.router.get('/tipo_cuenta_banco', authenticateMiddleware(['admin']), SelectGenericoController.getTipoCuentaBanco);


        this.router.get('/cod_telefono', authenticateMiddleware(['admin', 'superadmin']), SelectGenericoController.getCodTelefono);


        this.router.get('/estado_civil', SelectGenericoController.getEstadoCivil);
        this.router.get('/estado_cuenta', authenticateMiddleware(['admin']), SelectGenericoController.getEstadoCuenta);

        this.router.get('/relacion_emergencia', SelectGenericoController.getcontactoEmergencia);
        this.router.get('/puesto', SelectGenericoController.getPuesto);
        this.router.get('/grupo', SelectGenericoController.getGrupo);

        //no utilizadas


        this.router.get('/comuna', authenticateMiddleware(['admin']), SelectGenericoController.getComuna);
        this.router.get('/region', authenticateMiddleware(['admin']), SelectGenericoController.getRegion);
        this.router.get('/tipo_empresa', authenticateMiddleware(['admin', 'superadmin']), SelectGenericoController.getTipoEmpresa);
        this.router.get('/nombre_banco', authenticateMiddleware(['admin']), SelectGenericoController.getNombreBanco);




        //this.router.get('/tramo_salud', authenticateMiddleware(['admin']), SelectGenericoController.getTramoSalud);


        this.router.get('/estado_tarea', authenticateMiddleware(['admin']), SelectGenericoController.getEstadoTarea);


        // this.router.get('/tramo_afp', authenticateMiddleware(['admin']), SelectGenericoController.getTramoAfp); //

        this.router.get('/unidad', authenticateMiddleware(['admin']), SelectGenericoController.getUnidad); // 
        this.router.get('/estado_proyecto', authenticateMiddleware(['admin']), SelectGenericoController.getEstadoProyecto); //..


        // tabla creada, sin datos para testear,
        this.router.get('/tipo_documento', authenticateMiddleware(['admin']), SelectGenericoController.getTipoDocumento); //

        //user rol contratista - COMENTADO TEMPORALMENTE
        // this.router.get('/user/users', SelectGenericoController.getUserContratista);

        //user rol superintendente
        this.router.get('/user/users_superint', SelectGenericoController.getUsersuperintendente);


        //user rol inspector
        this.router.get('/user/users_inspector', SelectGenericoController.getUserinspector);


        //user rol ITO //
        this.router.get('/user/users_ITO', SelectGenericoController.getUserITO);



        //user rol planer
        this.router.get('/user/users_planner', SelectGenericoController.getUserplanner);

        //user rol supervisor
        this.router.get('/user/users_supervisor', SelectGenericoController.getUsersupervisor);

        //user rol ITO
        this.router.get('/rol/ito', authenticateMiddleware(['admin']), SelectGenericoController.getrolITO);

        //user rol administrador de contrato
        this.router.get('/user/users_admcontrato', SelectGenericoController.getUsersadmincontrato);

        //user rol administrador de prevencionista //
        this.router.get('/user/users_prevencionista', SelectGenericoController.getUserprevencionista);



        //minas con id y name
        this.router.get('/minename', SelectGenericoController.getMinesname);

        //Estado proyecto con id y name
        this.router.get('/estadoproyecto', SelectGenericoController.getEstadoproyecto);

        //endpoint unidad
        this.router.get('/unidades', SelectGenericoController.getUnidades);



        // Ruta para obtener región y país por comuna
        this.router.get('/comunas/:comunaId/location', SelectGenericoController.getLocationByComuna);


    }

    getRouter() {
        return this.router;
    }
}

const genericRoutes = new GenericRoutes();
module.exports = genericRoutes;
