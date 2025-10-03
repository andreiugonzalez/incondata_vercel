'use client';

import React from 'react';
import ProjectUpdateForm from '@/app/dashboard/components/projectSettings'; // Importamos el componente del formulario
import { useSearchParams } from 'next/navigation'; // Importamos el hook useSearchParams para acceder a los parámetros de búsqueda de la URL

const ProjectUpdatePage = () => {
  const searchParams = useSearchParams(); // Obtenemos los parámetros de búsqueda
  const projectId = searchParams.get('project'); // Obtenemos el valor del parámetro 'project'

  return (
    <div>
      {/* Aquí renderizamos el formulario de actualización */}
      {/* Pasamos projectId como prop al componente ProjectUpdateForm */}
      {projectId && <ProjectUpdateForm projectId={projectId} />}
    </div>
  );
};

export default ProjectUpdatePage;
