require('dotenv').config();
const { Sequelize } = require('sequelize');

// Configurar Sequelize directamente
const sequelize = new Sequelize(
    process.env.CONSTRUAPP_PSQL_BD,
    process.env.CONSTRUAPP_PSQL_USER,
    process.env.CONSTRUAPP_PSQL_PASSWORD,
    {
        host: process.env.CONSTRUAPP_PSQL_HOST,
        port: process.env.CONSTRUAPP_PSQL_PORT,
        dialect: 'postgres',
        logging: false
    }
);

// Definir modelos básicos
const Project = sequelize.define('Project', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: Sequelize.STRING },
    id_mina: { type: Sequelize.INTEGER },
}, { tableName: 'Project' });

const Mine = sequelize.define('Mine', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING },
    id_usuario: { type: Sequelize.INTEGER },
}, { tableName: 'Mine' });

const UserProject = sequelize.define('user_project', {
    userId: { type: Sequelize.INTEGER },
    projectId: { type: Sequelize.INTEGER },
}, { tableName: 'user_project' });

async function deleteItems() {
    try {
        console.log('Conectando a la base de datos...');
        await sequelize.authenticate();
        console.log('✅ Conexión exitosa a la base de datos');

        // 1. Buscar y eliminar proyectos
        console.log('\n1. Buscando proyectos a eliminar...');
        
        const projectsToDelete = await Project.findAll({
            where: {
                nombre: ['Boton De Caca', 'Zapato']
            },
            attributes: ['id', 'nombre']
        });

        console.log(`Proyectos encontrados: ${projectsToDelete.length}`);
        
        for (const project of projectsToDelete) {
            console.log(`- ID: ${project.id}, Nombre: ${project.nombre}`);
            
            // Eliminar relaciones en user_project primero
            await UserProject.destroy({
                where: { projectId: project.id }
            });
            console.log(`  ✅ Relaciones user_project eliminadas para proyecto ${project.id}`);
            
            // Eliminar el proyecto
            await Project.destroy({
                where: { id: project.id }
            });
            console.log(`  ✅ Proyecto "${project.nombre}" eliminado`);
        }

        // 2. Buscar y eliminar mina
        console.log('\n2. Buscando mina a eliminar...');
        
        const mineToDelete = await Mine.findOne({
            where: {
                name: 'Boton De Caca'
            },
            attributes: ['id', 'name']
        });

        if (mineToDelete) {
            console.log(`Mina encontrada: ID: ${mineToDelete.id}, Nombre: ${mineToDelete.name}`);
            
            // Verificar si hay proyectos asociados a esta mina
            const associatedProjects = await Project.findAll({
                where: { id_mina: mineToDelete.id },
                attributes: ['id', 'nombre']
            });
            
            if (associatedProjects.length > 0) {
                console.log(`⚠️  Hay ${associatedProjects.length} proyectos asociados a esta mina:`);
                associatedProjects.forEach(p => console.log(`  - ${p.nombre} (ID: ${p.id})`));
                console.log('No se puede eliminar la mina hasta que se eliminen estos proyectos.');
            } else {
                // No hay relaciones User_mine separadas, la relación es directa a través de id_usuario
                console.log(`  ✅ No hay relaciones separadas que eliminar para mina ${mineToDelete.id}`);
                
                // Eliminar la mina
                await Mine.destroy({
                    where: { id: mineToDelete.id }
                });
                console.log(`  ✅ Mina "${mineToDelete.name}" eliminada`);
            }
        } else {
            console.log('❌ No se encontró la mina "Boton De Caca"');
        }

        console.log('\n✅ Proceso de eliminación completado');
        
    } catch (error) {
        console.error('❌ Error durante el proceso de eliminación:', error);
    } finally {
        await sequelize.close();
        console.log('Conexión a la base de datos cerrada');
    }
}

deleteItems();