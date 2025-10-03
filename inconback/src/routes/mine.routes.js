const express = require('express');
const Minecontroller = require('../controllers/mine.controller');
const { authenticateMiddleware } = require('../middlewares/authentication.middleware');

class MineRoutes {
    constructor() {
        this.router = express.Router();
        this.router.get('/mine', Minecontroller.getMines);
        this.router.post('/loginmine', Minecontroller.loginmine);
        this.router.post('/registermine', Minecontroller.registermine);

        //conseguir mina por id
        this.router.get('/mina/update/:id', Minecontroller.getMinaByIdupdate);

        //Actualizar mina
        this.router.put('/minabyid/:id', Minecontroller.updateMinaById);

        //Eliminar mina
        this.router.delete('/minabyid/:id', Minecontroller.deleteMinaById);
    }

    getRouter() {
        return this.router;
    }
}

const mineRoutes = new MineRoutes();
module.exports = mineRoutes;