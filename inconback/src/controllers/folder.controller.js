const FolderRepository = require('../repositories/folder.repository');
const { response } = require('../utils/response');

class FolderController {
    async getAllFolders(req, res, next) {
        try {
            const path = req.query.path || '';
            const folders = await FolderRepository.getAllFoldersByPath(path);
            res.status(200).send(response(200, 'Folders encontrados', folders));
        } catch (error) {
            next(error);
        }
    }
     async getAllFoldersBuscador(req, res) {
        try {
          const searchTerm = req.query.search || '';  // Captura el término de búsqueda de los parámetros de la URL
          const folders = await FolderRepository.searchFoldersAndDocuments(searchTerm);
          return res.status(200).json(folders);
        } catch (error) {
          console.error("Error fetching folders and documents:", error);
          return res.status(500).json({ message: "Error fetching folders and documents" });
        }
      }


    //segunda con parentfolder

    async GetFolderWithchildrens(req, res) {
        const folderId = req.params.id;
    
        try {
            // Obtener la carpeta principal junto con sus documentos
            const folder = await FolderRepository.getFolderByIdparent(folderId);
    
            if (!folder) {
                return res.status(404).json({ message: 'Carpeta no encontrada' });
            }
    
            // Obtener las carpetas hijas junto con sus documentos
            const childrenFolders = await FolderRepository.getChildrenFoldersByParentId(folderId);
    
            // Responder con la carpeta principal y sus hijas
            return res.status(200).json({
                folder,
                children: childrenFolders,
            });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }


async getTrashedFoldersAndDocuments(req, res) {
    const userId = req.params.id; // Obtener el ID del usuario desde los parámetros de la solicitud
  
    try {
        // Obtener todas las carpetas en papelera
        const trashedFolders = await FolderRepository.getTrashedFolders(userId);

        // Obtener todos los documentos en papelera
        const trashedDocuments = await FolderRepository.getTrashedDocuments(userId);

        // Mapear las carpetas para agregarles un array `children` vacío
        const trashedFoldersWithChildren = trashedFolders.map(folder => ({
            ...folder.toJSON(),
            children: [] // Asegurar que el parámetro children esté presente y vacío
        }));

        // Enviar los resultados con `children` explícitamente vacío
        return res.status(200).json({
            folders: trashedFoldersWithChildren,
            children: [],  // Parámetro children vacío en la raíz de la respuesta
            documents: trashedDocuments
        });
    } catch (error) {
        console.error('Error al obtener los elementos en la papelera:', error);
        return res.status(500).json({ message: 'Error al obtener los elementos en la papelera' });
    }
}

    
    


      // Controlador para obtener la jerarquía de carpetas
  async getFolderHierarchy(req, res) {
    const folderId = req.params.id;

    try {
      // Llamamos al repositorio para obtener la jerarquía de carpetas
      const hierarchy = await FolderRepository.getFolderHierarchy(folderId);
      
      // Devolvemos la jerarquía
      return res.status(200).json(hierarchy);
    } catch (error) {
      console.error('Error al obtener la jerarquía de carpetas:', error.message);
      return res.status(500).json({ message: 'Error al obtener la jerarquía de carpetas' });
    }
  }


  async getFoldersByPath(req, res) {
    const { userId } = req.params;
    const { path } = req.query; // Asumimos que el `path` se pasa como parte del query string

    if (!path) {
        return res.status(400).json({
            success: false,
            message: 'Se requiere un valor de path'
        });
    }

    try {
        // Llamar al repositorio para obtener las carpetas que coincidan con el path
        const folders = await FolderRepository.getFoldersByPath(userId, path);

        // Devolver las carpetas en formato JSON
        res.status(200).json({
            success: true,
            data: folders
        });
    } catch (error) {
        console.error('Error en getFoldersByPath:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener las carpetas por path'
        });
    }
}


    //segunda con parentfolder





    async getFolderById(req, res, next) {
        try {
            const { id } = req.params;
            const folder = await FolderRepository.getFolderById(id);
            if (!folder) {
                return res.status(404).send(response(404, 'Folder no encontrado'));
            }
            res.status(200).send(response(200, 'Folder encontrado', folder));
        } catch (error) {
            next(error);
        }
    }

    async getRootFolderByUserId(req, res, next) {
        try {
            const { userId } = req.params;
            const rootFolder = await FolderRepository.getRootFolderByUserId(userId);

            if (!rootFolder) {
                console.log(`Root folder not found for user ID: ${userId}`);
                return res.status(404).send(response(404, 'Folder raíz no encontrado'));
            }

            res.status(200).send(response(200, 'Folder raíz encontrado', rootFolder));
        } catch (error) {
            next(error);
        }
    }


