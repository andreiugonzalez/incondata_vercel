const { sequelize } = require('../config/sequelize-config');
const { CustomHttpError } = require('../errors/customError');

class PaisRepository {
    async getPaisByName(name) {
        const pais = await sequelize.models.Pais.findOne({
            attributes: ['NombrePais', 'id_pais'],
            where: {
                NombrePais: name
            }
        });

        if (!pais) {
            throw new CustomHttpError(404, 'Pais no encontrado');
        }

        return pais;
    }

    async getPaises() {
        const paises = await sequelize.models.Pais.findAll({
            include: [{
                association: 'regiones_pais',
                include: [{
                    association: 'comunas_regions'
                }]
            }]
        });

        if (paises.length === 0) {
            throw new CustomHttpError(404, 'No se encontraron paises');
        }

        paises.forEach(pais => {
            pais.dataValues.label = pais.dataValues.NombrePais;
            pais.dataValues.value = pais.dataValues.NombrePais;
            pais.dataValues.name = 'pais';

            pais.dataValues.regiones_pais.forEach(region => {
                region.dataValues.label = region.dataValues.nombre;
                region.dataValues.value = region.dataValues.nombre;
                region.dataValues.name = 'region';

                region.dataValues.comunas_regions.forEach(comuna => {
                    comuna.dataValues.label = comuna.dataValues.nombre;
                    comuna.dataValues.value = comuna.dataValues.nombre;
                    comuna.dataValues.name = 'comuna';
                });
            });
        });
        return paises;
    }
}

module.exports = new PaisRepository();








