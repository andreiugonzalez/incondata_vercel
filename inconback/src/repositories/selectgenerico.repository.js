const { sequelize } = require('../config/sequelize-config');
const { response } = require('../utils/response');
const { Op } = require('sequelize');

class SelectGenericoRepository {
  async getAllPaises() {
    try {
      const paises = await sequelize.models.Pais.findAll({
        attributes: ['id_pais', 'NombrePais']
      });

      return paises;
    } catch (error) {
      throw response(500, 'Error al obtener los países de la base de datos');
    }
  }

  async getRegionesPorPais(paisId) {
    try {
      const regiones = await sequelize.models.Region.findAll({
        where: { id_pais: paisId },
        attributes: ['id_region', 'nombre']
      });
  
      return regiones;
    } catch (error) {
      throw response(500, 'Error al obtener las regiones por país de la base de datos');
    }
  }



  async getComuna() {
    try {
      const comunas = await sequelize.models.Comuna.findAll({
        attributes: ['id_comuna', 'nombre','id_region']
      });
      return comunas;
    } catch (error) {
      throw response(500, 'Error al obtener las comunas de la base de datos');
    }
  }


  async getComunasPorRegion(regionId) {
    try {
      const comunas = await sequelize.models.Comuna.findAll({
        where: {
          id_region: regionId // Filtra las comunas por el ID de la región proporcionado
        },
        attributes: ['id_comuna', 'nombre', 'id_region']
      });
      return comunas;
    } catch (error) {
      throw response(500, 'Error al obtener las comunas por región de la base de datos');
    }
  }
  

  async getRegion() {
    try {
      const regiones = await sequelize.models.Region.findAll({
        attributes: ['id_region', 'nombre','id_pais']
      });
      return regiones;
    } catch (error) {
      throw response(500, 'Error al obtener las regiones de la base de datos');
    }
  }


  async getLocationByComuna(comunaId) {
    try {
        const comuna = await sequelize.models.Comuna.findOne({
            where: { id_comuna: comunaId },
            attributes: ['id_comuna', 'nombre'],
            include: [
                {
                    model: sequelize.models.Region,
                    as: 'region_comunas',
                    attributes: ['id_region', 'nombre'],
                    include: [
                        {
                            model: sequelize.models.Pais,
                            as: 'pais_regiones',
                            attributes: ['id_pais', 'NombrePais']
                        }
                    ]
                }
            ]
        });

        console.log(comuna); // Verifica si los nombres están incluidos en el objeto recuperado

        if (comuna) {
            return {
                id_comuna: comuna.id_comuna,
                nombre_comuna: comuna.nombre,
                id_region: comuna.region_comunas?.id_region,
                nombre_region: comuna.region_comunas?.nombre,
                id_pais: comuna.region_comunas?.pais_regiones?.id_pais,
                nombre_pais: comuna.region_comunas?.pais_regiones?.NombrePais
            };
        } else {
            throw new Error('Comuna no encontrada en la base de datos');
        }
    } catch (error) {
        console.error('Error detallado:', error);
        throw new Error('Error al obtener la ubicación de la comuna en la base de datos: ' + error.message);
    }
}

  





  async getTipoEmpresa() {
    try {
      const tiposEmpresa = await sequelize.models.TipoEmpresa.findAll({
        attributes: ['id_TipoEmpresa', 'nombre']
      });
      return tiposEmpresa;
    } catch (error) {
      throw response(500, 'Error al obtener los tipos de empresa de la base de datos');
    }
  }

//crear tabla 
  async getEstadoProyecto() {
    try {
      const estadosProyecto = await sequelize.models.EstadoProyecto.findAll({
        attributes: ['id_estadoproyecto', 'nombre']
      });
      return estadosProyecto;
    } catch (error) {
      throw response(500, 'Error al obtener los estados de proyecto de la base de datos');
    }
  }



  async getNombreBanco() {
    try {
      const nombresBanco = await sequelize.models.NombreBanco.findAll({
        attributes: ['id_nombrebanco', 'nombre_banco']
      });
      return nombresBanco;
    } catch (error) {
      throw response(500, 'Error al obtener los nombres de banco de la base de datos');
    }
  }



