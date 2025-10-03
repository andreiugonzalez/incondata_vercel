const Joi = require('joi');

// Esquemas comunes reutilizables
const commonSchemas = {
    id: Joi.number().integer().positive().required(),
    optionalId: Joi.number().integer().positive().optional(),
    email: Joi.string().email().max(255).required(),
    password: Joi.string().min(6).max(100).required(),
    optionalPassword: Joi.string().min(6).max(100).optional(),
    name: Joi.string().min(1).max(100).trim().required(),
    optionalName: Joi.string().min(1).max(100).trim().optional(),
    description: Joi.string().max(500).trim().optional(),
    phone: Joi.string().pattern(/^[+]?[0-9\s\-()]+$/).min(8).max(20).optional(),
    date: Joi.date().iso().optional(),
    boolean: Joi.boolean().optional(),
    status: Joi.string().valid('active', 'inactive', 'pending').optional()
};

// Esquemas para Usuario
const userSchemas = {
    // Registro de usuario
    register: Joi.object({
        nombre: commonSchemas.name,
        apellido: commonSchemas.name,
        email: commonSchemas.email,
        password: commonSchemas.password,
        telefono: commonSchemas.phone,
        rut: Joi.string().pattern(/^[0-9]{1,2}\.?[0-9]{3}\.?[0-9]{3}-[0-9kK]$/).required(),
        tipo_contrato_id: commonSchemas.optionalId,
        organizacion_id: commonSchemas.optionalId
    }),

    registerExternal: Joi.object({
        personal: Joi.object({
            rut: Joi.string().pattern(/^[0-9]{1,2}\.?[0-9]{3}\.?[0-9]{3}-[0-9kK]$/).required(),
            nombre: commonSchemas.name,
            apellido_p: commonSchemas.name,
            apellido_m: commonSchemas.name,
            email: commonSchemas.email,
            password: commonSchemas.password,
            genero: Joi.string().valid('M', 'F', 'Masculino', 'Femenino', 'masculino', 'femenino').required(),
            fecha_de_nacimiento: Joi.date().iso().required(),
            telefono: Joi.string().pattern(/^\d+$/).required(), // Cambiado: el frontend envía string numérico
            codtelefono: Joi.number().integer().optional(),
            direccion: Joi.string().max(255).trim().required(),
            ID_comuna: Joi.number().integer().required(),
            codigo_postal: Joi.string().max(20).trim().required(), // Corregido: era 'postal'
            organizacion: Joi.number().integer().min(0).required().allow(null),
            prevision: Joi.number().integer().min(0).required().allow(null),
            afp: Joi.number().integer().min(0).required().allow(null),
            username: Joi.string().min(3).max(50).trim().required(),
            estado_civil: Joi.number().integer().optional(),
            estado_cuenta: Joi.number().integer().optional(),
            // Removidos campos que el frontend no envía:
            // usuario: Joi.string().max(100).trim().optional(),
            // urifolder: Joi.string().max(255).trim().optional(),
            // pais: Joi.number().integer().optional().allow(null),
            // region: Joi.number().integer().optional().allow(null),
        }).required(),
        laboral: Joi.object({
            tipo_contrato: Joi.number().integer().min(0).required(), // Cambiado: es requerido
            fecha_inicio_contrato: Joi.date().iso().required(), // Cambiado: es requerido
            // Removido fecha_termino_contrato: no existe en el modelo Laboral
            cargo: Joi.number().integer().min(0).required(), // Cambiado: es requerido
            sueldo_base: Joi.string().pattern(/^\d+$/).required(), // Cambiado: es requerido
            gratificacion: Joi.string().pattern(/^\d+$/).required(), // Cambiado: es requerido
            valor_dia: Joi.string().pattern(/^\d+$/).required(), // Cambiado: es requerido
            fecha_de_pago: Joi.date().iso().required(), // Cambiado: es requerido
            fecha_de_ingreso_obra: Joi.date().iso().required(), // Cambiado: es requerido
            medio_pago: Joi.number().integer().min(0).required(), // Cambiado: es requerido
            id_puesto: Joi.number().integer().min(0).required(), // Cambiado: es requerido
            nombre_contacto: Joi.string().min(1).max(100).trim().required(),
            telefono_emergencia: Joi.string().pattern(/^\d+$/).required(), // Cambiado: string numérico
            codtelefono_emergencia: Joi.number().integer().required(), // Cambiado: es requerido
            correo_emergencia: Joi.string().email().max(255).required(), // Cambiado: es requerido
            id_relacion_emergencia: Joi.number().integer().min(0).required(), // Cambiado: sin allow(null)
        }).required(),
        bank: Joi.object({
            banco: Joi.number().integer().positive().required(), // Cambiar a number
            numero_cuenta: Joi.string().max(50).trim().required(),
            tipo_cuenta: Joi.number().integer().positive().required(), // Cambiar a number
            correo_banco: Joi.string().email().max(255).required(),
        }).required() // Cambiado: bank es requerido
    }),

    // Registro de usuario interno con estructura anidada
    registerInternal: Joi.object({
        personal: Joi.object({
            rut: Joi.string().pattern(/^[0-9]{1,2}\.?[0-9]{3}\.?[0-9]{3}-[0-9kK]$/).required(),
            nombre: commonSchemas.name,
            apellido_p: commonSchemas.name,
            apellido_m: commonSchemas.name,
            username: Joi.string().min(3).max(50).trim().required(),
            genero: Joi.string().valid('M', 'F', 'Masculino', 'Femenino', 'masculino', 'femenino').required(),
            fecha_de_nacimiento: Joi.date().iso().required(),
            email: commonSchemas.email,
            telefono: commonSchemas.phone,
            codtelefono: Joi.number().integer().optional(),
            direccion: Joi.string().max(255).trim().required(),
            ID_comuna: Joi.number().integer().required(),
            codigo_postal: Joi.string().max(20).trim().required(),
            password: commonSchemas.password,
            usuario: Joi.string().max(100).trim().optional(),
            urifolder: Joi.string().max(255).trim().optional(),
            pais: Joi.number().integer().optional().allow(null),
            region: Joi.number().integer().optional().allow(null),
            estado_cuenta: Joi.number().integer().optional(),
            estado_civil: Joi.number().integer().optional()
        }).required(),
        laboral: Joi.object({
            id_rol: Joi.number().integer().min(0).required().allow(null),
            organizacionid: Joi.number().integer().min(0).required().allow(null),
            id_salud: Joi.number().integer().min(0).required().allow(null),
            id_afp: Joi.number().integer().min(0).required().allow(null),
            telefono_emergencia: commonSchemas.phone,
            codigo_area_emergencia: Joi.number().integer().optional(),
            nombre_emergencia: Joi.string().min(1).max(100).trim().required(),
            id_relacion_emergencia: Joi.number().integer().min(0).required().allow(null),
            id_puesto: Joi.number().integer().min(0).optional().allow(null),
            id_grupo: Joi.number().integer().min(0).optional().allow(null),
            correo_emergencia: Joi.string().email().max(255).optional()
        }).required()
    }),

    // Login de usuario
    login: Joi.object({
        email: commonSchemas.email,
        password: commonSchemas.password
    }),

    // Actualización de usuario
    update: Joi.object({
        nombre: commonSchemas.optionalName,
        apellido: commonSchemas.optionalName,
        email: Joi.string().email().max(255).optional(),
        telefono: commonSchemas.phone,
        rut: Joi.string().pattern(/^[0-9]{1,2}\.?[0-9]{3}\.?[0-9]{3}-[0-9kK]$/).optional(),
        tipo_contrato_id: commonSchemas.optionalId,
        organizacion_id: commonSchemas.optionalId,
        activo: commonSchemas.boolean
    }),

    // Cambio de contraseña
    changePassword: Joi.object({
        currentPassword: commonSchemas.password,
        newPassword: commonSchemas.password,
        confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
            .messages({
                'any.only': 'Las contraseñas no coinciden'
            })
    }),

    // Parámetros de usuario
    params: Joi.object({
        id: commonSchemas.id
    })
};

