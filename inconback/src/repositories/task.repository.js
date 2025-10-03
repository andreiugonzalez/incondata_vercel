const { sequelize } = require('../config/sequelize-config');
const { CustomHttpError } = require('../errors/customError');
const FolderRepository = require('../repositories/folder.repository');

class TaskRepository {
  async getTasks() {
    try {
      const tasks = await sequelize.models.Task.findAll();
      if (tasks.length === 0) {
        throw new CustomHttpError(404, 'No se encontraron tareas');
      }
      return tasks;
    } catch (error) {
      throw new Error('Error al obtener las tareas');
    }
  }





  async getTaskById(id) {
    try {
      const task = await sequelize.models.Task.findOne({
        where: { id }
      });
      if (!task) {
        throw new CustomHttpError(404, 'Tarea no encontrada');
      }
      return task;
    } catch (error) {
      throw new Error('Error al obtener la tarea por ID');
    }
  }

  async createTask(newTask) {
    try {
      const createdTask = await sequelize.models.Task.create(newTask);

      const projectId = newTask.id_proyecto;
      const id_objeto_creado = createdTask.id;
      const relacion = createdTask.id_subpartida;
      const id_user = createdTask.id_usuario;

      try {
        // Verificar o crear la carpeta del proyecto y su estructura
        await FolderRepository.checkAndCreateFolderStructure(
          projectId, 
          newTask.nombre, 
          'tarea', 
          id_objeto_creado, 
          relacion, 
          id_user
        );
      } catch (folderError) {
        console.error('Error al crear la estructura de carpetas para la tarea:', folderError);
        // No lanzamos el error para permitir que la tarea se cree aunque falle la estructura de carpetas
      }

      return createdTask;
    } catch (error) {
      console.error('Error al crear la tarea:', error);
      throw error;
    }
  }


// no esta en uso
  async updateTask(id, updatedData) {
    try {
      const [rowsAffected] = await sequelize.models.Task.update(updatedData, {
        where: { id },
        returning: true
      });
      if (rowsAffected === 0) {
        throw new CustomHttpError(404, 'Tarea no encontrada');
      }
      const updatedTask = await this.getTaskById(id);
      return updatedTask;
    } catch (error) {
      throw new Error('Error al actualizar la tarea');
    }
  }

  // no esta en uso



  async deleteTask(id) {
    try {
      const rowsAffected = await sequelize.models.Task.destroy({
        where: { id }
      });
      if (rowsAffected === 0) {
        throw new CustomHttpError(404, 'Tarea no encontrada');
      }
    } catch (error) {
      throw new Error('Error al eliminar la tarea');
    }
  }



  async updatedtarea(id, tarea) {
    console.log("id tarea actualizada :",id)
    console.log("tarea actualizada :",tarea)
    // const t = await sequelize.transaction();

    try {
        // let folderUpdated = true;

        // if (tarea.nombre) {
        //     // Intentamos actualizar las carpetas relacionadas
        //     folderUpdated = await FolderRepository.updateFolderByEntity('tarea', id, tarea.nombre);

        //     if (!folderUpdated) {
        //         console.log(`No se actualizó ninguna carpeta para la tarea ID ${id}. Cancelando la actualización de la tarea.`);
        //         throw new Error('No se pudo actualizar ninguna carpeta. La actualización de la tarea ha sido cancelada.');
        //     }

        //     console.log(`Carpetas actualizadas para la tarea ID ${id} con el nuevo nombre: ${tarea.nombre}`);
        // }

        // Si la actualización de las carpetas fue exitosa, actualizamos la tarea
        const updatedRows = await sequelize.models.Task.update(tarea, {
            where: { id }
            // transaction: t
        });

        if (updatedRows[0] === 0) {
            // await t.rollback();
            console.log('Tarea no encontrada.');
            return false; // No se actualizó ninguna fila
        }

        // await t.commit();
        // console.log('Tarea actualizada exitosamente.');
        return true; // Se actualizó al menos una fila
    } catch (error) {
        // await t.rollback();
        console.error('Error al actualizar tarea o carpetas en el repositorio:', error);
        throw error; // Lanzar el error
    }
}

async updatedtareanewpartida(id, tarea) {

  console.log("tarea, ", tarea);

  try {
      const updatedRows = await sequelize.models.Task.update(tarea, {
          where: { id }
      });

      if (updatedRows[0] === 0) {
          console.log('Tarea no encontrada.');
          return false;
      }

      console.log('Tarea actualizada exitosamente.');
      return true;
  } catch (error) {
      console.error('Error al actualizar tarea o carpetas en el repositorio:', error);
      throw error;
  }
}


async getlisthistory() {
  try {

    const task = await sequelize.models.Task.findAll({
      attributes: ['id', 'id_EstadoTarea', 'porcentaje', 'fecha_inicio', 'fecha_termino', 'horas_maquina', 'horas_hombre'],
    });

    const taskId = task.map(task => task.id);

    const historicos = await sequelize.models.Historico_tarea.findAll({
      attributes: ['id_EstadoTarea', 'porcentaje', 'fecha_inicio', 'fecha_termino', 'horas_maquina', 'horas_hombre', 'id'],
      where: {
        id: taskId
      }
    });

    const TaskAgrupadas = task.map(task => ({
      ...task.toJSON(),
      historicos: historicos.filter(historico => historico.id === task.id)
    }));

    return TaskAgrupadas;
  } catch (error) {
    console.error('Error en getlisthistory:', error);
    throw new Error('Error al obtener los datos de la base de datos');
  }
}

async getTareaById(tareaId) {
  try {
      const tarea = await sequelize.models.Task.findOne({
          where: { id: tareaId }
      });

      if (!tarea) {
          throw new Error(`Tarea con id ${tareaId} no encontrada`);
      }

      return tarea;
  } catch (error) {
      console.error('Error al obtener la tarea por ID:', error);
      throw error;
  }
}




}

module.exports = new TaskRepository();
