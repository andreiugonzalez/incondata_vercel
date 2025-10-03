const { sequelize } = require("../config/sequelize-config");
const { CustomHttpError } = require("../errors/customError");
const FolderRepository = require("../repositories/folder.repository");

const { v4: uuidv4 } = require("uuid");
const moment = require("moment");
const { Sequelize, Op } = require("sequelize");

class PartidasRepository {
  async createPartida(partida) {
    const projectId = partida.id_proyecto;

    // Ahora, creamos la partida en la base de datos
    const partidaCreated = await sequelize.models.Partida.create(partida);

    console.log("partidaCreated:", partidaCreated);

    const id_objeto_creado = partidaCreated.id_partida;

    const relacion = partidaCreated.id_partida;

    const id_user = partidaCreated.id_usuario;

    // Verificar o crear la carpeta del proyecto y su estructura
    const folderId = await FolderRepository.checkAndCreateFolderStructure(
      projectId,
      partida.nombre_partida,
      "partida",
      id_objeto_creado,
      relacion,
      id_user,
    );

    console.log("el id creado es : ", id_objeto_creado);

    return partidaCreated;
  }

  //aca el insert a historico de partida, bastante sencillo.
  async createPartidahistory(partidahistory) {
    const partidaInsert =
      await sequelize.models.Historico_partida.create(partidahistory);
    return partidaInsert;
  }

  async getPartidaById(partidaId) {
    try {
      const partida = await sequelize.models.Partida.findOne({
        where: { id_partida: partidaId },
      });

      if (!partida) {
        throw new Error(`Partida con id ${partidaId} no encontrada`);
      }

      return partida;
    } catch (error) {
      console.error("Error al obtener la partida por ID:", error);
      throw error;
    }
  }

  //aca el insert a historico de partida, bastante sencillo.
  async findPartidahistorico(id) {
    const partida = await sequelize.models.Partida.findOne({
      where: { id_partida: id },
    });
    console.log("encontrados en la db ", partida);
    return partida;
  }

  async findSubpartidahistorico(id) {
    const subpartida = await sequelize.models.Subpartida.findOne({
      where: { id_subpartida: id },
    });
    console.log("encontrados en la db ", subpartida);
    return subpartida;
  }

  async findTareahistorico(id) {
    const tarea = await sequelize.models.Task.findOne({ where: { id: id } });
    console.log("encontrados en la db ", tarea);
    return tarea;
  }

  async findSubtareahistorico(id) {
    const subtarea = await sequelize.models.Subtask.findOne({
      where: { id_subtask: id },
    });
    console.log("encontrados en la db ", subtarea);
    return subtarea;
  }

  async upsertPartidahistorico(partidahistorico, projectId) {
    try {
      const today = moment().startOf("day").toDate();
      const existingRecord = await sequelize.models.Historico_partida.findOne({
        where: {
          id_partida: partidahistorico.id_partida,
          updatedAt: {
            [Op.gte]: today,
          },
        },
      });

      let record;
      if (existingRecord) {
        // Actualiza el registro existente
        record = await existingRecord.update(partidahistorico);
      } else {
        partidahistorico.createdAt = new Date();
        // Crea un nuevo registro
        record =
          await sequelize.models.Historico_partida.create(partidahistorico);
      }

      // Formatear la fecha para la consulta
      const fechahoy1 = new Date();
      const year1 = fechahoy1.getFullYear();
      const month1 = String(fechahoy1.getMonth() + 1).padStart(2, "0");
      const day1 = String(fechahoy1.getDate()).padStart(2, "0");
      const formatoFechahoy2 = `${year1}-${month1}-${day1}`;

      // Traer histórico de partida
      const historicos = await sequelize.models.Historico_partida.findAll({
        where: {
          id_proyecto: projectId,
          [Op.and]: [
            Sequelize.where(
              Sequelize.fn("TO_CHAR", Sequelize.col("createdAt"), "YYYY-MM-DD"),
              Op.eq,
              formatoFechahoy2,
            ),
          ],
        },
      });

      // Calcular porcentaje de partidas
      function calculoporcentaje_partidas(historicos) {
        let totalcantidad = 0;
        let totalcantidad_acumulada = 0;

        historicos.forEach((historico) => {
          const cantidad = parseFloat(historico.cantidad);
          const cantidad_acumulada = parseFloat(historico.cantidad_acumulada);
          if (!isNaN(cantidad) && !isNaN(cantidad_acumulada)) {
            totalcantidad += cantidad;
            totalcantidad_acumulada += cantidad_acumulada;
          }
        });

        const porcentajetotal_partidas =
          (totalcantidad_acumulada / totalcantidad) * 100;
        return porcentajetotal_partidas.toFixed(2);
      }

      const porcentajetotal_partidas = calculoporcentaje_partidas(historicos);

      await sequelize.models.Project.update(
        { avance: porcentajetotal_partidas },
        { where: { id: projectId } },
      );

      // Devuelve el registro actualizado o creado
      return record;
    } catch (error) {
      console.error("Error en upsertPartidahistorico:", error);
      throw error;
    }
  }

