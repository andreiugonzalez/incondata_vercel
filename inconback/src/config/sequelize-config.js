// sequelize-config.js
// Este archivo inicializa todos los modelos Sequelize y define sus relaciones (asociaciones).
// Es el punto central para la configuración de modelos y relaciones en la app.

const fs = require("fs");
const path = require("path");
const sequelize = require("./database");
const SequelizeLib = require("sequelize");

// Ruta de la carpeta donde se encuentran los modelos Sequelize
const modelsDir = path.join(__dirname, "../models");
const models = {};

// Lee todos los archivos en la carpeta de modelos y los importa dinámicamente
fs.readdirSync(modelsDir).forEach((file) => {
  if (file.endsWith(".model.js")) {
    // Importa el modelo y lo inicializa con la instancia de Sequelize
    const model = require(path.join(modelsDir, file))(
      sequelize,
      SequelizeLib.DataTypes,
    );
    models[model.name] = model;
  }
});

// Referencias directas a cada modelo para facilitar la definición de relaciones
const User = models.User;
const EstadoCivil = models.EstadoCivil;
const EstadoCuenta = models.EstadoCuenta;
const Externo = models.Externo;
const Interno = models.Interno;
const Emergencia = models.Emergencia;

const Mine = models.Mine;
const Rol = models.Rol;
const Organizacion = models.Organizacion;
const Document = models.Document;
const DocumentType = models.DocumentType;
const Project = models.Project;
const Afp = models.Afp;
const Tramo = models.Tramo;

const Task = models.Task;
const TipoTarea = models.TipoTarea;
const Subtask = models.Subtask;

const Comment = models.Comment;
const Folder = models.Folder;
const UserRol = models.user_rol;
const Message = models.Message;

const UserProject = models.user_project;

const Notification = models.Notification;

const MedioPago = models.MedioPago;
const TipoContrato = models.TipoContrato;
const Laboral = models.Laboral;

const Banco = models.Banco;
const TipoCuenta = models.TipoCuenta;
const NombreBanco = models.NombreBanco;

const Pais = models.Pais;
const Comuna = models.Comuna;
const Region = models.Region;

const TipoMaterial = models.TipoMaterial;
const Material = models.Material;

const Salud = models.Salud;
const TramoSalud = models.TramoSalud;

const Presupuesto = models.Presupuesto;

const CodTelefono = models.CodTelefono;

const EstadoTarea = models.EstadoTarea;
const SubTareaResponsable = models.SubTareaResponsable;
const TareaResponsable = models.TareaResponsable;
const TipoRecurso = models.TipoRecurso;
const TipoEmpresa = models.TipoEmpresa;

const Partida = models.Partida;

const Unidad = models.Unidad;
const EstadoProyecto = models.EstadoProyecto;
const Subpartida = models.SubPartida;
const historicomaterial = models.HistoricoMaterial;
const Proveedor = models.Proveedor;
const Relacion = models.Relacion;
const Componente = models.Componente;
const Proyectoproveedor = models.Proyectoproveedor;
const Puesto = models.Puesto;
const Grupo = models.Grupo;
const Evento = models.Evento;
const Tipo_evento = models.Tipo_evento;

const Tipo_capacitacion = models.Tipo_capacitacion;
const Prioridad = models.Prioridad;
const Historico_partida = models.historico_partida;
const Historico_subpartida = models.historico_subpartida;

const historico_task = models.historico_task;
const historico_subtask = models.historico_subtask;

const Comment_subpartida = models.Comment_subpartida;
const Comment_tarea = models.Comment_tarea;
const Comment_subtarea = models.Comment_subtarea;
const NotaTrabajoEvento = models.NotaTrabajoEvento;
const user_login = models.user_login;
const Tipo_accidente = models.Tipo_accidente;

const ChartType = models.ChartType;
const UserChartSettings = models.UserChartSettings;

