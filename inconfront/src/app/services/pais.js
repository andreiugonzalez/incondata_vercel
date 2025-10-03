'use server';

import { cookies } from "next/headers";

export const getPaises = async () => {
        
            const token = cookies().get('token').value;
        
            const paisesResp = await fetch(`${process.env.FAENA_BACKEND_HOST}/pais`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            })
        
            const response = await paisesResp.json();
            return response;
    }