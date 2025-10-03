const { sequelize } = require('../config/sequelize-config');
const { CustomHttpError } = require('../errors/customError');
const { Op } = require('sequelize');

class MaterialRepository {
    async createMaterial(material) {
        const newMaterial = await sequelize.models.Material.create(material);
        return newMaterial;
    }

    async updateMaterial(id, material) {
        let materialToUpdate = await sequelize.models.Material.findByPk(id);
        if (!materialToUpdate) {
            throw new CustomHttpError(404, 'Material no encontrado');
        }

        materialToUpdate = await materialToUpdate.update(material);

        return materialToUpdate;
    }

    async updatedmaterialbyid(id, material) {
        try {
            let materialToUpdate = await sequelize.models.Material.findByPk(id);
            if (!materialToUpdate) {
                throw new CustomHttpError(404, 'Material no encontrado');
            }

            materialToUpdate = await materialToUpdate.update(material);
            return materialToUpdate;
        } catch (error) {
            console.error('Error al actualizar material por ID:', error);
            throw error;
        }
    }

    async getMaterialCount({ id, type }) {
        try {
            const whereClause = {};
            
            // Mapear el tipo al campo correspondiente en la base de datos
            switch (type) {
                case 'partida':
                    whereClause.id_partida = id;
                    break;
                case 'subpartida':
                    whereClause.id_subpartida = id;
                    break;
                case 'task':
                case 'tarea':  // Aceptar ambos formatos
                    whereClause.id_task = id;
                    break;
                case 'subtask':
                case 'subtarea':  // Aceptar ambos formatos
                    whereClause.id_subtask = id;
                    break;
                default:
                    throw new CustomHttpError(400, `Tipo no válido: ${type}`);
            }

            const count = await sequelize.models.Material.count({
                where: whereClause
            });

            return count;
        } catch (error) {
            console.error('Error al contar materiales:', error);
            throw error;
        }
    }

    async deleteMaterial(id) {
        try {
            const materialToDelete = await sequelize.models.Material.findByPk(id);
            if (!materialToDelete) {
                throw new CustomHttpError(404, 'Material no encontrado');
            }

            await materialToDelete.destroy();
            return { success: true, message: 'Material eliminado correctamente' };
        } catch (error) {
            console.error('Error al eliminar material:', error);
            throw error;
        }
    }
}

module.exports = new MaterialRepository();