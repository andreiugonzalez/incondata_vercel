const { sequelize } = require('../config/sequelize-config');
const { CustomHttpError } = require('../errors/customError');
const { S3Client, ListObjectsV2Command, CopyObjectCommand, DeleteObjectsCommand } = require('@aws-sdk/client-s3'); // Importa los comandos necesarios
const { Upload } = require('@aws-sdk/lib-storage'); // Importa el módulo Upload
const { Op } = require('sequelize');



const AWS_S3_BUCKET_PROFILE = process.env.AWS_S3_BUCKET_PROFILE;

const s3 = new S3Client({
    region: process.env.AWS_S3_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
    },
});

class FolderRepository {


    async searchFoldersAndDocuments(searchTerm) {
        try {
            // Buscar carpetas con los usuarios asociados
            const folders = await sequelize.models.Folder.findAll({
                where: {
                    trashed: false,  // Excluir carpetas que están en la papelera
                    nombre_carpeta: {
                        [Op.like]: `%${searchTerm}%`  // Filtrar por nombre de carpeta usando Op.like
                    }
                },
                include: [
                    {
                        model: sequelize.models.User,  // Incluir información del usuario
                        as: 'folder_usuario',  // Alias de la relación definida en Folder
                        attributes: [
                            [sequelize.literal("CONCAT(names, ' ', apellido_p, ' ', apellido_m)"), 'nombre_completo']
                        ],  // Concatenar nombres y apellidos
                    }
                ]
            });
    
            // Buscar documentos independientes con sus usuarios
            const documents = await sequelize.models.Document.findAll({
                where: {
                    trashed: false,  // Excluir documentos que están en la papelera
                    filenames: {
                        [Op.like]: `%${searchTerm}%`  // Filtrar por nombre de documento usando Op.like
                    }
                },
                include: [
                    {
                        model: sequelize.models.User,  // Incluir información del usuario
                        as: 'user',  // Alias de la relación definida en Document
                        attributes: [
                            [sequelize.literal("CONCAT(names, ' ', apellido_p, ' ', apellido_m)"), 'nombre_completo']
                        ],  // Concatenar nombres y apellidos
                    }
                ]
            });
    
            // Combinar carpetas y documentos en un solo resultado
            const results = [...folders, ...documents];
            
            return results;
        } catch (error) {
            console.error("Error searching folders and documents:", error);
            throw error;
        }
    }

