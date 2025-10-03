const { S3Client } = require("@aws-sdk/client-s3"); // Importa S3Client desde AWS SDK v3
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { sequelize } = require("../config/sequelize-config");
const { CustomHttpError } = require("../errors/customError");
const fs = require("fs");
const mime = require("mime-types");

const S3_BUCKET = process.env.AWS_S3_BUCKET;

const s3 = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

class EventoRepository {
  async createEvento(evento) {
    try {
      const eventoCreated = await sequelize.models.Evento.create(evento);
      console.log(eventoCreated);
      return eventoCreated;
    } catch (error) {
      console.error("Error al crear el evento en el repositorio:", error);
      throw error;
    }
  }

  async findEventoById(id) {
    try {
      const evento = await sequelize.models.Evento.findByPk(id, {
        include: [
          {
            model: sequelize.models.NotaTrabajoEvento,
            as: "evento_notasTrabajo", // Alias correcto para incluir las notas de trabajo del evento
            include: [
              {
                model: sequelize.models.User,
                as: "notasTrabajo_usuario", // Alias correcto para incluir la información del usuario en cada nota
                attributes: ["id", "names", "apellido_p", "apellido_m"], // Incluye solo las columnas necesarias
              },
            ],
          },
        ],
      });

      if (!evento) {
        throw new CustomHttpError(404, "Evento no encontrado");
      }
      return evento;
    } catch (error) {
      console.error("Error al buscar el evento en el repositorio:", error);
      throw error;
    }
  }

  async updateEvento(id, evento) {
    try {
      const updatedRows = await sequelize.models.Evento.update(evento, {
        where: { id_evento: id },
      });

      console.log(`Consulta SQL generada para actualizar evento con id ${id}`);
      console.log("Número de filas actualizadas:", updatedRows);

      return updatedRows[0] > 0; // devuelve true si se actualizaron filas, false en caso contrario
    } catch (error) {
      console.error("Error al actualizar el evento en el repositorio:", error);
      throw error;
    }
  }

  async deleteEvento(id) {
    try {
      const deletedRows = await sequelize.models.Evento.destroy({
        where: { id_evento: id },
      });

      console.log(`Consulta SQL generada para eliminar evento con id ${id}`);
      console.log("Número de filas eliminadas:", deletedRows);

      if (deletedRows === 0) {
        throw new CustomHttpError(404, "Evento no encontrado");
      }

      return deletedRows > 0; // devuelve true si se eliminaron filas, false en caso contrario
    } catch (error) {
      console.error("Error al eliminar el evento en el repositorio:", error);
      throw error;
    }
  }

  async getAllEventos() {
    try {
      const eventos = await sequelize.models.Evento.findAll();

      return eventos;
    } catch (error) {
      console.error("Error al obtener los eventos en el repositorio:", error);
      throw error;
    }
  }

  async findByProjectId(projectId, formatOption = "default") {
    try {
      // Validación para evitar errores con "null" string o valores inválidos
      if (!projectId || projectId === "null") {
        return [];
      }
      const eventos = await sequelize.models.Evento.findAll({
        where: { id_proyecto: projectId },
        include: [
          {
            model: sequelize.models.User,
            as: "evento_usuario",
            attributes: [
              [
                sequelize.fn(
                  "CONCAT",
                  sequelize.col("names"),
                  " ",
                  sequelize.col("apellido_p"),
                  " ",
                  sequelize.col("apellido_m"),
                ),
                "full_name",
              ],
            ],
          },
          {
            model: sequelize.models.Tipo_evento,
            as: "evento_tipo_evento",
            attributes: ["nombre"],
          },
          {
            model: sequelize.models.Tipo_capacitacion,
            as: "evento_Tipo_capacitacion",
            attributes: ["nombre"],
          },
        ],
      });

      // Función para formatear la fecha según la opción seleccionada
      const formatFecha = (fecha, option) => {
        if (!fecha) return "Invalid Date";
        const date = new Date(fecha);
        if (option === "iso") {
          return date.toISOString();
        } else {
          return date.toLocaleString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });
        }
      };

