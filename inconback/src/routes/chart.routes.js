const express = require("express");
const ChartController = require("../controllers/chart.controller");
const { authenticateMiddleware } = require('../middlewares/authentication.middleware');

class ChartRoutes {
    constructor() {
        this.router = express.Router();

        // Ruta para obtener configuraciones de gráficos por usuario, proyecto y tipo de gráfico
        this.router.get("/userChartSettings/:userId/:projectId/:chartId", ChartController.getUserChartSettings);


        // Ruta para guardar o actualizar configuraciones de gráficos
        this.router.post("/saveChartSettings", ChartController.saveUserChartSettings);

        // Puedes agregar más rutas si es necesario para otras funcionalidades
        // Por ejemplo, si quisieras obtener configuraciones por `chartId`
        // this.router.get("/chartSettings/:chartId", ChartController.getChartSettingsById);
    }

    getRouter() {
        return this.router;
    }
}

module.exports = new ChartRoutes();
