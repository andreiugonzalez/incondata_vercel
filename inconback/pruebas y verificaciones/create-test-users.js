const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

// Configuración de la base de datos
const sequelize = new Sequelize('incondata_demo', 'usr_prac2025', 'Usr*2025.', {
  host: '52.22.171.179',
  port: 5432,
  dialect: 'postgres',
  logging: false
});

// Definir modelos
const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  names: DataTypes.STRING,
  apellido_p: DataTypes.STRING,
  apellido_m: DataTypes.STRING,
  email: { type: DataTypes.STRING, unique: true },
  hashedPassword: DataTypes.STRING,
  genero: DataTypes.STRING,
  fecha_de_nacimiento: DataTypes.DATE,
  telefono: DataTypes.INTEGER,
  direccion: DataTypes.STRING,
  codigo_postal: DataTypes.INTEGER,
  rut: DataTypes.STRING,
  organizacionid: DataTypes.INTEGER,
  username: DataTypes.STRING,
  puesto: DataTypes.STRING,
  ultimo_acceso: DataTypes.DATEONLY,
  id_estado_cuenta: DataTypes.INTEGER,
  ID_comuna: DataTypes.INTEGER,
  id_salud: DataTypes.INTEGER,
  id_estado_civil: DataTypes.INTEGER,
  id_cod_telf: DataTypes.INTEGER,
  id_afp: DataTypes.INTEGER,
  id_grupo: DataTypes.INTEGER,
  id_puesto: DataTypes.INTEGER,
  urifolder: DataTypes.STRING,
  storage_limit: DataTypes.BIGINT,
  replacedByUserId: DataTypes.INTEGER
}, { tableName: 'user' });

const Rol = sequelize.define('Rol', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: DataTypes.STRING
}, { tableName: 'rol' });

const UserRol = sequelize.define('user_rol', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: DataTypes.INTEGER,
  rolId: DataTypes.INTEGER
}, { tableName: 'user_rol' });

