const { sequelize } = require('../config/sequelize-config');
const { CustomHttpError } = require('../errors/customError');
const { S3Client } = require('@aws-sdk/client-s3'); // Importa S3Client desde AWS SDK v3
const userRepository = require('../repositories/user.repository');
const PartidasRepository = require('../repositories/partida.repositoy');
const SubpartidaRepository = require('../repositories/subpartida.repository');
const TaskRepository = require('../repositories/task.repository');
const SubtaskRepository = require('../repositories/subtask.repository');
const FolderRepository = require('../repositories/folder.repository');

const { PutObjectCommand } = require('@aws-sdk/client-s3');
const mime = require('mime-types');
const S3_BUCKET = process.env.AWS_S3_BUCKET;
const S3_BUCKET_PROFILE = process.env.AWS_S3_BUCKET_PROFILE;
require('dotenv').config();
const s3 = new S3Client({
    region: process.env.AWS_S3_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
    },
});


class DocumentRepository {
    async createDocument(name) {
        const rol = await sequelize.models.Rol.findOne({
            attributes: ['name', 'id'],
            where: {
                name
            }
        });

        if (!rol) {
            throw new CustomHttpError(404, 'Rol no encontrado');
        }

        return rol;
    }

    async uploadDocumentS3(file, user, documentType) {
        if (!file) {
            throw new CustomHttpError(400, 'No se ha proporcionado un archivo');
        }

        if (!user) {
            throw new CustomHttpError(400, 'No se ha proporcionado un usuario');
        }

        const docType = await sequelize.models.DocumentType.findOne({
            where: {
                name: documentType
            }
        });

        const userInBD = await userRepository.getUser(user);

        if (!docType) {
            throw new CustomHttpError(400, 'Tipo de documento no existe en construapp');
        }

        // Generar la key manteniendo la codificación UTF-8
        const s3Key = `${user}/${documentType}/${file.originalname}`;

        const s3Params = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: s3Key,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'public-read' // Opcional: ajusta los permisos según tus necesidades
        };

        const command = new PutObjectCommand(s3Params);
        await s3.send(command);

        const s3Location = `https://${s3Params.Bucket}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${s3Params.Key}`;

        await sequelize.models.Document.create({
            link: s3Location,
            documentTypeId: docType.id,
            userId: userInBD.id
        });

