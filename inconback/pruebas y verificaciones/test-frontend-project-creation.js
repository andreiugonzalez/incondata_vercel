const axios = require('axios');

// Configuración
const BACKEND_URL = 'http://localhost:3111';
const ADMIN_CREDENTIALS = {
    email: 'adminpro@gmail.com',
    password: 'contra1234'
};

// Datos del proyecto de prueba
const PROJECT_DATA = {
    nombre: 'Proyecto Frontend Test',
    ubicacion: 'Ubicación Test',
    codigo_bip: 'BIP-TEST-001',
    unidad_tecnica: 'Unidad Test',
    contratista: [{ value: 1, label: 'Contratista Test' }],
    supervisor: [{ value: 1, label: 'Supervisor Test' }],
    superintendente: [{ value: 1, label: 'Superintendente Test' }],
    rut_unidad_tecnica: '12345678-9',
    rut_empresa: '87654321-0',
    presupuesto: 1000000,
    duenio: 'Dueño Test',
    monto_neto: 900000,
    monto_total_bruto: 1070000,
    monto_mensual: 100000,
    total_general: 1070000,
    localizacion_mina: 'Localización Test',
    fecha_inicio: '2024-01-01',
    fecha_termino: '2024-12-31',
    estado: 1,
    mina: 1,
    avance: 0
};

async function testFrontendProjectCreation() {
    console.log('🧪 Iniciando prueba de creación de proyecto desde frontend...\n');

    try {
        // 1. Login para obtener token
        console.log('1️⃣ Realizando login...');
        const loginResponse = await axios.post(`${BACKEND_URL}/login`, ADMIN_CREDENTIALS);
        
        if (loginResponse.data.statusCode !== 200) {
            throw new Error(`Login falló: ${loginResponse.data.message}`);
        }
        
        const token = loginResponse.data.data.token;
        console.log('✅ Login exitoso');
        console.log('Token obtenido:', token.substring(0, 20) + '...\n');

        // 2. Simular la estructura de datos que envía el frontend
        console.log('2️⃣ Preparando datos del proyecto...');
        const proyecto = {
            nombre: PROJECT_DATA.nombre,
            ubicacion: PROJECT_DATA.ubicacion,
            codigo_bip: PROJECT_DATA.codigo_bip,
            unidad_tecnica: PROJECT_DATA.unidad_tecnica,
            contratista: PROJECT_DATA.contratista,
            supervisor: PROJECT_DATA.supervisor,
            superintendente: PROJECT_DATA.superintendente,
            rut_unidad_tecnica: PROJECT_DATA.rut_unidad_tecnica,
            rut_empresa: PROJECT_DATA.rut_empresa,
            presupuesto: PROJECT_DATA.presupuesto,
            duenio: PROJECT_DATA.duenio,
            monto_neto: PROJECT_DATA.monto_neto,
            monto_total_bruto: PROJECT_DATA.monto_total_bruto,
            monto_mensual: PROJECT_DATA.monto_mensual,
            total_general: PROJECT_DATA.total_general,
            localizacion_mina: PROJECT_DATA.localizacion_mina,
            fecha_inicio: PROJECT_DATA.fecha_inicio,
            fecha_termino: PROJECT_DATA.fecha_termino,
            id_estadoproyecto: PROJECT_DATA.estado,
            id_mina: PROJECT_DATA.mina,
            informador: 'Test User',
            avance: PROJECT_DATA.avance
        };

        console.log('Datos del proyecto preparados:');
        console.log(JSON.stringify(proyecto, null, 2));
        console.log();

        // 3. Enviar petición como lo hace el frontend
        console.log('3️⃣ Enviando petición de creación de proyecto...');
        const projectResponse = await axios.post(
            `${BACKEND_URL}/projects`,
            { proyecto: proyecto },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        console.log('✅ Proyecto creado exitosamente!');
        console.log('Respuesta del servidor:');
        console.log('Status:', projectResponse.status);
        console.log('Data:', JSON.stringify(projectResponse.data, null, 2));

        if (projectResponse.data.data && projectResponse.data.data.idproject) {
            console.log(`\n🎉 Proyecto creado con ID: ${projectResponse.data.data.idproject}`);
        }

    } catch (error) {
        console.error('❌ Error durante la prueba:');
        
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Headers:', error.response.headers);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.error('No se recibió respuesta del servidor');
            console.error('Request:', error.request);
        } else {
            console.error('Error:', error.message);
        }
        
        console.error('Stack:', error.stack);
    }
}

// Función para verificar conectividad
async function checkConnectivity() {
    console.log('🔧 Verificando conectividad...\n');
    
    try {
        const healthResponse = await axios.get(`${BACKEND_URL}/health`, { timeout: 5000 });
        console.log('✅ Backend accesible');
        return true;
    } catch (error) {
        console.log('❌ Backend no accesible');
        console.log('Error:', error.message);
        return false;
    }
}

// Ejecutar pruebas
async function runTests() {
    console.log('🚀 Iniciando pruebas de creación de proyecto frontend\n');
    console.log('=' .repeat(60));
    
    const isConnected = await checkConnectivity();
    if (!isConnected) {
        console.log('\n⚠️  No se puede continuar sin conectividad al backend');
        return;
    }
    
    console.log('\n' + '=' .repeat(60));
    await testFrontendProjectCreation();
    console.log('\n' + '=' .repeat(60));
    console.log('🏁 Pruebas completadas');
}

runTests();