    async getFolderRaiz(req, res) {
        const { folderName, idParam } = req.params;
    
        // Convertir 'null' string a null real y asegurarse de que parentFolderId sea un número o null
        const parentFolderId = idParam === 'null' ? null : parseInt(idParam, 10);
    
        if (isNaN(parentFolderId) && parentFolderId !== null) {
            return res.status(400).json({
                success: false,
                message: 'El ID del folder padre es inválido.',
            });
        }
    
        try {
            const folder = await FolderRepository.getFolderRaiz(folderName, parentFolderId);
    
            if (!folder) {
                return res.status(404).json({
                    success: false,
                    message: 'No se encontró la carpeta raíz para este usuario.',
                });
            }
    
            return res.status(200).json({
                success: true,
                data: folder,
            });
        } catch (error) {
            console.error('Error al obtener la carpeta raíz:', error);
            return res.status(500).json({
                success: false,
                message: 'Error del servidor al obtener la carpeta raíz.',
            });
        }
    };
    
    





    async getFolderRaizUser (req, res)  {
        const { id ,path} = req.params;
     
    
        try {
            const folder = await FolderRepository.findRootFolderByUserId(id,path);
    
            if (!folder) {
                return res.status(404).json({
                    success: false,
                    message: 'No se encontró la carpeta raíz para este usuario.'
                });
            }
    
            return res.status(200).json({
                success: true,
                data: folder
            });
        } catch (error) {
            console.error('Error al obtener la carpeta raíz del usuario:', error);
            return res.status(500).json({
                success: false,
                message: 'Error del servidor al obtener la carpeta raíz del usuario.'
            });
        }
    };




    async createFolder(req, res, next) {
        try {
            const newFolder = req.body;
      
        

            const createdFolder = await FolderRepository.createFolder(newFolder);
            res.status(201).send(response(201, 'Folder creado correctamente', createdFolder));
        } catch (error) {
            next(error);
        }
    }


    

    async updateFolder(req, res, next) {
        try {
            const { id } = req.params;
            const updatedData = req.body;
            const updatedFolder = await FolderRepository.updateFolder(id, updatedData);
            res.status(200).send(response(200, 'Folder actualizado correctamente', updatedFolder));
        } catch (error) {
            next(error);
        }
    }


    async updateFolderUri(req, res) {
        const { id } = req.params;
        const { uriFolder } = req.body;

        try {
            if (!uriFolder) {
                return res.status(400).json({ message: 'uriFolder es requerido.' });
            }

            const updatedUser = await FolderRepository.updateUriFolder(id, uriFolder);

            return res.status(200).json({ message: 'uriFolder actualizado exitosamente.', user: updatedUser });
        } catch (error) {
            if (error.message === 'Usuario no encontrado') {
                return res.status(404).json({ message: error.message });
            }
            return res.status(500).json({ message: 'Error al actualizar uriFolder.', error });
        }
    }




    async deleteFolder(req, res, next) {
        try {
            const { id } = req.params;
            await FolderRepository.deleteFolder(id);
            res.status(200).send(response(200, 'Folder eliminado correctamente'));
        } catch (error) {
            next(error);
        }
    }


    async uploadFile(req, res) {
        try {
            const { folderId,  userid  } = req.body;  // Extrae folderId del cuerpo de la solicitud
            const file = req.file;  // El archivo se extrae de req.file proporcionado por multer
 

            if (!userid) {
                return res.status(400).json({ message: 'El ID del usuario es requerido.' });
              }
              
            
    
            // console.log("Folder ID:", folderId);
            // console.log("File:", file);
    
            if (!file || !folderId) {
                return res.status(400).json({ message: 'El archivo y el ID de la carpeta son requeridos.' });
            }
    
            const result = await FolderRepository.uploadFile(folderId, file , userid);
    
            return res.status(201).json({ message: 'Archivo subido exitosamente.', data: result });
        } catch (error) {
            console.error('Error al subir el archivo:', error);
            return res.status(500).json({ message: 'Error al subir el archivo.' });
        }
    }
    
    

    async getTotalFileSize(req, res) {
        try {
            const { path } = req.params; // Usar req.query para obtener el parámetro de consulta
            if (!path) {
                return res.status(400).json({ message: 'Path is required' });
            }
    
            const totalSizedata = await FolderRepository.calculateTotalFileSize(path);
            return res.status(200).json({ totalSizedata });
        } catch (error) {
            console.error('Error al obtener el tamaño total de los archivos:', error);
            return res.status(500).json({ message: 'Error al obtener el tamaño total de los archivos' });
        }
    }
    


