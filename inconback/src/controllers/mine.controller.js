const MineRepository = require('../repositories/mine.repository');
const { response } = require('../utils/response');
const jwt = require('jsonwebtoken');
class Minecontroller {
  async loginmine(req, res, next) {
    try {
      const { name } = req.body;

      const mine = await MineRepository.getMine(name);
const token = jwt.sign({ name: mine.name }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.status(200).send(response(200, 'Mina logueado correctamente', { token }));

    } catch (error) {
      return next(error);
    }
  }

  async registermine(req, res, next) {
    try {
        const formData = req.body;

        const newMine = await MineRepository.createMine(formData);

        res.status(201).json({
            id: newMine.id,
            message: 'Mina registrada correctamente'
        });
    } catch (error) {
        return next(error);
    }
}

  async getMines(req, res, next) {
    try {
      const mines = await MineRepository.getMines();
      res.status(200).send(response(200, 'Minas encontrados', mines));

  } catch (error) {
      return next(error);
  }
  }
  async getMinaByIdupdate(req, res, next) {
    try {
      const minaId = req.params.id;
      const mina = await MineRepository.getMinaByIdupdate(minaId);
      if (!mina) {
        return res.status(404).json(response(404, 'Mina no encontrado'));
      }
      res.status(200).json(response(200, 'Mina encontrado', mina));
    } catch (error) {
      next(error);
    }
  }

  async updateMinaById(req, res, next) {
    try {
      const minaId = req.params.id;
      const minaData = req.body;

      const minaBeforeUpdate = await MineRepository.getMinaByIdupdate(minaId);

      if (!minaBeforeUpdate) {
        return res.status(404).send(response(404, 'Mina no encontrada'));
      }

      await MineRepository.updateMinabyid(minaId, minaData);

      const minaAfterUpdate = await MineRepository.getMinaByIdupdate(minaId);

      const unchangedColumns = {};
      for (const key in minaBeforeUpdate.dataValues) {
        if (minaData[key] !== minaAfterUpdate[key]) {
          unchangedColumns[key] = minaBeforeUpdate[key];
        }
      }
      res.status(200).json({
        status: 'success',
        message: 'Mina actualizada correctamente',
        minaBeforeUpdate,
        minaAfterUpdate,
        unchangedColumns
      });
    } catch (error) {
      next(error);
    }

  }

  async deleteMinaById(req, res, next) {
    try {
      const minaId = req.params.id;

      const mina = await MineRepository.getMinaByIdupdate(minaId);
      if (!mina) {
        return res.status(404).send(response(404, 'Mina no encontrada'));
      }

      await MineRepository.deleteMineById(minaId);
      return res.status(200).send(response(200, 'Mina eliminada correctamente'));
    } catch (error) {
      next(error);
    }
  }
}

const mineController = new Minecontroller();
module.exports = mineController;