        return true;
    }


    async uploadDocumentS3Organization(file, organization, documentType, filesize, fileExtension) {
        if (!file) {
            throw new CustomHttpError(400, 'No se ha proporcionado un archivo');
        }
    
        if (!organization) {
            throw new CustomHttpError(400, 'No se ha proporcionado una organización');
        }
    
        const docType = await sequelize.models.DocumentType.findOne({
            where: {
                name: documentType
            }
        });
    
        if (!docType) {
            throw new CustomHttpError(400, `El tipo de documento "${documentType}" para el archivo "${file.originalname}" no existe en Construapp`);
        }
    
        // Generar la key manteniendo la codificación UTF-8
        const s3Key = `organizaciones/${organization.rut}/${documentType}/${file.originalname}`;
    
        const s3Params = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: s3Key,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'public-read' // Ajusta los permisos según tus necesidades
        };
    
        const command = new PutObjectCommand(s3Params);
        await s3.send(command);
    
        const s3Location = `https://${s3Params.Bucket}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${s3Params.Key}`;
    
        // Extraer el tamaño, extensión y nombre del archivo si no se proporcionan
        const fileSizeInBytes = filesize || file.size;
        const fileExt = fileExtension || file.originalname.split('.').pop().toLowerCase();
        const fileName = file.originalname;
        const s3Path = s3Params.Key;  // Ruta S3, sin el prefijo de URL
    
        // Almacenar el documento en la base de datos con la ruta S3, tamaño, nombre y la extensión del archivo
        await sequelize.models.Document.create({
            link: s3Location,
            ruta_s3: s3Path,           // Guardar la ruta en S3 (sin el prefijo de URL)
            documentTypeId: docType.id,
            organizationId: organization.id,
            filesize: fileSizeInBytes,  // Guardar el tamaño del archivo
            fileExtension: fileExt,     // Guardar la extensión del archivo
            filenames: fileName         // Guardar el nombre del archivo
        });
    
        return true;
    }
    


    
    
    // subir crear o actualizar docs
    async uploadDocumentS3User(file, user, documentType) {
        if (!file) {
            throw new CustomHttpError(400, 'No se ha proporcionado un archivo');
        }

        if (!user) {
            throw new CustomHttpError(400, 'No se ha proporcionado un usuario');
        }

        const docType = await sequelize.models.DocumentType.findOne({
            where: {
                name: documentType
            }
        });

        if (!docType) {
            throw new CustomHttpError(400, 'Tipo de documento no existe en construapp');
        }

        const existingDocument = await sequelize.models.Document.findOne({
            where: {
                documentTypeId: docType.id,
                userId: user.id
            }
        });

        const fileExtension = mime.extension(file.mimetype);
        const s3Key = `usuarios/${user.email}/${documentType}.${fileExtension}`;

        const s3Params = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: s3Key,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'public-read'
        };

        const command = new PutObjectCommand(s3Params);
        await s3.send(command);

        const s3Location = `https://${s3Params.Bucket}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${s3Params.Key}`;

        if (existingDocument) {
            // Actualizar documento existente
            existingDocument.link = s3Location;
            await existingDocument.save();
            console.log('Documento actualizado en la base de datos');
        } else {
            // Crear nuevo documento
            await sequelize.models.Document.create({
                link: s3Location,
                documentTypeId: docType.id,
                userId: user.id
            });
            console.log('Documento creado en la base de datos');
        }

        return true;
    }








    async uploadProfileOrganization(file, organization, documentType) {
        if (!file) {
            throw new CustomHttpError(400, 'No se ha proporcionado un archivo');
        }
    
        if (!organization) {
            throw new CustomHttpError(400, 'No se ha proporcionado una organización');
        }
    
        const docType = await sequelize.models.DocumentType.findOne({
            where: {
                name: documentType
            }
        });
    
        if (!docType) {
            throw new CustomHttpError(400, 'Tipo de documento no existe en construapp');
        }
    
        // Verificar si el documento ya existe en la base de datos
        const existingDocument = await sequelize.models.Document.findOne({
            where: {
                organizationId: organization.id,
                documentTypeId: docType.id
            }
        });
    
        // Generar clave S3 utilizando el formato probado
        const fileExtension = file.originalname.split('.').pop();
        const s3Key = `organizaciones/${organization.rut}/${documentType}.${fileExtension}`;
    
        // Parámetros para la carga en S3
        const s3Params = {
            Bucket: process.env.AWS_S3_BUCKET_PROFILE,
            Key: s3Key,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'public-read'
        };
    
        // Subir el archivo a S3
        const command = new PutObjectCommand(s3Params);
        await s3.send(command);
    
        const s3Location = `https://${s3Params.Bucket}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${s3Params.Key}`;
        console.log(`Archivo subido a S3: ${s3Location}`);
    
        if (existingDocument) {
            // Actualizar el documento existente en la base de datos
            await existingDocument.update({
                link: s3Location,
                filenames: file.originalname,
                filesize: file.size,
                fileExtension: fileExtension,
                ruta_s3: s3Key
            });
            console.log('Documento actualizado en la base de datos');
        } else {
            // Crear un nuevo documento en la base de datos
            await sequelize.models.Document.create({
                link: s3Location,
                documentTypeId: docType.id,
                organizationId: organization.id,
                filenames: file.originalname,
                filesize: file.size,
                fileExtension: fileExtension,
                ruta_s3: s3Key
            });
            console.log('Documento creado en la base de datos');
        }
    
        return true;
    }
    
    


    //profile mina
    async uploadProfilemina(file, mina, documentType) {
        if (!file) {
            throw new CustomHttpError(400, 'No se ha proporcionado un archivo');
        }

        if (!mina) {
            throw new CustomHttpError(400, 'No se ha proporcionado una mina');
        }

        const docType = await sequelize.models.DocumentType.findOne({
            where: {
                name: documentType
            }
        });

        if (!docType) {
            throw new CustomHttpError(400, 'Tipo de documento no existe en faena');
        }

        // Generar la key manteniendo la codificación UTF-8
        const s3Key = `${mina.rut}/${documentType}/${file.originalname}`;

        const s3Params = {
            Bucket: process.env.AWS_S3_BUCKET_PROFILE,
            Key: s3Key,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'public-read' // Opcional: ajusta los permisos según tus necesidades
        };

        console.log(s3Params);

        const command = new PutObjectCommand(s3Params);
        await s3.send(command);

        const s3Location = `https://${s3Params.Bucket}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${s3Params.Key}`;

        console.log(s3Location);

        const fileSize = file.size;

        await sequelize.models.Document.create({
            link: s3Location,
            documentTypeId: docType.id,
            id_mina: mina.id,
            filesize: fileSize
        });

        return true;
    }


    // Función para subir o actualizar el perfil del usuario
    async uploadProfileUser(file, user, documentType) {
        try {
            if (!file) {
                throw new CustomHttpError(400, 'No se ha proporcionado un archivo');
            }

            if (!user) {
                throw new CustomHttpError(400, 'No se ha proporcionado un usuario');
            }

            const docType = await sequelize.models.DocumentType.findOne({
                where: { name: documentType }
            });

            if (!docType) {
                throw new CustomHttpError(400, 'Tipo de documento no existe en construapp');
            }

            // Generar la key manteniendo la codificación UTF-8
            const s3Key = `${user.email}/${documentType}/${file.originalname}`;

            const s3Params = {
                Bucket: process.env.AWS_S3_BUCKET_PROFILE,
                Key: s3Key,
                Body: file.buffer,
                ContentType: file.mimetype,
                ACL: 'public-read' // Opcional: ajusta los permisos según tus necesidades
            };

            console.log('S3 Params:', s3Params);

            const command = new PutObjectCommand(s3Params);
            await s3.send(command);

            const s3Location = `https://${s3Params.Bucket}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${s3Params.Key}`;
            console.log('S3 Location:', s3Location);

            // Verificar si ya existe en la base de datos
            const existingDocument = await sequelize.models.Document.findOne({
                where: {
                    userId: user.id,
                    documentTypeId: docType.id
                }
            });

            if (existingDocument) {
                // Actualizar el documento existente
                await sequelize.models.Document.update(
                    { link: s3Location },
                    { where: { id: existingDocument.id } }
                );
            } else {
                // Crear un nuevo documento
                await sequelize.models.Document.create({
                    link: s3Location,
                    documentTypeId: docType.id,
                    userId: user.id,
                    filesize: file.size || 0,
                    favorited_by_users: [],
                    trashed_by_users: [],
                    deleted_by_users: [],
                    permanentlyDeleted: false,
                    trashed: false,
                    updatable: false
                });
            }

            return true;

        } catch (error) {
            console.error('Error en uploadProfileUser:', error);
            throw error;
        }
    }


    // actualizar foto de perfil user





    async uploadDocumentProject(file, projectdb, documentType, extension, size , userId) {


        if (!file) {
            throw new CustomHttpError(400, 'No se ha proporcionado un archivo');
        }

        const docType = await sequelize.models.DocumentType.findOne({
            where: {
                name: documentType
            }
        });

        if (!docType) {
            throw new CustomHttpError(400, 'Tipo de documento no existe en faena');
        }

        // Verifica si ya existe un documento para este tipo y proyecto
        let existingDocument = await sequelize.models.Document.findOne({
            where: {
                documentTypeId: docType.id,
                projectId: projectdb.id
            }
        });

        let existingOrganizacion = await sequelize.models.Mine.findOne({
            where: {
                id: projectdb.id_mina
            }
        });

        // console.log("existingOrganizacion: ", existingOrganizacion);
        // Generar la key sin encodeURIComponent para que se mantenga la codificación UTF-8
        const key = `proyectos/${projectdb.nombre}/${documentType}/${file.originalname}`;
        console.log('');
        console.log('Generated S3 Key:', key);

        const params = {
            Bucket: process.env.AWS_S3_BUCKET_PROFILE,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'public-read', // Ajusta los permisos según tus necesidades
            ContentDisposition: 'inline'
        };

        try {
            // Crear la estructura de carpetas en la base de datos
            const folderId = await this.createFolderStructure(key, userId , projectdb.id);

            const command = new PutObjectCommand(params);
            const s3Resp = await s3.send(command);

            const s3Location = `https://${params.Bucket}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${params.Key}`;

            if (existingDocument) {
                // Si el documento ya existe, actualiza el registro
                existingDocument.link = s3Location;
                existingDocument.filenames = file.originalname;
                existingDocument.folderId = folderId; // Asigna el folderId a la tabla Document
                existingDocument.fileExtension = extension; // Guarda la extensión del archivo
                existingDocument.filesize = size;// Guarda el tamaño del archivo
                existingDocument.userId = userId;
                existingDocument.id_mina = existingOrganizacion.id;
                existingDocument.organizationId = existingOrganizacion.id_organizacion;


                await existingDocument.save();
                console.log('Documento actualizado en la base de datos');
            } else {
                // Si el documento no existe, crea un nuevo registro
                await sequelize.models.Document.create({
                    link: s3Location,
                    documentTypeId: docType.id,
                    projectId: projectdb.id,
                    filenames: file.originalname,
                    folderId: folderId, // Asigna el folderId a la tabla Document
                    fileExtension: extension, // Guarda la extensión del archivo
                    filesize: size, // Guarda el tamaño del archivo
                    userId: userId,
                    id_mina:existingOrganizacion.id,
                    organizationId:existingOrganizacion.id_organizacion
                });
                console.log('Documento creado en la base de datos');
            }

            return true;
        } catch (error) {
            console.error('Error uploading file to S3:', error);
            throw new CustomHttpError(500, 'Error al subir el archivo a S3');
        }
    }







    async createFolderStructure(key, usuarioId, projectId) {
        console.log("key:", key);
        const folders = key.split('/'); // Dividimos la clave S3 por '/'
        let parentFolderId = null; // Para rastrear la carpeta padre
        let path = '';
        let depth = 0;
        let lastFolderId = null; // Para almacenar el ID de la última carpeta creada

        for (let i = 0; i < folders.length - 1; i++) { // Ignoramos el último elemento (el archivo)
            const folderName = folders[i];
            path += (i === 0 ? '' : '/') + folderName;

            // Verificar si la carpeta ya existe
            let whereClause = {
                nombre_S3_cloud: folderName,
                path: path,
                parent_folder_id: parentFolderId,

            };

            // Solo asignar id_proyecto si la carpeta no es "proyectos"
            if (folderName !== 'proyectos') {
                whereClause.id_proyecto = projectId;
            }

            let folder = await sequelize.models.Folder.findOne({
                where: whereClause
            });

            if (!folder) {
                // Crear la carpeta si no existe
                let folderData = {
                    nombre_carpeta: folderName,
                    nombre_S3_cloud: folderName,
                    enlace: path,
                    parent_folder_id: parentFolderId,
                    path: path,
                    depth: depth
                };

                // Solo asignar id_proyecto si la carpeta no es "proyectos"
                if (folderName !== 'proyectos') {
                    folderData.id_proyecto = projectId;
                    folderData.usuario_id= usuarioId;
                }

                folder = await sequelize.models.Folder.create(folderData);
                console.log(`Carpeta creada: ${folderName}`);
            }

            // Actualizar parentFolderId y lastFolderId para la siguiente iteración
            parentFolderId = folder.id_folder;
            lastFolderId = folder.id_folder;
            depth += 1;
        }

        // Retornar el ID de la última carpeta creada o encontrada
        return lastFolderId;
    }










    async uploadDocumentToFolder(file, folderId) {
        if (!file) {
            throw new CustomHttpError(400, 'No se ha proporcionado un archivo');
        }

        if (!folderId) {
            throw new CustomHttpError(400, 'No se ha proporcionado una carpeta');
        }

        const params = {
            Bucket: S3_BUCKET,
            Key: `carpetas/${folderId}/${file.originalname}`,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'public-read' // Opcional: ajusta los permisos según tus necesidades
        };

        console.log(params);

        const command = new PutObjectCommand(params);
        await s3.send(command);

        const s3Location = `https://${params.Bucket}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${params.Key}`;

        console.log(s3Location);

        await sequelize.models.Document.create({
            link: s3Location,
            folderId: folderId
        });

        return true;
    }


    async getDocumentsByProjectId(projectId) {
        if (!projectId) {
            throw new CustomHttpError(400, 'No se ha proporcionado un ID de proyecto');
        }

        const documents = await sequelize.models.Document.findAll({
            where: {
                projectId: projectId
            },
            attributes: [
                'id',
                'link',
                'ruta_s3',
                'filenames',
                'userId',
                'eventId',
                'documentTypeId',
                'organizationId',
                'projectId',
                'folderId',
                'estado',
                'fecha_expiracion',
                'createdAt',
                'updatedAt'
            ],
            include: [
                {
                    model: sequelize.models.DocumentType,
                    as: 'documentType',
                    attributes: ['name']
                }
            ]
        });



        return documents;
    }


    // En tu DocumentRepository
    async updateDocumentFilename(id, updatedData) {
        const t = await sequelize.transaction();
        try {
            const document = await sequelize.models.Document.findOne({
                where: { id },
                transaction: t,
            });

            if (!document) {
                throw new CustomHttpError(404, 'Documento no encontrado');
            }

            document.filenames = updatedData.filenames;
            await document.save({ transaction: t });

            await t.commit();
            return document;
        } catch (error) {
            await t.rollback();
            console.error('Error al actualizar el nombre del documento:', error);
            throw new CustomHttpError(500, 'Error al actualizar el nombre del documento');
        }
    }

