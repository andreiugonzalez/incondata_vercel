const CommentRepository = require("../repositories/comment.repository");
const { response } = require("../utils/response");

class CommentController {
  async getComments(req, res, next) {
    try {
      const comments = await CommentRepository.getComments();
      res.status(200).send(response(200, "Comentarios encontrados", comments));
    } catch (error) {
      return next(error);
    }
  }

  async getCommentById(req, res, next) {
    try {
      const { id } = req.params;
      const comment = await CommentRepository.getCommentById(id);
      if (!comment) {
        return res.status(404).send(response(404, "Comentario no encontrado"));
      }
      res.status(200).send(response(200, "Comentario encontrado", comment));
    } catch (error) {
      return next(error);
    }
  }

  async createComment(req, res, next) {
    try {
      const newComment = req.body;
      //console.log("req.body:", req.body);
      //console.log("req.file:", req.file);

      // Si hay archivo adjunto, agrega la URL al comentario
      if (req.file) {
        // Puedes personalizar la URL según tu servidor o almacenamiento
        newComment.fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
        newComment.fileOriginalName = req.file.originalname;
      }
      //console.log("Datos para crear comentario:", newComment);
      const createdComment = await CommentRepository.createComment(newComment);
      res
        .status(201)
        .send(response(201, "Comentario creado correctamente", createdComment));
    } catch (error) {
      return next(error);
    }
  }
  async createCommentsubpartida(req, res, next) {
    try {
      console.log("=== createCommentsubpartida ===");
      console.log("req.body:", req.body);
      console.log("req.file:", req.file);
      
      const newComment = req.body;
      
      // Validar que los campos requeridos estén presentes
      if (!newComment.id_usuario) {
        console.error("Error: id_usuario es requerido para crear un comentario de subpartida");
        return res.status(400).send(response(400, "id_usuario es requerido para crear un comentario de subpartida"));
      }
      
      if (!newComment.id) {
        console.error("Error: id (id_subpartida) es requerido para crear un comentario de subpartida");
        return res.status(400).send(response(400, "id (id_subpartida) es requerido para crear un comentario de subpartida"));
      }
      
      // Si hay archivo adjunto, agrega la URL al comentario
      if (req.file) {
        try {
          newComment.fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
          newComment.fileOriginalName = req.file.originalname;
          console.log("Archivo adjunto URL:", newComment.fileUrl);
          console.log("Archivo adjunto nombre original:", newComment.fileOriginalName);
        } catch (fileError) {
          console.error("Error al procesar el archivo adjunto:", fileError);
          // Continuar sin archivo si hay un error al procesarlo
        }
      }
      
      console.log("Datos para crear comentario de subpartida:", newComment);
      
      try {
        const createdComment = await CommentRepository.createCommentsubpartida(newComment);
        console.log("Comentario de subpartida creado:", createdComment);
        
        res.status(201).send(response(201, "Comentario creado correctamente", createdComment));
      } catch (error) {
        console.error("Error específico al crear comentario de subpartida:", error);
        return res.status(500).send(response(500, `Error al crear comentario de subpartida: ${error.message}`));
      }
    } catch (error) {
      console.error("Error general en createCommentsubpartida:", error);
      return next(error);
    }
  }
  async createCommentarea(req, res, next) {
    try {
      console.log("=== createCommentarea ===");
      console.log("req.body:", req.body);
      console.log("req.file:", req.file);
      
      const newComment = req.body;
      if (req.file) {
        newComment.fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
        newComment.fileOriginalName = req.file.originalname;
        console.log("Archivo adjunto URL:", newComment.fileUrl);
      }
      
      console.log("Datos para crear comentario de tarea:", newComment);
      const createdComment =
        await CommentRepository.createCommentarea(newComment);
      console.log("Comentario de tarea creado:", createdComment);
      
      res
        .status(201)
        .send(response(201, "Comentario creado correctamente", createdComment));
    } catch (error) {
      console.error("Error en createCommentarea:", error);
      return next(error);
    }
  }

  async createCommentSubtarea(req, res, next) {
    try {
      console.log("=== createCommentSubtarea ===");
      console.log("req.body:", req.body);
      console.log("req.file:", req.file);
      
      const newComment = req.body;
      if (req.file) {
        newComment.fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
        newComment.fileOriginalName = req.file.originalname;
        console.log("Archivo adjunto URL:", newComment.fileUrl);
      }
      
      console.log("Datos para crear comentario de subtarea:", newComment);
      const createdComment =
        await CommentRepository.createCommentSubtarea(newComment);
      console.log("Comentario de subtarea creado:", createdComment);
      
      res
        .status(201)
        .send(response(201, "Comentario creado correctamente", createdComment));
    } catch (error) {
      console.error("Error en createCommentSubtarea:", error);
      return next(error);
    }
  }

