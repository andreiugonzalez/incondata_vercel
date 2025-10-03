const NotificationRepository = require("../repositories/notification.repository");
const { response } = require("../utils/response");

const NotificationController = (io, userSockets, projectSockets) => {
  return {
    async getAllNotifications(req, res, next) {
      try {
        const notifications =
          await NotificationRepository.getAllNotifications();
        res
          .status(200)
          .send(response(200, "Notificaciones encontradas", notifications));
      } catch (error) {
        return next(error);
      }
    },

    async notificationbyproject(req, res, next) {
      const { id } = req.params;

      try {
        const notifications =
          await NotificationRepository.notificationByProject(id);
        res
          .status(200)
          .send(response(200, "Notificaciones encontradas", notifications));
      } catch (error) {
        return next(error);
      }
    },

    async getNotificationById(req, res, next) {
      try {
        const { id } = req.params;
        const notification =
          await NotificationRepository.getNotificationById(id);
        if (!notification) {
          return res
            .status(404)
            .send(response(404, "Notificación no encontrada"));
        }
        res
          .status(200)
          .send(response(200, "Notificación encontrada", notification));
      } catch (error) {
        return next(error);
      }
    },

    async createNotification(req, res, next) {
      try {
        // DEBUG: Loguear el body recibido para ver qué llega realmente
        console.log("Body recibido en createNotification:", req.body);

        const { resumen, message, userId, id_proyecto, fecha } = req.body;

        if (!id_proyecto) {
          throw new Error("El id_proyecto no está definido en la notificación");
        }

        const createdNotification =
          await NotificationRepository.createNotification({
            resumen,
            message,
            userId,
            id_proyecto,
            fecha,
          });

        // Obtener la información del usuario desde el repositorio
        const user = await NotificationRepository.getUserByIdNotify(userId);

        // Agregar la información del usuario a la notificación creada
        const notificationWithUser = {
          ...createdNotification.dataValues,
          user: user.dataValues,
        };

        // Emitir la notificación solo a los sockets registrados en el proyecto
        const sockets = projectSockets[id_proyecto] || [];
        sockets.forEach(({ socket }) => {
          if (socket && typeof socket.emit === "function") {
            socket.emit("notification", notificationWithUser);
          }
        });

        console.log(
          `Notificación enviada a los usuarios del proyecto ${id_proyecto}:`,
          sockets.map((s) => s.userId),
        );

        res
          .status(201)
          .send(
            response(
              201,
              "Notificación creada correctamente",
              notificationWithUser,
            ),
          );
      } catch (error) {
        return next(error);
      }
    },

    async updateNotification(req, res, next) {
      try {
        const { id } = req.params;
        const updatedNotification =
          await NotificationRepository.updateNotification(id, req.body);
        res
          .status(200)
          .send(
            response(
              200,
              "Notificación actualizada correctamente",
              updatedNotification,
            ),
          );
      } catch (error) {
        return next(error);
      }
    },

    async markAsRead(req, res, next) {
      try {
        const { id } = req.params;
        const { userId } = req.body;
        const notification = await NotificationRepository.markAsRead(
          id,
          userId,
        );

        res.status(200).json(notification);
      } catch (error) {
        next(error);
      }
    },

    async deleteNotificationForUser(req, res, next) {
      try {
        const { id } = req.params;
        const { userId } = req.body;
        const notification =
          await NotificationRepository.deleteNotificationForUser(id, userId);
        res.status(200).json(notification);
      } catch (error) {
        next(error);
      }
    },
    async createUserNotification(req, res, next) {
      try {
        const { resumen, message, userId, fecha } = req.body;
        // No requiere id_proyecto
        const notification = await NotificationRepository.createNotification({
          resumen,
          message,
          userId,
          fecha,
        });
        res
          .status(201)
          .send(response(201, "Notificación de usuario creada", notification));
      } catch (error) {
        return next(error);
      }
    },
  };
};

module.exports = NotificationController;