// gado



    // const PartidasRepository = require('../repositories/partida.repositoy');
    // const SubpartidaRepository = require('../repositories/subpartida.repository');
    // const TaskRepository = require('../repositories/task.repository');
    // const SubtaskRepository = require('../repositories/subtask.repository');

    async uploadDocumentPartida(files, data) {
        if (!files || files.length === 0) {
            throw new CustomHttpError(400, 'No se ha proporcionado un archivo');
        }

        if (!data) {
            throw new CustomHttpError(400, 'No se ha proporcionado la información necesaria para el documento');
        }

        const { documentType, partidaId, tipo, userId } = data;

        if (!documentType || !partidaId || !tipo || !userId) {
            throw new CustomHttpError(400, 'Faltan parámetros requeridos en dataupload');
        }

        try {
            // Buscar el tipo de documento
            const docType = await sequelize.models.DocumentType.findOne({
                where: { name: documentType }
            });

            if (!docType) {
                throw new CustomHttpError(400, 'Tipo de documento no existe en construapp');
            }

            let entityDB;
            let entityIdField;
            let entityNameField;
            let entityId;
            let parentFolderType;
            let relacion;
            let proyecto;

            switch (documentType) {
                case 'partida':
                    entityDB = await PartidasRepository.getPartidaById(partidaId);
                    entityIdField = 'id_partida';
                    entityNameField = 'nombre_partida';
                    entityId = entityDB.id_partida;
                    parentFolderType = 'partida';
                    relacion = null;
                    proyecto = 'id_proyecto';
                    break;
                case 'subpartida':
                    entityDB = await SubpartidaRepository.getSubpartidaById(partidaId);
                    entityIdField = 'id_subpartida';
                    entityNameField = 'nombre_sub_partida';
                    entityId = entityDB.id_subpartida;
                    parentFolderType = 'subpartida';
                    relacion = 'id_partida';
                    proyecto = 'id_proyecto';
                    break;
                case 'tarea':
                    entityDB = await TaskRepository.getTareaById(partidaId);
                    entityIdField = 'id_tarea';
                    entityNameField = 'nombre';
                    entityId = entityDB.id;
                    parentFolderType = 'tarea';
                    relacion = 'id_subpartida';
                    proyecto = 'id_proyecto';
                    break;
                case 'subtarea':
                    entityDB = await SubtaskRepository.getSubtareaById(partidaId);
                    entityIdField = 'id_subtarea';
                    entityNameField = 'nombre';
                    entityId = entityDB.id_subtask;
                    parentFolderType = 'subtarea';
                    relacion = 'id_task';
                    proyecto = 'projectId';
                    break;
                default:
                    throw new CustomHttpError(400, 'Tipo de documento no válido');
            }

            if (!entityDB) {
                throw new CustomHttpError(404, `${documentType} no encontrada`);
            }


            let existingFolderId = await FolderRepository.checkAndCreateFolderStructure(
                entityDB[proyecto],
                entityDB[entityNameField],
                parentFolderType,
                entityId,
                entityDB[relacion],
                userId
            );





            let existingProyecto = await sequelize.models.Project.findOne({
                where: {
                    id: entityDB[proyecto]
                }
            });

            let existingMina = await sequelize.models.Mine.findOne({
                where: {
                    id: existingProyecto.id_mina
                }
            });

            // Subir cada archivo al S3 y guardar el documento en la base de datos
            for (const file of files) {
                const s3Key = `${entityDB[entityNameField]}/${documentType}/${file.originalname}`;

                const s3Params = {
                    Bucket: S3_BUCKET,
                    Key: s3Key,
                    Body: file.buffer,
                    ContentType: file.mimetype,
                    ACL: 'public-read'
                };

                const command = new PutObjectCommand(s3Params);
                await s3.send(command);

                const s3Location = `https://${s3Params.Bucket}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${s3Params.Key}`;

                const fileExtension = file.originalname.includes('.') ? file.originalname.split('.').pop() : '';

                // Guarda el documento en la base de datos
                await sequelize.models.Document.create({
                    link: s3Location,
                    ruta_s3: s3Key,
                    filenames: file.originalname,
                    userId: userId || null,  // traer del front
                    documentTypeId: docType.id,
                    organizationId: existingMina.id_organizacion || null,
                    folderId: existingFolderId,
                    estado: null,
                    fecha_expiracion: null,
                    filesize: file.size, // Usa el tamaño real del archivo si no se proporciona
                    fileExtension: fileExtension || null, // Usa la extensión real si no se proporciona
                    tipo: tipo, // Asumiendo que hay una columna `tipo` en la tabla Document
                    [entityIdField]: entityId, // Asigna el valor correspondiente al campo de entidad (id_partida, id_subpartida, etc.)
                    projectId: entityDB.id_proyecto,
                    id_mina: existingMina.id
                });
            }

            return true;
        } catch (error) {
            console.error('Error al subir documento:', error);
            throw error;
        }
    }









    async getDocumentByEntityId(entityType, id) {
        let documents;

        switch (entityType) {
            case 'partida':
                documents = await sequelize.models.Document.findAll({
                    where: {
                        id_partida: id,
                        permanentlyDeleted: false
                    },
                    order: [['createdAt', 'DESC']]
                });
                break;
            case 'subpartida':
                documents = await sequelize.models.Document.findAll({
                    where: {
                        id_subpartida: id,
                        permanentlyDeleted: false
                    },
                    order: [['createdAt', 'DESC']]
                });
                break;
            case 'tarea':
                documents = await sequelize.models.Document.findAll({
                    where: {
                        id_tarea: id,
                        permanentlyDeleted: false
                    },
                    order: [['createdAt', 'DESC']]
                });
                break;
            case 'subtarea':
                documents = await sequelize.models.Document.findAll({
                    where: {
                        id_subtarea: id,
                        permanentlyDeleted: false
                    },
                    order: [['createdAt', 'DESC']]
                });
                break;
            default:
                throw new Error('Tipo de entidad no válido');
        }

        return documents;
    }






    // Método para obtener un documento por su ID
    async getDocumentById(id) {
        return await sequelize.models.Document.findByPk(id);
    }

    // Método para actualizar un documento por su ID
    async updateDocument(id, updates) {
        const [affectedRows] = await sequelize.models.Document.update(updates, {
            where: { id },
        });
        return affectedRows > 0; // Retorna true si la actualización fue exitosa
    }

    // Método para marcar un documento como eliminado permanentemente
    async markAsPermanentlyDeleted(id) {
        return await this.updateDocument(id, { permanentlyDeleted: true });
    }

}

module.exports = new DocumentRepository();