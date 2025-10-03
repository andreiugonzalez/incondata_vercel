require('dotenv').config();
const { sequelize } = require('../src/config/sequelize-config');
const bcrypt = require('bcryptjs');

async function testAdminLogin() {
    try {
        console.log('🔍 Probando login del usuario admin...');
        
        // Conectar a la base de datos
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos establecida correctamente.');

        // Buscar el usuario admin
        const User = sequelize.models.User;
        const adminUser = await User.findOne({
            where: { email: 'admin1@gmail.com' },
            include: [
                {
                    model: sequelize.models.Organizacion,
                    as: 'organizacion',
                    attributes: ['id', 'nombre']
                }
            ]
        });

        if (!adminUser) {
            console.log('❌ Usuario admin no encontrado');
            return;
        }

        console.log('✅ Usuario admin encontrado:');
        console.log('- ID:', adminUser.id);
        console.log('- Email:', adminUser.email);
        console.log('- RUT:', adminUser.rut);
        console.log('- Organización ID:', adminUser.organizacionid);
        
        if (adminUser.organizacion) {
            console.log('- Organización:', adminUser.organizacion.nombre);
        } else {
            console.log('❌ No se encontró la organización asociada');
        }

        // Probar la contraseña
        const passwordMatch = await bcrypt.compare('admin123', adminUser.hashedPassword);
        console.log('- Contraseña válida:', passwordMatch ? '✅' : '❌');

        // Verificar si organizacionid es null o undefined
        if (!adminUser.organizacionid) {
            console.log('❌ PROBLEMA: organizacionid es null o undefined');
            console.log('Esto causará el error "ID de organización no encontrado para el usuario"');
        } else {
            console.log('✅ organizacionid está presente:', adminUser.organizacionid);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await sequelize.close();
        console.log('🔒 Conexión a la base de datos cerrada.');
    }
}

testAdminLogin();