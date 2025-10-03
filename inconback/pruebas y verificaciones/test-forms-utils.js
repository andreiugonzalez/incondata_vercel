const express = require('express');
const { body, validationResult } = require('express-validator');

// Datos de prueba con caracteres especiales
const testData = {
    // Datos de usuario
    user: {
        names: 'José Joaquín',
        apellido_p: 'Núñez',
        apellido_m: 'Peña',
        email: 'jose.nuñez@example.com',
        password: 'Contraseña123!',
        rut: '12.345.678-9',
        telefono: '+56912345678',
        direccion: 'Calle Las Niñas 123, Viña del Mar',
        username: 'jnuñez',
        genero: 'Masculino',
        fecha_de_nacimiento: '1990-01-01'
    },
    
    // Datos de proyecto
    project: {
        nombre: 'Construcción Túnel El Niño',
        descripcion: 'Proyecto de construcción del túnel en la región de Ñuble',
        ubicacion: 'Región de Ñuble, Chile',
        fecha_inicio: '2024-01-01',
        fecha_fin: '2025-12-31'
    },
    
    // Datos de organización
    organization: {
        nombre: 'Constructora Los Ñandúes',
        descripcion: 'Empresa líder en construcción',
        direccion: 'Avenida España 123, Viña del Mar',
        telefono: '+56912345678'
    },
    
    // Datos de documento
    document: {
        nombre: 'Informe Técnico Año 2024',
        descripcion: 'Análisis técnico de la construcción del túnel',
        tipo: 'Informe Técnico',
        ubicacion: 'Región de Ñuble'
    }
};

// Expresiones regulares para validación
const validationPatterns = {
    // Permite letras (incluyendo ñ, acentos), espacios y guiones
    name: /^[a-zA-ZáéíóúüÁÉÍÓÚÜñÑ\s-]+$/,
    
    // Permite letras, números, espacios y caracteres especiales comunes
    text: /^[a-zA-ZáéíóúüÁÉÍÓÚÜñÑ0-9\s.,;:¿?¡!@#$%&*()-_+=]+$/,
    
    // Permite solo números y guiones (para RUT)
    rut: /^[0-9.-]+$/,
    
    // Permite letras, números y caracteres especiales comunes para direcciones
    address: /^[a-zA-ZáéíóúüÁÉÍÓÚÜñÑ0-9\s.,#-]+$/
};

// Función para crear una aplicación Express de prueba
const createTestApp = () => {
    const app = express();
    app.use(express.json());
    return app;
};

// Función para crear validadores de campo
const createFieldValidator = (fieldName, pattern, errorMessage) => {
    return body(fieldName)
        .matches(pattern)
        .withMessage(errorMessage);
};

// Función para ejecutar una prueba de validación
const runValidationTest = async (app, route, data, validators) => {
    // Agregar ruta de prueba con los validadores
    app.post(route, validators, (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        res.json({ success: true, data: req.body });
    });

    // Realizar la petición de prueba
    const response = await fetch(`http://localhost:3333${route}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    return await response.json();
};

module.exports = {
    testData,
    validationPatterns,
    createTestApp,
    createFieldValidator,
    runValidationTest
};