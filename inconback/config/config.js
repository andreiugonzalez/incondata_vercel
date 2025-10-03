// config.js - Configuración centralizada para Sequelize CLI y la app usando variables de entorno
// Compatible con Sequelize CLI: exporta un objeto con las claves development, test y production.
// Así puedes eliminar config.json y usar solo este archivo con variables de entorno.
// ¡No olvides correr los comandos del CLI con --config config/config.js!

require("dotenv").config();

module.exports = {
  // Configuración para el entorno de desarrollo
  development: {
    // Usuario de la base de datos, limpiando posibles comillas
    username: process.env.CONSTRUAPP_PSQL_USER.replace(/"/g, ""),
    // Contraseña de la base de datos, limpiando posibles comillas
    password: process.env.CONSTRUAPP_PSQL_PASSWORD.replace(/"/g, ""),
    // Nombre de la base de datos, limpiando posibles comillas
    database: process.env.CONSTRUAPP_PSQL_BD.replace(/"/g, ""),
    // Host de la base de datos, limpiando posibles comillas
    host: process.env.CONSTRUAPP_PSQL_HOST.replace(/"/g, ""),
    // Puerto de la base de datos, convertido a número y limpiando posibles comillas
    port: parseInt(process.env.CONSTRUAPP_PSQL_PORT.replace(/"/g, ""), 10),
    // Motor de base de datos utilizado
    dialect: "postgres",
    // // Opciones adicionales para la conexión, en este caso SSL
    // dialectOptions: {
    //   ssl: {
    //     require: true, // Fuerza el uso de SSL
    //     rejectUnauthorized: false, // Permite certificados no verificados (ojo en producción)
    //   },
    // },
  },
  // Puedes copiar la config de development y cambiar variables para test y production si lo necesitas
  test: {
    username: process.env.CONSTRUAPP_PSQL_USER.replace(/"/g, ""),
    password: process.env.CONSTRUAPP_PSQL_PASSWORD.replace(/"/g, ""),
    database: process.env.CONSTRUAPP_PSQL_BD.replace(/"/g, ""),
    host: process.env.CONSTRUAPP_PSQL_HOST.replace(/"/g, ""),
    port: parseInt(process.env.CONSTRUAPP_PSQL_PORT.replace(/"/g, ""), 10),
    dialect: "postgres",
    // dialectOptions: {
    //   ssl: {
    //     require: true,
    //     rejectUnauthorized: false,
    //   },
    // },
  },
  production: {
    username: process.env.CONSTRUAPP_PSQL_USER.replace(/"/g, ""),
    password: process.env.CONSTRUAPP_PSQL_PASSWORD.replace(/"/g, ""),
    database: process.env.CONSTRUAPP_PSQL_BD.replace(/"/g, ""),
    host: process.env.CONSTRUAPP_PSQL_HOST.replace(/"/g, ""),
    port: parseInt(process.env.CONSTRUAPP_PSQL_PORT.replace(/"/g, ""), 10),
    dialect: "postgres",
    // dialectOptions: {
    //   ssl: {
    //     require: true,
    //     rejectUnauthorized: false,
    //   },
    // },
  },
};
