const { sequelize } = require('../config/sequelize-config');
const { CustomHttpError } = require('../errors/customError');

class RegionRepository {
    async getRegionByName(name) {
        const region = await sequelize.models.Region.findOne({
            attributes: ['nombre', 'id_region'],
            where: {
                nombre: name
            }
        });

        if (!region) {
            throw new CustomHttpError(404, 'Region no encontrada');
        }

        return region;
    }
}

module.exports = new RegionRepository();