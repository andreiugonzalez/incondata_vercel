'use server';

import { cookies } from "next/headers";

// Base URL del backend con fallback para entorno local
const BASE_URL = process.env.NEXT_PUBLIC_FAENA_BACKEND_HOST || process.env.FAENA_BACKEND_HOST || 'http://localhost:3111';

export default async function getOrganizations() {
    const organizations = await fetch(`${BASE_URL}/organizacion`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${cookies().get('token').value}`,
        },
    })

    const response = await organizations.json();
    return response;
}

export const postOrganization = async (organization) => {

    const token = cookies().get('token').value;

    console.log("=== BACKEND API CALL DEBUG ===");
    console.log("Sending organization data to backend:", organization);
    console.log("API endpoint:", `${BASE_URL}/organizacion`);
    console.log("===============================");

    const organizationResp = await fetch(`${BASE_URL}/organizacion`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(organization),
    })

    console.log("=== BACKEND RESPONSE DEBUG ===");
    console.log("Response status:", organizationResp.status);
    console.log("Response ok:", organizationResp.ok);
    console.log("===============================");

    const response = await organizationResp.json();
    
    console.log("=== BACKEND RESPONSE DATA ===");
    console.log("Response data:", response);
    console.log("==============================");

    if (!organizationResp.ok) {
        console.error("=== BACKEND ERROR ===");
        console.error("Error response:", response);
        console.error("=====================");
        throw new Error(response.message || 'Error creating organization');
    }

    return response;
}

export const postOrganizationDoc = async (formData) => {

    const token = cookies().get('token').value;

    const organizationResp = await fetch(`${BASE_URL}/document/organization/create`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: formData,
    })

    const response = await organizationResp.json();
    return response;
}

export const postOrganizationProf = async (formData) => {

    const token = cookies().get('token').value;

    const organizationResp = await fetch(`${process.env.FAENA_BACKEND_HOST}/document/organization_profile/create`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: formData,
    })

    const response = await organizationResp.json();
    return response;
}


export const getOrganizationById = async (organizationId) => {
    try {
        const token = cookies().get('token').value;

        const response = await fetch(`${BASE_URL}/organizacion/${organizationId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Error fetching organization data');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching organization:', error);
        return null;
    }
};


export const getLocationByComuna = async (comunaId) => {
    try {
        const token = cookies().get('token').value;

        const response = await fetch(`${process.env.FAENA_BACKEND_HOST}/comunas/${comunaId}/location`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Error fetching location data');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching location:', error);
        return null;
    }
};



export const updateOrganization = async (organizationId, organizationData) => {
    try {
        const token = cookies().get('token').value;

        const response = await fetch(`${BASE_URL}/organizacion/${organizationId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(organizationData),
        });

        if (!response.ok) {
            throw new Error('Error updating organization data');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error updating organization:', error);
        return null;
    }
};

// Eliminar organización por ID
export const deleteOrganization = async (organizationId) => {
    try {
        const token = cookies().get('token').value;

        const response = await fetch(`${process.env.FAENA_BACKEND_HOST}/organizacion/${organizationId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error deleting organization:', error);
        throw new Error('Error deleting organization');
    }
};

export const getPaises = async () => {
    try {
        const token = cookies().get('token').value;

        const response = await fetch(`${process.env.FAENA_BACKEND_HOST}/paises`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching countries:', error);
        return [];
    }
};

export const getRegionesPorPais = async (paisId) => {
    try {
        const token = cookies().get('token').value;

        const response = await fetch(`${process.env.FAENA_BACKEND_HOST}/paises/${paisId}/regiones`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching regions:', error);
        throw new Error('Error fetching regions');
    }
};


export const getComunasPorRegion = async (regionId) => {
    try {
        const token = cookies().get('token').value;
        const response = await fetch(`${process.env.FAENA_BACKEND_HOST}/regiones/${regionId}/comunas`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching comunas:', error);
        throw new Error('Error fetching comunas');
    }
};



export const getCodTelefono = async () => {
    try {
        const token = cookies().get('token').value;
        const response = await fetch(`${process.env.FAENA_BACKEND_HOST}/cod_telefono`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching comunas:', error);
        throw new Error('Error fetching comunas');
    }
};



export const getTipoEmpresa = async () => {
    try {
        const token = cookies().get('token').value;
        const response = await fetch(`${process.env.FAENA_BACKEND_HOST}/tipo_empresa`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching comunas:', error);
        throw new Error('Error fetching comunas');
    }
};

