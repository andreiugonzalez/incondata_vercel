'use server';

import { cookies } from "next/headers";

export const getMinas = async () => {

        const token = cookies().get('token').value;

        const minasResp = await fetch(`${process.env.FAENA_BACKEND_HOST}/mine`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        })

        const response = await minasResp.json();
        return response;
}

export const getminasname = async () => {

    const token = cookies().get('token').value;

    const minasResp = await fetch(`${process.env.FAENA_BACKEND_HOST}/minename`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    })

    const response = await minasResp.json();
    return response;
}

export const getMinaById = async (id) => {
    try {
      const token = cookies().get('token').value;
      const response = await fetch(`${process.env.FAENA_BACKEND_HOST}/mina/update/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching mina by ID:', error);
      throw new Error('Error fetching mina by ID');
    }
  };

  export const updateMina = async (id, minaData) => {
    try {
      const token = cookies().get('token').value;
      const response = await fetch(`${process.env.FAENA_BACKEND_HOST}/minabyid/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(minaData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating mina:', error);
      throw new Error('Error updating mina');
    }
  };

  export const postMinaProf = async (formData) => {

    const token = cookies().get('token').value;

    const minaResp = await fetch(`${process.env.FAENA_BACKEND_HOST}/document/mina_profile/create`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: formData,
    })

    const response = await minaResp.json();
    return response;
}

  export const postMinacreate = async (formData) => {
  try {
    const token = cookies().get('token').value;

    const minaResp = await fetch(`${process.env.FAENA_BACKEND_HOST}/registermine`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!minaResp.ok) {
      const errorData = await minaResp.json();
      throw new Error(errorData.error?.message || 'Error al crear la mina');
    }

    const response = await minaResp.json();
    return response;
  } catch (error) {
    console.error('Error en postMinacreate:', error);
    throw error;
  }
  
};

export const deleteMina = async (id) => {
  try {
    const token = cookies().get('token').value;
    const response = await fetch(`${process.env.FAENA_BACKEND_HOST}/minabyid/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting mina:', error);
    throw new Error('Error deleting mina');
  }
};