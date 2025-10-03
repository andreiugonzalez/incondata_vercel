const CommentRepository = require("../repositories/comment.repository");

/**
 * Middleware para permitir solo a admins o al creador del comentario
 * editar o eliminar el comentario.
 *
 * Requiere que req.user tenga { id, role }.
 *
 * Uso:
 * router.put("/comments/:id", canModifyComment, controller.updateComment)
 * router.delete("/comments/:id", canModifyComment, controller.deleteComment)
 */
async function canModifyComment(req, res, next) {
  try {
    const { id } = req.params;
    const tipo = req.query.tipo || "partida";
    const userId = req.user?.id;
    const userRole = req.user?.rol;

    if (!userId || !userRole) {
      return res.status(401).json({ 
        error: "No autenticado",
        timestamp: new Date().toISOString()
       });
    }

    let comment;
    switch (tipo) {
      case "subpartida":
        comment = await CommentRepository.getCommentSubpartidaById(id);
        break;
      case "tarea":
        comment = await CommentRepository.getCommentTareaById(id);
        break;
      case "subtarea":
        comment = await CommentRepository.getCommentSubtareaById(id);
        break;
      default:
        comment = await CommentRepository.getCommentById(id);
    }

    if (!comment) {
      return res.status(404).json({ 
        error: "Comentario no encontrado",
        timestamp: new Date().toISOString()
      });
    }

    // Permite si es admin (en array) o el creador
    if (
      (Array.isArray(userRole) && userRole.includes("admin")) ||
      String(comment.userId) === String(userId)
    ) {
      return next();
    }

    return res.status(403).json({ 
        error: "No tienes permisos para modificar este comentario",
        timestamp: new Date().toISOString()
      });
  } catch (error) {
    return res.status(500).json({ 
        error: "Error de inesperado: ", 
        timestamp: new Date().toISOString(),
        details: error.message 
      });
  }
}

module.exports = canModifyComment;