     //Raiz proyectos / partidas,subpartidas,tarea, sub tarea
     async checkAndCreateFolderStructure(projectId, folderName, parentFolderType = 'project', entityId = null, relacion = null , id_user) {
        // Verificar si existe la carpeta raíz 'proyectos'
        let baseFolder = await sequelize.models.Folder.findOne({
            where: {
                nombre_carpeta: 'proyectos',
                path: 'proyectos',
                parent_folder_id: null
            }
        });
    
        // Si la carpeta 'proyectos' no existe, crearla
        if (!baseFolder) {
            baseFolder = await sequelize.models.Folder.create({
                nombre_carpeta: 'proyectos',
                nombre_S3_cloud: 'proyectos',
                enlace: 'proyectos',
                parent_folder_id: null,
                path: 'proyectos',
                depth: 0 // La carpeta raíz tiene profundidad 0
            });
            console.log('Carpeta raíz "proyectos" creada');
        }
    
        let parentFolderId = baseFolder.id_folder; // ID de la carpeta raíz
        let path = `proyectos`;
    
        // Consultar el proyecto usando su ID
        const project = await sequelize.models.Project.findOne({
            where: {
                id: projectId
            }
        });
    
        if (!project) {
            throw new Error(`No se encontró el proyecto con ID: ${projectId}`);
        }
    
        const projectName = project.nombre;
    
        // Verificar si existe la carpeta del proyecto
        let projectFolder = await sequelize.models.Folder.findOne({
            where: {
                nombre_carpeta: projectName,
                path: `${path}/${projectName}`,
                parent_folder_id: parentFolderId,
            }
        });
    
        // Si la carpeta del proyecto no existe, crearla
        if (!projectFolder) {
            projectFolder = await sequelize.models.Folder.create({
                nombre_carpeta: projectName,
                nombre_S3_cloud: projectName,
                enlace: `${path}/${projectName}`,
                parent_folder_id: parentFolderId,
                path: `${path}/${projectName}`,
                depth: 1,  // Profundidad para el proyecto
                id_proyecto: projectId, // Asocia la carpeta con el proyecto
            });
            console.log(`Carpeta del proyecto creada: ${projectName}`);
        }
    
        // Actualizar path y parentFolderId para que apunten a la carpeta del proyecto
        parentFolderId = projectFolder.id_folder;
        path = `${path}/${projectName}`;
    
        // Crear la estructura de carpetas según el tipo
        if (parentFolderType === 'partida') {
            parentFolderId = await this.ensureIntermediateFolder(path, parentFolderId, 'Partidas', projectId, 2);
            path = `${path}/Partidas`;
        } else if (parentFolderType === 'subpartida') {
            // Buscar la carpeta de la partida utilizando la relación (id_partida)

            console.log("relacion buscada de subpartida: ",relacion);
            let partidaFolder = await sequelize.models.Folder.findOne({
                where: {
                    id_partida: relacion
                }
            });
    
            if (!partidaFolder) {
                // Intentar obtener la partida para crear su carpeta
                const partida = await sequelize.models.Partida.findOne({
                    where: { id_partida: relacion }
                });
                
                if (partida) {
                    // Crear la carpeta de la partida
                    const partidaFolderId = await this.checkAndCreateFolderStructure(
                        projectId, 
                        partida.nombre_partida, 
                        'partida', 
                        partida.id_partida,
                        null,
                        partida.id_usuario
                    );
                    
                    // Buscar la carpeta recién creada
                    partidaFolder = await sequelize.models.Folder.findOne({
                        where: { id_folder: partidaFolderId }
                    });
                    
                    if (!partidaFolder) {
                        throw new Error(`No se pudo crear la carpeta de la partida con ID: ${relacion}`);
                    }
                } else {
                    throw new Error(`No se encontró la partida con ID: ${relacion}`);
                }
            }
    
            // Actualizar el path y parentFolderId para la carpeta de la partida
            parentFolderId = partidaFolder.id_folder;
            path = partidaFolder.path;
    
            // Crear la carpeta Subpartidas dentro de la carpeta de la partida
            parentFolderId = await this.ensureIntermediateFolder(path, parentFolderId, 'Subpartidas', projectId, 3);
            path = `${path}/Subpartidas`;
        } else if (parentFolderType === 'tarea') {
            // Buscar la carpeta de la subpartida utilizando la relación (id_subpartida)
            let tareaFolder = await sequelize.models.Folder.findOne({
                where: {
                    id_tarea: relacion
                }
            });
    
            if (!tareaFolder) {
                // Intentar obtener la tarea para crear su carpeta
                const tarea = await sequelize.models.Task.findOne({
                    where: { id: relacion }
                });
                
                if (tarea) {
                    // Obtener la subpartida asociada para crear la jerarquía completa
                    const subpartida = await sequelize.models.Subpartida.findOne({
                        where: { id_subpartida: tarea.id_subpartida }
                    });
                    
                    if (subpartida) {
                        // Crear la carpeta de la tarea
                        const tareaFolderId = await this.checkAndCreateFolderStructure(
                            projectId, 
                            tarea.nombre, 
                            'tarea', 
                            tarea.id,
                            tarea.id_subpartida,
                            tarea.id_usuario
                        );
                        
                        // Buscar la carpeta recién creada
                        tareaFolder = await sequelize.models.Folder.findOne({
                            where: { id_folder: tareaFolderId }
                        });
                        
                        if (!tareaFolder) {
                            throw new Error(`No se pudo crear la carpeta de la tarea con ID: ${relacion}`);
                        }
                    } else {
                        throw new Error(`No se encontró la subpartida asociada a la tarea con ID: ${relacion}`);
                    }
                } else {
                    throw new Error(`No se encontró la tarea con ID: ${relacion}`);
                }
            }
    
            // Actualizar el path y parentFolderId para la carpeta de la tarea
            parentFolderId = tareaFolder.id_folder;
            path = tareaFolder.path;
    
            // Crear la carpeta Subtareas dentro de la carpeta de la tarea
            parentFolderId = await this.ensureIntermediateFolder(path, parentFolderId, 'Subtareas', projectId, 5);
            path = `${path}/Subtareas`;
        } else if (parentFolderType === 'subtarea') {
            // Buscar la carpeta de la tarea utilizando la relación (id_tarea)
            let tareaFolder = await sequelize.models.Folder.findOne({
                where: {
                    id_tarea: relacion
                }
            });
    
            if (!tareaFolder) {
                throw new Error(`No se encontró la carpeta de la tarea con ID: ${relacion}`);
            }
    
            // Actualizar el path y parentFolderId para la carpeta de la tarea
            parentFolderId = tareaFolder.id_folder;
            path = tareaFolder.path;
    
            // Crear la carpeta Subtareas dentro de la carpeta de la tarea
            parentFolderId = await this.ensureIntermediateFolder(path, parentFolderId, 'Subtareas', projectId, 5);
            path = `${path}/Subtareas`;
        }
    
        // Crear la carpeta específica (Partida, Subpartida, Tarea o Subtarea)
        let folder = await sequelize.models.Folder.findOne({
            where: {
                nombre_carpeta: folderName,
                path: `${path}/${folderName}`,
                parent_folder_id: parentFolderId,
                usuario_id: id_user 
            }
        });
    
        if (!folder) {
            let specificFolderPath = `${path}/${folderName}`;
    
            let folderData = {
                nombre_carpeta: folderName,
                nombre_S3_cloud: folderName,
                enlace: specificFolderPath,
                parent_folder_id: parentFolderId,
                path: specificFolderPath,
                depth: this.calculateDepth(parentFolderType),  // Ajustar según la nueva lógica de profundidad
                id_proyecto: projectId, // Asocia la carpeta con el proyecto
                usuario_id: id_user 
            };
    
            // Asignar el ID según el tipo de entidad
            if (parentFolderType === 'partida') {
                folderData.id_partida = entityId;
            } else if (parentFolderType === 'subpartida') {
                folderData.id_subpartida = entityId;
            } else if (parentFolderType === 'tarea') {
                folderData.id_tarea = entityId;
            } else if (parentFolderType === 'subtarea') {
                folderData.id_subtarea = entityId;
            }
    
            folder = await sequelize.models.Folder.create(folderData);
            console.log(`Carpeta creada: ${folderName}`);
        }
    
        return folder.id_folder; // Retorna el ID de la carpeta
    }








    
    // Función para asegurar la existencia de una carpeta intermedia (tipo de carpeta)
    async ensureIntermediateFolder(path, parentFolderId, tipoCarpeta, projectId, depth) {
        let tipoFolder = await sequelize.models.Folder.findOne({
            where: {
                nombre_carpeta: tipoCarpeta,
                path: `${path}/${tipoCarpeta}`,
                parent_folder_id: parentFolderId,
                
            }
        });
    
        if (!tipoFolder) {
            let intermediateFolderPath = `${path}/${tipoCarpeta}`;
    
            tipoFolder = await sequelize.models.Folder.create({
                nombre_carpeta: tipoCarpeta,
                nombre_S3_cloud: tipoCarpeta,
                enlace: intermediateFolderPath,
                parent_folder_id: parentFolderId,
                path: intermediateFolderPath,
                depth: depth,  // Profundidad ajustada para la carpeta intermedia
                id_proyecto: projectId,
            });
            console.log(`Carpeta de tipo creada: ${tipoCarpeta}`);
        }
    
        return tipoFolder.id_folder;
    }
    
    // Función para calcular la profundidad
    calculateDepth(parentFolderType) {
        switch (parentFolderType) {
            case 'partida':
                return 3;
            case 'subpartida':
                return 4;
            case 'tarea':
                return 5;
            case 'subtarea':
                return 6;
            default:
                return 0;
        }
    }


