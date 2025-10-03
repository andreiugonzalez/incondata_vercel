const { Sequelize } = require('sequelize');
const config = require('./config/config.json');

const sequelize = new Sequelize(config.development);

async function updateSuperadminEmail() {
    try {
        await sequelize.authenticate();
        console.log('Conexión establecida correctamente.');
        
        const [results] = await sequelize.query(`
            UPDATE "user" 
            SET email = 'superadmin@sistema.com' 
            WHERE username = 'superadmin'
        `);
        
        console.log('Email del superadmin actualizado exitosamente');
        
        // Verificar el cambio
        const [user] = await sequelize.query(`
            SELECT username, email FROM "user" WHERE username = 'superadmin'
        `);
        
        console.log('Datos actualizados:', user[0]);
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

updateSuperadminEmail();