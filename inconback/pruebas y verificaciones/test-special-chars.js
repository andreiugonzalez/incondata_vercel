const { body, validationResult } = require('express-validator');
const express = require('express');

// Crear una aplicación Express de prueba
const app = express();
app.use(express.json());

// Middleware de validación
const validateUser = [
    body('names')
        .matches(/^[a-zA-ZáéíóúüÁÉÍÓÚÜñÑ\s-]+$/)
        .withMessage('El nombre solo puede contener letras y espacios'),
    body('apellido_p')
        .matches(/^[a-zA-ZáéíóúüÁÉÍÓÚÜñÑ\s-]+$/)
        .withMessage('El apellido paterno solo puede contener letras y espacios'),
    body('apellido_m')
        .matches(/^[a-zA-ZáéíóúüÁÉÍÓÚÜñÑ\s-]+$/)
        .withMessage('El apellido materno solo puede contener letras y espacios'),
    body('direccion')
        .matches(/^[a-zA-ZáéíóúüÁÉÍÓÚÜñÑ0-9\s.,#-]+$/)
        .withMessage('La dirección contiene caracteres no permitidos')
];

// Ruta de prueba
app.post('/test/register', validateUser, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    res.json({ message: 'Validación exitosa', data: req.body });
});

// Iniciar el servidor
const server = app.listen(3333, () => {
    console.log('Servidor de prueba iniciado en el puerto 3333');
    
    // Realizar la prueba
    const testData = {
        names: 'Muñoz Peña',
        apellido_p: 'Núñez',
        apellido_m: 'Peña',
        direccion: 'Calle Las Niñas 123'
    };

    fetch('http://localhost:3333/test/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(testData)
    })
    .then(response => response.json())
    .then(result => {
        console.log('Resultado de la prueba:', result);
        if (result.errors) {
            console.log('❌ La validación falló:', result.errors);
        } else {
            console.log('✅ La validación fue exitosa');
        }
    })
    .catch(error => {
        console.error('Error en la prueba:', error);
    })
    .finally(() => {
        server.close(() => {
            console.log('Servidor de prueba cerrado');
            process.exit(0);
        });
    });
});