    async updateFolderByEntity(entityType, entityId, newEntityName) {
        try {
            console.log(`Buscando la carpeta asociada con ${entityType} ID: ${entityId}`);
    
            let searchField;
            switch (entityType) {
                case 'partida':
                    searchField = 'id_partida';
                    break;
                case 'subpartida':
                    searchField = 'id_subpartida';
                    break;
                case 'tarea':
                    searchField = 'id_tarea';
                    break;
                case 'subtarea':
                    searchField = 'id_subtarea';
                    break;
                default:
                    throw new Error(`Tipo de entidad desconocido: ${entityType}`);
            }
    
            const entityFolder = await sequelize.models.Folder.findOne({ where: { [searchField]: entityId } });
    
            if (!entityFolder) {
                console.error(`No se encontró la carpeta asociada con ${entityType} ID: ${entityId}`);
                throw new Error(`No se encontró la carpeta asociada con ${entityType}.`);
            }
    
            console.log(`Carpeta encontrada: ${entityFolder.nombre_carpeta} con path: ${entityFolder.path}`);
    
            const oldPath = entityFolder.path;
            const oldEntityName = entityFolder.nombre_carpeta;
    
            const baseFolderPath = oldPath.substring(0, oldPath.lastIndexOf('/') + 1);
            const newPath = `${baseFolderPath}${newEntityName}`;
    
            if (oldEntityName === newEntityName) {
                console.log(`El nombre no ha cambiado para la carpeta ID: ${entityFolder.id_folder}`);
                return false;
            }
    
            // console.log(`Actualizando nombre de la carpeta de '${oldEntityName}' a '${newEntityName}'`);
            // console.log(`Actualizando path de '${oldPath}' a '${newPath}'`);
    
            // Actualizar el nombre de la carpeta de la entidad, su path, enlace y nombre en S3
            await sequelize.models.Folder.update(
                { 
                    nombre_carpeta: newEntityName, 
                    path: newPath,
                    enlace: newPath, 
                    nombre_S3_cloud: newEntityName 
                },
                { where: { id_folder: entityFolder.id_folder } }
            );
    
            // console.log(`Nombre, path, enlace y nombre en S3 de la carpeta actualizados.`);
    
            // Actualizar recursivamente los paths de las carpetas hijas
            await this.updateChildFoldersPaths(entityFolder.id_folder, oldPath, newPath);
    
            console.log(`Las carpetas asociadas con ${entityType} ID ${entityId} han sido actualizadas correctamente.`);
            return true;
        } catch (error) {
            console.error(`Error al actualizar las carpetas de la ${entityType}:`, error);
            throw error;
        }
    }
    
    
    async updateChildFoldersPaths(parentFolderId, oldParentPath, newParentPath) {
        const childFolders = await sequelize.models.Folder.findAll({
            where: {
                parent_folder_id: parentFolderId
            }
        });
    
        for (const childFolder of childFolders) {
            const oldChildPath = childFolder.path;
            const newChildPath = oldChildPath.replace(oldParentPath, newParentPath);
    
            console.log(`Actualizando path de carpeta hija ID: ${childFolder.id_folder} de '${oldChildPath}' a '${newChildPath}'`);
            
            await sequelize.models.Folder.update(
                { path: newChildPath, enlace: newChildPath },
                { where: { id_folder: childFolder.id_folder } }
            );
    
            // Llamada recursiva para actualizar las subcarpetas de esta carpeta hija
            await this.updateChildFoldersPaths(childFolder.id_folder, oldChildPath, newChildPath);
        }
    }


    
      //segunda con parentfolder
    
      async getFolderByIdparent(id) {
        try {
            const folder = await sequelize.models.Folder.findByPk(id, {
               
                include: [
                    {
                        model: sequelize.models.Document,
                        as: 'documents', // Alias definido en la relación
                        where: {
                            trashed: false // FILTRAR documentos NO eliminados
                        },
                        required: false // Para incluir carpeta aunque no tenga documentos
                    },
                ],
            });
    
            if (!folder) {
                throw new Error('Carpeta no encontrada');
            }
    
            return folder;
        } catch (error) {
            console.error('Error al obtener la carpeta por ID:', error.message);
            throw new Error('Error al obtener la carpeta por ID');
        }
    }
    
    

      // Obtener todas las carpetas que tienen un parent_folder_id específico
      async getChildrenFoldersByParentId(parentFolderId) {
        try {
          const childrenFolders = await sequelize.models.Folder.findAll({
            where: {
              parent_folder_id: parentFolderId,
              trashed: false // FILTRAR carpetas NO eliminadas
            },
            
            include: [
                {
                    model: sequelize.models.Document,
                    as: 'documents', // El alias que utilizaste en la relación
                    where: {
                        trashed: false // FILTRAR documentos NO eliminados
                    },
                    required: false // Para incluir carpetas aunque no tengan documentos
                },
            ],
          });
          return childrenFolders;
        } catch (error) {
          throw new Error('Error al obtener las carpetas hijas por parent_folder_id');
        }
      }
    //papelera 

     // Obtener todas las carpetas en la papelera de un usuario específico
     async getTrashFoldersByUserId(userId) {
        try {
            const trashFolders = await sequelize.models.Folder.findAll({
                where: {
                    usuario_id: userId, // Verifica que el campo `usuario_id` sea correcto
                    trashed: true,      // Asegúrate de que el campo `trashed` esté definido y sea correcto
                },
               
            });
    
            return trashFolders;
        } catch (error) {
            console.error('Error al obtener carpetas en la papelera por userId:', error); // Cambiado para mostrar todo el error
            throw new Error('Error al obtener carpetas en la papelera por userId');
        }
    }
    
    // Obtener las carpetas hijas de una carpeta en la papelera
    async getTrashedFolders(userId) {
        try {
            return await sequelize.models.Folder.findAll({
                where: { trashed: true },
        
            });
        } catch (error) {
            console.error('Error al obtener las carpetas en papelera:', error);
            throw error;
        }
    }
      
      async getTrashedDocuments(userId) {
        try {
            return await sequelize.models.Document.findAll({
                where: { trashed: true },
          
            });
        } catch (error) {
            console.error('Error al obtener los documentos en papelera:', error);
            throw error;
        }
    }
    // papelera 



