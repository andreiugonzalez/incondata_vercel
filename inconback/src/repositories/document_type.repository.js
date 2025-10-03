const { sequelize } = require('../config/sequelize-config');
const { CustomHttpError } = require('../errors/customError');

class DocumentTypeRepository {
    async createDocType(name) {
        const docType = await sequelize.models.DocumentType.create({
            name
        });

        return docType;
    }


     async getAllDocumentTypes() {
        try {
            return await sequelize.models.DocumentType.findAll();
        } catch (error) {
            throw new Error('Error al obtener los tipos de documentos');
        }
    }
}




module.exports = new DocumentTypeRepository();