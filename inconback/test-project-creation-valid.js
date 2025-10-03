const axios = require('axios');

const BASE_URL = 'http://localhost:3111';

// Usuario de prueba (superadmin)
const testUser = {
    email: 'gerardo.incondata@gmail.com',  // Email correcto según la base de datos
    password: 'superadmin2024'  // Contraseña que funcionó en el test anterior
};

// Datos de proyecto válidos según el esquema de validación
const validProjectData = {
    // Campos requeridos
    nombre: 'Proyecto de Prueba Validación',
    organizacion_id: 1, // ID de organización válido
    
    // Campos opcionales con datos válidos
    descripcion: 'Proyecto creado para probar la validación de datos',
    fecha_inicio: '2025-01-01T00:00:00.000Z',
    fecha_fin: '2025-12-31T23:59:59.000Z',
    fecha_termino: '2025-12-31T23:59:59.000Z',
    ubicacion: 'Santiago, Chile',
    codigo_bip: 12345,
    unidad_tecnica: 'Unidad Técnica de Prueba',
    supervisor: 'Juan Supervisor',
    superintendente: 'Pedro Superintendente',
    rut_unidad_tecnica: '12.345.678-9',
    rut_empresa: '98.765.432-1',
    presupuesto: 1000000.50,
    duenio: 'Empresa Dueña',
    monto_neto: 850000.00,
    monto_total_bruto: 1000000.00,
    monto_mensual: 100000.00,
    total_general: 1200000.00,
    localizacion_mina: 'Región Metropolitana',
    informador: 'María Informadora',
    id_estadoproyecto: 1, // ID válido de estado de proyecto
    id_mina: 32, // ID válido de mina (Mina El Chiflon)
    avance: 0,
    mina_id: 32, // ID válido de mina (Mina El Chiflon)
    activo: true
};

async function testProjectCreation() {
    try {
        console.log('🔐 Iniciando sesión con usuario Gerardo...');
        
        // 1. Login
        const loginResponse = await axios.post(`${BASE_URL}/login`, testUser);
        
        if (loginResponse.status === 200 && loginResponse.data.data && loginResponse.data.data.token) {
            console.log('✅ Login exitoso');
            console.log('Usuario:', loginResponse.data.data.user.names);
            console.log('Roles:', loginResponse.data.data.user.roles);
            
            const token = loginResponse.data.data.token;
            
            console.log('\n📋 Datos del proyecto a crear:');
            console.log(JSON.stringify(validProjectData, null, 2));
            
            // 2. Crear proyecto con datos válidos
            console.log('\n🏗️ Creando proyecto con datos válidos...');
            const projectResponse = await axios.post(
                `${BASE_URL}/projects`,
                validProjectData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            if (projectResponse.status === 201) {
                console.log('✅ Proyecto creado exitosamente!');
                console.log('Proyecto ID:', projectResponse.data.id);
                console.log('Nombre:', projectResponse.data.nombre);
                console.log('Organización ID:', projectResponse.data.organizacion_id);
            }
            
        } else {
            console.log('❌ Error en login:', loginResponse.data);
        }
        
    } catch (error) {
        console.log('❌ Error durante la prueba:');
        
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Mensaje:', error.response.data.message || error.response.data);
            
            if (error.response.data.errors) {
                console.log('Errores de validación:');
                error.response.data.errors.forEach((err, index) => {
                    console.log(`  ${index + 1}. Campo: ${err.field || 'N/A'}`);
                    console.log(`     Mensaje: ${err.message || err}`);
                    console.log(`     Valor: ${err.value || 'N/A'}`);
                });
            }
        } else {
            console.log('Error de conexión:', error.message);
        }
    }
}

// Ejecutar la prueba
console.log('🧪 Iniciando prueba de creación de proyecto con datos válidos...\n');
testProjectCreation();