      async getFolderHierarchy(folderId) {
        try {
          // Obtener la carpeta actual
          let folder = await sequelize.models.Folder.findByPk(folderId);
          if (!folder) throw new Error('Carpeta no encontrada');
    
          let breadcrumb = [];
          let currentFolder = folder;
    
          // Bucle para encontrar los padres recursivamente
          while (currentFolder) {
            breadcrumb.unshift({
              id_folder: currentFolder.id_folder,
              nombre_carpeta: currentFolder.nombre_carpeta,
              parent_folder_id: currentFolder.parent_folder_id,
              path: currentFolder.path
            }); // Agregar la carpeta al inicio del array
    
            if (!currentFolder.parent_folder_id) {
              break;  // Si no tiene carpeta padre, termina el bucle
            }
    
            // Obtener la carpeta padre
            const parentFolder = await sequelize.models.Folder.findByPk(currentFolder.parent_folder_id);
            if (!parentFolder) {
              console.warn(`Carpeta padre con ID ${currentFolder.parent_folder_id} no encontrada para la carpeta ${currentFolder.id_folder}`);
              break; // Si no se encuentra la carpeta padre, terminar el bucle en lugar de fallar
            }
            currentFolder = parentFolder;
          }
    
          // Retornar la carpeta actual y su jerarquía de padres
          return {
            currentFolder: folder,
            breadcrumb
          };
        } catch (error) {
          console.error('Error al obtener la jerarquía de carpetas:', error.message);
          throw new Error('Error al obtener la jerarquía de carpetas');
        }
      }



         // Función para obtener carpetas de un usuario de manera recursiva
         async getFoldersByPath(userId, path) {
            try {
                // Buscar todas las carpetas cuyo path comience con el valor dado
                const folders = await sequelize.models.Folder.findAll({
                    where: {
                        usuario_id: userId,
                        path: { [Op.like]: `${path}%` }, // Busca todas las carpetas cuyo path comience con el valor dado
                        trashed: false // FILTRAR elementos NO eliminados
                    },
                    order: [['path', 'ASC']],
                    include: [
                        {
                            model: sequelize.models.Document,
                            as: 'documents', // El alias que utilizaste en la relación
                            where: {
                                trashed: false // FILTRAR documentos NO eliminados
                            },
                            required: false // Para incluir carpetas aunque no tengan documentos
                        }
                    ]
                });
        
                // Mapear las carpetas para devolverlas en el formato adecuado
                return folders.map(folder => ({
                    id_folder: folder.id_folder,
                    nombre_carpeta: folder.nombre_carpeta,
                    path: folder.path,
                    parent_folder_id: folder.parent_folder_id,
                    usuario_id: folder.usuario_id,
                    documents: folder.documents.map(doc => ({
                        id_document: doc.id,
                        filenames: doc.filenames,
                        link: doc.link,
                        filesize: doc.filesize,
                        fileExtension: doc.fileExtension,
                     
                     
                    }))
                }));
            } catch (error) {
                console.error('Error en getFoldersByPath:', error);
                throw new Error(`Error al obtener las carpetas por path: ${error.message}`);
            }
        }
        
    
      //segunda con parentfolder

    


    async getAllFoldersByPath(path = '') {
        path = path || ''; // Asegurarse de que path sea una cadena vacía si es null o undefined

        // Obtener carpetas junto con sus documentos relacionados
        const folders = await sequelize.models.Folder.findAll({
            where: { path: { [Op.startsWith]: path } },
            include: [
                {
                    model: sequelize.models.Document,
                    as: 'documents', // El alias que utilizaste en la relación
                },
            ],
        });

        return folders;
    }



    async getFolderById(id) {
        const folder = await sequelize.models.Folder.findOne({
            where: { id_folder: id }
        });

        if (!folder) {
            throw new CustomHttpError(404, 'Carpeta no encontrada');
        }

        return folder;
    }

    async getRootFolderByUserId(usuario_id) {
        return await sequelize.models.Folder.findOne({
            where: {
                usuario_id,
                parent_folder_id: null
            }
        });
    }


    async getFolderRaiz(folderName, idParam) {

        console.log(folderName );
        try {
            const folder = await sequelize.models.Folder.findOne({
                where: {
                    nombre_carpeta: folderName,
                    parent_folder_id: idParam,
                }
            });
    
            return folder;
        } catch (error) {
            console.error('Error al buscar la carpeta raíz:', error);
            throw error;
        }
    }
    



    async findRootFolderByUserId(userId,path) {

        //console.log("findRootFolderByUserId -path: ", path);
        try {
            const folder = await sequelize.models.Folder.findOne({
                where: {
                    usuario_id: userId,
                    path: `root/usuarios/${path}`, // Construir correctamente la ruta usando el userId
                }
            });
    
            return folder;
        } catch (error) {
            console.error('Error al buscar la carpeta raíz del usuario:', error);
            throw error;
        }
    };
    



    async createFolder(folderData) {
        const t = await sequelize.transaction();
        try {
          // Crea la carpeta en la base de datos
          const newFolder = await sequelize.models.Folder.create(folderData, { transaction: t });
  
          // Solo intentar subir a S3 si las credenciales están configuradas
          if (AWS_S3_BUCKET_PROFILE && process.env.AWS_ACCESS_KEY && process.env.AWS_SECRET_KEY && process.env.AWS_S3_REGION) {
              // Construye la clave S3 directamente desde el path proporcionado
              const s3Key = `MyDocs/${folderData.path}/`;
              
              // Configura los parámetros para S3
              const params = {
                  Bucket: AWS_S3_BUCKET_PROFILE,
                  Key: s3Key,
                  ACL: 'private'
              };
      
              console.log('S3 Params:', params);
      
              // Subir a S3
              const upload = new Upload({
                  client: s3,
                  params: {
                      Bucket: params.Bucket,
                      Key: params.Key,
                      Body: '', 
                      ACL: params.ACL
                  }
              });
        
              await upload.done();
              console.log('S3 Upload Successful');
          } else {
              console.log('S3 credentials not configured - skipping S3 upload (development mode)');
          }
    
          await t.commit();
          console.log('Transaction Committed');
    
          return newFolder;
        } catch (error) {
            await t.rollback();
            console.error('Transaction Rolled Back:', error.message);
            throw new CustomHttpError(500, 'Error al crear la carpeta');
        }
    }



