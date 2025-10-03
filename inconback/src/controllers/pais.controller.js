const { CustomHttpError } = require('../errors/customError');
const paisRepository = require('../repositories/pais.repository');
const { response } = require('../utils/response');

class PaisController {
  async getPaises(req, res, next) {
    try {
      const paises = await paisRepository.getPaises();
      res.status(201).send(response(201, 'Paises obtenidos', paises));
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = new PaisController();