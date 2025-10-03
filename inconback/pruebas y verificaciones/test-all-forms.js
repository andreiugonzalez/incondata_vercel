const {
    testData,
    validationPatterns,
    createTestApp,
    createFieldValidator,
    runValidationTest
} = require('./test-forms-utils');

// Crear aplicación de prueba
const app = createTestApp();
const server = app.listen(3333);

// Pruebas para cada formulario
async function runAllTests() {
    try {
        console.log('🧪 Iniciando pruebas de validación de formularios\n');

        // 1. Prueba del formulario de registro de usuario
        console.log('1️⃣ Probando formulario de registro de usuario:');
        const userValidators = [
            createFieldValidator('names', validationPatterns.name, 'El nombre solo puede contener letras y espacios'),
            createFieldValidator('apellido_p', validationPatterns.name, 'El apellido paterno solo puede contener letras y espacios'),
            createFieldValidator('apellido_m', validationPatterns.name, 'El apellido materno solo puede contener letras y espacios'),
            createFieldValidator('direccion', validationPatterns.address, 'La dirección contiene caracteres no permitidos')
        ];
        const userResult = await runValidationTest(app, '/test/user', testData.user, userValidators);
        console.log(userResult.success ? '✅ Prueba de usuario exitosa' : '❌ Prueba de usuario fallida', userResult);

        // 2. Prueba del formulario de proyecto
        console.log('\n2️⃣ Probando formulario de proyecto:');
        const projectValidators = [
            createFieldValidator('nombre', validationPatterns.text, 'El nombre del proyecto contiene caracteres no permitidos'),
            createFieldValidator('descripcion', validationPatterns.text, 'La descripción contiene caracteres no permitidos'),
            createFieldValidator('ubicacion', validationPatterns.address, 'La ubicación contiene caracteres no permitidos')
        ];
        const projectResult = await runValidationTest(app, '/test/project', testData.project, projectValidators);
        console.log(projectResult.success ? '✅ Prueba de proyecto exitosa' : '❌ Prueba de proyecto fallida', projectResult);

        // 3. Prueba del formulario de organización
        console.log('\n3️⃣ Probando formulario de organización:');
        const orgValidators = [
            createFieldValidator('nombre', validationPatterns.text, 'El nombre de la organización contiene caracteres no permitidos'),
            createFieldValidator('descripcion', validationPatterns.text, 'La descripción contiene caracteres no permitidos'),
            createFieldValidator('direccion', validationPatterns.address, 'La dirección contiene caracteres no permitidos')
        ];
        const orgResult = await runValidationTest(app, '/test/organization', testData.organization, orgValidators);
        console.log(orgResult.success ? '✅ Prueba de organización exitosa' : '❌ Prueba de organización fallida', orgResult);

        // 4. Prueba del formulario de documento
        console.log('\n4️⃣ Probando formulario de documento:');
        const docValidators = [
            createFieldValidator('nombre', validationPatterns.text, 'El nombre del documento contiene caracteres no permitidos'),
            createFieldValidator('descripcion', validationPatterns.text, 'La descripción contiene caracteres no permitidos'),
            createFieldValidator('ubicacion', validationPatterns.address, 'La ubicación contiene caracteres no permitidos')
        ];
        const docResult = await runValidationTest(app, '/test/document', testData.document, docValidators);
        console.log(docResult.success ? '✅ Prueba de documento exitosa' : '❌ Prueba de documento fallida', docResult);

    } catch (error) {
        console.error('❌ Error en las pruebas:', error);
    } finally {
        server.close(() => {
            console.log('\n🏁 Pruebas completadas');
            process.exit(0);
        });
    }
}

// Ejecutar todas las pruebas
runAllTests();