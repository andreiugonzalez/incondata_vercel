"use server";

import { cookies } from "next/headers";
import UAParser from "ua-parser-js";

export default async function login(email, password) {
  try {
    console.log("Enviando solicitud de login a:", `${process.env.NEXT_PUBLIC_FAENA_BACKEND_HOST}/login`);
    console.log("Datos enviados:", { email, password });
    
    const loginResponse = await fetch(`${process.env.NEXT_PUBLIC_FAENA_BACKEND_HOST}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    console.log("Status de la respuesta HTTP:", loginResponse.status);
    console.log("Headers de la respuesta:", Object.fromEntries(loginResponse.headers.entries()));

    const response = await loginResponse.json();
    console.log("Respuesta JSON del backend:", response);

    // Si la respuesta es exitosa, guardar el token
    if (response?.statusCode === 200) {
      console.log("Login exitoso, guardando token:", response?.data?.token);
      cookies().set("token", response?.data?.token);
    }
    
    // Devolver la respuesta completa, incluyendo errores
    return response;
  } catch (error) {
    console.error("Error in login service:", error);
    return {
      status: "error",
      message: "Error de conexión. Por favor, inténtelo de nuevo.",
      error: true
    };
  }
}

export async function loginAndRegisterLoginDetails(
  email,
  password,
  userAgent,
  userIp,
) {
  try {
    // Realiza la solicitud de login
    const loginResponse = await login(email, password);

    if (loginResponse?.statusCode === 200) {
      const token = loginResponse?.data?.data?.token;

      let referrerUrl = null;
      if (typeof window !== "undefined") {
        referrerUrl = document.referrer || null;
      }

      // Enviar la IP del usuario al backend junto con otros detalles
      await fetch(`${process.env.NEXT_PUBLIC_FAENA_BACKEND_HOST}/users_logins`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: loginResponse?.data?.data?.user?.id,
          status: "success",
          ip_address: userIp,
          user_agent: userAgent,
          login_method: "password",
          referrer_url: referrerUrl,
        }),
      });
    }

    return loginResponse;
  } catch (error) {
    console.error("Error during login and registration:", error);
    return {
      error: true,
      message: error.message,
    };
  }
}

export const getLocationByComuna = async (comunaId) => {
  try {
    const token = cookies().get("token").value;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FAENA_BACKEND_HOST}/comunas/${comunaId}/location`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Error fetching location data");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching location:", error);
    return null;
  }
};

export const setUserPassword = async (password, token) => {
  try {
    const setPassword = await fetch(
      `${process.env.NEXT_PUBLIC_FAENA_BACKEND_HOST}/user/password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          password,
        }),
      },
    );

    const response = await setPassword.json();
    return response;
  } catch (error) {
    return error;
  }
};

export const forgetPassword = async (email) => {
  console.log("forgetPassword", email);
  const forgetPass = await fetch(
    `${process.env.NEXT_PUBLIC_FAENA_BACKEND_HOST}/user/password/email`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
      }),
    },
  );

  const response = await forgetPass.json();
  console.log(response);
  return response;
};

export const changeUserPassword = async (password, token) => {
  const forgetPass = await fetch(
    `${process.env.NEXT_PUBLIC_FAENA_BACKEND_HOST}/user/password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        password: password,
      }),
    },
  );

  const response = await forgetPass.json();
  console.log(response);
  return response;
};

export const updatePasswordTemp = async (
  userId,
  currentPassword,
  newPassword,
) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_FAENA_BACKEND_HOST}/user-password-temp`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        //'Authorization': `Bearer ${token}`, // Asegúrate de que `token` esté disponible en tu contexto o pásalo como argumento
      },
      body: JSON.stringify({
        userId: userId,
        currentPassword: currentPassword,
        newPassword: newPassword,
      }),
    },
  );

  const result = await response.json();
  console.log(result);
  return result;
};

export const updateIsTemporaryPassword = async (userId, isTemporary) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_FAENA_BACKEND_HOST}/update-temporary-password`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        //'Authorization': `Bearer ${token}`, // Asegúrate de pasar el token de autenticación si es necesario
      },
      body: JSON.stringify({
        userId: userId,
        isTemporaryPassword: isTemporary,
      }),
    },
  );

  const data = await response.json();
  console.log(data);
  return data;
};

