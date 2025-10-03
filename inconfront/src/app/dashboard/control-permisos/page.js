"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { 
  Shield, 
  Users, 
  Settings, 
  CheckCircle, 
  XCircle,
  Edit,
  Save,
  X,
  AlertTriangle,
  RotateCcw,
  Eye,
  EyeOff
} from "lucide-react";
import { toast } from "react-hot-toast";
import { getUsers } from "../../services/user";
import { usePermisos } from "../../hooks/usePermisos";
import { getPrimaryRole } from "@/app/utils/roleUtils";

export default function ControlPermisos() {
  const router = useRouter();
  const userStore = useSelector((state) => state.user);
  const role = getPrimaryRole(userStore.user);
  const { tienePermiso } = usePermisos();

  // Estados del componente
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [editingPermissions, setEditingPermissions] = useState({});
  const [activeTab, setActiveTab] = useState("permisos");
  
  // Hook de permisos
  const { permisos, togglePermiso: togglePermisoHook, actualizarPermisos, resetearPermisos, resetearPermisosInmediato, guardarPermisos, descartarCambios, hayCambiosPendientes } = usePermisos();

  // Definir roles disponibles basados en el archivo roles
  const roles = [
    // ROLES ACTIVOS EN SISTEMA PÚBLICO
    { id: "superadmin", name: "Superadmin", description: "Gestión global del sistema, creación de empresas/usuarios, configuración", color: "bg-red-100 text-red-800" },
    { id: "admin", name: "Admin", description: "Gestión de usuarios y proyectos de empresa, soporte básico", color: "bg-purple-100 text-purple-800" },
    { id: "superintendente", name: "Superintendente", description: "ALCALDÍA/SECPLAC - Monitoreo de KPIs y decisiones estratégicas", color: "bg-indigo-100 text-indigo-800" },
    { id: "supervisor", name: "Supervisor", description: "DOM - Organización y supervisión diaria del equipo en terreno", color: "bg-blue-100 text-blue-800" },
    { id: "ITO", name: "ITO Municipal", description: "Inspector Técnico - Validación de tareas y control de calidad", color: "bg-orange-100 text-orange-800" },
    { id: "proyectista", name: "Proyectista", description: "Gestión documental y diseño pre-proyecto", color: "bg-teal-100 text-teal-800" },
    
    // ROLES NO INCLUIDOS EN SISTEMA PÚBLICO
    { id: "prevencionista", name: "Prevencionista", description: "Especialista en prevención (NO APLICA)", color: "bg-green-100 text-green-800" },
    { id: "planner", name: "Planner", description: "Planificación y secuencia (NO APLICA)", color: "bg-yellow-100 text-yellow-800" },
    
    // ROLES ADICIONALES PARA COMPATIBILIDAD
    { id: "administrador de contrato", name: "Admin Contrato", description: "Administrador de contrato", color: "bg-pink-100 text-pink-800" },
    { id: "inspector", name: "Inspector", description: "Inspector genérico", color: "bg-gray-100 text-gray-800" }
  ];

  // Definir herramientas del menú principal
  const herramientasMenu = [
    { id: "dashboard", name: "Dashboard", description: "Panel principal de estadísticas" },
    { id: "correo", name: "Correo", description: "Sistema de mensajería interna" },
    { id: "usuarios", name: "Usuarios", description: "Gestión de usuarios del sistema" },
    { id: "organizacion", name: "Organización", description: "Gestión de organizaciones" },
    { id: "minas", name: "Minas", description: "Gestión de sitios mineros" },
    { id: "crear_proyecto", name: "Crear Proyecto", description: "Creación y gestión de proyectos" },
    { id: "mis_documentos", name: "Mis Documentos", description: "Gestión de documentos personales" },
  ];

  // Definir herramientas dentro del proyecto
  const herramientasProyecto = [
    { id: "general_proyecto", name: "General", description: "Pestaña principal del dashboard del proyecto" },
    { id: "partidas", name: "Partidas", description: "Gestión de partidas de trabajo" },
    { id: "documentos_proyecto", name: "Documentos", description: "Gestión de documentos del proyecto" },
    { id: "suma_alzada", name: "Suma Alzada (Control Carta Gantt)", description: "Gestión de presupuestos y cronogramas" },
    { id: "accidentes_trabajo", name: "Accidentes de Trabajo", description: "Gestión de accidentes y prevención" },
    { id: "configurar_proyecto", name: "Configurar Proyecto", description: "Acceso al botón de configuración del proyecto" },
  ];

  // Cargar usuarios desde el backend
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getUsers();
      if (response && response.data) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  }, []);

  // Verificar permisos - usuarios con permiso control_permisos pueden acceder
  useEffect(() => {
    if (!tienePermiso(role, "control_permisos")) {
      router.push("/dashboard/dashboardproyect");
      return;
    }
    loadUsers();
  }, [role, router, loadUsers]);

  // Cambiar permiso individual
  const togglePermiso = (rolId, herramientaId) => {
    const exito = togglePermisoHook(rolId, herramientaId);
    if (exito) {
      toast.success(`Permiso cambiado para ${roles.find(r => r.id === rolId)?.name} (Cambio pendiente)`);
    } else {
      toast.error("Error al cambiar permiso");
    }
  };

  // Guardar cambios permanentemente
  const guardarCambiosPermitidos = async () => {
    setLoading(true);
    try {
      const exito = guardarPermisos();
      if (exito) {
        await new Promise(resolve => setTimeout(resolve, 300));
        toast.success("Permisos guardados exitosamente");
      } else {
        toast.error("Error al guardar permisos");
      }
    } catch (error) {
      toast.error("Error al guardar permisos");
    } finally {
      setLoading(false);
    }
  };

  // Función para resetear permisos (aplicar inmediatamente)
  const resetear = async () => {
    setLoading(true);
    try {
      const exito = resetearPermisosInmediato();
      
      if (exito) {
        await new Promise(resolve => setTimeout(resolve, 300));
        toast.success("Permisos restablecidos a valores por defecto");
      } else {
        toast.error("Error al restablecer permisos");
      }
    } catch (error) {
      toast.error("Error al restablecer permisos");
    } finally {
      setLoading(false);
    }
  };

  // Función para descartar cambios pendientes
  const descartarCambiosPendientes = () => {
    const exito = descartarCambios();
    if (exito) {
      toast.success("Cambios descartados");
    } else {
      toast.error("Error al descartar cambios");
    }
  };

  // Verificar si el usuario tiene acceso a esta página
  if (!tienePermiso(role, "control_permisos")) {
    return null;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen w-full">
      <div className="max-w-full mx-auto">
        {/* Header Principal */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Control de Permisos</h1>
                <p className="text-gray-600">Gestiona qué herramientas puede acceder cada rol</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {hayCambiosPendientes && (
                <div className="flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-sm">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Hay cambios pendientes
                </div>
              )}
              <button
                onClick={resetear}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                {loading ? "Reseteando..." : "Resetear"}
              </button>
              {hayCambiosPendientes && (
                <button
                  onClick={descartarCambiosPendientes}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <EyeOff className="h-4 w-4 mr-2" />
                  Descartar
                </button>
              )}
              <button
                onClick={guardarCambiosPermitidos}
                disabled={loading || !hayCambiosPendientes}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </div>
        </div>

        {/* Pestañas */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab("permisos")}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === "permisos"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Shield className="h-5 w-5 inline mr-2" />
                Matriz de Permisos
              </button>
              <button
                onClick={() => setActiveTab("roles")}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === "roles"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Users className="h-5 w-5 inline mr-2" />
                Vista por Roles
              </button>
            </nav>
          </div>
        </div>

        {/* Contenido según pestaña activa */}
        {activeTab === "permisos" && (
          <div className="space-y-6">
            {/* Sección 1: Herramientas del Menú Principal */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-blue-50">
                <div className="flex items-center space-x-3">
                  <Settings className="h-6 w-6 text-blue-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Herramientas del Sistema</h3>
                    <p className="text-sm text-gray-600 mt-1">Control de acceso al menú lateral del sistema</p>
                  </div>
                </div>
              </div>
              
              <div>
                <table className="w-full max-w-full divide-y divide-gray-200 table-fixed">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{width: "25%"}}>
                        Herramienta
                      </th>
                      {roles.map((rol) => (
                        <th key={rol.id} className="px-3 py-3 text-center text-[11px] font-medium text-gray-500 uppercase tracking-wider min-w-[220px] whitespace-normal break-words" style={{width: `${75/roles.length}%`}}>
                          <div className="flex flex-col items-center">
                            <Users className="h-3 w-3 text-gray-400 mb-1" />
                            <span className="text-[11px] leading-tight text-center whitespace-normal break-words font-semibold" style={{lineHeight: "1.2"}}>{rol.name}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {herramientasMenu.map((herramienta) => (
                      <tr key={herramienta.id} className="hover:bg-gray-50">
                        <td className="px-3 py-3 overflow-hidden">
                          <div>
                            <div className="text-sm font-medium text-gray-900 truncate">{herramienta.name}</div>
                            <div className="text-xs text-gray-500 truncate">{herramienta.description}</div>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                              Sistema
                            </span>
                          </div>
                        </td>
                        {roles.map((rol) => (
                          <td key={`${herramienta.id}-${rol.id}`} className="px-3 py-3 text-center">
                            <button
                              onClick={() => togglePermiso(rol.id, herramienta.id)}
                              className={`p-1.5 rounded-full transition-all duration-200 ${
                                permisos[rol.id]?.[herramienta.id]
                                  ? "bg-green-100 text-green-600 hover:bg-green-200"
                                  : "bg-red-100 text-red-600 hover:bg-red-200"
                              }`}
                              title={`${permisos[rol.id]?.[herramienta.id] ? "Acceso permitido" : "Acceso denegado"} para ${rol.name}`}
                            >
                              {permisos[rol.id]?.[herramienta.id] ? (
                                <Eye className="h-4 w-4" />
                              ) : (
                                <EyeOff className="h-4 w-4" />
                              )}
                            </button>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sección 2: Herramientas Dentro del Proyecto */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-green-50">
                <div className="flex items-center space-x-3">
                  <Settings className="h-6 w-6 text-green-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Herramientas del Proyecto</h3>
                    <p className="text-sm text-gray-600 mt-1">Control de pestañas disponibles al entrar a un proyecto específico</p>
                  </div>
                </div>
              </div>
              
              <div>
                <table className="w-full divide-y divide-gray-200 table-fixed">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{width: "25%"}}>
                        Herramienta
                      </th>
                      {roles.map((rol) => (
                        <th key={rol.id} className="px-3 py-3 text-center text-[11px] font-medium text-gray-500 uppercase tracking-wider min-w-[140px] whitespace-normal break-words" style={{width: `${75/roles.length}%`}}>
                          <div className="flex flex-col items-center">
                            <Users className="h-3 w-3 text-gray-400 mb-1" />
                            <span className="text-[11px] leading-tight text-center whitespace-normal break-words font-semibold" style={{lineHeight: "1.2"}}>{rol.name}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {herramientasProyecto.map((herramienta) => (
                      <tr key={herramienta.id} className="hover:bg-gray-50">
                        <td className="px-3 py-3 overflow-hidden">
                          <div>
                            <div className="text-sm font-medium text-gray-900 truncate">{herramienta.name}</div>
                            <div className="text-xs text-gray-500 truncate">{herramienta.description}</div>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                                Proyecto
                              </span>
                          </div>
                        </td>
                        {roles.map((rol) => (
                          <td key={`${herramienta.id}-${rol.id}`} className="px-3 py-3 text-center">
                            <button
                              onClick={() => togglePermiso(rol.id, herramienta.id)}
                              className={`p-1.5 rounded-full transition-all duration-200 ${
                                permisos[rol.id]?.[herramienta.id]
                                  ? "bg-green-100 text-green-600 hover:bg-green-200"
                                  : "bg-red-100 text-red-600 hover:bg-red-200"
                              }`}
                              title={`${permisos[rol.id]?.[herramienta.id] ? "Acceso permitido" : "Acceso denegado"} para ${rol.name}`}
                            >
                              {permisos[rol.id]?.[herramienta.id] ? (
                                <Eye className="h-4 w-4" />
                              ) : (
                                <EyeOff className="h-4 w-4" />
                              )}
                            </button>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "roles" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((rol) => (
              <div key={rol.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{rol.name}</h3>
                      <p className="text-sm text-gray-600">{rol.description}</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${rol.color}`}>
                      {rol.name}
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  {/* Sistema */}
                                      <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                      <Settings className="h-4 w-4 mr-2 text-blue-600" />
                      Sistema:
                    </h4>
                  <div className="space-y-2 mb-4">
                    {herramientasMenu.map((herramienta) => (
                      <div key={herramienta.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-blue-50">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-700">{herramienta.name}</span>
                        </div>
                        <button
                          onClick={() => togglePermiso(rol.id, herramienta.id)}
                          className={`p-1 rounded transition-colors ${
                            permisos[rol.id]?.[herramienta.id]
                              ? "text-green-600 hover:text-green-700"
                              : "text-red-600 hover:text-red-700"
                          }`}
                        >
                          {permisos[rol.id]?.[herramienta.id] ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Proyecto */}
                                      <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                      <Settings className="h-4 w-4 mr-2 text-green-600" />
                      Proyecto:
                    </h4>
                  <div className="space-y-2">
                    {herramientasProyecto.map((herramienta) => (
                      <div key={herramienta.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-green-50">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-700">{herramienta.name}</span>
                        </div>
                        <button
                          onClick={() => togglePermiso(rol.id, herramienta.id)}
                          className={`p-1 rounded transition-colors ${
                            permisos[rol.id]?.[herramienta.id]
                              ? "text-green-600 hover:text-green-700"
                              : "text-red-600 hover:text-red-700"
                          }`}
                        >
                          {permisos[rol.id]?.[herramienta.id] ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer informativo */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-blue-900">Información Importante</h4>
              <div className="mt-1 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Sistema:</strong> Controla la visibilidad en el menú lateral del sistema</li>
                  <li><strong>Proyecto:</strong> Controla las pestañas disponibles al entrar a un proyecto específico</li>
                  <li><strong>Cambios Pendientes:</strong> Los cambios individuales se marcan como pendientes hasta presionar "Guardar Cambios"</li>
                  <li><strong>Resetear:</strong> Restablece inmediatamente a valores por defecto (sin pasar por pendientes)</li>
                  <li>Los cambios guardados se reflejan inmediatamente para nuevas sesiones de usuarios</li>
                  <li>Puedes descartar cambios pendientes antes de guardarlos</li>
                  <li>El rol "Superintendente" mantiene acceso total siempre por seguridad</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}