  async getTipoCuentaBanco() {
    try {
      const tiposCuentaBanco = await sequelize.models.TipoCuenta.findAll({
        attributes: ['id_tipo_cuenta', 'nombre_tipo']
      });
      return tiposCuentaBanco;
    } catch (error) {
      throw response(500, 'Error al obtener los tipos de cuenta de banco de la base de datos');
    }
  }



  async getTipoContrato() {
    try {
      const tiposContrato = await sequelize.models.TipoContrato.findAll({
        attributes: ['tipo_contrato_id', 'nombre']
      });
      return tiposContrato;
    } catch (error) {
      throw response(500, 'Error al obtener los tipos de contrato de la base de datos');
    }
  }



  async getMedioPago() {
    try {
      const mediosPago = await sequelize.models.MedioPago.findAll({
        attributes: ['id', 'nombre']
      });
      return mediosPago;
    } catch (error) {
      throw response(500, 'Error al obtener los medios de pago de la base de datos');
    }
  }



  async getTramoSalud() {
    try {
      const tramosSalud = await sequelize.models.TramoSalud.findAll({
        attributes: ['id_TramoSalud', 'nombre']
      });
      return tramosSalud;
    } catch (error) {
      throw response(500, 'Error al obtener los tramos de salud de la base de datos');
    }
  }



  async getSalud() {
    try {
      const estadosSalud = await sequelize.models.Salud.findAll({
        attributes: ['id_Salud', 'nombre']
      });
      return estadosSalud;
    } catch (error) {
      throw response(500, 'Error al obtener los estados de salud de la base de datos');
    }
  }



  async getRol() {
    try {
      const roles = await sequelize.models.Rol.findAll({
        attributes: ['id', 'name']
      });
      return roles;
    } catch (error) {
      throw response(500, 'Error al obtener los roles de la base de datos');
    }
  }


  async getEstadoTarea() {
    try {
      const estadosTarea = await sequelize.models.EstadoTarea.findAll({
        attributes: ['id_EstadoTarea', 'NombreEstadoTarea']
      });
      return estadosTarea;
    } catch (error) {
      throw response(500, 'Error al obtener los estados de tarea de la base de datos');
    }
  }



  async getTipoDocumento() {
    try {
      const tiposDocumento = await sequelize.models.TipoDocumento.findAll({
        attributes: ['id', 'name']
      });
      return tiposDocumento;
    } catch (error) {
      throw response(500, 'Error al obtener los tipos de documento de la base de datos');
    }
  }


//crear tabla 
  async getUnidad() {
    try {
      const unidades = await sequelize.models.Unidad.findAll({
        attributes: ['id_unidad', 'nombre']
      });
      return unidades;
    } catch (error) {
      throw response(500, 'Error al obtener las unidades de la base de datos');
    }
  }


  async getAfp() {
    try {
      const afp = await sequelize.models.Afp.findAll({
        attributes: ['id_afp', 'nombre_afp']
      });
      return afp;
    } catch (error) {
      throw response(500, 'Error al obtener las AFP de la base de datos');
    }
  }



  async getTramoAfp() {
    try {
      const tramosAfp = await sequelize.models.Tramo.findAll({
        attributes: ['id_tramo', 'nombre_tramo']
      });
      return tramosAfp;
    } catch (error) {
      throw response(500, 'Error al obtener los tramos de AFP de la base de datos');
    }
  }



  async getCodTelefono() {
    try {
      const codigosTelefono = await sequelize.models.CodTelefono.findAll({
        attributes: ['id', 'cod_numero']
      });
      return codigosTelefono;
    } catch (error) {
      throw response(500, 'Error al obtener los códigos de teléfono de la base de datos');
    }
  }