    async renameFolderInS3(oldPath, newPath) {
        try {
            // 1. Listar todos los objetos en la carpeta antigua
            const listParams = {
                Bucket: AWS_S3_BUCKET_PROFILE,
                Prefix: oldPath,
            };
            const listedObjects = await s3.send(new ListObjectsV2Command(listParams));
    
            // Verificar si listedObjects y listedObjects.Contents existen
            if (!listedObjects || !listedObjects.Contents || listedObjects.Contents.length === 0) {
                console.log('No se encontraron objetos para renombrar en S3.');
                return;
            }
    
            // 2. Copiar cada objeto a la nueva ubicación
            for (const object of listedObjects.Contents) {
                const copyParams = {
                    Bucket: AWS_S3_BUCKET_PROFILE,
                    CopySource: `${AWS_S3_BUCKET_PROFILE}/${object.Key}`,
                    Key: object.Key.replace(oldPath, newPath),
                };
                await s3.send(new CopyObjectCommand(copyParams));
            }
    
            // 3. Eliminar los objetos antiguos
            const deleteParams = {
                Bucket: AWS_S3_BUCKET_PROFILE,
                Delete: { Objects: listedObjects.Contents.map(({ Key }) => ({ Key })) },
            };
            await s3.send(new DeleteObjectsCommand(deleteParams));
    
        } catch (error) {
            console.error('Error al renombrar carpeta en S3:', error);
            throw new CustomHttpError(500, 'Error al renombrar carpeta en S3');
        }
    }
    
    
    
    async updateFolder(id, updatedData) {
        const t = await sequelize.transaction();
        try {
            const folder = await this.getFolderById(id);
    
            // Guardar el nombre y path anterior antes de actualizar
            const oldPath = folder.path;
            const oldFolderName = folder.nombre_carpeta;
    
            const [rowsAffected] = await sequelize.models.Folder.update(updatedData, {
                where: { id_folder: id },
                returning: true,
                transaction: t
            });
    
            if (rowsAffected === 0) {
                throw new CustomHttpError(404, 'Carpeta no encontrada');
            }
    
            const updatedFolder = await this.getFolderById(id);
    
            // Si se actualizó el nombre de la carpeta, también renombrar en S3
            if (updatedData.nombre_carpeta && updatedData.nombre_carpeta !== oldFolderName) {
                const newPath = oldPath.replace(oldFolderName, updatedData.nombre_carpeta);
                await this.renameFolderInS3(oldPath, newPath);
    
                // Actualizar el path en la base de datos
                await sequelize.models.Folder.update({ path: newPath }, {
                    where: { id_folder: id },
                    transaction: t
                });
            }
    
            await t.commit();
            return updatedFolder;
        } catch (error) {
            await t.rollback();
            console.error('Error al actualizar la carpeta:', error);
            throw new CustomHttpError(500, 'Error al actualizar la carpeta');
        }
    }
    
    














    async deleteFolder(id) {
        const t = await sequelize.transaction();
        try {
            const folder = await this.getFolderById(id);
            if (!folder) {
                throw new CustomHttpError(404, 'Carpeta no encontrada');
            }

            const params = {
                Bucket: S3_BUCKET,
                Key: `MyDocs/${folder.usuario_id}/${folder.path}/`
            };

            await s3.deleteObject(params).promise();
            await sequelize.models.Folder.destroy({
                where: { id_folder: id },
                transaction: t
            });

            await t.commit();
            return true;
        } catch (error) {
            await t.rollback();
            throw new CustomHttpError(500, 'Error al eliminar la carpeta');
        }
    }




// actualiza el uri de carpetas usuario

    async findUserById(id) {
        return await sequelize.models.User.findByPk(id);
    }

    async updateUriFolder(id, uriFolder) {
        const user = await this.findUserById(id);
        if (!user) {
            throw new Error('Usuario no encontrado');
        }
        user.urifolder = uriFolder;
        await user.save();
        return user;
    }


    async uploadFile(folderId, file,userId) {

        console.log("folderId:",folderId);
        console.log("file:",file);

        const t = await sequelize.transaction();
        try {
            // Extraer la extensión del archivo desde el nombre del archivo
            const fileExtension = file.originalname.split('.').pop();
    
            // Subir el archivo a S3
            const upload = new Upload({
                client: s3,
                params: {
                    Bucket: AWS_S3_BUCKET_PROFILE,
                    Key: `MyDocs/${folderId}/${file.originalname}`,
                    Body: file.buffer,
                    ContentType: file.mimetype,
                    ACL: 'public-read',
                }
            });
    
            const s3Result = await upload.done();
    
            // Guardar la referencia del archivo en la base de datos
            const newFile = await sequelize.models.Document.create({
                folderId: folderId,
                filenames: file.originalname,
                ruta_s3: s3Result.Key,
                link: `https://${AWS_S3_BUCKET_PROFILE}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${s3Result.Key}`,
                filesize: file.size, // file.size es ahora BIGINT (int8)
                fileExtension: fileExtension,
                userId:userId,
            }, { transaction: t });
    
            // Convierte file.size a BigInt antes de actualizar el tamaño de la carpeta
            const sizeDifference = BigInt(file.size);
    
            // Invoca la función updateFolderSize recursiva para actualizar el tamaño de la carpeta y todas las carpetas padre
            await this.updateFolderSize(folderId, sizeDifference, t);
    
            await t.commit();
            return newFile;
        } catch (error) {
            await t.rollback();
            console.error('Error al subir el archivo:', error.message);
            throw new CustomHttpError(500, 'Error al subir el archivo');
        }
    }
    
    
    
