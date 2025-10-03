const TaskRepository = require('../repositories/task.repository');
const { response } = require('../utils/response');

class TaskController {
    async getTasks(req, res, next) {
        try {
            const tasks = await TaskRepository.getTasks();
            res.status(200).send(response(200, 'Tareas encontradas', tasks));
        } catch (error) {
            return next(error);
        }
    }

    async getTaskById(req, res, next) {
        try {
            const { id } = req.params;
            const task = await TaskRepository.getTaskById(id);
            if (!task) {
                return res.status(404).send(response(404, 'Tarea no encontrada'));
            }
            res.status(200).send(response(200, 'Tarea encontrada', task));
        } catch (error) {
            return next(error);
        }
    }

    async createTask(req, res, next) {
        try {
            const newTask = req.body;
            const taskCreated = await TaskRepository.createTask(newTask);
            res.status(201).send(response(201, 'Tarea creada correctamente', taskCreated));
        } catch (error) {
            return next(error);
        }
    }

    async updateTask(req, res, next) {
        try {
            const { id } = req.params;
            const updatedData = req.body;
            const updatedTask = await TaskRepository.updateTask(id, updatedData);
            res.status(200).send(response(200, 'Tarea actualizada correctamente', updatedTask));
        } catch (error) {
            return next(error);
        }
    }

    async deleteTask(req, res, next) {
        try {
            const { id } = req.params;
            await TaskRepository.deleteTask(id);
            res.status(200).send(response(200, 'Tarea eliminada correctamente'));
        } catch (error) {
            return next(error);
        }
    }

    async updatedtarea(req, res, next) {
        try {
            const id = req.params.id;
            const updatedtarea = req.body;
            console.log("----------------------------------");
            console.log("datos para actualizar subtarea",id );
            console.log("----------------------------------");
            console.log("datos para actualizar subtarea",updatedtarea );

            const actualizartareas = await TaskRepository.updatedtarea(id, updatedtarea);
            res.status(201).send(response(201, 'Tarea actualizada correctamente', actualizartareas));
        } catch (error) {
            console.log(error);
            return next(error);
        }
    }

    async updatedtareanewpartida(req, res, next) {
        try {
            const id = req.params.id;
            const updatedtarea = req.body;

            const actualizartareas = await TaskRepository.updatedtareanewpartida(id, updatedtarea);
            res.status(201).send(response(201, 'Tarea actualizada correctamente', actualizartareas));
        } catch (error) {
            console.log(error);
            return next(error);
        }
    }

    async getlisthistory(req, res, next) {
        try {
          const taskConHistoricos = await TaskRepository.getlisthistory();
          const listmap = taskConHistoricos.map(task => task.historicos).flat();

          res.json(listmap);
        } catch (error) {
          console.error('Error en getlisthistory:', error);
          res.status(500).json({ message: 'Error al obtener los datos' });
        }
      }
}

const taskController = new TaskController();
module.exports = taskController;
