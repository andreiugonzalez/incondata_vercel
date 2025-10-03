#!/usr/bin/env node
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { sequelize } = require('../src/config/sequelize-config');
const OrganizacionRepository = require('../src/repositories/organizacion.repository');
const { Op } = require('sequelize');

function log(msg) {
  const logsDir = path.join(__dirname, '..', 'logs');
  fs.mkdirSync(logsDir, { recursive: true });
  const logFile = path.join(logsDir, 'eliminaciones-organizaciones.log');
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  fs.appendFileSync(logFile, line);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { dryRun: false };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--dry-run') opts.dryRun = true;
    else if (a === '--id') opts.id = parseInt(args[++i], 10);
    else if (a === '--nombre') opts.nombre = args[++i];
    else if (a === '--rut') opts.rut = args[++i];
    else if (a === '--all') opts.all = true;
  }
  return opts;
}

async function findOrganizations(opts) {
  const Org = sequelize.models.Organizacion;
  if (opts.id) return await Org.findAll({ where: { id: opts.id } });
  if (opts.nombre) return await Org.findAll({ where: { nombre: { [Op.iLike]: `%${opts.nombre}%` } } });
  if (opts.rut) return await Org.findAll({ where: { rut: { [Op.iLike]: `%${opts.rut}%` } } });
  if (opts.all) return await Org.findAll();
  throw new Error('Debe especificar --id, --nombre, --rut o --all');
}

async function main() {
  const opts = parseArgs();
  console.log('🔧 Opciones:', opts);
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida.');

    const orgs = await findOrganizations(opts);
    if (!orgs || orgs.length === 0) {
      console.log('❌ No se encontraron organizaciones para los criterios proporcionados.');
      return;
    }

    console.log(`📊 Organizaciones encontradas: ${orgs.length}`);
    orgs.forEach(o => console.log(`- ID: ${o.id}, Nombre: ${o.nombre}, RUT: ${o.rut}`));

    if (opts.dryRun) {
      console.log('🧪 Modo simulación activo. No se realizarán eliminaciones.');
      return;
    }

    for (const org of orgs) {
      console.log(`🗑️ Eliminando organización ID ${org.id} (${org.nombre})...`);
      await OrganizacionRepository.deleteOrganizacionDeep(org.id);
      log(`Eliminada organización ID ${org.id} (${org.nombre})`);
    }

    console.log('✅ Eliminación completada.');
  } catch (error) {
    console.error('❌ Error:', error.message || error);
  } finally {
    await sequelize.close();
    console.log('🔒 Conexión cerrada.');
  }
}

main();