// =======================
// Definición de relaciones (asociaciones) entre modelos
// Cada bloque ERXX representa una relación del diagrama entidad-relación (ER) de la base de datos
// =======================

// Asociación Message-Proyecto para correos con proyecto asociado
Message.belongsTo(Project, {
  as: "proyecto",
  foreignKey: "id_proyecto",
});

// ER01: Relación uno a muchos entre User y Subpartida
Subpartida.belongsTo(User, { as: "Subpartida_User", foreignKey: "id_usuario" });
User.hasMany(Subpartida, { as: "user_Subpartida", foreignKey: "id_usuario" });

// ER02: Relación uno a muchos entre User y Partida
Partida.belongsTo(User, { as: "partida_User", foreignKey: "id_usuario" });
User.hasMany(Partida, { as: "user_partida", foreignKey: "id_usuario" });

// ER03: Relación uno a muchos entre User y UserProject
User.hasMany(UserProject, { as: "user_user_project", foreignKey: "userId" });
UserProject.belongsTo(User, { as: "user_project_user", foreignKey: "userId" });

// ER04: Relación muchos a uno entre User y Salud
User.belongsTo(Salud, { as: "Salud", foreignKey: "id_salud" });
Salud.hasMany(User, { as: "User", foreignKey: "id_salud" });

// ER05: Relación uno a muchos entre User y Mine
User.hasMany(Mine, { as: "mine_User", foreignKey: "id_usuario" });
Mine.belongsTo(User, { as: "User_mine", foreignKey: "id_usuario" });

// ER06: Relación uno a muchos entre CodTelefono y Emergencia
CodTelefono.hasMany(Emergencia, {
  as: "Emergencia_codtelefono",
  foreignKey: "cod_telefono",
});
Emergencia.belongsTo(CodTelefono, {
  as: "codtelefono_Emergencia",
  foreignKey: "cod_telefono",
});

// ER07: Relación uno a muchos entre User y Document
User.hasMany(Document, { as: "documents", foreignKey: "userId" });
Document.belongsTo(User, { as: "user", foreignKey: "userId" });

// ER08: Relación muchos a uno entre User y Comuna
User.belongsTo(Comuna, { as: "comuna", foreignKey: "ID_comuna" });
Comuna.hasMany(User, { as: "users", foreignKey: "ID_comuna" });

// ER09: Relación muchos a uno entre Externo y Banco
Externo.belongsTo(Banco, { as: "Banco_externo", foreignKey: "id_banco" });
Banco.hasMany(Externo, { as: "externo_banco", foreignKey: "id_banco" });

// ER10: Relación muchos a uno entre Externo y Laboral
Externo.belongsTo(Laboral, { as: "laboral", foreignKey: "laboral_id" });
Laboral.hasMany(Externo, { as: "externo", foreignKey: "laboral_id" });

// ER11: Relación uno a muchos entre NombreBanco y Banco
NombreBanco.hasMany(Banco, {
  as: "NombreBanco_banco",
  foreignKey: "id_nombrebanco",
});
Banco.belongsTo(NombreBanco, {
  as: "banco_NombreBanco",
  foreignKey: "id_nombrebanco",
});

// ER12: Relación uno a muchos entre TipoCuenta y Banco
TipoCuenta.hasMany(Banco, {
  as: "tipocuenta_Banco",
  foreignKey: "id_tipo_cuenta",
});
Banco.belongsTo(TipoCuenta, {
  as: "Banco_tipo_cuenta",
  foreignKey: "id_tipo_cuenta",
});

// ER13: Relación muchos a uno entre Laboral y TipoContrato
Laboral.belongsTo(TipoContrato, { foreignKey: "tipo_contrato_id" });

// ER14: Relación muchos a uno entre Laboral y MedioPago
Laboral.belongsTo(MedioPago, { foreignKey: "medio_pago_id" });

// ER15: CONTROL CAMBIOS -> USUARIO (comentario de referencia, sin código)