// Datos de usuarios de prueba con RUTs reales
const testUsers = [
  {
    role: 'superintendente',
    rut: '12345678-9',
    names: 'Carlos',
    apellido_p: 'González',
    apellido_m: 'Pérez',
    email: 'carlos.gonzalez@incondata.cl',
    password: 'Super2024!',
    genero: 'Masculino',
    fecha_de_nacimiento: '1975-03-15',
    telefono: 912345001,
    direccion: 'Av. Providencia 1234, Santiago',
    codigo_postal: 7500000,
    puesto: 'Superintendente Municipal',
    username: 'cgonzalez',
    organizacionid: 1,
    ID_comuna: 1,
    id_salud: 1,
    id_estado_cuenta: 1,
    id_estado_civil: 1,
    id_cod_telf: 56,
    id_afp: 1,
    id_grupo: 1,
    id_puesto: 1
  },
  {
    role: 'admin',
    rut: '23456789-0',
    names: 'María',
    apellido_p: 'Rodríguez',
    apellido_m: 'Silva',
    email: 'maria.rodriguez@incondata.cl',
    password: 'Admin2024!',
    genero: 'Femenino',
    fecha_de_nacimiento: '1980-07-22',
    telefono: 912345002,
    direccion: 'Calle Las Condes 567, Las Condes',
    codigo_postal: 7550000,
    puesto: 'Administrador de Sistema',
    username: 'mrodriguez',
    organizacionid: 1,
    ID_comuna: 2,
    id_salud: 1,
    id_estado_cuenta: 1,
    id_estado_civil: 2,
    id_cod_telf: 56,
    id_afp: 1,
    id_grupo: 1,
    id_puesto: 2
  },
  {
    role: 'supervisor',
    rut: '34567890-1',
    names: 'Juan',
    apellido_p: 'Martínez',
    apellido_m: 'López',
    email: 'juan.martinez@incondata.cl',
    password: 'Supervisor2024!',
    genero: 'Masculino',
    fecha_de_nacimiento: '1978-11-10',
    telefono: 912345003,
    direccion: 'Av. Libertador 890, Vitacura',
    codigo_postal: 7630000,
    puesto: 'Director de Obras',
    username: 'jmartinez',
    organizacionid: 1,
    ID_comuna: 3,
    id_salud: 1,
    id_estado_cuenta: 1,
    id_estado_civil: 1,
    id_cod_telf: 56,
    id_afp: 1,
    id_grupo: 1,
    id_puesto: 3
  },
  {
    role: 'ITO',
    rut: '45678901-2',
    names: 'Ana',
    apellido_p: 'Fernández',
    apellido_m: 'García',
    email: 'ana.fernandez@incondata.cl',
    password: 'ITO2024!',
    genero: 'Femenino',
    fecha_de_nacimiento: '1985-05-18',
    telefono: 912345004,
    direccion: 'Calle Ñuñoa 123, Ñuñoa',
    codigo_postal: 7750000,
    puesto: 'Inspector Técnico de Obras',
    username: 'afernandez',
    organizacionid: 1,
    ID_comuna: 4,
    id_salud: 1,
    id_estado_cuenta: 1,
    id_estado_civil: 1,
    id_cod_telf: 56,
    id_afp: 1,
    id_grupo: 1,
    id_puesto: 4
  },
  {
    role: 'contratista',
    rut: '56789012-3',
    names: 'Pedro',
    apellido_p: 'Sánchez',
    apellido_m: 'Morales',
    email: 'pedro.sanchez@incondata.cl',
    password: 'Contratista2024!',
    genero: 'Masculino',
    fecha_de_nacimiento: '1982-09-25',
    telefono: 912345005,
    direccion: 'Av. Maipú 456, Maipú',
    codigo_postal: 9250000,
    puesto: 'Contratista General',
    username: 'psanchez',
    organizacionid: 1,
    ID_comuna: 5,
    id_salud: 1,
    id_estado_cuenta: 1,
    id_estado_civil: 2,
    id_cod_telf: 56,
    id_afp: 1,
    id_grupo: 1,
    id_puesto: 5
  },
  {
    role: 'proyectista',
    rut: '67890123-4',
    names: 'Laura',
    apellido_p: 'Torres',
    apellido_m: 'Herrera',
    email: 'laura.torres@incondata.cl',
    password: 'Proyectista2024!',
    genero: 'Femenino',
    fecha_de_nacimiento: '1987-12-03',
    telefono: 912345006,
    direccion: 'Calle San Miguel 789, San Miguel',
    codigo_postal: 8900000,
    puesto: 'Proyectista',
    username: 'ltorres',
    organizacionid: 1,
    ID_comuna: 6,
    id_salud: 1,
    id_estado_cuenta: 1,
    id_estado_civil: 1,
    id_cod_telf: 56,
    id_afp: 1,
    id_grupo: 1,
    id_puesto: 6
  },
  {
    role: 'prevencionista',
    rut: '78901234-5',
    names: 'Roberto',
    apellido_p: 'Vargas',
    apellido_m: 'Castillo',
    email: 'roberto.vargas@incondata.cl',
    password: 'Prevencionista2024!',
    genero: 'Masculino',
    fecha_de_nacimiento: '1983-04-14',
    telefono: 912345007,
    direccion: 'Av. Pudahuel 321, Pudahuel',
    codigo_postal: 9020000,
    puesto: 'Prevencionista de Riesgos',
    username: 'rvargas',
    organizacionid: 1,
    ID_comuna: 7,
    id_salud: 1,
    id_estado_cuenta: 1,
    id_estado_civil: 2,
    id_cod_telf: 56,
    id_afp: 1,
    id_grupo: 1,
    id_puesto: 7
  },
  {
    role: 'planner',
    rut: '89012345-6',
    names: 'Carmen',
    apellido_p: 'Jiménez',
    apellido_m: 'Rojas',
    email: 'carmen.jimenez@incondata.cl',
    password: 'Planner2024!',
    genero: 'Femenino',
    fecha_de_nacimiento: '1986-08-27',
    telefono: 912345008,
    direccion: 'Calle Peñalolén 654, Peñalolén',
    codigo_postal: 7910000,
    puesto: 'Planificador de Proyectos',
    username: 'cjimenez',
    organizacionid: 1,
    ID_comuna: 8,
    id_salud: 1,
    id_estado_cuenta: 1,
    id_estado_civil: 1,
    id_cod_telf: 56,
    id_afp: 1,
    id_grupo: 1,
    id_puesto: 8
  },
  {
    role: 'inspector',
    rut: '90123456-7',
    names: 'Diego',
    apellido_p: 'Muñoz',
    apellido_m: 'Pinto',
    email: 'diego.munoz@incondata.cl',
    password: 'Inspector2024!',
    genero: 'Masculino',
    fecha_de_nacimiento: '1984-01-19',
    telefono: 912345009,
    direccion: 'Av. La Florida 987, La Florida',
    codigo_postal: 8240000,
    puesto: 'Inspector de Calidad',
    username: 'dmunoz',
    organizacionid: 1,
    ID_comuna: 9,
    id_salud: 1,
    id_estado_cuenta: 1,
    id_estado_civil: 1,
    id_cod_telf: 56,
    id_afp: 1,
    id_grupo: 1,
    id_puesto: 9
  }
];