export const getUsers = async (filter = 'all') => {
  const token = cookies().get('token').value;

  // Construir la URL con el parámetro de filtro si no es 'all'
  let url = `${process.env.NEXT_PUBLIC_FAENA_BACKEND_HOST}/user`;
  if (filter !== 'all') {
    url += `?type=${filter}`;
  }

  const users = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  })

  const response = await users.json();
  return response;
};

export const getUsersbyidlist = async (id) => {
  const token = cookies().get("token").value;

  const users = await fetch(
    `${process.env.NEXT_PUBLIC_FAENA_BACKEND_HOST}/user/names/${id}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const response = await users.json();
  return response;
};

// este es el weno INTERNAL
export const registerUser = async (personal, laboral) => {
  try {
    const token = cookies().get("token").value;

    // Debug: Log the data being sent
    /*
    console.log("=== DEBUG: Data being sent to backend ===");
    console.log("Personal data:", JSON.stringify(personal, null, 2));
    console.log("Laboral data:", JSON.stringify(laboral, null, 2));
    console.log("=== END DEBUG ===");
    */
    const response = await fetch(`${process.env.NEXT_PUBLIC_FAENA_BACKEND_HOST}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        personal: personal,
        laboral: laboral,
      }),
    });

    // Si la respuesta no es ok, intentamos obtener el mensaje de error
    if (!response.ok) {
      let errorMessage;
      try {
        const errorData = await response.json();
        
        // Debug: Log the error response from backend
        /*
        console.log("=== DEBUG: Backend error response ===");
        console.log("Status:", response.status);
        console.log("Error data:", JSON.stringify(errorData, null, 2));
        console.log("=== END DEBUG ===");
        */

        // Si tenemos detalles del error de la base de datos
        if (errorData.original?.code) {
          switch (errorData.original.code) {
            case '23505': // Error de clave única
              const match = errorData.original.detail?.match(/\((.*?)\)=\((.*?)\)/);
              if (match) {
                const [, field, value] = match;
                errorMessage = `Ya existe un usuario con ${field}: ${value}`;
              } else {
                errorMessage = 'Ya existe un usuario con esos datos';
              }
              break;
            case '23502': // Error de campo requerido
              errorMessage = `El campo ${errorData.original.column} es requerido`;
              break;
            default:
              errorMessage = errorData.message || errorData.error || `Error ${response.status}: ${response.statusText}`;
          }
        } else {
          errorMessage = errorData.message || errorData.error || `Error ${response.status}: ${response.statusText}`;
        }
      } catch (e) {
        // Si no podemos parsear la respuesta como JSON, usamos el status text
        errorMessage = `Error ${response.status}: ${response.statusText}`;
      }
      
      // Para errores 500, proporcionar un mensaje más amigable
      if (response.status === 500) {
        console.error("Error del servidor al registrar usuario:", errorMessage);
        errorMessage = "Error interno del servidor. Por favor, verifique que todos los campos sean correctos e intente nuevamente.";
      }
      
      throw new Error(errorMessage);
    }

    // Si la respuesta es ok, intentamos parsear el JSON
    try {
      const data = await response.json();
      return data;
    } catch (e) {
      // Si no hay JSON pero la respuesta fue ok, retornamos un objeto simple
      return { success: true };
    }
  } catch (error) {
    console.error("Error en registerUser:", error);
    throw error;
  }
};