// ER16: carpeta --> USUARIO (comentario de referencia, sin código)

// ER17: Relación uno a muchos entre User y Notification
User.hasMany(Notification, { as: "notification", foreignKey: "userId" });
Notification.belongsTo(User, { as: "user", foreignKey: "userId" });

// ER18: Disponible ER (comentario de referencia, sin código)

// ER19: Relación uno a muchos entre User y Comment (comentario de tarea)
User.hasMany(Comment, { as: "Comment_user", foreignKey: "userId" });
Comment.belongsTo(User, { as: "user_Comment", foreignKey: "userId" });

// ER20: Relación uno a muchos entre Partida y Comment (comentario de tarea)
Partida.hasMany(Comment, { as: "comment_partida", foreignKey: "id_partida" });
Comment.belongsTo(Partida, { as: "partida_comment", foreignKey: "id_partida" });

// ER21: Disponible ER (comentario de referencia, sin código)

// ER22: Relación uno a muchos entre Task y Subtask
Task.hasMany(Subtask, { as: "Task_Subtask", foreignKey: "id_task" });
Subtask.belongsTo(Task, { as: "Subtask_Task", foreignKey: "id_task" });

// ER23: Relación uno a muchos entre Subtask y Material
Subtask.hasMany(Material, { as: "material_Subtask", foreignKey: "id_subtask" });
Material.belongsTo(Subtask, {
  as: "subtask_Material_Task",
  foreignKey: "id_subtask",
});

// =======================
// Fin de definición de relaciones
// =======================

//ER24
Subtask.hasMany(historicomaterial, {
  as: "Material_historicoTask",
  foreignKey: "id_subtask",
});
historicomaterial.belongsTo(Subtask, {
  as: "historicoTask_Material",
  foreignKey: "id_subtask",
});

//ER 25
CodTelefono.hasMany(User, {
  as: "codtelefono_user",
  foreignKey: "id_cod_telf",
});
User.belongsTo(CodTelefono, {
  as: "user_codtelefono",
  foreignKey: "id_cod_telf",
});

//ER26
EstadoTarea.hasMany(Subtask, {
  as: "EstadoTarea_subtarea",
  foreignKey: "id_EstadoTarea",
});
Subtask.belongsTo(EstadoTarea, {
  as: "subtarea_EstadoTarea",
  foreignKey: "id_EstadoTarea",
});

//ER27
Unidad.hasMany(historicomaterial, {
  as: "Unidad_historico",
  foreignKey: "id_unidad",
});
historicomaterial.belongsTo(Unidad, {
  as: "historico_unidad",
  foreignKey: "id_unidad",
});
//ER28
EstadoTarea.hasMany(Task, {
  as: "EstadoTarea_tarea",
  foreignKey: "id_EstadoTarea",
});
Task.belongsTo(EstadoTarea, {
  as: "tarea_EstadoTarea",
  foreignKey: "id_EstadoTarea",
});

//ER29
EstadoTarea.hasMany(Subpartida, {
  as: "EstadoTarea_subpartida",
  foreignKey: "id_EstadoTarea",
});
Subpartida.belongsTo(EstadoTarea, {
  as: "subpartida_EstadoTarea",
  foreignKey: "id_EstadoTarea",
});

//ER30
Partida.hasMany(Subpartida, {
  as: "subpartida_partida",
  foreignKey: "id_partida",
});
Subpartida.belongsTo(Partida, {
  as: "partida_subpartida",
  foreignKey: "id_partida",
});

//ER31
Project.hasMany(UserProject, {
  as: "user_project_project",
  foreignKey: "projectId",
});
UserProject.belongsTo(Project, {
  as: "project_user_project",
  foreignKey: "projectId",
});

//ER32
CodTelefono.hasMany(Organizacion, {
  as: "codtelefono_organizacion",
  foreignKey: "id",
});
Organizacion.belongsTo(CodTelefono, {
  as: "organizacion_codtelefono",
  foreignKey: "id_codtelefono",
});