    async toggleFavorite(req, res) {
        const { folderId, userId } = req.body;
    
        try {
          const folder = await FolderRepository.findById(folderId);
    
          if (!folder) {
            return res.status(404).json({
              message: 'Folder not found',
            });
          }
    
          let updatedFavorites;
    
          if (folder.favorited_by_users.includes(userId)) {
            // Remover el usuario de los favoritos
            updatedFavorites = folder.favorited_by_users.filter(id => id !== userId);
          } else {
            // Agregar el usuario a los favoritos
            updatedFavorites = [...folder.favorited_by_users, userId];
          }
    
          const [_, updatedFolder] = await FolderRepository.updateFavorites(folderId, updatedFavorites);
    
          return res.status(200).json({
            message: folder.favorited_by_users.includes(userId) ? 'User removed from favorites' : 'User added to favorites',
            data: updatedFolder,
          });
        } catch (error) {
          res.status(400).json({
            message: error.message,
          });
        }
      }






      async toggleFavoritedocument(req, res) {
        const { documentId, userId } = req.body;
    
        try {
            const document = await FolderRepository.findByIdDocument(documentId);
    
            if (!document) {
                return res.status(404).json({
                    message: 'Document not found',
                });
            }
    
            let updatedFavorites;
    
            if (document.favorited_by_users.includes(userId)) {
                // Remover el usuario de los favoritos
                updatedFavorites = document.favorited_by_users.filter(id => id !== userId);
            } else {
                // Agregar el usuario a los favoritos
                updatedFavorites = [...document.favorited_by_users, userId];
            }
    
            const [_, updatedDocument] = await FolderRepository.updateFavoritesDocument(documentId, updatedFavorites);
    
            return res.status(200).json({
                message: document.favorited_by_users.includes(userId) ? 'User removed from favorites' : 'User added to favorites',
                data: updatedDocument,
            });
        } catch (error) {
            res.status(400).json({
                message: error.message,
            });
        }
    }
    
    async getFavoriteFolders(req, res) {
        const { userId } = req.params;
    
        try {
            const favoriteFolders = await FolderRepository.findAllFavoritesByUser(userId);
    
            return res.status(200).json({
                message: 'Carpetas favoritas obtenidas correctamente.',
                data: favoriteFolders,
            });
        } catch (error) {
            return res.status(400).json({
                message: 'Error al obtener carpetas favoritas.',
                error: error.message,
            });
        }
    }
    


     async toggleTrashFolder(req, res) {
        try {
          const { id_folder } = req.params;
          const { trashed, trashedAt } = req.body;
    
          const updatedFolder = await FolderRepository.updateTrashStatus(id_folder, trashed, trashedAt);
          
          if (updatedFolder) {
            return res.status(200).json({ message: trashed ? 'Carpeta movida a la papelera' : 'Carpeta restaurada' });
          } else {
            return res.status(404).json({ message: 'Carpeta no encontrada' });
          }
        } catch (error) {
          return res.status(500).json({ message: 'Error al mover/restaurar la carpeta.' });
        }
      }

    

      async toggleTrashDocument(req, res) {
        try {
          const { id_document } = req.params; // Usamos 'id_document' para manejar documentos
      
          // Alternamos el estado del documento utilizando el repositorio de Document
          const updatedDocument = await FolderRepository.updateTrashStatusdocument(id_document);
          
          if (updatedDocument) {
            return res.status(200).json({
              message: updatedDocument.trashed ? 'Documento movido a la papelera' : 'Documento restaurado',
              document: updatedDocument
            });
          } else {
            return res.status(404).json({ message: 'Documento no encontrado' });
          }
        } catch (error) {
          return res.status(500).json({ message: 'Error al mover/restaurar el documento.' });
        }
      }
      
      // Eliminar carpeta permanentemente
      async deleteFolderPermanently(req, res) {
        try {
          const { id_folder } = req.params;
          
          const result = await FolderRepository.deleteFolderPermanently(id_folder);
          
          return res.status(200).json({
            message: result.message,
            success: true
          });
        } catch (error) {
          return res.status(400).json({
            message: error.message,
            success: false
          });
        }
      }

      // Eliminar documento permanentemente
      async deleteDocumentPermanently(req, res) {
        try {
          const { id_document } = req.params;
          
          const result = await FolderRepository.deleteDocumentPermanently(id_document);
          
          return res.status(200).json({
            message: result.message,
            success: true
          });
        } catch (error) {
          return res.status(400).json({
            message: error.message,
            success: false
          });
        }
      }

      // Vaciar papelera
      async emptyTrash(req, res) {
        try {
          const { userId } = req.body;
          
          if (!userId) {
            return res.status(400).json({
              message: 'Se requiere el ID del usuario',
              success: false
            });
          }
          
          const result = await FolderRepository.emptyTrash(userId);
          
          return res.status(200).json({
            message: result.message,
            deletedDocuments: result.deletedDocuments,
            deletedFolders: result.deletedFolders,
            success: true
          });
        } catch (error) {
          return res.status(400).json({
            message: error.message,
            success: false
          });
        }
      }


}

const folderController = new FolderController();
module.exports = folderController;