    async updateFolderSize(folderId, sizeDifference, transaction = null) {
        try {
            // Busca la carpeta actual por su ID
            const folder = await sequelize.models.Folder.findByPk(folderId, { transaction });
    
            if (!folder) {
                throw new Error('La carpeta no existe.');
            }
    
            // Convierte el tamaño actual de la carpeta a BigInt si no lo es
            const currentSize = BigInt(folder.size || 0);
            
            // Calcula el nuevo tamaño usando BigInt para evitar problemas de precisión
            const newSize = currentSize + BigInt(sizeDifference);
    
            // Actualiza el tamaño de la carpeta
            folder.size = newSize;
    
            // Guarda la carpeta con el nuevo tamaño
            await folder.save({ transaction });
    
            // Si la carpeta tiene una carpeta padre, actualiza recursivamente el tamaño
            if (folder.parent_folder_id) {
                await this.updateFolderSize(folder.parent_folder_id, sizeDifference, transaction);
            }
    
            return folder;
        } catch (error) {
            console.error('Error al actualizar el tamaño de la carpeta:', error.message);
            throw new Error('Error al actualizar el tamaño de la carpeta.');
        }
    }
    
    async calculateTotalFileSize(path) {
        const t = await sequelize.transaction();
        try {
            // Obtener todos los id_folder que coinciden con el path
            const folders = await sequelize.models.Folder.findAll({
                where: {
                    path: { [Op.like]: `%${path}%` } // Busca todas las carpetas cuyo path incluye el path dado
                },
                attributes: ['id_folder', 'usuario_id'], // Necesitamos id_folder y usuario_id
                transaction: t
            });
    
            const folderIds = folders.map(folder => folder.id_folder);
            const userIds = [...new Set(folders.map(folder => folder.usuario_id))]; // Obtener los IDs de usuario únicos
    
            // Si no se encontraron carpetas, devolver tamaño 0
            if (folderIds.length === 0 || userIds.length === 0) {
                await t.commit();
                return { totalSize: '0', storageLimit: '0' };
            }
    
            // Obtener el tamaño total de los archivos en esos folders
            const documents = await sequelize.models.Document.findAll({
                where: {
                    folderId: { [Op.in]: folderIds } // Filtra por los folderId obtenidos
                },
                attributes: ['filesize'], // Solo necesitamos el tamaño de los archivos
                transaction: t
            });
    
            // Sumar todos los tamaños de los archivos usando BigInt para evitar problemas de precisión
            const totalSize = documents.reduce((total, doc) => total + BigInt(doc.filesize || 0), 0n);
    
            // Obtener el storage_limit del primer usuario (asumiendo que todos los folders pertenecen al mismo usuario)
            const user = await sequelize.models.User.findOne({
                where: { id: userIds[0] },
                attributes: ['storage_limit'],
                transaction: t
            });
    
            const storageLimit = user ? BigInt(user.storage_limit || 0) : 0n;
    
            await t.commit();
    
            // Convertir BigInt a String para evitar el error en JSON.stringify
            return { totalSize: totalSize.toString(), storageLimit: storageLimit.toString() };
        } catch (error) {
            await t.rollback();
            console.error('Error al calcular el tamaño total de los archivos:', error);
            throw new CustomHttpError(500, 'Error al calcular el tamaño total de los archivos');
        }
    }
    
    
    

    //favorito documento y folders

    async findById(folderId) {
        return await sequelize.models.Folder.findByPk(folderId);
      }
    
      async updateFavorites(folderId, updatedFavorites) {
        return await sequelize.models.Folder.update(
          { favorited_by_users: updatedFavorites },
          { where: { id_folder: folderId }, returning: true, plain: true }
        );
      }




      async findByIdDocument(documentId) {
        try {
            return await sequelize.models.Document.findOne({ where: { id: documentId } });
        } catch (error) {
            throw new Error('Error al encontrar el documento: ' + error.message);
        }
    }

    // Método para actualizar la lista de usuarios que han marcado como favorito el documento
    async updateFavoritesDocument(documentId, updatedFavorites) {
        try {
            const document = await sequelize.models.Document.update(
                { favorited_by_users: updatedFavorites },
                { where: { id: documentId }, returning: true, plain: true }
            );
            return document;
        } catch (error) {
            throw new Error('Error al actualizar los favoritos del documento: ' + error.message);
        }
    }




    async findAllFavoritesByUser(userId) {
        try {
            // Obtener carpetas favoritas con sus documentos favoritos
            const favoriteFolders = await sequelize.models.Folder.findAll({
                where: {
                    favorited_by_users: {
                        [Op.contains]: [userId]
                    }
                },
                include: [
                    {
                        model: sequelize.models.Document,
                        as: 'documents', // Alias para la relación con documentos
                        where: {
                            favorited_by_users: {
                                [Op.contains]: [userId]
                            }
                        },
                        required: false // Incluir carpetas aunque no tengan documentos favoritos
                    },
                ],
            });
    
            // Obtener documentos favoritos que no están en carpetas favoritas
            const favoriteDocumentsOutsideFolders = await sequelize.models.Document.findAll({
                where: {
                    favorited_by_users: {
                        [Op.contains]: [userId]
                    },
                    folderId: {
                        [Op.notIn]: favoriteFolders.map(folder => folder.id_folder)
                    }
                },
            });
    
            return {
                favoriteFolders,              // Carpetas favoritas con sus documentos favoritos
                favoriteDocumentsOutsideFolders // Documentos favoritos fuera de las carpetas favoritas
            };
        } catch (error) {
            throw new Error('Error al obtener carpetas y documentos favoritos: ' + error.message);
        }
    }
    
    

    async updateTrashStatus(id_folder) {
        try {
          // Buscar el estado actual de la carpeta
          const folder = await sequelize.models.Folder.findByPk(id_folder);
          if (!folder) {
            console.log(`Carpeta con id_folder: ${id_folder} no encontrada.`);
            return null;
          }
      
          // Log para ver el estado actual de 'trashed' y 'trashedAt'
          console.log(`Estado actual de trashed: ${folder.trashed}`);
          console.log(`Estado actual de trashedAt: ${folder.trashedAt}`);
      
          // Definir el nuevo estado para alternar entre papelera y no papelera
          const trashed = !folder.trashed; // Alternar el valor booleano
          const trashedAt = trashed ? new Date() : null; // Si está en la papelera, asignar fecha actual, si no, asignar null
      
          // Log de los nuevos valores
          console.log(`Nuevo estado de trashed: ${trashed}`);
          console.log(`Nuevo estado de trashedAt: ${trashedAt}`);
      
          // Actualizamos el estado de 'trashed' y 'trashedAt'
          const [updatedRows] = await sequelize.models.Folder.update(
            { trashed, trashedAt },
            { where: { id_folder }, silent: false }
          );
      
          // Log para ver cuántas filas fueron actualizadas
          console.log(`Filas actualizadas: ${updatedRows}`);
      
          if (updatedRows > 0) {
            const updatedFolder = await sequelize.models.Folder.findByPk(id_folder);
            console.log(`Carpeta actualizada: ${JSON.stringify(updatedFolder)}`); // Log de la carpeta actualizada
            return updatedFolder;
          }
      
          console.log('No se actualizó ninguna fila, retornando null.');
          return null;
        } catch (error) {
          console.error(`Error al actualizar el estado de la carpeta: ${error.message}`);
          throw new Error(`Error al actualizar el estado de la carpeta: ${error.message}`);
        }
      }
      