//ER33
Organizacion.hasMany(Document, {
  as: "documents",
  foreignKey: "organizationId",
});
Document.belongsTo(Organizacion, {
  as: "organization",
  foreignKey: "organizationId",
});

//ER34
DocumentType.hasMany(Document, {
  as: "documents",
  foreignKey: "documentTypeId",
});
Document.belongsTo(DocumentType, {
  as: "documentType",
  foreignKey: "documentTypeId",
});

//ER35 muchos a muchos
User.hasMany(Task, { as: "tasks_user", foreignKey: "id_usuario" });
Task.belongsTo(User, { as: "user_taks", foreignKey: "id_usuario" });

//ER36 muchos a muchos
User.hasMany(Subtask, { as: "Subtask_user", foreignKey: "id_usuario" });
Subtask.belongsTo(User, { as: "user_Subtask", foreignKey: "id_usuario" });

//ER37
Subpartida.hasMany(Task, {
  as: "subpartida_tarea",
  foreignKey: "id_subpartida",
});
Task.belongsTo(Subpartida, {
  as: "tarea_subpartida",
  foreignKey: "id_subpartida",
});

//ER38
Unidad.hasMany(Material, { as: "Unidad_material", foreignKey: "id_unidad" });
Material.belongsTo(Unidad, { as: "material_unidad", foreignKey: "id_unidad" });

//ER39
Unidad.hasMany(Partida, { as: "Unidad_partida", foreignKey: "id_unidad" });
Partida.belongsTo(Unidad, { as: "partida_unidad", foreignKey: "id_unidad" });

//ER40
EstadoTarea.hasMany(Partida, {
  as: "EstadoTarea_partida",
  foreignKey: "id_EstadoTarea",
});
Partida.belongsTo(EstadoTarea, {
  as: "partida_EstadoTarea",
  foreignKey: "id_EstadoTarea",
});
//ER41
Organizacion.hasMany(Material, {
  as: "proveedor_material",
  foreignKey: "id_organizacion",
});
Material.belongsTo(Proveedor, {
  as: "material_proveedor",
  foreignKey: "id_organizacion",
});

//ER42
TipoMaterial.hasMany(Material, {
  as: "TipoMaterial_material",
  foreignKey: "id_tipomaterial",
});
Material.belongsTo(TipoMaterial, {
  as: "material_TipoMaterial",
  foreignKey: "id_tipomaterial",
});

//ER43
TipoMaterial.hasMany(historicomaterial, {
  as: "historicomaterial",
  foreignKey: "id_tipomaterial",
});
historicomaterial.belongsTo(TipoMaterial, {
  as: "material_TipoMaterial",
  foreignKey: "id_tipomaterial",
});

//ER44
Organizacion.hasMany(historicomaterial, {
  as: "proveedor_historicomaterial",
  foreignKey: "id_organizacion",
});
historicomaterial.belongsTo(Proveedor, {
  as: "historicomaterial_proveedor",
  foreignKey: "id_organizacion",
});

//ER45
Project.hasMany(Material, {
  as: "proyecto_material",
  foreignKey: "id_proyecto",
});
Material.belongsTo(Project, {
  as: "material_proyecto",
  foreignKey: "id_proyecto",
});

//ER46
Project.hasMany(Partida, { as: "proyecto_partida", foreignKey: "id_proyecto" });
Partida.belongsTo(Project, {
  as: "partida_proyecto",
  foreignKey: "id_proyecto",
});

//ER47
Project.hasMany(Proyectoproveedor, {
  as: "Proyectoproveedor_Project",
  foreignKey: "id_proyecto",
});
Proyectoproveedor.belongsTo(Project, {
  as: "Project_Proyectoproveedor",
  foreignKey: "id_proyecto",
});