  /**
   * Actualiza un comentario de cualquier tipo (partida, subpartida, tarea, subtarea).
   * El tipo se pasa por query param: ?tipo=partida|subpartida|tarea|subtarea
   */
  async updateComment(req, res, next) {
    try {
      const { id } = req.params;
      const tipo = req.query.tipo;
      if (!tipo) {
        return res
          .status(400)
          .send(response(400, "El parametro 'tipo' es requerido en la query."));
      }
      const allowedFields = ["detalle", "fileUrl", "fileOriginalName"];
      const cleanData = {};
      for (const key of allowedFields) {
        if (req.body[key] !== undefined) {
          cleanData[key] = req.body[key];
        }
      }
      if (req.file) {
        cleanData.fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
        cleanData.fileOriginalName = req.file.originalname;
      }
      const updatedComment = await CommentRepository.updateComment(
        id,
        cleanData,
        tipo,
      );
      res
        .status(200)
        .send(
          response(200, "Comentario actualizado correctamente", updatedComment),
        );
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Elimina un comentario de cualquier tipo (partida, subpartida, tarea, subtarea).
   * El tipo se pasa por query param: ?tipo=partida|subpartida|tarea|subtarea
   */
  async deleteComment(req, res, next) {
    try {
      const { id } = req.params;
      const tipo = req.query.tipo;

      if (!tipo) {
        return res
          .status(400)
          .send(
            response(
              400,
              "El parametro 'tipo' es requerido en la query para eliminar.",
            ),
          );
      }

      await CommentRepository.deleteComment(id, tipo);
      res.status(200).send(response(200, "Comentario eliminado correctamente"));
    } catch (error) {
      return next(error);
    }
  }

  async getcomentariospartida(req, res, next) {
    try {
      const { id } = req.params;
      const comentarios = await CommentRepository.getcomentariospartida(id);
      // Normaliza fileUrl a absoluta si es relativa
      if (Array.isArray(comentarios)) {
        comentarios.forEach((comment) => {
          if (comment.fileUrl && !comment.fileUrl.startsWith("http")) {
            comment.fileUrl = `${req.protocol}://${req.get("host")}${comment.fileUrl}`;
          }
        });
      }
      if (!comentarios) {
        return res.status(404).send(response(404, "Comentario no encontrado"));
      }
      res.status(200).send(response(200, "Comentario encontrado", comentarios));
    } catch (error) {
      return next(error);
    }
  }

  async getcomentariosubpartida(req, res, next) {
    try {
      const { id } = req.params;
      const comentarios = await CommentRepository.getcomentariosubpartida(id);
      if (Array.isArray(comentarios)) {
        comentarios.forEach((comment) => {
          if (comment.fileUrl && !comment.fileUrl.startsWith("http")) {
            comment.fileUrl = `${req.protocol}://${req.get("host")}${comment.fileUrl}`;
          }
        });
      }
      if (!comentarios) {
        return res.status(404).send(response(404, "Comentario no encontrado"));
      }
      res.status(200).send(response(200, "Comentario encontrado", comentarios));
    } catch (error) {
      return next(error);
    }
  }
  async getcomentariostarea(req, res, next) {
    try {
      const { id } = req.params;
      const comentarios = await CommentRepository.getcomentariostarea(id);
      if (Array.isArray(comentarios)) {
        comentarios.forEach((comment) => {
          if (comment.fileUrl && !comment.fileUrl.startsWith("http")) {
            comment.fileUrl = `${req.protocol}://${req.get("host")}${comment.fileUrl}`;
          }
        });
      }
      if (!comentarios) {
        return res.status(404).send(response(404, "Comentario no encontrado"));
      }
      res.status(200).send(response(200, "Comentario encontrado", comentarios));
    } catch (error) {
      return next(error);
    }
  }

  async getcomentariosubtarea(req, res, next) {
    try {
      const { id } = req.params;
      const comentarios = await CommentRepository.getcomentariosubtarea(id);

      if (Array.isArray(comentarios)) {
        comentarios.forEach((comment) => {
          if (comment.fileUrl && !comment.fileUrl.startsWith("http")) {
            comment.fileUrl = `${req.protocol}://${req.get("host")}${comment.fileUrl}`;
          }
        });
      }

      if (!comentarios || comentarios.length === 0) {
        // Si no se encontraron comentarios, devolvemos un estado 200 y un mensaje indicando que no hay comentarios.
        return res
          .status(200)
          .send(response(200, "No se encontraron comentarios", []));
      }

      // Si se encontraron comentarios, devolvemos el estado 200 con los comentarios.
      return res
        .status(200)
        .send(response(200, "Comentarios encontrados", comentarios));
    } catch (error) {
      return next(error);
    }
  }
}

const commentController = new CommentController();
module.exports = commentController;