      async updateTrashStatusdocument(id_document) {
        try {
          // Buscar el documento por su ID
          const document = await sequelize.models.Document.findByPk(id_document);
      
          if (!document) {
            console.log(`Documento con id: ${id_document} no encontrado.`);
            return null;
          }
      
          // Alternar el estado de `trashed` y manejar `trashedAt` en función del estado
          const trashed = !document.trashed; // Alternar el valor actual
          const trashedAt = trashed ? new Date() : null; // Si está en la papelera, asignar la fecha actual, si no, null
      
          console.log("Nuevo valor de trashed:", trashed);
          console.log("Nuevo valor de trashedAt:", trashedAt);
      
          // Actualizar los campos
          document.trashed = trashed;
          document.trashedAt = trashedAt;
      
          // Marcar los campos como modificados
          document.changed('trashed', true);
          document.changed('trashedAt', true);
      
          // Guardar los cambios
          await document.save();
      
          return document;
        } catch (error) {
          console.error('Error actualizando el estado de la papelera del documento:', error.message);
          throw new Error('Error actualizando el estado de la papelera del documento');
        }
      }
      
      // Eliminar carpeta permanentemente
      async deleteFolderPermanently(id_folder) {
        try {
          // Buscar la carpeta para verificar que existe y está en la papelera
          const folder = await sequelize.models.Folder.findByPk(id_folder);
          if (!folder) {
            throw new Error(`Carpeta con id_folder: ${id_folder} no encontrada.`);
          }
      
          if (!folder.trashed) {
            throw new Error(`La carpeta debe estar en la papelera para ser eliminada permanentemente.`);
          }
      
          // Eliminar todos los documentos asociados a la carpeta
          await sequelize.models.Document.destroy({
            where: { folderId: id_folder }
          });
      
          // Obtener todas las subcarpetas recursivamente y eliminar sus documentos
          const getAllSubfolders = async (parentId) => {
            const subfolders = await sequelize.models.Folder.findAll({
              where: { parent_folder_id: parentId }
            });
            
            for (const subfolder of subfolders) {
              // Eliminar documentos de la subcarpeta
              await sequelize.models.Document.destroy({
                where: { folderId: subfolder.id_folder }
              });
              
              // Recursivamente procesar subcarpetas
              await getAllSubfolders(subfolder.id_folder);
            }
            
            return subfolders;
          };
      
          // Obtener todas las subcarpetas y eliminar sus documentos
          await getAllSubfolders(id_folder);
      
          // Eliminar todas las subcarpetas
          await sequelize.models.Folder.destroy({
            where: { 
              [Op.or]: [
                { id_folder: id_folder },
                { parent_folder_id: id_folder }
              ]
            }
          });
      
          return { message: 'Carpeta eliminada permanentemente con éxito' };
        } catch (error) {
          console.error(`Error al eliminar carpeta permanentemente: ${error.message}`);
          throw new Error(`Error al eliminar carpeta permanentemente: ${error.message}`);
        }
      }

      // Eliminar documento permanentemente
      async deleteDocumentPermanently(id_document) {
        try {
          // Buscar el documento para verificar que existe y está en la papelera
          const document = await sequelize.models.Document.findByPk(id_document);
          if (!document) {
            throw new Error(`Documento con id: ${id_document} no encontrado.`);
          }
      
          if (!document.trashed) {
            throw new Error(`El documento debe estar en la papelera para ser eliminado permanentemente.`);
          }
      
          // Eliminar el documento permanentemente
          await sequelize.models.Document.destroy({
            where: { id: id_document }
          });
      
          return { message: 'Documento eliminado permanentemente con éxito' };
        } catch (error) {
          console.error(`Error al eliminar documento permanentemente: ${error.message}`);
          throw new Error(`Error al eliminar documento permanentemente: ${error.message}`);
        }
      }

      // Función de emergencia para limpiar TODA la papelera (solo admin)
      async forceEmptyAllTrash() {
        try {
          
          // Eliminar TODOS los documentos en papelera
          const deletedDocuments = await sequelize.models.Document.destroy({
            where: { trashed: true }
          });
          
          // Eliminar TODAS las carpetas en papelera
          const deletedFolders = await sequelize.models.Folder.destroy({
            where: { trashed: true }
          });
          
          console.log(`Eliminación forzada completada: ${deletedDocuments} documentos, ${deletedFolders} carpetas`);
          
          return {
            message: 'Papelera vaciada completamente (modo forzado)',
            deletedDocuments,
            deletedFolders
          };
        } catch (error) {
          throw error;
        }
      }