  async upsertSubpartidahistorico(subpartidahistorico) {
    const today = moment().startOf("day").toDate();
    const existingRecord = await sequelize.models.Historico_subpartida.findOne({
      where: {
        id_subpartida: subpartidahistorico.id_subpartida,
        updatedAt: {
          [Op.gte]: today,
        },
      },
    });

    if (existingRecord) {
      await existingRecord.update(subpartidahistorico);
      return existingRecord;
    } else {
      const newRecord =
        await sequelize.models.Historico_subpartida.create(subpartidahistorico);
      return newRecord;
    }
  }

  async upsertTareahistorico(tareahistorico) {
    const today = moment().startOf("day").toDate();
    const existingRecord = await sequelize.models.historico_task.findOne({
      where: {
        id: tareahistorico.id,
        updatedAt: {
          [Op.gte]: today,
        },
      },
    });

    if (existingRecord) {
      await existingRecord.update(tareahistorico);
      return existingRecord;
    } else {
      const newRecord =
        await sequelize.models.historico_task.create(tareahistorico);
      return newRecord;
    }
  }

  async upsertSubtareahistorico(subtareahistorico) {
    const today = moment().startOf("day").toDate();
    const existingRecord = await sequelize.models.historico_subtask.findOne({
      where: {
        id_subtask: subtareahistorico.id_subtask,
        updatedAt: {
          [Op.gte]: today,
        },
      },
    });

    if (existingRecord) {
      await existingRecord.update(subtareahistorico);
      return existingRecord;
    } else {
      const newRecord =
        await sequelize.models.historico_subtask.create(subtareahistorico);
      return newRecord;
    }
  }

  async getPartidasByProject(projectId) {
    const partidas = await sequelize.models.Partida.findAll({
      where: {
        id_proyecto: projectId
      },
      include: [{
        association: 'subpartida_partida',
        include: [{
          association: 'subpartida_tarea',
          include: [{
            association: 'Task_Subtask',
            include: [{
              association: 'material_Subtask'
            }]
          }]
        }]
      }],
      // Aplicar orden basado en las claves foráneas para mantener la jerarquía
      order: [
        ['id_partida', 'ASC'],               // Ordenar las partidas
        ['subpartida_partida', 'id_partida', 'ASC'], // Ordenar subpartidas por id_partida
        ['subpartida_partida', 'subpartida_tarea', 'id_subpartida', 'ASC'], // Ordenar tareas por id_subpartida
        ['subpartida_partida', 'subpartida_tarea', 'Task_Subtask', 'id_task', 'ASC'], // Ordenar subtareas por id_tarea
      ]
    });
  
    return this.convertirArray(partidas);
  }

  convertirArray(array) {
    const resultado = [];

    // Iterar sobre cada objeto del array original
    array.forEach((objeto) => {
      // Convertir el objeto actual al formato deseado y agregarlo al resultado
      const objetoConvertido = this.convertir(objeto.dataValues);
      resultado.push(...objetoConvertido);
    });

    return resultado;
  }

  convertir(objeto) {
    const resultado = [];

    // Crear un objeto para la partida principal
    const partidaPrincipal = {
      id: uuidv4(),
      title: objeto.nombre_partida,
      parentId: null,
      expanded: false,
      isEditing: false,
      type: "partida",
      realId: objeto.id_partida,
    };
    resultado.push(partidaPrincipal);

    // Recorrer las subpartidas
    objeto.subpartida_partida.forEach((subpartida) => {
      const subpartidaObj = {
        id: uuidv4(),
        title: subpartida.nombre_sub_partida,
        parentId: partidaPrincipal.id,
        expanded: false,
        isEditing: false,
        type: "subpartida",
        realId: subpartida.id_subpartida,
        parentRealId: objeto.id_partida,
      };
      resultado.push(subpartidaObj);

      // Recorrer las tareas de la subpartida
      subpartida.subpartida_tarea.forEach((tarea) => {
        const tareaObj = {
          id: uuidv4(),
          title: tarea.nombre,
          parentId: subpartidaObj.id,
          expanded: false,
          isEditing: false,
          type: "tarea",
          realId: tarea.id,
          parentRealId: subpartida.id_subpartida,
        };
        resultado.push(tareaObj);

        // Recorrer las sub-tareas de la tarea
        tarea.Task_Subtask.forEach((subtarea) => {
          const subtareaObj = {
            id: uuidv4(),
            title: subtarea.nombre,
            parentId: tareaObj.id,
            expanded: false,
            isEditing: false,
            type: "subtarea",
            realId: subtarea.id_subtask,
            parentRealId: tarea.id,
          };
          resultado.push(subtareaObj);
        });
      });
    });

    return resultado;
  }

