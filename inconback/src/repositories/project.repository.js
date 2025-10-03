const { sequelize } = require("../config/sequelize-config");
const { Sequelize, Op } = require("sequelize");
const { CustomHttpError } = require("../errors/customError");
const {
  differenceInMonths,
  parseISO,
  differenceInHours,
  format,
  differenceInDays,
} = require("date-fns");

class ProjectRepository {
  async getProjects() {
    try {
      const projects = await sequelize.models.Project.findAll({
        include: [
          {
            association: "proyecto_proyecto", // Incluye la relación con otros datos del proyecto
          },
          {
            model: sequelize.models.UserProject, // Incluye la tabla intermedia UserProject
            as: "user_project_project",
            include: [
              {
                model: sequelize.models.Rol,
                as: "userProject_Rol",
              },
              {
                model: sequelize.models.User,
                as: "user_project_user",
              },
            ],
          },
        ],
        order: [["createdAt", "DESC"]],
      });
      if (projects.length === 0) {
        throw new CustomHttpError(404, "No se encontraron proyectos");
      }

      const randomColors = [
        "#4CAF50",
        "#87ACA7",
        "#EB9773",
        "#99C986",
        "#F6D523",
      ];
      const randomColors2 = [
        "#0d4c7f",
        "#1975ba",
        "#26a2fe",
        "#56c1fe",
        "#AA4347",
      ];
      const estadosProject = [
        "Sin ejecutar",
        "En ejecución",
        "Suspendida",
        "Completada",
      ];

      let PercentageEstadoPerProject = new Array(estadosProject.length).fill(0);
      let countPorEstado = new Array(estadosProject.length).fill(0);
      const colors = ["#0d4c7f", "#1975ba", "#26a2fe", "#56c1fe"];
      const colors2 = ["#AA4347", "#EB9773", "#F6D523", "#50F522"];

      const avanceGlobal = {
        percentage: 0,
        label: "Global",
        subLabel: "Avance de proyectos",
        fechaini: "2024/06/01",
        fechaterm: "2024/06/30",
        color: "#56c1fe",
        mainLabel: "Avance global",
        labelcon: "Última actualización hoy 12:44 pm",
        color2: "#99C986",
        tiempo: "3 meses",
      };

      const estadoglobal = [];

      let totalAvance = 0;
      let totalProyectsDone = 0;
      const currentDate = new Date();

      const colorMapping = {
        "Sin ejecutar": "#0d4c7f",
        "En ejecución": "#1975ba",
        Suspendida: "#26a2fe",
        Completada: "#56c1fe",
      };

      let totalPlannedDays = 0;
      let totalAdvancedDays = 0;
      let presupuesto = 0;
      let porcentajetotalproyect = 0;
      let promediototalproyecto = 0;

      projects.forEach((project, index) => {
        if (project.dataValues.avance === 100) {
          totalProyectsDone++;
        }

        project.dataValues.percentage =
          parseInt(project.dataValues.avance) || 0;

        totalAvance += project.dataValues.percentage;

        const estado = project.dataValues.proyecto_proyecto?.nombre;
        const estadoIndex = estadosProject.indexOf(
          project.dataValues.proyecto_proyecto?.nombre,
        );
        if (estadoIndex !== -1) {
          PercentageEstadoPerProject[estadoIndex]++;
        }

        // Importar date-fns para cálculos de fecha
        const {
          differenceInMonths,
          parseISO,
          differenceInHours,
          format,
        } = require("date-fns");

        // Convertir las fechas de texto a objetos de fecha
        const startDate = parseISO(project.dataValues.fecha_inicio);
        const endDate = parseISO(project.dataValues.fecha_termino);

        // Calcular la diferencia en meses
        const diffInMonths = differenceInMonths(endDate, startDate);

        const diffInDays = differenceInDays(endDate, startDate);
        totalPlannedDays += diffInDays;

        const diffInAdvancedDays = differenceInDays(
          endDate < currentDate ? endDate : currentDate,
          startDate,
        );

        totalAdvancedDays += diffInAdvancedDays;

        const currentDateTime = new Date();

        // Suponiendo que createdAt es un objeto Date
        const formattedCreatedAt = format(
          project.createdAt,
          "yyyy-MM-dd'T'HH:mm:ssxxx",
        );
        const formattedupdateddAt = format(
          project.updatedAt,
          "yyyy-MM-dd'T'HH:mm:ssxxx",
        );

        // Luego, parsear la fecha formateada
        const createdAtDateTime = parseISO(formattedCreatedAt);
        const updatedAtDateTime = parseISO(formattedupdateddAt);

        // Calcular la diferencia en horas entre createdAt y la hora actual
        const diffInHours = differenceInHours(
          currentDateTime,
          updatedAtDateTime,
        );

        // Agregar la hora actual formateada al objeto de proyecto
        project.dataValues.hora = `${diffInHours}`;

        project.dataValues.label = estado;
        project.dataValues.fechaini = project.dataValues.fecha_inicio;
        project.dataValues.fechaterm = project.dataValues.fecha_termino;
        project.dataValues.subLabel = project.dataValues.nombre;
        project.dataValues.mainLabel = project.dataValues.duenio;

        // Agregar el campo de duración al objeto de proyecto
        project.dataValues.tiempo = `${diffInMonths}`;

        // Formatear la fecha como yy-mm-dd
        const updatedAtDate = new Date(project.dataValues.updatedAt);
        const formattedDate = updatedAtDate.toLocaleDateString("es-419", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });

        const [year, month, day] = formattedDate.split("/");
        const rearrangedDate = `${year}-${month}-${day}`;

        project.dataValues.labelcon = rearrangedDate;
        project.dataValues.color = colorMapping[estado];
        project.dataValues.color2 =
          randomColors2[Math.floor(Math.random() * randomColors2.length)];
        const presupuestodeproyectos =
          parseFloat(project.dataValues.presupuesto) || 0;
        presupuesto += presupuestodeproyectos;

        const avancetotalproyecto = parseFloat(project.dataValues.avance) || 0;
        porcentajetotalproyect += avancetotalproyecto;

        const porcentajeTotalPromedio =
          projects.length > 0 ? porcentajetotalproyect / projects.length : 0;
        promediototalproyecto = porcentajeTotalPromedio / 100;
      });

      //valor ganado
      const valorganado = Math.round(promediototalproyecto * presupuesto);

      //total gastado
      const totalGastado = await sequelize.models.Material.sum(
        "valor_total",
        {},
      ).then((sum) => parseFloat(sum) || 0);

      const totalCPI = (valorganado / totalGastado).toFixed(2);

      let roundedSPI = 0;
      if (totalPlannedDays > 0) {
        const SPI = totalAdvancedDays / totalPlannedDays;
        roundedSPI = SPI.toFixed(2); // Redondea a 2 decimales
        console.log(`Índice de Rendimiento de Tiempo (SPI): ${roundedSPI}`);
      } else {
        console.log(
          "No se puede calcular el SPI porque el total de días planificados es 0.",
        );
      }

      avanceGlobal.label = `${totalProyectsDone}/${projects.length}`;

      PercentageEstadoPerProject = PercentageEstadoPerProject.map((count) =>
        ((count / projects.length) * 100).toFixed(2),
      );

      avanceGlobal.percentage = (totalAvance / projects.length).toFixed(2);

      // Contar proyectos por estado
      projects.forEach((project) => {
        const estado = project.dataValues.proyecto_proyecto?.nombre;
        const estadoIndex = estadosProject.indexOf(estado);
        if (estadoIndex !== -1) {
          countPorEstado[estadoIndex]++;
        }
      });

      // Calcular porcentajes por estado
      const totalProyectos = projects.length;
      const porcentajesPorEstado = estadosProject.map((estado, index) => {
        const percentage = (
          (countPorEstado[index] / totalProyectos) *
          100
        ).toFixed(2);

        estadoglobal.push({
          label: estado,
          data: parseFloat(percentage),
          colors: colors[index % colors.length],
        });

        return {
          estado,
          percentage: parseFloat(percentage),
        };
      });

      return {
        projects,
        avanceGlobal,
        estadoglobal,
        totalPlannedDays,
        roundedSPI,
        valorganado,
        totalCPI,
      };
    } catch (error) {
      console.log(error);
      throw new Error("Error al obtener los proyectos");
    }
  }

  async getProjectWithDetailsById(projectId) {
    try {
      const project = await sequelize.models.Project.findOne({
        where: { id: projectId },
        include: [
          {
            model: sequelize.models.Partida,
            as: "proyecto_partida",
            // Quitar attributes temporalmente para ver todos los campos
            include: [
              {
                model: sequelize.models.Subpartida,
                as: "subpartida_partida",
                // Quitar attributes temporalmente para ver todos los campos
                include: [
                  {
                    model: sequelize.models.Task,
                    as: "subpartida_tarea",
                    // Quitar attributes temporalmente para ver todos los campos
                    include: [
                      {
                        model: sequelize.models.Subtask,
                        as: "Task_Subtask",
                        // Quitar attributes temporalmente para ver todos los campos
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      });

      if (!project) {
        throw new CustomHttpError(404, "Proyecto no encontrado");
      }



      // Inicializar contadores
      const estados = {
        planificacion: 0,
        ejecucion: 0,
        pendiente: 0,
        cancelada: 0,
        en_revisión: 0,
        asignada: 0,
        en_espera: 0,
        rechazada: 0,
      };
      const totales = {
        partidas: 0,
        subpartidas: 0,
        tareas: 0,
        subtareas: 0,
      };

      // Función para contar los estados según tu lógica
      const contarEstados = (item) => {
        if (item.id_EstadoTarea) {
          switch (item.id_EstadoTarea) {
            case 1:
              estados.planificacion++;  // Sin ejecutar = Planificación
              break;
            case 2:
              estados.ejecucion++;      // En ejecución = Ejecución
              break;
            case 4:
         // Completada TAMBIÉN cuenta para planificación
              break;
            case 3:
              estados.cancelada++;      // Suspendida
              break;
            case 5:
              estados.en_revisión++;
              break;
            case 6:
              estados.asignada++;
              break;
            case 7:
              estados.en_espera++;
              break;
            case 8:
              estados.rechazada++;
              break;
            default:
              break;
          }
        }
      };

      // Recorrer partidas
      project.proyecto_partida?.forEach((partida) => {
        totales.partidas++;
        contarEstados(partida);

        // Recorrer subpartidas
        partida.subpartida_partida?.forEach((subpartida) => {
          totales.subpartidas++;
          contarEstados(subpartida);

          // Recorrer tareas
          subpartida.subpartida_tarea?.forEach((tarea) => {
            totales.tareas++;
            contarEstados(tarea);

            // Recorrer subtareas
            tarea.Task_Subtask?.forEach((subtarea) => {
              totales.subtareas++;
              contarEstados(subtarea);
            });
          });
        });
      });

      // Calcular porcentajes según tu lógica de Pendiente
      const totalItems =
        totales.partidas +
        totales.subpartidas +
        totales.tareas +
        totales.subtareas;
      
      // Contar elementos que NO están pendientes (completados + suspendidos)
      let elementosNoPendientes = 0;
      
      project.proyecto_partida?.forEach((partida, pIndex) => {
        // Si está completada (4) o suspendida (3), no está pendiente
        if (partida.id_EstadoTarea === 4 || partida.id_EstadoTarea === 3) {
          elementosNoPendientes++;
        }
        
        partida.subpartida_partida?.forEach((subpartida, sIndex) => {
          if (subpartida.id_EstadoTarea === 4 || subpartida.id_EstadoTarea === 3) {
            elementosNoPendientes++;
          }
          
          subpartida.subpartida_tarea?.forEach((tarea, tIndex) => {
             // Acceder al campo truncado directamente desde dataValues
             const estadoTarea = tarea.dataValues?.id_EstadoT || tarea.id_EstadoT || tarea.id_EstadoTarea;
             if (estadoTarea === 4 || estadoTarea === 3) {
               elementosNoPendientes++;
             }
            
            tarea.Task_Subtask?.forEach((subtarea, stIndex) => {
              const estadoSubtarea = subtarea.dataValues?.id_EstadoT || subtarea.id_EstadoT || subtarea.id_EstadoTarea;
              if (estadoSubtarea === 4 || estadoSubtarea === 3) {
                elementosNoPendientes++;
              }
            });
          });
        });
      });
      
      // Pendiente = 100% - (porcentaje de elementos NO pendientes)
      // Si no hay elementos, el porcentaje pendiente es 0
      const porcentajeNoPendientes = totalItems > 0 ? (elementosNoPendientes / totalItems) * 100 : 0;
      const porcentajePendiente = totalItems > 0 ? 100 - porcentajeNoPendientes : 0;
      

      
      const porcentajes = {
        planificacion: totalItems > 0 ? ((estados.planificacion / totalItems) * 100).toFixed(2) : "0.00",
        ejecucion: totalItems > 0 ? ((estados.ejecucion / totalItems) * 100).toFixed(2) : "0.00",
        pendiente: porcentajePendiente.toFixed(2),
      };

      const horasPorDia = {};

      // Función para sumar horas por día
      const sumarHorasPorDia = (item) => {
        const date = new Date(item.createdAt).toISOString().split("T")[0]; // Obtener la fecha en formato YYYY-MM-DD
        if (!horasPorDia[date]) {
          horasPorDia[date] = { horas_hombre: 0, horas_maquina: 0 };
        }
        horasPorDia[date].horas_hombre += item.horas_hombre || 0;
        horasPorDia[date].horas_maquina += item.horas_maquina || 0;
      };

      // Recorrer partidas
      project.proyecto_partida?.forEach((partida) => {
        sumarHorasPorDia(partida);

        // Recorrer subpartidas
        partida.subpartida_partida?.forEach((subpartida) => {
          sumarHorasPorDia(subpartida);

          // Recorrer tareas
          subpartida.subpartida_tarea?.forEach((tarea) => {
            sumarHorasPorDia(tarea);

            // Recorrer subtareas
            tarea.Task_Subtask?.forEach((subtarea) => {
              sumarHorasPorDia(subtarea);
            });
          });
        });
      });

      // Obtener el presupuesto del proyecto y convertirlo a número
      const presupuesto = parseFloat(project.presupuesto);

      // Calcular el total gastado sumando precio_total de todas las subtareas
      const totalGastado = await sequelize.models.Material.sum("valor_total", {
        where: { id_proyecto: projectId },
      }).then((sum) => parseFloat(sum) || 0);

      // Calcular el porcentaje gastado con dos decimales
      const porcentajegasto = (totalGastado / presupuesto) * 100;
      const porcentajeFormateado = porcentajegasto.toFixed(2);

      // Formatear los valores finales para mostrar en el frontend
      const presupuestoFormateado = presupuesto.toLocaleString("es-ES", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
      const totalGastadoFormateado = totalGastado.toLocaleString("es-ES", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });

      const estimado = presupuesto - totalGastado;

      const estimadoFormateado = estimado.toLocaleString("es-ES", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });

      // Obtener la fecha y hora actual
      const fechaActual = new Date();
      const opcionesFecha = { day: "numeric", month: "long" };
      const opcionesHora = { hour: "numeric", minute: "numeric", hour12: true };

      const formatoFecha = new Intl.DateTimeFormat(
        "es-ES",
        opcionesFecha,
      ).format(fechaActual);
      const formatoHora = new Intl.DateTimeFormat("es-ES", opcionesHora).format(
        fechaActual,
      );
      const actualizado = `Actualizado ${formatoFecha} ${formatoHora}`;

      const userProjects = await sequelize.models.UserProject.findAll({
        where: { projectId },
        attributes: ["userId"],
      });

      const userIds = userProjects.map((up) => up.userId);

      const usuarios = await sequelize.models.User.findAll({
        where: { id: userIds },
        include: [
          {
            association: "roles",
            attributes: ["name"],
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
            association: "organizacion",
            attributes: ["nombre"],
          },
        ],
      });

      const rolesVinculados = new Set();
      usuarios.forEach((user) => {
        user.roles.forEach((rol) => {
          rolesVinculados.add(rol.name);
        });
      });

      const usuariosPorRol = {};
      for (const rolNombre of rolesVinculados) {
        usuariosPorRol[rolNombre] = 0;
      }

      usuarios.forEach((user) => {
        user.roles.forEach((rol) => {
          const rolNombre = rol.name;
          if (rolesVinculados.has(rolNombre)) {
            usuariosPorRol[rolNombre]++;
          }
        });
      });

      //console.log('Usuarios por Rol:', usuariosPorRol);

      const projectfecha = {
        fecha_inicio: project.fecha_inicio,
        fecha_termino: project.fecha_termino,
      };

      const fechahoy1 = new Date();

      const year1 = fechahoy1.getFullYear();
      const month1 = String(fechahoy1.getMonth() + 1).padStart(2, "0");
      const day1 = String(fechahoy1.getDate()).padStart(2, "0");

      const formatoFechahoy2 = `${year1}-${month1}-${day1}`;

      function calcularPorcentajeAvance(fechaInicio, fechaTermino) {
        const fechahoy = new Date();

        const year = fechahoy.getFullYear();
        const month = String(fechahoy.getMonth() + 1).padStart(2, "0");
        const day = String(fechahoy.getDate()).padStart(2, "0");

        const formatoFechahoy = `${year}-${month}-${day}`;

        const inicio = new Date(fechaInicio);
        const termino = new Date(fechaTermino);
        const actual = new Date(formatoFechahoy);

        const totalDias = (termino - inicio) / (1000 * 60 * 60 * 24);
        const diasAvanzados = (actual - inicio) / (1000 * 60 * 60 * 24);

        if (diasAvanzados < 0) {
          return 0;
        }

        // Calcular el porcentaje de avance
        const porcentajeAvance = (diasAvanzados / totalDias) * 100;
        return porcentajeAvance.toFixed(2);
      }

      const porcentajeAvance = calcularPorcentajeAvance(
        projectfecha.fecha_inicio,
        projectfecha.fecha_termino,
              );

        // **CÁLCULO ACTUALIZADO**: Obtener porcentajes actuales de las partidas
        const porcentajetotal_partidas = await this.calcularAvanceRealPartidas(projectId);

        const tipoEventoAccidente = await sequelize.models.Tipo_evento.findOne({
        where: { nombre: "accidentes" },
      });

      if (!tipoEventoAccidente) {
        throw new Error('No se encontró el tipo de evento "accidentes".');
      }

      const eventos = await sequelize.models.Evento.findOne({
        where: {
          id_proyecto: projectId,
          id_tipo_evento: tipoEventoAccidente.id_tipo_evento,
        },
        order: [["createdAt", "DESC"]],
        attributes: ["createdAt"],
      });

      const fechaUltimoAccidente = eventos ? new Date(eventos.createdAt) : null;
      const fechaActual2 = new Date();

      // Convertir ambas fechas a YYYY-MM-DD
      const obtenerFechaSolo = (fecha) => {
        const fechaFormateada = fecha.toISOString().split("T")[0];
        return new Date(fechaFormateada);
      };

      const inicioDiaUltimoAccidente = fechaUltimoAccidente
        ? obtenerFechaSolo(fechaUltimoAccidente)
        : null;
      const inicioDiaActual = obtenerFechaSolo(fechaActual2);

      // Calcular la diferencia en días
      const diferenciaEnDias = inicioDiaUltimoAccidente
        ? Math.floor(
            (inicioDiaActual - inicioDiaUltimoAccidente) /
              (1000 * 60 * 60 * 24),
          )
        : 0;

      const tiposAccidente = await sequelize.models.Tipo_accidente.findAll({
        attributes: ["id_tipo_accidente", "nombre"],
        where: {
          nombre: ["Leve", "Grave", "Fatal"],
        },
      });

      const idsTiposAccidente = tiposAccidente.map(
        (tipo) => tipo.id_tipo_accidente,
      );

      const eventosPorTipo = await sequelize.models.Evento.findAll({
        attributes: [
          "id_tipo_accidente",
          [sequelize.fn("COUNT", sequelize.col("id_tipo_accidente")), "count"],
        ],
        where: {
          id_proyecto: projectId,
          id_tipo_accidente: idsTiposAccidente,
        },
        group: ["id_tipo_accidente"],
      });

      const accidentesCount = {
        Leve: 0,
        Grave: 0,
        Fatal: 0,
      };

      eventosPorTipo.forEach((evento) => {
        const tipoNombre = tiposAccidente.find(
          (tipo) => tipo.id_tipo_accidente === evento.id_tipo_accidente,
        ).nombre;
        accidentesCount[tipoNombre] = evento.dataValues.count;
      });

      return {
        project: {
          ...project.toJSON(),
          users: usuarios.map((u) => ({
            id: u.id,
            names: u.names,
            apellido_p: u.apellido_p,
            apellido_m: u.apellido_m,
            email: u.email,
            genero: u.genero,
            telefono: u.telefono,
            organizacion: u.organizacion,
            user_puesto: u.user_puesto,
            user_grupo: u.user_grupo,
            roles: u.roles.map((r) => r.name),
          })),
        },
        porcentajes,
        horasPorDia,
        presupuestoFormateado,
        totalGastadoFormateado,
        porcentajeFormateado,
        actualizado,
        usuariosPorRol,
        estimadoFormateado,
        porcentajeAvance,
        porcentajetotal_partidas,
        diferenciaEnDias,
        accidentesCount,
      };
    } catch (error) {
      console.log(error);
      throw new Error("Error al obtener el proyecto con sus detalles");
    }
  }

  async getProjectById(id) {
    try {
      const project = await sequelize.models.Project.findOne({
        where: { id },
        include: [
          {
            model: sequelize.models.EstadoProyecto,
            as: "proyecto_proyecto", // Alias ajustado para EstadoProyecto
            attributes: ["id_estadoproyecto", "nombre"], // Atributos de EstadoProyecto
          },
          {
            model: sequelize.models.Proyectoproveedor,
            as: "Proyectoproveedor_Project", // Alias ajustado para Proyectoproveedor
            attributes: ["id", "id_proyecto", "id_organizacion"], // Atributos de Proyectoproveedor
            include: [
              {
                model: sequelize.models.Organizacion,
                as: "proveedor_Proyectoproveedor", // Alias ajustado para Organizacion
                attributes: ["id", "nombre", "direccion", "telefono", "email"], // Atributos de Organizacion
              },
            ],
          },
          {
            model: sequelize.models.UserProject, // Incluir el modelo UserProject
            as: "user_project_project", // Alias ajustado para user_project en relación a Project
            attributes: ["id", "userId", "rolId"], // Atributos que deseas obtener de UserProject
            include: [
              {
                model: sequelize.models.User, // Incluir el modelo User
                as: "user_project_user", // Alias ajustado para User en UserProject
                attributes: ["id", "names", "apellido_p", "apellido_m"], // Atributos de User
              },
              {
                model: sequelize.models.Rol, // Incluir el modelo Rol
                as: "userProject_Rol", // Alias ajustado para Rol en UserProject
                attributes: ["id", "name"], // Atributos de Rol
              },
            ],
          },
        ],
      });

      return project;
    } catch (error) {
      console.error("Error al obtener el proyecto por ID:", error);
      throw error;
    }
  }

  async createProject(proyecto) {
    const {
      nombre,
      ubicacion,
      codigo_bip,
      unidad_tecnica,
      supervisor,
      superintendente,
      rut_unidad_tecnica,
      rut_empresa,
      presupuesto,
      duenio,
      monto_neto,
      monto_total_bruto,
      monto_mensual,
      total_general,
      localizacion_mina,
      fecha_inicio,
      fecha_termino,
      informador,
      descripcion,
      id_estadoproyecto,
      id_mina,
      avance,
    } = proyecto;
    
    try {
      const project = await sequelize.models.Project.create({
        nombre,
        fecha_inicio,
        fecha_termino,
        duenio,
        informador,
        ubicacion,
        presupuesto,
        descripcion,
        codigo_bip,
        nombre_unidad_tecnica: unidad_tecnica,
        total_general,
        geolocalizacion: localizacion_mina,
        monto_total_bruto,
        monto_neto,
        monto_mensual,
        rut_unidad_tecnica,
        rut_empresa,
        id_estadoproyecto,
        id_mina,
        avance,
      });

      // Obtener los IDs de los roles
      const roles = await sequelize.models.Rol.findAll({
        where: {
          name: ['supervisor', 'superintendente']
        },
        attributes: ['id', 'name']
      });
      
      // Crear mapa de roles
      const roleMap = {};
      roles.forEach(role => {
        roleMap[role.name] = role.id;
      });
      
      if (Array.isArray(supervisor)) {
        for (const item of supervisor) {
          await sequelize.models.UserProject.create({
            userId: item.value,
            projectId: project.id,
            rolId: roleMap['supervisor']
          });
        }
      } else if (supervisor) {
        await sequelize.models.UserProject.create({
          userId: supervisor,
          projectId: project.id,
          rolId: roleMap['supervisor']
        });
      }
      if (Array.isArray(superintendente)) {
        for (const item of superintendente) {
          await sequelize.models.UserProject.create({
            userId: item.value,
            projectId: project.id,
            rolId: roleMap['superintendente']
          });
        }
      } else if (superintendente) {
        await sequelize.models.UserProject.create({
          userId: superintendente,
          projectId: project.id,
          rolId: roleMap['superintendente']
        });
      }
      
      return project;
    } catch (error) {
      console.error("Error creating project:", error);
      throw error;
    }
  }

  async updateProject(id, updatedData) {

    const t = await sequelize.transaction(); // Iniciar una transacción

    try {
      // Actualizar los datos en la tabla Project solo con los campos actualizables
      const [rowsAffected] = await sequelize.models.Project.update(
        {
          fecha_inicio: updatedData.fecha_inicio,
          fecha_termino: updatedData.fecha_termino,
          id_estadoproyecto: updatedData.estado.value, // Usar el valor del estado
          nombre_unidad_tecnica: updatedData.unidad_tecnica,
          duenio: updatedData.responsable,
        },
        {
          where: { id },
          returning: true,
          transaction: t,
        },
      );



      if (rowsAffected === 0) {
        throw new CustomHttpError(404, "Proyecto no encontrado");
      }

      // Buscar los IDs de los roles dinámicamente para todos los roles necesarios
      const roles = await sequelize.models.Rol.findAll({
        where: {
          name: [
            "superintendente",
            "inspector",
            "ITO",
            "planner",
            "supervisor",
            "administrador de contrato",
            "prevencionista",
          ],
        },
        attributes: ["id", "name"],
        transaction: t,
      });

      // Crear un objeto para mapear los IDs de roles
      const roleMap = {};
      roles.forEach((role) => {
        roleMap[role.name] = role.id;
      });

      const {
        superintendente,
        inspector,
        ito,
        planner,
        supervisor,
        admin_contrato,
        prevencionista,
      } = updatedData;

      // Borrar las relaciones existentes en user_project para este proyecto
      await sequelize.models.UserProject.destroy({
        where: { projectId: id },
        transaction: t,
      });

      // Crear nuevas relaciones para los diferentes roles
      const userProjectData = [];

      // Agregar superintendentes
      superintendente.forEach((superintendenteId) => {
        userProjectData.push({
          projectId: id,
          userId: superintendenteId.value,
          rolId: roleMap["superintendente"],
        });
      });

      // Agregar inspectores
      inspector.forEach((inspectorId) => {
        userProjectData.push({
          projectId: id,
          userId: inspectorId.value,
          rolId: roleMap["inspector"],
        });
      });

      // Agregar ITO
      ito.forEach((itoId) => {
        userProjectData.push({
          projectId: id,
          userId: itoId.value,
          rolId: roleMap["ITO"],
        });
      });

      // Agregar planners
      planner.forEach((plannerId) => {
        userProjectData.push({
          projectId: id,
          userId: plannerId.value,
          rolId: roleMap["planner"],
        });
      });

      // Agregar supervisores
      supervisor.forEach((supervisorId) => {
        userProjectData.push({
          projectId: id,
          userId: supervisorId.value,
          rolId: roleMap["supervisor"],
        });
      });

      // Agregar admin_contrato
      admin_contrato.forEach((adminContratoId) => {
        userProjectData.push({
          projectId: id,
          userId: adminContratoId.value,
          rolId: roleMap["administrador de contrato"],
        });
      });

      // Agregar prevencionistas
      prevencionista.forEach((prevencionistaId) => {
        userProjectData.push({
          projectId: id,
          userId: prevencionistaId.value,
          rolId: roleMap["prevencionista"],
        });
      });

      // Insertar las nuevas relaciones en user_project
      await sequelize.models.UserProject.bulkCreate(userProjectData, {
        transaction: t,
      });

      // Finalizar la transacción
      await t.commit();

      // Devolver el proyecto actualizado
      const updatedProject = await this.getProjectById(id);
      return updatedProject;
    } catch (error) {
      await t.rollback(); // Revertir la transacción en caso de error
      console.error(
        "Error al actualizar el proyecto y las relaciones en user_project:",
        error,
      );
      throw new Error("Error al actualizar el proyecto");
    }
  }

  async deleteProject(id) {
    try {
      const rowsAffected = await sequelize.models.Project.destroy({
        where: { id },
      });
      if (rowsAffected === 0) {
        throw new CustomHttpError(404, "Proyecto no encontrado");
      }
    } catch (error) {
      throw new Error("Error al eliminar el proyecto");
    }
  }

  async getfechabyid(id) {
    try {
      const project = await sequelize.models.Project.findAll({
        attributes: ["fecha_inicio", "fecha_termino"],
        where: { id },
      });
      return project;
    } catch (error) {
      throw response(500, "Error al obtener las fechas");
    }
  }

  /**
   * **NUEVA FUNCIÓN**: Calcular avance real basado solo en porcentajes actuales de partidas
   */
  async calcularAvanceRealPartidas(projectId) {
    try {

      // Obtener todas las partidas del proyecto
      const partidas = await sequelize.models.Partida.findAll({
        where: { id_proyecto: projectId },
        attributes: ['id_partida', 'nombre_partida', 'porcentaje']
      });

      if (!partidas || partidas.length === 0) {
        return 0;
      }

      let totalPorcentaje = 0;
      let totalPartidas = partidas.length;

      partidas.forEach((partida) => {
        const porcentajePartida = parseFloat(partida.porcentaje || 0);
        totalPorcentaje += porcentajePartida;
        
      });

      // Calcular promedio de porcentajes de partidas
      const avanceRealPartidas = totalPartidas > 0 ? (totalPorcentaje / totalPartidas) : 0;
    

      // Actualizar el campo avance en la tabla Project
      await sequelize.models.Project.update(
        { avance: avanceRealPartidas.toFixed(2) },
        { where: { id: projectId } }
      );

      return parseFloat(avanceRealPartidas.toFixed(2));

    } catch (error) {
      console.error('Error calculando avance real de partidas:', error);
      return 0;
    }
  }
}

module.exports = new ProjectRepository();
