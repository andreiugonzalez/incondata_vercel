const { sequelize } = require('../config/sequelize-config');
const { CustomHttpError } = require('../errors/customError');

class ComponenteRespository {
    
    async getComponentBySubtaskId(id, idField) {
        const validFields = ['id_partida', 'id_subpartida', 'id_task', 'id_subtask'];
        if (!validFields.includes(idField)) {
            throw new CustomHttpError(400, `Campo no válido: ${idField}`);
        }
    
        const componente = await sequelize.models.Componente.findAll({
            include: [{
                association: 'material_componente',
                where: {
                    [idField]: id
                },
                required: false, // Permite traer todos los componentes incluso si `material_componente` no coincide
                include: [
                    { association: 'subtask_Material_Task' },
                    { association: 'material_partida' },
                    { association: 'material_subpartida' },
                    { association: 'material_task' }
                ]
            }]
        });
    
        return componente;
    }
    
    
}

module.exports = new ComponenteRespository();