  async getPartidasByProjectStd(projectId) {
    const partidas = await sequelize.models.Partida.findAll({
      where: {
        id_proyecto: projectId,
      },
      include: [
        {
          association: "partida_User",
          attributes: ["id", "username"], // Atributos del usuario asociado a la partida
        },
        {
          association: "subpartida_partida", // Subpartidas asociadas a la partida
          include: [
            {
              association: "subpartida_tarea", // Tareas asociadas a la subpartida
              include: [
                {
                  association: "Task_Subtask", // Subtareas asociadas a la tarea
                  include: [
                    {
                      association: "material_Subtask", // Materiales asociados a la subtarea
                    },
                  ],
                },
                {
                  association: "task_material", // Materiales asociados a la tarea
                },
              ],
            },
            {
              association: "subpartida_material", // Materiales asociados a la subpartida
            },
          ],
        },
        {
          association: "partida_material", // Materiales asociados a la partida
        },
      ],
    });

    partidas.forEach((partida) => {
      partida.dataValues.id = Math.random().toString(36).substr(2, 9);
      partida.subpartida_partida.forEach((subpartida) => {
        subpartida.dataValues.id = Math.random().toString(36).substr(2, 9);
        subpartida.subpartida_tarea.forEach((tarea) => {
          tarea.dataValues.id = tarea.id;
          tarea.Task_Subtask.forEach((subtarea) => {
            subtarea.dataValues.id = Math.random().toString(36).substr(2, 9);
          });
        });
      });
    });

    // console.log(partidas);

    return partidas;
  }

  async getPartidasByProjectStdHistorico(projectId, datesearch) {
    // Verificar que projectId está presente y es un número válido
    if (!projectId || isNaN(Number(projectId))) {
      throw new Error("Invalid or missing projectId");
    }

    // Verificar que datesearch sea una fecha válida
    const searchDate = new Date(datesearch);
    if (isNaN(searchDate.getTime())) {
      throw new Error("Invalid date for datesearch");
    }

    // Calcular el rango de fechas (inicio y fin del día de la búsqueda)
    const nextDay = new Date(searchDate);
    nextDay.setDate(searchDate.getDate() + 1); // Sumar un día para hacer una búsqueda de rango de un día

    try {
      // 1. Consultar historico_partida
      const historicoPartidas =
        await sequelize.models.Historico_partida.findAll({
          where: {
            id_proyecto: projectId,
            createdAt: {
              [Op.gte]: searchDate, // Mayor o igual a la fecha de búsqueda
              [Op.lt]: nextDay, // Menor que el día siguiente (para obtener solo la fecha específica)
            },
          },
        });

      // Obtener ids de las partidas para filtrar en las subpartidas
      const idPartidas = historicoPartidas.map((partida) => partida.id_partida);

      // 2. Consultar historico_subpartida por id_partida
      const historicoSubpartidas =
        await sequelize.models.Historico_subpartida.findAll({
          where: {
            id_partida: {
              [Op.in]: idPartidas,
            },
          },
        });

      // Obtener ids de las subpartidas para filtrar en las tareas
      const idSubpartidas = historicoSubpartidas.map(
        (subpartida) => subpartida.id_subpartida,
      );

      // 3. Consultar historico_task por id_subpartida
      const historicoTareas = await sequelize.models.historico_task.findAll({
        where: {
          id_subpartida: {
            [Op.in]: idSubpartidas,
          },
        },
      });

      // Obtener ids de las tareas para filtrar en las subtareas
      const idTareas = historicoTareas.map((tarea) => tarea.id);

      // 4. Consultar historico_subtask por id_task
      const historicoSubtareas =
        await sequelize.models.historico_subtask.findAll({
          where: {
            id_task: {
              [Op.in]: idTareas,
            },
          },
        });

      // 5. Mapear subtareas a tareas y asignar a 'Task_Subtask'
      const tareasConSubtareas = historicoTareas.map((tarea) => {
        tarea.dataValues.Task_Subtask = historicoSubtareas.filter(
          (subtarea) => subtarea.id_task === tarea.id,
        );
        return tarea;
      });

      // 6. Mapear tareas a subpartidas y asignar a 'subpartida_tarea'
      const subpartidasConTareas = historicoSubpartidas.map((subpartida) => {
        subpartida.dataValues.subpartida_tarea = tareasConSubtareas.filter(
          (tarea) => tarea.id_subpartida === subpartida.id_subpartida,
        );
        return subpartida;
      });

      // 7. Mapear subpartidas a partidas y asignar a 'subpartida_partida'
      const partidasConSubpartidas = historicoPartidas.map((partida) => {
        partida.dataValues.subpartida_partida = subpartidasConTareas.filter(
          (subpartida) => subpartida.id_partida === partida.id_partida,
        );
        return partida;
      });

      // Asignar identificadores únicos si es necesario (opcional)
      partidasConSubpartidas.forEach((partida) => {
        partida.dataValues.id = Math.random().toString(36).substr(2, 9);
        partida.dataValues.subpartida_partida.forEach((subpartida) => {
          subpartida.dataValues.id = Math.random().toString(36).substr(2, 9);
          subpartida.dataValues.subpartida_tarea.forEach((tarea) => {
            tarea.dataValues.id = tarea.id; // Mantener el ID original de la tarea
            tarea.dataValues.Task_Subtask.forEach((subtarea) => {
              subtarea.dataValues.id = Math.random().toString(36).substr(2, 9);
            });
          });
        });
      });

      // 8. Devolver el resultado
      return partidasConSubpartidas;
    } catch (error) {
      console.error("Error fetching historical partidas:", error);
      throw new Error(`Error fetching historical partidas: ${error.message}`);
    }
  }

