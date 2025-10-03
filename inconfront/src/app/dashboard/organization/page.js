'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { usePermisos } from "../../hooks/usePermisos";
import getOrganizations from '@/app/services/organizacion';
import { getUsers } from '../../services/user';
import OrganizationDashboardComponent from "../components/organization";
import Loader from '../components/loader';
import { getPrimaryRole } from "@/app/utils/roleUtils";

function UsersDashboard() {
    const [organizations, setOrganizations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Control de permisos
    const userStore = useSelector((state) => state.user);
    const role = getPrimaryRole(userStore.user);
    const { tienePermiso } = usePermisos();
    const router = useRouter();

    // Verificar permisos de acceso
    useEffect(() => {
        if (!tienePermiso(role, "organizacion")) {
            router.push("/dashboard/dashboardproyect");
            return;
        }
    }, [role, router, tienePermiso]);

    useEffect(() => {
        async function fetchOrganizations() {
            setIsLoading(true);
            try {
                const response = await getOrganizations();
                setOrganizations(response.data);
                setIsLoading(false);
            } catch (error) {
                console.error("Error fetching organizations:", error);
                setError(error);
                setIsLoading(false);
            }
        }

        // Solo cargar organizaciones si tiene permisos
        if (tienePermiso(role, "organizacion")) {
            fetchOrganizations();
        }
    }, [role, tienePermiso]);

    if (isLoading) {
        return <Loader />;
    }

    if (error) {
        return <div>Error al cargar las organizaciones. Por favor, inténtalo de nuevo más tarde.</div>;
    }

    return <OrganizationDashboardComponent organizations={organizations} />;
}

export default UsersDashboard;