const express = require("express");
const router = express.Router();
const MessageController = require("../controllers/message.controller");
const multer = require("multer");
const path = require("path");

// Configuración mejorada de multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    // Genera un nombre único pero preserva la extensión
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, uniqueSuffix + extension);
  },
});

const upload = multer({ storage: storage });

// Enviar mensaje
router.post("/", upload.single("attachment"), MessageController.sendMessage);

// Bandeja de entrada
router.get("/inbox/:userId", MessageController.inbox);

// Bandeja de enviados
router.get("/sent/:userId", MessageController.sent);

// Marcar como leído
router.patch("/:id/read", MessageController.markAsRead);

// Obtener mensaje por ID
router.get("/:id", MessageController.getById);

module.exports = router;
