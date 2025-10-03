const express = require("express");
const subtaskController = require("../controllers/subtask.controller");


class SubtasksRoutes {
    constructor() {
        this.router = express.Router();
        this.router.post("/subtask", subtaskController.createSubtask);
        this.router.get("/subtasks", subtaskController.getSubtasks);
        this.router.get("/subtask/:id", subtaskController.getSubtaskById);
        this.router.put("/subtask/upt/:id", subtaskController.recalculateSumSubtask);

        //Endpoint actualizar subtarea
        this.router.put("/subtarea/:id", subtaskController.updatedsubtarea);
        //para newpartida
        this.router.put("/subtarea/newpartida/:id", subtaskController.updatedsubtareanewpartida);

        //Endpoint traer proyecto desde subtask
        this.router.get("/subtarea/proyecto/:id", subtaskController.getproyectoBysubtask);

        //get subtarea con historico
        this.router.get("/subtarea/history", subtaskController.getlisthistory);
    }

    getRouter() {
        return this.router;
    }
}



module.exports = new SubtasksRoutes();