//ER48
EstadoProyecto.hasMany(Project, {
  as: "proyecto_estadoproyecto",
  foreignKey: "id_estadoproyecto",
});
Project.belongsTo(EstadoProyecto, {
  as: "proyecto_proyecto",
  foreignKey: "id_estadoproyecto",
});

//ER49
Comuna.hasMany(Organizacion, {
  as: "Comuna_organizacion",
  foreignKey: "id_comuna",
});
Organizacion.belongsTo(Comuna, {
  as: "organizacion_Comuna",
  foreignKey: "id_comuna",
});

//ER50
Comuna.hasMany(Mine, { as: "Comuna_Mine", foreignKey: "id_comuna" });
Mine.belongsTo(Comuna, { as: "Mine_Comuna", foreignKey: "id_comuna" });

//ER51
Pais.hasMany(Region, { as: "regiones_pais", foreignKey: "id_pais" });
Region.belongsTo(Pais, { as: "pais_regiones", foreignKey: "id_pais" });

//ER52
Region.hasMany(Comuna, { as: "comunas_regions", foreignKey: "id_region" });
Comuna.belongsTo(Region, { as: "region_comunas", foreignKey: "id_region" });

//ER53
Unidad.hasMany(Task, { as: "Unidad_Task", foreignKey: "id_unidad" });
Task.belongsTo(Unidad, { as: "Task_unidad", foreignKey: "id_unidad" });

// Externo.belongsTo(Laboral, { as: 'laboral', foreignKey: 'laboral_id' });
// Laboral.hasOne(Externo, { as: 'externo', foreignKey: 'laboral_id' });
//ER54
//TramoSalud.hasMany(Salud, { as: 'TramoSalud_salud', foreignKey: 'id_tramoSalud' });
//Salud.belongsTo(TramoSalud, { as: 'salud_TramoSalud', foreignKey: 'id_tramoSalud' });

//ER55
Rol.belongsToMany(User, {
  as: "users",
  through: "user_rol",
  foreignKey: "rolId",
});

//ER56
Interno.belongsTo(User, { as: "User_interno", foreignKey: "id_usuario" });
User.hasMany(Interno, { as: "Interno_user", foreignKey: "id_usuario" });

//ER57
Externo.belongsTo(User, { as: "externo", foreignKey: "id_usuario" });
User.hasMany(Externo, { as: "user", foreignKey: "id_usuario" });

//ER58
User.belongsToMany(Rol, {
  as: "roles",
  through: "user_rol",
  foreignKey: "userId",
});

//ER59
User.hasMany(Emergencia, { as: "emergencia_user", foreignKey: "id_user" });
Emergencia.belongsTo(User, { as: "user_emergencia", foreignKey: "id_user" });

//ER60
User.belongsTo(EstadoCivil, {
  as: "EstadoCivil",
  foreignKey: "id_estado_civil",
});
EstadoCivil.hasMany(User, { as: "user", foreignKey: "id_estado_civil" });

//ER61
Organizacion.hasMany(User, { as: "users", foreignKey: "organizacionid" });
User.belongsTo(Organizacion, {
  as: "organizacion",
  foreignKey: "organizacionid",
});

//ER62
Afp.hasMany(User, { as: "afp_user", foreignKey: "id_afp" });
User.belongsTo(Afp, { as: "user_afp", foreignKey: "id_afp" });

//ER63
//Tramo.hasMany(Afp, { as: 'afp_Tramo', foreignKey: 'id_tramo' });
//Afp.belongsTo(Tramo, { as: 'Tramo_afp', foreignKey: 'id_tramo' });

//ER64
Mine.hasMany(Project, { as: "Project_mine", foreignKey: "id_mina" });
Project.belongsTo(Mine, { as: "mine_Project", foreignKey: "id_mina" });

//ER65
TipoEmpresa.hasMany(Proveedor, {
  as: "TipoEmpresa_proveedor",
  foreignKey: "id_TipoEmpresa",
});
Proveedor.belongsTo(TipoEmpresa, {
  as: "proveedor_TipoEmpresa",
  foreignKey: "id_TipoEmpresa",
});

