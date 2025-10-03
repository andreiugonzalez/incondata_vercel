const { DATEONLY } = require("sequelize");

const { sequelize } = require("../config/sequelize-config"); // DATEONLY no se usa, se puede quitar si no se usa en otro lado.
const { CustomHttpError } = require("../errors/customError");

class CommentRepository {
  // --- HELPER METHOD ---
  _getModelForType(tipo) {
    // Corregido el typo: _getModelForType
    const normalizedTipo = String(tipo).toLowerCase();
    let model;
    switch (normalizedTipo) {
      case "partida":
        model = sequelize.models.Comment;
        break;
      case "subpartida":
        model = sequelize.models.Comment_subpartida;
        break;
      case "tarea":
        model = sequelize.models.Comment_tarea;
        break;
      case "subtarea":
        model = sequelize.models.Comment_subtarea;
        break;
      default:
        // Lanzar un error que el controlador pueda manejar apropiadamente
        throw new CustomHttpError(
          400,
          `Tipo de comentario no válido o no soportado: ${tipo}`,
        );
    }
    if (!model) {
      // Esto podría pasar si el modelo no está registrado correctamente en Sequelize
      // o si el nombre en sequelize.models no coincide.
      throw new Error(
        `Modelo Sequelize no encontrado para el tipo: ${tipo} (normalizado: ${normalizedTipo})`,
      );
    }
    return model;
  }

  // --- CRUD METHODS ---

  async getComments() {
    // Asume que esto es para un tipo genérico o 'Comment' por defecto
    try {
      // Si 'paranoid: true' está en Comment.model.js, esto ya filtra los soft-deleted.
      const comments = await sequelize.models.Comment.findAll();
      // El chequeo de comments.length === 0 está bien, pero considera si realmente es un error 404
      // o si un array vacío es una respuesta válida (depende de los requisitos de tu API).
      // Por ahora, lo dejamos como está.
      if (comments.length === 0) {
        // Podrías devolver un array vacío y que el servicio/controlador decida si es un 404.
        // throw new CustomHttpError(404, "No se encontraron comentarios");
        return []; // Devolver array vacío es a menudo preferible a un 404 si la consulta es válida pero no hay datos.
      }
      return comments;
    } catch (error) {
      if (error instanceof CustomHttpError) throw error;
      console.error("Error en CommentRepository.getComments:", error);
      throw new Error("Error al obtener los comentarios");
    }
  }

  async getCommentById(id) {
    // Asume que es para el modelo 'Comment'
    try {
      // Si 'paranoid: true' está en Comment.model.js, findOne también filtra.
      const comment = await sequelize.models.Comment.findOne({ where: { id } });
      if (!comment) {
        throw new CustomHttpError(404, "Comentario no encontrado");
      }
      return comment;
    } catch (error) {
      if (error instanceof CustomHttpError) throw error;
      console.error("Error en CommentRepository.getCommentById:", error);
      throw new Error("Error al obtener el comentario por ID");
    }
  }

  // ... (getCommentSubpartidaById, getCommentTareaById, getCommentSubtareaById sin cambios,
  //      ya que 'paranoid: true' en sus respectivos modelos se encargará del filtrado) ...

  async getCommentSubpartidaById(id) {
    try {
      const comment = await sequelize.models.Comment_subpartida.findOne({
        where: { id },
      });
      if (!comment) {
        throw new CustomHttpError(
          404,
          "Comentario de subpartida no encontrado",
        );
      }
      return comment;
    } catch (error) {
      if (error instanceof CustomHttpError) throw error;
      console.error(
        "Error en CommentRepository.getCommentSubpartidaById:",
        error,
      );
      throw new Error("Error al obtener el comentario de subpartida por ID");
    }
  }

  async getCommentTareaById(id) {
    try {
      const comment = await sequelize.models.Comment_tarea.findOne({
        where: { id },
      });
      if (!comment) {
        throw new CustomHttpError(404, "Comentario de tarea no encontrado");
      }
      return comment;
    } catch (error) {
      if (error instanceof CustomHttpError) throw error;
      console.error("Error en CommentRepository.getCommentTareaById:", error);
      throw new Error("Error al obtener el comentario de tarea por ID");
    }
  }

