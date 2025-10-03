const { sequelize } = require("../config/sequelize-config");
const { CustomHttpError } = require("../errors/customError");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { S3Client } = require("@aws-sdk/client-s3"); // Ejemplo de cómo importar el cliente S3 si es necesario
const { SESClient } = require("@aws-sdk/client-ses"); // Importar SESClient desde AWS SDK v3
const { Sequelize, Op } = require("sequelize");
const tipocontratoRepository = require("./tipocontrato.repository");
const mediopagoRepository = require("./mediopago.repository");
const nombreBancoRepository = require("./nombreBanco.repository");
const tipocuentaRepository = require("./tipocuenta.repository");
const laboralRepository = require("./laboral.repository");
const user_rolRepository = require("./user_rol.repository");
const bancoRepository = require("./banco.repository");
const externoRepository = require("./externo.repository");
const organizacionRepository = require("./organizacion.repository");
const UAParser = require("ua-parser-js");
const ses = new SESClient({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

class UserRepository {
  /**
   * Obtener usuario superadmin
   */
  async getSuperAdminUser() {
    try {
      const superAdminUser = await sequelize.models.User.findOne({
        attributes: [
          "id",
          "names",
          "apellido_p",
          "apellido_m",
          "email",
          "rut",
          "puesto",
          "ultimo_acceso",
        ],
        include: [
          {
            association: "roles",
            attributes: ["id", "name"],
            where: {
              name: "superadmin"
            }
          },
          {
            association: "user_estado",
            attributes: ["nombre_estado_cuenta"],
          },
        ],
      });

      return superAdminUser;
    } catch (error) {
      console.error("Error obteniendo usuario superadmin:", error);
      throw new CustomHttpError(500, "Error obteniendo usuario superadmin");
    }
  }

  async getUsers() {
    try {
      // Realiza una consulta a la base de datos para obtener todos los usuarios
      const users = await sequelize.models.User.findAll({
        // Especifica los atributos (columnas) que se deben incluir en el resultado para los usuarios
        attributes: [
          "id",
          "names",
          "apellido_p",
          "apellido_m",
          "email",
          "genero",
          "fecha_de_nacimiento",
          "telefono",
          "direccion",
          "rut",
          "puesto",
          "ultimo_acceso",
        ],
        // Incluye las asociaciones relacionadas (roles, organizacion, documents) en el resultado
        include: [
          {
            association: "user_estado",
            attributes: ["nombre_estado_cuenta"],
          },
          {
            association: "user_puesto",
            attributes: ["nombre_puesto"],
          },
          {
            association: "user_grupo",
            attributes: ["nombre_grupo"],
          },
          {
            association: "roles", // Asociación con el modelo roles
            attributes: ["name"], // Solo incluye el atributo 'name' de los roles
          },
          {
            association: "organizacion", // Asociación con el modelo organizacion
            attributes: ["nombre"], // Solo incluye el atributo 'nombre' de la organizacion
          },
          {
            association: "documents", // Asociación con el modelo documents
            attributes: ["link"], // Solo incluye el atributo 'link' de los documentos
            include: [
              {
                association: "documentType", // Asociación con el modelo documentType
                attributes: ["name"], // Solo incluye el atributo 'name' del tipo de documento
                where: { name: "Foto de perfil usuario" }, // Filtra para incluir solo documentos cuyo tipo sea 'Foto de perfil usuario'
              },
            ],
          },
        ],
      });

      // Agrega propiedades adicionales a cada usuario en los resultados
      users.forEach((user) => {
        user.dataValues.value = user.dataValues.names;
        user.dataValues.label = user.dataValues.names;
        user.dataValues.name = "user";
      });

      // Retorna el arreglo de usuarios con las propiedades adicionales
      return users;
    } catch (error) {
      // Manejo de errores
      throw error;
    }
  }

  async getUsersAdmin(email) {
    try {
      let users;
      // Si el usuario es admin, obtener los usuarios de la organización del usuario
      const organization = await this.getUserOrganization(email);
      users = await sequelize.models.User.findAll({
        attributes: [
          "id",
          "names",
          "apellido_p",
          "apellido_m",
          "email",
          "genero",

          "fecha_de_nacimiento",
          "telefono",

          "direccion",
          "rut",
          "puesto",
          "ultimo_acceso",
          "id_estado_cuenta",
        ],
        include: [
          {
            association: "roles",
            attributes: ["name"],
          },
          {
            association: "organizacion",
            attributes: ["nombre"],
          },
        ],
        where: {
          organizacionid: organization, // Asegúrate de ajustar el nombre del campo según tu modelo de usuario
        },
      });

      if (users.length === 0) {
        throw new CustomHttpError(404, "No se encontraron usuarios");
      }

      return users;
    } catch (error) {
      throw error;
    }
  }

  async getUserOrganization(email) {
    try {
      // Buscar al usuario por su correo electrónico (iusada en func getUsersAdmin)
      const user = await sequelize.models.User.findOne({
        where: { email: email },
      });

      if (!user) {
        throw new CustomHttpError(404, "Usuario no encontrado");
      }

      // Obtener el ID de la organización del usuario
      const organizacionId = user.organizacionid;

      if (!organizacionId) {
        throw new CustomHttpError(
          404,
          "ID de organización no encontrado para el usuario",
        );
      }

      return organizacionId;
    } catch (error) {
      throw error;
    }
  }

  async getUser(email) {
    let user = await sequelize.models.User.findOne({
      attributes: [
        "id",
        "email",
        "hashedPassword",
        "username",
        "names",
        "isTemporaryPassword",
        "passwordExpirationDate",
        "urifolder",
        "ultimo_acceso",
      ],
      where: {
        email: email,
      },
      include: [
        {
          association: "documents",
          attributes: ["link"],
        },
        {
          association: "roles",
          attributes: ["name"],
        },
        {
          association: "organizacion",
          attributes: ["nombre"],
        },
        {
          association: "documents", // Incluye todos los documentos del usuario
          attributes: ["link"],
          separate: true, // Utiliza 'separate: true' para evitar conflicto con la siguiente asociación
        },
        {
          association: "documents", // Incluye solo la foto de perfil del usuario
          attributes: ["link"],
          include: [
            {
              association: "documentType", // Asociación con el modelo documentType
              attributes: ["name"], // Solo incluye el atributo 'name' del tipo de documento
              where: { name: "Foto de perfil usuario" }, // Filtra para incluir solo documentos cuyo tipo sea 'Foto de perfil usuario'
            },
          ],
          required: false, // Puedes usar 'required: false' si la foto de perfil no es obligatoria
        },
      ],
    });

    if (!user) {
      user = await this.getUserByUsername(email);

      if (!user) {
        throw new CustomHttpError(404, "Usuario no encontrado");
      }
    }

    return user;
  }

  async getUserByUsername(username) {
    let user = await sequelize.models.User.findOne({
      attributes: [
        "id",
        "email",
        "hashedPassword",
        "username",
        "names",
        "isTemporaryPassword",
        "passwordExpirationDate",
        "urifolder",
        "ultimo_acceso",
      ],
      where: {
        username: username,
      },
      include: [
        {
          association: "documents",
          attributes: ["link"],
        },
        {
          association: "roles",
          attributes: ["name"],
        },
        {
          association: "organizacion",
          attributes: ["nombre"],
        },
        {
          association: "documents", // Incluye todos los documentos del usuario
          attributes: ["link"],
          separate: true, // Utiliza 'separate: true' para evitar conflicto con la siguiente asociación
        },
        {
          association: "documents", // Incluye solo la foto de perfil del usuario
          attributes: ["link"],
          include: [
            {
              association: "documentType", // Asociación con el modelo documentType
              attributes: ["name"], // Solo incluye el atributo 'name' del tipo de documento
              where: { name: "Foto de perfil usuario" }, // Filtra para incluir solo documentos cuyo tipo sea 'Foto de perfil usuario'
            },
          ],
          required: false, // Puedes usar 'required: false' si la foto de perfil no es obligatoria
        },
      ],
    });

    if (!user) {
      throw new CustomHttpError(404, "Usuario no encontrado");
    }

    return user;
  }

  async getUserRegister(email) {
    const user = await sequelize.models.User.findOne({
      where: {
        email: email,
      },
    });

    if (user) {
      throw new CustomHttpError(400, "El usuario ya existe");
    }

    return user;
  }

  async createUser(personal, laboral, bank, rol) {
    const {
      rut,
      nombre,
      apellido_p,
      apellido_m,
      genero,
      fecha_de_nacimiento,
      email,
      telefono,
      direccion,
      ID_comuna,
      password,
      codigo_postal,
      organizacion,
      prevision,
      afp,
      username,
      codtelefono,
      estado_civil,      // Agregado estado_civil
      estado_cuenta,     // Agregado estado_cuenta
    } = personal;
    const {
      tipo_contrato,
      fecha_inicio_contrato,
      cargo,
      sueldo_base,
      gratificacion,
      valor_dia,
      fecha_de_pago,
      fecha_de_ingreso_obra,
      medio_pago,
      id_puesto,
      nombre_contacto,
      telefono_emergencia,
      correo_emergencia,
      id_relacion_emergencia,
      codtelefono_emergencia,
    } = laboral;
    const { banco, numero_cuenta, tipo_cuenta, correo_banco } = bank;

    // Agregar logs detallados para debuggear
    console.log("=== DEBUG BANK DESTRUCTURING ===");
    console.log("banco:", banco, "tipo:", typeof banco);
    console.log("numero_cuenta:", numero_cuenta, "tipo:", typeof numero_cuenta);
    console.log("tipo_cuenta:", tipo_cuenta, "tipo:", typeof tipo_cuenta);
    console.log("correo_banco:", correo_banco, "tipo:", typeof correo_banco);
    console.log("================================");

    console.log("Datos recibidos en createUser:", {
      personal,
      laboral, 
      bank,
      rol,
    });

    // Agregar logs detallados para debuggear
    console.log("=== DEBUG BANK DESTRUCTURING ===");
    console.log("banco:", banco, "tipo:", typeof banco);
    console.log("numero_cuenta:", numero_cuenta, "tipo:", typeof numero_cuenta);
    console.log("tipo_cuenta:", tipo_cuenta, "tipo:", typeof tipo_cuenta);
    console.log("correo_banco:", correo_banco, "tipo:", typeof correo_banco);
    console.log("================================");

    console.log("Datos recibidos en createUser:", {
      personal,
      laboral,
      bank,
      rol,
    });
    // Validar que los campos no estén vacíos
    if (!numero_cuenta || numero_cuenta === "") {
      throw new Error("El número de cuenta es requerido");
    }
    if (!correo_banco || correo_banco === "") {
      throw new Error("El correo del banco es requerido");
    }
    if (!banco || banco === "") {
      throw new Error("El banco es requerido");
    }
    if (!tipo_cuenta || tipo_cuenta === "") {
      throw new Error("El tipo de cuenta es requerido");
    }

    const t = await sequelize.transaction();

    try {
      const tipoContratoBD = await tipocontratoRepository.getTipoContratoByName(
        tipo_contrato,
        { transaction: t },
      );
      const medioPagoBD = await mediopagoRepository.getMedioPagoByName(
        medio_pago,
        { transaction: t },
      );

      const laboralBD = await laboralRepository.createLaboral(
        {
          fecha_inicio_contrato,
          sueldo_base,
          gratificacion,
          valor_dia,
          fecha_de_pago,
          fecha_de_ingreso_obra,
          cargo,
          tipo_contrato_id: tipoContratoBD.tipo_contrato_id,
          medio_pago_id: medioPagoBD.id,
        },
        { transaction: t },
      );

      const hashedPassword = await bcrypt.hash(password, 10);

      // Generar urifolder único para usuario externo
      const generateEncryptedUriFolder = () => {
        const hash = crypto.createHash("sha256");
        const randomValue = crypto.randomBytes(16).toString("hex");
        hash.update(randomValue + Date.now().toString());
        return hash.digest("hex");
      };
      const uriFolder = generateEncryptedUriFolder();

      // Log detallado de los datos antes de crear el usuario
      console.log("Datos para crear usuario:", {
        names: nombre,
        apellido_p,
        apellido_m,
        email,
        hashedPassword,
        genero,
        id_salud: prevision,
        fecha_de_nacimiento,
        telefono,
        id_cod_telf: codtelefono,
        id_afp: afp,
        direccion,
        rut,
        codigo_postal: codigo_postal,
        ID_comuna,
        username,
        organizacionid: organizacion,
        id_puesto: id_puesto,
        urifolder: uriFolder,
      });

      const user = await sequelize.models.User.create(
        {
          names: nombre,
          apellido_p,
          apellido_m,
          email,
          hashedPassword,
          genero,
          id_salud: prevision,
          fecha_de_nacimiento,
          telefono,
          id_cod_telf: codtelefono,
          id_afp: afp,
          direccion,
          rut,
          codigo_postal: codigo_postal,
          ID_comuna,
          username,
          organizacionid: organizacion,
          id_puesto: id_puesto,
          urifolder: uriFolder,
          id_estado_civil: estado_civil,    // Agregado estado_civil
          id_estado_cuenta: estado_cuenta,  // Agregado estado_cuenta
        },
        { transaction: t },
      );

      await user_rolRepository.createUserRol(
        {
          userId: user.id,
          rolId: rol.id,
        },
        { transaction: t },
      );

      console.log("=== DEBUG ANTES DE CREAR BANCO ===");
      console.log("num_cuenta:", numero_cuenta);
      console.log("correo:", correo_banco);
      console.log("id_nombrebanco:", banco);
      console.log("id_tipo_cuenta:", tipo_cuenta);
      console.log("================================");

      const bankBD = await bancoRepository.createBanco(
        {
          numero_cuenta: numero_cuenta,
          correo_banco: correo_banco,
          banco: banco,
          tipo_cuenta: tipo_cuenta,
        },
        { transaction: t },
      );

      console.log("Datos que se pasarán a createExterno:");
      console.log("laboral_id:", laboralBD.id_laboral);
      console.log("banco_id:", bankBD.id_banco);
      console.log("id_usuario:", user.id);

      await externoRepository.createExterno(
        {
          laboral_id: laboralBD.id_laboral,
          banco_id: bankBD.id_banco,
          id_usuario: user.id,
        },
        { transaction: t },
      );

      await sequelize.models.Emergencia.create(
        {
          id_user: user.id,
          telefono: telefono_emergencia,
          correo: correo_emergencia,
          nombre_contacto,
          id_relacion: id_relacion_emergencia,
          cod_telefono: codtelefono_emergencia,
        },
        { transaction: t },
      );

      await t.commit();
      return user;
    } catch (error) {
      await t.rollback();
      console.error("Error al crear usuario:", error); // Muestra detalles del error
      throw error; // Opcional: vuelve a lanzar el error para que sea manejado más arriba en el flujo de llamadas
    }
  }

  async findByUsername(username) {
    return await sequelize.models.User.findOne({ where: { username } });
  }

  createInternalUser = async (personal, laboral, options) => {
    const {
      rut,
      nombre,
      apellido_p,
      apellido_m,
      email,
      password,
      genero,
      fecha_de_nacimiento,
      telefono,
      direccion,
      username,
      estado_cuenta,
      ID_comuna,
      estado_civil,
      codtelefono,
      codigo_postal,
      urifolder,
    } = personal;
    const {
      id_afp,
      telefono_emergencia,
      nombre_emergencia,
      organizacionid,
      id_salud,
      id_rol,
      id_relacion_emergencia,
      codigo_area_emergencia,
      id_puesto,
      id_grupo,
      correo_emergencia,
    } = laboral;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const userData = {
        names: nombre,
        apellido_p: apellido_p,
        apellido_m: apellido_m,
        hashedPassword,
        email,
        genero,
        fecha_de_nacimiento,
        telefono,
        direccion,
        ultimo_acceso: null, // Inicialmente null para indicar que no ha accedido
        id_puesto,
        id_grupo,
        rut,
        organizacionid,
        id_estado_cuenta: estado_cuenta,
        username,
        codigo_postal: codigo_postal,
        ID_comuna,
        id_salud,
        id_estado_civil: estado_civil,
        id_cod_telf: codtelefono,
        id_afp,
        urifolder,
      };

      const user = await sequelize.models.User.create(userData, options);

      await sequelize.models.Interno.create(
        {
          id_usuario: user.id,
        },
        options,
      );

      await sequelize.models.UserRol.create(
        {
          userId: user.id,
          rolId: id_rol,
        },
        options,
      );

      await sequelize.models.Emergencia.create(
        {
          id_user: user.id,
          telefono: telefono_emergencia,
          correo: correo_emergencia,
          cod_telefono: codigo_area_emergencia,
          nombre_contacto: nombre_emergencia,
          id_relacion: id_relacion_emergencia,
        },
        options,
      );

      return user;
    } catch (error) {
      console.error("Error creating internal user:");
      console.error(`Name: ${error.name}`);
      console.error(`Message: ${error.message}`);
      console.error(`Stack: ${error.stack}`);

      if (error.original) {
        console.error("Original error details:");
        console.error(`Code: ${error.original.code}`);
        console.error(`Detail: ${error.original.detail}`);
        console.error(`Constraint: ${error.original.constraint}`);
        console.error(`Table: ${error.original.table}`);
        console.error(`Query: ${error.original.sql}`);
      }

      throw error; // Rethrow the error after logging it
    }
  };

  async comparePassword(password, hashedPassword) {
    const passwordMatch = await bcrypt.compare(password, hashedPassword);

    if (!passwordMatch) {
      throw new CustomHttpError(400, "Contraseña incorrecta");
    }

    return passwordMatch;
  }

  async changePassword(password, userId) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await sequelize.models.User.update(
      {
        hashedPassword,
      },
      {
        where: {
          id: userId,
        },
      },
    );

    return true;
  }

  async setPassword(email, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await sequelize.models.User.update(
      { hashedPassword },
      { 
        where: { email },
        fields: ['hashedPassword']
      }
    );

    return true;
  }

  async sendEmail(email, token) {
    const params = {
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Body: {
          Text: {
            Data:
              `¡Bienvenido a FAENA!\n\n Establece tu contraseña de FAENA ingresando al siguiente enlace: \n\n${process.env.CONSTRUAPP_HOST}/new_password?flow=set&token=` +
              token,
          },
        },
        Subject: {
          Data: "Establecer contraseña FAENA",
        },
      },
      Source: process.env.RECIPIENT_MAIL,
    };

    await ses.sendEmail(params).promise();
  }

  async sendChangePasswordEmail(email, token) {
    const params = {
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Body: {
          Text: {
            Data:
              `¡Hola! \n\n Cambia tu contraseña de FAENA ingresando al siguiente enlace: \n\n${process.env.CONSTRUAPP_HOST}/new_password?flow=change&token=` +
              token,
          },
        },
        Subject: {
          Data: "Cambio de contraseña FAENA",
        },
      },
      Source: process.env.RECIPIENT_MAIL,
    };

    await ses.sendEmail(params).promise();
  }

  async updateUser(userId, userData) {
    const transaction = await sequelize.transaction();
    try {
      const emergencyData = userData.emergencia_user
        ? userData.emergencia_user[0]
        : null;
      delete userData.emergencia_user;

      if (userData.hashedPassword && userData.hashedPassword.trim() !== "") {
        userData.hashedPassword = await bcrypt.hash(
          userData.hashedPassword,
          10,
        );
      } else {
        delete userData.hashedPassword; // No actualices la contraseña si no se proporciona
      }

      // Manejo de las fechas
      if (
        userData.passwordExpirationDate &&
        userData.passwordExpirationDate.trim() !== ""
      ) {
        const parsedDate = new Date(userData.passwordExpirationDate);
        if (!isNaN(parsedDate.getTime())) {
          userData.passwordExpirationDate = parsedDate.toISOString();
        } else {
          throw new Error("Invalid passwordExpirationDate");
        }
      } else {
        delete userData.passwordExpirationDate; // Elimina el campo si no es válido
      }

      if (userData.fecha_de_nacimiento) {
        const parsedDate = new Date(userData.fecha_de_nacimiento);
        if (!isNaN(parsedDate.getTime())) {
          userData.fecha_de_nacimiento = parsedDate;
        } else {
          throw new Error("Invalid fecha_de_nacimiento");
        }
      }

      if (userData.ultimo_acceso) {
        const parsedDate = new Date(userData.ultimo_acceso);
        if (!isNaN(parsedDate.getTime())) {
          userData.ultimo_acceso = parsedDate;
        } else {
          throw new Error("Invalid ultimo_acceso");
        }
      }

      const [updatedRowsCount, updatedRows] =
        await sequelize.models.User.update(userData, {
          where: { id: userId },
          returning: true,
          transaction,
        });

      if (updatedRowsCount === 0) {
        throw new CustomHttpError(404, "Usuario no encontrado");
      }

      if (emergencyData) {
        const emergencyUpdateData = {
          cod_telefono: emergencyData.cod_telefono,
          telefono: emergencyData.telefono,
          id_relacion: emergencyData.id_relacion,
          nombre_contacto: emergencyData.nombre_contacto,
          correo: emergencyData.correo,
        };

        const [updatedEmergencyRowsCount] =
          await sequelize.models.Emergencia.update(emergencyUpdateData, {
            where: { id_user: userId },
            returning: true,
            transaction,
          });

        if (updatedEmergencyRowsCount === 0) {
          await sequelize.models.Emergencia.create(
            {
              ...emergencyUpdateData,
              id_user: userId,
            },
            { transaction },
          );
        }
      }

      await transaction.commit();

      return {
        user: updatedRows[0],
        emergency: emergencyData,
      };
    } catch (error) {
      await transaction.rollback();
      console.error("Error updating user:", error);
      throw error;
    }
  }

  async getUserById(userId) {
    return await sequelize.models.User.findByPk(userId, {
      attributes: [
        "id",
        "names",
        "apellido_p",
        "apellido_m",
        "email",
        "hashedPassword",
      ],
    });
  }
  async updateGoogleTokens(userId, accessToken, refreshToken) {
    return await sequelize.models.User.update(
      {
        google_access_token: accessToken,
        google_refresh_token: refreshToken,
      },
      {
        where: { id: userId },
      },
    );
  }
  async getUserallById(userId) {
    try {
      const user = await sequelize.models.User.findByPk(userId, {
        include: [
          {
            model: sequelize.models.Organizacion,
            as: "organizacion", // Asegúrate de que este alias coincida con el que definiste en la relación
          },
          {
            model: sequelize.models.Rol,
            as: "roles", // Asegúrate de que este alias coincida con el que definiste en la relación
          },
        ],
      });
      return user;
    } catch (error) {
      throw error;
    }
  }

  async getUserByIdInternalupdate(userId) {
    try {
      const user = await sequelize.models.User.findByPk(userId, {
        include: [
          {
            model: sequelize.models.Emergencia,
            as: "emergencia_user",
          },
          {
            association: "documents",
            attributes: ["link", "documentTypeId"],
          },
        ],
      });
      return user;
    } catch (error) {
      throw error;
    }
  }

  //consulta sql, obtencion de usuarios menos nuestro id y name.
  async getUsernotid(userId) {
    try {
      const user = await sequelize.models.User.findAll({
        where: {
          id: {
            [Op.not]: userId,
          },
        },
        attributes: ["id", "names", "apellido_p", "apellido_m"],
      });
      return user;
    } catch (error) {
      throw error;
    }
  }

  async getUserContratista() {
    try {
      const roles = await sequelize.models.Rol.findAll({
        where: {
          name: "contratista",
        },
        attributes: ["id", "name"],
      });

      // Array para almacenar los IDs de los roles encontrados
      const roleIds = roles.map((role) => role.id);

      // Encuentra las relaciones entre usuarios y roles con los IDs de los roles encontrados
      const user_roles = await sequelize.models.UserRol.findAll({
        where: {
          rolId: roleIds,
        },
        attributes: ["userId", "rolId"],
      });

      // Array para almacenar los IDs de los usuarios encontrados
      const userIds = user_roles.map((user_role) => user_role.userId);

      // Encuentra los usuarios correspondientes a los IDs de usuario encontrados
      const users = await sequelize.models.User.findAll({
        where: {
          id: userIds,
        },
        attributes: ["id", "names", "apellido_p", "apellido_m"],
      });

      return users;
    } catch (error) {
      console.error("Error en getUserRoleById:", error);
      throw new Error("Error al obtener los roles de la base de datos");
    }
  }

  async getUserInspector() {
    try {
      // Encuentra los usuarios que tengan el rol de 'inspector' utilizando las asociaciones con UserRol
      const users_inspector = await sequelize.models.User.findAll({
        include: [
          {
            model: sequelize.models.Rol, // Relación con Rol
            as: "roles", // Alias definido en la asociación entre User y Rol a través de UserRol
            where: { name: "inspector" }, // Filtro por nombre del rol
            attributes: [], // No necesitamos los atributos del Rol, solo filtramos por él
            through: {
              attributes: [], // No queremos incluir atributos de la tabla intermedia UserRol
            },
          },
        ],
        attributes: ["id", "names", "apellido_p", "apellido_m"], // Solo obtener los atributos necesarios de User
      });

      return users_inspector;
    } catch (error) {
      console.error("Error en getUserInspector:", error);
      throw new Error("Error al obtener los usuarios con el rol de inspector");
    }
  }

  async getUsersuperintendente() {
    try {
      // Encuentra los usuarios que tengan el rol de 'superintendente' utilizando las asociaciones con UserRol
      const users_superint = await sequelize.models.User.findAll({
        include: [
          {
            model: sequelize.models.Rol, // Relación con Rol
            as: "roles", // Alias definido en la asociación entre User y Rol a través de UserRol
            where: { name: "superintendente" }, // Filtro por nombre del rol
            attributes: [], // No necesitamos los atributos del Rol, solo filtramos por él
            through: {
              attributes: [], // No queremos incluir atributos de la tabla intermedia UserRol
            },
          },
        ],
        attributes: ["id", "names", "apellido_p", "apellido_m"], // Solo obtener los atributos necesarios de User
      });

      return users_superint;
    } catch (error) {
      console.error("Error en getUsersuperintendente:", error);
      throw new Error(
        "Error al obtener los usuarios con el rol de superintendente",
      );
    }
  }

  async getUserITO() {
    try {
      // Encuentra los usuarios que tengan el rol de 'inspector' utilizando las asociaciones con UserRol
      const users_inspector = await sequelize.models.User.findAll({
        include: [
          {
            model: sequelize.models.Rol, // Relación con Rol
            as: "roles", // Alias definido en la asociación entre User y Rol a través de UserRol
            where: { name: "ITO" }, // Filtro por nombre del rol
            attributes: [], // No necesitamos los atributos del Rol, solo filtramos por él
            through: {
              attributes: [], // No queremos incluir atributos de la tabla intermedia UserRol
            },
          },
        ],
        attributes: ["id", "names", "apellido_p", "apellido_m"], // Solo obtener los atributos necesarios de User
      });

      return users_inspector;
    } catch (error) {
      console.error("Error en getUserInspector:", error);
      throw new Error("Error al obtener los usuarios con el rol de ITO");
    }
  }

  async getUserplanner() {
    try {
      // Encuentra los usuarios que tengan el rol de 'inspector' utilizando las asociaciones con UserRol
      const users_inspector = await sequelize.models.User.findAll({
        include: [
          {
            model: sequelize.models.Rol, // Relación con Rol
            as: "roles", // Alias definido en la asociación entre User y Rol a través de UserRol
            where: { name: "planner" }, // Filtro por nombre del rol
            attributes: [], // No necesitamos los atributos del Rol, solo filtramos por él
            through: {
              attributes: [], // No queremos incluir atributos de la tabla intermedia UserRol
            },
          },
        ],
        attributes: ["id", "names", "apellido_p", "apellido_m"], // Solo obtener los atributos necesarios de User
      });

      return users_inspector;
    } catch (error) {
      console.error("Error en getUserInspector:", error);
      throw new Error("Error al obtener los usuarios con el rol de ITO");
    }
  }

  async getUsersupervisor() {
    try {
      // Encuentra los usuarios que tengan el rol de 'inspector' utilizando las asociaciones con UserRol
      const users_inspector = await sequelize.models.User.findAll({
        include: [
          {
            model: sequelize.models.Rol, // Relación con Rol
            as: "roles", // Alias definido en la asociación entre User y Rol a través de UserRol
            where: { name: "supervisor" }, // Filtro por nombre del rol
            attributes: [], // No necesitamos los atributos del Rol, solo filtramos por él
            through: {
              attributes: [], // No queremos incluir atributos de la tabla intermedia UserRol
            },
          },
        ],
        attributes: ["id", "names", "apellido_p", "apellido_m"], // Solo obtener los atributos necesarios de User
      });

      return users_inspector;
    } catch (error) {
      console.error("Error en getUserInspector:", error);
      throw new Error("Error al obtener los usuarios con el rol de ITO");
    }
  }
  async getUsersadmincontrato() {
    try {
      // Encuentra los usuarios que tengan el rol de 'inspector' utilizando las asociaciones con UserRol
      const users_inspector = await sequelize.models.User.findAll({
        include: [
          {
            model: sequelize.models.Rol, // Relación con Rol
            as: "roles", // Alias definido en la asociación entre User y Rol a través de UserRol
            where: { name: "administrador de contrato" }, // Filtro por nombre del rol
            attributes: [], // No necesitamos los atributos del Rol, solo filtramos por él
            through: {
              attributes: [], // No queremos incluir atributos de la tabla intermedia UserRol
            },
          },
        ],
        attributes: ["id", "names", "apellido_p", "apellido_m"], // Solo obtener los atributos necesarios de User
      });

      return users_inspector;
    } catch (error) {
      console.error("Error en getUserInspector:", error);
      throw new Error("Error al obtener los usuarios con el rol de ITO");
    }
  }

  async getUserprevencionista() {
    try {
      // Encuentra los usuarios que tengan el rol de 'inspector' utilizando las asociaciones con UserRol
      const users_inspector = await sequelize.models.User.findAll({
        include: [
          {
            model: sequelize.models.Rol, // Relación con Rol
            as: "roles", // Alias definido en la asociación entre User y Rol a través de UserRol
            where: { name: "prevencionista" }, // Filtro por nombre del rol
            attributes: [], // No necesitamos los atributos del Rol, solo filtramos por él
            through: {
              attributes: [], // No queremos incluir atributos de la tabla intermedia UserRol
            },
          },
        ],
        attributes: ["id", "names", "apellido_p", "apellido_m"], // Solo obtener los atributos necesarios de User
      });

      return users_inspector;
    } catch (error) {
      console.error("Error en getUserInspector:", error);
      throw new Error("Error al obtener los usuarios con el rol de ITO");
    }
  }

  async assignRoles(userId, roleIds) {
    const transaction = await sequelize.transaction();

    try {
      // Elimina los roles existentes del usuario
      await sequelize.models.UserRol.destroy({
        where: { userId: userId },
        transaction,
      });

      // Asigna los nuevos roles al usuario
      for (const roleId of roleIds) {
        await sequelize.models.UserRol.create(
          { userId: userId, rolId: roleId },
          { transaction },
        );
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async updateInactiveUsers(cutoffDate) {
    try {
      await sequelize.models.User.update(
        { id_estado_cuenta: 2 }, // Ajusta el valor según tu lógica de negocio
        {
          where: {
            ultimo_acceso: {
              [Op.lt]: cutoffDate,
            },
          },
        },
      );
    } catch (error) {
      throw error;
    }
  }

  async updatePasswordTemp(userId, hashedPassword, expirationDate) {
    return await sequelize.models.User.update(
      {
        hashedPassword,
        isTemporaryPassword: false,
        passwordExpirationDate: expirationDate,
      },
      { where: { id: userId } },
    );
  }

  async getUserByIdverify(userId) {
    const user = await sequelize.models.User.findByPk(userId);
    return user;
  }

  // SOCKET USERS

  async getUsersByIds(ids) {
    return await sequelize.models.User.findAll({
      where: { id: ids },
      include: [
        {
          association: "roles", // Asegúrate de que el nombre de la asociación sea correcto
          attributes: ["name"],
        },
        {
          association: "user_grupo",
        },
        {
          association: "user_puesto",
        },
        {
          association: "organizacion",
        },
      ],
    });
  }

  async getlistuser() {
    try {
      const listuser = await sequelize.models.User.findAll({
        attributes: [
          "id",
          "names",
          "apellido_p",
          "apellido_m",
          "email",
          "telefono",
        ],
        order: [["id", "ASC"]],
      });
      return listuser;
    } catch (error) {
      throw response(
        500,
        "Error al obtener la lista de usuarios de la base de datos",
      );
    }
  }

  async createUserLogin(data) {
    try {
      // Verificar que el User-Agent esté disponible
      const userAgent = data.user_agent || "unknown";
      console.log("User-Agent recibido:", userAgent);

      // Instanciar UAParser con el User-Agent recibido
      const parser = new UAParser();
      parser.setUA(userAgent);

      // Obtener la información del navegador, sistema operativo y dispositivo
      const browserInfo = parser.getBrowser(); // { name: "Chrome", version: "91.0.4472.124" }
      const osInfo = parser.getOS(); // { name: "Windows", version: "10" }
      const deviceInfo = parser.getDevice(); // { vendor: "Apple", model: "iPhone", type: "mobile" }

      // Obtener la geolocalización utilizando ipinfo.io
      let geoLocationData = null;
      if (data.ip_address) {
        geoLocationData = await fetch(
          `https://ipinfo.io/${data.ip_address}/geo?token=${process.env.IPINFO_ACCESS_TOKEN}`,
        )
          .then((res) => res.json())
          .catch((error) => {
            console.error("Error fetching geolocation data:", error);
            return null; // Manejo en caso de error
          });
      }

      // Preparar los datos para guardarlos en la base de datos
      const userLoginData = {
        user_id: data.user_id,
        status: data.status,
        ip_address: data.ip_address,
        user_agent: userAgent,
        country: geoLocationData ? geoLocationData.country : null,
        region: geoLocationData ? geoLocationData.region : null,
        city: geoLocationData ? geoLocationData.city : null,
        latitude: geoLocationData ? geoLocationData.loc.split(",")[0] : null,
        longitude: geoLocationData ? geoLocationData.loc.split(",")[1] : null,
        session_id: data.session_id || null,
        device_type: deviceInfo.type || "Desktop",
        os: `${osInfo.name || "unknown"} ${osInfo.version || "unknown"}`,
        browser: `${browserInfo.name || "unknown"} ${browserInfo.version || "unknown"}`,
        login_method: data.login_method,
        failure_reason: data.failure_reason || null,
        login_attempts: data.login_attempts || 1,
        successful_attempt: data.successful_attempt || false,
        is_2fa_used: data.is_2fa_used || false,
        referrer_url: data.referrer_url || null,
      };

      const userLogin = await sequelize.models.user_login.create(userLoginData);
      //  console.log("Se registró:", userLoginData);
      return userLogin;
    } catch (error) {
      console.error("Error creating user login record:", error.message);
      throw new Error("Error creating user login record: " + error.message);
    }
  }

  async updateLastAccess(userId) {
    // Obtener la fecha actual en UTC
    const now = new Date();

    // Ajustar la fecha para la zona horaria local
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);

    // Formatear la fecha como YYYY-MM-DD
    const formattedDate = localDate.toISOString().split("T")[0];

    try {
      // Usar una consulta SQL directa para asegurarnos de que la actualización se realice correctamente
      const query = `UPDATE "user" SET "ultimo_acceso" = '${formattedDate}' WHERE "id" = ${userId}`;

      const result = await sequelize.query(query, {
        type: sequelize.QueryTypes.UPDATE,
      });

      return result;
    } catch (error) {
      console.error("Error al actualizar último acceso:", error);
      throw error;
    }
  }

  async getInternalUsers() {
    try {
      const internos = await sequelize.models.Interno.findAll({
        attributes: ['id_usuario']
      });
      const userIds = internos.map(i => i.id_usuario);

      if (userIds.length === 0) {
        return [];
      }

      return await sequelize.models.User.findAll({
        where: { id: { [Op.in]: userIds } },
        attributes: [
          "id", "names", "apellido_p", "apellido_m", "email", "genero",
          "fecha_de_nacimiento", "telefono", "direccion", "rut", "puesto", "ultimo_acceso"
        ],
        include: [
          { association: "user_estado", attributes: ["nombre_estado_cuenta"] },
          { association: "user_puesto", attributes: ["nombre_puesto"] },
          { association: "user_grupo", attributes: ["nombre_grupo"] },
          { association: "roles", attributes: ["name"] },
          { association: "organizacion", attributes: ["nombre"] },
          {
            association: "documents",
            attributes: ["link"],
            include: [{
              association: "documentType",
              attributes: ["name"],
              where: { name: "Foto de perfil usuario" },
            }],
          }
        ],
      });
    } catch (error) {
      throw error;
    }
  }

  async getExternalUsers() {
    try {
      const externos = await sequelize.models.Externo.findAll({
        attributes: ['id_usuario']
      });
      const userIds = externos.map(e => e.id_usuario);

      if (userIds.length === 0) {
        return [];
      }
      
      return await sequelize.models.User.findAll({
        where: { id: { [Op.in]: userIds } },
        attributes: [
          "id", "names", "apellido_p", "apellido_m", "email", "genero",
          "fecha_de_nacimiento", "telefono", "direccion", "rut", "puesto", "ultimo_acceso"
        ],
        include: [
          { association: "user_estado", attributes: ["nombre_estado_cuenta"] },
          { association: "user_puesto", attributes: ["nombre_puesto"] },
          { association: "user_grupo", attributes: ["nombre_grupo"] },
          { association: "roles", attributes: ["name"] },
          { association: "organizacion", attributes: ["nombre"] },
          {
            association: "documents",
            attributes: ["link"],
            include: [{
              association: "documentType",
              attributes: ["name"],
              where: { name: "Foto de perfil usuario" },
            }],
          }
        ],
      });
    } catch (error) {
      throw error;
    }
  }

  async getrolITO() {
    try {
      const users_ito = await sequelize.models.User.findAll({
        include: [
          {
            model: sequelize.models.Rol,
            as: "roles",
            where: { name: "ITO" },
            attributes: [],
            through: {
              attributes: [],
            },
          },
        ],
        attributes: ["id", "names", "apellido_p", "apellido_m"],
      });

      return users_ito;
    } catch (error) {
      console.error("Error en getrolITO:", error);
      throw new Error("Error al obtener los usuarios con el rol de ITO");
    }
  }

  async deleteUser(userId) {
    const transaction = await sequelize.transaction();
    
    try {
      // Verificar que el usuario existe
      const user = await sequelize.models.User.findByPk(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Eliminar TODOS los registros asociados al usuario sin transferir

      // Eliminar Partidas del usuario
      await sequelize.models.Partida.destroy({
        where: { id_usuario: userId },
        transaction
      });

      // Eliminar Subpartidas del usuario
      await sequelize.models.Subpartida.destroy({
        where: { id_usuario: userId },
        transaction
      });

      // Eliminar Eventos del usuario
      await sequelize.models.Evento.destroy({
        where: { id_usuario: userId },
        transaction
      });

      // Eliminar Minas del usuario
      await sequelize.models.Mine.destroy({
        where: { id_usuario: userId },
        transaction
      });

      // Eliminar TareaResponsable del usuario
      await sequelize.models.TareaResponsable.destroy({
        where: { id_usuario: userId },
        transaction
      });

      // Eliminar roles asociados al usuario
      await sequelize.models.UserRol.destroy({
        where: { userId: userId },
        transaction
      });

      // Eliminar registros de user_project
      await sequelize.models.UserProject.destroy({
        where: { userId: userId },
        transaction
      });

      // Eliminar registros de user_login
      await sequelize.models.user_login.destroy({
        where: { user_id: userId },
        transaction
      });

      // Eliminar registros de UserChartSettings
      await sequelize.models.UserChartSettings.destroy({
        where: { userId: userId },
        transaction
      });

      // Eliminar registros de Externo e Interno
      await sequelize.models.Externo.destroy({
        where: { id_usuario: userId },
        transaction
      });

      await sequelize.models.Interno.destroy({
        where: { id_usuario: userId },
        transaction
      });

      // Finalmente, eliminar el usuario
      await sequelize.models.User.destroy({
        where: { id: userId },
        transaction
      });

      await transaction.commit();
      return { 
        success: true, 
        message: 'Usuario eliminado correctamente✅' 
      };
    } catch (error) {
      await transaction.rollback();
      console.error('Error al eliminar usuario:', error);
      throw error;
    }
  }
}

module.exports = new UserRepository();
