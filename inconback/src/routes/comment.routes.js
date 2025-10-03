const express = require("express");
const multer = require("multer");
const path = require("path");

// Configuración personalizada de multer para guardar archivos con su extensión original y un timestamp
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    // Mantiene la extensión original y agrega timestamp para evitar duplicados
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    cb(null, `${base}-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage }); // Usar esta configuración en todas las rutas de archivos

const CommentController = require("../controllers/comment.controller");
const {
  authenticateMiddleware,
} = require("../middlewares/authentication.middleware");
const { validateComment } = require("../middlewares/comment.middlewares");
const { validateBody, validateParams } = require("../middlewares/validation.middleware");
const { commentSchemas } = require("../utils/validation-schemas");
const canModifyComment = require("../middlewares/commentAuth.middleware");

class CommentRoutes {
  constructor() {
    this.router = express.Router();

    // Obtener todos los comentarios
    this.router.get(
      "/comments",
      // authenticateMiddleware(["admin"]),
      CommentController.getComments,
    );

    // Obtener un comentario por su ID
    this.router.get(
      "/comments/:id",
      // authenticateMiddleware(["admin"]),
      validateParams(commentSchemas.params),
      CommentController.getCommentById,
    );

    // Crear un nuevo comentario
    this.router.post(
      "/comentario/partida",
      // authenticateMiddleware(["admin"]),
      upload.single("file"),
      validateBody(commentSchemas.create),
      CommentController.createComment,
    );
    // Crear un nuevo comentario
    this.router.post(
      "/comentario/subpartida",
      // authenticateMiddleware(["admin"]),
      upload.single("file"),
      CommentController.createCommentsubpartida,
    );
    // Crear un nuevo comentario en tarea
    this.router.post(
      "/comentario/tarea",
      // authenticateMiddleware(["admin"]),
      upload.single("file"),
      CommentController.createCommentarea,
    );

    // Crear un nuevo comentario
    this.router.post(
      "/comentario/subtarea",
      // authenticateMiddleware(["admin"]),
      upload.single("file"),
      CommentController.createCommentSubtarea,
    );
    // Crear un nuevo comentario
    // this.router.post(
    //   "/comentario/partida",
    //   authenticateMiddleware(["admin"]),
    //   upload.single("file"),
    //   CommentController.createComment,
    // );

    // Actualizar un comentario de cualquier tipo (partida, subpartida, tarea, subtarea) usando query param ?tipo=
    this.router.put(
      "/comments/:id",
      authenticateMiddleware([
        "superadmin",
        "admin",
        "ITO",
        "planner",
        "superintendente",
        "inspector",
      ]),
      canModifyComment,
      upload.single("file"),
      validateComment,
      CommentController.updateComment,
    );

    // Eliminar un comentario de cualquier tipo usando query param ?tipo=
    this.router.delete(
      "/comments/:id",
      authenticateMiddleware([
        "superadmin",
        "admin",
        "ITO",
        "planner",
        "superintendente",
        "inspector",
      ]),
      canModifyComment,
      CommentController.deleteComment,
    );

    //Traer partidas segun id de proyecto y comparar con tabla comentario de partida y traer comentarios.
    this.router.get(
      "/comentarios/partida/:id",
      CommentController.getcomentariospartida,
    );

    //Traer subpartidas segun id de proyecto y comparar con tabla comentario de subpartida y traer comentarios.
    this.router.get(
      "/comentarios/subpartida/:id",
      CommentController.getcomentariosubpartida,
    );

    //Traer tareas segun id de proyecto y comparar con tabla comentario de tarea y traer comentarios.
    this.router.get(
      "/comentarios/tarea/:id",
      CommentController.getcomentariostarea,
    );

    //Traer subtareas segun id de proyecto y comparar con tabla comentario de subtarea y traer comentarios.
    this.router.get(
      "/comentarios/subtarea/:id",
      CommentController.getcomentariosubtarea,
    );
  }

  getRouter() {
    return this.router;
  }
}

const commentRoutes = new CommentRoutes();
module.exports = commentRoutes;
