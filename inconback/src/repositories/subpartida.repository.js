const { sequelize } = require('../config/sequelize-config');
const { CustomHttpError } = require('../errors/customError');
const FolderRepository = require('../repositories/folder.repository');

class SubpartidaRepository {


  async createSubpartida(subpartida) {

    // console.log("subpartida es : ", subpartida);
    const projectId = subpartida.id_proyecto;  // Obtener el ID del proyecto desde la subpartida

        // Ahora, creamos la subpartida en la base de datos
        const subpartidaCreated = await sequelize.models.Subpartida.create(subpartida);

        const id_objeto_creado = subpartidaCreated.id_subpartida

        const relacion = subpartidaCreated.id_partida
        const id_user = subpartidaCreated.id_usuario



    // Verificar o crear la carpeta del proyecto y su estructura, especificando que es una 'subpartida'
    const folderId = await FolderRepository.checkAndCreateFolderStructure(projectId, subpartida.nombre_sub_partida, 'subpartida', id_objeto_creado ,relacion , id_user );



    return subpartidaCreated;
}




async updatesubPartida(id, subpartida) {
  // const t = await sequelize.transaction();
  console.log("id sub partida actualizad : ", id);
  console.log("sub partida actualizad : ", subpartida);

  try {
      // let folderUpdated = true;

      // if (subpartida.nombre_sub_partida) {
      //     // Intentamos actualizar las carpetas relacionadas
      //     folderUpdated = await FolderRepository.updateFolderByEntity('subpartida', id, subpartida.nombre_sub_partida);

      //     if (!folderUpdated) {
      //         console.log(`No se actualizó ninguna carpeta para la subpartida ID ${id}. Cancelando la actualización de la subpartida.`);
      //         throw new Error('No se pudo actualizar ninguna carpeta. La actualización de la subpartida ha sido cancelada.');
      //     }

      //     console.log(`Carpetas actualizadas para la subpartida ID ${id} con el nuevo nombre: ${subpartida.nombre_sub_partida}`);
      // }

      // Si la actualización de las carpetas fue exitosa, actualizamos la subpartida
      const updatedRows = await sequelize.models.Subpartida.update(subpartida, {
          where: { id_subpartida: id }
          // transaction: t
      });

      // await t.commit();
      return updatedRows[0] > 0; // devuelve true si se actualizaron filas, false en caso contrario
  } catch (error) {
      // await t.rollback();
      console.error('Error al actualizar subpartida o carpetas en el repositorio:', error);
      throw error; // Lanzar el error
  }
}

async updatesubPartidanewpartida(id, subpartida) {

  try {
      const updatedRows = await sequelize.models.Subpartida.update(subpartida, {
          where: { id_subpartida: id }

      });


      return updatedRows[0] > 0;
  } catch (error) {

      console.error('Error al actualizar subpartida o carpetas en el repositorio:', error);
      throw error;
  }
}






    async getlisthistory() {
      try {

        const subpartida = await sequelize.models.Subpartida.findAll({
          attributes: ['id_subpartida', 'id_EstadoTarea', 'porcentaje', 'fecha_inicio', 'fecha_termino', 'horas_maquina', 'horas_hombre']
        });

        const subpartidaId = subpartida.map(subpart => subpart.id_subpartida);

        const historicos = await sequelize.models.Historico_subpartida.findAll({
          attributes: ['id_EstadoTarea', 'porcentaje', 'fecha_inicio', 'fecha_termino', 'horas_maquina', 'horas_hombre', 'id_subpartida'],
          where: {
            id_subpartida: subpartidaId
          }
        });

        const subpartidasAgrupadas = subpartida.map(subpart => ({
          ...subpart.toJSON(),
          historicos: historicos.filter(historico => historico.id_subpartida === subpart.id_subpartida)
        }));

        return subpartidasAgrupadas;
      } catch (error) {
        console.error('Error en getlisthistory:', error);
        throw new Error('Error al obtener los datos de la base de datos');
      }
    }

    async getSubpartidaById(subpartidaId) {
      try {
          const subpartida = await sequelize.models.Subpartida.findOne({
              where: { id_subpartida: subpartidaId }
          });

          if (!subpartida) {
              throw new Error(`Subpartida con id ${subpartidaId} no encontrada`);
          }

          return subpartida;
      } catch (error) {
          console.error('Error al obtener la subpartida por ID:', error);
          throw error;
      }
  }






}

module.exports = new SubpartidaRepository();