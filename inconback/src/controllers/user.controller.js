const UserRepository = require("../repositories/user.repository");
const RolRepository = require("../repositories/rol.repository");
const ComunaRepository = require("../repositories/comuna.repository");
const PaisRepository = require("../repositories/pais.repository");
const RegionRepository = require("../repositories/region.repository");
const { response } = require("../utils/response");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const sequelize = require("../config/database");

class UserController {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await UserRepository.getUser(email);
      await UserRepository.comparePassword(password, user.hashedPassword);

      // Actualizar último acceso solo cuando el login es exitoso
      await UserRepository.updateLastAccess(user.id);

      // Verificar que la actualización se haya realizado correctamente
      const updatedUser = await UserRepository.getUserById(user.id);

      const tokenPayload = {
        id: user?.id, // <-- Agrega el id al payload
        rol: user?.roles?.map((rol) => rol.name),
        email: user?.email,
      };
      const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
        expiresIn: "10h",
      });

      const userResponse = user.toJSON(); // Convertir el objeto Sequelize a JSON
      userResponse.isTemporaryPassword = user.isTemporaryPassword;
      userResponse.passwordExpirationDate = user.passwordExpirationDate;

      // Asegurarse de que el último acceso actualizado se refleje en la respuesta
      userResponse.ultimo_acceso = updatedUser.ultimo_acceso;

      res.cookie("token", token, {
        httpOnly: true,
        secure: false, // Solo en desarrollo, cambiar a true en producción
        sameSite: "strict",
        maxAge: 10 * 60 * 60 * 1000 // 10 horas en milisegundos
      });
      res.status(200).send(
        response(200, "Usuario logueado correctamente", {
          token,
          user: userResponse,
        }),
      );
    } catch (error) {
      res.status(401).json({ status: "error", message: error.message });
    }
  }

  async register(req, res, next) {
    try {
      // propiedades interno
      // personal: rut, nombre, apellido, genero, nacimiento, correo, telefono, direccion, comuna, region, pais, codigo postal
      // laboral: prevision, afp, telefono emergencia, relacion emergencia, nombre emergencia
      const { personal, laboral } = req.body;
      //const rol = personal.rol; = planner -> formulario
      //const mail = personal.email

      //const rolInBD = await RolRepository.getRolByName(rol);

      // await UserRepository.getUserRegister(mail);
      await UserRepository.createInternalUser(personal, laboral);
      res.status(201).send(response(201, "Usuario creado correctamente"));
    } catch (error) {
      return next(error);
    }
  }

  async registerExcel(req, res, next) {
    const users = req.body;

    if (!Array.isArray(users)) {
      return res.status(400).json({
        status: "error",
        message: "El cuerpo de la solicitud debe ser un array de usuarios.",
      });
    }

    const transaction = await sequelize.transaction();

    const formatErrorMessage = (error, username) => {
      let errorMessage = `Error para el usuario ${username}:\n`;

      if (error.name === "SequelizeUniqueConstraintError") {
        errorMessage += `Error de restricción única:\n`;
        errorMessage += `Código: ${error.original.code}\n`;
        errorMessage += `Detalle: ${error.original.detail}\n`;
        errorMessage += `Restricción: ${error.original.constraint}\n`;
        errorMessage += `Tabla: ${error.original.table}\n`;
      } else if (error.name === "SequelizeValidationError") {
        const field = error.errors[0].path;
        errorMessage += `Error de validación (${field})\n`;
      } else if (error.name === "SequelizeDatabaseError") {
        errorMessage += `Error de base de datos\n`;
      } else if (error.name === "SequelizeConnectionError") {
        errorMessage += `Error de conexión a la base de datos\n`;
      } else {
        errorMessage += `Error: ${error.message}\n`;
      }

      return errorMessage;
    };

    try {
      let logMessages = [];

      for (const user of users) {
        try {
          // Verificar si el usuario ya existe
          const existingUser = await UserRepository.findByUsername(
            user.Username,
          );
          if (existingUser) {
            logMessages.push(`Usuario ${user.Username} ya existe. Omitido.`);
            continue;
          }

          // Mapear datos personales y laborales
          const personal = {
            rut: user.RUT,
            nombre: user.Nombre,
            apellido: user.Apellido,
            email: user.Email,
            password: user.Password,
            genero: user.Genero,
            fecha_de_nacimiento: user.FechaDeNacimiento,
            telefono: user.Telefono,
            direccion: user.Direccion,
            username: user.Username,
            estado_cuenta: user.EstadoCuenta,
            ID_comuna: user.IDComuna,
            estado_civil: user.EstadoCivil,
            codtelefono: user.CodTelefono,
            postal: user.Postal,
          };

          const laboral = {
            id_afp: user.IDAFP,
            telefono_emergencia: user.TelefonoEmergencia,
            nombre_emergencia: user.NombreEmergencia,
            organizacionid: user.OrganizacionID,
            id_salud: user.IDSalud,
            id_rol: user.IDRol,
            id_relacion_emergencia: user.IDRelacionEmergencia,
            codigo_area_emergencia: user.CodigoAreaEmergencia,
            id_puesto: user.IDPuesto,
            id_grupo: user.IDGrupo,
            correo_emergencia: user.CorreoEmergencia,
          };

          // Crear el usuario
          await UserRepository.createInternalUser(personal, laboral, {
            transaction,
          });
          logMessages.push(`Usuario ${user.Username} creado con éxito.`);
        } catch (error) {
          logMessages.push(formatErrorMessage(error, user.Username));
          console.error(`Error procesando al usuario ${user.Username}:`, error);
        }
      }

      await transaction.commit();
      res.status(201).json({ status: "success", messages: logMessages });
    } catch (error) {
      await transaction.rollback();
      console.error("Error general procesando usuarios:", error);

      const errorMessage = formatErrorMessage(error, "general");
      res.status(500).json({ status: "error", message: errorMessage });
    }
  }

  async registerExternal(req, res) {
      try {
          const { personal, laboral, bank } = req.body;
          
          let rolObject;
          
          // El rol viene como ID en laboral.cargo
          if (laboral && laboral.cargo) {
              // Buscar el rol por ID (cargo es un número)
              rolObject = await RolRepository.getRolByName(laboral.cargo);
          } else {
              // Si no se proporciona rol, usar el rol "normal" por defecto
              const defaultRoles = await RolRepository.getRolByNameString("normal");
              rolObject = defaultRoles;
          }
  
          const user = await UserRepository.createUser(personal, laboral, bank, rolObject);
          
          res.status(201).json({
              statusCode: 201,
              message: "Usuario externo creado exitosamente",
              data: user
          });
      } catch (error) {
          console.error("Error en registerExternal:", error);
          res.status(500).json({
              statusCode: 500,
              message: "Error interno del servidor",
              error: error.message
          });
      }
  }

  /**
   * Verificar si existe un usuario superadmin
   */
  async checkSuperAdminExists(req, res, next) {
    try {
      const superAdminUser = await UserRepository.getSuperAdminUser();
      
      if (superAdminUser) {
        res.status(200).send(
          response(200, "Usuario superadmin encontrado", {
            exists: true,
            user: {
              id: superAdminUser.id,
              names: superAdminUser.names,
              email: superAdminUser.email,
              rut: superAdminUser.rut
            }
          })
        );
      } else {
        res.status(200).send(
          response(200, "No existe usuario superadmin", {
            exists: false
          })
        );
      }
    } catch (error) {
      console.error("Error verificando superadmin:", error);
      res.status(500).send(
        response(500, "Error interno del servidor", {
          exists: false,
          error: error.message
        })
      );
    }
  }

  async getUsers(req, res, next) {
    try {
      const { type } = req.query; // Obtener el tipo de usuario de los query params
      const { email, rol } = req.user;
      let users;

      if (type === 'internal') {
        users = await UserRepository.getInternalUsers();
      } else if (type === 'external') {
        users = await UserRepository.getExternalUsers();
      } else {
        // Lógica existente si no se especifica el tipo
        if (rol.includes("superadmin")) {
          users = await UserRepository.getUsersAdmin(email);
        } else if (rol.includes("admin")) {
          users = await UserRepository.getUsers(email);
        } else if (rol.includes("ITO")) {
          users = await UserRepository.getUsers(email);
        } else if (rol.includes("planner")) {
          users = await UserRepository.getUsers(email);
        } else if (rol.includes("superintendente")) {
          users = await UserRepository.getUsers(email);
        } else if (rol.includes("inspector")) {
          users = await UserRepository.getUsers(email);
        }
      }

      //console.log(req.user); imprime el REQ token
      // Enviar la respuesta con los usuarios encontrados
      res.status(200).json(response(200, "Usuarios encontrados", users));
    } catch (error) {
      // Manejar cualquier error que pueda ocurrir
      next(error);
    }
  }

  async sendEmail(req, res, next) {
    try {
      await UserRepository.getUserRegister(req.body.email);
      const token = jwt.sign(
        { email: req.body.email },
        process.env.JWT_SECRET,
        { expiresIn: "10m" },
      );
      await UserRepository.sendEmail(req.body.email, token);
      res
        .status(200)
        .send(response(200, "Correo electrónico enviado correctamente"));
    } catch (error) {
      return next(error);
    }
  }

  async setPassword(req, res, next) {
    try {
      const { password } = req.body;
      const token = req.headers["authorization"].split(" ")[1];
      const { email } = jwt.verify(token, process.env.JWT_SECRET);
      await UserRepository.setPassword(email, password);
      res.status(200).send(response(200, "Contraseña creada correctamente"));
    } catch (error) {
      return next(error);
    }
  }

  async sendChangePasswordEmail(req, res, next) {
    try {
      const { email } = req.body;
      const user = await UserRepository.getUser(email);
      
      if (!user) {
        return res.status(404).send(response(404, "Usuario no encontrado"));
      }
      
      const token = jwt.sign(
        { email: req.body.email },
        process.env.JWT_SECRET,
        { expiresIn: "10m" },
      );
      
      // En lugar de enviar email, devolvemos el token para uso inmediato
      res.status(200).send(response(200, "Usuario verificado correctamente", { token }));
    } catch (error) {
      return next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { password } = req.body;
      const token = req.headers["authorization"].split(" ")[1];
      const { email } = jwt.verify(token, process.env.JWT_SECRET);
      const user = await UserRepository.getUser(email);
      await UserRepository.changePassword(password, user.id);
      res.status(200).send(response(200, "Contraseña cambiada correctamente"));
    } catch (error) {
      return next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const userId = req.params.id;
      const user = await UserRepository.getUserById(userId);
      if (!user) {
        return res.status(404).json(response(404, "Usuario no encontrado"));
      }
      res.status(200).json(response(200, "Usuario encontrado", user));
    } catch (error) {
      next(error);
    }
  }

  async getUserlistById(req, res, next) {
    try {
      const userId = req.params.id;
      const user = await UserRepository.getUserallById(userId);
      if (!user) {
        return res.status(404).json(response(404, "Usuario no encontrado"));
      }
      res.status(200).json(response(200, "Usuario encontrado", user));
    } catch (error) {
      next(error);
    }
  }

  async getUserByIdInternalupdate(req, res, next) {
    try {
      const userId = req.params.id;
      const user = await UserRepository.getUserByIdInternalupdate(userId);
      if (!user) {
        return res.status(404).json(response(404, "Usuario no encontrado"));
      }
      res.status(200).json(response(200, "Usuario encontrado", user));
    } catch (error) {
      next(error);
    }
  }

  // Devuelve todos los usuarios (solo id, names, email)
  async getAllUsersSimple(req, res) {
    try {
      const { User } = require("../config/sequelize-config");
      const users = await User.findAll({
        attributes: ["id", "names", "email"],
      });
      res.json({ data: users });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Error al obtener usuarios", details: error.message });
    }
  }
  //getrolbyid
  // async getUserRoleById(req, res, next) {
  //   try {
  //       const roleType = req.params.type;
  //       const userRole = await UserRepository.getUserRoleById(roleType);

  //       if (!userRole || userRole.length === 0) {
  //         return res.status(404).json(response(404, `Roles ${roleType} no encontrados`));
  //     }

  //       res.status(200).json(response(200, `Roles ${roleType} encontrados`, { role: userRole }));
  //   } catch (error) {
  //       next(error);
  //   }
  // }
  //getrolbyid
  // async getUserRoleById(req, res, next) {
  //   try {
  //       const roleType = req.params.type;
  //       const userRole = await UserRepository.getUserRoleById(roleType);

  //        // Mapeo de los resultados para el formato deseado
  //     const roleMap = userRole.map(role => ({
  //       id_rol: role.id,
  //       nombre_rol: role.name
  //     }));

  //     // Devolver los estados civiles en formato JSON
  //     res.json(roleMap);
  //   } catch (error) {
  //     // Manejo de errores
  //     next(error);
  //   }
  // };

  async updateUserById(req, res, next) {
    try {
      const userId = req.params.id;
      const userData = req.body;

      // Obtener el usuario antes de la actualización
      const userBeforeUpdate = await UserRepository.getUserById(userId);

      if (!userBeforeUpdate) {
        return res.status(404).send(response(404, "Usuario no encontrado"));
      }

      // Actualizar el usuario
      await UserRepository.updateUser(userId, userData);

      // Obtener el usuario después de la actualización
      const userAfterUpdate = await UserRepository.getUserById(userId);

      // Identificar las columnas que no fueron actualizadas
      const unchangedColumns = {};
      for (const key in userBeforeUpdate.dataValues) {
        if (userData[key] !== userAfterUpdate[key]) {
          unchangedColumns[key] = userBeforeUpdate[key];
        }
      }

      // Devolver el usuario antes y después de la actualización, junto con las columnas no actualizadas
      res.status(200).json({
        status: "success",
        message: "Usuario actualizado correctamente",
        userBeforeUpdate,
        userAfterUpdate,
        unchangedColumns,
      });
    } catch (error) {
      next(error);
    }
  }

  async assignRolesToUser(req, res, next) {
    try {
      const userId = req.params.id;
      const { roleIds } = req.body;

      if (!userId || !roleIds) {
        return res
          .status(400)
          .json({ message: "User ID and Role IDs are required" });
      }

      await UserRepository.assignRoles(userId, roleIds);

      res.status(200).json({ message: "Roles assigned successfully" });
    } catch (error) {
      next(error);
    }
  }

  async updatePasswordTemp(req, res, next) {
    try {
      const { userId, currentPassword, newPassword } = req.body;

      const user = await UserRepository.getUserById(userId);

      if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      const isMatch = await bcrypt.compare(
        currentPassword,
        user.hashedPassword,
      );
      if (!isMatch) {
        return res
          .status(400)
          .json({ error: "La contraseña actual es incorrecta" });
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Calcular la fecha de expiración con 2 semanas desde el día actual
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 14);

      await UserRepository.updatePasswordTemp(
        userId,
        hashedNewPassword,
        expirationDate,
      );

      res.status(200).json({ message: "Contraseña actualizada exitosamente" });
    } catch (error) {
      next(error);
    }
  }

  async updatePasswordTempStatus(req, res, next) {
    try {
      const { userId, isTemporaryPassword } = req.body;
      const user = await UserRepository.getUserByIdverify(userId);
      console.log(user);

      if (!user) {
        return res
          .status(404)
          .send({ status: "error", message: "Usuario no encontrado" });
      }

      user.isTemporaryPassword = isTemporaryPassword;
      user.passwordExpirationDate;
      await user.save();

      res.status(200).send({
        status: "success",
        message: "Estado de la contraseña temporal actualizado correctamente",
      });
    } catch (error) {
      next(error);
    }
  }

  async getUsersByIds(req, res, next) {
    try {
      const { ids } = req.body; // Obtener la lista de IDs desde el cuerpo de la solicitud
      // console.log(ids);
      const users = await UserRepository.getUsersByIds(ids); // Pasar la lista de IDs al repositorio
      if (!users || users.length === 0) {
        return res.status(404).json(response(404, "Usuarios no encontrados"));
      }
      res.status(200).json(response(200, "Usuarios encontrados", users));
    } catch (error) {
      next(error);
    }
  }

  async getlistuser(req, res, next) {
    try {
      const listuser = await UserRepository.getlistuser();
      const listusermap = listuser.map((user) => ({
        id_usuario: user.id,
        nombre_usuario: user.names,
        apellido_paterno: user.apellido_p,
        apellido_materno: user.apellido_m,
        email: user.email,
        telefono: user.telefono,
      }));
      res.json(listusermap);
    } catch (error) {
      console.error("Error en getlistuser:", error);
      res.status(500).json({ message: "Error al obtener los usuarios" });
    }
  }

  async postUserLogin(req, res) {
    try {
      const userLoginData = await UserRepository.createUserLogin(req.body);
      res.status(201).json({
        status: "success",
        message: "User login record created successfully",
        data: userLoginData,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  }

  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          status: "error",
          message: "ID de usuario requerido"
        });
      }

      const result = await UserRepository.deleteUser(id);
      
      res.status(200).json({
        status: "success",
        message: result.message
      });
    } catch (error) {
      console.error('Error en deleteUser controller:', error);
      
      if (error.message === 'Usuario no encontrado') {
        return res.status(404).json({
          status: "error",
          message: "Usuario no encontrado"
        });
      }
      
      res.status(500).json({
        status: "error",
        message: "Error interno del servidor al eliminar usuario"
      });
    }
  }
}

const userController = new UserController();
module.exports = userController;
