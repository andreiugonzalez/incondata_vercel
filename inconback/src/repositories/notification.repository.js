const { sequelize } = require("../config/sequelize-config");
const { response } = require("../utils/response");
const { CustomHttpError } = require("../errors/customError");

class NotificationRepository {
  async getAllNotifications() {
    try {
      const notifications = await sequelize.models.Notification.findAll({
        order: [["fecha", "DESC"]],
      });
      return notifications;
    } catch (error) {
      throw response(
        500,
        "Error al obtener las notificaciones de la base de datos",
      );
    }
  }

  async notificationByProject(projectId) {
    try {
      const notifications = await sequelize.models.Notification.findAll({
        where: { id_proyecto: projectId },
        include: [
          {
            model: sequelize.models.User,
            as: "user",
            attributes: ["names", "apellido_p", "apellido_m"],
          },
        ],
        order: [["fecha", "DESC"]],
      });
      return notifications;
    } catch (error) {
      throw response(
        500,
        "Error al obtener las notificaciones de la base de datos",
      );
    }
  }

  async getNotificationById(id) {
    try {
      const notification = await sequelize.models.Notification.findByPk(id);
      if (!notification) {
        throw response(404, "Notificación no encontrada");
      }
      return notification;
    } catch (error) {
      throw response(
        500,
        "Error al obtener la notificación de la base de datos",
      );
    }
  }

  async createNotification(data) {
    try {
      const { resumen, message, userId, id_proyecto, fecha } = data;
      const notification = await sequelize.models.Notification.create({
        resumen,
        message,
        userId,
        id_proyecto,
        fecha,
        newFor: [userId], // Inicialmente nueva para el usuario que la recibe
        readBy: [], // Inicialmente no leída por nadie
        deletedBy: [], // Inicialmente no eliminada por nadie
      });
      return notification;
    } catch (error) {
      console.error(
        "Error al crear la notificación en la base de datos:",
        error,
      );
      throw response(500, "Error al crear la notificación en la base de datos");
    }
  }

  // se agrega al socket durante la creacion para el response de la campana
  async getUserByIdNotify(id) {
    try {
      const user = await sequelize.models.User.findOne({
        where: { id },
        attributes: ["names", "apellido_p", "apellido_m"],
      });
      return user;
    } catch (error) {
      throw new Error("Error al obtener el usuario de la base de datos");
    }
  }

  async markAsRead(id, userId) {
    try {
      // console.log(`Intentando marcar como leída la notificación con ID: ${id} para el usuario: ${userId}`);
      const notification = await sequelize.models.Notification.findByPk(id);
      if (!notification) {
        throw new CustomHttpError(404, "Notificación no encontrada");
      }
      //  console.log('Notificación encontrada:', notification.dataValues);
      if (!notification.readBy.includes(userId)) {
        notification.readBy.push(userId);
        notification.newFor = notification.newFor.filter(
          (uid) => uid !== userId,
        );
        notification.changed("readBy", true);
        notification.changed("newFor", true);
        // console.log('Estado de la notificación antes de guardar:', notification.dataValues);
        await notification.save();
        // console.log('Estado de la notificación después de guardar:', notification.dataValues);
      } else {
        // console.log(`El usuario ${userId} ya ha leído la notificación con ID: ${id}`);
      }
      return notification;
    } catch (error) {
      if (error instanceof CustomHttpError) {
        console.log("Error personalizado:", error.message);
        throw error;
      }
      console.error("Error al marcar la notificación como leída:", error);
      throw new CustomHttpError(
        500,
        "Error al marcar la notificación como leída",
      );
    }
  }

  async deleteNotificationForUser(id, userId) {
    try {
      // console.log(`Intentando eliminar la notificación con ID: ${id} para el usuario: ${userId}`);
      const notification = await sequelize.models.Notification.findByPk(id);
      if (!notification) {
        throw new CustomHttpError(404, "Notificación no encontrada");
      }
      //   console.log('Notificación encontrada:', notification.dataValues);
      if (!notification.deletedBy.includes(userId)) {
        notification.deletedBy.push(userId);
        notification.changed("deletedBy", true);
        //   console.log('Estado de la notificación antes de guardar:', notification.dataValues);
        await notification.save();
        //    console.log('Estado de la notificación después de guardar:', notification.dataValues);
      } else {
        //  console.log(`El usuario ${userId} ya ha eliminado la notificación con ID: ${id}`);
      }
      return notification;
    } catch (error) {
      if (error instanceof CustomHttpError) {
        //   console.log('Error personalizado:', error.message);
        throw error;
      }
      //  console.error('Error al eliminar la notificación para el usuario:', error);
      throw new CustomHttpError(
        500,
        "Error al eliminar la notificación para el usuario",
      );
    }
  }
}

module.exports = new NotificationRepository();
