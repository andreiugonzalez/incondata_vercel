require('dotenv').config();
const { sequelize, Rol, User, UserRol } = require('./src/config/sequelize-config');

async function testRolesAndUsers() {
    try {
        console.log('=== VERIFICANDO ROLES EN LA BASE DE DATOS ===');
        
        // Verificar roles existentes
        const roles = await Rol.findAll({
            attributes: ['id', 'name']
        });
        
        console.log(`\n✅ Roles encontrados (${roles.length}):`);
        roles.forEach(role => {
            console.log(`- ID: ${role.id}, Nombre: ${role.name}`);
        });
        
        console.log('\n=== VERIFICANDO USUARIOS ===');
        
        // Verificar usuarios existentes
        const users = await User.findAll({
            attributes: ['id', 'names', 'apellido_p', 'apellido_m', 'email']
        });
        
        console.log(`\n✅ Usuarios encontrados (${users.length}):`);
        users.forEach(user => {
            console.log(`- ID: ${user.id}, Nombre: ${user.names} ${user.apellido_p} ${user.apellido_m}, Email: ${user.email}`);
        });
        
        console.log('\n=== VERIFICANDO RELACIONES USUARIO-ROL ===');
        
        // Verificar relaciones usuario-rol directamente desde la tabla user_rol
        const userRoles = await UserRol.findAll({
            attributes: ['id', 'userId', 'rolId']
        });
        
        console.log(`\n✅ Relaciones Usuario-Rol encontradas (${userRoles.length}):`);
        
        // Para cada relación, obtener los datos del usuario y rol
        for (const ur of userRoles) {
            const user = await User.findByPk(ur.userId, {
                attributes: ['id', 'names', 'apellido_p', 'apellido_m']
            });
            const rol = await Rol.findByPk(ur.rolId, {
                attributes: ['id', 'name']
            });
            
            if (user && rol) {
                console.log(`- Usuario: ${user.names} ${user.apellido_p} -> Rol: ${rol.name}`);
            }
        }
        
        console.log('\n=== VERIFICANDO USUARIOS POR ROL ESPECÍFICO ===');
        
        const rolesEspecificos = ['inspector', 'planner', 'ITO', 'supervisor', 'administrador de contrato', 'prevencionista'];
        
        for (const rolName of rolesEspecificos) {
            const usersWithRole = await User.findAll({
                include: [
                    {
                        model: Rol,
                        as: "roles",
                        where: { name: rolName },
                        attributes: [],
                        through: {
                            attributes: [],
                        },
                    },
                ],
                attributes: ["id", "names", "apellido_p", "apellido_m"],
            });
            
            console.log(`\n${rolName}: ${usersWithRole.length} usuarios`);
            usersWithRole.forEach(user => {
                console.log(`  - ${user.names} ${user.apellido_p} ${user.apellido_m}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        await sequelize.close();
    }
}

testRolesAndUsers();