  async getCommentSubtareaById(id) {
    try {
      const comment = await sequelize.models.Comment_subtarea.findOne({
        where: { id },
      });
      if (!comment) {
        throw new CustomHttpError(404, "Comentario de subtarea no encontrado");
      }
      return comment;
    } catch (error) {
      if (error instanceof CustomHttpError) throw error;
      console.error(
        "Error en CommentRepository.getCommentSubtareaById:",
        error,
      );
      throw new Error("Error al obtener el comentario de subtarea por ID");
    }
  }

  // --- Métodos Create (sin cambios necesarios para paranoid, pero revisa 'fecha' vs 'createdAt') ---
  // Si 'timestamps: true' está en tus modelos, Sequelize maneja 'createdAt' y 'updatedAt'.
  // Si tu campo 'fecha' es redundante con 'createdAt', podrías considerar eliminarlo
  // y dejar que Sequelize maneje el timestamp de creación. Si 'fecha' tiene un propósito diferente, está bien.

  async createComment(newComment) {
    try {
      // const currentDate = new Date(); // No es necesario si usas timestamps de Sequelize para createdAt
      const commentToCreate = {
        userId: newComment.id_usuario,
        id_partida: newComment.id,
        detalle: newComment.text,
        fecha: newComment.fecha || new Date(), // Considera usar createdAt de Sequelize
        fileUrl: newComment.fileUrl, // Se asignará solo si existe en newComment
        fileOriginalName: newComment.fileOriginalName, // Se asignará solo si existe
      };

      // Limpiar campos undefined para evitar enviarlos a .create si no existen
      if (!commentToCreate.fileUrl) delete commentToCreate.fileUrl;
      if (!commentToCreate.fileOriginalName)
        delete commentToCreate.fileOriginalName;
      if (newComment.fecha) commentToCreate.fecha = newComment.fecha; // Si aún usas 'fecha' y viene del input

      const createdComment =
        await sequelize.models.Comment.create(commentToCreate);
      return createdComment.toJSON(); // .toJSON() es bueno para obtener el objeto plano
    } catch (error) {
      console.error("Error en CommentRepository.createComment:", error);
      throw new Error("Error al crear el comentario de partida");
    }
  }

  async createCommentsubpartida(newComment) {
    try {
      
      // Validar que los campos requeridos estén presentes
      if (!newComment.id_usuario) {
        throw new Error("id_usuario es requerido para crear un comentario de subpartida");
      }
      
      if (!newComment.id) {
        throw new Error("id (id_subpartida) es requerido para crear un comentario de subpartida");
      }
      
      // Crear el objeto de comentario con los campos necesarios
      const commentToCreate = {
        userId: newComment.id_usuario,
        id_subpartida: newComment.id,
        detalle: newComment.text,
        fileUrl: newComment.fileUrl,
        fileOriginalName: newComment.fileOriginalName,
      };
      if (newComment.fecha) commentToCreate.fecha = newComment.fecha;
      if (!commentToCreate.fileUrl) delete commentToCreate.fileUrl;
      if (!commentToCreate.fileOriginalName)
        delete commentToCreate.fileOriginalName;

      const createdComment =
        await sequelize.models.Comment_subpartida.create(commentToCreate);
      return createdComment.toJSON();
    } catch (error) {
      console.error("Error en CommentRepository.createCommentsubpartida:", error);
      throw error; // Propagar el error original para tener más detalles
    }
  }