export const getCodTelefono = async () => {
  try {
    const token = cookies().get("token").value;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FAENA_BACKEND_HOST}/cod_telefono`,
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
    console.error("Error fetching comunas:", error);
    throw new Error("Error fetching comunas");
  }
};

export const registerExternalUser = async (personal, laboral, bank) => {
  console.log("=== DEBUG registerExternalUser ===");
  console.log("personal:", personal);
  console.log("laboral:", laboral);
  console.log("bank:", bank);
  console.log("================================");

  try{
    const token = cookies().get("token").value;
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FAENA_BACKEND_HOST}/register-external`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          personal: personal,
          laboral: laboral,
          bank: bank,
        }),
      },
    );

    // Si la respuesta no es ok, intentamos obtener el mensaje de error
    if (!response.ok) {
      let errorMessage;
      try {
        const errorData = await response.json();
        
        // Debug: Log the error response from backend
        console.log("=== DEBUG: Backend error response ===");
        console.log("Status:", response.status);
        console.log("Error data:", JSON.stringify(errorData, null, 2));
        console.log("=== END DEBUG ===");
        
        // Si tenemos detalles del error de la base de datos
        if (errorData.original?.code) {
          switch (errorData.original.code) {
            case '23505': // Error de clave única
              const match = errorData.original.detail?.match(/\((.*?)\)=\((.*?)\)/);
              if (match) {
                const [, field, value] = match;
                errorMessage = `Ya existe un usuario con ${field}: ${value}`;
              } else {
                errorMessage = 'Ya existe un usuario con esos datos';
              }
              break;
            case '23502': // Error de campo requerido
              errorMessage = `El campo ${errorData.original.column} es requerido`;
              break;
            default:
              errorMessage = errorData.message || errorData.error || `Error ${response.status}: ${response.statusText}`;
          }
        } else {
          errorMessage = errorData.message || errorData.error || `Error ${response.status}: ${response.statusText}`;
        }
      } catch (e) {
        // Si no podemos parsear la respuesta como JSON, usamos el status text
        errorMessage = `Error ${response.status}: ${response.statusText}`;
      }
      
      // Para errores 500, proporcionar un mensaje más amigable
      if (response.status === 500) {
        console.error("Error del servidor al registrar usuario:", errorMessage);
        errorMessage = "Error interno del servidor. Por favor, verifique que todos los campos sean correctos e intente nuevamente.";
      }
      
      throw new Error(errorMessage);
    }

    // Si la respuesta es ok, intentamos parsear el JSON
    try {
      const data = await response.json();
      return data;
    } catch (e) {
      // Si no hay JSON pero la respuesta fue ok, retornamos un objeto simple
      return { success: true };
    }
  } catch (error) {
    console.error("Error en registerUser:", error);
    throw error;
  }
  /*
  const response = await users.json();
  return response;
  */
};

export const postUserProf = async (formData) => {
  const token = cookies().get("token").value;

  const organizationResp = await fetch(
    `${process.env.NEXT_PUBLIC_FAENA_BACKEND_HOST}/document/user_profile/create`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    },
  );

  const response = await organizationResp.json();
  return response;
};

export const postUserDoc = async (userId, file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("filesize", file.size);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FAENA_BACKEND_HOST}/document/profile/${userId}`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al subir foto de perfil:", error);
    throw error;
  }
};

//select user ENDPOINTS

export const getPaises = async () => {
  try {
    const token = cookies().get("token").value;

    const response = await fetch(`${process.env.NEXT_PUBLIC_FAENA_BACKEND_HOST}/paises`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching countries:", error);
    return [];
  }
};

export const getRegionesPorPais = async (paisId) => {
  try {
    const token = cookies().get("token").value;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FAENA_BACKEND_HOST}/paises/${paisId}/regiones`,
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

export const getComunasPorRegion = async (regionId) => {
  try {
    const token = cookies().get("token").value;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FAENA_BACKEND_HOST}/regiones/${regionId}/comunas`,
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
    console.error("Error fetching comunas:", error);
    throw new Error("Error fetching comunas");
  }
};

export const getOrganizacion = async () => {
  try {
    const token = cookies().get("token").value;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FAENA_BACKEND_HOST}/organizacion_select`,
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
    console.error("Error fetching comunas:", error);
    throw new Error("Error fetching comunas");
  }
};

