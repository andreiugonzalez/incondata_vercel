"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { 
  Shield, 
  UserPlus, 
  CheckCircle, 
  AlertTriangle,
  Eye,
  EyeOff,
  Copy,
  RefreshCw
} from "lucide-react";
import { toast } from "react-hot-toast";
import { createSuperAdminUser, checkSuperAdminExists } from "../../services/superadmin";
import { usePermisos } from "../../hooks/usePermisos";
import { getPrimaryRole } from "@/app/utils/roleUtils";

export default function SuperAdminManager() {
  const router = useRouter();
  const userStore = useSelector((state) => state.user);
  const role = getPrimaryRole(userStore.user);
  const { tienePermiso } = usePermisos();

  // Estados del componente
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [superAdminExists, setSuperAdminExists] = useState(false);
  const [createdUser, setCreatedUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Verificar permisos - usuarios con permiso gestion_superadmin pueden acceder
  useEffect(() => {
    if (!tienePermiso(role, "gestion_superadmin")) {
      router.push("/dashboard/dashboardproyect");
      return;
    }
    checkExistingSuperAdmin();
  }, [role, router, tienePermiso]);

  // Verificar si ya existe un superadmin
  const checkExistingSuperAdmin = async () => {
    setChecking(true);
    try {
      const result = await checkSuperAdminExists();
      setSuperAdminExists(result.exists);
      if (result.error) {
        toast.error("Error al verificar usuario superadmin");
      }
    } catch (error) {
      toast.error("Error al verificar usuario superadmin");
    } finally {
      setChecking(false);
    }
  };

  // Crear usuario superadmin
  const handleCreateSuperAdmin = async () => {
    setLoading(true);
    try {
      const result = await createSuperAdminUser();
      
      if (result.success) {
        toast.success("Usuario superadmin creado exitosamente");
        setCreatedUser(result.credentials);
        setSuperAdminExists(true);
      } else {
        toast.error(result.message || "Error al crear usuario superadmin");
      }
    } catch (error) {
      toast.error("Error interno al crear usuario superadmin");
    } finally {
      setLoading(false);
    }
  };

  // Copiar credenciales al portapapeles
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado al portapapeles");
  };

  // Mostrar/ocultar contraseña
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Verificando estado del sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-red-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Gestión de Usuario SuperAdmin
              </h1>
              <p className="text-gray-600">
                Crear y gestionar el usuario con máximos privilegios del sistema
              </p>
            </div>
          </div>
        </div>

        {/* Estado actual */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Estado Actual del Sistema
          </h2>
          
          <div className="flex items-center space-x-3">
            {superAdminExists ? (
              <>
                <CheckCircle className="h-6 w-6 text-green-500" />
                <div>
                  <p className="text-green-700 font-medium">
                    Usuario SuperAdmin ya existe
                  </p>
                  <p className="text-gray-600 text-sm">
                    El sistema ya cuenta con un usuario superadmin configurado
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertTriangle className="h-6 w-6 text-amber-500" />
                <div>
                  <p className="text-amber-700 font-medium">
                    No existe usuario SuperAdmin
                  </p>
                  <p className="text-gray-600 text-sm">
                    Se recomienda crear un usuario superadmin para administración completa
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Información del SuperAdmin */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            ¿Qué es un Usuario SuperAdmin?
          </h2>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Acceso Completo</p>
                <p className="text-gray-600 text-sm">
                  Tiene acceso a todas las funcionalidades del sistema sin restricciones
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <UserPlus className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Gestión de Usuarios</p>
                <p className="text-gray-600 text-sm">
                  Puede crear, modificar y eliminar cualquier usuario del sistema
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-purple-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Control de Permisos</p>
                <p className="text-gray-600 text-sm">
                  Puede modificar roles y permisos de todos los usuarios
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Acción principal */}
        {!superAdminExists && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Crear Usuario SuperAdmin
            </h2>
            
            <p className="text-gray-600 mb-6">
              Se creará un usuario interno con credenciales predeterminadas y acceso completo al sistema.
            </p>
            
            <button
              onClick={handleCreateSuperAdmin}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <UserPlus className="h-4 w-4 mr-2" />
              )}
              {loading ? "Creando..." : "Crear Usuario SuperAdmin"}
            </button>
          </div>
        )}

        {/* Credenciales del usuario creado */}
        {createdUser && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Usuario SuperAdmin Creado
            </h2>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <p className="text-green-800 font-medium">
                    ¡Usuario creado exitosamente!
                  </p>
                </div>
                <p className="text-green-700 text-sm">
                  Guarda estas credenciales en un lugar seguro. La contraseña debe cambiarse en el primer inicio de sesión.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Usuario / Email
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={createdUser.email}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900"
                    />
                    <button
                      onClick={() => copyToClipboard(createdUser.email)}
                      className="p-2 text-gray-500 hover:text-gray-700"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={createdUser.password}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900"
                    />
                    <button
                      onClick={togglePasswordVisibility}
                      className="p-2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => copyToClipboard(createdUser.password)}
                      className="p-2 text-gray-500 hover:text-gray-700"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="text-amber-800 font-medium text-sm">
                      Importante: Seguridad
                    </p>
                    <ul className="text-amber-700 text-sm mt-1 space-y-1">
                      <li>• Cambia la contraseña en el primer inicio de sesión</li>
                      <li>• No compartas estas credenciales</li>
                      <li>• Guarda la información en un lugar seguro</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Botón para refrescar estado */}
        <div className="mt-6 text-center">
          <button
            onClick={checkExistingSuperAdmin}
            disabled={checking}
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${checking ? 'animate-spin' : ''}`} />
            Verificar Estado
          </button>
        </div>
      </div>
    </div>
  );
}