const { sequelize } = require('../config/sequelize-config');
const { CustomHttpError } = require('../errors/customError');

class MedioPagoRepository {
    async getMedioPagoByName(id) {
        const medioPagoBD = await sequelize.models.MedioPago.findOne({
            attributes: ['nombre', 'id'],
            where: {
                id: id
            }
        });

        if (!medioPagoBD) {
            throw new CustomHttpError(404, 'Medio de pago no encontrado');
        }

        return medioPagoBD
    }
}

module.exports = new MedioPagoRepository();