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
}, { tableName: 'Project' });

const Mine = sequelize.define('Mine', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING },
}, { tableName: 'Mine' });

async function listItems() {
    try {
        console.log('Conectando a la base de datos...');
        await sequelize.authenticate();
        console.log('✅ Conexión exitosa a la base de datos');

        // 1. Listar todos los proyectos
        console.log('\n1. Listando todos los proyectos...');
        
        const allProjects = await Project.findAll({
            attributes: ['id', 'nombre']
        });

        console.log(`Total de proyectos encontrados: ${allProjects.length}`);
        
        if (allProjects.length > 0) {
            allProjects.forEach(project => {
                console.log(`- ID: ${project.id}, Nombre: "${project.nombre}"`);
            });
        } else {
            console.log('No se encontraron proyectos en la base de datos');
        }

        // 2. Listar todas las minas
        console.log('\n2. Listando todas las minas...');
        
        const allMines = await Mine.findAll({
            attributes: ['id', 'name']
        });

        console.log(`Total de minas encontradas: ${allMines.length}`);
        
        if (allMines.length > 0) {
            allMines.forEach(mine => {
                console.log(`- ID: ${mine.id}, Nombre: "${mine.name}"`);
            });
        } else {
            console.log('No se encontraron minas en la base de datos');
        }

        console.log('\n✅ Listado completado');
        
    } catch (error) {
        console.error('❌ Error durante el listado:', error);
    } finally {
        await sequelize.close();
        console.log('Conexión a la base de datos cerrada');
    }
}

listItems();