      // Vaciar papelera (eliminar todo permanentemente)
      async emptyTrash(userId) {
        try {
          console.log(`Iniciando vaciado de papelera para usuario: ${userId}`);
          
          // Función para eliminar recursivamente una carpeta y todo su contenido
          const deleteRecursively = async (folderId) => {
            console.log(`Eliminando recursivamente carpeta: ${folderId}`);
            
            // Primero eliminar todos los documentos en esta carpeta
            const deletedDocs = await sequelize.models.Document.destroy({
              where: { folderId: folderId }
            });
            console.log(`Eliminados ${deletedDocs} documentos de carpeta ${folderId}`);
      
            // Obtener todas las subcarpetas
            const subfolders = await sequelize.models.Folder.findAll({
              where: { parent_folder_id: folderId }
            });
            console.log(`Encontradas ${subfolders.length} subcarpetas en carpeta ${folderId}`);
      
            // Eliminar recursivamente cada subcarpeta
            for (const subfolder of subfolders) {
              await deleteRecursively(subfolder.id_folder);
            }
      
            // Finalmente eliminar la carpeta misma
            const deletedFolder = await sequelize.models.Folder.destroy({
              where: { id_folder: folderId }
            });
            console.log(`Carpeta ${folderId} eliminada: ${deletedFolder > 0 ? 'SÍ' : 'NO'}`);
          };
      
          // 1. Eliminar todos los documentos del usuario que están en la papelera (directamente)
          const deletedDocuments = await sequelize.models.Document.destroy({
            where: { 
              userId: userId, 
              trashed: true 
            }
          });
          console.log(`Eliminados ${deletedDocuments} documentos directos del usuario`);
      
          // 2. Obtener TODAS las carpetas que están en la papelera y son accesibles por el usuario
          // Incluir carpetas con usuario_id del usuario actual Y carpetas de proyectos donde el usuario participa
          const userProjects = await sequelize.models.UserProject.findAll({
            where: { userId: userId },
            attributes: ['projectId']
          });
          const projectIds = userProjects.map(up => up.projectId);
          console.log(`Usuario participa en proyectos: ${projectIds}`);
      
          // Estrategia: Si el usuario no tiene carpetas propias, permitir limpiar TODAS las carpetas en papelera
          // Esto es útil cuando un usuario administrador necesita limpiar la papelera completa
          let trashedFolders = await sequelize.models.Folder.findAll({
            where: { 
              trashed: true,
              [Op.or]: [
                { usuario_id: userId },
                { id_proyecto: { [Op.in]: projectIds } }
              ]
            }
          });
          
          console.log(`Encontradas ${trashedFolders.length} carpetas en papelera del usuario`);
          
          // Si no encuentra carpetas del usuario pero hay carpetas en papelera, 
          // permitir eliminar TODAS solo si son carpetas "huérfanas" o muy antiguas
          if (trashedFolders.length === 0) {
            console.log('⚠️ No se encontraron carpetas del usuario, verificando limpieza completa');
            
            // Buscar todas las carpetas en papelera
            const allTrashedFolders = await sequelize.models.Folder.findAll({
              where: { trashed: true }
            });
            
            // Solo aplicar limpieza completa si:
            // 1. Son menos de 50 carpetas (evitar borrados masivos accidentales)
            // 2. O si el usuario confirma explícitamente
            if (allTrashedFolders.length <= 50) {
              console.log(`Aplicando limpieza completa de ${allTrashedFolders.length} carpetas (límite seguro)`);
              trashedFolders = allTrashedFolders;
            } else {
              console.log(`BLOQUEADO: ${allTrashedFolders.length} carpetas en papelera excede límite de seguridad (50)`);
              console.log('Para eliminar más de 50 carpetas, usar función forceEmptyAllTrash()');
              trashedFolders = []; // No eliminar nada si hay demasiadas carpetas
            }
          }
          
          // Debug: Mostrar detalles de cada carpeta encontrada
          trashedFolders.forEach(folder => {
            console.log(`Carpeta: "${folder.nombre_carpeta}" - usuario_id: ${folder.usuario_id}, id_proyecto: ${folder.id_proyecto}, trashed: ${folder.trashed}`);
          });
          
          // Debug adicional: Ver TODAS las carpetas en papelera sin filtros
          const allTrashedFolders = await sequelize.models.Folder.findAll({
            where: { trashed: true }
          });
          console.log(`\n=== TODAS las carpetas en papelera (${allTrashedFolders.length}) ===`);
          allTrashedFolders.forEach(folder => {
            console.log(`"${folder.nombre_carpeta}" - usuario_id: ${folder.usuario_id}, id_proyecto: ${folder.id_proyecto}`);
          });
          console.log(`=== Fin debug ===\n`);
      
          // 3. Eliminar cada carpeta y todo su contenido recursivamente
          let totalDeletedFolders = 0;
          for (const folder of trashedFolders) {
            console.log(`Procesando carpeta: ${folder.nombre_carpeta} (ID: ${folder.id_folder})`);
            try {
              await deleteRecursively(folder.id_folder);
              totalDeletedFolders++;
            } catch (error) {
              console.error(`Error eliminando carpeta ${folder.id_folder}: ${error.message}`);
              // Continuar con las otras carpetas aunque una falle
            }
          }
      
          // 4. Hacer una limpieza final para asegurar que no queden carpetas huérfanas en papelera
          // Usar la misma estrategia: si no hay carpetas del usuario, limpiar TODAS
          let finalCleanupWhere = { 
            trashed: true,
            [Op.or]: [
              { usuario_id: userId },
              { id_proyecto: { [Op.in]: projectIds } }
            ]
          };
          
          // Si aplicamos limpieza completa, también eliminar cualquier carpeta restante
          if (trashedFolders.length > 0) {
            const firstFolderWasFromCompleteCleanup = !trashedFolders[0].usuario_id || 
                                                     !projectIds.includes(trashedFolders[0].id_proyecto);
            if (firstFolderWasFromCompleteCleanup) {
              finalCleanupWhere = { trashed: true };
              console.log('Aplicando limpieza final completa');
            }
          }
          
          const remainingTrashedFolders = await sequelize.models.Folder.destroy({
            where: finalCleanupWhere
          });
          console.log(`Limpieza final: eliminadas ${remainingTrashedFolders} carpetas adicionales`);
      
          totalDeletedFolders += remainingTrashedFolders;
      
          console.log(`Vaciado completado. Documentos: ${deletedDocuments}, Carpetas: ${totalDeletedFolders}`);
          
          return { 
            message: 'Papelera vaciada con éxito',
            deletedDocuments,
            deletedFolders: totalDeletedFolders
          };
        } catch (error) {
          console.error(`Error al vaciar papelera: ${error.message}`);
          throw new Error(`Error al vaciar papelera: ${error.message}`);
        }
      }

}

module.exports = new FolderRepository();
