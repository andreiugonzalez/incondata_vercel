import { useState, useEffect, useCallback } from 'react';

// Configuración por defecto de permisos basada en el archivo roles
const PERMISOS_DEFAULT = {
  // ROLES ACTIVOS EN SISTEMA PÚBLICO
  superadmin: {
    // Acceso completo al sistema - Gestión global (SIN control de permisos)
    dashboard: true,
    correo: true,
    usuarios: true,
    organizacion: true,
    minas: true,
    crear_proyecto: true,
    configurar_proyecto: true,
    general_proyecto: true,
    partidas: true,
    documentos_proyecto: true,
    suma_alzada: true,
    mis_documentos: true,
    accidentes_trabajo: true,
    control_permisos: true, // Solo el superadmin puede ver/usar Control de Permisos
    gestion_superadmin: true, // Mantiene gestión de otros superadmin
    // Herramientas específicas de administración
    panel_general: true,
    administracion_usuarios: true,
    config_sistema: true,
    dashboards_criticos: true
  },
  
  admin: {
    // Administrador - Gestión de usuarios y proyectos de empresa
    dashboard: true,
    correo: true,
    usuarios: true,
    organizacion: true,
    minas: true,
    crear_proyecto: true,
    configurar_proyecto: true,
    general_proyecto: true,
    partidas: true,
    documentos_proyecto: true,
    suma_alzada: true,
    mis_documentos: true,
    accidentes_trabajo: true,
    // Herramientas específicas de administración
    dashboard_administracion: true,
    asignacion_roles: true,
    soporte_basico: true,
    supervision_equipos: true
  },
  
  superintendente: {
    // Superintendente (ALCALDÍA/SECPLAC) - Monitoreo de KPIs y decisiones estratégicas
    dashboard: true,
    correo: true,
    usuarios: false, // Removido: no debe gestionar usuarios
    organizacion: true,
    minas: false,
    crear_proyecto: true,
    configurar_proyecto: true,
    general_proyecto: true,
    partidas: true,
    documentos_proyecto: true,
    suma_alzada: true,
    mis_documentos: true,
    accidentes_trabajo: true,
    control_permisos: false, // REMOVIDO: no debe tener control de permisos
    gestion_superadmin: false, // REMOVIDO: no debe gestionar superadmin
    // Herramientas específicas de superintendencia - Monitoreo de KPIs
    dashboard_gerencial: true,
    informes_ejecutivos: true,
    graficos_kpi: true,
    reportes_estrategicos: true,
    monitoreo_costo: true,
    monitoreo_plazo: true,
    monitoreo_calidad: true,
    monitoreo_seguridad: true,
    decisiones_estrategicas: true,
    // Revisión de reportes y análisis
    revision_reportes: true,
    analisis_kpis: true,
    reportes_gerenciales: true
  },
  
  supervisor: {
    // Supervisor (DOM) - Organización y supervisión diaria del equipo
    dashboard: true,
    correo: true,
    usuarios: false,
    organizacion: false,
    minas: false,
    crear_proyecto: true,
    configurar_proyecto: false,
    general_proyecto: true,
    partidas: true,
    documentos_proyecto: true,
    suma_alzada: true,
    mis_documentos: true,
    accidentes_trabajo: true,
    // Herramientas específicas de supervisión
    plan_trabajo_diario: true,
    checklists_supervision: true,
    reporting_avances: true,
    control_calidad_campo: true,
    organizacion_equipo: true,
    supervision_terreno: true
  },
  
  ITO: {
    // ITO Municipal - Validación de tareas y control de calidad + funciones de contratista
    dashboard: true,
    correo: true,
    usuarios: false,
    organizacion: false,
    minas: false,
    crear_proyecto: true,
    configurar_proyecto: true,
    general_proyecto: true,
    partidas: true,
    documentos_proyecto: true,
    suma_alzada: true,
    mis_documentos: true,
    accidentes_trabajo: true,
    // Herramientas específicas de ITO
    panel_calidad: true,
    checklists_avanzados: true,
    libro_digital: true,
    validacion_tareas: true,
    gestion_no_conformidades: true,
    control_calidad: true,
    planificacion_ito: true,
    seguimiento_progreso: true,
    input_manual: true,
    evidencia_fotografica: true,
    // Herramientas transferidas de contratista
    registro_avances: true,
    completar_tareas: true,
    reporte_progreso: true,
    gestion_recursos: true,
    control_materiales: true
  },
  
  proyectista: {
    // Proyectista - Gestión documental y diseño pre-proyecto
    dashboard: true,
    correo: true,
    usuarios: false,
    organizacion: false,
    minas: false,
    crear_proyecto: false, // NO puede crear proyectos en ejecución
    configurar_proyecto: true, // Puede configurar aspectos de diseño
    general_proyecto: true,
    partidas: false, // NO acceso a partidas presupuestarias de ejecución
    documentos_proyecto: true,
    suma_alzada: false, // NO acceso a aspectos financieros de ejecución
    mis_documentos: true,
    accidentes_trabajo: false, // NO maneja seguridad en terreno
    // Herramientas específicas de proyectista
    diseno_arquitectura: true,
    planos_documentos: true,
    reportes_diseno: true,
    gestion_documental: true,
    ingenieria_diseno: true,
    presupuestacion_diseno: true,
    documentos_legales: true,
    repositorio_planos: true
  },
  
  // ROLES NO INCLUIDOS EN SISTEMA PÚBLICO
  prevencionista: {
    // Prevencionista - Especialista en prevención (NO APLICA en sistema público)
    dashboard: true,
    correo: true,
    usuarios: false,
    organizacion: false,
    minas: false,
    crear_proyecto: true,
    configurar_proyecto: false,
    general_proyecto: true,
    partidas: true,
    documentos_proyecto: true,
    suma_alzada: true,
    mis_documentos: true,
    accidentes_trabajo: true,
    // Herramientas específicas de prevención
    gestion_riesgos: true,
    reportes_seguridad: true,
    capacitaciones: true,
    auditorias_seguridad: true
  },
  
  planner: {
    // Planner - Planificación y secuencia (NO APLICA en sistema público)
    dashboard: true,
    correo: true,
    usuarios: false,
    organizacion: false,
    minas: false,
    crear_proyecto: true,
    configurar_proyecto: false,
    general_proyecto: true,
    partidas: true,
    documentos_proyecto: true,
    suma_alzada: true,
    mis_documentos: true,
    accidentes_trabajo: true,
    // Herramientas específicas de planificación
    diagrama_gantt: true,
    dashboard_partidas: true,
    planificacion_secuencia: true,
    monitoreo_avances: true,
    reprogramacion: true,
    cronogramas: true,
    secuenciacion_actividades: true
  },
  
  // ROLES ADICIONALES PARA COMPATIBILIDAD
  "administrador de contrato": {
    dashboard: true,
    correo: true,
    usuarios: false,
    organizacion: true,
    minas: false,
    crear_proyecto: true,
    configurar_proyecto: false,
    general_proyecto: true,
    partidas: true,
    documentos_proyecto: true,
    suma_alzada: true,
    mis_documentos: true,
    accidentes_trabajo: true,
  },
  
  inspector: {
    // Inspector genérico
    dashboard: true,
    correo: true,
    usuarios: false,
    organizacion: false,
    minas: false,
    crear_proyecto: false,
    configurar_proyecto: false,
    general_proyecto: true,
    partidas: true,
    documentos_proyecto: true,
    suma_alzada: false,
    mis_documentos: true,
    accidentes_trabajo: true,
  },
  
  normal: {
    // Usuario normal con acceso limitado
    dashboard: true,
    correo: true,
    usuarios: false,
    organizacion: false,
    minas: false,
    crear_proyecto: false,
    configurar_proyecto: false,
    general_proyecto: true,
    partidas: false,
    documentos_proyecto: true,
    suma_alzada: false,
    mis_documentos: true,
    accidentes_trabajo: false,
  },
};

