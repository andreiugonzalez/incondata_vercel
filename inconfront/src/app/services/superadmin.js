"use server";

import { cookies } from "next/headers";

/**
 * Crea un usuario interno con rol superadmin
 * Este usuario tendrá acceso completo al sistema
 */
export async function createSuperAdminUser() {
  try {
    const token = cookies().get("token")?.value;
    
    if (!token) {
      throw new Error("Token de autenticación no encontrado");
    }

    // Datos del usuario superadmin interno
    const superAdminData = {
      personal: {
        rut: "22.729.888-K", // RUT genérico para usuario interno
        nombre: "Super",
        apellido_p: "Admin",
        apellido_m: "Sistema",
        username: "superadmin",
        genero: "Masculino",
        fecha_de_nacimiento: "1990-01-01",
        email: "superadmin@sistema.interno",
        telefono: "99999999",
        codtelefono: "+56",
        direccion: "Sistema Interno",
        ID_comuna: 1, // Comuna por defecto
        postal: "0000000",
        password: "SuperAdmin2024!", // Contraseña temporal fuerte
        usuario: "superadmin",
        urifolder: generateEncryptedUriFolder(),
        pais: 1, // Chile por defecto
        region: 1, // Región por defecto
        estado_civil: "Soltero",
        afp: 1, // AFP por defecto
        salud: 1, // Salud por defecto
      },
      laboral: {
        organizacion: 1, // Organización interna
        relacion: 1, // Relación por defecto
        puesto: 1, // Puesto por defecto
        grupo: 1, // Grupo por defecto
        rol: "superadmin", // Rol superadmin
        fecha_ingreso: new Date().toISOString().split('T')[0],
        estado: "Activo",
        tipo_contrato: "Indefinido",
        sueldo_base: 0,
        medio_pago: "Transferencia",
      }
    };

    // Crear el usuario
    const response = await fetch(`${process.env.FAENA_BACKEND_HOST}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(superAdminData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Error al crear usuario superadmin");
    }

    // Si el usuario se creó exitosamente, asignar el rol superadmin
    if (result.statusCode === 201 && result.data?.user?.id) {
      const userId = result.data.user.id;
      
      // Obtener el ID del rol superadmin
      const rolesResponse = await fetch(`${process.env.FAENA_BACKEND_HOST}/roles/internos`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const roles = await rolesResponse.json();
      const superAdminRole = roles.find(role => role.nombre === "superadmin");

      if (superAdminRole) {
        // Asignar el rol superadmin al usuario
        await fetch(`${process.env.FAENA_BACKEND_HOST}/user/${userId}/roles`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ roleIds: [superAdminRole.id] }),
        });
      }
    }

    return {
      success: true,
      message: "Usuario superadmin creado exitosamente",
      data: result.data,
      credentials: {
        username: "superadmin",
        email: "superadmin@sistema.interno",
        password: "SuperAdmin2024!",
      }
    };

  } catch (error) {
    console.error("Error creando usuario superadmin:", error);
    return {
      success: false,
      message: error.message || "Error interno del servidor",
      error: error
    };
  }
}

/**
 * Genera un URI folder encriptado único
 */
function generateEncryptedUriFolder() {
  const crypto = require('crypto');
  const hash = crypto.createHash("sha256");
  const randomValue = crypto.randomBytes(16).toString("hex");
  hash.update(randomValue + Date.now().toString());
  return hash.digest("hex");
}

/**
 * Verifica si ya existe un usuario superadmin
 */
export async function checkSuperAdminExists() {
  try {
    // Usar el endpoint específico para verificar superadmin
    const response = await fetch(`${process.env.FAENA_BACKEND_HOST}/check-superadmin`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const result = await response.json();
    
    return {
      exists: result.data?.exists || false,
      message: result.message || "Verificación completada",
      user: result.data?.user || null
    };

  } catch (error) {
    console.error("Error verificando superadmin:", error);
    return {
      exists: false,
      error: error.message
    };
  }
}