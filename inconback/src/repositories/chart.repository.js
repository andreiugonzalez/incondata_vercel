const { sequelize } = require('../config/sequelize-config');
const { CustomHttpError } = require('../errors/customError');
const { Sequelize, Op } = require('sequelize');

class ChartRepository {

    // Obtener configuraciones de gráficos por usuario y proyecto
    async getUserChartSettings(userId, projectId, chartId) {
        try {
            const settings = await sequelize.models.UserChartSettings.findAll({
                where: { userId, projectId, chartId }
            });
    
            if (!settings.length) {
                // Si no se encuentra configuración, simplemente retornar una lista vacía o manejarlo como prefieras
                return [];
            }
    
            return settings;
        } catch (error) {
            console.error('Error fetching chart settings:', error);
            throw new CustomHttpError(500, 'Error fetching chart settings');
        }
    }
    

    // Guardar o actualizar configuraciones de gráficos
    async saveOrUpdateChartSettings(userId, projectId, chartId, settings) {
        try {
            const existingConfig = await sequelize.models.UserChartSettings.findOne({
                where: { userId, projectId, chartId }
            });

            if (existingConfig) {
                // Actualizar configuración existente
                await existingConfig.update({ settings });
                return 'Chart settings updated successfully.';
            } else {
                // Crear nueva configuración
                await sequelize.models.UserChartSettings.create({ userId, projectId, chartId, settings });
                return 'Chart settings saved successfully.';
            }
        } catch (error) {
            console.error('Error saving or updating chart settings:', error);
            throw new CustomHttpError(500, 'Error saving or updating chart settings');
        }
    }

    // Eliminar configuraciones de gráficos por usuario y proyecto
    async deleteUserChartSettings(userId, projectId, chartId) {
        try {
            const deletedRows = await sequelize.models.UserChartSettings.destroy({
                where: { userId, projectId, chartId }
            });

            if (deletedRows === 0) {
                throw new CustomHttpError(404, `No chart settings found for userId ${userId}, projectId ${projectId} and chartId ${chartId}`);
            }

            return 'Chart settings deleted successfully.';
        } catch (error) {
            console.error('Error deleting chart settings:', error);
            throw new CustomHttpError(500, 'Error deleting chart settings');
        }
    }
}

module.exports = new ChartRepository();
