const { sequelize } = require('../config/sequelize-config');
const { CustomHttpError } = require('../errors/customError');

class ComunaRepository {
    async getComunaByName(name) {
        const comuna = await sequelize.models.Comuna.findOne({
            attributes: ['nombre', 'id_comuna'],
            where: {
                nombre: name
            }
        });

        if (!comuna) {
            throw new CustomHttpError(404, 'Comuna no encontrada');
        }

        return comuna;
    }
}

module.exports = new ComunaRepository();