require('dotenv').config();
const { sequelize } = require('../src/config/sequelize-config');

async function checkOrganizations() {
    try {
        console.log('🔍 Verificando organizaciones en la base de datos...');
        
        // Conectar a la base de datos
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos establecida correctamente.');

        // Obtener todas las organizaciones
        const Organizacion = sequelize.models.Organizacion;
        const organizations = await Organizacion.findAll({
            attributes: ['id', 'nombre', 'rut', 'email']
        });

        console.log(`\n📊 Total de organizaciones encontradas: ${organizations.length}`);
        
        if (organizations.length === 0) {
            console.log('❌ No hay organizaciones en la base de datos');
            console.log('💡 Esto explica por qué falla la creación del usuario admin');
        } else {
            console.log('\n🏢 Lista de organizaciones:');
            organizations.forEach((org, index) => {
                console.log(`\n${index + 1}. Organización:`);
                console.log(`   - ID: ${org.id}`);
                console.log(`   - Nombre: ${org.nombre}`);
                console.log(`   - RUT: ${org.rut}`);
                console.log(`   - Email: ${org.email}`);
            });
        }

        // Verificar específicamente la organización con ID 1
        const org1 = await Organizacion.findOne({
            where: { id: 1 }
        });

        console.log(`\n🔍 Organización ID 1: ${org1 ? 'ENCONTRADA' : 'NO ENCONTRADA'}`);
        if (org1) {
            console.log(`   - Nombre: ${org1.nombre}`);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await sequelize.close();
        console.log('\n🔒 Conexión a la base de datos cerrada.');
    }
}

checkOrganizations();