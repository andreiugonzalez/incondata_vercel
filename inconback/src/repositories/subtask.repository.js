const { sequelize } = require('../config/sequelize-config');
const { CustomHttpError } = require('../errors/customError');
const FolderRepository = require('../repositories/folder.repository');

class SubtaskRepository {
    async createSubtask(subtask) {
        try {
            const subTaskCreated = await sequelize.models.Subtask.create(subtask);

            const projectId = subTaskCreated.projectId;
            const id_objeto_creado = subTaskCreated.id_subtask;
            const relacion = subTaskCreated.id_task;
            console.log("relacion de subtarea ", relacion);
            const id_user = subTaskCreated.id_usuario;

            try {
                // Verificar o crear la carpeta del proyecto y su estructura
                await FolderRepository.checkAndCreateFolderStructure(
                    projectId, 
                    subtask.nombre, 
                    'subtarea', 
                    id_objeto_creado, 
                    relacion, 
                    id_user
                );
            } catch (folderError) {
                console.error('Error al crear la estructura de carpetas para la subtarea:', folderError);
                // No lanzamos el error para permitir que la subtarea se cree aunque falle la estructura de carpetas
            }

            return subTaskCreated;
        } catch (error) {
            console.error('Error al crear la subtarea:', error);
            throw error;
        }
    }

    async getSubtasks() {
        const subtasks = await sequelize.models.Subtask.findAll({
            include: [{
                association: 'material_Subtask'
            }, {
                association: 'componente_material'
            }]
        });

        return subtasks;
    }

    async getSubtaskById(id) {
        const subtask = await sequelize.models.Subtask.findByPk(id, {
            include: [{
                association: 'material_Subtask',
                include: [{
                    association: 'componente_material'
                }]
            }]
        });
        if (!subtask) {
            throw new CustomHttpError(404, 'Subtarea no encontrada');
        }
        return subtask;
    }

    async recalculateSubtask(id) {
        let subtask = await sequelize.models.Subtask.findByPk(id, {
            include: [{
                association: 'material_Subtask',
                include: [{
                    association: 'componente_material'
                }]
            }]
        });
        if (!subtask) {
            throw new CustomHttpError(404, 'Subtarea no encontrada');
        }

        subtask = this.recalcularSubtask(subtask);

        await subtask.save();

        return subtask;
    }

    recalcularSubtask(subtask) {
        // Inicializar las sumas
        let sumaCantidad = 0;
        let sumaValorUnitario = 0;
        let sumaValorTotal = 0;

        // Iterar sobre cada material en material_Subtask
        subtask.material_Subtask.forEach(material => {
            sumaCantidad += material.cantidad;
            sumaValorUnitario += material.valor_unitario;
            sumaValorTotal += material.valor_total;
        });

        // Actualizar los valores de subtask
        subtask.precio_unit = parseInt(sumaValorUnitario, 10);
        subtask.precio_total = parseInt(sumaValorTotal, 10);

        return subtask;
    }

    async updatedsubtarea(id, subtarea) {

        console.log("subtarea actualizada gado",subtarea );
        // const t = await sequelize.transaction();

        // console.log("subtarea:", subtarea);

        try {
            // let folderUpdated = true;

            // if (subtarea.nombre) {
            //     // Intentamos actualizar las carpetas relacionadas
            //     folderUpdated = await FolderRepository.updateFolderByEntity('subtarea', id, subtarea.nombre);

            //     if (!folderUpdated) {
            //         console.log(`No se actualizó ninguna carpeta para la subtarea ID ${id}. Cancelando la actualización de la subtarea.`);
            //         throw new Error('No se pudo actualizar ninguna carpeta. La actualización de la subtarea ha sido cancelada.');
            //     }

            //     console.log(`Carpetas actualizadas para la subtarea ID ${id} con el nuevo nombre: ${subtarea.nombre}`);
            // }

            // Si la actualización de las carpetas fue exitosa, actualizamos la subtarea
            const updatedRows = await sequelize.models.Subtask.update(subtarea, {
                where: { id_subtask: id }
                // transaction: t
            });

            if (updatedRows[0] === 0) {
                // await t.rollback();
                console.log('Subtarea no encontrada.');
                return false; // No se actualizó ninguna fila
            }

            // await t.commit();
            // console.log('Subtarea actualizada exitosamente.');
            return true; // Se actualizó al menos una fila
        } catch (error) {
            // await t.rollback();
            console.error('Error al actualizar subtarea o carpetas en el repositorio:', error);
            throw error; // Lanzar el error
        }
    }

    async updatedsubtareanewpartiad(id, subtarea) {

        try {
            const updatedRows = await sequelize.models.Subtask.update(subtarea, {
                where: { id_subtask: id }
            });

            if (updatedRows[0] === 0) {
                console.log('Subtarea no encontrada.');
                return false;
            }

            console.log('Subtarea actualizada exitosamente.');
            return true;
        } catch (error) {
            console.error('Error al actualizar subtarea o carpetas en el repositorio:', error);
            throw error;
        }
    }



    async getproyectoBysubtask(id) {
        const subtask = await sequelize.models.Subtask.findByPk(id, {
            where: {id_subtask: id},
            attributes: ['projectId']
        });
        if (!subtask) {
            throw new CustomHttpError(404, 'Subtarea no encontrado proyecto');
        }
        return subtask;
    }

    async getlisthistory() {
        try {

          const subtask = await sequelize.models.Subtask.findAll({
            attributes: ['id_subtask', 'id_EstadoTarea', 'porcentaje', 'fecha_inicio', 'fecha_termino', 'horas_maquina', 'horas_hombre'],
          });

          const subtaskId = subtask.map(subtask => subtask.id_subtask);

          const historicos = await sequelize.models.Historico_subtarea.findAll({
            attributes: ['id_EstadoTarea', 'porcentaje', 'fecha_inicio', 'fecha_termino', 'horas_maquina', 'horas_hombre', 'id_subtask'],
            where: {
                id_subtask: subtaskId
            }
          });

          const subTaskAgrupadas = subtask.map(subtask => ({
            ...subtask.toJSON(),
            historicos: historicos.filter(historico => historico.id_subtask === subtask.id_subtask)
          }));


          return subTaskAgrupadas;
        } catch (error) {
          console.error('Error en getlisthistory:', error);
          throw new Error('Error al obtener los datos de la base de datos');
        }
      }



      async getSubtareaById(subtareaId) {
        try {
            const subtarea = await sequelize.models.Subtask.findOne({
                where: { id_subtask: subtareaId }
            });

            if (!subtarea) {
                throw new Error(`Subtarea con id ${subtareaId} no encontrada`);
            }

            return subtarea;
        } catch (error) {
            console.error('Error al obtener la subtarea por ID:', error);
            throw error;
        }
    }

}

module.exports = new SubtaskRepository();