  async updatePartida(id, partida) {
    console.log("ID partida actualizada :", id);
    console.log("partida actualizada :", partida);

    // const t = await sequelize.transaction();

    try {
      // let folderUpdated = true;

      // if (partida.nombre_partida) {
      //     // Intentamos actualizar las carpetas relacionadas
      //     folderUpdated = await FolderRepository.updateFolderByEntity('partida',id, partida.nombre_partida);

      //     if (!folderUpdated) {
      //         console.log(`No se actualizó ninguna carpeta para la partida ID ${id}. Cancelando la actualización de la partida.`);
      //         throw new Error('No se pudo actualizar ninguna carpeta. La actualización de la partida ha sido cancelada.');
      //     }

      //     console.log(`Carpetas actualizadas para la partida ID ${id} con el nuevo nombre: ${partida.nombre_partida}`);
      // }

      // Si la actualización de las carpetas fue exitosa, actualizamos la partida
      const updatedRows = await sequelize.models.Partida.update(partida, {
        where: { id_partida: id },
        // transaction: t
      });

      // await t.commit();
      return updatedRows[0] > 0; // devuelve true si se actualizaron filas, false en caso contrario
    } catch (error) {
      // await t.rollback();
      console.error(
        "Error al actualizar partida o carpetas en el repositorio:",
        error,
      );
      throw error; // Lanzar el error
    }
  }

  async updatePartidanewpartida(id, partida) {
    try {
      const updatedRows = await sequelize.models.Partida.update(partida, {
        where: { id_partida: id },
      });

      return updatedRows[0] > 0;
    } catch (error) {
      console.error(
        "Error al actualizar partida o carpetas en el repositorio:",
        error,
      );
      throw error;
    }
  }

  async getnivelbytipo(type, realId) {
    // console.log("desde back:", type);
    // console.log("desde back2:", realId);
    switch (type) {
      case "partida":
        const partidas = await sequelize.models.Partida.findOne({
          where: { id_partida: realId },
          attributes: [
            "nombre_partida",
            "id_partida",
            "id_EstadoTarea",
            "prioridad",
            "fecha_inicio",
            "fecha_termino",
            "telefono_user",
            "email_user",
            "porcentaje",
            "precio_total",
            "precio_unit",
            "cantidad",
            "cantidad_acumulada",
            "cantidad_parcial",
          ],
          include: [
            {
              association: "partida_User",
              attributes: [
                "id",
                "names",
                "apellido_p",
                "apellido_m",
                "email",
                "telefono",
              ],
            },
          ],
        });
        return partidas;
      case "subpartida":
        const subpartida = await sequelize.models.Subpartida.findOne({
          where: { id_subpartida: realId },
          attributes: [
            "nombre_sub_partida",
            "id_subpartida",
            "id_EstadoTarea",
            "prioridad",
            "fecha_inicio",
            "fecha_termino",
            "telefono_user",
            "email_user",
            "porcentaje",
            "precio_total",
            "precio_unit",
            "cantidad",
            "cantidad_acumulada",
            "cantidad_parcial",
          ],
          include: [
            {
              association: "Subpartida_User",
              attributes: [
                "id",
                "names",
                "apellido_p",
                "apellido_m",
                "email",
                "telefono",
              ],
            },
          ],
        });
        return subpartida;

      case "tarea":
        const tarea = await sequelize.models.Task.findOne({
          where: { id: realId },
          attributes: [
            "nombre",
            "id",
            "id_EstadoTarea",
            "prioridad",
            "fecha_inicio",
            "fecha_termino",
            "telefono_user",
            "email_user",
            "porcentaje",
            "precio_total",
            "precio_unit",
            "cantidad",
            "cantidad_acumulada",
            "cantidad_parcial",
          ],
          include: [
            {
              association: "user_taks",
              attributes: [
                "id",
                "names",
                "apellido_p",
                "apellido_m",
                "email",
                "telefono",
              ],
            },
          ],
        });
        return tarea;

      case "subtarea":
        const subtarea = await sequelize.models.Subtask.findOne({
          where: { id_subtask: realId },
          attributes: [
            "nombre",
            "id_subtask",
            "id_EstadoTarea",
            "prioridad",
            "fecha_inicio",
            "fecha_termino",
            "telefono_user",
            "email_user",
            "porcentaje",
            "precio_total",
            "precio_unit",
            "cantidad",
            "cantidad_acumu",
            "cantidad_parci",
          ],
          include: [
            {
              association: "user_Subtask",
              attributes: [
                "id",
                "names",
                "apellido_p",
                "apellido_m",
                "email",
                "telefono",
              ],
            },
          ],
        });
        return subtarea;

      default:
        throw new Error("Tipo no válido");
    }
  }

