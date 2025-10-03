const { sequelize } = require('../config/sequelize-config');
const { CustomHttpError } = require('../errors/customError');
const bcrypt = require('bcryptjs');

class MineRepository {
    async getMines() {
        const mines = await sequelize.models.Mine.findAll({
            include: [
                {
                    association: 'mine_organizacion'
                },
            {
                association: 'User_mine'
            }],
        });

        if (mines.length === 0) {
            throw new CustomHttpError(404, 'No se encontraron minas');
        }

        return mines;
    }

    async getMine(name) {
        const mine = await sequelize.models.Mine.findOne({
            attributes: ['name'],
            where: {
                name
            }
        });

        if (!mine) {
            throw new CustomHttpError(404, 'Mina no encontrada');
        }

        return mine;
    }

    async getMineRegister(name) {
        const mine = await sequelize.models.Mine.findOne({
            where: {
                name
            }
        });

        if (mine) {
            throw new CustomHttpError(400, 'La mina ya existe');
        }

        return mine;
    }

    async createMine(formData) {
        const mine = await sequelize.models.Mine.create(formData);

        return mine;
    }

    async getMinesname() {
        try {
            const mines = await sequelize.models.Mine.findAll({
            attributes: ['id', 'name']
          });
          return mines;
        } catch (error) {
          throw response(500, 'Error al obtener las mines de la base de datos');
        }
      }

      async getMinaByIdupdate(minaId) {
        try {
            const mina = await sequelize.models.Mine.findByPk(minaId, {
            });
            return mina;
        } catch (error) {
            throw error;
        }
    }

    async updateMinabyid(minaId, minaData) {
        const transaction = await sequelize.transaction();
        try {

            const [updatedRowsCount, updatedRows] = await sequelize.models.Mine.update(minaData, {
                where: { id: minaId },
                returning: true,
                transaction
            });

            if (updatedRowsCount === 0) {
                throw new CustomHttpError(404, 'Mina no encontrada');
            }

            await transaction.commit();

            return {
                user: updatedRows[0]
            };
        } catch (error) {
            await transaction.rollback();
            console.error('Error updating mina:', error);
            throw error;
        }
    }

    async deleteMineById(minaId) {
        const transaction = await sequelize.transaction();
        try {
            const mine = await sequelize.models.Mine.findByPk(minaId, { transaction });
            if (!mine) {
                throw new CustomHttpError(404, 'Mina no encontrada');
            }

            await mine.destroy({ transaction });
            await transaction.commit();

            return { success: true };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}

module.exports = new MineRepository();