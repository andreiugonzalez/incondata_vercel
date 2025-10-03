require('dotenv').config();
const { sequelize, User, Rol, UserRol } = require('./src/config/sequelize-config');
const bcrypt = require('bcrypt');

async function createUsersWithRoles() {
    try {
        console.log('=== CREANDO USUARIOS CON ROLES ESPECÍFICOS ===');
        
        // Usuarios a crear con sus roles
        const usuariosACrear = [
            {
                names: 'Pedro',
                apellido_p: 'Inspector',
                apellido_m: 'Calidad',
                email: 'pedro.inspector@incondata.cl',
                username: 'pinspector',
                rut: '12.345.678-9',
                roleName: 'inspector'
            },
            {
                names: 'Sofia',
                apellido_p: 'Planner',
                apellido_m: 'Proyectos',
                email: 'sofia.planner@incondata.cl',
                username: 'splanner',
                rut: '98.765.432-1',
                roleName: 'planner'
            },
            {
                names: 'Roberto',
                apellido_p: 'Prevencion',
                apellido_m: 'Riesgos',
                email: 'roberto.prevencion@incondata.cl',
                username: 'rprevencion',
                rut: '11.222.333-4',
                roleName: 'prevencionista'
            },
            {
                names: 'Carmen',
                apellido_p: 'Admin',
                apellido_m: 'Contrato',
                email: 'carmen.admin@incondata.cl',
                username: 'cadmin',
                rut: '55.666.777-8',
                roleName: 'administrador de contrato'
            }
        ];
        
        const password = 'Incondata2024!';
        const hashedPassword = await bcrypt.hash(password, 10);
        
        for (const userData of usuariosACrear) {
            // Verificar si el usuario ya existe
            const existingUser = await User.findOne({
                where: { email: userData.email }
            });
            
            if (existingUser) {
                console.log(`⚠️ El usuario ${userData.email} ya existe`);
                continue;
            }
            
            // Buscar el rol
            const rol = await Rol.findOne({
                where: { name: userData.roleName }
            });
            
            if (!rol) {
                console.log(`❌ El rol "${userData.roleName}" no existe`);
                continue;
            }
            
            // Crear el usuario
            const newUser = await User.create({
                names: userData.names,
                apellido_p: userData.apellido_p,
                apellido_m: userData.apellido_m,
                email: userData.email,
                username: userData.username,
                rut: userData.rut,
                hashedPassword: hashedPassword,
                isActive: true,
                isTemporaryPassword: false
            });
            
            // Asignar el rol al usuario
            await UserRol.create({
                userId: newUser.id,
                rolId: rol.id
            });
            
            console.log(`✅ Usuario creado: ${userData.names} ${userData.apellido_p} con rol "${userData.roleName}"`);
        }
        
        console.log('\n=== VERIFICANDO USUARIOS POR ROL ===');
        
        const rolesEspecificos = ['inspector', 'planner', 'prevencionista', 'administrador de contrato'];
        
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
                attributes: ["id", "names", "apellido_p", "apellido_m", "email"],
            });
            
            console.log(`\n${rolName}: ${usersWithRole.length} usuarios`);
            usersWithRole.forEach(user => {
                console.log(`  - ${user.names} ${user.apellido_p} ${user.apellido_m} (${user.email})`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        await sequelize.close();
    }
}

createUsersWithRoles();