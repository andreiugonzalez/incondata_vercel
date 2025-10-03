'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

    await queryInterface.sequelize.query(`
      ALTER TABLE historico_partida ALTER COLUMN id_historico SET NOT NULL;
      ALTER SEQUENCE historico_partida_id_historico_seq OWNED BY historico_partida.id_historico;
      ALTER TABLE historico_partida ALTER COLUMN id_historico SET DEFAULT nextval('historico_partida_id_historico_seq');
      ALTER TABLE historico_partida ADD PRIMARY KEY (id_historico);
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE historico_subpartida ALTER COLUMN id_historico SET NOT NULL;
      ALTER SEQUENCE historico_subpartida_id_historico_seq OWNED BY historico_subpartida.id_historico;
      ALTER TABLE historico_subpartida ALTER COLUMN id_historico SET DEFAULT nextval('historico_subpartida_id_historico_seq');
      ALTER TABLE historico_subpartida ADD PRIMARY KEY (id_historico);
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE historico_task ALTER COLUMN id_historico SET NOT NULL;
      ALTER SEQUENCE historico_task_id_historico_seq OWNED BY historico_task.id_historico;
      ALTER TABLE historico_task ALTER COLUMN id_historico SET DEFAULT nextval('historico_task_id_historico_seq');
      ALTER TABLE historico_task ADD PRIMARY KEY (id_historico);
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE historico_subtask ALTER COLUMN id_historico SET NOT NULL;
      ALTER SEQUENCE historico_subtask_id_historico_seq OWNED BY historico_subtask.id_historico;
      ALTER TABLE historico_subtask ALTER COLUMN id_historico SET DEFAULT nextval('historico_subtask_id_historico_seq');
      ALTER TABLE historico_subtask ADD PRIMARY KEY (id_historico);
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Remover la clave primaria y el autoincremento
    await queryInterface.sequelize.query(`
      ALTER TABLE historico_partida DROP CONSTRAINT historico_partida_pkey;
      ALTER TABLE historico_partida ALTER COLUMN id_historico DROP DEFAULT;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE historico_subpartida DROP CONSTRAINT historico_subpartida_pkey;
      ALTER TABLE historico_subpartida ALTER COLUMN id_historico DROP DEFAULT;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE historico_task DROP CONSTRAINT historico_task_pkey;
      ALTER TABLE historico_task ALTER COLUMN id_historico DROP DEFAULT;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE historico_subtask DROP CONSTRAINT historico_subtask_pkey;
      ALTER TABLE historico_subtask ALTER COLUMN id_historico DROP DEFAULT;
    `);
  }
};
