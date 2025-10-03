const SubpartidaRepository = require('../repositories/subpartida.repository');
const { response } = require('../utils/response');

class SubpartidaController {

    async createPartida(req, res, next) {
        try {
            const newSubpartida = req.body;
            const subpartidaCreated = await SubpartidaRepository.createSubpartida(newSubpartida);
            res.status(201).send(response(201, 'SubPartida creada correctamente', subpartidaCreated));
        } catch (error) {
            return next(error);
        }
    }

    async updatesubPartida(req, res, next) {
        try {
            const id = req.params.id;
            const updatedsubPartida = req.body;

            const actualizarsubpartidas = await SubpartidaRepository.updatesubPartida(id, updatedsubPartida);
            res.status(201).send(response(201, 'Subpartida actualizada correctamente', actualizarsubpartidas));
        } catch (error) {
            console.log(error);
            return next(error);
        }
    }

    async updatesubPartidanewpartida(req, res, next) {
        try {
            const id = req.params.id;
            const updatedsubPartida = req.body;

            const actualizarsubpartidas = await SubpartidaRepository.updatesubPartidanewpartida(id, updatedsubPartida);
            res.status(201).send(response(201, 'Subpartida actualizada correctamente', actualizarsubpartidas));
        } catch (error) {
            console.log(error);
            return next(error);
        }
    }

    async getlisthistory(req, res, next) {
      try {
        const subpartidasConHistoricos = await SubpartidaRepository.getlisthistory();

        const listmap = subpartidasConHistoricos.map(subpartida => subpartida.historicos).flat();

        res.json(listmap);
      } catch (error) {
        console.error('Error en getlisthistory:', error);
        res.status(500).json({ message: 'Error al obtener los datos' });
      }
    }
}

module.exports = new SubpartidaController();