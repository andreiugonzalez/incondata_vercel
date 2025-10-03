const express = require("express");
const PartidasController = require("../controllers/partidas.controller");
const partidasController = require("../controllers/partidas.controller");


class PartidasRoutes {
    constructor() {
        this.router = express.Router();
        this.router.post("/partida", PartidasController.createPartida);
        this.router.post("/partidas", PartidasController.createPartida);
        this.router.get("/partidas/:id_proyecto", PartidasController.getPartidaByProject);

        
        this.router.get("/partidas/std/:id_proyecto", PartidasController.getPartidaByProjectStd);

        
        this.router.get("/partidasHistorico/std/:id_proyecto/:datesearch", PartidasController.getPartidaByProjectStdHistorico);

        

        this.router.put("/partida/:id", PartidasController.updatePartida);
        //para el newpartida
        this.router.put("/partida/newpartida/:id", PartidasController.updatePartidanewpartida);
        this.router.get("/nivelbyid/:type/:realId", PartidasController.getnivel );

        //crear endpoint estado de partida
        this.router.get("/estadotarea", PartidasController.getEstadopartida);
        //crear endpoint prioridad
        this.router.get("/prioridadtarea", partidasController.getprioridad);

        //insert de partida historica
        this.router.post("/partida/history", PartidasController.createPartidahistory);


            //insert de partida historica espero ID y NIVEL
            this.router.post("/partida/history_todas", PartidasController.createPartidahistory_todas);

            //get partida con historico
            this.router.get("/partida/historylist/:id", PartidasController.getlisthistory);



              // Endpoints para probar las tablas históricas
        this.router.get("/historico_partida", PartidasController.getHistoricoPartida);
        this.router.get("/historico_subpartida", PartidasController.getHistoricoSubpartida);
        this.router.get("/historico_task", PartidasController.getHistoricoTask);
        this.router.get("/historico_subtask", PartidasController.getHistoricoSubtask);

        // Ruta para eliminar elementos del proyecto (partidas, subpartidas, tareas, subtareas)
        this.router.delete("/delete/:type/:id", PartidasController.deleteItem);
    }

    getRouter() {
        return this.router;
    }
}



module.exports = new PartidasRoutes();
