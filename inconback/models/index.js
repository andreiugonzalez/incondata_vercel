"use strict";

// Loader de modelos Sequelize. Inicializa todos los modelos y sus relaciones.
// Ahora usando config.js para variables de entorno y máxima seguridad.

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const process = require("process");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";

// Carga la configuración de la base de datos según el entorno desde config.js
// Así puedes manejar todo con variables de entorno y olvidarte del config.json
const config = require(__dirname + "/../config/config.js")[env];
const db = {};

let sequelize;
// Permite usar una variable de entorno para la conexión si está definida.
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config,
  );
}

// Lee todos los archivos de modelos en la carpeta y los inicializa.
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && // Ignora archivos ocultos
      file !== basename && // Ignora este mismo archivo (index.js)
      file.slice(-3) === ".js" && // Solo archivos .js
      file.indexOf(".test.js") === -1 // Ignora archivos de test
    );
  })
  .forEach((file) => {
    // Inicializa el modelo y lo agrega al objeto db
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes,
    );
    db[model.name] = model;
  });

// Configura las asociaciones entre modelos si existen
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Exporta la instancia de Sequelize y todos los modelos
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