//ER66
CodTelefono.hasMany(Proveedor, {
  as: "codtelefono_Proveedor",
  foreignKey: "id_codtelefono",
});
Proveedor.belongsTo(CodTelefono, {
  as: "Proveedor_codtelefono",
  foreignKey: "id_codtelefono",
});

//ER67
EstadoCuenta.hasMany(User, {
  as: "estado_user",
  foreignKey: "id_estado_cuenta",
});
User.belongsTo(EstadoCuenta, {
  as: "user_estado",
  foreignKey: "id_estado_cuenta",
});

//ER68
Relacion.hasMany(Emergencia, {
  as: "Emergencia_Relacion",
  foreignKey: "id_relacion",
});
Emergencia.belongsTo(Relacion, {
  as: "Relacion_Emergencia",
  foreignKey: "id_relacion",
});

//ER69
Organizacion.hasMany(Mine, {
  as: "organizacion_mine",
  foreignKey: "id_organizacion",
});
Mine.belongsTo(Organizacion, {
  as: "mine_organizacion",
  foreignKey: "id_organizacion",
});
//ER70
Componente.hasMany(historicomaterial, {
  as: "componente_historicomaterial",
  foreignKey: "id_componente",
});
historicomaterial.belongsTo(Componente, {
  as: "historicomaterial_componente",
  foreignKey: "id_componente",
});

//ER71
Componente.hasMany(Material, {
  as: "material_componente",
  foreignKey: "id_componente",
});
Material.belongsTo(Componente, {
  as: "componente_material",
  foreignKey: "id_componente",
});

//ER72
Organizacion.hasMany(Proyectoproveedor, {
  as: "Proyectoproveedor_proveedor",
  foreignKey: "id_organizacion",
});
Proyectoproveedor.belongsTo(Organizacion, {
  as: "proveedor_Proyectoproveedor",
  foreignKey: "id_organizacion",
});

//ER73
Grupo.hasMany(User, { as: "grupo_user", foreignKey: "id_grupo" });
User.belongsTo(Grupo, { as: "user_grupo", foreignKey: "id_grupo" });

//ER74
Puesto.hasMany(User, { as: "puesto_user", foreignKey: "id_puesto" });
User.belongsTo(Puesto, { as: "user_puesto", foreignKey: "id_puesto" });

//ER75
Folder.hasMany(Document, { as: "documents", foreignKey: "folderId" });
Document.belongsTo(Folder, { as: "folder", foreignKey: "folderId" });

//ER76 Definir la relación recursiva para Folder utilizando parent_folder_id
Folder.hasMany(Folder, { as: "children", foreignKey: "parent_folder_id" });
Folder.belongsTo(Folder, { as: "parent", foreignKey: "parent_folder_id" });

//ER77
User.hasMany(Folder, { as: "usuario_folder", foreignKey: "usuario_id" });
Folder.belongsTo(User, { as: "folder_usuario", foreignKey: "usuario_id" });

//ER78
User.hasMany(Evento, { as: "usuario_evento", foreignKey: "id_usuario" });
Evento.belongsTo(User, { as: "evento_usuario", foreignKey: "id_usuario" });

//ER79
Tipo_evento.hasMany(Evento, {
  as: "tipo_evento_evento",
  foreignKey: "id_tipo_evento",
});
Evento.belongsTo(Tipo_evento, {
  as: "evento_tipo_evento",
  foreignKey: "id_tipo_evento",
});

//ER80
Tipo_capacitacion.hasMany(Evento, {
  as: "Tipo_capacitacion_evento",
  foreignKey: "id_tipo_capacitacion",
});
Evento.belongsTo(Tipo_capacitacion, {
  as: "evento_Tipo_capacitacion",
  foreignKey: "id_tipo_capacitacion",
});