  async createCommentarea(newComment) {
    // Asumo que es createCommentTarea
    try {
      const commentToCreate = {
        userId: newComment.id_usuario,
        id_task: newComment.id, // Asegúrate que el campo en DB sea id_task
        detalle: newComment.text,
        fileUrl: newComment.fileUrl,
        fileOriginalName: newComment.fileOriginalName,
      };
      
      if (!commentToCreate.fileUrl) delete commentToCreate.fileUrl;
      if (!commentToCreate.fileOriginalName)
        delete commentToCreate.fileOriginalName;
      if (newComment.fecha) commentToCreate.fecha = newComment.fecha;

      const createdComment =
        await sequelize.models.Comment_tarea.create(commentToCreate);
      return createdComment.toJSON();
    } catch (error) {
      console.error("Error en CommentRepository.createCommentarea:", error);
      throw new Error("Error al crear el comentario de tarea");
    }
  }

  async createCommentSubtarea(newComment) {
    try {
      const commentToCreate = {
        userId: newComment.id_usuario,
        id_subtask: newComment.id, // Asegúrate que el campo en DB sea id_subtask
        detalle: newComment.text,
        fileUrl: newComment.fileUrl,
        fileOriginalName: newComment.fileOriginalName,
      };
      
      if (!commentToCreate.fileUrl) delete commentToCreate.fileUrl;
      if (!commentToCreate.fileOriginalName)
        delete commentToCreate.fileOriginalName;

      if (newComment.fecha) commentToCreate.fecha = newComment.fecha;
      const createdComment =
        await sequelize.models.Comment_subtarea.create(commentToCreate);
      return createdComment.toJSON();
    } catch (error) {
      console.error("Error en CommentRepository.createCommentSubtarea:", error);
      throw new Error("Error al crear el comentario de subtarea");
    }
  }

  // --- Métodos Update y Delete usando el Helper ---
  async updateComment(id, cleanData, tipo = "partida") {
    try {
      const model = this._getModelForType(tipo); // Usar el helper
      // El 'cleanData' ya debería venir filtrado desde el controlador
      // para solo incluir campos permitidos y no incluir 'deletedAt' para esta operación.
      const [rowsAffected] = await model.update(cleanData, {
        where: { id },
        // returning: true, // 'returning' es específico de algunos dialectos (ej. Postgres)
        // y no siempre devuelve lo esperado o puede no ser necesario.
        // Para obtener el objeto actualizado, es más seguro hacer un findOne después.
      });

      if (rowsAffected === 0) {
        throw new CustomHttpError(
          404,
          "Comentario no encontrado para actualizar (o ya estaba eliminado)",
        );
      }

      // Obtener y devolver el comentario actualizado
      // Con paranoid:true, findOne también respeta el filtro de deletedAt,
      // por lo que si actualizaste un comentario no eliminado, lo encontrarás.
      const updatedComment = await model.findOne({ where: { id } });
      if (!updatedComment) {
        // Esto sería inesperado si rowsAffected > 0, pero es una doble verificación.
        throw new CustomHttpError(
          404,
          "Comentario actualizado pero no se pudo recuperar",
        );
      }
      return updatedComment.toJSON();
    } catch (error) {
      if (error instanceof CustomHttpError) throw error;
      console.error("Error en CommentRepository.updateComment:", error);
      throw new Error(`Error al actualizar el comentario de tipo ${tipo}`);
    }
  }

  async deleteComment(id, tipo = "partida") {
    // Esta función ahora hace SOFT DELETE
    try {
      const model = this._getModelForType(tipo); // Usar el helper

      // model.destroy() con 'paranoid: true' en el modelo, establece 'deletedAt'
      const rowsAffected = await model.destroy({
        where: { id },
      });

      if (rowsAffected === 0) {
        // No se encontró el comentario (o ya estaba soft-deleted y destroy no lo afecta de nuevo a menos que uses force:true)
        throw new CustomHttpError(
          404,
          "Comentario no encontrado para eliminar",
        );
      }
      // No es necesario devolver nada, el controlador enviará un 200 OK.
      // O puedes devolver { success: true } si el controlador lo espera.
      return { message: "Comentario marcado como eliminado." }; // Opcional
    } catch (error) {
      if (error instanceof CustomHttpError) throw error;
      console.error("Error en CommentRepository.deleteComment:", error);
      throw new Error(`Error al eliminar el comentario de tipo ${tipo}`);
    }
  }

