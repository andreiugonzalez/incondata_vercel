const { sequelize } = require('../config/sequelize-config');
const { CustomHttpError } = require('../errors/customError');
const { SequelizeUniqueConstraintError } = require('sequelize');

class BancoRepository {
    async createBanco(banco, options) {
        const newBanco = await sequelize.models.Banco.create({
            num_cuenta: banco.numero_cuenta,
            correo: banco.correo_banco,
            id_nombrebanco: banco.banco, // Ahora será un ID
            id_tipo_cuenta: banco.tipo_cuenta, // Ahora será un ID
        }, options);

        return newBanco;
    }
}

module.exports = new BancoRepository();