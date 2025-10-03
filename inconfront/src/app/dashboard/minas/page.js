'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { usePermisos } from "../../hooks/usePermisos";
import { getMinas } from "@/app/services/minas";
import MinasComponent from "../components/minas_dashboard";
import Loader from '@/app/dashboard/components/loader';
import { getPrimaryRole } from "@/app/utils/roleUtils";

export default function MinasDashboard() {
    const [minas, setMinas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Control de permisos
    const userStore = useSelector((state) => state.user);
    const role = getPrimaryRole(userStore.user);
    const { tienePermiso } = usePermisos();
    const router = useRouter();

    // Verificar permisos de acceso
    useEffect(() => {
        if (!tienePermiso(role, "minas")) {
            router.push("/dashboard/dashboardproyect");
            return;
        }
    }, [role, router, tienePermiso]);

    useEffect(() => {
        const fetchMinas = async () => {
            try {
                const { data } = await getMinas();
                setMinas(data);
            } catch (error) {
                console.error("Error fetching minas:", error);
            } finally {
                setIsLoading(false);
            }
        };

        // Solo cargar minas si tiene permisos
        if (tienePermiso(role, "minas")) {
            fetchMinas();
        }
    }, [role, tienePermiso]);

    if (isLoading) {
        return <Loader />; 
    }

    return (
        <div>
            <MinasComponent minas={minas} />
        </div>
    );
}
