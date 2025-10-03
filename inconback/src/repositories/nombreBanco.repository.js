const { sequelize } = require('../config/sequelize-config');
const { CustomHttpError } = require('../errors/customError');

class NombreBancoRepository {
    async getNombreBancoByName(id) {

        const NombreBanco = await sequelize.models.NombreBanco.findOne({
            attributes: ['nombre_banco', 'id_nombrebanco'],
            where: {
                id_nombrebanco: id
            }
        });

        if (!NombreBanco) {
            throw new CustomHttpError(404, 'Nombre banco no encontrado');
        }

        return NombreBanco;
    }
}

module.exports = new NombreBancoRepository();