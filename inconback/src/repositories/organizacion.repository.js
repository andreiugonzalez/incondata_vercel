const { sequelize } = require('../config/sequelize-config');
const { CustomHttpError } = require('../errors/customError');
const bcrypt = require('bcryptjs');
const UserRepository = require('./user.repository');


class OrganizacionRepository {
    async getOrganizaciones() {

        const organizaciones = await sequelize.models.Organizacion.findAll({
            attributes: ['id','nombre', 'direccion', 'telefono', 'email', 'sitio_web', 'descripcion', 'rut', 'representante_legal'],
            include: [{
                association: 'documents',
                attributes: ['link'],
                include: [{
                    association: 'documentType',
                    attributes: ['name'],
                    where: { name: 'Foto de perfil organización'}
                }]
            }]
        });

        if (organizaciones.length === 0) {
            throw new CustomHttpError(404, 'No se encontraron organizaciones');
        }

        organizaciones.forEach(organizacion => {
            organizacion.dataValues.label = organizacion.dataValues.nombre;
            organizacion.dataValues.value = organizacion.dataValues.nombre;
            organizacion.dataValues.name = 'organizacion'
        });

        return organizaciones;
    }

    async getOrganizacionById(id) {

        // console.log("id encontrado es :",id);
        const organizacion = await sequelize.models.Organizacion.findOne({
            where: { id },
            include: [
                {
                    model: sequelize.models.Document,
                    as: 'documents',
                    attributes: [
                        'id',
                        'filenames',
                        'fecha_expiracion',
                        'estado',
                        [
                            sequelize.literal(`CASE WHEN "documents->documentType"."name" = 'Foto de perfil organización' THEN "documents"."link" ELSE NULL END`),
                            'link'
                        ]
                    ], // Condicional para incluir 'link' solo en la foto de perfil
                    include: [
                        {
                            model: sequelize.models.DocumentType,
                            as: 'documentType',
                            attributes: ['id', 'name']
                        }
                    ]
                }
            ]
        });
    
        if (!organizacion) {
            throw new CustomHttpError(404, 'Organización no encontrada');
        }
    
        return organizacion;
    }
    
    


    async createOrganizacion(nuevaOrganizacion) {
        const { nombre, direccion, telefono, rut, id_codtelefono, representante_legal, id_comuna, rut_representante_legal, id_tipoempresa, email, sitio_web, descripcion } = nuevaOrganizacion;

        try {
            const organizacionCreada = await sequelize.models.Organizacion.create({
                nombre,
                direccion,
                telefono,
                id_codtelefono,
                rut,
                representante_legal,
                rut_representante_legal,
                id_comuna,
                id_tipoempresa,
                email,
                sitio_web,
                descripcion
            });
    
            return organizacionCreada;
    
        } catch (error) {
            console.error('Error al crear la organización:', error);
            throw new Error('No se pudo crear la organización, por favor intente nuevamente.');
        }
    }
    
    

    async updateOrganizacion(id, datosActualizados) {
        console.log("Datos recibidos para actualizar:", { id, datosActualizados }); // Imprimir datos recibidos
    
        const [count, updatedRows] = await sequelize.models.Organizacion.update(datosActualizados, {
            where: { id },
            returning: true
        });
    
        // Verificar si se afectaron filas
        if (count === 0) {
            throw new CustomHttpError(404, 'Organización no encontrada');
        }
    
        // console.log("Datos actualizados en la base de datos:", updatedRows[0].dataValues); // Imprimir datos actualizados
    
        // Obtener y retornar la organización actualizada con todos los datos necesarios
        const organizacionActualizada = await this.getOrganizacionById(id);
        return organizacionActualizada;
    }
    
    

    async deleteOrganizacion(id) {
        const rowsAffected = await sequelize.models.Organizacion.destroy({
            where: { id }
        });
        if (rowsAffected === 0) {
            throw new CustomHttpError(404, 'Organización no encontrada');
        }
    }

