const { sequelize } = require('../config/sequelize-config');
const { CustomHttpError } = require('../errors/customError');

class ExternoRepository {
    async createExterno(externo, options) {
        const newExterno = await sequelize.models.Externo.create({
            laboral_id: externo.laboral_id,
            banco_id: externo.banco_id,
            id_usuario: externo.id_usuario
        }, options);

        return newExterno;
    }
}

module.exports = new ExternoRepository();