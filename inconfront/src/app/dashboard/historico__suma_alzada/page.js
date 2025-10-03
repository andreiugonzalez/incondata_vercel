import { getPartidasByProjectStd } from "@/app/services/project";
import HistoricoPartidasuma from "@/app/dashboard/components/historico_suma_alzada";
import ProtectedRoute from "@/app/components/ProtectedRoute";
// Forzar que la página sea renderizada dinámicamente

export const dynamic = 'force-dynamic';

export default async function Partidasumalzada({ searchParams }) {
    let partidas = [];
    try {
        const projectId = searchParams?.project;

        if (!projectId) {
            // Manejar el caso donde no haya un projectId en searchParams
            return <div>No se encontró el ID del proyecto</div>;
        }

        // console.log("id de proyecto funcionando desde page.js", projectId);
        const response = await getPartidasByProjectStd(projectId);
        console.log(response);
        partidas = response;

        return (
            <ProtectedRoute roles={["admin", "superadmin", "superintendente", "ITO", "supervisor", "inspector", "planner", "prevencionista"]}>
                <HistoricoPartidasuma partidas={partidas} projectId={projectId} />
            </ProtectedRoute>
        );
    } catch (error) {
        console.error("Error fetching partidas:", error);
        return <div>Error cargando las partidas</div>;
    }
}
