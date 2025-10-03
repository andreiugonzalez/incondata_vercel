// Importaciones
import { getPaises } from "@/app/services/pais";
import NewMina from "../components/new.mina";
import { getUsers } from "@/app/services/user";
import getOrganizations from "@/app/services/organizacion";

// Función principal para la página
export default async function MinasCreate() {
    try {
        const { data } = await getPaises();
        const response = await getUsers();
        const responseOrg = await getOrganizations();

        return (
            <div>
                <NewMina paises={data} users={response?.data} organizations={responseOrg?.data} />
            </div>
        )
    } catch (error) {
        console.error("Error fetching minas:", error);
    }
}

// Forzar renderizado dinámico
export const dynamic = 'force-dynamic';
