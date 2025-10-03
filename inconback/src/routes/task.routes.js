const express = require('express');
const TaskController = require('../controllers/task.controller');
const { authenticateMiddleware } = require('../middlewares/authentication.middleware');
const { validateTask } = require('../middlewares/task.middlewares');

class TaskRoutes {
    constructor() {
        this.router = express.Router();

        // Endpoint para obtener todas las tareas
        this.router.get('/tasks', authenticateMiddleware(['admin']), TaskController.getTasks);

        // Endpoint para obtener una tarea por su ID
        this.router.get('/tasks/:id', authenticateMiddleware(['admin']), TaskController.getTaskById);

        // Endpoint para crear una nueva tarea
        this.router.post('/tasks', validateTask, TaskController.createTask);

        // Endpoint para actualizar una tarea existente
        this.router.put('/tasks/:id', authenticateMiddleware(['admin']), validateTask, TaskController.updateTask);

        // Endpoint para eliminar una tarea por su ID
        this.router.delete('/tasks/:id', authenticateMiddleware(['admin']), TaskController.deleteTask);

        //Endpoint actualizar tarea
        this.router.put("/tarea/:id", TaskController.updatedtarea);

        //para newpartida
        this.router.put("/tarea/newpartida/:id", TaskController.updatedtareanewpartida);

         //get tarea con historico
         this.router.get("/task/historylist", TaskController.getlisthistory);
    }

    getRouter() {
        return this.router;
    }
}

const taskRoutes = new TaskRoutes();
module.exports = taskRoutes;
