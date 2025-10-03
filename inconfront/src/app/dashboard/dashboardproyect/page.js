"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { getProjects } from "@/app/services/project";
import Newproyect from "../components/dashboard";
import Loader from "@/app/dashboard/components/loader";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { usePermisos } from "@/app/hooks/usePermisos";
import { Shield } from "lucide-react";
import { getPrimaryRole } from "@/app/utils/roleUtils";

export default function UsersDashboard() {
  const [projects, setProjects] = useState([]);
  const [global, setGlobal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  
  // Validación de permisos
  const userStore = useSelector((state) => state.user);
  const role = getPrimaryRole(userStore.user);
  const { tienePermiso } = usePermisos();
  
  // Verificar si tiene acceso al dashboard
  const tieneAccesoDashboard = role === "superintendente" || role === "superadmin" || tienePermiso(role, "dashboard");
  
  // Función para verificar si tiene acceso a alguna herramienta del sistema
  const tieneAccesoAlSistema = () => {
    if (role === "superintendente" || role === "superadmin") return true;
    
    const herramientasSistema = [
      "dashboard",
      "correo", 
      "usuarios",
      "organizacion",
      "minas",
      "crear_proyecto",
      "mis_documentos",
      "general_proyecto",
      "documentos_proyecto"
    ];
    
    return herramientasSistema.some(herramienta => tienePermiso(role, herramienta));
  };
  
  // Función para obtener la primera herramienta disponible
  const obtenerPrimeraHerramientaDisponible = () => {
    if (role === "superintendente" || role === "superadmin") return "/dashboard/dashboardproyect";
    
    const herramientasConRutas = [
      { permiso: "dashboard", ruta: "/dashboard/dashboardproyect" },
      { permiso: "correo", ruta: "/dashboard/correos" },
      { permiso: "usuarios", ruta: "/dashboard/users" },
      { permiso: "organizacion", ruta: "/dashboard/organization" },
      { permiso: "minas", ruta: "/dashboard/minas" },
      { permiso: "crear_proyecto", ruta: "/dashboard/partidas" },
      { permiso: "mis_documentos", ruta: "/dashboard/my_documents" },
      { permiso: "general_proyecto", ruta: "/dashboard/dashboardproyect" },
      { permiso: "documentos_proyecto", ruta: "/dashboard/my_documents" }
    ];
    
    for (const herramienta of herramientasConRutas) {
      if (tienePermiso(role, herramienta.permiso)) {
        return herramienta.ruta;
      }
    }
    
    return null;
  };
  
  // Efecto para redirección automática
  useEffect(() => {
    if (!isLoading && !tieneAccesoDashboard) {
      const primeraRutaDisponible = obtenerPrimeraHerramientaDisponible();
      if (primeraRutaDisponible) {
        router.push(primeraRutaDisponible);
      }
    }
  }, [isLoading, tieneAccesoDashboard, router]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const {
          data: { projects },
          data: { avanceGlobal: extra },
        } = await getProjects();
        //console.log(extra);
        //console.log(projects);

        setProjects(projects);
        setGlobal(extra);
      } catch (error) {
        console.error("Error fetching projects:", error);
        // Si el error es por falta de token, no es necesario mostrar error ya que el ProtectedRoute manejará la redirección
        if (error.message === "No token found") {
          console.log("Usuario no autenticado, redirección automática...");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (isLoading || !userStore.isReady || !userStore.user) {
    // Loader en blanco mientras se resetea el estado o se redirige
    return <div style={{background: '#fff', width: '100vw', height: '100vh'}} />;
  }

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : !tieneAccesoDashboard ? (
        // Si no tiene acceso al dashboard pero tiene otras herramientas, 
        // el useEffect se encargará de la redirección
        // Si no tiene acceso a nada, mostrar mensaje
        !tieneAccesoAlSistema() ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center p-8 bg-white rounded-lg shadow-sm border border-gray-200 max-w-md">
              <div className="mb-4">
                <Shield className="h-16 w-16 text-gray-400 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Sin Acceso a Herramientas del Sistema
              </h3>
              <p className="text-gray-500 mb-4">
                No tienes permisos para acceder a ninguna herramienta del sistema.
              </p>
              <p className="text-sm text-gray-400">
                Contacta al superintendente para solicitar acceso.
              </p>
            </div>
          </div>
        ) : (
          // Pantalla de carga mientras se redirige
          <Loader />
        )
      ) : (
        <ProtectedRoute
          roles={[
            "admin",
            "superadmin",
            "administrador de contrato",
            "normal",
            "planner",
            "ITO",
            "superintendente",
            "inspector",
            "prevencionista",
            "supervisor",
            "proyectista",
          ]}
        >
          <Newproyect projects={projects} global={global} />
        </ProtectedRoute>
      )}
    </>
  );
}
