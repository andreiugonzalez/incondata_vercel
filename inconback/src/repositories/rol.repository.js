const { sequelize } = require('../config/sequelize-config');
const { CustomHttpError } = require('../errors/customError');

class RolRepository {
    async getRolByName(id) {
        const rol = await sequelize.models.Rol.findOne({
            attributes: ['name', 'id'],
            where: {
                id
            }
        });

        if (!rol) {
            throw new CustomHttpError(404, 'Rol no encontrado');
        }

        return rol;
    }

    async getRolByNameString(name) {
        const rol = await sequelize.models.Rol.findOne({
            attributes: ['name', 'id'],
            where: {
                name: name
            }
        });

        if (!rol) {
            throw new CustomHttpError(404, `Rol '${name}' no encontrado`);
        }

        return rol;
    }
}

module.exports = new RolRepository();