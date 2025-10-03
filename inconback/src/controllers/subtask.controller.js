const SubtaskRepository = require('../repositories/subtask.repository');
const { response } = require('../utils/response');

class SubtaskController {

    async createSubtask(req, res, next) {
        try {
            const newsubtask = req.body;
            const subpartidaCreated = await SubtaskRepository.createSubtask(newsubtask);
            res.status(201).send(response(201, 'Sub tarea creada correctamente', subpartidaCreated));
        } catch (error) {
            return next(error);
        }
    }

    async getSubtasks(req, res, next) {
        try {
            const subtasks = await SubtaskRepository.getSubtasks();
            res.status(200).send(response(200, 'Subtareas encontradas', subtasks));
        } catch (error) {
            return next(error);
        }
    }

    async getSubtaskById(req, res, next) {
        try {
            const { id } = req.params;
            const subtask = await SubtaskRepository.getSubtaskById(id);
            res.status(200).send(response(200, 'Subtarea encontrada', subtask));
        } catch (error) {
            return next(error);
        }
    }

    async recalculateSumSubtask(req, res, next) {
        try {
            const { id } = req.params;
            const subtask = await SubtaskRepository.recalculateSubtask(id);
            res.status(200).send(response(200, 'Subtarea recalculada', subtask));
        } catch (error) {
            return next(error);
        }
    }

    async updatedsubtarea(req, res, next) {
        try {
            const id = req.params.id;
            const updatedsubtarea = req.body;

            const actualizarsubtareas = await SubtaskRepository.updatedsubtarea(id, updatedsubtarea);
            res.status(201).send(response(201, 'subtarea actualizada correctamente', actualizarsubtareas));
        } catch (error) {
            console.log(error);
            return next(error);
        }
    }

    async updatedsubtareanewpartida(req, res, next) {
        try {
            const id = req.params.id;
            const updatedsubtarea = req.body;

            const actualizarsubtareas = await SubtaskRepository.updatedsubtareanewpartiad(id, updatedsubtarea);
            res.status(201).send(response(201, 'subtarea actualizada correctamente', actualizarsubtareas));
        } catch (error) {
            console.log(error);
            return next(error);
        }
    }

    async getproyectoBysubtask(req, res, next) {
        try {
            const { id } = req.params;
            const subtask = await SubtaskRepository.getproyectoBysubtask(id);
            res.status(200).send(response(200, 'Proyecto encontrado', subtask));
        } catch (error) {
            return next(error);
        }
    }

    async getlisthistory(req, res, next) {
        try {
          const subtaskConHistoricos = await SubtaskRepository.getlisthistory();
          const listmap = subtaskConHistoricos.map(subtask => subtask.historicos).flat();

          res.json(listmap);
        } catch (error) {
          console.error('Error en getlisthistory:', error);
          res.status(500).json({ message: 'Error al obtener los datos' });
        }
      }
}

module.exports = new SubtaskController();