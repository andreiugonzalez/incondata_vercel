const { CustomHttpError } = require('../errors/customError');
const DocumentRepository = require('../repositories/document.repository');
const { response } = require('../utils/response');
const OrganizationRepository = require('../repositories/organizacion.repository');
const userRepository = require('../repositories/user.repository');
const projectRepository = require('../repositories/project.repository');
const folderRepository = require('../repositories/folder.repository');
const MineRepository = require('../repositories/mine.repository');

class Documentcontroller {
  async postDocument(req, res, next) {
    try {

      const files = req.files;

      for (const file of files) {
        await DocumentRepository.uploadDocumentS3(file, 'Test1@gmail.com', 'DNI');
      }
      res.send(response(201, 'Documento subido y guardado correctamente'));

    } catch (error) {
      return next(error);
    }
  }

  async postDocumentOrganization(req, res, next) {
    try {
      const file = req.file;
      const { document_type, organizationId, filesize, fileExtension } = req.body; // Recibir el tamaño y la extensión del archivo

      if (!file || !filesize || !fileExtension) {
        throw new Error('Faltan datos del archivo (archivo, tamaño o extensión)');
      }

      const organizationDB = await OrganizationRepository.getOrganizacionById(organizationId);

      // Pasar la extensión y el tamaño del archivo al repositorio
      await DocumentRepository.uploadDocumentS3Organization(file, organizationDB, document_type, filesize, fileExtension);

      res.send(response(201, 'Documento subido y guardado correctamente'));

    } catch (error) {
      return next(error);
    }
}


  async postProfDocumentOrganization(req, res, next) {
    try {
      const file = req.file;
      const { document_type, organizationId, filesize, fileExtension } = req.body; // Agregar filesize y fileExtension
  
      console.log("revision en prof " , organizationId);

      const organizationDB = await OrganizationRepository.getOrganizacionById(organizationId);
      
      // Pasar filesize y fileExtension al repositorio de documentos
      await DocumentRepository.uploadProfileOrganization(file, organizationDB, document_type, filesize, fileExtension);
  
      res.send(response(201, 'Documento subido y guardado correctamente'));
  
    } catch (error) {
      return next(error);
    }
  }
  

//mina profile
  async postProfDocumentMina(req, res, next) {
    try {
      const file = req.file;
      const { document_type, minaId } = req.body;

      console.log("documento tipo", document_type);
      console.log("mina id", minaId);

      const minaDB = await MineRepository.getMinaByIdupdate(minaId);
      await DocumentRepository.uploadProfilemina(file, minaDB, document_type);

      res.send(response(201, 'Documento subido y guardado correctamente'));

    } catch (error) {
      return next(error);
    }
  }



// Subir foto de perfil al crear
async postProfUser(req, res) {
  try {
    const { userId } = req.params;
    const file = req.files?.file;
    const filesize = req.body.filesize || file?.size || 0;

    if (!file) {
      return res.status(400).json({
        message: "No se ha proporcionado ningún archivo"
      });
    }

    // Subir archivo a S3
    const s3Response = await uploadFileToS3(file, userId, "Foto de perfil usuario");
    
    // Crear documento en la base de datos
    const document = await DocumentRepository.uploadProfileUser(userId, {
      size: filesize,
      ...file
    }, s3Response.Location);

    res.json({
      message: "Foto de perfil subida correctamente",
      document
    });
  } catch (error) {
    console.error("Error en postProfUser:", error);
    res.status(500).json({
      message: "Error al subir la foto de perfil",
      error: error.message
    });
  }
}

//actualizar o crear documentos

async postDocumentUser(req, res, next) {
  try {
      const file = req.file;
      const { document_type, userEmail } = req.body;
      console.log(req.body);

      const userBD = await userRepository.getUser(userEmail);
      await DocumentRepository.uploadDocumentS3User(file, userBD, document_type);

      res.send(response(201, 'Documento subido y guardado correctamente'));

  } catch (error) {
      return next(error);
  }
}

async postDocumentProject(req, res, next) {
  try {
      const file = req.file;
      const { document_type, projectId, extension, size, userId } = req.body; // Incluir userId desde req.body

      console.log(userId);

      // Validación inicial de los parámetros
      if (!file || !document_type || !projectId || !extension || !size || !userId) {
          return res.status(400).json({ message: 'Faltan parámetros requeridos' });
      }

      // Obtiene el proyecto por su ID
      const projectDB = await projectRepository.getProjectById(projectId);

      if (!projectDB) {
          return res.status(404).json({ message: 'Proyecto no encontrado' });
      }

      // Llama al método que maneja la lógica de subir y guardar/actualizar el documento
      const documentSaved = await DocumentRepository.uploadDocumentProject(file, projectDB, document_type, extension, size, userId); // Pasar userId como argumento

      if (documentSaved) {
          // Respuesta exitosa
          return res.status(201).json({ message: 'Documento subido y guardado correctamente' });
      } else {
          return res.status(500).json({ message: 'Error al guardar el documento' });
      }

  } catch (error) {
      console.error('Error al subir el documento:', error);

      if (error instanceof CustomHttpError) {
          return res.status(error.statusCode).json({ message: error.message });
      }

      return res.status(500).json({ message: 'Error interno del servidor' });
  }
}