export const getAfp = async () => {
  try {
    const token = cookies().get("token").value;
    const response = await fetch(`${process.env.NEXT_PUBLIC_FAENA_BACKEND_HOST}/afp`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching AFP:", error);
    throw new Error("Error fetching AFP");
  }
};

export const getSalud = async () => {
  try {
    const token = cookies().get("token").value;
    const response = await fetch(`${process.env.NEXT_PUBLIC_FAENA_BACKEND_HOST}/salud`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching salud:", error);
    throw new Error("Error fetching salud");
  }
};

export const getTipoContrato = async () => {
  try {
    const token = cookies().get("token").value;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FAENA_BACKEND_HOST}/tipo_contrato`,
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
    console.error("Error fetching tipo_contrato:", error); // Changed 'comunas' to 'salud'
    throw new Error("Error fetching tipo_contrato"); // Changed 'comunas' to 'salud'
  }
};

export const getMedioPago = async () => {
  try {
    const token = cookies().get("token").value;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FAENA_BACKEND_HOST}/medio_pago`,
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
    console.error("Error fetching medio_pago:", error);
    throw new Error("Error fetching medio_pago");
  }
};

export const getrol = async () => {
  try {
    const token = cookies().get("token").value;
    const response = await fetch(`${process.env.NEXT_PUBLIC_FAENA_BACKEND_HOST}/rol`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching rol:", error);
    throw new Error("Error fetching rol");
  }
};

export const assignRolesToUser = async (userId, roleIds) => {
  try {
    const token = cookies().get("token").value;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FAENA_BACKEND_HOST}/user/${userId}/roles`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ roleIds }),
      },
    );

    if (!response.ok) {
      throw new Error("Error assigning roles");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error assigning roles:", error);
    throw new Error("Error assigning roles");
  }
};

export const getNombreBanco = async () => {
  try {
    const token = cookies().get("token").value;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FAENA_BACKEND_HOST}/nombre_banco`,
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
    console.error("Error fetching nombre_banco:", error);
    throw new Error("Error fetching nombre_banco");
  }
};

export const getTipoCuenta = async () => {
  try {
    const token = cookies().get("token").value;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FAENA_BACKEND_HOST}/tipo_cuenta_banco`,
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
    console.error("Error fetching tipo_cuenta_banco:", error);
    throw new Error("Error fetching tipo_cuenta_banco");
  }
};

export const getEstado_civil = async () => {
  try {
    const token = cookies().get("token").value;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FAENA_BACKEND_HOST}/estado_civil`,
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
    console.error("Error fetching estado_civil:", error);
    throw new Error("Error fetching estado_civil");
  }
};

export const getEstado_cuenta = async () => {
  try {
    const token = cookies().get("token").value;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FAENA_BACKEND_HOST}/estado_cuenta`,
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
    console.error("Error fetching estado_cuenta:", error);
    throw new Error("Error fetching estado_cuenta");
  }
};

export const getRelacion = async () => {
  try {
    const token = cookies().get("token").value;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FAENA_BACKEND_HOST}/relacion_emergencia`,
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
    console.error("Error fetching relacion_emergencia:", error);
    throw new Error("Error fetching relacion_emergencia");
  }
};

export const getrolcontratista = async () => {
  try {
    const token = cookies().get("token").value;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FAENA_BACKEND_HOST}/user/users`,
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
    console.error("Error fetching users:", error);
    throw new Error("Error fetching users");
  }
};

export const getrolinspector = async () => {
  try {
    const token = cookies().get("token").value;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FAENA_BACKEND_HOST}/user/users_inspector`,
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
    console.error("Error fetching contratista:", error);
    throw new Error("Error fetching contratista");
  }
};

export const getUserITO = async () => {
  try {
    const token = cookies().get("token").value;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FAENA_BACKEND_HOST}/user/users_ITO`,
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
    console.error("Error fetching contratista:", error);
    throw new Error("Error fetching contratista");
  }
};

export const getUserplanner = async () => {
  try {
    const token = cookies().get("token").value;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FAENA_BACKEND_HOST}/user/users_planner`,
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
    console.error("Error fetching contratista:", error);
    throw new Error("Error fetching contratista");
  }
};

export const getUsersupervisor = async () => {
  try {
    const token = cookies().get("token").value;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FAENA_BACKEND_HOST}/user/users_supervisor`,
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
    console.error("Error fetching contratista:", error);
    throw new Error("Error fetching contratista");
  }
};

export const getUsersadmincontrato = async () => {
  try {
    const token = cookies().get("token").value;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FAENA_BACKEND_HOST}/user/users_admcontrato`,
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
    console.error("Error fetching admin contrato:", error);
    throw new Error("Error fetching admin contrato");
  }
};

