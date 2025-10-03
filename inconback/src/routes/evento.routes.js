const express = require('express');
const EventoController = require('../controllers/evento.controller');
const { authenticateMiddleware } = require('../middlewares/authentication.middleware');

const multer = require('multer');
const path = require('path');

// Configuración personalizada de multer para guardar archivos con su extensión original y un timestamp (igual que comments)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Mantiene la extensión original y agrega timestamp para evitar duplicados
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    cb(null, `${base}-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage }); // Usar la misma configuración que comments

class EventosRoutes {
    constructor() {
        this.router = express.Router();


        this.router.post('/create-evento', authenticateMiddleware(['admin', 'prevencionista']), EventoController.createEvento);
        this.router.get('/evento/:id', authenticateMiddleware(['admin', 'prevencionista']), EventoController.getEvento);
        this.router.put('/evento/:id', authenticateMiddleware(['admin', 'prevencionista']), EventoController.updateEvento);
        this.router.delete('/evento/:id', authenticateMiddleware(['admin', 'prevencionista']), EventoController.deleteEvento);
        this.router.get('/eventos', authenticateMiddleware(['admin', 'prevencionista']), EventoController.getAllEventos);

        this.router.get('/EventosByProject/:projectId', authenticateMiddleware(['admin', 'prevencionista', 'superintendente', 'ITO', 'contratista', 'supervisor']), EventoController.getEventosByProject);


        // Rutas para manejar archivos
        this.router.post('/archivos', authenticateMiddleware(['admin', 'prevencionista']), upload.array('files'), EventoController.uploadFiles);

        this.router.get('/eventos/:eventId/archivos', authenticateMiddleware(['admin', 'prevencionista', 'superintendente', 'ITO', 'contratista', 'supervisor']), EventoController.getFilesByEvent);

        // Ruta para eliminar múltiples archivos
        this.router.delete('/archivos', authenticateMiddleware(['admin', 'prevencionista']), EventoController.deleteFiles);

        // Rutas para Tipo_capacitacion y Tipo_evento
        this.router.get('/tipo_capacitacion', authenticateMiddleware(['admin', 'superintendente', 'prevencionista', 'ITO', 'contratista', 'supervisor']), EventoController.getTipoCapacitaciones);
        this.router.get('/tipo_accidente', authenticateMiddleware(['admin', 'superintendente', 'prevencionista', 'ITO', 'contratista', 'supervisor']), EventoController.getTipoAccidente);
        this.router.get('/tipo_evento', authenticateMiddleware(['admin', 'superintendente', 'prevencionista', 'ITO', 'contratista', 'supervisor']), EventoController.getTipoEventos);



        this.router.get('/EventosByProjectGrafico/:projectId', authenticateMiddleware(['admin', 'prevencionista']), EventoController.getEventosByProjectGrafico);

        // Nueva ruta para crear notas de trabajo con soporte para archivos adjuntos
        this.router.post('/eventonotas/:id', authenticateMiddleware(['admin', 'prevencionista']), upload.single('file'), EventoController.createNotaTrabajo);

        // Nueva ruta para obtener las notas de trabajo por ID de evento
        this.router.get('/notasbysevento/:id', authenticateMiddleware(['admin', 'prevencionista']), EventoController.getNotasByEventoId);

        // Nueva ruta para eliminar notas de trabajo (eliminación lógica)
        this.router.delete('/notastrabajo/:id', authenticateMiddleware(['admin', 'prevencionista']), EventoController.deleteNotaTrabajo);

    }

    getRouter() {
        return this.router;
    }
}

module.exports = new EventosRoutes();