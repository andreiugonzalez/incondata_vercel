const eventosData = [
    {
        id: 1,
        fechaIncidente: '2024-07-01T10:30:00',
        fechaCreacion: '2024-07-01T09:00:00',
        fechaActualizacion: '2024-07-01T10:00:00',
        creadoPorUsuario: 'Usuario A',
        resumen: 'Inspección de seguridad en el área de construcción',
        tipo: 'Inspección',
        mensajeDesplegado: true,
        archivos: [
            { url: '/files/inspeccion_1.pdf' },
            { url: '/files/inspeccion_2.pdf' }
        ]
    },
    {
        id: 2,
        fechaIncidente: '2024-07-05T14:45:00',
        fechaCreacion: '2024-07-05T08:30:00',
        fechaActualizacion: '2024-07-05T12:00:00',
        creadoPorUsuario: 'Usuario B',
        resumen: 'Capacitación sobre el uso de EPP',
        tipo: 'Capacitación',
        mensajeDesplegado: false,
        archivos: [
            { url: '/files/capacitacion_1.pdf' }
        ]
    },
    {
        id: 3,
        fechaIncidente: '2024-07-10T11:15:00',
        fechaCreacion: '2024-07-10T09:45:00',
        fechaActualizacion: '2024-07-10T10:30:00',
        creadoPorUsuario: 'Usuario C',
        resumen: 'Simulacro de evacuación',
        tipo: 'Simulacro',
        mensajeDesplegado: true,
        archivos: [
            { url: '/files/simulacro_1.pdf' }
        ]
    },
    {
        id: 4,
        fechaIncidente: '2024-07-15T08:00:00',
        fechaCreacion: '2024-07-15T07:00:00',
        fechaActualizacion: '2024-07-15T07:45:00',
        creadoPorUsuario: 'Usuario D',
        resumen: 'Accidente menor en la zona de carga',
        tipo: 'Accidente',
        mensajeDesplegado: false,
        archivos: [
            { url: '/files/accidente_1.pdf' }
        ]
    },
    {
        id: 5,
        fechaIncidente: '2024-07-20T13:20:00',
        fechaCreacion: '2024-07-20T10:30:00',
        fechaActualizacion: '2024-07-20T12:00:00',
        creadoPorUsuario: 'Usuario E',
        resumen: 'Incidente de seguridad en la plataforma',
        tipo: 'Incidente',
        mensajeDesplegado: true,
        archivos: [
            { url: '/files/incidente_1.pdf' }
        ]
    },
    {
        id: 6,
        fechaIncidente: '2024-07-25T16:10:00',
        fechaCreacion: '2024-07-25T14:00:00',
        fechaActualizacion: '2024-07-25T15:30:00',
        creadoPorUsuario: 'Usuario F',
        resumen: 'Capacitación sobre uso de extintores',
        tipo: 'Capacitación',
        mensajeDesplegado: false,
        archivos: [
            { url: '/files/capacitacion_extintores.pdf' }
        ]
    },
    {
        id: 7,
        fechaIncidente: '2024-07-30T09:30:00',
        fechaCreacion: '2024-07-30T08:00:00',
        fechaActualizacion: '2024-07-30T08:45:00',
        creadoPorUsuario: 'Usuario G',
        resumen: 'Simulacro de incendio',
        tipo: 'Simulacro',
        mensajeDesplegado: true,
        archivos: [
            { url: '/files/simulacro_incendio.pdf' }
        ]
    },
    {
        id: 8,
        fechaIncidente: '2024-08-01T07:45:00',
        fechaCreacion: '2024-08-01T07:00:00',
        fechaActualizacion: '2024-08-01T07:30:00',
        creadoPorUsuario: 'Usuario H',
        resumen: 'Inspección de equipo de protección personal',
        tipo: 'Inspección',
        mensajeDesplegado: false,
        archivos: [
            { url: '/files/inspeccion_epp.pdf' }
        ]
    },
    {
        id: 9,
        fechaIncidente: '2024-08-05T15:00:00',
        fechaCreacion: '2024-08-05T14:00:00',
        fechaActualizacion: '2024-08-05T14:45:00',
        creadoPorUsuario: 'Usuario I',
        resumen: 'Accidente en la zona de almacenamiento',
        tipo: 'Accidente',
        mensajeDesplegado: true,
        archivos: [
            { url: '/files/accidente_almacenamiento.pdf' }
        ]
    },
    {
        id: 10,
        fechaIncidente: '2024-08-10T10:20:00',
        fechaCreacion: '2024-08-10T09:00:00',
        fechaActualizacion: '2024-08-10T09:45:00',
        creadoPorUsuario: 'Usuario J',
        resumen: 'Incidente durante la carga de materiales',
        tipo: 'Incidente',
        mensajeDesplegado: false,
        archivos: [
            { url: '/files/incidente_carga.pdf' }
        ]
    },
    {
        id: 11,
        fechaIncidente: '2024-08-15T13:50:00',
        fechaCreacion: '2024-08-15T10:00:00',
        fechaActualizacion: '2024-08-15T12:00:00',
        creadoPorUsuario: 'Usuario K',
        resumen: 'Capacitación sobre primeros auxilios',
        tipo: 'Capacitación',
        mensajeDesplegado: true,
        archivos: [
            { url: '/files/capacitacion_primeros_auxilios.pdf' }
        ]
    },
    {
        id: 12,
        fechaIncidente: '2024-08-20T11:10:00',
        fechaCreacion: '2024-08-20T09:00:00',
        fechaActualizacion: '2024-08-20T10:00:00',
        creadoPorUsuario: 'Usuario L',
        resumen: 'Simulacro de evacuación por terremoto',
        tipo: 'Simulacro',
        mensajeDesplegado: false,
        archivos: [
            { url: '/files/simulacro_terremoto.pdf' }
        ]
    },
    {
        id: 13,
        fechaIncidente: '2024-08-25T14:30:00',
        fechaCreacion: '2024-08-25T13:00:00',
        fechaActualizacion: '2024-08-25T13:30:00',
        creadoPorUsuario: 'Usuario M',
        resumen: 'Inspección de maquinaria pesada',
        tipo: 'Inspección',
        mensajeDesplegado: true,
        archivos: [
            { url: '/files/inspeccion_maquinaria.pdf' }
        ]
    },
    {
        id: 14,
        fechaIncidente: '2024-08-30T09:10:00',
        fechaCreacion: '2024-08-30T08:00:00',
        fechaActualizacion: '2024-08-30T08:30:00',
        creadoPorUsuario: 'Usuario N',
        resumen: 'Accidente con montacargas',
        tipo: 'Accidente',
        mensajeDesplegado: false,
        archivos: [
            { url: '/files/accidente_montacargas.pdf' }
        ]
    },
    {
        id: 15,
        fechaIncidente: '2024-09-01T14:45:00',
        fechaCreacion: '2024-09-01T13:30:00',
        fechaActualizacion: '2024-09-01T14:00:00',
        creadoPorUsuario: 'Usuario O',
        resumen: 'Incidente con material peligroso',
        tipo: 'Incidente',
        mensajeDesplegado: true,
        archivos: [
            { url: '/files/incidente_material_peligroso.pdf' }
        ]
    },
    {
        id: 16,
        fechaIncidente: '2024-09-05T10:25:00',
        fechaCreacion: '2024-09-05T09:00:00',
        fechaActualizacion: '2024-09-05T09:30:00',
        creadoPorUsuario: 'Usuario P',
        resumen: 'Capacitación sobre manejo de residuos',
        tipo: 'Capacitación',
        mensajeDesplegado: false,
        archivos: [
            { url: '/files/capacitacion_residuos.pdf' }
        ]
    },
    {
        id: 17,
        fechaIncidente: '2024-09-10T16:10:00',
        fechaCreacion: '2024-09-10T14:00:00',
        fechaActualizacion: '2024-09-10T15:00:00',
        creadoPorUsuario: 'Usuario Q',
        resumen: 'Simulacro de derrame químico',
        tipo: 'Simulacro',
        mensajeDesplegado: true,
        archivos: [
            { url: '/files/simulacro_derrame.pdf' }
        ]
    },
    {
        id: 18,
        fechaIncidente: '2024-09-15T13:20:00',
        fechaCreacion: '2024-09-15T11:00:00',
        fechaActualizacion: '2024-09-15T12:00:00',
        creadoPorUsuario: 'Usuario R',
        resumen: 'Inspección de extintores',
        tipo: 'Inspección',
        mensajeDesplegado: false,
        archivos: [
            { url: '/files/inspeccion_extintores.pdf' }
        ]
    },
    {
        id: 19,
        fechaIncidente: '2024-09-20T08:30:00',
        fechaCreacion: '2024-09-20T07:00:00',
        fechaActualizacion: '2024-09-20T07:45:00',
        creadoPorUsuario: 'Usuario S',
        resumen: 'Accidente en la planta de tratamiento',
        tipo: 'Accidente',
        mensajeDesplegado: true,
        archivos: [
            { url: '/files/accidente_planta.pdf' }
        ]
    },
    {
        id: 20,
        fechaIncidente: '2024-09-25T14:00:00',
        fechaCreacion: '2024-09-25T12:30:00',
        fechaActualizacion: '2024-09-25T13:30:00',
        creadoPorUsuario: 'Usuario T',
        resumen: 'Incidente en el laboratorio',
        tipo: 'Incidente',
        mensajeDesplegado: false,
        archivos: [
            { url: '/files/incidente_laboratorio.pdf' }
        ]
    },
    {
        id: 21,
        fechaIncidente: '2024-09-30T11:45:00',
        fechaCreacion: '2024-09-30T09:30:00',
        fechaActualizacion: '2024-09-30T10:00:00',
        creadoPorUsuario: 'Usuario U',
        resumen: 'Capacitación sobre normativas de seguridad',
        tipo: 'Capacitación',
        mensajeDesplegado: true,
        archivos: [
            { url: '/files/capacitacion_normativas.pdf' }
        ]
    },
    {
        id: 22,
        fechaIncidente: '2024-10-01T15:00:00',
        fechaCreacion: '2024-10-01T13:00:00',
        fechaActualizacion: '2024-10-01T14:00:00',
        creadoPorUsuario: 'Usuario V',
        resumen: 'Simulacro de evacuación general',
        tipo: 'Simulacro',
        mensajeDesplegado: false,
        archivos: [
            { url: '/files/simulacro_evacuacion_general.pdf' }
        ]
    },
    {
        id: 23,
        fechaIncidente: '2024-10-05T10:15:00',
        fechaCreacion: '2024-10-05T08:30:00',
        fechaActualizacion: '2024-10-05T09:30:00',
        creadoPorUsuario: 'Usuario W',
        resumen: 'Inspección de área de soldadura',
        tipo: 'Inspección',
        mensajeDesplegado: true,
        archivos: [
            { url: '/files/inspeccion_soldadura.pdf' }
        ]
    },
    {
        id: 24,
        fechaIncidente: '2024-10-10T09:00:00',
        fechaCreacion: '2024-10-10T07:30:00',
        fechaActualizacion: '2024-10-10T08:00:00',
        creadoPorUsuario: 'Usuario X',
        resumen: 'Accidente en la zona de ensamblaje',
        tipo: 'Accidente',
        mensajeDesplegado: false,
        archivos: [
            { url: '/files/accidente_ensamblaje.pdf' }
        ]
    },
    {
        id: 25,
        fechaIncidente: '2024-10-15T13:35:00',
        fechaCreacion: '2024-10-15T12:00:00',
        fechaActualizacion: '2024-10-15T12:45:00',
        creadoPorUsuario: 'Usuario Y',
        resumen: 'Incidente durante el mantenimiento',
        tipo: 'Incidente',
        mensajeDesplegado: true,
        archivos: [
            { url: '/files/incidente_mantenimiento.pdf' }
        ]
    }
];

export default eventosData;