  async getEstadopartida() {
    try {
      const estadotarea = await sequelize.models.EstadoTarea.findAll({
        attributes: ["id_EstadoTarea", "NombreEstadoTarea"],
        order: [["id_EstadoTarea", "ASC"]],
      });
      return estadotarea;
    } catch (error) {
      throw response(
        500,
        "Error al obtener los estados de tareas de la base de datos",
      );
    }
  }
  async getprioridad() {
    try {
      const prioridad = await sequelize.models.Prioridad.findAll({
        attributes: ["id_prioridad", "nombre_prioridad"],
        order: [["id_prioridad", "ASC"]],
      });
      return prioridad;
    } catch (error) {
      throw response(500, "Error al obtener la prioridad de la base de datos");
    }
  }

  async getlisthistory(id) {
    try {
      const partidas = await sequelize.models.Partida.findAll({
        attributes: [
          "id_partida",
          "id_EstadoTarea",
          "porcentaje",
          "fecha_inicio",
          "fecha_termino",
          "horas_maquina",
          "horas_hombre",
        ],
        where: {
          id_proyecto: id,
        },
      });

      const partidaIds = partidas.map((partida) => partida.id_partida);

      const historicos = await sequelize.models.Historico_partida.findAll({
        attributes: [
          "id_historico",
          "id_EstadoTarea",
          "porcentaje",
          "fecha_inicio",
          "fecha_termino",
          "horas_maquina",
          "horas_hombre",
          "id_partida",
          "createdAt",
        ],
        where: {
          id_partida: partidaIds,
          id_proyecto: id,
        },
      });

      const partidasAgrupadas = partidas.map((partida) => ({
        ...partida.toJSON(),
        historicos: historicos.filter(
          (historico) => historico.id_partida === partida.id_partida,
        ),
      }));

      return partidasAgrupadas;
    } catch (error) {
      console.error("Error en getlisthistory:", error);
      throw new Error("Error al obtener los datos de la base de datos");
    }
  }

  async getHistoricoPartida() {
    try {
      return await sequelize.models.Historico_partida.findAll();
    } catch (error) {
      throw new Error("Error fetching historico_partida:", error);
    }
  }

  // Método para obtener todas las subpartidas históricas
  async getHistoricoSubpartida() {
    try {
      return await sequelize.models.Historico_subpartida.findAll();
    } catch (error) {
      throw new Error("Error fetching historico_subpartida:", error);
    }
  }

  // Método para obtener todas las tareas históricas
  async getHistoricoTask() {
    try {
      return await sequelize.models.historico_task.findAll();
    } catch (error) {
      throw new Error("Error fetching historico_task:", error);
    }
  }
  // Método para obtener todas las subtareas históricas
  async getHistoricoSubtask() {
    try {
      return await sequelize.models.historico_subtask.findAll();
    } catch (error) {
      throw new Error("Error fetching historico_subtask:", error);
    }
  }

