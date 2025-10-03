const jwt = require("jsonwebtoken");
const { response } = require("../utils/response");

// Matriz de permisos por rol basada en el archivo roles
const ROLE_PERMISSIONS = {
  // ROLES ACTIVOS EN SISTEMA PÚBLICO
  superadmin: {
    dashboard_route: "/dashboard/users",
    permissions: ["gestion_superadmin", "gestion_usuarios", "gestion_proyectos", "gestion_organizaciones", "gestion_minas", "configuracion_sistema", "control_permisos"],
    tools: ["usuarios", "organizacion", "minas", "crear_proyecto", "mis_documentos", "documentos", "correo", "dashboard", "superadmin_panel", "control_permisos"]
  },
  admin: {
    dashboard_route: "/dashboard/users", 
    permissions: ["gestion_usuarios", "gestion_proyectos", "gestion_organizaciones", "soporte_basico"],
    tools: ["usuarios", "organizacion", "crear_proyecto", "mis_documentos", "correo", "dashboard"]
  },
  superintendente: {
    dashboard_route: "/dashboard/dashboardproyect",
    permissions: ["monitoreo_kpis", "decisiones_estrategicas", "supervision_general", "acceso_completo_proyecto", "revision_reportes"],
    tools: ["dashboard", "general_proyecto", "materiales", "documentos", "accidentes", "config", "correo", "dashboard_gerencial", "informes_ejecutivos", "graficos_kpi", "reportes_estrategicos"]
  },
  supervisor: {
    dashboard_route: "/dashboard/dashboardproyect",
    permissions: ["organizacion_equipo", "supervision_diaria", "gestion_terreno"],
    tools: ["dashboard", "general_proyecto", "materiales", "documentos", "accidentes"]
  },
  ITO: {
    dashboard_route: "/dashboard/dashboardproyect", 
    permissions: ["validacion_tareas", "control_calidad", "inspeccion_tecnica", "completar_avances", "inspeccion_obras", "reporte_progreso"],
    tools: ["dashboard", "general_proyecto", "partidas", "documentos", "correo", "materiales"]
  },
  contratista: {
    dashboard_route: "/dashboard/dashboardproyect",
    permissions: ["completar_avances", "inspeccion_obras", "reporte_progreso"],
    tools: ["dashboard", "general_proyecto", "partidas", "materiales"]
  },
  proyectista: {
    dashboard_route: "/dashboard/dashboardproyect",
    permissions: ["gestion_documental", "diseno_preproyecto", "documentacion_tecnica"],
    tools: ["dashboard", "mis_documentos", "documentos", "correo"]
  },

  // ROLES NO INCLUIDOS EN SISTEMA PÚBLICO (compatibilidad)
  prevencionista: {
    dashboard_route: "/dashboard/dashboardproyect",
    permissions: ["prevencion_riesgos", "seguridad_laboral"],
    tools: ["dashboard", "accidentes", "documentos"]
  },
  planner: {
    dashboard_route: "/dashboard/dashboardproyect", 
    permissions: ["planificacion", "secuencia_tareas"],
    tools: ["dashboard", "general_proyecto", "partidas"]
  },

  // ROLES ADICIONALES PARA COMPATIBILIDAD
  "administrador de contrato": {
    dashboard_route: "/dashboard/dashboardproyect",
    permissions: ["administracion_contrato"],
    tools: ["dashboard", "documentos", "partidas"]
  },
  inspector: {
    dashboard_route: "/dashboard/dashboardproyect",
    permissions: ["inspeccion_general"],
    tools: ["dashboard", "general_proyecto"]
  },
  normal: {
    dashboard_route: "/dashboard/dashboardproyect",
    permissions: ["acceso_basico"],
    tools: ["dashboard"]
  }
};

// Middleware de autorización por roles específicos
function roleAuthorizationMiddleware(requiredRoles) {
  return function (req, res, next) {
    try {
      const token = req.headers["authorization"]?.split(" ")[1];

      if (!token) {
        return res.status(401).send(response(401, "Usuario no autorizado"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = req.user || {};
      req.user.email = decoded.email;
      req.user.rol = decoded.rol;
      if (decoded.id) req.user.id = decoded.id;

      // Verificar si el rol del usuario está en los roles requeridos
      const userRoles = Array.isArray(req.user.rol) ? req.user.rol : [req.user.rol];
      const hasRequiredRole = userRoles.some(role => requiredRoles.includes(role));

      if (!hasRequiredRole) {
        return res.status(403).send(response(403, `Acceso denegado. Roles requeridos: ${requiredRoles.join(', ')}`));
      }

      // Agregar información de permisos del usuario al request
      req.user.permissions = [];
      req.user.tools = [];
      req.user.dashboard_route = "/dashboard/dashboardproyect"; // default

      userRoles.forEach(role => {
        const roleConfig = ROLE_PERMISSIONS[role];
        if (roleConfig) {
          req.user.permissions = [...new Set([...req.user.permissions, ...roleConfig.permissions])];
          req.user.tools = [...new Set([...req.user.tools, ...roleConfig.tools])];
          req.user.dashboard_route = roleConfig.dashboard_route;
        }
      });

      next();
    } catch (err) {
      return res.status(401).send(response(401, "Usuario no autorizado, token inválido"));
    }
  };
}

// Middleware para verificar permisos específicos
function requirePermission(permission) {
  return function (req, res, next) {
    console.log('DEBUG - requirePermission middleware:', {
      permission,
      user: req.user ? {
        id: req.user.id,
        rol: req.user.rol,
        permissions: req.user.permissions
      } : 'No user'
    });
    
    if (!req.user || !req.user.permissions) {
      return res.status(401).send(response(401, "Usuario no autenticado"));
    }

    // Acceso solo por permiso explícito; eliminar bypass global
    // Excepción particular: ninguna. Todos deben tener el permiso requerido.

    if (!req.user.permissions.includes(permission)) {
      console.log('DEBUG - Permission denied. Required:', permission, 'User permissions:', req.user.permissions);
      return res.status(403).send(response(403, `Permiso requerido: ${permission}`));
    }

    next();
  };
}

// Middleware para verificar acceso a herramientas específicas
function requireTool(tool) {
  return function (req, res, next) {
    if (!req.user || !req.user.tools) {
      return res.status(401).send(response(401, "Usuario no autenticado"));
    }
    // Eliminar bypass: verificar herramienta explícita según rol

    if (!req.user.tools.includes(tool)) {
      return res.status(403).send(response(403, `Acceso denegado a la herramienta: ${tool}`));
    }

    next();
  };
}

// Función helper para obtener permisos de un rol
function getRolePermissions(role) {
  return ROLE_PERMISSIONS[role] || null;
}

// Función helper para verificar si un rol tiene un permiso específico
function roleHasPermission(role, permission) {
  const roleConfig = ROLE_PERMISSIONS[role];
  return roleConfig ? roleConfig.permissions.includes(permission) : false;
}

module.exports = {
  roleAuthorizationMiddleware,
  requirePermission,
  requireTool,
  getRolePermissions,
  roleHasPermission,
  ROLE_PERMISSIONS
};