export const getUserprevencionista = async () => {
  try {
    const token = cookies().get("token").value;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FAENA_BACKEND_HOST}/user/users_prevencionista`,
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
    console.error("Error fetching contratista:", error);
    throw new Error("Error fetching contratista");
  }
};

export const getrolsuperintendente = async () => {
  try {
    const token = cookies().get("token").value;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FAENA_BACKEND_HOST}/user/users_superint`,
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
    console.error("Error fetching contratista:", error);
    throw new Error("Error fetching contratista");
  }
};

export const getUserById = async (id) => {
  try {
    const token = cookies().get("token").value;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FAENA_BACKEND_HOST}/user/update/internal/${id}`,
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
    console.error("Error fetching user by ID:", error);
    throw new Error("Error fetching user by ID");
  }
};

//UPDATE USER Datos
export const updateUser = async (id, userData) => {
  try {
    const token = cookies().get("token").value;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FAENA_BACKEND_HOST}/user/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      },
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw new Error("Error updating user");
  }
};

export const getGrupo = async () => {
  try {
    const token = cookies().get("token").value;
    const response = await fetch(`${process.env.NEXT_PUBLIC_FAENA_BACKEND_HOST}/grupo`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching relacion_emergencia:", error);
    throw new Error("Error fetching relacion_emergencia");
  }
};

export const getPuesto = async () => {
  try {
    const token = cookies().get("token").value;
    const response = await fetch(`${process.env.NEXT_PUBLIC_FAENA_BACKEND_HOST}/puesto`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching relacion_emergencia:", error);
    throw new Error("Error fetching relacion_emergencia");
  }
};

export const updateUserProfilePicture = async (userId, file) => {
  const formData = new FormData();
  formData.append("profile_picture", file);

  try {
    const token = cookies().get("token").value;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FAENA_BACKEND_HOST}/user/${userId}/profile-picture`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error("Error updating profile picture");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating profile picture:", error);
    throw error;
  }
};

export const registerUserFromExcel = async (users) => {
  const token = cookies().get("token")?.value;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FAENA_BACKEND_HOST}/register-excel`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(users), // Enviar un array de usuarios
      },
    );

    const responseData = await response.json();

    if (!response.ok) {
      console.error("Error response:", responseData);
      return { status: "error", message: responseData.message };
    }

    return responseData;
  } catch (error) {
    if (error.name === "AbortError") {
      console.log("Upload aborted");
      return { status: "aborted", message: "Upload aborted by the user" };
    } else {
      console.error("Error uploading user:", error);
      return { status: "error", message: error.message };
    }
  }
};
// export const downloadExcel = (req, res) => {
//     const file = path.join(__dirname, '../../path_to_your_excel_file.xlsx'); // Ajusta la ruta al archivo
//     res.download(file, 'filename.xlsx', (err) => {
//         if (err) {
//             console.error('Error downloading file:', err);
//             res.status(500).send({ error: 'Error downloading file' });
//         }
//     });
// };
export const getRolesInternos = async () => {
  try {
    const token = cookies().get('token').value;
    const response = await fetch(`${process.env.NEXT_PUBLIC_FAENA_BACKEND_HOST}/roles/internos`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching internal roles:', error);
    throw new Error('Error fetching internal roles');
  }
};

export const getRolesExternos = async () => {
  try {
    const token = cookies().get('token').value;
    const response = await fetch(`${process.env.NEXT_PUBLIC_FAENA_BACKEND_HOST}/roles/externos`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching external roles:', error);
    throw new Error('Error fetching external roles');
  }
};

export const checkUsernameAvailability = async (username) => {
  try {
    const token = cookies().get("token").value;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FAENA_BACKEND_HOST}/check-username/${username}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error checking username:", error);
    throw error;
  }
};

// Función para eliminar usuario
export const deleteUser = async (userId) => {
  try {
    const token = cookies().get("token").value;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FAENA_BACKEND_HOST}/user/${userId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new Error("Error deleting user");
  }
};