  // Nuevos métodos para eliminación
  async deletePartida(id) {
    let t;
    try {
      t = await sequelize.transaction();
      console.log(`Iniciando eliminación de partida con ID: ${id}`);
      
      // 1. Obtener la partida con todas sus relaciones
      const partida = await sequelize.models.Partida.findByPk(id, {
        include: [{
          association: 'subpartida_partida',
          include: [{
            association: 'subpartida_tarea',
            include: [{
              association: 'Task_Subtask'
            }]
          }]
        }],
        transaction: t
      });

      if (!partida) {
        throw new Error(`No se encontró la partida con ID: ${id}`);
      }

      // 2. Obtener IDs de todas las entidades relacionadas para eliminar documentos y carpetas
      const subpartidaIds = partida.subpartida_partida.map(sp => sp.id_subpartida);
      const tareaIds = [];
      const subtareaIds = [];
      
      partida.subpartida_partida.forEach(subpartida => {
        subpartida.subpartida_tarea.forEach(tarea => {
          tareaIds.push(tarea.id);
          tarea.Task_Subtask.forEach(subtarea => {
            subtareaIds.push(subtarea.id_subtask);
          });
        });
      });
      
      console.log(`Partida ${id} contiene: ${subpartidaIds.length} subpartidas, ${tareaIds.length} tareas, ${subtareaIds.length} subtareas`);

      // 3. Eliminar documentos asociados a la partida y sus elementos hijos
      const documentWhereClause = { id_partida: id };
      if (subpartidaIds.length > 0) {
        documentWhereClause[Op.or] = [
          { id_partida: id },
          { id_subpartida: { [Op.in]: subpartidaIds } }
        ];
        
        if (tareaIds.length > 0) {
          documentWhereClause[Op.or].push({ id_tarea: { [Op.in]: tareaIds } });
        }
        
        if (subtareaIds.length > 0) {
          documentWhereClause[Op.or].push({ id_subtarea: { [Op.in]: subtareaIds } });
        }
      }
      
      await sequelize.models.Document.update(
        { permanentlyDeleted: true, trashed: true, trashedAt: new Date() },
        { where: documentWhereClause, transaction: t }
      );
      
      // 4. Eliminar carpetas asociadas a la partida y sus elementos hijos
      const folderWhereClause = { id_partida: id };
      if (subpartidaIds.length > 0) {
        folderWhereClause[Op.or] = [
          { id_partida: id },
          { id_subpartida: { [Op.in]: subpartidaIds } }
        ];
        
        if (tareaIds.length > 0) {
          folderWhereClause[Op.or].push({ id_tarea: { [Op.in]: tareaIds } });
        }
        
        if (subtareaIds.length > 0) {
          folderWhereClause[Op.or].push({ id_subtarea: { [Op.in]: subtareaIds } });
        }
      }
      
      await sequelize.models.Folder.update(
        { trashed: true, trashedAt: new Date() },
        { where: folderWhereClause, transaction: t }
      );

      // 5. Eliminar comentarios asociados a todos los elementos
      await sequelize.models.Comment.destroy({
        where: { id_partida: id },
        transaction: t
      });
      
      if (subpartidaIds.length > 0) {
        await sequelize.models.Comment_subpartida.destroy({
          where: { id_subpartida: { [Op.in]: subpartidaIds } },
          transaction: t
        });
      }
      
      if (tareaIds.length > 0) {
        await sequelize.models.Comment_tarea.destroy({
          where: { id_task: { [Op.in]: tareaIds } },
          transaction: t
        });
      }
      
      if (subtareaIds.length > 0) {
        await sequelize.models.Comment_subtarea.destroy({
          where: { id_subtask: { [Op.in]: subtareaIds } },
          transaction: t
        });
      }

      // 6. Eliminar responsables de tareas y subtareas
      if (tareaIds.length > 0) {
        await sequelize.models.TareaResponsable.destroy({
          where: { id_tarea: { [Op.in]: tareaIds } },
          transaction: t
        });
      }
      
      if (subtareaIds.length > 0) {
        await sequelize.models.SubTareaResponsable.destroy({
          where: { id_subtask: { [Op.in]: subtareaIds } },
          transaction: t
        });
      }

      // 7. Eliminar materiales asociados
      await sequelize.models.Material.update(
        { id_partida: null },
        { where: { id_partida: id }, transaction: t }
      );
      
      if (subpartidaIds.length > 0) {
        await sequelize.models.Material.update(
          { id_subpartida: null },
          { where: { id_subpartida: { [Op.in]: subpartidaIds } }, transaction: t }
        );
      }
      
      if (tareaIds.length > 0) {
        await sequelize.models.Material.update(
          { id_task: null },
          { where: { id_task: { [Op.in]: tareaIds } }, transaction: t }
        );
      }
      
      if (subtareaIds.length > 0) {
        await sequelize.models.Material.update(
          { id_subtask: null },
          { where: { id_subtask: { [Op.in]: subtareaIds } }, transaction: t }
        );
      }

      // 8. Eliminar subtareas, tareas y subpartidas en orden jerárquico
      for (const subpartida of partida.subpartida_partida) {
        for (const tarea of subpartida.subpartida_tarea) {
          // Eliminar subtareas de esta tarea
          await sequelize.models.Subtask.destroy({
            where: { id_task: tarea.id },
            transaction: t
          });
        }
        
        // Eliminar tareas de esta subpartida
        await sequelize.models.Task.destroy({
          where: { id_subpartida: subpartida.id_subpartida },
          transaction: t
        });
      }
      
      // Eliminar subpartidas de esta partida
      await sequelize.models.Subpartida.destroy({
        where: { id_partida: id },
        transaction: t
      });

      // 9. Finalmente eliminar la partida
      await sequelize.models.Partida.destroy({
        where: { id_partida: id },
        transaction: t
      });

      await t.commit();
      console.log(`Partida ${id} y todos sus elementos relacionados eliminados correctamente`);
      return { success: true, message: 'Partida eliminada con éxito' };
    } catch (error) {
      console.error('Error al eliminar la partida:', error);
      if (t && !t.finished) {
        await t.rollback();
      }
      throw error;
    }
  }