export const usePermisos = () => {
  const [permisos, setPermisos] = useState(PERMISOS_DEFAULT);
  const [permisosTemp, setPermisosTemp] = useState(PERMISOS_DEFAULT);
  const [hayCambiosPendientes, setHayCambiosPendientes] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Cargar permisos desde localStorage al inicializar
  useEffect(() => {
    try {
      const permisosGuardados = localStorage.getItem('sistema_permisos');
      if (permisosGuardados) {
        const permisosParseados = JSON.parse(permisosGuardados);
        setPermisos(permisosParseados);
        setPermisosTemp(permisosParseados);
      }
    } catch (error) {
      console.error('Error al cargar permisos:', error);
      // Si hay error, usar permisos por defecto
      setPermisos(PERMISOS_DEFAULT);
      setPermisosTemp(PERMISOS_DEFAULT);
    }
    setIsReady(true);
  }, []);

  // Función para guardar permisos permanentemente
  const guardarPermisos = useCallback(() => {
    try {
      setPermisos(permisosTemp);
      localStorage.setItem('sistema_permisos', JSON.stringify(permisosTemp));
      setHayCambiosPendientes(false);
      
      // Disparar evento personalizado para notificar cambios
      window.dispatchEvent(new CustomEvent('permisos-actualizados', {
        detail: permisosTemp
      }));
      
      return true;
    } catch (error) {
      console.error('Error al guardar permisos:', error);
      return false;
    }
  }, [permisosTemp]);

  // Función para actualizar permisos (mantener compatibilidad)
  const actualizarPermisos = useCallback((nuevosPermisos) => {
    try {
      setPermisos(nuevosPermisos);
      setPermisosTemp(nuevosPermisos);
      localStorage.setItem('sistema_permisos', JSON.stringify(nuevosPermisos));
      setHayCambiosPendientes(false);
      
      // Disparar evento personalizado para notificar cambios
      window.dispatchEvent(new CustomEvent('permisos-actualizados', {
        detail: nuevosPermisos
      }));
      
      return true;
    } catch (error) {
      console.error('Error al guardar permisos:', error);
      return false;
    }
  }, []);

  // Función para verificar si un rol tiene permiso para una herramienta
  const tienePermiso = useCallback((rol, herramienta) => {
    // Garantizar acceso a "Mis documentos" para proyectista
    if (rol === 'proyectista' && herramienta === 'mis_documentos') {
      return true;
    }
    // Verificar permisos específicos según configuración actualizada
    if (rol === 'superintendente') {
      // Superintendente NO tiene control_permisos ni gestion_superadmin
      if (herramienta === 'control_permisos' || herramienta === 'gestion_superadmin') {
        return false;
      }
      // Para otras herramientas, verificar en configuración
      return permisosTemp[rol]?.[herramienta] === true;
    }
    
    // Superadmin se rige por configuración: permite control_permisos y demás herramientas definidas
    if (rol === 'superadmin') {
      return permisosTemp[rol]?.[herramienta] === true;
    }
    
    return permisosTemp[rol]?.[herramienta] === true;
  }, [permisosTemp]);

  // Función para alternar permiso individual (solo cambia estado temporal)
  const togglePermiso = useCallback((rol, herramienta) => {
    const nuevosPermisosTemp = {
      ...permisosTemp,
      [rol]: {
        ...permisosTemp[rol],
        [herramienta]: !permisosTemp[rol]?.[herramienta]
      }
    };
    setPermisosTemp(nuevosPermisosTemp);
    setHayCambiosPendientes(true);
    return true;
  }, [permisosTemp]);

  // Función para resetear a permisos por defecto (temporal)
  const resetearPermisos = useCallback(() => {
    setPermisosTemp(PERMISOS_DEFAULT);
    setHayCambiosPendientes(true);
    return true;
  }, []);

  // Función para resetear inmediatamente (sin pasar por estado temporal)
  const resetearPermisosInmediato = useCallback(() => {
    return actualizarPermisos(PERMISOS_DEFAULT);
  }, []);

  // Función para descartar cambios pendientes
  const descartarCambios = useCallback(() => {
    setPermisosTemp(permisos);
    setHayCambiosPendientes(false);
    return true;
  }, [permisos]);

  return {
    permisos: permisosTemp, // Devolver los permisos temporales para la UI
    actualizarPermisos,
    tienePermiso,
    togglePermiso,
    resetearPermisos,
    resetearPermisosInmediato,
    guardarPermisos,
    descartarCambios,
    hayCambiosPendientes,
    isReady
  };
};