    /**
     * Elimina una organización y maneja dependencias relacionadas de forma segura.
     * - Elimina usuarios asociados vía UserRepository.deleteUser
     * - Elimina documentos con `organizationId`
     * - Desasocia materiales e históricos (setea `id_organizacion` a null)
     * - Elimina vínculos en `Proyectoproveedor`
     * - Desasocia minas (setea `id_organizacion` a null)
     */
    async deleteOrganizacionDeep(id) {
        let t;
        try {
            // Verificar existencia de organización
            const org = await sequelize.models.Organizacion.findByPk(id);
            if (!org) {
                throw new CustomHttpError(404, 'Organización no encontrada');
            }

            // 1) Eliminar usuarios asociados utilizando el repositorio existente
            const users = await sequelize.models.User.findAll({ where: { organizacionid: id }, attributes: ['id'] });
            for (const u of users) {
                // Usa el método robusto de borrado de usuario (maneja sus propias transacciones)
                await UserRepository.deleteUser(u.id);
            }

            // Iniciar transacción para el resto de operaciones de limpieza
            t = await sequelize.transaction();

            // 2) Eliminar documentos vinculados a la organización
            await sequelize.models.Document.destroy({ where: { organizationId: id }, transaction: t });

            // 3) Eliminar materiales e históricos de materiales vinculados a la organización
            // Evita violaciones notNull en columnas con allowNull: false
            if (sequelize.models.Material) {
                await sequelize.models.Material.destroy({
                    where: { id_organizacion: id },
                    transaction: t
                });
            }
            if (sequelize.models.HistoricoMaterial) {
                await sequelize.models.HistoricoMaterial.destroy({
                    where: { id_organizacion: id },
                    transaction: t
                });
            }

            // 4) Eliminar relaciones de proveedor en proyectos
            if (sequelize.models.Proyectoproveedor) {
                await sequelize.models.Proyectoproveedor.destroy({
                    where: { id_organizacion: id },
                    transaction: t
                });
            }

            // 5) Eliminar minas asociadas a la organización para evitar notNull en id_organizacion
            if (sequelize.models.Mine) {
                // Antes de eliminar minas, eliminar proyectos vinculados si existe relación id_mina
                if (sequelize.models.Project) {
                    // Eliminar relaciones en user_project si existe la tabla intermedia
                    if (sequelize.models.user_project) {
                        const minas = await sequelize.models.Mine.findAll({
                            where: { id_organizacion: id },
                            attributes: ['id'],
                            transaction: t
                        });
                        const minaIds = minas.map(m => m.id);
                        if (minaIds.length > 0) {
                            await sequelize.models.user_project.destroy({
                                where: { projectId: minaIds },
                                transaction: t
                            });
                        }
                    }

                    // Eliminar proyectos que referencian a las minas por id_mina
                    const minas = await sequelize.models.Mine.findAll({
                        where: { id_organizacion: id },
                        attributes: ['id'],
                        transaction: t
                    });
                    const minaIds = minas.map(m => m.id);
                    if (minaIds.length > 0) {
                        await sequelize.models.Project.destroy({
                            where: { id_mina: minaIds },
                            transaction: t
                        });
                    }
                }

                // Finalmente eliminar las minas asociadas
                await sequelize.models.Mine.destroy({
                    where: { id_organizacion: id },
                    transaction: t
                });
            }

            // 6) Finalmente eliminar la organización
            const rowsAffected = await sequelize.models.Organizacion.destroy({
                where: { id },
                transaction: t
            });

            if (rowsAffected === 0) {
                throw new CustomHttpError(404, 'Organización no encontrada');
            }

            await t.commit();
        } catch (error) {
            if (t) await t.rollback();
            throw error;
        }
    }

    async getOrganizacionByName(id) {
        const organizacion = await sequelize.models.Organizacion.findOne({
          where: { id: id }
        });

        if(!organizacion) {
            throw new CustomHttpError(404, 'Organización no encontrada');
        }

        return organizacion;
      }



      async getOrganizacionByUserEmail(userEmail) {
        try {
          // Realiza la consulta a la base de datos para encontrar la organización asociada al correo electrónico del usuario
          const user = await sequelize.models.User.findOne({
            where: { email: userEmail },
            include: [{ model: sequelize.models.Organizacion, as: 'organizacion' }]
          });

          // Si el usuario no está asociado a ninguna organización, devuelve un mensaje
          if (!user || !user.organizacion) {
            return 'El usuario no está asociado a ninguna organización';
          }

          // Devuelve la organización asociada al usuario
          return user.organizacion;
        } catch (error) {
          throw new Error('Error al buscar la organización por correo electrónico del usuario');
        }
      }








}



module.exports = new OrganizacionRepository();