  async deleteSubpartida(id) {
    let t;
    try {
      t = await sequelize.transaction();
      console.log(`Iniciando eliminación de subpartida con ID: ${id}`);
      
      // 1. Obtener la subpartida con todas sus relaciones
      const subpartida = await sequelize.models.Subpartida.findByPk(id, {
        include: [{
          association: 'subpartida_tarea',
          include: [{
            association: 'Task_Subtask'
          }]
        }],
        transaction: t
      });

      if (!subpartida) {
        throw new Error(`No se encontró la subpartida con ID: ${id}`);
      }

      // 2. Obtener IDs de todas las entidades relacionadas
      const tareaIds = subpartida.subpartida_tarea.map(tarea => tarea.id);
      const subtareaIds = [];
      
      subpartida.subpartida_tarea.forEach(tarea => {
        tarea.Task_Subtask.forEach(subtarea => {
          subtareaIds.push(subtarea.id_subtask);
        });
      });
      
      console.log(`Subpartida ${id} contiene: ${tareaIds.length} tareas, ${subtareaIds.length} subtareas`);

      // 3. Eliminar documentos asociados
      const documentWhereClause = { id_subpartida: id };
      if (tareaIds.length > 0) {
        documentWhereClause[Op.or] = [
          { id_subpartida: id },
          { id_tarea: { [Op.in]: tareaIds } }
        ];
        
        if (subtareaIds.length > 0) {
          documentWhereClause[Op.or].push({ id_subtarea: { [Op.in]: subtareaIds } });
        }
      }
      
      await sequelize.models.Document.update(
        { permanentlyDeleted: true, trashed: true, trashedAt: new Date() },
        { where: documentWhereClause, transaction: t }
      );
      
      // 4. Eliminar carpetas asociadas
      const folderWhereClause = { id_subpartida: id };
      if (tareaIds.length > 0) {
        folderWhereClause[Op.or] = [
          { id_subpartida: id },
          { id_tarea: { [Op.in]: tareaIds } }
        ];
        
        if (subtareaIds.length > 0) {
          folderWhereClause[Op.or].push({ id_subtarea: { [Op.in]: subtareaIds } });
        }
      }
      
      await sequelize.models.Folder.update(
        { trashed: true, trashedAt: new Date() },
        { where: folderWhereClause, transaction: t }
      );

      // 5. Eliminar comentarios asociados
      await sequelize.models.Comment_subpartida.destroy({
        where: { id_subpartida: id },
        transaction: t
      });
      
      if (tareaIds.length > 0) {
        await sequelize.models.Comment_tarea.destroy({
          where: { id_task: { [Op.in]: tareaIds } },
          transaction: t
        });
      }
      
      if (subtareaIds.length > 0) {
        await sequelize.models.Comment_subtarea.destroy({
          where: { id_subtask: { [Op.in]: subtareaIds } },
          transaction: t
        });
      }

      // 6. Eliminar responsables de tareas y subtareas
      if (tareaIds.length > 0) {
        await sequelize.models.TareaResponsable.destroy({
          where: { id_tarea: { [Op.in]: tareaIds } },
          transaction: t
        });
      }
      
      if (subtareaIds.length > 0) {
        await sequelize.models.SubTareaResponsable.destroy({
          where: { id_subtask: { [Op.in]: subtareaIds } },
          transaction: t
        });
      }

      // 7. Eliminar materiales asociados
      await sequelize.models.Material.update(
        { id_subpartida: null },
        { where: { id_subpartida: id }, transaction: t }
      );
      
      if (tareaIds.length > 0) {
        await sequelize.models.Material.update(
          { id_task: null },
          { where: { id_task: { [Op.in]: tareaIds } }, transaction: t }
        );
      }
      
      if (subtareaIds.length > 0) {
        await sequelize.models.Material.update(
          { id_subtask: null },
          { where: { id_subtask: { [Op.in]: subtareaIds } }, transaction: t }
        );
      }

      // 8. Eliminar subtareas y tareas en orden jerárquico
      for (const tarea of subpartida.subpartida_tarea) {
        // Eliminar subtareas de esta tarea
        await sequelize.models.Subtask.destroy({
          where: { id_task: tarea.id },
          transaction: t
        });
      }
      
      // Eliminar tareas de esta subpartida
      await sequelize.models.Task.destroy({
        where: { id_subpartida: id },
        transaction: t
      });

      // 9. Finalmente eliminar la subpartida
      await sequelize.models.Subpartida.destroy({
        where: { id_subpartida: id },
        transaction: t
      });

      await t.commit();
      console.log(`Subpartida ${id} y todos sus elementos relacionados eliminados correctamente`);
      return { success: true, message: 'Subpartida eliminada con éxito' };
    } catch (error) {
      console.error('Error al eliminar la subpartida:', error);
      if (t && !t.finished) {
        await t.rollback();
      }
      throw error;
    }
  }

