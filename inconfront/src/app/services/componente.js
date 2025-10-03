'use server';

import { cookies } from "next/headers";

export const getComponentes = async (id_subtask,relationType) => {
        
            const token = cookies().get('token').value;
        
            const componentesResp = await fetch(`${process.env.FAENA_BACKEND_HOST}/componente/${id_subtask}/${relationType}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            })
        
            const response = await componentesResp.json();
            return response;
    }