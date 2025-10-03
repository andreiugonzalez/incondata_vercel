const { Sequelize } = require("sequelize");
const logger = require("./logger"); // Importa el logger configurado con Winston

// Saneamos variables de entorno para evitar comillas y tipos inválidos
const DB_NAME = String(process.env.CONSTRUAPP_PSQL_BD || "").replace(/"/g, "");
const DB_USER = String(process.env.CONSTRUAPP_PSQL_USER || "").replace(/"/g, "");
const DB_PASS = String(process.env.CONSTRUAPP_PSQL_PASSWORD || "").replace(/"/g, "");
const DB_HOST = String(process.env.CONSTRUAPP_PSQL_HOST || "").replace(/"/g, "");
const DB_PORT = parseInt(String(process.env.CONSTRUAPP_PSQL_PORT || "5432").replace(/"/g, ""), 10);

let sequelize;

// Si falta algún dato crítico (incluida contraseña), usar respaldo
if (!DB_NAME || !DB_USER || !DB_HOST || !DB_PORT || !DB_PASS) {
  try {
    // Preferimos config.json con credenciales estáticas si existe
    const cfgJson = require("../../config/config.json");
    const env = process.env.NODE_ENV || "development";
    const cfgStatic = cfgJson[env] || cfgJson.development;
    if (cfgStatic && cfgStatic.database && cfgStatic.username) {
      sequelize = new Sequelize(
        cfgStatic.database,
        cfgStatic.username,
        cfgStatic.password,
        {
          host: cfgStatic.host,
          port: cfgStatic.port,
          dialect: cfgStatic.dialect || "postgres",
          logging: false,
          dialectOptions: cfgStatic.dialectOptions,
        },
      );
    } else {
      // Como segundo respaldo, intentar con config.js (variables de entorno)
      const cfgEnv = require("../../config/config.js")[env];
      sequelize = new Sequelize(
        cfgEnv.database,
        cfgEnv.username,
        cfgEnv.password,
        cfgEnv,
      );
    }
  } catch (e) {
    // Fallback mínimo con los valores actuales aunque estén vacíos
    sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
      host: DB_HOST,
      port: DB_PORT,
      dialect: "postgres",
      logging: false,
    });
  }
} else {
  sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: "postgres",
    logging: false,
  });
}

module.exports = sequelize;