  async deleteTarea(id) {
    let t;
    try {
      t = await sequelize.transaction();
      console.log(`Iniciando eliminación de tarea con ID: ${id}`);
      
      // 1. Obtener la tarea con todas sus relaciones
      const tarea = await sequelize.models.Task.findByPk(id, {
        include: [{
          association: 'Task_Subtask'
        }],
        transaction: t
      });

      if (!tarea) {
        throw new Error(`No se encontró la tarea con ID: ${id}`);
      }

      // 2. Obtener IDs de todas las subtareas relacionadas
      const subtareaIds = tarea.Task_Subtask.map(subtarea => subtarea.id_subtask);
      console.log(`Tarea ${id} contiene: ${subtareaIds.length} subtareas`);

      // 3. Eliminar documentos asociados
      const documentWhereClause = { id_tarea: id };
      if (subtareaIds.length > 0) {
        documentWhereClause[Op.or] = [
          { id_tarea: id },
          { id_subtarea: { [Op.in]: subtareaIds } }
        ];
      }
      
      await sequelize.models.Document.update(
        { permanentlyDeleted: true, trashed: true, trashedAt: new Date() },
        { where: documentWhereClause, transaction: t }
      );
      
      // 4. Eliminar carpetas asociadas
      const folderWhereClause = { id_tarea: id };
      if (subtareaIds.length > 0) {
        folderWhereClause[Op.or] = [
          { id_tarea: id },
          { id_subtarea: { [Op.in]: subtareaIds } }
        ];
      }
      
      await sequelize.models.Folder.update(
        { trashed: true, trashedAt: new Date() },
        { where: folderWhereClause, transaction: t }
      );

      // 5. Eliminar comentarios asociados
      await sequelize.models.Comment_tarea.destroy({
        where: { id_task: id },
        transaction: t
      });
      
      if (subtareaIds.length > 0) {
        await sequelize.models.Comment_subtarea.destroy({
          where: { id_subtask: { [Op.in]: subtareaIds } },
          transaction: t
        });
      }

      // 6. Eliminar responsables de tareas y subtareas
      await sequelize.models.TareaResponsable.destroy({
        where: { id_tarea: id },
        transaction: t
      });
      
      if (subtareaIds.length > 0) {
        await sequelize.models.SubTareaResponsable.destroy({
          where: { id_subtask: { [Op.in]: subtareaIds } },
          transaction: t
        });
      }

      // 7. Eliminar materiales asociados
      await sequelize.models.Material.update(
        { id_task: null },
        { where: { id_task: id }, transaction: t }
      );
      
      if (subtareaIds.length > 0) {
        await sequelize.models.Material.update(
          { id_subtask: null },
          { where: { id_subtask: { [Op.in]: subtareaIds } }, transaction: t }
        );
      }

      // 8. Eliminar subtareas
      if (subtareaIds.length > 0) {
        await sequelize.models.Subtask.destroy({
          where: { id_task: id },
          transaction: t
        });
      }

      // 9. Finalmente eliminar la tarea
      await sequelize.models.Task.destroy({
        where: { id: id },
        transaction: t
      });

      await t.commit();
      console.log(`Tarea ${id} y todas sus subtareas eliminadas correctamente`);
      return { success: true, message: 'Tarea eliminada con éxito' };
    } catch (error) {
      console.error('Error al eliminar la tarea:', error);
      if (t && !t.finished) {
        await t.rollback();
      }
      throw error;
    }
  }

  async deleteSubtarea(id) {
    let t;
    try {
      t = await sequelize.transaction();
      console.log(`Iniciando eliminación de subtarea con ID: ${id}`);
      
      // 1. Verificar que la subtarea existe
      const subtarea = await sequelize.models.Subtask.findByPk(id, { transaction: t });

      if (!subtarea) {
        throw new Error(`No se encontró la subtarea con ID: ${id}`);
      }

      // 2. Eliminar documentos asociados
      await sequelize.models.Document.update(
        { permanentlyDeleted: true, trashed: true, trashedAt: new Date() },
        { where: { id_subtarea: id }, transaction: t }
      );
      
      // 3. Eliminar carpetas asociadas
      await sequelize.models.Folder.update(
        { trashed: true, trashedAt: new Date() },
        { where: { id_subtarea: id }, transaction: t }
      );

      // 4. Eliminar comentarios asociados
      await sequelize.models.Comment_subtarea.destroy({
        where: { id_subtask: id },
        transaction: t
      });

      // 5. Eliminar responsables de subtareas
      await sequelize.models.SubTareaResponsable.destroy({
        where: { id_subtask: id },
        transaction: t
      });

      // 6. Eliminar materiales asociados
      await sequelize.models.Material.update(
        { id_subtask: null },
        { where: { id_subtask: id }, transaction: t }
      );

      // 7. Finalmente eliminar la subtarea
      await sequelize.models.Subtask.destroy({
        where: { id_subtask: id },
        transaction: t
      });

      await t.commit();
      console.log(`Subtarea ${id} eliminada correctamente`);
      return { success: true, message: 'Subtarea eliminada con éxito' };
    } catch (error) {
      console.error('Error al eliminar la subtarea:', error);
      if (t && !t.finished) {
        await t.rollback();
      }
      throw error;
    }
  }
}

module.exports = new PartidasRepository();
