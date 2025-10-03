'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import UpdateOrganizationPage from '@/app/dashboard/components/updateorganizacion';
import { getOrganizationById } from '@/app/services/organizacion';
import Loader from '@/app/dashboard/components/loader';

const OrganizationUpdatePage = () => {
    const { id } = useParams();
    const [organizationData, setOrganizationData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrganization = async () => {
            setLoading(true);
            try {
                const response = await getOrganizationById(id);

                console.log(response);
                // Si `data` tiene contenido, asigna el primer elemento
                setOrganizationData(response?.data?.length > 0 ? response.data[0] : {});
            } catch (error) {
                console.error('Error loading organization:', error);
                setOrganizationData(null); // Establece como null si ocurre un error
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchOrganization();
        }
    }, [id]);

    return (
        <div>
            {loading || !organizationData ? (
                <Loader />
            ) : (
                <UpdateOrganizationPage organizationData={organizationData} />
            )}
        </div>
    );
    
};

export default OrganizationUpdatePage;