// Esquemas para Proyecto
const projectSchemas = {
    // Crear proyecto
    create: Joi.object({
        nombre: commonSchemas.name,
        descripcion: commonSchemas.description,
        fecha_inicio: commonSchemas.date,
        fecha_fin: commonSchemas.date,
        fecha_termino: commonSchemas.date,
        ubicacion: Joi.string().max(255).trim().optional(),
        codigo_bip: Joi.number().integer().optional(),
        unidad_tecnica: Joi.string().max(100).trim().optional(),
        supervisor: Joi.number().integer().positive().optional(),
        superintendente: Joi.number().integer().positive().optional(),
        rut_unidad_tecnica: Joi.string().max(20).trim().optional(),
        rut_empresa: Joi.string().max(20).trim().optional(),
        presupuesto: Joi.number().precision(2).positive().optional(),
        duenio: Joi.string().max(100).trim().optional(),
        monto_neto: Joi.number().precision(2).positive().optional(),
        monto_total_bruto: Joi.number().precision(2).positive().optional(),
        monto_mensual: Joi.number().precision(2).positive().optional(),
        total_general: Joi.number().precision(2).positive().optional(),
        localizacion_mina: Joi.string().max(255).trim().optional(),
        informador: Joi.string().max(100).trim().optional(),
        id_estadoproyecto: commonSchemas.optionalId,
        id_mina: commonSchemas.optionalId,
        avance: Joi.number().min(0).max(100).optional(),
        organizacion_id: commonSchemas.id,
        mina_id: commonSchemas.optionalId,
        activo: commonSchemas.boolean
    }),

    // Actualizar proyecto
    update: Joi.object({
        nombre: commonSchemas.optionalName,
        descripcion: commonSchemas.description,
        fecha_inicio: commonSchemas.date,
        fecha_fin: commonSchemas.date,
        organizacion_id: commonSchemas.optionalId,
        mina_id: commonSchemas.optionalId,
        activo: commonSchemas.boolean
    }),

    // Parámetros de proyecto
    params: Joi.object({
        id: commonSchemas.id
    })
};

