const PartidasRepository = require('../repositories/partida.repositoy');
const { response } = require('../utils/response');
const { sequelize } = require('../config/sequelize-config');

class PartidasController {

    async createPartida(req, res, next) {
        try {
            const newPartida = req.body;
            console.log(newPartida);
            const partidaCreated = await PartidasRepository.createPartida(newPartida);
            res.status(201).send(response(201, 'Partida creada correctamente', partidaCreated));
        } catch (error) {
            console.log(error);
            return next(error);
        }
    }

    //aca el insert a historico
    async createPartidahistory(req, res, next) {
        try {
            const newPartida = req.body;
            console.log(newPartida);
            const partidainsert = await PartidasRepository.createPartidahistory(newPartida);
            res.status(201).send(response(201, 'Partida insertada correctamente', partidainsert));
        } catch (error) {
            console.log(error);
            return next(error);
        }
    }




    async createPartidahistory_todas(req, res, next) {
        try {
            const { newPartida, projectId } = req.body;
            console.log("Controller back received", newPartida);
            console.log("controller back id de proyecto", projectId);

            // Consultar en la tabla Historico_partida solo si el id_partida está presente
            if (!newPartida.id_partida) {
                return res.status(400).send({ status: 400, message: 'ID de partida no proporcionado' });
            }

            const partidahistorico = await PartidasRepository.findPartidahistorico(newPartida.id_partida);
            if (!partidahistorico) {
                return res.status(404).send({ status: 404, message: 'Partida historico no encontrada' });
            }

            const historicoPartida = await PartidasRepository.upsertPartidahistorico(partidahistorico.dataValues, projectId);

            const subpartidasData = await Promise.all((newPartida.subpartidas || []).map(async (subpartida) => {
                if (!subpartida.id_subpartida) {
                    return { id_subpartida: null, notFound: true, tareas: [] };
                }

                const subpartidaHistorico = await PartidasRepository.findSubpartidahistorico(subpartida.id_subpartida);
                if (!subpartidaHistorico) {
                    return { id_subpartida: subpartida.id_subpartida, notFound: true, tareas: [] };
                }

                const historicoSubpartida = await PartidasRepository.upsertSubpartidahistorico(subpartidaHistorico.dataValues);

                const tareasData = await Promise.all((subpartida.tareas || []).map(async (tarea) => {
                    if (!tarea.id_tarea) {
                        return { id_tarea: null, notFound: true, subtareas: [] };
                    }

                    const tareaHistorico = await PartidasRepository.findTareahistorico(tarea.id_tarea);
                    if (!tareaHistorico) {
                        return { id_tarea: tarea.id_tarea, notFound: true, subtareas: [] };
                    }

                    const historicoTarea = await PartidasRepository.upsertTareahistorico(tareaHistorico.dataValues);

                    const subtareasData = await Promise.all((tarea.id_subtarea || []).map(async (subtareaId) => {
                        if (!subtareaId) {
                            return { id_subtarea: null, notFound: true };
                        }

                        const subtareaHistorico = await PartidasRepository.findSubtareahistorico(subtareaId);
                        if (!subtareaHistorico) {
                            return { id_subtarea: subtareaId, notFound: true };
                        }

                        const historicoSubtarea = await PartidasRepository.upsertSubtareahistorico(subtareaHistorico.dataValues);
                        return historicoSubtarea;
                    }));

                    return { ...historicoTarea.dataValues, subtareas: subtareasData };
                }));

                return { ...historicoSubpartida.dataValues, tareas: tareasData };
            }));

            const result = { ...historicoPartida.dataValues, subpartidas: subpartidasData };
            res.status(200).send({ status: 200, message: 'Partida historico creada', data: result });
        } catch (error) {
            console.log(error);
            return next(error);
        }
    }








    async getPartidaByProject(req, res, next) {

        try {
            const { id_proyecto } = req.params;
            const partidas = await PartidasRepository.getPartidasByProject(id_proyecto);
            res.status(200).send(response(200, 'Partidas encontradas', partidas));
        } catch (error) {
            return next(error);
        }
    }

    async getPartidaByProjectStd(req, res, next) {
        try {
            const { id_proyecto } = req.params;
            const partidas = await PartidasRepository.getPartidasByProjectStd(id_proyecto);
            res.status(200).send(partidas);
        } catch (error) {
            return next(error);
        }
    }


