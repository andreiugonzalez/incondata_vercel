const { sequelize } = require('../config/sequelize-config');
const { CustomHttpError } = require('../errors/customError');

class UserRolRepository {
    async createUserRol(userRol, options) {
        const newUserRol = await sequelize.models.UserRol.create({
            userId: userRol.userId,
            rolId: userRol.rolId
        }, options);

        return newUserRol;
    }
}

module.exports = new UserRolRepository();