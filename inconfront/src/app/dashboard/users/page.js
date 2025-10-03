"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { usePermisos } from "../../hooks/usePermisos";
import { getUsers } from "../../services/user";
import UsersDashboardComponent from "../components/users_dashboard";
import Loader from "@/app/dashboard/components/loader";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import Hidebyrol from "../components/hiddenroles";
import { getPrimaryRole } from "@/app/utils/roleUtils";

export default function UsersDashboard() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('internal');
  
  // Control de permisos
  const userStore = useSelector((state) => state.user);
  const role = getPrimaryRole(userStore.user);
  const { tienePermiso, isReady } = usePermisos();
  const router = useRouter();

  // Verificar permisos de acceso
  useEffect(() => {
    if (!isReady) return; // Esperar carga de permisos desde localStorage
    if (!tienePermiso(role, "usuarios")) {
      router.push("/dashboard/dashboardproyect");
      return;
    }
  }, [role, router, tienePermiso, isReady]);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const { data } = await getUsers(filter);
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Solo cargar usuarios si tiene permisos
    if (tienePermiso(role, "usuarios")) {
      fetchUsers();
    }
  }, [filter, role, tienePermiso]);

    if (!isReady || isLoading) {
        return <Loader />;
    }

    return (
        <ProtectedRoute roles={['admin', 'superadmin', 'ITO', 'superintendente', 'administrador de contrato']}>
            <UsersDashboardComponent users={users} setFilter={setFilter} Hidebyrol={Hidebyrol}/>
        </ProtectedRoute>
    );
}
