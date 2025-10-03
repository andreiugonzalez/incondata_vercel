const { sequelize } = require('../config/sequelize-config');
const { CustomHttpError } = require('../errors/customError');

class TipoContratoRepository {
    async getTipoContratoByName(id) {
        const tipoContrato = await sequelize.models.TipoContrato.findOne({
            attributes: ['nombre', 'tipo_contrato_id'],
            where: {
                tipo_contrato_id: id
            }
        });

        if (!tipoContrato) {
            throw new CustomHttpError(404, 'Tipo de contrato no encontrado');
        }

        return tipoContrato;
    }
}

module.exports = new TipoContratoRepository();