    async getPartidaByProjectStdHistorico(req, res, next) {
        try {
            const { id_proyecto ,datesearch } = req.params;

            console.log(datesearch);
            const partidas = await PartidasRepository.getPartidasByProjectStdHistorico(id_proyecto ,datesearch);
            res.status(200).send(partidas);
        } catch (error) {
            return next(error);
        }
    }

    async updatePartida(req, res, next) {
        try {
            const id = req.params.id;
            const updatedPartida = req.body;

            const actualizarpartidas = await PartidasRepository.updatePartida(id, updatedPartida);
            res.status(201).send(response(201, 'Partida actualizada correctamente', actualizarpartidas));
        } catch (error) {
            console.log(error);
            return next(error);
        }
    }
    //new partida
    async updatePartidanewpartida(req, res, next) {
        try {
            const id = req.params.id;
            const updatedPartida = req.body;

            const actualizarpartidas = await PartidasRepository.updatePartidanewpartida(id, updatedPartida);
            res.status(201).send(response(201, 'Partida actualizada correctamente', actualizarpartidas));
        } catch (error) {
            console.log(error);
            return next(error);
        }
    }

    async getnivel(req, res, next) {
        try {
            const { type, realId } = req.params;
            const listnivel = await PartidasRepository.getnivelbytipo(type, realId);
            res.status(200).send(listnivel);
        } catch (error) {
            return next(error);
        }
    }

    async getEstadopartida(req, res, next){
        try{
            const estadopartida = await PartidasRepository.getEstadopartida();
            const estadomap = estadopartida.map(estado => ({
                id_estado: estado.id_EstadoTarea,
                nombre_estado: estado.NombreEstadoTarea
              }));
              res.json(estadomap);
        } catch (error) {
            console.error('Error en getEstadopartida:', error);
            res.status(500).json({ message: 'Error al obtener los estados de tareas' });
        }
    }

    async getprioridad(req, res, next){
        try{
            const prioridad = await PartidasRepository.getprioridad();
            const prioridadmap = prioridad.map(prioridad => ({
                id_prioridad: prioridad.id_prioridad,
                nombre_prioridad: prioridad.nombre_prioridad
              }));
              res.json(prioridadmap);
        } catch (error) {
            console.error('Error en getprioridad:', error);
            res.status(500).json({ message: 'Error al obtener los estados de tareas' });
        }
    }