  async getOrganizaciones() {
    try {
      // Consulta a la base de datos para obtener todas las organizaciones
      const organizaciones = await sequelize.models.Organizacion.findAll({
        attributes: ['id', 'nombre'] // Seleccionar solo los atributos id y nombre
      });
      return organizaciones;
    } catch (error) {
      // Captura de errores y lanzamiento de una respuesta de error
      throw response(500, 'Error al obtener las organizaciones de la base de datos');
    }
  }

  
  async getNombreBancos() {
    try {
      
      const nombreBanco = await sequelize.models.NombreBanco.findOne({
        attributes: ['id_nombrebanco','nombrebanco']
      });
      return nombreBanco;
    } catch (error) {
      // Captura de errores y lanzamiento de una respuesta de error
      throw response(500, 'Error al obtener el nombre del banco de la base de datos');
    }
  }


    
  async getNombreRelacion() {
    try {
      
      const nombreRelacion = await sequelize.models.Relacion.findAll({
        attributes: ['id_relacion','nombre']
      });
      return nombreRelacion;
    } catch (error) {
      // Captura de errores y lanzamiento de una respuesta de error
      throw response(500, 'Error al obtener el nombre Relacion del banco de la base de datos');
    }
  }


  


  async getEstadoCivil() {
    try {
      const estadosCiviles = await sequelize.models.EstadoCivil.findAll({
        attributes: ['id_estado_civil', 'nombre_estado_civil']
      });
      return estadosCiviles;
    } catch (error) {
      // Captura de errores y lanzamiento de una respuesta de error
      throw response(500, 'Error al obtener el estado civil de la base de datos');
    }
  }


  
  async getEstadoCuenta() {
    try {
      const estadosCiviles = await sequelize.models.EstadoCuenta.findAll({
        attributes: ['id_estado_cuenta', 'nombre_estado_cuenta']
      });
      return estadosCiviles;
    } catch (error) {
      // Captura de errores y lanzamiento de una respuesta de error
      throw response(500, 'Error al obtener el estado cuenta de la base de datos');
    }
  }





   async getPuesto() {
    try {
      const puestos = await sequelize.models.Puesto.findAll({
        attributes: ['id_puesto', 'nombre_puesto'] // Ajusta los atributos según tu modelo
      });
      return puestos;
    } catch (error) {
      throw response(500, 'Error al obtener los puestos de la base de datos');
    }
  }

   async getGrupo() {
    try {
      const grupos = await sequelize.models.Grupo.findAll({
        attributes: ['id_grupo', 'nombre_grupo'] // Ajusta los atributos según tu modelo
      });
      return grupos;
    } catch (error) {
      throw response(500, 'Error al obtener los grupos de la base de datos');
    }
  }

  async getEstadoproyecto() {
    try {
      const estado = await sequelize.models.EstadoProyecto.findAll({
        attributes: ['id_estadoproyecto', 'nombre'] 
      });
      return estado;
    } catch (error) {
      throw response(500, 'Error al obtener los estado de proyecto de la base de datos');
    }
  }

  async getUnidades() {
    try {
      const unidad = await sequelize.models.Unidad.findAll({
        attributes: ['id_unidad', 'nombre'] 
      });
      return unidad;
    } catch (error) {
      throw response(500, 'Error al obtener las unidades de la base de datos');
    }
  }

  async getRolesInternos() {
    const rolesInternos = [
      'admin',
      'superadmin',
      'superintendente',
      'supervisor',
      'ITO',
      'proyectista',
      'administrador de contrato'
    ];
    try {
      const roles = await sequelize.models.Rol.findAll({
        where: {
          name: {
            [Op.in]: rolesInternos
          }
        },
        attributes: ['id', 'name']
      });
      return roles;
    } catch (error) {
      throw response(500, 'Error al obtener los roles internos de la base de datos');
    }
  }

  async getRolesExternos() {
    const rolesExternos = [
      'normal',
      'supervisor',
      'contratista',
      'ITO'
    ];
    try {
      const roles = await sequelize.models.Rol.findAll({
        where: {
          name: {
            [Op.in]: rolesExternos
          }
        },
        attributes: ['id', 'name']
      });
      return roles;
    } catch (error) {
      throw response(500, 'Error al obtener los roles externos de la base de datos');
    }
  }
}





module.exports = {
  SelectGenericoRepository
};



module.exports = new SelectGenericoRepository();