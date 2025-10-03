const express = require("express");
const subpartidaController = require("../controllers/subpartida.controller");


class SubpartidaRoutes {
    constructor() {
        this.router = express.Router();
        this.router.post("/subpartida", subpartidaController.createPartida);
        this.router.put("/subpartida/:id", subpartidaController.updatesubPartida);
        //para newpartida
        this.router.put("/subpartida/newpartida/:id", subpartidaController.updatesubPartidanewpartida);

         //get subpartida con historico
         this.router.get("/subpartida/historylist", subpartidaController.getlisthistory);

    }

    getRouter() {
        return this.router;
    }
}



module.exports = new SubpartidaRoutes();
