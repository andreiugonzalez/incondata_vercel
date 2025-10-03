const ChartRepository = require('../repositories/chart.repository');
const { response } = require('../utils/response');

class ChartController {

   // Obtener configuraciones de gráficos por usuario, proyecto y tipo de gráfico
   async getUserChartSettings(req, res, next) {
    const { userId, projectId, chartId } = req.params;
    
    try {
        const chartSettings = await ChartRepository.getUserChartSettings(userId, projectId, chartId);
        if (!chartSettings) {
            return res.status(404).json({ message: "Configuración no encontrada" });
        }
        res.status(200).json(chartSettings);
    } catch (error) {
        next(error);
    }
}

    // Guardar o actualizar configuraciones de gráficos
    async saveUserChartSettings(req, res, next) {
        try {
            const { userId, projectId, chartId, settings } = req.body;
            const result = await ChartRepository.saveOrUpdateChartSettings(userId, projectId, chartId, settings);
            res.status(200).send(response(200, result));
        } catch (error) {
            console.log(error);
            return next(error);
        }
    }
}

module.exports = new ChartController();
