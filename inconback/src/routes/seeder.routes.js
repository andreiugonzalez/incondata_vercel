const express = require("express");
const SeederController = require("../controllers/seeder.controller");


class SeederRoutes {
    constructor() {
        this.router = express.Router();
        this.router.post("/seeder", SeederController.create);
       
    }

    getRouter() {
        return this.router;
    }
}



module.exports = new SeederRoutes();
