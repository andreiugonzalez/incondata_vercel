const { CustomHttpError } = require('../errors/customError');
const { response } = require('../utils/response');
const ComponenteRespository = require('../repositories/componente.repository');

class ComponenteController {
  
    async getComponentesByRelationId(req, res, next) {
        try {
            const { id, relationType } = req.params;
         
    
            // Validar que relationType sea un campo permitido
            const validFields = ['id_partida', 'id_subpartida', 'id_task', 'id_subtask'];
            if (!validFields.includes(relationType)) {
                return res.status(400).send(response(400, 'Tipo de relación no válido'));
            }
    
            const componentes = await ComponenteRespository.getComponentBySubtaskId(id, relationType);
            res.status(200).send(response(200, 'Componentes encontrados', componentes));
        } catch (error) {
            return next(error);
        }
    }
    
}

module.exports = new ComponenteController();