  // --- Métodos de Lectura Específicos (getcomentariospartida, etc.) ---
  // Estos ya deberían funcionar correctamente con 'paranoid: true' en los modelos
  // Comment, Comment_subpartida, etc., ya que los findAll internos filtrarán.

  async getcomentariospartida(id) {
    try {
      // Asumo que Partida no tiene soft delete, o si lo tiene, se maneja en su propio modelo/repo.
      const partidas = await sequelize.models.Partida.findAll({
        where: { id_proyecto: id },
      });

      if (partidas.length === 0) {
        // Considera devolver [] en lugar de lanzar 404 si es una búsqueda válida sin resultados.
        return []; // O throw new CustomHttpError(404, "Partidas no encontradas para el proyecto");
      }

      const idPartidas = partidas.map((partida) => partida.id_partida);

      // sequelize.models.Comment.findAll aquí ya filtrará los comentarios con deletedAt != NULL
      // si Comment.model.js tiene paranoid:true
      const comentarios = await sequelize.models.Comment.findAll({
        where: { id_partida: idPartidas },
        include: [
          {
            model: sequelize.models.User, // Asegúrate que el modelo User esté correctamente importado/asociado
            as: "user_Comment",
            attributes: ["names", "apellido_p", "apellido_m"],
          },
        ],
        order: [["createdAt", "DESC"]], // Ejemplo: ordenar por fecha de creación descendente
      });
      return comentarios;
    } catch (error) {
      if (error instanceof CustomHttpError) throw error;
      console.error("Error en CommentRepository.getcomentariospartida:", error);
      throw new Error("Error al obtener los comentarios de partida");
    }
  }

  async getcomentariosubpartida(id) {
    try {
      const comentarios = await sequelize.models.Comment_subpartida.findAll({
        where: { id_subpartida: id },
        include: [
          {
            model: sequelize.models.User,
            as: "user_Comment_subpartida",
            attributes: ["names", "apellido_p", "apellido_m"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });
      return comentarios;
    } catch (error) {
      console.error(
        "Error en CommentRepository.getcomentariosubpartida:",
        error,
      );
      throw new Error("Error al obtener los comentarios de subpartida");
    }
  }

  async getcomentariostarea(id) {
    try {
      const comentarios = await sequelize.models.Comment_tarea.findAll({
        where: { id_task: id },
        include: [
          {
            model: sequelize.models.User,
            as: "user_Comment_tarea",
            attributes: ["names", "apellido_p", "apellido_m"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });
      return comentarios;
    } catch (error) {
      console.error(
        "Error en CommentRepository.getcomentariostarea:",
        error,
      );
      throw new Error("Error al obtener los comentarios de tarea");
    }
  }

  async getcomentariosubtarea(id) {
    try {
      const comentarios = await sequelize.models.Comment_subtarea.findAll({
        where: { id_subtask: id },
        include: [
          {
            model: sequelize.models.User,
            as: "user_Comment_subtarea",
            attributes: ["names", "apellido_p", "apellido_m"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });
      return comentarios;
    } catch (error) {
      console.error(
        "Error en CommentRepository.getcomentariosubtarea:",
        error,
      );
      throw new Error("Error al obtener los comentarios de subtarea");
    }
  }

  // --- (Opcional) Método Restore ---
  async restoreComment(id, tipo = "partida") {
    try {
      const model = this._getModelForType(tipo);
      const rowsAffected = await model.restore({ where: { id } });
      if (rowsAffected === 0) {
        throw new CustomHttpError(
          404,
          "Comentario no encontrado para restaurar (o no estaba eliminado)",
        );
      }
      // Opcional: devolver el comentario restaurado
      const restoredComment = await model.findByPk(id); // findByPk es bueno para buscar por PK
      return restoredComment.toJSON();
    } catch (error) {
      if (error instanceof CustomHttpError) throw error;
      console.error("Error en CommentRepository.restoreComment:", error);
      throw new Error(`Error al restaurar el comentario de tipo ${tipo}`);
    }
  }
}

module.exports = new CommentRepository();
