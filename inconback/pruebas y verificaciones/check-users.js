require('dotenv').config();
const { sequelize } = require('../src/config/sequelize-config');

async function checkUsers() {
    try {
        console.log('🔍 Verificando usuarios en la base de datos...');
        
        // Conectar a la base de datos
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos establecida correctamente.');

        // Obtener todos los usuarios
        const User = sequelize.models.User;
        const users = await User.findAll({
            attributes: ['id', 'email', 'rut', 'names', 'organizacionid'],
            include: [
                {
                    model: sequelize.models.Organizacion,
                    as: 'organizacion',
                    attributes: ['id', 'nombre'],
                    required: false
                }
            ]
        });

        console.log(`\n📊 Total de usuarios encontrados: ${users.length}`);
        
        if (users.length === 0) {
            console.log('❌ No hay usuarios en la base de datos');
        } else {
            console.log('\n👥 Lista de usuarios:');
            users.forEach((user, index) => {
                console.log(`\n${index + 1}. Usuario:`);
                console.log(`   - ID: ${user.id}`);
                console.log(`   - Email: ${user.email}`);
                console.log(`   - RUT: ${user.rut}`);
                console.log(`   - Nombre: ${user.names}`);
                console.log(`   - Organización ID: ${user.organizacionid}`);
                if (user.organizacion) {
                    console.log(`   - Organización: ${user.organizacion.nombre}`);
                } else {
                    console.log(`   - Organización: No asignada`);
                }
            });
        }

        // Verificar específicamente el usuario admin
        const adminUser = await User.findOne({
            where: { email: 'admin1@gmail.com' }
        });

        console.log(`\n🔍 Usuario admin (admin1@gmail.com): ${adminUser ? 'ENCONTRADO' : 'NO ENCONTRADO'}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await sequelize.close();
        console.log('\n🔒 Conexión a la base de datos cerrada.');
    }
}

checkUsers();