  async postDocumentFolder(req, res, next) {
    try {
      const file = req.file;
      const { folder_id } = req.body;

      const folderDB = await folderRepository.getFolderById(folder_id);
      await DocumentRepository.uploadDocumentToFolder(file, folder_id);

      res.send(response(201, 'Documento subido y guardado correctamente'));

    } catch (error) {
      return next(error);
    }
  }




  async GetAdjuntosProyecto(req, res, next) {
    try {
        const { id } = req.params;

        if (!id) {
            throw new CustomHttpError(400, 'No se ha proporcionado un ID de proyecto');
        }

        const projectDB = await projectRepository.getProjectById(id);

        if (!projectDB) {
            throw new CustomHttpError(404, 'Proyecto no encontrado');
        }

        const adjuntos = await DocumentRepository.getDocumentsByProjectId(id);

        res.send(response(200, 'Adjuntos obtenidos correctamente', adjuntos));

    } catch (error) {
        console.error('Error en GetAdjuntosProyecto:', error);
        next(error);
    }
}


 // Función para actualizar el nombre de un documento
 async updateDocumentFilename(req, res, next) {
  try {
    const { id } = req.params;
    const { filenames } = req.body;

    if (!filenames || filenames.trim() === '') {
      throw new CustomHttpError(400, 'El nombre del archivo no puede estar vacío');
    }


    const updatedDocument = await DocumentRepository.updateDocumentFilename(id, { filenames });


    res.send(response(200, 'Nombre del documento actualizado correctamente', updatedDocument));
  } catch (error) {
    console.error('Error al actualizar el nombre del documento:', error);
    next(error);
  }
}


async postDocumentPartida(req, res, next) {
  try {
      const files = req.files;
      const { dataupload } = req.body;

     // console.log("postDocumentPartida file",files );

      console.log("postDocumentPartida dataupload",dataupload );

      // Verifica que se proporcione el archivo y dataupload
      if (!files || !dataupload) {
          return res.status(400).json({ message: 'Faltan parámetros requeridos postDocumentPartida' });
      }

      // Convierte dataupload en un objeto JSON si es necesario
      let data;
      try {
          data = typeof dataupload === 'string' ? JSON.parse(dataupload) : dataupload;
      } catch (parseError) {
          return res.status(400).json({ message: 'El formato de dataupload es inválido' });
      }

      // Verifica que los parámetros requeridos estén presentes en data
      const { documentType, partidaId, tipo, userId } = data;
      if (!documentType || !partidaId || !tipo || !userId) {
          return res.status(400).json({ message: 'Faltan parámetros requeridos en dataupload' });
      }

      // Llama al método que maneja la lógica de subir y guardar/actualizar el documento
      const documentSaved = await DocumentRepository.uploadDocumentPartida(files, data);

      if (documentSaved) {
          return res.status(201).json({ message: 'Documento subido y guardado correctamente' });
      } else {
          return res.status(500).json({ message: 'Error al guardar el documento' });
      }

  } catch (error) {
      console.error('Error al subir el documento de partida:', error);
      next(error);
  }
}


async getDocumentByEntityId(req, res, next) {
  const { entityType, id } = req.params;

  try {
      const documents = await DocumentRepository.getDocumentByEntityId(entityType, id);
      res.status(200).json(documents);
  } catch (error) {
      console.error('Error al obtener documentos:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
  }
}


async markAsPermanentlyDeleted(req, res, next) {
  const { id } = req.params;

  try {
    // Busca el documento por su ID
    const document = await DocumentRepository.getDocumentById(id);

    if (!document) {
      return res.status(404).json({ message: 'Documento no encontrado' });
    }

    // Actualiza el campo permanentlyDeleted a true
    await DocumentRepository.updateDocument(id, { permanentlyDeleted: true });

    res.status(200).json({ message: 'Documento marcado como eliminado permanentemente' });
  } catch (error) {
    console.error('Error al marcar el documento como eliminado permanentemente:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}



}

const documentController = new Documentcontroller();
module.exports = documentController;