//ER81
Project.hasMany(Evento, { as: "Project_evento", foreignKey: "id_proyecto" });
Evento.belongsTo(Project, { as: "evento_Project", foreignKey: "id_proyecto" });

//ER82 crear foranea event to document !! Y PASAR A LUCID
Evento.hasMany(Document, { as: "Document_evento", foreignKey: "eventId" });
Document.belongsTo(Evento, { as: "evento_Document", foreignKey: "eventId" });

//ER83
User.hasMany(Comment_subpartida, {
  as: "Comment_subpartida_user",
  foreignKey: "userId",
});
Comment_subpartida.belongsTo(User, {
  as: "user_Comment_subpartida",
  foreignKey: "userId",
});
//ER84
User.hasMany(Comment_tarea, { as: "Comment_tarea_user", foreignKey: "userId" });
Comment_tarea.belongsTo(User, {
  as: "user_Comment_tarea",
  foreignKey: "userId",
});
//ER85
User.hasMany(Comment_subtarea, {
  as: "Comment_subtarea_user",
  foreignKey: "userId",
});
Comment_subtarea.belongsTo(User, {
  as: "user_Comment_subtarea",
  foreignKey: "userId",
});

//ER86
User.hasMany(NotaTrabajoEvento, {
  as: "usuario_notasTrabajo",
  foreignKey: "usuarioId",
});
NotaTrabajoEvento.belongsTo(User, {
  as: "notasTrabajo_usuario",
  foreignKey: "usuarioId",
});

//ER87
Evento.hasMany(NotaTrabajoEvento, {
  as: "evento_notasTrabajo",
  foreignKey: "eventoId",
});
NotaTrabajoEvento.belongsTo(Evento, {
  as: "notasTrabajo_evento",
  foreignKey: "eventoId",
});

//89 user login User_login con user
User.hasMany(user_login, { as: "usuario_login_user", foreignKey: "user_id" });
user_login.belongsTo(User, { as: "login_user_usuario", foreignKey: "user_id" });

//ER90 por insertar al regularizar usuarios de folder
// User.hasMany(Folder, { as: 'user_folder', foreignKey: 'user_id' });
// Folder.belongsTo(User, { as: 'folder_user', foreignKey: 'user_id' });

//ER91validacion insert
// Project.hasMany(Folder, { as: 'folder_Project', foreignKey: 'id_partida' });
// Folder.belongsTo(Project, { as: 'Project_folder', foreignKey: 'id_partida' });

//ER92 validacion insert
// Partida.hasMany(Folder, { as: 'folder_Partida', foreignKey: 'id_partida' });
// Folder.belongsTo(Partida, { as: 'Partida_folder', foreignKey: 'id_partida' });

//ER93
// Relación entre User y UserChartSettings
User.hasMany(UserChartSettings, { as: "chartSettings", foreignKey: "userId" });
UserChartSettings.belongsTo(User, { as: "user", foreignKey: "userId" });

//ER94
// Relación entre Project y UserChartSettings
Project.hasMany(UserChartSettings, {
  as: "chartSettings",
  foreignKey: "projectId",
});
UserChartSettings.belongsTo(Project, {
  as: "project",
  foreignKey: "projectId",
});

//ER94
// Relación entre ChartType y UserChartSettings
ChartType.hasMany(UserChartSettings, {
  as: "chartSettings",
  foreignKey: "chartId",
});
UserChartSettings.belongsTo(ChartType, {
  as: "chartType",
  foreignKey: "chartId",
});

// ER95: Asociación uno a muchos entre Rol y user_project
Rol.hasMany(UserProject, { as: "rol_userProject", foreignKey: "rolId" });
UserProject.belongsTo(Rol, { as: "userProject_Rol", foreignKey: "rolId" });

