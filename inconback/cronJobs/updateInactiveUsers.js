const userRepository = require("../src/repositories/user.repository"); // Asegúrate de que la ruta sea correcta

const { Op } = require("sequelize"); // Operadores de Sequelize (no se usan directamente aquí, pero pueden ser útiles en el repo)
const cron = require("node-cron"); // Librería para programar tareas automáticas (cron jobs)

const shouldScheduleUpdate = false; // Cambia a true para activar la tarea programada. Útil para ambientes de desarrollo o producción.

// Función que busca y actualiza usuarios inactivos según un período de inactividad definido.
// Por defecto, considera inactivos a quienes no han tenido actividad en los últimos 30 segundos.
// Puedes ajustar el tiempo cambiando la constante THIRTY_SECONDS por otra (ver ejemplos abajo).
const updateInactiveUsers = async () => {
  // Período de inactividad (actualmente 30 segundos)
  const THIRTY_SECONDS = 30 * 1000; // 30 segundos en milisegundos
  const cutoffDate = new Date(Date.now() - THIRTY_SECONDS);

  // Ejemplos de otros períodos de inactividad:
  // const ONE_MINUTE = 60 * 1000; // 1 minuto
  // const ONE_HOUR = 60 * 60 * 1000; // 1 hora
  // const ONE_DAY = 24 * 60 * 60 * 1000; // 1 día

  // Para usar otro período, reemplaza THIRTY_SECONDS por la constante que quieras:
  // const cutoffDate = new Date(Date.now() - ONE_MINUTE);

  try {
    // Llama al repositorio para actualizar usuarios cuya última actividad es anterior a la fecha de corte.
    await userRepository.updateInactiveUsers(cutoffDate);
    console.log("Usuarios inactivos actualizados correctamente.");
  } catch (err) {
    console.error("Error actualizando usuarios inactivos:", err);
  }
};

// Formato de expresión cron para node-cron:
// ┌────────────── segundo (0 - 59)
// │ ┌──────────── minuto (0 - 59)
// │ │ ┌────────── hora (0 - 23)
// │ │ │ ┌──────── día del mes (1 - 31)
// │ │ │ │ ┌────── mes (1 - 12) (o nombres)
// │ │ │ │ │ ┌──── día de la semana (0 - 7) (0 o 7 es domingo, o nombres)
// │ │ │ │ │ │
// *  *  *  *  * *

// Función que programa la tarea automática para actualizar usuarios inactivos.
// Usa node-cron para definir cada cuánto se ejecuta la función updateInactiveUsers.
// El flag shouldScheduleUpdate permite activar/desactivar la tarea fácilmente.
const scheduleInactiveUsersUpdate = async () => {
  if (!shouldScheduleUpdate) {
    console.log(
      "La programación de actualización de usuarios inactivos está desactivada.",
    );
    return;
  }

  // Importa chalk dinámicamente para colorear los logs en consola.
  const chalk = (await import("chalk")).default;
  // Programa la tarea para que corra cada 30 segundos.
  cron.schedule("*/30 * * * * *", async () => {
    // Cada 30 segundos
    console.log(
      chalk.blue(
        "---------------------------------------------------------------------",
      ),
    );
    console.log(
      chalk.yellow(
        "Ejecutando tarea programada para actualizar usuarios inactivos.",
      ),
    );

    await updateInactiveUsers();

    const currentDate = new Date();
    console.log(
      chalk.cyan("Hora actual del servidor:"),
      chalk.white(currentDate.toLocaleString()),
    );

    console.log(
      chalk.blue(
        "---------------------------------------------------------------------",
      ),
    );
  });

  // Ejemplos adicionales de expresiones cron (descomenta el que necesites):

  // Cada minuto
  // cron.schedule('* * * * *', () => {
  //     console.log('Ejecutando tarea cada minuto.');
  //     updateInactiveUsers();
  // });

  // Cada 5 minutos
  // cron.schedule('*/5 * * * *', () => {
  //     console.log('Ejecutando tarea cada 5 minutos.');
  //     updateInactiveUsers();
  // });

  // Cada hora
  // cron.schedule('0 * * * *', () => {
  //     console.log('Ejecutando tarea cada hora.');
  //     updateInactiveUsers();
  // });

  // Cada día a la medianoche
  // cron.schedule('0 0 * * *', () => {
  //     console.log('Ejecutando tarea cada día a la medianoche.');
  //     updateInactiveUsers();
  // });

  // Cada lunes a la medianoche
  // cron.schedule('0 0 * * 1', () => {
  //     console.log('Ejecutando tarea cada lunes a la medianoche.');
  //     updateInactiveUsers();
  // });

  // Cada primer día del mes a la medianoche
  // cron.schedule('0 0 1 * *', () => {
  //     console.log('Ejecutando tarea cada primer día del mes a la medianoche.');
  //     updateInactiveUsers();
  // });
};

// Exporta la función para que pueda ser utilizada en el punto de entrada de la app o donde se requiera.
module.exports = scheduleInactiveUsersUpdate;
