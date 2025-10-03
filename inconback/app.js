const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
// Carga variables desde WebApp_Backend/.env sin depender del cwd
require("dotenv").config({ path: path.join(__dirname, ".env") });
const http = require("http");
const { Server: SocketIOServer } = require("socket.io");
const jwt = require("jsonwebtoken");
const logger = require("./src/config/logger");
const { errorHandler } = require("./src/errors/errorHandling");

const { sequelize } = require("./src/config/sequelize-config");
const scheduleInactiveUsersUpdate = require("./cronJobs/updateInactiveUsers");
const NotificationRoutes = require("./src/routes/notification.routes");
const createSocketRoutes = require("./src/routes/socket.routes");
const UserProjectManager = require("./Mapping/UserProjectManager");
const messageRoutes = require("./src/routes/message.routes");
const { Message } = require("./src/config/sequelize-config");

class Server {
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);

    // Socket principal para colaboración en tiempo real
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    // Socket especial para login/logout
    this.loginIO = new SocketIOServer(this.server, {
      path: "/login-socket",
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    this.userProjectManager = new UserProjectManager();
    this.connectedUsers = {};

    this.config();
    this.routes();
    this.sockets();
    this.startBD();
    this.startCronJobs();
  }

  config() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cors());
    // Servir archivos estáticos de la carpeta uploads
    this.app.use("/uploads", express.static(path.join(__dirname, "uploads")));

    const env = process.env.NODE_ENV || "development";
    this.app.set("env", env);

    // Loguea el entorno con color para fácil debug
    const purpleColor = "\x1b[35m";
    const resetColor = "\x1b[0m";
    console.log(
      `${purpleColor}El servidor está configurado en modo: ${this.app.get("env")}${resetColor}`,
    );
  }

  routes() {
    const routesDir = path.join(__dirname, "src/routes");
    fs.readdirSync(routesDir).forEach((file) => {
      if (file.endsWith(".js")) {
        const routeModule = require(path.join(routesDir, file));
        if (routeModule.getRouter) {
          this.app.use(routeModule.getRouter());
        }
      }
    });

    // Rutas especiales para notificaciones y sockets
    const notificationRoutes = new NotificationRoutes(
      this.io,
      this.userProjectManager.userProjectMap,
      this.userProjectManager.projectUserMap,
    );
    this.app.use(notificationRoutes.getRouter());

    const socketRoutes = createSocketRoutes(
      this.userProjectManager.userProjectMap,
      this.userProjectManager.projectUserMap,
    );
    this.app.use(socketRoutes);

    // Ruta de healthcheck
    this.app.get("/health", (req, res) => {
      res.status(200).send({ status: "ok" });
    });

    // Rutas de mensajes
    this.app.use("/api/messages", messageRoutes);

    // Middleware global de manejo de errores
    this.app.use(errorHandler);
    //   // Rutas de autenticación OAuth2 (Google)
    //   const authRoutes = require("./src/routes/auth.routes");
    //   this.app.use("/oauth", authRoutes);

    //   // Rutas de envío de correo
    //   const emailRoutes = require("./src/routes/email.routes");
    //   this.app.use("/api/email", emailRoutes);
  }

  sockets() {
    this.io.on("connection", (socket) => {
      socket.on("register", (userId, projectId) => {
        const projectUserMap = this.userProjectManager.register(
          userId,
          projectId,
          socket,
        );
        /*console.log(
          "Usuarios registrados:",
          this.userProjectManager.userProjectMap,
        );
        console.log("Proyectos registrados:", projectUserMap);
        this.io.emit("update-users");*/
      });

      socket.on("disconnect", () => {
        const projectUserMap = this.userProjectManager.unregister(socket);
        /*console.log(
          "Usuarios registrados:",
          this.userProjectManager.userProjectMap,
        );*/

        this.io.emit("update-users");
      });

      socket.on("reconnect", (attemptNumber) => {
        if (socket.userId && socket.projectId) {
          const projectUserMap = this.userProjectManager.register(
            socket.userId,
            socket.projectId,
            socket,
          );
          /*console.log(
            "Usuarios registrados:",
            this.userProjectManager.userProjectMap,
          );*/

          this.io.emit("update-users");
        }
      });
    });

    this.loginIO.on("connection", (socket) => {
      socket.on("login", (token) => {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
          if (err) {
            console.log("Authentication error");
            socket.emit("auth_error", "Authentication error");
            return;
          }

          socket.userId = decoded.id;
          this.connectedUsers[socket.id] = decoded;
          this.loginIO.emit("user-logged-in", {
            userId: decoded.id,
            email: decoded.email,
          });
        });
      });

      socket.on("logout", () => {
        const userId = socket.userId;
        if (userId) {
          delete this.connectedUsers[socket.id];
          socket.userId = null;
          this.loginIO.emit("user-logged-out", { userId });
        }
      });

      socket.on("disconnect", () => {
        if (socket.userId) {
          console.log(
            `Cliente desconectado: Usuario ${socket.userId} (${socket.id})`,
          );
          delete this.connectedUsers[socket.id];
        } else {
          console.log(
            `Cliente desconectado sin sesión activa: ${socket.id} desde ${socket.handshake.address}`,
          );
        }
      });

      socket.on("get-connected-users", () => {
        socket.emit("connected-users", this.connectedUsers);
      });
    });
  }

  startBD() {
    sequelize
      .sync({ force: false })
      .then(() => {
        logger.info("Tablas sincronizadas con la base de datos.");
      })
      .catch((error) => {
        logger.error("Error al sincronizar las tablas:", error);
      });
  }

  startCronJobs() {
    scheduleInactiveUsersUpdate();
  }

  start() {
    const port = process.env.PORT || 3111;
    this.server.listen(port, () => {
      logger.info(`Server listening on port ${port}`);
    });
  }
}

console.log("Iniciando servidor...");
const server = new Server();
server.start();
