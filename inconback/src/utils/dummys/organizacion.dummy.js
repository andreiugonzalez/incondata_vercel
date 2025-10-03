const organizationsDummy = [
    {
        nombre: 'Codelco',
        direccion: 'Av. El Condor, 4.500',
        id_codtelefono: 56,
        telefono: '+56 2 2654 4000',
        email: 'contacto@codelco.cl',
        sitio_web: 'https://www.codelco.com',
        descripcion: 'Codelco es una empresa estatal chilena, la principal productora de cobre del mundo.',
        rut: '99.032.000-1',
        representante_legal: 'Octavio Araneda',
        rut_representante_legal: '12.453.234-2',
        id_comuna: 1 // Santiago
    },
    {
        nombre: 'Minera Escondida',
        direccion: 'Avenida Andrés Bello 2800, Piso 16',
        id_codtelefono: 56,
        telefono: '+56 2 335 1500',
        email: 'contacto@mineraescondida.cl',
        sitio_web: 'https://www.mineraescondida.cl',
        descripcion: 'Minera Escondida es una empresa minera dedicada a la extracción de cobre en Chile.',
        rut: '91.781.000-5',
        representante_legal: 'Marcelo Castillo',
        rut_representante_legal: '12.453.234-2',
        id_comuna: 1 // Santiago
    },
    {
        nombre: 'Antofagasta Minerals',
        direccion: 'Av. Andrés Bello 2800, Piso 12',
        id_codtelefono: 56,
        telefono: '+56 2 2799 7000',
        email: 'info@aminerals.cl',
        sitio_web: 'https://www.antofagastaminerals.cl',
        descripcion: 'Antofagasta Minerals es una empresa minera con operaciones en Chile y Perú.',
        rut: '90.921.000-6',
        representante_legal: 'Iván Arriagada',
        rut_representante_legal: '12.453.234-2',
        id_comuna: 1 // Santiago
    },

    {
        nombre: 'Anglo American',
        direccion: 'Av. Apoquindo 4001',
        id_codtelefono: 56,
        telefono: '+56 2 584 2000',
        email: 'info@angloamerican.cl',
        sitio_web: 'https://www.angloamerican.com',
        descripcion: 'Anglo American es una empresa minera multinacional con operaciones en Chile.',
        rut: '99.123.000-8',
        representante_legal: 'Ruben Fernandes',
        rut_representante_legal: '12.453.234-2',
        id_comuna: 1 // Santiago
    },
    {
        nombre: 'BHP Billiton',
        direccion: 'Cerro El Plomo 5540, Piso 14',
        id_codtelefono: 56,
        telefono: '+56 2 565 6000',
        email: 'contacto@bhp.com',
        sitio_web: 'https://www.bhp.com',
        descripcion: 'BHP Billiton es una de las compañías mineras más grandes del mundo.',
        rut: '91.888.000-5',
        representante_legal: 'Mike Henry',
        rut_representante_legal: '12.453.234-2',
        id_comuna: 1 // Santiago
    },
    {
        nombre: 'SQM',
        direccion: 'Av. El Bosque Norte 500, Piso 17',
        id_codtelefono: 56,
        telefono: '+56 2 2425 2000',
        email: 'contacto@sqm.com',
        sitio_web: 'https://www.sqm.com',
        descripcion: 'SQM es una empresa chilena dedicada a la explotación de recursos naturales.',
        rut: '92.617.000-6',
        representante_legal: 'Ricardo Ramos',
        rut_representante_legal: '12.453.234-2',
        id_comuna: 1 // Santiago
    },
    {
        nombre: 'Lithium Americas',
        direccion: 'Av. Apoquindo 6410, Piso 9',
        id_codtelefono: 56,
        telefono: '+56 2 584 8000',
        email: 'info@lithiumamericas.com',
        sitio_web: 'https://www.lithiumamericas.com',
        descripcion: 'Lithium Americas es una empresa minera enfocada en la extracción de litio.',
        rut: '94.219.000-4',
        representante_legal: 'Jon Evans',
        rut_representante_legal: '12.453.234-2',
        id_comuna: 1 // Santiago
    },
    {
        nombre: 'Albemarle Corporation',
        direccion: 'Av. Apoquindo 3500, Piso 15',
        id_codtelefono: 56,
        telefono: '+56 2 584 1000',
        email: 'contacto@albemarle.com',
        sitio_web: 'https://www.albemarle.com',
        descripcion: 'Albemarle Corporation es una empresa estadounidense líder en la producción de litio.',
        rut: '91.345.000-3',
        representante_legal: 'Kent Masters',
        rut_representante_legal: '12.453.234-2',
        id_comuna: 1 // Santiago
    },
    {
        nombre: 'Kinross Gold',
        direccion: 'Av. Apoquindo 3000, Piso 20',
        id_codtelefono: 56,
        telefono: '+56 2 584 9000',
        email: 'info@kinrossgold.cl',
        sitio_web: 'https://www.kinrossgold.com',
        descripcion: 'Kinross Gold es una empresa minera canadiense con operaciones en Chile.',
        rut: '91.774.000-3',
        representante_legal: 'Paul Rollinson',
        rut_representante_legal: '12.453.234-2',
        id_comuna: 1 // Santiago
    },
    {
        nombre: 'Teck Resources',
        direccion: 'Av. Apoquindo 3800, Piso 18',
        id_codtelefono: 56,
        telefono: '+56 2 584 7000',
        email: 'contacto@teck.com',
        sitio_web: 'https://www.teck.com',
        descripcion: 'Teck Resources es una empresa minera canadiense diversificada con operaciones en Chile.',
        rut: '91.533.000-2',
        representante_legal: 'Don Lindsay',
        rut_representante_legal: '12.453.234-2',
        id_comuna: 1 // Santiago
    },
    {
        nombre: 'Barrick Gold',
        direccion: 'Av. Apoquindo 4501, Piso 11',
        id_codtelefono: 56,
        telefono: '+56 2 584 3000',
        email: 'info@barrickgold.cl',
        sitio_web: 'https://www.barrickgold.com',
        descripcion: 'Barrick Gold es la mayor empresa minera de oro del mundo.',
        rut: '91.724.000-8',
        representante_legal: 'Mark Bristow',
        rut_representante_legal: '12.453.234-2',
        id_comuna: 1 // Santiago
    }
    // Puedes seguir agregando más organizaciones si lo deseas
];

module.exports = { organizationsDummy };
