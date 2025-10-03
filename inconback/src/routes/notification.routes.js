const express = require("express");
const {
  authenticateMiddleware,
} = require("../middlewares/authentication.middleware");

class NotificationRoutes {
  constructor(io, userSockets, projectSockets) {
    this.router = express.Router();
    const NotificationController =
      require("../controllers/notification.controller")(
        io,
        userSockets,
        projectSockets,
      );

    this.router.get("/notification", (req, res, next) =>
      NotificationController.getAllNotifications(req, res, next),
    );
    this.router.get("/notificationbyproject/:id", (req, res, next) =>
      NotificationController.notificationbyproject(req, res, next),
    );

    this.router.get("/notification/:id", (req, res, next) =>
      NotificationController.getNotificationById(req, res, next),
    );
    this.router.post(
      "/notification",
      authenticateMiddleware([
        "admin",
        "superadmin",
        "prevencionista",
        "inspector",
        "supervisor",
        "superintendente",
        "planificador",
        "administrador de contrato",
        "normal",
        "planner",
        "ITO",
        // Agrega aquí cualquier otro rol válido de tu sistema
      ]),
      (req, res, next) =>
        NotificationController.createNotification(req, res, next),
    );

    this.router.put(
      "/notification/:id/read",
      authenticateMiddleware([
        "admin",
        "superadmin",
        "prevencionista",
        "inspector",
        "supervisor",
        "superintendente",
        "planificador",
        "administrador de contrato",
        "normal",
        "planner",
        "ITO",
        // Agrega aquí cualquier otro rol válido de tu sistema
      ]),
      (req, res, next) => NotificationController.markAsRead(req, res, next),
    );
    this.router.post(
      "/notification/user",
      authenticateMiddleware([
        "admin",
        "superadmin",
        "prevencionista",
        "inspector",
        "supervisor",
        "superintendente",
        "planificador",
        "administrador de contrato",
        "normal",
        "planner",
        "ITO",
      ]),
      (req, res, next) =>
        NotificationController.createUserNotification(req, res, next),
    );

    this.router.delete(
      "/notification/:id",
      authenticateMiddleware([
        "admin",
        "superadmin",
        "prevencionista",
        "inspector",
        "supervisor",
        "superintendente",
        "planificador",
        "administrador de contrato",
        "normal",
        "planner",
        "ITO",
        // Agrega aquí cualquier otro rol válido de tu sistema
      ]),
      (req, res, next) =>
        NotificationController.deleteNotificationForUser(req, res, next),
    ); // Nueva ruta para eliminar para un usuario específico
  }

  getRouter() {
    return this.router;
  }
}

module.exports = NotificationRoutes;
