require('dotenv').config();
const { sequelize, Rol } = require('./src/config/sequelize-config');

async function createMissingRoles() {
    try {
        console.log('=== CREANDO ROLES FALTANTES ===');
        
        const rolesFaltantes = ['inspector', 'planner', 'prevencionista'];
        
        for (const roleName of rolesFaltantes) {
            // Verificar si el rol ya existe
            const existingRole = await Rol.findOne({
                where: { name: roleName }
            });
            
            if (existingRole) {
                console.log(`✅ El rol "${roleName}" ya existe (ID: ${existingRole.id})`);
            } else {
                // Crear el rol
                const newRole = await Rol.create({
                    name: roleName
                });
                console.log(`✅ Rol "${roleName}" creado exitosamente (ID: ${newRole.id})`);
            }
        }
        
        console.log('\n=== VERIFICANDO TODOS LOS ROLES ===');
        const allRoles = await Rol.findAll({
            attributes: ['id', 'name'],
            order: [['id', 'ASC']]
        });
        
        console.log(`\n✅ Total de roles en la base de datos: ${allRoles.length}`);
        allRoles.forEach(role => {
            console.log(`- ID: ${role.id}, Nombre: ${role.name}`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        await sequelize.close();
    }
}

createMissingRoles();