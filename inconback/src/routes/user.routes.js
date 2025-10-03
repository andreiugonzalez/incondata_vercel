const express = require("express");
const UserController = require("../controllers/user.controller");
const { validateUser, validate } = require("../middlewares/user.middlewares");
const {
  authenticateMiddleware,
} = require("../middlewares/authentication.middleware");
const { 
  roleAuthorizationMiddleware, 
  requirePermission, 
  requireTool 
} = require("../middlewares/role-authorization.middleware");
const { validateBody, validateParams } = require("../middlewares/validation.middleware");
const { userSchemas } = require("../utils/validation-schemas");
const multer = require("multer");

const upload = multer({ dest: "uploads/" });

class UserRoutes {
  constructor() {
    this.router = express.Router();
    this.router.get(
      "/user",
      roleAuthorizationMiddleware(["superadmin", "admin", "ITO", "planner", "superintendente", "inspector"]),
      requireTool("usuarios"),
      UserController.getUsers,
    );

    // Agrega esta línea en el constructor de UserRoutes
    this.router.post(
      "/user/:id/roles",
      roleAuthorizationMiddleware(["superadmin", "admin"]),
      requirePermission("gestion_usuarios"),
      UserController.assignRolesToUser,
    );
    //routes para traer los correos
    this.router.get("/users", UserController.getAllUsersSimple);
    
    // Ruta específica para verificar existencia de superadmin
    this.router.get("/check-superadmin", UserController.checkSuperAdminExists);
    
    this.router.post("/login", validateBody(userSchemas.login), UserController.login);

    this.router.post("/register", validateBody(userSchemas.registerInternal), UserController.register);

    // this.router.get('/user/role/contratista', UserController.getUserRoleById);
    // this.router.get('/user/role/superintendente', authenticateMiddleware(['superadmin','admin']), UserController.getUserRoleById);
    // this.router.get('/user/role/inspector', authenticateMiddleware(['superadmin','admin']), UserController.getUserRoleById);

    this.router.post("/register-external", validateBody(userSchemas.registerExternal), UserController.registerExternal);
    this.router.post("/user/password", UserController.setPassword);
    this.router.post("/set-password", UserController.sendEmail);
    this.router.post(
      "/user/password/email",
      UserController.sendChangePasswordEmail,
    );
    this.router.patch("/user/password", validateBody(userSchemas.changePassword), UserController.changePassword);

    // Obtener un usuario por ID (GET)
    this.router.get("/user/:id", validateParams(userSchemas.params), UserController.getUserById);
    this.router.get("/user/names/:id", validateParams(userSchemas.params), UserController.getUserlistById);

    // Obtener un usuario por ID (GET)
    this.router.get(
      "/user/update/internal/:id",
      authenticateMiddleware(["superadmin", "admin"]),
      validateParams(userSchemas.params),
      UserController.getUserByIdInternalupdate,
    );

    // Actualizar usuario por ID (PATCH)
    this.router.patch(
      "/user/:id",
      authenticateMiddleware(["superadmin", "admin"]),
      validateParams(userSchemas.params),
      validateBody(userSchemas.update),
      UserController.updateUserById,
    );

    // Nueva ruta para registrar usuarios desde un archivo Excel procesado
    this.router.post(
      "/register-excel",
      authenticateMiddleware(["superadmin", "admin"]),
      (req, res, next) => {
        UserController.registerExcel(req, res, next);
      },
    );

    this.router.patch("/user-password-temp", UserController.updatePasswordTemp);

    this.router.patch(
      "/update-temporary-password",
      UserController.updatePasswordTempStatus,
    );

    this.router.post("/users/by-ids", UserController.getUsersByIds);

    //traer usuarios con id y nombre
    this.router.get("/userlist", UserController.getlistuser);

    //crea registro de login
    this.router.post("/users_logins", UserController.postUserLogin);

    // Ruta para eliminar usuarios
    this.router.delete(
      "/user/:id",
      roleAuthorizationMiddleware(["superadmin", "admin"]),
      requirePermission("gestion_usuarios"),
      UserController.deleteUser
    );
  }
  getRouter() {
    return this.router;
  }
}

const userRoutes = new UserRoutes();
module.exports = userRoutes;
