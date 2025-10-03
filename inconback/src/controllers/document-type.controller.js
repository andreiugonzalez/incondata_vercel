const { CustomHttpError } = require('../errors/customError');
const DocumentTypeRepository = require('../repositories/document_type.repository');
const { response } = require('../utils/response');

class DocumentTypeController {
  async createDocumentType(req, res, next) {
    try {
      const { name } = req.body;
      const documentType = await DocumentTypeRepository.createDocType(name);
      res.status(201).send(response(201, 'Tipo de documento creado correctamente', documentType));
    } catch (error) {
      return next(error);
    }

  }


   async getAllDocumentTypes(req, res) {
    try {
        const documentTypes = await DocumentTypeRepository.getAllDocumentTypes();
        res.status(200).json(documentTypes);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los tipos de documentos' });
    }
}


}

module.exports = new DocumentTypeController();