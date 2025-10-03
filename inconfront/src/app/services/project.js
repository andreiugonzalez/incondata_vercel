"use server";

import { cookies } from "next/headers";

// Helper function para obtener token con validación
const getAuthToken = () => {
  const tokenCookie = cookies().get("token");
  if (!tokenCookie) {
    throw new Error("No token found");
  }
  return tokenCookie.value;
};

export const postProject = async (project) => {
  const token = cookies().get("token").value;

  const organizationResp = await fetch(
    `${process.env.NEXT_PUBLIC_FAENA_BACKEND_HOST}/projects`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ proyecto: project }),
    },
  );

  const response = await organizationResp.json();
  return response;
};

export const postProjectDoc = async (formData) => {
  const token = cookies().get("token").value;

  const projectResp = await fetch(
    `${process.env.NEXT_PUBLIC_FAENA_BACKEND_HOST}/document/project/create`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    },
  );

  const response = await projectResp.json();
  return response;
};

export const updateProject = async (projectId, formData) => {
  const token = cookies().get("token").value;

  const projectResp = await fetch(
    `${process.env.FAENA_BACKEND_HOST}/projects/${projectId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json", // Asegura que los datos se envíen como JSON
      },
      body: JSON.stringify(formData), // Convierte los datos del formulario a JSON
    },
  );

  const response = await projectResp.json();
  return response;
};

export const getProjectById = async (projectId) => {
  const token = cookies().get("token").value; // Supone que usas cookies para la autenticación

  const response = await fetch(
    `${process.env.FAENA_BACKEND_HOST}/projects/${projectId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  const projectData = await response.json();
  return projectData;
};

export const getProjects = async () => {
  const token = getAuthToken();

  const projectsResp = await fetch(
    `${process.env.FAENA_BACKEND_HOST}/projects`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const response = await projectsResp.json();
  return response;
};

// Servicio para obtener detalles del proyecto, incluyendo usuarios asignados
export const getProjectDetails = async (projectId) => {
  const token = cookies().get("token").value;
  const res = await fetch(
    `${process.env.FAENA_BACKEND_HOST}/projects/${projectId}/details`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return await res.json();
};

export const postCreatePartida = async (partida) => {

    const token = cookies().get('token').value;

    const organizationResp = await fetch(`${process.env.FAENA_BACKEND_HOST}/partida`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(partida),
    })

    const response = await organizationResp.json();
    return response;
}

export const postSubpartida = async (subpartida) => {

    const token = cookies().get('token').value;

    const subpartidaResp = await fetch(`${process.env.FAENA_BACKEND_HOST}/subpartida`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(subpartida),
    })

    const response = await subpartidaResp.json();
    return response;
}

export const postTask = async (task) => {

    const token = cookies().get('token').value;

    const taskResp = await fetch(`${process.env.FAENA_BACKEND_HOST}/tasks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(task),
    })

    const response = await taskResp.json();
    return response;
}

export const postSubtask = async (subtask) => {

    const token = cookies().get('token').value;

    const subTaskResp = await fetch(`${process.env.FAENA_BACKEND_HOST}/subtask`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(subtask),
    })

    const response = await subTaskResp.json();
    return response;
}

export const getPartidasByProject = async (projectId) => {
  const token = cookies().get("token").value;

  const partidasResp = await fetch(
    `${process.env.FAENA_BACKEND_HOST}/partidas/${projectId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const response = await partidasResp.json();
  return response;
};

export const getPartidasByProjectStd = async (projectId) => {
  const token = cookies().get("token").value;

  const partidasResp = await fetch(
    `${process.env.FAENA_BACKEND_HOST}/partidas/std/${projectId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const response = await partidasResp.json();
  return response;
};

export const getPartidasByProjectStdwithHistorico = async (
  projectId,
  datesearch,
) => {
  const token = cookies().get("token").value;

  const partidasResp = await fetch(
    `${process.env.FAENA_BACKEND_HOST}/partidasHistorico/std/${projectId}/${datesearch}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const response = await partidasResp.json();
  return response;
};
// Gado nuevo

// registro de proyecto
export const registerproject = async (proyecto) => {
  const token = cookies().get("token").value;

  const users = await fetch(`${process.env.FAENA_BACKEND_HOST}/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(proyecto),
  });

  const response = await users.json();
  return response;
};

//Estado de proyecto
export const estadodeproyecto = async () => {
  const token = cookies().get("token").value;

  const estado = await fetch(
    `${process.env.FAENA_BACKEND_HOST}/estadoproyecto`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const response = await estado.json();
  return response;
};

export const getnotmyUser = async (userId) => {
  try {
    const token = cookies().get("token").value;

    const response = await fetch(
      `${process.env.FAENA_BACKEND_HOST}/users/${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching regions:", error);
    throw new Error("Error fetching regions");
  }
};

export const updatePartida = async (partidaId, updatedPartida) => {
  try {
    const token = cookies().get("token").value;

    const response = await fetch(
      `${process.env.FAENA_BACKEND_HOST}/partida/${partidaId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedPartida),
      },
    );

    if (!response.ok) {
      throw new Error(`Error actualizando la partida: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error actualizando la partida:", error);
    throw new Error("Error actualizando la partida");
  }
};

export const updatePartidanewpartida = async (partidaId, updatedPartida) => {
  try {
    const token = cookies().get("token").value;

    const response = await fetch(
      `${process.env.FAENA_BACKEND_HOST}/partida/newpartida/${partidaId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedPartida),
      },
    );

    if (!response.ok) {
      throw new Error(`Error actualizando la partida: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error actualizando la partida:", error);
    throw new Error("Error actualizando la partida");
  }
};

export const updatesubPartida = async (subpartidaId, updatedsubPartida) => {
  try {
    const token = cookies().get("token").value;

    const response = await fetch(
      `${process.env.FAENA_BACKEND_HOST}/subpartida/${subpartidaId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedsubPartida),
      },
    );

    if (!response.ok) {
      throw new Error(
        `Error actualizando la subpartida: ${response.statusText}`,
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error actualizando la subpartida:", error);
    throw new Error("Error actualizando la subpartida");
  }
};
export const updatesubPartidanewpartida = async (
  subpartidaId,
  updatedsubPartida,
) => {
  try {
    const token = cookies().get("token").value;

    const response = await fetch(
      `${process.env.FAENA_BACKEND_HOST}/subpartida/newpartida/${subpartidaId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedsubPartida),
      },
    );

    if (!response.ok) {
      throw new Error(
        `Error actualizando la subpartida: ${response.statusText}`,
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error actualizando la subpartida:", error);
    throw new Error("Error actualizando la subpartida");
  }
};
export const updateTarea = async (tareaid, updatedtarea) => {
  try {
    const token = cookies().get("token").value;

    const response = await fetch(
      `${process.env.FAENA_BACKEND_HOST}/tarea/${tareaid}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedtarea),
      },
    );

    if (!response.ok) {
      throw new Error(`Error actualizando la tarea: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error actualizando la tarea:", error);
    throw new Error("Error actualizando la tarea");
  }
};
export const updateTareanewpartida = async (tareaid, updatedtarea) => {
  try {
    const token = cookies().get("token").value;

    const response = await fetch(
      `${process.env.FAENA_BACKEND_HOST}/tarea/newpartida/${tareaid}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedtarea),
      },
    );

    if (!response.ok) {
      throw new Error(`Error actualizando la tarea: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error actualizando la tarea:", error);
    throw new Error("Error actualizando la tarea");
  }
};
export const updateSubtarea = async (subtareaid, updatedsubtarea) => {
  try {
    const token = cookies().get("token").value;

    const response = await fetch(
      `${process.env.FAENA_BACKEND_HOST}/subtarea/${subtareaid}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedsubtarea),
      },
    );

    if (!response.ok) {
      throw new Error(`Error actualizando la subtarea: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error actualizando la subtarea:", error);
    throw new Error("Error actualizando la subtarea");
  }
};
export const updateSubtareanewpartida = async (subtareaid, updatedsubtarea) => {
  try {
    const token = cookies().get("token").value;

    const response = await fetch(
      `${process.env.FAENA_BACKEND_HOST}/subtarea/newpartida/${subtareaid}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedsubtarea),
      },
    );

    if (!response.ok) {
      throw new Error(`Error actualizando la subtarea: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error actualizando la subtarea:", error);
    throw new Error("Error actualizando la subtarea");
  }
};

//Unidades para sumalzada
export const unidadlist = async () => {
  const token = cookies().get("token").value;

  const estado = await fetch(`${process.env.FAENA_BACKEND_HOST}/unidades`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const response = await estado.json();
  return response;
};

// registro de material
export const updateMaterial = async (componenteId) => {
  const token = cookies().get("token").value;

  const users = await fetch(
    `${process.env.FAENA_BACKEND_HOST}/material/create`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(componenteId),
    },
  );

    const response = await users.json();
    return response;
}

// eliminar material
export const deleteMaterial = async (materialId) => {
    const token = cookies().get('token').value;

    const response = await fetch(`${process.env.FAENA_BACKEND_HOST}/material/delete/${materialId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });

    const result = await response.json();
    return result;
}

export const getproyectbysubtarea = async (subtareaid) => {
  try {
    const token = cookies().get("token").value;

    const response = await fetch(
      `${process.env.FAENA_BACKEND_HOST}/subtarea/proyecto/${subtareaid}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching regions:", error);
    throw new Error("Error fetching regions");
  }
};

export const updatematerialbyid = async (materialid, updatedmaterials) => {
    try {
        const token = cookies().get('token').value;

    const response = await fetch(
      `${process.env.FAENA_BACKEND_HOST}/material/${materialid}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedmaterials),
      },
    );

        if (!response.ok) {
            throw new Error(`Error actualizando el material: ${response.statusText}`);
        }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error actualizando el material:", error);
    throw new Error("Error actualizando el material");
  }
};

export const getnivelbytype = async (type, realId) => {
  try {
    const token = cookies().get("token").value;

    const response = await fetch(
      `${process.env.FAENA_BACKEND_HOST}/nivelbyid/${type}/${realId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching regions:", error);
    throw new Error("Error fetching regions");
  }
};

export const getfechabyid = async (id) => {
  try {
    const token = cookies().get("token").value;

    const response = await fetch(
      `${process.env.FAENA_BACKEND_HOST}/proyecto/fecha/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching fecha:", error);
    throw new Error("Error fetching fecha");
  }
};

export const getAdjuntosByProyectoId = async (id) => {
  try {
    const token = cookies().get("token")?.value;

    const response = await fetch(
      `${process.env.FAENA_BACKEND_HOST}/Adjuntos_proyecto/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        `Error en la respuesta del servidor: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching adjuntos:", error);
    throw new Error("Error fetching adjuntos");
  }
};

export const validateMaterials = async (id, type) => {
    try {
        const token = cookies().get('token')?.value;

    const response = await fetch(
      `${process.env.FAENA_BACKEND_HOST}/material/validate?id=${id}&type=${type}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

        if (!response.ok) {
            throw new Error(`Error en la respuesta del servidor: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error validando materiales:', error);
        throw new Error('Error validando materiales');
    }
};

