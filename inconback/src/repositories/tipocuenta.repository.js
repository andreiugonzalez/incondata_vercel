const { sequelize } = require('../config/sequelize-config');
const { CustomHttpError } = require('../errors/customError');

class TipoCuentaRepository {
    async getTipoCuentaByName(id) {
        const tipoCuenta = await sequelize.models.TipoCuenta.findOne({
            attributes: ['nombre_tipo', 'id_tipo_cuenta'],
            where: {
                id_tipo_cuenta: id
            }
        });

        if (!tipoCuenta) {
            throw new CustomHttpError(404, 'Tipo de cuenta no encontrado');
        }

        return tipoCuenta;
    }
}

module.exports = new TipoCuentaRepository();