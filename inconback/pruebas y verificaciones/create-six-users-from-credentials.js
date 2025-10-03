const { Sequelize } = require('sequelize');
const bcrypt = require('bcrypt');

// Configuración de la base de datos (usa las mismas credenciales del script existente)
const sequelize = new Sequelize('incondata_demo', 'usr_prac2025', 'Usr*2025.', {
  host: '52.22.171.179',
  port: 5432,
  dialect: 'postgres',
  logging: false
});

// Usuarios exactos según usuarios-prueba-credenciales.md
const testUsers = [
  { role: 'superadmin', email: 'gerardo.incondata@gmail.com', password: 'superadmin2024', rut: '23.460.750-2', names: 'Gerardo', apellido_p: 'Gonzalez', apellido_m: 'Araya', username: 'Gerardo' },
  { role: 'superintendente', email: 'carlos.gonzalez@incondata.cl', password: 'Super2024!', rut: '12345678-9', names: 'Carlos', apellido_p: 'González', apellido_m: 'Pérez', username: 'cgonzalez' },
  { role: 'admin', email: 'maria.rodriguez@incondata.cl', password: 'Admin2024!', rut: '23456789-0', names: 'María', apellido_p: 'Rodríguez', apellido_m: 'Silva', username: 'mrodriguez' },
  { role: 'supervisor', email: 'juan.martinez@incondata.cl', password: 'Supervisor2024!', rut: '34567890-1', names: 'Juan', apellido_p: 'Martínez', apellido_m: 'López', username: 'jmartinez' },
  { role: 'ITO', email: 'ana.fernandez@incondata.cl', password: 'ITO2024!', rut: '45678901-2', names: 'Ana', apellido_p: 'Fernández', apellido_m: 'García', username: 'afernandez' },
  { role: 'proyectista', email: 'laura.torres@incondata.cl', password: 'Proyectista2024!', rut: '67890123-4', names: 'Laura', apellido_p: 'Torres', apellido_m: 'Herrera', username: 'ltorres' },
];

async function ensureRoles(roleNames) {
  for (const roleName of roleNames) {
    const [role] = await sequelize.query(
      'SELECT id FROM "rol" WHERE name = :roleName',
      { replacements: { roleName }, type: Sequelize.QueryTypes.SELECT }
    );
    if (!role) {
      await sequelize.query(
        'INSERT INTO "rol" ("name", "createdAt", "updatedAt") VALUES (:roleName, NOW(), NOW())',
        { replacements: { roleName }, type: Sequelize.QueryTypes.INSERT }
      );
      console.log(`🆕 Rol creado: ${roleName}`);
    }
  }
}

async function getRoleId(roleName) {
  const [role] = await sequelize.query(
    'SELECT id FROM "rol" WHERE name = :roleName',
    { replacements: { roleName }, type: Sequelize.QueryTypes.SELECT }
  );
  return role ? role.id : null;
}

async function userExists(email, rut) {
  const [existingUser] = await sequelize.query(
    'SELECT id FROM "user" WHERE rut = :rut OR email = :email',
    { replacements: { rut, email }, type: Sequelize.QueryTypes.SELECT }
  );
  return !!existingUser;
}

async function createUser(userData) {
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  const [insertResult] = await sequelize.query(
    `INSERT INTO "user" (
      names, apellido_p, apellido_m, email, "hashedPassword", rut, username,
      genero, fecha_de_nacimiento, telefono, direccion, codigo_postal,
      organizacionid, puesto, "ID_comuna", id_salud, id_estado_cuenta,
      id_estado_civil, id_cod_telf, id_afp, id_grupo, id_puesto,
      urifolder, storage_limit, "createdAt", "updatedAt"
    ) VALUES (
      :names, :apellido_p, :apellido_m, :email, :hashedPassword, :rut, :username,
      :genero, :fecha_de_nacimiento, :telefono, :direccion, :codigo_postal,
      :organizacionid, :puesto, :ID_comuna, :id_salud, :id_estado_cuenta,
      :id_estado_civil, :id_cod_telf, :id_afp, :id_grupo, :id_puesto,
      :urifolder, :storage_limit, NOW(), NOW()
    ) RETURNING id`,
    {
      replacements: {
        names: userData.names,
        apellido_p: userData.apellido_p,
        apellido_m: userData.apellido_m,
        email: userData.email,
        hashedPassword,
        rut: userData.rut,
        username: userData.username,
        genero: userData.genero || null,
        fecha_de_nacimiento: userData.fecha_de_nacimiento || null,
        telefono: userData.telefono || null,
        direccion: userData.direccion || null,
        codigo_postal: userData.codigo_postal || null,
        organizacionid: null,
        puesto: userData.puesto || null,
        ID_comuna: userData.ID_comuna || 1,
        id_salud: 1,
        id_estado_cuenta: 1,
        id_estado_civil: 1,
        id_cod_telf: 56,
        id_afp: 1,
        id_grupo: 1,
        id_puesto: 1,
        urifolder: `encrypted_folder_${String(userData.rut).replace('-', '_')}`,
        storage_limit: 10737418240,
      },
      type: Sequelize.QueryTypes.INSERT,
    }
  );

  return insertResult[0].id;
}

async function assignRole(userId, rolId) {
  await sequelize.query(
    'INSERT INTO "user_rol" ("userId", "rolId", "createdAt", "updatedAt") VALUES (:userId, :rolId, NOW(), NOW())',
    { replacements: { userId, rolId }, type: Sequelize.QueryTypes.INSERT }
  );
}

async function run() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a la base de datos');

    const rolesToEnsure = [...new Set(testUsers.map(u => u.role))];
    await ensureRoles(rolesToEnsure);

    for (const u of testUsers) {
      console.log(`\n🔄 Procesando: ${u.email} (${u.role})`);
      if (await userExists(u.email, u.rut)) {
        console.log(`⚠️  Usuario ya existe, omitido: ${u.email}`);
        continue;
      }

      const rolId = await getRoleId(u.role);
      if (!rolId) {
        console.log(`❌ Rol no encontrado: ${u.role}`);
        continue;
      }

      const userId = await createUser(u);
      await assignRole(userId, rolId);
      console.log(`✅ Usuario creado: ${u.email} con rol ${u.role}`);
    }

    console.log('\n🎉 ¡Usuarios creados según credenciales!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

run();