// Esquemas para Organización
const organizationSchemas = {
    // Crear organización
    create: Joi.object({
        nombre: commonSchemas.name,
        rut: Joi.string().pattern(/^[0-9]{1,2}\.?[0-9]{3}\.?[0-9]{3}-[0-9kK]$/).required(),
        direccion: Joi.string().max(255).trim().optional(),
        telefono: commonSchemas.phone,
        email: Joi.string().email().max(255).optional(),
        tipo_empresa_id: commonSchemas.optionalId,
        activo: commonSchemas.boolean
    }),

    // Actualizar organización
    update: Joi.object({
        nombre: commonSchemas.optionalName,
        rut: Joi.string().pattern(/^[0-9]{1,2}\.?[0-9]{3}\.?[0-9]{3}-[0-9kK]$/).optional(),
        direccion: Joi.string().max(255).trim().optional(),
        telefono: commonSchemas.phone,
        email: Joi.string().email().max(255).optional(),
        tipo_empresa_id: commonSchemas.optionalId,
        activo: commonSchemas.boolean
    }),

    // Parámetros de organización
    params: Joi.object({
        id: commonSchemas.id
    })
};

// Esquemas para Tarea
const taskSchemas = {
    // Crear tarea
    create: Joi.object({
        nombre: commonSchemas.name,
        descripcion: commonSchemas.description,
        fecha_inicio: commonSchemas.date,
        fecha_fin: commonSchemas.date,
        proyecto_id: commonSchemas.id,
        partida_id: commonSchemas.optionalId,
        subpartida_id: commonSchemas.optionalId,
        tipo_tarea_id: commonSchemas.optionalId,
        activo: commonSchemas.boolean
    }),

    // Actualizar tarea
    update: Joi.object({
        nombre: commonSchemas.optionalName,
        descripcion: commonSchemas.description,
        fecha_inicio: commonSchemas.date,
        fecha_fin: commonSchemas.date,
        partida_id: commonSchemas.optionalId,
        subpartida_id: commonSchemas.optionalId,
        tipo_tarea_id: commonSchemas.optionalId,
        activo: commonSchemas.boolean
    }),

    // Parámetros de tarea
    params: Joi.object({
        id: commonSchemas.id
    })
};

// Esquemas para Material
const materialSchemas = {
    // Crear material
    create: Joi.object({
        nombre: commonSchemas.name,
        descripcion: commonSchemas.description,
        unidad: Joi.string().max(50).trim().optional(),
        precio_unitario: Joi.number().precision(2).positive().optional(),
        tipo_material_id: commonSchemas.optionalId,
        activo: commonSchemas.boolean
    }),

    // Actualizar material
    update: Joi.object({
        nombre: commonSchemas.optionalName,
        descripcion: commonSchemas.description,
        unidad: Joi.string().max(50).trim().optional(),
        precio_unitario: Joi.number().precision(2).positive().optional(),
        tipo_material_id: commonSchemas.optionalId,
        activo: commonSchemas.boolean
    }),

    // Parámetros de material
    params: Joi.object({
        id: commonSchemas.id
    })
};

// Esquemas para Comentarios
const commentSchemas = {
    // Crear comentario
    create: Joi.object({
        contenido: Joi.string().min(1).max(1000).trim().required(),
        proyecto_id: commonSchemas.optionalId,
        tarea_id: commonSchemas.optionalId,
        subtarea_id: commonSchemas.optionalId,
        parent_comment_id: commonSchemas.optionalId
    }),

    // Actualizar comentario
    update: Joi.object({
        contenido: Joi.string().min(1).max(1000).trim().required()
    }),

    // Parámetros de comentario
    params: Joi.object({
        id: commonSchemas.id
    })
};

// Esquemas para Query Parameters comunes
const querySchemas = {
    // Paginación
    pagination: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        sortBy: Joi.string().optional(),
        sortOrder: Joi.string().valid('ASC', 'DESC').default('ASC')
    }),

    // Filtros comunes
    filters: Joi.object({
        activo: Joi.boolean().optional(),
        search: Joi.string().max(255).trim().optional(),
        fecha_inicio: commonSchemas.date,
        fecha_fin: commonSchemas.date
    })
};

module.exports = {
    commonSchemas,
    userSchemas,
    projectSchemas,
    organizationSchemas,
    taskSchemas,
    materialSchemas,
    commentSchemas,
    querySchemas
};