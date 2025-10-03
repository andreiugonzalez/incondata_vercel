"use client"
import React from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import ActualizarPrevencionForm from '@/app/dashboard/components/event_update'; // Ajusta la ruta según tu estructura de proyecto

const ActualizarEventoPage = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get('e') || '';
  const router = useRouter();

  return (
    <div className="actualizar-evento-page">
      {id ? (
        <ActualizarPrevencionForm
          closeModal={() => router.push('/dashboard/dashboardproyect')} // Ajusta la ruta según tu necesidad
          refreshEventos={() => {}}
          eventId={id}
        />
      ) : (
        <p>Cargando...</p>
      )}
    </div>
  );
};

export default ActualizarEventoPage;
