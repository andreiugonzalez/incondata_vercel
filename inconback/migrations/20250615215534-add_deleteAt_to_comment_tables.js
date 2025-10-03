// En el archivo de migración generado (ej: XXXXXX-add_deletedAt_to_comment_tables.js)
"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        "Comment",
        "deletedAt",
        {
          // Tabla 'Comment'
          type: Sequelize.DATE,
          allowNull: true,
        },
        { transaction },
      );
      await queryInterface.addColumn(
        "Comment_subpartida",
        "deletedAt",
        {
          // Tabla 'CommentSubpartida'
          type: Sequelize.DATE,
          allowNull: true,
        },
        { transaction },
      );
      await queryInterface.addColumn(
        "Comment_tarea",
        "deletedAt",
        {
          // Tabla 'CommentTarea'
          type: Sequelize.DATE,
          allowNull: true,
        },
        { transaction },
      );
      await queryInterface.addColumn(
        "Comment_subtarea",
        "deletedAt",
        {
          // Tabla 'CommentSubtarea'
          type: Sequelize.DATE,
          allowNull: true,
        },
        { transaction },
      );
      // Añade más queryInterface.addColumn para otras tablas de comentarios si las tienes.
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn("Comment", "deletedAt", {
        transaction,
      });
      await queryInterface.removeColumn("Comment_subpartida", "deletedAt", {
        transaction,
      });
      await queryInterface.removeColumn("Comment_tarea", "deletedAt", {
        transaction,
      });
      await queryInterface.removeColumn("Comment_subtarea", "deletedAt", {
        transaction,
      });
      // Añade más queryInterface.removeColumn para otras tablas de comentarios si las tienes.
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
