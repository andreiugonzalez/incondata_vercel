"use client";
import Partidadetalle from "../components/detalle_sumalzada";
import { useSearchParams } from 'next/navigation';
import ProtectedRoute from "@/app/components/ProtectedRoute";

export default function Partidasumalzada() {
    const searchParams = useSearchParams();
    const data = searchParams.get('data');
    const decodedParams = data ? atob(data) : '';
    const queryParams = new URLSearchParams(decodedParams);

    // Obtener nivel y ID genérico (que podría ser id_partida, id_subpartida, etc.)
    const nivel = queryParams.get('level'); // Usamos 'level' en lugar de 'nivel' según lo enviado
    console.log('Nivel:', nivel);
    
    const id = queryParams.get('id'); // ID genérico (determinado dinámicamente en handleSpanClick)
    console.log('ID:', id);
    
    const index = queryParams.get('index');
    console.log('Index:', index);
    
    const indexsub = queryParams.get('indexsub');
    console.log('Index Sub:', indexsub);
    
    const tareaIndex = queryParams.get('tareaIndex');
    console.log('Tarea Index:', tareaIndex);
    
    const subtareaIndex = queryParams.get('subtareaIndex');
    console.log('Subtarea Index:', subtareaIndex);
    
    const nombre = queryParams.get('nombre');
    console.log('Nombre:', nombre);
    
    const cantidad = queryParams.get('cantidad');
    console.log('Cantidad:', cantidad);
    
    const unidad = queryParams.get('unidad');
    console.log('Unidad:', unidad);
    
    const idbyproyect = queryParams.get('idbyproyect');
    console.log('ID by Project:', idbyproyect);
    

    // Determinar idKey en función del nivel
    const idKey = {
        partida: 'id_partida',
        subpartida: 'id_subpartida',
        tarea: 'id_task',
        subtarea: 'id_subtask'
    }[nivel] || 'id'; // 'id' por defecto si el nivel no coincide

    console.log("ID:", id);
    console.log("ID Key:", idKey);
    console.log("Nivel:", nivel);

    return (
        <ProtectedRoute roles={["admin", "superadmin", "superintendente", "ITO", "supervisor", "inspector", "planner", "prevencionista"]}>
            <Partidadetalle
                id={id}
                idKey={idKey}
                nivel={nivel}
                index={index}
                indexsub={indexsub}
                tareaIndex={tareaIndex}
                subtareaIndex={subtareaIndex}
                nombre={nombre}
                cantidad={cantidad}
                unidad={unidad}
                idbyproyect={idbyproyect}
            />
        </ProtectedRoute>
    );
}
