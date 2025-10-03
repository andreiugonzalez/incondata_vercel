const { CustomHttpError } = require('../errors/customError');
const MaterialRepository = require('../repositories/material.repository');
const { response } = require('../utils/response');

class MaterialController {
  async createMaterial(req, res, next) {
    try {
      const material = req.body;
      const newMaterial = await MaterialRepository.createMaterial(material);
      res.status(201).send(response(201, 'Material creado correctamente', newMaterial));
    } catch (error) {
      return next(error);
    }
  }

  async updateMaterial(req, res, next) {
    try {
      const { id } = req.params;
      const material = req.body;
      const updatedMaterial = await MaterialRepository.updateMaterial(id, material);
      res.status(200).send(response(200, 'Material actualizado correctamente', updatedMaterial));
    } catch (error) {
      return next(error);
    }
  }

  async deleteMaterial(req, res, next) {
    try {
      const { id } = req.params;
      const result = await MaterialRepository.deleteMaterial(id);
      res.status(200).send(response(200, 'Material eliminado correctamente', result));
    } catch (error) {
      return next(error);
    }
  }

  async updatedmaterialbyid(req, res, next) {
    try {
        const id = req.params.id;
        const updatedmaterial = req.body;

        const actualizarmateriales = await MaterialRepository.updatedmaterialbyid(id, updatedmaterial);
        res.status(201).send(response(201, 'material actualizado correctamente', actualizarmateriales));
    } catch (error) {
        console.log(error);
        return next(error);
    }
}


 // Nuevo método para validar materiales
 async validateMaterials(req, res, next) {
  try {
    const { id, type } = req.query;

    if (!id || !type) {
      return res.status(400).send(response(400, 'Se requieren los parámetros id y type'));
    }

    const materialCount = await MaterialRepository.getMaterialCount({ id, type });

    res.status(200).send(
      response(200, 'Validación realizada', {
        hasMaterials: materialCount > 0,
        count: materialCount,
      })
    );
  } catch (error) {
    return next(error);
  }
}

  
}

module.exports = new MaterialController();