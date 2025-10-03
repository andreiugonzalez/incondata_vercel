"use client";

import React, { useEffect } from 'react';
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { usePermisos } from "../../hooks/usePermisos";
import Partidasform from "../components/partidas";
import ProtectedRoute from '@/app/components/ProtectedRoute';
import { getPrimaryRole } from "@/app/utils/roleUtils";

export default function Partidasdashboard() {
    // Control de permisos
    const userStore = useSelector((state) => state.user);
    const role = getPrimaryRole(userStore.user);
    const { tienePermiso } = usePermisos();
    const router = useRouter();

    // Verificar permisos de acceso
    useEffect(() => {
        if (!tienePermiso(role, "crear_proyecto")) {
            router.push("/dashboard/dashboardproyect");
            return;
        }
    }, [role, router, tienePermiso]);

    return (
        <>
            <ProtectedRoute roles={['admin', 'superadmin', 'superintendente']}>
                <Partidasform />
            </ProtectedRoute>
        </>
    );
}