async function createTestUsers() {
    try {
        console.log('🔄 Conectando a la base de datos...');
        await sequelize.authenticate();
        console.log('✅ Conexión exitosa a la base de datos');

        for (const userData of testUsers) {
            console.log(`\n🔄 Creando usuario: ${userData.names} ${userData.apellido_p} (${userData.role})`);
            
            // Verificar si el usuario ya existe
            const [existingUser] = await sequelize.query(
                'SELECT id FROM "user" WHERE rut = :rut OR email = :email',
                {
                    replacements: { rut: userData.rut, email: userData.email },
                    type: Sequelize.QueryTypes.SELECT
                }
            );

            if (existingUser) {
                console.log(`⚠️  Usuario ya existe: ${userData.email}`);
                continue;
            }

            // Obtener el ID del rol
            const [role] = await sequelize.query(
                'SELECT id FROM "rol" WHERE name = :roleName',
                {
                    replacements: { roleName: userData.role },
                    type: Sequelize.QueryTypes.SELECT
                }
            );

            if (!role) {
                console.log(`❌ Rol no encontrado: ${userData.role}`);
                continue;
            }

            // Encriptar contraseña
            const hashedPassword = await bcrypt.hash(userData.password, 10);

            // Crear usuario con todos los campos requeridos
            const [newUserResult] = await sequelize.query(
                `INSERT INTO "user" (
                    names, apellido_p, apellido_m, email, "hashedPassword", genero, 
                    fecha_de_nacimiento, telefono, direccion, codigo_postal, rut, 
                    organizacionid, username, puesto, "ID_comuna", id_salud, 
                    id_estado_cuenta, id_estado_civil, id_cod_telf, id_afp, 
                    id_grupo, id_puesto, urifolder, storage_limit, "createdAt", "updatedAt"
                ) VALUES (
                    :names, :apellido_p, :apellido_m, :email, :hashedPassword, :genero,
                    :fecha_de_nacimiento, :telefono, :direccion, :codigo_postal, :rut,
                    :organizacionid, :username, :puesto, :ID_comuna, :id_salud,
                    :id_estado_cuenta, :id_estado_civil, :id_cod_telf, :id_afp,
                    :id_grupo, :id_puesto, :urifolder, :storage_limit, NOW(), NOW()
                ) RETURNING id`,
                {
                    replacements: {
                        rut: userData.rut,
                        names: userData.names,
                        apellido_p: userData.apellido_p,
                        apellido_m: userData.apellido_m,
                        email: userData.email,
                        hashedPassword: hashedPassword,
                        genero: userData.genero,
                        fecha_de_nacimiento: userData.fecha_de_nacimiento,
                        telefono: userData.telefono,
                        direccion: userData.direccion,
                        codigo_postal: userData.codigo_postal,
                        organizacionid: userData.organizacionid,
                        username: userData.username,
                        puesto: userData.puesto,
                        ID_comuna: userData.ID_comuna,
                        id_salud: userData.id_salud,
                        id_estado_cuenta: userData.id_estado_cuenta,
                        id_estado_civil: userData.id_estado_civil,
                        id_cod_telf: userData.id_cod_telf,
                        id_afp: userData.id_afp,
                        id_grupo: userData.id_grupo,
                        id_puesto: userData.id_puesto,
                        urifolder: `encrypted_folder_${userData.rut.replace('-', '_')}`,
                        storage_limit: 10737418240
                    },
                    type: Sequelize.QueryTypes.INSERT
                }
            );

            const newUserId = newUserResult[0].id;

            // Asignar rol al usuario
            await sequelize.query(
                `INSERT INTO "user_rol" ("userId", "rolId", "createdAt", "updatedAt") 
                 VALUES (:userId, :rolId, NOW(), NOW())`,
                {
                    replacements: {
                        userId: newUserId,
                        rolId: role.id
                    },
                    type: Sequelize.QueryTypes.INSERT
                }
            );

            console.log(`✅ Usuario creado exitosamente: ${userData.email} con rol ${userData.role}`);
        }

        console.log('\n🎉 ¡Todos los usuarios de prueba han sido creados exitosamente!');
        
    } catch (error) {
        console.error('❌ Error al crear usuarios de prueba:', error);
    } finally {
        await sequelize.close();
    }
}

// Ejecutar el script
createTestUsers();