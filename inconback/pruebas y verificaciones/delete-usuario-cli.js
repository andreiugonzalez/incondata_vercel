// CLI para eliminar usuarios por criterios: --email, --username, --rut, --id
// Uso ejemplos:
//  - Dry-run (simulación): node "pruebas y verificaciones/delete-usuario-cli.js" --email=sofia.herrera@incondata.cl --dry-run
//  - Eliminación real:     node "pruebas y verificaciones/delete-usuario-cli.js" --username=sherrera --yes

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { sequelize } = require('../src/config/sequelize-config');
const UserRepository = require('../src/repositories/user.repository');
const { Op } = require('sequelize');

function parseArgs(argv) {
  const args = { dryRun: false, yes: false };
  argv.forEach(arg => {
    if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--yes' || arg === '--confirm') args.yes = true;
    else if (arg.startsWith('--email=')) args.email = arg.split('=')[1];
    else if (arg.startsWith('--username=')) args.username = arg.split('=')[1];
    else if (arg.startsWith('--rut=')) args.rut = arg.split('=')[1];
    else if (arg.startsWith('--id=')) args.id = arg.split('=')[1];
    else if (arg.startsWith('--reason=')) args.reason = arg.split('=')[1];
  });
  return args;
}

function ensureLogDir() {
  const logDir = path.join(__dirname, '..', 'logs');
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
  return path.join(logDir, 'eliminaciones-usuarios.log');
}

function normalizeRut(rut) {
  return (rut || '').replace(/\./g, '').replace(/-/g, '').trim().toLowerCase();
}

async function findUsersByArgs(args) {
  const where = {};
  const attrs = ['id', 'names', 'apellido_p', 'apellido_m', 'email', 'rut', 'username'];

  if (args.id) {
    const ids = args.id.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
    if (ids.length === 0) throw new Error('Sin IDs válidos en --id');
    where.id = { [Op.in]: ids };
  } else if (args.email) {
    const emails = args.email.split(',').map(s => s.trim()).filter(Boolean);
    where[Op.or] = emails.map(e => ({ email: { [Op.iLike]: e } }));
  } else if (args.username) {
    const usernames = args.username.split(',').map(s => s.trim()).filter(Boolean);
    where[Op.or] = usernames.map(u => ({ username: { [Op.iLike]: u } }));
  } else if (args.rut) {
    const normalized = args.rut.split(',').map(normalizeRut).filter(Boolean);
    // Asumimos que la DB guarda rut en formato sin normalizar; comparamos por iLike sobre versión sin símbolos
    // En caso real, podría requerir una columna normalizada; aquí hacemos un filtro simple
    where[Op.or] = normalized.map(r => ({ rut: { [Op.iLike]: r } }));
  } else {
    throw new Error('Debe proporcionar uno de: --email, --username, --rut, --id');
  }

  return await sequelize.models.User.findAll({ where, attributes: attrs });
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  const logPath = ensureLogDir();

  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos OK');

    const usuarios = await findUsersByArgs(args);
    if (usuarios.length === 0) {
      console.log('⚠️ No se encontraron usuarios para los criterios proporcionados');
      return;
    }

    console.log(`🔍 Usuarios encontrados: ${usuarios.length}`);
    usuarios.forEach(u => {
      console.log(` - ID:${u.id} ${u.names} ${u.apellido_p || ''} ${u.apellido_m || ''} | ${u.email || ''} | ${u.rut || ''} | ${u.username || ''}`);
    });

    const entryBase = {
      timestamp: new Date().toISOString(),
      criteria: { id: args.id, email: args.email, username: args.username, rut: args.rut },
      reason: args.reason || null
    };

    if (args.dryRun || !args.yes) {
      console.log('🧪 Modo simulación (dry-run). No se eliminarán usuarios. Use --yes para confirmar.');
      fs.appendFileSync(logPath, JSON.stringify({ ...entryBase, action: 'dry-run', count: usuarios.length, users: usuarios.map(u => ({ id: u.id, email: u.email })) }) + '\n');
      return;
    }

    let ok = 0, fail = 0;
    for (const u of usuarios) {
      try {
        const result = await UserRepository.deleteUser(u.id);
        console.log(`🗑️ Usuario ID ${u.id} eliminado: ${result.message}`);
        fs.appendFileSync(logPath, JSON.stringify({ ...entryBase, action: 'delete', user: { id: u.id, email: u.email, username: u.username } }) + '\n');
        ok++;
      } catch (err) {
        console.error(`❌ Error al eliminar usuario ID ${u.id}:`, err.message);
        fs.appendFileSync(logPath, JSON.stringify({ ...entryBase, action: 'error', user: { id: u.id, email: u.email }, error: err.message }) + '\n');
        fail++;
      }
    }

    console.log(`✅ Eliminación finalizada. Éxitos: ${ok} · Fallos: ${fail}`);
  } catch (error) {
    console.error('❌ Error en el proceso:', error);
  } finally {
    await sequelize.close();
    console.log('🔒 Conexión cerrada');
  }
}

run();