    async getlisthistory(req, res, next) {
        try {
          const { id } = req.params;
          console.log(`Dashboard de horas: Iniciando consulta para proyecto ${id}`);
          
          // Obtener datos directamente de las tablas principales donde se guardan los valores de HH y HM
          const allData = [];
          
          // 1. Obtener partidas con horas > 0 (versión simplificada para debug)
          const partidas = await sequelize.models.Partida.findAll({
            attributes: ['id_partida', 'horas_hombre', 'horas_maquina', 'createdAt', 'updatedAt', 'nombre_partida'],
            where: {
              id_proyecto: id
            }
          });

          console.log(`Partidas encontradas: ${partidas.length}`);
          partidas.forEach(partida => {
            console.log(`Partida ${partida.id_partida}: HH=${partida.horas_hombre}, HM=${partida.horas_maquina}`);
            
            // Incluir todas las partidas del proyecto, no solo las con horas > 0
            allData.push({
              horas_hombre: partida.horas_hombre || 0,
              horas_maquina: partida.horas_maquina || 0,
              createdAt: partida.updatedAt || partida.createdAt,
              type: 'partida',
              id_partida: partida.id_partida,
              nombre: partida.nombre_partida
            });
          });

          // 2. Obtener subpartidas del proyecto
          const subpartidas = await sequelize.models.Subpartida.findAll({
            attributes: ['id_subpartida', 'horas_hombre', 'horas_maquina', 'createdAt', 'updatedAt', 'nombre_sub_partida'],
            include: [{
              model: sequelize.models.Partida,
              as: 'partida_subpartida',
              attributes: ['id_proyecto'],
              where: { id_proyecto: id }
            }]
          });

          console.log(`Subpartidas encontradas: ${subpartidas.length}`);
          subpartidas.forEach(subpartida => {
            console.log(`Subpartida ${subpartida.id_subpartida}: HH=${subpartida.horas_hombre}, HM=${subpartida.horas_maquina}`);
            
            allData.push({
              horas_hombre: subpartida.horas_hombre || 0,
              horas_maquina: subpartida.horas_maquina || 0,
              createdAt: subpartida.updatedAt || subpartida.createdAt,
              type: 'subpartida',
              id_subpartida: subpartida.id_subpartida,
              nombre: subpartida.nombre_sub_partida
            });
          });

          // 3. Obtener tareas del proyecto
          const tareas = await sequelize.models.Task.findAll({
            attributes: ['id', 'horas_hombre', 'horas_maquina', 'createdAt', 'updatedAt', 'nombre'],
            include: [{
              model: sequelize.models.Subpartida,
              as: 'tarea_subpartida',
              attributes: ['id_partida'],
              include: [{
                model: sequelize.models.Partida,
                as: 'partida_subpartida',
                attributes: ['id_proyecto'],
                where: { id_proyecto: id }
              }]
            }]
          });

          console.log(`Tareas encontradas: ${tareas.length}`);
          tareas.forEach(tarea => {
            console.log(`Tarea ${tarea.id}: HH=${tarea.horas_hombre}, HM=${tarea.horas_maquina}`);
            
            allData.push({
              horas_hombre: tarea.horas_hombre || 0,
              horas_maquina: tarea.horas_maquina || 0,
              createdAt: tarea.updatedAt || tarea.createdAt,
              type: 'tarea',
              id_tarea: tarea.id,
              nombre: tarea.nombre
            });
          });

          // 4. Obtener subtareas del proyecto
          const subtareas = await sequelize.models.Subtask.findAll({
            attributes: ['id_subtask', 'horas_hombre', 'horas_maquina', 'createdAt', 'updatedAt', 'nombre'],
            include: [{
              model: sequelize.models.Task,
              as: 'Subtask_Task',
              attributes: ['id_subpartida'],
              include: [{
                model: sequelize.models.Subpartida,
                as: 'tarea_subpartida',
                attributes: ['id_partida'],
                include: [{
                  model: sequelize.models.Partida,
                  as: 'partida_subpartida',
                  attributes: ['id_proyecto'],
                  where: { id_proyecto: id }
                }]
              }]
            }]
          });

          console.log(`Subtareas encontradas: ${subtareas.length}`);
          subtareas.forEach(subtarea => {
            console.log(`Subtarea ${subtarea.id_subtask}: HH=${subtarea.horas_hombre}, HM=${subtarea.horas_maquina}`);
            
            allData.push({
              horas_hombre: subtarea.horas_hombre || 0,
              horas_maquina: subtarea.horas_maquina || 0,
              createdAt: subtarea.updatedAt || subtarea.createdAt,
              type: 'subtarea',
              id_subtarea: subtarea.id_subtask,
              nombre: subtarea.nombre
            });
          });

          console.log(`Dashboard de horas: Devolviendo ${allData.length} registros desde tablas principales para proyecto ${id}`);
          console.log('Datos completos:', JSON.stringify(allData, null, 2));
          
          res.json(allData);
        } catch (error) {
          console.error('Error en getlisthistory:', error);
          res.status(500).json({ message: 'Error al obtener los datos', error: error.message });
        }
      }








  // Controlador para `Historico_partida`
  async getHistoricoPartida(req, res, next) {
    try {
      const partidas = await PartidasRepository.getHistoricoPartida();
      res.status(200).send(partidas);
    } catch (error) {
      return next(error);
    }
  }

  // Controlador para `Historico_subpartida`
  async getHistoricoSubpartida(req, res, next) {
    try {
      const subpartidas = await PartidasRepository.getHistoricoSubpartida();
      res.status(200).send(subpartidas);
    } catch (error) {
      return next(error);
    }
  }

  // Controlador para `Historico_task`
  async getHistoricoTask(req, res, next) {
    try {
      const tasks = await PartidasRepository.getHistoricoTask();
      res.status(200).send(tasks);
    } catch (error) {
      return next(error);
    }
  }

  // Controlador para `Historico_subtask`
  async getHistoricoSubtask(req, res, next) {
    try {
      const subtasks = await PartidasRepository.getHistoricoSubtask();
      res.status(200).send(subtasks);
    } catch (error) {
      return next(error);
    }
  }