// //ER96
// Historico_partida.hasMany(Historico_subpartida, { as: 'historicosubpartida_historicopartida', foreignKey: 'id_partida' });
// Historico_subpartida.belongsTo(Historico_partida, { as: 'historicopartida_historicosubpartida', foreignKey: 'id_partida' });

// //ER97
// Historico_subpartida.hasMany(historico_task, { as: 'historicotarea_historicosubpartida', foreignKey: 'id_subpartida' });
// historico_task.belongsTo(Historico_subpartida, { as: 'historicosubpartida_historicotarea', foreignKey: 'id_subpartida' });

// //ER98
// historico_task.hasMany(historico_subtask, { as: 'historicosubtarea_historicotarea', foreignKey: 'id_task' });
// historico_subtask.belongsTo(historico_task, { as: 'historicotarea_historicosubtarea', foreignKey: 'id_task' });

//ER99
User.hasMany(Historico_partida, {
  as: "historicopartida_user",
  foreignKey: "id_usuario",
});
Historico_partida.belongsTo(User, {
  as: "user_historicopartida",
  foreignKey: "id_usuario",
});

//ER100
User.hasOne(User, { as: "replacedUser", foreignKey: "replacedByUserId" });
User.belongsTo(User, { as: "replacedBy", foreignKey: "replacedByUserId" });

// ER101
Partida.hasMany(Material, { as: "partida_material", foreignKey: "id_partida" });
Material.belongsTo(Partida, {
  as: "material_partida",
  foreignKey: "id_partida",
});

// ER102
Subpartida.hasMany(Material, {
  as: "subpartida_material",
  foreignKey: "id_subpartida",
});
Material.belongsTo(Subpartida, {
  as: "material_subpartida",
  foreignKey: "id_subpartida",
});

// ER103
Task.hasMany(Material, { as: "task_material", foreignKey: "id_task" });
Material.belongsTo(Task, { as: "material_task", foreignKey: "id_task" });

// ER104

// Relaciones para el sistema de mensajes internos
User.hasMany(Message, { foreignKey: "fromUserId", as: "sentMessages" });
User.hasMany(Message, { foreignKey: "toUserId", as: "receivedMessages" });
Message.belongsTo(User, { foreignKey: "fromUserId", as: "fromUser" });
Message.belongsTo(User, { foreignKey: "toUserId", as: "toUser" });

sequelize.models = {
  Tipo_capacitacion,
  Puesto,
  Grupo,
  Componente,
  Relacion,
  Unidad,
  EstadoProyecto,
  TipoEmpresa,
  TipoRecurso, // no utilizada aun
  CodTelefono,
  User,
  EstadoCivil,
  EstadoCuenta,
  Salud,
  TramoSalud,
  Externo,
  Interno,
  Emergencia,
  Afp,
  Tramo,
  Subpartida,
  Prioridad,
  Mine,
  Rol,
  Organizacion,
  Document,
  DocumentType,
  Project,
  UserProject,
  Task,
  TipoTarea, // no utilizada aun
  Subtask,
  EstadoTarea,
  TareaResponsable,
  SubTareaResponsable,

  Comment,
  Comment_subpartida,
  Comment_tarea,
  Comment_subtarea,
  Folder,
  UserRol,
  Notification,

  MedioPago,
  TipoContrato,
  Laboral,

  Banco,
  TipoCuenta,
  NombreBanco,

  Pais,
  Comuna,
  Region,

  TipoMaterial,
  Material,
  Presupuesto,
  Partida,
  historicomaterial,
  Proveedor,
  Proyectoproveedor,
  Evento,
  Tipo_evento,
  Historico_partida,
  Historico_subpartida,
  historico_task,
  historico_subtask,
  NotaTrabajoEvento,
  user_login,
  Tipo_accidente,
  ChartType,
  UserChartSettings,
  Message,
};

module.exports = {
  sequelize,
  User,
  Externo,
  Interno,
  Document,
  Rol,
  UserRol,
  Message,
  Sequelize: SequelizeLib,
};
