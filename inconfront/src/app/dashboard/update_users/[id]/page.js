'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import UpdateUserPage from '@/app/dashboard/components/update_users';
import { getUserById } from '@/app/services/user';
import Loader from '@/app/dashboard/components/loader'; // Asegúrate de que la ruta sea correcta

export default function UsersUpdate() {
  const { id } = useParams();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Estado para controlar el loader

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getUserById(id);
        setUserData(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false); // Finaliza la carga
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  if (isLoading) {
    return <Loader />; // Muestra el loader mientras se están cargando los datos
  }

  return <UpdateUserPage userData={userData} />;
}