      // Formatear las fechas
      const eventosFormatted = eventos.map((evento) => {
        return {
          ...evento.toJSON(),
          fecha_inc: formatFecha(evento.fecha_inc, formatOption),
          createdAt: formatFecha(evento.createdAt, formatOption),
          updatedAt: formatFecha(evento.updatedAt, formatOption),
        };
      });

      return eventosFormatted;
    } catch (error) {
      console.error("Error fetching events by project ID:", error);
      throw error;
    }
  }

  async getEventosByProjectGrafico(projectId, formatOption = "default") {
    try {
      // Validación para evitar errores con "null" string o valores inválidos
      if (!projectId || projectId === "null") {
        return [];
      }
      const eventos = await sequelize.models.Evento.findAll({
        where: { id_proyecto: projectId },
        include: [
          {
            model: sequelize.models.User,
            as: "evento_usuario",
            attributes: [
              [
                sequelize.fn(
                  "CONCAT",
                  sequelize.col("names"),
                  " ",
                  sequelize.col("apellido_p"),
                  " ",
                  sequelize.col("apellido_m"),
                ),
                "full_name",
              ],
            ],
          },
          {
            model: sequelize.models.Tipo_evento,
            as: "evento_tipo_evento",
            attributes: ["nombre"],
          },
          {
            model: sequelize.models.Tipo_capacitacion,
            as: "evento_Tipo_capacitacion",
            attributes: ["nombre"],
          },
        ],
      });

      // Función para formatear la fecha según la opción seleccionada
      const formatFecha = (fecha, option) => {
        if (!fecha) return "Invalid Date";
        const date = new Date(fecha);
        if (option === "iso") {
          return date.toISOString();
        } else {
          return date.toLocaleString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });
        }
      };

      // Formatear las fechas
      const eventosFormatted = eventos.map((evento) => {
        return {
          ...evento.toJSON(),
          fecha_inc: formatFecha(evento.fecha_inc, formatOption),
          createdAt: formatFecha(evento.createdAt, formatOption),
          updatedAt: formatFecha(evento.updatedAt, formatOption),
        };
      });

      return eventosFormatted;
    } catch (error) {
      console.error("Error fetching events by project ID:", error);
      throw error;
    }
  }

  // archivos eventos

  async uploadFiles(files, eventId, projectId, userId) {
    if (!files || files.length === 0) {
      throw new CustomHttpError(400, "No se han proporcionado archivos");
    }

    if (!eventId || !projectId || !userId) {
      throw new CustomHttpError(400, "Faltan parámetros requeridos");
    }

    const uploadPromises = files.map(async (file) => {
      const fileContent = fs.readFileSync(file.path);
      const params = {
        Bucket: S3_BUCKET,
        Key: `eventos/${eventId}/${file.originalname}`,
        Body: fileContent,
        ContentType: file.mimetype,
        ACL: "public-read",
      };

      const command = new PutObjectCommand(params);
      await s3.send(command);

      const s3Location = `https://${params.Bucket}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${params.Key}`;

      const document = await sequelize.models.Document.create({
        link: s3Location,
        eventId: parseInt(eventId, 10),
        projectId: parseInt(projectId, 10),
        userId: parseInt(userId, 10),
        filenames: file.originalname,
        contentType: file.mimetype,
        size: file.size,
      });

      fs.unlinkSync(file.path);

      return document;
    });

    const uploadedFiles = await Promise.all(uploadPromises);
    return uploadedFiles;
  }

  async getFilesByEvent(eventId) {
    console.log("get event", eventId);
    try {
      const files = await sequelize.models.Document.findAll({
        where: { eventId },
      });
      return files;
    } catch (error) {
      console.error("Error al obtener archivos por evento:", error);
      throw error;
    }
  }

  async deleteFile(fileId, filename) {
    try {
      const file = await sequelize.models.Document.findByPk(fileId);
      if (!file) {
        throw new CustomHttpError(404, "Archivo no encontrado");
      }

      const key = `eventos/${file.eventId}/${filename}`;

      const params = {
        Bucket: S3_BUCKET,
        Key: key,
      };

      await s3.deleteObject(params).promise();
      await file.destroy();

      return true;
    } catch (error) {
      console.error("Error al eliminar archivo:", error);
      throw error;
    }
  }

  async deleteFiles(files) {
    try {
      const deletePromises = files.map(async ({ fileId, filename }) => {
        return this.deleteFile(fileId, filename);
      });

      const results = await Promise.all(deletePromises);
      return results.every((result) => result === true);
    } catch (error) {
      console.error("Error al eliminar archivos:", error);
      throw error;
    }
  }

  async getTipoCapacitaciones() {
    try {
      const tiposEvento = await sequelize.models.Tipo_capacitacion.findAll();
      return tiposEvento;
    } catch (error) {
      console.error(
        "Error al obtener los tipos de evento en el repositorio:",
        error,
      );
      throw error;
    }
  }
  async getTipoAccidente() {
    try {
      const tiposEvento = await sequelize.models.Tipo_accidente.findAll();
      return tiposEvento;
    } catch (error) {
      console.error(
        "Error al obtener los tipos de evento en el repositorio:",
        error,
      );
      throw error;
    }
  }

  async getTipoEventos() {
    try {
      const tiposCapacitacion = await sequelize.models.Tipo_evento.findAll();
      return tiposCapacitacion;
    } catch (error) {
      console.error(
        "Error al obtener los tipos de capacitación en el repositorio:",
        error,
      );
      throw error;
    }
  }

  async createNotaTrabajo({ eventoId, usuarioId, nota, fileUrl, fileOriginalName }) {
    try {
      // Crear la nueva nota con soporte para archivos adjuntos
      const notaData = {
        eventoId,
        usuarioId,
        nota,
      };

      // Agregar datos del archivo si están presentes
      if (fileUrl) notaData.fileUrl = fileUrl;
      if (fileOriginalName) notaData.fileOriginalName = fileOriginalName;

      const nuevaNota = await sequelize.models.NotaTrabajoEvento.create(notaData);

      // Buscar la nota recién creada e incluir la relación con el usuario
      const notaConUsuario = await sequelize.models.NotaTrabajoEvento.findByPk(
        nuevaNota.id,
        {
          include: [
            {
              model: sequelize.models.User,
              as: "notasTrabajo_usuario",
              attributes: ["id", "names", "apellido_p", "apellido_m"],
            },
          ],
        },
      );

      return notaConUsuario;
    } catch (error) {
      throw new Error("Error al crear la nota de trabajo: " + error.message);
    }
  }

  async getNotasByEventoId(eventoId) {
    try {
      const notas = await sequelize.models.NotaTrabajoEvento.findAll({
        where: { eventoId },
        include: [
          {
            model: sequelize.models.User, // Incluye el modelo User
            as: "notasTrabajo_usuario", // Asegúrate de que el alias coincida con el definido en la relación
            attributes: ["id", "names", "apellido_p", "apellido_m"], // Incluye solo las columnas que necesitas
          },
        ],
        order: [["createdAt", "DESC"]], // Ordena por fecha de creación de más nueva a más antigua
      });
      return notas;
    } catch (error) {
      throw new Error(
        "Error al obtener las notas de trabajo: " + error.message,
      );
    }
  }

  async deleteNotaTrabajo(id) {
    try {
      const nota = await sequelize.models.NotaTrabajoEvento.findByPk(id);
      if (!nota) {
        return false;
      }

      // Eliminación lógica (soft delete) gracias al paranoid: true
      await nota.destroy();
      return true;
    } catch (error) {
      throw new Error("Error al eliminar la nota de trabajo: " + error.message);
    }
  }
}

module.exports = new EventoRepository();
