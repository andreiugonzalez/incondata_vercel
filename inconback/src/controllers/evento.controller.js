const EventoRepository = require("../repositories/evento.repository");
const { response } = require("../utils/response");

class EventoController {
  async createEvento(req, res, next) {
    try {
      const {
        resumen,
        fecha_inc,
        notification,
        id_usuario,
        id_tipo_evento,
        id_proyecto,
        id_tipo_capacitacion,
        id_tipo_accidente,
      } = req.body;
      const nuevoEvento = await EventoRepository.createEvento({
        resumen,
        fecha_inc,
        notification,
        id_usuario,
        id_tipo_evento,
        id_proyecto,
        id_tipo_capacitacion,
        id_tipo_accidente,
      });
      res
        .status(201)
        .send(response(201, "Evento creado correctamente", nuevoEvento));
    } catch (error) {
      return next(error);
    }
  }

  async getEvento(req, res, next) {
    try {
      const { id } = req.params;
      const evento = await EventoRepository.findEventoById(id);
      if (!evento) {
        return res.status(404).send(response(404, "Evento no encontrado"));
      }
      res.status(200).send(response(200, "Evento encontrado", evento));
    } catch (error) {
      return next(error);
    }
  }

  async updateEvento(req, res, next) {
    try {
      const { id } = req.params;
      const {
        resumen,
        fecha_inc,
        notification,
        id_usuario,
        id_tipo_evento,
        id_tipo_capacitacion,
      } = req.body;

      const eventoActualizado = await EventoRepository.updateEvento(id, {
        resumen,
        fecha_inc,
        notification,
        id_usuario,
        id_tipo_evento,
        id_tipo_capacitacion,
      });

      if (!eventoActualizado) {
        return res.status(404).send(response(404, "Evento no encontrado"));
      }
      res
        .status(200)
        .send(
          response(200, "Evento actualizado correctamente", eventoActualizado),
        );
    } catch (error) {
      return next(error);
    }
  }

  async deleteEvento(req, res, next) {
    try {
      const { id } = req.params;
      const eventoEliminado = await EventoRepository.deleteEvento(id);
      if (!eventoEliminado) {
        return res.status(404).send(response(404, "Evento no encontrado"));
      }
      res.status(200).send(response(200, "Evento eliminado correctamente"));
    } catch (error) {
      return next(error);
    }
  }

  async getAllEventos(req, res, next) {
    try {
      const eventos = await EventoRepository.getAllEventos();
      res.status(200).send(response(200, "Eventos encontrados", eventos));
    } catch (error) {
      return next(error);
    }
  }

  async getEventosByProject(req, res, next) {
    try {
      const { projectId } = req.params;
      if (!projectId || projectId === "null") {
        return res.status(400).send({ message: "ID de proyecto inválido" });
      }
      const eventos = await EventoRepository.findByProjectId(projectId);

      if (!eventos || eventos.length === 0) {
        return res
          .status(404)
          .send(
            response(404, "No se encontraron eventos para este proyecto", []),
          );
      }
      res.status(200).send(response(200, "Eventos encontrados", eventos));
    } catch (error) {
      return next(error);
    }
  }

  async getEventosByProjectGrafico(req, res, next) {
    try {
      const { projectId } = req.params;
      if (!projectId || projectId === "null") {
        return res.status(400).send({ message: "ID de proyecto inválido" });
      }
      const eventos =
        await EventoRepository.getEventosByProjectGrafico(projectId);

      if (!eventos || eventos.length === 0) {
        return res
          .status(404)
          .send(
            response(404, "No se encontraron eventos para este proyecto", []),
          );
      }
      res.status(200).send(response(200, "Eventos encontrados", eventos));
    } catch (error) {
      return next(error);
    }
  }

  // gestion de archivos bkn !

  async uploadFiles(req, res, next) {
    try {
      const files = req.files;
      const { eventId, projectId, userId } = req.body;

      if (!files || files.length === 0) {
        throw new CustomHttpError(400, "No se han proporcionado archivos");
      }

      const uploadedFiles = await EventoRepository.uploadFiles(
        files,
        eventId,
        projectId,
        userId,
      );
      res
        .status(200)
        .send(response(200, "Archivos subidos correctamente", uploadedFiles));
    } catch (error) {
      console.error("Error al subir archivos:", error);
      return next(error);
    }
  }

  async getFilesByEvent(req, res, next) {
    try {
      const { eventId } = req.params;
      const files = await EventoRepository.getFilesByEvent(eventId);
      res.status(200).send(response(200, "Archivos encontrados", files));
    } catch (error) {
      console.error("Error al obtener archivos:", error);
      return next(error);
    }
  }

  async deleteFiles(req, res, next) {
    try {
      const { files } = req.body;
      if (!files || files.length === 0) {
        throw new CustomHttpError(
          400,
          "No se han proporcionado archivos para eliminar",
        );
      }

      for (let file of files) {
        await EventoRepository.deleteFile(file.fileId, file.filename);
      }

      res
        .status(200)
        .send({ status: 200, message: "Archivos eliminados con éxito" });
    } catch (error) {
      console.error("Error al eliminar archivos:", error);
      return next(error);
    }
  }

  //selects eventos

  async getTipoCapacitaciones(req, res, next) {
    try {
      const tiposCapacitacion = await EventoRepository.getTipoCapacitaciones();
      res.status(200).send({
        statusCode: 200,
        message: "Tipos de capacitación encontrados",
        data: tiposCapacitacion,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTipoAccidente(req, res, next) {
    try {
      const tiposAccidente = await EventoRepository.getTipoAccidente();
      res.status(200).send({
        statusCode: 200,
        message: "Tipos de accidentes encontrados",
        data: tiposAccidente,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTipoEventos(req, res, next) {
    try {
      const tiposEvento = await EventoRepository.getTipoEventos();
      res.status(200).send({
        statusCode: 200,
        message: "Tipos de evento encontrados",
        data: tiposEvento,
      });
    } catch (error) {
      next(error);
    }
  }

  async createNotaTrabajo(req, res, next) {
    try {
      const { id } = req.params; // ID del evento
      const { nota, usuarioId } = req.body; // Obtener usuarioId desde req.body

      // Si hay archivo adjunto, agrega la URL a la nota
      const notaData = {
        eventoId: id,
        usuarioId,
        nota,
      };

      if (req.file) {
        notaData.fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
        notaData.fileOriginalName = req.file.originalname;
      }

      const nuevaNota = await EventoRepository.createNotaTrabajo(notaData);

      res
        .status(201)
        .send(response(201, "Nota de trabajo creada correctamente", nuevaNota));
    } catch (error) {
      return next(error);
    }
  }

  async getNotasByEventoId(req, res, next) {
    try {
      const { id } = req.params; // ID del evento
      const notas = await EventoRepository.getNotasByEventoId(id);

      if (!notas || notas.length === 0) {
        return res
          .status(404)
          .send(response(404, "No se encontraron notas para este evento"));
      }

      res.status(200).send(response(200, "Notas encontradas", notas));
    } catch (error) {
      return next(error);
    }
  }

  async deleteNotaTrabajo(req, res, next) {
    try {
      const { id } = req.params; // ID de la nota de trabajo
      const notaEliminada = await EventoRepository.deleteNotaTrabajo(id);

      if (!notaEliminada) {
        return res.status(404).send(response(404, "Nota de trabajo no encontrada"));
      }

      res
        .status(200)
        .send(response(200, "Nota de trabajo eliminada correctamente"));
    } catch (error) {
      return next(error);
    }
  }
}

const eventoController = new EventoController();
module.exports = eventoController;