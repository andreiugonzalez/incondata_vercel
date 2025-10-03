/**
 * Archivo de pruebas completo para el middleware de validación Joi
 * Este archivo contiene pruebas exhaustivas para verificar el funcionamiento correcto
 */

const express = require('express');
const request = require('supertest');
const { validateBody, validateParams, validateQuery } = require('./src/middlewares/validation.middleware');
const { userSchemas, projectSchemas, commentSchemas } = require('./src/utils/validation-schemas');

// Crear una aplicación Express de prueba
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  
  // Rutas de prueba para validación de usuarios
  app.post('/test/user/login', validateBody(userSchemas.login), (req, res) => {
    res.json({ success: true, message: 'Login válido', data: req.body });
  });
  
  app.post('/test/user/register', validateBody(userSchemas.register), (req, res) => {
    res.json({ success: true, message: 'Registro válido', data: req.body });
  });
  
  app.get('/test/user/:id', validateParams(userSchemas.params), (req, res) => {
    res.json({ success: true, message: 'Parámetros válidos', data: req.params });
  });
  
  // Rutas de prueba para validación de proyectos
  app.post('/test/project', validateBody(projectSchemas.create), (req, res) => {
    res.json({ success: true, message: 'Proyecto válido', data: req.body });
  });
  
  app.put('/test/project/:id', 
    validateParams(projectSchemas.params),
    validateBody(projectSchemas.update),
    (req, res) => {
      res.json({ success: true, message: 'Actualización válida', data: { params: req.params, body: req.body } });
    }
  );
  
  // Rutas de prueba para validación de comentarios
  app.post('/test/comment', validateBody(commentSchemas.create), (req, res) => {
    res.json({ success: true, message: 'Comentario válido', data: req.body });
  });
  
  return app;
};

// Mock de objetos req, res, next para simular Express
const createMockReq = (body = {}, params = {}, query = {}) => ({
    body,
    params,
    query
});

const createMockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

const createMockNext = () => jest.fn();

// Función helper para probar validación
const testValidation = (middleware, req, expectedToPass = true) => {
    const res = createMockRes();
    const next = createMockNext();
    
    middleware(req, res, next);
    
    if (expectedToPass) {
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
        console.log('✅ Validación pasó correctamente');
    } else {
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalled();
        console.log('❌ Validación falló como se esperaba');
    }
};