  // Nuevos métodos de eliminación
  async deleteItem(req, res, next) {
    try {
      const { type, id } = req.params;
      console.log(`Solicitud de eliminación recibida - Tipo: ${type}, ID: ${id}`);
      
      // Validar el tipo de elemento
      const validTypes = ['partida', 'subpartida', 'tarea', 'subtarea'];
      if (!validTypes.includes(type)) {
        console.log(`Tipo no válido: ${type}`);
        return res.status(400).send({ status: 400, message: `Tipo no válido: ${type}. Debe ser uno de: ${validTypes.join(', ')}` });
      }

      // Validar que el ID es un número
      const numericId = Number(id);
      if (isNaN(numericId)) {
        console.log(`ID no válido: ${id}`);
        return res.status(400).send({ status: 400, message: `ID no válido: ${id}. Debe ser un número.` });
      }

      // Intentar buscar el elemento antes de eliminarlo para verificar que existe
      let elementoExistente = false;
      try {
        switch (type) {
          case 'partida':
            const partida = await sequelize.models.Partida.findByPk(id);
            elementoExistente = !!partida;
            console.log(`Verificación de existencia - Partida ${id}: ${elementoExistente ? 'Existe' : 'No existe'}`);
            break;
          case 'subpartida':
            const subpartida = await sequelize.models.Subpartida.findByPk(id);
            elementoExistente = !!subpartida;
            console.log(`Verificación de existencia - Subpartida ${id}: ${elementoExistente ? 'Existe' : 'No existe'}`);
            break;
          case 'tarea':
            const tarea = await sequelize.models.Task.findByPk(id);
            elementoExistente = !!tarea;
            console.log(`Verificación de existencia - Tarea ${id}: ${elementoExistente ? 'Existe' : 'No existe'}`);
            break;
          case 'subtarea':
            const subtarea = await sequelize.models.Subtask.findByPk(id);
            elementoExistente = !!subtarea;
            console.log(`Verificación de existencia - Subtarea ${id}: ${elementoExistente ? 'Existe' : 'No existe'}`);
            break;
        }
      } catch (error) {
        console.error(`Error al verificar existencia de ${type} con ID ${id}:`, error);
      }

      if (!elementoExistente) {
        console.log(`El elemento de tipo ${type} con ID ${id} no existe en la base de datos`);
        return res.status(200).send({ 
          status: 200, 
          message: `El elemento de tipo ${type} con ID ${id} ya no existe o fue eliminado previamente`, 
          alreadyDeleted: true 
        });
      }

      let result;
      try {
        console.log(`Eliminando ${type} con ID: ${id}`);
        switch (type) {
          case 'partida':
            result = await PartidasRepository.deletePartida(id);
            break;
          case 'subpartida':
            result = await PartidasRepository.deleteSubpartida(id);
            break;
          case 'tarea':
            result = await PartidasRepository.deleteTarea(id);
            break;
          case 'subtarea':
            result = await PartidasRepository.deleteSubtarea(id);
            break;
        }

        console.log(`Eliminación exitosa - Tipo: ${type}, ID: ${id}, Resultado:`, result);
        return res.status(200).send({ 
          status: 200, 
          message: `${type} eliminada con éxito`, 
          data: result 
        });
      } catch (error) {
        // Verificar si el error es porque el elemento no existe
        if (error.message && error.message.includes("No se encontró")) {
          console.log(`El elemento de tipo ${type} con ID ${id} ya no existe o fue eliminado previamente`);
          // Devolver un mensaje claro al cliente
          return res.status(200).send({ 
            status: 200, 
            message: `El elemento de tipo ${type} con ID ${id} ya no existe o fue eliminado previamente`, 
            alreadyDeleted: true 
          });
        } else {
          // Si es otro tipo de error, registrarlo y propagarlo
          console.error(`Error al eliminar ${type} con ID ${id}:`, error);
          throw error;
        }
      }
    } catch (error) {
      console.error(`Error al eliminar ${req.params.type} con ID ${req.params.id}:`, error);
      return res.status(500).send({ 
        status: 500, 
        message: `Error al eliminar: ${error.message || 'Error desconocido'}` 
      });
    }
  }

}

module.exports = new PartidasController();