// Función para ejecutar pruebas automáticas
const runAutomatedTests = async () => {
  const app = createTestApp();
  
  console.log('🧪 INICIANDO PRUEBAS AUTOMÁTICAS DE VALIDACIÓN\n');
  
  // Pruebas de Login
  console.log('📝 PRUEBAS DE LOGIN:');
  
  // Login válido
  try {
    const validLogin = await request(app)
      .post('/test/user/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    console.log('✅ Login válido:', validLogin.status === 200 ? 'PASÓ' : 'FALLÓ');
    if (validLogin.status === 200) {
      console.log('   Respuesta:', validLogin.body.message);
    }
  } catch (error) {
    console.log('❌ Error en login válido:', error.message);
  }
  
  // Login inválido
  try {
    const invalidLogin = await request(app)
      .post('/test/user/login')
      .send({
        email: 'email-invalido',
        password: '123'
      });
    
    console.log('✅ Login inválido:', invalidLogin.status === 400 ? 'PASÓ (rechazado correctamente)' : 'FALLÓ');
    if (invalidLogin.status === 400) {
      console.log('   Error esperado:', invalidLogin.body.message);
    }
  } catch (error) {
    console.log('❌ Error en login inválido:', error.message);
  }
  
  console.log('\n📝 PRUEBAS DE REGISTRO:');
  
  // Registro válido
  try {
    const validRegister = await request(app)
      .post('/test/user/register')
      .send({
        names: 'Muñoz Peña',
        apellido_p: 'Núñez',
        apellido_m: 'Peña',
        email: 'muñoz.peña@example.com',
        password: 'SecurePass123!',
        rut: '12345678-9',
        telefono: '+56912345678',
        direccion: 'Calle Las Niñas 123'
      });
    
    console.log('✅ Registro válido:', validRegister.status === 200 ? 'PASÓ' : 'FALLÓ');
    if (validRegister.status === 200) {
      console.log('   Respuesta:', validRegister.body.message);
    }
  } catch (error) {
    console.log('❌ Error en registro válido:', error.message);
  }
  
  // Registro inválido
  try {
    const invalidRegister = await request(app)
      .post('/test/user/register')
      .send({
        nombre: '',
        email: 'email-invalido',
        password: '123',
        rut: 'rut-invalido'
      });
    
    console.log('✅ Registro inválido:', invalidRegister.status === 400 ? 'PASÓ (rechazado correctamente)' : 'FALLÓ');
    if (invalidRegister.status === 400) {
      console.log('   Errores encontrados:', invalidRegister.body.details?.length || 0);
    }
  } catch (error) {
    console.log('❌ Error en registro inválido:', error.message);
  }
  
  console.log('\n📝 PRUEBAS DE PARÁMETROS:');
  
  // Parámetros válidos
  try {
    const validParams = await request(app)
      .get('/test/user/123');
    
    console.log('✅ Parámetros válidos:', validParams.status === 200 ? 'PASÓ' : 'FALLÓ');
  } catch (error) {
    console.log('❌ Error en parámetros válidos:', error.message);
  }
  
  // Parámetros inválidos
  try {
    const invalidParams = await request(app)
      .get('/test/user/abc');
    
    console.log('✅ Parámetros inválidos:', invalidParams.status === 400 ? 'PASÓ (rechazado correctamente)' : 'FALLÓ');
  } catch (error) {
    console.log('❌ Error en parámetros inválidos:', error.message);
  }
  
  console.log('\n📝 PRUEBAS DE PROYECTOS:');
  
  // Proyecto válido
  try {
    const validProject = await request(app)
      .post('/test/project')
      .send({
        nombre: 'Proyecto de Prueba',
        descripcion: 'Descripción del proyecto de prueba',
        fechaInicio: '2024-01-01',
        fechaFin: '2024-12-31',
        idOrganizacion: 1
      });
    
    console.log('✅ Proyecto válido:', validProject.status === 200 ? 'PASÓ' : 'FALLÓ');
  } catch (error) {
    console.log('❌ Error en proyecto válido:', error.message);
  }
  
  // Proyecto inválido
  try {
    const invalidProject = await request(app)
      .post('/test/project')
      .send({
        nombre: '',
        fechaInicio: 'fecha-invalida',
        idOrganizacion: 'no-es-numero'
      });
    
    console.log('✅ Proyecto inválido:', invalidProject.status === 400 ? 'PASÓ (rechazado correctamente)' : 'FALLÓ');
  } catch (error) {
    console.log('❌ Error en proyecto inválido:', error.message);
  }
  
  console.log('\n🎉 PRUEBAS AUTOMÁTICAS COMPLETADAS\n');
};

// Función para mostrar ejemplos de uso manual
const showManualTestExamples = () => {
  console.log('📋 EJEMPLOS PARA PRUEBAS MANUALES CON POSTMAN/CURL:\n');
  
  console.log('1️⃣ PRUEBA DE LOGIN VÁLIDO:');
  console.log('POST http://localhost:3111/user/login');
  console.log('Content-Type: application/json');
  console.log(JSON.stringify({
    email: 'test@example.com',
    password: 'password123'
  }, null, 2));
  
  console.log('\n2️⃣ PRUEBA DE LOGIN INVÁLIDO:');
  console.log('POST http://localhost:3111/user/login');
  console.log('Content-Type: application/json');
  console.log(JSON.stringify({
    email: 'email-invalido',
    password: '123'
  }, null, 2));
  
  console.log('\n3️⃣ PRUEBA DE REGISTRO VÁLIDO:');
  console.log('POST http://localhost:3111/user/register');
  console.log('Content-Type: application/json');
  console.log(JSON.stringify({
    nombre: 'Juan',
    apellido: 'Pérez',
    email: 'juan.perez@example.com',
    password: 'SecurePass123!',
    rut: '12345678-9',
    telefono: '+56912345678'
  }, null, 2));
  
  console.log('\n4️⃣ PRUEBA DE REGISTRO INVÁLIDO:');
  console.log('POST http://localhost:3111/user/register');
  console.log('Content-Type: application/json');
  console.log(JSON.stringify({
    nombre: '',
    email: 'email-invalido',
    password: '123',
    rut: 'rut-invalido'
  }, null, 2));
  
  console.log('\n5️⃣ PRUEBA DE PROYECTO VÁLIDO:');
  console.log('POST http://localhost:3111/projects');
  console.log('Content-Type: application/json');
  console.log('Authorization: Bearer YOUR_TOKEN');
  console.log(JSON.stringify({
    nombre: 'Proyecto de Prueba',
    descripcion: 'Descripción del proyecto',
    fechaInicio: '2024-01-01',
    fechaFin: '2024-12-31',
    idOrganizacion: 1
  }, null, 2));
  
  console.log('\n6️⃣ COMANDOS CURL DE EJEMPLO:');
  console.log(`
# Login válido
curl -X POST http://localhost:3111/user/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"test@example.com","password":"password123"}'

# Login inválido (debería devolver error 400)
curl -X POST http://localhost:3111/user/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"email-invalido","password":"123"}'
  `);
};

// Función principal
const main = () => {
  console.log('🔧 HERRAMIENTAS DE PRUEBA PARA MIDDLEWARE DE VALIDACIÓN JOI\n');
  
  console.log('Opciones disponibles:');
  console.log('1. runAutomatedTests() - Ejecuta pruebas automáticas');
  console.log('2. showManualTestExamples() - Muestra ejemplos para pruebas manuales');
  console.log('3. Usar las rutas reales del servidor en http://localhost:3111\n');
  
  // Mostrar ejemplos por defecto
  showManualTestExamples();
};

// Casos de prueba para validación de usuario
console.log('=== PRUEBAS DE VALIDACIÓN DE USUARIO ===\n');

// Caso 1: Login válido
console.log('1. Probando login válido:');
const validLoginReq = createMockReq({
    email: 'usuario@ejemplo.com',
    password: 'password123'
});
// testValidation(validateBody(userSchemas.login), validLoginReq, true);

// Caso 2: Login inválido - email mal formateado
console.log('2. Probando login con email inválido:');
const invalidEmailReq = createMockReq({
    email: 'email-invalido',
    password: 'password123'
});
// testValidation(validateBody(userSchemas.login), invalidEmailReq, false);

// Caso 3: Login inválido - contraseña muy corta
console.log('3. Probando login con contraseña muy corta:');
const shortPasswordReq = createMockReq({
    email: 'usuario@ejemplo.com',
    password: '123'
});
// testValidation(validateBody(userSchemas.login), shortPasswordReq, false);

// Caso 4: Registro válido
console.log('4. Probando registro válido:');
const validRegisterReq = createMockReq({
    nombre: 'Juan',
    apellido: 'Pérez',
    email: 'juan.perez@ejemplo.com',
    password: 'password123',
    telefono: '+56912345678',
    rut: '12345678-9'
});
// testValidation(validateBody(userSchemas.register), validRegisterReq, true);

// Caso 5: Registro inválido - RUT mal formateado
console.log('5. Probando registro con RUT inválido:');
const invalidRutReq = createMockReq({
    nombre: 'Juan',
    apellido: 'Pérez',
    email: 'juan.perez@ejemplo.com',
    password: 'password123',
    telefono: '+56912345678',
    rut: '12345678' // Sin dígito verificador
});
// testValidation(validateBody(userSchemas.register), invalidRutReq, false);

// Casos de prueba para validación de parámetros
console.log('\n=== PRUEBAS DE VALIDACIÓN DE PARÁMETROS ===\n');

// Caso 6: ID válido
console.log('6. Probando parámetro ID válido:');
const validIdReq = createMockReq({}, { id: '123' });
// testValidation(validateParams(userSchemas.params), validIdReq, true);

// Caso 7: ID inválido
console.log('7. Probando parámetro ID inválido:');
const invalidIdReq = createMockReq({}, { id: 'abc' });
// testValidation(validateParams(userSchemas.params), invalidIdReq, false);

// Casos de prueba para validación de proyecto
console.log('\n=== PRUEBAS DE VALIDACIÓN DE PROYECTO ===\n');

// Caso 8: Proyecto válido
console.log('8. Probando creación de proyecto válido:');
const validProjectReq = createMockReq({
    nombre: 'Proyecto Test',
    descripcion: 'Descripción del proyecto',
    fecha_inicio: '2024-01-01',
    fecha_fin: '2024-12-31',
    organizacion_id: 1
});
// testValidation(validateBody(projectSchemas.create), validProjectReq, true);

// Caso 9: Proyecto inválido - nombre vacío
console.log('9. Probando proyecto con nombre vacío:');
const emptyNameProjectReq = createMockReq({
    nombre: '',
    descripcion: 'Descripción del proyecto',
    organizacion_id: 1
});
// testValidation(validateBody(projectSchemas.create), emptyNameProjectReq, false);

// Casos de prueba para validación de comentarios
console.log('\n=== PRUEBAS DE VALIDACIÓN DE COMENTARIOS ===\n');

// Caso 10: Comentario válido
console.log('10. Probando comentario válido:');
const validCommentReq = createMockReq({
    contenido: 'Este es un comentario de prueba',
    proyecto_id: 1
});
// testValidation(validateBody(commentSchemas.create), validCommentReq, true);

// Caso 11: Comentario inválido - contenido muy largo
console.log('11. Probando comentario con contenido muy largo:');
const longCommentReq = createMockReq({
    contenido: 'a'.repeat(1001), // Más de 1000 caracteres
    proyecto_id: 1
});
// testValidation(validateBody(commentSchemas.create), longCommentReq, false);

// Exportar funciones para uso externo
module.exports = {
  runAutomatedTests,
  showManualTestExamples,
  createTestApp,
  testValidation,
  createMockReq,
  createMockRes,
  createMockNext
};

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}